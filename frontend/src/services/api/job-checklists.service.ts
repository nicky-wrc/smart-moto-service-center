import { apiClient } from './client';
import type { JobChecklistItem, CreateChecklistItemDto } from './types';

export type { JobChecklistItem, CreateChecklistItemDto };

class JobChecklistsService {
  async findByJob(jobId: number) {
    return apiClient.get<JobChecklistItem[]>(`/job-checklists/job/${jobId}`);
  }

  async createItem(jobId: number, data: CreateChecklistItemDto) {
    return apiClient.post<JobChecklistItem>(
      `/job-checklists/job/${jobId}/item`,
      data,
    );
  }

  async createItems(
    jobId: number,
    items: CreateChecklistItemDto[],
  ) {
    return apiClient.post<JobChecklistItem[]>(
      `/job-checklists/job/${jobId}`,
      items,
    );
  }

  async update(id: number, data: Partial<CreateChecklistItemDto>) {
    return apiClient.patch<JobChecklistItem>(`/job-checklists/${id}`, data);
  }

  async delete(id: number) {
    return apiClient.delete(`/job-checklists/${id}`);
  }
}

export const jobChecklistsService = new JobChecklistsService();
