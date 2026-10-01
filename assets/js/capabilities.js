/* ==========================================================================
   QVIX — capabilities: hover/focus/click list driving a schematic stage.
   Desktop: hover or focus previews a discipline. Touch: tap toggles it.
   ========================================================================== */
(function () {
  'use strict';

  QVIX.initCapabilities = function initCapabilities() {
    const list = document.querySelector('[data-caps]');
    if (!list) return;

    const items = [...list.querySelectorAll('.cap')];
    const visuals = [...document.querySelectorAll('.cap-vis')];
    const nameEl = document.querySelector('[data-cap-name]');
    const indexEl = document.querySelector('[data-cap-index]');
    const ticks = [...document.querySelectorAll('.caps__ticks span')];
    const stage = document.querySelector('.caps__visuals');
    const info = document.querySelector('[data-cap-info]');
    const descEl = document.querySelector('[data-cap-desc]');
    const tagsEl = document.querySelector('[data-cap-tags]');
    const desktop = window.matchMedia('(min-width: 1024px)');
    let active = 0;

    function setActive(index) {
      active = index;
      items.forEach((item, i) => {
        const on = i === index;
        item.classList.toggle('is-active', on);
        item.querySelector('.cap__head').setAttribute('aria-expanded', String(on));
      });
      if (index < 0) return;
      visuals.forEach((v, i) => v.classList.toggle('is-active', i === index));
      ticks.forEach((t, i) => t.classList.toggle('is-on', i <= index));
      if (nameEl) nameEl.textContent = items[index].querySelector('.cap__title').textContent;
      if (indexEl) indexEl.textContent = QVIX.pad(index + 1);
      if (info) {
        descEl.textContent = items[index].querySelector('.cap__panel p').textContent;
        tagsEl.innerHTML = items[index].querySelector('.cap__panel .tags').innerHTML;
        info.classList.remove('is-swapping');
        void info.offsetWidth; // restart the entrance animation
        info.classList.add('is-swapping');
      }
    }

    items.forEach((item, i) => {
      const head = item.querySelector('.cap__head');

      item.addEventListener('mouseenter', () => {
        if (desktop.matches && QVIX.finePointer && active !== i) setActive(i);
      });

      head.addEventListener('focus', () => {
        if (desktop.matches && active !== i) setActive(i);
      });

      head.addEventListener('click', () => {
        // On desktop the list always keeps one item open.
        if (!desktop.matches && active === i) setActive(-1);
        else setActive(i);
      });
    });

    list.addEventListener('mouseenter', () => list.classList.add('is-hovering'));
    list.addEventListener('mouseleave', () => list.classList.remove('is-hovering'));

    desktop.addEventListener('change', () => { if (desktop.matches && active < 0) setActive(0); });

    /* Subtle cursor interaction: the schematic drifts against the pointer. */
    if (stage && !QVIX.reducedMotion) {
      const section = list.closest('section');
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

      const tick = () => {
        cx = QVIX.lerp(cx, tx, 0.08);
        cy = QVIX.lerp(cy, ty, 0.08);
        visuals.forEach((v) => { v.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`; });
        raf = Math.abs(cx - tx) + Math.abs(cy - ty) > 0.05 ? requestAnimationFrame(tick) : null;
      };

      section.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const rect = section.getBoundingClientRect();
        tx = ((e.clientX - rect.left) / rect.width - 0.5) * -18;
        ty = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
        if (!raf) raf = requestAnimationFrame(tick);
      });

      section.addEventListener('pointerleave', () => {
        tx = 0;
        ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    }

    setActive(0);
  };
})();
