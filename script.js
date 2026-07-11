/* ═══════════════════════════════════════════════════════════
   ANUBHAV GOEL PORTFOLIO — SCRIPT.JS (v3)
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── RAF helper ─────────────────────────────────────────────── */
let rafPending = false;
function onRAF(fn) {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => { fn(); rafPending = false; });
  }
}

/* ════════════════════════════════════════════════════════════
   0. DOT GRID — cursor proximity highlight effect
      Green dots on dark background, glow near cursor
   ════════════════════════════════════════════════════════════ */
(function initDotGrid() {
  const canvas = document.getElementById('dotGridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const SPACING      = 28;   // px between dots
  const DOT_R        = 1.5;  // base dot radius
  const MAX_R        = 5;    // max radius at cursor centre
  const RADIUS       = 150;  // cursor influence radius in px
  const BASE_ALPHA   = 0.22; // resting dot opacity (clearly visible)
  const BRIGHT_ALPHA = 0.95; // lit dot opacity

  let W = 0, H = 0;
  let mouseX = -9999, mouseY = -9999;
  let dots = [];

  function buildDots() {
    dots = [];
    const cols = Math.ceil(W / SPACING) + 2;
    const rows = Math.ceil(H / SPACING) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: c * SPACING, y: r * SPACING });
      }
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    // Set BOTH the buffer size AND the CSS display size
    canvas.width  = W;
    canvas.height = H;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    buildDots();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < dots.length; i++) {
      const d    = dots[i];
      const dx   = d.x - mouseX;
      const dy   = d.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / RADIUS);

      const alpha  = BASE_ALPHA  + (BRIGHT_ALPHA - BASE_ALPHA) * prox;
      const radius = DOT_R       + (MAX_R        - DOT_R)      * prox;

      // Shift from muted grey-green → vivid accent green as cursor approaches
      const g = Math.round(160 + 95 * prox);   // 160 → 255
      const b = Math.round(80  + 55 * prox);   // 80  → 135

      ctx.beginPath();
      ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,${g},${b},${alpha.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();

/* ════════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
   ════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .btn, .project-row, .ci-item, .ts-item, .edu-entry').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ════════════════════════════════════════════════════════════
   2. NAVBAR — scroll & active section highlight
   ════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const mid = window.scrollY + window.innerHeight * 0.4;
    let activeId = '';
    sections.forEach(s => { if (s.offsetTop <= mid) activeId = s.id; });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href').slice(1) === activeId);
    });
  }

  window.addEventListener('scroll', () => onRAF(updateNav), { passive: true });
  updateNav();
})();

/* ════════════════════════════════════════════════════════════
   3. HAMBURGER
   ════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('mobile-open');
    document.body.style.overflow = links.classList.contains('mobile-open') ? 'hidden' : '';
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('mobile-open');
      document.body.style.overflow = '';
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   4. 3D AVATAR — EYE TRACKING
   ════════════════════════════════════════════════════════════ */
(function initAvatar() {
  const face = document.getElementById('avatarFace');
  const eL   = document.getElementById('eyeLeft');
  const eR   = document.getElementById('eyeRight');
  const pL   = document.getElementById('pupilLeft');
  const pR   = document.getElementById('pupilRight');
  if (!face || !pL || !pR) return;

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function track() {
    [{ eye: eL, pupil: pL }, { eye: eR, pupil: pR }].forEach(({ eye, pupil }) => {
      if (!eye) return;
      const r  = eye.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const angle  = Math.atan2(my - cy, mx - cx);
      const travel = Math.min(Math.hypot(mx - cx, my - cy) / 200, 1) * 7;
      pupil.style.transform = `translate(${Math.cos(angle) * travel}px, ${Math.sin(angle) * travel}px)`;
    });
    const fr  = face.getBoundingClientRect();
    const fcx = fr.left + fr.width  / 2;
    const fcy = fr.top  + fr.height / 2;
    face.style.transform = `rotateX(${((my - fcy) / (window.innerHeight * 0.5)) * -10}deg) rotateY(${((mx - fcx) / (window.innerWidth * 0.5)) * 10}deg)`;
    requestAnimationFrame(track);
  })();
})();

/* ════════════════════════════════════════════════════════════
   5. BIDIRECTIONAL SCROLL ANIMATIONS
      ─ All .reveal elements + .edu-entry elements
      ─ Scroll DOWN into view  → slides up from below + fades in
      ─ Scroll past (above vp) → fades out upward (disappears into top)
      ─ Scroll back UP to it   → slides in from above + fades in
      ─ Falls below vp again   → resets to below-slide-in state
   ════════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  // Gather all elements that should animate
  const targets = [
    ...document.querySelectorAll('.reveal'),
    ...document.querySelectorAll('.edu-entry'),
  ];

  if (!targets.length) return;

  // Set initial hidden state (below viewport, invisible)
  targets.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(52px)';
    el.style.transition = 'opacity 0.65s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        // ── IN VIEW: slide up, fade in ─────────────────────
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';

        // For edu entries: also activate dot + year colour
        el.classList.add('in-view');
        if (el.classList.contains('edu-entry')) {
          el.classList.add('edu-visible');
        }

      } else {
        // ── NOT IN VIEW ────────────────────────────────────
        // Determine which side it left from
        const exitedAbove = entry.boundingClientRect.top < 0;

        if (exitedAbove) {
          // User scrolled DOWN past this element
          // → dissolve upward into the "middle" / top
          el.style.opacity   = '0';
          el.style.transform = 'translateY(-32px)';
          // Keep edu-visible so dot stays styled (cosmetic)
        } else {
          // Element is still below viewport
          // (user scrolled UP back past it, or initial state)
          el.style.opacity   = '0';
          el.style.transform = 'translateY(52px)';
          // Remove edu-visible so dot resets
          el.classList.remove('edu-visible');
          el.classList.remove('in-view');
        }
      }
    });
  }, {
    threshold : 0.12,
    rootMargin: '0px 0px -4% 0px',
  });

  targets.forEach(el => io.observe(el));
})();

/* ════════════════════════════════════════════════════════════
   6. EDUCATION — VERTICAL LINE FILL (scroll-driven)
      Separate concern from entry visibility above
   ════════════════════════════════════════════════════════════ */
(function initEduLineFill() {
  const section = document.getElementById('education');
  const fillEl  = document.getElementById('eduVlineFill');
  if (!section || !fillEl) return;

  function update() {
    const rect  = section.getBoundingClientRect();
    const secH  = section.offsetHeight;
    const winH  = window.innerHeight;

    // 0 = section just entered from bottom, 1 = section scrolled completely past
    const entered  = winH - rect.top;                 // px that entered from bottom
    const total    = secH + winH;                     // total traversal distance
    const pct      = Math.max(0, Math.min(1, entered / total));

    fillEl.style.height = (pct * 100) + '%';
  }

  window.addEventListener('scroll', () => onRAF(update), { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
  setTimeout(update, 200);
})();

/* ════════════════════════════════════════════════════════════
   7. PROJECTS — z-index on hover
   ════════════════════════════════════════════════════════════ */
(function initProjectHover() {
  document.querySelectorAll('.project-row').forEach(row => {
    row.addEventListener('mouseenter', () => { row.style.zIndex = '5'; });
    row.addEventListener('mouseleave', () => { row.style.zIndex = ''; });
  });
})();

/* ════════════════════════════════════════════════════════════
   8. TECH STACK — staggered icon reveal
   ════════════════════════════════════════════════════════════ */
(function initTechStack() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const items = entry.target.querySelectorAll('.ts-item');
      items.forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'translateY(18px)';
        setTimeout(() => {
          item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          item.style.opacity    = '1';
          item.style.transform  = 'translateY(0)';
        }, i * 55);
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.ts-row').forEach(row => {
    // ts-row itself animates via bidirectional IO above,
    // but we also stagger the icons inside
    io.observe(row);
  });
})();

/* ════════════════════════════════════════════════════════════
   9. CONTACT FORM — validation + mailto
   ════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    contactName   : { error: 'nameError',    validate: v => v.trim().length >= 2 },
    contactEmail  : { error: 'emailError',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    contactSubject: { error: 'subjectError', validate: v => v.trim().length >= 3 },
    contactMessage: { error: 'messageError', validate: v => v.trim().length >= 10 },
  };

  Object.keys(fields).forEach(id => {
    const el    = document.getElementById(id);
    const errEl = document.getElementById(fields[id].error);
    if (!el || !errEl) return;
    el.addEventListener('blur', () => {
      const valid = fields[id].validate(el.value);
      el.classList.toggle('error', !valid);
      errEl.classList.toggle('show', !valid);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error') && fields[id].validate(el.value)) {
        el.classList.remove('error');
        errEl.classList.remove('show');
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let allValid = true;
    Object.keys(fields).forEach(id => {
      const el    = document.getElementById(id);
      const errEl = document.getElementById(fields[id].error);
      if (!el || !errEl) return;
      const valid = fields[id].validate(el.value);
      el.classList.toggle('error', !valid);
      errEl.classList.toggle('show', !valid);
      if (!valid) allValid = false;
    });
    if (!allValid) return;

    const body = `Name: ${document.getElementById('contactName').value.trim()}\nEmail: ${document.getElementById('contactEmail').value.trim()}\n\n${document.getElementById('contactMessage').value.trim()}`;
    window.open(`mailto:goelanubhav70@gmail.com?subject=${encodeURIComponent(document.getElementById('contactSubject').value.trim())}&body=${encodeURIComponent(body)}`, '_blank');

    if (success) {
      success.classList.add('show');
      form.reset();
      setTimeout(() => success.classList.remove('show'), 6000);
    }
  });
})();

/* ════════════════════════════════════════════════════════════
   10. HERO — name parallax on mouse move
   ════════════════════════════════════════════════════════════ */
(function initParallax() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) return;
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    heroName.style.transform = `translate(${((e.clientX - cx) / cx) * 6}px, ${((e.clientY - cy) / cy) * 3}px)`;
  });
})();

/* ════════════════════════════════════════════════════════════
   11. SMOOTH SCROLL for anchor links
   ════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   12. PAGE LOAD — ensure top of page on fresh load
   ════════════════════════════════════════════════════════════ */
(function() {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
})();

console.log('%cAnubhav Goel Portfolio v3', 'color:#00ff87;font-size:16px;font-weight:bold;font-family:monospace');
console.log('%cBidirectional scroll animations active', 'color:#888;font-family:monospace');
