-- Merve Yıldırım Beauty - Canlı Supabase Admin Onaylı Yorum Sistemi
-- Supabase SQL Editor'da tek sefer çalıştırın.

create extension if not exists pgcrypto;

create table if not exists public.beauty_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) >= 2),
  phone text,
  service text not null,
  rating int not null check (rating between 1 and 5),
  review text not null check (char_length(trim(review)) >= 10),
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

-- Eski politikaları temizle.
drop policy if exists "public insert pending beauty reviews" on public.beauty_reviews;
drop policy if exists "public read approved beauty reviews" on public.beauty_reviews;
drop policy if exists "review admins read all" on public.beauty_reviews;
drop policy if exists "review admins update" on public.beauty_reviews;
drop policy if exists "review admins delete" on public.beauty_reviews;
drop policy if exists "review admins read self" on public.review_admins;

-- Ziyaretçi yorum gönderebilir; fakat sadece pending olarak ekleyebilir.
-- Böylece kullanıcı yorum gönderse bile admin onayı olmadan sitede görünmez.
create policy "public insert pending beauty reviews"
on public.beauty_reviews
for insert
to anon, authenticated
with check (status = 'pending');

-- Herkes yalnızca admin tarafından onaylanmış ve yayın izni verilmiş yorumları okuyabilir.
create policy "public read approved beauty reviews"
on public.beauty_reviews
for select
to anon, authenticated
using (status = 'approved' and allow_publish = true);

-- Admin kullanıcı tüm yorumları okuyabilir.
create policy "review admins read all"
on public.beauty_reviews
for select
to authenticated
using (exists (
  select 1 from public.review_admins a
  where a.user_id = auth.uid()
));

-- Admin kullanıcı yorum durumunu güncelleyebilir.
create policy "review admins update"
on public.beauty_reviews
for update
to authenticated
using (exists (
  select 1 from public.review_admins a
  where a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.review_admins a
  where a.user_id = auth.uid()
));

-- Admin kullanıcı yorum silebilir.
create policy "review admins delete"
on public.beauty_reviews
for delete
to authenticated
using (exists (
  select 1 from public.review_admins a
  where a.user_id = auth.uid()
));

-- Admin tablosunda kullanıcı yalnızca kendisini görebilir.
create policy "review admins read self"
on public.review_admins
for select
to authenticated
using (user_id = auth.uid());

-- Admin bağlama adımı:
-- 1) Supabase Authentication > Users bölümünden admin kullanıcı oluştur.
-- 2) Oluşan kullanıcının ID değerini kopyala.
-- 3) Aşağıdaki satırdaki USER_ID kısmını değiştirip çalıştır:
-- insert into public.review_admins (user_id) values ('USER_ID_BURAYA');
