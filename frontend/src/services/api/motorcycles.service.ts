import { apiClient } from './client';
import type { Motorcycle, CreateMotorcycleDto } from './types';

export type { Motorcycle, CreateMotorcycleDto };

class MotorcyclesService {
  async findAll(ownerId?: number) {
    const params = ownerId ? { ownerId } : {};
    return apiClient.get<Motorcycle[]>('/motorcycles', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Motorcycle>(`/motorcycles/${id}`);
  }

  async create(data: CreateMotorcycleDto) {
    return apiClient.post<Motorcycle>('/motorcycles', data);
  }

  async update(id: number, data: Partial<CreateMotorcycleDto>) {
    return apiClient.patch<Motorcycle>(`/motorcycles/${id}`, data);
  }
}

export const motorcyclesService = new MotorcyclesService();
