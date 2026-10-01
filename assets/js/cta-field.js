/* ==========================================================================
   QVIX — final CTA field
   A dot matrix that parts around the pointer — a quiet signal that the
   page is listening. Without a pointer, a slow autonomous probe drives it.
   ========================================================================== */
(function () {
  'use strict';

  const PAPER = '236, 232, 223';
  const ACCENT = '255, 90, 31';

  QVIX.initCtaField = function initCtaField() {
    const canvas = document.querySelector('[data-cta-field]');
    if (!canvas) return;
    const section = canvas.parentElement;

    let ctx, width, height;
    let dots = [];
    let raf = null;
    let pointerInside = false;
    const probe = { x: 0, y: 0 };
    const local = { x: -9999, y: -9999 };

    function build() {
      ({ ctx, width, height } = QVIX.fitCanvas(canvas));
      const gap = width < 768 ? 22 : 28;
      dots = [];
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) dots.push([x, y]);
      }
      probe.x = width * 0.7;
      probe.y = height * 0.5;
      draw(performance.now());
    }

    function draw(now) {
      const t = now * 0.001;
      if (pointerInside) {
        probe.x = QVIX.lerp(probe.x, local.x, 0.12);
        probe.y = QVIX.lerp(probe.y, local.y, 0.12);
      } else if (!QVIX.reducedMotion) {
        const tx = width * (0.62 + Math.sin(t * 0.31) * 0.24);
        const ty = height * (0.5 + Math.sin(t * 0.47) * 0.28);
        probe.x = QVIX.lerp(probe.x, tx, 0.03);
        probe.y = QVIX.lerp(probe.y, ty, 0.03);
      }

      const radius = Math.min(width, height) * 0.32;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const [x0, y0] = dots[i];
        const dx = x0 - probe.x;
        const dy = y0 - probe.y;
        const dist = Math.hypot(dx, dy);
        const f = Math.max(0, 1 - dist / radius);
        const push = f * f * 22;
        const nx = dist ? dx / dist : 0;
        const ny = dist ? dy / dist : 0;
        const x = x0 + nx * push;
        const y = y0 + ny * push;

        if (f > 0.82) {
          ctx.fillStyle = `rgba(${ACCENT}, ${(0.4 + f * 0.6).toFixed(3)})`;
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        } else {
          ctx.fillStyle = `rgba(${PAPER}, ${(0.09 + f * 0.5).toFixed(3)})`;
          const s = 1 + f * 1.4;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }

      // Probe crosshair
      ctx.strokeStyle = `rgba(${ACCENT}, 0.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(probe.x - 10, probe.y);
      ctx.lineTo(probe.x + 10, probe.y);
      ctx.moveTo(probe.x, probe.y - 10);
      ctx.lineTo(probe.x, probe.y + 10);
      ctx.stroke();
    }

    function loop(now) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (!raf && !QVIX.reducedMotion) raf = requestAnimationFrame(loop);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    section.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      local.x = e.clientX - rect.left;
      local.y = e.clientY - rect.top;
      pointerInside = e.pointerType === 'mouse';
      if (QVIX.reducedMotion) {
        probe.x = local.x;
        probe.y = local.y;
        draw(performance.now());
      }
    });
    section.addEventListener('pointerleave', () => { pointerInside = false; });

    build();
    QVIX.onResize(build);
    QVIX.whenVisible(section, start, stop, '0px');
  };
})();
