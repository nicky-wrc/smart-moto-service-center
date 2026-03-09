import { api } from '../lib/api'

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED'
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER' | 'POINTS'

export interface Payment {
  id: number
  paymentNo: string
  jobId: number
  customerId: number
  subtotal: string
  discount: string
  pointsUsed: number
  pointsEarned: number
  vat: string
  totalAmount: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  amountReceived: string | null
  change: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  customer?: {
    id: number
    firstName: string
    lastName: string
    phoneNumber: string
  }
  job?: {
    id: number
    jobNo: string
    status: string
    motorcycle?: {
      licensePlate: string
      brand: string
      model: string
    }
    laborTimes?: Array<{
      id: number
      serviceName: string
      laborCost: string
      technicianId: number
    }>
    outsources?: Array<{
      id: number
      description: string
      cost: string
    }>
    partRequisitions?: Array<{
      id: number
      status: string
      items?: Array<{
        id: number
        part: { name: string; partNo: string }
        quantity: number
        unitPrice: string
      }>
    }>
  }
}

export interface BillingBreakdown {
  laborCost: number
  partsCost: number
  outsourceCost: number
  subtotal: number
  discount: number
  vat: number
  total: number
  pointsEarned: number
}

export interface ProcessPaymentDto {
  paymentMethod: PaymentMethod
  amountReceived?: number
  notes?: string
}

export interface ListPaymentsQuery {
  status?: PaymentStatus
  method?: PaymentMethod
  customerId?: number
  dateFrom?: string
  dateTo?: string
}

export const paymentsService = {
  list: (query?: ListPaymentsQuery) => {
    const params = new URLSearchParams()
    if (query?.status) params.set('status', query.status)
    if (query?.method) params.set('method', query.method)
    if (query?.customerId) params.set('customerId', String(query.customerId))
    if (query?.dateFrom) params.set('dateFrom', query.dateFrom)
    if (query?.dateTo) params.set('dateTo', query.dateTo)
    const qs = params.toString()
    return api.get<Payment[]>(`/payments${qs ? `?${qs}` : ''}`)
  },

  get: (id: number) => api.get<Payment>(`/payments/${id}`),

  getByJob: (jobId: number) => api.get<Payment>(`/payments/job/${jobId}`),

  calculate: (jobId: number) => api.get<BillingBreakdown>(`/payments/job/${jobId}/calculate`),

  process: (id: number, dto: ProcessPaymentDto) =>
    api.patch<Payment>(`/payments/${id}/process`, dto),

  create: (dto: {
    jobId: number
    customerId: number
    paymentMethod: PaymentMethod
    discount?: number
    notes?: string
  }) => api.post<Payment>('/payments', dto),
}
