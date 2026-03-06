import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/common/MainLayout'
import TopBar from '../../components/common/TopBar'
import InventorySidebar from '../../components/inventory/InventorySidebar'
import type { NavPage, NavItem } from '../../components/inventory/InventorySidebar'
import AllOrderContent from '../../components/inventory/AllOrderContent'
import InventoryStockContent from '../../components/inventory/InventoryStockContent'
import HistoryContent from '../../components/inventory/HistoryContent'
import SettingsContent from '../../components/inventory/SettingsContent'
import './AllOrderPage.css'

const pageTitles: Record<NavPage, string> = {
    'all-order': 'รายการคำร้องขอเบิกอะไหล่ทั้งหมด',
    'inventory': 'คลังอะไหล่',
    'history': 'ประวัติการเบิกอะไหล่',
    'settings': 'ตั้งค่าระบบ',
}

// ---- Main Page ----
interface Props {
    onLogout?: () => void
}

export default function AllOrderPage({ onLogout }: Props) {
    const navigate = useNavigate()
    const [activePage, setActivePage] = useState<NavPage>('all-order')

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        if (onLogout) {
            onLogout()
        } else {
            navigate('/login', { replace: true })
        }
    }

    const handleNavClick = (item: NavItem) => {
        setActivePage(item.id)
    }

    return (
        <MainLayout>
            {/* Top Bar */}
            <TopBar title={pageTitles[activePage]} onLogout={handleLogout} />

            {/* Body: sidebar + content */}
            <div className="inv-body">
                {/* Sidebar */}
                <InventorySidebar activePage={activePage} onNavClick={handleNavClick} />

                {/* Content Panel */}
                <main className="inv-content">
                    <div className="inv-content-panel">
                        {activePage === 'all-order' && <AllOrderContent />}
                        {activePage === 'inventory' && <InventoryStockContent />}
                        {activePage === 'history' && <HistoryContent />}
                        {activePage === 'settings' && <SettingsContent />}
                    </div>
                </main>
            </div>
        </MainLayout >
    )
}
