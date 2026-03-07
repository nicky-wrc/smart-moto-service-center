import { useState } from 'react'

type AppHeaderProps = {
  title: string
}

export default function AppHeader({ title }: AppHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="flex items-center justify-between px-5 py-5">
      <div className="flex items-center gap-4">
        <span className="text-white font-bold text-2xl tracking-wide drop-shadow-md">SA</span>
        <span className="text-white text-2xl font-medium drop-shadow-md">{title}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 rounded-full focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-[#F8981D] border-2 border-[#F8981D] flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-md">SA</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-1 w-40 z-50">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">โปรไฟล์</button>
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">ออกจากระบบ</button>
          </div>
        )}
      </div>
    </div>
  )
}
