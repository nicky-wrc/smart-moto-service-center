import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PartRequest } from '../../data/requestsMockData'
import { PROVINCES } from '../../data/provinces'
import SearchBox from '../../components/SearchBox'
import { useRequestHistory } from '../../contexts/RequestHistoryContext'
import { partRequisitionService } from '../../services/partRequisitionService'

export default function RequestsPage() {
  const navigate = useNavigate()
  const { history } = useRequestHistory()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterRequester, setFilterRequester] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterTime, setFilterTime] = useState('')
  const [filterPlateLine1, setFilterPlateLine1] = useState('')
  const [filterPlateLine2, setFilterPlateLine2] = useState('')
  const [filterProvince, setFilterProvince] = useState('')

  const [requestsData, setRequestsData] = useState<PartRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await partRequisitionService.getPendingRequests()
        if (isMounted) setRequestsData(data)
      } catch (error) {
        console.error("Failed to fetch pending requests:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()

    return () => { isMounted = false }
  }, [])

  const uniqueRequesters = useMemo(() => Array.from(new Set(requestsData.map(r => r.requester))), [requestsData])
  const uniqueModels = useMemo(() => Array.from(new Set(requestsData.map(r => r.motorcycleModel))), [requestsData])

  const filtered = requestsData.filter((req) => {
    // Check if the request is already in history
    if (history.some((h) => h.id === req.id)) {
      return false
    }

    const q = search.toLowerCase()
    const matchesSearch = !q || (
      req.requester.toLowerCase().includes(q) ||
      req.motorcycleModel.toLowerCase().includes(q) ||
      req.licensePlate.toLowerCase().includes(q) ||
      req.items.some((item) => item.partName.toLowerCase().includes(q)) ||
      `คำร้องขอเบิกที่${req.id}`.includes(q)
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

    // License plate "1กข 1234 กรุงเทพมหานคร"
    // split by space might yield: ["1กข", "1234", "กรุงเทพมหานคร"]
    const plateParts = req.licensePlate.split(' ')
    const plateLine1 = plateParts[0] || ''
    const plateLine2 = plateParts[1] || ''
    const province = plateParts.slice(2).join(' ') || ''

    const matchesPlateLine1 = !filterPlateLine1 || plateLine1.includes(filterPlateLine1)
    const matchesPlateLine2 = !filterPlateLine2 || plateLine2.includes(filterPlateLine2)
    const matchesProvince = !filterProvince || province === filterProvince

    return matchesSearch && matchesRequester && matchesModel && matchesDate && matchesTime && matchesPlateLine1 && matchesPlateLine2 && matchesProvince
  })

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col">
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
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${showFilters ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
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

            <div className="relative z-30 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ผู้ทำเรื่องเบิก</label>
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
                <label className="block text-sm font-medium text-gray-500 mb-1">รุ่นรถ</label>
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
                <label className="block text-sm font-medium text-gray-500 mb-1">วันที่</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">เวลา</label>
                <input
                  type="time"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              {/* New License Plate Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ป้ายทะเบียน (บรรทัดบน)</label>
                <input
                  type="text"
                  placeholder="เช่น 1กข"
                  value={filterPlateLine1}
                  onChange={(e) => setFilterPlateLine1(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ป้ายทะเบียน (บรรทัดล่าง)</label>
                <input
                  type="text"
                  placeholder="เช่น 1234"
                  value={filterPlateLine2}
                  onChange={(e) => setFilterPlateLine2(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">จังหวัด</label>
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
          </div>
        )}
      </div>

      {/* Request cards */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">ไม่พบรายการที่ค้นหา</p>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/inventory/requests/${req.id}`)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-sm transition-all group relative"
              >
                {/* Card header */}
                <div className="flex items-stretch">
                  <div className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2.5 flex items-center rounded-br-xl shrink-0">
                    คำร้องขอเบิกที่ {req.id}
                  </div>
                  <div className="flex-1 flex justify-end items-center pr-4">
                    <span className="text-sm text-gray-400">
                      {req.requestedAt}
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
                      <span className="text-gray-400">รายการคำขอ : </span>
                      {req.items.length} รายการ ({req.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
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
            )))}
        </div>
      </div>
    </div >
  )
}

