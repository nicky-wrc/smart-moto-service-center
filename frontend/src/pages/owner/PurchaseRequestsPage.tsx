import { useState } from 'react'

type ReqStatus = 'รออนุมัติ' | 'อนุมัติแล้ว' | 'ปฏิเสธ'

type PurchaseRequest = {
  id: number
  requestNo: string
  requestedBy: string
  requestedAt: string
  items: { name: string; qty: number; unit: string; estimatedCost: number }[]
  reason: string
  status: ReqStatus
  approvedBy?: string
  approvedAt?: string
  note?: string
}

const initialRequests: PurchaseRequest[] = [
  {
    id: 1,
    requestNo: 'PR-2026-001',
    requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '08/03/2026',
    reason: 'สต๊อกผ้าเบรกหน้าใกล้หมด เหลือ 2 ชุด ต้องสั่งเพิ่มเพื่อรองรับงานสัปดาห์หน้า',
    status: 'รออนุมัติ',
    items: [
      { name: 'ผ้าเบรกหน้า Honda PCX', qty: 10, unit: 'ชุด', estimatedCost: 280 },
      { name: 'ผ้าเบรกหลัง Honda PCX', qty: 8,  unit: 'ชุด', estimatedCost: 250 },
    ],
  },
  {
    id: 2,
    requestNo: 'PR-2026-002',
    requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '07/03/2026',
    reason: 'น้ำมันเครื่องหมดสต๊อก มีงานรองรับแล้ว 5 คัน ต้องเติมด่วน',
    status: 'อนุมัติแล้ว',
    approvedBy: 'เจ้าของร้าน',
    approvedAt: '07/03/2026',
    items: [
      { name: 'น้ำมันเครื่อง 10W-40 (1L)', qty: 24, unit: 'ขวด', estimatedCost: 120 },
      { name: 'น้ำมันเครื่อง 20W-50 (1L)', qty: 12, unit: 'ขวด', estimatedCost: 110 },
    ],
  },
  {
    id: 3,
    requestNo: 'PR-2026-003',
    requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '06/03/2026',
    reason: 'สายพาน NMAX เหลือ 1 เส้น และมีงานรออยู่ 2 คัน',
    status: 'ปฏิเสธ',
    approvedBy: 'เจ้าของร้าน',
    approvedAt: '06/03/2026',
    note: 'รอตรวจสอบราคากับซัพพลายเออร์รายอื่นก่อน',
    items: [
      { name: 'สายพาน Yamaha NMAX', qty: 5, unit: 'เส้น', estimatedCost: 380 },
    ],
  },
  {
    id: 4,
    requestNo: 'PR-2026-004',
    requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '09/03/2026',
    reason: 'หัวเทียนและไส้กรองอากาศใกล้หมด คาดว่าจะใช้หมดภายใน 3 วัน',
    status: 'รออนุมัติ',
    items: [
      { name: 'หัวเทียน NGK CR7E',        qty: 20, unit: 'หัว',  estimatedCost: 85 },
      { name: 'ไส้กรองอากาศ Honda Wave', qty: 12, unit: 'ชิ้น', estimatedCost: 95 },
      { name: 'ไส้กรองน้ำมัน',           qty: 15, unit: 'ชิ้น', estimatedCost: 60 },
    ],
  },
  {
    id: 5,
    requestNo: 'PR-2026-005',
    requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '05/03/2026',
    reason: 'แบตเตอรี่เหลือ 1 ก้อน ต้องสั่งรักษาระดับสต๊อกขั้นต่ำ',
    status: 'อนุมัติแล้ว',
    approvedBy: 'เจ้าของร้าน',
    approvedAt: '05/03/2026',
    items: [
      { name: 'แบตเตอรี่ 12V 5Ah', qty: 4, unit: 'ก้อน', estimatedCost: 550 },
    ],
  },
]

const statusConfig: Record<ReqStatus, { color: string; bg: string }> = {
  'รออนุมัติ':   { color: 'text-[#F8981D]',   bg: 'bg-[#F8981D]/12' },
  'อนุมัติแล้ว': { color: 'text-[#44403C]',   bg: 'bg-[#44403C]/10' },
  'ปฏิเสธ':      { color: 'text-red-500',      bg: 'bg-red-50' },
}

const allStatuses: (ReqStatus | 'ทั้งหมด')[] = ['ทั้งหมด', 'รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ']

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>(initialRequests)
  const [filterStatus, setFilterStatus] = useState<ReqStatus | 'ทั้งหมด'>('ทั้งหมด')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === 'ทั้งหมด' || r.status === filterStatus
    const matchSearch = r.requestNo.includes(search) || r.requestedBy.includes(search) || r.reason.includes(search)
    return matchStatus && matchSearch
  })

  const pendingCount  = requests.filter(r => r.status === 'รออนุมัติ').length
  const approvedCount = requests.filter(r => r.status === 'อนุมัติแล้ว').length
  const rejectedCount = requests.filter(r => r.status === 'ปฏิเสธ').length

  const totalEstimate = (req: PurchaseRequest) =>
    req.items.reduce((s, i) => s + i.qty * i.estimatedCost, 0)

  const selected = requests.find(r => r.id === selectedId) ?? null

  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'อนุมัติแล้ว', approvedBy: 'เจ้าของร้าน', approvedAt: new Date().toLocaleDateString('th-TH') } : r
    ))
    setSelectedId(null)
  }

  const handleReject = (id: number) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'ปฏิเสธ', approvedBy: 'เจ้าของร้าน', approvedAt: new Date().toLocaleDateString('th-TH'), note: rejectNote } : r
    ))
    setSelectedId(null)
    setRejectNote('')
    setShowRejectInput(false)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F5] p-6 flex flex-col gap-5">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#44403C] rounded-2xl p-4">
          <div className="text-xs text-stone-300">รออนุมัติ</div>
          <div className="text-xl font-bold text-white mt-1">{pendingCount} รายการ</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <div className="text-xs text-stone-400">อนุมัติแล้ว</div>
          <div className="text-xl font-bold text-[#44403C] mt-1">{approvedCount} รายการ</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <div className="text-xs text-stone-400">ปฏิเสธ</div>
          <div className="text-xl font-bold text-red-500 mt-1">{rejectedCount} รายการ</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-60 shrink-0">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาเลขคำขอ / ผู้ขอ..."
            className="w-full bg-white border border-stone-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-1 flex-wrap">
          {allStatuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-none transition-colors ${filterStatus === s ? 'bg-[#44403C] text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 py-12 text-center text-stone-400 text-sm">ไม่มีรายการ</div>
        )}
        {filtered.map(req => {
          const sc = statusConfig[req.status]
          const total = totalEstimate(req)
          return (
            <div key={req.id} className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-semibold text-[#1E1E1E] text-sm">{req.requestNo}</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{req.status}</span>
                  </div>
                  <div className="text-xs text-stone-400 mb-2">
                    ขอโดย <span className="font-medium text-stone-600">{req.requestedBy}</span> · {req.requestedAt}
                  </div>
                  <p className="text-sm text-stone-600 mb-3 line-clamp-2">{req.reason}</p>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2">
                    {req.items.map((item, i) => (
                      <div key={i} className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-xs">
                        <span className="font-medium text-stone-700">{item.name}</span>
                        <span className="text-stone-400 ml-1.5">{item.qty} {item.unit}</span>
                        <span className="text-[#44403C] font-medium ml-1.5">~{(item.qty * item.estimatedCost).toLocaleString()} ฿</span>
                      </div>
                    ))}
                  </div>

                  {req.note && (
                    <div className="mt-3 text-xs text-stone-400 bg-stone-50 rounded-xl px-3 py-2">
                      หมายเหตุ: {req.note}
                    </div>
                  )}
                  {req.approvedBy && (
                    <div className="mt-2 text-xs text-stone-400">
                      {req.status === 'อนุมัติแล้ว' ? 'อนุมัติ' : 'ปฏิเสธ'}โดย {req.approvedBy} · {req.approvedAt}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-xs text-stone-400 mb-0.5">ค่าใช้จ่ายโดยประมาณ</div>
                  <div className="text-lg font-bold text-[#44403C]">{total.toLocaleString()} ฿</div>

                  {req.status === 'รออนุมัติ' && (
                    <button onClick={() => { setSelectedId(req.id); setShowRejectInput(false); setRejectNote('') }}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#44403C] text-white text-xs font-medium cursor-pointer border-none hover:bg-black transition-colors">
                      ตรวจสอบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail / Approve Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-semibold text-[#1E1E1E]">{selected.requestNo}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color}`}>
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">ขอโดย {selected.requestedBy} · {selected.requestedAt}</p>
                </div>
                <button onClick={() => { setSelectedId(null); setShowRejectInput(false) }}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center cursor-pointer border-none hover:bg-stone-200 transition-colors">
                  <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="mb-4">
                <div className="text-xs text-stone-400 mb-1">เหตุผลในการขอ</div>
                <p className="text-sm text-stone-700 bg-stone-50 rounded-xl px-4 py-3">{selected.reason}</p>
              </div>

              <div className="text-xs text-stone-400 mb-2">รายการอะไหล่ที่ขอ</div>
              <div className="rounded-xl border border-stone-100 overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-stone-500">รายการ</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-stone-500">จำนวน</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-stone-500">ราคาทุน/ชิ้น</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-stone-500">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {selected.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-stone-700">{item.name}</td>
                        <td className="px-4 py-2.5 text-right text-stone-500">{item.qty} {item.unit}</td>
                        <td className="px-4 py-2.5 text-right text-stone-500">{item.estimatedCost.toLocaleString()} ฿</td>
                        <td className="px-4 py-2.5 text-right font-medium text-[#44403C]">{(item.qty * item.estimatedCost).toLocaleString()} ฿</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 border-t border-stone-100">
                    <tr>
                      <td colSpan={3} className="px-4 py-2.5 text-xs font-medium text-stone-500 text-right">ค่าใช้จ่ายรวมโดยประมาณ</td>
                      <td className="px-4 py-2.5 text-right font-bold text-[#44403C]">{totalEstimate(selected).toLocaleString()} ฿</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selected.note && (
                <div className="text-xs text-stone-500 bg-stone-50 rounded-xl px-4 py-3 mb-4">
                  หมายเหตุ: {selected.note}
                </div>
              )}

              {showRejectInput && (
                <div className="mb-2">
                  <label className="text-xs text-stone-500 mb-1 block">เหตุผลการปฏิเสธ</label>
                  <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3}
                    placeholder="ระบุเหตุผล..."
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors resize-none" />
                </div>
              )}
            </div>

            {/* Footer */}
            {selected.status === 'รออนุมัติ' && (
              <div className="px-6 pb-6 pt-4 border-t border-stone-100 flex gap-3">
                {!showRejectInput ? (
                  <>
                    <button onClick={() => setShowRejectInput(true)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                      ปฏิเสธ
                    </button>
                    <button onClick={() => handleApprove(selected.id)}
                      className="flex-1 py-2.5 rounded-xl bg-[#44403C] text-white text-sm font-medium cursor-pointer border-none hover:bg-black transition-colors">
                      อนุมัติ
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowRejectInput(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                      ยกเลิก
                    </button>
                    <button onClick={() => handleReject(selected.id)}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium cursor-pointer border-none hover:bg-red-600 transition-colors">
                      ยืนยันปฏิเสธ
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
