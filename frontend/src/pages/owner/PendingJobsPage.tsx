import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Pagination from '../../components/Pagination'

type PendingJob = {
  id: number
  customer: string
  phone: string
  brand: string
  licensePlate: string
  symptom: string
  status: string
  mechanic: string
  receivedAt: string
  daysOpen: number
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'รอประเมิน',
  IN_PROGRESS: 'กำลังดำเนินงาน',
  WAITING_PARTS: 'รอสั่งซื้อ',
  COMPLETED: 'รอตรวจ',
}

const statusColor: Record<string, string> = {
  'รอประเมิน':       'bg-[#F8981D]/15 text-[#F8981D]',
  'รอลูกค้าอนุมัติ': 'bg-stone-100 text-stone-500',
  'พร้อมซ่อม':       'bg-[#44403C]/10 text-[#44403C]',
  'กำลังดำเนินงาน': 'bg-[#F8981D]/15 text-[#F8981D]',
  'รอตรวจ':          'bg-[#44403C]/10 text-[#44403C]',
  'รอสั่งซื้อ':      'bg-stone-100 text-stone-500',
}

const allStatuses = ['ทั้งหมด', 'รอประเมิน', 'รอลูกค้าอนุมัติ', 'พร้อมซ่อม', 'กำลังดำเนินงาน', 'รอสั่งซื้อ', 'รอตรวจ']

export default function PendingJobsPage() {
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด')
  const [page, setPage]       = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/jobs').then(data => {
      const active = data.filter(j => !['PAID', 'CANCELLED'].includes(j.status))
      const now = Date.now()
      const mapped: PendingJob[] = active.map(j => {
        const created = new Date(j.createdAt).getTime()
        const daysOpen = Math.max(1, Math.ceil((now - created) / 86400000))
        return {
          id: j.id,
          customer: `${j.motorcycle?.owner?.firstName ?? ''} ${j.motorcycle?.owner?.lastName ?? ''}`.trim() || '-',
          phone: j.motorcycle?.owner?.phoneNumber ?? '-',
          brand: `${j.motorcycle?.brand ?? ''} ${j.motorcycle?.model ?? ''}`.trim(),
          licensePlate: j.motorcycle?.licensePlate ?? '-',
          symptom: j.symptom ?? '-',
          status: STATUS_MAP[j.status] || j.status,
          mechanic: j.technician?.name ?? '-',
          receivedAt: new Date(j.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          daysOpen,
        }
      })
      setPendingJobs(mapped)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = pendingJobs.filter(j => {
    const matchSearch = j.customer.includes(search) || j.licensePlate.includes(search) || j.brand.includes(search)
    const matchStatus = filterStatus === 'ทั้งหมด' || j.status === filterStatus
    return matchSearch && matchStatus
  })

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)))
  const visible  = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">
      {/* Summary + filter — always visible */}
      <div className="shrink-0 p-6 pb-0 flex flex-col gap-5">

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#44403C] rounded-2xl p-5">
          <div className="text-sm text-stone-300">งานค้างทั้งหมด</div>
          <div className="text-3xl font-bold text-white mt-1">{pendingJobs.length}</div>
          <div className="text-xs text-stone-400 mt-1">ใบงาน</div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl p-5">
          <div className="text-sm text-orange-100">รอการดำเนินการ</div>
          <div className="text-3xl font-bold text-white mt-1">{pendingJobs.filter(j => ['รอประเมิน','รอลูกค้าอนุมัติ'].includes(j.status)).length}</div>
          <div className="text-xs text-orange-200 mt-1">ใบงาน</div>
        </div>
        <div className="bg-stone-200 rounded-2xl p-5">
          <div className="text-sm text-stone-500">กำลังซ่อม</div>
          <div className="text-3xl font-bold text-[#44403C] mt-1">{pendingJobs.filter(j => j.status === 'กำลังดำเนินงาน').length}</div>
          <div className="text-xs text-stone-400 mt-1">ใบงาน</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-sm text-gray-400">ค้างนาน (≥2 วัน)</div>
          <div className="text-3xl font-bold text-red-500 mt-1">{pendingJobs.filter(j => j.daysOpen >= 2).length}</div>
          <div className="text-xs text-stone-400 mt-1">ใบงาน</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาลูกค้า / ทะเบียน / รุ่นรถ..."
            className="w-full bg-white border border-stone-200 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors" />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          {allStatuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-colors ${filterStatus === s ? 'bg-[#44403C] text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      </div>{/* end shrink-0 */}

      {/* Table — takes remaining space with internal scroll */}
      <div className="flex-1 overflow-hidden px-6 pt-5 flex flex-col">
      <div className="flex-1 overflow-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-stone-100 z-10">
            <tr>
              <th className="px-5 py-4 text-left font-medium text-gray-600 rounded-l-2xl">#</th>
              <th className="px-5 py-4 text-left font-medium text-gray-600">ลูกค้า / รถ</th>
              <th className="px-5 py-4 text-left font-medium text-gray-600">อาการ</th>
              <th className="px-5 py-4 text-left font-medium text-gray-600">สถานะ</th>
              <th className="px-5 py-4 text-left font-medium text-gray-600">ช่าง</th>
              <th className="px-5 py-4 text-center font-medium text-gray-600">วันที่รับ</th>
              <th className="px-5 py-4 text-center font-medium text-gray-600 rounded-r-2xl">ค้างมา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">ไม่มีรายการ</td></tr>
            )}
            {visible.map(job => (
              <tr key={job.id} className="hover:bg-stone-50">
                <td className="px-5 py-4">
                  <span className="text-xs font-bold text-gray-300">#{job.id}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-[#1E1E1E]">{job.customer}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{job.brand} · {job.licensePlate}</div>
                  <div className="text-xs text-gray-400">{job.phone}</div>
                </td>
                <td className="px-5 py-4 max-w-50">
                  <p className="text-gray-500 text-sm line-clamp-2">{job.symptom}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor[job.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-600 text-sm">{job.mechanic !== '-' ? job.mechanic : '-'}</td>
                <td className="px-5 py-4 text-center text-sm text-gray-600">{job.receivedAt}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${job.daysOpen >= 3 ? 'bg-red-100 text-red-500' : job.daysOpen >= 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                    {job.daysOpen} วัน
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>{/* end table flex-1 */}

      <Pagination
        page={safePage} perPage={perPage} total={filtered.length}
        onPageChange={setPage} onPerPageChange={setPerPage}
      />
    </div>
  )
}
