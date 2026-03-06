import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IUser } from '../../types'
import './TopBar.css'

interface ProfileDropdownProps {
    user: IUser | null
    onLogout: () => void
}

type VerticalPosition = 'bottom' | 'top'
type HorizontalPosition = 'right' | 'left'

function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [verticalPos, setVerticalPos] = useState<VerticalPosition>('bottom')
    const [horizontalPos, setHorizontalPos] = useState<HorizontalPosition>('right')
    const triggerRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen || !triggerRef.current || !menuRef.current) return
        const timer = requestAnimationFrame(() => {
            if (!triggerRef.current || !menuRef.current) return
            const triggerRect = triggerRef.current.getBoundingClientRect()
            const menuHeight = menuRef.current.offsetHeight
            const menuWidth = menuRef.current.offsetWidth
            const viewportHeight = window.innerHeight
            const viewportWidth = window.innerWidth
            const spaceBelow = viewportHeight - triggerRect.bottom
            const spaceAbove = triggerRect.top
            const spaceRight = viewportWidth - triggerRect.right
            const spaceLeft = triggerRect.left
            setVerticalPos(spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow ? 'top' : 'bottom')
            setHorizontalPos(spaceRight < menuWidth + 10 && spaceLeft > spaceRight ? 'left' : 'right')
        })
        return () => cancelAnimationFrame(timer)
    }, [isOpen])

    if (!user) return null

    return (
        <div className="inv-profile-dropdown" ref={triggerRef}>
            <button
                className="inv-profile-button"
                onClick={() => setIsOpen(!isOpen)}
                title={user.name}
            >
                <div className="inv-profile-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        width="24"
                        height="24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                    </svg>
                </div>
                <svg
                    className="inv-chevron"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    width="16"
                    height="16"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={`inv-dropdown-menu inv-dropdown-${verticalPos} inv-dropdown-${horizontalPos}`}
                >
                    <div className="inv-dropdown-header">
                        <p className="inv-user-name">{user.name}</p>
                        <p className="inv-user-email">{user.email}</p>
                    </div>

                    <div className="inv-dropdown-divider" />

                    <div className="inv-dropdown-content">
                        <div className="inv-role-info">
                            <svg
                                className="inv-role-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            <div>
                                <p className="inv-role-label">Role</p>
                                <p className="inv-role-value">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="inv-dropdown-divider" />

                    <button className="inv-logout-button" onClick={() => { setIsOpen(false); onLogout() }}>
                        <svg
                            className="inv-logout-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Log Out
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="inv-dropdown-overlay" onClick={() => setIsOpen(false)} />
            )}
        </div>
    )
}

interface TopBarProps {
    title: string
    onLogout?: () => void
}

export default function TopBar({ title, onLogout }: TopBarProps) {
    const navigate = useNavigate()
    const [user, setUser] = useState<IUser | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try {
                setUser(JSON.parse(stored))
            } catch {
                setUser(null)
            }
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        if (onLogout) {
            onLogout()
        } else {
            navigate('/login', { replace: true })
        }
    }

    return (
        <header className="inv-topbar">
            {/* Logo */}
            <div className="inv-logo-area">
                <img src="/sa-logo.png" alt="SA Logo" className="inv-logo-img" />
                <span className="inv-title">{title}</span>
            </div>

            {/* Profile */}
            <div className="inv-profile-area">
                <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
        </header>
    )
}
