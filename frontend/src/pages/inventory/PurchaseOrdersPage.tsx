import { useState, useMemo } from 'react'
import { mockSuppliers } from '../../data/suppliersMockData'
import PartSelectionModal from '../../components/PartSelectionModal'
import { type PartItem } from '../../data/partsMockData'
import SearchBox from '../../components/SearchBox'

interface OrderItem extends PartItem {
  orderQuantity: number
}

// Generate today's date formatted for display and input
const getTodayString = () => {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// Generate tomorrow's date
const getTomorrowString = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function PurchaseOrdersPage() {
  const [isCreating, setIsCreating] = useState(false)

  // Form State
  const [supplierId, setSupplierId] = useState<number | ''>('')
  const [deliveryDate, setDeliveryDate] = useState(getTomorrowString())
  const [remarks, setRemarks] = useState('')

  // List Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [showListFilters, setShowListFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')

  // Items State
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Derived values
  const totalAmount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.orderQuantity), 0)
  }, [orderItems])

  // Handlers
  const handleAddPart = (part: PartItem) => {
    setOrderItems(prev => {
      const existing = prev.find(p => p.id === part.id)
      if (existing) {
        // If already added, increase quantity by 1
        return prev.map(p => p.id === part.id ? { ...p, orderQuantity: p.orderQuantity + 1 } : p)
      }
      return [...prev, { ...part, orderQuantity: 1 }]
    })
    setIsModalOpen(false) // Optionally close after selection, or keep open. Closing for better flow.
  }

  const handleUpdateQuantity = (id: number, qty: number) => {
    if (qty < 1) return
    setOrderItems(prev => prev.map(p => p.id === id ? { ...p, orderQuantity: qty } : p))
  }

  const handleRemoveItem = (id: number) => {
    setOrderItems(prev => prev.filter(p => p.id !== id))
  }

  const handleCancel = () => {
    if (orderItems.length > 0 && !window.confirm('คุณมีรายการสินค้าที่เลือกไว้ ต้องการยกเลิกการสร้างใบสั่งซื้อใช่หรือไม่?')) {
      return
    }
    resetForm()
    setIsCreating(false)
  }

  const resetForm = () => {
    setSupplierId('')
    setDeliveryDate(getTomorrowString())
    setRemarks('')
    setOrderItems([])
  }

  const handleSubmit = (action: 'draft' | 'submit') => {
    if (!supplierId) {
      alert('กรุณาเลือกซัพพลายเออร์')
      return
    }
    if (orderItems.length === 0) {
      alert('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')
      return
    }
    // Mock success
    alert(action === 'draft' ? 'บันทึกเป็นแบบร่างสำเร็จ!' : 'ส่งคำขอสั่งซื้อสำเร็จ!')
    resetForm()
    setIsCreating(false)
  }

  // MAIN LIST RENDER
  if (!isCreating) {
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
              onClick={() => setIsCreating(true)}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 group"
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
          <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีใบสั่งซื้อ</h3>
          <p className="text-gray-500 max-w-sm">เริ่มทำการสั่งซื้ออะไหล่โดยการกดปุ่ม "สร้างใบคำสั่งซื้อ"</p>
        </div>
      </div>
    )
  }

  // CREATE FORM RENDER
  return (
    <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col gap-6">

      {/* Header / Title */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">สร้างใบสั่งซื้อใหม่ (PO)</h2>
            <p className="text-sm text-gray-500">ระบุรายละเอียดการสั่งซื้อและเพิ่มรายการสินค้า</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">วันที่สร้างรายการ</div>
          <div className="font-semibold text-gray-800">{new Date().toLocaleDateString('th-TH')}</div>
        </div>
      </div>

      {/* Form Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 xl:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">ซัพพลายเออร์ที่ต้องการสั่งซื้อ <span className="text-red-500">*</span></label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(Number(e.target.value) || '')}
            className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">-- เลือกซัพพลายเออร์ --</option>
            {mockSuppliers.map(s => (
              <option key={s.id} value={s.id}>{s.companyName} ({s.contactName})</option>
            ))}
          </select>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่สั่งซื้อ (Order Date)</label>
          <input
            type="date"
            value={getTodayString()}
            disabled
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่ต้องการรับ <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={deliveryDate}
            min={getTomorrowString()}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 xl:col-span-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">หมายเหตุ / ข้อความถึงซัพพลายเออร์</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="ระบุหมายเหตุ เช่น ขอส่งด่วนเช้า, ส่งที่โกดัง 2..."
            className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 min-h-[80px]"
          ></textarea>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            รายการสินค้าที่สั่งซื้อ
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-transparent border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มสินค้า
          </button>
        </div>

        {orderItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <div className="w-16 h-16 mb-3 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">ยังไม่มีสินค้าในใบสั่งซื้อ</p>
            <p className="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่มสินค้า" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">รูปสินค้า</th>
                  <th className="py-3 px-4 border-r border-gray-200">รหัส/ชื่อสินค้า</th>
                  <th className="py-3 px-4 text-right">ราคาต่อหน่วย</th>
                  <th className="py-3 px-4 text-center">จำนวนสั่ง</th>
                  <th className="py-3 px-4 text-right">จำนวนเงิน (Subtotal)</th>
                  <th className="py-3 px-4 w-16 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden border border-gray-200">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=No+Img'
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-100">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.partCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700 font-medium">
                      ฿{item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.orderQuantity}
                        onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                        className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-semibold text-amber-700 bg-amber-50/50"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800">
                      ฿{(item.price * item.orderQuantity).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors mx-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={5} className="py-4 px-5 text-right font-bold text-gray-700 text-base">ราคารวมทั้งหมด (Total):</td>
                  <td className="py-4 px-4 text-right font-bold text-amber-600 text-lg">
                    ฿{totalAmount.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4 mb-8">
        <button
          onClick={handleCancel}
          className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          onClick={() => handleSubmit('draft')}
          className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          บันทึกเป็นแบบร่าง
        </button>
        <button
          onClick={() => handleSubmit('submit')}
          className="px-8 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          ส่งคำขอสั่งซื้อ
        </button>
      </div>

      <PartSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPart={handleAddPart}
      />
    </div>
  )
}
