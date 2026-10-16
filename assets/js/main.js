/* =========================================================
   Aurelle — motion & interaction
   GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var MOTION = !REDUCED && !!gsap && !!ST;
  var lenis = null;
  var mouse = { x: 0, y: 0 }; // normalised pointer, shared by hero layers

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     Text splitting (keeps nested <em>, .line etc.)
     --------------------------------------------------------- */
  function splitChars(el) {
    var chars = [];
    el._units = [];
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1 && child.tagName === 'EM') {
          // accent words stay whole (they carry the light-sweep gradient) and get a mask wipe instead
          var holder = document.createElement('span');
          holder.className = 'word word--em';
          node.replaceChild(holder, child);
          holder.appendChild(child);
          el._units.push(child);
          return;
        }
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'word';
            Array.from(part).forEach(function (ch) {
              var c = document.createElement('span');
              c.className = 'char';
              c.textContent = ch;
              w.appendChild(c);
              chars.push(c);
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    // hide the fragmented spans from screen readers; the aria-label carries the text
    $$('.word', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    return chars;
  }

  function splitWords(el) {
    var words = [];
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1 && child.tagName === 'EM') { words.push(child); return; }
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            w.textContent = part;
            frag.appendChild(w);
            words.push(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    }
    walk(el);
    return words;
  }

  function formatNumber(v, el) {
    var dec = +(el.getAttribute('data-decimals') || 0);
    var s = v.toFixed(dec).replace('.', ',');
    if (el.getAttribute('data-format') === 'space') s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s;
  }

  /* =========================================================
     Always-on UI (works without GSAP)
     ========================================================= */
  initMenu();
  initHeader();
  initBeforeAfter();
  initQuotes();
  initForm();

  if (!MOTION) {
    staticMode();
    return;
  }

  /* =========================================================
     Motion mode
     ========================================================= */
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  root.classList.add('motion');
  var DESKTOP = window.matchMedia('(min-width: 861px)').matches;
  var BLUR = DESKTOP; // blur-to-sharp only where the GPU budget is comfortable
  body.classList.add('is-loading');

  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.25,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 0.95
    });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  initAnchors();
  var heroIntro = initHero();
  initMarquee();
  initHeadings();
  initPhilosophy();
  initServices();
  initTechnology();
  initDoctors();
  initJourney();
  initReveals();
  initFooter();
  initTones();
  initWipes();
  initVelocity();
  initRolls();
  if (FINE) { initCursor(); initMagnetic(); }
  runLoader(heroIntro);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });

  /* ---------------------------------------------------------
     Loader
     --------------------------------------------------------- */
  function runLoader(onDone) {
    var loader = $('.loader');
    if (!loader) { onDone && onDone.play(); return; }
    loader.style.animation = 'none';
    var count = $('.loader__count', loader);
    var wordChars = splitChars($('.loader__word', loader));
    var counter = { v: 0 };
    var ready = new Promise(function (res) {
      var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      Promise.race([fonts, new Promise(function (r) { setTimeout(r, 2500); })]).then(res);
    });

    var tl = gsap.timeline();
    tl.from(wordChars, { yPercent: 110, duration: 1.2, stagger: 0.05, ease: 'expo.out' }, 0.1)
      .to('.loader__ring', { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut' }, 0)
      .to('.loader__a', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.35)
      .to(counter, {
        v: 100, duration: 1.9, ease: 'power2.inOut',
        onUpdate: function () { count.textContent = String(Math.round(counter.v)).padStart(2, '0'); }
      }, 0);

    Promise.all([ready, new Promise(function (r) { tl.eventCallback('onComplete', r); })]).then(function () {
      var out = gsap.timeline({
        onComplete: function () {
          loader.style.display = 'none';
          body.classList.remove('is-loading');
          if (lenis) lenis.start();
          ST.refresh();
        }
      });
      out.to('.loader__inner', { yPercent: -18, autoAlpha: 0, duration: 0.8, ease: 'power3.in' })
        .to('.loader__curtain', { scaleY: 1, duration: 0.9, ease: 'expo.inOut' }, 0.35)
        .set(loader, { backgroundColor: 'transparent' })
        .set('.loader__curtain', { transformOrigin: '50% 0%' })
        .to('.loader__curtain', { scaleY: 0, duration: 1.1, ease: 'expo.inOut' })
        .add(function () { onDone && onDone.play(); }, '-=0.75');
    });
  }

  /* ---------------------------------------------------------
     Hero — pinned, scroll-assembled implant
     --------------------------------------------------------- */
  function initHero() {
    var title = $('[data-split-hero]');
    var chars = title ? splitChars(title) : [];
    var svg = $('.implant');
    var crown = $('.part-crown'), abut = $('.part-abutment'), screw = $('.part-screw');
    var drawEls = $$('[pathLength]', svg);
    var fadeEls = $$('.dash, .axis, text, .node', svg);
    var steps = $$('.hero__steps li');
    var sheet = $('.sheet-n');
    var ems = title ? title._units : [];
    var mmHero = gsap.matchMedia();

    gsap.set(chars, { yPercent: 115 });
    gsap.set(ems, { clipPath: 'inset(0% 100% -20% 0%)', filter: BLUR ? 'blur(10px)' : 'none', x: -20 });
    gsap.set(['.hero__eyebrow', '.hero__actions', '.hero__scroll', '.hero__steps'], { autoAlpha: 0, y: 24 });
    gsap.set('.hero__lead', { autoAlpha: 0, y: 24, clipPath: 'inset(0% 0% 100% 0%)', filter: BLUR ? 'blur(6px)' : 'none' });
    gsap.set(drawEls, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(fadeEls, { opacity: 0 });
    gsap.set(crown, { y: -96 });
    gsap.set(abut, { y: -26 });
    gsap.set(screw, { y: 64 });
    gsap.set(svg, { transformPerspective: 1400, rotationY: -14, transformOrigin: '50% 50%' });

    // intro (time-based), played after the loader
    var intro = gsap.timeline({ paused: true });
    intro.to(chars, { yPercent: 0, duration: 1.5, stagger: 0.022, ease: 'expo.out' }, 0)
      .to(ems, { clipPath: 'inset(0% 0% -20% 0%)', filter: 'blur(0px)', x: 0, duration: 2, ease: 'expo.out' }, 0.25)
      .to('.hero__lead', { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% -10% 0%)', filter: 'blur(0px)', duration: 1.8, ease: 'expo.out' }, 0.6)
      .to(drawEls, { strokeDashoffset: 0, duration: 2.6, stagger: { each: 0.03, from: 'end' }, ease: 'power2.inOut' }, 0.1)
      .to(fadeEls, { opacity: 1, duration: 1.4, stagger: 0.02, ease: 'power2.out' }, 1.2)
      .to(['.hero__eyebrow', '.hero__actions', '.hero__steps', '.hero__scroll'], { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.08, ease: 'expo.out' }, 0.5)
      .add(startAmbient, 1.6);

    // ambient, always-on motion: the drawing breathes, construction rings turn
    function startAmbient() {
      gsap.to('.hero__float', { y: -14, rotation: 0.6, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.bp-construct circle.dash', { rotation: 360, svgOrigin: '300 420', duration: 140, ease: 'none', repeat: -1 });
      gsap.to('.bp-construct line.dash', { rotation: -6, svgOrigin: '300 420', duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.implant .node', { scale: 1.8, transformOrigin: '50% 50%', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 });
    }
    initDust();

    var current = -1;
    function setStep(i) {
      if (i === current) return;
      current = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (sheet) sheet.textContent = i + 1;
    }
    setStep(0);

    mmHero.add({ isMobile: '(max-width: 860px)', isDesktop: '(min-width: 861px)' }, function (ctx) {
      var tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.hero__pin',
          start: 'top top',
          end: ctx.conditions.isMobile ? '+=160%' : '+=230%',
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
          onUpdate: function (self) {
            var p = self.progress;
            setStep(p < 0.34 ? 0 : p < 0.62 ? 1 : 2);
          }
        }
      });
      tl.to(crown, { y: 22, duration: 4, ease: 'power3.inOut' }, 0.4)
        .to(abut, { y: 0, duration: 4, ease: 'power3.inOut' }, 0.4)
        .to(screw, { y: 0, duration: 4, ease: 'power3.inOut' }, 0.4)
        .to(svg, { rotationY: 0, duration: 5 }, 0)
        .to('.part .annot', { opacity: 0, duration: 1.6 }, 4.6)
        .to('.part .solid', { opacity: 1, duration: 2.6, stagger: 0.35 }, 4.8)
        .to('.part .lines', { opacity: 0.16, duration: 2.6 }, 5.1)
        .to('.bp-construct', { opacity: 0.12, duration: 2.4 }, 5)
        .to('.implant .tissue', { opacity: 0.35, duration: 2.4 }, 5)
        .to('.implant .halo', { opacity: 1, duration: 3 }, 5.2)
        .to('.hero__glow', { opacity: 1, scale: 1.2, duration: 3.2 }, 5)
        .to('.hero__grid', { opacity: 0.3, duration: 3 }, 5)
        .to(svg, { scale: 1.05, y: -12, duration: 3 }, 7)
        .to('.hero__content', { y: ctx.conditions.isMobile ? 0 : -40, duration: 10, ease: 'none' }, 0)
        .to('.hero__progress i', { scaleX: 1, duration: 10, ease: 'none' }, 0);
      return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); };
    });

    // pointer parallax: layered depths (+ canvas dust) at different depths
    if (FINE) {
      var layers = [
        { el: $('.hero__grid'), d: 14, t: 2.2 },
        { el: $('.hero__glow'), d: 90, t: 2.6 },
        { el: $('.hero__stage'), d: -26, t: 1.6 },
        { el: $('.hero__title'), d: 12, t: 1.8 }
      ].map(function (l) {
        return { x: gsap.quickTo(l.el, 'x', { duration: l.t, ease: 'power3.out' }), y: gsap.quickTo(l.el, 'y', { duration: l.t, ease: 'power3.out' }), d: l.d };
      });
      var rotY = gsap.quickTo('.hero__float', 'rotationY', { duration: 2, ease: 'power3.out' });
      var rotX = gsap.quickTo('.hero__float', 'rotationX', { duration: 2, ease: 'power3.out' });
      gsap.set('.hero__float', { transformPerspective: 1400 });
      $('.hero').addEventListener('mousemove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach(function (l) { l.x(nx * l.d); l.y(ny * l.d * 0.7); });
        rotY(nx * 10); rotX(-ny * 6);
        mouse.x = nx; mouse.y = ny;
      });
    }
    return intro;
  }

  /* ---------------------------------------------------------
     Hero dust — slow champagne motes and soft bokeh
     --------------------------------------------------------- */
  function initDust() {
    var c = $('.hero__dust');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'), W = 0, H = 0, dpr = Math.min(1.5, window.devicePixelRatio || 1), on = true, raf = 0;
    var N = DESKTOP ? 70 : 32, motes = [], i;
    function size() { var b = c.getBoundingClientRect(); W = b.width; H = b.height; c.width = W * dpr; c.height = H * dpr; }
    size();
    for (i = 0; i < N; i++) motes.push({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, r: 0.6 + Math.random() * 1.6, s: 0.2 + Math.random() * 0.6, p: Math.random() * 6.28 });
    var bokeh = [0, 1, 2].map(function (k) { return { x: 0.55 + k * 0.15, y: 0.25 + k * 0.25, r: 60 + k * 40, p: k * 2 }; });
    var mx = 0, my = 0;
    function frame(t) {
      t /= 1000;
      mx += (mouse.x - mx) * 0.04; my += (mouse.y - my) * 0.04;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      bokeh.forEach(function (b) {
        var bx = (b.x + Math.sin(t * 0.07 + b.p) * 0.05) * W - mx * 60, by = (b.y + Math.cos(t * 0.05 + b.p) * 0.06) * H - my * 40;
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        g.addColorStop(0, 'rgba(230,205,155,.16)'); g.addColorStop(1, 'rgba(230,205,155,0)');
        ctx.fillStyle = g; ctx.fillRect(bx - b.r, by - b.r, b.r * 2, b.r * 2);
      });
      for (var k = 0; k < N; k++) {
        var m = motes[k];
        m.y -= m.s * 0.00022 * (1 + m.z);
        if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
        var x = (m.x + Math.sin(t * 0.3 * m.s + m.p) * 0.012) * W - mx * 70 * m.z;
        var y = m.y * H - my * 50 * m.z;
        var a = (0.25 + 0.45 * m.z) * (0.6 + 0.4 * Math.sin(t * 1.2 + m.p));
        ctx.beginPath(); ctx.arc(x, y, m.r * m.z + 0.3, 0, 6.283);
        ctx.fillStyle = 'rgba(176,141,85,' + a.toFixed(3) + ')'; ctx.fill();
      }
      if (on) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis && !on) { on = true; raf = requestAnimationFrame(frame); }
      if (!vis) { on = false; cancelAnimationFrame(raf); }
    }).observe(c);
  }

  /* ---------------------------------------------------------
     Marquee — velocity reactive
     --------------------------------------------------------- */
  function initMarquee() {
    var track = $('.marquee__track');
    if (!track) return;
    var loop = gsap.to(track, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });
    ST.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = self.getVelocity();
        var boost = 1 + Math.min(5, Math.abs(v) / 450);
        gsap.to(loop, { timeScale: v < 0 ? -boost : boost, duration: 0.3, overwrite: true, onComplete: function () {
          gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 1.4, ease: 'power2.out' });
        } });
      }
    });
  }

  /* ---------------------------------------------------------
     Split headline reveals
     --------------------------------------------------------- */
  function initHeadings() {
    $$('[data-split]').forEach(function (el) {
      var chars = splitChars(el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
      tl.from(chars, { yPercent: 115, rotate: 4, opacity: 0, filter: BLUR ? 'blur(8px)' : 'none', duration: 1.6, stagger: 0.02, ease: 'expo.out', clearProps: 'filter' }, 0);
      if (el._units.length) {
        tl.fromTo(el._units, { clipPath: 'inset(0% 100% -20% 0%)', filter: BLUR ? 'blur(10px)' : 'none', x: -24 },
          { clipPath: 'inset(0% 0% -20% 0%)', filter: 'blur(0px)', x: 0, duration: 2, ease: 'expo.out', clearProps: 'filter' }, 0.3);
      }
    });
    $$('.eyebrow').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.from(el, { autoAlpha: 0, x: -20, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }

  /* ---------------------------------------------------------
     Philosophy — word-by-word light-up, counters, parallax
     --------------------------------------------------------- */
  function initPhilosophy() {
    var text = $('[data-words]');
    if (text) {
      var words = splitWords(text);
      gsap.fromTo(words, { opacity: 0.13, filter: BLUR ? 'blur(3px)' : 'none' }, {
        opacity: 1, filter: 'blur(0px)', stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 42%', scrub: true }
      });
    }
    $$('.philosophy__figure .draw').forEach(function (p) {
      gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.philosophy__figure', start: 'top 85%', end: 'bottom 60%', scrub: true }
      });
    });
    $$('[data-speed]').forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-speed')) || 0;
      gsap.to(el, { yPercent: s * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var o = { v: 0 };
      el.textContent = formatNumber(0, el);
      gsap.to(o, {
        v: target, duration: 2.4, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = formatNumber(o.v, el); }
      });
    });
    gsap.from('.stat', { y: 40, autoAlpha: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });
  }

  /* ---------------------------------------------------------
     Services — horizontal pinned scroll on desktop
     --------------------------------------------------------- */
  function initServices() {
    var track = $('.services__track');
    if (!track) return;
    var icons = $$('.card__icon path');
    gsap.set(icons, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(icons, { strokeDashoffset: 0, duration: 2.2, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: '.services', start: 'top 60%', once: true } });

    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      var bar = $('.services__progress i');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.services__pin',
          start: 'top top',
          end: function () { return '+=' + dist(); },
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) gsap.set(bar, { scaleX: self.progress }); }
        }
      });
      if (FINE) initCardTilt();
      // cards gently tilt in as they enter from the right
      $$('.card', track).forEach(function (card) {
        gsap.from(card, {
          y: 60, rotate: 1.5, autoAlpha: 0.2, ease: 'power2.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 105%', end: 'left 65%', scrub: true }
        });
      });
    });
    function initCardTilt() {
      $$('.card', track).forEach(function (card) {
        var rx = gsap.quickTo(card, 'rotationX', { duration: 1.2, ease: 'power3.out' });
        var ry = gsap.quickTo(card, 'rotationY', { duration: 1.2, ease: 'power3.out' });
        var icon = $('.card__icon', card);
        var ix = icon && gsap.quickTo(icon, 'x', { duration: 1.4, ease: 'power3.out' });
        var iy = icon && gsap.quickTo(icon, 'y', { duration: 1.4, ease: 'power3.out' });
        gsap.set(card, { transformPerspective: 1000 });
        card.addEventListener('mousemove', function (e) {
          var b = card.getBoundingClientRect();
          var px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          ry((px - 0.5) * 9); rx(-(py - 0.5) * 7);
          if (ix) { ix((px - 0.5) * 22); iy((py - 0.5) * 16); }
        });
        card.addEventListener('mouseleave', function () { rx(0); ry(0); if (ix) { ix(0); iy(0); } });
      });
    }
    mm.add('(max-width: 860px)', function () {
      gsap.from('.card', { y: 50, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.services__track', start: 'top 88%', once: true } });
    });
  }

  /* ---------------------------------------------------------
     Technology — microscope blueprint draws itself
     --------------------------------------------------------- */
  function initTechnology() {
    var mic = $('.microscope');
    if (mic) {
      var lines = $$('[pathLength]', mic);
      gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: mic, start: 'top 80%', end: 'center 45%', scrub: 1 } });
      tl.to(lines, { strokeDashoffset: 0, stagger: 0.06, ease: 'none', duration: 1 })
        .from('.microscope .lens', { scale: 0.4, autoAlpha: 0, transformOrigin: '110px 250px', duration: 0.8, ease: 'power2.out' }, 0.9)
        .from('.microscope text, .microscope .dash', { opacity: 0, duration: 0.4 }, 1.2);
    }
    $$('.tech__visual').forEach(function (v) {
      gsap.fromTo(v, { clipPath: 'inset(12% 12% 12% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: v, start: 'top 95%', end: 'top 45%', scrub: true } });
    });
    $$('.tech__text').forEach(function (t) {
      gsap.from($$(':scope > :not(p)', t), { y: 40, autoAlpha: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 82%', once: true } });
    });
    gsap.from('.tech__list li', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.tech__list', start: 'top 90%', once: true } });
  }

  /* ---------------------------------------------------------
     Doctors — curtain reveal + tilt
     --------------------------------------------------------- */
  function initDoctors() {
    $$('.doctor').forEach(function (d, i) {
      var p = $('.doctor__portrait', d);
      var tl = gsap.timeline({ scrollTrigger: { trigger: d, start: 'top 88%', once: true } });
      tl.fromTo(p, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', delay: (i % 4) * 0.08 })
        .from($('svg', p), { scale: 1.3, duration: 2, ease: 'expo.out' }, '<0.2')
        .from($$('h3, p, span', d).filter(function (n) { return n.parentNode === d; }), { y: 20, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, '<0.5');
      if (FINE) {
        var rx = gsap.quickTo(p, 'rotationX', { duration: 0.8, ease: 'power3.out' });
        var ry = gsap.quickTo(p, 'rotationY', { duration: 0.8, ease: 'power3.out' });
        gsap.set(p, { transformPerspective: 900 });
        p.addEventListener('mousemove', function (e) {
          var b = p.getBoundingClientRect();
          ry(((e.clientX - b.left) / b.width - 0.5) * 8);
          rx(-((e.clientY - b.top) / b.height - 0.5) * 8);
        });
        p.addEventListener('mouseleave', function () { rx(0); ry(0); });
      }
    });
  }

  /* ---------------------------------------------------------
     Journey — progress line + active steps
     --------------------------------------------------------- */
  function initJourney() {
    var line = $('.journey__line i');
    if (line) {
      gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.journey__steps', start: 'top 62%', end: 'bottom 62%', scrub: true } });
    }
    $$('.step').forEach(function (s) {
      ST.create({
        trigger: s, start: 'top 64%',
        onEnter: function () { s.classList.add('is-active'); },
        onLeaveBack: function () { s.classList.remove('is-active'); }
      });
    });
  }

  /* ---------------------------------------------------------
     Generic reveals
     --------------------------------------------------------- */
  function initReveals() {
    var ba = $('.ba');
    if (ba) {
      gsap.fromTo(ba, { clipPath: 'inset(8% 6% 8% 6% round 2px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: ba, start: 'top 95%', end: 'top 40%', scrub: true } });
      // gentle hint: the divider sways once when the slider comes into view
      var o = { v: 50 };
      gsap.timeline({ scrollTrigger: { trigger: ba, start: 'top 55%', once: true } })
        .to(o, { v: 28, duration: 1.1, ease: 'power3.inOut', onUpdate: function () { ba._set && ba._set(o.v); } })
        .to(o, { v: 62, duration: 1.2, ease: 'power3.inOut', onUpdate: function () { ba._set && ba._set(o.v); } })
        .to(o, { v: 50, duration: 1, ease: 'power3.inOut', onUpdate: function () { ba._set && ba._set(o.v); } });
    }
    $$('.price-group').forEach(function (g) {
      gsap.from($$('h3, .price', g), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 86%', once: true } });
    });
    gsap.from('.quotes, .quotes__nav', { y: 40, autoAlpha: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.quotes', start: 'top 85%', once: true } });
    gsap.from('.form > *:not(.form__success)', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 82%', once: true } });
    gsap.to('.booking__glow', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.booking', start: 'top bottom', end: 'bottom top', scrub: true } });

  }

  function initFooter() {
    var word = $('.footer__word');
    if (!word) return;
    var chars = splitChars(word);
    chars.forEach(function (c, i) { c.style.setProperty('--i', i); });
    word.classList.add('is-split');
    gsap.from(chars, { yPercent: 100, duration: 1.6, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: word, start: 'top 92%', once: true } });
    gsap.from('.footer__top > *', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true } });
  }

  /* ---------------------------------------------------------
     Scroll-scrubbed tone shifts and section morphs
     --------------------------------------------------------- */
  function initTones() {
    var main = $('main');
    var prev = '#F4EFE6';
    $$('[data-tone]').forEach(function (sec) {
      var tone = sec.getAttribute('data-tone');
      gsap.fromTo(main, { backgroundColor: prev }, {
        backgroundColor: tone, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 35%', scrub: true }
      });
      prev = tone;
    });

    // dark technology chapter: a rounded card that opens up, then recedes as you leave
    var tech = $('.technology');
    if (tech) {
      var r = DESKTOP ? 56 : 28, side = DESKTOP ? 4 : 3;
      gsap.fromTo(tech, { clipPath: 'inset(0% ' + side + '% 0% ' + side + '% round ' + r + 'px ' + r + 'px 0px 0px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'none',
        scrollTrigger: { trigger: tech, start: 'top bottom', end: 'top 15%', scrub: true }
      });
      gsap.fromTo(tech, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)' }, {
        clipPath: 'inset(0% ' + side + '% 0% ' + side + '% round 0px 0px ' + r + 'px ' + r + 'px)', ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: tech, start: 'bottom 85%', end: 'bottom top', scrub: true }
      });
      gsap.fromTo('.technology > .container', { y: 0, scale: 1, opacity: 1 }, {
        y: function () { return window.innerHeight * 0.18; }, scale: 0.95, opacity: 0.35, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: tech, start: 'bottom 90%', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    }
    var t = $('.testimonials');
    if (t) {
      gsap.fromTo('.testimonials > .container', { scale: 0.92, y: 60 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'top 30%', scrub: true } });
    }
    gsap.fromTo('.marquee', { rotate: -1.2 }, { rotate: 0.6, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

    // footer revealed from underneath main (only when it fits the viewport)
    var footer = $('.footer');
    if (footer) {
      var fit = function () { footer.classList.toggle('is-reveal', DESKTOP && footer.offsetHeight < window.innerHeight * 0.98); };
      fit();
      window.addEventListener('resize', fit);
      gsap.fromTo('.footer > .container', { yPercent: -14, opacity: 0.4 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.booking', start: 'bottom bottom', end: function () { return '+=' + footer.offsetHeight; }, scrub: true, invalidateOnRefresh: true } });
    }
  }

  /* ---------------------------------------------------------
     Paragraph mask wipes (clip + blur-to-sharp)
     --------------------------------------------------------- */
  function initWipes() {
    $$('.section-head__note, .journey__note, .prices__note, .tech__text p, .philosophy__aside p, .booking__head > p:not(.eyebrow), .quote figcaption').forEach(function (n) {
      gsap.fromTo(n, { clipPath: 'inset(0% 0% 100% 0%)', y: 28, filter: BLUR ? 'blur(6px)' : 'none' }, {
        clipPath: 'inset(0% 0% -10% 0%)', y: 0, filter: 'blur(0px)', duration: 1.8, ease: 'expo.out', clearProps: 'filter',
        scrollTrigger: { trigger: n, start: 'top 90%', once: true }
      });
    });
  }

  /* ---------------------------------------------------------
     Scroll velocity: imagery leans with the scroll, then settles
     --------------------------------------------------------- */
  function initVelocity() {
    var targets = $$('.tech__visual, .doctor__portrait, .ba, .philosophy__figure svg');
    var setters = targets.map(function (el) { return gsap.quickTo(el, 'skewY', { duration: 0.9, ease: 'power3.out' }); });
    var clamp = gsap.utils.clamp(-2.2, 2.2), timer = 0;
    ST.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var v = clamp(self.getVelocity() / -1000);
        setters.forEach(function (s) { s(v); });
        clearTimeout(timer);
        timer = setTimeout(function () { setters.forEach(function (s) { s(0); }); }, 140);
      }
    });
  }

  /* ---------------------------------------------------------
     Letter-roll on buttons and nav links (staggered micro-interaction)
     --------------------------------------------------------- */
  function initRolls() {
    $$('.btn > span, .nav a').forEach(function (el) {
      var text = el.textContent.trim();
      var host = el.tagName === 'A' ? el : el.parentNode;
      if (!host.getAttribute('aria-label')) host.setAttribute('aria-label', text);
      var roll = document.createElement('span');
      roll.className = 'roll';
      roll.setAttribute('aria-hidden', 'true');
      Array.from(text).forEach(function (ch, i) {
        var r = document.createElement('span');
        r.className = 'r';
        r.style.setProperty('--i', i);
        r.textContent = ch;
        roll.appendChild(r);
      });
      el.textContent = '';
      el.appendChild(roll);
    });
  }

  /* ---------------------------------------------------------
     Anchors via Lenis
     --------------------------------------------------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2 && id !== '#') return;
        var target = id === '#top' || id === '#' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        closeMenu();
        if (lenis) lenis.scrollTo(target, { duration: 1.8, offset: 0 });
        else if (target === 0) window.scrollTo(0, 0);
        else target.scrollIntoView();
      });
    });
  }

  /* ---------------------------------------------------------
     Cursor
     --------------------------------------------------------- */
  function initCursor() {
    var cur = $('.cursor');
    if (!cur) return;
    root.classList.add('has-cursor');
    var dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur), label = $('.cursor__label', cur);
    var glow = $('.cursor-glow');
    var gx = glow && gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3.out' }), gy = glow && gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3.out' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' }), dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });
    gsap.set([dot, ring], { x: -100, y: -100 });
    window.addEventListener('mousemove', function (e) { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); if (gx) { gx(e.clientX); gy(e.clientY); } cur.classList.remove('is-hidden'); });
    document.addEventListener('mouseleave', function () { cur.classList.add('is-hidden'); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('[data-cursor], a, button, .card, select, input[type="checkbox"]');
      var text = t && t.getAttribute('data-cursor');
      cur.classList.toggle('is-label', !!text);
      cur.classList.toggle('is-hover', !!t && !text);
      label.textContent = text || '';
    });
  }

  /* ---------------------------------------------------------
     Magnetic buttons
     --------------------------------------------------------- */
  function initMagnetic() {
    $$('[data-magnetic]').forEach(function (el) {
      var inner = el.firstElementChild;
      el.addEventListener('mousemove', function (e) {
        var b = el.getBoundingClientRect();
        var x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
        gsap.to(el, { x: x * 0.3, y: y * 0.4, duration: 0.6, ease: 'power3.out' });
        if (inner) gsap.to(inner, { x: x * 0.12, y: y * 0.14, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' });
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* =========================================================
     Shared UI
     ========================================================= */
  function closeMenu() {
    if (!body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open');
    var b = $('.burger'); if (b) { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Открыть меню'); }
    var m = $('#mobile-menu'); if (m) m.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  function initMenu() {
    var b = $('.burger'), m = $('#mobile-menu');
    if (!b || !m) return;
    b.addEventListener('click', function () {
      if (body.classList.contains('menu-open')) { closeMenu(); return; }
      body.classList.add('menu-open');
      b.setAttribute('aria-expanded', 'true');
      b.setAttribute('aria-label', 'Закрыть меню');
      m.setAttribute('aria-hidden', 'false');
      if (lenis) lenis.stop();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    if (!MOTION) $$('a', m).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  function initHeader() {
    var h = $('.header');
    if (!h) return;
    var last = 0, ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      h.classList.toggle('is-scrolled', y > 40);
      if (!body.classList.contains('menu-open')) h.classList.toggle('is-hidden', y > 400 && y > last + 2);
      if (y < last - 2) h.classList.remove('is-hidden');
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function initBeforeAfter() {
    var ba = $('.ba');
    if (!ba) return;
    var range = $('.ba__range', ba);
    function set(v) {
      v = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--pos', v + '%');
      range.value = v;
    }
    ba._set = set;
    range.addEventListener('input', function () { set(+range.value); });
  }

  function initQuotes() {
    var qs = $$('.quote');
    if (!qs.length) return;
    var count = $('.quotes__count b');
    var i = 0, timer = null;
    function show(n) {
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, k) { q.classList.toggle('is-active', k === i); });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
    }
    function auto() { if (REDUCED) return; clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 7000); }
    $$('[data-quote]').forEach(function (b) {
      b.addEventListener('click', function () { show(i + (b.getAttribute('data-quote') === 'next' ? 1 : -1)); auto(); });
    });
    var wrap = $('.quotes');
    wrap.addEventListener('mouseenter', function () { clearInterval(timer); });
    wrap.addEventListener('mouseleave', auto);
    auto();
  }

  function initForm() {
    var form = $('.form');
    if (!form) return;
    var success = $('.form__success', form);
    var date = $('#f-date', form);
    if (date) {
      var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      date.min = d.toISOString().slice(0, 10);
    }
    function check(field) {
      var input = $('input, select, textarea', field);
      if (!input || !input.required) return true;
      var ok = input.checkValidity();
      if (input.type === 'tel') ok = input.value.replace(/\D/g, '').length >= 9;
      field.classList.toggle('is-invalid', !ok);
      return ok;
    }
    $$('.field', form).forEach(function (f) {
      var input = $('input, select, textarea', f);
      if (input) input.addEventListener('blur', function () { if (f.classList.contains('is-invalid') || input.value) check(f); });
      if (input) input.addEventListener('change', function () { if (f.classList.contains('is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('.field', form), firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      var consent = $('.check', form), cb = $('input', consent);
      consent.classList.toggle('is-invalid', !cb.checked);
      if (!cb.checked && !firstBad) firstBad = consent;
      if (firstBad) { var el = $('input, select, textarea', firstBad); if (el) el.focus(); return; }
      var btn = $('button[type="submit"] span', form);
      var label = btn.textContent;
      form.classList.add('is-sending');
      btn.textContent = 'Отправляем…';
      setTimeout(function () {
        form.classList.remove('is-sending');
        btn.textContent = label;
        var name = $('#f-name', form).value.trim().split(' ')[0];
        $('.form__success-name', form).textContent = name ? ', ' + name : '';
        success.hidden = false;
        if (MOTION) gsap.fromTo(success, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' });
        var reset = $('.form__reset', success); if (reset) reset.focus();
      }, 1100);
    });
    $('.form__reset', form).addEventListener('click', function () {
      form.reset();
      $$('.is-invalid', form).forEach(function (n) { n.classList.remove('is-invalid'); });
      success.hidden = true;
      $('#f-name', form).focus();
    });
  }

  /* ---------------------------------------------------------
     Static mode: reduced motion or CDN unavailable
     --------------------------------------------------------- */
  function staticMode() {
    root.classList.add('static');
    var loader = $('.loader'); if (loader) loader.style.display = 'none';
    var crown = $('.part-crown');
    if (crown) crown.setAttribute('transform', 'translate(0 22)');
    $$('.implant .solid, .implant .halo').forEach(function (n) { n.style.opacity = 1; });
    $$('.implant .part .lines').forEach(function (n) { n.style.opacity = 0.16; });
    $$('.implant .part .annot').forEach(function (n) { n.style.opacity = 0; });
    var steps = $$('.hero__steps li');
    steps.forEach(function (s, k) { s.classList.toggle('is-active', k === steps.length - 1); });
    var sheetN = $('.sheet-n'); if (sheetN) sheetN.textContent = steps.length;
    $$('[data-count]').forEach(function (el) { el.textContent = formatNumber(parseFloat(el.getAttribute('data-count')), el); });
    $$('.step').forEach(function (s) { s.classList.add('is-active'); });
    var line = $('.journey__line i'); if (line) line.style.transform = 'scaleY(1)';
    var bar = $('.hero__progress i'); if (bar) bar.style.transform = 'scaleX(1)';
  }
})();
