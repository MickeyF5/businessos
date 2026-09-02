import type { FormEvent, MouseEvent } from 'react'
import { FileText, FolderKanban, ReceiptText, ShoppingCart, Ticket, Users } from 'lucide-react'
import type { Customer, Project, StockItem, StrategyItem, Task, UserProfile } from '../types'
import { StatCard } from '../components/StatCard'
import { TaskList } from '../components/TaskList'
import { ProjectCard } from '../components/ProjectCard'
import { sortByPriority } from '../lib/utils'

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
  newTaskPriority?: 'High' | 'Medium' | 'Low'
  onTaskAssigneeIdChange: (value: string | undefined) => void
  onAddTask: (event: FormEvent) => void
  onTaskTitleChange: (value: string) => void
  onTaskAssigneeChange: (value: string) => void
  onTaskPriorityChange?: (value: 'High' | 'Medium' | 'Low') => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string, event: MouseEvent) => void
  onOpenProjectDetail: (project: Project) => void
  onNavigateProjects: () => void
  onNavigateStock?: () => void
  onNavigateCustomers?: () => void
  canManageProjects: boolean
}

// Helper function to count completed tasks for a project
function getProjectProgress(projectId: string | undefined, tasks: Task[]): { completed: number; total: number } {
  if (!projectId) return { completed: 0, total: 0 }
  const projectTasks = tasks.filter((task) => task.project_id === projectId)
  const completed = projectTasks.filter((task) => task.done).length
  return { completed, total: projectTasks.length }
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
  newTaskPriority = 'Medium',
  onTaskAssigneeIdChange,
  onAddTask,
  onTaskTitleChange,
  onTaskAssigneeChange,
  onTaskPriorityChange,
  onToggleTask,
  onDeleteTask,
  onOpenProjectDetail,
  onNavigateProjects,
  onNavigateCustomers,
  canManageProjects,
}: DashboardProps) {
  const activeTasks = tasks.filter((task) => !task.done).length
  const doneTasks = tasks.filter((task) => task.done).length
  const activeCustomers = customers.filter((customer) => customer.status !== 'Inactive').length
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  const retentionRate = customers.length > 0 ? Math.round((activeCustomers / customers.length) * 100) : 0

  const sortedProjects = sortByPriority(projects)

  return (
    <div className="page-shell">
      {/* Hero Panel */}
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

      {/* Key Metrics */}
      <section className="section stat-grid">
        <StatCard
          dot="#22c55e"
          label="Active Projects"
          value={projects.length}
          trend={projects.length > 0 ? 'Operational' : 'None'}
        />
        <StatCard
          dot="#60a5fa"
          label="Open Tasks"
          value={activeTasks}
          trend={activeTasks > 0 ? 'In progress' : 'Complete'}
        />
        <StatCard
          dot="#d4af37"
          label="Inventory SKUs"
          value={stock.length}
          trend={stock.length > 0 ? `${stock.length} items` : 'Empty'}
        />
      </section>

      {/* Main Content Grid */}
      <section className="content-grid">
        {/* Task List Panel */}
        <TaskList
          tasks={tasks}
          allUsers={allUsers}
          currentUserName={currentUserName}
          newTaskTitle={newTaskTitle}
          newTaskAssignee={newTaskAssignee}
          newTaskPriority={newTaskPriority}
          onTaskTitleChange={onTaskTitleChange}
          onTaskAssigneeChange={onTaskAssigneeChange}
          onTaskAssigneeIdChange={onTaskAssigneeIdChange}
          onTaskPriorityChange={onTaskPriorityChange}
          onAddTask={onAddTask}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />

        {/* Projects Panel */}
        <div className="panel project-panel">
          <div className="panel-header">
            <h2 className="panel-title">Active Projects</h2>
            <button
              type="button"
              className="secondary-button"
              onClick={() => canManageProjects && onNavigateProjects()}
              style={{ cursor: canManageProjects ? 'pointer' : 'default' }}
            >
              Manage
            </button>
          </div>

          {projects.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#a0a0a0',
              }}
            >
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>No active projects found</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#808080' }}>
                Start a new project to organize your work
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '12px',
                padding: '14px',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {sortedProjects.map((project) => {
                const { completed, total } = getProjectProgress(project.id, tasks)
                const assignedUsers = (project.assigned_users as string[]) || []

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    completedTasks={completed}
                    totalTasks={total}
                    documentCount={0} // TODO: Calculate from documents table
                    assignedUsers={assignedUsers}
                    onCardClick={onOpenProjectDetail}
                  />
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Strategic Overview & Quick Actions */}
      <section className="lower-grid">
        {/* Metrics Overview */}
        <div className="panel metric-panel">
          <div className="panel-header">
            <h2 className="panel-title">Operational metrics</h2>
          </div>
          <ul className="metric-list">
            <li className="metric-item">
              <div>
                <strong>Delivery health</strong>
              </div>
              <span style={{ color: '#68d391', fontWeight: 700, fontSize: '1.4rem' }}>
                {completionRate}%
              </span>
            </li>
            <li className="metric-item">
              <div>
                <strong>Client retention</strong>
              </div>
              <span style={{ color: '#facc15', fontWeight: 700, fontSize: '1.4rem' }}>
                {customers.length > 0 ? retentionRate : 0}%
              </span>
            </li>
            <li className="metric-item">
              <div>
                <strong>Strategic initiatives</strong>
              </div>
              <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1.4rem' }}>
                {strategies.length}
              </span>
            </li>
          </ul>
        </div>

        {/* Activity Summary & Quick Actions */}
        <div className="panel metric-panel" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div className="panel-header">
            <h2 className="panel-title">Quick actions</h2>
          </div>

          {/* Activity Summary */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f5f5f5' }}>
                {projects.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginTop: '4px' }}>Projects</div>
            </div>
            <div
              style={{
                width: '1px',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f5f5f5' }}>
                {activeTasks}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginTop: '4px' }}>Open tasks</div>
            </div>
            <div
              style={{
                width: '1px',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f5f5f5' }}>
                {stock.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginTop: '4px' }}>Inventory</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              padding: '14px 12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '8px',
              flex: 1,
            }}
          >
            <button
              onClick={onNavigateProjects}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.22)', borderRadius: '8px', color: '#d4af37', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <FolderKanban size={16} />
              Project
            </button>

            <button
              onClick={onNavigateCustomers}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.22)', borderRadius: '8px', color: '#22c55e', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <Users size={16} />
              Customer
            </button>

            <button
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.22)', borderRadius: '8px', color: '#a855f7', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <FileText size={16} />
              Quote
            </button>

            <button
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.22)', borderRadius: '8px', color: '#60a5fa', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <ReceiptText size={16} />
              Invoice
            </button>

            <button
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(45, 212, 191, 0.08)', border: '1px solid rgba(45, 212, 191, 0.22)', borderRadius: '8px', color: '#2dd4bf', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <ShoppingCart size={16} />
              Job
            </button>

            <button
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.22)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <Ticket size={16} />
              Task
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

