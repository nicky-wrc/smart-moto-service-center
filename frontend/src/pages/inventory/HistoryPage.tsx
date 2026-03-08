import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { useRequestHistory, type HistoryItem, type HistoryStatus } from '../../contexts/RequestHistoryContext'
import { PROVINCES } from '../../data/provinces'
import { partRequisitionService } from '../../services/partRequisitionService'

export default function HistoryPage() {
    const { history } = useRequestHistory()
    const navigate = useNavigate()
    const [historyData, setHistoryData] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const fetchHistory = async () => {
            setIsLoading(true)
            try {
                const data = await partRequisitionService.getHistory()
                // Use API data if available, otherwise fallback to local session history
                if (isMounted) setHistoryData(data.length > 0 ? data : history)
            } catch (error) {
                console.error("Failed to load history:", error)
                if (isMounted) setHistoryData(history)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }
        fetchHistory()
        return () => { isMounted = false }
    }, [history])
    const [search, setSearch] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filterStatus, setFilterStatus] = useState<HistoryStatus | ''>('')
    const [filterRequester, setFilterRequester] = useState('')
    const [filterModel, setFilterModel] = useState('')
    const [filterPlateLine1, setFilterPlateLine1] = useState('')
    const [filterPlateLine2, setFilterPlateLine2] = useState('')
    const [filterProvince, setFilterProvince] = useState('')
    const [filterReqDate, setFilterReqDate] = useState('')
    const [filterReqTime, setFilterReqTime] = useState('')
    const [filterAppDate, setFilterAppDate] = useState('')
    const [filterAppTime, setFilterAppTime] = useState('')

    const uniqueRequesters = useMemo(() => Array.from(new Set(historyData.map(r => r.requester))), [historyData])
    const uniqueModels = useMemo(() => Array.from(new Set(historyData.map(r => r.motorcycleModel))), [historyData])

    const filtered = useMemo(() =>
        historyData.filter((entry: HistoryItem) => {
            const q = search.toLowerCase()
            const matchSearch = !q ||
                entry.requester.toLowerCase().includes(q) ||
                entry.motorcycleModel.toLowerCase().includes(q) ||
                entry.licensePlate.toLowerCase().includes(q) ||
                `คำร้องขอเบิกที่ ${entry.id}`.includes(q)
            const matchStatus = !filterStatus || entry.status === filterStatus
            const matchRequester = !filterRequester || entry.requester === filterRequester
            const matchModel = !filterModel || entry.motorcycleModel === filterModel

            const plateParts = entry.licensePlate.split(' ')
            const plateLine1 = plateParts[0] || ''
            const plateLine2 = plateParts[1] || ''
            const province = plateParts.slice(2).join(' ') || ''

            const matchPlateLine1 = !filterPlateLine1 || plateLine1.includes(filterPlateLine1)
            const matchPlateLine2 = !filterPlateLine2 || plateLine2.includes(filterPlateLine2)
            const matchProvince = !filterProvince || province === filterProvince

            const reqParts = entry.requestedAt.split(' ')
            const reqDateStr = reqParts[0]
            const reqTimeStr = reqParts[1]
            let matchReqDate = true
            if (filterReqDate) {
                const [y, m, d] = filterReqDate.split('-')
                matchReqDate = reqDateStr === `${d}/${m}/${y}`
            }
            let matchReqTime = true
            if (filterReqTime) {
                matchReqTime = reqTimeStr.startsWith(filterReqTime)
            }

            const appParts = entry.approvedAt.split(' ')
            const appDateStr = appParts?.[0] || ''
            const appTimeStr = appParts?.[1] || ''
            let matchAppDate = true
            if (filterAppDate) {
                const [y, m, d] = filterAppDate.split('-')
                matchAppDate = appDateStr === `${d}/${m}/${y}`
            }
            let matchAppTime = true
            if (filterAppTime) {
                matchAppTime = appTimeStr.startsWith(filterAppTime)
            }

            return matchSearch && matchStatus && matchRequester && matchModel && matchPlateLine1 && matchPlateLine2 && matchProvince && matchReqDate && matchReqTime && matchAppDate && matchAppTime
        }),
        [search, filterStatus, filterRequester, filterModel, filterPlateLine1, filterPlateLine2, filterProvince, filterReqDate, filterReqTime, filterAppDate, filterAppTime, historyData]
    )

    return (
        <div className="p-6 bg-[#F5F5F5] min-h-full">
            {/* Search box & Filters Toggle */}
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex w-full items-center justify-between">
                    <div className="flex-1 max-w-2xl">
                        <SearchBox
                            value={search}
                            onChange={setSearch}
                            placeholder="ค้นหาประวัติ..."
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
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{filtered.length} รายการ</span>
                </div>

                {/* Filter row */}
                {showFilters && (
                    <div className="relative mt-2 p-5 bg-white rounded-xl border border-gray-200 shadow-md">
                        {/* Triangle pointer */}
                        <div className="absolute -top-[10px] right-[1270px] w-0 h-0 
                            border-l-[10px] border-l-transparent 
                            border-r-[10px] border-r-transparent 
                            border-b-[10px] border-b-white z-20" />
                        <div className="absolute -top-[12px] right-[1270px] w-0 h-0 
                            border-l-[10px] border-l-transparent 
                            border-r-[10px] border-r-transparent 
                            border-b-[12px] border-b-gray-200 z-10" />

                        <div className="relative z-30 flex flex-col gap-6">
                            {/* Row 1: Status, Requester, Model */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">สถานะ</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as HistoryStatus | '')}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="">ทั้งหมด</option>
                                        <option value="อนุมัติการเบิก">อนุมัติการเบิก</option>
                                        <option value="ไม่อนุมัติการเบิก">ไม่อนุมัติการเบิก</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">ผู้ทำเรื่องเบิก</label>
                                    <select
                                        value={filterRequester}
                                        onChange={(e) => setFilterRequester(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueRequesters.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">รุ่นรถ</label>
                                    <select
                                        value={filterModel}
                                        onChange={(e) => setFilterModel(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueModels.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Plate Line 1, Plate Line 2, Province */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">ป้ายทะเบียน (บรรทัดบน)</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น 1กข"
                                        value={filterPlateLine1}
                                        onChange={(e) => setFilterPlateLine1(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">ป้ายทะเบียน (บรรทัดล่าง)</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น 1234"
                                        value={filterPlateLine2}
                                        onChange={(e) => setFilterPlateLine2(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">จังหวัด</label>
                                    <select
                                        value={filterProvince}
                                        onChange={(e) => setFilterProvince(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {PROVINCES.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 3: Req Date, Req Time, App Date, App Time */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">วันที่ทำเรื่องขอเบิก</label>
                                    <input
                                        type="date"
                                        value={filterReqDate}
                                        onChange={(e) => setFilterReqDate(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">เวลาที่ทำเรื่องขอเบิก</label>
                                    <input
                                        type="time"
                                        value={filterReqTime}
                                        onChange={(e) => setFilterReqTime(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">วันที่ทำรายการ</label>
                                    <input
                                        type="date"
                                        value={filterAppDate}
                                        onChange={(e) => setFilterAppDate(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">เวลาที่ทำรายการ</label>
                                    <input
                                        type="time"
                                        value={filterAppTime}
                                        onChange={(e) => setFilterAppTime(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cards */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-16 text-sm">ไม่พบประวัติที่ค้นหา</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map((entry) => (
                        <div
                            key={entry.id}
                            onClick={() => navigate(`/inventory/history/${entry.id}`)}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group relative"
                        >
                            {/* Card header */}
                            <div className="flex items-stretch">
                                <div className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2.5 flex items-center rounded-br-xl shrink-0">
                                    คำร้องขอเบิกที่ {entry.id}
                                </div>
                                <div className="flex-1 flex items-center pl-3 pr-4">
                                    {entry.status === 'อนุมัติการเบิก' ? (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                                            อนุมัติการเบิก
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200">
                                            ไม่อนุมัติการเบิก
                                        </span>
                                    )}
                                    <span className="flex-1" />
                                    <span className="text-sm text-gray-400">
                                        {entry.approvedAt}
                                    </span>
                                </div>
                            </div>

                            {/* Card body */}
                            <div className="bg-white px-5 py-4 grid grid-cols-1 gap-y-2">
                                {/* Requester */}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#38bdf8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>
                                        <span className="text-gray-400">ผู้ทำเรื่องเบิก : </span>
                                        {entry.requester} ({entry.requesterRole})
                                    </span>
                                </div>

                                {/* Motorcycle model */}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg className="h-[14px] w-[14px] text-amber-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                        <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                        <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                    </svg>
                                    <span>
                                        <span className="text-gray-400">รุ่นรถ : </span>
                                        {entry.motorcycleModel}
                                    </span>
                                </div>

                                {/* License plate */}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
                                    </svg>
                                    <span>
                                        <span className="text-gray-400">ป้ายทะเบียน : </span>
                                        {entry.licensePlate}
                                    </span>
                                </div>

                                {/* Item count */}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>
                                        <span className="text-gray-400">รายการคำขอ : </span>
                                        {entry.items.length} รายการ ({entry.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)} ชิ้น)
                                    </span>
                                </div>

                                {/* Requested at */}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        <span className="text-gray-400">วันที่และเวลาที่ทำเรื่องขอเบิก : </span>
                                        {entry.requestedAt}
                                    </span>
                                </div>

                                {/* Hover text */}
                                <div className="absolute bottom-4 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md">
                                    <span>กดเพื่อดูรายละเอียด</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
