/* ================================================================
   VALLERIE VALENCIA — SWEET SEVENTEEN
   JavaScript: Countdown · Sparkle Particles · Wishes · RSVP · Copy
   Integrated with Firebase Realtime Database for cross-device live sync
   ================================================================ */

'use strict';

// ── 🔥 Firebase Realtime Database Config ─────────────────────────────────
const FIREBASE_URL = 'https://web-app-demo-vincent-default-rtdb.asia-southeast1.firebasedatabase.app';

// Firebase REST Helpers
async function fbGet(path) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('[Firebase] GET error:', e);
    return null;
  }
}

async function fbPost(path, data) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('[Firebase] POST error:', e);
    return null;
  }
}

async function fbPut(path, data) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('[Firebase] PUT error:', e);
    return null;
  }
}

async function fbDelete(path) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.warn('[Firebase] DELETE error:', e);
    return false;
  }
}

function fbToArray(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([key, val]) => {
    if (typeof val === 'object' && val !== null) {
      return { _key: key, ...val };
    }
    return { _key: key, value: val };
  });
}

// ── Local Storage Fallback & Cache ──────────────────────────────────
const KEY_WISHES = 'vv_wishes_v3';
const KEY_RSVP   = 'vv_rsvp_v3';

const loadLocal = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const saveLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// ── XSS Protection ─────────────────────────────────────────────────
const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[c]));

// ── Countdown Timer ────────────────────────────────────────────────
const TARGET = new Date('2026-10-24T18:00:00+07:00');

function pad(n, l = 2) { return String(n).padStart(l, '0'); }

function tick() {
  const diff = TARGET - Date.now();
  if (diff <= 0) {
    ['days','hours','minutes','seconds'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    const sub = document.querySelector('.countdown-section .section-heading');
    if (sub) sub.textContent = 'Happy Birthday, Vallerie!';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  setNum('days',    pad(d, 3));
  setNum('hours',   pad(h));
  setNum('minutes', pad(m));
  setNum('seconds', pad(s));
}

function setNum(id, val) {
  const el = document.getElementById(id);
  if (!el || el.textContent === val) return;
  el.style.transition = 'none';
  el.style.opacity = '0.2';
  el.style.transform = 'translateY(-8px)';
  requestAnimationFrame(() => {
    el.textContent = val;
    el.style.transition = 'opacity 0.28s, transform 0.28s';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

setInterval(tick, 1000);
tick();

// ── Canvas Sparkle / Glitter Particles ────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Pink marble sparkle palette
  const COLORS = [
    [212, 175, 110],   // gold
    [232, 204, 144],   // light gold
    [201, 150, 122],   // rose gold
    [245, 191, 212],   // light pink
    [232, 160, 188],   // pink
    [255, 220, 235],   // pale pink
    [194,  84, 122],   // rose
  ];

  // Draw a 4-pointed sparkle star
  function drawSparkle(x, y, r, alpha, color) {
    const [cr, cg, cb] = color;
    const style = `rgba(${cr},${cg},${cb},${alpha})`;
    ctx.save();
    ctx.translate(x, y);

    // Thin cross beams
    ctx.strokeStyle = style;
    ctx.lineWidth = r * 0.55;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r * 2.2); ctx.lineTo(0, r * 2.2);
    ctx.moveTo(-r * 2.2, 0); ctx.lineTo(r * 2.2, 0);
    ctx.stroke();

    // Diagonal shorter beams
    ctx.lineWidth = r * 0.30;
    ctx.beginPath();
    ctx.moveTo(-r * 1.2, -r * 1.2); ctx.lineTo(r * 1.2, r * 1.2);
    ctx.moveTo( r * 1.2, -r * 1.2); ctx.lineTo(-r * 1.2, r * 1.2);
    ctx.stroke();

    // Center bright dot
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(cr + 40, 255)},${Math.min(cg + 40, 255)},${Math.min(cb + 40, 255)},${alpha})`;
    ctx.fill();

    ctx.restore();
  }

  class Dot {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x       = Math.random() * W;
      this.y       = initial ? Math.random() * H : H + 10;
      this.r       = Math.random() * 1.6 + 0.4;
      this.vy      = -(Math.random() * 0.45 + 0.08);
      this.vx      = (Math.random() - 0.5) * 0.28;
      this.life    = 0;
      this.maxLife = Math.random() * 280 + 160;
      this.phase   = Math.random() * Math.PI * 2;
      this.spin    = (Math.random() - 0.5) * 0.04;
      this.c       = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.type    = Math.random() > 0.60 ? 'star' : 'dot';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      this.phase += 0.065;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const twinkle  = 0.55 + 0.45 * Math.sin(this.phase);
      const alpha    = Math.sin(progress * Math.PI) * 0.70 * twinkle;

      if (this.type === 'star') {
        drawSparkle(this.x, this.y, this.r, alpha, this.c);
      } else {
        const [cr, cg, cb] = this.c;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < 90; i++) particles.push(new Dot());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── Nav scroll state ───────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60 || currentTab !== null);
}, { passive: true });

// ── Tab Navigation System ──────────────────────────────────────────
let currentTab = null;

function switchTab(tabName) {
  const panels = document.querySelectorAll('.tab-panel');
  const navLinks = document.querySelectorAll('.nav-links a[data-tab]');
  const wrapper = document.getElementById('tab-panels-wrapper');
  const heroEl = document.getElementById('home');
  const countdownEl = document.getElementById('countdown');
  const footer = document.querySelector('.footer');

  // Update active nav link
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
  });

  if (tabName === null) {
    // Go back to home — show hero+countdown, hide all tabs
    currentTab = null;
    panels.forEach(p => p.classList.remove('active'));
    if (heroEl) heroEl.style.display = '';
    if (countdownEl) countdownEl.style.display = '';
    if (footer) footer.style.display = '';
    if (wrapper) wrapper.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset nav scroll state
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    return;
  }

  currentTab = tabName;

  // Hide hero + countdown, show tab wrapper
  if (heroEl) heroEl.style.display = 'none';
  if (countdownEl) countdownEl.style.display = 'none';
  if (wrapper) wrapper.style.display = 'block';
  if (footer) footer.style.display = '';

  // Force nav scrolled state when viewing tabs
  if (nav) nav.classList.add('scrolled');

  // Switch panels
  panels.forEach(p => {
    if (p.getAttribute('data-panel') === tabName) {
      p.classList.add('active');
      // Re-trigger animation
      p.style.animation = 'none';
      p.offsetHeight; // force reflow
      p.style.animation = '';
    } else {
      p.classList.remove('active');
    }
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-trigger reveal animations for newly visible content
  setTimeout(() => {
    const revealEls = document.querySelectorAll('.tab-panel.active .reveal:not(.in)');
    revealEls.forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 70);
    });
  }, 100);
}

// ── Scroll reveal ──────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll(
    '.countdown-grid, .gift-grid, .stats-row, .form-wrapper, .section-heading, .eyebrow, .section-body, .guest-list-wrap, .gallery-grid'
  );
  els.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), i * 70);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Copy Account ───────────────────────────────────────────────────
function copyAccount(bank) {
  const numEl    = document.getElementById(bank + '-number');
  const copiedEl = document.getElementById('copied-' + bank);
  if (!numEl) return;

  const text = numEl.textContent.trim();
  if (!text || text === 'Coming Soon') {
    alert('Account number has not been added yet. Please check back later.');
    return;
  }

  const copy = (t) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t);
    } else {
      const ta = document.createElement('textarea');
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return Promise.resolve();
    }
  };

  copy(text).then(() => {
    if (!copiedEl) return;
    copiedEl.classList.add('show');
    setTimeout(() => copiedEl.classList.remove('show'), 2200);
  });
}

// ── Format Date ───────────────────────────────────────────────────
function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── Wishes (Firebase Realtime Database + Live Sync) ───────────────
async function loadWishes() {
  const fbData = await fbGet('wishes');
  if (fbData !== null) {
    const list = fbToArray(fbData).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    saveLocal(KEY_WISHES, list);
    return list;
  }
  // Server returned null (empty database / cleared by admin)
  saveLocal(KEY_WISHES, []);
  return [];
}

let lastWishesHash = '';

async function renderWishes(fromNetwork = true) {
  const display = document.getElementById('wishes-display');
  const empty   = document.getElementById('wishes-empty');
  if (!display) return;

  const wishes = fromNetwork ? await loadWishes() : loadLocal(KEY_WISHES);
  const hash = JSON.stringify(wishes);
  if (hash === lastWishesHash && display.children.length > 0) return;
  lastWishesHash = hash;

  renderWishesDOM(wishes, display, empty);
}

function renderWishesDOM(wishes, display, empty) {
  if (!display) return;
  display.innerHTML = '';
  if (!wishes || wishes.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  [...wishes].reverse().forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.style.animationDelay = (i * 0.05) + 's';
    card.innerHTML = `
      <p class="wish-card-name">${esc(w.name)}</p>
      <p class="wish-card-text">${esc(w.message)}</p>
      <p class="wish-card-time">${fmtDate(w.timestamp)}</p>
    `;
    display.appendChild(card);
  });
}

async function submitWish(e) {
  e.preventDefault();
  const nameEl = document.getElementById('wish-name');
  const msgEl  = document.getElementById('wish-message');
  const btn    = document.getElementById('submit-wish');
  if (!nameEl || !msgEl || !btn) return;

  const name    = nameEl.value.trim();
  const message = msgEl.value.trim();
  if (!name || !message) return;

  btn.disabled = true;
  btn.textContent = 'Sending...';

  const newWish = { name, message, timestamp: Date.now() };

  // Optimistic local update
  const local = loadLocal(KEY_WISHES);
  local.push(newWish);
  saveLocal(KEY_WISHES, local);
  renderWishes(false);

  // Push to Firebase Realtime Database
  await fbPost('wishes', newWish);

  nameEl.value = '';
  msgEl.value  = '';
  const cc = document.getElementById('char-count');
  if (cc) cc.textContent = '0 / 300';

  btn.textContent = 'Sent ✓';
  setTimeout(() => {
    btn.textContent = 'Send Wishes ✦';
    btn.disabled    = false;
  }, 2200);

  // Sync fresh state
  await renderWishes(true);
}

// Character counter for wishes textarea
const wishMsg = document.getElementById('wish-message');
const charEl  = document.getElementById('char-count');
if (wishMsg && charEl) {
  wishMsg.addEventListener('input', () => {
    charEl.textContent = wishMsg.value.length + ' / 300';
  });
}

// ── RSVP / Attendance (Firebase Realtime Database + Live Sync) ─────
async function loadRSVP() {
  const fbData = await fbGet('rsvp');
  if (fbData !== null) {
    const list = fbToArray(fbData).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    saveLocal(KEY_RSVP, list);
    return list;
  }
  // Server returned null (empty database / cleared by admin)
  saveLocal(KEY_RSVP, []);
  return [];
}

function updateStatsDOM(list) {
  if (!Array.isArray(list)) list = [];
  const hadir = list.filter(r => r.status === 'hadir').reduce((sum, r) => sum + (parseInt(r.pax, 10) || 1), 0);
  const tidak = list.filter(r => r.status === 'tidak').length;
  const totalReplies = list.length;
  animCount('count-hadir', hadir);
  animCount('count-tidak', tidak);
  animCount('count-total', totalReplies);
}

function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) return;

  let cur = start;
  const dir = target > start ? 1 : -1;
  const step = Math.max(1, Math.floor(Math.abs(target - start) / 8));

  const iv = setInterval(() => {
    if (Math.abs(target - cur) <= step) {
      cur = target;
      el.textContent = cur;
      clearInterval(iv);
    } else {
      cur += dir * step;
      el.textContent = cur;
    }
  }, 35);
}

let lastRSVPHash = '';

async function renderRSVP(fromNetwork = true) {
  const listEl  = document.getElementById('rsvp-list');
  const emptyEl = document.getElementById('rsvp-empty');
  if (!listEl) return;

  const list = fromNetwork ? await loadRSVP() : loadLocal(KEY_RSVP);
  const hash = JSON.stringify(list);
  if (hash === lastRSVPHash && listEl.children.length > 0) return;
  lastRSVPHash = hash;

  renderRSVPDOM(list, listEl, emptyEl);
  updateStatsDOM(list);
}

function renderRSVPDOM(list, listEl, emptyEl) {
  if (!listEl) return;
  listEl.innerHTML = '';
  if (!list || list.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    const titleEl = document.getElementById('guest-list-title');
    if (titleEl) titleEl.textContent = 'Guest List';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  const hadirPax = list.filter(r => r.status === 'hadir').reduce((sum, r) => sum + (parseInt(r.pax, 10) || 1), 0);
  const titleEl = document.getElementById('guest-list-title');
  if (titleEl) {
    titleEl.textContent = `Guest List (${hadirPax} Guests Attending)`;
  }

  [...list].reverse().forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'guest-entry';
    row.style.animationDelay = (i * 0.04) + 's';
    const isHadir = r.status === 'hadir';
    const paxNum = parseInt(r.pax, 10) || 1;
    const paxBadge = isHadir && paxNum > 1 ? `<span class="guest-pax">${paxNum} Guests</span>` : '';
    row.innerHTML = `
      <span class="guest-entry-name">${esc(r.name)}${paxBadge}</span>
      <span class="guest-entry-status ${isHadir ? 'hadir' : 'tidak'}">${isHadir ? 'Attending' : 'Not Attending'}</span>
    `;
    listEl.appendChild(row);
  });
}

// ── RSVP Lock Config (Ditutup karena acara sudah terlaksana pada 24 Oktober 2026) ──
const RSVP_CLOSED = true;

// ── RSVP Already-Submitted Key ───────────────────────────────────
const KEY_RSVP_DONE = 'vv_rsvp_done_v2';

function getRSVPDone() {
  try { return JSON.parse(localStorage.getItem(KEY_RSVP_DONE)); } catch { return null; }
}

function setRSVPDone(entry) {
  try { localStorage.setItem(KEY_RSVP_DONE, JSON.stringify(entry)); } catch {}
}

function showRSVPConfirmed(entry) {
  const wrapper = document.getElementById('rsvp-form-wrapper');
  if (!wrapper) return;
  const isHadir = entry.status === 'hadir';
  const paxNum = parseInt(entry.pax, 10) || 1;
  const paxText = isHadir && paxNum > 1 ? ` (${paxNum} Guests)` : '';
  wrapper.innerHTML = `
    <div class="rsvp-done-card">
      <div class="rsvp-done-icon">${isHadir ? '🎉' : '💌'}</div>
      <p class="rsvp-done-title">Thank you, ${esc(entry.name)}!</p>
      <p class="rsvp-done-status">
        Your attendance was recorded as
        <span class="rsvp-done-badge ${isHadir ? 'hadir' : 'tidak'}">
          ${isHadir ? 'Attended' + paxText + ' ✦' : 'Unable to Attend'}
        </span>
      </p>
      <p class="rsvp-done-note">The celebration took place on October 24, 2026. Thank you for being a part of Valerie's Sweet 17! 🌸</p>
    </div>
  `;
}

function showRSVPClosed() {
  const wrapper = document.getElementById('rsvp-form-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = `
    <div class="rsvp-closed-card" id="rsvp-closed-card">
      <div class="closed-badge">RSVP Closed ✦</div>
      <div class="rsvp-closed-icon">🥂 ✨</div>
      <h3 class="rsvp-closed-title">Thank You For Celebrating With Valerie!</h3>
      <p class="rsvp-closed-desc">
        RSVP is now officially closed as Valerie's Sweet 17 celebration took place on<br>
        <strong>Saturday, 24 October 2026</strong>.
      </p>
      <p class="rsvp-closed-sub">
        We are deeply grateful for the presence, love, and joy shared by all our dear family and friends! 🌸
      </p>
    </div>
  `;
}

async function submitRSVP(e) {
  e.preventDefault();
  if (RSVP_CLOSED) {
    alert('RSVP has officially closed as the event date has passed (October 24, 2026). Thank you! 🌸');
    return;
  }
  const nameEl   = document.getElementById('rsvp-name');
  const statusEl = document.querySelector('input[name="rsvp-status"]:checked');
  const paxEl    = document.getElementById('rsvp-pax');
  const btn      = document.getElementById('submit-rsvp');
  if (!nameEl || !statusEl || !btn) return;

  const name   = nameEl.value.trim();
  const status = statusEl.value;
  const pax    = status === 'hadir' ? (parseInt(paxEl ? paxEl.value : 1, 10) || 1) : 1;
  if (!name) return;

  btn.disabled = true;
  btn.textContent = 'Confirming...';

  const newEntry = { name, status, pax, timestamp: Date.now() };

  // Sanitize key for Firebase (disallowed: . # $ / [ ])
  const fbKey = encodeURIComponent(name.toLowerCase().replace(/[\.\#\$\/\[\]]/g, '_'));

  // Optimistic local update (deduplicate by lowercase name)
  const list = loadLocal(KEY_RSVP);
  const idx  = list.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    list[idx] = newEntry;
  } else {
    list.push(newEntry);
  }
  saveLocal(KEY_RSVP, list);
  renderRSVPDOM(list, document.getElementById('rsvp-list'), document.getElementById('rsvp-empty'));
  updateStatsDOM(list);

  // Save to Firebase Realtime Database
  await fbPut(`rsvp/${fbKey}`, newEntry);

  // Mark this browser as already submitted — hide form permanently
  setRSVPDone(newEntry);

  // Sync fresh state from server
  await renderRSVP(true);

  // Replace form with confirmation card
  showRSVPConfirmed(newEntry);
}

// ── ⚡ Real-Time Live Sync (Server-Sent Events + Polling) ───────────
function initLiveSync() {
  // 1. Firebase Server-Sent Events (SSE) for instant push
  function connectSSE(path, onDataChanged) {
    try {
      if (typeof window.EventSource === 'undefined') return null;
      const es = new EventSource(`${FIREBASE_URL}/${path}.json`);

      es.addEventListener('put', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.data !== undefined) {
            onDataChanged();
          }
        } catch {}
      });

      es.addEventListener('patch', () => {
        onDataChanged();
      });

      es.onerror = () => {
        // Disconnected or sleeping tab, close and rely on polling fallback
        try { es.close(); } catch {}
      };

      return es;
    } catch {
      return null;
    }
  }

  // Connect live listeners for RSVP, Wishes, and Gallery
  connectSSE('rsvp', () => renderRSVP(true));
  connectSSE('wishes', () => renderWishes(true));
  connectSSE('gallery', () => renderGallery(true));

  // 2. Periodic Polling fallback (every 60 seconds / 1 minute)
  setInterval(() => {
    renderRSVP(true);
    renderWishes(true);
    renderGallery(true);
  }, 60000);

  // 3. Tab Visibility / Focus refresh (when returning from mobile sleep / another tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      renderRSVP(true);
      renderWishes(true);
      renderGallery(true);
    }
  });

  window.addEventListener('focus', () => {
    renderRSVP(true);
    renderWishes(true);
    renderGallery(true);
  });
}

// ── Background Music via YouTube IFrame API ──────────────────────
const YT_VIDEO_ID = 'kKHRfUt6cKo';
let ytPlayer       = null;
let ytReady        = false;
let ytPlayPending  = false;

// Called automatically by YouTube API when ready
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    videoId: YT_VIDEO_ID,
    playerVars: {
      autoplay:       0,
      controls:       0,
      loop:           1,
      playlist:       YT_VIDEO_ID,
      modestbranding: 1,
      rel:            0,
      iv_load_policy: 3,
      fs:             0,
      disablekb:      1,
    },
    events: {
      onReady: (e) => {
        ytReady = true;
        e.target.setVolume(0);
        if (ytPlayPending) {
          ytPlayPending = false;
          startYTMusic();
        }
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) {
          ytPlayer.playVideo(); // fallback loop
        }
      },
    },
  });
}

function startYTMusic() {
  if (!ytPlayer || !ytReady) { ytPlayPending = true; return; }
  ytPlayer.setVolume(0);
  ytPlayer.playVideo();
  // Fade volume in over ~2s
  let vol = 0;
  const iv = setInterval(() => {
    vol = Math.min(vol + 2, 60);
    ytPlayer.setVolume(vol);
    if (vol >= 60) clearInterval(iv);
  }, 66);
}

// Reliable background music player (HTML5 native first for mobile, YouTube as backup)
function playBgMusic() {
  const audio = document.getElementById('bg-audio');
  if (audio) {
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Fade in volume smoothly
        let vol = 0;
        const iv = setInterval(() => {
          vol = Math.min(vol + 0.05, 0.75);
          audio.volume = vol;
          if (vol >= 0.75) clearInterval(iv);
        }, 80);
      }).catch((e) => {
        console.log('[Audio] HTML5 audio blocked or error, falling back to YouTube:', e);
        startYTMusic();
      });
    }
  } else {
    startYTMusic();
  }
}

// ── Gift Modal Actions & Copy ────────────────────────────────────
function openGiftModal() {
  const modal = document.getElementById('gift-modal');
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeGiftModal() {
  const modal = document.getElementById('gift-modal');
  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function copyAccount(accNum, copiedId) {
  const textToCopy = accNum || '0223233501';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showCopiedToast(copiedId);
    }).catch(() => {
      fallbackCopy(textToCopy, copiedId);
    });
  } else {
    fallbackCopy(textToCopy, copiedId);
  }
}

function fallbackCopy(text, copiedId) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showCopiedToast(copiedId);
  } catch {}
  document.body.removeChild(ta);
}

function showCopiedToast(copiedId) {
  const el = document.getElementById(copiedId || 'copied-bca');
  if (el) {
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  }
}

// ── DOMContentLoaded Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Hide tab panels on load (show home view)
  const tabWrapper = document.getElementById('tab-panels-wrapper');
  if (tabWrapper) tabWrapper.style.display = 'none';

  renderWishes(true);
  renderRSVP(true);
  renderGallery(true);
  initLiveSync();
  initReveal();
  initGalleryUpload();
  updateGalleryUploadLock();

  // Check if this browser already submitted RSVP
  const doneEntry = getRSVPDone();
  if (doneEntry) {
    showRSVPConfirmed(doneEntry);
  } else if (RSVP_CLOSED) {
    showRSVPClosed();
  }

  // Toggle Number of Guests field based on attendance selection
  const hadirRadio = document.getElementById('rsvp-hadir');
  const tidakRadio = document.getElementById('rsvp-tidak');
  const paxField   = document.getElementById('field-rsvp-pax');
  if (hadirRadio && tidakRadio && paxField) {
    hadirRadio.addEventListener('change', () => {
      paxField.style.display = '';
    });
    tidakRadio.addEventListener('change', () => {
      paxField.style.display = 'none';
    });
  }

  // Splash screen handling
  const splash    = document.getElementById('splash');
  const splashBtn = document.getElementById('splash-enter');

  function dismissSplash() {
    if (!splash) return;
    splash.classList.add('hide');
    setTimeout(() => {
      try { splash.remove(); } catch {}
    }, 650);
    playBgMusic();
  }

  if (splashBtn) splashBtn.addEventListener('click', dismissSplash);
  if (splash) {
    splash.addEventListener('click', (e) => {
      if (e.target === splash) dismissSplash();
    });
  }
});

// ================================================================
//   GALLERY / MEMORIES — Cloudinary CDN + Firebase Live Sync
// ================================================================

const KEY_GALLERY = 'vv_gallery_v2';
const KEY_MY_UPLOADS = 'vv_my_gallery_keys_v2';
const KEY_UPLOADER_TOKEN = 'vv_uploader_token_v2';
const CLOUDINARY_CLOUD_NAME = 'ma5jhjtt';
const CLOUDINARY_UPLOAD_PRESET = 'valerie_gallery';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit for photos & videos
const MAX_BATCH_FILES = 20; // Max 20 files per batch
const GALLERY_PAGE_SIZE = 16;
let galleryVisibleCount = 16;
let gallerySelectedFiles = [];
let galleryItems = [];
let lightboxSortedIdx = 0;

// ── Ownership / Permission Helpers ─────────────────────────────────
function getUploaderToken() {
  let token = localStorage.getItem(KEY_UPLOADER_TOKEN);
  if (!token) {
    token = 'up_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    try { localStorage.setItem(KEY_UPLOADER_TOKEN, token); } catch {}
  }
  return token;
}

function getMyUploadKeys() {
  try {
    return JSON.parse(localStorage.getItem(KEY_MY_UPLOADS)) || [];
  } catch {
    return [];
  }
}

function saveMyUploadKey(keyOrId) {
  if (!keyOrId) return;
  const keys = getMyUploadKeys();
  if (!keys.includes(keyOrId)) {
    keys.push(keyOrId);
    try { localStorage.setItem(KEY_MY_UPLOADS, JSON.stringify(keys)); } catch {}
  }
}

function isMyMemory(item) {
  if (!item) return false;
  if (sessionStorage.getItem('gallery_admin_mode') === 'true') return true;

  const myToken = getUploaderToken();
  if (item.uploaderToken && item.uploaderToken === myToken) return true;

  const myKeys = getMyUploadKeys();
  if (item._key && myKeys.includes(item._key)) return true;
  if (item.timestamp && myKeys.includes(item.timestamp)) return true;
  if (item.mediaUrl && myKeys.includes(item.mediaUrl)) return true;

  return false;
}

// ── Gallery Lock Config (Dibuka saat Hari H: 24 Oktober 2026) ─────────
const GALLERY_EVENT_DATE = new Date('2026-10-24T00:00:00+07:00');
const FORCE_OPEN_GALLERY_UPLOAD = false; // Ubah ke true jika ingin membuka sekarang

function isGalleryUploadOpen() {
  return FORCE_OPEN_GALLERY_UPLOAD || (Date.now() >= GALLERY_EVENT_DATE.getTime());
}

function updateGalleryUploadLock() {
  const uploadWrap = document.getElementById('gallery-upload-wrapper');
  const closedCard = document.getElementById('gallery-closed-card');
  const isOpen = isGalleryUploadOpen();

  if (uploadWrap) {
    uploadWrap.style.display = isOpen ? 'block' : 'none';
  }
  if (closedCard) {
    closedCard.style.display = isOpen ? 'none' : 'block';
  }
}

// ── Gallery Upload UI Setup (Multi-File Drag & Drop + Previews) ─────
function initGalleryUpload() {
  const dropzone    = document.getElementById('gallery-dropzone');
  const fileInput   = document.getElementById('gallery-file');
  const previewWrap = document.getElementById('dropzone-preview');
  const content     = document.getElementById('dropzone-content');
  const previewGrid = document.getElementById('preview-grid');
  const countBadge  = document.getElementById('preview-count-badge');
  const addMoreBtn  = document.getElementById('preview-add-more');
  const clearAllBtn = document.getElementById('preview-clear-all');
  const submitBtn   = document.getElementById('submit-gallery');
  const heading     = document.getElementById('gallery-heading');

  // Secret admin moderation mode trigger (5 clicks on Gallery heading)
  if (heading) {
    let clickCount = 0;
    let clickTimer = null;
    heading.style.cursor = 'pointer';
    heading.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 2500);
      if (clickCount >= 5) {
        clickCount = 0;
        const currentAdmin = sessionStorage.getItem('gallery_admin_mode') === 'true';
        if (currentAdmin) {
          sessionStorage.removeItem('gallery_admin_mode');
          alert('Admin moderation mode turned OFF.');
          renderGalleryDOM();
        } else {
          const pin = prompt('Enter Admin PIN to manage memories:');
          if (pin === '2410' || pin === '1717') {
            sessionStorage.setItem('gallery_admin_mode', 'true');
            alert('Admin moderation mode activated! You can now manage all memories.');
            renderGalleryDOM();
          } else if (pin !== null) {
            alert('Incorrect PIN.');
          }
        }
      }
    });
  }

  if (!dropzone || !fileInput) return;

  // Click to browse (ignoring internal action buttons)
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#preview-add-more') || e.target.closest('#preview-clear-all') || e.target.closest('.preview-item-remove')) return;
    fileInput.click();
  });

  // Add more files button
  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // Clear all button
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearFilePreview();
    });
  }

  // Drag & Drop
  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFilesSelected(files);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) handleFilesSelected(fileInput.files);
    fileInput.value = ''; // Reset input value so same files can be re-selected if removed
  });

  function handleFilesSelected(fileList) {
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    const validFiles = [];
    for (const file of incoming) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        alert(`File "${file.name}" is not an image or video and was skipped.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds the 50 MB limit and was skipped.`);
        continue;
      }
      const already = gallerySelectedFiles.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
      if (!already) {
        validFiles.push(file);
      }
    }

    if (gallerySelectedFiles.length + validFiles.length > MAX_BATCH_FILES) {
      alert(`You can upload a maximum of ${MAX_BATCH_FILES} files at once.`);
      const remainingSlots = Math.max(0, MAX_BATCH_FILES - gallerySelectedFiles.length);
      validFiles.splice(remainingSlots);
    }

    gallerySelectedFiles = gallerySelectedFiles.concat(validFiles);
    renderPreviews();
  }

  function renderPreviews() {
    if (!previewGrid || !content || !previewWrap) return;

    if (gallerySelectedFiles.length === 0) {
      content.style.display = 'flex';
      previewWrap.style.display = 'none';
      previewGrid.innerHTML = '';
      if (submitBtn) submitBtn.textContent = 'Upload Memories ✦';
      return;
    }

    content.style.display = 'none';
    previewWrap.style.display = 'flex';
    previewGrid.innerHTML = '';

    const count = gallerySelectedFiles.length;
    if (countBadge) {
      countBadge.textContent = `${count} ${count === 1 ? 'file' : 'files'} selected`;
    }
    if (submitBtn) {
      submitBtn.textContent = `Upload ${count} ${count === 1 ? 'Memory' : 'Memories'} ✦`;
    }

    gallerySelectedFiles.forEach((file, idx) => {
      const isVideo = file.type.startsWith('video/');
      const card = document.createElement('div');
      card.className = 'preview-card';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'preview-item-remove';
      removeBtn.innerHTML = '×';
      removeBtn.title = `Remove ${file.name}`;
      removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        gallerySelectedFiles.splice(idx, 1);
        renderPreviews();
      };

      if (isVideo) {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(file);
        vid.muted = true;
        vid.playsInline = true;
        card.appendChild(vid);

        const badge = document.createElement('span');
        badge.className = 'preview-video-badge';
        badge.textContent = '🎬 Video';
        card.appendChild(badge);
      } else {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        card.appendChild(img);
      }

      card.appendChild(removeBtn);
      previewGrid.appendChild(card);
    });
  }

  function clearFilePreview() {
    gallerySelectedFiles = [];
    fileInput.value = '';
    renderPreviews();
  }

  window._clearGalleryPreview = clearFilePreview;
}

// ── Upload directly to Cloudinary with real progress ────────────────
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fd.append('file', file);

    xhr.open('POST', CLOUDINARY_UPLOAD_URL);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      try {
        const resp = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && resp.secure_url) {
          resolve(resp);
        } else {
          reject(new Error((resp.error && resp.error.message) || 'Upload failed'));
        }
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
}

// ── Submit Gallery Upload (Batch Multi-File) ────────────────────────
async function submitGallery(e) {
  e.preventDefault();
  const nameEl = document.getElementById('gallery-name');
  const btn    = document.getElementById('submit-gallery');
  const progressWrap = document.getElementById('upload-progress');
  const progressBar  = document.getElementById('upload-progress-bar');
  const progressText = document.getElementById('upload-progress-text');

  if (!isGalleryUploadOpen()) {
    alert('Photo & video sharing will officially open on the day of celebration (October 24, 2026)! 🌸');
    return;
  }

  if (!nameEl || !btn || !gallerySelectedFiles.length) {
    if (!gallerySelectedFiles.length) alert('Please select at least one photo or video to upload.');
    return;
  }

  const name = nameEl.value.trim();
  if (!name) return;

  const total = gallerySelectedFiles.length;
  btn.disabled = true;
  btn.textContent = `Uploading 1 of ${total}...`;

  if (progressWrap) progressWrap.style.display = 'block';
  setProgress(2, `Starting upload (0 of ${total})...`);

  const uploaderToken = getUploaderToken();
  let successCount = 0;
  const failedFiles = [];

  for (let i = 0; i < total; i++) {
    const file = gallerySelectedFiles[i];
    const isVideo = file.type.startsWith('video/');
    const fileBasePct = (i / total) * 100;
    const fileWeight = 100 / total;

    try {
      setProgress(Math.round(fileBasePct + 2), `Uploading ${i + 1} of ${total}: ${file.name}...`);

      const uploadRes = await uploadToCloudinary(file, (pct) => {
        const overall = Math.round(fileBasePct + ((pct / 100) * fileWeight));
        setProgress(Math.min(95, overall), `Uploading ${i + 1} of ${total} (${pct}%)...`);
      });

      // Optimized thumbnail
      let thumbUrl = uploadRes.secure_url;
      if (isVideo) {
        thumbUrl = uploadRes.secure_url.replace(/\.[^/.]+$/, ".jpg");
      } else if (thumbUrl.includes('/image/upload/')) {
        thumbUrl = thumbUrl.replace('/image/upload/', '/image/upload/w_600,c_fill,q_auto,f_auto/');
      }

      const entry = {
        name,
        mediaType: isVideo ? 'video' : 'image',
        mediaUrl: uploadRes.secure_url,
        thumbnail: thumbUrl,
        timestamp: Date.now() + i,
        fileName: file.name,
        uploaderToken: uploaderToken
      };

      // Push to Firebase RTDB
      const fbRes = await fbPost('gallery', entry);
      const assignedKey = fbRes && fbRes.name ? fbRes.name : null;
      if (assignedKey) entry._key = assignedKey;

      // Track ownership locally
      saveMyUploadKey(assignedKey);
      saveMyUploadKey(entry.mediaUrl);
      saveMyUploadKey(entry.timestamp);

      // Optimistic local add
      const local = loadLocal(KEY_GALLERY);
      local.push(entry);
      saveLocal(KEY_GALLERY, local);
      galleryItems = local;

      successCount++;
    } catch (fileErr) {
      console.error(`[Gallery] Error uploading ${file.name}:`, fileErr);
      failedFiles.push(file.name);
    }
  }

  // Done processing all files
  renderGalleryDOM();
  setProgress(100, `Completed! ${successCount} of ${total} uploaded.`);

  if (window._clearGalleryPreview) window._clearGalleryPreview();

  setTimeout(() => {
    btn.textContent = `Uploaded ${successCount} ${successCount === 1 ? 'Memory' : 'Memories'} ✓`;
    setTimeout(() => {
      btn.textContent = 'Upload Memories ✦';
      btn.disabled = false;
      if (progressWrap) progressWrap.style.display = 'none';
      setProgress(0, 'Uploading...');
    }, 2500);
  }, 600);

  lastGalleryHash = ''; // Invalidate dirty-check so renderGallery updates
  await renderGallery(true);

  if (failedFiles.length > 0) {
    alert(`${successCount} file(s) uploaded successfully. However, ${failedFiles.length} file(s) failed: ${failedFiles.join(', ')}.`);
  }

  function setProgress(pct, text) {
    if (progressBar)  progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = text;
  }
}

// ── Load Gallery from Firebase ──────────────────────────────────────
async function loadGallery() {
  const fbData = await fbGet('gallery');
  if (fbData !== null) {
    const list = fbToArray(fbData).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    saveLocal(KEY_GALLERY, list);
    return list;
  }
  return loadLocal(KEY_GALLERY);
}

let lastGalleryHash = '';

async function renderGallery(fromNetwork = true) {
  if (fromNetwork) {
    galleryItems = await loadGallery();
  } else {
    galleryItems = loadLocal(KEY_GALLERY);
  }
  const hash = JSON.stringify(galleryItems ? galleryItems.map(i => i.id || i.public_id || i.mediaUrl || i.timestamp) : []);
  const grid = document.getElementById('gallery-grid');
  if (hash === lastGalleryHash && grid && grid.children.length > 0) return;
  lastGalleryHash = hash;

  renderGalleryDOM();
}

function renderGalleryDOM() {
  const grid  = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const loadMoreWrap = document.getElementById('gallery-load-more-wrap');
  const loadMoreBtn  = document.getElementById('gallery-load-more');
  if (!grid) return;

  grid.innerHTML = '';

  if (!galleryItems || galleryItems.length === 0) {
    if (empty) empty.style.display = 'block';
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';

  // Newest first
  const sorted = [...galleryItems].reverse();
  const total = sorted.length;
  const visibleList = sorted.slice(0, galleryVisibleCount);

  visibleList.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.animationDelay = (Math.min(i, 16) * 0.04) + 's';
    card.onclick = () => openLightbox(i);

    const isVideo = item.mediaType === 'video';
    const mediaSrc = item.mediaUrl || item.mediaData || '';
    const thumbSrc = item.thumbnail || (isVideo ? mediaSrc.replace(/\.[^/.]+$/, ".jpg") : mediaSrc);

    let mediaHTML;
    if (isVideo) {
      mediaHTML = `
        <div class="gallery-card-media">
          ${thumbSrc ? `<img src="${thumbSrc}" alt="Video thumbnail" loading="lazy" />` : `<div style="width:100%;height:100%;background:var(--blush-light);display:flex;align-items:center;justify-content:center;"><span style="font-size:2rem;">🎬</span></div>`}
          <div class="gallery-card-play">
            <div class="gallery-card-play-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          </div>
          <span class="gallery-card-badge">Video</span>
        </div>
      `;
    } else {
      mediaHTML = `
        <div class="gallery-card-media">
          <img src="${thumbSrc}" alt="Photo by ${esc(item.name)}" loading="lazy" />
        </div>
      `;
    }

    const canDelete = isMyMemory(item);
    const deleteBtnHTML = canDelete ? `
      <button type="button" class="gallery-card-delete-btn" onclick="event.stopPropagation(); deleteMediaByIndex(${i})" title="Hapus Foto Saya" aria-label="Hapus Foto">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>
    ` : '';

    card.innerHTML = `
      ${mediaHTML}
      <div class="gallery-card-info">
        <div class="gallery-card-meta">
          <p class="gallery-card-name">${esc(item.name)}</p>
          <p class="gallery-card-time">${fmtDate(item.timestamp)}</p>
        </div>
        <div class="gallery-card-actions">
          <button type="button" class="gallery-card-download-btn" onclick="event.stopPropagation(); downloadMediaByIndex(${i})" title="Download ${isVideo ? 'Video' : 'Photo'}" aria-label="Download ${isVideo ? 'video' : 'photo'}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download</span>
          </button>
          ${deleteBtnHTML}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Handle Load More Button
  if (loadMoreWrap && loadMoreBtn) {
    if (galleryVisibleCount < total) {
      const remaining = total - galleryVisibleCount;
      loadMoreWrap.style.display = 'flex';
      loadMoreBtn.innerHTML = `Load More Memories (${remaining} remaining) ✦`;
    } else {
      loadMoreWrap.style.display = 'none';
    }
  }
}

function loadMoreGallery() {
  galleryVisibleCount += GALLERY_PAGE_SIZE;
  renderGalleryDOM();
}
window.loadMoreGallery = loadMoreGallery;

// ── Lightbox ────────────────────────────────────────────────────────
function openLightbox(sortedIdx) {
  lightboxSortedIdx = sortedIdx;
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  renderLightboxContent();
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  document.addEventListener('keydown', lightboxKeyHandler);
}

function closeLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  const vid = lightbox.querySelector('video');
  if (vid) { vid.pause(); vid.src = ''; }

  document.removeEventListener('keydown', lightboxKeyHandler);
}

function lightboxNav(dir) {
  if (!galleryItems.length) return;
  const total = galleryItems.length;
  lightboxSortedIdx = (lightboxSortedIdx + dir + total) % total;
  renderLightboxContent();
}

function lightboxKeyHandler(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
}

function renderLightboxContent() {
  const mediaEl = document.getElementById('lightbox-media');
  const infoEl  = document.getElementById('lightbox-info');
  const sorted = [...galleryItems].reverse();
  const item = sorted[lightboxSortedIdx];
  if (!mediaEl || !item) return;

  const isVideo = item.mediaType === 'video';
  const mediaSrc = item.mediaUrl || item.mediaData || '';

  if (isVideo) {
    mediaEl.innerHTML = `<video src="${mediaSrc}" controls autoplay playsinline style="max-width:85vw;max-height:75vh;border-radius:16px;box-shadow:0 16px 80px rgba(0,0,0,0.5);"></video>`;
  } else {
    mediaEl.innerHTML = `<img src="${mediaSrc}" alt="Photo by ${esc(item.name)}" />`;
  }

  if (infoEl) {
    const canDelete = isMyMemory(item);
    const deleteBtnHTML = canDelete ? `
      <button type="button" class="lightbox-delete-btn" onclick="deleteCurrentMedia()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        <span>Delete 🗑️</span>
      </button>
    ` : '';

    infoEl.innerHTML = `
      <div class="lightbox-info-meta">
        <p class="lightbox-info-name">${esc(item.name)}</p>
        <p class="lightbox-info-time">${fmtDate(item.timestamp)}</p>
      </div>
      <div class="lightbox-actions">
        <button type="button" class="lightbox-save-btn" onclick="downloadCurrentMedia()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Save ${isVideo ? 'Video' : 'Photo'} 💾</span>
        </button>
        ${deleteBtnHTML}
      </div>
    `;
  }
}

// ── Media Download / Save Helpers ───────────────────────────────────
function getAttachmentUrl(url) {
  if (!url) return '';
  if (url.includes('/upload/') && !url.includes('fl_attachment')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
}

function triggerDownload(url, filename) {
  if (!url) return;

  // Base64 fallback (if any legacy data exists)
  if (url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'valerie-sweet17-memory';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
    return;
  }

  const downloadUrl = getAttachmentUrl(url);

  // Fetch as blob for instant native download
  fetch(downloadUrl)
    .then(res => {
      if (!res.ok) throw new Error('Fetch failed');
      return res.blob();
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'valerie-sweet17-memory';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 500);
    })
    .catch(() => {
      // Fallback: direct anchor with attachment header
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || 'valerie-sweet17-memory';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 300);
    });
}

function downloadMediaByIndex(sortedIdx) {
  const sorted = [...galleryItems].reverse();
  const item = sorted[sortedIdx];
  if (!item) return;

  const isVideo = item.mediaType === 'video';
  const url = item.mediaUrl || item.mediaData;
  const ext = isVideo ? 'mp4' : 'jpg';
  const safeName = (item.name || 'memory').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `valerie_sweet17_${safeName}_${item.timestamp || Date.now()}.${ext}`;

  triggerDownload(url, filename);
}
window.downloadMediaByIndex = downloadMediaByIndex;

function downloadCurrentMedia() {
  downloadMediaByIndex(lightboxSortedIdx);
}
window.downloadCurrentMedia = downloadCurrentMedia;

// ── Media Delete Helpers ──────────────────────────────────────────
async function deleteMediaByIndex(sortedIdx) {
  const sorted = [...galleryItems].reverse();
  const item = sorted[sortedIdx];
  if (!item) return;

  if (!isMyMemory(item)) {
    alert('Kamu hanya bisa menghapus foto atau video yang kamu upload sendiri. 🔒');
    return;
  }

  const confirmDelete = confirm(`Hapus kenangan dari "${item.name}" dari galeri?`);
  if (!confirmDelete) return;

  const key = item._key;

  try {
    if (key) {
      await fbDelete('gallery/' + key);
    }

    // Clean from local ownership keys
    const keys = getMyUploadKeys().filter(k => k !== key && k !== item.timestamp && k !== item.mediaUrl);
    try { localStorage.setItem(KEY_MY_UPLOADS, JSON.stringify(keys)); } catch {}

    // Remove from local items
    galleryItems = galleryItems.filter(it => it._key !== key && it.timestamp !== item.timestamp);
    saveLocal(KEY_GALLERY, galleryItems);
    lastGalleryHash = '';
    renderGalleryDOM();

    // Close lightbox if open
    closeLightbox();

    alert('Foto/video berhasil dihapus dari galeri! 🗑️');
    
    // Refresh from network to sync with all devices
    await renderGallery(true);
  } catch (err) {
    console.error('[Gallery] Delete error:', err);
    alert('Terjadi kesalahan saat menghapus. Silakan coba lagi.');
  }
}
window.deleteMediaByIndex = deleteMediaByIndex;

function deleteCurrentMedia() {
  deleteMediaByIndex(lightboxSortedIdx);
}
window.deleteCurrentMedia = deleteCurrentMedia;



