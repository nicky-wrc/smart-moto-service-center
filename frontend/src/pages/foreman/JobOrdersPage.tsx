import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type JobOrder = {
  id: number
  receptionist: string
  brand: string
  model: string
  licensePlate: string
  province: string
  symptom: string
  receivedAt: string
  status: 'รอประเมิน' | 'รอลูกค้าอนุมัติ' | 'พร้อมซ่อม' | 'รอสั่งซื้อ' | 'ตรวจเชิงลึก'
  customerName: string
  customerPhone: string
  tags: string[]
  photos: string[]
}

export const mockJobs: JobOrder[] = [
  {
    id: 1, receptionist: 'พีพี', brand: 'Honda', model: 'PCX 160',
    licensePlate: 'กก 999', province: 'กรุงเทพมหานคร',
    symptom: 'เครื่องสตาร์ทไม่ติด มีเสียงดังผิดปกติ',
    receivedAt: '07/03/2026  09:30 น.', status: 'รอประเมิน',
    customerName: 'สมชาย ใจดี', customerPhone: '081-234-5678',
    tags: ['เครื่องยนต์'],
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2',
    ],
  },
  {
    id: 2, receptionist: 'พีพี', brand: 'Yamaha', model: 'NMAX 155',
    licensePlate: 'คง 5678', province: 'นนทบุรี',
    symptom: 'เบรกหน้าไม่ค่อยกิน น้ำมันเบรกรั่ว',
    receivedAt: '07/03/2026  10:15 น.', status: 'รอลูกค้าอนุมัติ',
    customerName: 'วิภา รักสะอาด', customerPhone: '089-876-5432',
    tags: ['เบรก'],
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
    ],
  },
  {
    id: 3, receptionist: 'นิค', brand: 'Honda', model: 'Wave 125i',
    licensePlate: 'จฉ 9012', province: 'ปทุมธานี',
    symptom: 'ไฟหน้าไม่ติด ระบบไฟผิดปกติ',
    receivedAt: '07/03/2026  11:00 น.', status: 'พร้อมซ่อม',
    customerName: 'ประเสริฐ มั่นคง', customerPhone: '062-111-2233',
    tags: ['ไฟฟ้า'],
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2',
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+3',
    ],
  },
  {
    id: 4, receptionist: 'นิค', brand: 'Suzuki', model: 'Burgman 200',
    licensePlate: 'ชซ 3456', province: 'สมุทรปราการ',
    symptom: 'ไม่ทราบอาการ รถวิ่งแล้วสะดุด',
    receivedAt: '07/03/2026  11:45 น.', status: 'ตรวจเชิงลึก',
    customerName: 'นภา สุขสันต์', customerPhone: '095-444-5566',
    tags: ['เครื่องยนต์', 'ช่วงล่าง'],
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
    ],
  },
  {
    id: 5, receptionist: 'พีพี', brand: 'Kawasaki', model: 'Z400',
    licensePlate: 'ญฐ 7890', province: 'กรุงเทพมหานคร',
    symptom: 'เปลี่ยนน้ำมันเครื่อง และตรวจเช็คทั่วไป',
    receivedAt: '07/03/2026  13:00 น.', status: 'รอสั่งซื้อ',
    customerName: 'ธนพล วิริยะ', customerPhone: '083-777-8899',
    tags: ['บำรุงรักษา'],
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2',
    ],
  },
]

const statusConfig = {
  'รอประเมิน':       { bg: 'bg-amber-100',  text: 'text-amber-700' },
  'รอลูกค้าอนุมัติ': { bg: 'bg-blue-100',   text: 'text-blue-700' },
  'พร้อมซ่อม':       { bg: 'bg-green-100',  text: 'text-green-700' },
  'รอสั่งซื้อ':      { bg: 'bg-purple-100', text: 'text-purple-700' },
  'ตรวจเชิงลึก':    { bg: 'bg-red-100',    text: 'text-red-700' },
}

type FilterKey = 'ทั้งหมด' | 'ยังไม่จัดการ' | 'รอลูกค้า' | 'รอตรวจ'

const filters: { key: FilterKey; label: string; statuses?: JobOrder['status'][] }[] = [
  { key: 'ทั้งหมด',      label: 'ทั้งหมด' },
  { key: 'ยังไม่จัดการ', label: 'ยังไม่จัดการ', statuses: ['รอประเมิน', 'ตรวจเชิงลึก'] },
  { key: 'รอลูกค้า',     label: 'รอลูกค้าตอบกลับ', statuses: ['รอลูกค้าอนุมัติ', 'รอสั่งซื้อ'] },
  { key: 'รอตรวจ',       label: 'รอมอบหมายช่าง', statuses: ['พร้อมซ่อม'] },
]

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
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ทั้งหมด')
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filterDef = filters.find((f) => f.key === activeFilter)!
  const q = search.trim().toLowerCase()
  const filteredJobs = mockJobs
    .filter((j) => !filterDef.statuses || filterDef.statuses.includes(j.status))
    .filter((j) => !q || [j.brand, j.model, j.customerName, j.licensePlate, j.symptom]
      .some((v) => v.toLowerCase().includes(q)))

  const counts: Record<FilterKey, number> = {
    'ทั้งหมด':      mockJobs.length,
    'ยังไม่จัดการ': mockJobs.filter((j) => ['รอประเมิน', 'ตรวจเชิงลึก'].includes(j.status)).length,
    'รอลูกค้า':     mockJobs.filter((j) => ['รอลูกค้าอนุมัติ', 'รอสั่งซื้อ'].includes(j.status)).length,
    'รอตรวจ':       mockJobs.filter((j) => j.status === 'พร้อมซ่อม').length,
  }

  const total = filteredJobs.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const visibleJobs = filteredJobs.slice((page - 1) * perPage, page * perPage)
  const pageNumbers = getPageNumbers(page, totalPages)

  const handleFilterChange = (key: FilterKey) => {
    setActiveFilter(key)
    setPage(1)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handlePerPageChange = (val: number) => {
    setPerPage(Math.max(1, val))
    setPage(1)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Search + filter bar */}
      <div className="shrink-0 px-5 py-3 bg-[#F5F5F5] flex items-center gap-3">
        <div className="relative shrink-0">
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex items-center gap-2 bg-white border rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
              activeFilter !== 'ทั้งหมด'
                ? 'border-[#F8981D] text-[#F8981D]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span>ตัวกรอง</span>
            {activeFilter !== 'ทั้งหมด' && (
              <span className="bg-[#F8981D] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                1
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 overflow-hidden w-56">
              {filters.map((f, i) => (
                <button
                  key={f.key}
                  onClick={() => { handleFilterChange(f.key); setFilterOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer border-none text-left ${
                    i < filters.length - 1 ? 'border-b border-gray-50' : ''
                  } ${activeFilter === f.key ? 'bg-[#F8981D]/5 text-[#F8981D]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="font-medium">{f.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    activeFilter === f.key ? 'bg-[#F8981D]/15 text-[#F8981D]' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

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
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {visibleJobs.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">ไม่มีรายการในหมวดนี้</p>
        )}
        {visibleJobs.map((job) => {
          const s = statusConfig[job.status]
          return (
            <div
              key={job.id}
              onClick={() => navigate(`/foreman/jobs/${job.id}`)}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-sm transition-all"
            >
              {/* Hanging tag strip */}
              <div className="flex items-stretch">
                <div className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2.5 flex items-center rounded-br-xl shrink-0">
                  คำขอที่ {job.id}
                </div>
                <div className="flex items-center gap-2 px-3 flex-1 flex-wrap min-w-0">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                    {job.status}
                  </span>
                  {job.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D] border border-[#F8981D]/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center pr-4 shrink-0">
                  <span className="text-sm text-gray-400">{job.receivedAt}</span>
                </div>
              </div>

              {/* Body */}
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

      {/* Pagination bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>แสดง</span>
          <input
            type="number"
            value={perPage}
            min={1}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm outline-none focus:border-[#F8981D] transition-colors"
          />
          <span>{total === 0 ? '0' : `${start}–${end}`} จาก {total}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {pageNumbers.map((n, i) =>
            n === '...' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">…</span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-full text-sm font-medium border-none cursor-pointer transition-colors ${
                  n === page ? 'bg-[#F8981D] text-white' : 'text-gray-500 hover:bg-gray-100 bg-transparent'
                }`}
              >
                {n}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
