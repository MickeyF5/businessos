import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { ProjectDetail } from './pages/ProjectDetail'
import { Stock } from './pages/Stock'
import { Customers } from './pages/Customers'
import { Accounts } from './pages/Accounts'
import { Network } from './pages/Network'
import { Strategy } from './pages/Strategy'
import { AdminPortal } from './pages/AdminPortal'
import { supabase } from './lib/supabase'
import { hasPermission } from './lib/permissions'
import type { Customer, Partner, Project, StockItem, StrategyItem, Task, Transaction, UserProfile, UserRole, View } from './types'
import './App.css'

const inputStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #333',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: '4px',
  outline: 'none',
}

const btnPrimaryStyle: React.CSSProperties = {
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
}

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [userNameInput, setUserNameInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      icon: '🚗',
      name: 'Vehicle Business',
      description: 'Managing automotive imports, tuning parts, and customer builds.',
      details: [
        'Current focus: BMW E92 325i media coverage',
        'Inventory check due Friday',
        'Client consultation scheduled',
      ],
    },
    {
      id: '2',
      icon: '📱',
      name: 'Marketing Agency',
      description: 'Social media branding, TikTok content generation, and client outreach.',
      details: [
        'Active campaign: TorqueUniverse growth',
        'Pending deliverables: 3 video edits',
        'Ad budget review',
      ],
    },
    {
      id: '3',
      icon: '💻',
      name: 'Internal Software',
      description: 'Building custom automation scripts, Discord bots, and tools.',
      details: [
        'Active stack: React, TypeScript, Node',
        'Bot monitoring setup',
        'Portfolio deployment prep',
      ],
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectIcon, setProjectIcon] = useState('📁')
  const [projectDesc, setProjectDesc] = useState('')

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Contact 3 potential customers', assignee: 'Makailen', done: false },
    { id: 2, title: 'Finish website', assignee: 'Viresh', done: false },
    { id: 3, title: 'Create TikTok content', assignee: 'Zenden', done: false },
    { id: 4, title: 'Register business', assignee: 'Makailen', done: true, overdue: true },
  ])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | undefined>()

  const [stock, setStock] = useState<StockItem[]>([
    { id: '1', name: 'E92 Custom Tuning Chip', sku: 'TUN-E92-01', quantity: 12, price: 4500 },
    { id: '2', name: 'Branding Watermark Asset Kit', sku: 'DIG-BM-04', quantity: 50, price: 850 },
  ])

  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'Alex Rivera', company: 'Apex Performance', email: 'alex@apex.com', phone: '+1 (415) 555-0137', status: 'VIP', totalSpent: 18500 },
    { id: '2', name: 'Jordan Vance', company: 'Vance Logistics', email: 'jordan@vance.io', phone: '+1 (310) 555-0112', status: 'Active', totalSpent: 9200 },
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Client Consulting Retainer', type: 'income', amount: 12000, date: '2026-08-20' },
    { id: '2', description: 'Cloud Infrastructure & API Costs', type: 'expense', amount: 1450, date: '2026-08-22' },
  ])

  const [partners, setPartners] = useState<Partner[]>([
    { id: '1', name: 'Liam Ross', business: 'Ross Audio Labs', role: 'Hardware Collab', contact: 'liam@rosslabs.com' },
    { id: '2', name: 'Sarah Chen', business: 'Chen Media', role: 'Influencer Growth Partner', contact: 'sarah@chenmedia.com' },
  ])

  const [strategies, setStrategies] = useState<StrategyItem[]>([
    { id: '1', title: 'Customer acquisition', description: 'Accelerate acquisition through premium service bundles.', priority: 'High', status: 'In progress' },
    { id: '2', title: 'Operational efficiency', description: 'Streamline project delivery and internal automation.', priority: 'Medium', status: 'Planned' },
    { id: '3', title: 'Partner-led growth', description: 'Expand productized offers and partner-led lead generation.', priority: 'Medium', status: 'Planned' },
  ])

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return

    const nextTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      assignee: newTaskAssignee || currentUser?.name || 'Unassigned',
      assigneeId: newTaskAssigneeId,
      done: false,
    }

    setTasks((previousTasks) => [nextTask, ...previousTasks])
    setNewTaskTitle('')
    setNewTaskAssignee('')
    setNewTaskAssigneeId(undefined)
  }

  const toggleTask = (id: number) => {
    setTasks((previousTasks) => previousTasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  const deleteTask = (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setTasks((previousTasks) => previousTasks.filter((task) => task.id !== id))
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setCurrentView('project-detail')
  }

  const handleSaveProject = (event: React.FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return

    if (editingId) {
      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project.id === editingId ? { ...project, name: projectName, icon: projectIcon, description: projectDesc } : project,
        ),
      )
      setEditingId(null)
    } else {
      setProjects((previousProjects) => [
        ...previousProjects,
        {
          id: Date.now().toString(),
          icon: projectIcon,
          name: projectName,
          description: projectDesc || 'No description provided.',
          details: ['Newly created project workspace.'],
        },
      ])
    }

    setProjectName('')
    setProjectIcon('📁')
    setProjectDesc('')
  }

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setProjectName(project.name)
    setProjectIcon(project.icon)
    setProjectDesc(project.description || '')
    setCurrentView('projects-manage')
  }

  const deleteProject = (id: string) => {
    if (!currentUser || !hasPermission(currentUser.role, 'deleteProject')) return
    setProjects((previousProjects) => previousProjects.filter((project) => project.id !== id))
  }

  const navigateTo = (view: View) => {
    setCurrentView(view)
    setIsMenuOpen(false)
  }

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error)
      return
    }

    if (data) {
      const profile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
      }
      setCurrentUser(profile)
      if (profile.role === 'admin') {
        fetchAllUsers()
      }
    } else {
      setCurrentUser({
        id: userId,
        name: session?.user?.email?.split('@')[0] || 'Employee',
        email: session?.user?.email || '',
        role: 'employee',
      })
    }
  }

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('name')
    if (error) {
      console.error('Failed to fetch users:', error)
      return
    }
    if (data) setAllUsers(data as UserProfile[])
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== 'admin') return

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      console.error('Failed to update role:', error)
      return
    }

    setAllUsers((previousUsers) => previousUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    if (userId === currentUser.id) {
      setCurrentUser({ ...currentUser, role: newRole })
    }
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    if (error) setAuthError(error.message)
  }

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthError('')
    const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword })
    if (error) {
      setAuthError(error.message)
      return
    }

    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: data.user.id, name: userNameInput || 'Employee', email: authEmail, role: 'employee' },
      ])
      if (profileError) {
        setAuthError('Account created, but profile setup failed. Please contact the administrator.')
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession)
      if (activeSession?.user) fetchProfile(activeSession.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession)
      if (activeSession?.user) fetchProfile(activeSession.user.id)
      else setCurrentUser(null)
    })

    const profileSubscription = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (session?.user && payload.new.id === session.user.id) {
            setCurrentUser(payload.new as UserProfile)
          }
          setAllUsers((previousUsers) =>
            previousUsers.map((user) => (user.id === payload.new.id ? (payload.new as UserProfile) : user)),
          )
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(profileSubscription)
    }
  }, [session?.user?.id])

  if (!session) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ background: '#141414', padding: '30px', borderRadius: '8px', border: '1px solid #222', width: '350px' }}>
          <h1 style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center', color: '#fff' }}>BUSINESS OS</h1>

          {authError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '15px' }}>{authError}</p>}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isSignUp && (
              <input
                type="text"
                placeholder="Your Name"
                value={userNameInput}
                onChange={(event) => setUserNameInput(event.target.value)}
                required
                style={inputStyle}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" style={btnPrimaryStyle}>
              {isSignUp ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp((previousValue) => !previousValue)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginTop: '15px', width: '100%', fontSize: '0.85rem' }}
          >
            {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    )
  }

  const role = currentUser?.role || 'employee'

  const renderPage = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            projects={projects}
            tasks={tasks}
            stock={stock}
            transactions={transactions}
            allUsers={allUsers}
            currentUserName={currentUser?.name}
            newTaskTitle={newTaskTitle}
            newTaskAssignee={newTaskAssignee}
            onTaskAssigneeIdChange={setNewTaskAssigneeId}
            onAddTask={handleAddTask}
            onTaskTitleChange={setNewTaskTitle}
            onTaskAssigneeChange={setNewTaskAssignee}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onOpenProjectDetail={openProjectDetail}
            onNavigateProjects={() => navigateTo('projects-manage')}
            canManageProjects={hasPermission(role, 'editProject')}
          />
        )
      case 'projects-manage':
        return hasPermission(role, 'viewProjects') ? (
          <Projects
            projects={projects}
            editingId={editingId}
            projectName={projectName}
            projectIcon={projectIcon}
            projectDesc={projectDesc}
            canManageProjects={hasPermission(role, 'editProject')}
            onProjectNameChange={setProjectName}
            onProjectIconChange={setProjectIcon}
            onProjectDescChange={setProjectDesc}
            onSaveProject={handleSaveProject}
            onEditProject={startEdit}
            onDeleteProject={deleteProject}
            onCancelEdit={() => {
              setEditingId(null)
              setProjectName('')
              setProjectIcon('📁')
              setProjectDesc('')
            }}
          />
        ) : null
      case 'project-detail':
        return selectedProject ? <ProjectDetail project={selectedProject} onBack={() => setCurrentView('dashboard')} /> : null
      case 'stock':
        return hasPermission(role, 'viewStock') ? <Stock stock={stock} setStock={setStock} /> : null
      case 'customers':
        return hasPermission(role, 'viewCustomers') ? <Customers customers={customers} setCustomers={setCustomers} /> : null
      case 'accounts':
        return hasPermission(role, 'viewAccounts') ? <Accounts transactions={transactions} setTransactions={setTransactions} /> : null
      case 'network':
        return hasPermission(role, 'viewNetwork') ? <Network partners={partners} setPartners={setPartners} /> : null
      case 'strategy':
        return <Strategy strategies={strategies} setStrategies={setStrategies} />
      case 'admin':
        return hasPermission(role, 'accessAdminPortal') ? <AdminPortal allUsers={allUsers} currentUser={currentUser} onUpdateUserRole={updateUserRole} /> : null
      default:
        return null
    }
  }

  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((previousValue) => !previousValue)}
        onNavigate={navigateTo}
        onLogout={() => supabase.auth.signOut()}
      />

      <Navigation currentView={currentView} role={role} onNavigate={navigateTo} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {renderPage()}
    </div>
  )
}
