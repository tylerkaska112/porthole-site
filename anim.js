// Scroll animations for the home page: things fade and rise into place as they come into view, and the pictures fly in.
// Progressive enhancement: the inline snippet in <head> only switches this on when the browser can do it and the visitor has not asked for
// less motion. Without it every element is simply visible.
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;
  var SEL = [
    '.hero .eyebrow', '.hero h1', '.hero .lede', '.hero .actions', '.hero .status', '.hero .art',
    'section > .eyebrow', 'section > h2', 'section > .lede', 'section > p.fine',
    '.grid > .card', '.steps > li', '.legend > div', 'ul.credits > li', '.faq > details',
    '.shelf-demo', '.shot'
  ].join(',');
  var items = Array.prototype.slice.call(document.querySelectorAll(SEL));
  if (!items.length) return;
  items.forEach(function (el) {
    // Siblings arrive one after another, up to a limit, so a long list does not take forever.
    var group = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(SEL); });
    el.style.setProperty('--d', Math.min(group.indexOf(el) * 90, 540) + 'ms');
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
  // Safety net: anything already on screen after a moment is shown, whatever the observer did.
  setTimeout(function () {
    items.forEach(function (el) {
      if (!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 2500);
})();
