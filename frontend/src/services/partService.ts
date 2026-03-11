import { apiClient, USE_MOCK_DATA, buildQuery } from './api'
import { mockParts, type PartItem } from '../data/partsMockData'

export type { PartItem }

export interface GetPartsParams {
    page?: number
    limit?: number
    search?: string
    category?: string
    location?: string
    stockLevel?: string   // 'มีของ' | 'เหลือน้อย' | 'ใกล้หมด' | 'หมด'
    motorcycleModel?: string
}

export interface PaginatedPartsResponse {
    data: PartItem[]
    totalDocs: number
    totalPages: number
    currentPage: number
}

/**
 * Service for handling Parts API calls.
 *
 * To switch to real API:
 *   Set VITE_USE_MOCK_DATA=false in .env
 *   Backend endpoints expected:
 *     GET  /api/parts              (with query params)
 *     GET  /api/parts/:id
 */
export const partService = {

    /**
     * Fetch all parts with pagination and filtering
     */
    getParts: async (params: GetPartsParams = {}): Promise<PaginatedPartsResponse> => {
        if (!USE_MOCK_DATA) {
            const qs = buildQuery({
                page: params.page,
                limit: params.limit,
                search: params.search,
                category: params.category,
                location: params.location,
                stockLevel: params.stockLevel,
                motorcycleModel: params.motorcycleModel,
            })
            return apiClient.get<PaginatedPartsResponse>(`/parts${qs}`)
        }

        // ─── MOCK IMPLEMENTATION ────────────────────────────────────────────────
        const {
            page = 1,
            limit = 8,
            search = '',
            category = '',
            location = '',
            stockLevel = '',
            motorcycleModel = ''
        } = params

        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockParts]

                if (search) {
                    const qStr = search.toLowerCase()
                    filtered = filtered.filter(p => p.name.toLowerCase().includes(qStr) || p.partCode.toLowerCase().includes(qStr))
                }
                if (category) {
                    filtered = filtered.filter(p => p.category === category)
                }
                if (location) {
                    filtered = filtered.filter(p => p.location === location)
                }
                if (stockLevel === 'มีของ') {
                    filtered = filtered.filter(p => p.quantity >= 10)
                } else if (stockLevel === 'เหลือน้อย') {
                    filtered = filtered.filter(p => p.quantity >= 5 && p.quantity < 10)
                } else if (stockLevel === 'ใกล้หมด') {
                    filtered = filtered.filter(p => p.quantity >= 1 && p.quantity < 5)
                } else if (stockLevel === 'หมด') {
                    filtered = filtered.filter(p => p.quantity === 0)
                }
                if (motorcycleModel) {
                    filtered = filtered.filter(p => p.motorcycleModel === motorcycleModel || p.motorcycleModel === 'ทุกรุ่น')
                    filtered.sort((a, b) => {
                        const aExact = a.motorcycleModel === motorcycleModel ? 0 : 1
                        const bExact = b.motorcycleModel === motorcycleModel ? 0 : 1
                        return aExact - bExact
                    })
                }

                const totalDocs = filtered.length
                const totalPages = Math.ceil(totalDocs / limit)
                const startIndex = (page - 1) * limit
                const paginatedData = filtered.slice(startIndex, startIndex + limit)

                resolve({ data: paginatedData, totalDocs, totalPages, currentPage: page })
            }, 400)
        })
    },

    /**
     * Fetch a single part by ID
     */
    getById: async (id: number): Promise<PartItem | null> => {
        if (!USE_MOCK_DATA) {
            return apiClient.get<PartItem>(`/parts/${id}`)
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockParts.find(p => p.id === id) ?? null)
            }, 300)
        })
    },
}
