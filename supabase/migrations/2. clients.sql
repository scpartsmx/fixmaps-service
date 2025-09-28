
-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto" with schema public;

-- Tabela de clientes
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  endereco text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: somente usuários autenticados podem acessar
alter table public.clients enable row level security;

-- Políticas
create policy "Authenticated users can view clients"
  on public.clients
  for select
  using (auth.uid() is not null);

create policy "Authenticated users can insert clients"
  on public.clients
  for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update clients"
  on public.clients
  for update
  using (auth.uid() is not null);

create policy "Authenticated users can delete clients"
  on public.clients
  for delete
  using (auth.uid() is not null);

-- Trigger para manter updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clients_set_updated_at on public.clients;

create trigger trg_clients_set_updated_at
before update on public.clients
for each row
execute procedure public.set_updated_at();
