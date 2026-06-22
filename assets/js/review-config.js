window.REVIEW_CONFIG = {
  // FINAL: Admin onayı zorunludur. Ziyaretçi yorumu doğrudan yayına alınmaz.
  // Canlı kullanım için Supabase Project URL ve anon public key alanlarını doldurun.
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Sadece yerel test içindir. Canlı yayında gerçek güvenlik Supabase Auth + RLS ile sağlanır.
  localAdminPin: "2026",

  table: "beauty_reviews",
  maxPublishedReviews: 9,
  approvalRequired: true
};
