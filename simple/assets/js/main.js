/* Aurelle — practical variant. Vanilla JS, no libraries. */
(function () {
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  document.documentElement.classList.add('js');

  /* reveal on scroll (staggered within each row) */
  var reveals = $$('.reveal');
  reveals.forEach(function (el) {
    var sib = el.parentNode ? $$(':scope > .reveal', el.parentNode) : [];
    var i = sib.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
  });
  if ('IntersectionObserver' in window && !REDUCED) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* counters */
  function fmt(v, el) {
    var s = String(Math.round(v));
    return el.hasAttribute('data-space') ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !REDUCED) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1600;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(to * k, el);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
  }

  /* header state + mobile bar */
  var header = $('.header'), bar = $('.mobile-bar'), hero = $('.hero');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (bar) bar.classList.toggle('is-on', y > (hero ? hero.offsetHeight * 0.6 : 400));
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* mobile menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080 && !menu.hidden) setMenu(false); });
  }

  /* placeholder links (messengers, map) */
  var toast = $('.toast'), toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  $$('[data-placeholder]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showToast('Демо: ссылка «' + a.getAttribute('data-placeholder') + '» будет добавлена в рабочей версии сайта.');
    });
  });

  /* preselect service / doctor in the booking form */
  var fService = $('#f-service'), fDoctor = $('#f-doctor');
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { if (fService) fService.value = a.getAttribute('data-service'); });
  });
  $$('[data-doctor]').forEach(function (a) {
    a.addEventListener('click', function () { if (fDoctor) fDoctor.value = a.getAttribute('data-doctor'); });
  });

  /* before / after */
  var ba = $('.ba');
  if (ba) {
    var range = $('.ba__range', ba);
    var set = function (v) { ba.style.setProperty('--pos', v + '%'); range.value = v; };
    range.addEventListener('input', function () { set(+range.value); });
    if (!REDUCED && 'IntersectionObserver' in window) {
      var bio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        bio.disconnect();
        var t0 = performance.now();
        (function hint(now) {
          var p = Math.min(1, (now - t0) / 1800);
          set(50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p));
          if (p < 1) requestAnimationFrame(hint); else set(50);
        })(t0);
      }, { threshold: 0.6 });
      bio.observe(ba);
    }
  }

  /* FAQ: keep one open at a time */
  $$('.faq details').forEach(function (d, i, all) {
    d.addEventListener('toggle', function () {
      if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* booking form (front-end demo only) */
  var form = $('.form');
  if (form) {
    var success = $('.form__success', form);
    var check = function (f) {
      var input = $('input', f);
      if (!input || !input.required) return true;
      var ok = input.type === 'tel' ? input.value.replace(/\D/g, '').length >= 9 : input.checkValidity();
      f.classList.toggle('is-invalid', !ok);
      return ok;
    };
    $$('.field', form).forEach(function (f) {
      var input = $('input', f);
      if (input) input.addEventListener('input', function () { if (f.classList.contains('is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('.field', form).forEach(function (f) { if (!check(f) && !bad) bad = f; });
      var consent = $('.check', form), cb = $('input', consent);
      consent.classList.toggle('is-invalid', !cb.checked);
      if (!cb.checked && !bad) bad = consent;
      if (bad) { $('input', bad).focus(); return; }
      var btn = $('button[type="submit"]', form), label = btn.textContent;
      form.classList.add('is-sending');
      btn.textContent = 'Отправляем…';
      setTimeout(function () {
        form.classList.remove('is-sending');
        btn.textContent = label;
        var name = $('#f-name').value.trim().split(' ')[0];
        $('.form__name', form).textContent = name ? ', ' + name : '';
        success.hidden = false;
        $('.form__reset', form).focus();
      }, 900);
    });
    $('.form__reset', form).addEventListener('click', function () {
      form.reset();
      $$('.is-invalid', form).forEach(function (n) { n.classList.remove('is-invalid'); });
      success.hidden = true;
      $('#f-name').focus();
    });
  }
})();
