import type { FormEvent, MouseEvent } from 'react'
import type { Project, StockItem, Task, Transaction, UserProfile } from '../types'
import { StatCard } from '../components/StatCard'
import { TaskList } from '../components/TaskList'

interface DashboardProps {
  projects: Project[]
  tasks: Task[]
  stock: StockItem[]
  transactions: Transaction[]
  allUsers: UserProfile[]
  currentUserName?: string
  newTaskTitle: string
  newTaskAssignee: string
  onTaskAssigneeIdChange: (value: string | undefined) => void
  onAddTask: (event: FormEvent) => void
  onTaskTitleChange: (value: string) => void
  onTaskAssigneeChange: (value: string) => void
  onToggleTask: (id: number) => void
  onDeleteTask: (id: number, event: MouseEvent) => void
  onOpenProjectDetail: (project: Project) => void
  onNavigateProjects: () => void
  canManageProjects: boolean
}

export function Dashboard({
  projects,
  tasks,
  stock,
  transactions,
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
  const netBalance = transactions.reduce((acc, transaction) => {
    return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount
  }, 0)

  return (
    <>
      <section className="section" style={{ margin: '20px' }}>
        <h2>OVERVIEW</h2>
        <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          <StatCard dot="#22c55e" label="Active Projects" value={projects.length} />
          <StatCard dot="#3b82f6" label="Tasks" value={tasks.filter((task) => !task.done).length} />
          <StatCard dot="#f59e0b" label="Inventory SKUs" value={stock.length} />
          <StatCard dot="#ef4444" label="Net Balance ($)" value={netBalance} />
        </div>
      </section>

      <section className="section grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px' }}>
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

        <div style={{ background: '#141414', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
          <h2
            onClick={() => canManageProjects && onNavigateProjects()}
            style={{ cursor: canManageProjects ? 'pointer' : 'default' }}
          >
            PROJECTS ▾
          </h2>
          <ul className="project-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => onOpenProjectDetail(project)}
                style={{ padding: '10px', background: '#1a1a1a', borderRadius: '4px', cursor: 'pointer' }}
              >
                {project.icon} {project.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
