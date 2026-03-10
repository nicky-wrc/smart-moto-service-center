import AppLayout from '../../components/AppLayout'
import type { NavItem } from '../../components/Sidebar'

const navItems: NavItem[] = [
    {
        path: '/reception',
        label: 'รับลูกค้า',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        path: '/reception/history',
        label: 'ประวัติการรับบริการ',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
]

const pageTitles: Record<string, string> = {
    '/reception': 'รับลูกค้าใหม่/ลูกค้าเก่า',
    '/reception/history': 'ประวัติการรับลูกค้า',
}

export default function ReceptionLayout() {
    return (
        <AppLayout
            navItems={navItems}
            pageTitles={pageTitles}
            defaultTitle="พนักงานรับรถ"
        />
    )
}
