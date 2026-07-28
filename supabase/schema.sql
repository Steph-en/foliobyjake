-- foliobyjake.com — persistence schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null
);

create table if not exists projects (
  id bigint primary key,
  name text not null,
  slug text not null,
  category text not null default 'Graphic Design',
  description text not null default '',
  long_description text not null default '',
  client text,
  year text,
  role text,
  preview_image text,
  preview_video text,
  hero_image text,
  hero_video text,
  gallery text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archive')),
  is_featured boolean not null default false,
  views integer not null default 0,
  seo_title text,
  seo_description text,
  seo_keywords text,
  seo_og_image text,
  sections jsonb not null default '[]',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id text primary key,
  url text not null,
  name text not null,
  type text not null check (type in ('image', 'video')),
  size text,
  created_at timestamptz not null default now()
);

-- Single-row key/value table for small counters (contact form submissions, etc.)
create table if not exists app_settings (
  key text primary key,
  value jsonb not null
);

insert into app_settings (key, value)
values ('contacts_count', '14')
on conflict (key) do nothing;

create index if not exists projects_status_idx on projects (status);
create index if not exists projects_sort_order_idx on projects (sort_order);

-- Row Level Security: the Express server is the only thing that ever talks to Supabase,
-- and it authenticates with the service role key (which bypasses RLS entirely). Enabling
-- RLS with no public policies means the anon/public key — if it ever leaked — could not
-- read or write anything.
alter table categories enable row level security;
alter table projects enable row level security;
alter table media enable row level security;
alter table app_settings enable row level security;
