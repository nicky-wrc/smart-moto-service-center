import { apiClient } from './client';

interface Warranty {
  id: number;
  warrantyNo: string;
  motorcycleId: number;
  startDate: string;
  endDate: string;
  mileageLimit?: number;
  currentMileage: number;
  status: string;
}

class WarrantiesService {
  async checkByMotorcycle(motorcycleId: number, currentMileage?: number) {
    const params = currentMileage ? { currentMileage } : {};
    return apiClient.get<{ hasWarranty: boolean; message: string; warranties: Warranty[] }>(
      `/warranties/check/motorcycle/${motorcycleId}`,
      { params }
    );
  }
}

export const warrantiesService = new WarrantiesService();
