import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../../lib/api'

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalEmployees: number
  totalParts: number
}

const SECTIONS = [
  {
    path: '/admin/reports',
    label: 'รายงาน',
    desc: 'ดูรายงานรายรับ ค่าใช้จ่าย กำไร',
    icon: (
      <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M4 15l4-6 4 4 4-8 4 6" />
      </svg>
    ),
  },
  {
    path: '/admin/employees',
    label: 'พนักงาน',
    desc: 'จัดการข้อมูลพนักงาน',
    icon: (
      <svg className="w-7 h-7 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a5 5 0 00-9.644-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/admin/stock',
    label: 'สต๊อกอะไหล่',
    desc: 'ดูสต๊อกอะไหล่ทั้งหมด',
    icon: (
      <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    path: '/admin/pending-jobs',
    label: 'งานค้าง',
    desc: 'ดูงานที่ยังดำเนินการอยู่',
    icon: (
      <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/admin/purchase-requests',
    label: 'คำขอสั่งซื้อ',
    desc: 'อนุมัติคำขอสั่งซื้ออะไหล่',
    icon: (
      <svg className="w-7 h-7 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h9a2 2 0 012 2v11a1 1 0 01-1 1H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4m3-2H5" />
      </svg>
    ),
  },
]

const OTHER_SECTIONS = [
  {
    path: '/foreman/dashboard',
    label: 'หัวหน้าช่าง',
    desc: 'จัดการใบงาน มอบหมายช่าง',
    icon: (
      <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M8 16l-3 3m11-11l3-3M3 7l4-4 3 3-4 4L3 7zm9 9l4-4 3 3-4 4-3-3z" />
      </svg>
    ),
  },
  {
    path: '/reception',
    label: 'รับรถ',
    desc: 'ลงทะเบียนรถ นัดหมาย',
    icon: (
      <svg className="w-7 h-7 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18l-2 9H5L3 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8l2-4h6l2 4" />
        <circle cx="7.5" cy="18.5" r="1.5" />
        <circle cx="16.5" cy="18.5" r="1.5" />
      </svg>
    ),
  },
  {
    path: '/mechanic/jobs',
    label: 'ช่างซ่อม',
    desc: 'คิวงาน ช่างเทคนิค',
    icon: (
      <svg className="w-7 h-7 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5l-6 6L4.5 18l4.5.5 6-6m-4-4l2-2 5 5-2 2m-6-5l5 5" />
      </svg>
    ),
  },
  {
    path: '/inventory/parts',
    label: 'คลังสินค้า',
    desc: 'อะไหล่ เบิกจ่าย ใบสั่งซื้อ',
    icon: (
      <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9l8-5 8 5v10a1 1 0 01-1 1h-5v-6H9v6H5a1 1 0 01-1-1V9z" />
      </svg>
    ),
  },
  {
    path: '/accountant/dashboard',
    label: 'บัญชี',
    desc: 'การชำระเงิน รายการค้าง',
    icon: (
      <svg className="w-7 h-7 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h4M7 14h2M13 14h4" />
      </svg>
    ),
  },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalEmployees: 0,
    totalParts: 0,
  })

  const fetchStats = useCallback(async () => {
    try {
      const [jobs, users, parts] = await Promise.all([
        api.get<{ id: number; status: string }[]>('/jobs').catch(() => []),
        api.get<{ id: number }[]>('/users').catch(() => []),
        api.get<{ id: number }[]>('/parts').catch(() => []),
      ])
      const activeStatuses = ['WAITING_APPROVAL', 'WAITING_PARTS', 'READY', 'IN_PROGRESS', 'QC_PENDING', 'CLEANING', 'READY_FOR_DELIVERY']
      setStats({
        totalJobs: (jobs as { id: number; status: string }[]).length,
        activeJobs: (jobs as { id: number; status: string }[]).filter(j => activeStatuses.includes(j.status)).length,
        totalEmployees: (users as { id: number }[]).length,
        totalParts: (parts as { id: number }[]).length,
      })
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1E1E]">ผู้ดูแลระบบ</h1>
        <p className="text-sm text-gray-500 mt-1">เข้าถึงทุกส่วนของระบบ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'งานทั้งหมด', value: stats.totalJobs, color: 'bg-blue-50 text-blue-700' },
          { label: 'งานกำลังดำเนินการ', value: stats.activeJobs, color: 'bg-orange-50 text-orange-700' },
          { label: 'พนักงาน', value: stats.totalEmployees, color: 'bg-green-50 text-green-700' },
          { label: 'รายการอะไหล่', value: stats.totalParts, color: 'bg-purple-50 text-purple-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-1 opacity-75">{label}</p>
          </div>
        ))}
      </div>

      {/* Admin sections */}
      <div>
        <h2 className="text-lg font-semibold text-[#1E1E1E] mb-3">จัดการระบบ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(({ path, label, desc, icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:border-[#F8981D]/30 transition-all cursor-pointer group"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-[#1E1E1E] group-hover:text-[#F8981D] transition-colors">{label}</h3>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access to other role pages */}
      <div>
        <h2 className="text-lg font-semibold text-[#1E1E1E] mb-3">เข้าถึงหน้าอื่น</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OTHER_SECTIONS.map(({ path, label, desc, icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-white border border-dashed border-gray-200 rounded-2xl p-5 text-left hover:shadow-md hover:border-[#F8981D]/30 transition-all cursor-pointer group"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-600 group-hover:text-[#F8981D] transition-colors">{label}</h3>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
