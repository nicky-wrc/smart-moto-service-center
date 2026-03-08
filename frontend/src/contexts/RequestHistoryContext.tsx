import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type HistoryStatus = 'อนุมัติการเบิก' | 'ไม่อนุมัติการเบิก'

export interface HistoryItem {
    id: number
    requester: string
    requesterRole: string
    motorcycleModel: string
    licensePlate: string
    requestedAt: string
    approvedAt: string
    status: HistoryStatus
    items: { id: number; partCode: string; partName: string; quantity: number; pricePerUnit: number }[]
}

interface RequestHistoryContextValue {
    history: HistoryItem[]
    addHistory: (entry: HistoryItem) => void
}

const STORAGE_KEY = 'inventory_request_history'

function loadFromStorage(): HistoryItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as HistoryItem[]) : []
    } catch {
        return []
    }
}

const RequestHistoryContext = createContext<RequestHistoryContextValue | null>(null)

export function RequestHistoryProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<HistoryItem[]>(loadFromStorage)

    const addHistory = useCallback((entry: HistoryItem) => {
        setHistory((prev) => {
            // Replace if same id already exists
            const filtered = prev.filter((h) => h.id !== entry.id)
            const updated = [entry, ...filtered]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    return (
        <RequestHistoryContext.Provider value={{ history, addHistory }}>
            {children}
        </RequestHistoryContext.Provider>
    )
}

export function useRequestHistory() {
    const ctx = useContext(RequestHistoryContext)
    if (!ctx) throw new Error('useRequestHistory must be used inside RequestHistoryProvider')
    return ctx
}
