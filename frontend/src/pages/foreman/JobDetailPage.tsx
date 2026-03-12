import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { QuotationA4Document } from '../../components/QuotationA4Document'
import { QuotationPreviewModal } from '../../components/QuotationPreviewModal'
import { ConfirmModal } from '../../components/ConfirmModal'
import type { Part, SelectedPart } from './types'
import { formatMotorcycleName } from '../../utils/motorcycle'

// ─── Parts Catalog (fetched from API) ─────────────────────────────────────────

let partsCatalog: Part[] = []

// visual style rotation for parts
const partColors = [
  { bg: 'bg-blue-50',   stroke: '#93c5fd' },
  { bg: 'bg-amber-50',  stroke: '#fbbf24' },
  { bg: 'bg-orange-50', stroke: '#fb923c' },
  { bg: 'bg-zinc-100',  stroke: '#a1a1aa' },
  { bg: 'bg-green-50',  stroke: '#86efac' },
  { bg: 'bg-purple-50', stroke: '#c084fc' },
]
const partVisual: Record<number, { bg: string; stroke: string }> = {}
function getPartVisual(id: number) {
  if (!partVisual[id]) partVisual[id] = partColors[id % partColors.length]
  return partVisual[id]
}

// ─── Status mapping ───────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, string> = {
  PENDING: 'รอประเมิน',
  WAITING_APPROVAL: 'รอลูกค้าอนุมัติ',
  READY: 'พร้อมซ่อม',
  IN_PROGRESS: 'กำลังดำเนินงาน',
  WAITING_PARTS: 'รอสั่งซื้อ',
  DEEP_INSPECTION: 'ตรวจเชิงลึก',
  QC_PENDING: 'รอตรวจ',
  CLEANING: 'ล้างรถ',
  READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จสิ้น',
  PAID: 'ชำระแล้ว',
}

type Mechanic = { id: number; name: string; avatar: string; jobs: number; skills: string[] }
let mechanicsList: Mechanic[] = []

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

  const filtered = partsCatalog.filter(
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
            <p className="text-sm text-gray-400 mt-0.5">กดเพิ่มได้หลายรายการก่อนปิด</p>
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
                      <p className="text-sm text-gray-400 mt-0.5">{part.partNumber}</p>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
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
                            disabled={q <= 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{q}</span>
                          <button
                            onClick={() => setQty(part.id, Math.min(q + 1, part.stock))}
                            disabled={q >= part.stock}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (q > part.stock) {
                              alert(`จำนวนอะไหล่ไม่เพียงพอ! (มีแค่ ${part.stock} ชิ้นในสต็อก)`);
                              return;
                            }
                            isAdded ? onRemove(part.id) : onAdd(part, Math.min(q, part.stock))
                          }}
                          className={`flex-1 text-sm font-medium py-1.5 rounded-lg border-none cursor-pointer transition-colors ${
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
  { value: 'general' as const, label: 'งานทั่วไป', desc: 'เลือกอะไหล่ที่ต้องใช้ แล้วออกใบประเมินราคา' },
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
            <p className="text-sm text-gray-400 mt-0.5">{selected.desc}</p>
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
                <p className="text-sm text-gray-400 mt-0.5">{opt.desc}</p>
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

  // ─── API data ───────────────────────────────────────────────────────────────
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, usersData, partsData] = await Promise.all([
          api.get<any>(`/jobs/${id}`),
          api.get<any[]>('/users'),
          api.get<any[]>('/parts'),
        ])

        // Map API users to Mechanic shape
        const techs = usersData.filter((u: any) =>
          ['TECHNICIAN', 'FOREMAN'].includes(u.role)
        )
        const allJobs = await api.get<any[]>('/jobs')
        mechanicsList = techs.map((u: any) => {
          const activeJobs = allJobs.filter((j: any) =>
            j.technicianId === u.id &&
            !['COMPLETED', 'PAID', 'CANCELLED'].includes(j.status)
          ).length
          return {
            id: u.id,
            name: u.name,
            avatar: u.name?.[0] ?? '?',
            jobs: activeJobs,
            skills: [],
          }
        })

        // Map API parts to Part shape
        partsCatalog = partsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          partNumber: p.partNo || `P-${p.id}`,
          stock: p.stockQuantity ?? 0,
          unit: p.unit || 'ชิ้น',
          unitPrice: Number(p.unitPrice) || 0,
        }))

        // Map API job to internal shape matching old mock data properties
        const statusKey = jobData.status as string
        const mapped: any = {
          id: jobData.id,
          jobNo: jobData.jobNo,
          receptionist: jobData.reception?.name ?? '-',
          brand: jobData.motorcycle?.brand ?? '',
          model: jobData.motorcycle?.model ?? '',
          licensePlate: jobData.motorcycle?.licensePlate ?? '',
          province: '',
          symptom: jobData.symptom ?? '',
          receivedAt: jobData.createdAt
            ? new Date(jobData.createdAt).toLocaleDateString('th-TH', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              }) + '  ' + new Date(jobData.createdAt).toLocaleTimeString('th-TH', {
                hour: '2-digit', minute: '2-digit',
              }) + ' น.'
            : '-',
          status: STATUS_MAP[statusKey] || statusKey,
          customerName:
            `${jobData.motorcycle?.owner?.firstName ?? ''} ${jobData.motorcycle?.owner?.lastName ?? ''}`.trim() || '-',
          customerPhone: jobData.motorcycle?.owner?.phoneNumber ?? '-',
          tags: jobData.tags ?? [],
          photos: jobData.images ?? [],
          mechanicId: jobData.technicianId ?? undefined,
          motorcycleId: jobData.motorcycleId,
          customerId: jobData.motorcycle?.owner?.id ?? jobData.motorcycle?.ownerId,
          diagnosisNotes: jobData.diagnosisNotes ?? null,
          mechanicReport: jobData.mechanicNotes
            ? {
                note: jobData.mechanicNotes,
                reportedAt: jobData.updatedAt
                  ? new Date(jobData.updatedAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    + ' ' + new Date(jobData.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
                  : '-',
                photos: [] as string[],
              }
            : undefined,
        }
        setJob(mapped)
      } catch (err) {
        console.error('Failed to load job details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Mechanic assignment (for พร้อมซ่อม status)
  const [selectedMechanics, setSelectedMechanics] = useState<number[]>([])
  const [assignConfirmed, setAssignConfirmed] = useState(false)
  const [mechanicSearch, setMechanicSearch] = useState('')
  const [mechanicSkillFilter, setMechanicSkillFilter] = useState('')

  // Tags (editable)
  const [tags, setTags] = useState<string[]>([])
  useEffect(() => { if (job?.tags) setTags(job.tags) }, [job])

  // Foreman note — pre-fill from saved diagnosisNotes
  const [foremanNote, setForemanNote] = useState('')
  useEffect(() => { if (job?.diagnosisNotes) setForemanNote(job.diagnosisNotes) }, [job])

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
  const [stockQuotPreview, setStockQuotPreview] = useState(false)
  const [stockQuotFullView, setStockQuotFullView] = useState(false)
  const [quotationSent, setQuotationSent] = useState(false)
  const [deepSent, setDeepSent] = useState(false)
  const [deepQuotPreview, setDeepQuotPreview] = useState(false)
  const [deepQuotFullView, setDeepQuotFullView] = useState(false)
  const [estimatedDays, setEstimatedDays] = useState<number | ''>(1)
  const [estimatedUnit, setEstimatedUnit] = useState<'วัน' | 'เดือน'>('วัน')

  // QC inspection (for รอตรวจ)
  const [qcResult, setQcResult]       = useState<'' | 'pass' | 'fail'>('')
  const [qcNote, setQcNote]           = useState('')
  const [qcSubmitted, setQcSubmitted] = useState(false)

  // Final quotation (after QC pass)
  type QuotItem = { id: number; name: string; qty: number; unitPrice: number }
  const [quotItems, setQuotItems]     = useState<QuotItem[]>([])
  const [quotName, setQuotName]       = useState('')
  const [quotQty, setQuotQty]         = useState(1)
  const [quotPrice, setQuotPrice]     = useState<number | ''>(0)
  const [laborCost, setLaborCost]     = useState<number | ''>(0)
  const [quotSent, setQuotSent]       = useState(false)
  const [showQuot, setShowQuot]       = useState(false)
  const [quotPreview, setQuotPreview] = useState(false)

  // Additional quotation (for กำลังดำเนินงาน — mechanic found extra issues)
  const [addlSelectedParts, setAddlSelectedParts] = useState<SelectedPart[]>([])
  const [addlPartsModalOpen, setAddlPartsModalOpen] = useState(false)
  const [addlQuotPreview, setAddlQuotPreview] = useState(false)
  const [addlQuotFullView, setAddlQuotFullView] = useState(false)
  const [addlQuotationSent, setAddlQuotationSent] = useState(false)

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<null | 'qcPass' | 'qcFail'>(null)

  // Mechanic report photo lightbox
  const [mrLightboxOpen, setMrLightboxOpen] = useState(false)
  const [mrLightboxIdx, setMrLightboxIdx] = useState(0)

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#F8981D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  )
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
    setStockQuotPreview(false)
    setQuotationSent(false)
  }

  const removePart = (id: number) => {
    setSelectedParts((prev) => prev.filter((sp) => sp.part.id !== id))
    setStockChecked(false)
    setStockQuotPreview(false)
    setQuotationSent(false)
  }

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return
    setSelectedParts((prev) => prev.map((sp) => (sp.part.id === id ? { ...sp, qty } : sp)))
    setStockChecked(false)
    setStockQuotPreview(false)
    setQuotationSent(false)
  }

  const handleJobTypeChange = (v: JobType) => {
    setJobType(v)
    setSelectedParts([])
    setStockChecked(false)
    setStockQuotPreview(false)
    setQuotationSent(false)
    setDeepSent(false)
    setDeepQuotPreview(false)
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
              {job.mechanicReport.photos.map((p: string, i: number) => (
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

      {/* ─── Shared A4 Document Views ─── */}
      {stockQuotFullView && (
        <QuotationA4Document
          variant="general"
          job={job}
          onClose={() => setStockQuotFullView(false)}
          foremanNote={foremanNote}
          estimatedDays={estimatedDays}
          estimatedUnit={estimatedUnit}
          selectedParts={selectedParts}
        />
      )}
      {deepQuotFullView && (
        <QuotationA4Document
          variant="deep"
          job={job}
          onClose={() => setDeepQuotFullView(false)}
          foremanNote={foremanNote}
          estimatedDays={estimatedDays}
          estimatedUnit={estimatedUnit}
        />
      )}

      {/* ─── General: Stock Check Preview Modal ─── */}
      {stockQuotPreview && (
        <QuotationPreviewModal
          title="ใบประเมินราคา (ร่าง)"
          onClose={() => { setStockQuotPreview(false); setStockChecked(false) }}
          onConfirm={async () => {
              // 1. Create quotation with items
              const quotationPayload = {
                customerId: job.customerId,
                motorcycleId: job.motorcycleId,
                items: selectedParts.map((sp: any) => ({
                  itemType: 'PART',
                  itemName: sp.part.name,
                  quantity: sp.qty,
                  unitPrice: sp.part.unitPrice,
                  partId: sp.part.id,
                })),
                jobId: Number(id),
                notes: foremanNote || undefined,
              }
            try {
              const quotation = await api.post('/quotations', quotationPayload)
              // 2. Link quotation to job and update status
              await api.patch(`/jobs/${id}`, { status: 'WAITING_APPROVAL', diagnosisNotes: foremanNote || undefined, tags, quotationId: (quotation as any).id })
              setQuotationSent(true)
              setStockQuotPreview(false)
              setJob((prev: any) => prev ? { ...prev, status: 'รอลูกค้าอนุมัติ' } : prev)
            } catch (err: any) { 
              console.error('Failed to send quotation payload:', quotationPayload);
              console.error('Error details:', err.response?.data || err.message); 
              alert('ส่งใบประเมินราคาไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
            }
          }}
          confirmLabel="ส่งใบประเมินราคา"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400 mb-1">ลูกค้า</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">{job.customerName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400 mb-1">รถ</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">{formatMotorcycleName(job.brand, job.model)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.licensePlate} · {job.province}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-700 font-medium mb-1">ความเสียหาย / อาการที่พบ</p>
            {foremanNote.trim() ? (
              <>
                <p className="text-sm text-[#1E1E1E] leading-relaxed">{foremanNote}</p>
                <p className="text-sm text-amber-600/70 mt-1.5">อาการที่ลูกค้าแจ้ง: {job.symptom}</p>
              </>
            ) : (
              <p className="text-sm text-[#1E1E1E] leading-relaxed">{job.symptom}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">อะไหล่ที่ใช้ ({selectedParts.length} รายการ)</p>
            <div className="flex flex-col gap-1.5">
              {selectedParts.map((sp) => {
                const enough = sp.part.stock >= sp.qty
                return (
                  <div key={sp.part.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1E1E1E] truncate">{sp.part.name} <span className="text-gray-400 text-sm">× {sp.qty} {sp.part.unit}</span></p>
                      <p className="text-sm text-gray-400">{(sp.qty * sp.part.unitPrice).toLocaleString()} ฿</p>
                    </div>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full shrink-0 ${enough ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {enough ? 'มีในสต็อก' : 'สั่งซื้อ'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {(() => {
            const total = selectedParts.reduce((s, sp) => s + sp.qty * sp.part.unitPrice, 0)
            return (
              <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-[#1E1E1E]">รวมทั้งหมด</span>
                <span className="text-lg font-black text-[#F8981D]">{total.toLocaleString()} ฿</span>
              </div>
            )
          })()}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm text-[#1E1E1E]">ระยะเวลาโดยประมาณ</p>
              {selectedParts.some((sp) => sp.part.stock < sp.qty) && (
                <p className="text-sm text-amber-600 mt-0.5">รวมระยะเวลารออะไหล่ด้วย</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                <button onClick={() => setEstimatedDays((d) => Math.max(1, Number(d) - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">−</button>
                <input type="text" inputMode="numeric" value={estimatedDays} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setEstimatedDays(v === '' ? '' : Math.max(1, Number(v))) }} className="w-8 h-7 text-sm font-semibold text-center text-[#1E1E1E] outline-none border-x border-gray-200 bg-white" />
                <button onClick={() => setEstimatedDays((d) => Number(d) + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">+</button>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                {(['วัน', 'เดือน'] as const).map((u) => (
                  <button key={u} onClick={() => setEstimatedUnit(u)} className={`px-2.5 h-7 text-sm font-medium border-none cursor-pointer transition-colors ${estimatedUnit === u ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>{u}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setStockQuotFullView(true)} className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D] rounded-xl py-2.5 text-sm text-gray-500 bg-transparent cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            ดูเอกสารเต็ม (A4)
          </button>
        </QuotationPreviewModal>
      )}

      {/* ─── Deep Inspection: Preview Modal ─── */}
      {deepQuotPreview && (
        <QuotationPreviewModal
          title="ใบประเมินราคา — ตรวจเชิงลึก"
          onClose={() => setDeepQuotPreview(false)}
          onConfirm={async () => {
            try {
              await api.patch(`/jobs/${id}/request-inspection`, { inspectionFee: 1000, notes: foremanNote || 'ตรวจเชิงลึก (รื้อ/ผ่าเครื่อง)' })
              if (tags.length > 0) await api.patch(`/jobs/${id}`, { tags })
              setDeepSent(true)
              setDeepQuotPreview(false)
              setJob((prev: any) => prev ? { ...prev, status: 'รอลูกค้าอนุมัติ' } : prev)
            } catch (err) { console.error('Failed to request inspection:', err); alert('ส่งคำขอตรวจเชิงลึกไม่สำเร็จ') }
          }}
          confirmLabel="ส่งใบประเมินราคา"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400 mb-1">ลูกค้า</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">{job.customerName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400 mb-1">รถ</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">{formatMotorcycleName(job.brand, job.model)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.licensePlate} · {job.province}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-700 font-medium mb-1">ความเสียหาย / อาการที่พบ</p>
            {foremanNote.trim() ? (
              <>
                <p className="text-sm text-[#1E1E1E] leading-relaxed">{foremanNote}</p>
                <p className="text-sm text-amber-600/70 mt-1.5">อาการที่ลูกค้าแจ้ง: {job.symptom}</p>
              </>
            ) : (
              <p className="text-sm text-[#1E1E1E] leading-relaxed">{job.symptom}</p>
            )}
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <span className="text-sm text-[#1E1E1E]">ค่าตรวจเชิงลึก (รื้อ/ผ่าเครื่อง)</span>
              <span className="text-sm font-bold text-[#1E1E1E]">1,000 ฿</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-stone-50">
              <span className="text-sm font-bold text-[#1E1E1E]">รวมทั้งหมด</span>
              <span className="text-lg font-black text-[#F8981D]">1,000 ฿</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
            <p className="text-sm text-[#1E1E1E]">ระยะเวลาตรวจโดยประมาณ</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                <button onClick={() => setEstimatedDays((d) => Math.max(1, Number(d) - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">−</button>
                <input type="text" inputMode="numeric" value={estimatedDays} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setEstimatedDays(v === '' ? '' : Math.max(1, Number(v))) }} className="w-8 h-7 text-sm font-semibold text-center text-[#1E1E1E] outline-none border-x border-gray-200 bg-white" />
                <button onClick={() => setEstimatedDays((d) => Number(d) + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">+</button>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                {(['วัน', 'เดือน'] as const).map((u) => (
                  <button key={u} onClick={() => setEstimatedUnit(u)} className={`px-2.5 h-7 text-sm font-medium border-none cursor-pointer transition-colors ${estimatedUnit === u ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>{u}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setDeepQuotFullView(true)} className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D] rounded-xl py-2.5 text-sm text-gray-500 bg-transparent cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            ดูเอกสารเต็ม (A4)
          </button>
        </QuotationPreviewModal>
      )}

      {/* ─── Additional Quotation A4 Full View ─── */}
      {addlQuotFullView && (
        <QuotationA4Document
          variant="additional"
          job={job}
          onClose={() => setAddlQuotFullView(false)}
          addlSelectedParts={addlSelectedParts}
        />
      )}

      {/* ─── Additional Quotation Preview Modal ─── */}
      {addlQuotPreview && (
        <QuotationPreviewModal
          title="ใบเสนอราคาเพิ่มเติม"
          subtitle={`อ้างอิงใบงาน #${job.id}`}
          onClose={() => setAddlQuotPreview(false)}
          onConfirm={() => { setAddlQuotationSent(true); setAddlQuotPreview(false) }}
          confirmLabel="ส่งใบเสนอราคาเพิ่มเติม"
        >
          {/* Customer + Vehicle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400 mb-1">ลูกค้า</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">{job.customerName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400 mb-1">รถ</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">{formatMotorcycleName(job.brand, job.model)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.licensePlate} · {job.province}</p>
            </div>
          </div>

          {/* Reason */}
          {job.mechanicReport && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-sm text-amber-700 font-medium mb-1">สาเหตุ / ปัญหาที่พบเพิ่มเติม</p>
              <p className="text-sm text-[#1E1E1E] leading-relaxed">{job.mechanicReport.note}</p>
              <p className="text-sm text-amber-500 mt-1.5">รายงานโดยช่าง · {job.mechanicReport.reportedAt}</p>
            </div>
          )}

          {/* Parts */}
          <div>
            <p className="text-sm text-gray-400 mb-2">อะไหล่เพิ่มเติม ({addlSelectedParts.length} รายการ)</p>
            <div className="flex flex-col gap-1.5">
              {addlSelectedParts.map((sp) => (
                <div key={sp.part.id} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1E1E1E] truncate">{sp.part.name} <span className="text-gray-400 text-sm">× {sp.qty} {sp.part.unit}</span></p>
                    <p className="text-sm text-gray-400">{(sp.qty * sp.part.unitPrice).toLocaleString()} ฿</p>
                  </div>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full shrink-0 ${sp.part.stock >= sp.qty ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {sp.part.stock >= sp.qty ? 'มีในสต็อก' : 'สั่งซื้อ'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3">
            <span className="text-sm font-bold text-[#1E1E1E]">รวมทั้งหมด</span>
            <span className="text-lg font-black text-[#F8981D]">
              {addlSelectedParts.reduce((s, sp) => s + sp.qty * sp.part.unitPrice, 0).toLocaleString()} ฿
            </span>
          </div>

          {/* View full doc */}
          <button onClick={() => setAddlQuotFullView(true)} className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D] rounded-xl py-2.5 text-sm text-gray-500 bg-transparent cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            ดูเอกสารเต็ม (A4)
          </button>
        </QuotationPreviewModal>
      )}

      {/* ─── Quotation Preview Modal ─── */}
      {quotPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setQuotPreview(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-widest mb-1">Smart Moto Service Center</p>
                  <h2 className="text-lg font-bold text-[#1E1E1E]">ใบเสนอราคา</h2>
                </div>
                <button onClick={() => setQuotPreview(false)} className="text-gray-300 hover:text-gray-500 bg-transparent border-none cursor-pointer text-xl leading-none mt-0.5">✕</button>
              </div>
              <div className="flex flex-col gap-0.5 text-sm text-gray-500">
                <span><span className="font-medium text-[#1E1E1E]">ลูกค้า:</span> {job.customerName}</span>
                <span><span className="font-medium text-[#1E1E1E]">รถ:</span> {formatMotorcycleName(job.brand, job.model)} · {job.licensePlate}</span>
                <span><span className="font-medium text-[#1E1E1E]">วันที่:</span> {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Items */}
            <div className="px-6 py-4 flex flex-col gap-2 flex-1">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">รายการ</p>
              {quotItems.length === 0 && Number(laborCost) === 0 && (
                <p className="text-sm text-gray-300 italic">ไม่มีรายการ</p>
              )}
              {quotItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-5 shrink-0">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1E1E1E]">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.qty} × {item.unitPrice.toLocaleString()} ฿</p>
                  </div>
                  <span className="text-sm font-medium text-[#1E1E1E] shrink-0">{(item.qty * item.unitPrice).toLocaleString()} ฿</span>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 my-1" />

              {/* Labor */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">ค่าแรง</span>
                <span className="text-sm text-[#1E1E1E] font-medium">{Number(laborCost).toLocaleString()} ฿</span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3 mt-1">
                <span className="text-sm font-bold text-[#1E1E1E]">รวมทั้งหมด</span>
                <span className="text-lg font-bold text-[#F8981D]">
                  {(quotItems.reduce((s, i) => s + i.qty * i.unitPrice, 0) + Number(laborCost)).toLocaleString()} ฿
                </span>
              </div>

              <p className="text-sm text-gray-300 text-center mt-2">ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม</p>
            </div>

            {/* Footer */}
            <div className="flex border-t border-gray-100 shrink-0">
              <button
                onClick={() => setQuotPreview(false)}
                className="flex-1 py-4 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none border-r border-gray-100 cursor-pointer transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => { setQuotSent(true); setQuotPreview(false); setShowQuot(false) }}
                disabled={quotItems.length === 0 && !Number(laborCost)}
                className="flex-1 py-4 text-sm font-semibold text-white bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer transition-colors rounded-br-2xl"
              >
                ยืนยันส่งใบเสนอราคา
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Modals ─── */}
      {confirmAction === 'qcPass' && (
        <ConfirmModal
          title="ยืนยันผ่านการตรวจ?"
          description="งานจะถูกส่งต่อขั้นตอนทำความสะอาด และระบบจะออกใบเสนอราคาเรียกเก็บเงิน"
          confirmLabel="ยืนยันผ่าน"
          onCancel={() => setConfirmAction(null)}
          onConfirm={async () => {
            try {
              await api.patch(`/jobs/${id}/qc`, { passed: true, notes: qcNote || 'ผ่านการตรวจ QC' })
              setQcSubmitted(true)
              setConfirmAction(null)
              setJob((prev: any) => prev ? { ...prev, status: 'เสร็จสิ้น' } : prev)
            } catch (err) { console.error('QC pass failed:', err); alert('บันทึก QC ไม่สำเร็จ'); setConfirmAction(null) }
          }}
        />
      )}
      {confirmAction === 'qcFail' && (
        <ConfirmModal
          title="ยืนยันส่งกลับช่างแก้ไข?"
          description="งานจะถูกส่งกลับให้ช่างแก้ไขตามหมายเหตุที่ระบุ"
          confirmLabel="ส่งกลับ"
          onCancel={() => setConfirmAction(null)}
          onConfirm={async () => {
            try {
              await api.patch(`/jobs/${id}/qc`, { passed: false, notes: qcNote || 'ไม่ผ่าน QC — ส่งกลับช่างแก้ไข' })
              setQcSubmitted(true)
              setConfirmAction(null)
              setJob((prev: any) => prev ? { ...prev, status: 'กำลังดำเนินงาน' } : prev)
            } catch (err) { console.error('QC fail failed:', err); alert('บันทึก QC ไม่สำเร็จ'); setConfirmAction(null) }
          }}
        />
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
            <p className="text-white/70 text-sm mt-0.5">รับโดย {job.receptionist}</p>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 360px' }}>

            {/* ─── LEFT: info + symptom + photos ─── */}
            <div className="flex flex-col gap-2.5">

              {/* Customer + Vehicle */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">ข้อมูลลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{job.customerName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">ข้อมูลรถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{formatMotorcycleName(job.brand, job.model)}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.licensePlate} · {job.province}</p>
                </div>
              </div>

              {/* Symptom */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col flex-1 min-h-0">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5 shrink-0">อาการ / ปัญหาที่พบ</p>
                <textarea
                  readOnly
                  value={job.symptom}
                  className="flex-1 min-h-0 w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 resize-none outline-none leading-relaxed"
                />
              </div>

              {/* Foreman note */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col flex-1 min-h-0">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5 shrink-0">หมายเหตุหัวหน้าช่าง</p>
                <textarea
                  value={foremanNote}
                  onChange={(e) => setForemanNote(e.target.value)}
                  placeholder="บันทึกความเห็น วินิจฉัยเบื้องต้น หรือข้อสังเกต..."
                  className="flex-1 min-h-0 w-full border border-gray-100 rounded-lg px-3 py-2 text-base bg-gray-50 text-gray-700 resize-none outline-none focus:border-[#F8981D] transition-colors leading-relaxed"
                />
              </div>

              {/* Photos */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm shrink-0">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">
                  รูปภาพ <span className="text-gray-300 ml-1">({job.photos.length + foremanPhotos.length})</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(job.photos || []).map((photo: string, i: number) => (
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
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-sm flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity leading-none"
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
            <div className="flex flex-col gap-4">

              {/* Tags (toggle predefined) */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">แท็ก</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map((tag) => {
                    const active = tags.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all ${
                          active
                            ? 'bg-[#F8981D] text-white border-[#F8981D] hover:bg-[#e08518]'
                            : 'bg-white text-gray-400 border-dashed border-gray-300 hover:border-[#F8981D] hover:text-[#F8981D]'
                        }`}
                      >
                        {tag}
                        <span className={`text-lg font-bold leading-none ${active ? 'opacity-75' : 'opacity-50'}`}>
                          {active ? '×' : '+'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mechanic assignment — shown only when customer approved and ready to repair */}
              {job.status === 'พร้อมซ่อม' && (() => {
                const allSkills = [...new Set(mechanicsList.flatMap((m: Mechanic) => m.skills))]
                const filtered = mechanicsList.filter((m: Mechanic) => {
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
                    <p className="text-sm text-gray-400 uppercase tracking-wide">มอบหมายช่าง</p>

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
                            className={`text-sm px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                              !mechanicSkillFilter ? 'bg-[#44403C] text-white border-[#44403C]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            ทั้งหมด
                          </button>
                          {allSkills.map((skill: string) => (
                            <button
                              key={skill as string}
                              onClick={() => setMechanicSkillFilter(mechanicSkillFilter === skill ? '' : skill as string)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                                mechanicSkillFilter === skill ? 'bg-[#F8981D] text-white border-[#F8981D]' : 'bg-white text-gray-400 border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D]'
                              }`}
                            >
                              {skill as string}
                            </button>
                          ))}
                        </div>

                        {/* Mechanic list */}
                        <div className="flex flex-col gap-2">
                          {filtered.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-3">ไม่พบช่างที่ตรงกัน</p>
                          )}
                          {filtered.map((m: Mechanic) => {
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
                                  <p className="text-sm text-gray-400">{m.skills.join(' · ')}</p>
                                </div>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded-full shrink-0 ${
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
                          onClick={async () => {
                          if (selectedMechanics.length === 0) return
                          try {
                            await api.patch(`/jobs/${id}/assign`, { technicianId: selectedMechanics[0] })
                            if (tags.length > 0) await api.patch(`/jobs/${id}`, { tags })
                            setAssignConfirmed(true)
                            setJob((prev: any) => prev ? { ...prev, mechanicId: selectedMechanics[0] } : prev)
                          } catch (err) { console.error('Assign failed:', err); alert('มอบหมายช่างไม่สำเร็จ') }
                        }}
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
                            const m = mechanicsList.find((x: Mechanic) => x.id === id)!
                            return (
                              <div key={id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#44403C] text-white text-sm flex items-center justify-center font-semibold shrink-0">
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

              {/* Customer approval — shown when waiting for customer */}
              {job.status === 'รอลูกค้าอนุมัติ' && (
                <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm flex flex-col gap-3">
                  <p className="text-sm text-amber-600 uppercase tracking-wide font-semibold">รอลูกค้าอนุมัติ</p>
                  <p className="text-sm text-gray-500">ใบประเมินราคาถูกส่งแล้ว รอลูกค้าตอบกลับ</p>
                  <button
                    onClick={async () => {
                      try {
                        await api.patch(`/jobs/${id}`, { status: 'READY' })
                        setJob((prev: any) => prev ? { ...prev, status: 'พร้อมซ่อม' } : prev)
                        alert('อนุมัติเรียบร้อย — งานพร้อมซ่อม')
                      } catch (err) { console.error(err); alert('อัพเดทสถานะไม่สำเร็จ') }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                  >
                    ลูกค้าอนุมัติ — พร้อมซ่อม
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.patch(`/jobs/${id}`, { status: 'WAITING_PARTS' })
                        setJob((prev: any) => prev ? { ...prev, status: 'รอสั่งซื้อ' } : prev)
                        alert('อนุมัติเรียบร้อย — รอสั่งซื้ออะไหล่')
                      } catch (err) { console.error(err); alert('อัพเดทสถานะไม่สำเร็จ') }
                    }}
                    className="w-full bg-stone-600 hover:bg-stone-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                  >
                    ลูกค้าอนุมัติ — ต้องสั่งอะไหล่ก่อน
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('ยืนยันยกเลิกงานนี้?')) return
                      try {
                        await api.patch(`/jobs/${id}/cancel`, { reason: 'ลูกค้าไม่อนุมัติ' })
                        setJob((prev: any) => prev ? { ...prev, status: 'ยกเลิก' } : prev)
                        alert('ยกเลิกงานเรียบร้อย')
                      } catch (err) { console.error(err); alert('ยกเลิกงานไม่สำเร็จ') }
                    }}
                    className="w-full bg-white hover:bg-red-50 text-red-500 text-sm font-medium py-2.5 rounded-xl transition-colors border border-red-200 cursor-pointer"
                  >
                    ลูกค้าไม่อนุมัติ — ยกเลิกงาน
                  </button>
                </div>
              )}

              {/* Workflow — shown only while still in assessment phase */}
              {['รอประเมิน', 'ตรวจเชิงลึก', 'รอลูกค้าอนุมัติ', 'รอสั่งซื้อ'].includes(job.status) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                <p className="text-sm text-gray-400 uppercase tracking-wide">ประเมินงาน</p>

                <JobTypeDropdown value={jobType} onChange={handleJobTypeChange} />

                {/* งานทั่วไป */}
                {jobType === 'general' && (
                  <div className="flex flex-col gap-3">

                    {/* Selected parts list */}
                    {selectedParts.length > 0 && !stockChecked && !quotationSent && (
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
                                <p className="text-sm text-gray-400">{sp.part.partNumber}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => updateQty(sp.part.id, sp.qty - 1)}
                                  disabled={sp.qty <= 1}
                                  className="w-5 h-5 rounded border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-bold cursor-pointer bg-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                                <span className="text-sm font-medium w-5 text-center">{sp.qty}</span>
                                <button onClick={() => {
                                    if (sp.qty >= sp.part.stock) {
                                      alert(`จำนวนอะไหล่ไม่เพียงพอ! (มีแค่ ${sp.part.stock} ชิ้นในสต็อก)`);
                                      return;
                                    }
                                    updateQty(sp.part.id, sp.qty + 1)
                                  }}
                                  disabled={sp.qty >= sp.part.stock}
                                  className="w-5 h-5 rounded border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-bold cursor-pointer bg-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                                <span className="text-sm text-gray-400 ml-0.5">{sp.part.unit}</span>
                              </div>
                              {stockChecked && (
                                <span className={`text-sm font-semibold shrink-0 ${enough ? 'text-green-600' : 'text-amber-600'}`}>
                                  {enough ? 'มีพอ' : 'ต้องรอ'}
                                </span>
                              )}
                              <button onClick={() => removePart(sp.part.id)}
                                className="text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-sm transition-colors shrink-0">✕</button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Open parts modal */}
                    {!stockChecked && !quotationSent && (
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
                    {selectedParts.length > 0 && !stockChecked && !quotationSent && (
                      <button
                        onClick={() => { setStockChecked(true); setStockQuotPreview(true) }}
                        className="w-full bg-[#44403C] hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                      >
                        ตรวจสอบสต็อก
                      </button>
                    )}


                    {quotationSent && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                          <p className="text-green-700 text-sm font-medium">ส่งใบประเมินราคาแล้ว</p>
                        </div>
                        <button
                          onClick={() => setStockQuotPreview(true)}
                          className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D] rounded-xl py-2.5 text-sm text-gray-500 bg-transparent cursor-pointer transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          ดูใบประเมินราคา
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ตรวจเชิงลึก */}
                {jobType === 'deep' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-500">
                      ต้องรื้อ/ผ่าเครื่องก่อน ระบุรายละเอียดในหมายเหตุหัวหน้าช่าง (ซ้าย) แล้วส่งใบประเมินราคา 1,000 ฿ ให้ลูกค้าอนุมัติก่อนดำเนินการ
                    </p>
                    {!deepSent ? (
                      <>
                        <button
                          onClick={() => setDeepQuotPreview(true)}
                          className="w-full bg-[#1E1E1E] hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                        >
                          ดูและส่งใบประเมินราคา
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                          <p className="text-green-700 text-sm font-medium">ส่งใบประเมินราคาแล้ว</p>
                        </div>
                        <button
                          onClick={() => setDeepQuotPreview(true)}
                          className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D] rounded-xl py-2.5 text-sm text-gray-500 bg-transparent cursor-pointer transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          ดูใบประเมินราคา
                        </button>
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
                        <span className="text-sm text-amber-500 ml-auto shrink-0">{job.mechanicReport.reportedAt}</span>
                      </div>
                      <p className="text-sm text-amber-800 leading-relaxed">{job.mechanicReport.note}</p>
                      {job.mechanicReport.photos.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {job.mechanicReport.photos.map((p: string, i: number) => (
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
                    <>
                      {addlPartsModalOpen && (
                        <PartsModal
                          selectedParts={addlSelectedParts}
                          onAdd={(part, qty) => setAddlSelectedParts((prev) => prev.find((sp) => sp.part.id === part.id) ? prev : [...prev, { part, qty }])}
                          onRemove={(id) => setAddlSelectedParts((prev) => prev.filter((sp) => sp.part.id !== id))}
                          onClose={() => setAddlPartsModalOpen(false)}
                        />
                      )}
                      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                        <p className="text-sm text-gray-400 uppercase tracking-wide">ใบเสนอราคาเพิ่มเติม</p>

                        {/* Selected parts */}
                        {addlSelectedParts.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            {addlSelectedParts.map((sp) => (
                              <div key={sp.part.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#1E1E1E] truncate">{sp.part.name}</p>
                                  <p className="text-sm text-gray-400">{sp.part.partNumber}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setAddlSelectedParts((prev) => prev.map((p) => p.part.id === sp.part.id ? { ...p, qty: Math.max(1, p.qty - 1) } : p))}
                                    className="w-5 h-5 rounded border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-bold cursor-pointer bg-white flex items-center justify-center transition-colors"
                                  >−</button>
                                  <span className="text-sm font-medium w-5 text-center">{sp.qty}</span>
                                  <button
                                    onClick={() => setAddlSelectedParts((prev) => prev.map((p) => p.part.id === sp.part.id ? { ...p, qty: p.qty + 1 } : p))}
                                    className="w-5 h-5 rounded border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-bold cursor-pointer bg-white flex items-center justify-center transition-colors"
                                  >+</button>
                                  <span className="text-sm text-gray-400 ml-0.5">{sp.part.unit}</span>
                                </div>
                                <span className="text-sm font-semibold text-[#1E1E1E] shrink-0 ml-1">
                                  {(sp.qty * sp.part.unitPrice).toLocaleString()} ฿
                                </span>
                                <button
                                  onClick={() => setAddlSelectedParts((prev) => prev.filter((p) => p.part.id !== sp.part.id))}
                                  className="text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-sm transition-colors shrink-0"
                                >✕</button>
                              </div>
                            ))}
                            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                              <span className="text-sm text-gray-400">รวมทั้งหมด</span>
                              <span className="text-sm font-bold text-[#1E1E1E]">
                                {addlSelectedParts.reduce((s, sp) => s + sp.qty * sp.part.unitPrice, 0).toLocaleString()} ฿
                              </span>
                            </div>
                          </div>
                        )}

                        {!addlQuotationSent && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setAddlPartsModalOpen(true)}
                              className="w-full flex items-center justify-between border-2 border-dashed border-gray-200 hover:border-[#F8981D] rounded-xl px-4 py-3 bg-transparent cursor-pointer transition-colors group"
                            >
                              <span className="text-sm text-gray-400 group-hover:text-[#F8981D] transition-colors">
                                {addlSelectedParts.length > 0
                                  ? `เลือกแล้ว ${addlSelectedParts.length} รายการ — แก้ไข`
                                  : 'เพิ่มอะไหล่ที่ต้องใช้เพิ่มเติม...'}
                              </span>
                              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#F8981D] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setAddlQuotPreview(true)}
                              disabled={addlSelectedParts.length === 0}
                              className="w-full bg-[#F8981D] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                            >
                              ดูและส่งใบเสนอราคาเพิ่มเติม
                            </button>
                          </div>
                        )}

                        {addlQuotationSent && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-1">
                              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                              <p className="text-green-700 text-sm font-medium">ส่งใบเสนอราคาเพิ่มเติมแล้ว</p>
                            </div>
                            <button
                              onClick={() => setAddlQuotPreview(true)}
                              className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F8981D] hover:text-[#F8981D] rounded-xl py-2.5 text-sm text-gray-500 bg-transparent cursor-pointer transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              ดูใบเสนอราคาเพิ่มเติม
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── รอตรวจ: QC inspection ── */}
              {job.status === 'รอตรวจ' && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                  <p className="text-sm text-gray-400 uppercase tracking-wide">ตรวจสอบงาน (QC)</p>

                  {!qcSubmitted ? (
                    <>
                      {/* Pass / Fail selector */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setQcResult('pass')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${
                            qcResult === 'pass'
                              ? 'border-[#44403C] bg-[#44403C]/5 text-[#44403C]'
                              : 'border-gray-200 bg-white text-gray-400 hover:border-[#44403C]/40 hover:text-[#44403C]'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          ผ่าน
                        </button>
                        <button
                          onClick={() => setQcResult('fail')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${
                            qcResult === 'fail'
                              ? 'border-[#F8981D] bg-[#F8981D]/5 text-[#F8981D]'
                              : 'border-gray-200 bg-white text-gray-400 hover:border-[#F8981D]/40 hover:text-[#F8981D]'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          ไม่ผ่าน
                        </button>
                      </div>

                      {/* Note — required for fail, optional for pass */}
                      {qcResult !== '' && (
                        <textarea
                          value={qcNote}
                          onChange={(e) => setQcNote(e.target.value)}
                          placeholder={qcResult === 'fail' ? 'ระบุสิ่งที่ต้องแก้ไข...' : 'หมายเหตุเพิ่มเติม (ถ้ามี)...'}
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors resize-none"
                        />
                      )}

                      {qcResult === 'pass' && (
                        <button
                          onClick={() => setConfirmAction('qcPass')}
                          className="w-full bg-[#44403C] hover:bg-black text-white text-sm font-semibold py-2.5 rounded-xl border-none cursor-pointer transition-colors"
                        >
                          ยืนยัน — ส่งต่อขั้นตอนทำความสะอาด
                        </button>
                      )}

                      {qcResult === 'fail' && (
                        <button
                          onClick={() => { if (qcNote.trim()) setConfirmAction('qcFail') }}
                          disabled={!qcNote.trim()}
                          className="w-full bg-[#F8981D] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl border-none cursor-pointer transition-colors"
                        >
                          ส่งกลับช่างแก้ไข
                        </button>
                      )}
                    </>
                  ) : qcResult === 'pass' ? (
                    <>
                    <div className="bg-[#44403C]/5 border border-[#44403C]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#44403C]/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-[#44403C]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#44403C]">ผ่านการตรวจ</p>
                        <p className="text-sm text-[#44403C]/60 mt-0.5">ส่งต่อขั้นตอนทำความสะอาดแล้ว</p>
                      </div>
                    </div>

                    {/* Final quotation */}
                    {!quotSent ? (
                      <div className="flex flex-col gap-3">
                        {/* Dashed trigger */}
                        {!showQuot ? (
                          <button
                            onClick={() => setShowQuot(true)}
                            className="w-full flex items-center justify-between border-2 border-dashed border-gray-200 hover:border-[#F8981D] rounded-xl px-4 py-3 bg-transparent cursor-pointer transition-colors group"
                          >
                            <span className="text-sm text-gray-400 group-hover:text-[#F8981D] transition-colors">
                              {quotItems.length > 0 ? `${quotItems.length} รายการ — แก้ไข` : 'สร้างใบเสนอราคา...'}
                            </span>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-[#F8981D] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        ) : (
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                              <div>
                                <p className="text-sm font-semibold text-[#1E1E1E]">ใบเสนอราคา</p>
                                <p className="text-sm text-gray-400 mt-0.5">{formatMotorcycleName(job.brand, job.model)} · {job.customerName}</p>
                              </div>
                              <button onClick={() => setShowQuot(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
                            </div>

                            <div className="p-4 flex flex-col gap-3">
                              {/* Items list */}
                              {quotItems.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  {quotItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#1E1E1E] truncate">{item.name}</p>
                                        <p className="text-sm text-gray-400">{item.qty} × {item.unitPrice.toLocaleString()} ฿</p>
                                      </div>
                                      <span className="text-sm font-medium text-[#1E1E1E] shrink-0">{(item.qty * item.unitPrice).toLocaleString()} ฿</span>
                                      <button onClick={() => setQuotItems((p) => p.filter((i) => i.id !== item.id))}
                                        className="text-gray-300 hover:text-[#F8981D] bg-transparent border-none cursor-pointer text-sm shrink-0 transition-colors">✕</button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add item row */}
                              <div className="flex gap-2">
                                <input value={quotName} onChange={(e) => setQuotName(e.target.value)}
                                  placeholder="รายการ / อะไหล่..."
                                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-9 shrink-0">
                                  <button onClick={() => setQuotQty((q) => Math.max(1, q - 1))}
                                    className="w-8 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">−</button>
                                  <span className="w-6 text-center text-sm font-medium text-[#1E1E1E]">{quotQty}</span>
                                  <button onClick={() => setQuotQty((q) => q + 1)}
                                    className="w-8 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-50 bg-transparent border-none cursor-pointer font-bold transition-colors">+</button>
                                </div>
                                <div className="relative shrink-0">
                                  <input type="text" inputMode="numeric" value={quotPrice}
                                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setQuotPrice(v === '' ? '' : Number(v)) }}
                                    placeholder="ราคา"
                                    className="w-24 border border-gray-200 rounded-xl pl-3 pr-6 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">฿</span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (!quotName.trim() || !quotPrice) return
                                    setQuotItems((p) => [...p, { id: Date.now(), name: quotName.trim(), qty: quotQty, unitPrice: Number(quotPrice) }])
                                    setQuotName(''); setQuotQty(1); setQuotPrice(0)
                                  }}
                                  className="h-9 px-3 bg-[#44403C] hover:bg-black text-white text-sm rounded-xl border-none cursor-pointer transition-colors shrink-0"
                                >
                                  เพิ่ม
                                </button>
                              </div>

                              {/* Labor cost */}
                              <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                <span className="text-sm text-[#1E1E1E] shrink-0">ค่าแรง</span>
                                <div className="relative">
                                  <input type="text" inputMode="numeric" value={laborCost}
                                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setLaborCost(v === '' ? '' : Number(v)) }}
                                    placeholder="0"
                                    className="w-32 border border-gray-200 rounded-xl pl-3 pr-6 py-2 text-sm text-right outline-none focus:border-[#F8981D] transition-colors" />
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">฿</span>
                                </div>
                              </div>

                              {/* Total */}
                              {(quotItems.length > 0 || Number(laborCost) > 0) && (
                                <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50 rounded-xl">
                                  <span className="text-sm font-semibold text-[#1E1E1E]">รวมทั้งหมด</span>
                                  <span className="text-base font-bold text-[#1E1E1E]">
                                    {(quotItems.reduce((s, i) => s + i.qty * i.unitPrice, 0) + Number(laborCost)).toLocaleString()} ฿
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Footer actions */}
                            <div className="flex border-t border-gray-100">
                              <button onClick={() => setShowQuot(false)}
                                className="flex-1 py-3 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none border-r border-gray-100 cursor-pointer transition-colors">
                                บันทึกร่าง
                              </button>
                              <button
                                onClick={() => { setQuotPreview(true) }}
                                className="flex-1 py-3 text-sm font-semibold text-white bg-[#F8981D] hover:bg-orange-500 border-none cursor-pointer transition-colors"
                              >
                                สร้างใบเสนอราคา
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#44403C]">ส่งใบเสนอราคาแล้ว</p>
                          <p className="text-sm text-[#44403C]/60 mt-0.5">
                            รวม {(quotItems.reduce((s, i) => s + i.qty * i.unitPrice, 0) + Number(laborCost)).toLocaleString()} ฿ · รอลูกค้ายืนยัน
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-[#44403C]/40 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    </>
                  ) : (
                    <div className="bg-[#F8981D]/5 border border-[#F8981D]/30 rounded-xl px-4 py-3.5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F8981D]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F8981D]">ไม่ผ่าน — ส่งกลับช่างแก้ไขแล้ว</p>
                        {qcNote && <p className="text-sm text-[#F8981D]/80 mt-1 leading-relaxed">{qcNote}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  )
}
