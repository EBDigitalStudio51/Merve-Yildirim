(function(){
  const config = window.REVIEW_CONFIG || {};
  const data = window.SITE_DATA || {};
  const table = config.table || "beauty_reviews";
  const localKey = "my_beauty_reviews_v2";
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  function esc(v){
    return String(v || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  }
  function uid(){
    return (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  }
  function configured(){
    return !!(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  }
  function client(){
    if(!configured()) return null;
    if(!window.__beautySupabase) window.__beautySupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    return window.__beautySupabase;
  }
  function serviceOptions(){
    return (data.services || []).map(s => s.title);
  }
  function demoApproved(){
    return [
      {id:"demo-1", name:"Danışan Yorumu", service:"Cilt Bakımı", rating:5, review:"Gerçek danışan yorumları işletme onayından sonra bu alanda yayınlanacaktır.", status:"approved", allow_publish:true, created_at:new Date().toISOString()},
      {id:"demo-2", name:"Randevu Deneyimi", service:"Lazer Epilasyon", rating:5, review:"Yorum sistemi hazırdır; hizmet sonrası deneyimler kontrollü şekilde toplanabilir.", status:"approved", allow_publish:true, created_at:new Date().toISOString()}
    ];
  }
  function readLocal(){
    try{return JSON.parse(localStorage.getItem(localKey) || "[]");}catch(e){return []}
  }
  function writeLocal(items){
    localStorage.setItem(localKey, JSON.stringify(items));
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
  async function getApproved(){
    if(configured()){
      const supa = client();
      const {data: rows, error} = await supa.from(table)
        .select("id,name,service,rating,review,status,allow_publish,created_at")
        .eq("status", "approved")
        .eq("allow_publish", true)
        .order("created_at", {ascending:false})
        .limit(config.maxPublishedReviews || 9);
      if(error){ console.warn("Review load error", error); return demoApproved(); }
      return rows && rows.length ? rows.map(normalize) : demoApproved();
    }
    const approved = readLocal().filter(x => x.status === "approved" && x.allow_publish !== false).map(normalize);
    return approved.length ? approved : demoApproved();
  }
  async function getAll(){
    if(configured()){
      const supa = client();
      const {data: rows, error} = await supa.from(table)
        .select("id,name,phone,service,rating,review,status,allow_publish,created_at")
        .order("created_at", {ascending:false});
      if(error) throw error;
      return rows || [];
    }
    return readLocal().sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
  }
  async function submitReview(payload){
    const row = {
      name: payload.name,
      phone: payload.phone,
      service: payload.service,
      rating: Number(payload.rating || 5),
      review: payload.review,
      allow_publish: !!payload.allow_publish,
      status: "pending",
      source: "website",
      created_at: new Date().toISOString()
    };
    if(configured()){
      const {error} = await client().from(table).insert(row);
      if(error) throw error;
      return;
    }
    row.id = uid();
    const items = readLocal();
    items.unshift(row);
    writeLocal(items);
  }
  async function updateReview(id, fields){
    if(configured()){
      const {error} = await client().from(table).update(fields).eq("id", id);
      if(error) throw error;
      return;
    }
    const items = readLocal().map(x => x.id === id ? {...x, ...fields} : x);
    writeLocal(items);
  }
  async function deleteReview(id){
    if(configured()){
      const {error} = await client().from(table).delete().eq("id", id);
      if(error) throw error;
      return;
    }
    writeLocal(readLocal().filter(x => x.id !== id));
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
  async function renderPublicReviews(){
    const wrap = $("[data-review-list]") || $("#testimonialGrid");
    if(!wrap) return;
    const rows = await getApproved();
    wrap.innerHTML = rows.map(renderReviewCard).join("");
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
        if(status) status.textContent = "Yorumunuz alındı. İşletme tarafından onaylandıktan sonra sitede yayınlanacaktır.";
      }catch(err){
        console.error(err);
        if(status) status.textContent = "Yorum gönderilemedi. Bağlantı ayarlarını kontrol edin veya daha sonra tekrar deneyin.";
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
        <button class="btn gold" data-action="approved">Yayına Al</button>
        <button class="btn light" data-action="pending">Beklemeye Al</button>
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
      list.innerHTML = `<div class="content-card"><p>Yorumlar yüklenemedi. Supabase bağlantısını veya admin yetkisini kontrol edin.</p></div>`;
    }
  }
  async function initAdmin(){
    const gate = $("#adminGate");
    const panel = $("#adminPanel");
    const localForm = $("#localAdminForm");
    const loginForm = $("#supabaseLoginForm");
    if(!gate || !panel) return;

    const modeInfo = $("#adminModeInfo");
    if(modeInfo) modeInfo.textContent = configured() ? "Supabase canlı mod" : "Demo/yerel mod — PIN: 2026";

    async function openPanel(){
      gate.hidden = true; panel.hidden = false; await renderAdmin();
    }

    if(!configured() && sessionStorage.getItem("beautyLocalAdmin") === "1") await openPanel();
    if(configured()){
      const {data: sessionData} = await client().auth.getSession();
      if(sessionData?.session) await openPanel();
    }

    localForm?.addEventListener("submit", async e => {
      e.preventDefault();
      const pin = new FormData(localForm).get("pin");
      if(String(pin) === String(config.localAdminPin || "2026")){
        sessionStorage.setItem("beautyLocalAdmin", "1");
        await openPanel();
      } else {
        const s = $("#localAdminStatus"); if(s) s.textContent = "PIN hatalı.";
      }
    });

    loginForm?.addEventListener("submit", async e => {
      e.preventDefault();
      if(!configured()) return;
      const fd = new FormData(loginForm);
      const {error} = await client().auth.signInWithPassword({email: fd.get("email"), password: fd.get("password")});
      if(error){ const s=$("#supabaseLoginStatus"); if(s) s.textContent = error.message; return; }
      await openPanel();
    });

    $("#seedDemoReview")?.addEventListener("click", async () => {
      const items = readLocal();
      items.unshift({id:uid(), name:"Demo Danışan", phone:"05xx xxx xx xx", service:"Cilt Bakımı", rating:5, review:"Salon deneyimim çok zarif ve profesyoneldi. Yorum onay sistemi test mesajıdır.", status:"pending", allow_publish:true, created_at:new Date().toISOString()});
      writeLocal(items); await renderAdmin();
    });

    $("#adminLogout")?.addEventListener("click", async () => {
      sessionStorage.removeItem("beautyLocalAdmin");
      if(configured()) await client().auth.signOut();
      location.reload();
    });

    $("#adminReviewList")?.addEventListener("click", async e => {
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
      }catch(err){
        alert("İşlem yapılamadı. Yetki veya bağlantı ayarlarını kontrol edin.");
        console.error(err);
      }
    });
  }

  renderPublicReviews();
  initReviewForm();
  initAdmin();
})();
