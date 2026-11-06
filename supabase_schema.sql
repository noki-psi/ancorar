-- ==============================================================================
-- Schema do Supabase para o Projeto: Ancorar - Espaço de Pausa e Respiração
-- Projeto de Extensão I • Teorias Comportamentalistas • UNI-RN
-- ==============================================================================

-- 1. Criação da tabela de sessões
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  anonymous_user_id text not null,
  pre_tension integer not null check (pre_tension between 1 and 5),
  post_tension integer not null check (post_tension between 1 and 5),
  tension_delta integer generated always as (pre_tension - post_tension) stored,
  duration_seconds integer default 120,
  breathing_pattern text default '326',
  target_duration_seconds integer default 120,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migração segura para adicionar colunas em instâncias já existentes
alter table public.sessions add column if not exists breathing_pattern text default '326';
alter table public.sessions add column if not exists target_duration_seconds integer default 120;

-- 2. Habilitação de RLS (Row Level Security)
alter table public.sessions enable row level security;

-- 3. Políticas de acesso seguro para inserção e consulta anônima da extensão
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

-- 4. Índice para agilizar relatórios analíticos e ordenação por data
create index if not exists idx_sessions_created_at on public.sessions (created_at desc);
create index if not exists idx_sessions_user on public.sessions (anonymous_user_id);
