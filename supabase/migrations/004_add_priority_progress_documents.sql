-- Add priority field to projects
alter table if exists public.projects
add column if not exists priority text default 'Medium' check (priority in ('High', 'Medium', 'Low'));

-- Add date fields to projects
alter table if exists public.projects
add column if not exists start_date date,
add column if not exists due_date date;

-- Add assigned users field to projects (as jsonb array)
alter table if exists public.projects
add column if not exists assigned_users jsonb default '[]'::jsonb;

-- Add priority field to tasks
alter table if exists public.tasks
add column if not exists priority text default 'Medium' check (priority in ('High', 'Medium', 'Low'));

-- Add due_date to tasks
alter table if exists public.tasks
add column if not exists due_date date;

-- Add project_id to tasks for better tracking
alter table if exists public.tasks
add column if not exists project_id uuid references public.projects(id) on delete set null;

-- Create documents table
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  filename text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better query performance
create index if not exists idx_projects_priority on public.projects(priority);
create index if not exists idx_projects_due_date on public.projects(due_date);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_documents_project_id on public.documents(project_id);

-- Enable RLS on documents table
alter table public.documents enable row level security;

-- Create RLS policies for documents
create policy "Anyone can read documents" on public.documents for select using (true);
create policy "Authenticated users can upload documents" on public.documents for insert with check (auth.role() = 'authenticated');

-- Create trigger for documents updated_at
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- Add trigger for tasks updated_at if it doesn't exist
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();
