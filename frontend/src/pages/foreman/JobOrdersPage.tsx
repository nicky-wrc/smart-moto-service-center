import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { JobOrder } from './jobs'
import { mockJobs } from './jobs'

const columns: { status: JobOrder['status']; label: string; dot: string; colBg: string; headerBg: string }[] = [
  { status: 'รอประเมิน',        label: 'รอประเมิน',        dot: 'bg-[#F8981D]',    colBg: 'bg-stone-50/80', headerBg: 'bg-white/80' },
  { status: 'รอลูกค้าอนุมัติ',  label: 'รอลูกค้าอนุมัติ',  dot: 'bg-stone-300',    colBg: 'bg-stone-50/80', headerBg: 'bg-white/80' },
  { status: 'รอสั่งซื้อ',       label: 'รอสั่งซื้อ',       dot: 'bg-stone-400',    colBg: 'bg-stone-50/80', headerBg: 'bg-white/80' },
  { status: 'พร้อมซ่อม',        label: 'พร้อมซ่อม',        dot: 'bg-[#44403C]',    colBg: 'bg-stone-50/80', headerBg: 'bg-white/80' },
  { status: 'กำลังดำเนินงาน',   label: 'กำลังดำเนินงาน',   dot: 'bg-[#F8981D]',    colBg: 'bg-stone-50/80', headerBg: 'bg-white/80' },
  { status: 'รอตรวจ',           label: 'รอตรวจ',           dot: 'bg-[#44403C]/60', colBg: 'bg-stone-50/80', headerBg: 'bg-white/80' },
]

const statusConfig = {
  'รอประเมิน':       { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]' },
  'รอลูกค้าอนุมัติ': { bg: 'bg-stone-100',    text: 'text-stone-500' },
  'พร้อมซ่อม':       { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
  'รอสั่งซื้อ':      { bg: 'bg-stone-100',    text: 'text-stone-500' },
  'ตรวจเชิงลึก':    { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
  'กำลังดำเนินงาน': { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]' },
  'รอตรวจ':         { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
}

type ViewMode = 'list' | 'board'

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export default function JobOrdersPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('board')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const q = search.trim().toLowerCase()
  const filteredJobs = q
    ? mockJobs.filter((j) => [j.brand, j.model, j.customerName, j.licensePlate, j.symptom]
        .some((v) => v.toLowerCase().includes(q)))
    : mockJobs

  const total = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const visibleJobs = filteredJobs.slice((page - 1) * perPage, page * perPage)
  const pageNumbers = getPageNumbers(page, totalPages)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }

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
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${
              view === 'list' ? 'bg-[#1E1E1E] text-white' : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
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
              const colJobs = filteredJobs.filter((j) => j.status === col.status)
              return (
                <div key={col.status} className={`flex flex-col rounded-2xl overflow-hidden flex-1 min-w-0 ${col.colBg}`}>
                  {/* Column header */}
                  <div className={`px-4 py-3 flex items-center justify-between shrink-0 ${col.headerBg}`}>
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
                        className={`bg-white rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all border hover:border-gray-100 ${
                          job.mechanicReport ? 'border-amber-200' : 'border-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400 font-medium">คำขอที่ {job.id}</span>
                          <span className="text-sm text-gray-300">{job.receivedAt.split('  ')[1]}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#1E1E1E] leading-snug">{job.brand} {job.model}</p>
                        <p className="text-sm text-gray-400 mt-0.5">{job.customerName} · {job.licensePlate}</p>
                        <p className="text-sm text-gray-400 italic mt-1.5 line-clamp-2">"{job.symptom}"</p>
                        {job.tags.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-2.5">
                            {job.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-sm px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {job.mechanicReport && (
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-2.5">
                            <svg className="w-3 h-3 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-600">ช่างรายงานปัญหาเพิ่มเติม</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                          <span className="text-sm text-gray-400">{job.receptionist}</span>
                          <span className="text-sm text-gray-300">{job.photos.length} รูป</span>
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
      {view === 'list' && (
        <>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {visibleJobs.length === 0 && (
              <p className="text-center text-sm text-gray-400 mt-10">ไม่มีรายการ</p>
            )}
            {visibleJobs.map((job) => {
              const s = statusConfig[job.status]
              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-stretch">
                    <div className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2.5 flex items-center rounded-br-xl shrink-0">
                      คำขอที่ {job.id}
                    </div>
                    <div className="flex items-center gap-2 px-3 flex-1 flex-wrap min-w-0">
                      <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>{job.status}</span>
                      {job.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-sm px-2.5 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D] border border-[#F8981D]/20">{tag}</span>
                      ))}
                      {job.mechanicReport && (
                        <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          </svg>
                          มีปัญหาเพิ่มเติม
                        </span>
                      )}
                    </div>
                    <div className="flex items-center pr-4 shrink-0">
                      <span className="text-sm text-gray-400">{job.receivedAt}</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#F8981D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{job.receptionist} · {job.brand} {job.model}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#F8981D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="truncate">{job.licensePlate} · {job.province}</span>
                    </div>
                    <p className="text-sm text-gray-400 italic truncate">"{job.symptom}"</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>แสดง</span>
              <input
                type="number" value={perPage} min={1}
                onChange={(e) => { setPerPage(Math.max(1, Number(e.target.value))); setPage(1) }}
                className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm outline-none focus:border-[#F8981D] transition-colors"
              />
              <span>{total === 0 ? '0' : `${start}–${end}`} จาก {total}</span>
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
        </>
      )}

    </div>
  )
}
