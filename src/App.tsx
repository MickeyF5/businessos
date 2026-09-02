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
import { ExecutiveControlCenter } from './pages/ExecutiveControlCenter.tsx'
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
  fetchInvoices,
  fetchNotifications,
  fetchPartners,
  fetchProjects,
  fetchQuotes,
  fetchStrategies,
  fetchTasks,
  searchRecords,
  upsertCustomer,
  upsertInventoryItem,
  upsertPartner,
  upsertStrategy,
  updateProject,
  updateTask,
} from './lib/supabaseData'
import { hasPermission } from './lib/permissions'
import type {
  Customer,
  ExpenseRecord,
  FinancialAuditLog,
  FinancialSetting,
  JobCostingRecord,
  OwnerDrawRecord,
  Partner,
  PayrollRecord,
  Project,
  ProjectStatus,
  StockItem,
  StrategyItem,
  Task,
  UserProfile,
  UserRole,
  View,
} from './types'
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
  const [projectDesc, setProjectDesc] = useState('')
  const [projectPriority, setProjectPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('Planning')
  const [projectStartDate, setProjectStartDate] = useState('')
  const [projectDueDate, setProjectDueDate] = useState('')
  const [projectAssignedUsers, setProjectAssignedUsers] = useState<string[]>([])
  const [projectCustomerId, setProjectCustomerId] = useState<string | null>(null)

  const [tasks, setTasks] = useState<Task[]>([])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | undefined>()
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')

  const [stock, setStock] = useState<StockItem[]>([])

  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [partners, setPartners] = useState<Partner[]>([])

  const [strategies, setStrategies] = useState<StrategyItem[]>([])
  const [jobs, setJobs] = useState<JobCostingRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [ownerDraws, setOwnerDraws] = useState<OwnerDrawRecord[]>([])
  const [financialSettings, setFinancialSettings] = useState<FinancialSetting | null>(null)
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([])

  const refreshBusinessData = async () => {
    if (!session?.user) return

    try {
      const [nextTasks, nextProjects, nextInventory, nextCustomers, nextPartners, nextStrategies, nextJobs, nextExpenses, nextPayrollRecords, nextOwnerDraws, nextFinancialSettings, nextAuditLogs, nextQuotes, nextInvoices, nextNotifications] = await Promise.all([
        fetchTasks(),
        fetchProjects(),
        fetchInventory(),
        fetchCustomers(),
        fetchPartners(),
        fetchStrategies(),
        supabase.from('financial_jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('financial_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('financial_payroll').select('*').order('created_at', { ascending: false }),
        supabase.from('owner_draws').select('*').order('created_at', { ascending: false }),
        supabase.from('financial_settings').select('*').maybeSingle(),
        supabase.from('financial_audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
        fetchQuotes(),
        fetchInvoices(),
        fetchNotifications(),
      ])

      setTasks(nextTasks)
      setProjects(nextProjects)
      setStock(nextInventory)
      setCustomers(nextCustomers)
      setPartners(nextPartners)
      setStrategies(nextStrategies)
      setQuotes(nextQuotes)
      setInvoices(nextInvoices)
      setNotifications(nextNotifications)
      setJobs((nextJobs.data ?? []) as JobCostingRecord[])
      setExpenses((nextExpenses.data ?? []) as ExpenseRecord[])
      setPayrollRecords((nextPayrollRecords.data ?? []) as PayrollRecord[])
      setOwnerDraws((nextOwnerDraws.data ?? []) as OwnerDrawRecord[])
      setFinancialSettings((nextFinancialSettings.data ?? null) as FinancialSetting | null)
      setAuditLogs((nextAuditLogs.data ?? []) as FinancialAuditLog[])
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
        priority: newTaskPriority,
      })

      setTasks((previousTasks) => [nextTask, ...previousTasks])
      setNewTaskTitle('')
      setNewTaskAssignee('')
      setNewTaskAssigneeId(undefined)
      setNewTaskPriority('Medium')
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

  const createTaskRecord = async (input: { title: string; assignee: string; priority: 'High' | 'Medium' | 'Low'; due_date?: string | null; project_id?: string | null }) => {
    const saved = await addTask({
      title: input.title,
      assignee: input.assignee || currentUser?.name || 'Unassigned',
      assigneeId: undefined,
      done: false,
      overdue: false,
      priority: input.priority,
      due_date: input.due_date ?? null,
      project_id: input.project_id ?? null,
    })

    setTasks((previousTasks) => [saved, ...previousTasks])
    return saved
  }

  const createQuoteRecord = async (input: { customer_id?: string | null; customer_name?: string | null; project_id?: string | null; project_name?: string | null; total: number; expiry_date?: string | null }) => {
    const number = `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          customer_id: input.customer_id ?? null,
          customer_name: input.customer_name ?? null,
          project_id: input.project_id ?? null,
          project_name: input.project_name ?? null,
          number,
          status: 'Draft',
          total: Number(input.total ?? 0),
          issue_date: new Date().toISOString(),
          expiry_date: input.expiry_date ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    const nextQuote: any = {
      id: data.id,
      customer_id: data.customer_id ?? null,
      customer_name: data.customer_name ?? null,
      project_id: data.project_id ?? null,
      project_name: data.project_name ?? null,
      number: data.number ?? null,
      status: data.status ?? 'Draft',
      total: Number(data.total ?? 0),
      issue_date: data.issue_date ?? null,
      expiry_date: data.expiry_date ?? null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    setQuotes((previous) => [nextQuote, ...previous])
    return nextQuote
  }

  const createInvoiceRecord = async (input: { customer_id?: string | null; customer_name?: string | null; project_id?: string | null; project_name?: string | null; total: number; due_date?: string | null; status?: string }) => {
    const number = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          customer_id: input.customer_id ?? null,
          customer_name: input.customer_name ?? null,
          project_id: input.project_id ?? null,
          project_name: input.project_name ?? null,
          number,
          status: input.status ?? 'Draft',
          total: Number(input.total ?? 0),
          due_date: input.due_date ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          issued_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    const nextInvoice: any = {
      id: data.id,
      customer_id: data.customer_id ?? null,
      customer_name: data.customer_name ?? null,
      project_id: data.project_id ?? null,
      project_name: data.project_name ?? null,
      number: data.number ?? null,
      status: data.status ?? 'Draft',
      total: Number(data.total ?? 0),
      due_date: data.due_date ?? null,
      issued_at: data.issued_at ?? null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    setInvoices((previous) => [nextInvoice, ...previous])
    return nextInvoice
  }

  const createJobRecord = async (input: { title: string; client_name: string; project_id?: string | null; project_name?: string | null; materials_cost: number; labour_cost: number; additional_expenses: number; revenue: number; notes?: string | null }) => {
    const selectedProject = projects.find((project) => project.id === input.project_id)
    const totalCost = Number(input.materials_cost ?? 0) + Number(input.labour_cost ?? 0) + Number(input.additional_expenses ?? 0)
    const profit = Number(input.revenue ?? 0) - totalCost

    const { data, error } = await supabase
      .from('financial_jobs')
      .insert([
        {
          title: input.title,
          client_name: input.client_name,
          project_id: input.project_id ?? null,
          project_name: selectedProject?.name ?? input.project_name ?? null,
          materials_cost: Number(input.materials_cost ?? 0),
          labour_cost: Number(input.labour_cost ?? 0),
          additional_expenses: Number(input.additional_expenses ?? 0),
          revenue: Number(input.revenue ?? 0),
          profit,
          notes: input.notes ?? null,
          created_by: currentUser?.id ?? null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    const nextJob: JobCostingRecord = {
      id: data.id,
      title: data.title,
      client_name: data.client_name,
      project_id: data.project_id ?? null,
      project_name: data.project_name ?? null,
      materials_cost: Number(data.materials_cost ?? 0),
      labour_cost: Number(data.labour_cost ?? 0),
      additional_expenses: Number(data.additional_expenses ?? 0),
      revenue: Number(data.revenue ?? 0),
      profit: Number(data.profit ?? 0),
      notes: data.notes ?? '',
      created_by: data.created_by ?? null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    setJobs((previous) => [nextJob, ...previous])
    return nextJob
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

  const resetProjectForm = () => {
    setProjectName('')
    setProjectDesc('')
    setProjectPriority('Medium')
    setProjectStatus('Planning')
    setProjectStartDate('')
    setProjectDueDate('')
    setProjectAssignedUsers([])
    setProjectCustomerId(null)
  }

  const handleSaveProject = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return

    try {
      if (editingId) {
        const updatedProject = await updateProject(editingId, {
          icon: 'PRJ',
          name: projectName,
          description: projectDesc,
          priority: projectPriority,
          status: projectStatus,
          start_date: projectStartDate || null,
          due_date: projectDueDate || null,
          assigned_users: projectAssignedUsers,
          customer_id: projectCustomerId,
          details: selectedProject?.details ?? ['Newly created project workspace.'],
        })
        setProjects((previousProjects) => previousProjects.map((project) => (project.id === editingId ? updatedProject : project)))
        setEditingId(null)
      } else {
        const createdProject = await addProject({
          icon: 'PRJ',
          name: projectName,
          description: projectDesc || 'No description provided.',
          priority: projectPriority,
          status: projectStatus,
          start_date: projectStartDate || null,
          due_date: projectDueDate || null,
          assigned_users: projectAssignedUsers,
          customer_id: projectCustomerId,
          details: ['Newly created project workspace.'],
        })
        setProjects((previousProjects) => [createdProject, ...previousProjects])
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    }

    resetProjectForm()
  }

  const handleSaveProjectDraft = () => {
    resetProjectForm()
  }

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setProjectName(project.name)
    setProjectDesc(project.description || '')
    setProjectPriority(project.priority || 'Medium')
    setProjectStatus(project.status || 'Planning')
    setProjectStartDate(project.start_date || '')
    setProjectDueDate(project.due_date || '')
    setProjectAssignedUsers(project.assigned_users ?? [])
    setProjectCustomerId(project.customer_id ?? null)
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
      supabase.channel('public:financial_jobs').on('postgres_changes', { event: '*', schema: 'public', table: 'financial_jobs' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:financial_expenses').on('postgres_changes', { event: '*', schema: 'public', table: 'financial_expenses' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:financial_payroll').on('postgres_changes', { event: '*', schema: 'public', table: 'financial_payroll' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:owner_draws').on('postgres_changes', { event: '*', schema: 'public', table: 'owner_draws' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:financial_settings').on('postgres_changes', { event: '*', schema: 'public', table: 'financial_settings' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:financial_audit_logs').on('postgres_changes', { event: '*', schema: 'public', table: 'financial_audit_logs' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:quotes').on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
        void refreshBusinessData()
      }),
      supabase.channel('public:invoices').on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
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
            customers={customers}
            strategies={strategies}
            allUsers={allUsers}
            currentUserName={currentUser?.name}
            newTaskTitle={newTaskTitle}
            newTaskAssignee={newTaskAssignee}
            newTaskPriority={newTaskPriority}
            onTaskAssigneeIdChange={setNewTaskAssigneeId}
            onAddTask={handleAddTask}
            onTaskTitleChange={setNewTaskTitle}
            onTaskAssigneeChange={setNewTaskAssignee}
            onTaskPriorityChange={setNewTaskPriority}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onOpenProjectDetail={openProjectDetail}
            onNavigateProjects={() => navigateTo('projects-manage')}
            onNavigateStock={() => navigateTo('stock')}
            onNavigateCustomers={() => navigateTo('customers')}
            onCreateTask={createTaskRecord}
            onCreateQuote={createQuoteRecord}
            onCreateInvoice={createInvoiceRecord}
            onCreateJob={createJobRecord}
            canManageProjects={hasPermission(role, 'editProject')}
          />
        )
      case 'projects-manage':
        return hasPermission(role, 'viewProjects') ? (
          <Projects
            projects={projects}
            editingId={editingId}
            projectName={projectName}
            projectDesc={projectDesc}
            projectPriority={projectPriority}
            projectStatus={projectStatus}
            projectStartDate={projectStartDate}
            projectDueDate={projectDueDate}
            projectAssignedUsers={projectAssignedUsers}
            projectCustomerId={projectCustomerId}
            customers={customers}
            canManageProjects={hasPermission(role, 'editProject')}
            onProjectNameChange={setProjectName}
            onProjectDescChange={setProjectDesc}
            onProjectPriorityChange={setProjectPriority}
            onProjectStatusChange={setProjectStatus}
            onProjectStartDateChange={setProjectStartDate}
            onProjectDueDateChange={setProjectDueDate}
            onProjectAssignedUsersChange={setProjectAssignedUsers}
            onProjectCustomerChange={(value) => setProjectCustomerId(value || null)}
            onSaveProject={handleSaveProject}
            onSaveDraft={handleSaveProjectDraft}
            onEditProject={startEdit}
            onDeleteProject={deleteProject}
            onCancelEdit={() => {
              setEditingId(null)
              resetProjectForm()
            }}
          />
        ) : null
      case 'project-detail':
        return selectedProject ? <ProjectDetail project={selectedProject} onBack={() => setCurrentView('dashboard')} role={role} tasks={tasks} /> : null
      case 'stock':
        return hasPermission(role, 'viewStock') ? <Stock stock={stock} onCreate={handleAddStockItem} onUpdate={handleUpdateStockItem} onDelete={handleDeleteStockItem} /> : null
      case 'customers':
        return hasPermission(role, 'viewCustomers') ? (
          <Customers
            customers={customers}
            quotes={quotes}
            invoices={invoices}
            onCreate={handleAddCustomer}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
          />
        ) : null
      case 'network':
        return hasPermission(role, 'viewNetwork') ? <Network partners={partners} onCreate={handleAddPartner} onUpdate={handleUpdatePartner} onDelete={handleDeletePartner} /> : null
      case 'strategy':
        return <Strategy strategies={strategies} onCreate={handleAddStrategy} onUpdate={handleUpdateStrategy} onDelete={handleDeleteStrategy} />
      case 'executive-control-center':
        return hasPermission(role, 'accessExecutiveControlCenter') ? (
          <ExecutiveControlCenter
            projects={projects}
            jobs={jobs}
            expenses={expenses}
            payrollRecords={payrollRecords}
            ownerDraws={ownerDraws}
            financialSettings={financialSettings}
            auditLogs={auditLogs}
            allUsers={allUsers}
            currentUser={currentUser}
          />
        ) : null
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
        searchQuery={searchQuery}
        searchResults={searchResults}
        notifications={notifications}
        onSearchQueryChange={async (value: string) => {
          setSearchQuery(value)
          if (!value.trim()) {
            setSearchResults([])
            return
          }
          const result = await searchRecords(value)
          setSearchResults(result)
        }}
        onClearSearch={() => {
          setSearchQuery('')
          setSearchResults([])
        }}
        onToggleMenu={() => setIsMenuOpen((previousValue) => !previousValue)}
        onNavigate={navigateTo}
        onNavigateSearchResult={(result) => {
          setSearchQuery('')
          setSearchResults([])
          if (result.route === 'customers') {
            const customer = customers.find((entry) => entry.id === result.id)
            if (customer) {
              setCurrentView('customers')
              return
            }
          }
          if (result.route === 'projects') {
            const project = projects.find((entry) => entry.id === result.id)
            if (project) {
              setSelectedProject(project)
              setCurrentView('project-detail')
            }
          }
        }}
        onLogout={() => supabase.auth.signOut()}
      />

      <Navigation currentView={currentView} role={role} onNavigate={navigateTo} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {renderPage()}
    </div>
  )
}
