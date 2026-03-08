import { mockRequests, type PartRequest } from '../data/requestsMockData';

// TODO: Replace with actual API URL when backend is ready
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// eslint-disable-next-line no-console
console.info('Configured API_BASE_URL:', API_BASE_URL);

/**
 * Service for handling Part Requisitions API calls.
 * Currently uses mock data. Replace the implementations with actual fetch/axios calls.
 */
export const partRequisitionService = {

    /**
     * Fetch all pending part requests
     */
    getPendingRequests: async (): Promise<PartRequest[]> => {
        // REAL API IMPLEMENTATION:
        // const response = await fetch(`${API_BASE_URL}/part-requisitions?status=PENDING`);
        // if (!response.ok) throw new Error('Failed to fetch pending requests');
        // return response.json();

        // MOCK IMPLEMENTATION:
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...mockRequests]);
            }, 600);
        });
    },

    /**
     * Fetch a single part request by ID
     */
    getRequestById: async (id: number): Promise<PartRequest | null> => {
        // REAL API IMPLEMENTATION:
        // const response = await fetch(`${API_BASE_URL}/part-requisitions/${id}`);
        // if (!response.ok) throw new Error(`Failed to fetch request ${id}`);
        // return response.json();

        // MOCK IMPLEMENTATION:
        return new Promise((resolve) => {
            setTimeout(() => {
                const found = mockRequests.find(r => r.id === id);
                resolve(found || null);
            }, 500);
        });
    },

    /**
     * Approve a part request
     */
    approveRequest: async (id: number, items: any[]): Promise<void> => {
        // REAL API IMPLEMENTATION:
        // const response = await fetch(`${API_BASE_URL}/part-requisitions/${id}/issue`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ issuedItems: items })
        // });
        // if (!response.ok) throw new Error('Failed to approve request');

        // MOCK IMPLEMENTATION:
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[Mock API] Approved request #${id} with items:`, items);
                resolve();
            }, 800);
        });
    },

    /**
     * Reject a part request
     */
    rejectRequest: async (id: number, reason?: string): Promise<void> => {
        // REAL API IMPLEMENTATION:
        // const response = await fetch(`${API_BASE_URL}/part-requisitions/${id}/reject`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ notes: reason })
        // });
        // if (!response.ok) throw new Error('Failed to reject request');

        // MOCK IMPLEMENTATION:
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[Mock API] Rejected request #${id} for reason:`, reason);
                resolve();
            }, 800);
        });
    },

    /**
     * Fetch history of part requests
     */
    getHistory: async (): Promise<any[]> => {
        // REAL API IMPLEMENTATION:
        // const response = await fetch(`${API_BASE_URL}/part-requisitions/history`);
        // return response.json();

        // MOCK IMPLEMENTATION:
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([]);
            }, 600);
        });
    },

    /**
     * Fetch a history record by ID
     */
    getHistoryById: async (id: number): Promise<any | null> => {
        // REAL API IMPLEMENTATION:
        // const response = await fetch(`${API_BASE_URL}/part-requisitions/history/${id}`);
        // if (!response.ok) throw new Error(`Failed to fetch history ${id}`);
        // return response.json();

        // MOCK IMPLEMENTATION:
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[Mock API] Fetched history #${id}`);
                resolve(null); // Returns null so the component can fallback to Context for the demo
            }, 500);
        });
    }
};
