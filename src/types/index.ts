export type UserRole = 'admin' | 'founder' | 'manager' | 'employee'

export type View =
  | 'dashboard'
  | 'projects-manage'
  | 'project-detail'
  | 'stock'
  | 'customers'
  | 'accounts'
  | 'network'
  | 'strategy'
  | 'admin'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Project {
  id: string
  icon: string
  name: string
  description?: string
  details?: string[]
}

export interface Task {
  id: number
  title: string
  assignee: string
  assigneeId?: string
  done: boolean
  overdue?: boolean
}

export interface StockItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
}

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: 'Active' | 'VIP' | 'Inactive'
  totalSpent: number
}

export interface Transaction {
  id: string
  description: string
  type: 'income' | 'expense'
  amount: number
  date: string
}

export interface Partner {
  id: string
  name: string
  business: string
  role: string
  contact: string
}

export interface StrategyItem {
  id: string
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Planned' | 'In progress' | 'Complete'
}
