// "Try the app": tabs over a drawn phone. Swipe the phone, tap it for the next screen, or use the arrow keys on the tabs. No data leaves the page.
(function () {
  'use strict';
  var root = document.getElementById('tour');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role=tab]'));
  var imgs = Array.prototype.slice.call(root.querySelectorAll('.phone-screen img'));
  var title = root.querySelector('.tour-caption h3'), text = root.querySelector('.tour-caption p');
  var screen = root.querySelector('.phone-screen');
  var current = 0;

  function show(i, focus) {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === current ? 'true' : 'false'); t.tabIndex = k === current ? 0 : -1; });
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === current); im.setAttribute('aria-hidden', k === current ? 'false' : 'true'); });
    title.textContent = tabs[current].dataset.title; text.textContent = tabs[current].dataset.text;
    if (focus) tabs[current].focus();
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { show(k); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(current + 1, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show(current - 1, true); }
    });
  });
  // Tap for the next screen, swipe left or right to move.
  var startX = null;
  screen.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  screen.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1)); else show(current + 1);
  });
  screen.addEventListener('pointercancel', function () { startX = null; });
  show(0);
})();
