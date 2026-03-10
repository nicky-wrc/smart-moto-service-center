import { apiClient } from './client';
import type { Quotation, CreateQuotationDto, UpdateQuotationDto } from './types';

export type { Quotation, CreateQuotationDto, UpdateQuotationDto };

class QuotationsService {
  async create(data: CreateQuotationDto) {
    return apiClient.post<Quotation>('/quotations', data);
  }

  async findAll(filters?: {
    status?: string;
    customerId?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.customerId) params.customerId = filters.customerId;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<Quotation[]>('/quotations', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Quotation>(`/quotations/${id}`);
  }

  async update(id: number, data: UpdateQuotationDto) {
    return apiClient.patch<Quotation>(`/quotations/${id}`, data);
  }

  async send(id: number) {
    return apiClient.patch<Quotation>(`/quotations/${id}/send`);
  }

  async approve(id: number) {
    return apiClient.patch<Quotation>(`/quotations/${id}/approve`);
  }

  async reject(id: number, reason?: string) {
    return apiClient.patch<Quotation>(`/quotations/${id}/reject`, { reason });
  }

  async convertToJob(id: number, data: any) {
    return apiClient.post(`/quotations/${id}/convert-to-job`, data);
  }
}

export const quotationsService = new QuotationsService();
