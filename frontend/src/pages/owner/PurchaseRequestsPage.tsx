import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/api'

interface BackendPO {
  id: number
  poNo: string
  status: string
  totalAmount: string | number
  notes?: string
  createdAt: string
  expectedDate?: string
  supplier?: { id: number; name: string }
  createdBy?: { id: number; name: string }
  approvedBy?: { id: number; name: string }
  items: Array<{
    id: number
    quantity: number
    unitPrice: string | number
    totalPrice: string | number
    part?: { id: number; partNo: string; name: string }
  }>
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'cancelled'

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'รออนุมัติ',
  ORDERED: 'อนุมัติแล้ว',
  APPROVED: 'อนุมัติแล้ว',
  CANCELLED: 'ปฏิเสธ',
  DRAFT: 'แบบร่าง',
  COMPLETED: 'เสร็จสิ้น',
}

const STATUS_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  PENDING_APPROVAL: { color: 'text-[#F8981D]', bg: 'bg-[#F8981D]/10', dot: 'bg-[#F8981D]' },
  ORDERED: { color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  APPROVED: { color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  CANCELLED: { color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400' },
  DRAFT: { color: 'text-stone-500', bg: 'bg-stone-100', dot: 'bg-stone-400' },
  COMPLETED: { color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400' },
}

const FILTER_TO_STATUSES: Record<FilterStatus, string[] | undefined> = {
  all: undefined,
  pending: ['PENDING_APPROVAL'],
  approved: ['ORDERED', 'APPROVED', 'COMPLETED'],
  cancelled: ['CANCELLED'],
}

export default function PurchaseRequestsPage() {
  const navigate = useNavigate()
  const [pos, setPos] = useState<BackendPO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const fetchPOs = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<BackendPO[]>('/purchase-orders')
      setPos(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to fetch POs', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPOs() }, [])

  const filtered = useMemo(() => {
    const allowedStatuses = FILTER_TO_STATUSES[filterStatus]
    return pos.filter(po => {
      if (allowedStatuses && !allowedStatuses.includes(po.status)) return false
      if (search) {
        const q = search.toLowerCase()
        const matchPo = po.poNo?.toLowerCase().includes(q)
        const matchSupplier = po.supplier?.name?.toLowerCase().includes(q)
        if (!matchPo && !matchSupplier) return false
      }
      return true
    })
  }, [pos, filterStatus, search])

  const pendingCount = pos.filter(p => p.status === 'PENDING_APPROVAL').length
  const approvedCount = pos.filter(p => p.status === 'ORDERED' || p.status === 'APPROVED').length
  const cancelledCount = pos.filter(p => p.status === 'CANCELLED').length

  const handleApprove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await apiClient.patch(`/purchase-orders/${id}/approve`, {})
      setPos(prev => prev.map(p => p.id === id ? { ...p, status: 'ORDERED' } : p))
    } catch (err) {
      console.error('Failed to approve PO', err)
      alert('ไม่สามารถอนุมัติได้ กรุณาลองใหม่')
    }
  }

  const handleRejectOpen = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setRejectingId(id)
    setRejectNote('')
  }

  const handleRejectConfirm = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await apiClient.patch(`/purchase-orders/${id}/cancel`, {})
      setPos(prev => prev.map(p => p.id === id ? { ...p, status: 'CANCELLED' } : p))
    } catch (err) {
      console.error('Failed to cancel PO', err)
      alert('ไม่สามารถปฏิเสธได้ กรุณาลองใหม่')
    }
    setRejectingId(null)
    setRejectNote('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'pending', label: 'รออนุมัติ' },
    { key: 'approved', label: 'อนุมัติแล้ว' },
    { key: 'cancelled', label: 'ปฏิเสธ' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">
      <div className="shrink-0 p-6 pb-0 flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#44403C] rounded-2xl p-5">
            <div className="text-sm text-stone-300 mb-1">รออนุมัติ</div>
            <div className="text-3xl font-bold text-white">{pendingCount}</div>
            <div className="text-xs text-stone-400 mt-1">รายการ</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="text-sm text-stone-400 mb-1">อนุมัติแล้ว</div>
            <div className="text-3xl font-bold">{approvedCount}</div>
            <div className="text-xs text-stone-400 mt-1">รายการ</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="text-sm text-stone-400 mb-1">ปฏิเสธ</div>
            <div className="text-3xl font-bold">{cancelledCount}</div>
            <div className="text-xs text-stone-400 mt-1">รายการ</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาเลขใบสั่งซื้อ / ซัพพลายเออร์..."
              className="w-full bg-white border border-stone-200 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors" />
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2 shrink-0">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-colors ${filterStatus === f.key ? 'bg-[#44403C] text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center text-stone-400">ไม่มีรายการ</div>
        )}
        {filtered.map(po => {
          const sc = STATUS_STYLE[po.status] || STATUS_STYLE['DRAFT']
          const label = STATUS_LABEL[po.status] || po.status
          const total = Number(po.totalAmount) || 0
          const isRejecting = rejectingId === po.id
          const createdDate = po.createdAt ? new Date(po.createdAt).toLocaleDateString('th-TH') : '-'
          const expectedDate = po.expectedDate ? new Date(po.expectedDate).toLocaleDateString('th-TH') : '-'
          return (
            <div key={po.id} className="bg-white rounded-2xl border border-stone-200 p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#1E1E1E]">{po.poNo}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <span>ขอโดย <span className="font-medium text-stone-700">{po.createdBy?.name || '-'}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-stone-700">{po.supplier?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>วันที่สร้าง <span className="font-medium text-stone-700">{createdDate}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>ต้องการรับ <span className="font-medium text-stone-700">{expectedDate}</span></span>
                    </div>
                  </div>
                  {po.notes && <p className="text-sm text-stone-400 line-clamp-1">{po.notes}</p>}
                  {po.approvedBy && (
                    <div className="text-sm text-stone-400">
                      {po.status === 'ORDERED' ? 'อนุมัติ' : 'ดำเนินการ'}โดย <span className="font-medium text-stone-500">{po.approvedBy.name}</span>
                    </div>
                  )}
                  {isRejecting && (
                    <div className="flex flex-col gap-2 mt-1" onClick={e => e.stopPropagation()}>
                      <textarea autoFocus value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                        placeholder="ระบุเหตุผลการปฏิเสธ (ไม่บังคับ)..." rows={2}
                        className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400 resize-none bg-red-50/50" />
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setRejectingId(null) }}
                          className="flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                          ยกเลิก
                        </button>
                        <button onClick={e => handleRejectConfirm(po.id, e)}
                          className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium cursor-pointer border-none hover:bg-red-600 transition-colors">
                          ยืนยันปฏิเสธ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="text-xs text-stone-400 mb-0.5">ยอดรวม</div>
                    <div className="text-2xl font-bold text-[#F8981D]">{total.toLocaleString()} <span className="text-base font-normal">฿</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {po.status === 'PENDING_APPROVAL' && !isRejecting && (
                      <>
                        <button onClick={e => handleRejectOpen(po.id, e)}
                          className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors">
                          ปฏิเสธ
                        </button>
                        <button onClick={e => handleApprove(po.id, e)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium cursor-pointer border-none hover:bg-emerald-600 transition-colors">
                          อนุมัติ
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate(`/owner/purchase-requests/${po.id}`)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 cursor-pointer border-none transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
