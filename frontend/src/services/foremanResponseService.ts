/**
 * Foreman Response API Service
 * Handles all API calls related to foreman responses
 */

import { apiClient, buildQuery } from './api'
import type {
    ForemanResponse,
    ForemanResponseListParams,
    ForemanResponseListResponse,
    CustomerDecisionRequest,
    CustomerDecisionResponse,
} from '../types/foremanResponse.types'

const BASE_URL = '/foreman-responses' // Adjust based on your backend route

/**
 * Get all foreman responses (with pagination and filters)
 */
export const getForemanResponses = async (
    params?: ForemanResponseListParams
): Promise<ForemanResponseListResponse> => {
    try {
        const queryString = params ? buildQuery(params as Record<string, string | number | boolean | undefined>) : ''
        const response = await apiClient.get<ForemanResponseListResponse>(`${BASE_URL}${queryString}`)
        return response
    } catch (error) {
        console.error('Error fetching foreman responses:', error)
        throw error
    }
}

/**
 * Get a single foreman response by ID
 */
export const getForemanResponseById = async (
    id: string
): Promise<ForemanResponse> => {
    try {
        const response = await apiClient.get<ForemanResponse>(`${BASE_URL}/${id}`)
        return response
    } catch (error) {
        console.error(`Error fetching foreman response ${id}:`, error)
        throw error
    }
}

/**
 * Get foreman responses by job ID
 */
export const getForemanResponsesByJobId = async (
    jobId: string
): Promise<ForemanResponse[]> => {
    try {
        const response = await apiClient.get<ForemanResponse[]>(`${BASE_URL}/job/${jobId}`)
        return response
    } catch (error) {
        console.error(`Error fetching foreman responses for job ${jobId}:`, error)
        throw error
    }
}

/**
 * Get pending foreman responses (waiting for customer decision)
 */
export const getPendingForemanResponses = async (): Promise<ForemanResponse[]> => {
    try {
        const response = await apiClient.get<ForemanResponse[]>(`${BASE_URL}/pending`)
        return response
    } catch (error) {
        console.error('Error fetching pending foreman responses:', error)
        throw error
    }
}

/**
 * Update customer decision (approve/reject)
 */
export const updateCustomerDecision = async (
    id: string,
    decision: CustomerDecisionRequest
): Promise<CustomerDecisionResponse> => {
    try {
        const response = await apiClient.patch<CustomerDecisionResponse>(`${BASE_URL}/${id}/decision`, decision)
        return response
    } catch (error) {
        console.error(`Error updating customer decision for ${id}:`, error)
        throw error
    }
}

/**
 * Get foreman response statistics
 */
export const getForemanResponseStats = async (): Promise<{
    pending: number
    approved: number
    rejected: number
    total: number
}> => {
    try {
        const response = await apiClient.get<{
            pending: number
            approved: number
            rejected: number
            total: number
        }>(`${BASE_URL}/stats`)
        return response
    } catch (error) {
        console.error('Error fetching foreman response stats:', error)
        throw error
    }
}

/**
 * Export foreman response as PDF
 */
export const exportForemanResponsePDF = async (id: string): Promise<Blob> => {
    try {
        // Note: For blob responses, we'll need to use fetch directly
        // since apiClient returns JSON by default
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${BASE_URL}/${id}/export/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!response.ok) throw new Error('Failed to export PDF')
        return await response.blob()
    } catch (error) {
        console.error(`Error exporting foreman response ${id} as PDF:`, error)
        throw error
    }
}

/**
 * Get customer decision history
 */
export const getCustomerDecisionHistory = async (
    jobId: string
): Promise<Array<{
    id: string
    decision: 'approved' | 'rejected'
    decisionAt: string
    decisionBy: string
    notes?: string
}>> => {
    try {
        const response = await apiClient.get<Array<{
            id: string
            decision: 'approved' | 'rejected'
            decisionAt: string
            decisionBy: string
            notes?: string
        }>>(`${BASE_URL}/job/${jobId}/decisions`)
        return response
    } catch (error) {
        console.error(`Error fetching decision history for job ${jobId}:`, error)
        throw error
    }
}

// Export default object
const foremanResponseService = {
    getForemanResponses,
    getForemanResponseById,
    getForemanResponsesByJobId,
    getPendingForemanResponses,
    updateCustomerDecision,
    getForemanResponseStats,
    exportForemanResponsePDF,
    getCustomerDecisionHistory,
}

export default foremanResponseService
