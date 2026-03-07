import { useLocation, Outlet } from 'react-router-dom'
import AppHeader from '../../components/AppHeader'
import Sidebar from '../../components/Sidebar'
import type { NavItem } from '../../components/Sidebar'

const navItems: NavItem[] = [
  {
    path: '/mechanic/jobs',
    label: 'งานของฉัน',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/mechanic/history',
    label: 'ประวัติงาน',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const pageTitles: Record<string, string> = {
  '/mechanic/jobs': 'งานของฉัน',
  '/mechanic/history': 'ประวัติงาน',
}

export default function MechanicLayout() {
  const location = useLocation()
  const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'ช่าง'

  return (
    <div className="h-screen overflow-hidden bg-[#44403C] pb-4 pr-4 flex items-stretch font-[Kanit]">
      <div className="flex-1 bg-[#44403C] rounded-2xl flex flex-col overflow-hidden">
        <AppHeader title={title} />
        <div className="flex flex-1 gap-0 overflow-hidden">
          <Sidebar navItems={navItems} />
          <div className="flex-1 bg-[#F5F5F5] rounded-xl overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
