import { apiClient } from './client';
import type { Appointment, AppointmentStatus, CreateAppointmentDto, UpdateAppointmentDto, ConvertToJobDto } from './types';

export type { Appointment, AppointmentStatus };

export type { UpdateAppointmentDto, ConvertToJobDto };

class AppointmentsService {
  async findAll() {
    return apiClient.get<Appointment[]>('/appointments');
  }

  async findOne(id: number) {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  }

  async findByMotorcycle(motorcycleId: number) {
    return apiClient.get<Appointment[]>(`/appointments/motorcycle/${motorcycleId}`);
  }

  async create(data: CreateAppointmentDto) {
    return apiClient.post<Appointment>('/appointments', data);
  }

  async update(id: number, data: UpdateAppointmentDto) {
    return apiClient.patch<Appointment>(`/appointments/${id}`, data);
  }

  async delete(id: number) {
    return apiClient.delete(`/appointments/${id}`);
  }

  async convertToJob(id: number, data: ConvertToJobDto) {
    return apiClient.post<any>(`/appointments/${id}/convert-to-job`, data);
  }
}

export const appointmentsService = new AppointmentsService();
