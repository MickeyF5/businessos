import { useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Customer } from '../types'

interface CustomersProps {
  customers: Customer[]
  setCustomers: Dispatch<SetStateAction<Customer[]>>
}

const emptyCustomerForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'Active' as Customer['status'],
  totalSpent: 0,
}

export function Customers({ customers, setCustomers }: CustomersProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState(emptyCustomerForm)

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyCustomerForm)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!formState.name.trim() || !formState.company.trim() || !formState.email.trim()) {
      return
    }

    const customerPayload = {
      id: editingId ?? Date.now().toString(),
      name: formState.name.trim(),
      company: formState.company.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim() || 'Not provided',
      status: formState.status,
      totalSpent: Number(formState.totalSpent) || 0,
    }

    if (editingId) {
      setCustomers((previousCustomers) => previousCustomers.map((customer) => (customer.id === editingId ? customerPayload : customer)))
    } else {
      setCustomers((previousCustomers) => [customerPayload, ...previousCustomers])
    }

    resetForm()
  }

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setFormState({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      totalSpent: customer.totalSpent,
    })
  }

  const handleDelete = (customerId: string) => {
    setCustomers((previousCustomers) => previousCustomers.filter((customer) => customer.id !== customerId))
    if (editingId === customerId) {
      resetForm()
    }
  }

  return (
    <section className="section" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, letterSpacing: '0.12em', fontSize: '0.8rem', color: '#888' }}>CUSTOMERS</h2>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>{customers.length} total</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input
            value={formState.name}
            onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
            placeholder="Customer name"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}
          />
          <input
            value={formState.company}
            onChange={(event) => setFormState((previous) => ({ ...previous, company: event.target.value }))}
            placeholder="Company"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}
          />
          <input
            type="email"
            value={formState.email}
            onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
            placeholder="Email"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}
          />
          <input
            value={formState.phone}
            onChange={(event) => setFormState((previous) => ({ ...previous, phone: event.target.value }))}
            placeholder="Phone"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}
          />
          <select
            value={formState.status}
            onChange={(event) => setFormState((previous) => ({ ...previous, status: event.target.value as Customer['status'] }))}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}
          >
            <option value="Active">Active</option>
            <option value="VIP">VIP</option>
            <option value="Inactive">Inactive</option>
          </select>
          <input
            type="number"
            min="0"
            value={formState.totalSpent}
            onChange={(event) => setFormState((previous) => ({ ...previous, totalSpent: Number(event.target.value) || 0 }))}
            placeholder="Total spent"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}
          />

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>
              {editingId ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Name</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Company</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Contact</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Status</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Spent</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: 700 }}>{customer.name}</div>
                  </td>
                  <td style={{ padding: '12px 8px', color: '#d1d5db' }}>{customer.company}</td>
                  <td style={{ padding: '12px 8px', color: '#d1d5db' }}>
                    <div>{customer.email}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{customer.phone}</div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: customer.status === 'VIP' ? '#4f46e5' : customer.status === 'Inactive' ? '#374151' : '#14532d',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', color: '#22c55e', fontWeight: 700 }}>${customer.totalSpent.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleEdit(customer)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(customer.id)} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
