create table if not exists public.financial_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text not null,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  materials_cost numeric(12,2) not null default 0,
  labour_cost numeric(12,2) not null default 0,
  additional_expenses numeric(12,2) not null default 0,
  revenue numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 0,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Fuel', 'Hosting', 'Software', 'Marketing', 'Equipment', 'Travel')),
  description text not null,
  amount numeric(12,2) not null default 0,
  vendor text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approval_step integer not null default 1 check (approval_step between 1 and 2),
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_payroll (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null,
  salary numeric(12,2) not null default 0,
  hourly_rate numeric(12,2) not null default 0,
  bonus numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'paid')),
  approval_step integer not null default 1 check (approval_step between 1 and 2),
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner_draws (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid references public.profiles(id) on delete set null,
  founder_name text not null,
  amount numeric(12,2) not null default 0,
  reason text not null,
  date date not null default current_date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approval_step integer not null default 1 check (approval_step between 1 and 2),
  approved_by uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_settings (
  id text primary key default 'primary',
  company_reserve_pct numeric(5,2) not null default 0,
  founder_pool_pct numeric(5,2) not null default 0,
  employee_bonus_pct numeric(5,2) not null default 0,
  founder_allocations jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  old_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger financial_jobs_set_updated_at
before update on public.financial_jobs
for each row execute function public.set_updated_at();

create trigger financial_expenses_set_updated_at
before update on public.financial_expenses
for each row execute function public.set_updated_at();

create trigger financial_payroll_set_updated_at
before update on public.financial_payroll
for each row execute function public.set_updated_at();

create trigger owner_draws_set_updated_at
before update on public.owner_draws
for each row execute function public.set_updated_at();

create trigger financial_settings_set_updated_at
before update on public.financial_settings
for each row execute function public.set_updated_at();

alter table public.financial_jobs enable row level security;
alter table public.financial_expenses enable row level security;
alter table public.financial_payroll enable row level security;
alter table public.owner_draws enable row level security;
alter table public.financial_settings enable row level security;
alter table public.financial_audit_logs enable row level security;

create policy "Admins can manage financial jobs" on public.financial_jobs
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can manage financial expenses" on public.financial_expenses
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can manage payroll" on public.financial_payroll
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can manage owner draws" on public.owner_draws
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can manage financial settings" on public.financial_settings
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can read audit logs" on public.financial_audit_logs
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can insert audit logs" on public.financial_audit_logs
for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can access profiles" on public.profiles
for select
using (
  auth.role() = 'authenticated'
);

create policy "Admins can update profile roles" on public.profiles
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);
