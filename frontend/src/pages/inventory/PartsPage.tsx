import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { partService } from '../../services/partService'
import { mockParts, type PartItem } from '../../data/partsMockData'

// Extract unique filter options from mock data (in real app, this would be an API call)
const CATEGORIES = Array.from(new Set(mockParts.map(p => p.category)))
const LOCATIONS = Array.from(new Set(mockParts.map(p => p.location)))
const MOTORCYCLE_MODELS = Array.from(new Set(mockParts.filter(p => p.motorcycleModel && p.motorcycleModel !== 'ทุกรุ่น').map(p => p.motorcycleModel!))).sort()

export default function PartsPage() {
  const navigate = useNavigate()
  const [parts, setParts] = useState<PartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Pagination
  const limit = 20
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterStockLevel, setFilterStockLevel] = useState('')

  // Use debounced search text to avoid rapid requests when typing
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filterCategory, filterLocation, filterModel, filterStockLevel])

  useEffect(() => {
    let isMounted = true
    const fetchParts = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const result = await partService.getParts({
          page: currentPage,
          limit,
          search: debouncedSearch,
          category: filterCategory,
          location: filterLocation,
          motorcycleModel: filterModel,
          stockLevel: filterStockLevel
        })

        if (isMounted) {
          setParts(result.data)
          setTotalPages(result.totalPages)
          setTotalDocs(result.totalDocs)
        }
      } catch (err) {
        if (isMounted) setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูลอะไหล่')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchParts()
    return () => { isMounted = false }
  }, [currentPage, debouncedSearch, filterCategory, filterLocation, filterModel, filterStockLevel, limit])

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col">
      {/* Header section with Search & Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="ค้นหาชื่ออะไหล่ หรือรหัสสินค้า..."
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
          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
            ผลลัพธ์ทั้งหมด {totalDocs} รายการ
          </span>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="relative mt-2 p-5 bg-white rounded-xl border border-gray-200 shadow-md">
            <div className="absolute -top-[10px] right-[1400px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white z-20" />
            <div className="absolute -top-[12px] right-[1400px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-gray-200 z-10" />

            <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">หมวดหมู่</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">ทั้งหมด</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ตำแหน่งที่ตั้ง</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">ทั้งหมด</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              {/* Motorcycle Model */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">รุ่นรถ</label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">ทุกรุ่น</option>
                  {MOTORCYCLE_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              {/* Stock Level */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ปริมาณคงเหลือ</label>
                <select
                  value={filterStockLevel}
                  onChange={(e) => setFilterStockLevel(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="มีของ">มีของ (คงเหลือ 10 ชิ้นขึ้นไป)</option>
                  <option value="เหลือน้อย">เหลือน้อย (คงเหลือน้อยกว่า 10 ชิ้น)</option>
                  <option value="ใกล้หมด">ใกล้หมด (คงเหลือน้อยกว่า 5 ชิ้น)</option>
                  <option value="หมด">หมด (คงเหลือ 0 ชิ้น)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
        </div>
      ) : parts.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center py-12 text-gray-400 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm font-medium">ไม่พบรายการอะไหล่ที่ค้นหา</p>
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 pb-4">
            {parts.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/inventory/parts/${item.id}`)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-amber-300 transition-all duration-300 group flex flex-col cursor-pointer hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/f8fafc/94a3b8.png?text=No+Image'
                    }}
                  />
                  {/* Fade overlay bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                    {item.quantity === 0 ? (
                      <span className="bg-red-500/95 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-red-400/20">
                        หมด
                      </span>
                    ) : item.quantity < 5 ? (
                      <span className="bg-orange-500/95 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm animate-pulse border border-orange-400/20">
                        เหลือน้อยมาก
                      </span>
                    ) : item.quantity < 10 ? (
                      <span className="bg-amber-500/95 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-amber-400/20">
                        ใกล้หมด
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Details Container */}
                <div className="p-4 flex flex-col flex-1 relative bg-white">
                  <div className="mb-3 flex-1 flex flex-col">
                    <h3 className="text-[15px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 transition-colors">
                      {item.name} <span className="text-[13px] text-gray-400 font-normal ml-1 whitespace-nowrap">({item.partCode})</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50/80 border border-amber-100/50 px-2 py-0.5 rounded-md">
                        {item.category.split(' ')[0]}
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-100/50 px-2 py-0.5 rounded-md">
                        {item.motorcycleModel === 'ทุกรุ่น' || !item.motorcycleModel ? 'รองรับทุกรุ่น' : `${item.motorcycleModel}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-gray-50">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate block" title={item.location}>
                        {item.location}
                      </span>
                    </div>

                    {/* Footer Stats block */}
                    <div className="flex items-center justify-between bg-gray-50/60 rounded-xl p-3 border border-gray-100/60 group-hover:bg-amber-50/40 group-hover:border-amber-100/60 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">คงเหลือ</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-bold leading-none ${item.quantity === 0 ? 'text-red-500' : item.quantity < 10 ? 'text-amber-500' : 'text-gray-800'}`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs text-gray-500 font-medium pb-0.5">ชิ้น</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-gray-200/60"></div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">ราคา/หน่วย</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-gray-900 leading-none">
                            ฿{item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && (
        <div className="mt-auto pt-4 pb-6 flex flex-col justify-center items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">
            หน้า {currentPage} จาก {totalPages} ({totalDocs} รายการ)
          </span>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-amber-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors disabled:cursor-not-allowed shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5 px-3">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[32px] h-[32px] flex items-center justify-center rounded-full text-sm font-medium transition-colors ${i + 1 === currentPage ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-amber-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors disabled:cursor-not-allowed shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
