import { useState } from 'react'
import ReceptionistPage from './pages/ReceptionistPage'
import LoginPage from './pages/LoginPage'
import HistoryPage from './pages/HistoryPage'
import type { IUser } from './types'
import './index.css'

type PageType = 'login' | 'receptionist' | 'history'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    return storedUser ? 'receptionist' : 'login'
  })

  const [user] = useState<IUser | null>(() => {
    // Initialize from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        localStorage.removeItem('user')
      }
    }
    return null
  })

  const handleNavigateToHistory = () => {
    setCurrentPage('history')
  }

  const handleNavigateBack = () => {
    setCurrentPage('receptionist')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setCurrentPage('login')
  }

  // Render based on current page
  if (currentPage === 'login') {
    return <LoginPage />
  }

  if (currentPage === 'history') {
    return <HistoryPage onBack={handleNavigateBack} />
  }

  return <ReceptionistPage onOpenHistory={handleNavigateToHistory} onLogout={handleLogout} />
}

export default App
