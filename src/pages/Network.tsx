import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Partner } from '../types'

interface NetworkProps {
  partners: Partner[]
  onCreate: (partner: Omit<Partner, 'id'>) => Promise<void>
  onUpdate: (partner: Partner) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const emptyPartnerForm = {
  name: '',
  business: '',
  role: '',
  contact: '',
}

export function Network({ partners, onCreate, onUpdate, onDelete }: NetworkProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState(emptyPartnerForm)

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyPartnerForm)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!formState.name.trim() || !formState.business.trim()) {
      return
    }

    const partnerPayload = {
      name: formState.name.trim(),
      business: formState.business.trim(),
      role: formState.role.trim() || 'Partner',
      contact: formState.contact.trim() || 'No contact provided',
    }

    if (editingId) {
      void onUpdate({ id: editingId, ...partnerPayload })
    } else {
      void onCreate(partnerPayload)
    }

    resetForm()
  }

  const handleEdit = (partner: Partner) => {
    setEditingId(partner.id)
    setFormState({
      name: partner.name,
      business: partner.business,
      role: partner.role,
      contact: partner.contact,
    })
  }

  const handleDelete = (partnerId: string) => {
    void onDelete(partnerId)
    if (editingId === partnerId) {
      resetForm()
    }
  }

  return (
    <section className="section" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, letterSpacing: '0.12em', fontSize: '0.8rem', color: '#888' }}>NETWORK</h2>
          <span style={{ color: '#facc15', fontWeight: 700 }}>{partners.length} partners</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input value={formState.name} onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))} placeholder="Partner name" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.business} onChange={(event) => setFormState((previous) => ({ ...previous, business: event.target.value }))} placeholder="Business" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.role} onChange={(event) => setFormState((previous) => ({ ...previous, role: event.target.value }))} placeholder="Role" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.contact} onChange={(event) => setFormState((previous) => ({ ...previous, contact: event.target.value }))} placeholder="Contact" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {editingId && <button type="button" onClick={resetForm} style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>}
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>
              {editingId ? 'Update Partner' : 'Add Partner'}
            </button>
          </div>
        </form>

        {partners.length === 0 ? (
          <div className="form-card" style={{ marginTop: '16px' }}>
            <p style={{ color: '#a0a0a0' }}>No partners found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Name</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Business</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Role</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Contact</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>{partner.name}</td>
                    <td style={{ padding: '12px 8px', color: '#d1d5db' }}>{partner.business}</td>
                    <td style={{ padding: '12px 8px', color: '#60a5fa', fontWeight: 700 }}>{partner.role}</td>
                    <td style={{ padding: '12px 8px', color: '#d1d5db' }}>{partner.contact}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => handleEdit(partner)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(partner.id)} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
