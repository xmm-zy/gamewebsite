-- First version: account system schema and policies
-- Run in Supabase SQL editor.

-- 1) profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Keep updated_at fresh
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();  

-- 2) todos table (if not exists; compatible with your current frontend)
create table if not exists public.todos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null default '',
  user_name text not null default '',
  content text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_todos_updated_at on public.todos;
create trigger trg_todos_updated_at
before update on public.todos
for each row
execute function public.handle_updated_at();

-- 3) RLS
alter table public.profiles enable row level security;
alter table public.todos enable row level security;

-- profiles: everyone can read; only owner can insert/update own row
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- todos: authenticated read all; only owner can insert/update/delete own todos
drop policy if exists "todos_read_all_auth" on public.todos;
create policy "todos_read_all_auth"
on public.todos
for select
to authenticated
using (true);

drop policy if exists "todos_insert_own" on public.todos;
create policy "todos_insert_own"
on public.todos
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "todos_update_own" on public.todos;
create policy "todos_update_own"
on public.todos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "todos_delete_own" on public.todos;
create policy "todos_delete_own"
on public.todos
for delete
to authenticated
using (auth.uid() = user_id);

-- 4) Realtime for todos (idempotent)
do $$
begin
  alter publication supabase_realtime add table public.todos;
exception
  when duplicate_object then
    -- table is already in publication, safe to ignore
    null;
end
$$;
