-- PrepPeer Supabase security advisor fixes for public.get_leaderboard.
-- Run this after adding SUPABASE_SERVICE_ROLE_KEY to Vercel and local .env.local.

alter function public.get_leaderboard(text, text)
  set search_path = public, pg_temp;

revoke execute on function public.get_leaderboard(text, text)
  from public, anon, authenticated;

grant execute on function public.get_leaderboard(text, text)
  to service_role;
