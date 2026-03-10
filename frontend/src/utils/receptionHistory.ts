// Utility functions for managing reception history in localStorage

export type ReceptionActivityType =
    | 'ลงทะเบียนใหม่'
    | 'แจ้งซ่อมครั้งแรก'
    | 'แจ้งซ่อมรถที่มีในระบบ'
    | 'แจ้งซ่อมรถคันใหม่'

export interface ReceptionHistoryEntry {
    id: string
    activityType: ReceptionActivityType
    firstName: string
    lastName: string
    phone: string
    model: string
    color: string
    plateLine1: string
    plateLine2: string
    province: string
    symptoms?: string
    tags?: string[]
    images?: string[]
    createdAt: string // "DD/MM/YYYY HH:mm"
}

const STORAGE_KEY = 'smart_moto_reception_history'

/**
 * Get all history entries from localStorage
 */
export function getReceptionHistory(): ReceptionHistoryEntry[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch (error) {
        console.error('Error reading reception history:', error)
        return []
    }
}

/**
 * Add a new history entry
 */
export function addReceptionHistory(entry: Omit<ReceptionHistoryEntry, 'id' | 'createdAt'>): ReceptionHistoryEntry {
    const history = getReceptionHistory()
    
    // Generate ID
    const id = `RH-${String(history.length + 1).padStart(3, '0')}-${Date.now()}`
    
    // Generate timestamp in Thai format
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear() + 543 // Convert to Buddhist year
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const createdAt = `${day}/${month}/${year} ${hours}:${minutes}`
    
    const newEntry: ReceptionHistoryEntry = {
        ...entry,
        id,
        createdAt
    }
    
    // Add to end of array (append to list)
    const updatedHistory = [...history, newEntry]
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
        console.error('Error saving reception history:', error)
    }
    
    return newEntry
}

/**
 * Clear all history (for testing/admin purposes)
 */
export function clearReceptionHistory(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Error clearing reception history:', error)
    }
}
