// A small, working copy of Porthole's iPhone layout for the home page. Everything in it is made up in this page: invented games, a pretend download engine,
// no network, nothing saved. The Appearance page changes the theme of the WHOLE website (see theme.js).
(function () {
  'use strict';
  const screen = document.getElementById('m-screen');
  if (!screen) return;
  const root = document.getElementById('mock');
  const T = window.PortholeTheme;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const STORES = { steam: { name: 'Steam', l: 'S', mb: 46 }, epic: { name: 'Epic Games', l: 'E', mb: 28 }, gog: { name: 'GOG', l: 'G', mb: 21 }, itch: { name: 'itch.io', l: 'i', mb: 12 } };
  const ORDER = ['steam', 'epic', 'gog', 'itch'];
  // Invented games: nothing here is a real title.
  const GAMES = [
    { id: 'lantern', n: 'Lanternfall', s: 'steam', gb: 18.2, h: 28, v: 'great', fps: 58, c: 'full', d: 'A lantern-lit action adventure through a drowned city.' },
    { id: 'salt', n: 'Salt Road', s: 'steam', gb: 9.4, h: 200, v: 'great', fps: 60, c: 'full', d: 'A quiet trading game on a road that crosses the desert.' },
    { id: 'rune', n: 'Rune & Rail', s: 'steam', gb: 31, h: 300, v: 'playable', fps: 34, c: 'partial', d: 'Lay track, carve runes, run a haunted railway.' },
    { id: 'cinder', n: 'Cinder Harbor', s: 'epic', gb: 24.5, h: 12, v: 'playable', fps: 41, c: 'partial', d: 'A harbour town, a fire, and a long night shift.' },
    { id: 'vesper', n: 'Vesper Station', s: 'epic', gb: 12.8, h: 260, v: 'great', fps: 57, c: 'full', d: 'Fix a space station one broken pipe at a time.' },
    { id: 'glass', n: 'Glass Orchard', s: 'epic', gb: 6.1, h: 150, v: 'great', fps: 60, c: 'full', d: 'A puzzle garden made of light.' },
    { id: 'moss', n: 'Moss & Mortar', s: 'gog', gb: 4.3, h: 120, v: 'great', fps: 60, c: 'full', d: 'Build a village in a forest that fights back.' },
    { id: 'brass', n: 'Brass Meridian', s: 'gog', gb: 15.7, h: 45, v: 'playable', fps: 38, c: 'partial', d: 'Clockwork detectives in a city that never sets.' },
    { id: 'orbit', n: 'Pocket Orbit', s: 'itch', gb: 0.6, h: 190, v: 'great', fps: 60, c: 'full', d: 'A tiny, perfect game about tiny planets.' },
    { id: 'tundra', n: 'Tiny Tundra', s: 'itch', gb: 1.2, h: 210, v: 'great', fps: 60, c: 'none', d: 'Survive the cold with one very small fox.' }
  ];
  const byId = (id) => GAMES.find((g) => g.id === id);
  const DEVICES = [{ id: 'i15', name: 'iPhone 15 Pro Max', k: 1 }, { id: 'i17', name: 'iPhone 17 Pro', k: 1.18 }, { id: 'ipad', name: 'iPad Pro 13-inch (M4)', k: 1.4 }];

  const I = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    stores: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    reports: '<path d="M12 3l2.4 2 3.1-.3.9 3 2.6 1.8-1.3 2.9 1.3 2.9-2.6 1.8-.9 3-3.1-.3L12 21l-2.4-2-3.1.3-.9-3L3 14.5l1.3-2.9L3 8.7l2.6-1.8.9-3 3.1.3z"/><path d="M9 12l2 2 4-4"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    down: '<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>', all: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'
  };
  const svg = (p, extra) => `<svg viewBox="0 0 24 24" aria-hidden="true"${extra || ''}>${p}</svg>`;

  // ---- State
  const S = {
    tab: 'home', view: { n: 'home' }, hist: [], sel: 'lantern',
    signed: { steam: true, epic: true, gog: false, itch: false },
    inst: { lantern: true, salt: true, cinder: true },
    dl: {}, order: [],
    q: '', filter: 'all', pw: {}, sw: {}, direct: {}, door: null, undo: {}, layout: {}, hidePad: true, hid: false, kbm: false,
    dev: 'i15', openReport: null, sheet: null, setup: 0, paired: false, vcr: 0, setupDone: false,
    launch: null, play: null, playPower: 'balanced', playControls: true, lastKey: ''
  };
  const set = (o) => Object.assign(S, o);
  const viewKey = () => (S.play ? 'play' : S.view.n + (S.view.id || ''));

  // ---- Little builders
  const storeTile = (s, big) => `<span class="m-store ${s}${big ? ' big' : ''}" title="${STORES[s].name}" role="img" aria-label="${STORES[s].name}">${STORES[s].l}</span>`;
  const art = (g, cls) => `<div class="m-art ${cls || ''}" style="--h:${g.h}"><b>${esc(g.n[0])}</b></div>`;
  const vChip = (g) => (g.v === 'great' ? '<span class="m-chip full">WORKS GREAT</span>' : '<span class="m-chip partial">PLAYABLE</span>');
  const cChip = (g) => (g.c === 'full' ? '<span class="m-chip full">FULL</span>' : g.c === 'partial' ? '<span class="m-chip partial">PARTIAL</span>' : '');
  const toggle = (on, act, v) => `<button class="m-switch" role="switch" aria-checked="${on ? 'true' : 'false'}" data-a="${act}" data-v="${v || ''}"></button>`;
  const seg = (items, cur, act, key) => `<div class="m-seg" role="group">${items.map((i) => `<button aria-pressed="${cur === i[0]}" data-a="${act}" data-k="${key || ''}" data-v="${i[0]}">${i[1]}</button>`).join('')}</div>`;
  const installed = () => GAMES.filter((g) => S.inst[g.id]);
  const dlCount = () => Object.keys(S.dl).length;
  const size = (gb) => (gb < 1 ? Math.round(gb * 1024) + ' MB' : gb.toFixed(1) + ' GB');
  const dur = (g) => 14 + g.gb * 1.1;           // demo seconds for the whole download
  const speed = (g, t) => STORES[g.s].mb * (0.92 + 0.08 * Math.sin(t / 1.7 + g.h));
  const left = (g, f, mb) => { const s = ((1 - f) * g.gb * 1024) / mb; return s < 60 ? 'under a minute' : s < 3600 ? Math.round(s / 60) + ' min' : Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min'; };

  // ---- Downloads (a pretend engine: each store runs one at a time, in demo time)
  const dlOf = (g) => S.dl[g.id];
  function install(id) {
    const g = byId(id);
    if (!S.signed[g.s]) { toast('Sign in to ' + STORES[g.s].name + ' first.'); go({ n: 'store', id: g.s }); return; }
    if (S.dl[id] || S.inst[id]) return;
    S.dl[id] = { st: 'queued', f: 0 }; S.order.push(id);
    render();
  }
  function startNow(id) {
    const g = byId(id);
    S.order = S.order.filter((x) => x !== id); S.order.unshift(id);
    Object.keys(S.dl).forEach((o) => { if (o !== id && byId(o).s === g.s && S.dl[o].st === 'active') S.dl[o].st = 'queued'; });
    S.dl[id].st = 'queued'; tick(0.01); render();
  }
  function cancel(id) { delete S.dl[id]; S.order = S.order.filter((x) => x !== id); render(); }
  function tick(dt) {
    ORDER.forEach((s) => {
      const ids = S.order.filter((id) => byId(id).s === s && S.dl[id]);
      let active = ids.find((id) => S.dl[id].st === 'active');
      if (!active) { active = ids.find((id) => S.dl[id].st === 'queued'); if (active) S.dl[active].st = 'active'; }
      if (!active) return;
      const g = byId(active), d = S.dl[active];
      d.f = Math.min(1, d.f + dt / dur(g));
      if (d.f >= 1) { S.inst[active] = true; delete S.dl[active]; S.order = S.order.filter((x) => x !== active); toast(g.n + ' is installed.'); }
    });
  }
  const ringHTML = () => {
    const act = Object.keys(S.dl).filter((id) => S.dl[id].st === 'active');
    const f = act.length ? act.reduce((a, id) => a + S.dl[id].f, 0) / act.length : 0;
    const C = 2 * Math.PI * 24;
    return { f, act: act.length, ring: `<svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - f)).toFixed(1)}"/></svg>` };
  };
  function fab() {
    if (S.tab !== 'stores' || S.view.n === 'downloads' || S.play) return '';
    const r = ringHTML(), n = dlCount();
    return `<button class="m-fab${r.act ? ' busy' : ''}" data-a="go" data-v="downloads" aria-label="Downloads">${r.act ? r.ring : ''}${svg(I.down, ' class="arrow"')}${n ? `<em>${n}</em>` : ''}</button>`;
  }
  function refreshDl() {
    const t = performance.now() / 1000;
    Object.keys(S.dl).forEach((id) => {
      const g = byId(id), d = S.dl[id], mb = speed(g, t);
      screen.querySelectorAll(`[data-bar="${id}"]`).forEach((e) => { e.style.width = (d.f * 100).toFixed(1) + '%'; });
      screen.querySelectorAll(`[data-pct="${id}"]`).forEach((e) => { e.textContent = Math.floor(d.f * 100) + '%'; });
      screen.querySelectorAll(`[data-sub="${id}"]`).forEach((e) => { e.textContent = `${size(d.f * g.gb)} of ${size(g.gb)} \u00B7 ${Math.round(mb)} MB/s \u00B7 ${left(g, d.f, mb)} left`; });
    });
    const f = screen.querySelector('.m-fab');
    if (f) { const r = ringHTML(); f.classList.toggle('busy', r.act > 0); const old = f.querySelector('svg.ring'); if (old) old.remove(); if (r.act) f.insertAdjacentHTML('afterbegin', r.ring); }
  }

  // ---- Navigation
  function go(v) { S.hist.push(S.view); S.view = v; S.door = null; render(); }
  function back() { S.view = S.hist.pop() || { n: S.tab === 'home' ? 'home' : S.tab }; S.door = null; render(); }
  function tab(t) { S.tab = t; S.hist = []; S.view = { n: t }; S.door = null; S.q = ''; render(); }

  // ---- Screens
  function topbar(title, backBtn) {
    if (!backBtn) return `<div class="m-top"><div class="brand"><img src="/img/porthole-sunset-96.webp" alt="" width="24" height="24"> Porthole</div></div>`;
    return `<div class="m-top"><button class="m-back" data-a="back" aria-label="Back">\u2039 Back</button><h2>${esc(title)}</h2></div>`;
  }
  function homeView() {
    const g = byId(S.sel) && S.inst[S.sel] ? byId(S.sel) : installed()[0];
    let h = '';
    if (!S.setupDone) h += `<button class="m-notice" data-a="sheet" data-v="setup"><span class="m-ico">!</span><span class="t"><b>Finish setting up</b><small>Four short pages. Takes about two minutes.</small></span><span class="go">\u203A</span></button>`;
    if (dlCount()) h += `<button class="m-notice" data-a="go" data-v="downloads" ><span class="m-ico">\u2193</span><span class="t"><b>${dlCount()} download${dlCount() > 1 ? 's' : ''}</b><small>Tap to see all of them.</small></span><span class="go">\u203A</span></button>`;
    if (!g) return topbar() + `<div class="m-body">${h}<div class="m-card" style="padding:18px;text-align:center"><b>No games yet</b><p class="m-fine">Open the Stores tab and install one.</p><button class="m-btn" data-a="tab" data-v="stores">Open Stores</button></div></div>`;
    h += `<div class="m-hero">${art(g)}<div class="meta">${storeTile(g.s)}<span class="m-chip plain">${STORES[g.s].name}</span>${vChip(g)}${cChip(g)}</div><h3>${esc(g.n)}</h3>
      <div class="acts"><button class="m-btn" data-a="play" data-v="${g.id}">\u25B6 Play</button><button class="m-pill" data-a="open" data-v="${g.id}">Details</button></div></div>`;
    h += `<div class="m-h">Your games</div><div class="m-shelf">${installed().map((x) => `<button class="m-tile" aria-pressed="${x.id === g.id}" data-a="sel" data-v="${x.id}">${art(x)}<span>${esc(x.n)}</span></button>`).join('')}</div>`;
    h += `<p class="m-fine">Every game shows the store it came from. Not here yet? Open the Stores tab.</p>`;
    return topbar() + `<div class="m-body">${h}</div>`;
  }

  function door(name, title, sub, content) {
    const open = S.door === name;
    return `<div><button class="m-row m-door" data-a="door" data-v="${name}" aria-expanded="${open}"><span class="t"><b>${title}</b><small>${sub}</small></span><span class="go">${open ? '\u2303' : '\u203A'}</span></button>${open ? `<div class="m-open">${content}</div>` : ''}</div>`;
  }
  function gameView(id) {
    const g = byId(id), pw = S.pw[id] || 'balanced', sw = S.sw[id] || 'off', dir = !!S.direct[id], devs = DEVICES[0];
    const rec = pw === 'performance' && sw === '4g';
    const fps = Math.round(g.fps * (pw === 'performance' ? 1.5 : pw === 'saver' ? 0.6 : 1));
    let h = `${art(g, 'banner')}<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">${storeTile(g.s)}<span class="m-chip plain">${STORES[g.s].name}</span>${vChip(g)}${cChip(g)}</div><p class="m-fine" style="margin:0 0 12px">${esc(g.d)}</p>
      <button class="m-btn" data-a="play" data-v="${id}" style="margin-bottom:14px">\u25B6 Play</button>
      <div class="m-group"><div class="m-row"><span class="t"><b>Power mode</b></span></div><div style="padding:0 13px 12px">${seg([['saver', 'Saver'], ['balanced', 'Balanced'], ['performance', 'Performance']], pw, 'pw')}</div>
      <div class="m-row"><span class="t"><b>Swap</b><small>Storage used as extra memory</small></span></div><div style="padding:0 13px 12px">${seg([['off', 'Off'], ['2g', '2 GB'], ['4g', '4 GB']], sw, 'sw')}</div>
      ${g.s === 'steam' ? `<div class="m-row"><span class="t"><b>Start through Steam</b><small>${dir ? 'Running directly, skipping Steam' : 'Turn off to run directly if a game won\'t start'}</small></span>${toggle(!dir, 'direct')}</div>` : ''}</div>
      <div class="m-h">More</div><div class="m-group">`;
    h += door('controls', 'Controls', 'On-screen layout and controller', `<div class="m-sw">${[['default', 'Default'], ['fp', 'First-person'], ['mine', 'Mine']].map((l) => `<button aria-pressed="${(S.layout[id] || 'default') === l[0]}" data-a="layout" data-v="${l[0]}">${l[1]}</button>`).join('')}</div>
      <div class="m-row" style="padding:0"><span class="t"><b>Hide while a controller is used</b></span>${toggle(S.hidePad, 'hidePad')}</div>`);
    h += door('runs', 'How it runs', 'What other players report', `<div>${vChip(g)} <small class="m-fine">on ${devs.name}</small></div><b style="font-size:22px;color:var(--accent)">${Math.round(g.fps * devs.k)} fps</b>
      <div class="m-fpsbar"><i style="width:${Math.min(100, g.fps / 60 * 100)}%"></i><u style="left:50%"></u></div><small class="m-fine" style="margin:0">From ${4 + (g.h % 9)} reports</small>
      ${rec && !S.undo[id] ? '' : `<div class="m-card" style="padding:10px"><b>Use what works for others</b><p class="m-fine" style="margin:4px 0 8px">Most players who rate it works great use <b>Performance</b> and <b>4 GB swap</b>.</p>${S.undo[id] ? `<button class="m-pill" data-a="undo">Undo</button> <span class="m-fine">Applied.</span>` : `<button class="m-btn small" data-a="apply">Apply</button>`}</div>`}
      <p class="m-fine" style="margin:0">Now: about ${fps} fps at ${pw === 'performance' ? 'Performance' : pw === 'saver' ? 'Saver' : 'Balanced'}.</p>`);
    h += door('more', 'More options', 'Controller and memory', `<div class="m-row" style="padding:0"><span class="t"><b>Controller as keyboard and mouse</b></span>${toggle(S.kbm, 'kbm')}</div>
      <div class="m-row" style="padding:0"><span class="t"><b>DualSense (HID) and Xbox</b><small>For games that don't see the controller</small></span>${toggle(S.hid, 'hid')}</div>`);
    h += door('about', 'About and files', size(g.gb) + ' on this device', `<div class="m-row" style="padding:0">${storeTile(g.s, true)}<span class="t"><b>${STORES[g.s].name}</b><small>Installed \u00B7 ${size(g.gb)}</small></span></div><button class="m-pill danger" data-a="remove" data-v="${id}">Remove from this device</button>`);
    h += '</div>';
    return topbar(g.n, true) + `<div class="m-body">${h}</div>`;
  }

  function storesHome() {
    const card = (id, sub, badge, act, v) => `<button class="m-row m-card" style="margin-bottom:9px;padding:13px" data-a="${act}" data-v="${v}">${badge}<span class="t"><b style="font-size:16px">${id}</b><small>${sub}</small></span><span class="go">\u203A</span></button>`;
    let h = `<p class="m-fine" style="margin-top:0">Where your games come from.</p>`;
    ORDER.forEach((s) => {
      const list = GAMES.filter((g) => g.s === s), n = list.filter((g) => S.inst[g.id]).length;
      h += card(STORES[s].name, S.signed[s] ? `${list.length} games \u00B7 ${n} installed` : 'Not signed in', storeTile(s, true), 'go', 'store:' + s);
    });
    h += card('All games', `${GAMES.filter((g) => S.signed[g.s]).length} games from ${ORDER.filter((s) => S.signed[s]).length} stores`, `<span class="m-ico" style="width:40px;height:40px;flex-basis:40px;border-radius:12px">${svg(I.all, ' style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2"')}</span>`, 'go', 'store:all');
    h += card('Downloads', dlCount() ? `${dlCount()} in progress` : 'Nothing is downloading', `<span class="m-ico" style="width:40px;height:40px;flex-basis:40px;border-radius:12px">\u2193</span>`, 'go', 'downloads');
    return topbar() + `<div class="m-body">${h}</div>`;
  }
  const gridFor = (sid) => {
    const q = S.q.trim().toLowerCase();
    return GAMES.filter((g) => (sid === 'all' ? S.signed[g.s] : g.s === sid) && (!q || g.n.toLowerCase().includes(q)) && (S.filter === 'all' || S.inst[g.id] || S.dl[g.id]));
  };
  function tileHTML(g, sid) {
    const d = S.dl[g.id];
    let st;
    if (S.inst[g.id]) st = `<span class="st">Installed \u00B7 ${size(g.gb)}</span><button class="m-btn small" data-a="open" data-v="${g.id}" style="justify-self:start">Open</button>`;
    else if (d) st = d.st === 'active' ? `<div class="m-bar"><i data-bar="${g.id}" style="width:${d.f * 100}%"></i></div><span class="st"><span data-pct="${g.id}">${Math.floor(d.f * 100)}%</span> downloading</span>` : `<span class="st">${d.st === 'paused' ? 'Paused' : 'Waiting'}</span>`;
    else st = `<span class="st">${size(g.gb)}</span><button class="m-btn small" data-a="install" data-v="${g.id}" style="justify-self:start">Install</button>`;
    return `<div class="m-game">${art(g)}<div class="info"><div class="nm">${sid === 'all' ? storeTile(g.s) : ''}<span>${esc(g.n)}</span></div>${st}</div></div>`;
  }
  function storeView(sid) {
    const sw = `<div class="m-switcher">${ORDER.map((s) => `<button aria-pressed="${s === sid}" data-a="go" data-v="store:${s}" aria-label="${STORES[s].name}">${storeTile(s)}</button>`).join('')}<button aria-pressed="${sid === 'all'}" data-a="go" data-v="store:all" aria-label="All games">${svg(I.all)}</button></div>`;
    let h = sw;
    if (sid !== 'all' && !S.signed[sid]) {
      h += `<div class="m-card" style="padding:18px;display:grid;gap:10px;justify-items:start">${storeTile(sid, true)}<b style="font-size:18px">Sign in to ${STORES[sid].name}</b><p class="m-fine" style="margin:0">${sid === 'itch' ? 'You paste a personal API key made on itch.io.' : sid === 'steam' ? 'Password with Steam Guard, or a QR code.' : 'You sign in on the store\u2019s own page, so Porthole never sees your password.'} It stays in this device\u2019s Keychain.</p><button class="m-btn" data-a="signin" data-v="${sid}">Sign in</button><small class="m-fine" style="margin:0">Demo: nothing is sent.</small></div>`;
    } else {
      h += `<label class="m-search">${svg(I.search, ' style="width:16px;height:16px;fill:none;stroke:var(--dim);stroke-width:2"')}<input id="m-q" type="search" placeholder="Search ${sid === 'all' ? 'every store' : STORES[sid].name}" value="${esc(S.q)}" aria-label="Search games"></label>
        <div style="margin-bottom:10px">${seg([['all', 'All'], ['installed', 'Installed']], S.filter, 'filter')}</div><div class="m-grid" id="m-grid">${gridHTML(sid)}</div>`;
    }
    return topbar() + `<div class="m-body">${h}</div>`;
  }
  const gridHTML = (sid) => { const l = gridFor(sid); return l.length ? l.map((g) => tileHTML(g, sid)).join('') : '<p class="m-fine" style="grid-column:1/-1;text-align:center">No games match.</p>'; };

  function downloadsView() {
    const items = S.order.filter((id) => S.dl[id]).map((id) => ({ g: byId(id), d: S.dl[id] }));
    const run = items.filter((i) => i.d.st === 'active'), wait = items.filter((i) => i.d.st === 'queued'), stop = items.filter((i) => i.d.st === 'paused');
    let h = items.length ? `<p class="m-fine" style="margin-top:0">${[run.length && run.length + ' downloading', wait.length && wait.length + ' waiting', stop.length && stop.length + ' paused'].filter(Boolean).join(' \u00B7 ')}</p>` : '';
    run.forEach(({ g, d }) => { h += `<div class="m-card m-dl" style="border-color:var(--accent)"><div class="top">${art(g)}<div class="nm">${esc(g.n)}<small>${STORES[g.s].name}</small></div><span class="pct" data-pct="${g.id}">${Math.floor(d.f * 100)}%</span></div><div class="m-bar"><i data-bar="${g.id}" style="width:${d.f * 100}%"></i></div><small class="m-fine" style="margin:0" data-sub="${g.id}"></small><div class="acts"><button class="m-btn small" data-a="dlpause" data-v="${g.id}">Pause</button><button class="m-pill danger" data-a="dlcancel" data-v="${g.id}">Cancel</button></div></div>`; });
    if (wait.length) h += `<div class="m-h">Up next</div>` + wait.map(({ g }) => `<div class="m-card m-dl"><div class="top">${art(g)}<div class="nm">${esc(g.n)}<small>${STORES[g.s].name} \u00B7 Waiting \u00B7 ${size(g.gb)}</small></div></div><div class="acts"><button class="m-pill" data-a="dlnow" data-v="${g.id}">Download now</button><button class="m-pill danger" data-a="dlcancel" data-v="${g.id}">Remove</button></div></div>`).join('');
    if (stop.length) h += `<div class="m-h">Paused</div>` + stop.map(({ g, d }) => `<div class="m-card m-dl"><div class="top">${art(g)}<div class="nm">${esc(g.n)}<small>${STORES[g.s].name} \u00B7 Paused at ${Math.floor(d.f * 100)}%</small></div></div><div class="acts"><button class="m-btn small" data-a="dlresume" data-v="${g.id}">Resume</button><button class="m-pill danger" data-a="dlcancel" data-v="${g.id}">Cancel</button></div></div>`).join('');
    if (!items.length) h += `<div style="text-align:center;padding:40px 10px"><div style="font-size:40px;color:var(--accent)">\u2713</div><b style="font-size:17px">Nothing is downloading</b><p class="m-fine">Install a game from any store and it shows up here.</p><button class="m-btn" data-a="tab" data-v="stores">Browse your games</button></div>`;
    else h += `<div style="margin-top:6px">${run.length || wait.length ? '<button class="m-pill" data-a="pauseall">Pause all</button> ' : ''}${stop.length ? '<button class="m-btn small" data-a="resumeall">Resume all</button>' : ''}</div>`;
    return topbar('Downloads', true) + `<div class="m-body">${h}</div>`;
  }

  function reportsView() {
    const dev = DEVICES.find((d) => d.id === S.dev);
    let h = `<div style="margin-bottom:10px">${seg(DEVICES.map((d) => [d.id, d.name.replace(' Pro Max', '').replace('13-inch (M4)', 'M4')]), S.dev, 'dev')}</div>`;
    h += GAMES.map((g) => {
      const f = Math.min(120, Math.round(g.fps * dev.k)), open = S.openReport === g.id;
      return `<div class="m-card" style="margin-bottom:9px"><button class="m-row" data-a="rep" data-v="${g.id}" style="width:100%">${art(g, '')}<span class="t"><b>${esc(g.n)}</b><small>${f} fps on ${dev.name}</small></span>${vChip(g)}</button>${open ? `<div class="m-open"><div class="m-fpsbar"><i style="width:${Math.min(100, f / 60 * 100)}%"></i><u style="left:50%"></u></div><small class="m-fine" style="margin:0">${4 + (g.h % 9)} reports \u00B7 ${cChip(g) ? 'Controller ' + (g.c === 'full' ? 'works' : 'partly works') : 'Touch controls'} \u00B7 made on engine r1</small></div>` : ''}</div>`;
    }).join('');
    return topbar() + `<div class="m-top" style="padding-top:0"><h2>Reports</h2></div><div class="m-body">${h}<p class="m-fine">Invented games and numbers. In the app these come from real players.</p></div>`;
  }

  function settingsView() {
    const row = (ico, t, sub, act, v) => `<button class="m-row" data-a="${act}" data-v="${v}"><span class="m-ico">${ico}</span><span class="t"><b>${t}</b><small>${sub}</small></span><span class="go">\u203A</span></button>`;
    const cur = T ? (T.presets.find((p) => p.id === T.current()) || { name: 'Custom' }).name : 'Porthole';
    return topbar() + `<div class="m-top" style="padding-top:0"><h2>Settings</h2></div><div class="m-body"><div class="m-group">
      ${row('\u2728', 'Appearance', cur + ' \u00B7 changes this whole website', 'go', 'set-theme')}${row('\uD83D\uDC64', 'Accounts', ORDER.filter((s) => S.signed[s]).length + ' of 4 stores signed in', 'go', 'set-accounts')}
      ${row('\uD83D\uDCBE', 'Storage', 'What is using space', 'go', 'set-storage')}${row('\u2713', 'Updates', 'Signed by the maintainer \u00B7 up to date', 'toast', 'Updates are checked against the maintainer\u2019s signature before they are installed.')}
      ${row('\uD83D\uDCDD', 'Report a problem', 'Read it before it goes anywhere', 'go', 'set-report')}${row('\u21BB', 'Run setup again', 'The four-page guide', 'sheet', 'setup')}</div>
      <p class="m-fine">A demo of the layout. The real app has more pages.</p></div>`;
  }
  function themeView() {
    const cur = T ? T.current() : 'default';
    const sw = T ? T.presets.map((p) => `<button aria-pressed="${p.id === cur}" data-a="theme" data-v="${p.id}" style="--c0:${p.bg};--c1:${p.accent};--c2:${p.accent2}"><i></i>${p.name}</button>`).join('') : '';
    return topbar('Appearance', true) + `<div class="m-body"><p class="m-fine" style="margin-top:0"><b style="color:var(--accent)">This changes the whole website.</b> Pick one and look around: the page, the buttons and the porthole all follow, and it is remembered on this device.</p>
      <div class="m-sw">${sw}<button aria-pressed="${cur === 'custom'}" data-a="none"><input type="color" id="m-color" value="${T ? T.customHex() : '#22D6EA'}" aria-label="Pick your own colour">Custom</button></div>
      <p class="m-fine">The same six themes as the app, and a colour of your own.${T && cur !== 'default' ? '' : ''}</p>${cur !== 'default' ? '<button class="m-pill" data-a="theme" data-v="default">Back to the original</button>' : ''}</div>`;
  }
  function accountsView() {
    return topbar('Accounts', true) + `<div class="m-body"><div class="m-group">${ORDER.map((s) => `<div class="m-row">${storeTile(s, true)}<span class="t"><b>${STORES[s].name}</b><small>${S.signed[s] ? 'Signed in \u00B7 token in the Keychain' : 'Not signed in'}</small></span><button class="m-pill" data-a="${S.signed[s] ? 'signout' : 'signin'}" data-v="${s}">${S.signed[s] ? 'Sign out' : 'Sign in'}</button></div>`).join('')}</div>
      <p class="m-fine">Passwords are never kept: Epic and GOG are typed on the store's own page, Steam's is encrypted and forgotten, itch.io uses a key you make. Demo: nothing is sent.</p></div>`;
  }
  function storageView() {
    const used = installed().reduce((a, g) => a + g.gb, 0) + 38.4, total = 128;
    return topbar('Storage', true) + `<div class="m-body"><div class="m-card" style="padding:14px"><b>${used.toFixed(1)} GB of ${total} GB used</b><div class="m-bar" style="margin-top:8px"><i style="width:${used / total * 100}%"></i></div></div>
      <div class="m-h">Games, biggest first</div><div class="m-group">${installed().sort((a, b) => b.gb - a.gb).map((g) => `<div class="m-row">${storeTile(g.s)}<span class="t"><b>${esc(g.n)}</b><small>${size(g.gb)}</small></span><button class="m-pill danger" data-a="remove" data-v="${g.id}">Remove</button></div>`).join('') || '<div class="m-row"><span class="t">No games installed</span></div>'}</div></div>`;
  }
  function reportView() {
    return topbar('Report a problem', true) + `<div class="m-body"><p class="m-fine" style="margin-top:0">Describe what went wrong, then read exactly what would be shared. The log is cleaned first: <mark style="background:color-mix(in srgb,var(--accent) 30%,transparent);color:inherit">highlighted</mark> parts show what was removed.</p>
      <pre class="m-pre">[app] Porthole 0.50.289 (385), engine 48f9764-r1
[steam] signed in as <mark>&lt;account&gt;</mark>
[run] C:\\Games\\Lanternfall.exe on the Wine desktop
[net] connect <mark>&lt;ip&gt;</mark> ok, refresh_token=<mark>&lt;redacted&gt;</mark>
[files] /var/mobile/Containers/Data/Application/<mark>&lt;id&gt;</mark>/Documents
[mem-alert] swap is almost full</pre><button class="m-btn" style="margin-top:10px;opacity:.55" disabled>Send it (off in the demo)</button><p class="m-fine">In the app you can also save the report as a file and share it yourself.</p></div>`;
  }

  const SETUP = [
    () => `<div style="text-align:center;padding:10px 0 4px"><div style="font-size:42px">\u2693</div><h2 style="margin:6px 0">Welcome to Porthole</h2><p class="m-fine">Three quick steps. Stop any time.</p></div><div class="m-group"><div class="m-row"><span class="m-ico">\u26A1</span><span class="t"><b>Full speed</b><small>About 2 minutes</small></span></div><div class="m-row"><span class="m-ico">\u25A3</span><span class="t"><b>Windows components</b><small>About 25 MB</small></span></div><div class="m-row"><span class="m-ico">\u25B6</span><span class="t"><b>Add your games</b><small>Steam, Epic, GOG, itch.io or Files</small></span></div></div><p class="m-fine">\uD83D\uDD12 Your store sign-ins stay in this device's Keychain. Nothing is sent unless you choose to send a report.</p>`,
    () => `<h2 style="margin:0 0 6px">Get ready to play</h2><p class="m-fine" style="margin-top:0">iOS keeps a speed feature called JIT switched off. Porthole switches it on with a pairing file.</p><div class="m-group"><div class="m-row"><span class="m-ico">${S.paired ? '\u2713' : '\u25CB'}</span><span class="t"><b>${S.paired ? 'Pairing file ready' : 'Pairing file needed'}</b><small>${S.paired ? 'Done' : 'About a minute, no computer (iOS 27+)'}</small></span>${S.paired ? '' : '<button class="m-btn small" data-a="pair">Create it</button>'}</div></div><p class="m-fine">Demo: no file is made.</p>`,
    () => `<h2 style="margin:0 0 6px">Windows components</h2><p class="m-fine" style="margin-top:0">Many games need Microsoft's runtime. Porthole downloads it from Microsoft and checks it.</p><div class="m-card" style="padding:12px"><b>${S.vcr >= 100 ? 'Ready' : S.vcr ? 'Downloading\u2026 ' + S.vcr + '%' : 'About 25 MB'}</b><div class="m-bar" style="margin:8px 0"><i style="width:${S.vcr}%"></i></div>${S.vcr ? '' : '<button class="m-btn small" data-a="vcr">Download</button>'}</div>`,
    () => `<h2 style="margin:0 0 6px">Add your games</h2><p class="m-fine" style="margin-top:0">Sign in to any of the four stores, or import from Files. You can do this later.</p><div class="m-group">${ORDER.map((s) => `<div class="m-row">${storeTile(s, true)}<span class="t"><b>${STORES[s].name}</b><small>${S.signed[s] ? 'Signed in' : 'Optional'}</small></span><button class="m-pill" data-a="${S.signed[s] ? 'signout' : 'signin'}" data-v="${s}">${S.signed[s] ? 'Sign out' : 'Sign in'}</button></div>`).join('')}</div>`,
    () => `<h2 style="margin:0 0 6px">Good to know</h2><div class="m-group"><div class="m-row"><span class="m-ico">\u231B</span><span class="t"><b>The first start takes longer</b><small>Later starts are quicker.</small></span></div><div class="m-row"><span class="m-ico">\u25A6</span><span class="t"><b>Big games may need Swap</b><small>If a game closes or stutters, give it more.</small></span></div><div class="m-row"><span class="m-ico">\u25CE</span><span class="t"><b>Controllers work out of the box</b><small>PlayStation, Xbox and more.</small></span></div><div class="m-row"><span class="m-ico">\u26A1</span><span class="t"><b>Performance mode: up to 120 FPS</b><small>On ProMotion screens.</small></span></div></div>`,
    () => `<div style="text-align:center;padding:24px 0"><div style="font-size:48px;color:var(--good)">\u2713</div><h2 style="margin:6px 0">You're all set</h2><p class="m-fine">Press Play on a game to try the real thing.</p></div>`
  ];
  function setupSheet() {
    const last = S.setup === SETUP.length - 1;
    return `<div class="m-sheet"><div class="m-top"><h2 style="flex:1">${S.setup && !last ? 'Step ' + Math.min(S.setup, 3) + ' of 3' : 'Setup'}</h2><button class="m-pill" data-a="sheet" data-v="">${last ? 'Close' : 'Finish later'}</button></div><div class="m-body">${SETUP[S.setup]()}</div>
      <div style="display:flex;gap:8px;padding:10px 14px 18px">${S.setup ? '<button class="m-pill" data-a="setupgo" data-v="-1">Back</button>' : ''}<button class="m-btn" style="flex:1;justify-content:center" data-a="setupgo" data-v="${last ? 'done' : 1}">${last ? 'Start playing' : S.setup === 0 ? 'Let\u2019s start' : 'Continue'}</button></div></div>`;
  }

  // ---- In a game
  function playView() {
    const g = byId(S.play);
    const sticks = S.playControls ? `<div class="c stick" style="left:20%;top:76%"><i></i></div><div class="c btn" data-k="Space" style="left:84%;top:80%">Space</div><div class="c btn" data-k="E" style="left:72%;top:66%">E</div><div class="c btn" data-k="Shift" style="left:90%;top:62%">Shift</div>` : '';
    return `<div class="m-play" style="--h:${g.h}"><div class="stats" id="m-stats">${statsText(g)}</div>
      <div class="menu"><button data-a="pplay">Power: ${S.playPower === 'performance' ? 'Performance' : S.playPower === 'saver' ? 'Saver' : 'Balanced'}</button><button data-a="pctl">Controls: ${S.playControls ? 'on' : 'off'}</button><button data-a="pmem">Low-memory demo</button></div>${sticks}
      <button class="quit" data-a="quit">\u2715 End game</button></div>`;
  }
  function statsText(g) {
    const cap = S.playPower === 'performance' ? Math.min(120, Math.round(g.fps * 1.7)) : S.playPower === 'saver' ? Math.min(30, g.fps) : g.fps;
    const fps = Math.max(8, Math.round(cap * (0.94 + Math.random() * 0.06))), cpu = 34 + Math.round(Math.random() * 18);
    return `${fps} fps | ${cpu}% cpu\n${(2.9 + Math.random() * 0.4).toFixed(1)} GB | ${S.playPower === 'performance' ? 'warm' : 'cool'}`;
  }

  // ---- Rendering
  function render() {
    const prev = screen.querySelector('.m-body'), key = viewKey(), keep = prev && S.lastKey === key ? prev.scrollTop : 0;
    if (S.play) { screen.innerHTML = `<div class="m-status"><span>9:41</span><i>\u25CF\u25CF\u25CF</i></div>` + playView() + (S.launch ? launchHTML() : ''); S.lastKey = key; return; }
    const v = S.view; let body;
    switch (v.n) {
      case 'home': body = homeView(); break;
      case 'game': body = gameView(v.id); break;
      case 'stores': body = storesHome(); break;
      case 'store': body = storeView(v.id); break;
      case 'downloads': body = downloadsView(); break;
      case 'reports': body = reportsView(); break;
      case 'settings': body = settingsView(); break;
      case 'set-theme': body = themeView(); break;
      case 'set-accounts': body = accountsView(); break;
      case 'set-storage': body = storageView(); break;
      case 'set-report': body = reportView(); break;
      default: body = homeView();
    }
    const tabs = [['home', 'Home'], ['stores', 'Stores'], ['reports', 'Reports'], ['settings', 'Settings']];
    screen.innerHTML = `<div class="m-status"><span>9:41</span><i>\u25CF\u25CF\u25CF</i></div>${body}<nav class="m-tabs" aria-label="Porthole tabs">${tabs.map((t) => `<button aria-current="${S.tab === t[0]}" data-a="tab" data-v="${t[0]}">${svg(I[t[0]])}${t[1]}</button>`).join('')}</nav>${fab()}${S.sheet === 'setup' ? setupSheet() : ''}${S.launch ? launchHTML() : ''}`;
    const nb = screen.querySelector('.m-body'); if (nb) nb.scrollTop = keep;
    S.lastKey = key; refreshDl();
  }
  const launchHTML = () => `<div class="m-launch"><div class="m-spin"></div><b style="font-size:17px">${esc(S.launch.text)}</b><small class="m-fine">Porthole switches JIT on, then starts ${esc(byId(S.launch.id).n)}.</small><button class="m-pill" data-a="cancelplay">Cancel</button></div>`;
  let toastTimer;
  function toast(msg) {
    const old = screen.querySelector('.m-toast'); if (old) old.remove();
    const t = document.createElement('div'); t.className = 'm-toast'; t.textContent = msg; screen.appendChild(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 3200);
  }

  // ---- Actions
  function play(id) {
    S.launch = { id, text: 'Turning on JIT\u2026' }; S.sel = id; render();
    const mine = S.launch;
    setTimeout(() => { if (S.launch === mine) { mine.text = 'Opening the private link\u2026'; render(); } }, 800);
    setTimeout(() => { if (S.launch === mine) { mine.text = 'Starting ' + byId(id).n + '\u2026'; render(); } }, 1600);
    setTimeout(() => { if (S.launch === mine) { S.launch = null; S.play = id; S.playPower = S.pw[id] || 'balanced'; S.playControls = true; render(); } }, 2500);
  }
  const A = {
    tab: (v) => tab(v),
    go: (v) => { if (v === 'downloads') { S.tab = 'stores'; go({ n: 'downloads' }); } else if (v.startsWith('store:')) { S.tab = 'stores'; S.q = ''; S.view.n === 'store' ? (S.view = { n: 'store', id: v.slice(6) }, render()) : go({ n: 'store', id: v.slice(6) }); } else { if (v.startsWith('set-')) S.tab = 'settings'; go({ n: v }); } },
    back: () => back(), sel: (v) => { S.sel = v; render(); }, open: (v) => go({ n: 'game', id: v }),
    play: (v) => play(v), cancelplay: () => { S.launch = null; render(); },
    install: (v) => install(v), dlpause: (v) => { S.dl[v].st = 'paused'; render(); }, dlresume: (v) => { S.dl[v].st = 'queued'; S.order = S.order.filter((x) => x !== v).concat(v); tick(0.01); render(); },
    dlcancel: (v) => cancel(v), dlnow: (v) => startNow(v),
    pauseall: () => { Object.keys(S.dl).forEach((id) => { S.dl[id].st = 'paused'; }); render(); }, resumeall: () => { Object.keys(S.dl).forEach((id) => { if (S.dl[id].st === 'paused') S.dl[id].st = 'queued'; }); tick(0.01); render(); },
    door: (v) => { S.door = S.door === v ? null : v; render(); },
    pw: (v) => { S.pw[S.view.id] = v; render(); }, sw: (v) => { S.sw[S.view.id] = v; render(); },
    direct: () => { S.direct[S.view.id] = !S.direct[S.view.id]; render(); }, hidePad: () => { S.hidePad = !S.hidePad; render(); }, kbm: () => { S.kbm = !S.kbm; render(); }, hid: () => { S.hid = !S.hid; render(); },
    layout: (v) => { S.layout[S.view.id] = v; render(); },
    apply: () => { const id = S.view.id; S.undo[id] = { pw: S.pw[id], sw: S.sw[id] }; S.pw[id] = 'performance'; S.sw[id] = '4g'; render(); toast('Applied. You can undo it.'); },
    undo: () => { const id = S.view.id, u = S.undo[id]; if (u) { S.pw[id] = u.pw; S.sw[id] = u.sw; delete S.undo[id]; render(); } },
    remove: (v) => { delete S.inst[v]; if (S.view.n === 'game') S.view = { n: 'home' }, S.hist = []; render(); toast(byId(v).n + ' was removed.'); },
    filter: (v) => { S.filter = v; render(); }, dev: (v) => { S.dev = v; render(); }, rep: (v) => { S.openReport = S.openReport === v ? null : v; render(); },
    signin: (v) => { S.signed[v] = true; render(); toast('Signed in to ' + STORES[v].name + ' (demo: nothing was sent).'); },
    signout: (v) => { S.signed[v] = false; render(); },
    sheet: (v) => { S.sheet = v || null; if (v === 'setup') S.setup = 0; render(); }, toast: (v) => toast(v),
    setupgo: (v) => { if (v === 'done') { S.sheet = null; S.setupDone = true; render(); return; } S.setup = Math.max(0, Math.min(SETUP.length - 1, S.setup + Number(v))); render(); },
    pair: () => { S.paired = true; render(); }, vcr: () => { S.vcr = 1; const t = setInterval(() => { S.vcr = Math.min(100, S.vcr + 12); if (S.sheet === 'setup') render(); if (S.vcr >= 100) clearInterval(t); }, 250); render(); },
    theme: (v) => { if (!T) return; T.set(v); const p = T.presets.find((x) => x.id === v); render(); toast((p ? p.name : 'Theme') + ': the whole website just changed.'); },
    pplay: () => { S.playPower = S.playPower === 'balanced' ? 'performance' : S.playPower === 'performance' ? 'saver' : 'balanced'; render(); },
    pctl: () => { S.playControls = !S.playControls; render(); },
    pmem: () => { const el = document.createElement('div'); el.className = 'warn'; el.textContent = 'Memory is almost full. Close other apps, or raise Swap in this game\u2019s settings.'; screen.querySelector('.m-play').appendChild(el); setTimeout(() => el.remove(), 7000); },
    quit: () => { S.play = null; S.view = { n: 'home' }; S.tab = 'home'; S.hist = []; render(); }, none: () => {}
  };
  screen.addEventListener('click', (e) => {
    const t = e.target.closest('[data-a]'); if (!t || !screen.contains(t)) return;
    const f = A[t.dataset.a]; if (f) f(t.dataset.v);
  });
  screen.addEventListener('input', (e) => {
    if (e.target.id === 'm-q') { S.q = e.target.value; const g = screen.querySelector('#m-grid'); if (g) g.innerHTML = gridHTML(S.view.id); }
    if (e.target.id === 'm-color' && T) { T.custom(e.target.value); }
  });
  // The stick and the buttons in a game
  screen.addEventListener('pointerdown', (e) => {
    const c = e.target.closest('.m-play .c'); if (!c) return;
    e.preventDefault(); c.setPointerCapture(e.pointerId);
    if (c.classList.contains('stick')) {
      const r = c.getBoundingClientRect(), R = r.width / 2 - 6, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const move = (ev) => { const dx = ev.clientX - cx, dy = ev.clientY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, R / d); c.style.setProperty('--kx', dx * k + 'px'); c.style.setProperty('--ky', dy * k + 'px'); };
      const up = () => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); c.style.setProperty('--kx', '0px'); c.style.setProperty('--ky', '0px'); };
      c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up); move(e);
    } else {
      c.classList.add('down'); const up = () => { c.classList.remove('down'); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    }
  });

  // One clock: the pretend downloads and the stats in a game
  let last = performance.now();
  setInterval(() => {
    const now = performance.now(), dt = Math.min(1, (now - last) / 1000); last = now;
    const sig = () => Object.keys(S.dl).map((id) => id + S.dl[id].st).join() + '|' + Object.keys(S.inst).join();
    const before = sig();
    tick(dt);
    const changed = sig() !== before;
    if (S.play) { const el = screen.querySelector('#m-stats'); if (el) el.textContent = statsText(byId(S.play)); return; }
    if (changed && document.activeElement && document.activeElement.id === 'm-q') { const g = screen.querySelector('#m-grid'); if (g) g.innerHTML = gridHTML(S.view.id); }
    else if (changed) render();
    refreshDl();
  }, 500);
  if (T) T.onChange(() => { if (document.activeElement && document.activeElement.id === 'm-color') return; if (S.view.n === 'set-theme' || S.view.n === 'settings') render(); });
  render();
})();
