interface StatCardProps {
  dot: string
  label: string
  value: number | string
  trend?: string
}

export function StatCard({ dot, label, value, trend = '+12.4%' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">
          <span className="status-dot" style={{ background: dot, color: dot }} />
          {label}
        </span>
        <span className="trend-badge">{trend}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
