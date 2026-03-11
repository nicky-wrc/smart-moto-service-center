import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอเริ่ม', IN_PROGRESS: 'กำลังซ่อม', WAITING_PARTS: 'รออะไหล่',
  QC_PENDING: 'รอตรวจ', CLEANING: 'ล้างรถ', READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จแล้ว', PAID: 'ชำระแล้ว', CANCELLED: 'ยกเลิก',
}

const columns = [
  { status: 'PENDING',       label: 'รอเริ่ม',    dot: 'bg-stone-300' },
  { status: 'IN_PROGRESS',   label: 'กำลังซ่อม',  dot: 'bg-[#F8981D]' },
  { status: 'QC_PENDING',    label: 'รอตรวจ',     dot: 'bg-[#44403C]' },
  { status: 'CLEANING',      label: 'ล้างรถ',     dot: 'bg-green-400' },
]

export default function MechanicJobsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch jobs assigned to the logged-in mechanic
    const params = user?.id ? `?technicianId=${user.id}` : ''
    api.get<any[]>(`/jobs${params}`)
      .then(data => {
        // If the backend doesn't support technicianId filter well, client-side filter
        const myJobs = user?.id ? data.filter(j => j.technicianId === user.id) : data
        setJobs(myJobs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user?.id])

  const activeJobs = jobs.filter(j => !['COMPLETED', 'PAID', 'CANCELLED'].includes(j.status))

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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-4 p-5 h-full">
          {columns.map((col) => {
            const colJobs = activeJobs.filter((j) => j.status === col.status)
            return (
              <div key={col.status} className="flex flex-col rounded-2xl overflow-hidden flex-1 min-w-0 bg-stone-50/80">

                {/* Column header */}
                <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-white/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                    <span className="text-sm font-semibold text-[#1E1E1E]">{col.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">
                    {colJobs.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                  {colJobs.length === 0 && (
                    <p className="text-center text-sm text-gray-300 mt-6">ไม่มีรายการ</p>
                  )}
                  {colJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/mechanic/jobs/${job.id}`)}
                      className="bg-white rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all border border-white hover:border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
<<<<<<< HEAD
                        <span className="text-xs text-gray-400 font-medium">{job.jobNo}</span>
                        <span className="text-xs text-gray-300">
                          {new Date(job.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1E1E1E] leading-snug">
                        {job.motorcycle?.brand} {job.motorcycle?.model}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {job.motorcycle?.owner?.firstName} {job.motorcycle?.owner?.lastName} · {job.motorcycle?.licensePlate}
                      </p>
                      <p className="text-xs text-gray-400 italic mt-1.5 line-clamp-2">"{job.symptom}"</p>
                      {job.tags?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2.5">
                          {job.tags.map((tag: string) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
=======
                        <span className="text-sm text-gray-400 font-medium">คำขอที่ {job.id}</span>
                        <span className="text-sm text-gray-300">{job.assignedAt.split('  ')[1]}</span>
                      </div>

                      {/* Vehicle */}
                      <p className="text-sm font-semibold text-[#1E1E1E] leading-snug">{job.brand} {job.model}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{job.customerName} · {job.licensePlate}</p>

                      {/* Symptom */}
                      <p className="text-sm text-gray-400 italic mt-1.5 line-clamp-2">"{job.symptom}"</p>

                      {/* Tags */}
                      {job.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2.5">
                          {job.tags.map((tag) => (
                            <span key={tag} className="text-sm px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">
                              {tag}
                            </span>
>>>>>>> origin/Krit_front
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
<<<<<<< HEAD
                        <span className="text-xs text-gray-400">{job.reception?.name || '-'}</span>
                        {job.startedAt && (
                          <span className="text-xs text-gray-300">
                            เริ่ม {new Date(job.startedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </span>
=======
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.parts.length} อะไหล่
                        </div>
                        {job.startedAt && (
                          <span className="text-sm text-gray-300">เริ่ม {job.startedAt.split('  ')[1]}</span>
>>>>>>> origin/Krit_front
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
