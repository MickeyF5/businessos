import type { BusinessNotification, SearchResult, UserProfile, View } from '../types'
import { ROLE_COLORS, getRoleLabel } from '../lib/permissions'
import logo from '../assets/logo.jpeg'
import { VzmIcon } from './icons'

interface HeaderProps {
  currentUser: UserProfile | null
  isMenuOpen: boolean
  searchQuery: string
  searchResults: SearchResult[]
  notifications: BusinessNotification[]
  onSearchQueryChange: (value: string) => Promise<void> | void
  onClearSearch: () => void
  onToggleMenu: () => void
  onNavigate: (view: View) => void
  onNavigateSearchResult?: (result: SearchResult) => void
  onLogout: () => void
}

export function Header({
  currentUser,
  isMenuOpen,
  searchQuery,
  searchResults,
  notifications,
  onSearchQueryChange,
  onClearSearch,
  onToggleMenu,
  onNavigate,
  onNavigateSearchResult,
  onLogout,
}: HeaderProps) {
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
        <div style={{ position: 'relative', minWidth: '280px', maxWidth: '420px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 12px' }}>
            <VzmIcon name="search" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => void onSearchQueryChange(event.target.value)}
              placeholder="Search customers, projects, tasks, quotes, invoices…"
              style={{ flex: 1, border: 'none', background: 'transparent', color: '#f5f5f5', outline: 'none', fontSize: '0.9rem' }}
            />
            {searchQuery && (
              <button type="button" onClick={onClearSearch} style={{ border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, background: '#131313', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', boxShadow: '0 18px 30px rgba(0,0,0,0.28)', zIndex: 20, overflow: 'hidden' }}>
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => onNavigateSearchResult?.(result)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: '#f5f5f5', cursor: 'pointer', display: 'block' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{result.title}</strong>
                    <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d4af37' }}>{result.type}</span>
                  </div>
                  <div style={{ color: '#9ca3af', marginTop: '4px', fontSize: '0.8rem' }}>{result.subtitle}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="ghost-button" type="button" aria-label="Notifications">
            <VzmIcon name="bell" size={16} />
            <span>{notifications.length}</span>
          </button>
          {notifications.length > 0 && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '300px', background: '#131313', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', boxShadow: '0 18px 30px rgba(0,0,0,0.28)', zIndex: 20, padding: '10px' }}>
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} style={{ padding: '10px 12px', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', marginBottom: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.8rem' }}>{notification.title}</strong>
                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: notification.priority === 'high' ? '#fca5a5' : '#d4af37' }}>{notification.priority}</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.74rem', marginTop: '6px' }}>{notification.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>

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
