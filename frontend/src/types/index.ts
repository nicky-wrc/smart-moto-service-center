/**
 * Types สำหรับระบบต้อนรับลูกค้า
 */

export interface ICustomer {
  id?: string
  name: string
  phone: string
  motorcycleModel: string
  licensePlate: string
  color: string
  createdAt?: Date
}

export interface ISearchResult {
  customers: ICustomer[]
  totalCount: number
}

export type ReceptionistStep = 'check' | 'search' | 'register' | 'confirm'

export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type UserRole = 'service-advisor' | 'tech-lead' | 'manager' | 'receptionist'

export interface IUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: Date
}

