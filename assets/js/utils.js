/* ==========================================================================
   QVIX — shared utilities
   A tiny namespace so each module stays independent and file:// friendly.
   ========================================================================== */
(function () {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const scrollSubscribers = new Set();
  const resizeSubscribers = new Set();
  let scrollTicking = false;

  function dispatchScroll() {
    scrollTicking = false;
    const y = window.scrollY;
    scrollSubscribers.forEach((fn) => fn(y));
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(dispatchScroll);
    }
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resizeSubscribers.forEach((fn) => fn()), 120);
  });

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });

  window.QVIX = {
    pointer,

    get reducedMotion() {
      return motionQuery.matches;
    },

    get finePointer() {
      return finePointer.matches;
    },

    onMotionChange(fn) {
      motionQuery.addEventListener('change', fn);
    },

    onScroll(fn) {
      scrollSubscribers.add(fn);
      fn(window.scrollY);
      return () => scrollSubscribers.delete(fn);
    },

    onResize(fn) {
      resizeSubscribers.add(fn);
      return () => resizeSubscribers.delete(fn);
    },

    lerp: (a, b, t) => a + (b - a) * t,
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),

    /** Run `fn` only while `el` is on screen. Returns an { active } handle. */
    whenVisible(el, onEnter, onLeave, rootMargin = '100px') {
      const state = { active: false };
      const io = new IntersectionObserver(([entry]) => {
        state.active = entry.isIntersecting;
        (state.active ? onEnter : onLeave)?.();
      }, { rootMargin });
      io.observe(el);
      return state;
    },

    /** Size a canvas to its CSS box at device pixel ratio (capped at 2). */
    fitCanvas(canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, width: rect.width, height: rect.height };
    },

    pad: (n, len = 2) => String(n).padStart(len, '0'),

    /** Read a CSS custom property from :root. */
    token(name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    },
  };
})();
