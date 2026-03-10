import { mockParts, type PartItem } from '../data/partsMockData'

// TODO: Replace with actual API URL when backend is ready
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// eslint-disable-next-line no-console
console.info('Configured API_BASE_URL (Parts):', API_BASE_URL)

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
 */
export const partService = {
    /**
     * Fetch all parts with pagination and filtering
     */
    getParts: async (params: GetPartsParams = {}): Promise<PaginatedPartsResponse> => {
        // REAL API IMPLEMENTATION:
        // const query = new URLSearchParams()
        // if (params.page) query.append('page', params.page.toString())
        // if (params.limit) query.append('limit', params.limit.toString())
        // if (params.search) query.append('search', params.search)
        // if (params.category) query.append('category', params.category)
        // if (params.location) query.append('location', params.location)
        // if (params.lowStock) query.append('lowStock', 'true')
        // const response = await fetch(`${API_BASE_URL}/parts?${query.toString()}`)
        // if (!response.ok) throw new Error('Failed to fetch parts')
        // return response.json()

        // MOCK IMPLEMENTATION:
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
                }

                const totalDocs = filtered.length
                const totalPages = Math.ceil(totalDocs / limit)

                const startIndex = (page - 1) * limit
                const endIndex = startIndex + limit
                const paginatedData = filtered.slice(startIndex, endIndex)

                resolve({
                    data: paginatedData,
                    totalDocs,
                    totalPages,
                    currentPage: page
                })
            }, 600)
        })
    }
}
