import { apiClient } from './client';
import type { Invoice } from './types';

export type { Invoice };

class InvoicesService {
  async create(jobId: number) {
    return apiClient.post<Invoice>('/invoices', { jobId });
  }

  async findAll(filters?: {
    dateFrom?: string;
    dateTo?: string;
    customerId?: number;
  }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.customerId) params.customerId = filters.customerId;

    return apiClient.get<Invoice[]>('/invoices', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  }

  async generatePdf(id: number) {
    return apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  }
}

export const invoicesService = new InvoicesService();
