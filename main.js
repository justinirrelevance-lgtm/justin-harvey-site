// Nav scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Mobile menu
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

// Fade-up observer
const fuObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.08 });
document.querySelectorAll('.fu').forEach(el => fuObs.observe(el));

// Stat counter
const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.stat-item').forEach(s => s.classList.add('vis'));
    document.querySelectorAll('.stat-n[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const dec = parseInt(el.dataset.dec || '0');
      const dur = 1300;
      const s0 = performance.now();
      function tick(now) {
        const p = Math.min((now - s0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = eased * target;
        el.textContent = dec > 0 ? v.toFixed(dec) + suffix : Math.floor(v) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = dec > 0 ? target.toFixed(dec) + suffix : target + suffix;
      }
      requestAnimationFrame(tick);
    });
    statsObs.disconnect();
  }
}, { threshold: 0.4 });
const sb = document.querySelector('.stats-band');
if (sb) statsObs.observe(sb);

// Channel tab switching (media kit)
function switchCh(id, btn) {
  document.querySelectorAll('.ch-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ch-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('ch-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

// Package tab switching (media kit)
function switchPkg(id, btn) {
  ['ig', 'combo', 'other'].forEach(k => {
    const el = document.getElementById('pkg-' + k);
    if (el) el.style.display = k === id ? 'block' : 'none';
  });
  document.querySelectorAll('.pkg-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
