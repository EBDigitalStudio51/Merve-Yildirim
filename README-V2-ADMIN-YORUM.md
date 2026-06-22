# Merve Yıldırım Beauty Premium Site - V2 Admin Onaylı Yorum Sistemi

Bu sürümde ana premium siteye admin onaylı danışan yorum sistemi eklendi.

## Yeni sayfalar

- `yorum-birak.html`: Danışan yorum gönderme formu
- `admin-yorumlar.html`: Yorum onay / ret / silme paneli
- `supabase/reviews-schema.sql`: Gerçek veritabanı için Supabase şeması

## Demo mod

Supabase bilgileri girilmediği sürece sistem yerel demo modda çalışır.

- Admin sayfası: `admin-yorumlar.html`
- Demo PIN: `2026`
- Demo moddaki yorumlar yalnızca aynı tarayıcıda saklanır.

## Canlı Supabase moduna geçiş

1. Supabase projesi oluşturun.
2. SQL Editor içinde `supabase/reviews-schema.sql` dosyasını çalıştırın.
3. Authentication > Users kısmından işletme sahibi için kullanıcı oluşturun.
4. Kullanıcının `user_id` bilgisini `review_admins` tablosuna ekleyin.
5. `assets/js/review-config.js` dosyasındaki `supabaseUrl` ve `supabaseAnonKey` alanlarını doldurun.

## Güvenlik notu

Demo PIN gerçek güvenlik sağlamaz. Gerçek yayında Supabase Auth + RLS kullanılmalıdır.
