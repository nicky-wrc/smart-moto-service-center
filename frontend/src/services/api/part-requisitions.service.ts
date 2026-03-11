import { apiClient } from './client';
import type {
  Part,
  PartPackage,
  PartRequisition,
  PartRequisitionStatus,
  CreateRequisitionDto,
  ApproveRequisitionDto,
  RejectRequisitionDto,
  IssueRequisitionDto,
} from './types';

export type {
  PartRequisition,
  PartRequisitionStatus,
  CreateRequisitionDto,
  ApproveRequisitionDto,
  RejectRequisitionDto,
  IssueRequisitionDto,
};

class PartRequisitionsService {
  async findAll(filters?: {
    status?: PartRequisitionStatus;
    jobId?: number;
    technicianId?: number;
  }) {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.jobId) params.jobId = filters.jobId;
    if (filters?.technicianId) params.technicianId = filters.technicianId;

    return apiClient.get<PartRequisition[]>('/part-requisitions', { params });
  }

  async findOne(id: number) {
    return apiClient.get<PartRequisition>(`/part-requisitions/${id}`);
  }

  async create(data: CreateRequisitionDto) {
    return apiClient.post<PartRequisition>('/part-requisitions', data);
  }

  async approve(id: number, data: ApproveRequisitionDto) {
    return apiClient.patch<PartRequisition>(
      `/part-requisitions/${id}/approve`,
      data,
    );
  }

  async reject(id: number, data: RejectRequisitionDto) {
    return apiClient.patch<PartRequisition>(
      `/part-requisitions/${id}/reject`,
      data,
    );
  }

  async issue(id: number, data: IssueRequisitionDto) {
    return apiClient.patch<PartRequisition>(
      `/part-requisitions/${id}/issue`,
      data,
    );
  }
}

export const partRequisitionsService = new PartRequisitionsService();
