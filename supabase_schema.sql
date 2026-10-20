-- Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. APP_USER (Synced with Supabase Auth)
-- ==========================================
create table if not exists public.app_user (
    id          uuid primary key references auth.users(id) on delete cascade,
    name        varchar(100) not null,
    email       varchar(254) not null unique,
    avatar_url  text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ==========================================
-- 2. ROLES & DEPARTMENTS
-- ==========================================
create table if not exists public.role (
    id    bigint generated always as identity primary key,
    name  varchar(50) not null unique -- 'student', 'authority', 'admin'
);

insert into public.role (name) values ('student'), ('authority'), ('admin')
on conflict (name) do nothing;

create table if not exists public.department (
    id           bigint generated always as identity primary key,
    name         varchar(100) not null unique,
    description  text
);

create table if not exists public.category (
    id             bigint generated always as identity primary key,
    department_id  bigint references public.department(id) on delete cascade,
    name           varchar(100) not null,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now(),
    unique (department_id, name)
);

-- ==========================================
-- 3. TICKETS (Extended to match React App)
-- ==========================================
create table if not exists public.ticket (
    id                  bigint generated always as identity primary key,
    ticket_code         text generated always as ('TKT-' || id::text) stored,
    user_id             uuid not null references public.app_user(id) on delete cascade,
    department_id       bigint not null references public.department(id),
    category_id         bigint references public.category(id),
    specific_issue      varchar(150),
    title               varchar(200) not null,
    description         text not null,
    building            varchar(100),
    exact_location      varchar(200) not null,
    image_url           text,
    
    -- Status & SLA
    status              varchar(30) not null default 'Not Started' 
                        check (status in ('Not Started', 'Seen', 'In Progress', 'Solved')),
    status_color        varchar(20) not null default 'rose' 
                        check (status_color in ('emerald', 'blue', 'amber', 'rose')),
    sla_due_at          timestamptz,
    resolved_at         timestamptz,
    is_confidential     boolean not null default false,
    
    -- Escalation Hierarchy (Levels 1 to 4)
    current_level       integer not null default 1 check (current_level between 1 and 4),
    assigned_authority  varchar(100),
    is_escalated        boolean not null default false,
    escalated_from      text,
    escalation_reason   text,
    
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- Index for feed filtering and search performance
create index if not exists idx_ticket_department on public.ticket(department_id);
create index if not exists idx_ticket_status on public.ticket(status);

-- ==========================================
-- 4. UPVOTES (With Auto-Count Trigger)
-- ==========================================
create table if not exists public.upvote (
    id          bigint generated always as identity primary key,
    user_id     uuid not null references public.app_user(id) on delete cascade,
    ticket_id   bigint not null references public.ticket(id) on delete cascade,
    created_at  timestamptz not null default now(),
    unique (user_id, ticket_id)
);

-- ==========================================
-- 5. ATTACHMENTS (Storage Metadata)
-- ==========================================
create table if not exists public.attachment (
    id         bigint generated always as identity primary key,
    ticket_id  bigint not null references public.ticket(id) on delete cascade,
    name       varchar(255) not null,
    mime_type  varchar(127) not null,
    url        text not null,
    created_at timestamptz not null default now()
);

-- ==========================================
-- 6. TICKET UPDATES / COMMENTS
-- ==========================================
create table if not exists public.ticket_update (
    id          bigint generated always as identity primary key,
    ticket_id   bigint not null references public.ticket(id) on delete cascade,
    user_id     uuid references public.app_user(id) on delete set null,
    author_name varchar(100) not null,
    content     text not null,
    update_type varchar(30) not null default 'comment' 
                check (update_type in ('comment', 'acknowledgement', 'official_update', 'escalation', 'resolution')),
    old_status  varchar(30) check (old_status is null or old_status in ('Not Started', 'Seen', 'In Progress', 'Solved')),
    new_status  varchar(30) check (new_status is null or new_status in ('Not Started', 'Seen', 'In Progress', 'Solved')),
    created_at  timestamptz not null default now()
);

-- ==========================================
-- 7. USER MAPS (User Roles & Departments)
-- ==========================================
create table if not exists public.user_role (
    user_id  uuid not null references public.app_user(id) on delete cascade,
    role_id  bigint not null references public.role(id) on delete cascade,
    primary key (user_id, role_id)
);

create table if not exists public.user_department (
    user_id        uuid not null references public.app_user(id) on delete cascade,
    department_id  bigint not null references public.department(id) on delete cascade,
    primary key (user_id, department_id)
);

-- ==========================================
-- 8. AUTOMATIC AUTH USER SYNC TRIGGER
-- ==========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.app_user (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.app_user enable row level security;
alter table public.ticket enable row level security;
alter table public.upvote enable row level security;
alter table public.ticket_update enable row level security;

-- Public/Authenticated read for non-confidential tickets
create policy "Allow public read of non-confidential tickets"
  on public.ticket for select
  using (is_confidential = false or auth.uid() = user_id);

-- Authenticated users can submit tickets
create policy "Authenticated users can create tickets"
  on public.ticket for insert
  with check (auth.uid() = user_id);

-- Authenticated users can upvote
create policy "Users can view upvotes" on public.upvote for select using (true);
create policy "Users can insert upvotes" on public.upvote for insert with check (auth.uid() = user_id);
create policy "Users can delete own upvotes" on public.upvote for delete using (auth.uid() = user_id);

-- Ticket updates policy
create policy "Anyone can read ticket comments" on public.ticket_update for select using (true);
create policy "Authenticated can post comments" on public.ticket_update for insert with check (auth.role() = 'authenticated');