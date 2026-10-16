"use strict";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => (n ?? 0).toLocaleString("tr-TR");
const usd = (n) => n >= 1e6 ? `$${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyon` : `$${(n / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} bin`;

let META = null;
const STATUS_TR = { yeni: "Yeni", iletisime_gecildi: "İletişime geçildi", teklif_verildi: "Teklif verildi", musteri: "Müşteri", uygun_degil: "Uygun değil" };
const SOURCE_TR = { google_maps: "Google Maps", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok", web: "Web" };

const REGIONS = {
  "Avrupa": "AL AD AT BE BA BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT MD MC ME NL MK NO PL PT RO SM RS SK SI ES SE CH GB UA",
  "Kuzey Amerika": "US CA MX",
  "Latin Amerika": "AR BO BR CL CO CR DO EC SV GT HN NI PA PY PE UY VE",
  "Orta Doğu & Körfez": "AE SA QA KW OM BH JO IL EG LB IQ",
  "Afrika": "ZA NA BW ZW ZM KE TZ MA TN DZ NG GH SN CI CM",
  "Asya-Pasifik": "AU NZ JP KR PH TH MY ID SG IN PK KZ UZ AZ GE",
  "Türk Cumhuriyetleri": "AZ KZ UZ KG TM",
};

function toast(msg, ms = 3500) {
  const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add("hidden"), ms);
}

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (r.status === 401) { location.href = "/login"; throw new Error("Oturum gerekli"); }
  if (!r.ok) {
    let msg = r.statusText;
    try { msg = (await r.json()).detail || msg; } catch (_) { /* */ }
    throw new Error(msg);
  }
  return r.json();
}
const post = (p, body) => api(p, { method: "POST", body: JSON.stringify(body || {}) });

// ------------------------------------------------------------------ sekmeler
function showTab(name) {
  $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
  ({ panel: loadPanel, leads: loadLeads, jobs: loadJobs, settings: loadSettings }[name] || (() => {}))();
  if (name === "panel" && map) setTimeout(() => map.invalidateSize(), 50);
  try { localStorage.setItem("tab", name); } catch (_) { /* */ }
}
$$("#tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

// ------------------------------------------------------------------ ülke seçici
class CountryPicker {
  constructor(root, presetsEl) {
    this.selected = new Set();
    root.innerHTML = `<input class="search" placeholder="Ülke ara..."><div class="list"></div><div class="sel"></div>`;
    this.list = $(".list", root); this.selEl = $(".sel", root);
    this.list.innerHTML = META.countries.map((c) => `<label data-n="${esc((c.tr + " " + c.en + " " + c.code).toLowerCase())}">
      <input type="checkbox" value="${c.code}"> ${esc(c.tr)} ${META.embargo[c.code] ? '<span class="tag warn" title="Silah ambargosu: ' + esc(META.embargo[c.code]) + '">⚠</span>' : ""}</label>`).join("");
    $(".search", root).addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      $$("label", this.list).forEach((l) => l.classList.toggle("hidden", !l.dataset.n.includes(q)));
    });
    this.list.addEventListener("change", (e) => { e.target.checked ? this.selected.add(e.target.value) : this.selected.delete(e.target.value); this.render(); });
    const presets = { ...REGIONS, "Tüm dünya (ambargosuz)": META.countries.filter((c) => !META.embargo[c.code]).map((c) => c.code).join(" ") };
    presetsEl.innerHTML = Object.keys(presets).map((k) => `<button data-k="${esc(k)}">${esc(k)}</button>`).join("") + `<button data-k="__clear">Temizle</button>`;
    presetsEl.addEventListener("click", (e) => {
      const k = e.target.dataset.k; if (!k) return;
      if (k === "__clear") this.set([]); else this.set([...this.selected, ...presets[k].split(" ")]);
    });
    this.onchange = () => {};
    this.render();
  }
  set(codes) {
    this.selected = new Set(codes.filter((c) => META.countries.some((x) => x.code === c)));
    $$("input", this.list).forEach((i) => (i.checked = this.selected.has(i.value)));
    this.render();
  }
  render() {
    const names = [...this.selected].map((c) => META.countries.find((x) => x.code === c)?.tr || c);
    this.selEl.textContent = names.length ? `${names.length} ülke seçili: ${names.slice(0, 8).join(", ")}${names.length > 8 ? "…" : ""}` : "Henüz ülke seçilmedi.";
    this.onchange();
  }
  get value() { return [...this.selected]; }
}

// ------------------------------------------------------------------ panel
let map, cluster;
async function loadPanel() {
  const s = await api("/api/stats");
  const kp = [["Toplam potansiyel müşteri", s.total], ["E-postası bulunan", s.with_email], ["Telefonu olan", s.with_phone], ["Web sitesi olan", s.with_web], ["Ülke", s.countries]];
  $("#kpis").innerHTML = kp.map(([l, v]) => `<div class="kpi"><b>${fmt(v)}</b><span>${l}</span></div>`).join("");
  const max = Math.max(1, ...s.by_country.map((r) => r.n));
  $("#byCountry").innerHTML = s.by_country.length ? `<table class="tbl"><tr><th>Ülke</th><th class="num">Kayıt</th><th class="num">E-posta</th><th style="width:35%"></th></tr>` +
    s.by_country.map((r) => `<tr><td>${esc(r.country_tr)}</td><td class="num">${fmt(r.n)}</td><td class="num">${fmt(r.e)}</td><td><div class="bar" style="width:${(100 * r.n) / max}%"></div></td></tr>`).join("") + "</table>"
    : `<p class="muted">Henüz kayıt yok. "Google Maps Taraması" veya "GTİP Pazar Analizi" sekmesinden başlayın.</p>`;
  const jobs = await api("/api/jobs");
  $("#recentJobs").innerHTML = jobs.length ? jobs.slice(0, 5).map(jobHtml).join("") : '<p class="muted">Henüz iş yok.</p>';
  if (!map && window.L) {
    map = L.map("map", { worldCopyJump: true }).setView([30, 15], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(map);
    cluster = L.markerClusterGroup(); map.addLayer(cluster);
  }
  if (map) {
    const pts = await api("/api/map");
    cluster.clearLayers();
    cluster.addLayers(pts.map((p) => L.marker([p.lat, p.lng]).bindPopup(
      `<b>${esc(p.name)}</b><br>${esc(p.city || "")} ${esc(p.country || "")}<br>${esc(p.phone || "")}<br>${(p.emails || []).map(esc).join("<br>")}` +
      (p.website ? `<br><a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.website)}</a>` : ""))));
  }
}

// ------------------------------------------------------------------ maps taraması
let pickMaps, pickSocial;
function fillGtipSelect(sel) {
  sel.innerHTML = Object.entries(META.gtip).map(([k, v]) => `<option value="${k}" ${k === "9303" ? "selected" : ""}>${k} – ${esc(v)}</option>`).join("");
}
async function updateMapsHint() {
  const cs = pickMaps.value;
  const terms = $("#mTerms").value.trim();
  const sample = cs[0] || "";
  if (!terms) {
    const kw = await api(`/api/keywords?gtip=${$("#mGtip").value}&country=${$("#mLocal").checked ? sample : ""}`);
    $("#mTermsHint").textContent = `Otomatik terimler${sample ? " (" + (META.countries.find((c) => c.code === sample)?.tr) + ")" : ""}: ` + kw.slice(0, +$("#mMaxTerms").value).join(", ");
  } else $("#mTermsHint").textContent = "";
  const nTerms = terms ? terms.split(",").filter(Boolean).length : +$("#mMaxTerms").value;
  const cities = $("#mCities").value.split("\n").filter((x) => x.trim()).length;
  const perCountry = cities ? cities * nTerms * 2 : nTerms * 12;
  const est = Math.min(cs.length * perCountry, +$("#mMaxCalls").value * Math.max(cs.length, 1));
  $("#mEstimate").innerHTML = cs.length || cities
    ? `Tahmini API çağrısı: <b>~${fmt(est)}</b> (ülke başına ~${perCountry}, yoğun ülkelerde daha fazla). Places Text Search Pro ≈ $32 / 1000 çağrı → tahmini maliyet <b>~$${fmt(Math.round(est * 0.032))}</b> (Google'ın aylık ücretsiz kotası düşülmeden).`
    : "Başlamak için ülke seçin veya şehir girin.";
}
async function startMaps(countries) {
  const body = {
    countries: countries || pickMaps.value, cities: $("#mCities").value, gtip: $("#mGtip").value, terms: $("#mTerms").value,
    max_terms: +$("#mMaxTerms").value, depth: +$("#mDepth").value, max_calls: +$("#mMaxCalls").value,
    local_terms: $("#mLocal").checked, auto_enrich: $("#mEnrich").checked, filter: $("#mFilter").checked,
  };
  if (!body.countries.length && !body.cities.trim()) return toast("Lütfen en az bir ülke seçin veya şehir girin.");
  const emb = body.countries.filter((c) => META.embargo[c]);
  if (emb.length && !confirm(`Seçimde silah ambargosu/kısıtlaması olan ${emb.length} ülke var (${emb.join(", ")}). İhracat izni alınamayabilir. Yine de devam edilsin mi?`)) return;
  try {
    const r = await post("/api/jobs/maps", body);
    toast(`Tarama başlatıldı (iş #${r.id}).`); showTab("jobs"); selectJob(r.id);
  } catch (e) { toast(e.message, 6000); }
}

// ------------------------------------------------------------------ GTİP analizi
let gRows = [];
const gSel = new Set();
async function loadGtip() {
  $("#gInfo").textContent = "UN Comtrade verisi yükleniyor...";
  try {
    gRows = await api(`/api/gtip/market?code=${$("#gCode").value}&year=${$("#gYear").value}`);
  } catch (e) { $("#gInfo").textContent = e.message; return; }
  gSel.clear(); renderGtip();
}
function renderGtip() {
  const total = gRows.reduce((a, r) => a + r.value, 0);
  const max = Math.max(1, ...gRows.map((r) => r.value));
  $("#gInfo").textContent = `${gRows.length} ülke · toplam ithalat ${usd(total)} · ${gSel.size} seçili`;
  $("#gTable").innerHTML = `<tr><th><input type="checkbox" id="gAll"></th><th class="hide-sm">#</th><th>Ülke</th><th class="num">İthalat</th><th class="hide-sm" style="width:18%"></th><th class="num hide-sm">Dünya payı</th><th class="num">Türkiye'den</th><th class="num hide-sm">TR payı</th><th class="num hide-sm">Kayıtlı</th><th class="hide-sm">Uyarı</th></tr>` +
    gRows.map((r, i) => `<tr><td>${r.iso2 ? `<input type="checkbox" data-c="${r.iso2}" ${gSel.has(r.iso2) ? "checked" : ""}>` : ""}</td><td class="hide-sm">${i + 1}</td>
      <td>${esc(r.name_tr)}${r.embargo ? ' <span class="tag warn">⚠</span>' : ""}</td><td class="num">${usd(r.value)}</td><td class="hide-sm"><div class="bar" style="width:${(100 * r.value) / max}%"></div></td>
      <td class="num hide-sm">%${r.world_share.toLocaleString("tr-TR")}</td><td class="num">${r.from_turkiye ? usd(r.from_turkiye) : "–"}</td>
      <td class="num hide-sm">${r.from_turkiye ? "%" + r.tr_share.toLocaleString("tr-TR") : "–"}</td><td class="num hide-sm">${fmt(r.leads)}</td>
      <td class="hide-sm">${r.embargo ? `<span class="tag warn">⚠ ${esc(r.embargo)}</span>` : ""}</td></tr>`).join("");
  $("#gScan").disabled = $("#gSocial").disabled = !gSel.size;
}
$("#gTable").addEventListener("change", (e) => {
  if (e.target.id === "gAll") { gRows.forEach((r) => r.iso2 && (e.target.checked ? gSel.add(r.iso2) : gSel.delete(r.iso2))); renderGtip(); return; }
  const c = e.target.dataset.c; if (!c) return;
  e.target.checked ? gSel.add(c) : gSel.delete(c); renderGtip();
});

// ------------------------------------------------------------------ sosyal medya
async function startSocial(countries) {
  const nets = $$('input[name="net"]:checked').map((i) => i.value);
  countries = countries || pickSocial.value;
  if (!nets.length) return toast("En az bir platform seçin.");
  const terms = $("#sTerms").value;
  const started = [];
  try {
    const webNets = nets.filter((n) => n !== "youtube_api");
    if (webNets.length) started.push((await post("/api/jobs/social", { networks: webNets, countries, terms, pages: +$("#sPages").value, local_terms: $("#sLocal").checked, enrich_websites: $("#sEnrich").checked })).id);
    if (nets.includes("youtube_api")) started.push((await post("/api/jobs/youtube", { countries, terms, max_results: +$("#sYtMax").value })).id);
    toast(`Başlatılan işler: #${started.join(", #")}`); showTab("jobs"); selectJob(started[0]);
  } catch (e) { toast(e.message, 6000); }
}

// ------------------------------------------------------------------ müşteri listesi
const L_STATE = { page: 1, per_page: 50, sort: "created_at", order: "desc" };
const lSel = new Set();
function leadFilters() {
  return { q: $("#fQ").value, country: $("#fCountry").value, source: $("#fSource").value, status: $("#fStatus").value, has_email: $("#fEmail").checked, has_website: $("#fWeb").checked };
}
const qs = (o) => Object.entries(o).filter(([, v]) => v !== "" && v !== false).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
async function loadLeads() {
  const d = await api("/api/leads?" + qs({ ...leadFilters(), ...L_STATE }));
  $("#lInfo").textContent = `${fmt(d.total)} kayıt · ${lSel.size} seçili`;
  const cols = [["name", "Firma"], ["country", "Ülke / Şehir"], [null, "İletişim"], [null, "E-posta"], [null, "Sosyal medya"], ["rating", "Puan"], ["status", "Durum"]];
  $("#lTable").innerHTML = `<tr><th><input type="checkbox" id="lAll"></th>${cols.map(([k, h]) => `<th ${k ? `data-sort="${k}"` : ""}>${h}${L_STATE.sort === k ? (L_STATE.order === "asc" ? " ▲" : " ▼") : ""}</th>`).join("")}</tr>` +
    (d.rows.map((r) => {
      const soc = r.socials || {};
      const socHtml = Object.entries(soc).map(([k, v]) => `<a class="tag" href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join("");
      return `<tr data-id="${r.id}"><td><input type="checkbox" data-id="${r.id}" ${lSel.has(r.id) ? "checked" : ""}></td>
        <td data-label=""><a href="#" data-open="${r.id}"><b>${esc(r.name)}</b></a><br><span class="tag">${SOURCE_TR[r.source] || r.source}</span>${r.category ? `<span class="muted"> ${esc(r.category)}</span>` : ""}</td>
        <td data-label="Ülke / Şehir">${esc(r.country_tr)}${r.embargo ? ' <span class="tag warn" title="' + esc(r.embargo) + '">⚠</span>' : ""}<br><span class="muted">${esc(r.city || "")}</span></td>
        <td data-label="İletişim">${esc(r.intl_phone || r.phone || (r.phones_extra || [])[0] || "")}${r.website ? `<br><a href="${esc(r.website)}" target="_blank" rel="noopener">${esc(r.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40))}</a>` : ""}</td>
        <td data-label="E-posta">${(r.emails || []).slice(0, 3).map((e) => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join("<br>") || (r.enriched_at ? '<span class="muted">bulunamadı</span>' : '<span class="muted">–</span>')}</td>
        <td data-label="Sosyal medya">${socHtml}</td>
        <td class="num" data-label="Puan">${r.rating ? r.rating + ` <span class="muted">(${fmt(r.reviews)})</span>` : r.followers ? fmt(r.followers) + ' <span class="muted">takipçi</span>' : ""}</td>
        <td data-label="Durum"><select data-status="${r.id}">${META.statuses.map((s) => `<option value="${s}" ${s === r.status ? "selected" : ""}>${STATUS_TR[s]}</option>`).join("")}</select></td></tr>`;
    }).join("") || `<tr><td colspan="8" class="muted">Kayıt bulunamadı.</td></tr>`);
  const pages = Math.max(1, Math.ceil(d.total / L_STATE.per_page));
  $("#lPager").innerHTML = `<button ${L_STATE.page <= 1 ? "disabled" : ""} data-p="${L_STATE.page - 1}">‹ Önceki</button><span>Sayfa ${L_STATE.page} / ${pages}</span><button ${L_STATE.page >= pages ? "disabled" : ""} data-p="${L_STATE.page + 1}">Sonraki ›</button>
    <select id="perPage">${[25, 50, 100, 250].map((n) => `<option ${n === L_STATE.per_page ? "selected" : ""}>${n}</option>`).join("")}</select>`;
}
let fTimer;
["#fQ", "#fCountry", "#fSource", "#fStatus", "#fEmail", "#fWeb"].forEach((s) => $(s).addEventListener(s === "#fQ" ? "input" : "change", () => {
  clearTimeout(fTimer); fTimer = setTimeout(() => { L_STATE.page = 1; loadLeads(); }, 250);
}));
$("#lPager").addEventListener("click", (e) => { if (e.target.dataset.p) { L_STATE.page = +e.target.dataset.p; loadLeads(); } });
$("#lPager").addEventListener("change", (e) => { if (e.target.id === "perPage") { L_STATE.per_page = +e.target.value; L_STATE.page = 1; loadLeads(); } });
$("#lTable").addEventListener("click", (e) => {
  const th = e.target.closest("th[data-sort]");
  if (th) { const k = th.dataset.sort; L_STATE.order = L_STATE.sort === k && L_STATE.order === "desc" ? "asc" : "desc"; L_STATE.sort = k; loadLeads(); return; }
  const a = e.target.closest("[data-open]");
  if (a) { e.preventDefault(); openLead(+a.dataset.open); }
});
$("#lTable").addEventListener("change", async (e) => {
  if (e.target.id === "lAll") { $$("input[data-id]", $("#lTable")).forEach((i) => { i.checked = e.target.checked; e.target.checked ? lSel.add(+i.dataset.id) : lSel.delete(+i.dataset.id); }); }
  else if (e.target.dataset.id) { e.target.checked ? lSel.add(+e.target.dataset.id) : lSel.delete(+e.target.dataset.id); }
  else if (e.target.dataset.status) { await api(`/api/leads/${e.target.dataset.status}`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }); toast("Durum güncellendi."); }
  $("#lInfo").textContent = $("#lInfo").textContent.replace(/· \d+ seçili/, `· ${lSel.size} seçili`);
});
$("#lEnrich").addEventListener("click", async () => {
  if (!lSel.size) return toast("Önce kayıt seçin.");
  const r = await post("/api/jobs/enrich", { ids: [...lSel], only_missing: false }); toast(`Zenginleştirme başladı (iş #${r.id}).`);
});
$("#lEnrichAll").addEventListener("click", async () => { const r = await post("/api/jobs/enrich", { only_missing: true }); toast(`Zenginleştirme başladı (iş #${r.id}).`); });
$("#lDelete").addEventListener("click", async () => {
  if (!lSel.size || !confirm(`${lSel.size} kayıt silinsin mi?`)) return;
  await post("/api/leads/delete", { ids: [...lSel] }); lSel.clear(); loadLeads();
});
$("#lCsv").addEventListener("click", () => (location.href = "/api/export?fmt=csv&" + qs(leadFilters())));
$("#lXlsx").addEventListener("click", () => (location.href = "/api/export?fmt=xlsx&" + qs(leadFilters())));

async function openLead(id) {
  const r = await api(`/api/leads/${id}`);
  $("#dName").textContent = r.name;
  const link = (u) => u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>` : "–";
  const rows = [["Kaynak", SOURCE_TR[r.source] || r.source], ["Kategori", r.category], ["Ülke", META.countries.find((c) => c.code === r.country_code)?.tr || r.country], ["Şehir", r.city], ["Adres", r.address],
    ["Telefon", [r.intl_phone || r.phone, ...(r.phones_extra || [])].filter(Boolean).map(esc).join("<br>")], ["E-posta", (r.emails || []).map((e) => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join("<br>")],
    ["Web sitesi", link(r.website)], ["Google Maps", link(r.maps_url)], ...Object.entries(r.socials || {}).map(([k, v]) => [k, link(v)]),
    ["Puan", r.rating ? `${r.rating} (${fmt(r.reviews)} yorum)` : ""], ["Takipçi", r.followers ? fmt(r.followers) : ""], ["Açıklama", r.description], ["Arama terimi", r.search_term], ["Eklenme", r.created_at]];
  $("#dBody").innerHTML = `<dl>${rows.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${["Adres", "Kategori", "Şehir", "Ülke", "Açıklama", "Arama terimi", "Eklenme", "Puan", "Takipçi", "Kaynak"].includes(k) ? esc(v) : v}</dd>`).join("")}</dl>
    <label class="mt">Durum</label><select id="dStatus">${META.statuses.map((s) => `<option value="${s}" ${s === r.status ? "selected" : ""}>${STATUS_TR[s]}</option>`).join("")}</select>
    <label class="mt">Notlar</label><textarea id="dNotes" rows="5">${esc(r.notes)}</textarea>
    <button class="primary big" id="dSave">Kaydet</button>`;
  $("#dSave").onclick = async () => { await api(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status: $("#dStatus").value, notes: $("#dNotes").value }) }); toast("Kaydedildi."); loadLeads(); };
  $("#drawer").classList.remove("hidden");
}
$("#dClose").addEventListener("click", () => $("#drawer").classList.add("hidden"));

// ------------------------------------------------------------------ işler
const JOB_ST = { bekliyor: "Bekliyor", calisiyor: "Çalışıyor", tamamlandi: "Tamamlandı", hata: "Hata", iptal: "İptal edildi" };
let selJob = null;
function jobHtml(j) {
  return `<div class="job ${selJob === j.id ? "sel" : ""}" data-job="${j.id}"><div class="t">#${j.id} ${esc(j.title)}</div>
    <div class="progress"><div style="width:${Math.round(j.progress * 100)}%"></div></div>
    <div class="m"><span class="st-${j.status}">${JOB_ST[j.status] || j.status}</span> · %${Math.round(j.progress * 100)} · yeni kayıt: <b>${fmt(j.found)}</b> · API: ${fmt(j.api_calls)} · ${esc(j.created_at.replace("T", " "))}
    ${j.status === "calisiyor" || j.status === "bekliyor" ? ` · <a href="#" data-cancel="${j.id}">Durdur</a>` : ""}</div></div>`;
}
async function loadJobs() {
  const jobs = await api("/api/jobs");
  $("#jobList").innerHTML = jobs.map(jobHtml).join("") || '<p class="muted">Henüz iş yok.</p>';
  const running = jobs.filter((j) => j.status === "calisiyor" || j.status === "bekliyor").length;
  $("#runningBadge").textContent = running; $("#runningBadge").classList.toggle("hidden", !running);
  if (selJob) {
    const j = await api(`/api/jobs/${selJob}`);
    $("#jobTitle").textContent = `#${j.id} ${j.title}`;
    const log = $("#jobLog"); const atBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 20;
    log.textContent = j.log || "(henüz kayıt yok)"; if (atBottom) log.scrollTop = log.scrollHeight;
  }
  return running;
}
function selectJob(id) { selJob = id; loadJobs(); }
document.addEventListener("click", async (e) => {
  const c = e.target.closest("[data-cancel]");
  if (c) { e.preventDefault(); e.stopPropagation(); await post(`/api/jobs/${c.dataset.cancel}/cancel`); toast("Durdurma isteği gönderildi."); loadJobs(); return; }
  const j = e.target.closest("[data-job]");
  if (j) { if (!$("#tab-jobs").classList.contains("active")) showTab("jobs"); selectJob(+j.dataset.job); }
});
async function poll() {
  try {
    const running = await loadJobs();
    if ($("#tab-panel").classList.contains("active") && running) loadPanel();
  } catch (_) { /* */ }
  setTimeout(poll, 3000);
}

// ------------------------------------------------------------------ ayarlar
async function loadAccess() {
  const a = await api("/api/access");
  const onLocal = /^(localhost|127\.)/.test(location.hostname);
  const url = onLocal && a.lan.length ? a.lan[0] : a.current;
  $("#accessUrl").textContent = url;
  $("#qr").innerHTML = "";
  if (window.QRCode) new QRCode($("#qr"), { text: url, width: 150, height: 150, correctLevel: QRCode.CorrectLevel.M });
  let hint = "";
  if (onLocal && a.lan.length) hint = "Bu adres yalnızca bilgisayarınızla aynı Wi-Fi ağındaki telefonlarda çalışır. Her yerden erişim için programı bulut sunucusuna kurun (README: \"İnternetten erişim\").";
  if (onLocal && !a.lan.length) hint = "Yerel ağ adresi bulunamadı. Programı 'baslat-telefon' dosyasıyla başlatın.";
  if (!a.password_set) hint += " ⚠ Panel şifresi belirlenmemiş: başkalarının erişmemesi için aşağıdan bir şifre belirleyin.";
  $("#accessHint").textContent = hint.trim();
}
async function loadSettings() {
  loadAccess().catch(() => {});
  const s = await api("/api/settings");
  $$("[data-setting]").forEach((el) => { el.value = s[el.dataset.setting] ?? (el.tagName === "SELECT" ? el.options[0].value : ""); });
}
$("#saveSettings").addEventListener("click", async () => {
  const body = {}; $$("[data-setting]").forEach((el) => (body[el.dataset.setting] = el.value));
  await post("/api/settings", body); toast("Ayarlar kaydedildi."); loadSettings();
});

// ------------------------------------------------------------------ başlangıç
(async function init() {
  META = await api("/api/meta");
  pickMaps = new CountryPicker($("#pickerMaps"), $("#presetsMaps"));
  pickSocial = new CountryPicker($("#pickerSocial"), $("#presetsSocial"));
  fillGtipSelect($("#mGtip")); fillGtipSelect($("#gCode"));
  const y = new Date().getFullYear();
  $("#gYear").innerHTML = [y - 2, y - 3, y - 4, y - 5].map((v) => `<option>${v}</option>`).join("");
  $("#gYear").value = String(y - 2);
  const setDesc = () => ($("#gDesc").textContent = `${$("#gCode").value}: ${META.gtip[$("#gCode").value]}`);
  $("#gCode").addEventListener("change", setDesc); setDesc();
  $("#fCountry").innerHTML += META.countries.map((c) => `<option value="${c.code}">${esc(c.tr)}</option>`).join("");
  $("#fStatus").innerHTML += META.statuses.map((s) => `<option value="${s}">${STATUS_TR[s]}</option>`).join("");
  pickMaps.onchange = updateMapsHint;
  ["#mTerms", "#mGtip", "#mLocal", "#mMaxTerms", "#mCities", "#mMaxCalls"].forEach((s) => $(s).addEventListener("change", updateMapsHint));
  updateMapsHint();
  $("#mStart").addEventListener("click", () => startMaps());
  $("#gLoad").addEventListener("click", loadGtip);
  $("#gSelectTop").addEventListener("click", () => { gRows.filter((r) => r.iso2 && !r.embargo).slice(0, 20).forEach((r) => gSel.add(r.iso2)); renderGtip(); });
  $("#gScan").addEventListener("click", () => { pickMaps.set([...gSel]); $("#mGtip").value = $("#gCode").value; showTab("maps"); toast("Ülkeler aktarıldı. Ayarları kontrol edip 'Taramayı Başlat'a basın."); });
  $("#gSocial").addEventListener("click", () => { pickSocial.set([...gSel]); showTab("social"); toast("Ülkeler aktarıldı. Platformları seçip taramayı başlatın."); });
  $("#sStart").addEventListener("click", () => startSocial());
  let start = "panel"; try { start = localStorage.getItem("tab") || "panel"; } catch (_) { /* */ }
  showTab(start);
  poll();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
})();
