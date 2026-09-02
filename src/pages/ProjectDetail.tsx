import { useEffect, useMemo, useState } from 'react'
import { Activity, BriefcaseBusiness, CheckCircle2, Download, FileText, FolderOpen, Link2, ListTodo, ReceiptText, UploadCloud, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Project, Task, UserRole } from '../types'

interface ProjectDetailProps {
  project: Project | null
  onBack: () => void
  role?: UserRole
  tasks?: Task[]
}

type WorkspaceTab = 'overview' | 'tasks' | 'documents' | 'quotes' | 'invoices' | 'customers' | 'activity'

export function ProjectDetail({ project, onBack, role = 'employee', tasks = [] }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview')
  const [documents, setDocuments] = useState<Array<{ id: string; filename: string; file_path?: string; file_type?: string; uploaded_at?: string }>>([])

  useEffect(() => {
    if (!project) return

    const fetchDocuments = async () => {
      const { data } = await supabase.from('documents').select('*').eq('project_id', project.id).order('uploaded_at', { ascending: false })
      setDocuments((data ?? []) as typeof documents)
    }

    void fetchDocuments()
  }, [project])

  const projectTasks = useMemo(() => tasks.filter((task) => task.project_id === project?.id), [tasks, project])
  const openTasks = projectTasks.filter((task) => !task.done).length
  const completedTasks = projectTasks.filter((task) => task.done).length
  const progress = projectTasks.length === 0 ? 0 : Math.round((completedTasks / projectTasks.length) * 100)
  const dueDateStatus = project?.due_date ? new Date(project.due_date) < new Date() && openTasks > 0 ? 'Overdue' : progress >= 75 ? 'Healthy' : progress >= 40 ? 'At Risk' : 'At Risk' : project?.status === 'Completed' ? 'Healthy' : 'At Risk'
  const canViewFinancialMetrics = role === 'manager' || role === 'admin' || role === 'founder'

  if (!project) return null

  const tabs: Array<{ key: WorkspaceTab; label: string; icon: typeof FolderOpen }> = [
    { key: 'overview', label: 'Overview', icon: FolderOpen },
    { key: 'tasks', label: 'Tasks', icon: ListTodo },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'quotes', label: 'Quotes', icon: ReceiptText },
    { key: 'invoices', label: 'Invoices', icon: ReceiptText },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'activity', label: 'Activity', icon: Activity },
  ]

  return (
    <section className="section" style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 20px' }}>
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '24px 24px 18px', borderBottom: '1px solid rgba(212,175,55,0.18)', flexWrap: 'wrap' }}>
          <div>
            <button type="button" onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#f3d67a', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: 0 }}>
              ← Back to Projects
            </button>
            <h2 style={{ margin: '14px 0 8px', fontSize: '2rem', letterSpacing: '-0.06em' }}>{project.name}</h2>
            <div style={{ color: '#b8b8b8' }}>{project.description || 'No project description provided.'}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)', color: '#f3d67a', padding: '8px 12px', borderRadius: '999px', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{project.priority || 'Medium'}</span>
            <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#d4d4d4', padding: '8px 12px', borderRadius: '999px', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{project.status || 'Planning'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 24px 0', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(212,175,55,0.35)' : 'transparent'}`,
                  borderRadius: '10px 10px 0 0',
                  color: isActive ? '#f3d67a' : '#b8b8b8',
                  padding: '11px 16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="panel" style={{ padding: '18px 20px' }}><div style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Project health</div><div style={{ marginTop: '10px', fontSize: '1.6rem', fontWeight: 800 }}>{dueDateStatus}</div></div>
                <div className="panel" style={{ padding: '18px 20px' }}><div style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Progress</div><div style={{ marginTop: '10px', fontSize: '1.6rem', fontWeight: 800 }}>{progress}%</div></div>
                <div className="panel" style={{ padding: '18px 20px' }}><div style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open tasks</div><div style={{ marginTop: '10px', fontSize: '1.6rem', fontWeight: 800 }}>{openTasks}</div></div>
                <div className="panel" style={{ padding: '18px 20px' }}><div style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Completed tasks</div><div style={{ marginTop: '10px', fontSize: '1.6rem', fontWeight: 800 }}>{completedTasks}</div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: '18px' }}>
                <div className="panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0 }}>Project summary</h3>
                    <span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{project.priority || 'Medium'}</span>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}><span style={{ color: '#9ca3af' }}>Priority</span><strong>{project.priority || 'Medium'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}><span style={{ color: '#9ca3af' }}>Status</span><strong>{project.status || 'Planning'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}><span style={{ color: '#9ca3af' }}>Assigned team</span><strong>{project.assigned_users?.length ? project.assigned_users.join(', ') : 'Not assigned'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}><span style={{ color: '#9ca3af' }}>Customer relationship</span><strong>{project.customer_name || 'Not linked'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}><span style={{ color: '#9ca3af' }}>Revenue generated</span><strong>{canViewFinancialMetrics ? '$0.00' : 'Restricted'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#9ca3af' }}>Last activity</span><strong>{project.last_activity_at || 'No recent activity'}</strong></div>
                  </div>
                </div>

                <div className="panel" style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px' }}>Project details</h3>
                  <div style={{ display: 'grid', gap: '10px', color: '#d4d4d4' }}>
                    <div><span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Start date</span><strong>{project.start_date || 'Not set'}</strong></div>
                    <div><span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Due date</span><strong>{project.due_date || 'Not set'}</strong></div>
                    <div><span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Customer</span><strong>{project.customer_name || 'No customer linked'}</strong></div>
                    <div><span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Team</span><strong>{project.assigned_users?.length ? project.assigned_users.length : 0} assigned</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {projectTasks.length === 0 ? (
                <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', color: '#b9b9b9' }}>
                  <div style={{ marginBottom: '8px', fontSize: '1.2rem', fontWeight: 700 }}>No tasks in this project</div>
                  <div>Tasks linked to this project will appear here.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {projectTasks.map((task) => (
                    <div key={task.id} className="panel" style={{ padding: '18px 20px', display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{task.title}</div>
                        <span style={{ background: task.done ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: task.done ? '#86efac' : '#f9d182', borderRadius: '999px', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700 }}>{task.done ? 'Completed' : 'Open'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                        <div><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Priority</div><div style={{ marginTop: '6px', fontWeight: 700 }}>{task.priority || 'Medium'}</div></div>
                        <div><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Assigned user</div><div style={{ marginTop: '6px', fontWeight: 700 }}>{task.assignee || 'Unassigned'}</div></div>
                        <div><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Due date</div><div style={{ marginTop: '6px', fontWeight: 700 }}>{task.due_date || 'Not set'}</div></div>
                        <div><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Completion</div><div style={{ marginTop: '6px', fontWeight: 700 }}>{task.done ? 'Complete' : 'In progress'}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              {documents.length === 0 ? (
                <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', color: '#b9b9b9' }}>
                  <div style={{ marginBottom: '8px', fontSize: '1.2rem', fontWeight: 700 }}>No project documents yet</div>
                  <div>Upload files to organize contracts, quotes, invoices, and technical documents.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {documents.map((document) => (
                    <div key={document.id} className="panel" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3d67a' }}><FileText size={18} /></div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{document.filename}</div>
                          <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{document.file_type || 'Document'} • {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString('en-ZA') : 'Unknown date'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e6e6e6', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}><UploadCloud size={14} /> Upload</button>
                        <button type="button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e6e6e6', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}><Download size={14} /> Download</button>
                        <button type="button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e6e6e6', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}><FileText size={14} /> Preview</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotes' && (
            <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b9b9b9' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No quotes yet</div>
              <div>Quote records linked to this project will appear here.</div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b9b9b9' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No invoices yet</div>
              <div>Invoice records for this project will appear here.</div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}><Link2 size={18} style={{ color: '#f3d67a' }} /><h3 style={{ margin: 0 }}>Customer link</h3></div>
              {project.customer_name ? (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div><span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Customer</span><strong>{project.customer_name}</strong></div>
                  <div><span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Relationship</span><strong>Project linked to customer workspace</strong></div>
                </div>
              ) : (
                <div style={{ color: '#b9b9b9' }}>This project is not linked to a customer yet.</div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                <CheckCircle2 size={18} style={{ color: '#86efac' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Project created</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{project.created_at ? new Date(project.created_at).toLocaleDateString('en-ZA') : 'No date available'}</div>
                </div>
              </div>
              {projectTasks.length === 0 ? (
                <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', color: '#b9b9b9' }}>No activity to show yet.</div>
              ) : (
                projectTasks.slice(0, 5).map((task) => (
                  <div key={task.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                    <BriefcaseBusiness size={18} style={{ color: '#f3d67a' }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{task.title}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{task.done ? 'Completed' : 'Updated'} • {task.assignee || 'Unassigned'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
