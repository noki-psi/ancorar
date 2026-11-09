-- ==============================================================================
-- Schema do Supabase para o Projeto: Ancorar - Pausa, Respiração e Reconexão
-- Projeto de Extensão • Painel Global • UNI-RN
-- ==============================================================================

-- 1. Criação da tabela de sessões com escala de 0 a 10 e respostas opcionais (nullable)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  anonymous_user_id text not null,
  pre_tension integer check (pre_tension is null or (pre_tension between 0 and 10)),
  post_tension integer check (post_tension is null or (post_tension between 0 and 10)),
  tension_delta integer generated always as (pre_tension - post_tension) stored,
  duration_seconds integer default 120,
  breathing_pattern text default '326',
  target_duration_seconds integer default 120,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Migração segura para instâncias existentes (permite valores nulos e escala 0 a 10):
alter table public.sessions alter column pre_tension drop not null;
alter table public.sessions alter column post_tension drop not null;
alter table public.sessions drop constraint if exists sessions_pre_tension_check;
alter table public.sessions drop constraint if exists sessions_post_tension_check;
alter table public.sessions add constraint sessions_pre_tension_check check (pre_tension is null or (pre_tension between 0 and 10));
alter table public.sessions add constraint sessions_post_tension_check check (post_tension is null or (post_tension between 0 and 10));
alter table public.sessions add column if not exists breathing_pattern text default '326';
alter table public.sessions add column if not exists target_duration_seconds integer default 120;

-- 3. Habilitação de RLS (Row Level Security)
alter table public.sessions enable row level security;

-- 4. Políticas de acesso seguro para inserção e consulta anônima
drop policy if exists "Allow anonymous insert" on public.sessions;
create policy "Allow anonymous insert" 
  on public.sessions 
  for insert 
  to anon, authenticated 
  with check (true);

drop policy if exists "Allow anonymous select" on public.sessions;
create policy "Allow anonymous select" 
  on public.sessions 
  for select 
  to anon, authenticated 
  using (true);

-- 5. Índices para ordenação e relatórios
create index if not exists idx_sessions_created_at on public.sessions (created_at desc);
create index if not exists idx_sessions_user on public.sessions (anonymous_user_id);
