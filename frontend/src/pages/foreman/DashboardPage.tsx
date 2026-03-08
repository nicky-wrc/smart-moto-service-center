import { useNavigate } from 'react-router-dom'
import { mockJobs } from './jobs'
import { mockMechanics } from './mechanics'

const statusConfig: Record<string, { bg: string; text: string }> = {
  'รอประเมิน':       { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]' },
  'รอลูกค้าอนุมัติ': { bg: 'bg-stone-100',    text: 'text-stone-500' },
  'พร้อมซ่อม':       { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
  'รอสั่งซื้อ':      { bg: 'bg-stone-100',    text: 'text-stone-500' },
  'ตรวจเชิงลึก':    { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
  'กำลังดำเนินงาน': { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]' },
  'รอตรวจ':         { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const statCards = [
    {
      label: 'งานวันนี้ทั้งหมด',
      value: mockJobs.length,
      sub: 'คำร้อง',
      iconBg: 'bg-[#44403C]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      label: 'รอประเมิน',
      value: mockJobs.filter((j) => j.status === 'รอประเมิน').length,
      sub: 'รายการ',
      iconBg: 'bg-[#F8981D]/15',
      icon: (
        <svg className="w-6 h-6 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'กำลังดำเนินการ',
      value: mockJobs.filter((j) => ['พร้อมซ่อม', 'รอสั่งซื้อ', 'ตรวจเชิงลึก'].includes(j.status)).length,
      sub: 'รายการ',
      iconBg: 'bg-[#44403C]/10',
      icon: (
        <svg className="w-6 h-6 text-[#44403C]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'รอลูกค้าอนุมัติ',
      value: mockJobs.filter((j) => j.status === 'รอลูกค้าอนุมัติ').length,
      sub: 'รายการ',
      iconBg: 'bg-stone-100',
      icon: (
        <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm text-gray-400">{s.label}</p>
              <div className="flex items-end gap-1.5 mt-1">
                <span className="text-3xl font-bold text-[#1E1E1E] leading-none">{s.value}</span>
                <span className="text-xs text-gray-400 mb-0.5">{s.sub}</span>
              </div>
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
              <div key={m.name} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-3">
                <div className="w-9 h-9 rounded-full bg-[#44403C] text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1E1E] truncate">{m.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (m.jobs / 4) * 100)}%`,
                          backgroundColor: '#F8981D',
                        }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 shrink-0">{m.jobs} งาน</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  m.jobs === 0 ? 'bg-stone-100 text-stone-500' :
                  m.jobs >= 3 ? 'bg-[#44403C]/10 text-[#44403C]' : 'bg-[#F8981D]/15 text-[#F8981D]'
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
