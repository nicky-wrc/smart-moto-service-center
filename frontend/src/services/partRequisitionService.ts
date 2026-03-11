import { apiClient, USE_MOCK_DATA } from './api'
import { mockRequests, type PartRequest } from '../data/requestsMockData'

export type { PartRequest }

/**
 * Service for handling Part Requisitions API calls.
 *
 * To switch to real API:
 *   Set VITE_USE_MOCK_DATA=false in .env
 *   Backend endpoints expected:
 *     GET    /api/part-requisitions
 *     GET    /api/part-requisitions/:id
 *     PATCH  /api/part-requisitions/:id/issue
 *     PATCH  /api/part-requisitions/:id/reject
 *     GET    /api/part-requisitions/history
 *     GET    /api/part-requisitions/history/:id
 */
export const partRequisitionService = {

    /**
     * Fetch all pending part requests
     */
    getPendingRequests: async (): Promise<PartRequest[]> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<PartRequest[]>('/part-requisitions?status=PENDING')
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockRequests]), 600)
        })
    },

    /**
     * Fetch a single part request by ID
     */
    getRequestById: async (id: number): Promise<PartRequest | null> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<PartRequest>(`/part-requisitions/${id}`)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockRequests.find(r => r.id === id) ?? null)
            }, 500)
        })
    },

    /**
     * Approve / Issue a part request
     */
    approveRequest: async (id: number, items: { id: number; issuedQuantity: number }[]): Promise<void> => {
        if (!USE_MOCK_DATA) {
            await apiClient.patch(`/part-requisitions/${id}/issue`, { issuedItems: items })
            return
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                console.info(`[Mock] Approved part-requisition #${id}`, items)
                resolve()
            }, 800)
        })
    },

    /**
     * Reject a part request
     */
    rejectRequest: async (id: number, reason?: string): Promise<void> => {
        if (!USE_MOCK_DATA) {
            await apiClient.patch(`/part-requisitions/${id}/reject`, { notes: reason })
            return
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                console.info(`[Mock] Rejected part-requisition #${id}, reason:`, reason)
                resolve()
            }, 800)
        })
    },

    /**
     * Fetch history of part requests
     */
    getHistory: async (): Promise<PartRequest[]> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<PartRequest[]>('/part-requisitions/history')
        }

        // MOCK — returns empty; UI falls back to RequestHistoryContext (localStorage)
        return new Promise((resolve) => {
            setTimeout(() => resolve([]), 600)
        })
    },

    /**
     * Fetch a single history record by ID
     */
    getHistoryById: async (id: number): Promise<PartRequest | null> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<PartRequest>(`/part-requisitions/history/${id}`)
        }

        // MOCK — returns null so component falls back to RequestHistoryContext
        return new Promise((resolve) => {
            setTimeout(() => resolve(null), 500)
        })
    },
}
