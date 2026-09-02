export type UserRole = 'admin' | 'founder' | 'manager' | 'employee'

export type View =
  | 'dashboard'
  | 'projects-manage'
  | 'project-detail'
  | 'stock'
  | 'customers'
  | 'network'
  | 'strategy'
  | 'admin'
  | 'executive-control-center'

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Converted'
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled'

export interface Quote {
  id: string
  customer_id?: string | null
  customer_name?: string | null
  project_id?: string | null
  project_name?: string | null
  number?: string | null
  status: QuoteStatus
  total: number
  issue_date?: string | null
  expiry_date?: string | null
  created_at?: string
  updated_at?: string
}

export interface Invoice {
  id: string
  customer_id?: string | null
  customer_name?: string | null
  project_id?: string | null
  project_name?: string | null
  number?: string | null
  status: InvoiceStatus
  total: number
  due_date?: string | null
  issued_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface BusinessNotification {
  id: string
  type: 'invoice' | 'quote' | 'task' | 'project' | 'payroll' | 'expense'
  title: string
  detail: string
  created_at: string
  priority: 'low' | 'medium' | 'high'
  action?: string
}

export interface SearchResult {
  id: string
  type: 'customer' | 'project' | 'task' | 'quote' | 'invoice' | 'job' | 'document'
  title: string
  subtitle: string
  value?: string
  route?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
}

export type Priority = 'High' | 'Medium' | 'Low'

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled'

export interface Project {
  id: string
  icon: string
  name: string
  description?: string
  details?: string[]
  priority?: Priority
  status?: ProjectStatus
  start_date?: string | null
  due_date?: string | null
  assigned_users?: string[] | null
  customer_id?: string | null
  customer_name?: string | null
  last_activity_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: string
  title: string
  assignee: string
  assigneeId?: string
  done: boolean
  overdue?: boolean
  priority?: Priority
  due_date?: string | null
  project_id?: string | null
  project_name?: string | null
  created_at?: string
  updated_at?: string
}

export interface Document {
  id: string
  project_id: string
  filename: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_by?: string | null
  uploaded_at: string
  created_at: string
  updated_at?: string
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
  total_spent: number
  created_at?: string
  updated_at?: string
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
  priority: Priority
  status: 'Planned' | 'In progress' | 'Complete'
}

export type ExpenseCategory = 'Fuel' | 'Hosting' | 'Software' | 'Marketing' | 'Equipment' | 'Travel'
export type PayrollStatus = 'draft' | 'pending' | 'approved' | 'paid'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface JobCostingRecord {
  id: string
  title: string
  client_name: string
  project_id?: string | null
  project_name?: string | null
  materials_cost: number
  labour_cost: number
  additional_expenses: number
  revenue: number
  profit: number
  notes?: string
  created_by?: string | null
  created_at: string
  updated_at?: string
}

export interface ExpenseRecord {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  vendor?: string
  status: ApprovalStatus
  approval_step: number
  created_by?: string | null
  approved_by?: string | null
  created_at: string
  updated_at?: string
}

export interface PayrollRecord {
  id: string
  user_id: string
  user_name: string
  salary: number
  hourly_rate: number
  bonus: number
  status: PayrollStatus
  approval_step: number
  created_by?: string | null
  approved_by?: string | null
  created_at: string
  updated_at?: string
}

export interface OwnerDrawRecord {
  id: string
  founder_id: string
  founder_name: string
  amount: number
  reason: string
  date: string
  approved_by?: string | null
  approval_step: number
  status: ApprovalStatus
  created_by?: string | null
  created_at: string
}

export interface FinancialSetting {
  id: string
  company_reserve_pct: number
  founder_pool_pct: number
  employee_bonus_pct: number
  founder_allocations: Record<string, number>
  updated_at?: string
}

export interface FinancialAuditLog {
  id: string
  table_name: string
  record_id: string
  action: string
  actor_id?: string | null
  actor_name?: string | null
  old_value: Record<string, unknown>
  new_value: Record<string, unknown>
  created_at: string
}
