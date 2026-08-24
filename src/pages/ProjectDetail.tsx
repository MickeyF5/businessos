import type { Project } from '../types'

interface ProjectDetailProps {
  project: Project | null
  onBack: () => void
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  if (!project) {
    return null
  }

  return (
    <section className="section" style={{ maxWidth: '700px', margin: '30px auto', background: '#141414', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
        ← Back to Projects
      </button>
      <h2 style={{ marginTop: '0' }}>
        {project.icon} {project.name}
      </h2>
      <p style={{ color: '#ccc', marginBottom: '20px' }}>{project.description || 'No description provided.'}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(project.details || []).map((detail, index) => (
          <li key={`${project.id}-${index}`} style={{ background: '#1a1a1a', padding: '10px 12px', borderRadius: '4px' }}>
            {detail}
          </li>
        ))}
      </ul>
    </section>
  )
}
