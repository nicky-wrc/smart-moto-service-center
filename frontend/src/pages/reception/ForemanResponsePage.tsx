import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { useForemanResponseList } from '../../hooks/useForemanResponse'
import type { ForemanResponse } from '../../types/foremanResponse.types'

// Helper function to format data for display
const formatResponseData = (data: ForemanResponse) => {
    // Return the full data since ForemanResponse already has the right structure
    return data
}

export default function ForemanResponsePage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filterName, setFilterName] = useState('')
    const [filterPhone, setFilterPhone] = useState('')
    const [filterPlate, setFilterPlate] = useState('')
    const [filterModel, setFilterModel] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Fetch data from API
    const { data: apiResponses, total, loading, error } = useForemanResponseList({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: 'PENDING_CUSTOMER', // Show only pending responses
    })

    // Format responses for display
    const formattedResponses = (apiResponses || []).map(formatResponseData)

    // Filter responses based on local filters
    const filteredResponses = formattedResponses.filter(response => {
        const q = search.toLowerCase()
        const fullName = `${response.firstName} ${response.lastName}`
        const plate = `${response.plateLine1} ${response.plateLine2} ${response.province}`

        const matchSearch = !q ||
            fullName.toLowerCase().includes(q) ||
            response.phone.includes(q) ||
            response.queueNumber.includes(q) ||
            plate.toLowerCase().includes(q) ||
            response.model.toLowerCase().includes(q)

        const matchName = !filterName || fullName.toLowerCase().includes(filterName.toLowerCase())
        const matchPhone = !filterPhone || response.phone.includes(filterPhone)
        const matchPlate = !filterPlate || plate.toLowerCase().includes(filterPlate.toLowerCase())
        const matchModel = !filterModel || response.model.toLowerCase().includes(filterModel.toLowerCase())

        return matchSearch && matchName && matchPhone && matchPlate && matchModel
    })

    // Loading state
    if (loading && currentPage === 1) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#F5F5F5]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#F5F5F5]">
                <p className="text-red-500 mb-4">เกิดข้อผิดพลาด: {error.message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                >
                    ลองใหม่อีกครั้ง
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col">
            {/* Search & Filter Toggle */}
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex w-full items-center justify-between">
                    <div className="flex-1 max-w-2xl">
                        <SearchBox
                            value={search}
                            onChange={setSearch}
                            placeholder="ค้นหาชื่อ, เบอร์, ป้ายทะเบียน, รุ่นรถ, เลขคิว..."
                        >
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${showFilters ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                ตัวกรอง
                            </button>
                        </SearchBox>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{filteredResponses.length} รายการ</span>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="relative mt-2 p-5 bg-white rounded-xl border border-gray-200 shadow-md">
                        <div className="flex flex-col gap-5">
                            {/* Row 1: Name, Phone, Plate */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อ-นามสกุล</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น สมชาย"
                                        value={filterName}
                                        onChange={e => setFilterName(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น 081"
                                        value={filterPhone}
                                        onChange={e => setFilterPhone(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">ป้ายทะเบียน</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น 1กข 1234"
                                        value={filterPlate}
                                        onChange={e => setFilterPlate(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            {/* Row 2: Model */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">รุ่นรถ</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น Wave, PCX"
                                        value={filterModel}
                                        onChange={e => setFilterModel(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {filteredResponses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {search ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีการตอบกลับจากหัวหน้าช่าง'}
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            {search ? 'ลองค้นหาด้วยคำอื่นดูสิ' : 'เมื่อหัวหน้าช่างประเมินงานเสร็จ รายการจะปรากฏที่นี่'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredResponses.map((response) => {
                            const queueNumber = response.queueNumber
                            const licensePlate = `${response.plateLine1} ${response.plateLine2} ${response.province}`
                            const fullName = `${response.firstName} ${response.lastName}`
                            
                            // Format date like history page: "DD/MM/YYYY HH:MM"
                            const formatDate = (isoString: string) => {
                                const date = new Date(isoString)
                                const day = String(date.getDate()).padStart(2, '0')
                                const month = String(date.getMonth() + 1).padStart(2, '0')
                                const year = date.getFullYear() + 543 // Convert to Buddhist year
                                const hours = String(date.getHours()).padStart(2, '0')
                                const minutes = String(date.getMinutes()).padStart(2, '0')
                                return `${day}/${month}/${year} ${hours}:${minutes}`
                            }

                            return (
                                <div
                                    key={response.id}
                                    onClick={() => navigate(`/reception/foreman-response/${response.id}`)}
                                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-stretch">
                                        <div className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2.5 flex items-center rounded-br-xl shrink-0">
                                            ลำดับการรับบริการที่ {queueNumber}
                                        </div>
                                        <div className="flex-1 flex items-center pl-3 pr-4 gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-1 border rounded-full bg-emerald-100 text-emerald-700 border-emerald-200">
                                                ประเมินครั้งที่ {response.assessmentNumber}
                                            </span>
                                            <span className="flex-1" />
                                            <span className="text-sm text-gray-400 flex items-center gap-1.5">
                                                {formatDate(response.respondedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body — 2-column */}
                                    <div className="flex divide-x divide-gray-100 min-h-[130px]">

                                        {/* Left: Customer & Vehicle Info */}
                                        <div className="flex-1 px-5 py-4 flex flex-col gap-1.5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ข้อมูลลูกค้า / รถ</p>

                                            {/* Name */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span><span className="text-gray-400">ชื่อ : </span>{fullName}</span>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span><span className="text-gray-400">เบอร์โทร : </span>{response.phone}</span>
                                            </div>

                                            {/* Model */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg className="h-[14px] w-[14px] text-amber-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                                    <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                                    <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                                </svg>
                                                <span><span className="text-gray-400">รุ่นรถ : </span>{response.model}</span>
                                            </div>

                                            {/* Plate */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
                                                </svg>
                                                <span><span className="text-gray-400">ป้ายทะเบียน : </span>{licensePlate}</span>
                                            </div>
                                        </div>

                                        {/* Right: Foreman Response Summary */}
                                        <div className="flex-1 px-5 py-4 flex flex-col gap-2">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">การประเมินของหัวหน้าช่าง</p>

                                            {/* Estimated Cost */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>
                                                    <span className="text-gray-400">ประมาณการค่าซ่อม : </span>
                                                    <span className="font-semibold text-emerald-600">฿{response.estimatedCost.toLocaleString()}</span>
                                                </span>
                                            </div>

                                            {/* Estimated Duration */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span><span className="text-gray-400">ระยะเวลาซ่อม : </span>{response.estimatedDuration}</span>
                                            </div>

                                            {/* Foreman Name */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <span><span className="text-gray-400">ประเมินโดย : </span>{response.respondedBy}</span>
                                            </div>

                                            {/* Parts Count */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                <span><span className="text-gray-400">อะไหล่ที่ต้องใช้ : </span>{response.requiredParts.length} รายการ</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            {response.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {response.tags.length > 3 && (
                                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                    +{response.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                            <span>ดูรายละเอียด</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
