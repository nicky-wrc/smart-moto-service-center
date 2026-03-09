import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – Cell is deprecated in recharts v3 types but still functional
import { PieChart, Pie, Cell, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { mockJobs } from './jobs'
import { mockMechanics } from './mechanics'

const donutGroups = [
  { label: 'รอประเมิน',       statuses: ['รอประเมิน'],                                                  color: '#F8981D' },
  { label: 'รอลูกค้าอนุมัติ',  statuses: ['รอลูกค้าอนุมัติ'],                                             color: '#d6d3d1' },
  { label: 'กำลังดำเนินการ',   statuses: ['พร้อมซ่อม', 'รอสั่งซื้อ', 'ตรวจเชิงลึก', 'กำลังดำเนินงาน'],  color: '#44403C' },
  { label: 'รอตรวจ',           statuses: ['รอตรวจ'],                                                     color: '#78716c' },
]

const mockWeekly = [
  { day: 'จ',  value: 4 },
  { day: 'อ',  value: 7 },
  { day: 'พ',  value: 5 },
  { day: 'พฤ', value: 8 },
  { day: 'ศ',  value: 6 },
  { day: 'ส',  value: 3 },
  { day: 'อา', value: mockJobs.length },
]

type TooltipProps = { active?: boolean; payload?: { name: string; value: number }[]; label?: string }

function DonutTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <span className="font-semibold text-[#1E1E1E]">{name}</span>
      <span className="ml-2 text-gray-400">{value} งาน</span>
    </div>
  )
}

function BarTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <span className="font-semibold text-[#1E1E1E]">{label}</span>
      <span className="ml-2 text-gray-400">{payload[0].value} งาน</span>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const total = mockJobs.length

  const countPending  = mockJobs.filter(j => j.status === 'รอประเมิน').length
  const countActive   = mockJobs.filter(j => ['พร้อมซ่อม', 'รอสั่งซื้อ', 'ตรวจเชิงลึก', 'กำลังดำเนินงาน'].includes(j.status)).length
  const countInspect  = mockJobs.filter(j => j.status === 'รอตรวจ').length
  const countWaiting  = mockJobs.filter(j => j.status === 'รอลูกค้าอนุมัติ').length

  // Donut data
  const donutData = donutGroups.map(g => ({
    name: g.label,
    value: mockJobs.filter(j => g.statuses.includes(j.status)).length,
    color: g.color,
  }))

  // Tag data for horizontal bar
  const tagMap: Record<string, number> = {}
  mockJobs.forEach(j => j.tags.forEach(t => { tagMap[t] = (tagMap[t] ?? 0) + 1 }))
  const tagData = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  const alerts = mockJobs.filter(j => j.mechanicReport)

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div
          onClick={() => navigate('/foreman/jobs')}
          className="bg-[#44403C] rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-black transition-colors"
        >
          <div>
            <p className="text-xs text-white/50 font-medium">งานทั้งหมด</p>
            <p className="text-3xl font-black text-white mt-1 leading-none">{total}</p>
          </div>
          <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="bg-[#F8981D] rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-white/70 font-medium">รอประเมิน</p>
            <p className="text-3xl font-black text-white mt-1 leading-none">{countPending}</p>
          </div>
          <p className="text-xs text-white/40">รายการ</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium">กำลังดำเนินการ</p>
            <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">{countActive}</p>
          </div>
          <p className="text-xs text-gray-300">รายการ</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium">รอตรวจ / รอลูกค้า</p>
            <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">{countInspect + countWaiting}</p>
          </div>
          <p className="text-xs text-gray-300">รายการ</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid gap-4 min-h-0" style={{ gridTemplateColumns: '1fr 1fr 260px' }}>

        {/* LEFT: Donut + Recent jobs */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Donut chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-[#1E1E1E]">สถานะงาน</p>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Pie chart with center label */}
              <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                <PieChart width={120} height={120}>
                  <Pie
                    data={donutData}
                    cx={55} cy={55}
                    innerRadius={36} outerRadius={54}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip content={<DonutTooltip />} />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#1E1E1E]">{total}</span>
                  <span className="text-xs text-gray-400">งาน</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 grid grid-cols-1 gap-2">
                {donutData.map(seg => (
                  <div key={seg.name} className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs text-gray-500 flex-1 truncate">{seg.name}</span>
                    <span className="text-xs font-bold text-[#1E1E1E] shrink-0">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent jobs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1E1E1E]">รายการงานล่าสุด</p>
              <button onClick={() => navigate('/foreman/jobs')} className="text-xs text-[#F8981D] font-medium hover:underline cursor-pointer bg-transparent border-none">
                ดูทั้งหมด →
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {[...mockJobs].reverse().slice(0, 8).map(job => {
                const statusColor: Record<string, string> = {
                  'รอประเมิน': '#F8981D', 'รอลูกค้าอนุมัติ': '#d6d3d1',
                  'พร้อมซ่อม': '#44403C', 'รอสั่งซื้อ': '#78716c',
                  'ตรวจเชิงลึก': '#44403C', 'กำลังดำเนินงาน': '#F8981D', 'รอตรวจ': '#44403C',
                }
                const color = statusColor[job.status] ?? '#9ca3af'
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs text-gray-300 font-mono w-5 shrink-0 text-right">#{job.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1E1E1E] truncate">{job.brand} {job.model}</p>
                      <p className="text-xs text-gray-400 truncate">{job.customerName}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${color}18`, color }}>
                      {job.status}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE: Bar chart + Tag chart */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Weekly bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1E1E1E]">งานรับเข้าสัปดาห์นี้</p>
              <p className="text-xs text-gray-400">รายการ/วัน</p>
            </div>
            <div className="flex-1 min-h-0 px-2 pt-3 pb-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeekly} margin={{ top: 4, right: 8, left: -24, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <ReTooltip content={<BarTooltip />} cursor={{ fill: '#f5f5f4' }} />
                  <Bar dataKey="value" name="งาน" radius={[6, 6, 0, 0]}>
                    {mockWeekly.map((_, i) => (
                      <Cell key={i} fill={i === mockWeekly.length - 1 ? '#F8981D' : '#e7e5e4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tag breakdown — horizontal bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0" style={{ height: 176 }}>
            <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
              <p className="text-sm font-semibold text-[#1E1E1E]">ประเภทงาน</p>
            </div>
            <div className="flex-1 min-h-0 px-2 pb-2 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical" margin={{ top: 0, right: 28, left: 4, bottom: 0 }} barSize={10}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} width={72} />
                  <ReTooltip content={<BarTooltip />} cursor={{ fill: '#f5f5f4' }} />
                  <Bar dataKey="value" fill="#F8981D" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: '#1E1E1E', fontWeight: 700 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT: Mechanic + Alerts */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-4 py-3.5 border-b border-gray-100 shrink-0">
              <p className="text-sm font-semibold text-[#1E1E1E]">ภาระงานช่าง</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {mockMechanics.map(m => (
                <div key={m.name} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#44403C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E1E1E] truncate">{m.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#F8981D] transition-all" style={{ width: `${Math.min(100, (m.jobs / 3) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-stone-400 shrink-0">{m.jobs} งาน</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    m.jobs === 0 ? 'bg-stone-100 text-stone-500' :
                    m.jobs >= 3 ? 'bg-[#44403C]/10 text-[#44403C]' :
                    'bg-[#F8981D]/15 text-[#F8981D]'
                  }`}>
                    {m.jobs === 0 ? 'ว่าง' : m.jobs >= 3 ? 'เต็ม' : 'ปกติ'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl flex flex-col overflow-hidden shrink-0" style={{ maxHeight: 180 }}>
              <div className="px-4 py-3 border-b border-amber-200 shrink-0 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-sm font-semibold text-amber-700">ช่างรายงานปัญหา ({alerts.length})</p>
              </div>
              <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1.5">
                {alerts.map(job => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                    className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 cursor-pointer hover:bg-amber-50/60 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {job.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#1E1E1E] truncate">{job.brand} {job.model}</p>
                      <p className="text-xs text-gray-400 truncate">{job.mechanicReport!.note}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
