import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockMechanicJobs } from './mechanicJobs'

const historyJobs = mockMechanicJobs.filter((j) => j.status === 'เสร็จแล้ว')

export default function MechanicHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const jobs = q
    ? historyJobs.filter((j) =>
        [j.brand, j.model, j.licensePlate, j.customerName, j.symptom]
          .some((v) => v.toLowerCase().includes(q))
      )
    : historyJobs

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
                <th className="text-left text-sm font-semibold text-gray-400 pl-5 pr-3 py-3 w-24">คำขอที่</th>
                <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">รถ</th>
                <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">ลูกค้า</th>
                <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">อาการ</th>
                <th className="text-left text-sm font-semibold text-gray-400 px-3 py-3">แท็ก</th>
                <th className="text-left text-sm font-semibold text-gray-400 pl-3 pr-5 py-3 w-40">วันที่เสร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-gray-400 py-12">ไม่มีรายการ</td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => navigate(`/mechanic/jobs/${job.id}`)}
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
                  <td className="pl-3 pr-5 py-3.5 text-sm text-gray-400">
                    {job.completedAt && (
                      <>
                        <p className="text-gray-500">{job.completedAt.split('  ')[0]}</p>
                        <p>{job.completedAt.split('  ')[1]}</p>
                      </>
                    )}
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
