import AppLayout from '../../components/AppLayout'
import type { NavItem } from '../../components/Sidebar'

const navItems: NavItem[] = [
  {
    path: '/workshop/queue',
    label: 'คิวงานซ่อม',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    path: '/workshop/requisitions',
    label: 'เบิกอะไหล่',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
]

const pageTitles: Record<string, string> = {
  '/workshop/queue': 'คิวงานซ่อม',
  '/workshop/jobs': 'รายละเอียดงาน',
  '/workshop/requisitions': 'เบิกอะไหล่',
}

export default function WorkshopLayout() {
  return (
    <AppLayout
      navItems={navItems}
      pageTitles={pageTitles}
      defaultTitle="ช่างซ่อม (Workshop)"
    />
  )
}
