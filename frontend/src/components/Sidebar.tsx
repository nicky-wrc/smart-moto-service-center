import { useNavigate, useLocation } from 'react-router-dom'

export type NavItem = {
  path: string
  label: string
  icon: React.ReactNode
}

type SidebarProps = {
  navItems: NavItem[]
}

export default function Sidebar({ navItems }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="flex flex-col items-center gap-4 pt-4 w-16">
      {navItems.map((item) => (
        <div key={item.path} className="relative group">
          <button
            onClick={() => navigate(item.path)}
            className={`
              w-10 h-10 flex items-center justify-center rounded-lg transition-colors
              ${isActive(item.path)
                ? 'bg-[#F8981D] text-white [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]'
                : 'text-[#F8981D] hover:bg-white/10'
              }
            `}
          >
            {item.icon}
          </button>
          <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
