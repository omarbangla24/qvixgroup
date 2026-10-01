/* ==========================================================================
   QVIX — page loader
   Counts to 100 once per session, then wipes upward and marks the page ready.
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;
  const loader = document.querySelector('.loader');
  const STEPS = ['Loading modules', 'Compiling layout', 'Linking systems', 'Ready'];

  function ready() {
    root.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('qvix:ready'));
    try { sessionStorage.setItem('qvix:loaded', '1'); } catch (e) { /* storage blocked */ }
  }

  QVIX.boot = function boot() {
    const skip = !loader || root.classList.contains('is-returning') || QVIX.reducedMotion;
    if (skip) {
      loader?.classList.add('is-done');
      // Let the first frame paint before triggering entrance transitions.
      requestAnimationFrame(() => requestAnimationFrame(ready));
      return;
    }

    const countEl = loader.querySelector('[data-loader-count]');
    const barEl = loader.querySelector('[data-loader-bar]');
    const stepEl = loader.querySelector('[data-loader-step]');
    const duration = 1300;
    const start = performance.now();
    document.body.classList.add('is-locked');

    // Wait for fonts too, but never longer than the animation itself.
    let fontsReady = false;
    (document.fonts?.ready || Promise.resolve()).then(() => { fontsReady = true; });

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * 100);
      countEl.textContent = QVIX.pad(value, 3);
      barEl.style.transform = `scaleX(${eased})`;
      stepEl.textContent = STEPS[Math.min(STEPS.length - 1, Math.floor(eased * STEPS.length))];

      if (t < 1 || (!fontsReady && now - start < duration + 1200)) {
        requestAnimationFrame(frame);
        return;
      }

      loader.classList.add('is-leaving');
      document.body.classList.remove('is-locked');
      setTimeout(ready, 250);
      loader.addEventListener('transitionend', () => loader.classList.add('is-done'), { once: true });
    }

    requestAnimationFrame(frame);
  };
})();
