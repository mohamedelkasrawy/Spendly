-- Run this in your Supabase SQL Editor

-- Budgets table
create table if not exists budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,           -- format: 'yyyy-MM'
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  created_at timestamptz default now(),
  unique(user_id, month)
);

-- Expenses table
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,           -- format: 'yyyy-MM'
  name text not null,
  amount numeric(12, 2) not null,
  category text not null default '💰',
  created_at timestamptz default now()
);

-- Row Level Security (users only see their own data)
alter table budgets enable row level security;
alter table expenses enable row level security;

create policy "Users can manage their own budgets"
  on budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own expenses"
  on expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
