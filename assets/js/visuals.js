/* =========================================================
   Aurelle — generated visuals (no external images)
   - doctor portraits (SVG)
   - before / after smile (SVG)
   - 3D point-cloud tooth (canvas)
   ========================================================= */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Doctor portraits ---------------- */
  var PALETTES = [
    { bg: ['#EFE7D8', '#D3C1A0'], arch: '#F7F2E8', fig: ['#3A342D', '#1F1C19'], long: true },
    { bg: ['#E3DED4', '#B4AB99'], arch: '#F1EDE5', fig: ['#2F2C28', '#151412'], long: false },
    { bg: ['#F2EBDF', '#DCCAA8'], arch: '#FAF6EE', fig: ['#5B4E40', '#2E2822'], long: true },
    { bg: ['#DAD4C8', '#9C9382'], arch: '#ECE7DD', fig: ['#26231F', '#0F0E0D'], long: false }
  ];

  // Faceless, tonal bust silhouettes: deliberate placeholders, not "people".
  function portrait(el) {
    var i = +el.getAttribute('data-portrait') || 0;
    var p = PALETTES[i % PALETTES.length];
    var id = 'pt' + i;
    var initial = el.getAttribute('data-initial') || '';
    var head = p.long
      ? 'M150 104 C186 104 206 132 206 172 C206 206 198 232 202 262 C206 290 214 304 222 312 C200 318 180 312 168 300 L168 288 C160 292 140 292 132 288 L132 300 C120 312 100 318 78 312 C86 304 94 290 98 262 C102 232 94 206 94 172 C94 132 114 104 150 104 Z'
      : 'M150 108 C182 108 200 132 200 168 C200 204 186 232 170 246 L170 288 L130 288 L130 246 C114 232 100 204 100 168 C100 132 118 108 150 108 Z';
    var body = 'M28 400 C34 336 80 300 132 292 L150 300 L168 292 C220 300 266 336 272 400 Z';
    var rim = p.long
      ? 'M206 172 C206 206 198 232 202 262 C206 290 214 304 222 312'
      : 'M200 168 C200 204 186 232 170 246';
    el.innerHTML =
      '<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.bg[0] + '"/><stop offset="1" stop-color="' + p.bg[1] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'fg" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="' + p.fig[0] + '"/><stop offset="1" stop-color="' + p.fig[1] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'li" cx=".72" cy=".18" r=".7"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".75"/><stop offset="1" stop-color="#FFF6E2" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<rect width="300" height="400" fill="url(#' + id + 'bg)"/>' +
      '<path d="M54 400 V170 A96 96 0 0 1 246 170 V400 Z" fill="' + p.arch + '" fill-opacity=".55"/>' +
      '<path d="M66 400 V172 A84 84 0 0 1 234 172 V400" fill="none" stroke="#7A5F36" stroke-opacity=".35"/>' +
      '<path d="M150 40 V400 M20 196 H280" stroke="#7A5F36" stroke-opacity=".14" stroke-dasharray="2 5"/>' +
      '<text x="276" y="108" text-anchor="end" font-family="Cormorant Garamond, serif" font-style="italic" font-weight="300" font-size="150" fill="#7A5F36" fill-opacity=".16">' + initial + '</text>' +
      '<g fill="url(#' + id + 'fg)"><path d="' + body + '"/><path d="' + head + '"/></g>' +
      '<path d="' + rim + '" fill="none" stroke="#E9D3A6" stroke-opacity=".9" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M168 292 C220 300 266 336 272 400" fill="none" stroke="#E9D3A6" stroke-opacity=".55" stroke-width="1.2"/>' +
      '<rect width="300" height="400" fill="url(#' + id + 'li)"/>' +
      '</svg>';
  }
  document.querySelectorAll('[data-portrait]').forEach(portrait);

  /* ---------------- Before / after smile ---------------- */
  // widths of upper teeth from midline outwards: central, lateral, canine, premolar1, premolar2, molar
  var UP = [60, 48, 46, 40, 38, 36];
  function smile(svg) {
    var after = svg.getAttribute('data-variant') === 'after';
    var id = after ? 'sa' : 'sb';
    var cx = 400;
    var teeth = '';
    // deterministic irregularities for "before"
    var rot = [3, -6, 5, -2, 3, -3, 4, 7, -4, 2, -3, 2];
    var len = [6, -8, 4, -3, 2, 0, -6, 9, -2, 3, 0, -2];
    var off = [3, -2, 4, 1, -2, 0, -3, 5, 2, -1, 1, 0];
    var k = 0;
    [-1, 1].forEach(function (side) {
      var x = cx;
      UP.forEach(function (w, i) {
        var gap = after ? 1.5 : (i === 0 ? 4 : 2.5);
        var x0 = side > 0 ? x + gap / 2 : x - w - gap / 2;
        var depth = i; // farther teeth sit higher/darker
        var top = 168 + depth * 4;
        var h = (i === 0 ? 92 : i === 1 ? 80 : i === 2 ? 88 : 72 - (i - 3) * 6) + (after ? 0 : len[k]);
        var r = after ? 0 : rot[k];
        var dx = after ? 0 : off[k];
        var fill = after ? 'url(#' + id + 'w)' : 'url(#' + id + 'y)';
        teeth += '<g transform="rotate(' + r + ' ' + (x0 + w / 2) + ' ' + top + ') translate(' + dx + ' 0)">' +
          '<path d="' + toothPath(x0, top, w, h) + '" fill="' + fill + '" stroke="' + (after ? '#E9E1D2' : '#C9B585') + '" stroke-width="1"/>' +
          '<path d="' + toothPath(x0, top, w, h) + '" fill="#3A2420" fill-opacity="' + (depth * 0.07).toFixed(2) + '"/>' +
          '<path d="M' + (x0 + w * .3) + ' ' + (top + 14) + ' C' + (x0 + w * .26) + ' ' + (top + h * .5) + ' ' + (x0 + w * .3) + ' ' + (top + h * .75) + ' ' + (x0 + w * .36) + ' ' + (top + h * .85) + '" fill="none" stroke="#fff" stroke-opacity="' + (after ? .8 : .35) + '" stroke-width="3" stroke-linecap="round"/>' +
          (after ? '' : '<path d="M' + (x0 + 4) + ' ' + (top + h - 10) + ' Q' + (x0 + w / 2) + ' ' + (top + h - 2) + ' ' + (x0 + w - 4) + ' ' + (top + h - 10) + '" fill="none" stroke="#B89D63" stroke-opacity=".5" stroke-width="2"/>') +
          '</g>';
        x = side > 0 ? x + w + gap : x - w - gap;
        k++;
      });
    });
    // lower teeth (partially hidden)
    var lower = '';
    [-1, 1].forEach(function (side) {
      var x = cx;
      [34, 34, 38, 40, 40].forEach(function (w, i) {
        var x0 = side > 0 ? x + 1 : x - w - 1;
        var top = 268 - i * 2;
        lower += '<path d="M' + x0 + ' ' + (top + 60) + ' L' + x0 + ' ' + (top + 8) + ' Q' + x0 + ' ' + top + ' ' + (x0 + 8) + ' ' + top + ' L' + (x0 + w - 8) + ' ' + top + ' Q' + (x0 + w) + ' ' + top + ' ' + (x0 + w) + ' ' + (top + 8) + ' L' + (x0 + w) + ' ' + (top + 60) + ' Z" fill="' + (after ? '#ECE5D8' : '#D7C599') + '" opacity="' + (0.85 - i * .1).toFixed(2) + '"/>';
        x = side > 0 ? x + w + 2 : x - w - 2;
      });
    });

    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML =
      '<defs>' +
      '<radialGradient id="' + id + 'bg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="' + (after ? '#EADCCB' : '#DFD0BE') + '"/><stop offset="1" stop-color="' + (after ? '#C9B297' : '#BFA98E') + '"/></radialGradient>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EEE6"/><stop offset=".4" stop-color="#FFFEFB"/><stop offset="1" stop-color="#F1EBE0"/></linearGradient>' +
      '<linearGradient id="' + id + 'y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9C79A"/><stop offset=".5" stop-color="#E8DAB3"/><stop offset="1" stop-color="#CDB57E"/></linearGradient>' +
      '<linearGradient id="' + id + 'lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98274"/><stop offset="1" stop-color="#9C6659"/></linearGradient>' +
      '<clipPath id="' + id + 'mouth"><path d="' + MOUTH_IN + '"/></clipPath>' +
      '<radialGradient id="' + id + 'gl" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff" stop-opacity="' + (after ? .35 : .1) + '"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<rect width="800" height="450" fill="url(#' + id + 'bg)"/>' +
      '<path d="' + MOUTH_OUT + '" fill="url(#' + id + 'lip)"/>' +
      '<path d="' + MOUTH_IN + '" fill="#3A2420"/>' +
      '<g clip-path="url(#' + id + 'mouth)">' +
      lower + teeth +
      '<path d="M150 140 L650 140 L650 176 C540 200 260 200 150 176 Z" fill="#C27F74"/>' +
      '<path d="M150 176 C260 200 540 200 650 176" fill="none" stroke="#A9665B" stroke-opacity=".6"/>' +
      '</g>' +
      '<path d="M180 222 C260 184 340 186 400 190 C460 186 540 184 620 222" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>' +
      '<rect width="800" height="450" fill="url(#' + id + 'gl)"/>' +
      '<text x="' + (after ? 760 : 40) + '" y="420" text-anchor="' + (after ? 'end' : 'start') + '" font-family="Manrope, sans-serif" font-size="11" letter-spacing="3" fill="#5B564E">' + (after ? 'ОТТЕНОК BL2 · 6 ВИНИРОВ' : 'ОТТЕНОК A3.5') + '</text>';
  }
  var MOUTH_OUT = 'M120 222 C210 112 320 120 400 146 C480 120 590 112 680 222 C600 340 480 372 400 372 C320 372 200 340 120 222 Z';
  var MOUTH_IN = 'M168 222 C250 172 330 170 400 176 C470 170 550 172 632 222 C556 292 470 318 400 318 C330 318 244 292 168 222 Z';
  function toothPath(x, y, w, h) {
    var r = Math.min(14, w * .3);
    return 'M' + x + ' ' + y + ' L' + (x + w) + ' ' + y + ' L' + (x + w - 1) + ' ' + (y + h - r) +
      ' Q' + (x + w - 2) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) +
      ' L' + (x + r) + ' ' + (y + h) + ' Q' + (x + 2) + ' ' + (y + h) + ' ' + (x + 1) + ' ' + (y + h - r) + ' Z';
  }
  document.querySelectorAll('svg.smile').forEach(smile);

  /* ---------------- Point-cloud tooth (canvas) ---------------- */
  function pointCloud(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var pts = [];
    var TAU = Math.PI * 2;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    // crown side wall
    for (var i = 0; i < 1300; i++) {
      var a = rnd(0, TAU), y = rnd(-0.05, 0.85);
      var bulge = 0.62 + 0.16 * Math.sin(Math.min(1, (y + 0.05) / 0.9) * Math.PI * 0.85);
      var r = bulge * (1 + 0.06 * Math.cos(4 * a)) * (y < 0.05 ? 0.85 + y * 3 : 1);
      pts.push([Math.cos(a) * r * 1.08, y, Math.sin(a) * r * 0.92, 0]);
    }
    // occlusal surface with 4 cusps
    for (i = 0; i < 900; i++) {
      a = rnd(0, TAU);
      var rho = Math.sqrt(Math.random());
      var rim = 0.66 * (1 + 0.06 * Math.cos(4 * a));
      var h = 0.85 + 0.17 * rho * rho * (0.45 + 0.55 * Math.pow(Math.cos(2 * a + Math.PI / 4), 2)) - 0.05 * (1 - rho);
      pts.push([Math.cos(a) * rim * rho * 1.08, h, Math.sin(a) * rim * rho * 0.92, 0]);
    }
    // two roots
    [-0.28, 0.28].forEach(function (rx) {
      for (var j = 0; j < 650; j++) {
        var t = Math.random(), aa = rnd(0, TAU);
        var yy = -0.05 - t * 1.25;
        var rr = 0.26 * (1 - t * 0.85);
        var bend = rx * 0.35 * t * t;
        pts.push([rx + bend + Math.cos(aa) * rr, yy, Math.sin(aa) * rr * 0.9, 1]);
      }
    });
    // build the scan from the occlusal surface downwards
    pts.sort(function (a, b) { return b[1] - a[1]; });
    var hud = document.querySelector('[data-points]');
    var W, H, dpr, scale, visible = false, t0 = performance.now(), raf = 0;
    function resize() {
      var b = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = b.width; H = b.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      scale = Math.min(W, H) * 0.34;
    }
    function frame(now) {
      var t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var ry = REDUCED ? 0.6 : t * 0.35, rx = -0.32 + Math.sin(t * 0.4) * 0.06;
      var cy = Math.cos(ry), sy = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
      var scanY = REDUCED ? 2 : Math.sin(t * 0.8) * 1.15 - 0.2; // moving scan plane
      var shown = REDUCED ? pts.length : Math.min(pts.length, Math.floor(t * 1400));
      var ox = W / 2, oy = H * 0.5;
      for (var i = 0; i < shown; i++) {
        var p = pts[i];
        var x = p[0], y = p[1] - 0.15, z = p[2];
        var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        var y1 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
        var persp = 3.2 / (3.2 + z2);
        var px = ox + x1 * scale * persp, py = oy - y1 * scale * persp;
        var depth = (1 - z2) * 0.5; // 0..1
        var near = Math.abs(p[1] - scanY) < 0.05;
        var alpha = 0.18 + depth * 0.55;
        if (near) { ctx.fillStyle = 'rgba(255,240,210,' + Math.min(1, alpha + .4) + ')'; ctx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4); }
        else { ctx.fillStyle = 'rgba(214,190,145,' + alpha.toFixed(3) + ')'; ctx.fillRect(px - .7, py - .7, 1.4 + depth * .6, 1.4 + depth * .6); }
      }
      // scan plane
      if (!REDUCED) {
        var sp = oy - (scanY - 0.15) * scale;
        var g = ctx.createLinearGradient(0, sp - 30, 0, sp + 30);
        g.addColorStop(0, 'rgba(194,166,115,0)'); g.addColorStop(.5, 'rgba(194,166,115,.16)'); g.addColorStop(1, 'rgba(194,166,115,0)');
        ctx.fillStyle = g; ctx.fillRect(W * .12, sp - 30, W * .76, 60);
        ctx.fillStyle = 'rgba(232,214,176,.6)'; ctx.fillRect(W * .12, sp, W * .76, 1);
      }
      if (hud) hud.textContent = shown.toLocaleString('ru-RU');
      if (visible && !REDUCED) raf = requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', function () { resize(); if (!visible || REDUCED) frame(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var was = visible;
        visible = entries[0].isIntersecting;
        if (visible && !was) { if (t0 === 0 || !canvas._started) { t0 = performance.now(); canvas._started = true; } cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
        if (!visible) cancelAnimationFrame(raf);
      }, { rootMargin: '100px' }).observe(canvas);
    } else { visible = true; raf = requestAnimationFrame(frame); }
  }
  document.querySelectorAll('canvas.pointcloud').forEach(pointCloud);
})();
