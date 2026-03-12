import { apiClient, USE_MOCK_DATA } from './api'
import { mockRequests, type PartRequest, type RequestItem } from '../data/requestsMockData'

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
    const model = motorcycle
        ? [motorcycle.brand, motorcycle.model].filter(Boolean).join(' ') || '-'
        : '-'

    const items: RequestItem[] = (r.items || []).map((item: any) => ({
        id: item.id,
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
    }
}

export const partRequisitionService = {

    getPendingRequests: async (): Promise<PartRequest[]> => {
        if (!USE_MOCK_DATA) {
            const raw = await apiClient.get<any[]>('/part-requisitions?status=PENDING')
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
            await apiClient.patch(`/part-requisitions/${id}/issue`, { issuedItems: items })
            return
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                console.info(`[Mock] Approved part-requisition #${id}`, items)
                resolve()
            }, 800)
        })
    },

    rejectRequest: async (id: number, reason?: string): Promise<void> => {
        if (!USE_MOCK_DATA) {
            await apiClient.patch(`/part-requisitions/${id}/reject`, { notes: reason })
            return
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                console.info(`[Mock] Rejected part-requisition #${id}, reason:`, reason)
                resolve()
            }, 800)
        })
    },

    getHistory: async (): Promise<PartRequest[]> => {
        if (!USE_MOCK_DATA) {
            const statuses = ['APPROVED', 'REJECTED', 'ISSUED']
            const results: PartRequest[] = []
            for (const s of statuses) {
                try {
                    const raw = await apiClient.get<any[]>(`/part-requisitions?status=${s}`)
                    if (Array.isArray(raw)) results.push(...raw.map(mapBackendRequisition))
                } catch { /* skip */ }
            }
            return results
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => resolve([]), 600)
        })
    },

    getHistoryById: async (id: number): Promise<PartRequest | null> => {
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
            setTimeout(() => resolve(null), 500)
        })
    },
}
