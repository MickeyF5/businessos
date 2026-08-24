import type { FormEvent } from 'react'
import type { Project } from '../types'

interface ProjectsProps {
  projects: Project[]
  editingId: string | null
  projectName: string
  projectIcon: string
  projectDesc: string
  canManageProjects: boolean
  onProjectNameChange: (value: string) => void
  onProjectIconChange: (value: string) => void
  onProjectDescChange: (value: string) => void
  onSaveProject: (event: FormEvent) => void
  onEditProject: (project: Project) => void
  onDeleteProject: (id: string) => void
  onCancelEdit: () => void
}

export function Projects({
  projects,
  editingId,
  projectName,
  projectIcon,
  projectDesc,
  canManageProjects,
  onProjectNameChange,
  onProjectIconChange,
  onProjectDescChange,
  onSaveProject,
  onEditProject,
  onDeleteProject,
  onCancelEdit,
}: ProjectsProps) {
  if (!canManageProjects) return null

  return (
    <section className="section" style={{ maxWidth: '600px', margin: '30px auto', background: '#141414', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
      <h2>MANAGE PROJECTS</h2>
      <form onSubmit={onSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={projectIcon}
            onChange={(event) => onProjectIconChange(event.target.value)}
            style={{ width: '50px', textAlign: 'center', background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '4px', outline: 'none' }}
          />
          <input
            type="text"
            placeholder="Project name..."
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '4px', outline: 'none' }}
          />
        </div>
        <input
          type="text"
          placeholder="Short description..."
          value={projectDesc}
          onChange={(event) => onProjectDescChange(event.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '4px', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? 'Update Project' : 'Add Project'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit} style={{ background: '#262626', color: '#ccc', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projects.map((project) => (
          <li key={project.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '10px', borderRadius: '4px' }}>
            <span>
              {project.icon} {project.name}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onEditProject(project)} style={{ background: '#262626', color: '#ccc', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                Edit
              </button>
              <button onClick={() => onDeleteProject(project.id)} style={{ background: '#262626', color: '#ef4444', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
