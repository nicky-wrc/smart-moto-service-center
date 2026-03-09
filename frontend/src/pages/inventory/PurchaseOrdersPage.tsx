import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockSuppliers } from '../../data/suppliersMockData'
import SearchBox from '../../components/SearchBox'

export default function PurchaseOrdersPage() {
  const navigate = useNavigate()

  // List Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [showListFilters, setShowListFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')

  // MAIN LIST RENDER
  return (
    <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col">
      {/* Header section with Search & Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            {/* Filter Button */}
            <button
              onClick={() => setShowListFilters(!showListFilters)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full border transition-colors ${showListFilters ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              ตัวกรอง
            </button>

            {/* Search Box */}
            <div className="flex-1">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ค้นหารหัสใบสั่งซื้อ..."
              />
            </div>
          </div>

          {/* Create Button (Far Right) */}
          <button
            onClick={() => navigate('/inventory/purchase-orders/create')}
            className="[text-shadow:_0_1px_0_rgb(0_0_0_/_50%)] shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            สร้างใบคำสั่งซื้อ
          </button>
        </div>

        {/* Filter row */}
        {showListFilters && (
          <div className="relative mt-2 p-5 bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="absolute -top-[10px] left-[35px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white z-20" />
            <div className="absolute -top-[12px] left-[35px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-gray-200 z-10" />

            <div className="relative z-30 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">สถานะใบสั่งซื้อ</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="draft">แบบร่าง</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">วันที่สร้างใบสั่งซื้อ</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ซัพพลายเออร์</label>
                <select
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">ทั้งหมด</option>
                  {mockSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.companyName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีใบสั่งซื้อ</h3>
        <p className="text-gray-500 max-w-sm">เริ่มทำการสั่งซื้ออะไหล่โดยการกดปุ่ม "สร้างใบคำสั่งซื้อ"</p>
      </div>
    </div>
  )
}

