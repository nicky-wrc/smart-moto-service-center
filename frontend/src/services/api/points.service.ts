import { apiClient } from './client';
import type {
  PointTransaction,
  EarnPointsDto,
  UsePointsDto,
} from './types';

export type { PointTransaction, EarnPointsDto, UsePointsDto };

class PointsService {
  async getCustomerPoints(customerId: number) {
    return apiClient.get<{ points: number }>(
      `/customers/${customerId}/points`,
    );
  }

  async getTransactions(customerId: number) {
    return apiClient.get<PointTransaction[]>(
      `/customers/${customerId}/points/transactions`,
    );
  }

  async earnPoints(data: EarnPointsDto) {
    return apiClient.post<PointTransaction>('/customers/points/earn', data);
  }

  async usePoints(data: UsePointsDto) {
    return apiClient.post<PointTransaction>('/customers/points/use', data);
  }
}

export const pointsService = new PointsService();
