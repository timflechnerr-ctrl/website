/* ═══════════════════════════════════════════
   animations.js — Scroll Reveal & Skill Bars
═══════════════════════════════════════════ */

'use strict';

/* ── Intersection Observer: Reveal on scroll ── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();


/* ── Skill Bars — animate width on scroll ── */
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


/* ── Section background parallax subtle shift ── */
(function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const canvas = document.getElementById('particleCanvas');
        // Very subtle parallax on canvas — stays within hero bounds
        if (canvas && scrolled < window.innerHeight) {
          canvas.style.transform = `translateY(${scrolled * 0.15}px)`;
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
