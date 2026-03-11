import { apiClient } from './client';
import type {
  ServiceReminder,
  CreateServiceReminderDto,
} from './types';

export type { ServiceReminder, CreateServiceReminderDto };

class ServiceRemindersService {
  async create(
    customerId: number,
    motorcycleId: number,
    data: CreateServiceReminderDto,
  ) {
    return apiClient.post<ServiceReminder>(
      `/customers/${customerId}/motorcycles/${motorcycleId}/reminders`,
      data,
    );
  }

  async findByMotorcycle(customerId: number, motorcycleId: number) {
    return apiClient.get<ServiceReminder[]>(
      `/customers/${customerId}/motorcycles/${motorcycleId}/reminders`,
    );
  }

  async getDue() {
    return apiClient.get<ServiceReminder[]>('/customers/reminders/due');
  }

  async markAsNotified(id: number) {
    return apiClient.patch<ServiceReminder>(
      `/customers/reminders/${id}/notify`,
    );
  }
}

export const serviceRemindersService = new ServiceRemindersService();
