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
