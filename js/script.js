/* ============================================
   PRAGATI CLASSES — MAIN JAVASCRIPT
   Version: 1.0 | Vanilla JS | No Dependencies
   ============================================ */

'use strict';

/* ─── NAVBAR: SCROLL BEHAVIOR ─── */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  /* Solid navbar on non-hero pages */
  if (navbar.classList.contains('solid')) return;

  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load
})();

/* ─── MOBILE MENU ─── */
(function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.style.display = 'flex';
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!mobileMenu.classList.contains('open')) {
        mobileMenu.style.display = '';
      }
    }, 300);
  }

  hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  /* Close on link click */
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

/* ─── ACTIVE NAV LINK ─── */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ─── SCROLL REVEAL (IntersectionObserver) ─── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();

/* ─── COUNTER ANIMATION ─── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─── REVIEW SLIDER ─── */
(function initReviewSlider() {
  const track = document.querySelector('.reviews__track');
  const dots = document.querySelectorAll('.reviews__dot');
  if (!track || !dots.length) return;

  const cards = track.querySelectorAll('.review-card');
  let current = 0;
  let autoTimer;

  function getCardWidth() {
    if (!cards.length) return 360;
    return cards[0].offsetWidth + 24; // card width + gap
  }

  function goTo(index) {
    current = index;
    const offset = current * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function next() {
    goTo((current + 1) % cards.length);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(autoTimer);
      goTo(i);
      startAuto();
    });
  });

  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }

  /* Init */
  if (dots.length) dots[0].classList.add('active');
  startAuto();

  /* Recalculate on resize */
  window.addEventListener('resize', () => goTo(current), { passive: true });
})();

/* ─── FAQ ACCORDION ─── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-item__q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      /* Close all */
      items.forEach(i => i.classList.remove('open'));
      /* Open clicked if it was closed */
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ─── CONTACT FORM — EmailJS READY ─── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const msgEl = document.getElementById('form-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Basic validation */
    const name    = form.name.value.trim();
    const phone   = form.phone.value.trim();
    const grade   = form.grade.value;
    const message = form.message ? form.message.value.trim() : '';

    if (!name || !phone || !grade) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    /* Phone number validation */
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showMessage('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    /* Disable button while submitting */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    /* ── TO INTEGRATE EMAILJS:
       1. Go to emailjs.com → create account
       2. Add service (Gmail) → note SERVICE_ID
       3. Create email template → note TEMPLATE_ID
       4. Copy Public Key
       5. Replace values below and uncomment

      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        from_name: name,
        phone: phone,
        grade: grade,
        message: message,
      }, 'YOUR_PUBLIC_KEY');

    ── OR USE FORMSPREE:
      Change <form> action to your Formspree URL and method="POST"
      Add hidden input: <input type="hidden" name="_subject" value="New Lead">
    ─── */

    /* Simulate success for now */
    await new Promise(r => setTimeout(r, 1200));

    showMessage('✅ Thank you! We will call you within 24 hours.', 'success');
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry';
  });

  function showMessage(text, type) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'form-message form-message--' + type;
    msgEl.style.display = 'block';
    setTimeout(() => { msgEl.style.display = 'none'; }, 6000);
  }
})();

/* ─── CTA PULSE ANIMATION ─── */
(function initCTAPulse() {
  const cta = document.querySelector('.btn-primary');
  if (!cta) return;

  setInterval(() => {
    cta.style.transform = 'scale(1.03)';
    cta.style.boxShadow = '0 8px 40px rgba(245,180,0,0.45)';
    setTimeout(() => {
      cta.style.transform = '';
      cta.style.boxShadow = '';
    }, 600);
  }, 6000);
})();
