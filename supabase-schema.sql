-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional - disabled for demo simplicity)
-- alter table todos enable row level security;
-- create policy "Allow all" on todos for all using (true);
