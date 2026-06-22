# Merve Yıldırım Beauty V9 — Supabase Canlı Admin Yorum Sistemi

Bu sürümde PIN / demo admin girişi kaldırıldı.

## Yorum sistemi nasıl çalışır?

1. Ziyaretçi `yorum-birak.html` sayfasından yorum gönderir.
2. Yorum Supabase `beauty_reviews` tablosuna `pending` yani onay bekliyor olarak kaydedilir.
3. Ana sayfada yalnızca:
   - `status = approved`
   - `allow_publish = true`
   olan yorumlar görünür.
4. Admin `admin-yorumlar.html` sayfasından Supabase e-posta/şifre ile giriş yapar.
5. Admin yorumu onaylamadan yorum sitede yayınlanmaz.

## Supabase bağlantısı

`assets/js/review-config.js` dosyasına şunları gir:

```js
supabaseUrl: "https://PROJE-ID.supabase.co",
supabaseAnonKey: "SUPABASE_ANON_PUBLIC_KEY",
```

## Supabase SQL kurulumu

Supabase SQL Editor içinde:

```sql
supabase/reviews-schema.sql
```

dosyasındaki tüm SQL kodunu çalıştır.

## Admin kullanıcı ekleme

1. Supabase Authentication > Users bölümünden admin e-posta/şifre hesabı oluştur.
2. Oluşan kullanıcının `User ID` değerini kopyala.
3. SQL Editor'da şu komutu kendi ID değerinle çalıştır:

```sql
insert into public.review_admins (user_id) values ('USER_ID_BURAYA');
```

Bundan sonra admin kullanıcı `admin-yorumlar.html` sayfasından giriş yapabilir.

## Güvenlik

- Anon kullanıcı yalnızca yorum ekleyebilir.
- Anon kullanıcı onaysız yorumları göremez.
- Anon kullanıcı yorum onaylayamaz, silemez veya düzenleyemez.
- Admin yetkisi yalnızca `review_admins` tablosundaki Supabase Auth kullanıcısına verilir.
