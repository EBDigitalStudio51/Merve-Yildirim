# Merve Yıldırım Beauty V8 Final

Bu sürüm final site sürümüdür.

## Dahil olanlar
- Premium krem / gold / gül pembesi tema
- Gerçek logo, telefon, adres ve WhatsApp bilgileri
- Görsel galeri ve video bölümleri
- Hizmet detay sayfaları
- SEO hazır domain yapısı
- Admin onaylı yorum sistemi

## Yorum sistemi mantığı
Yorumlar doğrudan yayına alınmaz.

1. Danışan `yorum-birak.html` üzerinden yorum gönderir.
2. Yorum `pending / onay bekliyor` durumunda kaydolur.
3. Admin `admin-yorumlar.html` panelinden giriş yapar.
4. Admin `Onayla ve Yayınla` demeden yorum ana sayfada görünmez.
5. Reddedilen veya bekleyen yorumlar sitede yayınlanmaz.

## Yerel test
Supabase bilgileri boşsa sistem sadece aynı tarayıcıda test modunda çalışır.

Test admin PIN:
```txt
2026
```

Bu mod canlı site için güvenlik sağlamaz, sadece deneme içindir.

## Canlı kullanım için zorunlu Supabase adımları
1. Supabase projesi oluştur.
2. `supabase/reviews-schema.sql` dosyasındaki SQL kodunu Supabase SQL Editor içinde çalıştır.
3. Supabase Authentication > Users bölümünden admin kullanıcı oluştur.
4. Oluşan kullanıcının UID değerini `review_admins` tablosuna ekle.
5. `assets/js/review-config.js` dosyasına şu bilgileri gir:
   - `supabaseUrl`
   - `supabaseAnonKey`
6. Siteyi tekrar yükle.
7. Admin panelden e-posta ve şifre ile giriş yap.

## Admin panel
```txt
/admin-yorumlar.html
```

## Yorum formu
```txt
/yorum-birak.html
```
