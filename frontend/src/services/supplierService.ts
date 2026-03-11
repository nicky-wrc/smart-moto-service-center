import { apiClient, USE_MOCK_DATA } from './api'
import { mockSuppliers, type Supplier } from '../data/suppliersMockData'

export type { Supplier }

/**
 * Service for Supplier operations.
 *
 * To switch to real API:
 *   Set VITE_USE_MOCK_DATA=false in .env
 *   Backend endpoints expected:
 *     GET  /api/suppliers
 *     GET  /api/suppliers/:id
 */
export const supplierService = {

    /**
     * Get all suppliers
     */
    getAll: async (): Promise<Supplier[]> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<Supplier[]>('/suppliers')
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockSuppliers]), 300)
        })
    },

    /**
     * Get a single supplier by ID
     */
    getById: async (id: number): Promise<Supplier | null> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<Supplier>(`/suppliers/${id}`)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockSuppliers.find(s => s.id === id) ?? null)
            }, 300)
        })
    },
}
