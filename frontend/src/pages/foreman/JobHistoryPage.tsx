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
  completedAt?: string
  status: 'กำลังซ่อม' | 'รอตรวจ' | 'เสร็จแล้ว'
  tags: string[]
}

const mockHistoryJobs: HistoryJob[] = [
  {
    id: 6, brand: 'Honda', model: 'PCX 160', licensePlate: 'กข 1234',
    customerName: 'สมศรี มีสุข', symptom: 'เปลี่ยนผ้าเบรกหน้า-หลัง',
    mechanic: 'สมชาย ช่างดี', startedAt: '08/03/2026  08:30 น.',
    status: 'กำลังซ่อม', tags: ['เบรก'],
  },
  {
    id: 7, brand: 'Yamaha', model: 'Aerox 155', licensePlate: 'คง 5678',
    customerName: 'วรรณา สดใส', symptom: 'เครื่องสตาร์ทไม่ติด แบตเตอรี่หมด',
    mechanic: 'วิชัย รักงาน', startedAt: '08/03/2026  09:00 น.',
    status: 'กำลังซ่อม', tags: ['ไฟฟ้า', 'เครื่องยนต์'],
  },
  {
    id: 8, brand: 'Honda', model: 'Click 125i', licensePlate: 'จฉ 9012',
    customerName: 'ธีระ ใจงาม', symptom: 'เปลี่ยนน้ำมันเครื่อง ตรวจเช็คทั่วไป',
    mechanic: 'ประยุทธ์ มือทอง', startedAt: '08/03/2026  09:30 น.',
    status: 'กำลังซ่อม', tags: ['บำรุงรักษา'],
  },
  {
    id: 9, brand: 'Suzuki', model: 'Address 110', licensePlate: 'ชซ 3456',
    customerName: 'นิภา แก้วใส', symptom: 'สายพานขาด เปลี่ยนสายพานใหม่',
    mechanic: 'สมชาย ช่างดี', startedAt: '08/03/2026  10:00 น.',
    status: 'รอตรวจ', tags: ['ส่งกำลัง'],
  },
  {
    id: 10, brand: 'Honda', model: 'Wave 110i', licensePlate: 'ญฐ 7890',
    customerName: 'ประสิทธิ์ มั่นคง', symptom: 'ไฟหน้าไม่ติด เปลี่ยนหลอดไฟ',
    mechanic: 'วิชัย รักงาน', startedAt: '07/03/2026  14:00 น.',
    status: 'รอตรวจ', tags: ['ไฟฟ้า'],
  },
  {
    id: 11, brand: 'Kawasaki', model: 'Ninja 250', licensePlate: 'ฎฏ 1122',
    customerName: 'อมร ศักดิ์ดี', symptom: 'ช่วงล่างแข็ง เปลี่ยนโช้คอัพ',
    mechanic: 'สมชาย ช่างดี', startedAt: '07/03/2026  13:00 น.',
    completedAt: '08/03/2026  09:00 น.',
    status: 'เสร็จแล้ว', tags: ['ช่วงล่าง'],
  },
  {
    id: 12, brand: 'Yamaha', model: 'NMAX 155', licensePlate: 'ฐฑ 3344',
    customerName: 'สุดา วงศ์งาม', symptom: 'เบรกหน้าไม่กิน น้ำมันเบรกรั่ว',
    mechanic: 'วิชัย รักงาน', startedAt: '07/03/2026  10:00 น.',
    completedAt: '07/03/2026  16:30 น.',
    status: 'เสร็จแล้ว', tags: ['เบรก'],
  },
  {
    id: 13, brand: 'Honda', model: 'Forza 300', licensePlate: 'ฒณ 5566',
    customerName: 'วีระ จันทร์ดี', symptom: 'เปลี่ยนหัวเทียน ล้างหัวฉีด',
    mechanic: 'ประยุทธ์ มือทอง', startedAt: '07/03/2026  09:00 น.',
    completedAt: '07/03/2026  14:00 น.',
    status: 'เสร็จแล้ว', tags: ['เชื้อเพลิง', 'บำรุงรักษา'],
  },
]

type Tab = 'กำลังซ่อม' | 'รอตรวจ' | 'เสร็จแล้ว'

const tabs: { key: Tab; label: string; color: string; activeColor: string }[] = [
  { key: 'กำลังซ่อม', label: 'กำลังซ่อม', color: 'text-gray-400', activeColor: 'text-[#F8981D] border-[#F8981D]' },
  { key: 'รอตรวจ',    label: 'รอหัวหน้าตรวจ', color: 'text-gray-400', activeColor: 'text-blue-600 border-blue-500' },
  { key: 'เสร็จแล้ว', label: 'เสร็จแล้ว', color: 'text-gray-400', activeColor: 'text-green-600 border-green-500' },
]

export default function JobHistoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('กำลังซ่อม')

  const jobs = mockHistoryJobs.filter((j) => j.status === activeTab)

  const counts: Record<Tab, number> = {
    'กำลังซ่อม': mockHistoryJobs.filter((j) => j.status === 'กำลังซ่อม').length,
    'รอตรวจ':    mockHistoryJobs.filter((j) => j.status === 'รอตรวจ').length,
    'เสร็จแล้ว': mockHistoryJobs.filter((j) => j.status === 'เสร็จแล้ว').length,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Tab bar */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-5 flex items-end gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer ${
              activeTab === t.key ? t.activeColor : `${t.color} border-transparent hover:text-gray-600`
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              activeTab === t.key ? 'bg-current/10' : 'bg-gray-100 text-gray-400'
            }`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {jobs.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">ไม่มีรายการ</p>
        )}
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate(`/foreman/jobs/${job.id}`)}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 cursor-pointer hover:shadow-sm transition-all flex items-center gap-4"
          >
            {/* ID badge */}
            <div className="w-9 h-9 rounded-lg bg-[#44403C] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {job.id}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-[#1E1E1E]">{job.brand} {job.model}</p>
                <span className="text-xs text-gray-300">·</span>
                <p className="text-xs text-gray-400">{job.licensePlate}</p>
                {job.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 truncate">"{job.symptom}"</p>
            </div>

            {/* Mechanic + time */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-semibold">
                  {job.mechanic[0]}
                </div>
                <p className="text-xs text-gray-500">{job.mechanic}</p>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {job.status === 'เสร็จแล้ว' && job.completedAt ? `เสร็จ ${job.completedAt.split('  ')[1]}` : `เริ่ม ${job.startedAt.split('  ')[1]}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
