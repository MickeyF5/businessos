import { supabase } from './supabase'
import type { Customer, Partner, Project, StockItem, StrategyItem, Task } from '../types'

const mapTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  assignee: row.assignee ?? 'Unassigned',
  assigneeId: row.assignee_id ?? undefined,
  done: Boolean(row.done),
  overdue: Boolean(row.overdue),
})

const mapProject = (row: any): Project => ({
  id: row.id,
  icon: row.icon ?? 'PRJ',
  name: row.name,
  description: row.description ?? '',
  details: Array.isArray(row.details) ? row.details : [],
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

export async function addTask(input: { title: string; assignee: string; assigneeId?: string | null; done?: boolean; overdue?: boolean }): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        title: input.title,
        assignee: input.assignee,
        assignee_id: input.assigneeId ?? null,
        done: Boolean(input.done),
        overdue: Boolean(input.overdue),
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

export async function addProject(input: { icon: string; name: string; description?: string; details?: string[] }): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        icon: input.icon,
        name: input.name,
        description: input.description ?? '',
        details: input.details ?? [],
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
