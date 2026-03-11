/**
 * Centralized API Client for Smart Moto Service Center
 *
 * Switch between mock and real API using:
 *   VITE_USE_MOCK_DATA=true   → uses mock data (default for local dev)
 *   VITE_USE_MOCK_DATA=false  → calls real backend at VITE_API_URL
 *
 * Auth token is automatically injected from localStorage when present.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const USE_MOCK_DATA = false // Always use real API

// ─── Auth helper ─────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

// ─── Error type ──────────────────────────────────────────────────────────────

export interface ApiError extends Error {
    statusCode: number
    body?: unknown
}

export function createApiError(statusCode: number, message: string, body?: unknown): ApiError {
    const err = new Error(message) as ApiError
    err.name = 'ApiError'
    err.statusCode = statusCode
    err.body = body
    return err
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
    const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })

    if (!res.ok) {
        let errorBody: unknown
        try { errorBody = await res.json() } catch { /* ignore */ }
        const message =
            (errorBody as any)?.message ||
            (errorBody as any)?.error ||
            `API Error ${res.status}: ${res.statusText}`
        throw createApiError(res.status, message, errorBody)
    }

    // 204 No Content — return empty
    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export const apiClient = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
}

// ─── Query string builder helper ─────────────────────────────────────────────

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const q = new URLSearchParams()
    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== '' && val !== false) {
            q.append(key, String(val))
        }
    }
    const str = q.toString()
    return str ? `?${str}` : ''
}
