import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import ReceptionistPage from './pages/ReceptionistPage'
import SearchCustomerPage from './pages/SearchCustomerPage'
import RegisterCustomerPage from './pages/RegisterCustomerPage'
import ConfirmCustomerPage from './pages/ConfirmCustomerPage'
import LoginPage from './pages/LoginPage'
import HistoryPage from './pages/HistoryPage'
import type { ICustomer } from './types'
import './index.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [navigate, location.pathname])

  // Navigation handlers
  const handleNavigateToHistory = () => {
    navigate('/history')
  }

  const handleNavigateBack = () => {
    navigate('/receptionist')
    setSelectedCustomer(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  // Step handlers
  const handleSelectExisting = () => {
    navigate('/search')
  }

  const handleSelectNew = () => {
    navigate('/register')
    setSelectedCustomer(null)
  }

  const handleCustomerFound = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    navigate('/confirm')
  }

  const handleCustomerCreated = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    navigate('/confirm')
  }

  const handleConfirm = () => {
    navigate('/receptionist')
    setSelectedCustomer(null)
  }

  const handleBackFromStep = () => {
    navigate(-1)
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/history"
        element={<HistoryPage onBack={handleNavigateBack} />}
      />
      <Route
        path="/search"
        element={
          <SearchCustomerPage
            onCustomerFound={handleCustomerFound}
            onBack={handleBackFromStep}
            onOpenHistory={handleNavigateToHistory}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterCustomerPage
            onCustomerCreated={handleCustomerCreated}
            onBack={handleBackFromStep}
            onOpenHistory={handleNavigateToHistory}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/confirm"
        element={
          selectedCustomer ? (
            <ConfirmCustomerPage
              customer={selectedCustomer}
              onConfirm={handleConfirm}
              onBack={handleBackFromStep}
              onOpenHistory={handleNavigateToHistory}
              onLogout={handleLogout}
            />
          ) : (
            <div>Loading...</div>
          )
        }
      />
      <Route
        path="/"
        element={
          <ReceptionistPage
            onSelectExisting={handleSelectExisting}
            onSelectNew={handleSelectNew}
            onOpenHistory={handleNavigateToHistory}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/receptionist"
        element={
          <ReceptionistPage
            onSelectExisting={handleSelectExisting}
            onSelectNew={handleSelectNew}
            onOpenHistory={handleNavigateToHistory}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  )
}

export default App
