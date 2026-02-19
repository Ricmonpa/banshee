-- Ejecutar en el SQL Editor de Supabase para habilitar el CANDADO 1 (captura de leads)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  created_at timestamptz default now()
);

-- Opcional: habilitar RLS y política para que el backend pueda insertar
alter table public.leads enable row level security;

create policy "Allow anonymous insert for leads"
  on public.leads for insert
  to anon
  with check (true);

-- Solo usuarios autenticados (o service_role) pueden leer
create policy "Allow authenticated read"
  on public.leads for select
  to authenticated
  using (true);
