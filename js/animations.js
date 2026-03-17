/* ═══════════════════════════════════════════
   animations.js — Scroll Reveal, Parallax & Hero FX
═══════════════════════════════════════════ */

'use strict';

/* ── Bidirectional Reveal on scroll (in + out) ── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          /* Only un-reveal if element has scrolled out from the top (already passed) */
          const rect = entry.target.getBoundingClientRect();
          if (rect.bottom < 0) {
            entry.target.classList.remove('visible');
          }
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();


/* ── Skill Bars — animate width on scroll (one-time) ── */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const item  = entry.target.closest('.skill-item');
          const width = item ? item.getAttribute('data-width') : '0';
          entry.target.style.width = width + '%';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  fills.forEach((fill) => observer.observe(fill));
})();


/* ── Hero scroll-out animation ── */
(function initHeroScrollFX() {
  const heroContent = document.querySelector('.hero-content');
  const canvas      = document.getElementById('particleCanvas');
  if (!heroContent) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const vh       = window.innerHeight;

        if (scrolled < vh) {
          const progress = scrolled / vh;

          /* Fade + slide up + slight scale down */
          const opacity    = 1 - progress * 1.6;
          const translateY = scrolled * 0.35;
          const scale      = 1 - progress * 0.08;

          heroContent.style.opacity   = Math.max(0, opacity);
          heroContent.style.transform = `translateY(-${translateY}px) scale(${scale})`;

          if (canvas) {
            canvas.style.transform = `translateY(${scrolled * 0.15}px)`;
            canvas.style.opacity   = String(Math.max(0.2, 1 - progress * 0.7));
          }
        } else {
          heroContent.style.opacity   = '0';
          heroContent.style.transform = '';
          if (canvas) { canvas.style.opacity = '0'; canvas.style.transform = ''; }
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ── Scroll indicator hide on scroll ── */
(function hideScrollIndicator() {
  const indicator = document.getElementById('scrollIndicator');
  if (!indicator) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    } else {
      indicator.style.opacity = '';
      indicator.style.pointerEvents = '';
    }
  }, { passive: true });
})();


/* ── Number counter animation for skill percentages ── */
(function initCounters() {
  const pcts = document.querySelectorAll('.skill-pct');
  if (!pcts.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.textContent, 10);
        let current  = 0;
        const step   = target / 60;
        const timer  = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current) + '%';
        }, 20);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  pcts.forEach((el) => observer.observe(el));
})();

