/* ==========================================================================
   QVIX — scroll reveals, word-masked headlines, scroll-scrubbed statement,
   count-up numbers and parallax.
   ========================================================================== */
(function () {
  'use strict';

  function span(className) {
    const s = document.createElement('span');
    s.className = className;
    return s;
  }

  /** Wrap each word in a mask so headlines can rise word by word. Inline
   *  elements (e.g. an accent "?") stay attached to the word they touch. */
  function splitIntoMaskedWords(el) {
    const nodes = [...el.childNodes];
    el.textContent = '';
    let current = null;
    let index = 0;

    const newWord = () => {
      const mask = span('line line--word');
      const inner = span('line__inner');
      inner.style.setProperty('--i', index++);
      mask.appendChild(inner);
      el.appendChild(mask);
      current = inner;
    };

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(' '));
            current = null;
          } else {
            if (!current) newWord();
            current.appendChild(document.createTextNode(part));
          }
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(node);
        current = null;
      } else {
        if (!current) newWord();
        current.appendChild(node);
      }
    });
  }

  function initReveals() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (QVIX.reducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    targets.forEach((el) => io.observe(el));
  }

  /* ---- Count-up --------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (Number.isNaN(target)) return; // placeholder value — leave as written
      const pad = parseInt(el.dataset.pad || '0', 10);
      const format = (v) => (pad ? QVIX.pad(v, pad) : String(v));
      if (QVIX.reducedMotion) {
        el.textContent = format(target);
        return;
      }
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = format(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => {
      if (el.dataset.count === '') return;
      if (!QVIX.reducedMotion) el.textContent = el.dataset.pad ? QVIX.pad(0, +el.dataset.pad) : '0';
      io.observe(el);
    });
  }

  /* ---- Scroll-scrubbed statement --------------------------------------- */
  function initScrub() {
    document.querySelectorAll('[data-scrub-words]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = words.map((w) => `<span class="word" aria-hidden="true">${w}</span>`).join(' ');
      const spans = [...el.querySelectorAll('.word')];

      if (QVIX.reducedMotion) {
        spans.forEach((s) => s.classList.add('is-lit'));
        return;
      }

      QVIX.onScroll(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.85;
        const end = vh * 0.35;
        const progress = QVIX.clamp((start - rect.top) / (start - end + rect.height * 0.5), 0, 1);
        const lit = Math.round(progress * spans.length);
        spans.forEach((s, i) => s.classList.toggle('is-lit', i < lit));
      });
    });
  }

  /* ---- Parallax --------------------------------------------------------- */
  function initParallax() {
    const items = [...document.querySelectorAll('[data-parallax]')];
    if (!items.length || QVIX.reducedMotion) return;

    QVIX.onScroll(() => {
      const vh = window.innerHeight;
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0;
        const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
    });
  }

  QVIX.initReveal = function initReveal() {
    document.querySelectorAll('[data-reveal="lines"]').forEach(splitIntoMaskedWords);
    initScrub();
    initParallax();
    // Entrance reveals wait for the loader so nothing animates unseen.
    document.addEventListener('qvix:ready', () => {
      initReveals();
      initCounters();
    }, { once: true });
  };
})();
