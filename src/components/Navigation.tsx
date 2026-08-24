import type { CSSProperties } from 'react'
import type { UserRole, View } from '../types'
import { hasPermission } from '../lib/permissions'

interface NavigationProps {
  currentView: View
  role: UserRole
  onNavigate: (view: View) => void
  isOpen: boolean
  onClose: () => void
}

const navButtonStyle = (isActive: boolean): CSSProperties => ({
  background: 'none',
  border: 'none',
  color: isActive ? '#3b82f6' : '#888',
  cursor: 'pointer',
  fontWeight: isActive ? 'bold' : 'normal',
})

export function Navigation({ currentView, role, onNavigate, isOpen, onClose }: NavigationProps) {
  if (!isOpen) return null

  const navigate = (view: View) => {
    onNavigate(view)
    onClose()
  }

  return (
    <nav style={{ background: '#141414', padding: '12px 20px', display: 'flex', gap: '20px', borderBottom: '1px solid #222', flexWrap: 'wrap' }}>
      <button onClick={() => navigate('dashboard')} style={navButtonStyle(currentView === 'dashboard')}>
        🏠 Dashboard
      </button>
      {hasPermission(role, 'viewProjects') && (
        <button onClick={() => navigate('projects-manage')} style={navButtonStyle(currentView === 'projects-manage')}>
          📁 Projects
        </button>
      )}
      {hasPermission(role, 'viewStock') && (
        <button onClick={() => navigate('stock')} style={navButtonStyle(currentView === 'stock')}>
          📦 Stock
        </button>
      )}
      {hasPermission(role, 'viewCustomers') && (
        <button onClick={() => navigate('customers')} style={navButtonStyle(currentView === 'customers')}>
          👥 Customers
        </button>
      )}
      {hasPermission(role, 'viewAccounts') && (
        <button onClick={() => navigate('accounts')} style={navButtonStyle(currentView === 'accounts')}>
          💰 Accounts
        </button>
      )}
      {hasPermission(role, 'viewNetwork') && (
        <button onClick={() => navigate('network')} style={navButtonStyle(currentView === 'network')}>
          🤝 Network
        </button>
      )}
      <button onClick={() => navigate('strategy')} style={navButtonStyle(currentView === 'strategy')}>
        🧠 Strategy
      </button>
      {hasPermission(role, 'accessAdminPortal') && (
        <button onClick={() => navigate('admin')} style={{ background: 'none', border: 'none', color: currentView === 'admin' ? '#f59e0b' : '#d97706', cursor: 'pointer', fontWeight: 'bold' }}>
          ⚙️ Admin Portal
        </button>
      )}
    </nav>
  )
}
