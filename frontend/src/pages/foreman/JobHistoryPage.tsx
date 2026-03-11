import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type HistoryJob = {
  id: number
  brand: string
  model: string
  licensePlate: string
  customerName: string
  symptom: string
  mechanic: string
  startedAt: string
  completedAt: string
  tags: string[]
}

const mockHistoryJobs: HistoryJob[] = [
  {
    id: 11, brand: 'Kawasaki', model: 'Ninja 250', licensePlate: 'ฎฏ 1122',
    customerName: 'อมร ศักดิ์ดี', symptom: 'ช่วงล่างแข็ง เปลี่ยนโช้คอัพ',
    mechanic: 'สมชาย ช่างดี', startedAt: '07/03/2026  13:00 น.',
    completedAt: '08/03/2026  09:00 น.', tags: ['ช่วงล่าง'],
  },
  {
    id: 12, brand: 'Yamaha', model: 'NMAX 155', licensePlate: 'ฐฑ 3344',
    customerName: 'สุดา วงศ์งาม', symptom: 'เบรกหน้าไม่กิน น้ำมันเบรกรั่ว',
    mechanic: 'วิชัย รักงาน', startedAt: '07/03/2026  10:00 น.',
    completedAt: '07/03/2026  16:30 น.', tags: ['เบรก'],
  },
  {
    id: 13, brand: 'Honda', model: 'Forza 300', licensePlate: 'ฒณ 5566',
    customerName: 'วีระ จันทร์ดี', symptom: 'เปลี่ยนหัวเทียน ล้างหัวฉีด',
    mechanic: 'ประยุทธ์ มือทอง', startedAt: '07/03/2026  09:00 น.',
    completedAt: '07/03/2026  14:00 น.', tags: ['เชื้อเพลิง', 'บำรุงรักษา'],
  },
]

export default function JobHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const jobs = q
    ? mockHistoryJobs.filter((j) =>
        [j.brand, j.model, j.licensePlate, j.customerName, j.mechanic, j.symptom]
          .some((v) => v.toLowerCase().includes(q))
      )
    : mockHistoryJobs

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="shrink-0 px-5 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า ทะเบียน รุ่นรถ หรือช่าง..."
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] focus:bg-white transition-colors"
          />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="rounded-2xl overflow-hidden">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-gray-200">
              <th className="text-left text-sm font-semibold text-gray-400 pl-5 pr-3 py-3 w-24">คำขอที่</th>
              <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">รถ</th>
              <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">ลูกค้า</th>
              <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">อาการ</th>
              <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">แท็ก</th>
              <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">ช่าง</th>
              <th className="text-left text-sm font-semibold text-gray-400 pl-3 pr-5 py-3 w-40">วันที่เสร็จ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-sm text-gray-400 py-12">ไม่มีรายการ</td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                className="bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="pl-5 pr-3 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#44403C] text-white text-sm font-semibold flex items-center justify-center">
                    {job.id}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-medium text-[#1E1E1E]">{job.brand} {job.model}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{job.licensePlate}</p>
                </td>
                <td className="px-3 py-3.5 text-gray-600">{job.customerName}</td>
                <td className="px-3 py-3.5 max-w-50">
                  <p className="text-gray-500 italic truncate">"{job.symptom}"</p>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex gap-1.5 flex-wrap">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-sm px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#44403C] text-white text-sm flex items-center justify-center font-semibold shrink-0">
                      {job.mechanic[0]}
                    </div>
                    <span className="text-sm text-gray-600">{job.mechanic}</span>
                  </div>
                </td>
                <td className="pl-3 pr-5 py-3.5 text-sm text-gray-400">
                  <p className="text-gray-500">{job.completedAt.split('  ')[0]}</p>
                  <p>{job.completedAt.split('  ')[1]}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
