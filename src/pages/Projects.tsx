import type { ChangeEvent, FormEvent } from 'react'
import { FolderOpen, Plus, UploadCloud } from 'lucide-react'
import type { Priority, Project, ProjectStatus } from '../types'
import { ProjectCard } from '../components/ProjectCard'
import { PRIORITY_CONFIG, sortByPriority } from '../lib/utils'

interface ProjectsProps {
  projects: Project[]
  editingId: string | null
  projectName: string
  projectDesc: string
  projectPriority?: Priority
  projectStatus?: ProjectStatus
  projectStartDate?: string
  projectDueDate?: string
  projectAssignedUsers?: string[]
  projectCustomerId?: string | null
  customers?: Array<{ id: string; name: string; company: string }>
  canManageProjects: boolean
  onProjectNameChange: (value: string) => void
  onProjectDescChange: (value: string) => void
  onProjectPriorityChange?: (value: Priority) => void
  onProjectStatusChange?: (value: ProjectStatus) => void
  onProjectStartDateChange?: (value: string) => void
  onProjectDueDateChange?: (value: string) => void
  onProjectAssignedUsersChange?: (value: string[]) => void
  onProjectCustomerChange?: (value: string) => void
  onSaveProject: (event: FormEvent) => void
  onSaveDraft: () => void
  onEditProject: (project: Project) => void
  onDeleteProject: (id: string) => void
  onCancelEdit: () => void
}

export function Projects({
  projects,
  editingId,
  projectName,
  projectDesc,
  projectPriority = 'Medium',
  projectStatus = 'Planning',
  projectStartDate = '',
  projectDueDate = '',
  projectAssignedUsers = [],
  projectCustomerId = null,
  customers = [],
  canManageProjects,
  onProjectNameChange,
  onProjectDescChange,
  onProjectPriorityChange,
  onProjectStatusChange,
  onProjectStartDateChange,
  onProjectDueDateChange,
  onProjectAssignedUsersChange,
  onProjectCustomerChange,
  onSaveProject,
  onSaveDraft,
  onEditProject,
  onDeleteProject,
  onCancelEdit,
}: ProjectsProps) {
  if (!canManageProjects) return null

  const sortedProjects = sortByPriority(projects)
  const priorityConfig = PRIORITY_CONFIG[projectPriority]

  const handleAssignedUsersChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const list = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
    onProjectAssignedUsersChange?.(list)
  }

  return (
    <section className="section" style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Project management</div>
          <h2 style={{ margin: '10px 0 0', fontSize: '2.1rem', letterSpacing: '-0.06em' }}>Project workspace</h2>
        </div>
        <div style={{ color: '#b8b8b8', fontWeight: 600 }}>{projects.length} project{projects.length === 1 ? '' : 's'}</div>
      </div>

      <div className="panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{editingId ? 'Edit project' : 'Create project'}</h3>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(212,175,55,0.08)', color: '#f3d67a', border: '1px solid rgba(212,175,55,0.22)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <FolderOpen size={14} />
            Workspace
          </div>
        </div>

        <form onSubmit={onSaveProject} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <label style={{ display: 'grid', gap: '8px', gridColumn: '1 / -1' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Project name</span>
            <input type="text" value={projectName} onChange={(event) => onProjectNameChange(event.target.value)} placeholder="Project name" style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '10px' }} />
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Priority</span>
            <select value={projectPriority} onChange={(event) => onProjectPriorityChange?.(event.target.value as Priority)} style={{ background: '#141414', border: `1px solid ${priorityConfig.color}`, color: priorityConfig.color, padding: '10px 12px', borderRadius: '10px', fontWeight: 700 }}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</span>
            <select value={projectStatus} onChange={(event) => onProjectStatusChange?.(event.target.value as ProjectStatus)} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '10px' }}>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Start date</span>
            <input type="date" value={projectStartDate} onChange={(event) => onProjectStartDateChange?.(event.target.value)} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '10px' }} />
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Due date</span>
            <input type="date" value={projectDueDate} onChange={(event) => onProjectDueDateChange?.(event.target.value)} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '10px' }} />
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Assigned team members</span>
            <input type="text" value={projectAssignedUsers.join(', ')} onChange={handleAssignedUsersChange} placeholder="Jane, Ryan, Priya" style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '10px' }} />
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customer</span>
            <select value={projectCustomerId ?? ''} onChange={(event) => onProjectCustomerChange?.(event.target.value)} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '10px' }}>
              <option value="">No customer linked</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name} • {customer.company}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '8px', gridColumn: '1 / -1' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Description</span>
            <textarea value={projectDesc} onChange={(event) => onProjectDescChange(event.target.value)} placeholder="Describe the project outcome, scope, and milestones" style={{ background: '#141414', border: '1px solid #333', color: '#fff', minHeight: '110px', padding: '10px 12px', borderRadius: '10px', resize: 'vertical' }} />
          </label>

          <label style={{ display: 'grid', gap: '8px', gridColumn: '1 / -1' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Project documents</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#141414', border: '1px dashed rgba(212,175,55,0.32)', borderRadius: '10px', padding: '14px 16px', color: '#d9d9d9' }}>
              <UploadCloud size={18} style={{ color: '#f3d67a' }} />
              <span>Upload project documents from the workspace</span>
            </div>
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            {editingId && (
              <button type="button" onClick={onCancelEdit} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#d3d3d3', padding: '11px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
            )}
            <button type="button" onClick={onSaveDraft} style={{ background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#f3d67a', padding: '11px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
              Save Draft
            </button>
            <button type="submit" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.24), rgba(212,175,55,0.1))', border: '1px solid rgba(212,175,55,0.38)', color: '#f5d98d', padding: '11px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Plus size={16} /> {editingId ? 'Update Project' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>

      {projects.length === 0 ? (
        <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '18px', padding: '54px 20px', textAlign: 'center', color: '#b9b9b9' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>No projects yet</div>
          <div>Create your first project to begin managing work.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '18px' }}>
          {sortedProjects.map((project) => (
            <div key={project.id} style={{ display: 'grid', gap: '12px' }}>
              <ProjectCard
                project={project}
                completedTasks={0}
                totalTasks={0}
                documentCount={0}
                assignedUsers={project.assigned_users ?? []}
                onCardClick={onEditProject}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => onEditProject(project)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#d5d5d5', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button type="button" onClick={() => onDeleteProject(project.id)} style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.25)', color: '#f4b0b0', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

