-- PrepPeer Supabase repair script.
-- Safe to run after a project SQL mix-up: it creates missing PrepPeer objects
-- and reapplies RLS/RPC without dropping existing data.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text,
  experience text,
  company_type text,
  composite_score numeric,
  dimensions jsonb not null default '[]'::jsonb,
  question_scores jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.interview_sessions
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists role text,
  add column if not exists experience text,
  add column if not exists company_type text,
  add column if not exists composite_score numeric,
  add column if not exists dimensions jsonb not null default '[]'::jsonb,
  add column if not exists question_scores jsonb not null default '[]'::jsonb,
  add column if not exists summary jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

create index if not exists interview_sessions_user_created_idx
  on public.interview_sessions(user_id, created_at desc);

create index if not exists interview_sessions_summary_gin_idx
  on public.interview_sessions using gin (summary);

create or replace function public.get_leaderboard(
  p_role text default null,
  p_company_type text default null
)
returns table (
  rank bigint,
  user_id uuid,
  name text,
  college text,
  role text,
  company_type text,
  score numeric,
  sessions bigint,
  previous_rank bigint,
  rank_delta bigint,
  previous_score numeric
)
language sql
security definer
set search_path = public, auth, pg_temp
as $$
  with session_history as (
    select
      s.user_id,
      s.role as session_role,
      s.company_type as session_company_type,
      s.composite_score::numeric as session_score,
      s.created_at,
      row_number() over (
        partition by s.user_id
        order by s.created_at desc, s.id desc
      ) as session_number,
      count(*) over (partition by s.user_id) as session_count
    from public.interview_sessions s
  ),
  user_scores as (
    select
      h.user_id,
      max(h.session_role) filter (where h.session_number = 1) as latest_role,
      max(h.session_company_type)
        filter (where h.session_number = 1) as latest_company_type,
      round(
        avg(h.session_score) filter (where h.session_number <= 5),
        1
      ) as current_score,
      round(
        avg(h.session_score)
          filter (where h.session_number between 2 and 6),
        1
      ) as prior_score,
      max(h.session_count)::bigint as session_count
    from session_history h
    group by h.user_id
  ),
  safe_profiles as (
    select
      u.id as user_id,
      coalesce(
        nullif(trim(p.full_name), ''),
        nullif(trim(u.raw_app_meta_data -> 'preppeer_profile' ->> 'fullName'), ''),
        nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
        split_part(u.email, '@', 1),
        'PrepPeer user'
      ) as display_name,
      coalesce(
        nullif(trim(u.raw_app_meta_data -> 'preppeer_profile' ->> 'college'), ''),
        nullif(trim(u.raw_user_meta_data ->> 'college'), '')
      ) as display_college,
      coalesce(
        nullif(trim(u.raw_app_meta_data -> 'preppeer_profile' ->> 'role'), ''),
        nullif(trim(u.raw_user_meta_data ->> 'target_role'), ''),
        scores.latest_role,
        'Interview'
      ) as display_role,
      coalesce(
        nullif(trim(u.raw_app_meta_data -> 'preppeer_profile' ->> 'company'), ''),
        nullif(trim(u.raw_user_meta_data ->> 'target_company_type'), ''),
        scores.latest_company_type,
        'General'
      ) as display_company_type,
      coalesce(scores.current_score, 0::numeric) as current_score,
      scores.prior_score,
      coalesce(scores.session_count, 0::bigint) as session_count
    from auth.users u
    left join user_scores scores on scores.user_id = u.id
    left join public.profiles p on p.id = u.id
    where
      u.deleted_at is null
      and (
        p.id is not null
        or lower(
          coalesce(
            u.raw_app_meta_data -> 'preppeer_profile' ->> 'onboardingComplete',
            ''
          )
        ) = 'true'
        or lower(
          coalesce(u.raw_user_meta_data ->> 'onboarding_complete', '')
        ) = 'true'
      )
  ),
  filtered as (
    select *
    from safe_profiles
    where
      (p_role is null or display_role = p_role)
      and
      (p_company_type is null or display_company_type = p_company_type)
  ),
  current_board as (
    select
      f.*,
      rank() over (
        order by f.current_score desc, f.session_count desc, f.user_id
      ) as current_rank
    from filtered f
  ),
  previous_board as (
    select
      f.user_id,
      rank() over (
        order by coalesce(f.prior_score, f.current_score) desc,
          greatest(f.session_count - 1, 1) desc,
          f.user_id
      ) as prior_rank
    from filtered f
  )
  select
    current.current_rank as rank,
    current.user_id,
    current.display_name as name,
    current.display_college as college,
    current.display_role as role,
    current.display_company_type as company_type,
    current.current_score as score,
    current.session_count as sessions,
    previous.prior_rank as previous_rank,
    previous.prior_rank - current.current_rank as rank_delta,
    current.prior_score as previous_score
  from current_board current
  join previous_board previous using (user_id)
  order by current.current_rank, current.user_id;
$$;

revoke all on function public.get_leaderboard(text, text)
  from public, anon;

grant execute on function public.get_leaderboard(text, text)
  to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;

drop policy if exists "Users can view own profile"
  on public.profiles;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile"
  on public.profiles;

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile"
  on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can view own interview sessions"
  on public.interview_sessions;

create policy "Users can view own interview sessions"
on public.interview_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own interview sessions"
  on public.interview_sessions;

drop policy if exists "Users can update own interview sessions"
  on public.interview_sessions;

revoke insert, update, delete, truncate
  on table public.interview_sessions
  from public, anon, authenticated;

grant select
  on table public.interview_sessions
  to authenticated;

grant all
  on table public.interview_sessions
  to service_role;

grant select, insert, update
  on table public.profiles
  to authenticated;

grant all
  on table public.profiles
  to service_role;
