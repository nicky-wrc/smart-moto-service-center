import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

/* ── Map backend JobStatus → Thai label ── */
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอประเมิน',
  IN_PROGRESS: 'กำลังดำเนินงาน',
  WAITING_PARTS: 'รอสั่งซื้อ',
  QC_PENDING: 'รอตรวจ',
  CLEANING: 'ล้างรถ',
  READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จสิ้น',
  PAID: 'ชำระแล้ว',
  CANCELLED: 'ยกเลิก',
}

const columns = [
  { status: 'PENDING',       label: 'รอประเมิน',       dot: 'bg-[#F8981D]' },
  { status: 'WAITING_PARTS', label: 'รอสั่งซื้อ',      dot: 'bg-stone-400' },
  { status: 'IN_PROGRESS',   label: 'กำลังดำเนินงาน',  dot: 'bg-[#F8981D]' },
  { status: 'QC_PENDING',    label: 'รอตรวจ',          dot: 'bg-[#44403C]/60' },
  { status: 'CLEANING',      label: 'ล้างรถ',          dot: 'bg-stone-300' },
  { status: 'READY_FOR_DELIVERY', label: 'พร้อมส่งมอบ', dot: 'bg-[#44403C]' },
]

const statusConfig: Record<string, { bg: string; text: string }> = {
  PENDING:              { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]' },
  IN_PROGRESS:          { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]' },
  WAITING_PARTS:        { bg: 'bg-stone-100',    text: 'text-stone-500' },
  QC_PENDING:           { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
  CLEANING:             { bg: 'bg-stone-100',    text: 'text-stone-500' },
  READY_FOR_DELIVERY:   { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
  COMPLETED:            { bg: 'bg-green-100',    text: 'text-green-600' },
  PAID:                 { bg: 'bg-green-100',    text: 'text-green-600' },
  CANCELLED:            { bg: 'bg-red-100',      text: 'text-red-500' },
}

type ViewMode = 'table' | 'board'

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

function formatDate(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(d: string) {
  const dt = new Date(d)
  return dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
}

export default function JobOrdersPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('board')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/jobs')
      .then(data => { setJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const q = search.trim().toLowerCase()
  const filteredJobs = q
    ? jobs.filter((j) => [
        j.motorcycle?.brand, j.motorcycle?.model, j.motorcycle?.owner?.firstName,
        j.motorcycle?.owner?.lastName, j.motorcycle?.licensePlate, j.symptom
      ].some(v => v?.toLowerCase().includes(q)))
    : jobs

  // Exclude finished statuses from active board
  const activeJobs = filteredJobs.filter(j => !['PAID', 'CANCELLED', 'COMPLETED'].includes(j.status))

  const total = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const visibleJobs = filteredJobs.slice((page - 1) * perPage, page * perPage)
  const pageNumbers = getPageNumbers(page, totalPages)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F8981D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="shrink-0 px-5 py-3 bg-[#F5F5F5] flex items-center gap-3">

        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า ทะเบียน รุ่นรถ หรืออาการ..."
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
          />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shrink-0">
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${
              view === 'table' ? 'bg-[#1E1E1E] text-white' : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Table
          </button>
          <button
            onClick={() => setView('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${
              view === 'board' ? 'bg-[#1E1E1E] text-white' : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Board
          </button>
        </div>
      </div>

      {/* ── BOARD VIEW ── */}
      {view === 'board' && (
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-4 p-5 h-full">
            {columns.map((col) => {
              const colJobs = activeJobs.filter((j) => j.status === col.status)
              return (
                <div key={col.status} className="flex flex-col rounded-2xl overflow-hidden flex-1 min-w-0 bg-stone-50/80">
                  {/* Column header */}
                  <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-white/80">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                      <span className="text-sm font-semibold text-[#1E1E1E]">{col.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                    {colJobs.length === 0 && (
                      <p className="text-center text-sm text-gray-300 mt-6">ไม่มีรายการ</p>
                    )}
                    {colJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                        className="bg-white rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all border border-white hover:border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 font-medium">{job.jobNo}</span>
                          <span className="text-xs text-gray-300">{formatTime(job.createdAt)}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#1E1E1E] leading-snug">
                          {job.motorcycle?.brand} {job.motorcycle?.model}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {job.motorcycle?.owner?.firstName} {job.motorcycle?.owner?.lastName} · {job.motorcycle?.licensePlate}
                        </p>
                        <p className="text-xs text-gray-400 italic mt-1.5 line-clamp-2">"{job.symptom}"</p>
                        {job.tags?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-2.5">
                            {job.tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                          <span className="text-xs text-gray-400">{job.reception?.name || '-'}</span>
                          <span className="text-xs text-gray-300">{job.technician?.name || 'ยังไม่มอบหมาย'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'table' && (
        <div className="flex-1 overflow-hidden flex flex-col px-5">
          <div className="flex-1 overflow-hidden flex flex-col rounded-2xl">
            <div className="shrink-0 px-5 bg-white border-b border-gray-100">
              <div className="grid text-xs font-semibold text-gray-400 uppercase tracking-wider py-2.5" style={{ gridTemplateColumns: '80px 1fr 1fr 200px 120px 28px' }}>
                <span>#</span>
                <span>ลูกค้า / รถ</span>
                <span>อาการ</span>
                <span>สถานะ / แท็ก</span>
                <span>วันที่รับ</span>
                <span />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {visibleJobs.length === 0 && (
                <p className="text-center text-sm text-gray-400 mt-16">ไม่มีรายการ</p>
              )}
              {visibleJobs.map((job, idx) => {
                const s = statusConfig[job.status] || { bg: 'bg-gray-100', text: 'text-gray-500' }
                const customerName = `${job.motorcycle?.owner?.firstName || ''} ${job.motorcycle?.owner?.lastName || ''}`.trim()
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                    className={`grid items-center gap-x-4 px-5 py-3.5 cursor-pointer border-b border-gray-50 hover:bg-[#F8981D]/5 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                    style={{ gridTemplateColumns: '80px 1fr 1fr 200px 120px 28px' }}
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-300 group-hover:text-[#F8981D] transition-colors">{job.jobNo}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1E1E1E] truncate">{customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {job.motorcycle?.brand} {job.motorcycle?.model} · <span className="font-medium">{job.motorcycle?.licensePlate}</span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500 truncate">{job.symptom}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${s.bg} ${s.text}`}>
                        {STATUS_LABEL[job.status] || job.status}
                      </span>
                      {job.tags?.slice(0, 1).map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{formatDate(job.createdAt)}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{formatTime(job.createdAt)}</p>
                    </div>
                    <div className="flex justify-end">
                      <svg className="w-4 h-4 text-gray-200 group-hover:text-[#F8981D] transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Pagination */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{total === 0 ? '0 รายการ' : `${start}–${end} จาก ${total} รายการ`}</span>
              <span className="text-gray-200">·</span>
              <span>แถวละ</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#F8981D] transition-colors cursor-pointer bg-white"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {pageNumbers.map((n, i) =>
                n === '...' ? (
                  <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-full text-sm font-medium border-none cursor-pointer transition-colors ${n === page ? 'bg-[#F8981D] text-white' : 'text-gray-500 hover:bg-gray-100 bg-transparent'}`}>
                    {n}
                  </button>
                )
              )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
