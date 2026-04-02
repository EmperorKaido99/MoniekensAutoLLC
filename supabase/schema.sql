-- ============================================================
-- Dad's Auto Group — Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ── quotes ───────────────────────────────────────────────────
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  quote_type      text not null check (quote_type in ('export','container','towing')),
  quote_number    text not null,
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  status          text not null default 'draft' check (status in ('draft','sent','paid')),
  line_items      jsonb not null default '[]',
  subtotal        numeric not null default 0,
  total           numeric not null default 0,
  notes           text,
  pdf_url         text,
  qr_code_data    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.quotes enable row level security;

create policy "Users manage own quotes"
  on public.quotes for all
  using (auth.uid() = user_id);

-- ── documents ────────────────────────────────────────────────
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  customer_name   text not null,
  car_make        text,
  car_model       text,
  car_year        integer,
  car_price       numeric,
  document_type   text not null check (document_type in ('deed_of_sale','invoice','quote','other')),
  file_path       text not null,
  file_name       text not null,
  qr_code_data    text,
  notes           text,
  uploaded_at     timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Users manage own documents"
  on public.documents for all
  using (auth.uid() = user_id);

-- ── rate_settings ─────────────────────────────────────────────
create table if not exists public.rate_settings (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users not null unique,
  amg_surcharge           numeric not null default 2500,
  suv_surcharge           numeric not null default 1800,
  pickup_surcharge        numeric not null default 1500,
  base_towing_fee         numeric not null default 800,
  time_cutting_rate       numeric not null default 300,
  container_load_price    numeric not null default 0,
  container_lot_payment   numeric not null default 0,
  container_land_fee      numeric not null default 0,
  updated_at              timestamptz not null default now()
);

alter table public.rate_settings enable row level security;

create policy "Users manage own rates"
  on public.rate_settings for all
  using (auth.uid() = user_id);

-- ── company_settings ──────────────────────────────────────────
create table if not exists public.company_settings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null unique,
  company_name    text not null default 'Dad''s Auto Group',
  company_phone   text not null default '',
  company_email   text not null default '',
  company_address text not null default '',
  logo_path       text,
  vat_number      text,
  updated_at      timestamptz not null default now()
);

alter table public.company_settings enable row level security;

create policy "Users manage own company settings"
  on public.company_settings for all
  using (auth.uid() = user_id);

-- ── Storage buckets ───────────────────────────────────────────
-- Run these separately in Storage if they don't auto-create:
-- 1. Create bucket named "documents" and set to PRIVATE
-- 2. Add storage policy: authenticated users can upload/download their own files

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users manage own files"
  on storage.objects for all
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[2]
  );
