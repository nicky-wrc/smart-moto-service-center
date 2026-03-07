import { useNavigate } from 'react-router-dom'
import { mockJobs } from './JobOrdersPage'
import { mockMechanics } from './mechanics'

const statusConfig: Record<string, { bg: string; text: string }> = {
  'รอประเมิน':       { bg: 'bg-amber-100',  text: 'text-amber-700' },
  'รอลูกค้าอนุมัติ': { bg: 'bg-blue-100',   text: 'text-blue-700' },
  'พร้อมซ่อม':       { bg: 'bg-green-100',  text: 'text-green-700' },
  'รอสั่งซื้อ':      { bg: 'bg-purple-100', text: 'text-purple-700' },
  'ตรวจเชิงลึก':    { bg: 'bg-red-100',    text: 'text-red-700' },
}

const statCards = [
  {
    label: 'งานวันนี้ทั้งหมด',
    value: mockJobs.length,
    sub: 'คำร้อง',
    color: 'bg-[#44403C]',
    textColor: 'text-white',
    subColor: 'text-white/60',
  },
  {
    label: 'รอประเมิน',
    value: mockJobs.filter((j) => j.status === 'รอประเมิน').length,
    sub: 'รายการ',
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    subColor: 'text-amber-400',
  },
  {
    label: 'กำลังดำเนินการ',
    value: mockJobs.filter((j) => ['พร้อมซ่อม', 'รอสั่งซื้อ', 'ตรวจเชิงลึก'].includes(j.status)).length,
    sub: 'รายการ',
    color: 'bg-green-50',
    textColor: 'text-green-700',
    subColor: 'text-green-400',
  },
  {
    label: 'รอลูกค้าอนุมัติ',
    value: mockJobs.filter((j) => j.status === 'รอลูกค้าอนุมัติ').length,
    sub: 'รายการ',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    subColor: 'text-blue-400',
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl px-4 py-3.5 ${s.color}`}>
            <p className={`text-xs font-medium ${s.subColor}`}>{s.label}</p>
            <div className="flex items-end gap-1.5 mt-1.5">
              <span className={`text-3xl font-bold leading-none ${s.textColor}`}>{s.value}</span>
              <span className={`text-xs mb-0.5 ${s.subColor}`}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="flex-1 grid gap-4 overflow-hidden" style={{ gridTemplateColumns: '1fr 280px' }}>

        {/* Left: active jobs */}
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1E1E1E]">งานที่ต้องดูแลวันนี้</p>
            <button
              onClick={() => navigate('/foreman/jobs')}
              className="text-xs text-gray-400 hover:text-[#F8981D] transition-colors bg-transparent border-none cursor-pointer"
            >
              ดูทั้งหมด →
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {mockJobs.map((job) => {
              const s = statusConfig[job.status]
              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#44403C] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {job.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E1E1E] truncate">{job.brand} {job.model}</p>
                    <p className="text-xs text-gray-400 truncate">{job.customerName} · {job.licensePlate}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-300">{job.receivedAt.split(' ')[1]}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: mechanic load */}
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <p className="text-sm font-semibold text-[#1E1E1E]">ภาระงานช่าง</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {mockMechanics.map((m) => (
              <div key={m.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
                <div className="w-9 h-9 rounded-full bg-[#44403C] text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1E1E] truncate">{m.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (m.jobs / 4) * 100)}%`,
                          backgroundColor: m.jobs >= 3 ? '#ef4444' : m.jobs >= 2 ? '#F8981D' : '#22c55e',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{m.jobs} งาน</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  m.jobs === 0 ? 'bg-green-100 text-green-700' :
                  m.jobs >= 3 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                }`}>
                  {m.jobs === 0 ? 'ว่าง' : m.jobs >= 3 ? 'เต็ม' : 'ปกติ'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
