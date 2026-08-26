import type { UserRole, View } from '../types'
import { hasPermission } from '../lib/permissions'
import { VzmIcon } from './icons'

interface NavigationProps {
  currentView: View
  role: UserRole
  onNavigate: (view: View) => void
  isOpen: boolean
  onClose: () => void
}

export function Navigation({ currentView, role, onNavigate, isOpen, onClose }: NavigationProps) {
  if (!isOpen) return null

  const navigate = (view: View) => {
    onNavigate(view)
    onClose()
  }

  const navItems = [
    { view: 'dashboard' as const, label: 'Dashboard', icon: 'dashboard' },
    { view: 'projects-manage' as const, label: 'Projects', icon: 'projects' },
    { view: 'stock' as const, label: 'Inventory', icon: 'stock' },
    { view: 'customers' as const, label: 'Customers', icon: 'customers' },
    { view: 'network' as const, label: 'Network', icon: 'network' },
    { view: 'strategy' as const, label: 'Strategy', icon: 'strategy' },
    { view: 'admin' as const, label: 'Admin Portal', icon: 'admin' },
  ]

  return (
    <nav className="nav-shell">
      {navItems.map(({ view, label, icon }) => {
        const permitted =
          view === 'dashboard' ||
          view === 'strategy' ||
          view === 'projects-manage'
            ? hasPermission(role, 'viewProjects') || view === 'dashboard' || view === 'strategy'
            : view === 'stock'
              ? hasPermission(role, 'viewStock')
              : view === 'customers'
                ? hasPermission(role, 'viewCustomers')
                : view === 'network'
                  ? hasPermission(role, 'viewNetwork')
                  : hasPermission(role, 'accessAdminPortal')

        if (!permitted) return null

        const isActive = currentView === view
        return (
          <button
            key={view}
            type="button"
            className={`nav-button ${isActive ? 'active' : ''}`}
            onClick={() => navigate(view)}
          >
            <VzmIcon name={icon as any} size={16} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
