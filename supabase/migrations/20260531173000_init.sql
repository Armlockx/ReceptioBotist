create extension if not exists "pgcrypto";
create extension if not exists "vector";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'niche_type') then
    create type niche_type as enum ('hamburgueria', 'hotel', 'pet_shop', 'agro_parts', 'services');
  end if;
end $$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  niche_type niche_type not null,
  tenant_key text not null unique default encode(gen_random_bytes(16), 'hex'),
  config jsonb not null default '{}'::jsonb,
  groq_api_key_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.niche_templates (
  id uuid primary key default gen_random_uuid(),
  niche_type niche_type not null unique,
  display_name text not null,
  system_prompt text not null,
  default_tone text not null,
  categories text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category text not null,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists knowledge_items_tenant_idx on public.knowledge_items (tenant_id, category);
create unique index if not exists knowledge_items_tenant_title_idx on public.knowledge_items (tenant_id, title);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  session_id uuid not null,
  status text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, session_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  tokens_in int,
  tokens_out int,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  model text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  total_tokens int not null default 0,
  latency_ms int not null default 0,
  status text not null default 'ok',
  error text,
  cost_estimated numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_requests_tenant_created_idx on public.ai_requests (tenant_id, created_at desc);

create table if not exists public.usage_daily (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  usage_date date not null,
  requests_count int not null default 0,
  total_tokens int not null default 0,
  avg_latency_ms int not null default 0,
  cost_estimated numeric(12, 6) not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, usage_date)
);

alter table public.tenants enable row level security;
alter table public.niche_templates enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ai_requests enable row level security;
alter table public.usage_daily enable row level security;

create policy "service role full access tenants"
on public.tenants
for all
to service_role
using (true)
with check (true);

create policy "service role full access niche templates"
on public.niche_templates
for all
to service_role
using (true)
with check (true);

create policy "service role full access knowledge"
on public.knowledge_items
for all
to service_role
using (true)
with check (true);

create policy "service role full access conversations"
on public.conversations
for all
to service_role
using (true)
with check (true);

create policy "service role full access messages"
on public.messages
for all
to service_role
using (true)
with check (true);

create policy "service role full access ai requests"
on public.ai_requests
for all
to service_role
using (true)
with check (true);

create policy "service role full access usage"
on public.usage_daily
for all
to service_role
using (true)
with check (true);
