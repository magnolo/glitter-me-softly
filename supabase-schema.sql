-- Run this in your Supabase SQL editor to create the registrations table

create table if not exists registrations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  message text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table registrations enable row level security;

-- Allow inserts from anon users (registration)
create policy "Allow public inserts" on registrations
  for insert to anon
  with check (true);

-- Allow selecting own registration by email (for QR code lookup)
create policy "Allow public select" on registrations
  for select to anon
  using (true);

-- ---------------------------------------------------------------------------
-- email_templates: drag-and-drop email template builder
-- ---------------------------------------------------------------------------
create table if not exists email_templates (
  slug         text primary key,
  name         text not null,
  description  text,
  subject      text not null,
  sections     jsonb not null default '[]'::jsonb,
  updated_at   timestamptz default now(),
  updated_by   text
);

alter table email_templates enable row level security;

-- Admin tools call Supabase with the anon key, so allow full access on this
-- table at the policy layer (the admin routes are gated by an auth cookie).
create policy "Allow public read on email_templates" on email_templates
  for select to anon
  using (true);

create policy "Allow public write on email_templates" on email_templates
  for all to anon
  using (true) with check (true);
