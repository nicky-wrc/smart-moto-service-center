import { useState, useEffect } from 'react'
import { partService } from '../services/partService'
import { type PartItem } from '../data/partsMockData'
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

    // Using a simpler client-side state for the modal since we just want a quick pick list
    // In a real app we'd still paginate, but for the mock UX, top 20 is fine.

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
                // Fetch first 20 items matching search
                const res = await partService.getParts({ page: 1, limit: 20, search: debouncedSearch })
                if (isMounted) setParts(res.data)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }
        fetchParts()
        return () => { isMounted = false }
    }, [isOpen, debouncedSearch])

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

                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <SearchBox
                        value={search}
                        onChange={setSearch}
                        placeholder="ค้นหารหัส หรือชื่อสินค้า..."
                    />
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
                                    onClick={() => {
                                        onSelectPart(part)
                                    }}
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
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-gray-800 group-hover:text-amber-700 transition-colors">{part.name}</h4>
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                {part.partCode}
                                            </span>
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
