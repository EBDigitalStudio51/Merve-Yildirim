(function(){
  const config = window.REVIEW_CONFIG || {};
  const data = window.SITE_DATA || {};
  const table = config.table || "beauty_reviews";
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  function esc(v){
    return String(v || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  }

  function configured(){
    const urlOk = !!(config.supabaseUrl && !String(config.supabaseUrl).includes("BURAYA_SUPABASE"));
    const keyOk = !!(config.supabaseAnonKey && !String(config.supabaseAnonKey).includes("BURAYA_SUPABASE"));
    return !!(urlOk && keyOk && window.supabase);
  }

  function client(){
    if(!configured()) return null;
    if(!window.__beautySupabase){
      window.__beautySupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    }
    return window.__beautySupabase;
  }

  function serviceOptions(){
    return (data.services || []).map(s => s.title);
  }

  function normalize(row){
    return {
      id: row.id,
      name: row.name || "Danışan",
      service: row.service || "Hizmet deneyimi",
      rating: Number(row.rating || 5),
      review: row.review || row.comment || "",
      status: row.status || "pending",
      allow_publish: row.allow_publish !== false,
      created_at: row.created_at || new Date().toISOString()
    };
  }

  function stars(n){
    const full = Math.max(1, Math.min(5, Number(n || 5)));
    return "★".repeat(full) + "☆".repeat(5-full);
  }

  function renderReviewCard(r){
    return `<article class="quote-card review-card">
      <div class="stars" aria-label="${esc(r.rating)} yıldız">${stars(r.rating)}</div>
      <p>“${esc(r.review)}”</p>
      <strong>${esc(r.name)}</strong>
      <small>${esc(r.service || "Danışan deneyimi")}</small>
    </article>`;
  }

  function renderEmptyPublic(wrap){
    wrap.innerHTML = `<article class="quote-card review-card">
      <div class="stars" aria-hidden="true">★★★★★</div>
      <p>Yorumlar danışan izni ve işletme onayı sonrası burada yayınlanır.</p>
      <strong>Merve Yıldırım Beauty</strong>
      <small>Kontrollü yorum sistemi</small>
    </article>`;
  }

  async function getApproved(){
    if(!configured()) return [];
    const supa = client();
    const {data: rows, error} = await supa.from(table)
      .select("id,name,service,rating,review,status,allow_publish,created_at")
      .eq("status", "approved")
      .eq("allow_publish", true)
      .order("created_at", {ascending:false})
      .limit(config.maxPublishedReviews || 9);
    if(error){
      console.warn("Review load error", error);
      return [];
    }
    return (rows || []).map(normalize);
  }

  async function getAll(){
    if(!configured()) throw new Error("Supabase bağlantısı yapılandırılmadı.");
    const supa = client();
    const {data: rows, error} = await supa.from(table)
      .select("id,name,phone,service,rating,review,status,allow_publish,created_at")
      .order("created_at", {ascending:false});
    if(error) throw error;
    return rows || [];
  }

  async function submitReview(payload){
    if(!configured()) throw new Error("Supabase bağlantısı yapılandırılmadı.");
    const row = {
      name: payload.name,
      phone: payload.phone,
      service: payload.service,
      rating: Number(payload.rating || 5),
      review: payload.review,
      allow_publish: !!payload.allow_publish,
      status: "pending",
      source: "website"
    };
    const {error} = await client().from(table).insert(row);
    if(error) throw error;
  }

  async function updateReview(id, fields){
    if(!configured()) throw new Error("Supabase bağlantısı yapılandırılmadı.");
    const {error} = await client().from(table).update(fields).eq("id", id);
    if(error) throw error;
  }

  async function deleteReview(id){
    if(!configured()) throw new Error("Supabase bağlantısı yapılandırılmadı.");
    const {error} = await client().from(table).delete().eq("id", id);
    if(error) throw error;
  }

  async function renderPublicReviews(){
    const wrap = $("[data-review-list]") || $("#testimonialGrid");
    if(!wrap) return;
    try{
      const rows = await getApproved();
      if(rows.length){
        wrap.innerHTML = rows.map(renderReviewCard).join("");
      }else{
        renderEmptyPublic(wrap);
      }
    }catch(err){
      console.warn(err);
      renderEmptyPublic(wrap);
    }
  }

  function fillReviewServiceSelect(){
    const sel = $("#reviewService");
    if(!sel) return;
    const options = serviceOptions();
    sel.innerHTML = '<option value="">Hizmet seçiniz</option>' + options.map(x => `<option>${esc(x)}</option>`).join("");
  }

  function initReviewForm(){
    const form = $("#reviewForm");
    if(!form) return;
    fillReviewServiceSelect();
    const status = $("#reviewStatus");
    if(!configured() && status){
      status.textContent = "Yorum gönderimi için Supabase bağlantısı aktif edilmelidir.";
    }

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        service: String(fd.get("service") || "").trim(),
        rating: Number(fd.get("rating") || 5),
        review: String(fd.get("review") || "").trim(),
        allow_publish: fd.get("allow_publish") === "on"
      };
      if(!payload.name || !payload.service || !payload.review || !payload.allow_publish){
        if(status) status.textContent = "Lütfen ad, hizmet, yorum ve yayın izni alanlarını doldurun.";
        return;
      }
      try{
        await submitReview(payload);
        form.reset();
        fillReviewServiceSelect();
        if(status) status.textContent = "Yorumunuz alındı. Admin onayından sonra sitede yayınlanacaktır.";
      }catch(err){
        console.error(err);
        if(status) status.textContent = "Yorum gönderilemedi. Supabase bağlantısı veya internet ayarları kontrol edilmeli.";
      }
    });
  }

  function statusBadge(status){
    const map = {pending:"Onay Bekliyor", approved:"Yayında", rejected:"Reddedildi"};
    return `<span class="admin-badge ${esc(status)}">${map[status] || status}</span>`;
  }

  function renderAdminRow(r){
    return `<article class="admin-review-card" data-id="${esc(r.id)}">
      <div class="admin-review-head">
        <div><strong>${esc(r.name)}</strong><span>${esc(r.service)} · ${stars(r.rating)}</span></div>
        ${statusBadge(r.status)}
      </div>
      <p>${esc(r.review)}</p>
      <small>${esc(r.phone || "Telefon yok")} · ${new Date(r.created_at).toLocaleString("tr-TR")}</small>
      <div class="admin-actions">
        <button class="btn gold" data-action="approved">Onayla ve Yayınla</button>
        <button class="btn light" data-action="pending">Beklet</button>
        <button class="btn light" data-action="rejected">Reddet</button>
        <button class="btn" data-action="delete">Sil</button>
      </div>
    </article>`;
  }

  async function renderAdmin(){
    const list = $("#adminReviewList");
    const stats = $("#adminReviewStats");
    if(!list) return;
    try{
      const rows = await getAll();
      const counts = rows.reduce((acc, r) => (acc[r.status || "pending"] = (acc[r.status || "pending"] || 0)+1, acc), {});
      if(stats) stats.innerHTML = `Toplam ${rows.length} · Onay bekleyen ${counts.pending || 0} · Yayında ${counts.approved || 0} · Reddedilen ${counts.rejected || 0}`;
      list.innerHTML = rows.length ? rows.map(renderAdminRow).join("") : `<div class="content-card"><p>Henüz yorum gelmedi.</p></div>`;
    }catch(err){
      console.error(err);
      list.innerHTML = `<div class="content-card"><p>Yorumlar yüklenemedi. Admin yetkisi, Supabase SQL kurulumu veya bağlantı bilgileri kontrol edilmeli.</p></div>`;
    }
  }

  async function initAdmin(){
    const gate = $("#adminGate");
    const panel = $("#adminPanel");
    const loginForm = $("#supabaseLoginForm");
    const modeInfo = $("#adminModeInfo");
    const logoutBtn = $("#adminLogout");
    const list = $("#adminReviewList");

    if(!gate || !panel) return;

    if(!configured()){
      if(modeInfo) modeInfo.textContent = "Supabase bağlantısı eksik. review-config.js içine Project URL ve anon key girilmeli.";
      if(loginForm) loginForm.querySelector("button")?.setAttribute("disabled", "disabled");
      return;
    }

    if(modeInfo) modeInfo.textContent = "Supabase canlı mod aktif. Admin e-posta ve şifre ile giriş yapılır.";

    async function openPanel(){
      gate.hidden = true;
      panel.hidden = false;
      await renderAdmin();
    }

    const {data: sessionData} = await client().auth.getSession();
    if(sessionData?.session) await openPanel();

    loginForm?.addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "").trim();
      const status = $("#supabaseLoginStatus");
      if(!email || !password){
        if(status) status.textContent = "Admin e-posta ve şifre giriniz.";
        return;
      }

      const {error} = await client().auth.signInWithPassword({email, password});
      if(error){
        if(status) status.textContent = "Giriş başarısız: " + error.message;
        return;
      }
      if(status) status.textContent = "Giriş başarılı.";
      await openPanel();
    });

    logoutBtn?.addEventListener("click", async () => {
      await client().auth.signOut();
      location.reload();
    });

    list?.addEventListener("click", async e => {
      const btn = e.target.closest("button[data-action]");
      if(!btn) return;
      const card = e.target.closest("[data-id]");
      const id = card?.dataset.id;
      if(!id) return;
      const action = btn.dataset.action;
      try{
        if(action === "delete"){
          if(confirm("Bu yorumu silmek istiyor musunuz?")) await deleteReview(id);
        }else{
          await updateReview(id, {status: action});
        }
        await renderAdmin();
        await renderPublicReviews();
      }catch(err){
        alert("İşlem yapılamadı. Admin yetkisini veya Supabase ayarlarını kontrol edin.");
        console.error(err);
      }
    });
  }

  renderPublicReviews();
  initReviewForm();
  initAdmin();
})();
