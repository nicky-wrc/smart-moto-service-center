import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockRequests } from '../../data/requestsMockData'
import SearchBox from '../../components/SearchBox'

export default function RequestsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterRequester, setFilterRequester] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterTime, setFilterTime] = useState('')

  const uniqueRequesters = useMemo(() => Array.from(new Set(mockRequests.map(r => r.requester))), [])
  const uniqueModels = useMemo(() => Array.from(new Set(mockRequests.map(r => r.motorcycleModel))), [])

  const filtered = mockRequests.filter((req) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || (
      req.requester.toLowerCase().includes(q) ||
      req.motorcycleModel.toLowerCase().includes(q) ||
      req.licensePlate.toLowerCase().includes(q) ||
      req.items.some((item) => item.partName.toLowerCase().includes(q)) ||
      `คำร้องขอเบิก #${req.id}`.includes(q)
    )

    const matchesRequester = !filterRequester || req.requester === filterRequester
    const matchesModel = !filterModel || req.motorcycleModel === filterModel

    // Parse requestedAt "01/03/2026 10:30 น."
    const reqParts = req.requestedAt.split(' ')
    const reqDateStr = reqParts[0] // DD/MM/YYYY
    const reqTimeStr = reqParts[1] // HH:MM

    let matchesDate = true
    if (filterDate) {
      const [year, month, day] = filterDate.split('-')
      const formattedFilterDate = `${day}/${month}/${year}`
      matchesDate = reqDateStr === formattedFilterDate
    }

    let matchesTime = true
    if (filterTime) {
      matchesTime = reqTimeStr.startsWith(filterTime)
    }

    return matchesSearch && matchesRequester && matchesModel && matchesDate && matchesTime
  })

  return (
    <div className="p-6">
      {/* Search box & Filters Toggle */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex w-full">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาในเบิก..."
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 ml-3 text-sm font-medium rounded-lg border transition-colors ${showFilters ? 'bg-amber-500 text-white border-amber-500 shadow-inner' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-amber-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              ตัวกรอง
            </button>
          </SearchBox>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">วันที่</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">เวลา</label>
              <input
                type="time"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Request cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">ไม่พบรายการที่ค้นหา</p>
        )}
        {filtered.map((req) => (
          <div
            key={req.id}
            onClick={() => navigate(`/inventory/requests/${req.id}`)}
            className="border border-amber-400 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div className="flex items-center justify-between bg-[#2C2A27] px-4 py-2">
              <span className="text-amber-400 font-semibold text-sm">คำร้องขอเบิก #{req.id}</span>
              <span className="text-gray-300 text-xs flex items-center gap-1">
                {/* Calendar icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {req.requestedAt}
              </span>
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
                  {req.requester} ({req.requesterRole})
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
                  {req.motorcycleModel}
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
                  {req.licensePlate}
                </span>
              </div>

              {/* Item count */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>
                  <span className="text-gray-400">รายการค้าขอ : </span>
                  {req.items.length} รายการ ({req.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div >
  )
}
