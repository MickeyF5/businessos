import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { ProjectDetail } from './pages/ProjectDetail'
import { Stock } from './pages/Stock'
import { Customers } from './pages/Customers'
import { Network } from './pages/Network'
import { Strategy } from './pages/Strategy'
import { AdminPortal } from './pages/AdminPortal'
import { supabase } from './lib/supabase'
import {
  addProject,
  addTask,
  deleteCustomer,
  deleteInventoryItem,
  deletePartner,
  deleteProjectById,
  deleteStrategy,
  deleteTaskById,
  fetchCustomers,
  fetchInventory,
  fetchPartners,
  fetchProjects,
  fetchStrategies,
  fetchTasks,
  upsertCustomer,
  upsertInventoryItem,
  upsertPartner,
  upsertStrategy,
  updateProject,
  updateTask,
} from './lib/supabaseData'
import { hasPermission } from './lib/permissions'
import type { Customer, Partner, Project, StockItem, StrategyItem, Task, UserProfile, UserRole, View } from './types'
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
  const [authNotice, setAuthNotice] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])

  const [projects, setProjects] = useState<Project[]>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectIcon, setProjectIcon] = useState('📁')
  const [projectDesc, setProjectDesc] = useState('')

  const [tasks, setTasks] = useState<Task[]>([])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | undefined>()

  const [stock, setStock] = useState<StockItem[]>([])

  const [customers, setCustomers] = useState<Customer[]>([])

  const [partners, setPartners] = useState<Partner[]>([])

  const [strategies, setStrategies] = useState<StrategyItem[]>([])

  const refreshBusinessData = async () => {
    if (!session?.user) return

    try {
      const [nextTasks, nextProjects, nextInventory, nextCustomers, nextPartners, nextStrategies] = await Promise.all([
        fetchTasks(),
        fetchProjects(),
        fetchInventory(),
        fetchCustomers(),
        fetchPartners(),
        fetchStrategies(),
      ])

      setTasks(nextTasks)
      setProjects(nextProjects)
      setStock(nextInventory)
      setCustomers(nextCustomers)
      setPartners(nextPartners)
      setStrategies(nextStrategies)
    } catch (error) {
      console.error('Failed to refresh business data:', error)
    }
  }

  const handleAddTask = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const nextTask = await addTask({
        title: newTaskTitle,
        assignee: newTaskAssignee || currentUser?.name || 'Unassigned',
        assigneeId: newTaskAssigneeId,
        done: false,
        overdue: false,
      })

      setTasks((previousTasks) => [nextTask, ...previousTasks])
      setNewTaskTitle('')
      setNewTaskAssignee('')
      setNewTaskAssigneeId(undefined)
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find((entry) => entry.id === id)
    if (!task) return

    try {
      const updatedTask = await updateTask(id, { done: !task.done })
      setTasks((previousTasks) => previousTasks.map((entry) => (entry.id === id ? updatedTask : entry)))
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const deleteTask = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()

    try {
      await deleteTaskById(id)
      setTasks((previousTasks) => previousTasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleAddStockItem = async (payload: Omit<StockItem, 'id'>) => {
    const saved = await upsertInventoryItem(payload)
    setStock((previous) => {
      const existing = previous.find((item) => item.id === saved.id)
      if (existing) {
        return previous.map((item) => (item.id === saved.id ? saved : item))
      }
      return [saved, ...previous]
    })
  }

  const handleUpdateStockItem = async (payload: StockItem) => {
    const saved = await upsertInventoryItem(payload)
    setStock((previous) => previous.map((item) => (item.id === payload.id ? saved : item)))
  }

  const handleDeleteStockItem = async (itemId: string) => {
    await deleteInventoryItem(itemId)
    setStock((previous) => previous.filter((item) => item.id !== itemId))
  }

  const handleAddCustomer = async (payload: Omit<Customer, 'id'>) => {
    const saved = await upsertCustomer(payload)
    setCustomers((previous) => {
      const existing = previous.find((item) => item.id === saved.id)
      if (existing) {
        return previous.map((item) => (item.id === saved.id ? saved : item))
      }
      return [saved, ...previous]
    })
  }

  const handleUpdateCustomer = async (payload: Customer) => {
    const saved = await upsertCustomer(payload)
    setCustomers((previous) => previous.map((item) => (item.id === payload.id ? saved : item)))
  }

  const handleDeleteCustomer = async (customerId: string) => {
    await deleteCustomer(customerId)
    setCustomers((previous) => previous.filter((customer) => customer.id !== customerId))
  }

  const handleAddPartner = async (payload: Omit<Partner, 'id'>) => {
    const saved = await upsertPartner(payload)
    setPartners((previous) => {
      const existing = previous.find((item) => item.id === saved.id)
      if (existing) {
        return previous.map((item) => (item.id === saved.id ? saved : item))
      }
      return [saved, ...previous]
    })
  }

  const handleUpdatePartner = async (payload: Partner) => {
    const saved = await upsertPartner(payload)
    setPartners((previous) => previous.map((item) => (item.id === payload.id ? saved : item)))
  }

  const handleDeletePartner = async (partnerId: string) => {
    await deletePartner(partnerId)
    setPartners((previous) => previous.filter((partner) => partner.id !== partnerId))
  }

  const handleAddStrategy = async (payload: Omit<StrategyItem, 'id'>) => {
    const saved = await upsertStrategy(payload)
    setStrategies((previous) => {
      const existing = previous.find((item) => item.id === saved.id)
      if (existing) {
        return previous.map((item) => (item.id === saved.id ? saved : item))
      }
      return [saved, ...previous]
    })
  }

  const handleUpdateStrategy = async (payload: StrategyItem) => {
    const saved = await upsertStrategy(payload)
    setStrategies((previous) => previous.map((item) => (item.id === payload.id ? saved : item)))
  }

  const handleDeleteStrategy = async (strategyId: string) => {
    await deleteStrategy(strategyId)
    setStrategies((previous) => previous.filter((strategy) => strategy.id !== strategyId))
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setCurrentView('project-detail')
  }

  const handleSaveProject = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return

    try {
      if (editingId) {
        const updatedProject = await updateProject(editingId, {
          icon: projectIcon,
          name: projectName,
          description: projectDesc,
          details: selectedProject?.details ?? ['Newly created project workspace.'],
        })
        setProjects((previousProjects) => previousProjects.map((project) => (project.id === editingId ? updatedProject : project)))
        setEditingId(null)
      } else {
        const createdProject = await addProject({
          icon: projectIcon,
          name: projectName,
          description: projectDesc || 'No description provided.',
          details: ['Newly created project workspace.'],
        })
        setProjects((previousProjects) => [createdProject, ...previousProjects])
      }
    } catch (error) {
      console.error('Failed to save project:', error)
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

  const deleteProject = async (id: string) => {
    if (!currentUser || !hasPermission(currentUser.role, 'deleteProject')) return

    try {
      await deleteProjectById(id)
      setProjects((previousProjects) => previousProjects.filter((project) => project.id !== id))
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
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
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      const profile = {
        id: userId,
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Employee',
        email: user?.email || '',
        role: 'employee' as const,
      }
      const { error: profileError } = await supabase.from('profiles').insert([profile])
      if (profileError) {
        console.error('Profile setup error:', profileError)
      }
      setCurrentUser(profile)
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
    setAuthNotice('')
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    if (error) setAuthError(error.message)
  }

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: { data: { name: userNameInput || 'Employee' } },
    })
    if (error) {
      setAuthError(error.message)
      return
    }

    if (data?.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: data.user.id, name: userNameInput || 'Employee', email: authEmail, role: 'employee' },
      ])
      if (profileError) {
        console.error('Profile error:', profileError)
        setAuthError(`Account created, but profile setup failed: ${profileError.message}`)
      }
    } else if (data?.user) {
      setAuthNotice('Account created. Check your email to confirm your account, then log in.')
      setIsSignUp(false)
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

  useEffect(() => {
    if (!session?.user) return

    void refreshBusinessData()

    const channels = [
      supabase.channel('public:tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:projects').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:inventory_items').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:customers').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:partners').on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:strategies').on('postgres_changes', { event: '*', schema: 'public', table: 'strategies' }, () => {
        void refreshBusinessData()
      }),
    ]

    channels.forEach((channel) => channel.subscribe())

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [session?.user?.id])

  if (!session) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ background: '#141414', padding: '30px', borderRadius: '8px', border: '1px solid #222', width: '350px' }}>
          <h1 style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center', color: '#fff' }}>BUSINESS OS</h1>

          {authError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '15px' }}>{authError}</p>}
          {authNotice && <p style={{ color: '#86efac', fontSize: '0.85rem', marginBottom: '15px' }}>{authNotice}</p>}

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
        return hasPermission(role, 'viewStock') ? <Stock stock={stock} onCreate={handleAddStockItem} onUpdate={handleUpdateStockItem} onDelete={handleDeleteStockItem} /> : null
      case 'customers':
        return hasPermission(role, 'viewCustomers') ? <Customers customers={customers} onCreate={handleAddCustomer} onUpdate={handleUpdateCustomer} onDelete={handleDeleteCustomer} /> : null
      case 'network':
        return hasPermission(role, 'viewNetwork') ? <Network partners={partners} onCreate={handleAddPartner} onUpdate={handleUpdatePartner} onDelete={handleDeletePartner} /> : null
      case 'strategy':
        return <Strategy strategies={strategies} onCreate={handleAddStrategy} onUpdate={handleUpdateStrategy} onDelete={handleDeleteStrategy} />
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
