import { api } from '../lib/api'

export type JobStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'QC_PENDING'
  | 'CLEANING'
  | 'READY_FOR_DELIVERY'
  | 'COMPLETED'
  | 'PAID'
  | 'CANCELLED'

export type JobType = 'NORMAL' | 'FAST_TRACK' | 'DEEP_INSPECTION'

export interface Job {
  id: number
  jobNo: string
  status: JobStatus
  jobType: JobType
  priority: number
  symptomDescription: string | null
  technicianNote: string | null
  foremanNote: string | null
  estimatedCompletionTime: string | null
  inspectionFee: string | null
  mileage: number | null
  createdAt: string
  updatedAt: string
  motorcycle?: {
    id: number
    licensePlate: string
    brand: string
    model: string
    color: string
    year: number
  }
  customer?: {
    id: number
    firstName: string
    lastName: string
    phoneNumber: string
  }
  assignedTechnicians?: Array<{
    user: { id: number; name: string; username: string }
  }>
  laborTimes?: Array<{
    id: number
    serviceName: string
    laborCost: string
    startTime: string | null
    endTime: string | null
    technicianId: number
  }>
  outsources?: Array<{
    id: number
    description: string
    vendor: string | null
    cost: string
  }>
  partRequisitions?: Array<{
    id: number
    status: string
    items?: Array<{
      id: number
      quantity: number
      unitPrice: string
      part: { id: number; name: string; partNo: string }
    }>
  }>
  payment?: {
    id: number
    paymentNo: string
    paymentStatus: string
    totalAmount: string
    paidAt: string | null
  }
}

export interface ListJobsQuery {
  status?: JobStatus
  technicianId?: number
  search?: string
}

export const jobsService = {
  list: (query?: ListJobsQuery) => {
    const params = new URLSearchParams()
    if (query?.status) params.set('status', query.status)
    if (query?.technicianId) params.set('technicianId', String(query.technicianId))
    if (query?.search) params.set('search', query.search)
    const qs = params.toString()
    return api.get<Job[]>(`/jobs${qs ? `?${qs}` : ''}`)
  },

  get: (id: number) => api.get<Job>(`/jobs/${id}`),

  queue: () => api.get<Job[]>('/jobs/queue'),

  complete: (id: number, note?: string) =>
    api.patch<Job>(`/jobs/${id}/complete`, { technicianNote: note }),

  qc: (id: number, pass: boolean, note?: string) =>
    api.patch<Job>(`/jobs/${id}/qc`, { pass, note }),

  readyDelivery: (id: number) => api.patch<Job>(`/jobs/${id}/ready-delivery`, {}),

  cancel: (id: number, reason?: string) =>
    api.patch<Job>(`/jobs/${id}/cancel`, { reason }),

  update: (id: number, data: Partial<{ foremanNote: string; priority: number; estimatedCompletionTime: string }>) =>
    api.patch<Job>(`/jobs/${id}`, data),
}
