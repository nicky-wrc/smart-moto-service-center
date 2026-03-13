import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type AppHeaderProps = {
  title: string
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN:           'ผู้ดูแลระบบ',
  MANAGER:         'เจ้าของร้าน',
  SERVICE_ADVISOR: 'พนักงานต้อนรับ',
  FOREMAN:         'หัวหน้าช่าง',
  TECHNICIAN:      'ช่าง',
  STOCK_KEEPER:    'คลังสินค้า',
  CASHIER:         'แคชเชียร์',
}

export default function AppHeader({ title }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex items-center justify-between pl-6 pr-0 py-5">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src="/logo.png"
            alt="Smart Moto"
            className="w-7 h-7 object-contain"
          />
        </div>
        <span className="text-white text-2xl font-medium drop-shadow-md">{title}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 rounded-full focus:outline-none cursor-pointer"
        >
          <div className="text-right mr-1">
            <p className="text-white text-sm font-medium leading-none">{user?.name ?? '-'}</p>
            <p className="text-white/50 text-xs mt-0.5">{user ? ROLE_LABEL[user.role] ?? user.role : ''}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#F8981D] border-2 border-[#F8981D] flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-md">{initials}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-1 w-40 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-400">{user ? ROLE_LABEL[user.role] : ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer bg-transparent border-none"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
