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

/**
 * Service for Purchase Order CRUD operations.
 */
export const purchaseOrderService = {

    /**
     * Get all purchase orders with optional filters
     */
    getAll: async (params: GetPOsParams = {}): Promise<PaginatedPOResponse> => {
        const qs = buildQuery({ ...params })
        return apiClient.get<PaginatedPOResponse>(`/purchase-orders${qs}`)
    },

    /**
     * Get a single purchase order by ID
     */
    getById: async (id: string): Promise<PurchaseOrder | null> => {
        return apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`)
    },

    /**
     * Create a new purchase order
     */
    create: async (dto: CreatePODto): Promise<PurchaseOrder> => {
        return apiClient.post<PurchaseOrder>('/purchase-orders', dto)
    },

    /**
     * Update an existing purchase order
     */
    update: async (id: string, dto: UpdatePODto): Promise<PurchaseOrder> => {
        return apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, dto)
    },

    /**
     * Update only the status of a purchase order
     */
    updateStatus: async (id: string, status: POStatus): Promise<PurchaseOrder> => {
        return apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, { status })
    },

    /**
     * Delete a purchase order
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/purchase-orders/${id}`)
    },
}

