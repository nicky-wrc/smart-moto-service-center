import { apiClient, USE_MOCK_DATA } from './api'
import { mockParts, type PartItem } from '../data/partsMockData'
import { mockPurchaseOrders } from '../data/purchaseOrdersMockData'
import { mockRequests } from '../data/requestsMockData'

export type Activity = {
    id: string
    type: 'po' | 'request'
    label: string
    sub: string
    date: string
    badge: string
    badgeColor: string
}

export interface DashboardMetrics {
    totalItems: number
    lowStockParts: PartItem[]
    totalStockValue: number
    purchaseOrderCount: number
    topRequestedParts: { name: string; count: number; code: string }[]
    categories: [string, number][] // [categoryName, quantity]
    totalCategoryQty: number
    poStatusCount: Record<string, number>
    fallbackActivities: Activity[]
}

const LOW_STOCK_THRESHOLD = 10

function poLabel(s: string) {
    return { draft: 'ร่าง', pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ', cancelled: 'ยกเลิก' }[s] ?? s
}

function poColor(s: string) {
    return (
        {
            draft: 'bg-gray-100 text-gray-600',
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            cancelled: 'bg-red-50 text-red-400',
        }[s] ?? 'bg-gray-100 text-gray-600'
    )
}

/**
 * Service to fetch dashboard metrics.
 *
 * To switch to real API:
 *   Set VITE_USE_MOCK_DATA=false in .env
 *   Backend endpoint expected:
 *     GET /api/inventory/dashboard
 *   Should return the DashboardMetrics shape (or a superset).
 */
export const dashboardService = {
    fetchDashboardMetrics: async (): Promise<DashboardMetrics> => {
        if (!USE_MOCK_DATA) {
            // Real API — backend handles all aggregation server-side
            return apiClient.get<DashboardMetrics>('/inventory/dashboard')
        }

        // ─── MOCK IMPLEMENTATION ────────────────────────────────────────────

        const lowStockParts = mockParts
            .filter((p) => p.quantity <= LOW_STOCK_THRESHOLD)
            .sort((a, b) => a.quantity - b.quantity)

        const totalStockValue = mockParts.reduce((sum, p) => sum + p.quantity * p.price, 0)
        const totalItems = mockParts.length

        // Count requested part codes from all requests
        const partRequestCount: Record<string, { name: string; count: number; code: string }> = {}
        mockRequests.forEach((req) => {
            req.items.forEach((item) => {
                if (!partRequestCount[item.partCode]) {
                    partRequestCount[item.partCode] = { name: item.partName, count: 0, code: item.partCode }
                }
                partRequestCount[item.partCode].count += item.quantity
            })
        })
        const topRequestedParts = Object.values(partRequestCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // Category stock distribution
        const categoryMap: Record<string, number> = {}
        mockParts.forEach((p) => {
            categoryMap[p.category] = (categoryMap[p.category] ?? 0) + p.quantity
        })
        const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
        const totalCategoryQty = categories.reduce((s, [, q]) => s + q, 0)

        // PO status counts
        const poStatusCount: Record<string, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 }
        mockPurchaseOrders.forEach((po) => {
            poStatusCount[po.status] = (poStatusCount[po.status] ?? 0) + 1
        })

        // Fallback Activities
        const fallbackActivities: Activity[] = [
            ...mockPurchaseOrders.map((po) => {
                let badgeText = poLabel(po.status)
                if (po.status === 'draft') badgeText = 'สร้างใบสั่งซื้อฉบับร่าง'
                if (po.status === 'pending') badgeText = 'รออนุมัติ'
                if (po.status === 'approved') badgeText = 'ยืนยันแล้ว'
                if (po.status === 'cancelled') badgeText = 'ยกเลิกแล้ว'
                return {
                    id: po.id,
                    type: 'po' as const,
                    label: po.id,
                    sub: po.supplierName,
                    date: po.createdAt,
                    badge: badgeText,
                    badgeColor: poColor(po.status),
                }
            }),
            ...mockRequests.map((req) => ({
                id: `REQ-${req.id}`,
                type: 'request' as const,
                label: `เบิกอะไหล่ (REQ-${String(req.id).padStart(3, '0')})`,
                sub: req.requester,
                date: req.requestedAt.split(' ')[0],
                badge: 'เบิกอะไหล่ใหม่',
                badgeColor: 'bg-blue-100 text-blue-700',
            })),
        ]

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600))

        return { totalItems, lowStockParts, totalStockValue, purchaseOrderCount: mockPurchaseOrders.length, topRequestedParts, categories, totalCategoryQty, poStatusCount, fallbackActivities }
    },
}
