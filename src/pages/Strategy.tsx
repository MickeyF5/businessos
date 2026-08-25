import { useState } from 'react'
import type { FormEvent } from 'react'
import type { StrategyItem } from '../types'

interface StrategyProps {
  strategies: StrategyItem[]
  onCreate: (strategy: StrategyItem) => Promise<void>
  onUpdate: (strategy: StrategyItem) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const emptyStrategyForm = {
  title: '',
  description: '',
  priority: 'Medium' as StrategyItem['priority'],
  status: 'Planned' as StrategyItem['status'],
}

export function Strategy({ strategies, onCreate, onUpdate, onDelete }: StrategyProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState(emptyStrategyForm)

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyStrategyForm)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!formState.title.trim() || !formState.description.trim()) return

    const strategyPayload = {
      id: editingId ?? Date.now().toString(),
      title: formState.title.trim(),
      description: formState.description.trim(),
      priority: formState.priority,
      status: formState.status,
    }

    if (editingId) {
      void onUpdate(strategyPayload)
    } else {
      void onCreate(strategyPayload)
    }

    resetForm()
  }

  const handleEdit = (strategy: StrategyItem) => {
    setEditingId(strategy.id)
    setFormState({
      title: strategy.title,
      description: strategy.description,
      priority: strategy.priority,
      status: strategy.status,
    })
  }

  const handleDelete = (strategyId: string) => {
    void onDelete(strategyId)
    if (editingId === strategyId) resetForm()
  }

  return (
    <section className="section" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, letterSpacing: '0.12em', fontSize: '0.8rem', color: '#888' }}>STRATEGY</h2>
          <span style={{ color: '#c084fc', fontWeight: 700 }}>{strategies.length} initiatives</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input value={formState.title} onChange={(event) => setFormState((previous) => ({ ...previous, title: event.target.value }))} placeholder="Initiative title" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.description} onChange={(event) => setFormState((previous) => ({ ...previous, description: event.target.value }))} placeholder="Objective or description" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px', gridColumn: 'span 2' }} />
          <select value={formState.priority} onChange={(event) => setFormState((previous) => ({ ...previous, priority: event.target.value as StrategyItem['priority'] }))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}>
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>
          <select value={formState.status} onChange={(event) => setFormState((previous) => ({ ...previous, status: event.target.value as StrategyItem['status'] }))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}>
            <option value="Planned">Planned</option>
            <option value="In progress">In progress</option>
            <option value="Complete">Complete</option>
          </select>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {editingId && <button type="button" onClick={resetForm} style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>}
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>{editingId ? 'Update Initiative' : 'Add Initiative'}</button>
          </div>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Initiative</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Priority</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Status</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategy) => (
                <tr key={strategy.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: 700 }}>{strategy.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>{strategy.description}</div>
                  </td>
                  <td style={{ padding: '12px 8px', color: strategy.priority === 'High' ? '#f87171' : strategy.priority === 'Medium' ? '#facc15' : '#9ca3af', fontWeight: 700 }}>{strategy.priority}</td>
                  <td style={{ padding: '12px 8px', color: strategy.status === 'Complete' ? '#4ade80' : strategy.status === 'In progress' ? '#60a5fa' : '#d1d5db', fontWeight: 700 }}>{strategy.status}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleEdit(strategy)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                      <button type="button" onClick={() => handleDelete(strategy.id)} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Delete</button>
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
