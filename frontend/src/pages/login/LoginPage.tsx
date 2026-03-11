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
    <div className="min-h-screen flex">

      {/* ── Left panel — illustration ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#1E1E1E]">
        {/* Hero image */}
        <img
          src="/background.png"
          alt="Smart Moto Service Center"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay — darkens bottom so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E]/80 via-[#1E1E1E]/20 to-transparent" />

        {/* Branding overlay */}
        <div className="relative z-10 flex flex-col justify-end p-10 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#44403C]/80 backdrop-blur rounded-2xl flex items-center justify-center">
              <img src="/logo.png" alt="Smart Moto" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <p className="text-white text-lg font-bold leading-none">RevUp</p>
              <p className="text-white/50 text-xs mt-0.5">Smart Moto Service Center</p>
            </div>
          </div>
          <h2 className="text-white text-3xl font-bold leading-snug max-w-xs">
            บริหารศูนย์ซ่อม<br />
            <span className="text-[#F8981D]">ครบจบในที่เดียว</span>
          </h2>
          <p className="text-white/50 text-sm mt-3 max-w-xs leading-relaxed">
            จัดการใบงาน อะไหล่ และทีมช่าง อย่างมืออาชีพ
          </p>
        </div>

        {/* Orange accent corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8981D]/20 rounded-bl-full" />
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12 bg-[#F8F7F5]">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-9 h-9 bg-[#44403C] rounded-xl flex items-center justify-center">
            <img src="/logo.png" alt="Smart Moto" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-lg font-bold text-[#1E1E1E]">Smart Moto</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E1E1E]">เข้าสู่ระบบ</h1>
          <p className="text-sm text-gray-400 mt-1">ยินดีต้อนรับกลับมา</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#F8981D] focus:ring-2 focus:ring-[#F8981D]/10 transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#F8981D] focus:ring-2 focus:ring-[#F8981D]/10 transition-all shadow-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F8981D] text-white font-semibold rounded-xl py-3 text-sm cursor-pointer border-none hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 shadow-sm shadow-[#F8981D]/30"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Test accounts */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">บัญชีทดสอบ (รหัสผ่าน: password123)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              ['cashier1', 'บัญชี / แคชเชียร์'],
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
                className="text-left text-xs text-gray-400 hover:text-[#F8981D] transition-colors cursor-pointer bg-transparent border-none py-0.5 flex items-center gap-1.5 group"
              >
                <span className="font-mono text-gray-500 group-hover:text-[#F8981D] transition-colors">{u}</span>
                <span className="text-gray-300">·</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
