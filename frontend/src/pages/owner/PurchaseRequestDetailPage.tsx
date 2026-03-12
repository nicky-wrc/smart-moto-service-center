import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    part?: { id: number; partNo: string; name: string; category?: string }
  }>
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'รออนุมัติ',
  ORDERED: 'อนุมัติแล้ว',
  APPROVED: 'อนุมัติแล้ว',
  CANCELLED: 'ปฏิเสธ',
  DRAFT: 'แบบร่าง',
  COMPLETED: 'เสร็จสิ้น',
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  PENDING_APPROVAL: { color: 'text-[#F8981D]', bg: 'bg-[#F8981D]/12', border: 'border-[#F8981D]/30' },
  ORDERED: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  APPROVED: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  CANCELLED: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  DRAFT: { color: 'text-stone-500', bg: 'bg-stone-100', border: 'border-stone-200' },
  COMPLETED: { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
}

export default function PurchaseRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [po, setPo] = useState<BackendPO | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiClient.get<BackendPO>(`/purchase-orders/${id}`)
      .then(data => setPo(data))
      .catch(err => console.error('Failed to load PO', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!po) {
    return (
      <div className="h-full flex items-center justify-center text-stone-400 text-sm">
        ไม่พบคำขอสั่งซื้อนี้
      </div>
    )
  }

  const total = Number(po.totalAmount) || 0
  const subtotal = po.items.reduce((s, i) => s + Number(i.totalPrice || 0), 0)
  const sc = STATUS_STYLE[po.status] || STATUS_STYLE['DRAFT']
  const label = STATUS_LABEL[po.status] || po.status
  const createdDate = po.createdAt ? new Date(po.createdAt).toLocaleDateString('th-TH') : '-'
  const expectedDate = po.expectedDate ? new Date(po.expectedDate).toLocaleDateString('th-TH') : '-'

  const handleApprove = async () => {
    setSubmitting(true)
    try {
      const updated = await apiClient.patch<BackendPO>(`/purchase-orders/${po.id}/approve`, {})
      setPo(prev => prev ? { ...prev, status: updated.status || 'ORDERED', approvedBy: updated.approvedBy } : prev)
    } catch (err) {
      console.error('Failed to approve', err)
      alert('ไม่สามารถอนุมัติได้ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
      setShowRejectInput(false)
    }
  }

  const handleReject = async () => {
    setSubmitting(true)
    try {
      await apiClient.patch(`/purchase-orders/${po.id}/cancel`, {})
      setPo(prev => prev ? { ...prev, status: 'CANCELLED' } : prev)
    } catch (err) {
      console.error('Failed to cancel', err)
      alert('ไม่สามารถปฏิเสธได้ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
      setRejectNote('')
      setShowRejectInput(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">
      <div className="shrink-0 px-6 pt-6 pb-0">
        <div className="bg-white rounded-2xl border border-stone-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => navigate(-1)}
                className="shrink-0 w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors border-none">
                <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-[#1E1E1E]">{po.poNo}</h1>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                    {label}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  ขอโดย <span className="text-stone-600 font-medium">{po.createdBy?.name || '-'}</span>
                  {' · '}สร้างเมื่อ {createdDate}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3 text-xs text-stone-500">
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
                <span className="text-stone-600 font-medium">{po.supplier?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
                <span>วันที่สร้าง <span className="text-stone-600 font-medium">{createdDate}</span></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
                <span>ต้องการรับ <span className="text-stone-600 font-medium">{expectedDate}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1E1E1E]">รายการสินค้าที่ขอสั่งซื้อ</h2>
              <span className="text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">{po.items.length} รายการ</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">รหัสสินค้า</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">ชื่อสินค้า</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">ราคา/หน่วย</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">จำนวน</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {po.items.map(item => (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{item.part?.partNo || '-'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#1E1E1E] font-medium">{item.part?.name || '-'}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-stone-500">{Number(item.unitPrice).toLocaleString()} ฿</td>
                      <td className="px-5 py-3.5 text-right text-sm text-stone-500">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#1E1E1E]">{Number(item.totalPrice).toLocaleString()} ฿</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {po.notes && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2 block">หมายเหตุ</span>
                <p className="text-sm text-stone-600 leading-relaxed">{po.notes}</p>
              </div>
            )}

            {showRejectInput && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2 block">หมายเหตุการปฏิเสธ</label>
                <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3}
                  placeholder="ระบุเหตุผล (ไม่บังคับ)..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors resize-none" />
              </div>
            )}
          </div>

          <div className="w-72 shrink-0 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-100">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">สรุปยอด</span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>ยอดรวมสินค้า</span>
                  <span>{subtotal.toLocaleString()} ฿</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-[#1E1E1E]">ยอดสุทธิ</span>
                  <span className="text-2xl font-bold text-[#F8981D]">{total.toLocaleString()}<span className="text-sm font-normal ml-1">฿</span></span>
                </div>
              </div>
            </div>

            {po.approvedBy && (
              <div className={`rounded-2xl border p-4 ${po.status === 'ORDERED' || po.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`text-xs font-semibold mb-1 uppercase tracking-wide ${po.status === 'ORDERED' || po.status === 'APPROVED' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {po.status === 'ORDERED' || po.status === 'APPROVED' ? '✓ อนุมัติแล้ว' : '✕ ปฏิเสธแล้ว'}
                </div>
                <div className="text-xs text-stone-500">โดย {po.approvedBy.name}</div>
              </div>
            )}

            {po.status === 'PENDING_APPROVAL' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-3">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">การดำเนินการ</span>
                {!showRejectInput ? (
                  <>
                    <button onClick={handleApprove} disabled={submitting}
                      className="w-full py-2.5 rounded-xl bg-[#F8981D] text-white text-sm font-semibold cursor-pointer border-none hover:bg-orange-500 transition-colors disabled:opacity-50">
                      {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันสั่งซื้อ'}
                    </button>
                    <button onClick={() => setShowRejectInput(true)} disabled={submitting}
                      className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 cursor-pointer bg-white hover:bg-stone-50 transition-colors disabled:opacity-50">
                      ปฏิเสธ
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleReject} disabled={submitting}
                      className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold cursor-pointer border-none hover:bg-red-600 transition-colors disabled:opacity-50">
                      {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
                    </button>
                    <button onClick={() => setShowRejectInput(false)} disabled={submitting}
                      className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors disabled:opacity-50">
                      ย้อนกลับ
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
