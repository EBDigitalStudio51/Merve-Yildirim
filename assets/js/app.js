(function () {
  const data = window.SITE_DATA || {};
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
    const b = data.brand || {};
    document.title = data.seo?.title || b.name || document.title;
    const meta = $('meta[name="description"]');
    if (meta && data.seo?.description) meta.setAttribute("content", data.seo.description);

    $$('[data-brand="name"]').forEach(el => el.textContent = b.name || "Merve Yıldırım Beauty");
    $$('[data-brand="short"]').forEach(el => el.textContent = b.shortName || "MY Beauty");
    $$('[data-brand="descriptor"]').forEach(el => el.textContent = b.descriptor || "Güzellik Salonu");
    $$('[data-brand="slogan"]').forEach(el => el.textContent = b.slogan || "Premium bakım deneyimi");
    $$('[data-brand="city"]').forEach(el => el.textContent = b.city || "Mersin");
    $$('[data-brand="district"]').forEach(el => el.textContent = b.district || "Mezitli");
    $$('[data-brand="phone"]').forEach(el => el.textContent = b.phone || "Telefon bilgisi eklenecek");
    $$('[data-brand="address"]').forEach(el => el.textContent = b.address || "Adres bilgisi eklenecek");
    $$('[data-brand="instagram"]').forEach(el => el.href = b.instagram || "#");

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
    $$('[data-service-name]').forEach(el => el.textContent = s.title);
    $$('[data-whatsapp-service]').forEach(el => {
      const b = data.brand || {};
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
      const b = data.brand || {};
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
        alert("WhatsApp numarası site-data.js dosyasına eklenince form doğrudan WhatsApp'a yönlendirecek.");
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
