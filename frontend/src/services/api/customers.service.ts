import { apiClient } from './client';
import type { Customer, CreateCustomerDto } from './types';

export type { Customer, CreateCustomerDto };

class CustomersService {
  async findAll(search?: string) {
    const params = search ? { search } : {};
    return apiClient.get<Customer[]>('/customers', { params });
  }

  async findOne(id: number) {
    return apiClient.get<Customer>(`/customers/${id}`);
  }

  async create(data: CreateCustomerDto) {
    return apiClient.post<Customer>('/customers', data);
  }

  async update(id: number, data: Partial<CreateCustomerDto>) {
    return apiClient.patch<Customer>(`/customers/${id}`, data);
  }
}

export const customersService = new CustomersService();
