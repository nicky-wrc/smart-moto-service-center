import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { type PartItem } from '../../data/partsMockData'
import { partService } from '../../services/partService'

// Info Card Component
function InfoCard({ 
    icon, 
    label, 
    value, 
    unit,
    color = 'amber',
    size = 'normal' 
}: { 
    icon: React.ReactNode
    label: string
    value: string | number
    unit?: string
    color?: 'amber' | 'emerald' | 'blue' | 'red' | 'orange' | 'gray'
    size?: 'normal' | 'large'
}) {
    const colorClasses = {
        amber: 'from-amber-50 to-amber-50 border-amber-200',
        emerald: 'from-emerald-50 to-green-50 border-emerald-200',
        blue: 'from-amber-50 to-amber-50 border-amber-200',
        red: 'from-red-50 to-rose-50 border-red-200',
        orange: 'from-orange-50 to-amber-50 border-orange-200',
        gray: 'from-gray-50 to-gray-50 border-gray-200'
    }

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl border-2 p-6 transition-all duration-300`}>
            <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    {icon}
                </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            {unit ? (
                <div>
                    <p className={`font-semibold text-gray-900 ${size === 'large' ? 'text-4xl' : 'text-2xl'}`}>
                        {value}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{unit}</p>
                </div>
            ) : (
                <p className={`font-semibold text-gray-900 ${size === 'large' ? 'text-4xl' : 'text-2xl'}`}>
                    {value}
                </p>
            )}
        </div>
    )
}

export default function PartDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Detect where user came from
    const fromRequests = document.referrer.includes('/requests') || location.state?.from === 'requests'
    const backLabel = fromRequests ? 'ย้อนกลับ' : 'ย้อนกลับ'

    const [part, setPart] = useState<PartItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
        const fetchPart = async () => {
            setIsLoading(true)
            setImageLoaded(false)
            try {
                const result = await partService.getParts({ limit: 1000 })
                const found = result.data.find((p: PartItem) => p.id === Number(id))
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
            <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                </div>
                <p className="mt-6 text-gray-600 font-medium animate-pulse">กำลังโหลดข้อมูลอะไหล่...</p>
            </div>
        )
    }

    if (!part) {
        return (
            <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">ไม่พบข้อมูลอะไหล่</h2>
                    <p className="text-gray-600 mb-6">ไม่พบอะไหล่ที่มีรหัส: <span className="font-mono font-semibold text-gray-900">{id}</span></p>
                    <button
                        onClick={() => navigate('/inventory/parts')}
                        className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        กลับหน้ารายการอะไหล่
                    </button>
                </div>
            </div>
        )
    }

    // Get stock status
    const getStockStatus = () => {
        if (part.quantity === 0) return { label: 'หมดสต็อก', color: 'red', animate: false }
        if (part.quantity < 5) return { label: 'เหลือน้อยมาก', color: 'red', animate: true }
        if (part.quantity < 10) return { label: 'ใกล้หมด', color: 'orange', animate: false }
        return { label: 'มีสต็อก', color: 'emerald', animate: false }
    }

    const stockStatus = getStockStatus()

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Hero Section with Background */}
            <div className="relative bg-amber-600 overflow-hidden">
                <div className="relative px-6 lg:px-10 py-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-6 group transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-semibold">{backLabel}</span>
                    </button>

                    {/* Title Section */}
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2 leading-tight">
                                            {part.name}
                                        </h1>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                                <span className="text-white font-mono font-semibold">{part.partCode}</span>
                                            </div>
                                            <div className="bg-white px-4 py-2 rounded-full">
                                                <span className="text-amber-600 font-semibold">{part.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* Left Column - Image (Wider - 2 columns) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group">
                                <div className="aspect-[4/3] relative bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
                                        </div>
                                    )}
                                    <img
                                        src={part.imageUrl}
                                        alt={part.name}
                                        className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/e2e8f0/94a3b8.png?text=No+Image'
                                            setImageLoaded(true)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Information (3 columns) */}
                    <div className="lg:col-span-3 space-y-8">
                        
                        {/* Status Badge */}
                        <div className={`
                            inline-flex px-6 py-3 rounded-2xl border-2
                            ${stockStatus.color === 'red' ? 'bg-red-50 border-red-300' : 
                              stockStatus.color === 'orange' ? 'bg-orange-50 border-orange-300' : 'bg-emerald-50 border-emerald-300'}
                            ${stockStatus.animate ? 'animate-pulse' : ''}
                        `}>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    stockStatus.color === 'red' ? 'bg-red-500' :
                                    stockStatus.color === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'
                                } shadow-lg`}></div>
                                <span className={`font-semibold text-lg ${
                                    stockStatus.color === 'red' ? 'text-red-700' :
                                    stockStatus.color === 'orange' ? 'text-orange-700' : 'text-emerald-700'
                                }`}>{stockStatus.label}</span>
                            </div>
                        </div>

                        {/* Price and Quantity Display */}
                        <div className="rounded-2xl">
                            <div className="text-left">
                                <p className="text-6xl font-medium text-gray-900">ราคา {part.quantity} <span className="text-2xl text-gray-600">/หน่วย</span></p>
                                <p className="text-lg text-gray-600 mt-2">จำนวนคงเหลือ {part.quantity} ชิ้น</p>
                            </div>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                                label="ตำแหน่งเก็บ"
                                value={part.location}
                                color="gray"
                            />
                            
                            <InfoCard
                                icon={
                                    <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                        <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                        <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                    </svg>
                                }
                                label="รุ่นรถที่รองรับ"
                                value={part.motorcycleModel || "ทุกรุ่น"}
                                color="gray"
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => navigate('/inventory/purchase-orders/create', { state: { prefillPart: part } })}
                            className="w-full group relative px-8 py-5 bg-[#1E1E1E] text-white font-semibold rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 text-lg overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            <div className="relative flex items-center justify-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>สร้างใบสั่งซื้ออะไหล่นี้</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}
