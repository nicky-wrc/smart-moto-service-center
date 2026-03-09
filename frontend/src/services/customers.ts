import { api } from '../lib/api'

export interface Motorcycle {
  id: number
  vin: string
  licensePlate: string
  brand: string
  model: string
  color: string
  year: number
  engineNo: string | null
  mileage: number | null
}

export interface Customer {
  id: number
  phoneNumber: string
  title: string | null
  firstName: string
  lastName: string
  address: string | null
  points: number
  createdAt: string
  motorcycles?: Motorcycle[]
}

export const customersService = {
  list: () => api.get<Customer[]>('/customers'),

  get: (id: number) => api.get<Customer>(`/customers/${id}`),

  search: (q: string) =>
    api.get<Customer[]>(`/customers/search?q=${encodeURIComponent(q)}`),

  create: (data: {
    phoneNumber: string
    title?: string
    firstName: string
    lastName: string
    address?: string
  }) => api.post<Customer>('/customers', data),

  createWithMotorcycle: (data: {
    customer: {
      phoneNumber: string
      title?: string
      firstName: string
      lastName: string
      address?: string
    }
    motorcycle: {
      vin: string
      licensePlate: string
      brand: string
      model: string
      color?: string
      year?: number
      engineNo?: string
      mileage?: number
    }
  }) => api.post<Customer>('/customers/with-motorcycle', data),
}
