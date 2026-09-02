create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  number text not null unique,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted')),
  total numeric(12,2) not null default 0,
  issue_date date,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  number text not null unique,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
  total numeric(12,2) not null default 0,
  due_date date,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes enable row level security;
alter table public.invoices enable row level security;

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create policy "Authenticated users can read quotes" on public.quotes for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert quotes" on public.quotes for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update quotes" on public.quotes for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete quotes" on public.quotes for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read invoices" on public.invoices for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert invoices" on public.invoices for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update invoices" on public.invoices for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete invoices" on public.invoices for delete using (auth.role() = 'authenticated');

create index if not exists idx_quotes_customer_id on public.quotes(customer_id);
create index if not exists idx_quotes_status on public.quotes(status);
create index if not exists idx_invoices_customer_id on public.invoices(customer_id);
create index if not exists idx_invoices_status on public.invoices(status);
