import type { FormEvent, MouseEvent } from 'react'
import type { Customer, Project, StockItem, StrategyItem, Task, UserProfile } from '../types'
import { StatCard } from '../components/StatCard'
import { TaskList } from '../components/TaskList'

interface DashboardProps {
  projects: Project[]
  tasks: Task[]
  stock: StockItem[]
  customers: Customer[]
  strategies: StrategyItem[]
  allUsers: UserProfile[]
  currentUserName?: string
  newTaskTitle: string
  newTaskAssignee: string
  onTaskAssigneeIdChange: (value: string | undefined) => void
  onAddTask: (event: FormEvent) => void
  onTaskTitleChange: (value: string) => void
  onTaskAssigneeChange: (value: string) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string, event: MouseEvent) => void
  onOpenProjectDetail: (project: Project) => void
  onNavigateProjects: () => void
  canManageProjects: boolean
}

export function Dashboard({
  projects,
  tasks,
  stock,
  customers,
  strategies,
  allUsers,
  currentUserName,
  newTaskTitle,
  newTaskAssignee,
  onTaskAssigneeIdChange,
  onAddTask,
  onTaskTitleChange,
  onTaskAssigneeChange,
  onToggleTask,
  onDeleteTask,
  onOpenProjectDetail,
  onNavigateProjects,
  canManageProjects,
}: DashboardProps) {
  const activeTasks = tasks.filter((task) => !task.done).length
  const doneTasks = tasks.filter((task) => task.done).length
  const activeCustomers = customers.filter((customer) => customer.status !== 'Inactive').length
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  const retentionRate = customers.length > 0 ? Math.round((activeCustomers / customers.length) * 100) : 0

  return (
    <div className="page-shell">
      <section className="section hero-panel">
        <div>
          <span className="eyebrow">Executive overview</span>
          <h1>VZM operating system</h1>
        </div>
        <div className="hero-meta">
          <div>
            <span className="hero-meta-label">Role</span>
            <strong>{currentUserName || 'Operator'}</strong>
          </div>
        </div>
      </section>

      <section className="section stat-grid">
        <StatCard dot="#22c55e" label="Active Projects" value={projects.length} trend={projects.length > 0 ? 'Live' : 'No projects'} />
        <StatCard dot="#60a5fa" label="Open Tasks" value={activeTasks} trend={activeTasks > 0 ? 'Live' : 'No tasks'} />
        <StatCard dot="#d4af37" label="Inventory SKUs" value={stock.length} trend={stock.length > 0 ? 'Live' : 'No inventory'} />
      </section>

      <section className="content-grid">
        <TaskList
          tasks={tasks}
          allUsers={allUsers}
          currentUserName={currentUserName}
          newTaskTitle={newTaskTitle}
          newTaskAssignee={newTaskAssignee}
          onTaskTitleChange={onTaskTitleChange}
          onTaskAssigneeChange={onTaskAssigneeChange}
          onTaskAssigneeIdChange={onTaskAssigneeIdChange}
          onAddTask={onAddTask}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />

        <div className="panel project-panel">
          <div className="panel-header">
            <h2 className="panel-title">Projects</h2>
            <button
              type="button"
              className="secondary-button"
              onClick={() => canManageProjects && onNavigateProjects()}
              style={{ cursor: canManageProjects ? 'pointer' : 'default' }}
            >
              View all
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="form-card" style={{ marginTop: 12 }}>
              <p style={{ color: '#a0a0a0' }}>No projects found.</p>
            </div>
          ) : (
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project.id} className="project-item" onClick={() => onOpenProjectDetail(project)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <span className="project-badge">{project.icon}</span>
                    <div className="project-copy">
                      <strong>{project.name}</strong>
                      <span>{project.description || 'Operational workspace'}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel metric-panel">
          <div className="panel-header">
            <h2 className="panel-title">Strategic overview</h2>
          </div>
          <ul className="metric-list">
            <li className="metric-item"><div><strong>Delivery health</strong><span>Completion rate</span></div><span style={{ color: '#68d391', fontWeight: 700 }}>{tasks.length > 0 ? `${completionRate}%` : '0%'}</span></li>
            <li className="metric-item"><div><strong>Client retention</strong><span>Active accounts</span></div><span style={{ color: '#facc15', fontWeight: 700 }}>{customers.length > 0 ? `${retentionRate}%` : '0%'}</span></li>
            <li className="metric-item"><div><strong>Operational focus</strong><span>Priority initiatives</span></div><span style={{ color: '#60a5fa', fontWeight: 700 }}>{strategies.length}</span></li>
          </ul>
        </div>

        <div className="panel metric-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent activity</h2>
          </div>
          <ul className="activity-list">
            <li className="activity-item"><div><strong>Projects tracked</strong><span>Live count from Supabase</span></div><span>{projects.length}</span></li>
            <li className="activity-item"><div><strong>Open tasks</strong><span>Outstanding work items</span></div><span>{activeTasks}</span></li>
            <li className="activity-item"><div><strong>Inventory items</strong><span>Current SKUs in system</span></div><span>{stock.length}</span></li>
          </ul>
        </div>
      </section>
    </div>
  )
}
