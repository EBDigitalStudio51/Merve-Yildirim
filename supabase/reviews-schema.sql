-- Merve Yıldırım Beauty - FINAL Admin Onaylı Yorum Sistemi
-- Supabase > SQL Editor içinde tek sefer çalıştırın.
-- Mantık:
-- 1) Ziyaretçi yorum gönderir.
-- 2) Yorum status='pending' olarak kaydolur.
-- 3) Public site sadece status='approved' ve allow_publish=true yorumları okur.
-- 4) Admin onay vermeden hiçbir yorum yayına çıkmaz.

create extension if not exists pgcrypto;

create table if not exists public.beauty_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  service text not null,
  rating int not null check (rating between 1 and 5),
  review text not null check (char_length(review) >= 10),
  allow_publish boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  source text default 'website'
);

create table if not exists public.review_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.beauty_reviews enable row level security;
alter table public.review_admins enable row level security;

drop policy if exists "public insert pending beauty reviews" on public.beauty_reviews;
create policy "public insert pending beauty reviews"
on public.beauty_reviews
for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "public read approved beauty reviews" on public.beauty_reviews;
create policy "public read approved beauty reviews"
on public.beauty_reviews
for select
to anon, authenticated
using (status = 'approved' and allow_publish = true);

drop policy if exists "review admins read all" on public.beauty_reviews;
create policy "review admins read all"
on public.beauty_reviews
for select
to authenticated
using (exists (select 1 from public.review_admins a where a.user_id = auth.uid()));

drop policy if exists "review admins update" on public.beauty_reviews;
create policy "review admins update"
on public.beauty_reviews
for update
to authenticated
using (exists (select 1 from public.review_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.review_admins a where a.user_id = auth.uid()));

drop policy if exists "review admins delete" on public.beauty_reviews;
create policy "review admins delete"
on public.beauty_reviews
for delete
to authenticated
using (exists (select 1 from public.review_admins a where a.user_id = auth.uid()));

drop policy if exists "review admins read self" on public.review_admins;
create policy "review admins read self"
on public.review_admins
for select
to authenticated
using (user_id = auth.uid());

-- Admin kullanıcı oluşturma:
-- 1) Supabase Authentication > Users bölümünden admin e-posta/şifre oluştur.
-- 2) Oluşturulan kullanıcının User UID değerini kopyala.
-- 3) Aşağıdaki satırı UID ile çalıştır:
-- insert into public.review_admins (user_id) values ('BURAYA_AUTH_USER_ID');
