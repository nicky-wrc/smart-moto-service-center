import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'SERVICE_ADVISOR'
  | 'FOREMAN'
  | 'TECHNICIAN'
  | 'STOCK_KEEPER'
  | 'CASHIER'

export interface AuthUser {
  id: number
  username: string
  name: string
  role: UserRole
  isActive: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<{ access_token: string; user: AuthUser }>(
      '/auth/login',
      { username, password }
    )
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
