import { useState, useEffect, useMemo } from 'react'
import { partService } from '../services/partService'
import { mockParts, type PartItem } from '../data/partsMockData'
import SearchBox from './SearchBox'

interface PartSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectPart: (part: PartItem) => void
}



export default function PartSelectionModal({ isOpen, onClose, onSelectPart }: PartSelectionModalProps) {
    const [parts, setParts] = useState<PartItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedModel, setSelectedModel] = useState('')

    // Build unique model list from static mock data (excluding "ทุกรุ่น" since those should show in all)
    const motorcycleModels = useMemo(() => {
        const models = new Set<string>()
        mockParts.forEach(p => {
            if (p.motorcycleModel && p.motorcycleModel !== 'ทุกรุ่น') {
                models.add(p.motorcycleModel)
            }
        })
        return Array.from(models).sort()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        if (!isOpen) return

        let isMounted = true
        const fetchParts = async () => {
            setIsLoading(true)
            try {
                const res = await partService.getParts({
                    page: 1,
                    limit: 50,
                    search: debouncedSearch,
                    motorcycleModel: selectedModel
                })
                if (isMounted) setParts(res.data)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }
        fetchParts()
        return () => { isMounted = false }
    }, [isOpen, debouncedSearch, selectedModel])

    // Reset filters when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearch('')
            setSelectedModel('')
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">เลือกเพิ่มสินค้า</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search & Filter Row */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <div className="flex-1">
                        <SearchBox
                            value={search}
                            onChange={setSearch}
                            placeholder="ค้นหารหัส หรือชื่อสินค้า..."
                        />
                    </div>
                    {/* Motorcycle Model Dropdown */}
                    <div className="relative flex items-center shrink-0">
                        <div className="pointer-events-none absolute left-3 text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 17 24" fill="currentColor">
                                <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002z" />
                            </svg>
                        </div>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="pl-8 pr-8 py-2.5 text-sm border border-gray-300 bg-white text-gray-600 rounded-xl appearance-none outline-none transition-colors cursor-pointer min-w-[180px] hover:border-gray-400"
                        >
                            <option value="">เลือกรุ่นรถ (ทั้งหมด)</option>
                            {motorcycleModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                    ) : parts.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            ไม่พบสินค้าที่ตรงกับคำค้นหา
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {parts.map(part => (
                                <button
                                    key={part.id}
                                    onClick={() => onSelectPart(part)}
                                    className="flex items-center gap-4 p-3 hover:bg-amber-50 rounded-xl text-left transition-colors border border-transparent hover:border-amber-100 group"
                                >
                                    <img
                                        src={part.imageUrl}
                                        alt={part.name}
                                        className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/e2e8f0/94a3b8.png?text=No+Image'
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h4 className="font-medium text-gray-800 group-hover:text-amber-700 transition-colors">
                                                {part.name} <span className="text-gray-400 font-normal text-xs ml-1">({part.partCode})</span>
                                            </h4>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                                                    {part.category.split(' ')[0]}
                                                </span>
                                                {part.motorcycleModel && (
                                                    <span className="text-sm font-medium px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                                        {part.motorcycleModel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span>ราคา: <span className="font-semibold text-gray-700">฿{part.price.toLocaleString()}</span></span>
                                            <span>คงเหลือ: <span className={`font-semibold ${part.quantity < 10 ? 'text-red-500' : 'text-emerald-600'}`}>{part.quantity}</span></span>
                                        </div>
                                    </div>
                                    <div className="px-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white transition-all shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
