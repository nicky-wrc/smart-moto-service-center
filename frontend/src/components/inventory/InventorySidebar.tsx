import React from 'react'
import './InventorySidebar.css'

export type NavPage = 'all-order' | 'inventory' | 'history' | 'settings'

export interface NavItem {
    id: NavPage
    label: string
    path: string
    icon: React.ReactNode
}

export const inventoryNavItems: NavItem[] = [
    {
        id: 'all-order',
        label: 'รายการคำร้องขอเบิกอะไหล่ทั้งหมด',
        path: '/inventory/all-order',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="m10.71 1.29l3 3L14 5v9l-1 1H4l-1-1V2l1-1h6l.71.29ZM4 14h9V5l-3-3H4v12Zm4-8H6v1h2v2h1V7h2V6H9V4H8v2Zm-2 5h5v1H6v-1Z" clipRule="evenodd" /></svg>
        ),
    },
    {
        id: 'inventory',
        label: 'คลังอะไหล่',
        path: '/inventory/stock',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M3 20V8.7q-.425-.275-.713-.7T2 7V4q0-.825.588-1.413T4 2h16q.825 0 1.413.588T22 4v3q0 .575-.288 1T21 8.7V20q0 .825-.588 1.413T19 22H5q-.825 0-1.413-.588T3 20ZM20 7V4H4v3h16ZM9 14h6v-2H9v2Z" /></svg>
        ),
    },
    {
        id: 'history',
        label: 'ประวัติการเบิก',
        path: '/inventory/history',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="22" height="22">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        ),
    },
    {
        id: 'settings',
        label: 'ตั้งค่า',
        path: '/inventory/settings',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="22" height="22">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        ),
    },
]

interface Props {
    activePage: NavPage
    onNavClick: (item: NavItem) => void
}

export default function InventorySidebar({ activePage, onNavClick }: Props) {
    return (
        <nav className="inv-sidebar">
            {inventoryNavItems.map((item) => (
                <button
                    key={item.id}
                    className={`inv-nav-btn${activePage === item.id ? ' inv-nav-btn--active' : ''}`}
                    onClick={() => onNavClick(item)}
                    title={item.label}
                >
                    {item.icon}
                </button>
            ))}
        </nav>
    )
}
