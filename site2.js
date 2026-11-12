// Porthole site: scroll-driven motion. One scroll listener sets CSS variables (--p, --hp, --vp, --page, --sy) and site2.css does the animating.
// Everything here is progressive: without script the page is a readable stack, and with "reduce motion" nothing is pinned or animated.
// Text from compat.json is only ever inserted with textContent, never as markup.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.classList.add('js');
  if (reduce) root.classList.add('rm');

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  var nav = $('.nav'), hero = $('.hero'), sea = $('.sea');
  var vh = window.innerHeight, vw = window.innerWidth, docH = 1;
  var tracks = $$('.track').map(function (el) { return { el: el, top: 0, h: 0, rail: $('.rail', el), counters: $$('[data-count]', el), switches: $$('[data-switch]', el) }; });
  var views = $$('[data-view]').map(function (el) { return { el: el, top: 0, h: 0 }; });

  function measure() {
    vh = window.innerHeight; vw = window.innerWidth; docH = document.documentElement.scrollHeight;
    var y = window.pageYOffset;
    tracks.forEach(function (t) {
      var r = t.el.getBoundingClientRect(); t.top = r.top + y; t.h = t.el.offsetHeight;
      if (t.rail) t.el.style.setProperty('--max', Math.max(0, t.rail.scrollWidth - vw));
    });
    views.forEach(function (v) { var r = v.el.getBoundingClientRect(); v.top = r.top + y; v.h = v.el.offsetHeight; });
    frame();
  }

  var ticking = false;
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function frame() {
    ticking = false;
    var y = window.pageYOffset;
    if (sea) sea.style.setProperty('--sy', y);
    if (nav) {
      nav.classList.toggle('solid', y > 12);
      nav.style.setProperty('--page', docH > vh ? (y / (docH - vh)).toFixed(4) : 0);
    }
    if (hero) hero.style.setProperty('--hp', reduce ? 1 : clamp(y / (vh * 0.7), 0, 1).toFixed(4));
    if (reduce) return;
    tracks.forEach(function (t) {
      if (y + vh < t.top - 50 || y > t.top + t.h + 50) return;
      var p = clamp((y - t.top) / Math.max(1, t.h - vh), 0, 1);
      t.el.style.setProperty('--p', p.toFixed(4));
      t.counters.forEach(function (c) {
        var a = +c.dataset.a, b = +c.dataset.b, from = +c.dataset.from, to = +c.dataset.to, dec = +(c.dataset.dec || 0);
        var v = from + (to - from) * ease(clamp((p - a) / (b - a), 0, 1));
        c.textContent = v.toFixed(dec);
        if (c.dataset.hot) c.classList.toggle('hot', v >= +c.dataset.hot);
      });
      t.switches.forEach(function (s) { s.textContent = p > +s.dataset.switch ? s.dataset.on : s.dataset.off; });
    });
    views.forEach(function (v) {
      if (y + vh < v.top - 50 || y > v.top + v.h + 50) return;
      v.el.style.setProperty('--vp', clamp((y + vh - v.top) / (vh + v.h), 0, 1).toFixed(4));
    });
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); }).observe(document.body);
  measure();

  // Reveal on scroll
  var revealed = $$('[data-r], [data-l]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealed.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealed.forEach(function (el) { io.observe(el); });
  }

  // Numbers that count up once when they appear
  function countUp(el, to, ms) {
    if (reduce) { el.textContent = Math.round(to).toLocaleString(); return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = clamp((t - t0) / ms, 0, 1);
      el.textContent = Math.round(to * ease(k)).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var pending = [];
  function watchCounters() {
    if (!('IntersectionObserver' in window)) { pending.forEach(function (c) { countUp(c.el, c.to, 1); }); return; }
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var c = pending.filter(function (x) { return x.el === e.target; })[0];
        if (c) countUp(c.el, c.to, 1600);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    pending.forEach(function (c) { cio.observe(c.el); });
  }

  // Compatibility numbers and the game names, from the same snapshot the compatibility page reads
  var live = $('.live');
  if (live && window.fetch) {
    fetch('/compat.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
      var games = (data && data.games) || [];
      if (!games.length) return;
      var reports = 0, good = 0, names = [];
      games.forEach(function (g) {
        reports += +g.reportCount || 0;
        if (g.verdict === 'great' || g.verdict === 'playable') { good++; names.push({ t: g.title || 'A game', p: g.verdict === 'playable' }); }
      });
      var targets = { games: games.length, reports: reports, good: good };
      $$('[data-live]', live).forEach(function (el) { pending.push({ el: el, to: targets[el.dataset.live] || 0 }); });
      var holder = $('.marquee', live);
      if (holder && names.length) {
        names.sort(function (a, b) { return a.t.localeCompare(b.t); });
        var rows = [names.filter(function (_, i) { return i % 2 === 0; }), names.filter(function (_, i) { return i % 2 === 1; })];
        rows.forEach(function (list, i) {
          if (!list.length) return;
          var row = document.createElement('div'); row.className = 'row';
          row.style.setProperty('--dur', Math.max(50, list.length * 3.2) + 's');
          for (var pass = 0; pass < 2; pass++) list.forEach(function (n) {
            var s = document.createElement('span'); s.className = 'tag' + (n.p ? ' p' : ''); s.textContent = n.t; if (pass) s.setAttribute('aria-hidden', 'true'); row.appendChild(s);
          });
          holder.appendChild(row);
        });
      }
      buildExplorer(games);
      live.hidden = false;
      var fallback = $('.live-fallback'); if (fallback) fallback.hidden = true;
      watchCounters();
      measure();
    }).catch(function () { /* the sentence and link stay */ });
  }


  // "What to expect on your device": pick a device to see the typical frame rate, how many reports say it works, and the fastest games there.
  function buildExplorer(games) {
    var box = $('.explore'); if (!box) return;
    var rows = [];
    games.forEach(function (g) { (g.reports || []).forEach(function (r) {
      var fps = r.perf && +r.perf.fpsAvg;
      rows.push({ game: g.title || 'A game', device: r.device || '', fps: fps > 0 ? fps : null, rating: r.rating,
        hot: !!((r.perf && r.perf.thermal === 'hot') || (r.tags || []).indexOf('overheats') >= 0) });
    }); });
    var counts = {};
    rows.forEach(function (r) { if (r.fps && /^(iPhone|iPad)[^,]*$/.test(r.device)) counts[r.device] = (counts[r.device] || 0) + 1; });
    var devices = Object.keys(counts).filter(function (d) { return counts[d] >= 5; }).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 5);
    var chips = $('.chips', box), list = $('.rank', box);
    function median(a) { a = a.slice().sort(function (x, y) { return x - y; }); var m = a.length >> 1; return a.length ? (a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2) : null; }
    function show(dev) {
      var sel = rows.filter(function (r) { return !dev || r.device === dev; });
      var withFps = sel.filter(function (r) { return r.fps; });
      var rated = sel.filter(function (r) { return r.rating; });
      var set = function (k, t) { var n = $('[data-x="' + k + '"]', box); if (n) n.textContent = t; };
      var med = median(withFps.map(function (r) { return r.fps; }));
      set('fps', med === null ? '\u2013' : String(Math.round(med)));
      set('good', rated.length ? Math.round(100 * rated.filter(function (r) { return r.rating !== 'broken'; }).length / rated.length) + '%' : '\u2013');
      set('hot', sel.length ? Math.round(100 * sel.filter(function (r) { return r.hot; }).length / sel.length) + '%' : '\u2013');
      set('n', String(withFps.length));
      var best = {};
      withFps.forEach(function (r) { if (!best[r.game] || r.fps > best[r.game]) best[r.game] = r.fps; });
      var top = Object.keys(best).map(function (k) { return { t: k, f: best[k] }; }).sort(function (a, b) { return b.f - a.f; }).slice(0, 6);
      list.textContent = '';
      top.forEach(function (x) {
        var li = document.createElement('li'), nm = document.createElement('span'), br = document.createElement('span'), bar = document.createElement('i'), fv = document.createElement('span');
        nm.className = 'nm'; nm.textContent = x.t; br.className = 'br'; br.setAttribute('aria-hidden', 'true'); fv.className = 'fv'; fv.textContent = Math.round(x.f) + ' fps';
        bar.style.setProperty('--w', 0); br.appendChild(bar); li.appendChild(nm); li.appendChild(br); li.appendChild(fv); list.appendChild(li);
        requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.setProperty('--w', Math.min(100, x.f / 1.2)); }); });
      });
      $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', String((c.dataset.dev || '') === (dev || ''))); });
    }
    function chip(label, dev, n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.dev = dev || '';
      b.appendChild(document.createTextNode(label));
      if (n) { var sm = document.createElement('small'); sm.textContent = n; b.appendChild(sm); }
      b.addEventListener('click', function () { show(dev); }); chips.appendChild(b);
    }
    chip('All devices', '', rows.filter(function (r) { return r.fps; }).length);
    devices.forEach(function (d) { chip(d, d, counts[d]); });
    show('');
  }

  // Videos play only while they are on screen, muted, and never when motion is reduced
  var videos = $$('video[data-autoplay]');
  videos.forEach(function (v) {
    var src = v.dataset.src; if (src && !v.getAttribute('src')) v.setAttribute('src', src);
    if (reduce) { v.removeAttribute('autoplay'); v.controls = true; }
  });
  if (!reduce && videos.length && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); } else e.target.pause(); });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { vio.observe(v); });
  }

  // A soft light that follows the pointer over cards
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.hcard, .card');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // Menu on small screens
  var burger = $('.burger');
  if (burger && nav) {
    burger.addEventListener('click', function () { var open = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', open); });
    $$('.links a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  }
})();
