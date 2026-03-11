import { useLocation, Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import Sidebar from './Sidebar'
import type { NavItem } from './Sidebar'

interface AppLayoutProps {
    navItems: NavItem[]
    pageTitles: Record<string, string>
    defaultTitle: string
}

export default function AppLayout({ navItems, pageTitles, defaultTitle }: AppLayoutProps) {
    const location = useLocation()
    
    // Sort paths by length (longest first) to match more specific paths first
    const sortedPaths = Object.entries(pageTitles).sort((a, b) => b[0].length - a[0].length)
    const title = sortedPaths.find(([path]) => location.pathname.startsWith(path))?.[1] ?? defaultTitle

    return (
        <div className="h-screen overflow-hidden bg-[#44403C] pb-4 pr-4 flex items-stretch font-[Kanit]">
            <div className="flex-1 bg-[#44403C] rounded-2xl flex flex-col overflow-hidden">
                <AppHeader title={title} />
                <div className="flex flex-1 gap-0 overflow-hidden">
                    <Sidebar navItems={navItems} />
                    <div className="flex-1 bg-white rounded-xl overflow-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}
