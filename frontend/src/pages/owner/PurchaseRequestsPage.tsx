import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialRequests, calcTotals, type ReqStatus, type PurchaseRequest } from '../../data/purchaseRequests'

const statusConfig: Record<ReqStatus, { color: string; bg: string; dot: string }> = {
  'รออนุมัติ':   { color: 'text-[#F8981D]', bg: 'bg-[#F8981D]/10', dot: 'bg-[#F8981D]' },
  'อนุมัติแล้ว': { color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  'ปฏิเสธ':      { color: 'text-red-500',    bg: 'bg-red-50',      dot: 'bg-red-400' },
}

const allStatuses: (ReqStatus | 'ทั้งหมด')[] = ['ทั้งหมด', 'รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ']

const TODAY = '09/03/2026'
const APPROVER = 'เจ้าของ'

export default function PurchaseRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<PurchaseRequest[]>(initialRequests)
  const [filterStatus, setFilterStatus] = useState<ReqStatus | 'ทั้งหมด'>('ทั้งหมด')
  const [search, setSearch] = useState('')
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === 'ทั้งหมด' || r.status === filterStatus
    const matchSearch = r.requestNo.includes(search) || r.requestedBy.includes(search) || r.supplier.includes(search)
    return matchStatus && matchSearch
  })

  const pendingCount  = requests.filter(r => r.status === 'รออนุมัติ').length
  const approvedCount = requests.filter(r => r.status === 'อนุมัติแล้ว').length
  const rejectedCount = requests.filter(r => r.status === 'ปฏิเสธ').length

  const handleApprove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setRequests(prev => prev.map(r => r.id === id
      ? { ...r, status: 'อนุมัติแล้ว', approvedBy: APPROVER, approvedAt: TODAY }
      : r
    ))
  }

  const handleRejectOpen = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setRejectingId(id)
    setRejectNote('')
  }

  const handleRejectConfirm = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setRequests(prev => prev.map(r => r.id === id
      ? { ...r, status: 'ปฏิเสธ', approvedBy: APPROVER, approvedAt: TODAY, rejectNote }
      : r
    ))
    setRejectingId(null)
    setRejectNote('')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">

      {/* Summary + filter */}
      <div className="shrink-0 p-6 pb-0 flex flex-col gap-5">

        {/* Summary cards */}
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
            <div className="text-3xl font-bold">{rejectedCount}</div>
            <div className="text-xs text-stone-400 mt-1">รายการ</div>
          </div>
        </div>

        {/* Filter bar */}
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
            {allStatuses.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-colors ${filterStatus === s ? 'bg-[#44403C] text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center text-stone-400">ไม่มีรายการ</div>
        )}
        {filtered.map(req => {
          const sc = statusConfig[req.status]
          const { grand } = calcTotals(req)
          const isRejecting = rejectingId === req.id
          return (
            <div key={req.id} className="bg-white rounded-2xl border border-stone-200 p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between gap-6">

                {/* Left content */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">

                  {/* Row 1: PO number + status */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#1E1E1E]">{req.requestNo}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {req.status}
                    </span>
                  </div>

                  {/* Row 2: meta info */}
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>ขอโดย <span className="font-medium text-stone-700">{req.requestedBy}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium text-stone-700">{req.supplier}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>วันที่สั่ง <span className="font-medium text-stone-700">{req.orderDate}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>ต้องการรับ <span className="font-medium text-stone-700">{req.expectedDate}</span></span>
                    </div>
                  </div>

                  {/* Row 3: reason */}
                  <p className="text-sm text-stone-400 line-clamp-1">{req.reason}</p>

                  {/* Reject note / approved by */}
                  {req.rejectNote && (
                    <div className="text-sm text-stone-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      <span className="text-red-400 font-medium">หมายเหตุการปฏิเสธ:</span> {req.rejectNote}
                    </div>
                  )}
                  {req.approvedBy && (
                    <div className="text-sm text-stone-400">
                      {req.status === 'อนุมัติแล้ว' ? 'อนุมัติ' : 'ปฏิเสธ'}โดย <span className="font-medium text-stone-500">{req.approvedBy}</span> · {req.approvedAt}
                    </div>
                  )}

                  {/* Reject inline input */}
                  {isRejecting && (
                    <div className="flex flex-col gap-2 mt-1" onClick={e => e.stopPropagation()}>
                      <textarea
                        autoFocus
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="ระบุเหตุผลการปฏิเสธ..."
                        rows={2}
                        className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400 resize-none bg-red-50/50"
                      />
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setRejectingId(null) }}
                          className="flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                          ยกเลิก
                        </button>
                        <button onClick={e => handleRejectConfirm(req.id, e)}
                          disabled={!rejectNote.trim()}
                          className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium cursor-pointer border-none disabled:opacity-40 hover:bg-red-600 transition-colors">
                          ยืนยันปฏิเสธ
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: grand total */}
                <div className="shrink-0 flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="text-xs text-stone-400 mb-0.5">ยอดสุทธิ (รวมภาษี)</div>
                    <div className="text-2xl font-bold text-[#F8981D]">{grand.toLocaleString()} <span className="text-base font-normal">฿</span></div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {req.status === 'รออนุมัติ' && !isRejecting && (
                      <>
                        <button onClick={e => handleRejectOpen(req.id, e)}
                          className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors">
                          ปฏิเสธ
                        </button>
                        <button onClick={e => handleApprove(req.id, e)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium cursor-pointer border-none hover:bg-emerald-600 transition-colors">
                          อนุมัติ
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate(`/owner/purchase-requests/${req.id}`)}
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
