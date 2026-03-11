import { apiClient } from './client';

export interface PartPackage {
  id: number;
  packageNo: string;
  name: string;
  description?: string;
  sellingPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    partId: number;
    quantity: number;
    part: {
      id: number;
      partNo: string;
      name: string;
      unit: string;
      unitPrice: number;
    };
  }>;
}

export interface CreatePackageDto {
  name: string;
  description?: string;
  sellingPrice: number;
  items: Array<{
    partId: number;
    quantity: number;
  }>;
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  sellingPrice?: number;
  isActive?: boolean;
}

class PartPackagesService {
  async findAll(filters?: { isActive?: boolean; search?: string }) {
    const params: any = {};
    if (filters?.isActive !== undefined) params.isActive = filters.isActive;
    if (filters?.search) params.search = filters.search;

    return apiClient.get<PartPackage[]>('/part-packages', { params });
  }

  async findOne(id: number) {
    return apiClient.get<PartPackage>(`/part-packages/${id}`);
  }

  async create(data: CreatePackageDto) {
    return apiClient.post<PartPackage>('/part-packages', data);
  }

  async update(id: number, data: UpdatePackageDto) {
    return apiClient.patch<PartPackage>(`/part-packages/${id}`, data);
  }

  async addItem(packageId: number, partId: number, quantity: number) {
    return apiClient.post(`/part-packages/${packageId}/items`, {
      partId,
      quantity,
    });
  }

  async removeItem(packageId: number, itemId: number) {
    return apiClient.delete(`/part-packages/${packageId}/items/${itemId}`);
  }

  async delete(id: number) {
    return apiClient.delete(`/part-packages/${id}`);
  }
}

export const partPackagesService = new PartPackagesService();
