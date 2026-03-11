import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { partService } from '../../services/partService'
import { mockParts, type PartItem } from '../../data/partsMockData'

const CATEGORIES = Array.from(new Set(mockParts.map(p => p.category)))
const LOCATIONS = Array.from(new Set(mockParts.map(p => p.location)))
const MOTORCYCLE_MODELS = Array.from(new Set(mockParts.filter(p => p.motorcycleModel && p.motorcycleModel !== 'ทุกรุ่น').map(p => p.motorcycleModel!))).sort()

function PartModal({ part, onClose, onOrder }: { part: PartItem; onClose: () => void; onOrder: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const stockStatus =
    part.quantity === 0 ? { label: 'หมดสต็อก', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' } :
    part.quantity < 5  ? { label: 'เหลือน้อยมาก', dot: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50 border-red-200' } :
    part.quantity < 10 ? { label: 'ใกล้หมด', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' } :
                         { label: 'มีสต็อก', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <div className="flex">
          {/* Image */}
          <div className="w-52 shrink-0 bg-gray-50 flex items-center justify-center p-5 border-r border-gray-100">
            {!imageLoaded && <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-gray-300" />}
            <img
              src={part.imageUrl}
              alt={part.name}
              className={`w-full h-40 object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f8fafc/94a3b8.png?text=No+Image'; setImageLoaded(true) }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 leading-snug">{part.name}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{part.partCode}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
            </div>

            {/* Tags + Status */}
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${stockStatus.bg} ${stockStatus.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`}></span>
                {stockStatus.label}
              </span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">{part.category}</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">{part.motorcycleModel || 'ทุกรุ่น'}</span>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">ราคา/หน่วย</p>
                <p className="text-lg font-semibold text-gray-900">฿{part.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">คงเหลือ</p>
                <p className={`text-lg font-semibold ${part.quantity < 5 ? 'text-red-500' : part.quantity < 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                  {part.quantity} <span className="text-xs font-normal text-gray-400">ชิ้น</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">ตำแหน่งเก็บ</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{part.location}</p>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Action */}
            <button
              onClick={onOrder}
              className="flex items-center justify-center gap-2 w-full py-2 bg-[#1E1E1E] hover:bg-black text-white text-sm font-medium rounded-xl transition-colors"
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
  )
}

export default function PartsPage() {
  const navigate = useNavigate()
  const [parts, setParts] = useState<PartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedPart, setSelectedPart] = useState<PartItem | null>(null)

  const limit = 20
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)

  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterStockLevel, setFilterStockLevel] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { setCurrentPage(1) }, [debouncedSearch, filterCategory, filterLocation, filterModel, filterStockLevel])

  useEffect(() => {
    let isMounted = true
    const fetchParts = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const result = await partService.getParts({ page: currentPage, limit, search: debouncedSearch, category: filterCategory, location: filterLocation, motorcycleModel: filterModel, stockLevel: filterStockLevel })
        if (isMounted) { setParts(result.data); setTotalPages(result.totalPages); setTotalDocs(result.totalDocs) }
      } catch {
        if (isMounted) setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูลอะไหล่')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchParts()
    return () => { isMounted = false }
  }, [currentPage, debouncedSearch, filterCategory, filterLocation, filterModel, filterStockLevel, limit])

  return (
    <div className="p-6 bg-[#F5F5F5] h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 mb-4 flex flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <SearchBox value={search} onChange={setSearch} placeholder="ค้นหาชื่ออะไหล่ หรือรหัสสินค้า...">
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
          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">ผลลัพธ์ทั้งหมด {totalDocs} รายการ</span>
        </div>

        {showFilters && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">หมวดหมู่</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#F8981D]">
                  <option value="">ทั้งหมด</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ตำแหน่งที่ตั้ง</label>
                <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#F8981D]">
                  <option value="">ทั้งหมด</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">รุ่นรถ</label>
                <select value={filterModel} onChange={e => setFilterModel(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#F8981D]">
                  <option value="">ทุกรุ่น</option>
                  {MOTORCYCLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ปริมาณคงเหลือ</label>
                <select value={filterStockLevel} onChange={e => setFilterStockLevel(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#F8981D]">
                  <option value="">ทั้งหมด</option>
                  <option value="มีของ">มีของ (10 ชิ้นขึ้นไป)</option>
                  <option value="เหลือน้อย">เหลือน้อย (น้อยกว่า 10)</option>
                  <option value="ใกล้หมด">ใกล้หมด (น้อยกว่า 5)</option>
                  <option value="หมด">หมด</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {errorMsg && <div className="shrink-0 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{errorMsg}</div>}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F8981D]"></div>
          </div>
        ) : parts.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-gray-400 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm font-medium">ไม่พบรายการอะไหล่ที่ค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
            {parts.map((item) => (
              <div key={item.id} onClick={() => setSelectedPart(item)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#F8981D]/40 transition-all duration-200 group flex flex-col cursor-pointer hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img src={item.imageUrl} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/f8fafc/94a3b8.png?text=No+Image' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                    {item.quantity === 0 ? (
                      <span className="bg-red-500/95 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">หมด</span>
                    ) : item.quantity < 5 ? (
                      <span className="bg-orange-500/95 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm animate-pulse">เหลือน้อยมาก</span>
                    ) : item.quantity < 10 ? (
                      <span className="bg-amber-500/95 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">ใกล้หมด</span>
                    ) : null}
                  </div>
                </div>
                <div className="p-3.5 flex flex-col flex-1 bg-white">
                  <h3 className="text-[14px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-[#F8981D] transition-colors">
                    {item.name} <span className="text-[12px] text-gray-400 font-normal">({item.partCode})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50/80 border border-amber-100/50 px-1.5 py-0.5 rounded-md">{item.category.split(' ')[0]}</span>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-100/50 px-1.5 py-0.5 rounded-md">{item.motorcycleModel === 'ทุกรุ่น' || !item.motorcycleModel ? 'ทุกรุ่น' : item.motorcycleModel}</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/60 rounded-xl p-2.5 border border-gray-100/60 group-hover:bg-[#F8981D]/5 group-hover:border-[#F8981D]/20 transition-colors mt-auto">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold block mb-0.5">คงเหลือ</span>
                      <span className={`text-base font-bold leading-none ${item.quantity < 5 ? 'text-red-500' : item.quantity < 10 ? 'text-amber-500' : 'text-gray-800'}`}>{item.quantity}</span>
                      <span className="text-[10px] text-gray-400 ml-0.5">ชิ้น</span>
                    </div>
                    <div className="w-px h-7 bg-gray-200/60"></div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold block mb-0.5">ราคา/หน่วย</span>
                      <span className="text-sm font-bold text-gray-900">฿{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="shrink-0 pt-3 flex justify-center items-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#F8981D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${i + 1 === currentPage ? 'bg-[#F8981D] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#F8981D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      {/* Part Detail Modal */}
      {selectedPart && (
        <PartModal
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
          onOrder={() => navigate('/inventory/purchase-orders/create', { state: { prefillPart: selectedPart } })}
        />
      )}
    </div>
  )
}
