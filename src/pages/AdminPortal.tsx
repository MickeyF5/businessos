import { useMemo, useState } from 'react'
import type { UserProfile, UserRole } from '../types'

interface AdminPortalProps {
  allUsers: UserProfile[]
  currentUser: UserProfile | null
  onUpdateUserRole: (userId: string, newRole: UserRole) => void
}

const roleOrder: UserRole[] = ['admin', 'founder', 'manager', 'employee']

export function AdminPortal({ allUsers, currentUser, onUpdateUserRole }: AdminPortalProps) {
  const [query, setQuery] = useState('')

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return [...allUsers].sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
    }

    return allUsers.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(normalized))
  }, [allUsers, query])

  if (!currentUser || currentUser.role !== 'admin') {
    return null
  }

  return (
    <section className="section" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, letterSpacing: '0.12em', fontSize: '0.8rem', color: '#888' }}>ADMIN PORTAL</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px', minWidth: '220px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {filteredUsers.map((user) => (
            <div key={user.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{user.email}</div>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    background: user.role === 'admin' ? '#1d4ed8' : user.role === 'founder' ? '#7c3aed' : user.role === 'manager' ? '#0f766e' : '#374151',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {user.role}
                </span>
              </div>

              <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '6px' }}>Role</label>
              <select
                value={user.role}
                onChange={(event) => onUpdateUserRole(user.id, event.target.value as UserRole)}
                style={{ width: '100%', background: '#141414', border: '1px solid #333', color: '#fff', padding: '8px 10px', borderRadius: '6px' }}
              >
                <option value="admin">Administrator</option>
                <option value="founder">Founder</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
