/* ==========================================================================
   QVIX — the QVIX approach: pinned horizontal storytelling.
   On wide, motion-tolerant viewports the section pins and its stages travel
   horizontally with vertical scroll. Elsewhere it stays a vertical stack.
   ========================================================================== */
(function () {
  'use strict';

  QVIX.initApproach = function initApproach() {
    const section = document.querySelector('[data-approach]');
    if (!section) return;

    const track = section.querySelector('[data-approach-track]');
    const stages = [...track.children];
    const bar = section.querySelector('[data-approach-bar]');
    const current = section.querySelector('[data-approach-current]');
    const wide = window.matchMedia('(min-width: 1024px)');
    let pinned = false;
    let distance = 0;
    let activeIndex = -1;

    function setActive(index) {
      if (index === activeIndex) return;
      activeIndex = index;
      stages.forEach((s, i) => s.classList.toggle('is-active', i === index));
      if (current) current.textContent = QVIX.pad(index + 1);
    }

    function measure() {
      const shouldPin = wide.matches && !QVIX.reducedMotion;
      section.classList.toggle('is-pinned', shouldPin);
      pinned = shouldPin;

      if (!pinned) {
        section.style.removeProperty('--pin-height');
        track.style.transform = '';
        return;
      }

      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      // Scroll more than the travel distance so each stage gets time to read.
      const runway = Math.max(distance * 1.8, window.innerHeight * 1.5);
      section.style.setProperty('--pin-height', `${window.innerHeight + runway}px`);
      update();
    }

    function update() {
      if (!pinned) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = total > 0 ? QVIX.clamp(-rect.top / total, 0, 1) : 0;
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px, 0, 0)`;
      bar?.style.setProperty('--p', progress.toFixed(4));
      setActive(Math.min(stages.length - 1, Math.round(progress * (stages.length - 1))));
    }

    // Stacked mode: activate the stage crossing the middle of the viewport.
    const io = new IntersectionObserver((entries) => {
      if (pinned) return;
      entries.forEach((e) => { if (e.isIntersecting) setActive(stages.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    stages.forEach((s) => io.observe(s));

    measure();
    QVIX.onScroll(update);
    QVIX.onResize(measure);
    wide.addEventListener('change', measure);
    QVIX.onMotionChange(measure);
    document.fonts?.ready.then(measure);
    setActive(0);
  };
})();
