import { apiClient } from './client';
import type { LaborTime, CreateLaborTimeDto } from './types';

export type { LaborTime, CreateLaborTimeDto };

class LaborTimesService {
  async start(jobId: number, technicianId: number, laborTypeId?: number) {
    return apiClient.post<LaborTime>('/labor-times/start', {
      jobId,
      technicianId,
      laborTypeId,
    });
  }

  async pause(id: number) {
    return apiClient.patch<LaborTime>(`/labor-times/${id}/pause`);
  }

  async resume(id: number) {
    return apiClient.patch<LaborTime>(`/labor-times/${id}/resume`);
  }

  async finish(id: number) {
    return apiClient.patch<LaborTime>(`/labor-times/${id}/finish`);
  }

  async findByJob(jobId: number) {
    return apiClient.get<LaborTime[]>(`/labor-times/job/${jobId}`);
  }

  async getJobTotal(jobId: number) {
    return apiClient.get<{ total: number }>(`/labor-times/job/${jobId}/total`);
  }

  async findOne(id: number) {
    return apiClient.get<LaborTime>(`/labor-times/${id}`);
  }
}

export const laborTimesService = new LaborTimesService();
