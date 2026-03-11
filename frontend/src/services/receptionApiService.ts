/**
 * Reception API Service
 * 
 * This service handles all API calls related to reception activities:
 * - Creating repair requests (sending to foreman)
 * - Managing customer and motorcycle data
 * - Handling reception history
 */

export interface RepairRequestDTO {
  // Customer Information
  customerId?: number // If existing customer
  customerData: {
    firstName: string
    lastName: string
    phone: string
    address: string
  }
  
  // Motorcycle Information
  motorcycleId?: number // If existing motorcycle
  motorcycleData: {
    model: string
    color: string
    licensePlate: {
      line1: string
      line2: string
      province: string
    }
  }
  
  // Repair Request Details
  symptoms: string
  tags: string[] // e.g., ['เครื่องยนต์', 'ระบบเบรก']
  images?: string[] // Base64 encoded images or URLs
  
  // Context Information
  activityType: 'แจ้งซ่อมครั้งแรก' | 'แจ้งซ่อมรถที่มีในระบบ' | 'แจ้งซ่อมรถคันใหม่'
  isExistingCustomer: boolean
  isNewMotorcycle: boolean
  
  // Metadata
  createdAt: string // ISO timestamp
  status: 'pending_foreman_review' // Initial status
}

export interface RepairRequestResponse {
  id: string // RH-XXX-XXXXXX format
  customerId: number
  motorcycleId: number
  symptoms: string
  tags: string[]
  images: string[]
  status: 'pending_foreman_review' | 'assigned_to_technician' | 'in_progress' | 'completed'
  queueNumber: number
  createdAt: string
  updatedAt: string
  assignedForemanId?: number
  assignedTechnicianId?: number
}

export interface CustomerDTO {
  firstName: string
  lastName: string
  phone: string
  address: string
}

export interface MotorcycleDTO {
  customerId: number
  model: string
  color: string
  plateLine1: string
  plateLine2: string
  province: string
}

class ReceptionApiService {
  private baseUrl = '/api/reception' // TODO: Update with actual API URL

  /**
   * Create a new repair request and send to foreman
   * This is called when clicking "ส่งใบแจ้งซ่อม" button
   * 
   * @param data Repair request data
   * @returns Created repair request with ID and queue number
   */
  async createRepairRequest(data: RepairRequestDTO): Promise<RepairRequestResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${this.baseUrl}/repair-requests`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(data)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to create repair request: ${response.statusText}`)
      // }
      // 
      // const result = await response.json()
      // 
      // // Send notification to foreman role
      // await this.sendForemanNotification(result.id)
      // 
      // return result

      // MOCK: Simulate API response
      console.log('[MOCK] Creating repair request:', data)
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error creating repair request:', error)
      throw error
    }
  }

  /**
   * Get all repair requests (for history page)
   * 
   * @returns List of repair requests
   */
  async getRepairRequests(): Promise<RepairRequestResponse[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${this.baseUrl}/repair-requests`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to fetch repair requests: ${response.statusText}`)
      // }
      // 
      // return await response.json()

      // MOCK: Simulate API response
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error fetching repair requests:', error)
      throw error
    }
  }

  /**
   * Get a single repair request by ID
   * 
   * @param id Repair request ID
   * @returns Repair request details
   */
  async getRepairRequestById(id: string): Promise<RepairRequestResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${this.baseUrl}/repair-requests/${id}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to fetch repair request: ${response.statusText}`)
      // }
      // 
      // return await response.json()

      // MOCK: Simulate API response
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error fetching repair request:', error)
      throw error
    }
  }

  /**
   * Create or get existing customer
   * 
   * @param data Customer data
   * @returns Customer ID
   */
  async createOrGetCustomer(data: CustomerDTO): Promise<{ id: number; isNew: boolean }> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${this.baseUrl}/customers`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(data)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to create/get customer: ${response.statusText}`)
      // }
      // 
      // return await response.json()

      // MOCK: Simulate API response
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error creating/getting customer:', error)
      throw error
    }
  }

  /**
   * Create or get existing motorcycle
   * 
   * @param data Motorcycle data
   * @returns Motorcycle ID
   */
  async createOrGetMotorcycle(data: MotorcycleDTO): Promise<{ id: number; isNew: boolean }> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${this.baseUrl}/motorcycles`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(data)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to create/get motorcycle: ${response.statusText}`)
      // }
      // 
      // return await response.json()

      // MOCK: Simulate API response
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error creating/getting motorcycle:', error)
      throw error
    }
  }

  /**
   * Upload images for repair request
   * 
   * @param files Image files
   * @returns Array of uploaded image URLs
   */
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const formData = new FormData()
      // files.forEach(file => {
      //   formData.append('images', file)
      // })
      // 
      // const response = await fetch(`${this.baseUrl}/upload-images`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: formData
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to upload images: ${response.statusText}`)
      // }
      // 
      // const result = await response.json()
      // return result.urls // Array of uploaded image URLs

      // MOCK: Simulate API response
      console.log('[MOCK] Uploading images:', files.map(f => f.name))
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    }
  }

  /**
   * Send notification to foreman role
   * 
   * @param repairRequestId Repair request ID
   * @returns Success status
   */
  async sendForemanNotification(repairRequestId: string): Promise<{ success: boolean }> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/notifications/foreman-repair-request', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     repairRequestId,
      //     recipientRole: 'foreman',
      //     type: 'new_repair_request'
      //   })
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to send notification: ${response.statusText}`)
      // }
      // 
      // return await response.json()

      // MOCK: Simulate success
      console.log(`[MOCK] Notification sent for repair request: ${repairRequestId}`)
      return { success: true }
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Search customers by phone or name
   * 
   * @param query Search query
   * @returns Matching customers with their motorcycles
   */
  async searchCustomers(query: string): Promise<Array<{
    id: number
    firstName: string
    lastName: string
    phone: string
    address: string
    motorcycles: Array<{
      id: number
      model: string
      color: string
      plateLine1: string
      plateLine2: string
      province: string
    }>
  }>> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`${this.baseUrl}/customers/search?q=${encodeURIComponent(query)}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to search customers: ${response.statusText}`)
      // }
      // 
      // return await response.json()

      // MOCK: Simulate API response
      throw new Error('API not implemented yet. Use mock data.')
    } catch (error) {
      console.error('Error searching customers:', error)
      throw error
    }
  }
}

export const receptionApiService = new ReceptionApiService()
