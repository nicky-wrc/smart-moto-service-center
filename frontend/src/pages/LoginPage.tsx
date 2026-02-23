import { useState } from 'react'
import type { IUser } from '../types'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!email || !password) {
        setError('กรุณากรอกอีเมลและรหัสผ่าน')
        setIsLoading(false)
        return
      }

      // Mock user data based on email
      let userRole: 'service-advisor' | 'tech-lead' | 'manager' | 'receptionist' = 'service-advisor'
      
      if (email.includes('tech')) {
        userRole = 'tech-lead'
      } else if (email.includes('manager')) {
        userRole = 'manager'
      } else if (email.includes('receptionist')) {
        userRole = 'receptionist'
      }

      const mockUser: IUser = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        role: userRole,
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'mock-token-' + Date.now())

      // Redirect to home page
      window.location.href = '/'
    } catch {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Smart Moto Service Center</h1>
          <p className="login-subtitle">ระบบต้อนรับลูกค้า</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              placeholder="example@smartmoto.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="demo-title">ทดลองเข้าสู่ระบบด้วยบัญชีทดสอบ:</p>
          <ul>
            <li>
              <strong>Service Advisor : </strong> advisor@smartmoto.com
            </li>
            <li>
              <strong>Lead Technician : </strong> tech@smartmoto.com
            </li>
            <li>
              <strong>Manager : </strong> manager@smartmoto.com
            </li>
            <li>
              <strong>Receptionist : </strong> receptionist@smartmoto.com
            </li>
          </ul>
          <p className="demo-note">รหัสผ่าน: อะไรก็ได้ (ใช้สำหรับทดสอบเท่านั้น)</p>
        </div>
      </div>
    </div>
  )
}
