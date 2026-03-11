import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { purchaseOrderService, type POStatus } from '../../services/purchaseOrderService'
import { supplierService, type Supplier } from '../../services/supplierService'
import type { PurchaseOrder } from '../../data/purchaseOrdersMockData'

const StatusBadge = ({ status }: { status: POStatus }) => {
  switch (status) {
    case 'draft':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>แบบร่าง</span>
    case 'pending':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-amber-50 text-amber-600 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>รออนุมัติ</span>
    case 'approved':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>อนุมัติแล้ว</span>
    case 'rejected':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-red-50 text-red-600 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>ไม่อนุมัติ</span>
    case 'cancelled':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>ยกเลิกแล้ว</span>
  }
}

export default function PurchaseOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showListFilters, setShowListFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(
    () => sessionStorage.getItem('po_last_visited')
  )
  
  const [unreadStatusChanges, setUnreadStatusChanges] = useState<Record<string, 'approved' | 'rejected'>>(() => {
    try {
      const saved = localStorage.getItem('po_unread_status_changes')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    Promise.all([
      purchaseOrderService.getAll(),
      supplierService.getAll(),
    ]).then(([posResult, suppliersResult]) => {
      if (!mounted) return
      setOrders(posResult.data)
      setSuppliers(suppliersResult)
    }).catch(console.error).finally(() => {
      if (mounted) setIsLoading(false)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    localStorage.setItem('po_unread_status_changes', JSON.stringify(unreadStatusChanges))
  }, [unreadStatusChanges])

  useEffect(() => {
    const id = sessionStorage.getItem('po_last_visited')
    if (id) {
      setActiveRowId(id)
      const timer = setTimeout(() => {
        setActiveRowId(null)
        sessionStorage.removeItem('po_last_visited')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const markVisited = (id: string) => {
    sessionStorage.setItem('po_last_visited', id)
    setActiveRowId(id)
    setUnreadStatusChanges((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterStatus && order.status !== filterStatus) return false
      if (filterDate && order.createdAt !== filterDate) return false
      if (filterSupplier && order.supplierId.toString() !== filterSupplier) return false
      return true
    })
    
    return filtered.sort((a, b) => {
      const aHasUnread = a.id in unreadStatusChanges
      const bHasUnread = b.id in unreadStatusChanges
      if (aHasUnread === bHasUnread) {
        return b.id.localeCompare(a.id)
      }
      return aHasUnread ? -1 : 1
    })
  }, [orders, searchQuery, filterStatus, filterDate, filterSupplier, unreadStatusChanges])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <button
              onClick={() => setShowListFilters(!showListFilters)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full border transition-colors ${showListFilters ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              ตัวกรอง
            </button>
            <div className="flex-1">
              <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="ค้นหารหัสใบสั่งซื้อ..." />
            </div>
          </div>
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

        {showListFilters && (
          <div className="relative mt-2 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="relative z-30 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">สถานะใบสั่งซื้อ</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  <option value="">ทั้งหมด</option>
                  <option value="draft">แบบร่าง</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                  <option value="cancelled">ยกเลิกแล้ว</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">วันที่สร้างใบสั่งซื้อ</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ซัพพลายเออร์</label>
                <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  <option value="">ทั้งหมด</option>
                  {suppliers.map((s: Supplier) => (
                    <option key={s.id} value={s.id}>{(s as any).companyName || s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีใบสั่งซื้อ</h3>
            <p className="text-gray-500 max-w-sm">เริ่มทำการสั่งซื้ออะไหล่โดยการกดปุ่ม "สร้างใบคำสั่งซื้อ"</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <table className="w-full text-sm text-center">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f8fafc] text-gray-600 border-b border-gray-200 font-medium">
                  <th className="py-4 px-6 text-left font-medium">เลขที่ใบสั่งซื้อ</th>
                  <th className="py-4 px-6 text-left font-medium">ซัพพลายเออร์</th>
                  <th className="py-4 px-6 font-medium">วันที่สร้าง</th>
                  <th className="py-4 px-6 font-medium">วันที่ต้องการของ</th>
                  <th className="py-4 px-6 text-right font-medium">ยอดรวม</th>
                  <th className="py-4 px-6 font-medium">สถานะ</th>
                  <th className="py-4 px-6 font-medium text-left">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((order) => {
                  const unreadStatus = unreadStatusChanges[order.id]
                  const bgColor = unreadStatus === 'approved' 
                    ? 'bg-green-50/70' 
                    : unreadStatus === 'rejected' 
                    ? 'bg-red-50/70' 
                    : ''
                  
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50/80 transition-colors ${bgColor}`}
                      style={activeRowId === order.id ? { backgroundColor: '#F5F5F5' } : {}}
                    >
                      <td className="py-4 px-6 text-left font-medium text-gray-900">{order.id}</td>
                      <td className="py-4 px-6 text-left">{order.supplierName}</td>
                      <td className="py-4 px-6">{order.createdAt}</td>
                      <td className="py-4 px-6">{order.deliveryDate}</td>
                      <td className="py-4 px-6 text-right font-medium">฿{order.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-6"><StatusBadge status={order.status} /></td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-start gap-2">
                        <button
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[#255B91] hover:bg-[#1a3f66] text-white rounded transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                          onClick={() => { markVisited(order.id); navigate(`/inventory/purchase-orders/${order.id}`) }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          ดูรายละเอียด
                        </button>
                        {order.status === 'draft' && (
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                            onClick={() => { markVisited(order.id); navigate(`/inventory/purchase-orders/edit/${order.id}`) }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            แก้ไข
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                            onClick={() => { markVisited(order.id); setCancelModalOrderId(order.id) }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ยกเลิกออเดอร์
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setCancelModalOrderId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-widest mb-0.5">Smart Moto Service Center</p>
              <h2 className="text-base font-semibold text-[#1E1E1E]">ยืนยันการยกเลิกคำขอสั่งซื้อ</h2>
            </div>
            <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#fee2e2]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1a202c]">ยืนยันการทำรายการนี้หรือไม่?</h3>
                  <p className="text-sm text-gray-500 mt-1 px-4">โปรดตรวจสอบรายละเอียดก่อนทำการยกเลิก<br />หลังจากการยกเลิกจะไม่สามารถกู้คืนได้</p>
                </div>
              </div>
            </div>
            <div className="flex border-t border-gray-100 shrink-0">
              <button onClick={() => setCancelModalOrderId(null)} className="flex-1 py-4 text-sm text-gray-500 hover:bg-gray-50 font-medium transition-colors border-r border-gray-100">ยกเลิก</button>
              <button
                onClick={() => {
                  setOrders(prev => prev.map(o => o.id === cancelModalOrderId ? { ...o, status: 'cancelled' as const } : o))
                  if (cancelModalOrderId) {
                    purchaseOrderService.updateStatus(cancelModalOrderId, 'cancelled').catch(console.error)
                  }
                  setCancelModalOrderId(null)
                }}
                className="flex-1 py-4 text-sm font-semibold text-white transition-colors border-none bg-[#44403C] hover:bg-black cursor-pointer"
              >ใช่ ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
