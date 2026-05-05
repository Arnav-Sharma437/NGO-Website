(function () {
  'use strict';

  var THEME_KEY = 'hf-theme';

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function setTheme(mode) {
    var next = mode === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    syncThemeToggle();
  }

  function syncThemeToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var dark = getTheme() === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
  }

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
    syncThemeToggle();
  }

  /* QR image: if primary host fails, use data-qr-fallback */
  var qrImg = document.querySelector('.donate-qr-img');
  if (qrImg) {
    qrImg.addEventListener('error', function onQrError() {
      var fb = qrImg.getAttribute('data-qr-fallback');
      if (fb && qrImg.src.indexOf('quickchart.io') === -1) {
        qrImg.removeEventListener('error', onQrError);
        qrImg.src = fb;
      }
    });
  }

  /* Premium cursor */
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var cursorDot = document.getElementById('cursorDot');
  var cursorRing = document.getElementById('cursorRing');
  var usePremiumCursor = !!(cursorDot && cursorRing && finePointer && !prefersReduced);

  if (usePremiumCursor) {
    document.body.classList.add('has-premium-cursor');
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var ringX = targetX;
    var ringY = targetY;

    function drawCursor() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      cursorDot.style.left = targetX + 'px';
      cursorDot.style.top = targetY + 'px';
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(drawCursor);
    }

    document.addEventListener(
      'mousemove',
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
      },
      { passive: true }
    );

    document.addEventListener('mousedown', function () {
      document.body.classList.add('cursor-active');
    });
    document.addEventListener('mouseup', function () {
      document.body.classList.remove('cursor-active');
    });

    document.querySelectorAll('a, button, input, textarea, .card, .project-card, .person-card, .gallery-item').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        document.body.classList.add('cursor-active');
      });
      el.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-active');
      });
    });

    drawCursor();
  }

  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && header) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function closeMobileNav() {
    if (header && navToggle) {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  document.querySelectorAll('a[data-scroll]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileNav();
      }
    });
  });

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Donation tiers */
  var tierRow = document.getElementById('tierRow');
  var tierNote = document.getElementById('tierNote');
  if (tierRow && tierNote) {
    tierRow.querySelectorAll('.tier-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tierRow.querySelectorAll('.tier-btn').forEach(function (b) {
          b.classList.remove('is-selected');
        });
        btn.classList.add('is-selected');
        var amt = btn.getAttribute('data-amount') || '';
        tierNote.innerHTML = 'Selected: <strong>₹' + amt + '</strong> (demo)';
      });
    });
  }

  /* Contact form (static demo) */
  var form = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  if (form && formSuccess) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.reset();
      formSuccess.hidden = false;
      window.setTimeout(function () {
        formSuccess.hidden = true;
      }, 4000);
    });
  }

  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  function animateCount(el, target, duration, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    var start = performance.now();

    function frame(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = easeOutQuad(t);
      var current = Math.round(target * eased);
      el.textContent = prefix + String(current) + suffix;
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = prefix + String(target) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  var statsAnimated = false;
  var statsBar = document.querySelector('.stats-bar');

  function runStatsIfVisible() {
    if (statsAnimated || !statsBar) return;
    var rect = statsBar.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      statsAnimated = true;
      document.querySelectorAll('.stat-num').forEach(function (el) {
        var raw = el.getAttribute('data-count');
        if (raw == null) return;
        var target = parseFloat(raw, 10);
        if (isNaN(target)) return;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        animateCount(el, target, 2200, prefix, suffix);
      });
    }
  }

  window.addEventListener('scroll', runStatsIfVisible, { passive: true });
  window.addEventListener('load', runStatsIfVisible);
  runStatsIfVisible();

  /* Fade-in sections */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();
