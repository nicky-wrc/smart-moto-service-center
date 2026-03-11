/**
 * Purchase Order API Service
 * 
 * This service handles all API calls related to purchase orders.
 * Replace the mock implementations with actual API calls when backend is ready.
 */

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

class PurchaseOrderApiService {
  private baseUrl = '/api/purchase-orders' // TODO: Update with actual API URL

  async create(data: CreatePurchaseOrderDTO): Promise<PurchaseOrder> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create purchase order: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating purchase order:', error)
      throw error
    }
  }

  async getAll(): Promise<PurchaseOrder[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase orders: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      throw error
    }
  }

  async getById(id: string): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase order: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching purchase order:', error)
      throw error
    }
  }

  async updateStatus(id: string, data: UpdatePurchaseOrderStatusDTO): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update purchase order status: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating purchase order status:', error)
      throw error
    }
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to cancel purchase order: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error cancelling purchase order:', error)
      throw error
    }
  }

  async sendApprovalNotification(orderId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/notifications/purchase-order-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          recipientRole: 'owner',
          type: 'purchase_order_approval_request'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }
}

export const purchaseOrderApiService = new PurchaseOrderApiService()
