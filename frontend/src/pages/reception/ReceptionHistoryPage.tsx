import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { getReceptionHistory, type ReceptionHistoryEntry, type ReceptionActivityType } from '../../utils/receptionHistory'

// ─── Types ───────────────────────────────────────────────────────────────────

// Re-export types for backward compatibility
export type { ReceptionActivityType, ReceptionHistoryEntry }

// ─── Mock Data (for fallback) ────────────────────────────────────────────────

const MOCK_HISTORY: ReceptionHistoryEntry[] = [
    {
        id: 'RH-001',
        activityType: 'แจ้งซ่อมครั้งแรก',
        firstName: 'สมชาย', lastName: 'ใจดี',
        phone: '0812345678',
        model: 'Honda Wave 110i', color: 'แดง',
        plateLine1: '1กข', plateLine2: '1234', province: 'กรุงเทพมหานคร',
        symptoms: 'เครื่องยนต์ดับบ่อย น้ำมันรั่ว',
        tags: ['เครื่องยนต์', 'เชื้อเพลิง'],
        createdAt: '10/03/2569 09:15',
    },
    {
        id: 'RH-002',
        activityType: 'ลงทะเบียนใหม่',
        firstName: 'สมหญิง', lastName: 'รักดี',
        phone: '0898765432',
        model: 'Honda PCX 160', color: 'ดำ',
        plateLine1: '5ขด', plateLine2: '999', province: 'กรุงเทพมหานคร',
        createdAt: '10/03/2569 10:00',
    },
    {
        id: 'RH-003',
        activityType: 'แจ้งซ่อมรถที่มีในระบบ',
        firstName: 'วิชัย', lastName: 'กล้าหาญ',
        phone: '0855555555',
        model: 'Honda Click 125i', color: 'ขาว',
        plateLine1: '3งจ', plateLine2: '9012', province: 'ภูเก็ต',
        symptoms: 'เบรกหลังไม่ค่อยจับ',
        tags: ['เบรก', 'ช่วงล่าง'],
        createdAt: '10/03/2569 11:30',
    },
    {
        id: 'RH-004',
        activityType: 'แจ้งซ่อมรถคันใหม่',
        firstName: 'มานี', lastName: 'มีนา',
        phone: '0888888888',
        model: 'Vespa Sprint 150', color: 'เหลือง',
        plateLine1: '4ฉช', plateLine2: '3456', province: 'ขอนแก่น',
        symptoms: 'ไฟหน้าไม่ติด สายไฟขาด',
        tags: ['ไฟฟ้า'],
        createdAt: '10/03/2569 13:45',
    },
    {
        id: 'RH-005',
        activityType: 'แจ้งซ่อมครั้งแรก',
        firstName: 'ประสิทธิ์', lastName: 'ชนะภัย',
        phone: '0871234567',
        model: 'Yamaha NMAX 155', color: 'น้ำเงิน',
        plateLine1: '2คค', plateLine2: '5500', province: 'เชียงใหม่',
        symptoms: 'เกียร์ไม่ยอมเปลี่ยน มีเสียงดังตอนออกตัว',
        tags: ['ส่งกำลัง'],
        createdAt: '10/03/2569 14:20',
    },
]

// ─── Status Config ────────────────────────────────────────────────────────────

// ─── Auto tags from activity type ────────────────────────────────────────────

function getActivityTags(activityType: ReceptionActivityType): string[] {
    switch (activityType) {
        case 'ลงทะเบียนใหม่': return ['ลูกค้าใหม่', 'ลงทะเบียนใหม่']
        case 'แจ้งซ่อมครั้งแรก': return ['ลูกค้าใหม่', 'แจ้งซ่อมครั้งแรก']
        case 'แจ้งซ่อมรถที่มีในระบบ': return ['ลูกค้าเก่า', 'แจ้งซ่อมรถที่มีในระบบ']
        case 'แจ้งซ่อมรถคันใหม่': return ['ลูกค้าเก่า', 'แจ้งซ่อมรถคันใหม่']
    }
}

const ACTIVITY_TAG_COLORS: Record<string, string> = {
    'ลูกค้าใหม่': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'ลงทะเบียนใหม่': 'bg-gray-100 text-gray-700 border-gray-200',
    'แจ้งซ่อมครั้งแรก': 'bg-gray-100 text-gray-700 border-gray-200',
    'ลูกค้าเก่า': 'bg-amber-100  text-amber-700  border-amber-200',
    'แจ้งซ่อมรถที่มีในระบบ': 'bg-gray-100 text-gray-700 border-gray-200',
    'แจ้งซ่อมรถคันใหม่': 'bg-gray-100 text-gray-700 border-gray-200',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReceptionHistoryPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filterName, setFilterName] = useState('')
    const [filterPhone, setFilterPhone] = useState('')
    const [filterPlate, setFilterPlate] = useState('')
    const [filterModel, setFilterModel] = useState('')
    const [filterActivity, setFilterActivity] = useState<ReceptionActivityType | ''>('')

    // Merge loaded history with mock data
    const allHistory = useMemo(() => {
        const loadedHistory = getReceptionHistory()
        return [...loadedHistory, ...MOCK_HISTORY]
    }, []) // Empty dependency array means this only runs once on mount

    const filtered = useMemo(() => {
        return allHistory.filter(entry => {
            const q = search.toLowerCase()
            const fullName = `${entry.firstName} ${entry.lastName}`
            const plate = `${entry.plateLine1} ${entry.plateLine2} ${entry.province}`

            const matchSearch = !q ||
                fullName.toLowerCase().includes(q) ||
                entry.phone.includes(q) ||
                plate.toLowerCase().includes(q) ||
                entry.model.toLowerCase().includes(q)

            const matchName = !filterName || fullName.toLowerCase().includes(filterName.toLowerCase())
            const matchPhone = !filterPhone || entry.phone.includes(filterPhone)
            const matchPlate = !filterPlate || plate.toLowerCase().includes(filterPlate.toLowerCase())
            const matchModel = !filterModel || entry.model.toLowerCase().includes(filterModel.toLowerCase())
            const matchActivity = !filterActivity || entry.activityType === filterActivity

            return matchSearch && matchName && matchPhone && matchPlate && matchModel && matchActivity
        })
    }, [search, filterName, filterPhone, filterPlate, filterModel, filterActivity, allHistory])

    return (
        <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col">
            {/* Search & Filter Toggle */}
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex w-full items-center justify-between">
                    <div className="flex-1 max-w-2xl">
                        <SearchBox
                            value={search}
                            onChange={setSearch}
                            placeholder="ค้นหาชื่อ, เบอร์, ป้ายทะเบียน, รุ่นรถ..."
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
                            {/* Row 2: Model, Status */}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">สถานะ / ประเภทรายการ</label>
                                    <select
                                        value={filterActivity}
                                        onChange={e => setFilterActivity(e.target.value as ReceptionActivityType | '')}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="">ทั้งหมด</option>
                                        <optgroup label="ลูกค้าใหม่">
                                            <option value="ลงทะเบียนใหม่">ลงทะเบียนใหม่</option>
                                            <option value="แจ้งซ่อมครั้งแรก">แจ้งซ่อมครั้งแรก</option>
                                        </optgroup>
                                        <optgroup label="ลูกค้าเก่า">
                                            <option value="แจ้งซ่อมรถที่มีในระบบ">แจ้งซ่อมรถที่มีในระบบ</option>
                                            <option value="แจ้งซ่อมรถคันใหม่">แจ้งซ่อมรถคันใหม่</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-16 text-sm">ไม่พบประวัติที่ค้นหา</p>
            ) : (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <div className="flex flex-col gap-4">
                        {filtered.map(entry => {
                            const plate = `${entry.plateLine1} ${entry.plateLine2} ${entry.province}`
                            const activityTags = getActivityTags(entry.activityType)
                            const hasRepairInfo = entry.activityType !== 'ลงทะเบียนใหม่'
                            
                            // Extract queue number from ID (e.g., "RH-009-1773169600006" -> "009")
                            const queueNumber = entry.id.split('-')[1] || entry.id

                            return (
                                <div
                                    key={entry.id}
                                    onClick={() => navigate(`/reception/history/${entry.id}`)}
                                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-stretch">
                                        <div className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2.5 flex items-center rounded-br-xl shrink-0">
                                            ลำดับการรับบริการที่ {queueNumber}
                                        </div>
                                        <div className="flex-1 flex items-center pl-3 pr-4 gap-2">
                                            {activityTags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className={`text-xs font-semibold px-2.5 py-1 border rounded-full ${ACTIVITY_TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            <span className="flex-1" />
                                            <span className="text-sm text-gray-400 flex items-center gap-1.5">
                                                {entry.createdAt}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body — 2-column, always equal structure */}
                                    <div className="flex divide-x divide-gray-100 min-h-[130px]">

                                        {/* Left: Customer & Vehicle Info */}
                                        <div className="flex-1 px-5 py-4 flex flex-col gap-1.5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ข้อมูลลูกค้า / รถ</p>

                                            {/* Name */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span><span className="text-gray-400">ชื่อ : </span>{entry.firstName} {entry.lastName}</span>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span><span className="text-gray-400">เบอร์โทร : </span>{entry.phone}</span>
                                            </div>

                                            {/* Model + Color */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg className="h-[14px] w-[14px] text-amber-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                                    <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                                    <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                                </svg>
                                                <span>
                                                    <span className="text-gray-400">รุ่นรถ : </span>
                                                    {entry.model}
                                                    <span className="text-gray-400 ml-1">({entry.color})</span>
                                                </span>
                                            </div>

                                            {/* Plate */}
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
                                                </svg>
                                                <span><span className="text-gray-400">ป้ายทะเบียน : </span>{plate}</span>
                                            </div>
                                        </div>

                                        {/* Right: Symptoms + Tags */}
                                        <div className="flex-1 px-5 py-4 flex flex-col gap-2">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">อาการ</p>

                                            {hasRepairInfo && entry.symptoms ? (
                                                <>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{entry.symptoms}</p>
                                                    
                                                    {/* Image attachment status */}
                                                    <div className="flex items-center gap-1.5 text-xs mt-1">
                                                        {entry.images && entry.images.length > 0 ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="text-green-600 font-medium">แนบรูปภาพแล้ว ({entry.images.length} รูป)</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="text-gray-400">ไม่มีรูปภาพแนบ</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Symptom tags (repair categories) */}
                                                    {entry.tags && entry.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                                            {entry.tags.map(tag => (
                                                                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-300 italic">ไม่มีการแจ้งซ่อม</p>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

