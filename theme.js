// Themes for the whole site. The presets are Porthole's own (the app's Settings has the same six, plus a custom colour); the CSS for them is in style.css.
// The choice is remembered in this browser only (localStorage), is applied before a page paints by the small snippet in each page's <head>, and nothing is sent anywhere.
(function () {
  'use strict';
  var PRESETS = [
    { id: 'default', name: 'Porthole', bg: '#04121A', bg2: '#08202E', accent: '#22D6EA', accent2: '#14C9A6' },
    { id: 'deepsea', name: 'Deep Sea', bg: '#0B121B', bg2: '#1B2838', accent: '#4CB8F5', accent2: '#7A6CFF' },
    { id: 'aurora', name: 'Aurora', bg: '#050F12', bg2: '#0A1D1C', accent: '#3DDC97', accent2: '#4CC9F0' },
    { id: 'sunset', name: 'Sunset', bg: '#120A18', bg2: '#25122B', accent: '#FF8A5B', accent2: '#FF4D8D' },
    { id: 'ember', name: 'Ember', bg: '#130909', bg2: '#2A1210', accent: '#FF5A4F', accent2: '#FFB020' },
    { id: 'orchid', name: 'Orchid', bg: '#0D0817', bg2: '#1D1233', accent: '#C77DFF', accent2: '#5AC8FA' },
    { id: 'graphite', name: 'Graphite', bg: '#0B0C0F', bg2: '#1B1D22', accent: '#E5E7EB', accent2: '#8B93A1' }
  ];
  var root = document.documentElement, listeners = [];
  var VARS = ['--bg', '--bg2', '--accent', '--accent2', '--hue', '--sat'];

  function save(key, value) { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (e) { /* private mode: it just won't be remembered */ } }
  function clearInline() { VARS.forEach(function (v) { root.style.removeProperty(v); }); }
  function meta() {
    var m = document.querySelector('meta[name="theme-color"]'); if (!m) return;
    var c = getComputedStyle(root).getPropertyValue('--bg').trim(); if (c) m.setAttribute('content', c);
  }
  function fire() { listeners.forEach(function (f) { f(current()); }); }
  function current() { return root.dataset.theme || 'default'; }

  // The same maths as the app's custom colour: a dark background of the same hue, and a second accent a little further round the colour wheel.
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function toHsb(hex) {
    var c = rgb(hex).map(function (v) { return v / 255; }), mx = Math.max.apply(null, c), mn = Math.min.apply(null, c), d = mx - mn, h = 0;
    if (d) { if (mx === c[0]) h = ((c[1] - c[2]) / d) % 6; else if (mx === c[1]) h = (c[2] - c[0]) / d + 2; else h = (c[0] - c[1]) / d + 4; h /= 6; if (h < 0) h += 1; }
    return { h: h, s: mx ? d / mx : 0, b: mx };
  }
  function hexOf(h, s, b) {
    h = ((h % 1) + 1) % 1;
    var i = Math.floor(h * 6), f = h * 6 - i, p = b * (1 - s), q = b * (1 - f * s), t = b * (1 - (1 - f) * s), r, g, bl;
    switch (i % 6) { case 0: r = b; g = t; bl = p; break; case 1: r = q; g = b; bl = p; break; case 2: r = p; g = b; bl = t; break; case 3: r = p; g = q; bl = b; break; case 4: r = t; g = p; bl = b; break; default: r = b; g = p; bl = q; }
    return '#' + [r, g, bl].map(function (v) { return ('0' + Math.round(v * 255).toString(16)).slice(-2); }).join('');
  }
  function custom(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    var a = toHsb(hex), vars = {
      '--bg2': hexOf(a.h, Math.min(0.55, Math.max(a.s, 0.25)), 0.19),
      '--bg': hexOf(a.h, Math.min(0.6, Math.max(a.s, 0.25)), 0.09),
      '--accent': hex,
      '--accent2': hexOf(a.h + 0.09, Math.min(Math.max(a.s, 0.45), 0.9), Math.max(a.b, 0.85)),
      '--hue': Math.round(a.h * 360 - 187) + 'deg', '--sat': a.s < 0.12 ? '0' : '1'
    };
    root.dataset.theme = 'custom';
    Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
    save('porthole-theme', 'custom'); save('porthole-custom', JSON.stringify(vars));
    meta(); fire();
  }
  function set(id) {
    if (id === 'custom') { var saved = null; try { saved = JSON.parse(localStorage.getItem('porthole-custom')); } catch (e) {} if (saved && saved['--accent']) custom(saved['--accent']); return; }
    clearInline();
    if (!id || id === 'default') { delete root.dataset.theme; save('porthole-theme', null); }
    else { root.dataset.theme = id; save('porthole-theme', id); }
    meta(); setTimeout(meta, 750); fire();
  }

  window.PortholeTheme = {
    presets: PRESETS, current: current, set: set, custom: custom,
    customHex: function () { try { var c = JSON.parse(localStorage.getItem('porthole-custom')); return c && c['--accent'] || '#22D6EA'; } catch (e) { return '#22D6EA'; } },
    onChange: function (f) { listeners.push(f); }
  };
  meta();
})();
