import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockJobs } from './jobs'

// ─── Parts Catalog ────────────────────────────────────────────────────────────

type Part = { id: number; name: string; partNumber: string; stock: number; unit: string }
type SelectedPart = { part: Part; qty: number }

const mockPartsCatalog: Part[] = [
  { id: 1,  name: 'ผ้าเบรกหน้า',          partNumber: 'BR-F-001',  stock: 8,  unit: 'ชุด' },
  { id: 2,  name: 'ผ้าเบรกหลัง',          partNumber: 'BR-R-001',  stock: 5,  unit: 'ชุด' },
  { id: 3,  name: 'น้ำมันเบรก DOT4',      partNumber: 'OL-B-004',  stock: 12, unit: 'ขวด' },
  { id: 4,  name: 'หัวเทียน NGK CR7HSA',  partNumber: 'SP-NGK-01', stock: 0,  unit: 'หัว' },
  { id: 5,  name: 'สายพานขับเคลื่อน',     partNumber: 'BL-DR-001', stock: 3,  unit: 'เส้น' },
  { id: 6,  name: 'น้ำมันเครื่อง 10W-40', partNumber: 'OL-E-010',  stock: 20, unit: 'ลิตร' },
  { id: 7,  name: 'ไส้กรองอากาศ',         partNumber: 'FL-AR-001', stock: 0,  unit: 'ชิ้น' },
  { id: 8,  name: 'ไส้กรองน้ำมัน',        partNumber: 'FL-OL-001', stock: 7,  unit: 'ชิ้น' },
  { id: 9,  name: 'โซ่ขับ',               partNumber: 'CH-DR-001', stock: 2,  unit: 'เส้น' },
  { id: 10, name: 'แบตเตอรี่ 12V 5Ah',   partNumber: 'BT-12V-05', stock: 4,  unit: 'ก้อน' },
]

// visual style per part
const partVisual: Record<number, { bg: string; stroke: string }> = {
  1:  { bg: 'bg-blue-50',   stroke: '#93c5fd' },
  2:  { bg: 'bg-blue-50',   stroke: '#93c5fd' },
  3:  { bg: 'bg-amber-50',  stroke: '#fbbf24' },
  4:  { bg: 'bg-orange-50', stroke: '#fb923c' },
  5:  { bg: 'bg-zinc-100',  stroke: '#a1a1aa' },
  6:  { bg: 'bg-amber-50',  stroke: '#fbbf24' },
  7:  { bg: 'bg-green-50',  stroke: '#86efac' },
  8:  { bg: 'bg-green-50',  stroke: '#86efac' },
  9:  { bg: 'bg-zinc-100',  stroke: '#a1a1aa' },
  10: { bg: 'bg-purple-50', stroke: '#c084fc' },
}

import { mockMechanics } from './mechanics'

// ─── Predefined Tags ──────────────────────────────────────────────────────────

const predefinedTags = [
  'เครื่องยนต์',
  'ไฟฟ้า',
  'เบรก',
  'ช่วงล่าง',
  'ส่งกำลัง',
  'เชื้อเพลิง',
  'ระบายความร้อน',
  'บำรุงรักษา',
]


// ─── Parts Modal ──────────────────────────────────────────────────────────────

function PartsModal({
  selectedParts,
  onAdd,
  onRemove,
  onClose,
}: {
  selectedParts: SelectedPart[]
  onAdd: (part: Part, qty: number) => void
  onRemove: (id: number) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [modalQty, setModalQty] = useState<Record<number, number>>({})

  const getQty = (id: number) => modalQty[id] ?? 1
  const setQty = (id: number, q: number) => {
    if (q < 1) return
    setModalQty((prev) => ({ ...prev, [id]: q }))
  }

  const filtered = mockPartsCatalog.filter(
    (p) =>
      p.name.includes(search) || p.partNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <p className="font-semibold text-[#1E1E1E]">เลือกอะไหล่</p>
            <p className="text-xs text-gray-400 mt-0.5">กดเพิ่มได้หลายรายการก่อนปิด</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่ออะไหล่หรือรหัสสินค้า..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
            />
          </div>
        </div>

        {/* Parts Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">ไม่พบอะไหล่ที่ค้นหา</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((part) => {
                const vis = partVisual[part.id] ?? { bg: 'bg-gray-50', stroke: '#d1d5db' }
                const isAdded = !!selectedParts.find((sp) => sp.part.id === part.id)
                const q = getQty(part.id)

                return (
                  <div
                    key={part.id}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isAdded ? 'border-[#F8981D]/40 bg-[#F8981D]/5' : 'border-gray-100 bg-white'
                    }`}
                  >
                    {/* Part image placeholder */}
                    <div className={`h-28 flex items-center justify-center ${vis.bg}`}>
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke={vis.stroke}
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>

                    {/* Part info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-[#1E1E1E] leading-snug">{part.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{part.partNumber}</p>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          part.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {part.stock > 0 ? `${part.stock} ${part.unit}` : 'หมดสต็อก'}
                        </span>
                      </div>

                      {/* Qty + Add */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                          <button
                            onClick={() => setQty(part.id, q - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer text-sm font-bold"
                          >
                            −
                          </button>
                          <span className="text-xs font-medium w-6 text-center">{q}</span>
                          <button
                            onClick={() => setQty(part.id, q + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => isAdded ? onRemove(part.id) : onAdd(part, q)}
                          className={`flex-1 text-xs font-medium py-1.5 rounded-lg border-none cursor-pointer transition-colors ${
                            isAdded
                              ? 'bg-red-50 text-red-500 hover:bg-red-100'
                              : 'bg-[#44403C] text-white hover:bg-black'
                          }`}
                        >
                          {isAdded ? 'ลบออก' : 'เพิ่ม'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-sm text-gray-500">
            เลือกแล้ว{' '}
            <span className="font-semibold text-[#1E1E1E]">{selectedParts.length}</span> รายการ
          </p>
          <button
            onClick={onClose}
            className="bg-[#F8981D] hover:bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-colors"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Job Type Dropdown ────────────────────────────────────────────────────────

type JobType = '' | 'general' | 'deep'

const jobTypeOptions = [
  { value: 'general' as const, label: 'งานทั่วไป', desc: 'เลือกอะไหล่ที่ต้องใช้ แล้วออกใบเสนอราคา' },
  { value: 'deep' as const,    label: 'ต้องตรวจเชิงลึก', desc: 'รื้อ/ผ่าเครื่องเพื่อระบุอาการก่อน' },
]

function JobTypeDropdown({ value, onChange }: { value: JobType; onChange: (v: JobType) => void }) {
  const [open, setOpen] = useState(false)
  const selected = jobTypeOptions.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 bg-white hover:border-gray-300 transition-colors text-left"
      >
        {selected ? (
          <div>
            <p className="text-sm font-medium text-[#1E1E1E]">{selected.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{selected.desc}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-400">เลือกประเภทงาน...</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 ml-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
          {jobTypeOptions.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-4 transition-colors border-none cursor-pointer flex items-start justify-between gap-3
                ${value === opt.value ? 'bg-[#F8981D]/5' : 'bg-white hover:bg-gray-50'}
                ${i < jobTypeOptions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              <div>
                <p className="text-sm font-medium text-[#1E1E1E]">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
              {value === opt.value && (
                <span className="text-[#F8981D] font-bold text-sm shrink-0 mt-0.5">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const job = mockJobs.find((j) => j.id === Number(id))

  // Mechanic assignment (for พร้อมซ่อม status)
  const [selectedMechanics, setSelectedMechanics] = useState<number[]>([])
  const [assignConfirmed, setAssignConfirmed] = useState(false)
  const [mechanicSearch, setMechanicSearch] = useState('')
  const [mechanicSkillFilter, setMechanicSkillFilter] = useState('')

  // Tags (editable)
  const [tags, setTags] = useState(job?.tags ?? [])

  // Foreman note
  const [foremanNote, setForemanNote] = useState('')

  // Foreman photos
  const [foremanPhotos, setForemanPhotos] = useState<string[]>([])
  const handleForemanPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const urls = files.map((f) => URL.createObjectURL(f))
    setForemanPhotos((prev) => [...prev, ...urls])
    e.target.value = ''
  }

  // Photo lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  // Parts modal
  const [partsModalOpen, setPartsModalOpen] = useState(false)

  // Workflow
  const [jobType, setJobType] = useState<JobType>('')
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([])
  const [stockChecked, setStockChecked] = useState(false)
  const [quotationSent, setQuotationSent] = useState(false)
  const [deepNote, setDeepNote] = useState('')
  const [deepSent, setDeepSent] = useState(false)
  const [estimatedDays, setEstimatedDays] = useState<number | ''>(1)
  const [estimatedUnit, setEstimatedUnit] = useState<'วัน' | 'เดือน'>('วัน')

  // Additional quotation (for กำลังดำเนินงาน — mechanic found extra issues)
  type AddlItem = { name: string; qty: number; unitPrice: number }
  const [addlItems, setAddlItems] = useState<AddlItem[]>([])
  const [addlName, setAddlName] = useState('')
  const [addlQty, setAddlQty] = useState(1)
  const [addlPrice, setAddlPrice] = useState<number | ''>(0)
  const [addlQuotationSent, setAddlQuotationSent] = useState(false)

  // Mechanic report photo lightbox
  const [mrLightboxOpen, setMrLightboxOpen] = useState(false)
  const [mrLightboxIdx, setMrLightboxIdx] = useState(0)

  if (!job) return <div className="p-6 text-sm text-gray-400">ไม่พบใบงาน</div>

  // Tag helpers
  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  // Parts helpers
  const handleAddPart = (part: Part, qty: number) => {
    setSelectedParts((prev) => {
      const exists = prev.find((sp) => sp.part.id === part.id)
      if (exists) return prev
      return [...prev, { part, qty }]
    })
    setStockChecked(false)
    setQuotationSent(false)
  }

  const removePart = (id: number) => {
    setSelectedParts((prev) => prev.filter((sp) => sp.part.id !== id))
    setStockChecked(false)
    setQuotationSent(false)
  }

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return
    setSelectedParts((prev) => prev.map((sp) => (sp.part.id === id ? { ...sp, qty } : sp)))
    setStockChecked(false)
    setQuotationSent(false)
  }

  const handleJobTypeChange = (v: JobType) => {
    setJobType(v)
    setSelectedParts([])
    setStockChecked(false)
    setQuotationSent(false)
    setDeepNote('')
    setDeepSent(false)
    setEstimatedDays(1)
    setEstimatedUnit('วัน')
  }

  return (
    <>
      {/* Parts Modal */}
      {partsModalOpen && (
        <PartsModal
          selectedParts={selectedParts}
          onAdd={handleAddPart}
          onRemove={removePart}
          onClose={() => setPartsModalOpen(false)}
        />
      )}

      {/* Photo Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-6 text-white text-2xl bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
          {(() => {
            const allPhotos = [...job.photos, ...foremanPhotos]
            return (
              <>
                <img
                  src={allPhotos[lightboxIdx]}
                  alt="รูปรถ"
                  className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                />
                {allPhotos.length > 1 && (
                  <div className="flex gap-3 mt-5" onClick={(e) => e.stopPropagation()}>
                    {allPhotos.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIdx(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 p-0 bg-transparent cursor-pointer transition-all ${
                          i === lightboxIdx ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                        } ${i >= job.photos.length ? 'ring-1 ring-[#F8981D]/60' : ''}`}
                      >
                        <img src={p} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Mechanic Report Photo Lightbox */}
      {mrLightboxOpen && job.mechanicReport && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
          onClick={() => setMrLightboxOpen(false)}
        >
          <button
            onClick={() => setMrLightboxOpen(false)}
            className="absolute top-5 right-6 text-white text-2xl bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
          <img
            src={job.mechanicReport.photos[mrLightboxIdx]}
            alt="รูปจากช่าง"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          {job.mechanicReport.photos.length > 1 && (
            <div className="flex gap-3 mt-5" onClick={(e) => e.stopPropagation()}>
              {job.mechanicReport.photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setMrLightboxIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 p-0 bg-transparent cursor-pointer transition-all ${
                    i === mrLightboxIdx ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="h-full overflow-hidden flex flex-col">

        {/* ─── Header ─── */}
        <div className="bg-[#F8981D] px-5 py-3.5 flex items-center gap-4 shrink-0">
          <button
            onClick={() => navigate('/foreman/jobs')}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer shrink-0 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>

          <span className="text-white text-sm font-semibold shrink-0">
            คำขอที่ {job.id}
          </span>

          <div className="flex-1" />

          <div className="text-right shrink-0">
            <p className="text-white text-sm font-medium">{job.receivedAt}</p>
            <p className="text-white/70 text-xs mt-0.5">รับโดย {job.receptionist}</p>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="h-full grid gap-5" style={{ gridTemplateColumns: '1fr 360px' }}>

            {/* ─── LEFT: info + symptom + photos ─── */}
            <div className="flex flex-col gap-2.5 overflow-hidden">

              {/* Customer + Vehicle */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">ข้อมูลลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{job.customerName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">ข้อมูลรถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{job.brand} {job.model}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.licensePlate} · {job.province}</p>
                </div>
              </div>

              {/* Symptom */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col flex-1 min-h-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 shrink-0">อาการ / ปัญหาที่พบ</p>
                <textarea
                  readOnly
                  value={job.symptom}
                  className="flex-1 min-h-0 w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 resize-none outline-none leading-relaxed"
                />
              </div>

              {/* Foreman note */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col flex-1 min-h-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 shrink-0">หมายเหตุหัวหน้าช่าง</p>
                <textarea
                  value={foremanNote}
                  onChange={(e) => setForemanNote(e.target.value)}
                  placeholder="บันทึกความเห็น วินิจฉัยเบื้องต้น หรือข้อสังเกต..."
                  className="flex-1 min-h-0 w-full border border-gray-100 rounded-lg px-3 py-2 text-base bg-gray-50 text-gray-700 resize-none outline-none focus:border-[#F8981D] transition-colors leading-relaxed"
                />
              </div>

              {/* Photos */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm shrink-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
                  รูปภาพ <span className="text-gray-300 ml-1">({job.photos.length + foremanPhotos.length})</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {job.photos.map((photo, i) => (
                    <button
                      key={`orig-${i}`}
                      onClick={() => { setLightboxIdx(i); setLightboxOpen(true) }}
                      className="w-30 h-30 rounded-lg overflow-hidden bg-gray-100 cursor-pointer p-0 border border-gray-200 hover:border-[#F8981D] transition-colors group shrink-0"
                    >
                      <img src={photo} alt={`รูปรถ ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    </button>
                  ))}
                  {foremanPhotos.map((photo, i) => (
                    <div key={`foreman-${i}`} className="relative shrink-0 group">
                      <button
                        onClick={() => { setLightboxIdx(job.photos.length + i); setLightboxOpen(true) }}
                        className="w-30 h-30 rounded-lg overflow-hidden bg-gray-100 cursor-pointer p-0 border border-[#F8981D]/40 hover:border-[#F8981D] transition-colors block"
                      >
                        <img src={photo} alt={`รูปหัวหน้าช่าง ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      </button>
                      <button
                        onClick={() => setForemanPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="w-30 h-30 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#F8981D] flex items-center justify-center cursor-pointer transition-colors shrink-0 group">
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-[#F8981D] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleForemanPhotos} />
                  </label>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: tags + workflow ─── */}
            <div className="flex flex-col gap-4 overflow-y-auto">

              {/* Tags (toggle predefined) */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">แท็ก</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map((tag) => {
                    const active = tags.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-sm px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all ${
                          active
                            ? 'bg-[#F8981D] text-white border-[#F8981D]'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D]'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mechanic assignment — shown when customer already approved */}
              {job.status === 'พร้อมซ่อม' && (() => {
                const allSkills = [...new Set(mockMechanics.flatMap((m) => m.skills))]
                const filtered = mockMechanics.filter((m) => {
                  const matchSearch = !mechanicSearch || m.name.toLowerCase().includes(mechanicSearch.toLowerCase())
                  const matchSkill  = !mechanicSkillFilter || m.skills.includes(mechanicSkillFilter)
                  return matchSearch && matchSkill
                })
                const toggleMechanic = (id: number) =>
                  setSelectedMechanics((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  )

                return (
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">มอบหมายช่าง</p>

                    {!assignConfirmed ? (
                      <>
                        {/* Search */}
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            value={mechanicSearch}
                            onChange={(e) => setMechanicSearch(e.target.value)}
                            placeholder="ค้นหาช่าง..."
                            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
                          />
                        </div>

                        {/* Skill filter chips */}
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => setMechanicSkillFilter('')}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                              !mechanicSkillFilter ? 'bg-[#44403C] text-white border-[#44403C]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            ทั้งหมด
                          </button>
                          {allSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => setMechanicSkillFilter(mechanicSkillFilter === skill ? '' : skill)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                                mechanicSkillFilter === skill ? 'bg-[#F8981D] text-white border-[#F8981D]' : 'bg-white text-gray-400 border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D]'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>

                        {/* Mechanic list */}
                        <div className="flex flex-col gap-2">
                          {filtered.length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-3">ไม่พบช่างที่ตรงกัน</p>
                          )}
                          {filtered.map((m) => {
                            const isSelected = selectedMechanics.includes(m.id)
                            return (
                              <button
                                key={m.id}
                                onClick={() => toggleMechanic(m.id)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border text-left transition-all cursor-pointer bg-transparent ${
                                  isSelected ? 'border-[#F8981D] bg-[#F8981D]/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected ? 'bg-[#F8981D] border-[#F8981D]' : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected ? 'bg-[#F8981D] text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {m.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#1E1E1E]">{m.name}</p>
                                  <p className="text-xs text-gray-400">{m.skills.join(' · ')}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                                  m.jobs === 0 ? 'bg-stone-100 text-stone-500' :
                                  m.jobs >= 3  ? 'bg-[#44403C]/10 text-[#44403C]' : 'bg-[#F8981D]/15 text-[#F8981D]'
                                }`}>
                                  {m.jobs} งาน
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => { if (selectedMechanics.length > 0) setAssignConfirmed(true) }}
                          disabled={selectedMechanics.length === 0}
                          className="w-full bg-[#F8981D] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                        >
                          มอบหมายงาน{selectedMechanics.length > 0 ? ` (${selectedMechanics.length} คน)` : ''}
                        </button>
                      </>
                    ) : (
                      <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3.5 flex flex-col gap-2">
                        <p className="text-sm font-medium text-[#44403C]">มอบหมายงานแล้ว</p>
                        <div className="flex flex-col gap-1.5">
                          {selectedMechanics.map((id) => {
                            const m = mockMechanics.find((x) => x.id === id)!
                            return (
                              <div key={id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#44403C] text-white text-xs flex items-center justify-center font-semibold shrink-0">
                                  {m.avatar}
                                </div>
                                <span className="text-sm text-[#44403C]">{m.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Workflow — shown only while still in assessment phase */}
              {['รอประเมิน', 'ตรวจเชิงลึก', 'รอลูกค้าอนุมัติ', 'รอสั่งซื้อ'].includes(job.status) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">ประเมินงาน</p>

                <JobTypeDropdown value={jobType} onChange={handleJobTypeChange} />

                {/* งานทั่วไป */}
                {jobType === 'general' && (
                  <div className="flex flex-col gap-3">

                    {/* Selected parts list */}
                    {selectedParts.length > 0 && !stockChecked && (
                      <div className="flex flex-col gap-1.5">
                        {selectedParts.map((sp) => {
                          const enough = sp.part.stock >= sp.qty
                          return (
                            <div
                              key={sp.part.id}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                                stockChecked
                                  ? enough ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1E1E1E] truncate">{sp.part.name}</p>
                                <p className="text-xs text-gray-400">{sp.part.partNumber}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => updateQty(sp.part.id, sp.qty - 1)}
                                  className="w-5 h-5 rounded border border-gray-200 hover:border-gray-300 text-gray-500 text-xs font-bold cursor-pointer bg-white flex items-center justify-center transition-colors">−</button>
                                <span className="text-xs font-medium w-5 text-center">{sp.qty}</span>
                                <button onClick={() => updateQty(sp.part.id, sp.qty + 1)}
                                  className="w-5 h-5 rounded border border-gray-200 hover:border-gray-300 text-gray-500 text-xs font-bold cursor-pointer bg-white flex items-center justify-center transition-colors">+</button>
                                <span className="text-xs text-gray-400 ml-0.5">{sp.part.unit}</span>
                              </div>
                              {stockChecked && (
                                <span className={`text-xs font-semibold shrink-0 ${enough ? 'text-green-600' : 'text-amber-600'}`}>
                                  {enough ? 'มีพอ' : 'ต้องรอ'}
                                </span>
                              )}
                              <button onClick={() => removePart(sp.part.id)}
                                className="text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-xs transition-colors shrink-0">✕</button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Open parts modal */}
                    {!stockChecked && (
                    <button
                      onClick={() => setPartsModalOpen(true)}
                      className="w-full flex items-center justify-between border-2 border-dashed border-gray-200 hover:border-[#F8981D] rounded-xl px-4 py-3 bg-transparent cursor-pointer transition-colors group"
                    >
                      <span className="text-sm text-gray-400 group-hover:text-[#F8981D] transition-colors">
                        {selectedParts.length > 0
                          ? `เลือกแล้ว ${selectedParts.length} รายการ — แก้ไข`
                          : 'เพิ่มอะไหล่ที่ต้องใช้...'}
                      </span>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-[#F8981D] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    )}

                    {/* Check stock */}
                    {selectedParts.length > 0 && !stockChecked && (
                      <button
                        onClick={() => setStockChecked(true)}
                        className="w-full bg-[#44403C] hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                      >
                        ตรวจสอบสต็อก
                      </button>
                    )}

                    {/* Quotation */}
                    {stockChecked && !quotationSent && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-[#1E1E1E]">ใบเสนอราคา</p>
                            <p className="text-xs text-gray-400 mt-0.5">{job.brand} {job.model} · {job.customerName}</p>
                          </div>
                          <button
                            onClick={() => setStockChecked(false)}
                            className="text-gray-400 hover:text-[#1E1E1E] text-xs border border-gray-200 hover:border-gray-400 rounded-lg px-2.5 py-1 bg-transparent cursor-pointer transition-colors shrink-0"
                          >
                            แก้ไข
                          </button>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          {selectedParts.map((sp) => {
                            const enough = sp.part.stock >= sp.qty
                            return (
                              <div key={sp.part.id} className="flex items-center justify-between gap-2 text-sm">
                                <span className="text-[#1E1E1E]">
                                  {sp.part.name}
                                  <span className="text-gray-400 ml-1">× {sp.qty} {sp.part.unit}</span>
                                </span>
                                <span className={`shrink-0 font-medium px-2 py-0.5 rounded-full ${
                                  enough ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {enough ? 'มีในสต็อก' : 'ต้องสั่งซื้อ'}
                                </span>
                              </div>
                            )
                          })}
                          {selectedParts.some((sp) => sp.part.stock < sp.qty) && (
                            <p className="text-xs text-amber-600 mt-1 pt-2 border-t border-gray-100">
                              * บางรายการต้องสั่งซื้อก่อน จะระบุระยะเวลารออะไหล่ให้ลูกค้าทราบ
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <span className="text-xs text-[#1E1E1E]">ระยะเวลาโดยประมาณ</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                                <button onClick={() => setEstimatedDays((d) => Math.max(1, Number(d) - 1))}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">−</button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={estimatedDays}
                                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setEstimatedDays(v === '' ? '' : Math.max(1, Number(v))) }}
                                  className="w-8 h-7 text-xs font-semibold text-center text-[#1E1E1E] outline-none border-x border-gray-200 bg-white"
                                />
                                <button onClick={() => setEstimatedDays((d) => Number(d) + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">+</button>
                              </div>
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                                {(['วัน', 'เดือน'] as const).map((u) => (
                                  <button key={u} onClick={() => setEstimatedUnit(u)}
                                    className={`px-2.5 h-7 text-xs font-medium border-none cursor-pointer transition-colors ${estimatedUnit === u ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                                    {u}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setQuotationSent(true)}
                            className="w-full bg-[#F8981D] hover:bg-orange-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                          >
                            ส่งใบเสนอราคา
                          </button>
                        </div>
                      </div>
                    )}

                    {quotationSent && (
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
                        <p className="text-green-700 text-sm font-medium">ส่งใบเสนอราคาแล้ว</p>
                        <p className="text-green-600 text-xs mt-0.5">กำหนดแล้วเสร็จประมาณ {estimatedDays} {estimatedUnit} · รอการยืนยันจากลูกค้า</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ตรวจเชิงลึก */}
                {jobType === 'deep' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-gray-500">
                      ต้องรื้อ/ผ่าเครื่องก่อน ระบุรายละเอียดและค่าใช้จ่ายเบื้องต้นเพื่อแจ้งลูกค้าอนุมัติก่อนดำเนินการ
                    </p>
                    <textarea
                      value={deepNote}
                      onChange={(e) => setDeepNote(e.target.value)}
                      placeholder="บันทึกรายละเอียด เช่น จุดที่ต้องรื้อ หรือค่าประเมินเบื้องต้น..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-gray-50 outline-none focus:border-[#F8981D] transition-colors resize-none"
                    />
                    {!deepSent ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-[#1E1E1E]">ระยะเวลาโดยประมาณ</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                              <button onClick={() => setEstimatedDays((d) => Math.max(1, Number(d) - 1))}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">−</button>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={estimatedDays}
                                onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setEstimatedDays(v === '' ? '' : Math.max(1, Number(v))) }}
                                className="w-8 h-7 text-xs font-semibold text-center text-[#1E1E1E] outline-none border-x border-gray-200 bg-white"
                              />
                              <button onClick={() => setEstimatedDays((d) => Number(d) + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">+</button>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                              {(['วัน', 'เดือน'] as const).map((u) => (
                                <button key={u} onClick={() => setEstimatedUnit(u)}
                                  className={`px-2.5 h-7 text-xs font-medium border-none cursor-pointer transition-colors ${estimatedUnit === u ? 'bg-[#44403C] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                                  {u}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeepSent(true)}
                          className="w-full bg-[#1E1E1E] hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                        >
                          บันทึกและแจ้งลูกค้า
                        </button>
                      </>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
                        <p className="text-green-700 text-sm font-medium">แจ้งลูกค้าแล้ว</p>
                        <p className="text-green-600 text-xs mt-0.5">กำหนดแล้วเสร็จประมาณ {estimatedDays} {estimatedUnit} · รอการยืนยันค่าตรวจจากลูกค้า</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* ── กำลังดำเนินงาน: mechanic report + additional quotation ── */}
              {job.status === 'กำลังดำเนินงาน' && (
                <div className="flex flex-col gap-3">

                  {/* Mechanic report card */}
                  {job.mechanicReport ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-amber-700">ช่างรายงานปัญหาเพิ่มเติม</p>
                        <span className="text-xs text-amber-500 ml-auto shrink-0">{job.mechanicReport.reportedAt}</span>
                      </div>
                      <p className="text-sm text-amber-800 leading-relaxed">{job.mechanicReport.note}</p>
                      {job.mechanicReport.photos.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {job.mechanicReport.photos.map((p, i) => (
                            <button
                              key={i}
                              onClick={() => { setMrLightboxIdx(i); setMrLightboxOpen(true) }}
                              className="w-16 h-16 rounded-lg overflow-hidden border border-amber-200 p-0 bg-transparent cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <img src={p} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-center">
                      <p className="text-sm text-stone-400">ช่างยังไม่ได้รายงานปัญหาเพิ่มเติม</p>
                    </div>
                  )}

                  {/* Additional quotation */}
                  {job.mechanicReport && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">ใบเสนอราคาเพิ่มเติม</p>

                      {/* Added items list */}
                      {addlItems.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {addlItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1E1E1E] truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.qty} × {item.unitPrice.toLocaleString()} บาท</p>
                              </div>
                              <span className="text-sm font-semibold text-[#1E1E1E] shrink-0">
                                {(item.qty * item.unitPrice).toLocaleString()} ฿
                              </span>
                              <button
                                onClick={() => setAddlItems((prev) => prev.filter((_, j) => j !== i))}
                                className="text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-xs transition-colors shrink-0"
                              >✕</button>
                            </div>
                          ))}
                          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 mt-1">
                            <span className="text-xs text-gray-400">รวมทั้งหมด</span>
                            <span className="text-sm font-bold text-[#1E1E1E]">
                              {addlItems.reduce((s, it) => s + it.qty * it.unitPrice, 0).toLocaleString()} ฿
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Add item form */}
                      {!addlQuotationSent && (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={addlName}
                            onChange={(e) => setAddlName(e.target.value)}
                            placeholder="รายการ เช่น โซ่ขับเคลื่อน..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
                          />
                          <div className="flex gap-2">
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-9 shrink-0">
                              <button onClick={() => setAddlQty((q) => Math.max(1, q - 1))}
                                className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">−</button>
                              <span className="w-7 text-center text-sm font-medium text-[#1E1E1E]">{addlQty}</span>
                              <button onClick={() => setAddlQty((q) => q + 1)}
                                className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">+</button>
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={addlPrice}
                                onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setAddlPrice(v === '' ? '' : Number(v)) }}
                                placeholder="ราคาต่อหน่วย"
                                className="w-full border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">฿</span>
                            </div>
                            <button
                              onClick={() => {
                                if (!addlName.trim() || !addlPrice) return
                                setAddlItems((prev) => [...prev, { name: addlName.trim(), qty: addlQty, unitPrice: Number(addlPrice) }])
                                setAddlName('')
                                setAddlQty(1)
                                setAddlPrice(0)
                              }}
                              className="h-9 px-3 bg-[#44403C] hover:bg-black text-white text-sm rounded-xl border-none cursor-pointer transition-colors shrink-0"
                            >
                              เพิ่ม
                            </button>
                          </div>
                          <button
                            onClick={() => { if (addlItems.length > 0) setAddlQuotationSent(true) }}
                            disabled={addlItems.length === 0}
                            className="w-full bg-[#F8981D] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                          >
                            ส่งใบเสนอราคาเพิ่มเติมให้ลูกค้า
                          </button>
                        </div>
                      )}

                      {addlQuotationSent && (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
                          <p className="text-green-700 text-sm font-medium">ส่งใบเสนอราคาเพิ่มเติมแล้ว</p>
                          <p className="text-green-600 text-xs mt-0.5">รวม {addlItems.reduce((s, it) => s + it.qty * it.unitPrice, 0).toLocaleString()} ฿ · รอการยืนยันจากลูกค้า</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── รอตรวจ: waiting for foreman inspection ── */}
              {job.status === 'รอตรวจ' && (
                <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-5 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#44403C]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#44403C]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#44403C]">ช่างซ่อมเสร็จแล้ว</p>
                  <p className="text-xs text-stone-400">รอหัวหน้าช่างตรวจสอบงาน</p>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  )
}
