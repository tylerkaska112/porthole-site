// The menu in the page header. It is a <details> element, so it opens and closes without this script; the script only closes it
// when you tap elsewhere, press Escape or pick a link on the same page.
(function () {
  'use strict';
  var menu = document.querySelector('details.menu');
  if (!menu) return;
  document.addEventListener('click', function (e) {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.panel a')) menu.open = false;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false;
      var summary = menu.querySelector('summary');
      if (summary) summary.focus();
    }
  });
})();
