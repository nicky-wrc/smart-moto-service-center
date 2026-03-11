import { apiClient } from './api'

export interface Supplier {
  id: number
  supplierNo: string
  name: string
  contactName?: string
  phoneNumber?: string
  email?: string
  address?: string
  taxId?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Service for Supplier operations.
 */
export const supplierService = {

    /**
     * Get all suppliers
     */
    getAll: async (): Promise<Supplier[]> => {
        return apiClient.get<Supplier[]>('/suppliers')
    },

    /**
     * Get a single supplier by ID
     */
    getById: async (id: number): Promise<Supplier | null> => {
        return apiClient.get<Supplier>(`/suppliers/${id}`)
    },
}

