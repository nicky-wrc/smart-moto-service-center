import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN:          '/foreman/jobs',
  MANAGER:        '/owner/dashboard',
  SERVICE_ADVISOR:'/foreman/jobs',
  FOREMAN:        '/foreman/jobs',
  TECHNICIAN:     '/mechanic/jobs',
  STOCK_KEEPER:   '/inventory/parts',
  CASHIER:        '/accountant/dashboard',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      const user = JSON.parse(localStorage.getItem('user') ?? '{}')
      navigate(ROLE_REDIRECT[user.role] ?? '/foreman/jobs', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#F8981D] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1E1E1E]">Smart Moto</span>
          </div>
          <p className="text-sm text-gray-400">Service Center Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-lg font-semibold text-[#1E1E1E] mb-6">เข้าสู่ระบบ</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="username"
                required
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#F8981D] text-white font-medium rounded-xl py-2.5 text-sm cursor-pointer border-none hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        {/* Test accounts hint */}
        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-400 mb-2">บัญชีทดสอบ (รหัสผ่าน: password123)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              ['cashier1', 'บัญชี/แคชเชียร์'],
              ['foreman1', 'หัวหน้าช่าง'],
              ['tech1', 'ช่าง'],
              ['stock1', 'คลังสินค้า'],
              ['owner1', 'เจ้าของ'],
              ['admin', 'Admin'],
            ].map(([u, label]) => (
              <button
                key={u}
                type="button"
                onClick={() => { setUsername(u); setPassword('password123') }}
                className="text-left text-xs text-gray-500 hover:text-[#F8981D] transition-colors cursor-pointer bg-transparent border-none py-0.5"
              >
                <span className="font-mono">{u}</span>
                <span className="text-gray-300"> · </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
