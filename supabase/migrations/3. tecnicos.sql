
-- Extensão para UUIDs (idempotente)
create extension if not exists "pgcrypto" with schema public;

-- Tabela de técnicos
create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especialidade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilita RLS
alter table public.technicians enable row level security;

-- Políticas: somente usuários autenticados podem acessar
create policy "Authenticated users can view technicians"
  on public.technicians
  for select
  using (auth.uid() is not null);

create policy "Authenticated users can insert technicians"
  on public.technicians
  for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update technicians"
  on public.technicians
  for update
  using (auth.uid() is not null);

create policy "Authenticated users can delete technicians"
  on public.technicians
  for delete
  using (auth.uid() is not null);

-- Trigger para manter updated_at (reutiliza a função pública existente)
drop trigger if exists trg_technicians_set_updated_at on public.technicians;

create trigger trg_technicians_set_updated_at
before update on public.technicians
for each row
execute procedure public.set_updated_at();
