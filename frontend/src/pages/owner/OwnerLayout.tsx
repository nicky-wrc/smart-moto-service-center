import { useLocation, Outlet } from 'react-router-dom'
import AppHeader from '../../components/AppHeader'
import Sidebar from '../../components/Sidebar'
import type { NavItem } from '../../components/Sidebar'

const navItems: NavItem[] = [
  {
    path: '/owner/dashboard',
    label: 'ภาพรวม',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 12a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
      </svg>
    ),
  },
  {
    path: '/owner/reports',
    label: 'รายงาน',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: '/owner/employees',
    label: 'พนักงาน',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/owner/stock',
    label: 'สต๊อกอะไหล่',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    path: '/owner/pending-jobs',
    label: 'งานค้าง',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/owner/purchase-requests',
    label: 'คำขอสั่งซื้อ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
]

const pageTitles: Record<string, string> = {
  '/owner/dashboard':          'ภาพรวม',
  '/owner/reports':            'รายงาน',
  '/owner/employees':          'จัดการพนักงาน',
  '/owner/stock':              'สต๊อกอะไหล่',
  '/owner/pending-jobs':       'งานค้าง',
  '/owner/purchase-requests':  'คำขอสั่งซื้ออะไหล่',
}

export default function OwnerLayout() {
  const location = useLocation()
  const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'เจ้าของร้าน'

  return (
    <div className="h-screen overflow-hidden bg-[#44403C] pb-6 pr-6 flex items-stretch font-[Kanit]">
      <div className="flex-1 bg-[#44403C] rounded-2xl flex flex-col overflow-hidden">
        <AppHeader title={title} />
        <div className="flex flex-1 gap-0 overflow-hidden">
          <Sidebar navItems={navItems} />
          <div key={location.pathname} className="flex-1 bg-[#F5F5F5] rounded-xl overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
