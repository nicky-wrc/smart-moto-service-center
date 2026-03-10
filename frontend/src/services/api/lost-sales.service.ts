import { apiClient } from './client';
import type { LostSale, CreateLostSaleDto } from './types';

export type { LostSale, CreateLostSaleDto };

class LostSalesService {
  async create(data: CreateLostSaleDto) {
    return apiClient.post<LostSale>('/lost-sales', data);
  }

  async findAll(filters?: {
    dateFrom?: string;
    dateTo?: string;
    partId?: number;
  }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.partId) params.partId = filters.partId;

    return apiClient.get<LostSale[]>('/lost-sales', { params });
  }

  async findOne(id: number) {
    return apiClient.get<LostSale>(`/lost-sales/${id}`);
  }

  async getSummary(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<any>('/lost-sales/summary', { params });
  }
}

export const lostSalesService = new LostSalesService();
