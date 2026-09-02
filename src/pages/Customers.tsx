import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  FileUp,
  Mail,
  Paperclip,
  Phone,
  ReceiptText,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Customer, Invoice, Quote } from '../types'

interface CustomersProps {
  customers: Customer[]
  quotes?: Quote[]
  invoices?: Invoice[]
  onCreate: (customer: Omit<Customer, 'id'>) => Promise<void>
  onUpdate: (customer: Customer) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

type WorkspaceTab = 'overview' | 'jobs' | 'quotes' | 'invoices' | 'payments' | 'files' | 'activity'

type FinancialJobRow = {
  id: string
  title: string
  client_name: string
  revenue: number | string | null
  profit: number | string | null
  materials_cost: number | string | null
  labour_cost: number | string | null
  created_at?: string | null
}

type DocumentRow = {
  id: string
  filename: string
  file_type?: string | null
  file_path?: string | null
  uploaded_at?: string | null
  created_at?: string | null
}

const emptyCustomerForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'Active' as Customer['status'],
  total_spent: 0,
}

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 2,
})

const formatCurrency = (value: number) => currencyFormatter.format(Number.isFinite(value) ? value : 0)
const formatDate = (value?: string | null) => {
  if (!value) return 'No date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}
const safeNumber = (value: number | string | null | undefined) => Number(value ?? 0)
const actionButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'transparent',
  color: '#e9e9e9',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontWeight: 600,
}

const actionButtonPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
  color: '#f5d98d',
  border: '1px solid rgba(212,175,55,0.4)',
  borderRadius: '8px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontWeight: 700,
}

export function Customers({ customers, quotes = [], invoices = [], onCreate, onUpdate, onDelete }: CustomersProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState(emptyCustomerForm)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('overview')
  const [customerJobs, setCustomerJobs] = useState<FinancialJobRow[]>([])
  const [customerDocuments, setCustomerDocuments] = useState<DocumentRow[]>([])
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [customerActionStatus, setCustomerActionStatus] = useState<string | null>(null)
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false)
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false)
  const [localQuotes, setLocalQuotes] = useState<Quote[]>(quotes)
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(invoices)
  const [activeWorkflow, setActiveWorkflow] = useState<null | 'job' | 'quote' | 'invoice' | 'payment' | 'upload'>(null)
  const [jobForm, setJobForm] = useState({
    name: '',
    description: '',
    project: '',
    material_cost: '',
    labour_cost: '',
    revenue: '',
    notes: '',
  })
  const [quoteForm, setQuoteForm] = useState({
    number: '',
    customer: '',
    items: '',
    labour: '',
    vat: '',
    notes: '',
  })
  const [invoiceForm, setInvoiceForm] = useState({
    number: '',
    customer: '',
    items: '',
    labour: '',
    vat: '',
    payment_status: 'Unpaid',
    notes: '',
  })
  const [paymentForm, setPaymentForm] = useState({
    invoice: '',
    amount: '',
    method: 'Bank Transfer',
    reference: '',
    date: new Date().toISOString().slice(0, 10),
  })
  const [uploadForm, setUploadForm] = useState({
    type: 'Contracts',
    notes: '',
  })

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  )

  useEffect(() => {
    setLocalQuotes(quotes)
  }, [quotes])

  useEffect(() => {
    setLocalInvoices(invoices)
  }, [invoices])

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerJobs([])
      setCustomerDocuments([])
      return
    }

    let isMounted = true

    const loadWorkspace = async () => {
      setIsLoadingWorkspace(true)

      const [jobsResult, documentsResult] = await Promise.all([
        supabase.from('financial_jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('*').order('uploaded_at', { ascending: false }),
      ])

      if (!isMounted) return

      const filteredJobs = (jobsResult.data ?? []).filter((job) => {
        const customerName = (selectedCustomer.name ?? '').trim().toLowerCase()
        const jobClient = (job.client_name ?? '').trim().toLowerCase()
        return !jobClient || customerName === jobClient || customerName.includes(jobClient) || jobClient.includes(customerName)
      }) as FinancialJobRow[]

      setCustomerJobs(filteredJobs)
      setCustomerDocuments((documentsResult.data ?? []) as DocumentRow[])
      setIsLoadingWorkspace(false)
    }

    void loadWorkspace()

    return () => {
      isMounted = false
    }
  }, [selectedCustomer])

  const resetForm = () => {
    setEditingId(null)
    setFormState(emptyCustomerForm)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!formState.name.trim() || !formState.company.trim() || !formState.email.trim()) {
      return
    }

    const customerPayload = {
      name: formState.name.trim(),
      company: formState.company.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim() || 'Not provided',
      status: formState.status,
      total_spent: Number(formState.total_spent ?? 0),
    }

    if (editingId) {
      void onUpdate({ id: editingId, ...customerPayload })
    } else {
      void onCreate(customerPayload)
    }

    resetForm()
  }

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setFormState({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      total_spent: Number(customer.total_spent ?? 0),
    })
  }

  const handleDelete = (customerId: string) => {
    void onDelete(customerId)
    if (editingId === customerId) {
      resetForm()
    }
  }

  const workspaceTabs: { key: WorkspaceTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { key: 'quotes', label: 'Quotes', icon: FileText },
    { key: 'invoices', label: 'Invoices', icon: ReceiptText },
    { key: 'payments', label: 'Payments', icon: Wallet },
    { key: 'files', label: 'Files', icon: Paperclip },
    { key: 'activity', label: 'Activity', icon: Activity },
  ]

  const customerRevenue = customerJobs.reduce((sum, job) => sum + safeNumber(job.revenue), 0)
  const customerProfit = customerJobs.reduce((sum, job) => sum + safeNumber(job.profit), 0)
  const customerQuotes = (selectedCustomer ? localQuotes.filter((quote) => quote.customer_id === selectedCustomer.id || quote.customer_name === selectedCustomer.name) : []).filter((quote) => quote.status !== 'Converted' && quote.status !== 'Rejected')
  const customerInvoices = (selectedCustomer ? localInvoices.filter((invoice) => invoice.customer_id === selectedCustomer.id || invoice.customer_name === selectedCustomer.name) : [])
  const outstandingBalance = Math.max(0, customerInvoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Cancelled').reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0))
  const activeJobs = customerJobs.filter((job) => safeNumber(job.profit) >= 0).length
  const completedJobs = customerJobs.filter((job) => safeNumber(job.profit) > 0).length
  const lastActivity = customerJobs[0]?.created_at ?? selectedCustomer?.created_at ?? null
  const customerHealth = customerJobs.length === 0 && customerInvoices.length === 0 && customerQuotes.length === 0 ? 'Inactive' : outstandingBalance > 0 || customerInvoices.some((invoice) => invoice.status === 'Overdue') ? 'Attention Required' : 'Healthy'
  const activeCustomerQuotes = customerQuotes.filter((quote) => quote.status !== 'Converted' && quote.status !== 'Rejected')
  const timelineEntries = [
    ...(selectedCustomer
      ? [{
          id: `customer-${selectedCustomer.id}`,
          type: 'customer' as const,
          label: 'Customer Created',
          detail: `${selectedCustomer.company || selectedCustomer.name} • ${selectedCustomer.email}`,
          date: selectedCustomer.created_at ?? null,
          recordId: selectedCustomer.id,
        }]
      : []),
    ...customerJobs.map((job) => ({
      id: `job-${job.id}`,
      type: 'job' as const,
      label: safeNumber(job.profit) > 0 ? 'Job Completed' : 'Job Created',
      detail: `${job.title} • ${formatCurrency(safeNumber(job.revenue))}`,
      date: job.created_at ?? null,
      recordId: job.id,
    })),
    ...activeCustomerQuotes.map((quote) => ({
      id: `quote-${quote.id}`,
      type: 'quote' as const,
      label: quote.status === 'Accepted' ? 'Quote Accepted' : 'Quote Created',
      detail: `${quote.number ?? 'Quote'} • ${formatCurrency(quote.total)}`,
      date: quote.updated_at ?? quote.created_at ?? null,
      recordId: quote.id,
    })),
    ...customerInvoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      type: 'invoice' as const,
      label: invoice.status === 'Paid' ? 'Payment Received' : 'Invoice Created',
      detail: `${invoice.number ?? 'Invoice'} • ${formatCurrency(invoice.total)}`,
      date: invoice.updated_at ?? invoice.issued_at ?? invoice.created_at ?? null,
      recordId: invoice.id,
    })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()).slice(0, 8)

  const quickActions = [
    { label: 'Create Job', action: 'job' },
    { label: 'Create Quote', action: 'quote' },
    { label: 'Create Invoice', action: 'invoice' },
    { label: 'Upload File', action: 'upload' },
    { label: 'Record Payment', action: 'payment' },
  ]

  const handleQuickAction = async (action: string) => {
    if (!selectedCustomer) return

    if (action === 'job') {
      setJobForm({
        name: '',
        description: '',
        project: selectedCustomer.company || selectedCustomer.name,
        material_cost: '',
        labour_cost: '',
        revenue: '',
        notes: '',
      })
      setActiveWorkflow('job')
      setWorkspaceTab('jobs')
      setCustomerActionStatus('Job creation workflow opened.')
      return
    }

    if (action === 'quote') {
      setQuoteForm({
        number: `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        customer: selectedCustomer.name,
        items: '',
        labour: '',
        vat: '',
        notes: '',
      })
      setActiveWorkflow('quote')
      setWorkspaceTab('quotes')
      setCustomerActionStatus('Quote creation workflow opened.')
      return
    }

    if (action === 'invoice') {
      setInvoiceForm({
        number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        customer: selectedCustomer.name,
        items: '',
        labour: '',
        vat: '',
        payment_status: 'Unpaid',
        notes: '',
      })
      setActiveWorkflow('invoice')
      setWorkspaceTab('invoices')
      setCustomerActionStatus('Invoice creation workflow opened.')
      return
    }

    if (action === 'upload') {
      setUploadForm({ type: 'Contracts', notes: '' })
      setSelectedUploadFile(null)
      setActiveWorkflow('upload')
      setIsUploadDrawerOpen(true)
      setCustomerActionStatus('Upload a contract, quote, invoice or proof of payment.')
      return
    }

    if (action === 'payment') {
      const openInvoice = customerInvoices[0]
      setPaymentForm({
        invoice: openInvoice?.id ?? '',
        amount: openInvoice ? String(openInvoice.total) : '',
        method: 'Bank Transfer',
        reference: '',
        date: new Date().toISOString().slice(0, 10),
      })
      setActiveWorkflow('payment')
      setWorkspaceTab('payments')
      setCustomerActionStatus('Payment form opened for this customer.')
    }
  }

  const handleRecordPayment = async (invoice: Invoice) => {
    if (!selectedCustomer) return

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'Paid', updated_at: new Date().toISOString() })
        .eq('id', invoice.id)

      if (error) throw error

      setLocalInvoices((previous) => previous.map((entry) => (entry.id === invoice.id ? { ...entry, status: 'Paid', updated_at: new Date().toISOString() } : entry)))
      setWorkspaceTab('payments')
      setCustomerActionStatus(`Payment recorded for ${invoice.number ?? 'invoice'} and linked to receipt.`)
    } catch (error) {
      console.error('Failed to record payment:', error)
      setCustomerActionStatus('Unable to record payment right now.')
    }
  }

  const handleRelationshipNavigation = (relationship: 'job' | 'quote' | 'invoice' | 'payment' | 'receipt') => {
    const destinationMap = {
      job: 'jobs',
      quote: 'quotes',
      invoice: 'invoices',
      payment: 'payments',
      receipt: 'payments',
    } as const

    setWorkspaceTab(destinationMap[relationship])
    setCustomerActionStatus(`Navigated to ${relationship === 'receipt' ? 'receipt' : relationship} record.`)
  }

  const handleConvertQuoteToInvoice = async (quote: Quote) => {
    if (!selectedCustomer) return

    const confirmed = window.confirm(`Convert ${quote.number ?? 'this quote'} to an invoice for ${selectedCustomer.name}?`)
    if (!confirmed) return

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const invoicePayload = {
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      project_id: quote.project_id ?? null,
      project_name: quote.project_name ?? null,
      number: invoiceNumber,
      status: 'Draft',
      total: Number(quote.total ?? 0),
      due_date: quote.expiry_date ?? null,
      issued_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const { data: invoiceData, error: invoiceError } = await supabase.from('invoices').insert([invoicePayload]).select().single()
      if (invoiceError) throw invoiceError

      const { error: quoteError } = await supabase.from('quotes').update({ status: 'Converted', updated_at: new Date().toISOString() }).eq('id', quote.id)
      if (quoteError) throw quoteError

      const nextInvoice: Invoice = {
        id: invoiceData.id,
        customer_id: invoiceData.customer_id ?? null,
        customer_name: invoiceData.customer_name ?? null,
        project_id: invoiceData.project_id ?? null,
        project_name: invoiceData.project_name ?? null,
        number: invoiceData.number ?? null,
        status: (invoiceData.status ?? 'Draft') as Invoice['status'],
        total: Number(invoiceData.total ?? 0),
        due_date: invoiceData.due_date ?? null,
        issued_at: invoiceData.issued_at ?? null,
        created_at: invoiceData.created_at,
        updated_at: invoiceData.updated_at,
      }

      setLocalQuotes((previous) => previous.map((entry) => (entry.id === quote.id ? { ...entry, status: 'Converted' } : entry)))
      setLocalInvoices((previous) => [nextInvoice, ...previous])
      setWorkspaceTab('invoices')
      setCustomerActionStatus(`Invoice ${invoiceNumber} created from quote ${quote.number ?? 'record'}.`)
    } catch (error) {
      console.error('Failed to convert quote to invoice:', error)
      setCustomerActionStatus('Unable to convert quote to invoice right now.')
    }
  }

  const handleUploadFile = async () => {
    if (!selectedCustomer) return

    const fileToUse = selectedUploadFile ?? new File(['customer-document'], 'customer-document.txt', { type: 'text/plain' })
    const entry: DocumentRow = {
      id: `upload-${Date.now()}`,
      filename: fileToUse.name,
      file_type: uploadForm.type || 'File',
      file_path: URL.createObjectURL(fileToUse),
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    setCustomerDocuments((previous) => [entry, ...previous])
    setSelectedUploadFile(null)
    setIsUploadDrawerOpen(false)
    setActiveWorkflow(null)
    setCustomerActionStatus(`${fileToUse.name} uploaded to ${selectedCustomer.name} as ${uploadForm.type}.`)
  }

  const handleCreateJobSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCustomer) return

    const nextJob: FinancialJobRow = {
      id: `job-${Date.now()}`,
      title: jobForm.name || 'New Customer Job',
      client_name: selectedCustomer.name,
      revenue: Number(jobForm.revenue || 0),
      profit: Number(jobForm.revenue || 0) - (Number(jobForm.material_cost || 0) + Number(jobForm.labour_cost || 0)),
      materials_cost: Number(jobForm.material_cost || 0),
      labour_cost: Number(jobForm.labour_cost || 0),
      created_at: new Date().toISOString(),
    }

    setCustomerJobs((previous) => [nextJob, ...previous])
    setWorkspaceTab('jobs')
    setActiveWorkflow(null)
    setCustomerActionStatus(`Job ${nextJob.title} created for ${selectedCustomer.name}.`)
  }

  const handleCreateQuoteSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCustomer) return

    const labour = Number(quoteForm.labour || 0)
    const vat = Number(quoteForm.vat || 0)
    const total = labour + vat
    const quoteNumber = quoteForm.number || `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

    const nextQuote: Quote = {
      id: `quote-${Date.now()}`,
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      project_id: null,
      project_name: null,
      number: quoteNumber,
      status: 'Draft',
      total,
      issue_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setLocalQuotes((previous) => [nextQuote, ...previous])
    setWorkspaceTab('quotes')
    setActiveWorkflow(null)
    setCustomerActionStatus(`Quote ${quoteNumber} created for ${selectedCustomer.name}.`)
  }

  const handleCreateInvoiceSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCustomer) return

    const labour = Number(invoiceForm.labour || 0)
    const vat = Number(invoiceForm.vat || 0)
    const total = labour + vat
    const invoiceNumber = invoiceForm.number || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

    const nextInvoice: Invoice = {
      id: `invoice-${Date.now()}`,
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      project_id: null,
      project_name: null,
      number: invoiceNumber,
      status: (invoiceForm.payment_status as Invoice['status']) || 'Draft',
      total,
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      issued_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setLocalInvoices((previous) => [nextInvoice, ...previous])
    setWorkspaceTab('invoices')
    setActiveWorkflow(null)
    setCustomerActionStatus(`Invoice ${invoiceNumber} created for ${selectedCustomer.name}.`)
  }

  const handlePaymentSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCustomer) return

    const invoiceToUpdate = localInvoices.find((invoice) => invoice.id === paymentForm.invoice)
    if (invoiceToUpdate) {
      setLocalInvoices((previous) => previous.map((invoice) => (invoice.id === invoiceToUpdate.id ? { ...invoice, status: 'Paid', updated_at: new Date().toISOString() } : invoice)))
    }

    setWorkspaceTab('payments')
    setActiveWorkflow(null)
    setCustomerActionStatus(`Payment recorded for ${invoiceToUpdate?.number ?? 'invoice'} via ${paymentForm.method}.`)
  }

  const handleCreateQuoteFromJob = async (job: FinancialJobRow) => {
    if (!selectedCustomer) return

    const payload = {
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      project_id: null,
      project_name: null,
      number: `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'Draft' as Quote['status'],
      total: Number(safeNumber(job.revenue)),
      issue_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from('quotes').insert([payload]).select().single()
      if (error) throw error

      const nextQuote: Quote = {
        id: data.id,
        customer_id: data.customer_id ?? null,
        customer_name: data.customer_name ?? null,
        project_id: data.project_id ?? null,
        project_name: data.project_name ?? null,
        number: data.number ?? null,
        status: (data.status ?? 'Draft') as Quote['status'],
        total: Number(data.total ?? 0),
        issue_date: data.issue_date ?? null,
        expiry_date: data.expiry_date ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      setLocalQuotes((previous) => [nextQuote, ...previous])
      setWorkspaceTab('quotes')
      setCustomerActionStatus(`Quote ${payload.number} created for ${selectedCustomer.name}.`)
    } catch (error) {
      console.error('Failed to create quote from job:', error)
      setCustomerActionStatus('Unable to create quote from this job right now.')
    }
  }

  const handleCreateInvoiceFromJob = async (job: FinancialJobRow) => {
    if (!selectedCustomer) return

    const payload = {
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      project_id: null,
      project_name: null,
      number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'Draft' as Invoice['status'],
      total: Number(safeNumber(job.revenue)),
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      issued_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from('invoices').insert([payload]).select().single()
      if (error) throw error

      const nextInvoice: Invoice = {
        id: data.id,
        customer_id: data.customer_id ?? null,
        customer_name: data.customer_name ?? null,
        project_id: data.project_id ?? null,
        project_name: data.project_name ?? null,
        number: data.number ?? null,
        status: (data.status ?? 'Draft') as Invoice['status'],
        total: Number(data.total ?? 0),
        due_date: data.due_date ?? null,
        issued_at: data.issued_at ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      setLocalInvoices((previous) => [nextInvoice, ...previous])
      setWorkspaceTab('invoices')
      setCustomerActionStatus(`Invoice ${payload.number} created for ${selectedCustomer.name}.`)
    } catch (error) {
      console.error('Failed to create invoice from job:', error)
      setCustomerActionStatus('Unable to create invoice from this job right now.')
    }
  }

  const workflowFormStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  }

  const workflowInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(212,175,55,0.28)',
    background: 'rgba(17,17,17,0.7)',
    color: '#f5f5f5',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  }

  const workflowLabelStyle: React.CSSProperties = {
    display: 'grid',
    gap: '8px',
    color: '#d4d4d4',
    fontSize: '0.82rem',
    fontWeight: 600,
  }

  const getInvoiceTone = (status: string) => {
    if (status === 'Paid') return { bg: 'rgba(34,197,94,0.12)', color: '#7ce3a2' }
    if (status === 'Overdue') return { bg: 'rgba(248,113,113,0.12)', color: '#fca5a5' }
    if (status === 'Partially Paid') return { bg: 'rgba(250,204,21,0.12)', color: '#fbbf24' }
    return { bg: 'rgba(212,175,55,0.1)', color: '#f3d67a' }
  }

  const customerPayments = customerInvoices.filter((invoice) => invoice.status === 'Paid' || invoice.status === 'Partially Paid' || invoice.status === 'Overdue').map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.number ?? 'Invoice',
    amount: formatCurrency(invoice.total),
    status: invoice.status,
    date: invoice.updated_at ?? invoice.issued_at ?? invoice.created_at ?? null,
  }))

  const openEmailComposer = () => {
    if (!selectedCustomer) return
    window.location.href = `mailto:${selectedCustomer.email}?subject=${encodeURIComponent(`Customer update - ${selectedCustomer.company}`)}`
  }

  const openPhoneActions = () => {
    if (!selectedCustomer) return
    window.location.href = `tel:${selectedCustomer.phone}`
  }

  const interactionTone = (status: string) => {
    if (status === 'Healthy') return { bg: 'rgba(34,197,94,0.12)', color: '#7ce3a2' }
    if (status === 'Attention Required') return { bg: 'rgba(250,204,21,0.12)', color: '#fbbf24' }
    return { bg: 'rgba(148,163,184,0.12)', color: '#cbd5e1' }
  }

  if (selectedCustomer) {
    return (
      <section className="section" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px', padding: '24px 24px 18px', borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
            <div>
              <span className="eyebrow" style={{ color: '#d4af37' }}>Customer workspace</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.05em' }}>{selectedCustomer.name}</h2>
                <span style={{ background: interactionTone(customerHealth).bg, color: interactionTone(customerHealth).color, borderRadius: '999px', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700 }}>{customerHealth}</span>
              </div>
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: '#c7c7c7', marginTop: '8px' }}>
                <span>{selectedCustomer.company}</span>
                <span>{selectedCustomer.status}</span>
                <span>{customerInvoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Cancelled').length} open invoices</span>
              </div>
            </div>

            <aside style={{ position: 'sticky', top: '20px', alignSelf: 'start', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Command center</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next quote expiry</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{activeCustomerQuotes[0]?.expiry_date ? formatDate(activeCustomerQuotes[0].expiry_date) : 'No active quote'}</div></div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Outstanding amount</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatCurrency(outstandingBalance)}</div></div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active jobs</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{activeJobs}</div></div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Open invoices</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{customerInvoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Cancelled').length}</div></div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest payment</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{customerPayments[0] ? `${customerPayments[0].invoiceNumber} • ${customerPayments[0].amount}` : 'No payments yet'}</div></div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent activity</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{timelineEntries[0] ? timelineEntries[0].label : 'No activity'}</div></div>
              </div>
            </aside>
          </div>

          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              padding: '14px 24px 12px',
              borderBottom: '1px solid rgba(212,175,55,0.12)',
              flexWrap: 'wrap',
              background: 'rgba(17,17,17,0.96)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ width: '100%', color: '#d4af37', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Top command bar</div>
            {quickActions.map((entry) => (
              <button key={entry.action} type="button" onClick={() => void handleQuickAction(entry.action)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.28)', color: '#f3d67a', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', fontWeight: 700 }}>
                + {entry.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 24px 0', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = workspaceTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setWorkspaceTab(tab.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(212,175,55,0.35)' : 'transparent'}`,
                    color: isActive ? '#f3d67a' : '#b5b5b5',
                    borderRadius: '10px 10px 0 0',
                    padding: '12px 16px',
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

          {customerActionStatus && (
            <div style={{ padding: '14px 24px 0', color: '#f3d67a' }}>{customerActionStatus}</div>
          )}

          <div style={{ padding: '22px 24px 30px' }}>
            {isLoadingWorkspace ? (
              <div style={{ color: '#d5d5d5', padding: '24px 0' }}>Loading customer workspace…</div>
            ) : (
              <>
                {workspaceTab === 'overview' && (
                  <div style={{ display: 'grid', gap: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <button type="button" onClick={() => setCustomerActionStatus(`${selectedCustomer.company} profile opened.`)} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><Building2 size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Company</span></div>
                        <div style={{ fontSize: '1.2rem', marginTop: '10px', fontWeight: 700 }}>{selectedCustomer.company}</div>
                      </button>
                      <button type="button" onClick={openEmailComposer} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><Mail size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</span></div>
                        <div style={{ fontSize: '1rem', marginTop: '10px', wordBreak: 'break-word' }}>{selectedCustomer.email}</div>
                      </button>
                      <button type="button" onClick={openPhoneActions} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><Phone size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Phone</span></div>
                        <div style={{ fontSize: '1rem', marginTop: '10px' }}>{selectedCustomer.phone}</div>
                      </button>
                      <button type="button" onClick={() => { setCustomerActionStatus('Revenue breakdown opened.'); setWorkspaceTab('activity') }} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><TrendingUp size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lifetime Revenue</span></div>
                        <div style={{ fontSize: '1.6rem', marginTop: '10px', fontWeight: 800 }}>{formatCurrency(selectedCustomer.total_spent || customerRevenue)}</div>
                      </button>
                      <button type="button" onClick={() => { setWorkspaceTab('invoices'); setCustomerActionStatus('Unpaid invoice list opened.') }} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><Wallet size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Outstanding Balance</span></div>
                        <div style={{ fontSize: '1.6rem', marginTop: '10px', fontWeight: 800 }}>{formatCurrency(outstandingBalance)}</div>
                      </button>
                      <button type="button" onClick={() => { setWorkspaceTab('quotes'); setCustomerActionStatus('Quotes tab opened.') }} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><FileText size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open Quotes</span></div>
                        <div style={{ fontSize: '1.6rem', marginTop: '10px', fontWeight: 800 }}>{customerQuotes.length}</div>
                      </button>
                      <button type="button" onClick={() => { setWorkspaceTab('invoices'); setCustomerActionStatus('Open invoices tab opened.') }} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><ReceiptText size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open Invoices</span></div>
                        <div style={{ fontSize: '1.6rem', marginTop: '10px', fontWeight: 800 }}>{customerInvoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Cancelled').length}</div>
                      </button>
                      <button type="button" onClick={() => { setWorkspaceTab('jobs'); setCustomerActionStatus('Jobs tab opened.') }} className="panel" style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}><BriefcaseBusiness size={18} /><span style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Jobs</span></div>
                        <div style={{ fontSize: '1.6rem', marginTop: '10px', fontWeight: 800 }}>{activeJobs}</div>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '18px' }}>
                      <div className="panel" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0 }}>Recent Activity</h3>
                          <span style={{ color: '#9ca3af', fontSize: '0.76rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live</span>
                        </div>
                        {timelineEntries.length === 0 ? (
                          <div style={{ border: '1px dashed rgba(212,175,55,0.24)', borderRadius: '12px', padding: '30px 20px', textAlign: 'center', color: '#a1a1a1' }}>No customer activity yet.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {timelineEntries.map((entry) => (
                              <button key={entry.id} type="button" onClick={() => { setWorkspaceTab(entry.type === 'job' ? 'jobs' : entry.type === 'quote' ? 'quotes' : entry.type === 'invoice' ? 'invoices' : 'activity'); setCustomerActionStatus(`${entry.label} opened.`) }} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', background: 'transparent', borderLeft: 0, borderRight: 0, borderTop: 0, color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{entry.label}</div>
                                  <div style={{ color: '#9ca3af', marginTop: '4px' }}>{entry.detail}</div>
                                </div>
                                <div style={{ color: '#a8a8a8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(entry.date)}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="panel" style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 14px' }}>Customer health</h3>
                        <div style={{ color: customerHealth === 'Healthy' ? '#7ce3a2' : customerHealth === 'Inactive' ? '#cbd5e1' : '#fbbf24', fontSize: '1.3rem', fontWeight: 700 }}>{customerHealth}</div>
                        {customerHealth === 'Healthy' ? (
                          <>
                            <div style={{ color: '#9ca3af', marginTop: '10px' }}>Outstanding Invoices: {customerInvoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Cancelled').length}</div>
                            <div style={{ color: '#9ca3af', marginTop: '6px' }}>Last Activity: {lastActivity ? formatDate(lastActivity) : 'No activity'}</div>
                          </>
                        ) : (
                          <>
                            <div style={{ color: '#9ca3af', marginTop: '10px' }}>Outstanding Balance: {formatCurrency(outstandingBalance)}</div>
                            <div style={{ color: '#9ca3af', marginTop: '6px' }}>Overdue Invoice: {customerInvoices.filter((invoice) => invoice.status === 'Overdue').length}</div>
                          </>
                        )}
                        <div style={{ color: '#9ca3af', marginTop: '6px' }}>Completed Jobs: {completedJobs}</div>
                        <div style={{ color: '#9ca3af', marginTop: '6px' }}>Lifetime Profit: {formatCurrency(customerProfit)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {workspaceTab === 'jobs' && (
                  <div>
                    {customerJobs.length === 0 ? (
                      <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Jobs Yet</div>
                        <div>Financial job records will appear here once they are linked to this customer.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '14px' }}>
                        {customerJobs.map((job) => {
                          const expanded = expandedJobId === job.id
                          return (
                            <div key={job.id} className="panel" style={{ padding: '18px 20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{job.title}</div>
                                  <div style={{ color: '#9ca3af', marginTop: '6px' }}>Status: {safeNumber(job.profit) >= 0 ? 'On Track' : 'Needs Review'}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <button type="button" onClick={() => setExpandedJobId(expanded ? null : job.id)} style={actionButtonStyle}><Eye size={14} /> {expanded ? 'Hide' : 'View Details'}</button>
                                  <button type="button" onClick={() => { setCustomerActionStatus(`Expense logged for ${job.title}.`); setExpandedJobId(job.id) }} style={actionButtonStyle}>Add Expense</button>
                                  <button type="button" onClick={() => void handleCreateQuoteFromJob(job)} style={actionButtonPrimaryStyle}>Generate Quote</button>
                                  <button type="button" onClick={() => void handleCreateInvoiceFromJob(job)} style={actionButtonPrimaryStyle}>Generate Invoice</button>
                                  <button type="button" onClick={() => { setCustomerActionStatus(`${job.title} marked complete.`); setExpandedJobId(job.id) }} style={actionButtonStyle}>Mark Complete</button>
                                  <button type="button" onClick={() => { setCustomerActionStatus(`Open project linked to ${job.title}.`); setWorkspaceTab('activity') }} style={actionButtonStyle}>Open Project</button>
                                </div>
                              </div>

                              {expanded && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '18px' }}>
                                  <div><div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Revenue</div><div style={{ marginTop: '6px', fontWeight: 700 }}>{formatCurrency(safeNumber(job.revenue))}</div></div>
                                  <div><div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Materials</div><div style={{ marginTop: '6px' }}>{formatCurrency(safeNumber(job.materials_cost))}</div></div>
                                  <div><div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Labour</div><div style={{ marginTop: '6px' }}>{formatCurrency(safeNumber(job.labour_cost))}</div></div>
                                  <div><div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profit</div><div style={{ marginTop: '6px', color: safeNumber(job.profit) >= 0 ? '#7ce3a2' : '#f8b4b4' }}>{formatCurrency(safeNumber(job.profit))}</div></div>
                                  <div><div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quote Link</div><div style={{ marginTop: '6px' }}>{activeCustomerQuotes.length ? activeCustomerQuotes[0].number ?? 'Linked' : 'Not linked'}</div></div>
                                  <div><div style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Invoice Link</div><div style={{ marginTop: '6px' }}>{customerInvoices.length ? customerInvoices[0].number ?? 'Issued' : 'Not issued'}</div></div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {workspaceTab === 'quotes' && (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {activeCustomerQuotes.length === 0 ? (
                      <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Quotes Yet</div>
                        <div>Create your first quote to get started.</div>
                      </div>
                    ) : (
                      activeCustomerQuotes.map((quote) => (
                        <div key={quote.id} className="panel" style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{quote.number ?? 'Quote'}</div>
                              <div style={{ color: '#9ca3af', marginTop: '4px' }}>{quote.status} • {formatCurrency(quote.total)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => setCustomerActionStatus(`Viewing ${quote.number ?? 'quote'} details.`)} style={actionButtonStyle}>View</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Editing ${quote.number ?? 'quote'}.`)} style={actionButtonStyle}>Edit</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Exporting ${quote.number ?? 'quote'} to PDF.`)} style={actionButtonStyle}>Export PDF</button>
                              <button type="button" onClick={() => window.print()} style={actionButtonStyle}>Print</button>
                              <button type="button" onClick={() => handleRelationshipNavigation('job')} style={actionButtonStyle}>Job</button>
                              <button type="button" onClick={() => void handleConvertQuoteToInvoice(quote)} style={actionButtonPrimaryStyle}>Convert To Invoice</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {workspaceTab === 'invoices' && (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {customerInvoices.length === 0 ? (
                      <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Invoices Yet</div>
                        <div>Invoice records will appear here once they are created from a quote.</div>
                      </div>
                    ) : (
                      customerInvoices.map((invoice) => {
                        const tone = getInvoiceTone(invoice.status)
                        return (
                          <div key={invoice.id} className="panel" style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{invoice.number ?? 'Invoice'}</div>
                                <div style={{ color: '#9ca3af', marginTop: '4px' }}>{formatCurrency(invoice.total)} • Due {invoice.due_date ? formatDate(invoice.due_date) : 'TBD'}</div>
                              </div>
                              <span style={{ background: tone.bg, color: tone.color, borderRadius: '999px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700 }}>{invoice.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => setCustomerActionStatus(`Viewing ${invoice.number ?? 'invoice'}.`)} style={actionButtonStyle}>View</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Editing ${invoice.number ?? 'invoice'}.`)} style={actionButtonStyle}>Edit</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Exporting ${invoice.number ?? 'invoice'} to PDF.`)} style={actionButtonStyle}>Export PDF</button>
                              <button type="button" onClick={() => window.print()} style={actionButtonStyle}>Print</button>
                              <button type="button" onClick={() => void handleRecordPayment(invoice)} style={actionButtonStyle}>Record Payment</button>
                              <button type="button" onClick={() => handleRelationshipNavigation('receipt')} style={actionButtonPrimaryStyle}>Receipt</button>
                              <button type="button" onClick={() => handleRelationshipNavigation('payment')} style={actionButtonStyle}>Payment</button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {workspaceTab === 'payments' && (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {customerPayments.length === 0 ? (
                      <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Payment Records</div>
                        <div>Payment activity appears when invoices are paid against this customer.</div>
                      </div>
                    ) : (
                      customerPayments.map((payment) => (
                        <div key={payment.id} className="panel" style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{payment.invoiceNumber}</div>
                              <div style={{ color: '#9ca3af', marginTop: '4px' }}>{payment.status} • {payment.amount}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => setCustomerActionStatus(`Receipt for ${payment.invoiceNumber} opened.`)} style={actionButtonStyle}>View Receipt</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Downloading receipt for ${payment.invoiceNumber}.`)} style={actionButtonStyle}>Download PDF</button>
                              <button type="button" onClick={() => window.print()} style={actionButtonStyle}>Print</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Viewing invoice ${payment.invoiceNumber}.`)} style={actionButtonStyle}>View Invoice</button>
                              <button type="button" onClick={() => handleRelationshipNavigation('invoice')} style={actionButtonStyle}>Invoice</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {workspaceTab === 'files' && (
                  <div style={{ display: 'grid', gap: '18px' }}>
                    <div
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        const file = event.dataTransfer.files?.[0]
                        if (file) {
                          setSelectedUploadFile(file)
                          setIsUploadDrawerOpen(true)
                        }
                      }}
                      style={{ border: '1px dashed rgba(212,175,55,0.35)', borderRadius: '14px', padding: '28px 18px', textAlign: 'center', background: 'rgba(212,175,55,0.02)' }}
                    >
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Drag and drop customer file</div>
                      <div style={{ color: '#9ca3af', marginTop: '8px' }}>Contracts, quotes, invoices, proof of payment, technical and project documents</div>
                      <input type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setSelectedUploadFile(file); setIsUploadDrawerOpen(true) } }} style={{ marginTop: '16px' }} />
                    </div>

                    {isUploadDrawerOpen && (
                      <div className="panel" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>{selectedUploadFile ? selectedUploadFile.name : 'Upload file'}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={handleUploadFile} style={actionButtonPrimaryStyle}>Confirm Upload</button>
                          <button type="button" onClick={() => { setIsUploadDrawerOpen(false); setSelectedUploadFile(null) }} style={actionButtonStyle}>Cancel</button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: '12px' }}>
                      {customerDocuments.length === 0 ? (
                        <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Files Uploaded</div>
                          <div>Upload contracts, invoices, and project documents from Supabase when they are available.</div>
                        </div>
                      ) : (
                        customerDocuments.map((document) => (
                          <div key={document.id} className="panel" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ background: 'rgba(212,175,55,0.1)', borderRadius: '10px', padding: '10px', color: '#f3d67a' }}><FileUp size={18} /></div>
                              <div>
                                <div style={{ fontWeight: 700 }}>{document.filename}</div>
                                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{document.file_type ?? 'File'} • {formatDate(document.uploaded_at ?? document.created_at)}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button type="button" onClick={() => setCustomerActionStatus(`Previewing ${document.filename}.`)} style={actionButtonStyle}>Preview</button>
                              <button type="button" onClick={() => setCustomerActionStatus(`Downloading ${document.filename}.`)} style={actionButtonStyle}>Download</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {workspaceTab === 'activity' && (
                  <div>
                    {timelineEntries.length === 0 ? (
                      <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Customer Activity Timeline Empty</div>
                        <div>Activity will populate from actual Supabase records as jobs, quotes, invoices and payments are added.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '14px' }}>
                        {timelineEntries.map((entry, index) => (
                          <div key={entry.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d4af37', boxShadow: '0 0 18px rgba(212,175,55,0.6)' }} />
                              {index < timelineEntries.length - 1 && <div style={{ width: '1px', height: '42px', background: 'rgba(212,175,55,0.25)', marginTop: '8px' }} />}
                            </div>
                            <button type="button" onClick={() => { setWorkspaceTab(entry.type === 'job' ? 'jobs' : entry.type === 'quote' ? 'quotes' : entry.type === 'invoice' ? 'invoices' : 'activity'); setCustomerActionStatus(`${entry.label} opened.`) }} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ fontWeight: 700 }}>{entry.label}</div>
                                <div style={{ color: '#a8a8a8', fontSize: '0.8rem' }}>{formatDate(entry.date)}</div>
                              </div>
                              <div style={{ color: '#c5c5c5', marginTop: '6px' }}>{entry.detail}</div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {activeWorkflow && selectedCustomer && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.68)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 100,
            }}
            onClick={() => setActiveWorkflow(null)}
          >
            <div
              className="panel"
              style={{
                width: 'min(700px, 100%)',
                maxHeight: '86vh',
                overflowY: 'auto',
                padding: '22px 22px 18px',
                boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div className="eyebrow" style={{ color: '#d4af37' }}>
                    {activeWorkflow === 'job' && 'Create Job'}
                    {activeWorkflow === 'quote' && 'Create Quote'}
                    {activeWorkflow === 'invoice' && 'Create Invoice'}
                    {activeWorkflow === 'payment' && 'Record Payment'}
                    {activeWorkflow === 'upload' && 'Upload File'}
                  </div>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.7rem', letterSpacing: '-0.04em' }}>
                    {selectedCustomer.name}
                  </h3>
                </div>
                <button type="button" onClick={() => setActiveWorkflow(null)} style={{ ...actionButtonStyle, background: 'rgba(255,255,255,0.03)' }}>Close</button>
              </div>

              {activeWorkflow === 'job' && (
                <form onSubmit={handleCreateJobSubmit} style={workflowFormStyle}>
                  <label style={workflowLabelStyle}>
                    Job Name
                    <input value={jobForm.name} onChange={(event) => setJobForm((current) => ({ ...current, name: event.target.value }))} placeholder="Spring campaign refresh" style={workflowInputStyle} required />
                  </label>
                  <label style={workflowLabelStyle}>
                    Description
                    <textarea value={jobForm.description} onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the project scope" rows={3} style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Project
                    <input value={jobForm.project} onChange={(event) => setJobForm((current) => ({ ...current, project: event.target.value }))} placeholder="Project / Campaign" style={workflowInputStyle} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label style={workflowLabelStyle}>
                      Material Cost
                      <input type="number" min="0" step="0.01" value={jobForm.material_cost} onChange={(event) => setJobForm((current) => ({ ...current, material_cost: event.target.value }))} placeholder="0.00" style={workflowInputStyle} />
                    </label>
                    <label style={workflowLabelStyle}>
                      Labour Cost
                      <input type="number" min="0" step="0.01" value={jobForm.labour_cost} onChange={(event) => setJobForm((current) => ({ ...current, labour_cost: event.target.value }))} placeholder="0.00" style={workflowInputStyle} />
                    </label>
                    <label style={workflowLabelStyle}>
                      Revenue
                      <input type="number" min="0" step="0.01" value={jobForm.revenue} onChange={(event) => setJobForm((current) => ({ ...current, revenue: event.target.value }))} placeholder="0.00" style={workflowInputStyle} required />
                    </label>
                  </div>
                  <label style={workflowLabelStyle}>
                    Notes
                    <textarea value={jobForm.notes} onChange={(event) => setJobForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes for the job" rows={3} style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setActiveWorkflow(null)} style={actionButtonStyle}>Cancel</button>
                    <button type="submit" style={actionButtonPrimaryStyle}>Save Job</button>
                  </div>
                </form>
              )}

              {activeWorkflow === 'quote' && (
                <form onSubmit={handleCreateQuoteSubmit} style={workflowFormStyle}>
                  <label style={workflowLabelStyle}>
                    Quote Number
                    <input value={quoteForm.number} onChange={(event) => setQuoteForm((current) => ({ ...current, number: event.target.value }))} style={workflowInputStyle} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Customer
                    <input value={quoteForm.customer} onChange={(event) => setQuoteForm((current) => ({ ...current, customer: event.target.value }))} style={workflowInputStyle} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Quote Items
                    <textarea value={quoteForm.items} onChange={(event) => setQuoteForm((current) => ({ ...current, items: event.target.value }))} placeholder="Describe the quote line items" rows={4} style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label style={workflowLabelStyle}>
                      Labour
                      <input type="number" min="0" step="0.01" value={quoteForm.labour} onChange={(event) => setQuoteForm((current) => ({ ...current, labour: event.target.value }))} placeholder="0.00" style={workflowInputStyle} />
                    </label>
                    <label style={workflowLabelStyle}>
                      VAT
                      <input type="number" min="0" step="0.01" value={quoteForm.vat} onChange={(event) => setQuoteForm((current) => ({ ...current, vat: event.target.value }))} placeholder="0.00" style={workflowInputStyle} />
                    </label>
                  </div>
                  <label style={workflowLabelStyle}>
                    Notes
                    <textarea value={quoteForm.notes} onChange={(event) => setQuoteForm((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Notes for the customer" style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setActiveWorkflow(null)} style={actionButtonStyle}>Cancel</button>
                    <button type="submit" style={actionButtonPrimaryStyle}>Save Quote</button>
                  </div>
                </form>
              )}

              {activeWorkflow === 'invoice' && (
                <form onSubmit={handleCreateInvoiceSubmit} style={workflowFormStyle}>
                  <label style={workflowLabelStyle}>
                    Invoice Number
                    <input value={invoiceForm.number} onChange={(event) => setInvoiceForm((current) => ({ ...current, number: event.target.value }))} style={workflowInputStyle} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Customer
                    <input value={invoiceForm.customer} onChange={(event) => setInvoiceForm((current) => ({ ...current, customer: event.target.value }))} style={workflowInputStyle} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Items
                    <textarea value={invoiceForm.items} onChange={(event) => setInvoiceForm((current) => ({ ...current, items: event.target.value }))} rows={4} placeholder="List invoice items" style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label style={workflowLabelStyle}>
                      Labour
                      <input type="number" min="0" step="0.01" value={invoiceForm.labour} onChange={(event) => setInvoiceForm((current) => ({ ...current, labour: event.target.value }))} placeholder="0.00" style={workflowInputStyle} />
                    </label>
                    <label style={workflowLabelStyle}>
                      VAT
                      <input type="number" min="0" step="0.01" value={invoiceForm.vat} onChange={(event) => setInvoiceForm((current) => ({ ...current, vat: event.target.value }))} placeholder="0.00" style={workflowInputStyle} />
                    </label>
                  </div>
                  <label style={workflowLabelStyle}>
                    Payment Status
                    <select value={invoiceForm.payment_status} onChange={(event) => setInvoiceForm((current) => ({ ...current, payment_status: event.target.value }))} style={workflowInputStyle}>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </label>
                  <label style={workflowLabelStyle}>
                    Notes
                    <textarea value={invoiceForm.notes} onChange={(event) => setInvoiceForm((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Invoice notes" style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setActiveWorkflow(null)} style={actionButtonStyle}>Cancel</button>
                    <button type="submit" style={actionButtonPrimaryStyle}>Save Invoice</button>
                  </div>
                </form>
              )}

              {activeWorkflow === 'payment' && (
                <form onSubmit={handlePaymentSubmit} style={workflowFormStyle}>
                  <label style={workflowLabelStyle}>
                    Invoice
                    <select value={paymentForm.invoice} onChange={(event) => setPaymentForm((current) => ({ ...current, invoice: event.target.value }))} style={workflowInputStyle}>
                      <option value="">Select invoice</option>
                      {localInvoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>{invoice.number ?? 'Invoice'} – {formatCurrency(invoice.total)}</option>
                      ))}
                    </select>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label style={workflowLabelStyle}>
                      Amount
                      <input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" style={workflowInputStyle} required />
                    </label>
                    <label style={workflowLabelStyle}>
                      Method
                      <select value={paymentForm.method} onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))} style={workflowInputStyle}>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Instant EFT">Instant EFT</option>
                      </select>
                    </label>
                  </div>
                  <label style={workflowLabelStyle}>
                    Reference
                    <input value={paymentForm.reference} onChange={(event) => setPaymentForm((current) => ({ ...current, reference: event.target.value }))} placeholder="Payment reference" style={workflowInputStyle} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Date
                    <input type="date" value={paymentForm.date} onChange={(event) => setPaymentForm((current) => ({ ...current, date: event.target.value }))} style={workflowInputStyle} />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setActiveWorkflow(null)} style={actionButtonStyle}>Cancel</button>
                    <button type="submit" style={actionButtonPrimaryStyle}>Save Payment</button>
                  </div>
                </form>
              )}

              {activeWorkflow === 'upload' && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleUploadFile()
                  }}
                  style={workflowFormStyle}
                >
                  <label style={workflowLabelStyle}>
                    Document Type
                    <select value={uploadForm.type} onChange={(event) => setUploadForm((current) => ({ ...current, type: event.target.value }))} style={workflowInputStyle}>
                      <option value="Contracts">Contracts</option>
                      <option value="Invoices">Invoices</option>
                      <option value="Quotes">Quotes</option>
                      <option value="Proof Of Payment">Proof Of Payment</option>
                      <option value="Technical Files">Technical Files</option>
                    </select>
                  </label>
                  <label style={workflowLabelStyle}>
                    File
                    <input type="file" onChange={(event) => setSelectedUploadFile(event.target.files?.[0] ?? null)} style={workflowInputStyle} />
                  </label>
                  <label style={workflowLabelStyle}>
                    Notes
                    <textarea value={uploadForm.notes} onChange={(event) => setUploadForm((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Document notes" style={{ ...workflowInputStyle, resize: 'vertical' }} />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => { setActiveWorkflow(null); setSelectedUploadFile(null) }} style={actionButtonStyle}>Cancel</button>
                    <button type="submit" style={actionButtonPrimaryStyle}>Save Upload</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {!selectedCustomer && (
          <div style={{ marginTop: '24px', display: 'grid', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span className="eyebrow">Customers</span>
                <h2 style={{ margin: '10px 0 0', fontSize: '2rem', letterSpacing: '-0.05em' }}>Customer workspace</h2>
              </div>
              <div style={{ color: '#bdbdbd', fontWeight: 600 }}>{customers.length} active customer{customers.length === 1 ? '' : 's'}</div>
            </div>

            {customers.length === 0 ? (
              <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '18px', padding: '52px 20px', textAlign: 'center', color: '#b8b8b8' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Customers Yet</div>
                <div>Customer records will appear here once they are created in Supabase.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
                {customers.map((customer) => (
                  <div key={customer.id} className="panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{customer.name}</div>
                        <div style={{ color: '#bfbfbf', marginTop: '4px' }}>{customer.company}</div>
                      </div>
                      <span style={{ background: customer.status === 'VIP' ? 'rgba(67,56,202,0.18)' : customer.status === 'Inactive' ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.12)', color: customer.status === 'VIP' ? '#c7d2fe' : customer.status === 'Inactive' ? '#d1d5db' : '#7ce3a2', borderRadius: '999px', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700 }}>{customer.status}</span>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', marginTop: '18px', color: '#d4d4d4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={15} color="#d4af37" /> {customer.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={15} color="#d4af37" /> {customer.phone}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginTop: '20px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lifetime Revenue</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatCurrency(Number(customer.total_spent ?? 0))}</div></div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open Quotes</div><div style={{ marginTop: '8px', fontWeight: 700 }}>0</div></div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open Invoices</div><div style={{ marginTop: '8px', fontWeight: 700 }}>0</div></div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Outstanding Balance</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatCurrency(Math.max(0, Number(customer.total_spent ?? 0)))}</div></div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Jobs</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{customerJobs.filter((job) => job.client_name.toLowerCase() === customer.name.toLowerCase() && safeNumber(job.profit) >= 0).length}</div></div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Last Activity</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatDate(customer.created_at)}</div></div>
                    </div>

                    <button type="button" onClick={() => setSelectedCustomerId(customer.id)} style={{ marginTop: '20px', width: '100%', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))', color: '#f5d98d', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ArrowUpRight size={16} />
                      Open Workspace
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'none' }} aria-hidden="true" />
      </section>
    )
  }

  return (
    <section className="section" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      <div className="panel" style={{ padding: '22px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow">Customers</span>
            <h2 style={{ margin: '10px 0 0', fontSize: '2rem', letterSpacing: '-0.05em' }}>Customer workspace</h2>
          </div>
          <div style={{ color: '#bdbdbd', fontWeight: 600 }}>{customers.length} active customer{customers.length === 1 ? '' : 's'}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input value={formState.name} onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))} placeholder="Customer name" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.company} onChange={(event) => setFormState((previous) => ({ ...previous, company: event.target.value }))} placeholder="Company" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input type="email" value={formState.email} onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))} placeholder="Email" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <input value={formState.phone} onChange={(event) => setFormState((previous) => ({ ...previous, phone: event.target.value }))} placeholder="Phone" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }} />
          <select value={formState.status} onChange={(event) => setFormState((previous) => ({ ...previous, status: event.target.value as Customer['status'] }))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', padding: '10px 12px' }}>
            <option value="Active">Active</option>
            <option value="VIP">VIP</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
            <button type="submit" style={{ background: '#d4af37', color: '#111111', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>
              {editingId ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>

        {customers.length === 0 ? (
          <div style={{ border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '14px', padding: '42px 20px', textAlign: 'center', color: '#b8b8b8' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Customers Yet</div>
            <div>Customer records will appear here once they are created in Supabase.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {customers.map((customer) => (
              <div key={customer.id} className="panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{customer.name}</div>
                    <div style={{ color: '#bfbfbf', marginTop: '4px' }}>{customer.company}</div>
                  </div>
                  <span style={{ background: customer.status === 'VIP' ? 'rgba(67,56,202,0.18)' : customer.status === 'Inactive' ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.12)', color: customer.status === 'VIP' ? '#c7d2fe' : customer.status === 'Inactive' ? '#d1d5db' : '#7ce3a2', borderRadius: '999px', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700 }}>{customer.status}</span>
                </div>

                <div style={{ display: 'grid', gap: '8px', marginTop: '18px', color: '#d4d4d4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={15} color="#d4af37" /> {customer.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={15} color="#d4af37" /> {customer.phone}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginTop: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lifetime Revenue</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatCurrency(Number(customer.total_spent ?? 0))}</div></div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open Quotes</div><div style={{ marginTop: '8px', fontWeight: 700 }}>0</div></div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open Invoices</div><div style={{ marginTop: '8px', fontWeight: 700 }}>0</div></div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Outstanding Balance</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatCurrency(Math.max(0, Number(customer.total_spent ?? 0)))}</div></div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Jobs</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{0}</div></div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}><div style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Last Activity</div><div style={{ marginTop: '8px', fontWeight: 700 }}>{formatDate(customer.created_at)}</div></div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setSelectedCustomerId(customer.id)} style={{ flex: 1, background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))', color: '#f5d98d', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowUpRight size={16} />
                    Open Workspace
                  </button>
                  <button type="button" onClick={() => handleEdit(customer)} style={{ background: 'transparent', color: '#d8d8d8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 14px', cursor: 'pointer' }}>
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(customer.id)} style={{ background: 'transparent', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', padding: '12px 14px', cursor: 'pointer' }}>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
