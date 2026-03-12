import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { formatMotorcycleName } from '../../utils/motorcycle'

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'เสร็จสิ้น', PAID: 'ชำระแล้ว',
}

export default function JobHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/jobs').then(data => {
      const completed = data.filter(j => ['COMPLETED', 'PAID'].includes(j.status))
      setJobs(completed)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? jobs.filter((j) => {
        const brand = j.motorcycle?.brand ?? ''
        const model = j.motorcycle?.model ?? ''
        const plate = j.motorcycle?.licensePlate ?? ''
        const customer = `${j.motorcycle?.owner?.firstName ?? ''} ${j.motorcycle?.owner?.lastName ?? ''}`
        const mechanic = j.technician?.name ?? ''
        const symptom = j.symptom ?? ''
        return [brand, model, plate, customer, mechanic, symptom]
          .some((v) => v.toLowerCase().includes(q))
      })
    : jobs

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
              <th className="text-left text-xs font-semibold text-gray-400 pl-5 pr-3 py-3 w-24">คำขอที่</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">รถ</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">ลูกค้า</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">อาการ</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">แท็ก</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3">ช่าง</th>
              <th className="text-left text-xs font-semibold text-gray-400 pl-3 pr-5 py-3 w-40">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-sm text-gray-400 py-12">ไม่มีรายการ</td>
              </tr>
            )}
            {filtered.map((job) => {
              const mechanicName = job.technician?.name ?? '-'
              const customerName = `${job.motorcycle?.owner?.firstName ?? ''} ${job.motorcycle?.owner?.lastName ?? ''}`.trim() || '-'
              const completedDate = job.updatedAt ? new Date(job.updatedAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
              return (
              <tr
                key={job.id}
                onClick={() => navigate(`/foreman/jobs/${job.id}`)}
                className="bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="pl-5 pr-3 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#44403C] text-white text-xs font-semibold flex items-center justify-center">
                    {job.jobNo?.replace(/\D/g, '').slice(-3) || job.id}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-medium text-[#1E1E1E]">{formatMotorcycleName(job.motorcycle?.brand, job.motorcycle?.model)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.motorcycle?.licensePlate}</p>
                </td>
                <td className="px-3 py-3.5 text-gray-600">{customerName}</td>
                <td className="px-3 py-3.5 max-w-50">
                  <p className="text-gray-500 italic truncate">"{job.symptom}"</p>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex gap-1.5 flex-wrap">
                    {(job.tags || []).map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#44403C] text-white text-xs flex items-center justify-center font-semibold shrink-0">
                      {mechanicName[0]}
                    </div>
                    <span className="text-xs text-gray-600">{mechanicName}</span>
                  </div>
                </td>
                <td className="pl-3 pr-5 py-3.5 text-xs text-gray-400">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    {STATUS_LABEL[job.status] || job.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{completedDate}</p>
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
