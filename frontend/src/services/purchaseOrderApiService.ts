import { apiClient } from './api'
import type { PurchaseOrder } from '../data/purchaseOrdersMockData'

export interface CreatePurchaseOrderDTO {
  supplierId: number
  deliveryDate: string
  totalAmount: number
  status: 'draft' | 'pending'
  remarks: string | null
  managerMessage: string | null
  items: {
    partId: number
    partName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

export interface UpdatePurchaseOrderStatusDTO {
  status: 'approved' | 'rejected'
  ownerComment?: string
  rejectionReason?: string
}

const BASE_PATH = '/purchase-orders'

class PurchaseOrderApiService {
  async create(data: CreatePurchaseOrderDTO): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(BASE_PATH, data)
  }

  async getAll(): Promise<PurchaseOrder[]> {
    return apiClient.get<PurchaseOrder[]>(BASE_PATH)
  }

  async getById(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`${BASE_PATH}/${id}`)
  }

  async updateStatus(id: string, data: UpdatePurchaseOrderStatusDTO): Promise<PurchaseOrder> {
    return apiClient.patch<PurchaseOrder>(`${BASE_PATH}/${id}/status`, data)
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${BASE_PATH}/${id}/cancel`, {})
  }

  async sendApprovalNotification(orderId: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/notifications/purchase-order-approval', {
      orderId,
      recipientRole: 'owner',
      type: 'purchase_order_approval_request'
    })
  }
}

export const purchaseOrderApiService = new PurchaseOrderApiService()
