# Merve Yıldırım Beauty V10 — Supabase Bağlantısı İşlenmiş Sürüm

Bu sürümde `assets/js/review-config.js` içine Supabase bağlantı bilgileri işlendi.

## Project URL

```txt
https://lyhoszxvcxcbybqeexhu.supabase.co
```

## Yorum sistemi durumu

- PIN / demo giriş yok.
- Yorumlar Supabase'e `pending` olarak düşer.
- Admin onayı olmadan ana sayfada görünmez.
- Admin panel: `admin-yorumlar.html`
- Yorum formu: `yorum-birak.html`

## Hâlâ yapılması gereken Supabase adımları

1. Supabase SQL Editor içinde `supabase/reviews-schema.sql` dosyasındaki tüm SQL kodunu çalıştır.
2. Authentication > Users bölümünden admin kullanıcı oluştur.
3. Admin kullanıcının `User ID` değerini al.
4. SQL Editor'da şu komutu kendi User ID değerinle çalıştır:

```sql
insert into public.review_admins (user_id) values ('USER_ID_BURAYA');
```

Bu işlemden sonra admin kullanıcı `admin-yorumlar.html` sayfasından giriş yapabilir.

## Güvenlik

Service role / secret key site dosyalarına eklenmemelidir. Bu sürüm yalnızca frontend için uygun anon public key ile hazırlanmıştır.
