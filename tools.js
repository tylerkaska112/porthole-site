// The Help page's three small tools: a setup checker, a search over the answers, and a memory estimator. All of it runs in the page; nothing is stored or sent.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; }

  // ---- Setup checker
  var form = $('checker');
  if (form) {
    var out = $('check-out');
    var value = function (name) { var r = form.querySelector('input[name=' + name + ']:checked'); return r ? r.value : null; };
    var run = function () {
      var ios = value('ios'), sign = value('sign'), comp = value('comp'), mem = value('mem');
      if (!ios || !sign || !mem) { out.textContent = ''; return; }
      var rows = [];
      var add = function (state, html) { rows.push([state, html]); };
      if (ios === 'old') add('bad', '<b>iOS is too old.</b> Porthole needs iOS 18 or later.');
      else if (ios === '?') add('warn', '<b>Check your iOS version</b> in Settings &#8250; General &#8250; About. You need 18 or later.');
      else add('ok', '<b>iOS ' + (ios === '27' ? '27 or later' : '18 or later') + '.</b> Good.');

      if (sign === 'paid') add('ok', '<b>A paid developer account</b> normally includes what Porthole needs (Network Extension, Increased Memory Limit, Extended Virtual Addressing and get-task-allow).');
      else if (sign === 'free') add('warn', '<b>A free Apple ID</b> usually can\'t provide those capabilities, so Porthole may not install or run. A paid account is the reliable route. <a href="/download.html#you-need">What you need</a>');
      else if (sign === 'service') add('warn', '<b>A signing service</b> may lack the capabilities and can revoke its certificate without warning. Check with it first, or use your own certificate. <a href="/download.html#you-need">What you need</a>');
      else add('warn', '<b>You still need a way to sign the app.</b> <a href="/download.html#you-need">See what you need</a>.');

      if (ios === '27') add('ok', '<b>Pairing file:</b> your device can make it itself. The setup guide has a button for it.');
      else if (ios === '18') {
        if (comp === 'yes') add('ok', '<b>Pairing file:</b> make it once on a computer with a free tool (iloader or Jitterbug), then move it to the device. <a href="#pairing-file">How</a>');
        else add('warn', '<b>Pairing file:</b> before iOS 27 it has to be made once on a computer. A friend\'s will do, and you only do it once.');
      } else add('warn', '<b>Pairing file:</b> answer the iOS question first.');

      if (mem === '4') add('warn', '<b>4 GB or less.</b> Many games need more than this. Smaller and older games are your best bet, and Swap helps some.');
      else if (mem === '6') add('ok', '<b>6 GB.</b> Fine for many games. Heavy ones will need Swap.');
      else if (mem === '8') add('ok', '<b>8 GB or more.</b> A good amount: most games that can run here will fit.');
      else add('warn', '<b>Look up your model\'s memory.</b> More is better.');

      var bad = rows.filter(function (r) { return r[0] === 'bad'; }).length, warn = rows.filter(function (r) { return r[0] === 'warn'; }).length;
      var ul = el('ul', 'res');
      rows.forEach(function (r) { ul.appendChild(el('li', r[0], '<span class="ic" aria-hidden="true">' + (r[0] === 'ok' ? '&#10003;' : r[0] === 'warn' ? '!' : '&#10005;') + '</span><span>' + r[1] + '</span>')); });
      out.textContent = '';
      out.appendChild(el('p', 'verdict', bad ? 'Not yet: something has to change first.' : warn ? 'Almost there: ' + warn + ' thing' + (warn > 1 ? 's' : '') + ' to sort out.' : 'You\'re ready. Go and get it.'));
      out.appendChild(ul);
      out.appendChild(el('p', 'fine', 'A quick guide, not a guarantee. <a href="/download.html">Get it page</a> &#183; <a href="/compat.html">What runs</a>'));
    };
    form.addEventListener('change', run);
    form.addEventListener('reset', function () { setTimeout(run, 0); });
  }

  // ---- Search the answers
  var box = $('help-search');
  if (box) {
    var details = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('.faq')).map(function (f) { return { head: f.previousElementSibling, faq: f }; });
    var count = $('help-count');
    var filter = function () {
      var q = box.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean), shown = 0;
      details.forEach(function (d) {
        var text = d.textContent.toLowerCase(), hit = words.every(function (w) { return text.indexOf(w) !== -1; });
        d.hidden = !!q && !hit;
        if (q && hit) { d.open = true; shown++; } else if (!q) { d.open = false; }
      });
      groups.forEach(function (g) {
        var any = Array.prototype.some.call(g.faq.children, function (d) { return !d.hidden; });
        g.faq.hidden = !any; if (g.head && g.head.tagName === 'H2') g.head.hidden = !any;
      });
      count.textContent = !q ? '' : shown ? shown + ' answer' + (shown === 1 ? '' : 's') + ' found.' : 'No answer matches. Try other words, or ask on the Discord.';
    };
    box.addEventListener('input', filter);
  }

  // ---- Memory estimator
  var dev = $('mem-device'), need = $('mem-need');
  if (dev && need) {
    var fill = $('mem-fill'), say = $('mem-say'), outDev = $('mem-device-out'), outNeed = $('mem-need-out'), m50 = $('mem-m50'), m75 = $('mem-m75');
    m50.style.left = '50%'; m75.style.left = '75%';
    var calc = function () {
      var d = +dev.value, n = +need.value, ratio = n / d;
      outDev.textContent = d + ' GB'; outNeed.textContent = n.toFixed(1).replace('.0', '') + ' GB';
      fill.style.width = Math.min(100, ratio * 100) + '%';
      var color = 'var(--good)', msg;
      if (ratio < 0.5) msg = '<b>Should fit comfortably.</b> Less than half of your device\'s memory.';
      else if (ratio < 0.75) { color = 'var(--warn)'; msg = '<b>Tight.</b> Expect to need Swap and to close other apps.'; }
      else if (ratio < 1) { color = 'var(--bad)'; msg = '<b>Unlikely.</b> iOS keeps part of the memory for itself and the engine needs room too; Swap may not be enough.'; }
      else { color = 'var(--bad)'; msg = '<b>It won\'t fit.</b> The game wants more memory than the device has.'; }
      fill.style.background = color; say.innerHTML = msg;
    };
    dev.addEventListener('input', calc); need.addEventListener('input', calc); calc();
  }
})();

// A link to an answer (for example #pairing-file) opens it.
(function () {
  function open() { var t = location.hash && document.querySelector(location.hash); if (t && t.tagName === 'DETAILS') t.open = true; }
  addEventListener('hashchange', open); open();
})();
