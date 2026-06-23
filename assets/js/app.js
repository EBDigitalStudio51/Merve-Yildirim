(function () {
  const data = window.SITE_DATA || {};
  const REAL_BRAND = {
    name: "Merve Yıldırım Beauty & Sağlıklı Yaşam",
    shortName: "Merve Yıldırım",
    descriptor: "Beauty & Sağlıklı Yaşam",
    slogan: "Beauty & Sağlıklı Yaşam",
    city: "Mersin",
    district: "Mezitli",
    instagram: "https://www.instagram.com/merveyildirim_guzelliksalonu/",
    phone: "0544 240 29 71",
    whatsapp: "905442402971",
    address: "Merkez Mah. 52005 Sok. Aros 3 Sitesi A Blok Kat: 3 No: 3 Mezitli / Mersin (Mezitli Gündoğdu üstü)",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Merkez%20Mah.%2052005%20Sok.%20Aros%203%20Sitesi%20A%20Blok%20Kat%3A%203%20No%3A%203%20Mezitli%20/%20Mersin%20%28Mezitli%20G%C3%BCndo%C4%9Fdu%20%C3%BCst%C3%BC%29"
  };
  const isPlaceholder = (value) => !value || /eklenecek|placeholder|net adres/i.test(String(value));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function setText(selector, text) {
    const el = $(selector);
    if (el && text) el.textContent = text;
  }

  function moneySafePhone(raw) {
    if (!raw) return "";
    return String(raw).replace(/\D/g, "").replace(/^0/, "90");
  }

  function initBrand() {
    const rawBrand = data.brand || {};
    const b = { ...REAL_BRAND, ...rawBrand };
    ["phone", "whatsapp", "address", "mapUrl", "instagram", "name", "descriptor", "slogan", "city", "district"].forEach(key => {
      if (isPlaceholder(rawBrand[key])) b[key] = REAL_BRAND[key];
    });
    const isHomePage = !document.body.dataset.service && !!document.querySelector(".hero");
    if (isHomePage && data.seo?.title) document.title = data.seo.title;
    const meta = $('meta[name="description"]');
    if (isHomePage && meta && data.seo?.description) meta.setAttribute("content", data.seo.description);

    $$('[data-brand="name"]').forEach(el => el.textContent = b.name || "Merve Yıldırım Beauty");
    $$('[data-brand="short"]').forEach(el => el.textContent = b.shortName || "MY Beauty");
    $$('[data-brand="descriptor"]').forEach(el => el.textContent = b.descriptor || "Güzellik Salonu");
    $$('[data-brand="slogan"]').forEach(el => el.textContent = b.slogan || "Premium bakım deneyimi");
    $$('[data-brand="city"]').forEach(el => el.textContent = b.city || "Mersin");
    $$('[data-brand="district"]').forEach(el => el.textContent = b.district || "Mezitli");
    $$('[data-brand="phone"]').forEach(el => el.textContent = b.phone || REAL_BRAND.phone);
    $$('[data-brand="address"]').forEach(el => el.textContent = b.address || REAL_BRAND.address);
    $$('[data-brand="instagram"]').forEach(el => el.href = b.instagram || "#");
    $$('[data-map-link]').forEach(el => {
      el.href = b.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address || REAL_BRAND.address)}`;
    });

    const wa = moneySafePhone(b.whatsapp || b.phone);
    $$('[data-whatsapp]').forEach(el => {
      const msg = encodeURIComponent(el.dataset.message || `${b.name || "Merve Yıldırım Beauty"} için randevu ve bilgi almak istiyorum.`);
      el.href = wa ? `https://wa.me/${wa}?text=${msg}` : "#randevu";
    });
    $$('[data-phone-link]').forEach(el => {
      const phone = String(b.phone || "").replace(/\D/g, "");
      el.href = phone ? `tel:${phone}` : "#iletisim";
    });
  }

  

function renderServices() {
    const services = data.services || [];
    const wrap = $("#servicesGrid");
    if (!wrap) return;
    wrap.innerHTML = services.map((s, i) => `
      <article class="service-card reveal" style="--i:${i}">
        ${s.image ? `<div class="service-thumb"><img src="${s.image}" alt="${s.title} uygulamasını temsil eden görsel" loading="lazy" decoding="async"></div>` : ''}
        <div class="service-icon">${s.icon || "✦"}</div>
        <p class="eyebrow">${s.eyebrow || "Premium hizmet"}</p>
        <h3>${s.title}</h3>
        <p>${s.summary}</p>
        <a class="text-link" href="hizmetler/${s.slug}.html">Detayları İncele <span>→</span></a>
      </article>
    `).join("");
  }



  function renderCampaigns() {
    const wrap = $("#campaignGrid");
    if (!wrap) return;
    wrap.innerHTML = (data.campaigns || []).map(c => `
      <article class="campaign-card">
        <span>${c.label}</span>
        <h3>${c.title}</h3>
        <p>${c.text}</p>
      </article>
    `).join("");
  }

  function renderStats() {
    const wrap = $("#statsGrid");
    if (!wrap) return;
    wrap.innerHTML = (data.stats || []).map(s => `
      <div class="stat-card"><strong>${s.value}</strong><span>${s.label}</span></div>
    `).join("");
  }

  function renderTestimonials() {
    const wrap = $("#testimonialGrid");
    if (!wrap) return;
    wrap.innerHTML = (data.testimonials || []).map(t => `
      <article class="quote-card"><p>“${t.text}”</p><strong>${t.name}</strong></article>
    `).join("");
  }

  function initServicePage() {
    const page = document.body.dataset.service;
    if (!page) return;
    const s = (data.services || []).find(x => x.slug === page) || (data.services || [])[0];
    if (!s) return;
    setText("#serviceTitle", s.title);
    setText("#serviceEyebrow", s.eyebrow);
    setText("#serviceSummary", s.summary);
    setText("#serviceDetail", s.detail);
    setText("#breadcrumbService", s.title);
    // Static HTML already contains SEO-optimized title/description for each service page.
    // Do not overwrite them after load; this keeps crawler-visible metadata consistent.
    const meta = $('meta[name="description"]');
    $$('[data-service-name]').forEach(el => el.textContent = s.title);
    $$('[data-whatsapp-service]').forEach(el => {
      const b = { ...REAL_BRAND, ...(data.brand || {}) };
      const wa = moneySafePhone(b.whatsapp || b.phone);
      const msg = encodeURIComponent(`${b.name || "Merve Yıldırım Beauty"} ${s.title} hizmeti hakkında bilgi almak istiyorum.`);
      el.href = wa ? `https://wa.me/${wa}?text=${msg}` : "../randevu.html";
    });
  }

  function initAppointmentForm() {
    const form = $("#appointmentForm");
    if (!form) return;
    const serviceSelect = $("#serviceSelect");
    if (serviceSelect) {
      serviceSelect.innerHTML = '<option value="">Hizmet seçiniz</option>' + (data.services || []).map(s => `<option>${s.title}</option>`).join("");
    }
    form.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(form);
      const b = { ...REAL_BRAND, ...(data.brand || {}) };
      const wa = moneySafePhone(b.whatsapp || b.phone);
      const msg = [
        `Merhaba, ${b.name || "Merve Yıldırım Beauty"} için randevu talebi oluşturmak istiyorum.`,
        `Ad Soyad: ${fd.get("name") || "-"}`,
        `Telefon: ${fd.get("phone") || "-"}`,
        `Hizmet: ${fd.get("service") || "-"}`,
        `Tercih edilen gün/saat: ${fd.get("time") || "-"}`,
        `Not: ${fd.get("note") || "-"}`
      ].join("\n");
      if (!wa) {
        alert("WhatsApp numarası hazırlanamadı. Lütfen 0544 240 29 71 üzerinden iletişime geçin.");
        return;
      }
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    }, { threshold: .12 });
    $$(".reveal").forEach(el => io.observe(el));
  }

  function initMenu() {
    const toggle = $("#menuToggle");
    const nav = $("#navLinks");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  function initTop() {
    $$("[data-scroll-top]").forEach(el => el.addEventListener("click", e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
  }

  initBrand();
  renderServices();
  renderCampaigns();
  renderStats();
  renderTestimonials();
  initServicePage();
  initAppointmentForm();
  initMenu();
  initTop();
  initReveal();
})();
