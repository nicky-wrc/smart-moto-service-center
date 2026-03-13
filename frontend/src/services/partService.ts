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

interface BackendPart {
    id: number
    partNo: string
    name: string
    description?: string
    brand?: string
    category?: string
    unit?: string
    unitPrice: number | string
    stockQuantity: number
    reorderPoint: number
    reorderQuantity: number
    isActive: boolean
}

function mapBackendPart(p: BackendPart): PartItem {
    return {
        id: p.id,
        partCode: p.partNo,
        name: p.name,
        category: p.category || '',
        location: '',
        quantity: p.stockQuantity ?? 0,
        price: Number(p.unitPrice) || 0,
        imageUrl: '',
        motorcycleModel: p.brand || undefined,
    }
}

function applyStockLevelFilter(parts: PartItem[], stockLevel: string): PartItem[] {
    switch (stockLevel) {
        case 'มีของ':    return parts.filter(p => p.quantity >= 10)
        case 'เหลือน้อย': return parts.filter(p => p.quantity >= 5 && p.quantity < 10)
        case 'ใกล้หมด':  return parts.filter(p => p.quantity >= 1 && p.quantity < 5)
        case 'หมด':      return parts.filter(p => p.quantity === 0)
        default:          return parts
    }
}

export const partService = {

    getParts: async (params: GetPartsParams = {}): Promise<PaginatedPartsResponse> => {
        if (!USE_MOCK_DATA) {
            const qs = buildQuery({
                search: params.search,
                category: params.category,
            })
            const raw = await apiClient.get<BackendPart[] | PaginatedPartsResponse>(`/parts${qs}`)

            let allParts: PartItem[]
            if (Array.isArray(raw)) {
                allParts = raw.map(mapBackendPart)
            } else if (raw && typeof raw === 'object' && Array.isArray((raw as PaginatedPartsResponse).data)) {
                return raw as PaginatedPartsResponse
            } else {
                allParts = []
            }

            if (params.stockLevel) {
                allParts = applyStockLevelFilter(allParts, params.stockLevel)
            }

            const page = params.page || 1
            const limit = params.limit || 20
            const totalDocs = allParts.length
            const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
            const start = (page - 1) * limit
            const data = allParts.slice(start, start + limit)

            return { data, totalDocs, totalPages, currentPage: page }
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
                if (stockLevel) {
                    filtered = applyStockLevelFilter(filtered, stockLevel)
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

    getById: async (id: number): Promise<PartItem | null> => {
        if (!USE_MOCK_DATA) {
            try {
                const raw = await apiClient.get<BackendPart>(`/parts/${id}`)
                return mapBackendPart(raw)
            } catch {
                return null
            }
        }

        // MOCK
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockParts.find(p => p.id === id) ?? null)
            }, 300)
        })
    },
}
