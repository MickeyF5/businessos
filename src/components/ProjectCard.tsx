import { ArrowUpRight, CalendarDays, FolderKanban, Users } from 'lucide-react'
import type { Project } from '../types'
import { PRIORITY_CONFIG, calculateProjectProgress, formatDueDate, getStatusColor } from '../lib/utils'

interface ProjectCardProps {
  project: Project
  completedTasks: number
  totalTasks: number
  documentCount: number
  assignedUsers?: string[]
  onCardClick: (project: Project) => void
}

export function ProjectCard({
  project,
  completedTasks,
  totalTasks,
  documentCount,
  assignedUsers = [],
  onCardClick,
}: ProjectCardProps) {
  const priority = project.priority || 'Medium'
  const progress = calculateProjectProgress(completedTasks, totalTasks)
  const priorityConfig = PRIORITY_CONFIG[priority]
  const statusColor = getStatusColor(project.due_date)
  const projectStatus = project.status || 'Planning'

  return (
    <div
      onClick={() => onCardClick(project)}
      style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.96), rgba(24, 24, 24, 0.92))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.28)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3d67a' }}>
            <FolderKanban size={18} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: priorityConfig.bgColor, color: priorityConfig.color, fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em' }}>
              {priorityConfig.label}
            </div>
            <div style={{ marginTop: '8px', color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{projectStatus}</div>
          </div>
        </div>
        <ArrowUpRight size={18} style={{ color: '#d4af37' }} />
      </div>

      <div>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.04em' }}>{project.name}</h3>
        {project.description && <p style={{ margin: '10px 0 0', color: '#b3b3b3', lineHeight: 1.5 }}>{project.description}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Progress</span>
          <span style={{ fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #f3d67a)', borderRadius: '999px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d5d5d5' }}>
          <Users size={14} style={{ color: '#d4af37' }} />
          <span style={{ fontSize: '0.8rem' }}>{assignedUsers.length > 0 ? assignedUsers.slice(0, 2).join(', ') : 'Unassigned'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d5d5d5' }}>
          <CalendarDays size={14} style={{ color: statusColor }} />
          <span style={{ fontSize: '0.8rem' }}>{formatDueDate(project.due_date)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
        <div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tasks {totalTasks}</div>
        <div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{documentCount} docs</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#bdbdbd', fontSize: '0.8rem' }}>
        <span>{project.customer_name || 'No customer linked'}</span>
        <span>{project.last_activity_at ? 'Updated recently' : 'No activity'}</span>
      </div>
    </div>
  )
}
