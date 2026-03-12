/**
 * Foreman Response API Service
 *
 * The foreman's JobDetailPage creates Quotation records and updates the Job
 * status to WAITING_APPROVAL. This service maps that data to the
 * ForemanResponse shape the reception pages expect.
 */

import { apiClient, API_BASE_URL } from './api'
import type {
    ForemanResponse,
    ForemanResponseListParams,
    ForemanResponseListResponse,
    CustomerDecisionRequest,
    CustomerDecisionResponse,
    RequiredPart,
} from '../types/foremanResponse.types'

function mapJobToForemanResponse(job: any): ForemanResponse {
    const moto = job.motorcycle || {}
    const owner = moto.owner || {}
    const quotation = job.quotation || {}

    const rawItems = quotation.items || []
    const items: RequiredPart[] = rawItems.map((qi: any) => ({
        partId: qi.partId ? String(qi.partId) : undefined,
        name: qi.itemName || qi.part?.name || '-',
        quantity: qi.quantity || 1,
        unitPrice: Number(qi.unitPrice) || 0,
        totalPrice: Number(qi.totalPrice) || Number(qi.unitPrice || 0) * (qi.quantity || 1),
        partNumber: qi.part?.partNo,
        inStock: qi.part ? (qi.part.stockQuantity ?? 0) > 0 : undefined,
    }))

    const itemsCount = rawItems.length > 0
        ? rawItems.length
        : (quotation._count?.items ?? 0)

    const totalCost = items.length > 0
        ? items.reduce((s, i) => s + i.totalPrice, 0)
        : Number(quotation.totalAmount) || 0

    const brandParts = [moto.brand, moto.model].filter((v: string) => v && v !== 'ไม่ระบุ')
    const modelDisplay = brandParts.join(' ') || '-'

    return {
        id: String(job.id),
        jobId: String(job.id),
        queueNumber: job.jobNo || '-',
        customerId: String(owner.id || ''),
        firstName: owner.firstName || '-',
        lastName: owner.lastName || '',
        phone: owner.phoneNumber || owner.phone || '-',
        address: owner.address,
        motorcycleId: String(moto.id || ''),
        model: modelDisplay,
        color: moto.color || '-',
        plateLine1: moto.licensePlate || '-',
        plateLine2: '',
        province: moto.province || '',
        symptoms: job.symptom || '-',
        tags: job.tags || [],
        images: job.images || [],
        foremanAnalysis: job.diagnosisNotes || '-',
        estimatedCost: totalCost,
        estimatedDuration: '-',
        requiredParts: items,
        additionalNotes: quotation.notes,
        respondedAt: job.updatedAt || job.createdAt || new Date().toISOString(),
        respondedBy: job.technician?.name || job.reception?.name || '-',
        foremanId: String(job.technicianId || ''),
        assessmentNumber: 1,
        customerDecision: undefined,
        status: 'PENDING_CUSTOMER',
        createdAt: job.createdAt || new Date().toISOString(),
        updatedAt: job.updatedAt || new Date().toISOString(),
        _itemsCount: itemsCount,
    }
}

export const getForemanResponses = async (
    params?: ForemanResponseListParams
): Promise<ForemanResponseListResponse> => {
    try {
        const statusFilter = params?.status === 'PENDING_CUSTOMER' ? 'WAITING_APPROVAL' : ''
        const raw = await apiClient.get<any[]>(`/jobs${statusFilter ? `?status=${statusFilter}` : ''}`)
        const jobs = Array.isArray(raw) ? raw : []

        let mapped = jobs.map(mapJobToForemanResponse)

        if (params?.search) {
            const q = params.search.toLowerCase()
            mapped = mapped.filter(r =>
                `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
                r.queueNumber.toLowerCase().includes(q) ||
                r.phone.includes(q) ||
                r.model.toLowerCase().includes(q) ||
                r.plateLine1.toLowerCase().includes(q)
            )
        }

        const page = params?.page || 1
        const limit = params?.limit || 10
        const total = mapped.length
        const start = (page - 1) * limit

        return {
            data: mapped.slice(start, start + limit),
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        }
    } catch (error) {
        console.error('Error fetching foreman responses:', error)
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    }
}

export const getForemanResponseById = async (
    id: string
): Promise<ForemanResponse> => {
    const job = await apiClient.get<any>(`/jobs/${id}`)
    return mapJobToForemanResponse(job)
}

export const getForemanResponsesByJobId = async (
    jobId: string
): Promise<ForemanResponse[]> => {
    const job = await apiClient.get<any>(`/jobs/${jobId}`)
    return [mapJobToForemanResponse(job)]
}

export const getPendingForemanResponses = async (): Promise<ForemanResponse[]> => {
    const raw = await apiClient.get<any[]>('/jobs?status=WAITING_APPROVAL')
    return (Array.isArray(raw) ? raw : []).map(mapJobToForemanResponse)
}

export const updateCustomerDecision = async (
    id: string,
    decision: CustomerDecisionRequest
): Promise<CustomerDecisionResponse> => {
    const newStatus = decision.decision === 'approved' ? 'READY' : 'CANCELLED'
    await apiClient.patch(`/jobs/${id}`, { status: newStatus })
    const updated = await apiClient.get<any>(`/jobs/${id}`)
    return {
        success: true,
        message: decision.decision === 'approved'
            ? 'ลูกค้าอนุมัติใบประเมินราคาแล้ว'
            : 'ลูกค้าไม่อนุมัติใบประเมินราคา',
        data: mapJobToForemanResponse(updated),
    }
}

export const getForemanResponseStats = async (): Promise<{
    pending: number
    approved: number
    rejected: number
    total: number
}> => {
    try {
        const [pending, all] = await Promise.all([
            apiClient.get<any[]>('/jobs?status=WAITING_APPROVAL'),
            apiClient.get<any[]>('/jobs'),
        ])
        const pendingCount = Array.isArray(pending) ? pending.length : 0
        const totalCount = Array.isArray(all) ? all.length : 0
        return { pending: pendingCount, approved: 0, rejected: 0, total: totalCount }
    } catch {
        return { pending: 0, approved: 0, rejected: 0, total: 0 }
    }
}

export const exportForemanResponsePDF = async (id: string): Promise<Blob> => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to export PDF')
    return await response.blob()
}

export const getCustomerDecisionHistory = async (
    _jobId: string
): Promise<Array<{ id: string; decision: 'approved' | 'rejected'; decisionAt: string; decisionBy: string; notes?: string }>> => {
    return []
}

const foremanResponseService = {
    getForemanResponses,
    getForemanResponseById,
    getForemanResponsesByJobId,
    getPendingForemanResponses,
    updateCustomerDecision,
    getForemanResponseStats,
    exportForemanResponsePDF,
    getCustomerDecisionHistory,
}

export default foremanResponseService
