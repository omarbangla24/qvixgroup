/* ==========================================================================
   QVIX — system architecture diagram
   Nodes, routes and copy are defined once below; the SVG, legend, packets
   and console are generated from them.
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const CORE = {
    id: 'core',
    idx: 'N.00',
    label: 'QVIX CORE',
    title: 'Integration core',
    text: 'The layer QVIX designs: APIs, events and shared services that keep every part of the business in sync.',
    x: 400, y: 280, w: 200, h: 76,
  };

  const NODES = [
    { id: 'business', idx: 'N.01', label: 'BUSINESS', x: 150, y: 90,
      text: 'Goals, processes and rules. Every technical decision traces back to an operational outcome here.' },
    { id: 'data', idx: 'N.02', label: 'DATA', x: 110, y: 300,
      text: 'Pipelines, warehouses and reporting that turn operational records into trustworthy, decision-ready information.' },
    { id: 'software', idx: 'N.03', label: 'SOFTWARE', x: 210, y: 480,
      text: 'Applications, platforms and services — the products your teams and customers actually touch.' },
    { id: 'people', idx: 'N.04', label: 'PEOPLE', x: 650, y: 90,
      text: 'Employees, customers and partners. Identity, access and experience designed around how they really work.' },
    { id: 'automation', idx: 'N.05', label: 'AUTOMATION', x: 690, y: 300,
      text: 'Workflows, integrations and applied AI that remove repetitive work and manual hand-offs.' },
    { id: 'infrastructure', idx: 'N.06', label: 'INFRASTRUCTURE', x: 590, y: 480,
      text: 'Cloud, networks, security and observability — the foundation that keeps everything available, fast and safe.' },
  ];

  /* Orthogonal routes between box edges. `tag` labels the protocol. */
  const LINKS = [
    { a: 'business', b: 'core', d: 'M150 118 V180 H360 V242', tag: 'ERP · CRM', tx: 255, ty: 180, msg: 'order synced' },
    { a: 'people', b: 'core', d: 'M650 118 V180 H440 V242', tag: 'SSO', tx: 545, ty: 180, msg: 'token issued' },
    { a: 'data', b: 'core', d: 'M198 300 H300', tag: 'ETL', tx: 249, ty: 300, msg: 'batch committed' },
    { a: 'automation', b: 'core', d: 'M602 300 H500', tag: 'EVENTS', tx: 551, ty: 300, msg: 'event published' },
    { a: 'software', b: 'core', d: 'M210 452 V380 H360 V318', tag: 'API', tx: 285, ty: 380, msg: 'request served' },
    { a: 'infrastructure', b: 'core', d: 'M590 452 V380 H440 V318', tag: 'IaC · CI/CD', tx: 515, ty: 380, msg: 'deploy verified' },
    { a: 'business', b: 'people', d: 'M238 80 H562', msg: 'policy updated' },
    { a: 'business', b: 'data', d: 'M90 118 V272', msg: 'report generated' },
    { a: 'people', b: 'automation', d: 'M710 118 V272', msg: 'approval routed' },
    { a: 'data', b: 'software', d: 'M110 328 V480 H122', msg: 'cache refreshed' },
    { a: 'automation', b: 'infrastructure', d: 'M690 328 V480 H678', msg: 'job scheduled' },
    { a: 'software', b: 'infrastructure', d: 'M298 496 H502', msg: 'health check passed' },
  ];

  function el(name, attrs = {}, parent) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.appendChild(node);
    return node;
  }

  const byId = (id) => (id === 'core' ? CORE : NODES.find((n) => n.id === id));
  const labelOf = (id) => byId(id).label;

  QVIX.initSystem = function initSystem() {
    const svg = document.querySelector('[data-system-svg]');
    if (!svg) return;

    const gLinks = svg.querySelector('[data-links]');
    const gPackets = svg.querySelector('[data-packets]');
    const gTags = svg.querySelector('[data-tags]');
    const gNodes = svg.querySelector('[data-nodes]');
    const legend = document.querySelector('[data-system-legend]');
    const detail = {
      id: document.querySelector('[data-detail-id]'),
      title: document.querySelector('[data-detail-title]'),
      text: document.querySelector('[data-detail-text]'),
    };
    const consoleEl = document.querySelector('[data-system-console]');
    const detailEl = document.querySelector('[data-system-detail]');

    /* ---- Links + packets ------------------------------------------------- */
    const links = LINKS.map((link, i) => {
      const isCore = link.b === 'core';
      const path = el('path', { d: link.d, class: `sys-link${isCore ? ' sys-link--core' : ''}` }, gLinks);
      if (link.tag) {
        const w = link.tag.length * 7 + 14;
        const g = el('g', { class: 'sys-tag' }, gTags);
        el('rect', { x: link.tx - w / 2, y: link.ty - 9, width: w, height: 18 }, g);
        const t = el('text', { x: link.tx, y: link.ty + 3.5, 'text-anchor': 'middle' }, g);
        t.textContent = link.tag;
      }
      const packet = el('circle', { r: isCore ? 3 : 2.2, class: 'sys-packet' }, gPackets);
      return {
        ...link, path, packet,
        length: path.getTotalLength(),
        offset: (i * 0.137) % 1,
        dir: i % 2 ? -1 : 1,
      };
    });

    /* ---- Nodes ------------------------------------------------------------ */
    const nodeEls = new Map();

    function drawNode(n, isCore) {
      const w = n.w || 176;
      const h = n.h || 56;
      // Pointer target only — keyboard users drive the same state via the legend.
      const g = el('g', {
        class: `sys-node${isCore ? ' sys-core' : ''}`,
        transform: `translate(${n.x - w / 2} ${n.y - h / 2})`,
      }, gNodes);
      if (isCore) {
        el('circle', { cx: w / 2, cy: h / 2, r: 118, class: 'sys-ring' }, g);
        el('circle', { cx: w / 2, cy: h / 2, r: 96, class: 'sys-ring sys-ring--inner' }, g);
      }
      el('rect', { width: w, height: h, class: isCore ? 'sys-core__box' : '' }, g);
      const idx = el('text', { x: 12, y: 18, class: 'sys-idx' }, g);
      idx.textContent = n.idx;
      el('circle', { cx: w - 14, cy: 14, r: 3, class: 'sys-status' }, g);
      const label = el('text', { x: 12, y: h - 14, class: 'sys-label' }, g);
      label.textContent = n.label;
      nodeEls.set(n.id, g);
      return g;
    }

    drawNode(CORE, true);
    NODES.forEach((n) => drawNode(n, false));

    /* ---- Legend ----------------------------------------------------------- */
    const legendButtons = new Map();
    NODES.forEach((n) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<span>${n.idx.replace('N.', '')}</span>${n.label}`;
      btn.addEventListener('mouseenter', () => interact(n.id));
      btn.addEventListener('focus', () => interact(n.id));
      btn.addEventListener('click', () => interact(n.id));
      li.appendChild(btn);
      legend.appendChild(li);
      legendButtons.set(n.id, btn);
    });

    /* ---- Highlight state -------------------------------------------------- */
    let activeId = null;

    function setActive(id) {
      activeId = id;
      const node = id ? byId(id) : CORE;
      const connected = new Set(['core']);
      links.forEach((l) => {
        const hot = id && (l.a === id || l.b === id);
        if (hot) { connected.add(l.a); connected.add(l.b); }
        l.path.classList.toggle('is-hot', !!hot);
        l.path.classList.toggle('is-dim', !!id && !hot);
        l.packet.classList.toggle('is-dim', !!id && !hot);
      });
      nodeEls.forEach((g, nid) => {
        g.classList.toggle('is-active', nid === id);
        g.classList.toggle('is-dim', !!id && !connected.has(nid));
      });
      legendButtons.forEach((b, nid) => b.classList.toggle('is-active', nid === id));

      detail.id.textContent = `Node / ${node.idx.replace('N.', '')}`;
      detail.title.textContent = node.title || node.label.charAt(0) + node.label.slice(1).toLowerCase();
      const peers = links
        .filter((l) => id && (l.a === id || l.b === id))
        .map((l) => labelOf(l.a === id ? l.b : l.a));
      detail.text.textContent = node.text + (peers.length ? ` Connects to: ${peers.join(', ').toLowerCase()}.` : '');
    }

    /* Auto-cycle while idle so the diagram explains itself. */
    let cycleIndex = 0;
    let lastInteraction = 0;
    let cycleTimer = null;

    // Announce details only for user-driven changes, never for the auto-cycle.
    function interact(id) {
      lastInteraction = performance.now();
      detailEl?.setAttribute('aria-live', 'polite');
      setActive(id);
    }

    function cycle() {
      if (performance.now() - lastInteraction < 6000) return;
      detailEl?.setAttribute('aria-live', 'off');
      setActive(NODES[cycleIndex % NODES.length].id);
      cycleIndex++;
    }

    nodeEls.forEach((g, id) => {
      if (id === 'core') return;
      g.addEventListener('mouseenter', () => interact(id));
      g.addEventListener('click', () => interact(id));
    });

    svg.addEventListener('mouseleave', () => { lastInteraction = performance.now(); });

    /* ---- Console ---------------------------------------------------------- */
    const timeFmt = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });

    function log() {
      const pool = activeId ? links.filter((l) => l.a === activeId || l.b === activeId) : links;
      const l = pool[Math.floor(Math.random() * pool.length)];
      const line = document.createElement('span');
      line.innerHTML = `${timeFmt.format(new Date())}&nbsp;&nbsp;${labelOf(l.a)} <b>→</b> ${labelOf(l.b)}&nbsp;&nbsp;·&nbsp;&nbsp;${l.msg}`;
      consoleEl.appendChild(line);
      while (consoleEl.children.length > 6) consoleEl.firstElementChild.remove();
    }

    /* ---- Packet animation ------------------------------------------------- */
    let raf = null;
    function animate(now) {
      const t = now * 0.001;
      links.forEach((l) => {
        const speed = 70 / l.length; // ~70 units per second
        let p = (t * speed + l.offset) % 1;
        if (l.dir < 0) p = 1 - p;
        const pt = l.path.getPointAtLength(p * l.length);
        l.packet.setAttribute('cx', pt.x.toFixed(1));
        l.packet.setAttribute('cy', pt.y.toFixed(1));
      });
      raf = requestAnimationFrame(animate);
    }

    function placePacketsStatic() {
      links.forEach((l) => {
        const pt = l.path.getPointAtLength(l.length * 0.5);
        l.packet.setAttribute('cx', pt.x);
        l.packet.setAttribute('cy', pt.y);
      });
    }

    let logTimer = null;
    function start() {
      if (!logTimer) {
        log();
        logTimer = setInterval(log, 1600);
      }
      if (QVIX.reducedMotion) return;
      if (!raf) raf = requestAnimationFrame(animate);
      if (!cycleTimer) cycleTimer = setInterval(cycle, 3600);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      clearInterval(logTimer);
      clearInterval(cycleTimer);
      raf = logTimer = cycleTimer = null;
    }

    placePacketsStatic();
    setActive(null);
    QVIX.whenVisible(svg, start, stop);
  };
})();
