/* ==========================================================================
   QVIX — header: scroll state, hide-on-scroll, progress, active section,
   mobile menu and live clock.
   ========================================================================== */
(function () {
  'use strict';

  QVIX.initHeader = function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const progress = header.querySelector('[data-scroll-progress]');
    const toggle = header.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    let lastY = 0;
    let menuOpen = false;

    /* ---- Scroll state ---------------------------------------------------- */
    QVIX.onScroll((y) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle('is-scrolled', y > 40);
      // Hide when travelling down past the hero, reveal on any upward scroll.
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (!menuOpen && y > window.innerHeight * 0.9 && goingDown) header.classList.add('is-hidden');
      if (goingUp || y < window.innerHeight * 0.9) header.classList.remove('is-hidden');
      if (Math.abs(y - lastY) > 4) lastY = y;
      progress?.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    });

    // Keep header visible while keyboard users tab through it.
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

    /* ---- Active nav link -------------------------------------------------- */
    const links = [...header.querySelectorAll('.nav__link')];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const inView = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      });
      const current = sections.find((s) => inView.has(s));
      const id = current ? `#${current.id}` : null;
      links.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === id));
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));

    /* ---- Mobile menu ------------------------------------------------------ */
    function setMenu(open) {
      menuOpen = open;
      toggle.setAttribute('aria-expanded', String(open));
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('is-locked', open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        menu.querySelector('a')?.focus({ preventScroll: true });
      } else {
        menu.classList.remove('is-open');
        const done = () => { if (!menuOpen) menu.hidden = true; };
        QVIX.reducedMotion ? done() : menu.addEventListener('transitionend', done, { once: true });
      }
    }

    toggle?.addEventListener('click', () => setMenu(!menuOpen));
    menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });
    QVIX.onResize(() => { if (menuOpen && window.innerWidth >= 1100) setMenu(false); });

    /* ---- Clock ----------------------------------------------------------- */
    const clocks = document.querySelectorAll('[data-clock]');
    const fmt = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const tz = (() => {
      const part = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
        .formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
      return part ? part.value : '';
    })();
    function tick() {
      const text = `${fmt.format(new Date())} ${tz}`.trim();
      clocks.forEach((c) => { c.textContent = text; });
    }
    tick();
    setInterval(tick, 1000);
  };
})();
