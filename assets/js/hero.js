/* ==========================================================================
   QVIX — hero system model
   A point lattice that slowly morphs between a sphere and a torus — one
   structure continuously re-shaping itself — drawn on canvas, framed by an
   instrument dial. Pointer tilts the model; readouts report live values.
   ========================================================================== */
(function () {
  'use strict';

  const PAPER = '236, 232, 223';
  const ACCENT = '255, 90, 31';
  const U = 64; // segments around
  const V = 28; // segments from pole to pole
  const TAU = Math.PI * 2;

  /** Precompute both shapes so each frame only interpolates. */
  function buildLattice() {
    const sphere = [];
    const torus = [];
    for (let j = 0; j <= V; j++) {
      const v = (j / V) * Math.PI;
      const w = (j / V) * TAU;
      for (let i = 0; i < U; i++) {
        const u = (i / U) * TAU;
        sphere.push([Math.cos(u) * Math.sin(v), Math.cos(v), Math.sin(u) * Math.sin(v)]);
        const R = 0.7;
        const r = 0.3;
        torus.push([(R + r * Math.cos(w)) * Math.cos(u), r * Math.sin(w), (R + r * Math.cos(w)) * Math.sin(u)]);
      }
    }
    return { sphere, torus, count: sphere.length };
  }

  QVIX.initHero = function initHero() {
    const canvas = document.querySelector('[data-hero-canvas]');
    if (!canvas) return;

    const readout = {
      rx: document.querySelector('[data-readout="rx"]'),
      ry: document.querySelector('[data-readout="ry"]'),
      morph: document.querySelector('[data-readout="morph"]'),
      nodes: document.querySelector('[data-readout="nodes"]'),
    };
    const fpsEl = document.querySelector('[data-status="fps"]');
    const viewportEl = document.querySelector('[data-status="viewport"]');

    const lattice = buildLattice();
    const projected = new Float32Array(lattice.count * 3);
    let ctx;
    let width = 0;
    let height = 0;
    let rotX = 0.42;
    let rotY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let lastReadout = 0;
    let frames = 0;
    let fpsStamp = performance.now();
    let rafId = null;

    readout.nodes.textContent = QVIX.pad(lattice.count, 4);

    function resize() {
      ({ ctx, width, height } = QVIX.fitCanvas(canvas));
      viewportEl.textContent = `${window.innerWidth} × ${window.innerHeight}`;
      if (!rafId) draw(performance.now());
    }

    function draw(now) {
      const t = now * 0.001;
      const size = Math.min(width, height);
      const cx = width / 2;
      const cy = height / 2;
      const scale = size * 0.36;

      // Morph eases between sphere (0) and torus (1) on a slow cycle.
      const raw = QVIX.reducedMotion ? 0.35 : (Math.sin(t * 0.22 - Math.PI / 2) + 1) / 2;
      const morph = raw * raw * (3 - 2 * raw);

      if (!QVIX.reducedMotion) rotY = t * 0.16;
      const ax = rotX + tiltX;
      const ay = rotY + tiltY;
      const sx = Math.sin(ax), cxr = Math.cos(ax);
      const sy = Math.sin(ay), cyr = Math.cos(ay);

      for (let k = 0; k < lattice.count; k++) {
        const a = lattice.sphere[k];
        const b = lattice.torus[k];
        let x = a[0] + (b[0] - a[0]) * morph;
        let y = a[1] + (b[1] - a[1]) * morph;
        let z = a[2] + (b[2] - a[2]) * morph;
        // rotate Y then X
        const x1 = x * cyr - z * sy;
        const z1 = x * sy + z * cyr;
        const y1 = y * cxr - z1 * sx;
        const z2 = y * sx + z1 * cxr;
        const p = 3.4 / (3.4 - z2);
        projected[k * 3] = cx + x1 * scale * p;
        projected[k * 3 + 1] = cy + y1 * scale * p;
        projected[k * 3 + 2] = z2;
      }

      ctx.clearRect(0, 0, width, height);

      // Instrument dial
      const dialR = size * 0.47;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(QVIX.reducedMotion ? 0 : -t * 0.05);
      for (let i = 0; i < 120; i++) {
        const ang = (i / 120) * TAU;
        const long = i % 10 === 0;
        const len = long ? 10 : 4;
        ctx.strokeStyle = `rgba(${PAPER}, ${long ? 0.4 : 0.16})`;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * dialR, Math.sin(ang) * dialR);
        ctx.lineTo(Math.cos(ang) * (dialR - len), Math.sin(ang) * (dialR - len));
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = `rgba(${PAPER}, 0.08)`;
      ctx.beginPath();
      ctx.arc(cx, cy, dialR + 8, 0, TAU);
      ctx.stroke();

      // Latitude rings (every 4th) — structure lines
      ctx.lineWidth = 1;
      for (let j = 0; j <= V; j += 4) {
        const isAccent = j === 16;
        ctx.strokeStyle = isAccent ? `rgba(${ACCENT}, 0.85)` : `rgba(${PAPER}, 0.1)`;
        ctx.beginPath();
        for (let i = 0; i <= U; i++) {
          const k = (j * U + (i % U)) * 3;
          i === 0 ? ctx.moveTo(projected[k], projected[k + 1]) : ctx.lineTo(projected[k], projected[k + 1]);
        }
        ctx.stroke();
      }

      // Meridians (every 8th)
      ctx.strokeStyle = `rgba(${PAPER}, 0.07)`;
      for (let i = 0; i < U; i += 8) {
        ctx.beginPath();
        for (let j = 0; j <= V; j++) {
          const k = (j * U + i) * 3;
          j === 0 ? ctx.moveTo(projected[k], projected[k + 1]) : ctx.lineTo(projected[k], projected[k + 1]);
        }
        ctx.stroke();
      }

      // Points, depth-shaded
      for (let k = 0; k < lattice.count; k++) {
        const z = projected[k * 3 + 2];
        const depth = (z + 1.1) / 2.2;
        const alpha = 0.12 + depth * 0.75;
        const r = 0.6 + depth * 1.1;
        ctx.fillStyle = `rgba(${PAPER}, ${alpha.toFixed(3)})`;
        ctx.fillRect(projected[k * 3] - r / 2, projected[k * 3 + 1] - r / 2, r, r);
      }

      // Travelling signal on the accent ring
      const travel = Math.floor(((QVIX.reducedMotion ? 0.2 : t * 0.08) % 1) * U);
      const kk = (16 * U + travel) * 3;
      ctx.fillStyle = `rgb(${ACCENT})`;
      ctx.beginPath();
      ctx.arc(projected[kk], projected[kk + 1], 3.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(${ACCENT}, 0.35)`;
      ctx.beginPath();
      ctx.arc(projected[kk], projected[kk + 1], 9, 0, TAU);
      ctx.stroke();

      // Leader line from the signal to the frame edge
      ctx.strokeStyle = `rgba(${PAPER}, 0.18)`;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(projected[kk], projected[kk + 1]);
      ctx.lineTo(width - 12, projected[kk + 1]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Readouts (throttled)
      if (now - lastReadout > 120) {
        lastReadout = now;
        const deg = (rad) => (((rad * 180) / Math.PI) % 360 + 360) % 360;
        readout.rx.textContent = `${deg(ax).toFixed(1).padStart(5, '0')}°`;
        readout.ry.textContent = `${deg(ay).toFixed(1).padStart(5, '0')}°`;
        readout.morph.textContent = morph.toFixed(3);
      }
    }

    function loop(now) {
      // Pointer tilt, eased.
      const nx = QVIX.pointer.x / window.innerWidth - 0.5;
      const ny = QVIX.pointer.y / window.innerHeight - 0.5;
      tiltX = QVIX.lerp(tiltX, ny * 0.5, 0.05);
      tiltY = QVIX.lerp(tiltY, nx * 0.7, 0.05);
      draw(now);

      frames++;
      if (now - fpsStamp >= 1000) {
        fpsEl.textContent = `${Math.round((frames * 1000) / (now - fpsStamp))} fps`;
        frames = 0;
        fpsStamp = now;
      }
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (rafId || QVIX.reducedMotion) return;
      fpsStamp = performance.now();
      frames = 0;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    resize();
    QVIX.onResize(resize);
    if (QVIX.reducedMotion) fpsEl.textContent = 'Static';
    QVIX.whenVisible(canvas, start, stop, '0px');
    QVIX.onMotionChange(() => {
      if (QVIX.reducedMotion) {
        stop();
        fpsEl.textContent = 'Static';
        draw(performance.now());
      } else {
        start();
      }
    });
  };
})();
