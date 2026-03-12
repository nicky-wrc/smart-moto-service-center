import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { formatMotorcycleName } from '../../utils/motorcycle'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอประเมิน', IN_PROGRESS: 'กำลังดำเนินงาน', WAITING_PARTS: 'รอสั่งซื้อ',
  QC_PENDING: 'รอตรวจ', CLEANING: 'ล้างรถ', READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จสิ้น', PAID: 'ชำระแล้ว', CANCELLED: 'ยกเลิก',
}

const statusColor: Record<string, string> = {
  PENDING: '#F8981D', IN_PROGRESS: '#F8981D', WAITING_PARTS: '#78716c',
  QC_PENDING: '#44403C', CLEANING: '#78716c', READY_FOR_DELIVERY: '#44403C',
  COMPLETED: '#22c55e', PAID: '#22c55e', CANCELLED: '#ef4444',
}

export default function MechanicsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterLoad, setFilterLoad] = useState<'all' | 'ว่าง' | 'ปกติ' | 'เต็ม'>('all')
  const [mechanics, setMechanics] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/users'),
      api.get<any[]>('/jobs'),
    ]).then(([usersData, jobsData]) => {
      setMechanics(usersData.filter(u => u.role === 'TECHNICIAN'))
      setJobs(jobsData.filter(j => !['PAID', 'CANCELLED'].includes(j.status)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Count active jobs per mechanic
  const jobCountMap: Record<number, number> = {}
  const jobsByMech: Record<number, any[]> = {}
  jobs.forEach(j => {
    if (j.technicianId) {
      jobCountMap[j.technicianId] = (jobCountMap[j.technicianId] ?? 0) + 1
      if (!jobsByMech[j.technicianId]) jobsByMech[j.technicianId] = []
      jobsByMech[j.technicianId].push(j)
    }
  })

  const filtered = mechanics.filter(m => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q || m.name.toLowerCase().includes(q)
    const jobCount = jobCountMap[m.id] || 0
    const load = jobCount === 0 ? 'ว่าง' : jobCount >= 3 ? 'เต็ม' : 'ปกติ'
    const matchLoad = filterLoad === 'all' || load === filterLoad
    return matchSearch && matchLoad
  })

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

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 px-5 py-3 bg-[#F5F5F5] flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อช่าง..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
          />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'ว่าง', 'ปกติ', 'เต็ม'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterLoad(opt)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border-none cursor-pointer ${
                filterLoad === opt ? 'bg-[#44403C] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt === 'all' ? 'ทั้งหมด' : opt}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 shrink-0">
          แสดง {filtered.length}/{mechanics.length} คน
        </p>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">ไม่พบช่างที่ตรงกับการค้นหา</p>
            <button onClick={() => { setSearch(''); setFilterLoad('all') }} className="text-xs text-[#F8981D] hover:underline mt-1 bg-transparent border-none cursor-pointer">
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {filtered.map(mechanic => {
              const jobCount = jobCountMap[mechanic.id] || 0
              const assignedJobs = jobsByMech[mechanic.id] || []
              const loadLabel = jobCount === 0 ? 'ว่าง' : jobCount >= 3 ? 'เต็ม' : 'ปกติ'
              const loadColor =
                jobCount === 0 ? 'bg-stone-100 text-stone-500' :
                jobCount >= 3 ? 'bg-[#44403C]/10 text-[#44403C]' :
                'bg-[#F8981D]/15 text-[#F8981D]'
              const avatarBg =
                jobCount === 0 ? 'bg-stone-200' :
                jobCount >= 3 ? 'bg-[#44403C]' :
                'bg-[#F8981D]'

              return (
                <div key={mechanic.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                  {/* Profile section */}
                  <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                    <div className={`w-14 h-14 rounded-2xl ${avatarBg} flex items-center justify-center shrink-0`}>
                      <span className="text-2xl font-black text-white">{mechanic.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-[#1E1E1E]">{mechanic.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${loadColor}`}>{loadLabel}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">@{mechanic.username}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-black text-[#1E1E1E] leading-none">{jobCount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">งาน</p>
                    </div>
                  </div>

                  {/* Workload bar */}
                  <div className="px-5 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (jobCount / 3) * 100)}%`,
                            backgroundColor: jobCount === 0 ? '#d6d3d1' : jobCount >= 3 ? '#44403C' : '#F8981D',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{jobCount}/3</span>
                    </div>
                  </div>

                  {/* Assigned jobs */}
                  <div className="flex-1 flex flex-col">
                    {assignedJobs.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center py-6">
                        <p className="text-sm text-gray-300">ยังไม่มีงานที่รับผิดชอบ</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {assignedJobs.map(job => {
                          const color = statusColor[job.status] ?? '#9ca3af'
                          return (
                            <div
                              key={job.id}
                              onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                            >
                              <span className="text-xs text-gray-300 font-mono w-16 shrink-0 truncate">{job.jobNo}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1E1E1E] truncate">{formatMotorcycleName(job.motorcycle?.brand, job.motorcycle?.model)}</p>
                                <p className="text-xs text-gray-400 truncate">{job.symptom}</p>
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
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
