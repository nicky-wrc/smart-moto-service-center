import { apiClient } from './client';
import type { ServiceHistory } from './types';

export type { ServiceHistory };

class ServiceHistoryService {
  async getHistory(customerId: number, motorcycleId: number) {
    return apiClient.get<ServiceHistory[]>(
      `/customers/${customerId}/motorcycles/${motorcycleId}/history`,
    );
  }
}

export const serviceHistoryService = new ServiceHistoryService();
