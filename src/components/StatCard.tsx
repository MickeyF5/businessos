interface StatCardProps {
  dot: string
  label: string
  value: number | string
}

export function StatCard({ dot, label, value }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{
        background: '#141414',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #222',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot }} />
        <small style={{ color: '#888' }}>{label}</small>
      </div>
      <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}
