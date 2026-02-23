import { useState } from 'react'
import ProfileDropdown from './ProfileDropdown'
import type { IUser } from '../../types'
import './ReceptionistHeader.css'

interface Props {
  onOpenHistory?: () => void
  onLogout?: () => void
}

export default function ReceptionistHeader({ onOpenHistory, onLogout: onLogoutProp }: Props) {
  // Mock user data - ในอนาคตควรมาจาก context หรือ props
  const [user] = useState<IUser>({
    id: '1',
    name: 'สมชาย สมการ',
    email: 'somchai@smartmoto.com',
    role: 'service-advisor',
  })

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // Call parent logout handler
    if (onLogoutProp) {
      onLogoutProp()
    } else {
      // Fallback to redirect
      window.location.href = '/login'
    }
  }

  const handleViewHistory = () => {
    if (onOpenHistory) {
      onOpenHistory()
    } else {
      // Fallback to navigation
      window.location.href = '/history'
    }
  }

  return (
    <header className="receptionist-header">
      <div className="header-content">
        <div className="header-main">
          <div className="logo-section">
            <div className="logo-text-container">
              <h1>Smart Moto Service Center</h1>
              <p className="subtitle">ระบบต้อนรับลูกค้า</p>
            </div>
          </div>
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  )
}
