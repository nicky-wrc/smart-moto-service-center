import { apiClient } from './client';
import type { Payment } from './types';

export type { Payment };

class PaymentsService {
  async calculateBilling(jobId: number) {
    return apiClient.get<any>(`/payments/job/${jobId}/calculate`);
  }

  async create(data: any) {
    return apiClient.post<Payment>('/payments', data);
  }

  async findAll(filters?: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<Payment[]>('/payments', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Payment>(`/payments/${id}`);
  }

  async findByJob(jobId: number) {
    return apiClient.get<Payment>(`/payments/job/${jobId}`);
  }

  async processPayment(id: number) {
    return apiClient.patch<Payment>(`/payments/${id}/process`);
  }
}

export const paymentsService = new PaymentsService();
