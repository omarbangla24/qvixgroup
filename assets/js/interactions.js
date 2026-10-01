/* ==========================================================================
   QVIX — micro-interactions: magnetic CTAs, cursor follower, marquee,
   generative article art and the grid overlay toggle.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Magnetic CTAs ---------------------------------------------------- */
  function initMagnetic() {
    if (!QVIX.finePointer || QVIX.reducedMotion) return;

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
      const state = { x: 0, y: 0, tx: 0, ty: 0, raf: null };

      const tick = () => {
        state.x = QVIX.lerp(state.x, state.tx, 0.18);
        state.y = QVIX.lerp(state.y, state.ty, 0.18);
        el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
        const settled = Math.abs(state.x - state.tx) + Math.abs(state.y - state.ty) < 0.1;
        state.raf = settled ? null : requestAnimationFrame(tick);
      };

      const kick = () => { if (!state.raf) state.raf = requestAnimationFrame(tick); };

      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        state.tx = (e.clientX - (rect.left + rect.width / 2)) * strength;
        state.ty = (e.clientY - (rect.top + rect.height / 2)) * strength;
        kick();
      });

      el.addEventListener('pointerleave', () => {
        state.tx = 0;
        state.ty = 0;
        kick();
      });
    });
  }

  /* ---- Cursor follower (Work + Insights only) --------------------------- */
  const PREVIEWS = {
    // Automation: routed nodes
    a: `<svg viewBox="0 0 260 195" fill="none" stroke="rgba(236,232,223,.35)">
          <path d="M30 98H90M110 98H150V50H200M150 98V146H200"/>
          <rect x="70" y="84" width="40" height="28"/><rect x="200" y="36" width="34" height="28"/>
          <rect x="200" y="132" width="34" height="28" stroke="#ff5a1f"/>
          <circle cx="30" cy="98" r="5" fill="#ff5a1f" stroke="none"/>
        </svg>`,
    // Longevity: rising stack
    b: `<svg viewBox="0 0 260 195" fill="none" stroke="rgba(236,232,223,.35)">
          <path d="M24 168H236"/>
          <rect x="36" y="128" width="34" height="40"/><rect x="82" y="108" width="34" height="60"/>
          <rect x="128" y="84" width="34" height="84"/><rect x="174" y="52" width="34" height="116" stroke="#ff5a1f"/>
          <path d="M53 120 99 100 145 76 191 44" stroke="#ff5a1f" stroke-dasharray="3 4"/>
        </svg>`,
  };

  function initFollower() {
    const follower = document.querySelector('.follower');
    if (!follower || !QVIX.finePointer) return;

    const labelEl = follower.querySelector('[data-follower-label]');
    const previewEl = follower.querySelector('[data-follower-preview]');
    let x = QVIX.pointer.x;
    let y = QVIX.pointer.y;
    let raf = null;
    let mode = null;

    const tick = () => {
      const ease = QVIX.reducedMotion ? 1 : 0.16;
      x = QVIX.lerp(x, QVIX.pointer.x, ease);
      y = QVIX.lerp(y, QVIX.pointer.y, ease);
      follower.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = mode ? requestAnimationFrame(tick) : null;
    };

    const show = (newMode) => {
      mode = newMode;
      follower.classList.toggle('is-label', mode === 'label');
      follower.classList.toggle('is-preview', mode === 'preview');
      if (mode && !raf) {
        x = QVIX.pointer.x;
        y = QVIX.pointer.y;
        raf = requestAnimationFrame(tick);
      }
    };

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        labelEl.textContent = el.dataset.cursor;
        show('label');
      });
      el.addEventListener('pointerleave', () => show(null));
    });

    document.querySelectorAll('[data-cursor-preview]').forEach((el) => {
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        previewEl.innerHTML = PREVIEWS[el.dataset.cursorPreview] || '';
        show('preview');
      });
      el.addEventListener('pointerleave', () => show(null));
    });

    window.addEventListener('scroll', () => { if (mode) show(null); }, { passive: true });
  }

  /* ---- Marquee ---------------------------------------------------------- */
  function initMarquee() {
    const track = document.querySelector('[data-marquee]');
    if (!track) return;
    const group = track.querySelector('.marquee__group');
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    const setSpeed = () => {
      const pxPerSecond = 55;
      track.style.setProperty('--marquee-duration', `${(group.offsetWidth / pxPerSecond).toFixed(1)}s`);
    };
    setSpeed();
    QVIX.onResize(setSpeed);
    document.fonts?.ready.then(setSpeed);
  }

  /* ---- Generative cover: contour lines with a single raised signal ----- */
  function initCovers() {
    document.querySelectorAll('.cover-lines').forEach((g) => {
      const W = 600;
      const H = 380;
      const lines = 30;
      const fx = W * 0.64;
      const fy = H * 0.46;
      let markup = '';
      for (let i = 0; i < lines; i++) {
        const y0 = 14 + (i * (H - 28)) / (lines - 1);
        let d = '';
        for (let x = -20; x <= W + 20; x += 12) {
          const dx = (x - fx) / 120;
          const dy = (y0 - fy) / 90;
          const bump = Math.exp(-(dx * dx + dy * dy)) * 46;
          const wave = Math.sin(x * 0.012 + i * 0.4) * 3;
          const y = y0 - bump + wave;
          d += `${x === -20 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
        }
        markup += `<path d="${d}"${i === 15 ? ' class="is-acc"' : ''}/>`;
      }
      g.innerHTML = markup;
    });
  }

  /* ---- Grid overlay (press G) ------------------------------------------ */
  function initGridToggle() {
    const overlay = document.querySelector('.grid-overlay');
    if (!overlay) return;
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      overlay.classList.toggle('is-visible');
    });
  }

  QVIX.initInteractions = function initInteractions() {
    initMarquee();
    initCovers();
    initMagnetic();
    initFollower();
    initGridToggle();
  };
})();
