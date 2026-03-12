import { apiClient, USE_MOCK_DATA } from './api'
import { mockRequests, type PartRequest, type RequestItem } from '../data/requestsMockData'
import type { HistoryItem, HistoryStatus } from '../contexts/RequestHistoryContext'

export type { PartRequest }

const ROLE_LABEL: Record<string, string> = {
    ADMIN: 'ผู้ดูแลระบบ',
    MANAGER: 'เจ้าของร้าน',
    SERVICE_ADVISOR: 'พนักงานต้อนรับ',
    FOREMAN: 'หัวหน้าช่าง',
    TECHNICIAN: 'ช่าง',
    STOCK_KEEPER: 'คลังสินค้า',
    CASHIER: 'แคชเชียร์',
}

function mapBackendRequisition(r: any): PartRequest {
    const motorcycle = r.job?.motorcycle
    const plate = motorcycle
        ? `${motorcycle.licensePlate || ''}`
        : '-'
    const brandParts = motorcycle
        ? [motorcycle.brand, motorcycle.model].filter((v: string) => v && v !== 'ไม่ระบุ')
        : []
    const model = brandParts.join(' ') || '-'

    const items: RequestItem[] = (r.items || []).map((item: any) => ({
        id: item.id,
        partId: item.partId ?? item.part?.id,
        partCode: item.part?.partNo || item.package?.packageNo || '-',
        partName: item.part?.name || item.package?.name || '-',
        quantity: item.requestedQuantity ?? item.quantity,
        unit: item.part?.unit || 'ชิ้น',
        pricePerUnit: Number(item.part?.unitPrice || 0),
    }))

    return {
        id: r.id,
        requester: r.requestedBy?.name || '-',
        requesterRole: ROLE_LABEL[r.requestedBy?.role] || r.requestedBy?.role || '-',
        motorcycleModel: model,
        licensePlate: plate,
        requestedAt: r.createdAt
            ? new Date(r.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
            : '-',
        items,
        status: r.status || undefined,
    }
}

function mapBackendHistoryItem(r: any): HistoryItem {
    const base = mapBackendRequisition(r)
    const backendStatus: string = r.status || ''
    const status: HistoryStatus = backendStatus === 'REJECTED' ? 'ไม่อนุมัติการเบิก' : 'อนุมัติการเบิก'

    const approvedDate = r.issuedAt || r.approvedAt || r.updatedAt
    const approvedAt = approvedDate
        ? new Date(approvedDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
        : '-'

    return {
        ...base,
        approvedAt,
        status,
    }
}

export const partRequisitionService = {

    getPendingRequests: async (): Promise<PartRequest[]> => {
        if (!USE_MOCK_DATA) {
            // ดึงรายการคำขอเบิกอะไหล่ทั้งหมดจาก backend แล้วแปลงให้พร้อมแสดง
            const raw = await apiClient.get<any[]>('/part-requisitions')
            return (Array.isArray(raw) ? raw : []).map(mapBackendRequisition)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockRequests]), 600)
        })
    },

    getRequestById: async (id: number): Promise<PartRequest | null> => {
        if (!USE_MOCK_DATA) {
            try {
                const raw = await apiClient.get<any>(`/part-requisitions/${id}`)
                return mapBackendRequisition(raw)
            } catch {
                return null
            }
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockRequests.find(r => r.id === id) ?? null)
            }, 500)
        })
    },

    approveRequest: async (id: number, items: { id: number; issuedQuantity: number }[]): Promise<void> => {
        if (!USE_MOCK_DATA) {
            await apiClient.patch(`/part-requisitions/${id}/approve`, {})

            await apiClient.patch(`/part-requisitions/${id}/issue`, {
                items: items.map(i => ({ itemId: i.id, issuedQuantity: i.issuedQuantity })),
            })
            return
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                console.info(`[Mock] Approved part-requisition #${id}`, items)
                resolve()
            }, 800)
        })
    },

    rejectRequest: async (id: number, reason?: string): Promise<void> => {
        if (!USE_MOCK_DATA) {
            await apiClient.patch(`/part-requisitions/${id}/reject`, { reason: reason || 'ปฏิเสธ' })
            return
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                console.info(`[Mock] Rejected part-requisition #${id}, reason:`, reason)
                resolve()
            }, 800)
        })
    },

    getHistory: async (): Promise<HistoryItem[]> => {
        if (!USE_MOCK_DATA) {
            const statuses = ['APPROVED', 'REJECTED', 'ISSUED']
            const results: HistoryItem[] = []
            for (const s of statuses) {
                try {
                    const raw = await apiClient.get<any[]>(`/part-requisitions?status=${s}`)
                    if (Array.isArray(raw)) results.push(...raw.map(mapBackendHistoryItem))
                } catch { /* skip */ }
            }
            return results
        }

        return new Promise((resolve) => {
            setTimeout(() => resolve([]), 600)
        })
    },

    getHistoryById: async (id: number): Promise<HistoryItem | null> => {
        if (!USE_MOCK_DATA) {
            try {
                const raw = await apiClient.get<any>(`/part-requisitions/${id}`)
                return mapBackendHistoryItem(raw)
            } catch {
                return null
            }
        }

        return new Promise((resolve) => {
            setTimeout(() => resolve(null), 500)
        })
    },
}
