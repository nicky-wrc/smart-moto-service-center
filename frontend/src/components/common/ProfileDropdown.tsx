import { useState, useRef, useEffect } from 'react'
import type { IUser } from '../../types'
import './ProfileDropdown.css'

interface Props {
  user: IUser | null
  onLogout: () => void
  onViewHistory?: () => void
}

type VerticalPosition = 'bottom' | 'top'
type HorizontalPosition = 'right' | 'left'

export default function ProfileDropdown({ user, onLogout, onViewHistory }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [verticalPos, setVerticalPos] = useState<VerticalPosition>('bottom')
  const [horizontalPos, setHorizontalPos] = useState<HorizontalPosition>('right')
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Calculate optimal positioning for dropdown menu
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return

    // Use requestAnimationFrame to ensure menu is fully rendered
    const timer = requestAnimationFrame(() => {
      if (!triggerRef.current || !menuRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const menuHeight = menuRef.current.offsetHeight
      const menuWidth = menuRef.current.offsetWidth
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Calculate space available
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const spaceRight = viewportWidth - triggerRect.right
      const spaceLeft = triggerRect.left

      // Determine vertical position
      const newVerticalPos: VerticalPosition =
        spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow ? 'top' : 'bottom'

      // Determine horizontal position
      const newHorizontalPos: HorizontalPosition =
        spaceRight < menuWidth + 10 && spaceLeft > spaceRight ? 'left' : 'right'

      setVerticalPos(newVerticalPos)
      setHorizontalPos(newHorizontalPos)
    })

    return () => cancelAnimationFrame(timer)
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  const handleViewHistory = () => {
    setIsOpen(false)
    if (onViewHistory) {
      onViewHistory()
    }
  }

  if (!user) return null

  return (
    <div className="profile-dropdown" ref={triggerRef}>
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        title={user.name}
      >
        <div className="profile-icon">
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
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`dropdown-menu dropdown-${verticalPos} dropdown-${horizontalPos}`}
        >
          <div className="dropdown-header">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-content">
            <div className="role-section">
              <div className="role-info">
                <svg
                  className="role-icon"
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
                  <p className="role-label">Role</p>
                  <p className="role-value">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <button className="history-button" onClick={handleViewHistory}>
            <svg
              className="history-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </button>

          <div className="dropdown-divider"></div>

          <button className="logout-button" onClick={handleLogout}>
            <svg
              className="logout-icon"
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
        <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  )
}
