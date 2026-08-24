import type { UserProfile, View } from '../types'
import { ROLE_COLORS, getRoleLabel } from '../lib/permissions'
import logo from '../assets/logo.jpeg'

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
    <header
      className="header"
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#141414',
        borderBottom: '1px solid #222',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onToggleMenu}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
          title="Toggle Navigation"
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <button
        className="header-logo-button"
        type="button"
        onClick={() => onNavigate('dashboard')}
        aria-label="Go to dashboard"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <img className="header-logo" src={logo} alt="Business OS" />
      </button>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span className="user">
          👤 {currentUser?.name}
          <small style={{ color: ROLE_COLORS[role], marginLeft: '5px', fontWeight: 'bold' }}>
            ({getRoleLabel(role)})
          </small>
        </span>
        <button
          onClick={onLogout}
          style={{
            background: '#262626',
            color: '#ccc',
            border: '1px solid #333',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}
