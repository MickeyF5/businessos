import { useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Transaction } from '../types'

interface AccountsProps {
  transactions: Transaction[]
  setTransactions: Dispatch<SetStateAction<Transaction[]>>
}

const emptyTransactionForm = {
  description: '',
  type: 'income' as Transaction['type'],
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
}

export function Accounts({ transactions, setTransactions }: AccountsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState(emptyTransactionForm)

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyTransactionForm)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!formState.description.trim()) {
      return
    }

    const transactionPayload = {
      id: editingId ?? Date.now().toString(),
      description: formState.description.trim(),
      type: formState.type,
      amount: Number(formState.amount) || 0,
      date: formState.date,
    }

    if (editingId) {
      setTransactions((previousTransactions) => previousTransactions.map((transaction) => (transaction.id === editingId ? transactionPayload : transaction)))
    } else {
      setTransactions((previousTransactions) => [transactionPayload, ...previousTransactions])
    }

    resetForm()
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setFormState({
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
    })
  }

  const handleDelete = (transactionId: string) => {
    setTransactions((previousTransactions) => previousTransactions.filter((transaction) => transaction.id !== transactionId))
    if (editingId === transactionId) {
      resetForm()
    }
  }

  return (
    <section className="section" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, letterSpacing: '0.12em', fontSize: '0.8rem', color: '#888' }}>ACCOUNTS</h2>
          <span style={{ color: '#4ade80', fontWeight: 700 }}>{transactions.length} entries</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input value={formState.description} onChange={(event) => setFormState((previous) => ({ ...previous, description: event.target.value }))} placeholder="Description" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px', gridColumn: '1 / -1' }} />
          <select value={formState.type} onChange={(event) => setFormState((previous) => ({ ...previous, type: event.target.value as Transaction['type'] }))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="number" min="0" value={formState.amount} onChange={(event) => setFormState((previous) => ({ ...previous, amount: Number(event.target.value) || 0 }))} placeholder="Amount" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input type="date" value={formState.date} onChange={(event) => setFormState((previous) => ({ ...previous, date: event.target.value }))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {editingId && <button type="button" onClick={resetForm} style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>}
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>
              {editingId ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Description</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Type</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Date</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Amount</th>
                <th style={{ padding: '12px 8px', color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>{transaction.description}</td>
                  <td style={{ padding: '12px 8px', color: transaction.type === 'income' ? '#4ade80' : '#f87171', fontWeight: 700 }}>{transaction.type}</td>
                  <td style={{ padding: '12px 8px', color: '#d1d5db' }}>{transaction.date}</td>
                  <td style={{ padding: '12px 8px', color: transaction.type === 'income' ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleEdit(transaction)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                      <button type="button" onClick={() => handleDelete(transaction.id)} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>Delete</button>
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
