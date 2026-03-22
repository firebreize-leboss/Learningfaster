-- LearningFaster MVP schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.pdf_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('course', 'level')),
  course_name text,
  difficulty_level int check (difficulty_level between 1 and 5),
  status text not null check (status in ('generated', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.summary_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  topic text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.pdf_documents enable row level security;
alter table public.exercise_sessions enable row level security;
alter table public.summary_sheets enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "pdf_own_all"
  on public.pdf_documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "exercise_own_all"
  on public.exercise_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "summary_own_all"
  on public.summary_sheets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
