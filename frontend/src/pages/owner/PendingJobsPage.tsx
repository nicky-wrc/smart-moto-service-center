import { useState } from 'react'

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

const pendingJobs: PendingJob[] = [
  { id: 1,  customer: 'สมชาย ใจดี',      phone: '081-234-5678', brand: 'Honda PCX 160',       licensePlate: 'กก 999',  symptom: 'เครื่องสตาร์ทไม่ติด มีเสียงดังผิดปกติ', status: 'รอประเมิน',        mechanic: '-',     receivedAt: '07/03/2026', daysOpen: 1 },
  { id: 2,  customer: 'วิภา รักสะอาด',   phone: '089-876-5432', brand: 'Yamaha NMAX 155',      licensePlate: 'คง 5678', symptom: 'เบรกหน้าไม่ค่อยกิน น้ำมันเบรกรั่ว',    status: 'รอลูกค้าอนุมัติ', mechanic: '-',     receivedAt: '07/03/2026', daysOpen: 1 },
  { id: 3,  customer: 'ประเสริฐ มั่นคง', phone: '062-111-2233', brand: 'Honda Wave 125i',      licensePlate: 'จฉ 9012', symptom: 'ไฟหน้าไม่ติด ระบบไฟผิดปกติ',           status: 'พร้อมซ่อม',       mechanic: 'วิชัย', receivedAt: '07/03/2026', daysOpen: 1 },
  { id: 4,  customer: 'นภา สุขสันต์',    phone: '095-444-5566', brand: 'Suzuki Burgman 200',   licensePlate: 'ชซ 3456', symptom: 'รถวิ่งแล้วสะดุด ไม่ทราบอาการ',           status: 'กำลังดำเนินงาน', mechanic: 'สมชาย', receivedAt: '07/03/2026', daysOpen: 1 },
  { id: 5,  customer: 'ธนพล วิริยะ',     phone: '091-555-6677', brand: 'Honda Click 125i',    licensePlate: 'ญฐ 7890', symptom: 'เกียร์ไม่เข้า สายพานขาด',               status: 'รอสั่งซื้อ',      mechanic: '-',     receivedAt: '06/03/2026', daysOpen: 2 },
  { id: 6,  customer: 'มาลี สวัสดี',     phone: '092-666-7788', brand: 'Yamaha Aerox 155',     licensePlate: 'ดต 1234', symptom: 'น้ำมันรั่ว เครื่องร้อน',                status: 'รอตรวจ',          mechanic: 'ณัฐพล', receivedAt: '05/03/2026', daysOpen: 3 },
]

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
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด')

  const filtered = pendingJobs.filter(j => {
    const matchSearch = j.customer.includes(search) || j.licensePlate.includes(search) || j.brand.includes(search)
    const matchStatus = filterStatus === 'ทั้งหมด' || j.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F5] p-6 flex flex-col gap-5">

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#44403C] rounded-2xl p-4">
          <div className="text-xs text-stone-300">งานค้างทั้งหมด</div>
          <div className="text-xl font-bold text-white mt-1">{pendingJobs.length} ใบงาน</div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl p-4">
          <div className="text-xs text-orange-100">รอการดำเนินการ</div>
          <div className="text-xl font-bold text-white mt-1">{pendingJobs.filter(j => ['รอประเมิน','รอลูกค้าอนุมัติ'].includes(j.status)).length} ใบงาน</div>
        </div>
        <div className="bg-stone-200 border border-stone-300 rounded-2xl p-4">
          <div className="text-xs text-stone-500">กำลังซ่อม</div>
          <div className="text-xl font-bold text-[#44403C] mt-1">{pendingJobs.filter(j => j.status === 'กำลังดำเนินงาน').length} ใบงาน</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="text-xs text-gray-400">ค้างนาน (≥2 วัน)</div>
          <div className="text-xl font-bold text-red-500 mt-1">{pendingJobs.filter(j => j.daysOpen >= 2).length} ใบงาน</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64 shrink-0">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาลูกค้า / ทะเบียน / รุ่นรถ..."
            className="w-full bg-white border border-stone-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-wrap flex-1">
          {allStatuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-none transition-colors ${filterStatus === s ? 'bg-[#44403C] text-white' : 'bg-white text-gray-500 hover:bg-stone-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-100">
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
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">ไม่มีรายการ</td></tr>
            )}
            {filtered.map(job => (
              <tr key={job.id} className="hover:bg-stone-50">
                <td className="px-5 py-4">
                  <span className="text-xs font-bold text-gray-300">#{job.id}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-[#1E1E1E]">{job.customer}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{job.brand} · {job.licensePlate}</div>
                  <div className="text-xs text-gray-400">{job.phone}</div>
                </td>
                <td className="px-5 py-4 max-w-[200px]">
                  <p className="text-gray-500 text-xs line-clamp-2">{job.symptom}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[job.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">{job.mechanic !== '-' ? job.mechanic : '-'}</td>
                <td className="px-5 py-4 text-center text-xs text-gray-500">{job.receivedAt}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${job.daysOpen >= 3 ? 'bg-red-100 text-red-500' : job.daysOpen >= 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                    {job.daysOpen} วัน
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
