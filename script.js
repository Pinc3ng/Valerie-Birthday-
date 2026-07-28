/* ================================================================
   VALLERIE VALENCIA — SWEET SEVENTEEN
   JavaScript: Countdown · Canvas Particles · Wishes · RSVP · Copy
   ================================================================ */

'use strict';

// ── 🔥 Firebase Config ─────────────────────────────────────────────
// GANTI URL ini dengan Firebase Realtime Database URL kamu!
// Contoh: 'https://nama-project-default-rtdb.asia-southeast1.firebasedatabase.app'
const FIREBASE_URL = 'https://web-app-demo-vincent-default-rtdb.asia-southeast1.firebasedatabase.app';

// ── Firebase REST Helpers ──────────────────────────────────────────
async function fbGet(path) {
  try {
    const res  = await fetch(`${FIREBASE_URL}/${path}.json`);
    const data = await res.json();
    return data;
  } catch { return null; }
}

async function fbPost(path, data) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch { return null; }
}

async function fbPatch(path, data) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch { return null; }
}

// Convert Firebase object { key: {…}, key2: {…} } → array
function fbToArray(obj) {
  if (!obj) return [];
  return Object.entries(obj).map(([key, val]) => ({ _key: key, ...val }));
}

// Firebase ready check
function isFirebaseReady() {
  return FIREBASE_URL && FIREBASE_URL !== 'PASTE_FIREBASE_URL_KAMU_DISINI';
}

// ── XSS ────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

// ── Countdown ──────────────────────────────────────────────────────
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
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);

  setNum('days',    pad(d, 3));
  setNum('hours',   pad(h));
  setNum('minutes', pad(m));
  setNum('seconds', pad(s));
}

function setNum(id, val) {
  const el = document.getElementById(id);
  if (!el || el.textContent === val) return;
  el.style.transition = 'none';
  el.style.opacity = '0.3';
  el.style.transform = 'translateY(-6px)';
  requestAnimationFrame(() => {
    el.textContent = val;
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

setInterval(tick, 1000);
tick();

// ── Canvas Particles ───────────────────────────────────────────────
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

  // Subtle gold dust particles
  const GOLD  = [196, 169, 106];
  const ROSE  = [154, 80, 96];

  class Dot {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.vx = (Math.random() - 0.5) * 0.2;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
      this.c = Math.random() > 0.6 ? ROSE : GOLD;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.c[0]},${this.c[1]},${this.c[2]},${alpha})`;
      ctx.fill();
    }
  }

  // Create initial pool
  for (let i = 0; i < 60; i++) particles.push(new Dot());

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
    '.countdown-grid, .gallery-grid, .gift-grid, .stats-row, .form-wrapper, .section-heading, .eyebrow, .section-body, .guest-list-wrap'
  );
  els.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

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
    if (navigator.clipboard) {
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
    setTimeout(() => copiedEl.classList.remove('show'), 2000);
  });
}

// ── Format Date ───────────────────────────────────────────────────
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── Wishes ────────────────────────────────────────────────────────
async function renderWishes() {
  const display = document.getElementById('wishes-display');
  const empty   = document.getElementById('wishes-empty');
  if (!display) return;

  if (!isFirebaseReady()) {
    display.innerHTML = '<p style="text-align:center;opacity:0.5;padding:2rem;">⚙️ Firebase belum dikonfigurasi.</p>';
    if (empty) empty.style.display = 'none';
    return;
  }

  const raw    = await fbGet('wishes');
  const wishes = fbToArray(raw).sort((a, b) => b.timestamp - a.timestamp);

  display.innerHTML = '';

  if (wishes.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  wishes.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.style.animationDelay = (i * 0.07) + 's';
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
  if (!nameEl || !msgEl) return;

  const name    = nameEl.value.trim();
  const message = msgEl.value.trim();
  if (!name || !message) return;

  if (!isFirebaseReady()) {
    alert('Firebase belum dikonfigurasi. Hubungi pengelola website.');
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled    = true;

  await fbPost('wishes', { name, message, timestamp: Date.now() });

  nameEl.value = '';
  msgEl.value  = '';
  const charCount = document.getElementById('char-count');
  if (charCount) charCount.textContent = '0 / 300';

  btn.textContent = '✓ Sent!';
  setTimeout(() => {
    btn.textContent = 'Send Wishes';
    btn.disabled    = false;
  }, 2000);

  await renderWishes();
}

// Char counter
const wishMsg = document.getElementById('wish-message');
const charEl  = document.getElementById('char-count');
if (wishMsg && charEl) {
  wishMsg.addEventListener('input', () => {
    charEl.textContent = wishMsg.value.length + ' / 300';
  });
}

// ── RSVP ──────────────────────────────────────────────────────────
async function updateStats() {
  if (!isFirebaseReady()) return;
  const raw   = await fbGet('rsvp');
  const list  = fbToArray(raw);
  const hadir = list.filter(r => r.status === 'hadir').length;
  const tidak = list.filter(r => r.status === 'tidak').length;
  animCount('count-hadir', hadir);
  animCount('count-tidak', tidak);
  animCount('count-total', list.length);
}

function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  let cur = start;
  const dir = target > start ? 1 : -1;
  const iv = setInterval(() => {
    cur += dir;
    el.textContent = cur;
    if (cur === target) clearInterval(iv);
  }, 40);
}

async function renderRSVP() {
  const listEl  = document.getElementById('rsvp-list');
  const emptyEl = document.getElementById('rsvp-empty');
  if (!listEl) return;

  if (!isFirebaseReady()) {
    listEl.innerHTML = '<p style="text-align:center;opacity:0.5;padding:2rem;">⚙️ Firebase belum dikonfigurasi.</p>';
    if (emptyEl) emptyEl.style.display = 'none';
    return;
  }

  const raw  = await fbGet('rsvp');
  const list = fbToArray(raw).sort((a, b) => b.timestamp - a.timestamp);

  listEl.innerHTML = '';
  if (list.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  list.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'guest-entry';
    row.style.animationDelay = (i * 0.05) + 's';
    row.innerHTML = `
      <span class="guest-entry-name">${esc(r.name)}</span>
      <span class="guest-entry-status ${r.status}">${r.status === 'hadir' ? 'Attending' : 'Not Attending'}</span>
    `;
    listEl.appendChild(row);
  });
}

async function submitRSVP(e) {
  e.preventDefault();
  const nameEl   = document.getElementById('rsvp-name');
  const statusEl = document.querySelector('input[name="rsvp-status"]:checked');
  const btn      = document.getElementById('submit-rsvp');
  if (!nameEl || !statusEl) return;

  const name   = nameEl.value.trim();
  const status = statusEl.value;
  if (!name) return;

  if (!isFirebaseReady()) {
    alert('Firebase belum dikonfigurasi. Hubungi pengelola website.');
    return;
  }

  btn.textContent = 'Confirming...';
  btn.disabled    = true;

  // Kalau nama sudah ada → update, bukan duplikat
  const raw      = await fbGet('rsvp');
  const list     = fbToArray(raw);
  const existing = list.find(r => r.name.toLowerCase() === name.toLowerCase());

  if (existing) {
    await fbPatch(`rsvp/${existing._key}`, { status, timestamp: Date.now() });
  } else {
    await fbPost('rsvp', { name, status, timestamp: Date.now() });
  }

  nameEl.value = '';
  document.querySelectorAll('input[name="rsvp-status"]').forEach(r => r.checked = false);

  btn.textContent = '✓ Confirmed!';
  setTimeout(() => {
    btn.textContent = 'Confirm';
    btn.disabled    = false;
  }, 2000);

  await updateStats();
  await renderRSVP();
}

// ── Auto-refresh setiap 15 detik (sync lintas browser) ────────────
function startAutoRefresh() {
  setInterval(async () => {
    await renderWishes();
    await renderRSVP();
    await updateStats();
  }, 15000);
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initReveal();
  await Promise.all([renderWishes(), updateStats(), renderRSVP()]);
  startAutoRefresh();
});
