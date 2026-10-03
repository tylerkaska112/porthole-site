(function () {
  'use strict';
  var VERDICT = { great: 'Works great', playable: 'Works, with problems', broken: "Doesn't work" };
  var STABILITY = { never: 'Never crashed', sometimes: 'Crashes sometimes', constantly: 'Crashes all the time', wont_launch: "Won't start" };
  var TAGS = {
    controller_ok: 'Controls work', controller_bad: 'Controls are awkward', audio_issues: 'Sound problems', graphics_glitches: 'Graphics glitches',
    online_works: 'Online works', online_broken: "Online doesn't work", long_loading: 'Slow to load', overheats: 'Device gets hot',
    drains_battery: 'Drains the battery', needs_low_settings: 'Needs low settings'
  };
  var SOURCES = { steam: 'Steam', gog: 'GOG', epic: 'Epic Games Store', itch: 'itch.io', humble: 'Humble Bundle', physical: 'a disc or backup', demo: 'a developer demo or free release' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;     // text only: nothing from the data is ever treated as markup
    return n;
  }
  function pill(verdict) { return el('span', 'pill ' + verdict, VERDICT[verdict] || verdict); }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function when(iso) {
    var d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // The settings, as sentences (the same wording as the app).
  function describe(key, v) {
    switch (key) {
      case 'launch': return v === 'steam' ? 'Started through Steam' : 'Run directly (not through Steam)';
      case 'power': return v === 'performance' ? 'Performance mode' : v === 'saver' ? 'Battery saver' : 'Balanced mode';
      case 'desktopDisplay': return v ? 'Wine desktop display on' : 'Wine desktop display off';
      case 'swapMB': return v === 0 ? 'no extra swap' : v + ' MB swap';
      case 'vramMB': return v === 0 ? 'video memory automatic' : v + ' MB video memory';
      case 'audioCushionMs': return 'audio cushion ' + v + ' ms';
      case 'preciseMath': return v ? 'precise shader math' : 'fast shader math';
      case 'controls': return v === 'firstPerson' ? 'first-person controls' : 'standard controls';
      default: return null;
    }
  }
  function settingsLine(s) {
    return ['launch', 'power', 'desktopDisplay', 'swapMB', 'vramMB', 'audioCushionMs', 'preciseMath', 'controls']
      .map(function (k) { return describe(k, s[k]); }).filter(Boolean).join(' · ');
  }
  function perfLine(p) {
    if (!p) return '';
    var parts = [];
    if (p.fpsAvg != null) parts.push(Math.round(p.fpsAvg) + ' fps average');
    if (p.fpsLow != null) parts.push(Math.round(p.fpsLow) + ' low');
    if (p.minutes != null) parts.push(p.minutes + ' min');
    if (p.thermal) parts.push('device ' + (p.thermal === 'critical' ? 'very hot' : p.thermal));
    return parts.join(' · ');
  }

  // "40d5e74-r0" -> "Madeira 40d5e74 r0"; reports from before engine versions have none.
  function engineName(e) {
    if (!e) return 'an earlier version';
    var m = /^(.+)-r(\d+)$/.exec(e);
    return m ? 'Madeira ' + m[1] + ' r' + m[2] : e;
  }

  function renderReport(r) {
    var box = el('div', r.onThisEngine === false ? 'report old' : 'report');
    var top = el('div', 'top');
    top.appendChild(pill(r.rating));
    top.appendChild(el('strong', null, r.device));
    top.appendChild(el('span', 'dim', 'iOS ' + r.ios + ' · Porthole ' + r.appVersion + ' · ' + when(r.date)));
    box.appendChild(top);
    if (r.onThisEngine === false) box.appendChild(el('div', 'earlier', 'Earlier game engine (' + engineName(r.engine) + '): not counted in the badge'));
    var line = (STABILITY[r.stability] || r.stability) + ' · files from ' + (SOURCES[r.source] || r.source);
    box.appendChild(el('div', 'dim', line));
    var perf = perfLine(r.perf);
    if (perf) box.appendChild(el('div', 'dim', perf));
    if (r.settings) box.appendChild(el('div', 'dim', settingsLine(r.settings)));
    if (r.tags && r.tags.length) box.appendChild(el('div', null, r.tags.map(function (t) { return TAGS[t] || t; }).join(' · ')));
    if (r.comment) box.appendChild(el('p', 'quote', '“' + r.comment + '”'));
    return box;
  }

  function renderGame(g) {
    var d = el('details', 'game');
    var sum = el('summary');
    var grow = el('div', 'grow');
    grow.appendChild(el('div', 'name', g.title));
    var counted = g.countedReports || 0, earlier = g.earlierReports || 0;
    grow.appendChild(el('div', 'meta', plural(g.reportCount, 'report') + ' · latest ' + when(g.lastReport) + (earlier && counted ? ' · ' + earlier + ' earlier' : '')));
    sum.appendChild(grow);
    if (g.verdict) sum.appendChild(pill(g.verdict));
    else sum.appendChild(el('span', 'pill untested', 'Not yet tested'));
    d.appendChild(sum);

    var body = el('div', 'body');
    if (g.devices && g.devices.length) {
      body.appendChild(el('h3', null, 'By device'));
      var phones = el('div', 'phones');
      g.devices.forEach(function (x) {
        var c = el('span', 'chip');
        c.appendChild(document.createTextNode(x.device + ' '));
        c.appendChild(pill(x.verdict));
        c.appendChild(document.createTextNode(' ' + x.reports));
        phones.appendChild(c);
      });
      body.appendChild(phones);
    }
    if (g.settingsSummary && g.settingsSummary.items) {
      body.appendChild(el('h3', null, 'When it works great, people use'));
      var ul = el('ul');
      g.settingsSummary.items.forEach(function (i) {
        if (['launch', 'power', 'desktopDisplay', 'swapMB', 'vramMB', 'preciseMath'].indexOf(i.key) < 0) return;
        var text = describe(i.key, i.value);
        if (text) ul.appendChild(el('li', null, text + ' (' + i.count + ' of ' + g.settingsSummary.reports + ')'));
      });
      body.appendChild(ul);
    }
    if (!g.verdict && earlier) {
      body.appendChild(el('p', 'note', 'The game engine changed since ' + (earlier === 1 ? 'this was' : 'these were') + ' reported, so there is no badge until someone plays it again. The old reports are kept below for reference.'));
    }
    body.appendChild(el('h3', null, 'Reports'));
    (g.reports || []).forEach(function (r) { body.appendChild(renderReport(r)); });
    d.appendChild(body);
    return d;
  }

  var data = { games: [] };
  var list = document.getElementById('games');
  var q = document.getElementById('q'), filter = document.getElementById('filter'), sort = document.getElementById('sort');

  function draw() {
    var text = q.value.trim().toLowerCase();
    var shown = data.games.filter(function (g) {
      return (filter.value === 'all' || g.verdict === filter.value || (filter.value === 'untested' && !g.verdict)) && (!text || g.title.toLowerCase().indexOf(text) >= 0);
    });
    shown.sort(function (a, b) {
      if (sort.value === 'name') return a.title.localeCompare(b.title);
      if (sort.value === 'recent') return a.lastReport < b.lastReport ? 1 : a.lastReport > b.lastReport ? -1 : 0;
      return b.reportCount - a.reportCount || a.title.localeCompare(b.title);
    });
    list.textContent = '';
    if (!shown.length) {
      list.appendChild(el('p', 'empty', data.games.length ? 'No game matches.' : 'No reports have been sent yet.'));
      return;
    }
    shown.forEach(function (g) { list.appendChild(renderGame(g)); });
  }

  [q, filter, sort].forEach(function (n) { n.addEventListener('input', draw); n.addEventListener('change', draw); });

  fetch('compat.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) {
      data = json;
      document.getElementById('note').textContent = 'Last updated ' + json.generated + '. ' + plural(json.games.length, 'game') + ' so far.'
        + (json.engine ? ' Badges count reports from the current game engine (' + engineName(json.engine) + '); reports from earlier engines stay listed but do not count.' : '');
      draw();
    })
    .catch(function () { list.textContent = ''; list.appendChild(el('p', 'empty', 'The reports could not be loaded right now. Try again later.')); });
})();
