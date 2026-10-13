// A small copy of Porthole's on-screen controls editor, for the home page. Play mode: use the stick and the buttons. Edit mode: drag a control (it snaps to guides),
// add more from the tray, delete, undo and redo. Arrow keys move the selected control (Shift = bigger steps). Nothing here is saved or sent anywhere.
(function () {
  'use strict';
  var screen = document.getElementById('ed-screen');
  if (!screen) return;
  var $ = function (id) { return document.getElementById(id); };
  var bModes = $('ed-mode'), bAdd = $('ed-add'), bUndo = $('ed-undo'), bRedo = $('ed-redo'), bDel = $('ed-del'), bReset = $('ed-reset');
  var tray = $('ed-tray'), status = $('ed-status');
  var MAX = 14, SNAP = 1.8;

  var INITIAL = [
    { t: 'stick', l: 'Move', x: 15, y: 70 },
    { t: 'btn', l: 'Space', x: 88, y: 76 },
    { t: 'btn', l: 'E', x: 71, y: 52 },
    { t: 'btn', l: 'Shift', x: 92, y: 42 },
    { t: 'sw', l: 'Look', x: 50, y: 12, on: false }
  ];
  var nextId = 1, list = [], selected = null, editing = false;
  var undo = [], redo = [];
  var els = {};
  var guideV = document.createElement('div'), guideH = document.createElement('div');
  guideV.className = 'ed-guide v'; guideH.className = 'ed-guide h';
  screen.appendChild(guideV); screen.appendChild(guideH);

  function fresh() { return INITIAL.map(function (c) { var n = JSON.parse(JSON.stringify(c)); n.id = nextId++; return n; }); }
  function snapshot() { return JSON.stringify(list); }
  function restore(text) { list = JSON.parse(text); if (!list.some(function (c) { return c.id === selected; })) selected = null; sync(); }
  function remember(before) { undo.push(before); if (undo.length > 60) undo.shift(); redo = []; buttons(); }
  function say(html) { status.innerHTML = html; }
  function find(id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  function sync() {
    Object.keys(els).forEach(function (k) { if (!find(+k)) { els[k].remove(); delete els[k]; } });
    list.forEach(function (c) {
      var el = els[c.id];
      if (!el) {
        el = document.createElement('div');
        el.className = 'ed-ctl ' + c.t; el.tabIndex = 0; el.setAttribute('role', 'button'); el.dataset.id = c.id;
        el.innerHTML = c.t === 'stick' ? '<i></i>' : '';
        if (c.t !== 'stick') el.textContent = c.l;
        screen.appendChild(el); els[c.id] = el; wire(el);
      }
      el.style.left = c.x + '%'; el.style.top = c.y + '%';
      el.classList.toggle('sel', editing && c.id === selected);
      el.setAttribute('aria-label', (c.t === 'stick' ? 'Movement stick' : c.t === 'sw' ? 'Look and mouse switch' : 'Button ' + c.l));
      if (c.t === 'sw') el.textContent = c.on ? 'Mouse' : 'Look';
    });
    buttons();
  }
  function buttons() {
    bUndo.disabled = !undo.length; bRedo.disabled = !redo.length; bDel.disabled = !(editing && selected);
    bAdd.disabled = !editing || list.length >= MAX;
  }

  // ---- Edit mode: dragging with guides
  function guides(c) {
    var xs = [50], ys = [50];
    list.forEach(function (o) { if (o.id !== c.id) { xs.push(o.x); ys.push(o.y); } });
    return { xs: xs, ys: ys };
  }
  function nearest(v, lines) {
    var best = null;
    lines.forEach(function (l) { if (Math.abs(l - v) < SNAP && (best === null || Math.abs(l - v) < Math.abs(best - v))) best = l; });
    return best;
  }
  function drag(el, c, e) {
    var rect = screen.getBoundingClientRect(), box = el.getBoundingClientRect();
    var offX = e.clientX - (box.left + box.width / 2), offY = e.clientY - (box.top + box.height / 2);
    var before = snapshot(), moved = false;
    el.setPointerCapture(e.pointerId);
    function move(ev) {
      var x = (ev.clientX - offX - rect.left) / rect.width * 100, y = (ev.clientY - offY - rect.top) / rect.height * 100;
      x = Math.min(96, Math.max(4, x)); y = Math.min(94, Math.max(6, y));
      var g = guides(c), sx = nearest(x, g.xs), sy = nearest(y, g.ys);
      if (sx !== null) x = sx; if (sy !== null) y = sy;
      guideV.style.display = sx !== null ? 'block' : 'none'; guideV.style.left = (sx !== null ? sx : 0) + '%';
      guideH.style.display = sy !== null ? 'block' : 'none'; guideH.style.top = (sy !== null ? sy : 0) + '%';
      if (Math.abs(x - c.x) > 0.05 || Math.abs(y - c.y) > 0.05) moved = true;
      c.x = +x.toFixed(2); c.y = +y.toFixed(2); sync();
    }
    function up() {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      guideV.style.display = guideH.style.display = 'none';
      if (moved) remember(before);
    }
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }

  // ---- Play mode: the stick and the buttons
  function playStick(el, c, e) {
    var rect = el.getBoundingClientRect(), r = rect.width / 2 - 8, cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    el.setPointerCapture(e.pointerId);
    function move(ev) {
      var dx = ev.clientX - cx, dy = ev.clientY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, r / d);
      var kx = dx * k, ky = dy * k;
      el.style.setProperty('--kx', kx + 'px'); el.style.setProperty('--ky', ky + 'px');
      var keys = [];
      if (ky < -r * 0.35) keys.push('W'); if (ky > r * 0.35) keys.push('S'); if (kx < -r * 0.35) keys.push('A'); if (kx > r * 0.35) keys.push('D');
      say(keys.length ? 'Sending: <b>' + keys.join(' + ') + '</b>' : 'Stick centred: not sending anything');
    }
    function up() {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.style.setProperty('--kx', '0px'); el.style.setProperty('--ky', '0px'); say('Play mode: use the stick and the buttons.');
    }
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); move(e);
  }
  function playButton(el, c, e) {
    el.setPointerCapture(e.pointerId);
    if (c.t === 'sw') { c.on = !c.on; sync(); say(c.on ? 'Mouse mode: touching the screen moves the pointer.' : 'Look mode: dragging the screen turns the camera.'); return; }
    el.classList.add('down'); say('Sending: <b>' + c.l + '</b> (held while you press)');
    function up() { el.classList.remove('down'); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); say('Play mode: use the stick and the buttons.'); }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }

  function wire(el) {
    el.addEventListener('pointerdown', function (e) {
      var c = find(+el.dataset.id); if (!c) return;
      e.preventDefault();
      if (editing) { selected = c.id; sync(); drag(el, c, e); }
      else if (c.t === 'stick') playStick(el, c, e); else playButton(el, c, e);
    });
    el.addEventListener('keydown', function (e) {
      var c = find(+el.dataset.id); if (!c) return;
      if (editing) {
        var step = e.shiftKey ? 5 : 1, dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -step; if (e.key === 'ArrowRight') dx = step; if (e.key === 'ArrowUp') dy = -step; if (e.key === 'ArrowDown') dy = step;
        if (dx || dy) { e.preventDefault(); selected = c.id; var before = snapshot(); c.x = Math.min(96, Math.max(4, c.x + dx)); c.y = Math.min(94, Math.max(6, c.y + dy)); remember(before); sync(); }
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); selected = c.id; del(); }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (c.t === 'sw') { c.on = !c.on; sync(); } else { say('Sending: <b>' + (c.t === 'stick' ? 'W' : c.l) + '</b>'); }
      }
    });
  }

  // ---- The bar
  function setEditing(on) {
    editing = on; screen.classList.toggle('editing', on);
    bModes.textContent = on ? 'Done' : 'Edit'; bModes.classList.toggle('primary', !on);
    if (!on) { selected = null; tray.classList.remove('open'); bAdd.setAttribute('aria-expanded', 'false'); }
    say(on ? 'Edit mode: drag a control. A line appears when it lines up with the centre or another control.' : 'Play mode: use the stick and the buttons.');
    sync();
  }
  function del() {
    var c = selected && find(selected); if (!c) return;
    var before = snapshot(); list = list.filter(function (o) { return o.id !== c.id; }); selected = null; remember(before); sync();
  }
  bModes.addEventListener('click', function () { setEditing(!editing); });
  bAdd.addEventListener('click', function () { var open = !tray.classList.contains('open'); tray.classList.toggle('open', open); bAdd.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  tray.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || list.length >= MAX) return;
    var before = snapshot(), c = { id: nextId++, t: b.dataset.type, l: b.dataset.label, x: 50 + (Math.random() * 16 - 8), y: 45 + (Math.random() * 12 - 6), on: false };
    c.x = +c.x.toFixed(1); c.y = +c.y.toFixed(1);
    list.push(c); selected = c.id; remember(before); sync(); say('Added <b>' + c.l + '</b>. Drag it where you want it.');
  });
  bUndo.addEventListener('click', function () { if (!undo.length) return; redo.push(snapshot()); restore(undo.pop()); });
  bRedo.addEventListener('click', function () { if (!redo.length) return; undo.push(snapshot()); restore(redo.pop()); });
  bDel.addEventListener('click', del);
  bReset.addEventListener('click', function () { var before = snapshot(); list = fresh(); selected = null; remember(before); sync(); say('Put back the way it started.'); });

  list = fresh(); setEditing(false); sync();
})();
