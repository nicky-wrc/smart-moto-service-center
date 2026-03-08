import { useState, useMemo } from 'react'
import { mockRequests } from '../../data/requestsMockData'
import SearchBox from '../../components/SearchBox'

type HistoryStatus = 'อนุมัติการเบิก' | 'ไม่อนุมัติการเบิก'

interface HistoryEntry {
    id: number
    requester: string
    requesterRole: string
    motorcycleModel: string
    licensePlate: string
    requestedAt: string
    approvedAt: string
    status: HistoryStatus
    items: typeof mockRequests[0]['items']
}

// Generate mock history from existing requests
const mockHistory: HistoryEntry[] = mockRequests.map((req, index) => ({
    id: req.id,
    requester: req.requester,
    requesterRole: req.requesterRole,
    motorcycleModel: req.motorcycleModel,
    licensePlate: req.licensePlate,
    requestedAt: req.requestedAt,
    approvedAt: `${String(index + 1).padStart(2, '0')}/03/2026 ${10 + index}:${String(index * 7 % 60).padStart(2, '0')} น.`,
    status: index % 3 === 2 ? 'ไม่อนุมัติการเบิก' : 'อนุมัติการเบิก',
    items: req.items,
}))

export default function HistoryPage() {
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<HistoryStatus | ''>('')

    const filtered = useMemo(() =>
        mockHistory.filter((entry) => {
            const q = search.toLowerCase()
            const matchSearch = !q ||
                entry.requester.toLowerCase().includes(q) ||
                entry.motorcycleModel.toLowerCase().includes(q) ||
                entry.licensePlate.toLowerCase().includes(q) ||
                `คำร้องขอเบิกที่ ${entry.id}`.includes(q)
            const matchStatus = !filterStatus || entry.status === filterStatus
            return matchSearch && matchStatus
        }),
        [search, filterStatus]
    )

    return (
        <div className="p-6 bg-[#F5F5F5] min-h-full">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <SearchBox
                        value={search}
                        onChange={setSearch}
                        placeholder="ค้นหาประวัติ..."
                    />

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as HistoryStatus | '')}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                        <option value="">สถานะทั้งหมด</option>
                        <option value="อนุมัติการเบิก">อนุมัติการเบิก</option>
                        <option value="ไม่อนุมัติการเบิก">ไม่อนุมัติการเบิก</option>
                    </select>
                </div>

                <span className="text-sm text-gray-500">{filtered.length} รายการ</span>
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-16 text-sm">ไม่พบประวัติที่ค้นหา</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-all"
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
                                        {entry.items.length} รายการ ({entry.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
                                    </span>
                                </div>

                                {/* Requested at */}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        <span className="text-gray-400">เวลาที่ทำเรื่องขอ : </span>
                                        {entry.requestedAt}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
