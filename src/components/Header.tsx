import type { UserProfile, View } from '../types'
import { ROLE_COLORS, getRoleLabel } from '../lib/permissions'
import logo from '../assets/logo.jpeg'
import { VzmIcon } from './icons'

interface HeaderProps {
  currentUser: UserProfile | null
  isMenuOpen: boolean
  onToggleMenu: () => void
  onNavigate: (view: View) => void
  onLogout: () => void
}

export function Header({ currentUser, isMenuOpen, onToggleMenu, onNavigate, onLogout }: HeaderProps) {
  const role = currentUser?.role || 'employee'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button"
          onClick={onToggleMenu}
          title="Toggle Navigation"
          aria-label="Toggle navigation"
          type="button"
        >
          <VzmIcon name={isMenuOpen ? 'close' : 'menu'} size={18} />
        </button>
      </div>

      <button
        className="brand-mark"
        type="button"
        onClick={() => onNavigate('dashboard')}
        aria-label="Go to dashboard"
      >
        <img className="header-logo" src={logo} alt="VZM" />
      </button>

      <div className="topbar-right">
        <div className="user-pill">
          <VzmIcon name="user" size={18} />
          <div className="user-pill-copy">
            <span>{currentUser?.name || 'Guest'}</span>
            <small style={{ color: ROLE_COLORS[role] }}>{getRoleLabel(role)}</small>
          </div>
        </div>

        <button className="ghost-button" type="button" onClick={onLogout}>
          <VzmIcon name="logout" size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
