create extension if not exists "uuid-ossp";

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  assignee text not null default 'Unassigned',
  assignee_id uuid references public.profiles(id) on delete set null,
  done boolean not null default false,
  overdue boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  icon text not null default '📁',
  name text not null,
  description text default '',
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text not null unique,
  quantity integer not null default 0,
  price numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text not null,
  email text not null,
  phone text default 'Not provided',
  status text not null default 'Active' check (status in ('Active', 'VIP', 'Inactive')),
  total_spent numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business text not null,
  role text not null default 'Partner',
  contact text not null default 'No contact provided',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  status text not null default 'Planned' check (status in ('Planned', 'In progress', 'Complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger partners_set_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

create trigger strategies_set_updated_at
before update on public.strategies
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.projects enable row level security;
alter table public.inventory_items enable row level security;
alter table public.customers enable row level security;
alter table public.partners enable row level security;
alter table public.strategies enable row level security;

create policy "Authenticated users can read all business data" on public.tasks for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert tasks" on public.tasks for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update tasks" on public.tasks for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete tasks" on public.tasks for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read all projects" on public.projects for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert projects" on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update projects" on public.projects for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete projects" on public.projects for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read inventory" on public.inventory_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert inventory" on public.inventory_items for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update inventory" on public.inventory_items for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete inventory" on public.inventory_items for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read customers" on public.customers for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert customers" on public.customers for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update customers" on public.customers for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete customers" on public.customers for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read partners" on public.partners for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert partners" on public.partners for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update partners" on public.partners for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete partners" on public.partners for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read strategies" on public.strategies for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert strategies" on public.strategies for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update strategies" on public.strategies for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete strategies" on public.strategies for delete using (auth.role() = 'authenticated');
