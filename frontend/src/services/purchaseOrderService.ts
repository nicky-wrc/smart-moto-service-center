import { apiClient, USE_MOCK_DATA, buildQuery } from './api'
import { mockPurchaseOrders, type PurchaseOrder, type POStatus } from '../data/purchaseOrdersMockData'
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

/**
 * Service for Purchase Order CRUD operations.
 *
 * To switch to real API:
 *   Set VITE_USE_MOCK_DATA=false in .env
 *   Backend endpoints expected:
 *     GET    /api/purchase-orders
 *     GET    /api/purchase-orders/:id
 *     POST   /api/purchase-orders
 *     PUT    /api/purchase-orders/:id
 *     PATCH  /api/purchase-orders/:id/status
 *     DELETE /api/purchase-orders/:id
 */
export const purchaseOrderService = {

    /**
     * Get all purchase orders with optional filters
     */
    getAll: async (params: GetPOsParams = {}): Promise<PaginatedPOResponse> => {
        if (!USE_MOCK_DATA) {
            const qs = buildQuery({ ...params })
            return apiClient.get<PaginatedPOResponse>(`/purchase-orders${qs}`)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockPurchaseOrders]
                if (params.status) {
                    filtered = filtered.filter(po => po.status === params.status)
                }
                if (params.search) {
                    const q = params.search.toLowerCase()
                    filtered = filtered.filter(po =>
                        po.id.toLowerCase().includes(q) ||
                        po.supplierName.toLowerCase().includes(q)
                    )
                }
                const page = params.page ?? 1
                const limit = params.limit ?? 20
                const totalDocs = filtered.length
                const totalPages = Math.ceil(totalDocs / limit)
                const data = filtered.slice((page - 1) * limit, page * limit)
                resolve({ data, totalDocs, totalPages, currentPage: page })
            }, 400)
        })
    },

    /**
     * Get a single purchase order by ID
     */
    getById: async (id: string): Promise<PurchaseOrder | null> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockPurchaseOrders.find(po => po.id === id) ?? null)
            }, 400)
        })
    },

    /**
     * Create a new purchase order
     */
    create: async (dto: CreatePODto): Promise<PurchaseOrder> => {
        if (!USE_MOCK_DATA) {
            return apiClient.post<PurchaseOrder>('/purchase-orders', dto)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
                const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
                const newPO: PurchaseOrder = {
                    id: `PO-${dateStr}-${rand}`,
                    createdAt: new Date().toISOString().split('T')[0],
                    ...dto,
                }
                mockPurchaseOrders.unshift(newPO)
                resolve(newPO)
            }, 500)
        })
    },

    /**
     * Update an existing purchase order
     */
    update: async (id: string, dto: UpdatePODto): Promise<PurchaseOrder> => {
        if (!USE_MOCK_DATA) {
            return apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, dto)
        }

        // MOCK
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = mockPurchaseOrders.findIndex(po => po.id === id)
                if (idx === -1) { reject(new Error(`PO ${id} not found`)); return }
                const updated = { ...mockPurchaseOrders[idx], ...dto }
                mockPurchaseOrders[idx] = updated
                resolve(updated)
            }, 500)
        })
    },

    /**
     * Update only the status of a purchase order
     */
    updateStatus: async (id: string, status: POStatus): Promise<PurchaseOrder> => {
        if (!USE_MOCK_DATA) {
            return apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, { status })
        }

        // MOCK
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = mockPurchaseOrders.findIndex(po => po.id === id)
                if (idx === -1) { reject(new Error(`PO ${id} not found`)); return }
                mockPurchaseOrders[idx].status = status
                resolve(mockPurchaseOrders[idx])
            }, 400)
        })
    },

    /**
     * Delete a purchase order
     */
    delete: async (id: string): Promise<void> => {
        if (!USE_MOCK_DATA) {
            return apiClient.delete<void>(`/purchase-orders/${id}`)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                const idx = mockPurchaseOrders.findIndex(po => po.id === id)
                if (idx !== -1) mockPurchaseOrders.splice(idx, 1)
                resolve()
            }, 400)
        })
    },
}
