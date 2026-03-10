import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { mockParts, type PartItem } from '../../data/partsMockData'

export default function PartDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Detect where user came from
    const fromRequests = document.referrer.includes('/requests') || location.state?.from === 'requests'
    const backLabel = fromRequests ? 'ย้อนกลับ' : 'ย้อนกลับ'

    const [part, setPart] = useState<PartItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate API fetch
        const fetchPart = async () => {
            setIsLoading(true)
            try {
                await new Promise(resolve => setTimeout(resolve, 400))
                const found = mockParts.find(p => p.id === Number(id))
                setPart(found || null)
            } catch (err) {
                console.error("Failed to load part details", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPart()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
        )
    }

    if (!part) {
        return (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">ไม่พบข้อมูลอะไหล่ระบุรหัส: {id}</p>
                <button
                    onClick={() => navigate('/inventory/parts')}
                    className="mt-2 px-6 py-2.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 font-medium transition-colors shadow-sm"
                >
                    กลับหน้ารายการอะไหล่
                </button>
            </div>
        )
    }

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-white flex flex-col p-6 lg:p-10">
            {/* Top Navigation */}
            <div className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer hover:text-amber-600 w-fit transition-colors" onClick={() => navigate(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">{backLabel}</span>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Image Section */}
                <div className="w-full lg:w-5/12 flex flex-col justify-start relative lg:pr-8 border-b lg:border-b-0 lg:border-r border-gray-100 pb-8 lg:pb-0">
                    <div className="w-full flex-1 min-h-[400px] lg:min-h-0 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 flex items-center justify-center p-4 lg:p-8">
                        <img
                            src={part.imageUrl}
                            alt={part.name}
                            className="w-full h-full object-contain drop-shadow"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/e2e8f0/94a3b8.png?text=No+Image'
                            }}
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-7/12 p-8 lg:p-10 flex flex-col">
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight">
                                {part.name}
                            </h1>
                            <div className="flex flex-wrap gap-2 shrink-0 md:mt-1">
                                <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg">
                                    {part.category}
                                </span>
                                {part.quantity === 0 ? (
                                    <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg">หมดสต็อก</span>
                                ) : part.quantity < 5 ? (
                                    <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg animate-pulse">เหลือน้อยมาก</span>
                                ) : part.quantity < 10 ? (
                                    <span className="bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold px-3 py-1.5 rounded-lg">ใกล้หมด</span>
                                ) : (
                                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg">มีของ</span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-500 font-medium tracking-wide">
                            รหัสสินค้า: <span className="text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded ml-1">{part.partCode}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-10">
                        {/* Box 1: Quantity */}
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">จำนวนคงเหลือ</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-3xl font-semibold ${part.quantity < 10 ? 'text-red-500' : 'text-gray-900'}`}>{part.quantity}</span>
                                <span className="text-sm font-medium text-gray-500 uppercase">ชิ้น</span>
                            </div>
                        </div>

                        {/* Box 2: Price */}
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">ราคาต่อหน่วย</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-semibold text-gray-900 leading-none">
                                    ฿{part.price.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Box 3: Location */}
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">ตำแหน่งเก็บ</p>
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-lg font-semibold text-gray-800">{part.location}</span>
                            </div>
                        </div>

                        {/* Box 4: Motorcycle Model */}
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">รุ่นรถที่รองรับ</p>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                    <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                    <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                </svg>
                                <span className="text-base font-semibold text-gray-800">{part.motorcycleModel || "-"}</span>
                            </div>
                        </div>
                    </div>
                    {/* Action buttons footer */}
                    <div className="mt-8 pt-8 border-t border-gray-100 flex gap-4">
                        <button
                            onClick={() => navigate('/inventory/purchase-orders/create', { state: { prefillPart: part } })}
                            className="flex-1 flex justify-center items-center gap-3 px-8 py-4 bg-[#1E1E1E] text-white font-semibold rounded-2xl hover:bg-black transition-colors shadow-sm text-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            สร้างใบสั่งซื้ออะไหล่นี้
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
