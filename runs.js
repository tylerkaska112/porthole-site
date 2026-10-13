// "What runs, and how well" on the home page: the newest real reports with a measured frame rate, read from compat.json (the same snapshot the compatibility list uses).
// Text only: nothing from the data is ever treated as markup. Without script, or if the file can't be read, the sentence in the page stays.
(function () {
  var list = document.getElementById('runs-list'), note = document.getElementById('runs-note');
  if (!list || !window.fetch) return;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
  var RATING = { great: 'Works great', playable: 'Playable', broken: "Doesn't work" };
  fetch('compat.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
    var rows = [];
    (data.games || []).forEach(function (g) {
      (g.reports || []).forEach(function (r) {
        if (r.perf && typeof r.perf.fpsAvg === 'number' && r.rating !== 'broken') rows.push({ title: g.title || 'A game', r: r });
      });
    });
    var order = { great: 0, playable: 1 };
    rows.sort(function (a, b) { return (order[a.r.rating] - order[b.r.rating]) || (b.r.perf.fpsAvg - a.r.perf.fpsAvg); });
    rows = rows.slice(0, 4);
    if (!rows.length) return;
    list.textContent = '';
    var earlier = false;
    var TAGNAME = { controller_ok: 'Controls work', online_works: 'Online works', audio_issues: 'Sound problems', graphics_glitches: 'Graphics glitches', long_loading: 'Slow to load', overheats: 'Phone gets hot' };
    var STORE = { steam: ['S', 'Steam'], epic: ['E', 'Epic Games'], gog: ['G', 'GOG'], itch: ['i', 'itch.io'] };
    rows.forEach(function (row) {
      var r = row.r, card = el('div', 'card'), top = el('div', 'runs-top');
      top.appendChild(el('h3', '', row.title));
      var st = STORE[r.source] || ['?', 'Another source'], logo = el('span', 'store ' + (STORE[r.source] ? r.source : 'other'), st[0]);
      logo.title = st[1]; logo.setAttribute('role', 'img'); logo.setAttribute('aria-label', st[1]); top.appendChild(logo);
      card.appendChild(top);
      card.appendChild(el('p', 'runs-fps', Math.round(r.perf.fpsAvg) + ' fps average'));
      // A bar from 0 to 60 fps: a mark at 30, and the worst moments as a small amber tick.
      var bar = el('div', 'fpsbar'), fill = el('i'), m30 = el('u'), m60 = el('u');
      fill.style.width = Math.min(100, r.perf.fpsAvg / 60 * 100) + '%'; m30.style.left = '50%'; m60.style.right = '0';
      bar.appendChild(fill); bar.appendChild(m30); bar.appendChild(m60);
      if (typeof r.perf.fpsLow === 'number') { var low = el('b'); low.style.left = Math.min(98, r.perf.fpsLow / 60 * 100) + '%'; low.title = 'Lowest moments: ' + Math.round(r.perf.fpsLow) + ' fps'; bar.appendChild(low); }
      bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', Math.round(r.perf.fpsAvg) + ' frames per second on average' + (typeof r.perf.fpsLow === 'number' ? ', as low as ' + Math.round(r.perf.fpsLow) : ''));
      card.appendChild(bar);
      var scale = el('div', 'fpsscale'); ['0', '30', '60 fps'].forEach(function (t) { scale.appendChild(el('span', '', t)); }); card.appendChild(scale);
      var chips = el('div', 'chips');
      chips.appendChild(el('span', r.rating === 'great' ? 'chip full' : 'chip partial', (RATING[r.rating] || r.rating).toUpperCase()));
      (r.tags || []).forEach(function (t) { if (TAGNAME[t]) chips.appendChild(el('span', 'chip plain', TAGNAME[t])); });
      if (r.perf.thermal && r.perf.thermal !== 'cool') chips.appendChild(el('span', 'chip plain', 'Got ' + r.perf.thermal));
      card.appendChild(chips);
      card.appendChild(el('p', 'fine', (r.device || 'A phone') + (r.perf.minutes ? ', after ' + r.perf.minutes + ' minutes' : '')));
      if (r.onThisEngine === false) earlier = true;
      list.appendChild(card);
    });
    var total = (data.games || []).reduce(function (n, g) { return n + (g.reportCount || 0); }, 0);
    note.textContent = 'From ' + total + ' report' + (total === 1 ? '' : 's') + ' on ' + (data.games || []).length + ' games so far' + (earlier ? ', made on an earlier version of the engine than the current one' : '') + '. Your result can differ: device, settings and iOS version all matter. ';
    var a = el('a', '', 'See the whole list'); a.href = '/compat.html'; note.appendChild(a); note.appendChild(document.createTextNode('.'));
  }).catch(function () { /* the sentence in the page stays */ });
})();
