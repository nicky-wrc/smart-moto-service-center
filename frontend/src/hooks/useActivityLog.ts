import { useState, useCallback, useEffect } from 'react'

export type ActivityType = 'po' | 'request'

export interface ActivityLogItem {
    id: string
    type: ActivityType
    label: string
    sub: string
    date: string
    badge: string
    badgeColor: string
    timestamp: number // For accurate sorting
}

const STORAGE_KEY = 'smart_moto_activities_v1'

export function useActivityLog() {
    const [activities, setActivities] = useState<ActivityLogItem[]>([])

    // Load initial activities
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setActivities(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse activity log', e)
            }
        }
    }, [])

    // Function to add a new activity
    const addActivity = useCallback((activity: Omit<ActivityLogItem, 'timestamp'>) => {
        const newItem: ActivityLogItem = {
            ...activity,
            timestamp: Date.now(),
        }

        setActivities((prev) => {
            // Keep only the 10 most recent activities to prevent localStorage bloat
            const updated = [newItem, ...prev].slice(0, 10)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    return {
        activities,
        addActivity,
    }
}
