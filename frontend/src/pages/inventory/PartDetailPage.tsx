import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockParts, type PartItem } from '../../data/partsMockData'

export default function PartDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [part, setPart] = useState<PartItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
        const fetchPart = async () => {
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 300))
            const found = mockParts.find(p => p.id === Number(id))
            setPart(found || null)
            setIsLoading(false)
        }
        fetchPart()
    }, [id])

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F5F5F5]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F8981D]"></div>
            </div>
        )
    }

    if (!part) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F5F5F5]">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">ไม่พบข้อมูลอะไหล่</p>
                    <button onClick={() => navigate('/inventory/parts')}
                        className="px-5 py-2.5 bg-[#1E1E1E] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors">
                        กลับหน้ารายการอะไหล่
                    </button>
                </div>
            </div>
        )
    }

    const stockStatus =
        part.quantity === 0 ? { label: 'หมดสต็อก', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' } :
        part.quantity < 5  ? { label: 'เหลือน้อยมาก', dot: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50 border-red-200' } :
        part.quantity < 10 ? { label: 'ใกล้หมด', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' } :
                             { label: 'มีสต็อก', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }

    return (
        <div className="h-full bg-[#F5F5F5] p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col gap-4 h-full">

                {/* Back button */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 w-fit text-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    ย้อนกลับ
                </button>

                {/* Main card */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex h-full">

                        {/* Image */}
                        <div className="w-80 shrink-0 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-100">
                            {!imageLoaded && (
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                                </div>
                            )}
                            <img
                                src={part.imageUrl}
                                alt={part.name}
                                className={`w-full h-full max-h-72 object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setImageLoaded(true)}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f8fafc/94a3b8.png?text=No+Image'
                                    setImageLoaded(true)
                                }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-8 flex flex-col gap-5 justify-center">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 leading-snug">{part.name}</h1>
                                    <p className="text-sm text-gray-400 font-mono mt-0.5">{part.partCode}</p>
                                </div>
                                <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${stockStatus.bg} ${stockStatus.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`}></span>
                                    {stockStatus.label}
                                </span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                                    {part.category}
                                </span>
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                                    {part.motorcycleModel || 'ทุกรุ่น'}
                                </span>
                            </div>

                            <div className="border-t border-gray-100"></div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ราคา/หน่วย</p>
                                    <p className="text-2xl font-semibold text-gray-900">฿{part.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">คงเหลือ</p>
                                    <p className={`text-2xl font-semibold ${part.quantity < 5 ? 'text-red-500' : part.quantity < 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                                        {part.quantity} <span className="text-sm font-normal text-gray-400">ชิ้น</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ตำแหน่งเก็บ</p>
                                    <p className="text-sm font-medium text-gray-700 mt-1">{part.location}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100"></div>

                            {/* Action button */}
                            <button
                                onClick={() => navigate('/inventory/purchase-orders/create', { state: { prefillPart: part } })}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1E1E1E] hover:bg-black text-white text-sm font-medium rounded-xl transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                สร้างใบสั่งซื้ออะไหล่นี้
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
