/* ================================================================
   VALLERIE VALENCIA — SWEET SEVENTEEN
   JavaScript: Countdown · Sparkle Particles · Wishes · RSVP · Copy
   ================================================================ */

'use strict';

// ── Storage ────────────────────────────────────────────────────────
const KEY_WISHES = 'vv_wishes_v2';
const KEY_RSVP   = 'vv_rsvp_v2';

const load = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
const save = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

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
    ctx.fillStyle = `rgba(${Math.min(cr+40,255)},${Math.min(cg+40,255)},${Math.min(cb+40,255)},${alpha})`;
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
      // 40% sparkle stars, 60% soft dots
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

  // Create particle pool
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
    '.countdown-grid, .gallery-grid, .gift-grid, .stats-row, .form-wrapper, .section-heading, .eyebrow, .section-body, .guest-list-wrap'
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
    setTimeout(() => copiedEl.classList.remove('show'), 2200);
  });
}

// ── Format Date ───────────────────────────────────────────────────
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── Wishes ────────────────────────────────────────────────────────
function renderWishes() {
  const wishes  = load(KEY_WISHES);
  const display = document.getElementById('wishes-display');
  const empty   = document.getElementById('wishes-empty');
  if (!display) return;

  display.innerHTML = '';

  if (wishes.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  [...wishes].reverse().forEach((w, i) => {
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

function submitWish(e) {
  e.preventDefault();
  const nameEl = document.getElementById('wish-name');
  const msgEl  = document.getElementById('wish-message');
  const btn    = document.getElementById('submit-wish');
  if (!nameEl || !msgEl) return;

  const name    = nameEl.value.trim();
  const message = msgEl.value.trim();
  if (!name || !message) return;

  const wishes = load(KEY_WISHES);
  wishes.push({ name, message, timestamp: Date.now() });
  save(KEY_WISHES, wishes);

  nameEl.value = '';
  msgEl.value  = '';
  const cc = document.getElementById('char-count');
  if (cc) cc.textContent = '0 / 300';

  btn.textContent = 'Sent ✓';
  btn.disabled    = true;
  setTimeout(() => {
    btn.textContent = 'Send Wishes ✦';
    btn.disabled    = false;
  }, 2200);

  renderWishes();
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
function updateStats() {
  const list  = load(KEY_RSVP);
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

function renderRSVP() {
  const list    = load(KEY_RSVP);
  const listEl  = document.getElementById('rsvp-list');
  const emptyEl = document.getElementById('rsvp-empty');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (list.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  [...list].reverse().forEach((r, i) => {
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

function submitRSVP(e) {
  e.preventDefault();
  const nameEl   = document.getElementById('rsvp-name');
  const statusEl = document.querySelector('input[name="rsvp-status"]:checked');
  const btn      = document.getElementById('submit-rsvp');
  if (!nameEl || !statusEl) return;

  const name   = nameEl.value.trim();
  const status = statusEl.value;
  if (!name) return;

  const list = load(KEY_RSVP);
  const idx  = list.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    list[idx].status    = status;
    list[idx].timestamp = Date.now();
  } else {
    list.push({ name, status, timestamp: Date.now() });
  }
  save(KEY_RSVP, list);

  nameEl.value = '';
  document.querySelectorAll('input[name="rsvp-status"]').forEach(r => r.checked = false);

  btn.textContent = 'Confirmed ✓';
  btn.disabled    = true;
  setTimeout(() => {
    btn.textContent = 'Confirm ✦';
    btn.disabled    = false;
  }, 2200);

  updateStats();
  renderRSVP();
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderWishes();
  updateStats();
  renderRSVP();
  initReveal();
});
