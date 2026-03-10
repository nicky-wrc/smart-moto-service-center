import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { initialRequests, calcTotals, type ReqStatus, type PurchaseRequest } from '../../data/purchaseRequests'

const statusConfig: Record<ReqStatus, { color: string; bg: string; border: string }> = {
  'รออนุมัติ':   { color: 'text-[#F8981D]', bg: 'bg-[#F8981D]/12', border: 'border-[#F8981D]/30' },
  'อนุมัติแล้ว': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'ปฏิเสธ':      { color: 'text-red-500',    bg: 'bg-red-50',      border: 'border-red-200' },
}

export default function PurchaseRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [req, setReq] = useState<PurchaseRequest | undefined>(
    initialRequests.find(r => r.id === Number(id))
  )
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  if (!req) {
    return (
      <div className="h-full flex items-center justify-center text-stone-400 text-sm">
        ไม่พบคำขอสั่งซื้อนี้
      </div>
    )
  }

  const { subtotal, tax, grand } = calcTotals(req)
  const sc = statusConfig[req.status]

  const handleApprove = () => {
    setReq(r => r ? { ...r, status: 'อนุมัติแล้ว', approvedBy: 'เจ้าของร้าน', approvedAt: new Date().toLocaleDateString('th-TH') } : r)
    setShowRejectInput(false)
  }

  const handleReject = () => {
    setReq(r => r ? { ...r, status: 'ปฏิเสธ', approvedBy: 'เจ้าของร้าน', approvedAt: new Date().toLocaleDateString('th-TH'), rejectNote } : r)
    setRejectNote('')
    setShowRejectInput(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">

      {/* ── Header card ── */}
      <div className="shrink-0 px-6 pt-6 pb-0">
        <div className="bg-white rounded-2xl border border-stone-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">

            {/* Left: back + title */}
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => navigate(-1)}
                className="shrink-0 w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors border-none">
                <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-[#1E1E1E]">{req.requestNo}</h1>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  ขอโดย <span className="text-stone-600 font-medium">{req.requestedBy}</span>
                  {' · '}สร้างเมื่อ {req.requestedAt}
                </p>
              </div>
            </div>

            {/* Right: key info pills */}
            <div className="shrink-0 flex items-center gap-3 text-xs text-stone-500">
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-stone-600 font-medium">{req.supplier}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>วันที่สั่ง <span className="text-stone-600 font-medium">{req.orderDate}</span></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>ต้องการรับ <span className="text-stone-600 font-medium">{req.expectedDate}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex gap-5 items-start">

          {/* ── Left: items table ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Section title */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1E1E1E]">รายการสินค้าที่ขอสั่งซื้อ</h2>
              <span className="text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">{req.items.length} รายการ</span>
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
                  {req.items.map((item, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{item.code}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#1E1E1E] font-medium">{item.name}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-stone-500">{item.unitPrice.toLocaleString()} ฿</td>
                      <td className="px-5 py-3.5 text-right text-sm text-stone-500">{item.qty} <span className="text-xs text-stone-400">{item.unit}</span></td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#1E1E1E]">{(item.unitPrice * item.qty).toLocaleString()} ฿</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reason */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">หมายเหตุ / เหตุผล</span>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{req.reason}</p>
            </div>

            {/* Reject note */}
            {req.rejectNote && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">หมายเหตุการปฏิเสธ</span>
                </div>
                <p className="text-sm text-stone-600">{req.rejectNote}</p>
              </div>
            )}

            {/* Reject textarea */}
            {showRejectInput && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2 block">หมายเหตุการปฏิเสธ</label>
                <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3}
                  placeholder="ระบุเหตุผล..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors resize-none" />
              </div>
            )}
          </div>

          {/* ── Right: summary + actions ── */}
          <div className="w-72 shrink-0 flex flex-col gap-4">

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-100">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">สรุปยอด</span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>ยอดรวม</span>
                  <span>{subtotal.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>ภาษี (7%)</span>
                  <span>+{tax.toLocaleString()} ฿</span>
                </div>
                {req.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>ส่วนลด</span>
                    <span>-{req.discount.toLocaleString()} ฿</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-[#1E1E1E]">ยอดสุทธิ</span>
                  <span className="text-2xl font-bold text-[#F8981D]">{grand.toLocaleString()}<span className="text-sm font-normal ml-1">฿</span></span>
                </div>
              </div>
            </div>

            {/* Approval info */}
            {req.approvedBy && (
              <div className={`rounded-2xl border p-4 ${req.status === 'อนุมัติแล้ว' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className="text-xs font-semibold mb-1 uppercase tracking-wide ${req.status === 'อนุมัติแล้ว' ? 'text-emerald-600' : 'text-red-500'}">
                  {req.status === 'อนุมัติแล้ว' ? '✓ อนุมัติแล้ว' : '✕ ปฏิเสธแล้ว'}
                </div>
                <div className="text-xs text-stone-500">โดย {req.approvedBy} · {req.approvedAt}</div>
              </div>
            )}

            {/* Action buttons */}
            {req.status === 'รออนุมัติ' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-3">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">การดำเนินการ</span>
                {!showRejectInput ? (
                  <>
                    <button onClick={handleApprove}
                      className="w-full py-2.5 rounded-xl bg-[#F8981D] text-white text-sm font-semibold cursor-pointer border-none hover:bg-orange-500 transition-colors">
                      ยืนยันสั่งซื้อ
                    </button>
                    <button onClick={() => setShowRejectInput(true)}
                      className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                      ปฏิเสธ
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleReject} disabled={!rejectNote.trim()}
                      className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold cursor-pointer border-none hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      ยืนยันปฏิเสธ
                    </button>
                    <button onClick={() => setShowRejectInput(false)}
                      className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
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
