import { apiClient } from './client';
import type { Outsource, CreateOutsourceDto, UpdateOutsourceDto } from './types';

export type { Outsource, CreateOutsourceDto, UpdateOutsourceDto };

class OutsourcesService {
  async create(data: CreateOutsourceDto) {
    return apiClient.post<Outsource>('/outsources', data);
  }

  async findAll(filters?: {
    jobId?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params: any = {};
    if (filters?.jobId) params.jobId = filters.jobId;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<Outsource[]>('/outsources', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Outsource>(`/outsources/${id}`);
  }

  async update(id: number, data: UpdateOutsourceDto) {
    return apiClient.patch<Outsource>(`/outsources/${id}`, data);
  }

  async delete(id: number) {
    return apiClient.delete(`/outsources/${id}`);
  }

  async getJobTotal(jobId: number) {
    return apiClient.get<{ total: number }>(`/outsources/job/${jobId}/total`);
  }
}

export const outsourcesService = new OutsourcesService();
