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
const KEY_WISHES = 'vv_wishes_v2';
const KEY_RSVP   = 'vv_rsvp_v2';

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
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Scroll reveal ──────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll(
    '.countdown-grid, .gift-grid, .stats-row, .form-wrapper, .section-heading, .eyebrow, .section-body, .guest-list-wrap'
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
  return loadLocal(KEY_WISHES);
}

async function renderWishes(fromNetwork = true) {
  const display = document.getElementById('wishes-display');
  const empty   = document.getElementById('wishes-empty');
  if (!display) return;

  // Always show cached/local first for zero perceived latency
  let wishes = loadLocal(KEY_WISHES);
  renderWishesDOM(wishes, display, empty);

  if (fromNetwork) {
    wishes = await loadWishes();
    renderWishesDOM(wishes, display, empty);
  }
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
  return loadLocal(KEY_RSVP);
}

function updateStatsDOM(list) {
  if (!Array.isArray(list)) return;
  const hadir = list.filter(r => r.status === 'hadir').length;
  const tidak = list.filter(r => r.status === 'tidak').length;
  animCount('count-hadir', hadir);
  animCount('count-tidak', tidak);
  animCount('count-total', list.length);
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

async function renderRSVP(fromNetwork = true) {
  const listEl  = document.getElementById('rsvp-list');
  const emptyEl = document.getElementById('rsvp-empty');
  if (!listEl) return;

  // Render from local cache first for instant response
  let list = loadLocal(KEY_RSVP);
  renderRSVPDOM(list, listEl, emptyEl);
  updateStatsDOM(list);

  if (fromNetwork) {
    list = await loadRSVP();
    renderRSVPDOM(list, listEl, emptyEl);
    updateStatsDOM(list);
  }
}

function renderRSVPDOM(list, listEl, emptyEl) {
  if (!listEl) return;
  listEl.innerHTML = '';
  if (!list || list.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  [...list].reverse().forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'guest-entry';
    row.style.animationDelay = (i * 0.04) + 's';
    const isHadir = r.status === 'hadir';
    row.innerHTML = `
      <span class="guest-entry-name">${esc(r.name)}</span>
      <span class="guest-entry-status ${isHadir ? 'hadir' : 'tidak'}">${isHadir ? 'Attending' : 'Not Attending'}</span>
    `;
    listEl.appendChild(row);
  });
}

// ── RSVP Already-Submitted Key ───────────────────────────────────
const KEY_RSVP_DONE = 'vv_rsvp_done_v1';

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
  wrapper.innerHTML = `
    <div class="rsvp-done-card">
      <div class="rsvp-done-icon">${isHadir ? '🎉' : '💌'}</div>
      <p class="rsvp-done-title">Thank you, ${esc(entry.name)}!</p>
      <p class="rsvp-done-status">
        You have confirmed as
        <span class="rsvp-done-badge ${isHadir ? 'hadir' : 'tidak'}">
          ${isHadir ? 'Attending ✦' : 'Not Attending'}
        </span>
      </p>
      <p class="rsvp-done-note">Your response has been recorded. We look forward to celebrating with you! 🌸</p>
    </div>
  `;
}

async function submitRSVP(e) {
  e.preventDefault();
  const nameEl   = document.getElementById('rsvp-name');
  const statusEl = document.querySelector('input[name="rsvp-status"]:checked');
  const btn      = document.getElementById('submit-rsvp');
  if (!nameEl || !statusEl || !btn) return;

  const name   = nameEl.value.trim();
  const status = statusEl.value;
  if (!name) return;

  btn.disabled = true;
  btn.textContent = 'Confirming...';

  const newEntry = { name, status, timestamp: Date.now() };

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

  // Connect live listeners for RSVP and Wishes
  connectSSE('rsvp', () => renderRSVP(true));
  connectSSE('wishes', () => renderWishes(true));

  // 2. Periodic Polling fallback (every 7 seconds)
  setInterval(() => {
    renderRSVP(true);
    renderWishes(true);
  }, 7000);

  // 3. Tab Visibility / Focus refresh (when returning from mobile sleep / another tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      renderRSVP(true);
      renderWishes(true);
    }
  });

  window.addEventListener('focus', () => {
    renderRSVP(true);
    renderWishes(true);
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

// Keep backwards-compat alias used by dismissSplash
function playBgMusic() {
  startYTMusic();
}

// ── Gift Modal Actions ───────────────────────────────────────────
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

// ── DOMContentLoaded Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderWishes(true);
  renderRSVP(true);
  initLiveSync();
  initReveal();

  // Check if this browser already submitted RSVP
  const doneEntry = getRSVPDone();
  if (doneEntry) showRSVPConfirmed(doneEntry);

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
