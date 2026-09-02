import { supabase } from './supabase'
import type { BusinessNotification, Customer, Invoice, Partner, Project, Quote, SearchResult, StockItem, StrategyItem, Task } from '../types'

const mapTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  assignee: row.assignee ?? 'Unassigned',
  assigneeId: row.assignee_id ?? undefined,
  done: Boolean(row.done),
  overdue: Boolean(row.overdue),
  priority: row.priority ?? 'Medium',
  due_date: row.due_date ?? null,
  project_id: row.project_id ?? null,
  project_name: row.project_name ?? null,
  created_at: row.created_at,
  updated_at: row.updated_at,
})

const mapProject = (row: any): Project => ({
  id: row.id,
  icon: row.icon ?? 'PRJ',
  name: row.name,
  description: row.description ?? '',
  details: Array.isArray(row.details) ? row.details : [],
  priority: row.priority ?? 'Medium',
  status: row.status ?? 'Planning',
  start_date: row.start_date ?? null,
  due_date: row.due_date ?? null,
  assigned_users: Array.isArray(row.assigned_users) ? row.assigned_users : [],
  customer_id: row.customer_id ?? null,
  customer_name: row.customer_name ?? null,
  last_activity_at: row.last_activity_at ?? null,
  created_at: row.created_at,
  updated_at: row.updated_at,
})

const mapInventory = (row: any): StockItem => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  quantity: Number(row.quantity ?? 0),
  price: Number(row.price ?? 0),
})

const mapCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  company: row.company,
  email: row.email,
  phone: row.phone ?? 'Not provided',
  status: row.status ?? 'Active',
  total_spent: Number(row.total_spent ?? 0),
  created_at: row.created_at ?? undefined,
  updated_at: row.updated_at ?? undefined,
})

const mapPartner = (row: any): Partner => ({
  id: row.id,
  name: row.name,
  business: row.business,
  role: row.role,
  contact: row.contact,
})

const mapStrategy = (row: any): StrategyItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  priority: row.priority ?? 'Medium',
  status: row.status ?? 'Planned',
})

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapTask)
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapProject)
}

export async function fetchInventory(): Promise<StockItem[]> {
  const { data, error } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Inventory Error:', error)
    console.error('Inventory Message:', error?.message)
    console.error('Inventory Details:', error?.details)
    console.error('Inventory Hint:', error?.hint)
    console.error('Inventory Code:', error?.code)
    throw error
  }
  return (data ?? []).map(mapInventory)
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Customer fetch error:', {
      table: 'customers',
      action: 'fetch',
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
  return (data ?? []).map(mapCustomer)
}

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapPartner)
}

export async function fetchStrategies(): Promise<StrategyItem[]> {
  const { data, error } = await supabase.from('strategies').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapStrategy)
}

export async function addTask(input: { title: string; assignee: string; assigneeId?: string | null; done?: boolean; overdue?: boolean; priority?: string; due_date?: string | null; project_id?: string | null }): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        title: input.title,
        assignee: input.assignee,
        assignee_id: input.assigneeId ?? null,
        done: Boolean(input.done),
        overdue: Boolean(input.overdue),
        priority: input.priority ?? 'Medium',
        due_date: input.due_date ?? null,
        project_id: input.project_id ?? null,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return mapTask(data)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      assignee: updates.assignee,
      assignee_id: updates.assigneeId ?? null,
      done: updates.done,
      overdue: updates.overdue,
      priority: updates.priority,
      due_date: updates.due_date,
      project_id: updates.project_id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapTask(data)
}

export async function deleteTaskById(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function addProject(input: { icon: string; name: string; description?: string; details?: string[]; priority?: string; status?: string; start_date?: string | null; due_date?: string | null; assigned_users?: string[]; customer_id?: string | null; customer_name?: string | null }): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        icon: input.icon,
        name: input.name,
        description: input.description ?? '',
        details: input.details ?? [],
        priority: input.priority ?? 'Medium',
        status: input.status ?? 'Planning',
        start_date: input.start_date ?? null,
        due_date: input.due_date ?? null,
        assigned_users: input.assigned_users ?? [],
        customer_id: input.customer_id ?? null,
        customer_name: input.customer_name ?? null,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return mapProject(data)
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      icon: updates.icon,
      name: updates.name,
      description: updates.description,
      details: updates.details,
      priority: updates.priority,
      status: updates.status,
      start_date: updates.start_date,
      due_date: updates.due_date,
      assigned_users: updates.assigned_users,
      customer_id: updates.customer_id,
      customer_name: updates.customer_name,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapProject(data)
}

export async function deleteProjectById(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function upsertInventoryItem(input: Partial<StockItem> & { id?: string }): Promise<StockItem> {
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name,
    sku: input.sku,
    quantity: Number(input.quantity ?? 0),
    price: Number(input.price ?? 0),
  }

  try {
    const { data, error } = await supabase.from('inventory_items').upsert(payload).select().single()
    if (error) {
      console.error('Inventory upsert error:', {
        table: 'inventory_items',
        action: 'upsert',
        payload,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }
    return mapInventory(data)
  } catch (error) {
    console.error('Inventory upsert failed:', {
      table: 'inventory_items',
      action: 'upsert',
      payload,
      error,
    })
    throw error
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id)
    if (error) {
      console.error('Inventory delete error:', {
        table: 'inventory_items',
        action: 'delete',
        id,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }
  } catch (error) {
    console.error('Inventory delete failed:', {
      table: 'inventory_items',
      action: 'delete',
      id,
      error,
    })
    throw error
  }
}

export async function upsertCustomer(input: Partial<Customer> & { id?: string }): Promise<Customer> {
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name,
    company: input.company,
    email: input.email,
    phone: input.phone,
    status: input.status ?? 'Active',
    total_spent: Number(input.total_spent ?? 0),
  }

  try {
    const { data, error } = await supabase.from('customers').upsert(payload).select().single()
    if (error) {
      console.error('Customer upsert error:', {
        table: 'customers',
        action: 'upsert',
        payload,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }
    return mapCustomer(data)
  } catch (error) {
    console.error('Customer upsert failed:', {
      table: 'customers',
      action: 'upsert',
      payload,
      error,
    })
    throw error
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) {
      console.error('Customer delete error:', {
        table: 'customers',
        action: 'delete',
        id,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }
  } catch (error) {
    console.error('Customer delete failed:', {
      table: 'customers',
      action: 'delete',
      id,
      error,
    })
    throw error
  }
}

export async function upsertPartner(input: Partial<Partner> & { id?: string }): Promise<Partner> {
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name,
    business: input.business,
    role: input.role,
    contact: input.contact,
  }

  const { data, error } = await supabase.from('partners').upsert(payload).select().single()
  if (error) throw error
  return mapPartner(data)
}

export async function deletePartner(id: string): Promise<void> {
  const { error } = await supabase.from('partners').delete().eq('id', id)
  if (error) throw error
}

export async function upsertStrategy(input: Partial<StrategyItem> & { id?: string }): Promise<StrategyItem> {
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    title: input.title,
    description: input.description,
    priority: input.priority ?? 'Medium',
    status: input.status ?? 'Planned',
  }

  const { data, error } = await supabase.from('strategies').upsert(payload).select().single()
  if (error) throw error
  return mapStrategy(data)
}

export async function deleteStrategy(id: string): Promise<void> {
  const { error } = await supabase.from('strategies').delete().eq('id', id)
  if (error) throw error
}

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({
      id: row.id,
      customer_id: row.customer_id ?? null,
      customer_name: row.customer_name ?? null,
      project_id: row.project_id ?? null,
      project_name: row.project_name ?? null,
      number: row.number ?? null,
      status: (row.status ?? 'Draft') as Quote['status'],
      total: Number(row.total ?? 0),
      issue_date: row.issue_date ?? null,
      expiry_date: row.expiry_date ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  } catch (error) {
    console.warn('Quotes table unavailable or empty:', error)
    return []
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({
      id: row.id,
      customer_id: row.customer_id ?? null,
      customer_name: row.customer_name ?? null,
      project_id: row.project_id ?? null,
      project_name: row.project_name ?? null,
      number: row.number ?? null,
      status: (row.status ?? 'Draft') as Invoice['status'],
      total: Number(row.total ?? 0),
      due_date: row.due_date ?? null,
      issued_at: row.issued_at ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  } catch (error) {
    console.warn('Invoices table unavailable or empty:', error)
    return []
  }
}

export async function fetchNotifications(): Promise<BusinessNotification[]> {
  const notifications: BusinessNotification[] = []

  try {
    const [tasksResult, projectsResult, payrollResult, expensesResult, quotesResult, invoicesResult] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('due_date', { ascending: true }),
      supabase.from('financial_payroll').select('*').order('created_at', { ascending: false }),
      supabase.from('financial_expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('quotes').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    ])

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    for (const task of tasksResult.data ?? []) {
      if (task.done || !task.due_date) continue
      const due = new Date(task.due_date)
      if (due.getTime() === tomorrow.setHours(0, 0, 0, 0)) {
        notifications.push({
          id: `task-${task.id}`,
          type: 'task',
          title: 'Task due tomorrow',
          detail: task.title,
          created_at: task.updated_at ?? task.created_at ?? new Date().toISOString(),
          priority: 'medium',
          action: '/tasks',
        })
      }
    }

    for (const project of projectsResult.data ?? []) {
      if (!project.due_date) continue
      const due = new Date(project.due_date)
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
      if (diffDays >= 0 && diffDays <= 7) {
        notifications.push({
          id: `project-${project.id}`,
          type: 'project',
          title: 'Project deadline approaching',
          detail: `${project.name} due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
          created_at: project.updated_at ?? project.created_at ?? new Date().toISOString(),
          priority: diffDays <= 2 ? 'high' : 'medium',
          action: '/projects',
        })
      }
    }

    for (const payroll of payrollResult.data ?? []) {
      if (payroll.status === 'pending') {
        notifications.push({
          id: `payroll-${payroll.id}`,
          type: 'payroll',
          title: 'Payroll approval required',
          detail: `${payroll.user_name} has a pending payroll review`,
          created_at: payroll.updated_at ?? payroll.created_at ?? new Date().toISOString(),
          priority: 'high',
          action: '/payroll',
        })
      }
    }

    for (const expense of expensesResult.data ?? []) {
      if (expense.status === 'pending') {
        notifications.push({
          id: `expense-${expense.id}`,
          type: 'expense',
          title: 'Expense awaiting approval',
          detail: `${expense.description} • ${Number(expense.amount ?? 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}`,
          created_at: expense.updated_at ?? expense.created_at ?? new Date().toISOString(),
          priority: 'medium',
          action: '/expenses',
        })
      }
    }

    for (const quote of quotesResult.data ?? []) {
      if (quote.status === 'Accepted') {
        notifications.push({
          id: `quote-${quote.id}`,
          type: 'quote',
          title: 'Quote accepted',
          detail: `${quote.number ?? 'Quote'} was accepted for ${quote.customer_name ?? 'customer'}`,
          created_at: quote.updated_at ?? quote.created_at ?? new Date().toISOString(),
          priority: 'low',
          action: '/quotes',
        })
      }
    }

    for (const invoice of invoicesResult.data ?? []) {
      const status = String(invoice.status ?? 'Draft').toLowerCase()
      if (status === 'overdue' || (invoice.due_date && new Date(invoice.due_date) < today && status !== 'paid')) {
        notifications.push({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: 'Invoice overdue',
          detail: `${invoice.number ?? 'Invoice'} for ${invoice.customer_name ?? 'customer'} is overdue`,
          created_at: invoice.updated_at ?? invoice.issued_at ?? invoice.created_at ?? new Date().toISOString(),
          priority: 'high',
          action: '/invoices',
        })
      }
    }
  } catch (error) {
    console.warn('Notification generation failed from live Supabase data:', error)
  }

  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function searchRecords(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const searchTerm = trimmed.toLowerCase()

  const results: SearchResult[] = []

  try {
    const [customers, projects, tasks, quotes, invoices, documents] = await Promise.all([
      supabase.from('customers').select('*').or(`name.ilike.%${trimmed}%,company.ilike.%${trimmed}%,email.ilike.%${trimmed}%`),
      supabase.from('projects').select('*').or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`),
      supabase.from('tasks').select('*').or(`title.ilike.%${trimmed}%,assignee.ilike.%${trimmed}%`),
      supabase.from('quotes').select('*').or(`number.ilike.%${trimmed}%,customer_name.ilike.%${trimmed}%`),
      supabase.from('invoices').select('*').or(`number.ilike.%${trimmed}%,customer_name.ilike.%${trimmed}%`),
      supabase.from('documents').select('*').or(`filename.ilike.%${trimmed}%`),
    ])

    ;(customers.data ?? []).forEach((row) => {
      if (String(row.name ?? '').toLowerCase().includes(searchTerm) || String(row.company ?? '').toLowerCase().includes(searchTerm)) {
        results.push({ id: row.id, type: 'customer', title: row.name, subtitle: row.company, value: row.email, route: 'customers' })
      }
    })

    ;(projects.data ?? []).forEach((row) => {
      if (String(row.name ?? '').toLowerCase().includes(searchTerm) || String(row.description ?? '').toLowerCase().includes(searchTerm)) {
        results.push({ id: row.id, type: 'project', title: row.name, subtitle: row.customer_name ?? 'Project workspace', value: row.status, route: 'projects' })
      }
    })

    ;(tasks.data ?? []).forEach((row) => {
      if (String(row.title ?? '').toLowerCase().includes(searchTerm) || String(row.assignee ?? '').toLowerCase().includes(searchTerm)) {
        results.push({ id: row.id, type: 'task', title: row.title, subtitle: row.assignee ?? 'Unassigned', value: row.done ? 'Complete' : 'Open', route: 'tasks' })
      }
    })

    ;(quotes.data ?? []).forEach((row) => {
      if (String(row.number ?? '').toLowerCase().includes(searchTerm) || String(row.customer_name ?? '').toLowerCase().includes(searchTerm)) {
        results.push({ id: row.id, type: 'quote', title: row.number ?? 'Quote', subtitle: row.customer_name ?? 'Customer', value: row.status, route: 'quotes' })
      }
    })

    ;(invoices.data ?? []).forEach((row) => {
      if (String(row.number ?? '').toLowerCase().includes(searchTerm) || String(row.customer_name ?? '').toLowerCase().includes(searchTerm)) {
        results.push({ id: row.id, type: 'invoice', title: row.number ?? 'Invoice', subtitle: row.customer_name ?? 'Customer', value: row.status, route: 'invoices' })
      }
    })

    ;(documents.data ?? []).forEach((row) => {
      if (String(row.filename ?? '').toLowerCase().includes(searchTerm)) {
        results.push({ id: row.id, type: 'document', title: row.filename, subtitle: row.file_type ?? 'Document', value: row.uploaded_at, route: 'documents' })
      }
    })
  } catch (error) {
    console.warn('Global search unavailable from live Supabase data:', error)
  }

  return results.slice(0, 12)
}
