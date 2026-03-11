/**
 * React Hook for Foreman Response Operations
 * Provides state management and API integration
 */

import { useState, useEffect, useCallback } from 'react'
import type {
    ForemanResponse,
    ForemanResponseListParams,
    CustomerDecisionRequest,
} from '../types/foremanResponse.types'
import foremanResponseService from '../services/foremanResponseService'

/**
 * Hook for fetching a single foreman response
 */
export const useForemanResponse = (id: string | undefined) => {
    const [data, setData] = useState<ForemanResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(async () => {
        if (!id) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const response = await foremanResponseService.getForemanResponseById(id)
            setData(response)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching foreman response:', err)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    }
}

/**
 * Hook for fetching list of foreman responses
 */
export const useForemanResponseList = (params?: ForemanResponseListParams) => {
    const [data, setData] = useState<ForemanResponse[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await foremanResponseService.getForemanResponses(params)
            setData(response.data)
            setTotal(response.total)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching foreman response list:', err)
        } finally {
            setLoading(false)
        }
    }, [params])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        total,
        loading,
        error,
        refetch: fetchData,
    }
}

/**
 * Hook for customer decision management
 */
export const useCustomerDecision = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const submitDecision = useCallback(async (
        id: string,
        decision: CustomerDecisionRequest
    ) => {
        try {
            setLoading(true)
            setError(null)
            const response = await foremanResponseService.updateCustomerDecision(id, decision)
            return response
        } catch (err) {
            setError(err as Error)
            console.error('Error submitting customer decision:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        submitDecision,
        loading,
        error,
    }
}

/**
 * Hook for pending foreman responses
 */
export const usePendingForemanResponses = () => {
    const [data, setData] = useState<ForemanResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await foremanResponseService.getPendingForemanResponses()
            setData(response)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching pending foreman responses:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        count: data.length,
        loading,
        error,
        refetch: fetchData,
    }
}

/**
 * Hook for foreman response statistics
 */
export const useForemanResponseStats = () => {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await foremanResponseService.getForemanResponseStats()
            setStats(response)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching foreman response stats:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
    }
}
