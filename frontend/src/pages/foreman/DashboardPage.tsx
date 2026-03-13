import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – Cell is deprecated in recharts v3 types but still functional
import { PieChart, Pie, Cell, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { api } from '../../lib/api'
import { formatMotorcycleName } from '../../utils/motorcycle'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอประเมิน', IN_PROGRESS: 'กำลังดำเนินงาน', WAITING_PARTS: 'รอสั่งซื้อ',
  QC_PENDING: 'รอตรวจ', CLEANING: 'ล้างรถ', READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จสิ้น', PAID: 'ชำระแล้ว', CANCELLED: 'ยกเลิก',
}

const donutGroups = [
  { label: 'รอประเมิน',     statuses: ['PENDING'],                                                   color: '#F8981D' },
  { label: 'กำลังดำเนินการ', statuses: ['IN_PROGRESS', 'WAITING_PARTS'],                              color: '#44403C' },
  { label: 'รอตรวจ',         statuses: ['QC_PENDING', 'CLEANING', 'READY_FOR_DELIVERY'],               color: '#78716c' },
  { label: 'เสร็จสิ้น',     statuses: ['COMPLETED', 'PAID'],                                          color: '#22c55e' },
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
  const [jobs, setJobs] = useState<any[]>([])
  const [mechanics, setMechanics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/jobs'),
      api.get<any[]>('/users'),
    ]).then(([jobsData, usersData]) => {
      setJobs(jobsData)
      setMechanics(usersData.filter(u => u.role === 'TECHNICIAN' || u.role === 'FOREMAN'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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

  const activeJobs = jobs.filter(j => !['PAID', 'CANCELLED'].includes(j.status))
  const total = activeJobs.length

  const countPending = activeJobs.filter(j => j.status === 'PENDING').length
  const countActive  = activeJobs.filter(j => ['IN_PROGRESS', 'WAITING_PARTS'].includes(j.status)).length
  const countInspect = activeJobs.filter(j => ['QC_PENDING', 'CLEANING', 'READY_FOR_DELIVERY'].includes(j.status)).length

  const donutData = donutGroups.map(g => ({
    name: g.label,
    value: jobs.filter(j => g.statuses.includes(j.status)).length,
    color: g.color,
  }))

  // Tag data
  const tagMap: Record<string, number> = {}
  activeJobs.forEach(j => (j.tags || []).forEach((t: string) => { tagMap[t] = (tagMap[t] ?? 0) + 1 }))
  const tagData = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }))

  // Count jobs per mechanic
  const mechJobCount: Record<number, number> = {}
  activeJobs.forEach(j => { if (j.technicianId) mechJobCount[j.technicianId] = (mechJobCount[j.technicianId] ?? 0) + 1 })

  // Weekly placeholder (today shows real count)
  const weeklyData = [
    { day: 'จ', value: 0 }, { day: 'อ', value: 0 }, { day: 'พ', value: 0 },
    { day: 'พฤ', value: 0 }, { day: 'ศ', value: 0 }, { day: 'ส', value: 0 },
    { day: 'วันนี้', value: total },
  ]

  const statusColor: Record<string, string> = {
    PENDING: '#F8981D', IN_PROGRESS: '#F8981D', WAITING_PARTS: '#78716c',
    QC_PENDING: '#44403C', CLEANING: '#78716c', READY_FOR_DELIVERY: '#44403C',
    COMPLETED: '#22c55e', PAID: '#22c55e', CANCELLED: '#ef4444',
  }

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div onClick={() => navigate('/foreman/jobs')} className="bg-[#44403C] rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-black transition-colors">
          <div>
            <p className="text-xs text-white/50 font-medium">งานทั้งหมด</p>
            <p className="text-3xl font-black text-white mt-1 leading-none">{total}</p>
          </div>
          <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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
            <p className="text-xs text-gray-400 font-medium">รอตรวจ / รอส่งมอบ</p>
            <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">{countInspect}</p>
          </div>
          <p className="text-xs text-gray-300">รายการ</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid gap-4 min-h-0" style={{ gridTemplateColumns: '1fr 1fr 260px' }}>

        {/* LEFT: Donut + Recent jobs */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="px-5 py-3.5 border-b border-gray-100"><p className="text-sm font-semibold text-[#1E1E1E]">สถานะงาน</p></div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                <PieChart width={120} height={120}>
                  <Pie data={donutData} cx={55} cy={55} innerRadius={36} outerRadius={54} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <ReTooltip content={<DonutTooltip />} />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#1E1E1E]">{jobs.length}</span>
                  <span className="text-xs text-gray-400">งาน</span>
                </div>
              </div>
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
              <button onClick={() => navigate('/foreman/jobs')} className="text-xs text-[#F8981D] font-medium hover:underline cursor-pointer bg-transparent border-none">ดูทั้งหมด →</button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {[...jobs].reverse().slice(0, 8).map(job => {
                const color = statusColor[job.status] ?? '#9ca3af'
                return (
                  <div key={job.id} onClick={() => navigate(`/foreman/jobs/${job.id}`)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors group">
                    <span className="text-xs text-gray-300 font-mono w-16 shrink-0 truncate">{job.jobNo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1E1E1E] truncate">{formatMotorcycleName(job.motorcycle?.brand, job.motorcycle?.model)}</p>
                      <p className="text-xs text-gray-400 truncate">{job.motorcycle?.owner?.firstName} {job.motorcycle?.owner?.lastName}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${color}18`, color }}>
                      {STATUS_LABEL[job.status] || job.status}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1E1E1E]">งานรับเข้าสัปดาห์นี้</p>
              <p className="text-xs text-gray-400">รายการ/วัน</p>
            </div>
            <div className="flex-1 min-h-0 px-2 pt-3 pb-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <ReTooltip content={<BarTooltip />} cursor={{ fill: '#f5f5f4' }} />
                  <Bar dataKey="value" name="งาน" radius={[6, 6, 0, 0]}>
                    {weeklyData.map((_, i) => <Cell key={i} fill={i === weeklyData.length - 1 ? '#F8981D' : '#e7e5e4'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {tagData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0" style={{ height: 176 }}>
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0"><p className="text-sm font-semibold text-[#1E1E1E]">ประเภทงาน</p></div>
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
          )}
        </div>

        {/* RIGHT: Mechanic workload */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-4 py-3.5 border-b border-gray-100 shrink-0"><p className="text-sm font-semibold text-[#1E1E1E]">ภาระงานช่าง</p></div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {mechanics.map(m => {
                const jobCount = mechJobCount[m.id] || 0
                return (
                  <div key={m.id} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#44403C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1E1E1E] truncate">{m.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#F8981D] transition-all" style={{ width: `${Math.min(100, (jobCount / 3) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-stone-400 shrink-0">{jobCount} งาน</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      jobCount === 0 ? 'bg-stone-100 text-stone-500' :
                      jobCount >= 3 ? 'bg-[#44403C]/10 text-[#44403C]' :
                      'bg-[#F8981D]/15 text-[#F8981D]'
                    }`}>
                      {jobCount === 0 ? 'ว่าง' : jobCount >= 3 ? 'เต็ม' : 'ปกติ'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
