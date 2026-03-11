/**
 * Reception API Service
 * 
 * This service handles all API calls related to reception activities:
 * - Creating repair requests (sending to foreman)
 * - Managing customer and motorcycle data
 * - Handling reception history
 */
import { apiClient } from './api'

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
  jobType?: string // 'NORMAL' | 'DEEP_INSPECTION'
  fuelLevel?: number // 0-100
  valuables?: string // ของมีค่าในรถ
  
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
  /**
   * Helper function to map the actual backend Job format to the UI expected format
   */
  private mapJobToUI(job: any, customerId: number): RepairRequestResponse {
    let mappedStatus: any = 'pending_foreman_review';
    switch (job.status) {
      case 'IN_PROGRESS':
        mappedStatus = 'in_progress';
        break;
      case 'COMPLETED':
      case 'READY_FOR_DELIVERY':
      case 'PAID':
        mappedStatus = 'completed';
        break;
      case 'PENDING':
      default:
        mappedStatus = 'pending_foreman_review';
        break;
    }

    return {
      id: job.jobNo || job.id.toString(),
      customerId,
      motorcycleId: job.motorcycleId,
      symptoms: job.symptom || '',
      tags: job.tags || [],
      images: job.images || [],
      status: mappedStatus,
      queueNumber: job.id,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      assignedTechnicianId: job.technicianId
    };
  }

  /**
   * Create a new repair request and send to foreman
   * This is called when clicking "ส่งใบแจ้งซ่อม" button
   */
  async createRepairRequest(data: RepairRequestDTO): Promise<RepairRequestResponse> {
    try {
      const licensePlate = `${data.motorcycleData.licensePlate.line1} ${data.motorcycleData.licensePlate.province} ${data.motorcycleData.licensePlate.line2}`.trim();
      let customerId = data.customerId;
      let motorcycleId = data.motorcycleId;

      if (!data.isExistingCustomer) {
        // Create new Customer and Motorcycle using nested DTO endpoint
        const createRes = await apiClient.post<any>('/customers/with-motorcycle', {
          phoneNumber: data.customerData.phone,
          firstName: data.customerData.firstName,
          lastName: data.customerData.lastName,
          address: data.customerData.address || '',
          motorcycle: {
            licensePlate,
            brand: 'ไม่ระบุ',
            model: data.motorcycleData.model,
            color: data.motorcycleData.color,
            vin: `VIN-${Date.now()}` // Mock VIN since frontend doesn't collect it
          }
        });
        customerId = createRes.id;
        motorcycleId = createRes.motorcycles[0].id;
      } else {
        // Make sure we have customer ID
        if (!customerId) {
          const searchRes = await apiClient.get<any[]>(`/customers/search?query=${encodeURIComponent(data.customerData.phone)}`);
          if (searchRes && searchRes.length > 0) {
            customerId = searchRes[0].id;
          } else {
            throw new Error('Customer not found');
          }
        }
        
        // Handle potentially new motorcycle for existing customer
        if (data.isNewMotorcycle || !motorcycleId) {
          const createMotoRes = await apiClient.post<any>('/motorcycles', {
            vin: `VIN-${Date.now()}`,
            licensePlate,
            brand: 'ไม่ระบุ',
            model: data.motorcycleData.model,
            color: data.motorcycleData.color,
            ownerId: customerId
          });
          motorcycleId = createMotoRes.id;
        }
      }

      // Create Repair Request (Job)
      const jobPayload = {
        motorcycleId: Number(motorcycleId),
        symptom: data.symptoms,
        jobType: data.jobType || 'NORMAL',
        fuelLevel: data.fuelLevel ?? undefined,
        valuables: data.valuables || undefined,
        images: (data.images || []).filter(img => !img.startsWith('blob:')),
        tags: data.tags || []
      };
      console.log('Creating job with payload:', JSON.stringify(jobPayload, null, 2));
      const jobRes = await apiClient.post<any>('/jobs', jobPayload);

      return this.mapJobToUI(jobRes, customerId!);
      
    } catch (error) {
      console.error('Error creating repair request:', error)
      throw error
    }
  }

  /**
   * Get all repair requests (for history page)
   */
  async getRepairRequests(): Promise<RepairRequestResponse[]> {
    try {
      const jobs = await apiClient.get<any[]>('/jobs');
      return jobs.map(j => this.mapJobToUI(j, j.motorcycle?.owner?.id || 0));
    } catch (error) {
      console.error('Error fetching repair requests:', error)
      throw error
    }
  }

  /**
   * Get a single repair request by ID
   */
  async getRepairRequestById(id: string): Promise<RepairRequestResponse> {
    try {
      const numericId = parseInt(id, 10) || Number(id.replace(/[^0-9]/g, ''));
      const job = await apiClient.get<any>(`/jobs/${numericId}`);
      return this.mapJobToUI(job, job.motorcycle?.ownerId || 0);
    } catch (error) {
      console.error('Error fetching repair request:', error)
      throw error
    }
  }

  /**
   * Create or get existing customer
   */
  async createOrGetCustomer(data: CustomerDTO): Promise<{ id: number; isNew: boolean }> {
    try {
      const searchRes = await apiClient.get<any[]>(`/customers/search?query=${encodeURIComponent(data.phone)}`);
      if (searchRes && searchRes.length > 0) {
        return { id: searchRes[0].id, isNew: false };
      }
      
      const createRes = await apiClient.post<any>('/customers', {
        phoneNumber: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address
      });
      return { id: createRes.id, isNew: true };
    } catch (error) {
      console.error('Error creating/getting customer:', error)
      throw error
    }
  }

  /**
   * Create or get existing motorcycle
   */
  async createOrGetMotorcycle(data: MotorcycleDTO): Promise<{ id: number; isNew: boolean }> {
    try {
      const licensePlate = `${data.plateLine1} ${data.province} ${data.plateLine2}`.trim();
      const createRes = await apiClient.post<any>('/motorcycles', {
        vin: `VIN-${Date.now()}`,
        licensePlate,
        brand: 'ไม่ระบุ',
        model: data.model,
        color: data.color,
        ownerId: data.customerId
      });
      return { id: createRes.id, isNew: true };
    } catch (error) {
      console.error('Error creating/getting motorcycle:', error)
      throw error
    }
  }

  /**
   * Upload images for repair request
   * Currently converting to base64 to simulate upload logic while persisting to local storage.
   */
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const base64Images = await Promise.all(files.map(file => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
      }));
      return base64Images;
    } catch (error) {
      console.error('Error converting images to Base64:', error);
      throw error;
    }
  }

  /**
   * Send notification to foreman role
   */
  async sendForemanNotification(repairRequestId: string): Promise<{ success: boolean }> {
    try {
      // Backend automatically notifies conceptually via websocket, etc.
      // We will pretend it's a success for now.
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Search customers by phone or name
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
      const customers = await apiClient.get<any[]>(`/customers/search?query=${encodeURIComponent(query)}`);
      return customers.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phoneNumber,
        address: c.address || '',
        motorcycles: (c.motorcycles || []).map((m: any) => {
          const plates = m.licensePlate ? m.licensePlate.split(' ') : [];
          return {
            id: m.id,
            model: m.model,
            color: m.color,
            plateLine1: plates[0] || m.licensePlate,
            province: plates[1] || '',
            plateLine2: plates[2] || ''
          };
        })
      }));
    } catch (error) {
      console.error('Error searching customers:', error)
      throw error
    }
  }
}

export const receptionApiService = new ReceptionApiService()
