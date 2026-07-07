/* ================================================================
   VALLERIE VALENCIA - SWEET 17 BIRTHDAY WEBSITE
   JavaScript: Countdown, Particles, RSVP, Wishes, Copy
   ================================================================ */

// ─── Data Storage (localStorage) ─────────────────────────────────
const STORAGE_KEY_WISHES = 'vallerie_wishes_v1';
const STORAGE_KEY_RSVP   = 'vallerie_rsvp_v1';

function loadData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch(e) { console.warn('Storage error:', e); }
}

// ─── Countdown Timer ─────────────────────────────────────────────
const TARGET_DATE = new Date('2026-10-24T18:00:00+07:00');

function updateCountdown() {
  const now  = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    document.getElementById('days').textContent    = '00';
    document.getElementById('hours').textContent   = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    const section = document.querySelector('.countdown-section .section-subtitle');
    if (section) section.textContent = '🎉 Selamat Ulang Tahun Vallerie Valencia! 🎉';
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  function animateUpdate(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const str = String(val).padStart(2, '0');
    if (el.textContent !== str) {
      el.style.transform = 'translateY(-8px)';
      el.style.opacity   = '0.5';
      setTimeout(() => {
        el.textContent   = str;
        el.style.transform = 'translateY(0)';
        el.style.opacity   = '1';
      }, 150);
    }
  }

  animateUpdate('days',    d);
  animateUpdate('hours',   h);
  animateUpdate('minutes', m);
  animateUpdate('seconds', s);
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ─── Floating Particles ───────────────────────────────────────────
const PARTICLE_SYMBOLS = ['✨', '🌸', '💕', '🎀', '⭐', '💎', '🌺', '✦', '·'];
const PARTICLE_COLORS  = [
  'rgba(231, 122, 168, 0.6)',
  'rgba(245, 200, 66, 0.6)',
  'rgba(253, 229, 176, 0.7)',
  'rgba(200, 84, 122, 0.4)',
  'rgba(255, 224, 102, 0.5)',
];

function createParticle() {
  const container = document.getElementById('particles');
  if (!container) return;

  const p = document.createElement('div');
  p.className = 'particle';

  const isEmoji = Math.random() > 0.5;
  if (isEmoji) {
    p.textContent = PARTICLE_SYMBOLS[Math.floor(Math.random() * PARTICLE_SYMBOLS.length)];
    p.style.fontSize = (Math.random() * 16 + 8) + 'px';
  } else {
    const size = Math.random() * 8 + 3;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';
    p.style.background = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  }

  p.style.left     = Math.random() * 100 + 'vw';
  p.style.animationDuration  = (Math.random() * 12 + 8) + 's';
  p.style.animationDelay     = (Math.random() * 6) + 's';

  container.appendChild(p);
  setTimeout(() => p.remove(), 20000);
}

// Spawn particles
setInterval(createParticle, 600);
for (let i = 0; i < 15; i++) setTimeout(createParticle, i * 200);

// ─── Scroll Animations ────────────────────────────────────────────
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.countdown-card, .gallery-item, .gift-card, .stat-card, .wish-card, .rsvp-entry, .section-header'
  );

  targets.forEach(el => {
    el.classList.add('fade-in-up');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}

// ─── Copy Account Number ──────────────────────────────────────────
function copyAccount(numberId) {
  const el = document.getElementById(numberId);
  if (!el) return;

  const text = el.querySelector('.number-text')?.textContent?.trim() || '';
  if (!text || text === 'Segera Hadir') {
    alert('Nomor rekening belum diisi. Silakan update nanti!');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    const bankId  = numberId.split('-')[0];
    const copiedEl = document.getElementById('copied-' + bankId);
    if (copiedEl) {
      copiedEl.classList.add('show');
      setTimeout(() => copiedEl.classList.remove('show'), 2500);
    }
  }).catch(() => {
    // fallback
    const range = document.createRange();
    const span  = el.querySelector('.number-text');
    if (span) {
      range.selectNode(span);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    }
  });
}

// ─── Wishes ───────────────────────────────────────────────────────
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
       + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function renderWishes() {
  const wishes  = loadData(STORAGE_KEY_WISHES);
  const display = document.getElementById('wishes-display');
  const empty   = document.getElementById('wishes-empty');
  if (!display) return;

  display.innerHTML = '';

  if (wishes.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  // Show newest first
  [...wishes].reverse().forEach(w => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <div class="wish-name">💌 ${escapeHtml(w.name)}</div>
      <p class="wish-text">${escapeHtml(w.message)}</p>
      <div class="wish-time">🕐 ${formatTime(w.timestamp)}</div>
    `;
    display.appendChild(card);
  });
}

function submitWish(e) {
  e.preventDefault();
  const nameEl = document.getElementById('wish-name');
  const msgEl  = document.getElementById('wish-message');
  const btn    = document.getElementById('submit-wish-btn');

  if (!nameEl || !msgEl) return;

  const name    = nameEl.value.trim();
  const message = msgEl.value.trim();
  if (!name || !message) return;

  const wishes = loadData(STORAGE_KEY_WISHES);
  wishes.push({ name, message, timestamp: Date.now() });
  saveData(STORAGE_KEY_WISHES, wishes);

  // Reset form
  nameEl.value = '';
  msgEl.value  = '';
  document.getElementById('char-count').textContent = '0/300';

  // Button feedback
  btn.innerHTML = '<span>✅ Terkirim!</span>';
  btn.disabled  = true;
  setTimeout(() => {
    btn.innerHTML = '<span>💌 Kirim Ucapan</span>';
    btn.disabled  = false;
  }, 2000);

  renderWishes();
}

// Character counter
const msgTA = document.getElementById('wish-message');
const charCountEl = document.getElementById('char-count');
if (msgTA && charCountEl) {
  msgTA.addEventListener('input', () => {
    charCountEl.textContent = msgTA.value.length + '/300';
  });
}

// ─── RSVP ─────────────────────────────────────────────────────────
function updateStats() {
  const rsvpList = loadData(STORAGE_KEY_RSVP);
  const hadir  = rsvpList.filter(r => r.status === 'hadir').length;
  const tidak  = rsvpList.filter(r => r.status === 'tidak').length;
  const total  = rsvpList.length;

  animateCounter('count-hadir', hadir);
  animateCounter('count-tidak', tidak);
  animateCounter('count-total', total);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  let start = current;
  const step = target > current ? 1 : -1;
  const interval = setInterval(() => {
    start += step;
    el.textContent = start;
    if (start === target) clearInterval(interval);
  }, 50);
}

function renderRSVPList() {
  const rsvpList  = loadData(STORAGE_KEY_RSVP);
  const listEl    = document.getElementById('rsvp-list');
  const emptyEl   = document.getElementById('rsvp-empty');
  if (!listEl) return;

  listEl.innerHTML = '';

  if (rsvpList.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  [...rsvpList].reverse().forEach(r => {
    const entry = document.createElement('div');
    entry.className = 'rsvp-entry';
    entry.innerHTML = `
      <span class="rsvp-entry-name">👤 ${escapeHtml(r.name)}</span>
      <span class="rsvp-entry-status ${r.status === 'hadir' ? 'hadir' : 'tidak'}">
        ${r.status === 'hadir' ? '🥂 Hadir' : '💔 Tidak Hadir'}
      </span>
    `;
    listEl.appendChild(entry);
  });
}

function submitRSVP(e) {
  e.preventDefault();
  const nameEl   = document.getElementById('rsvp-name');
  const statusEl = document.querySelector('input[name="rsvp-status"]:checked');
  const btn      = document.getElementById('submit-rsvp-btn');

  if (!nameEl || !statusEl) return;

  const name   = nameEl.value.trim();
  const status = statusEl.value;
  if (!name || !status) return;

  const rsvpList = loadData(STORAGE_KEY_RSVP);

  // Check duplicate
  const existing = rsvpList.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
  if (existing !== -1) {
    rsvpList[existing].status = status;
    rsvpList[existing].timestamp = Date.now();
  } else {
    rsvpList.push({ name, status, timestamp: Date.now() });
  }

  saveData(STORAGE_KEY_RSVP, rsvpList);

  // Reset form
  nameEl.value = '';
  document.querySelectorAll('input[name="rsvp-status"]').forEach(r => r.checked = false);

  // Button feedback
  btn.innerHTML = '<span>✅ Konfirmasi Terkirim!</span>';
  btn.disabled  = true;
  setTimeout(() => {
    btn.innerHTML = '<span>🎉 Kirim Konfirmasi</span>';
    btn.disabled  = false;
  }, 2000);

  updateStats();
  renderRSVPList();
}

// ─── XSS Protection ───────────────────────────────────────────────
function escapeHtml(str) {
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

// ─── Music Player ─────────────────────────────────────────────────
let isPlaying = false;
let audio = null;

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  if (!audio) {
    // Use a royalty-free ambient melody URL or create silent version
    // For now, toggle visual state only — user can add their own audio
    isPlaying = !isPlaying;
    btn.textContent = isPlaying ? '🔇' : '🎵';
    btn.classList.toggle('playing', isPlaying);
    return;
  }

  if (isPlaying) {
    audio.pause();
    btn.textContent = '🎵';
    btn.classList.remove('playing');
  } else {
    audio.play().catch(() => {});
    btn.textContent = '🔇';
    btn.classList.add('playing');
  }
  isPlaying = !isPlaying;
}

// ─── Confetti Burst on Page Load ─────────────────────────────────
function spawnConfetti() {
  const colors = ['#f2a7c3','#f5c842','#e87aa8','#fde9b0','#c9547a','#ffe066'];
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'particle';
      c.style.left     = Math.random() * 100 + 'vw';
      c.style.width    = (Math.random() * 10 + 5) + 'px';
      c.style.height   = (Math.random() * 10 + 5) + 'px';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      c.style.animationDuration = (Math.random() * 5 + 3) + 's';
      c.style.animationDelay   = '0s';
      container.appendChild(c);
      setTimeout(() => c.remove(), 8000);
    }, i * 80);
  }
}

// ─── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderWishes();
  updateStats();
  renderRSVPList();
  initScrollAnimations();
  setTimeout(spawnConfetti, 800);

  // Smooth section reveals
  const sections = document.querySelectorAll('section');
  const secObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(20px)';
    s.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    secObserver.observe(s);
  });
});
