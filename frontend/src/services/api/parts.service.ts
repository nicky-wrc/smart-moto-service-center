import { apiClient } from './client';
import type { Part, CreatePartDto, UpdatePartDto } from './types';

export type { Part, CreatePartDto, UpdatePartDto };

class PartsService {
  async findAll(filters?: {
    category?: string;
    brand?: string;
    isActive?: boolean;
    lowStock?: boolean;
    search?: string;
  }) {
    const params: any = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.brand) params.brand = filters.brand;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive;
    if (filters?.lowStock) params.lowStock = filters.lowStock;
    if (filters?.search) params.search = filters.search;

    return apiClient.get<Part[]>('/parts', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Part>(`/parts/${id}`);
  }

  async findByPartNo(partNo: string) {
    return apiClient.get<Part>(`/parts/part-no/${partNo}`);
  }

  async create(data: CreatePartDto) {
    return apiClient.post<Part>('/parts', data);
  }

  async update(id: number, data: UpdatePartDto) {
    return apiClient.patch<Part>(`/parts/${id}`, data);
  }

  async delete(id: number) {
    return apiClient.delete(`/parts/${id}`);
  }

  async adjustStock(id: number, quantity: number, notes?: string) {
    return apiClient.patch(`/parts/${id}/adjust-stock`, { quantity, notes });
  }

  async getLowStock() {
    return apiClient.get<Part[]>('/parts/low-stock');
  }

  async createReceipt(data: any) {
    return apiClient.post('/parts/receipts', data);
  }

  async getReceipts(filters?: {
    dateFrom?: string;
    dateTo?: string;
    supplier?: string;
  }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.supplier) params.supplier = filters.supplier;

    return apiClient.get('/parts/receipts', { params });
  }
}

export const partsService = new PartsService();
