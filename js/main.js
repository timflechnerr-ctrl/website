/* ═══════════════════════════════════════════
   main.js — Navbar, Particles, Typewriter, Tilt, Loader
═══════════════════════════════════════════ */

'use strict';

/* ── Loader ── */
(function initLoader() {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loaderBar');
  const text    = document.getElementById('loaderText');
  if (!loader || !bar) return;

  const steps = [
    { pct: 20,  label: 'Loading assets…' },
    { pct: 50,  label: 'Building interface…' },
    { pct: 75,  label: 'Connecting…' },
    { pct: 90,  label: 'Almost there…' },
    { pct: 100, label: 'Ready.' },
  ];

  let i = 0;
  function nextStep() {
    if (i >= steps.length) {
      setTimeout(() => loader.classList.add('hidden'), 400);
      return;
    }
    const s = steps[i++];
    bar.style.width = s.pct + '%';
    if (text) text.textContent = s.label;
    setTimeout(nextStep, i === steps.length ? 250 : 260);
  }

  // Start after a tiny delay so the first paint shows the loader
  setTimeout(nextStep, 120);
})();


/* ── Navbar — scroll behavior + mobile menu ── */
(function initNavbar() {
  const navbar       = document.getElementById('navbar');
  const menuBtn      = document.getElementById('navMenuBtn');
  const mobileMenu   = document.getElementById('navMobileMenu');
  const mobileLinks  = document.querySelectorAll('.nav-mobile-link');
  if (!navbar) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      navbar.classList.toggle('menu-open');
    });
  }

  // Close on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navbar.classList.remove('menu-open');
    });
  });

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = '#FF2D78';
      }
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
})();


/* ── Particle Canvas ── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 80;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  const COLORS = ['rgba(255,45,120,', 'rgba(191,0,255,', 'rgba(0,212,255,'];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = rand(0, W);
      this.y  = initial ? rand(0, H) : rand(-10, -5);
      this.r  = rand(0.5, 2.2);
      this.vx = rand(-0.2, 0.2);
      this.vy = rand(0.1, 0.5);
      this.alpha = rand(0.2, 0.7);
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse  = rand(0, Math.PI * 2);
      this.pSpeed = rand(0.01, 0.03);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pSpeed;
      if (this.y > H + 10) this.reset();
    }

    draw() {
      const a = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,45,120,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => { p.x = rand(0, W); });
  });

  init();
  loop();
})();


/* ── Typewriter ── */
(function initTypewriter() {
  const el = document.getElementById('typewriterEl');
  if (!el) return;

  const words = [
    'websites.',
    'Discord bots.',
    'admin panels.',
    'custom AIs.',
    'backends.',
    'cool stuff.',
  ];

  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let pause    = false;

  function type() {
    const word = words[wordIdx];

    if (!deleting) {
      el.textContent = word.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        pause = true;
        setTimeout(() => { pause = false; deleting = true; requestAnimationFrame(tick); }, 1800);
        return;
      }
    } else {
      el.textContent = word.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
    }
    requestAnimationFrame(tick);
  }

  let last = 0;
  function tick(ts) {
    if (pause) return;
    const delay = deleting ? 60 : 95;
    if (ts - last >= delay) {
      last = ts;
      type();
    } else {
      requestAnimationFrame(tick);
    }
  }

  // Start after hero animation
  setTimeout(() => requestAnimationFrame(tick), 1400);
})();


/* ── Card Tilt (Mouse tracking) ── */
(function initTilt() {
  const cards = document.querySelectorAll('.brand-card, .skill-icon-card, .discord-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 10;
      const rotY =  dx * 10;
      // No CSS transition on transform — set directly for instant response
      card.style.transition = 'border-color 0.35s ease, box-shadow 0.35s ease';
      card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'border-color 0.35s ease, box-shadow 0.35s ease, transform 0.4s ease';
      card.style.transform  = '';
    });
  });
})();


/* ── Smooth scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
