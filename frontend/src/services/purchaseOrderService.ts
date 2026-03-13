import { apiClient, buildQuery } from './api'
import type { PurchaseOrder, POStatus } from '../data/purchaseOrdersMockData'
import type { PartItem } from '../data/partsMockData'

export type { PurchaseOrder, POStatus }

export interface POItem extends PartItem {
    orderQuantity: number
}

export interface CreatePODto {
    supplierId: number
    supplierName: string
    deliveryDate: string
    remarks?: string
    managerMessage?: string
    items: POItem[]
    totalAmount: number
    status: 'draft' | 'pending'
}

export interface UpdatePODto extends Partial<CreatePODto> { }

export interface GetPOsParams {
    status?: POStatus | ''
    supplierId?: number
    search?: string
    page?: number
    limit?: number
}

export interface PaginatedPOResponse {
    data: PurchaseOrder[]
    totalDocs: number
    totalPages: number
    currentPage: number
}

const STATUS_MAP: Record<string, POStatus> = {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending',
    APPROVED: 'approved',
    ORDERED: 'approved',
    PARTIAL_RECEIVED: 'approved',
    COMPLETED: 'approved',
    CANCELLED: 'cancelled',
}

function mapBackendPO(po: any): PurchaseOrder {
    const items: POItem[] = (po.items || []).map((item: any) => ({
        id: item.part?.id ?? item.partId,
        partCode: item.part?.partNo || '-',
        name: item.part?.name || '-',
        category: item.part?.category || '',
        location: '',
        quantity: item.part?.stockQuantity ?? 0,
        price: Number(item.unitPrice) || 0,
        imageUrl: '',
        orderQuantity: item.quantity,
    }))

    return {
        id: String(po.id),
        poNo: po.poNo || undefined,
        supplierId: po.supplierId,
        supplierName: po.supplier?.name || '-',
        createdAt: po.createdAt ? new Date(po.createdAt).toISOString().split('T')[0] : '-',
        deliveryDate: po.expectedDate ? new Date(po.expectedDate).toISOString().split('T')[0] : '-',
        totalAmount: Number(po.totalAmount) || 0,
        status: STATUS_MAP[po.status] || 'draft',
        items,
        remarks: po.notes || undefined,
    }
}

export const purchaseOrderService = {

    getAll: async (params: GetPOsParams = {}): Promise<PaginatedPOResponse> => {
        const backendStatus = params.status
            ? Object.entries(STATUS_MAP).find(([, v]) => v === params.status)?.[0]
            : undefined
        const qs = buildQuery({
            status: backendStatus,
            supplierId: params.supplierId,
        })
        const raw = await apiClient.get<any>(`/purchase-orders${qs}`)

        let allPOs: PurchaseOrder[]
        if (Array.isArray(raw)) {
            allPOs = raw.map(mapBackendPO)
        } else if (raw && Array.isArray(raw.data)) {
            return raw as PaginatedPOResponse
        } else {
            allPOs = []
        }

        if (params.search) {
            const q = params.search.toLowerCase()
            allPOs = allPOs.filter(po =>
                (po.poNo || po.id).toLowerCase().includes(q) ||
                po.supplierName.toLowerCase().includes(q)
            )
        }

        const page = params.page || 1
        const limit = params.limit || 20
        const totalDocs = allPOs.length
        const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
        const start = (page - 1) * limit

        return {
            data: allPOs.slice(start, start + limit),
            totalDocs,
            totalPages,
            currentPage: page,
        }
    },

    getById: async (id: string): Promise<PurchaseOrder | null> => {
        try {
            const raw = await apiClient.get<any>(`/purchase-orders/${id}`)
            return mapBackendPO(raw)
        } catch {
            return null
        }
    },

    create: async (dto: CreatePODto): Promise<PurchaseOrder> => {
        const payload = {
            supplierId: dto.supplierId,
            notes: dto.remarks,
            expectedDate: dto.deliveryDate,
            items: dto.items.map(item => ({
                partId: item.id,
                quantity: item.orderQuantity,
                unitPrice: item.price,
            })),
        }
        const raw = await apiClient.post<any>('/purchase-orders', payload)
        return mapBackendPO(raw)
    },

    update: async (id: string, dto: UpdatePODto): Promise<PurchaseOrder> => {
        const payload: any = {}
        if (dto.remarks !== undefined) payload.notes = dto.remarks
        if (dto.deliveryDate) payload.expectedDate = dto.deliveryDate
        if (dto.items) {
            payload.items = dto.items.map(item => ({
                partId: item.id,
                quantity: item.orderQuantity,
                unitPrice: item.price,
            }))
        }
        const raw = await apiClient.patch<any>(`/purchase-orders/${id}`, payload)
        return mapBackendPO(raw)
    },

    submit: async (id: string): Promise<PurchaseOrder> => {
        const raw = await apiClient.patch<any>(`/purchase-orders/${id}/submit`, {})
        return mapBackendPO(raw)
    },

    updateStatus: async (id: string, status: POStatus): Promise<PurchaseOrder> => {
        if (status === 'approved') {
            const raw = await apiClient.patch<any>(`/purchase-orders/${id}/approve`, {})
            return mapBackendPO(raw)
        }
        if (status === 'cancelled') {
            const raw = await apiClient.patch<any>(`/purchase-orders/${id}/cancel`, {})
            return mapBackendPO(raw)
        }
        const raw = await apiClient.patch<any>(`/purchase-orders/${id}/submit`, {})
        return mapBackendPO(raw)
    },

    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/purchase-orders/${id}`)
    },
}

