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
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

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

async function renderWishes(fromNetwork = true) {
  const display = document.getElementById('wishes-display');
  const empty   = document.getElementById('wishes-empty');
  if (!display) return;

  if (fromNetwork) {
    const wishes = await loadWishes();
    renderWishesDOM(wishes, display, empty);
  } else {
    const wishes = loadLocal(KEY_WISHES);
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
  // Server returned null (empty database / cleared by admin)
  saveLocal(KEY_RSVP, []);
  return [];
}

function updateStatsDOM(list) {
  if (!Array.isArray(list)) list = [];
  const hadir = list.filter(r => r.status === 'hadir').reduce((sum, r) => sum + (parseInt(r.pax, 10) || 1), 0);
  const tidak = list.filter(r => r.status === 'tidak').length;
  animCount('count-hadir', hadir);
  animCount('count-tidak', tidak);
  animCount('count-total', hadir + tidak);
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

  if (fromNetwork) {
    const list = await loadRSVP();
    renderRSVPDOM(list, listEl, emptyEl);
    updateStatsDOM(list);
  } else {
    const list = loadLocal(KEY_RSVP);
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
    const paxNum = parseInt(r.pax, 10) || 1;
    const paxBadge = isHadir && paxNum > 1 ? `<span class="guest-pax">${paxNum} Guests</span>` : '';
    row.innerHTML = `
      <span class="guest-entry-name">${esc(r.name)}${paxBadge}</span>
      <span class="guest-entry-status ${isHadir ? 'hadir' : 'tidak'}">${isHadir ? 'Attending' : 'Not Attending'}</span>
    `;
    listEl.appendChild(row);
  });
}

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
        You have confirmed as
        <span class="rsvp-done-badge ${isHadir ? 'hadir' : 'tidak'}">
          ${isHadir ? 'Attending' + paxText + ' ✦' : 'Not Attending'}
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

  // 2. Periodic Polling fallback (every 7 seconds)
  setInterval(() => {
    renderRSVP(true);
    renderWishes(true);
    renderGallery(true);
  }, 7000);

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
  renderWishes(true);
  renderRSVP(true);
  renderGallery(true);
  initLiveSync();
  initReveal();
  initGalleryUpload();

  // Check if this browser already submitted RSVP
  const doneEntry = getRSVPDone();
  if (doneEntry) showRSVPConfirmed(doneEntry);

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
//   GALLERY / MEMORIES — Upload, Render, Lightbox, Live Sync
// ================================================================

const KEY_GALLERY = 'vv_gallery_v1';
const MAX_FILE_SIZE = 10 * 1024 * 1024;       // 10 MB raw limit
const MAX_IMG_DIMENSION = 1200;                 // resize images to max 1200px
const IMG_QUALITY = 0.72;                       // JPEG compression quality
const MAX_VID_SIZE_B64 = 5 * 1024 * 1024;      // 5 MB base64 limit for video
let gallerySelectedFile = null;
let galleryItems = [];
let lightboxIdx = 0;

// ── Gallery Upload UI Setup ─────────────────────────────────────────
function initGalleryUpload() {
  const dropzone    = document.getElementById('gallery-dropzone');
  const fileInput   = document.getElementById('gallery-file');
  const previewWrap = document.getElementById('dropzone-preview');
  const content     = document.getElementById('dropzone-content');
  const previewImg  = document.getElementById('preview-img');
  const previewVid  = document.getElementById('preview-vid');
  const previewName = document.getElementById('preview-filename');
  const removeBtn   = document.getElementById('preview-remove');

  if (!dropzone || !fileInput) return;

  // Click to browse
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('.preview-remove')) return;
    fileInput.click();
  });

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
    if (files.length > 0) handleFileSelect(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0]);
  });

  // Remove preview
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearFilePreview();
    });
  }

  function handleFileSelect(file) {
    // Validate type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      alert('Please select an image or video file.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 10 MB.');
      return;
    }

    gallerySelectedFile = file;

    // Show preview
    if (content) content.style.display = 'none';
    if (previewWrap) previewWrap.style.display = 'flex';

    if (isImage) {
      previewImg.style.display = 'block';
      previewVid.style.display = 'none';
      const reader = new FileReader();
      reader.onload = (e) => { previewImg.src = e.target.result; };
      reader.readAsDataURL(file);
    } else {
      previewImg.style.display = 'none';
      previewVid.style.display = 'block';
      previewVid.src = URL.createObjectURL(file);
    }

    if (previewName) previewName.textContent = file.name;
  }

  function clearFilePreview() {
    gallerySelectedFile = null;
    fileInput.value = '';
    if (content) content.style.display = 'flex';
    if (previewWrap) previewWrap.style.display = 'none';
    previewImg.style.display = 'none';
    previewImg.src = '';
    previewVid.style.display = 'none';
    previewVid.src = '';
    if (previewName) previewName.textContent = '';
  }

  // Expose clearFilePreview globally
  window._clearGalleryPreview = clearFilePreview;
}

// ── Compress Image ───────────────────────────────────────────────────
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;

        // Resize if needed
        if (width > MAX_IMG_DIMENSION || height > MAX_IMG_DIMENSION) {
          if (width > height) {
            height = Math.round(height * MAX_IMG_DIMENSION / width);
            width = MAX_IMG_DIMENSION;
          } else {
            width = Math.round(width * MAX_IMG_DIMENSION / height);
            height = MAX_IMG_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', IMG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Generate Video Thumbnail ────────────────────────────────────────
function generateVideoThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.25);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth, 640);
      canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumb = canvas.toDataURL('image/jpeg', 0.6);
      URL.revokeObjectURL(video.src);
      resolve(thumb);
    };

    video.onerror = () => {
      resolve(null);
    };

    video.src = URL.createObjectURL(file);
  });
}

// ── Convert file to base64 data URL ─────────────────────────────────
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Submit Gallery Upload ───────────────────────────────────────────
async function submitGallery(e) {
  e.preventDefault();
  const nameEl = document.getElementById('gallery-name');
  const btn    = document.getElementById('submit-gallery');
  const progressWrap = document.getElementById('upload-progress');
  const progressBar  = document.getElementById('upload-progress-bar');
  const progressText = document.getElementById('upload-progress-text');

  if (!nameEl || !btn || !gallerySelectedFile) {
    if (!gallerySelectedFile) alert('Please select a photo or video to upload.');
    return;
  }

  const name = nameEl.value.trim();
  if (!name) return;

  const file = gallerySelectedFile;
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  btn.disabled = true;
  btn.textContent = 'Processing...';

  // Show progress
  if (progressWrap) progressWrap.style.display = 'block';
  setProgress(10, 'Processing...');

  try {
    let mediaData, thumbnail, mediaType;

    if (isImage) {
      mediaType = 'image';
      setProgress(30, 'Compressing image...');
      mediaData = await compressImage(file);
      thumbnail = null;
      setProgress(60, 'Uploading...');
    } else if (isVideo) {
      mediaType = 'video';
      setProgress(20, 'Generating thumbnail...');
      thumbnail = await generateVideoThumbnail(file);
      setProgress(40, 'Processing video...');

      // Convert video to base64
      mediaData = await fileToDataUrl(file);

      // Check size after base64 encoding
      if (mediaData.length > MAX_VID_SIZE_B64) {
        alert('Video is too large after processing. Please use a shorter or smaller video (max ~3.5 MB).');
        resetUploadUI();
        return;
      }
      setProgress(60, 'Uploading...');
    } else {
      alert('Unsupported file type.');
      resetUploadUI();
      return;
    }

    const entry = {
      name,
      mediaType,
      mediaData,
      thumbnail: thumbnail || null,
      timestamp: Date.now(),
      fileName: file.name
    };

    setProgress(70, 'Saving to cloud...');

    // Optimistic local update
    const local = loadLocal(KEY_GALLERY);
    local.push(entry);
    saveLocal(KEY_GALLERY, local);
    galleryItems = local;
    renderGalleryDOM();

    // Push to Firebase
    setProgress(85, 'Syncing...');
    await fbPost('gallery', entry);

    setProgress(100, 'Done!');

    // Reset form
    nameEl.value = '';
    gallerySelectedFile = null;
    if (window._clearGalleryPreview) window._clearGalleryPreview();

    setTimeout(() => {
      btn.textContent = 'Uploaded ✓';
      setTimeout(() => {
        btn.textContent = 'Upload Memory ✦';
        btn.disabled = false;
        if (progressWrap) progressWrap.style.display = 'none';
        setProgress(0, 'Uploading...');
      }, 2000);
    }, 500);

    // Sync fresh state
    await renderGallery(true);

  } catch (err) {
    console.error('[Gallery] Upload error:', err);
    alert('Upload failed. Please try again.');
    resetUploadUI();
  }

  function setProgress(pct, text) {
    if (progressBar)  progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = text;
  }

  function resetUploadUI() {
    btn.textContent = 'Upload Memory ✦';
    btn.disabled = false;
    if (progressWrap) progressWrap.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';
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
  saveLocal(KEY_GALLERY, []);
  return [];
}

async function renderGallery(fromNetwork = true) {
  if (fromNetwork) {
    galleryItems = await loadGallery();
  } else {
    galleryItems = loadLocal(KEY_GALLERY);
  }
  renderGalleryDOM();
}

function renderGalleryDOM() {
  const grid  = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  if (!grid) return;

  grid.innerHTML = '';

  if (!galleryItems || galleryItems.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  // Show newest first
  [...galleryItems].reverse().forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.onclick = () => openLightbox(galleryItems.length - 1 - i);

    const isVideo = item.mediaType === 'video';

    let mediaHTML;
    if (isVideo) {
      const thumbSrc = item.thumbnail || '';
      mediaHTML = `
        <div class="gallery-card-media">
          ${thumbSrc ? `<img src="${thumbSrc}" alt="Video thumbnail" />` : `<div style="width:100%;height:100%;background:var(--blush-light);display:flex;align-items:center;justify-content:center;"><span style="font-size:2rem;">🎬</span></div>`}
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
          <img src="${item.mediaData}" alt="Photo by ${esc(item.name)}" loading="lazy" />
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaHTML}
      <div class="gallery-card-info">
        <p class="gallery-card-name">${esc(item.name)}</p>
        <p class="gallery-card-time">${fmtDate(item.timestamp)}</p>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ── Lightbox ────────────────────────────────────────────────────────
function openLightbox(idx) {
  lightboxIdx = idx;
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  renderLightboxContent();
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Keyboard navigation
  document.addEventListener('keydown', lightboxKeyHandler);
}

function closeLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Stop any playing video
  const vid = lightbox.querySelector('video');
  if (vid) { vid.pause(); vid.src = ''; }

  document.removeEventListener('keydown', lightboxKeyHandler);
}

function lightboxNav(dir) {
  if (!galleryItems.length) return;
  lightboxIdx = (lightboxIdx + dir + galleryItems.length) % galleryItems.length;
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
  if (!mediaEl || !galleryItems[lightboxIdx]) return;

  const item = galleryItems[lightboxIdx];
  const isVideo = item.mediaType === 'video';

  if (isVideo) {
    mediaEl.innerHTML = `<video src="${item.mediaData}" controls autoplay style="max-width:85vw;max-height:75vh;border-radius:16px;box-shadow:0 16px 80px rgba(0,0,0,0.5);"></video>`;
  } else {
    mediaEl.innerHTML = `<img src="${item.mediaData}" alt="Photo by ${esc(item.name)}" />`;
  }

  if (infoEl) {
    infoEl.innerHTML = `
      <p class="lightbox-info-name">${esc(item.name)}</p>
      <p class="lightbox-info-time">${fmtDate(item.timestamp)}</p>
    `;
  }
}

