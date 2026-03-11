import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function MechanicHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/jobs')
      .then(data => {
        // Filter to completed/paid jobs assigned to this mechanic
        const myDone = data.filter(j =>
          (j.technicianId === user?.id) &&
          ['COMPLETED', 'PAID', 'QC_PENDING', 'CLEANING', 'READY_FOR_DELIVERY'].includes(j.status)
        )
        setAllJobs(myDone)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user?.id])

  const q = search.trim().toLowerCase()
  const jobs = q
    ? allJobs.filter(j =>
        [j.motorcycle?.brand, j.motorcycle?.model, j.motorcycle?.licensePlate,
         j.motorcycle?.owner?.firstName, j.motorcycle?.owner?.lastName, j.symptom]
          .some(v => v?.toLowerCase().includes(q))
      )
    : allJobs

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

      {/* Toolbar */}
      <div className="shrink-0 px-5 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า ทะเบียน หรือรุ่นรถ..."
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
          />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">
          {jobs.length} รายการ
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-400 pl-5 pr-3 py-3 w-28">เลขที่งาน</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">รถ</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">ลูกค้า</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">อาการ</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">แท็ก</th>
                <th className="text-left text-xs font-semibold text-gray-400 pl-3 pr-5 py-3 w-40">วันที่เสร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-gray-400 py-12">ไม่มีรายการ</td>
                </tr>
              )}
              {jobs.map((job) => {
                const customerName = `${job.motorcycle?.owner?.firstName || ''} ${job.motorcycle?.owner?.lastName || ''}`.trim()
                return (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/mechanic/jobs/${job.id}`)}
                    className="bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="pl-5 pr-3 py-3.5">
                      <span className="text-xs font-mono text-gray-500">{job.jobNo}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-medium text-[#1E1E1E]">{job.motorcycle?.brand} {job.motorcycle?.model}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{job.motorcycle?.licensePlate}</p>
                    </td>
                    <td className="px-3 py-3.5 text-gray-600">{customerName}</td>
                    <td className="px-3 py-3.5 max-w-50">
                      <p className="text-gray-500 italic truncate">"{job.symptom}"</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {(job.tags || []).map((tag: string) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="pl-3 pr-5 py-3.5 text-xs text-gray-400">
                      {job.completedAt && (
                        <>
                          <p className="text-gray-500">{new Date(job.completedAt).toLocaleDateString('th-TH')}</p>
                          <p>{new Date(job.completedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
