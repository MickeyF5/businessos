import { useState } from 'react'
import type { FormEvent } from 'react'
import type { StockItem } from '../types'

interface StockProps {
  stock: StockItem[]
  onCreate: (item: Omit<StockItem, 'id'>) => Promise<void>
  onUpdate: (item: StockItem) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatCurrency = (value: number) => currencyFormatter.format(Number.isFinite(value) ? value : 0)

const emptyStockForm = {
  name: '',
  sku: '',
  quantity: 0,
  price: 0,
}

export function Stock({ stock, onCreate, onUpdate, onDelete }: StockProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState(emptyStockForm)

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyStockForm)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!formState.name.trim() || !formState.sku.trim()) {
      return
    }

    const itemPayload = {
      name: formState.name.trim(),
      sku: formState.sku.trim().toUpperCase(),
      quantity: Number(formState.quantity) || 0,
      price: Number(formState.price) || 0,
    }

    if (editingId) {
      void onUpdate({ id: editingId, ...itemPayload })
    } else {
      void onCreate(itemPayload)
    }

    resetForm()
  }

  const handleEdit = (item: StockItem) => {
    setEditingId(item.id)
    setFormState({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
    })
  }

  const handleDelete = (itemId: string) => {
    void onDelete(itemId)
    if (editingId === itemId) {
      resetForm()
    }
  }

  return (
    <section className="section" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, letterSpacing: '0.12em', fontSize: '0.8rem', color: '#888' }}>STOCK</h2>
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>{stock.length} items</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input value={formState.name} onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))} placeholder="Item name" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.sku} onChange={(event) => setFormState((previous) => ({ ...previous, sku: event.target.value }))} placeholder="SKU" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input type="number" min="0" value={formState.quantity} onChange={(event) => setFormState((previous) => ({ ...previous, quantity: Number(event.target.value) || 0 }))} placeholder="Quantity" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input type="number" min="0" value={formState.price} onChange={(event) => setFormState((previous) => ({ ...previous, price: Number(event.target.value) || 0 }))} placeholder="Unit price" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {editingId && <button type="button" onClick={resetForm} style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>}
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>
              {editingId ? 'Update Item' : 'Add Stock Item'}
            </button>
          </div>
        </form>

        {stock.length === 0 ? (
          <div className="form-card" style={{ marginTop: '16px' }}>
            <p style={{ color: '#a0a0a0' }}>No inventory items found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Item</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>SKU</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Qty</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Price</th>
                  <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.name}</td>
                    <td style={{ padding: '12px 8px', color: '#d1d5db' }}>{item.sku}</td>
                    <td style={{ padding: '12px 8px', color: item.quantity < 10 ? '#fbbf24' : '#e5e7eb' }}>{item.quantity} units</td>
                    <td style={{ padding: '12px 8px', color: '#60a5fa', fontWeight: 700 }}>{formatCurrency(item.price)}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => handleEdit(item)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(item.id)} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Delete</button>
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
