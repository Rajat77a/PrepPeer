-- PrepPeer Supabase security advisor fixes for public.get_leaderboard.
-- Run this after adding SUPABASE_SERVICE_ROLE_KEY to Vercel and local .env.local.

alter function public.get_leaderboard(text, text)
  set search_path = public, pg_temp;

revoke execute on function public.get_leaderboard(text, text)
  from public, anon, authenticated;

grant execute on function public.get_leaderboard(text, text)
  to service_role;

-- Interview results are calculated and verified by the Next.js server.
-- Authenticated browser clients may read their permitted rows through RLS,
-- but they must not be able to forge scores by writing to the table directly.
revoke insert, update, delete, truncate
  on table public.interview_sessions
  from public, anon, authenticated;

grant select
  on table public.interview_sessions
  to authenticated;

grant select, insert, update, delete
  on table public.interview_sessions
  to service_role;
