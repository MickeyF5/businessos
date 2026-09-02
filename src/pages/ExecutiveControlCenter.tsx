import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Calculator, CircleDollarSign, HandCoins, ShieldCheck, TrendingUp, Users, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ExpenseRecord, FinancialAuditLog, FinancialSetting, JobCostingRecord, OwnerDrawRecord, PayrollRecord, Project, UserProfile } from '../types'

interface ExecutiveControlCenterProps {
  projects: Project[]
  jobs: JobCostingRecord[]
  expenses: ExpenseRecord[]
  payrollRecords: PayrollRecord[]
  ownerDraws: OwnerDrawRecord[]
  financialSettings: FinancialSetting | null
  auditLogs: FinancialAuditLog[]
  allUsers: UserProfile[]
  currentUser: UserProfile | null
}

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 2,
})

const safeNumber = (value: number | string | null | undefined) => Number(value ?? 0)

const formatCurrency = (value: number) => currencyFormatter.format(Number.isFinite(value) ? value : 0)

const formatPercent = (value: number) => `${Number(value || 0).toFixed(2)}%`

const createAuditLog = async (tableName: string, recordId: string, action: string, actorId: string | null, actorName: string | null, oldValue: Record<string, unknown>, newValue: Record<string, unknown>) => {
  const { error } = await supabase.from('financial_audit_logs').insert([
    {
      table_name: tableName,
      record_id: recordId,
      action,
      actor_id: actorId,
      actor_name: actorName,
      old_value: oldValue,
      new_value: newValue,
    },
  ])

  if (error) {
    console.error('Failed to create audit log:', error)
  }
}

export function ExecutiveControlCenter({
  projects,
  jobs,
  expenses,
  payrollRecords,
  ownerDraws,
  financialSettings,
  auditLogs,
  allUsers,
  currentUser,
}: ExecutiveControlCenterProps) {
  if (!currentUser || currentUser.role !== 'admin') {
    return null
  }

  const founderOptions = useMemo(
    () => allUsers.filter((user) => user.role === 'founder' || user.role === 'admin'),
    [allUsers],
  )

  const [jobForm, setJobForm] = useState({
    title: '',
    client_name: '',
    project_id: '',
    materials_cost: '',
    labour_cost: '',
    additional_expenses: '',
    revenue: '',
    notes: '',
  })

  const [expenseForm, setExpenseForm] = useState({
    category: 'Fuel',
    description: '',
    amount: '',
    vendor: '',
  })

  const [payrollForm, setPayrollForm] = useState({
    user_id: '',
    user_name: '',
    salary: '',
    hourly_rate: '',
    bonus: '',
  })

  const [ownerDrawForm, setOwnerDrawForm] = useState({
    founder_id: '',
    founder_name: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().slice(0, 10),
  })

  const [settingsForm, setSettingsForm] = useState({
    company_reserve_pct: financialSettings?.company_reserve_pct ?? 0,
    founder_pool_pct: financialSettings?.founder_pool_pct ?? 0,
    employee_bonus_pct: financialSettings?.employee_bonus_pct ?? 0,
    founder_allocations: financialSettings?.founder_allocations ?? {},
  })

  useEffect(() => {
    setSettingsForm({
      company_reserve_pct: financialSettings?.company_reserve_pct ?? 0,
      founder_pool_pct: financialSettings?.founder_pool_pct ?? 0,
      employee_bonus_pct: financialSettings?.employee_bonus_pct ?? 0,
      founder_allocations: financialSettings?.founder_allocations ?? {},
    })
  }, [financialSettings])

  const totalRevenue = useMemo(
    () => jobs.reduce((sum, job) => sum + safeNumber(job.revenue), 0),
    [jobs],
  )

  const totalExpenseSpend = useMemo(
    () => expenses.reduce((sum, expense) => sum + safeNumber(expense.amount), 0),
    [expenses],
  )

  const totalJobCosts = useMemo(
    () => jobs.reduce((sum, job) => sum + safeNumber(job.materials_cost) + safeNumber(job.labour_cost) + safeNumber(job.additional_expenses), 0),
    [jobs],
  )

  const totalExpenses = totalExpenseSpend + totalJobCosts
  const grossProfit = totalRevenue - totalExpenses

  const outstandingExpenses = useMemo(
    () => expenses.filter((expense) => expense.status !== 'rejected').reduce((sum, expense) => sum + safeNumber(expense.amount), 0),
    [expenses],
  )

  const outstandingPayroll = useMemo(
    () => payrollRecords.filter((record) => record.status !== 'paid').reduce((sum, record) => sum + safeNumber(record.salary) + safeNumber(record.bonus), 0),
    [payrollRecords],
  )

  const netProfit = Math.max(grossProfit - outstandingExpenses - outstandingPayroll, 0)
  const companyReservePct = Number(financialSettings?.company_reserve_pct ?? settingsForm.company_reserve_pct ?? 0)
  const founderPoolPct = Number(financialSettings?.founder_pool_pct ?? settingsForm.founder_pool_pct ?? 0)
  const employeeBonusPct = Number(financialSettings?.employee_bonus_pct ?? settingsForm.employee_bonus_pct ?? 0)

  const businessReserve = Math.max((netProfit * companyReservePct) / 100, 0)
  const founderPool = Math.max((netProfit * founderPoolPct) / 100, 0)
  const employeeBonusPool = Math.max((netProfit * employeeBonusPct) / 100, 0)

  const ownerDrawTotal = useMemo(
    () => ownerDraws.reduce((sum, draw) => sum + safeNumber(draw.amount), 0),
    [ownerDraws],
  )

  const totalFounderDistribution = useMemo(() => {
    const allocations = financialSettings?.founder_allocations ?? settingsForm.founder_allocations ?? {}
    return Object.values(allocations).reduce((sum, value) => sum + safeNumber(value), 0)
  }, [financialSettings, settingsForm.founder_allocations])

  const handleJobSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const selectedProject = projects.find((project) => project.id === jobForm.project_id)
    const materialsCost = safeNumber(jobForm.materials_cost)
    const labourCost = safeNumber(jobForm.labour_cost)
    const additionalExpenses = safeNumber(jobForm.additional_expenses)
    const revenue = safeNumber(jobForm.revenue)

    const totalCost = materialsCost + labourCost + additionalExpenses
    const profit = revenue - totalCost

    const { data, error } = await supabase
      .from('financial_jobs')
      .insert([
        {
          title: jobForm.title,
          client_name: jobForm.client_name,
          project_id: jobForm.project_id || null,
          project_name: selectedProject?.name ?? null,
          materials_cost: materialsCost,
          labour_cost: labourCost,
          additional_expenses: additionalExpenses,
          revenue,
          profit,
          notes: jobForm.notes || null,
          created_by: currentUser?.id ?? null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create job:', error)
      return
    }

    await createAuditLog('financial_jobs', data.id, 'create', currentUser?.id ?? null, currentUser?.name ?? 'Admin', {}, data)

    setJobForm({
      title: '',
      client_name: '',
      project_id: '',
      materials_cost: '',
      labour_cost: '',
      additional_expenses: '',
      revenue: '',
      notes: '',
    })
  }

  const handleExpenseSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const { data, error } = await supabase
      .from('financial_expenses')
      .insert([
        {
          category: expenseForm.category,
          description: expenseForm.description,
          amount: safeNumber(expenseForm.amount),
          vendor: expenseForm.vendor || null,
          status: 'pending',
          approval_step: 1,
          created_by: currentUser?.id ?? null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create expense:', error)
      return
    }

    await createAuditLog('financial_expenses', data.id, 'create', currentUser?.id ?? null, currentUser?.name ?? 'Admin', {}, data)

    setExpenseForm({
      category: 'Fuel',
      description: '',
      amount: '',
      vendor: '',
    })
  }

  const handlePayrollSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const selectedUser = allUsers.find((user) => user.id === payrollForm.user_id)
    const userName = selectedUser?.name || payrollForm.user_name || 'Employee'

    const { data, error } = await supabase
      .from('financial_payroll')
      .insert([
        {
          user_id: payrollForm.user_id || null,
          user_name: userName,
          salary: safeNumber(payrollForm.salary),
          hourly_rate: safeNumber(payrollForm.hourly_rate),
          bonus: safeNumber(payrollForm.bonus),
          status: 'pending',
          approval_step: 1,
          created_by: currentUser?.id ?? null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create payroll record:', error)
      return
    }

    await createAuditLog('financial_payroll', data.id, 'create', currentUser?.id ?? null, currentUser?.name ?? 'Admin', {}, data)

    setPayrollForm({
      user_id: '',
      user_name: '',
      salary: '',
      hourly_rate: '',
      bonus: '',
    })
  }

  const handleOwnerDrawSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const selectedFounder = founderOptions.find((user) => user.id === ownerDrawForm.founder_id)
    const founderName = selectedFounder?.name || ownerDrawForm.founder_name || 'Founder'

    const { data, error } = await supabase
      .from('owner_draws')
      .insert([
        {
          founder_id: ownerDrawForm.founder_id || null,
          founder_name: founderName,
          amount: safeNumber(ownerDrawForm.amount),
          reason: ownerDrawForm.reason,
          date: ownerDrawForm.date || new Date().toISOString().slice(0, 10),
          status: 'pending',
          approval_step: 1,
          created_by: currentUser?.id ?? null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create owner draw:', error)
      return
    }

    await createAuditLog('owner_draws', data.id, 'create', currentUser?.id ?? null, currentUser?.name ?? 'Admin', {}, data)

    setOwnerDrawForm({
      founder_id: '',
      founder_name: '',
      amount: '',
      reason: '',
      date: new Date().toISOString().slice(0, 10),
    })
  }

  const handleSettingsSave = async (event: React.FormEvent) => {
    event.preventDefault()

    const founderAllocations = Object.fromEntries(
      founderOptions.map((user) => [user.id, safeNumber(settingsForm.founder_allocations[user.id] ?? 0)]),
    )

    const { data, error } = await supabase
      .from('financial_settings')
      .upsert(
        {
          id: 'primary',
          company_reserve_pct: safeNumber(settingsForm.company_reserve_pct),
          founder_pool_pct: safeNumber(settingsForm.founder_pool_pct),
          employee_bonus_pct: safeNumber(settingsForm.employee_bonus_pct),
          founder_allocations: founderAllocations,
        },
        { onConflict: 'id' },
      )
      .select()
      .single()

    if (error) {
      console.error('Failed to save financial settings:', error)
      return
    }

    await createAuditLog('financial_settings', data.id, 'update', currentUser?.id ?? null, currentUser?.name ?? 'Admin', {}, data)
  }

  const handleApproval = async (tableName: string, recordId: string, currentStep: number, _status: string, record: Record<string, unknown>) => {
    const nextStep = Math.min(currentStep + 1, 2)
    const updatedStatus = nextStep >= 2 ? 'approved' : 'pending'

    const { error } = await supabase
      .from(tableName)
      .update({
        approval_step: nextStep,
        status: updatedStatus,
        approved_by: currentUser?.id ?? null,
      })
      .eq('id', recordId)

    if (error) {
      console.error('Failed to approve record:', error)
      return
    }

    await createAuditLog(tableName, recordId, 'approve', currentUser?.id ?? null, currentUser?.name ?? 'Admin', record, {
      ...record,
      approval_step: nextStep,
      status: updatedStatus,
      approved_by: currentUser?.id ?? null,
    })
  }

  const summaryCards = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <CircleDollarSign size={18} /> },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: <Wallet size={18} /> },
    { label: 'Gross Profit', value: formatCurrency(grossProfit), icon: <TrendingUp size={18} /> },
    { label: 'Net Profit', value: formatCurrency(netProfit), icon: <BadgeCheck size={18} /> },
    { label: 'Business Reserve', value: formatCurrency(businessReserve), icon: <ShieldCheck size={18} /> },
    { label: 'Founder Pool', value: formatCurrency(founderPool), icon: <Users size={18} /> },
    { label: 'Employee Bonus Pool', value: formatCurrency(employeeBonusPool), icon: <HandCoins size={18} /> },
    { label: 'Outstanding Expenses', value: formatCurrency(outstandingExpenses), icon: <Wallet size={18} /> },
    { label: 'Outstanding Payroll', value: formatCurrency(outstandingPayroll), icon: <Calculator size={18} /> },
  ]

  return (
    <div className="page-shell" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 40px' }}>
      <section className="section hero-panel" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(17,17,17,0.92))' }}>
        <div>
          <span className="eyebrow">Admin access only</span>
          <h1 style={{ marginTop: 10, fontSize: 'clamp(2rem, 3vw, 3rem)' }}>Executive Control Center</h1>
        </div>
        <div className="hero-meta">
          <div>
            <span className="hero-meta-label">Status</span>
            <strong>Live {currentUser.name}</strong>
          </div>
        </div>
      </section>

      <section className="section stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {summaryCards.map((item) => (
          <div key={item.label} className="panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d4af37' }}>{item.icon}<span style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span></div>
            <strong style={{ fontSize: '1.7rem', color: '#fff' }}>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Profit distribution</h2>
          </div>
          <form onSubmit={handleSettingsSave} style={{ display: 'grid', gap: '12px' }}>
            <label>
              <span style={{ display: 'block', color: '#9ca3af', marginBottom: '6px' }}>Company Reserve %</span>
              <input type="number" min="0" step="0.01" value={settingsForm.company_reserve_pct} onChange={(event) => setSettingsForm((previous) => ({ ...previous, company_reserve_pct: Number(event.target.value) }))} style={{ width: '100%', background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
            </label>
            <label>
              <span style={{ display: 'block', color: '#9ca3af', marginBottom: '6px' }}>Founder Pool %</span>
              <input type="number" min="0" step="0.01" value={settingsForm.founder_pool_pct} onChange={(event) => setSettingsForm((previous) => ({ ...previous, founder_pool_pct: Number(event.target.value) }))} style={{ width: '100%', background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
            </label>
            <label>
              <span style={{ display: 'block', color: '#9ca3af', marginBottom: '6px' }}>Employee Bonus %</span>
              <input type="number" min="0" step="0.01" value={settingsForm.employee_bonus_pct} onChange={(event) => setSettingsForm((previous) => ({ ...previous, employee_bonus_pct: Number(event.target.value) }))} style={{ width: '100%', background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
            </label>

            {founderOptions.length > 0 && (
              <div style={{ display: 'grid', gap: '10px' }}>
                <span style={{ color: '#9ca3af', fontWeight: 600 }}>Founder allocations</span>
                {founderOptions.map((user) => (
                  <label key={user.id}>
                    <span style={{ display: 'block', color: '#9ca3af', marginBottom: '6px' }}>{user.name}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settingsForm.founder_allocations[user.id] ?? 0}
                      onChange={(event) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          founder_allocations: {
                            ...previous.founder_allocations,
                            [user.id]: Number(event.target.value),
                          },
                        }))
                      }
                      style={{ width: '100%', background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }}
                    />
                  </label>
                ))}
              </div>
            )}

            <button type="submit" className="primary-button" style={{ background: '#d4af37', color: '#101010', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 700 }}>
              Save profit settings
            </button>
          </form>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Distribution summary</h2>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '12px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}><span>Business Reserve</span><strong>{formatPercent(companyReservePct)}</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}><span>Founder Pool</span><strong>{formatPercent(founderPoolPct)}</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}><span>Employee Bonus</span><strong>{formatPercent(employeeBonusPct)}</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}><span>Calculated Reserve</span><strong>{formatCurrency(businessReserve)}</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '8px' }}><span>Calculated Founder Pool</span><strong>{formatCurrency(founderPool)}</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Calculated Employee Bonus</span><strong>{formatCurrency(employeeBonusPool)}</strong></li>
          </ul>
          {founderOptions.length > 0 && (
            <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>Founder percentages</span>
              {founderOptions.map((user) => {
                const percentage = safeNumber((financialSettings?.founder_allocations ?? settingsForm.founder_allocations ?? {})[user.id])
                return (
                  <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#dcdcdc' }}>
                    <span>{user.name}</span>
                    <strong>{formatPercent(percentage)}</strong>
                  </div>
                )
              })}
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>Total founder allocation</span>
                <strong>{formatPercent(totalFounderDistribution)}</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Job costing</h2>
          </div>
          <form onSubmit={handleJobSubmit} style={{ display: 'grid', gap: '12px' }}>
            <input type="text" placeholder="Job title" value={jobForm.title} onChange={(event) => setJobForm((previous) => ({ ...previous, title: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <input type="text" placeholder="Client name" value={jobForm.client_name} onChange={(event) => setJobForm((previous) => ({ ...previous, client_name: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <select value={jobForm.project_id} onChange={(event) => setJobForm((previous) => ({ ...previous, project_id: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }}>
              <option value="">No project linked</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <input type="number" min="0" step="0.01" placeholder="Materials cost" value={jobForm.materials_cost} onChange={(event) => setJobForm((previous) => ({ ...previous, materials_cost: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
              <input type="number" min="0" step="0.01" placeholder="Labour cost" value={jobForm.labour_cost} onChange={(event) => setJobForm((previous) => ({ ...previous, labour_cost: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
              <input type="number" min="0" step="0.01" placeholder="Additional expenses" value={jobForm.additional_expenses} onChange={(event) => setJobForm((previous) => ({ ...previous, additional_expenses: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
              <input type="number" min="0" step="0.01" placeholder="Revenue" value={jobForm.revenue} onChange={(event) => setJobForm((previous) => ({ ...previous, revenue: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
            </div>
            <textarea placeholder="Notes" value={jobForm.notes} onChange={(event) => setJobForm((previous) => ({ ...previous, notes: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px', minHeight: '90px', resize: 'vertical' }} />
            <button type="submit" className="primary-button" style={{ background: '#d4af37', color: '#101010', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 700 }}>
              Create Job
            </button>
          </form>
          {jobs.length === 0 ? (
            <div className="form-card" style={{ marginTop: 16 }}>
              <p style={{ color: '#a0a0a0', margin: 0 }}>No jobs have been created yet.</p>
            </div>
          ) : (
            <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
              {jobs.map((job) => {
                const totalCost = safeNumber(job.materials_cost) + safeNumber(job.labour_cost) + safeNumber(job.additional_expenses)
                const jobProfit = safeNumber(job.revenue) - totalCost
                return (
                  <div key={job.id} style={{ background: '#141414', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                      <strong>{job.title}</strong>
                      <span style={{ color: jobProfit >= 0 ? '#68d391' : '#fca5a5', fontWeight: 700 }}>{formatCurrency(jobProfit)}</span>
                    </div>
                    <div style={{ color: '#9ca3af', marginTop: 6 }}>
                      <div>{job.client_name}</div>
                      <div>{job.project_name || 'No project linked'}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginTop: '10px', fontSize: '0.86rem', color: '#d4d4d4' }}>
                      <span>Materials: {formatCurrency(safeNumber(job.materials_cost))}</span>
                      <span>Labour: {formatCurrency(safeNumber(job.labour_cost))}</span>
                      <span>Expenses: {formatCurrency(safeNumber(job.additional_expenses))}</span>
                      <span>Revenue: {formatCurrency(safeNumber(job.revenue))}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Expense management</h2>
          </div>
          <form onSubmit={handleExpenseSubmit} style={{ display: 'grid', gap: '12px' }}>
            <select value={expenseForm.category} onChange={(event) => setExpenseForm((previous) => ({ ...previous, category: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }}>
              <option value="Fuel">Fuel</option>
              <option value="Hosting">Hosting</option>
              <option value="Software">Software</option>
              <option value="Marketing">Marketing</option>
              <option value="Equipment">Equipment</option>
              <option value="Travel">Travel</option>
            </select>
            <input type="text" placeholder="Expense description" value={expenseForm.description} onChange={(event) => setExpenseForm((previous) => ({ ...previous, description: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <input type="number" min="0" step="0.01" placeholder="Amount" value={expenseForm.amount} onChange={(event) => setExpenseForm((previous) => ({ ...previous, amount: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <input type="text" placeholder="Vendor" value={expenseForm.vendor} onChange={(event) => setExpenseForm((previous) => ({ ...previous, vendor: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
            <button type="submit" className="primary-button" style={{ background: '#d4af37', color: '#101010', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 700 }}>
              Record expense
            </button>
          </form>
          {expenses.length === 0 ? (
            <div className="form-card" style={{ marginTop: 16 }}>
              <p style={{ color: '#a0a0a0', margin: 0 }}>No financial expenses recorded.</p>
            </div>
          ) : (
            <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
              {expenses.map((expense) => (
                <div key={expense.id} style={{ background: '#141414', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                    <strong>{expense.category}</strong>
                    <span>{expense.status}</span>
                  </div>
                  <div style={{ color: '#dcdcdc', marginTop: 6 }}>{expense.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#9ca3af' }}>
                    <span>{expense.vendor || 'No vendor'}</span>
                    <strong style={{ color: '#fff' }}>{formatCurrency(safeNumber(expense.amount))}</strong>
                  </div>
                  {expense.approval_step < 2 && (
                    <button type="button" onClick={() => handleApproval('financial_expenses', expense.id, expense.approval_step, expense.status, expense as unknown as Record<string, unknown>)} style={{ marginTop: '12px', width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#fff', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                      Approve expense
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Payroll</h2>
          </div>
          <form onSubmit={handlePayrollSubmit} style={{ display: 'grid', gap: '12px' }}>
            <select value={payrollForm.user_id} onChange={(event) => setPayrollForm((previous) => ({ ...previous, user_id: event.target.value, user_name: allUsers.find((user) => user.id === event.target.value)?.name || '' }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required>
              <option value="">Select employee</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <input type="number" min="0" step="0.01" placeholder="Salary" value={payrollForm.salary} onChange={(event) => setPayrollForm((previous) => ({ ...previous, salary: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
              <input type="number" min="0" step="0.01" placeholder="Hourly rate" value={payrollForm.hourly_rate} onChange={(event) => setPayrollForm((previous) => ({ ...previous, hourly_rate: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            </div>
            <input type="number" min="0" step="0.01" placeholder="Bonus" value={payrollForm.bonus} onChange={(event) => setPayrollForm((previous) => ({ ...previous, bonus: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} />
            <button type="submit" className="primary-button" style={{ background: '#d4af37', color: '#101010', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 700 }}>
              Create payroll record
            </button>
          </form>
          {payrollRecords.length === 0 ? (
            <div className="form-card" style={{ marginTop: 16 }}>
              <p style={{ color: '#a0a0a0', margin: 0 }}>No payroll records available.</p>
            </div>
          ) : (
            <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
              {payrollRecords.map((record) => (
                <div key={record.id} style={{ background: '#141414', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <strong>{record.user_name}</strong>
                    <span>{record.status}</span>
                  </div>
                  <div style={{ marginTop: 8, color: '#dcdcdc' }}>
                    <div>Salary: {formatCurrency(safeNumber(record.salary))}</div>
                    <div>Hourly: {formatCurrency(safeNumber(record.hourly_rate))}</div>
                    <div>Bonus: {formatCurrency(safeNumber(record.bonus))}</div>
                  </div>
                  {record.approval_step < 2 && (
                    <button type="button" onClick={() => handleApproval('financial_payroll', record.id, record.approval_step, record.status, record as unknown as Record<string, unknown>)} style={{ marginTop: '12px', width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#fff', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                      Approve payroll
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Owner draws</h2>
          </div>
          <form onSubmit={handleOwnerDrawSubmit} style={{ display: 'grid', gap: '12px' }}>
            <select value={ownerDrawForm.founder_id} onChange={(event) => setOwnerDrawForm((previous) => ({ ...previous, founder_id: event.target.value, founder_name: founderOptions.find((user) => user.id === event.target.value)?.name || '' }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required>
              <option value="">Select founder</option>
              {founderOptions.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <input type="number" min="0" step="0.01" placeholder="Amount" value={ownerDrawForm.amount} onChange={(event) => setOwnerDrawForm((previous) => ({ ...previous, amount: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <input type="text" placeholder="Reason" value={ownerDrawForm.reason} onChange={(event) => setOwnerDrawForm((previous) => ({ ...previous, reason: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <input type="date" value={ownerDrawForm.date} onChange={(event) => setOwnerDrawForm((previous) => ({ ...previous, date: event.target.value }))} style={{ background: '#141414', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px' }} required />
            <button type="submit" className="primary-button" style={{ background: '#d4af37', color: '#101010', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 700 }}>
              Record owner draw
            </button>
          </form>
          {ownerDraws.length === 0 ? (
            <div className="form-card" style={{ marginTop: 16 }}>
              <p style={{ color: '#a0a0a0', margin: 0 }}>No owner draws recorded.</p>
            </div>
          ) : (
            <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
              {ownerDraws.map((draw) => (
                <div key={draw.id} style={{ background: '#141414', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <strong>{draw.founder_name}</strong>
                    <span>{draw.status}</span>
                  </div>
                  <div style={{ marginTop: 8, color: '#dcdcdc' }}>
                    <div>{draw.reason}</div>
                    <div>{draw.date}</div>
                    <div style={{ marginTop: 6, color: '#fff', fontWeight: 700 }}>{formatCurrency(safeNumber(draw.amount))}</div>
                  </div>
                  {draw.approval_step < 2 && (
                    <button type="button" onClick={() => handleApproval('owner_draws', draw.id, draw.approval_step, draw.status, draw as unknown as Record<string, unknown>)} style={{ marginTop: '12px', width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#fff', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                      Approve owner draw
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Audit log</h2>
          </div>
          {auditLogs.length === 0 ? (
            <div className="form-card">
              <p style={{ color: '#a0a0a0', margin: 0 }}>No financial audit log entries.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {auditLogs.map((log) => (
                <div key={log.id} style={{ background: '#141414', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                    <strong>{log.action}</strong>
                    <span style={{ color: '#9ca3af' }}>{log.table_name}</span>
                  </div>
                  <div style={{ color: '#dcdcdc' }}>
                    <div>Actor: {log.actor_name || 'System'}</div>
                    <div>Changed: {new Date(log.created_at).toLocaleString()}</div>
                    <div>Old value: {JSON.stringify(log.old_value ?? {})}</div>
                    <div>New value: {JSON.stringify(log.new_value ?? {})}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-header">
            <h2 className="panel-title">Approval center</h2>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#141414', border: '1px solid #2d2d2d', padding: '12px 14px', borderRadius: '10px' }}>
              <span>Pending approvals</span>
              <strong>{expenses.filter((expense) => expense.approval_step < 2).length + payrollRecords.filter((record) => record.approval_step < 2).length + ownerDraws.filter((draw) => draw.approval_step < 2).length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#141414', border: '1px solid #2d2d2d', padding: '12px 14px', borderRadius: '10px' }}>
              <span>Approved</span>
              <strong>{expenses.filter((expense) => expense.approval_step >= 2).length + payrollRecords.filter((record) => record.approval_step >= 2).length + ownerDraws.filter((draw) => draw.approval_step >= 2).length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#141414', border: '1px solid #2d2d2d', padding: '12px 14px', borderRadius: '10px' }}>
              <span>Owner draws total</span>
              <strong>{formatCurrency(ownerDrawTotal)}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
