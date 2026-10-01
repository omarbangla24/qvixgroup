/* ==========================================================================
   QVIX — entry point. Each module is independent; order only matters for
   the loader, which runs last and announces `qvix:ready`.
   ========================================================================== */
(function () {
  'use strict';

  const modules = [
    'initHeader',
    'initReveal',
    'initHero',
    'initCapabilities',
    'initApproach',
    'initSystem',
    'initInteractions',
    'initCtaField',
  ];

  modules.forEach((name) => {
    try {
      QVIX[name]?.();
    } catch (err) {
      // A failing enhancement must never block the rest of the page.
      console.error(`[QVIX] ${name} failed`, err);
    }
  });

  QVIX.boot();
})();
