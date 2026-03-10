import { apiClient } from './client';
import type { Job, CreateJobDto, JobStatus, JobType } from './types';

export type { Job, CreateJobDto, JobStatus, JobType };

class JobsService {
  async findAll(filters?: { status?: JobStatus; jobType?: JobType; technicianId?: number }) {
    return apiClient.get<Job[]>('/jobs', { params: filters });
  }

  async findOne(id: number) {
    return apiClient.get<Job>(`/jobs/${id}`);
  }

  async create(data: CreateJobDto) {
    return apiClient.post<Job>('/jobs', data);
  }

  async getQueue(technicianId?: number) {
    const params = technicianId ? { technicianId } : {};
    return apiClient.get<Job[]>('/jobs/queue', { params });
  }

  async assignTechnician(jobId: number, technicianId: number) {
    return apiClient.patch<Job>(`/jobs/${jobId}/assign`, { technicianId });
  }

  async startJob(jobId: number) {
    return apiClient.patch<Job>(`/jobs/${jobId}/start`);
  }

  async completeJob(jobId: number) {
    return apiClient.patch<Job>(`/jobs/${jobId}/complete`);
  }
}

export const jobsService = new JobsService();
