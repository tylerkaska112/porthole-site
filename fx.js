// Motion and the floating Get it button. Everything here is decoration: nothing is needed to read or use the site, and nothing runs for visitors who asked for less motion.
(function () {
  'use strict';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. The floating Get it button on phones: solid, round, shown once the first screen has gone by. Not on the Get it page itself.
  if (location.pathname.indexOf('/download') !== 0) {
    var fab = document.createElement('a');
    fab.className = 'fab'; fab.href = '/download.html'; fab.setAttribute('aria-label', 'Get Porthole');
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>';
    document.body.appendChild(fab);
    var shown = false;
    var toggle = function () { var want = window.scrollY > 420; if (want !== shown) { shown = want; fab.classList.toggle('show', want); } };
    addEventListener('scroll', toggle, { passive: true }); toggle();
  }

  if (calm) return;

  // 2. Cards: the highlight follows the pointer.
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // 3. Hero: the porthole drifts a little with the pointer and the scroll.
  var art = document.querySelector('.hero .art');
  if (art) {
    var px = 0, py = 0, ticking = false;
    var apply = function () {
      ticking = false;
      art.style.setProperty('--tx', px.toFixed(1) + 'px');
      art.style.setProperty('--ty', (py - Math.min(window.scrollY, 600) * 0.06).toFixed(1) + 'px');
    };
    var queue = function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
    addEventListener('pointermove', function (e) {
      px = (e.clientX / innerWidth - 0.5) * 14; py = (e.clientY / innerHeight - 0.5) * 10; queue();
    }, { passive: true });
    addEventListener('scroll', queue, { passive: true });
  }
})();
