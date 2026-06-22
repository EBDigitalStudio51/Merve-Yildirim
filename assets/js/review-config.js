window.REVIEW_CONFIG = {
  // CANLI SUPABASE BAĞLANTISI
  // Supabase Project Settings > API bölümünden alınır.
  // Project URL örnek: https://xxxxxxxxxxxx.supabase.co
  // Anon public key örnek: eyJhbGciOiJIUzI1NiIs...
  supabaseUrl: "BURAYA_SUPABASE_PROJECT_URL",
  supabaseAnonKey: "BURAYA_SUPABASE_ANON_PUBLIC_KEY",

  // Tablo adı SQL dosyası ile aynı kalmalı.
  table: "beauty_reviews",

  // Ana sayfada en fazla kaç onaylı yorum gösterilsin?
  maxPublishedReviews: 9
};
