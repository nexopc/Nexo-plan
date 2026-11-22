/* NEXO PLAN — Agenda: entregas + citas fijas + pendientes flexibles */
(function () {
  'use strict';
  const X = window.NP; const $ = X.$, esc = X.esc;
  const A = () => X.S.asis;
  const opt = (k, d) => (A()[k] != null ? A()[k] : d);
  let agDay = 0, agFilter = 'todo';

  // ---------- datos ----------
  const items = () => X.S.agenda;
  const byId = (id) => items().find((x) => x.id === id);
  const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const placeOf = (id) => X.S.places.find((p) => p.id === id) || null;
  const DUR_DEF = 30;

  // intervalos ocupados de un día (citas y pendientes ya agendados)
  function busyOn(di, exceptId) {
    const out = [];
    items().forEach((x) => {
      if (x.id === exceptId || x.done) return;
      if (x.kind === 'cita' && X.iso(new Date(x.start)) === di) out.push([x.start, x.end]);
      if (x.kind === 'flex' && x.slot && X.iso(new Date(x.slot)) === di) out.push([x.slot, x.slot + (x.dur || DUR_DEF) * 60000]);
    });
    return out;
  }
  const flexCountOn = (di, exceptId) => items().filter((x) => x.kind === 'flex' && !x.done && x.slot && x.id !== exceptId && X.iso(new Date(x.slot)) === di).length;

  // bloques que chocan con un intervalo
  function conflicts(start, end) {
    const d = new Date(start); d.setHours(0, 0, 0, 0);
    const out = [];
    X.blocksOf(d).forEach((b) => {
      if (['libre', 'rutina', 'ocupado'].includes(b.cat) && b.cat !== 'ocupado') return;
      const bs = X.atTime(d, b.s), be = X.atTime(d, b.e);
      if (start < be && end > bs) out.push(b);
    });
    return out;
  }

  // ---------- buscador de huecos ----------
  // tipo: 'colegio' (puede usar Tareas del colegio), 'vuelta' (puede usar traslados si tiene sitio), 'general'
  function findSlots(dur, deadline, o) {
    o = o || {};
    const now = Date.now(); const margin = opt('margen', 10) * 60000; const maxFlex = opt('maxFlex', 2);
    const res = []; const need = dur * 60000;
    const lastDay = Math.min(deadline || now + 14 * X.DAY, now + 21 * X.DAY);
    for (let k = 0; k < 22 && res.length < (o.count || 2); k++) {
      const d = X.addDays(X.today(), k); const di = X.iso(d);
      if (d.getTime() > lastDay) break;
      if (X.tripOf(di)) continue;
      if (flexCountOn(di, o.except) >= maxFlex) continue;
      const busy = busyOn(di, o.except);
      const cands = X.blocksOf(d).filter((b) => {
        if (X.pausa(b, d)) return false;
        if (b.cat === 'libre') return true;
        if (b.cat === 'tareas' && o.tipo === 'colegio') return true;
        if (b.cat === 'rutina' && /^traslado$/i.test(b.title) && o.tipo === 'vuelta') return true;
        return false;
      }).sort((a, b) => (a.cat === 'libre' ? 0 : 1) - (b.cat === 'libre' ? 0 : 1) || X.mins(a.s) - X.mins(b.s));
      for (const b of cands) {
        let s0 = X.atTime(d, b.s), e0 = X.atTime(d, b.e);
        if (o.place && o.place.hours) { const H = o.place.hours; if (H.days && !H.days.includes(X.dow(d))) continue; s0 = Math.max(s0, X.atTime(d, H.from || '00:00')); e0 = Math.min(e0, X.atTime(d, H.to || '23:59')); if (e0 <= s0) continue; }
        if (s0 < now + margin) s0 = Math.ceil((now + margin) / 300000) * 300000;
        let t = s0;
        // salta lo ocupado
        let moved = true;
        while (moved) { moved = false; busy.forEach(([bs, be]) => { if (t < be + margin && t + need > bs - margin) { t = be + margin; moved = true; } }); }
        if (t + need <= e0 && t + need <= lastDay) { res.push({ at: t, end: t + need, block: b }); break; }
      }
    }
    res.sort((a, b) => a.at - b.at);
    return res.slice(0, o.count || 2);
  }
  // si no hay hueco: proponer un bloque de proyecto que no sea ancla
  function fallbackSlot(dur, deadline) {
    const now = Date.now();
    for (let k = 0; k < 14; k++) {
      const d = X.addDays(X.today(), k); const di = X.iso(d);
      if (X.tripOf(di) || (deadline && d.getTime() > deadline)) break;
      const b = X.blocksOf(d).find((x) => ['agencia', 'nexo', 'video', 'app'].includes(x.cat) && !X.S.anchors[x.id] && X.atTime(d, x.s) > now && (X.mins(x.e) - X.mins(x.s)) >= dur);
      if (b) return { at: X.atTime(d, b.s), end: X.atTime(d, b.s) + dur * 60000, block: b, steal: true };
    }
    return null;
  }

  // ---------- reprogramación automática ----------
  function reprogram() {
    if (!opt('reprog', true)) return [];
    const now = Date.now(); const moved = [];
    items().forEach((x) => {
      if (x.kind !== 'flex' || x.done || !x.slot) return;
      const end = x.slot + (x.dur || DUR_DEF) * 60000;
      if (end + 60 * 60000 > now) return;
      const s = findSlots(x.dur || DUR_DEF, x.deadline, { tipo: x.place ? 'vuelta' : x.tipo, place: placeOf(x.place), except: x.id, count: 1 })[0];
      x.slot = s ? s.at : null; x.moves = (x.moves || 0) + 1;
      moved.push(x);
    });
    if (moved.length) {
      X.save();
      moved.forEach((x) => window.AS && AS.say('reprogramar', '🔄 Reprogramé “' + x.title + '”: ' + (x.slot ? X.fmtWhen(x.slot) + '.' : 'no encontré hueco antes del límite; dale otra fecha.')));
      X.toast('🔄 Reprogramé ' + moved.length + ' pendiente(s) que no alcanzaste');
    }
    return moved;
  }

  // ---------- crear ----------
  function addCita(o) {
    const x = { id: newId('c'), kind: 'cita', title: o.title, start: o.start, end: o.end || o.start + 60 * 60000, place: o.place || null, notes: o.notes || '', done: false, created: Date.now() };
    items().push(x); X.save(); X.scheduleNotifs(); return x;
  }
  function addFlex(o) {
    const x = { id: newId('f'), kind: 'flex', title: o.title, dur: o.dur || DUR_DEF, deadline: o.deadline || null, slot: o.slot || null, place: o.place || null, tipo: o.tipo || 'general', notes: o.notes || '', done: false, created: Date.now() };
    items().push(x); X.save(); X.scheduleNotifs(); return x;
  }
  function setItemDone(id, v) { const x = byId(id); if (!x) return; x.done = v; x.doneAt = v ? Date.now() : null; X.save(); X.scheduleNotifs(); }
  function delItem(id) { X.S.agenda = items().filter((x) => x.id !== id); X.save(); X.scheduleNotifs(); }

  // ---------- lo que hay en un día ----------
  function dayList(d) {
    const di = X.iso(d); const L = [];
    X.S.tasks.forEach((t) => { if (X.iso(new Date(t.due)) === di) L.push({ k: 'entrega', at: t.due, t }); });
    items().forEach((x) => {
      if (x.kind === 'cita' && X.iso(new Date(x.start)) === di) L.push({ k: 'cita', at: x.start, x });
      if (x.kind === 'flex' && x.slot && X.iso(new Date(x.slot)) === di) L.push({ k: 'flex', at: x.slot, x });
    });
    return L.sort((a, b) => a.at - b.at);
  }
  const unscheduled = () => items().filter((x) => x.kind === 'flex' && !x.done && !x.slot);
  const pendingCount = () => items().filter((x) => !x.done && (x.kind === 'flex' || x.start > Date.now())).length;

  // ---------- tarjetas ----------
  function citaCard(x) {
    const c = conflicts(x.start, x.end); const pl = placeOf(x.place);
    return '<div class="ev ' + (x.done ? 'done' : '') + '" style="--c:#e040fb" data-ag="' + x.id + '"><div class="ty">📍 CITA FIJA' + (pl ? ' · ' + esc(pl.name.toUpperCase()) : '') + '</div><div class="tt">' + esc(x.title) + '</div><div class="wh">' + X.h12(X.hhmmOf(x.start)) + ' – ' + X.h12(X.hhmmOf(x.end)) + '</div>' +
      (c.length && !x.done ? '<div class="warn">⚠️ Choca con ' + c.map((b) => esc(b.title) + ' (' + X.h12(b.s) + '–' + X.h12(b.e) + ')').join(', ') + '</div>' : '') + '</div>';
  }
  function flexCard(x) {
    const pl = placeOf(x.place);
    return '<div class="ev ' + (x.done ? 'done' : '') + '" style="--c:#ffab00" data-ag="' + x.id + '"><div class="ty">🔄 FLEXIBLE · ' + (x.dur || DUR_DEF) + ' MIN' + (pl ? ' · ' + esc(pl.name.toUpperCase()) : '') + '</div><div class="tt">' + (x.done ? '✓ ' : '') + esc(x.title) + '</div><div class="wh">' +
      (x.slot ? X.h12(X.hhmmOf(x.slot)) + (x.moves ? ' · reprogramado ' + x.moves + ' vez(ces)' : '') : 'Sin hora') + (x.deadline ? ' · límite ' + X.fmtShort(new Date(x.deadline)) : '') + '</div></div>';
  }

  // ---------- vista ----------
  function render(h) {
    const t0 = X.today();
    // minimapa y ruta (módulo mapa)
    if (window.MAPA) h += MAPA.agendaTop();
    h += '<div class="days7">' + [0, 1, 2, 3, 4, 5, 6].map((k) => {
      const d = X.addDays(t0, k); const n = dayList(d).filter((y) => !(y.t ? y.t.done : y.x.done)).length;
      return '<button class="' + (k === agDay ? 'on' : '') + '" data-dd="' + k + '">' + X.DIAS_S[X.dow(d)].charAt(0) + '<i>' + d.getDate() + '</i><u>' + '•'.repeat(Math.min(n, 4)) + '</u></button>';
    }).join('') + '</div>';
    h += '<div class="chips">' + [['todo', 'Todo'], ['entrega', '📌 Entregas'], ['cita', '📍 Citas'], ['flex', '🔄 Pendientes'], ['hechas', '✓ Hechas']].map(([k, n]) => '<button class="chip ' + (agFilter === k ? 'on' : '') + '" data-af="' + k + '">' + n + '</button>').join('') + '</div>';
    if (agFilter === 'hechas') {
      const L = X.S.tasks.filter((t) => t.done).map((t) => ({ k: 'entrega', at: t.doneAt || t.due, t })).concat(items().filter((x) => x.done).map((x) => ({ k: x.kind, at: x.doneAt || 0, x }))).sort((a, b) => b.at - a.at).slice(0, 40);
      h += L.length ? L.map(cardOf).join('') : '<div class="empty">Todavía no hay nada marcado como hecho.</div>';
    } else {
      const d = X.addDays(t0, agDay);
      let L = dayList(d);
      if (agFilter !== 'todo') L = L.filter((y) => y.k === agFilter);
      h += '<div class="sec">' + (agDay === 0 ? 'HOY · ' : agDay === 1 ? 'MAÑANA · ' : '') + esc(X.fmtDate(d).toUpperCase()) + '</div>';
      h += L.length ? L.map(cardOf).join('') : '<div class="empty" style="padding:18px">Nada agendado este día.</div>';
      const late = X.pending().filter((t) => t.due < Date.now());
      if (agDay === 0 && late.length && (agFilter === 'todo' || agFilter === 'entrega')) h += '<div class="sec red">⛔ ENTREGAS ATRASADAS</div>' + late.map((t) => X.taskCard(t)).join('');
      const un = unscheduled();
      if (un.length && (agFilter === 'todo' || agFilter === 'flex')) h += '<div class="sec">🔄 PENDIENTES SIN HORA</div>' + un.map(flexCard).join('');
    }
    h += '<button class="fab" data-new="1">+</button>';
    $('#view').innerHTML = h;
    if (window.MAPA) MAPA.afterAgenda();
    $('#view').onclick = (e) => {
      const v = e.target.closest('[data-v]'); if (v) { X.setHoyView(v.dataset.v); X.renderHoy(); return; }
      if (window.MAPA && MAPA.onClick(e)) return;
      const dd = e.target.closest('[data-dd]'); if (dd) { agDay = +dd.dataset.dd; X.renderHoy(); return; }
      const af = e.target.closest('[data-af]'); if (af) { agFilter = af.dataset.af; X.renderHoy(); return; }
      const tk = e.target.closest('[data-tk]'); if (tk) { const t = X.S.tasks.find((y) => y.id === tk.dataset.tk); X.setTaskDone(t.id, !t.done); X.scheduleNotifs(); if (t.done && window.AS) X.toast(AS.line('celebrar', 'h')); X.renderHoy(); return; }
      const to = e.target.closest('[data-to]'); if (to) { X.openTask(to.dataset.to); return; }
      const ag = e.target.closest('[data-ag]'); if (ag) { openItem(ag.dataset.ag); return; }
      if (e.target.closest('[data-new]')) newMenu();
    };
  }
  function cardOf(y) { return y.k === 'entrega' ? X.taskCard(y.t) : y.k === 'cita' ? citaCard(y.x) : flexCard(y.x); }

  function newMenu() {
    X.openSheet('<div class="det"><h2>¿Qué quieres agendar?</h2>' +
      '<button class="btn alt" data-nm="entrega" style="text-align:left">📌 Entrega del colegio o del trabajo<br><span class="muted">Tarea, examen, exposición… la fecha sale de tu próxima clase</span></button>' +
      '<button class="btn alt" data-nm="cita" style="text-align:left">📍 Cita fija<br><span class="muted">Médico, reunión, partido… con hora exacta</span></button>' +
      '<button class="btn alt" data-nm="flex" style="text-align:left">🔄 Pendiente flexible<br><span class="muted">Algo que debes hacer antes de una fecha: yo busco el hueco</span></button>' +
      '<button class="btn cy" data-nm="asis">✦ Decírselo al asistente</button></div>');
    $('#sheet').onclick = (e) => {
      const b = e.target.closest('[data-nm]'); if (!b) return; X.closeSheet();
      const k = b.dataset.nm;
      if (k === 'entrega') X.openTaskForm(null);
      if (k === 'cita') citaForm(null);
      if (k === 'flex') flexForm(null);
      if (k === 'asis') { X.setHoyView('asis'); X.renderHoy(); }
    };
  }

  // ---------- detalle ----------
  function openItem(id) {
    const x = byId(id); if (!x) return; const pl = placeOf(x.place);
    let h = '<div class="det">';
    if (x.kind === 'cita') {
      const c = conflicts(x.start, x.end);
      h += '<div class="pill" style="background:#e040fb33;color:#e040fb">📍 CITA FIJA</div><h2>' + esc(x.title) + '</h2><div class="box">📅 ' + X.fmtWhen(x.start) + ' – ' + X.h12(X.hhmmOf(x.end)) + (pl ? '<br>📍 ' + esc(pl.name) : '') + '</div>';
      if (c.length) h += '<div class="box warn">⚠️ <strong>Choca con:</strong> ' + c.map((b) => esc(b.title)).join(', ') + '</div>' + (window.AS ? AS.duo('conflicto') : '');
      if (opt('gcal', true)) h += '<button class="btn alt" data-gc="1">📆 Pasar a Google Calendar</button>';
    } else {
      h += '<div class="pill" style="background:#ffab0033;color:#ffab00">🔄 PENDIENTE FLEXIBLE · ' + (x.dur || DUR_DEF) + ' MIN</div><h2>' + esc(x.title) + '</h2><div class="box">' + (x.slot ? '🕐 Agendado: <strong>' + X.fmtWhen(x.slot) + '</strong>' : '🕐 Sin hora todavía') + (x.deadline ? '<br>⏳ Límite: ' + X.fmtShort(new Date(x.deadline)) : '') + (pl ? '<br>📍 ' + esc(pl.name) : '') + '</div>';
      h += '<button class="btn alt" data-rs="1">🔎 Buscar otro hueco</button>';
    }
    if (x.notes) h += '<div class="box">📝 ' + esc(x.notes) + '</div>';
    if (pl && window.MAPA) h += '<button class="btn alt" data-go="1">🧭 Cómo llegar</button>';
    h += '<button class="btn ' + (x.done ? 'alt' : '') + '" data-dn="1">' + (x.done ? 'Marcar como pendiente' : '✓ HECHO') + '</button><div class="row2"><button class="btn alt sm" data-ed="1">Editar</button><button class="btn alt sm" data-del="1">Eliminar</button></div></div>';
    X.openSheet(h);
    $('#sheet').onclick = (e) => {
      if (e.target.closest('[data-dn]')) { setItemDone(x.id, !x.done); X.closeSheet(); X.renderHoy(); X.toast(x.done ? '✓ ' + (window.AS ? AS.line('celebrar', 'h') : 'Listo') : 'Pendiente otra vez'); return; }
      if (e.target.closest('[data-gc]')) {
        if (X.N && X.N.addToCalendar) { X.N.addToCalendar(x.title, String(x.start), String(x.end), pl ? pl.name : '', x.notes || ''); return; }
        const f = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); // en iPhone: enlace de Google Calendar
        X.openUrl('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(x.title) + '&dates=' + f(x.start) + '/' + f(x.end) + (pl ? '&location=' + encodeURIComponent(pl.name) : '') + (x.notes ? '&details=' + encodeURIComponent(x.notes) : ''));
        return;
      }
      if (e.target.closest('[data-go]')) { X.closeSheet(); MAPA.directionsTo(pl); return; }
      if (e.target.closest('[data-rs]')) { X.closeSheet(); flexForm(x); return; }
      if (e.target.closest('[data-ed]')) { X.closeSheet(); x.kind === 'cita' ? citaForm(x) : flexForm(x); return; }
      const del = e.target.closest('[data-del]');
      if (del) { if (del.dataset.sure) { delItem(x.id); X.closeSheet(); X.renderHoy(); X.toast('Eliminado'); } else { del.dataset.sure = '1'; del.textContent = '¿Seguro? Toca otra vez'; del.style.color = '#ff5252'; } }
    };
  }

  // ---------- formularios ----------
  const toDate = (ms) => X.iso(new Date(ms));
  const placeSelect = (sel) => '<select id="fPlace"><option value="">— Sin sitio —</option>' + X.S.places.map((p) => '<option value="' + p.id + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select>' + (X.S.places.length ? '' : '<p class="muted" style="margin-top:4px">Aún no tienes sitios. Márcalos en el mapa de la Agenda.</p>');
  function citaForm(x, pre) {
    const F = x ? Object.assign({}, x) : Object.assign({ title: '', start: X.atTime(X.addDays(X.today(), 1), '16:00'), end: X.atTime(X.addDays(X.today(), 1), '17:00'), place: '', notes: '' }, pre || {});
    const draw = () => {
      const c = conflicts(F.start, F.end);
      let h = '<button class="back" data-x="1">‹ Agenda</button><div class="det"><h2>📍 ' + (x ? 'Editar cita' : 'Nueva cita fija') + '</h2>';
      h += '<div class="f">¿QUÉ ES?</div><input id="fTitle" placeholder="Ej: Cita médica (EPS)" value="' + esc(F.title) + '">';
      h += '<div class="f">DÍA</div><input type="date" id="fDate" value="' + toDate(F.start) + '">';
      h += '<div class="row2"><div style="flex:1"><div class="f">DESDE</div><input type="time" id="fS" value="' + X.hhmmOf(F.start) + '"></div><div style="flex:1"><div class="f">HASTA</div><input type="time" id="fE" value="' + X.hhmmOf(F.end) + '"></div></div>';
      h += '<div class="f">SITIO (OPCIONAL)</div>' + placeSelect(F.place);
      h += '<div class="f">NOTAS</div><textarea id="fNotes" rows="2">' + esc(F.notes || '') + '</textarea>';
      if (c.length) h += '<div class="box warn" style="margin-top:10px">⚠️ <strong>Choca con:</strong> ' + c.map((b) => esc(b.title) + ' (' + X.h12(b.s) + '–' + X.h12(b.e) + ')').join(', ') + '</div>' + (window.AS ? AS.duo('conflicto') : '');
      else h += '<div class="box" style="margin-top:10px">✓ No choca con nada de tu horario.</div>';
      h += '<button class="btn" data-ok="1">GUARDAR CITA</button></div>';
      X.openPage(h);
    };
    const read = () => { F.title = $('#fTitle').value; const dt = $('#fDate').value; if (dt) { const d = X.parseIso(dt); F.start = X.atTime(d, $('#fS').value || '16:00'); F.end = X.atTime(d, $('#fE').value || '17:00'); if (F.end <= F.start) F.end = F.start + 60 * 60000; } F.place = $('#fPlace').value || null; F.notes = $('#fNotes').value; };
    draw();
    $('#page').onchange = () => { read(); draw(); };
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { X.closePage(); X.render(); return; }
      if (e.target.closest('[data-ok]')) {
        read(); if (!F.title.trim()) { X.toast('Escribe qué es'); return; }
        if (x) { Object.assign(x, { title: F.title.trim(), start: F.start, end: F.end, place: F.place, notes: F.notes }); X.save(); X.scheduleNotifs(); } else addCita({ title: F.title.trim(), start: F.start, end: F.end, place: F.place, notes: F.notes });
        X.closePage(); X.setHoyView('agenda'); agDay = Math.max(0, Math.min(6, X.dayDiff(F.start))); X.setTab('hoy'); X.toast('📍 Cita guardada');
      }
    };
  }
  function flexForm(x, pre) {
    const F = x ? Object.assign({}, x) : Object.assign({ title: '', dur: 30, deadline: X.atTime(X.addDays(X.today(), 6), '21:00'), place: '', tipo: 'general', notes: '', slot: null }, pre || {});
    let opts = [], pick = 0;
    const search = () => {
      opts = findSlots(F.dur, F.deadline, { tipo: F.place ? 'vuelta' : F.tipo, place: placeOf(F.place), except: x && x.id, count: 2 });
      if (!opts.length) { const fb = fallbackSlot(F.dur, F.deadline); if (fb) opts = [fb]; }
      pick = 0;
    };
    const draw = () => {
      let h = '<button class="back" data-x="1">‹ Agenda</button><div class="det"><h2>🔄 ' + (x ? 'Editar pendiente' : 'Pendiente flexible') + '</h2>';
      h += '<div class="f">¿QUÉ TIENES QUE HACER?</div><input id="fTitle" placeholder="Ej: Comprar la cartulina" value="' + esc(F.title) + '">';
      h += '<div class="f">¿CUÁNTO TE DEMORAS?</div><div class="chips wrap">' + [15, 30, 45, 60, 90, 120].map((m) => '<button class="chip ' + (F.dur === m ? 'on' : '') + '" data-du="' + m + '">' + (m < 60 ? m + ' min' : m / 60 + ' h') + '</button>').join('') + '</div>';
      h += '<div class="f">¿PARA CUÁNDO, A MÁS TARDAR?</div><input type="date" id="fDl" value="' + toDate(F.deadline) + '">';
      h += '<div class="f">¿ES DEL COLEGIO?</div><div class="chips wrap"><button class="chip ' + (F.tipo !== 'colegio' ? 'on' : '') + '" data-tp="general">No</button><button class="chip ' + (F.tipo === 'colegio' ? 'on' : '') + '" data-tp="colegio">Sí (puede ir en Tareas del colegio)</button></div>';
      h += '<div class="f">SITIO (OPCIONAL)</div>' + placeSelect(F.place);
      h += '<div class="sec">🔎 HUECOS QUE TE PROPONGO</div>';
      if (opts.length) {
        opts.forEach((o, i) => { h += '<button class="due ' + (i === pick ? 'on' : '') + '" data-pk="' + i + '"><b>' + X.fmtWhen(o.at) + '</b><br><span class="muted">' + esc(o.block.title) + (o.steal ? ' · ⚠️ le quita tiempo a este bloque' : '') + '</span></button>'; });
        if (opts[0].steal && window.AS) h += AS.duo('sinHueco'); else if (window.AS) h += AS.duo('flex');
      } else h += '<div class="box warn">No encontré hueco antes del límite. Cambia la fecha o la duración.</div>';
      h += '<button class="due ' + (pick === -1 ? 'on' : '') + '" data-pk="-1">Sin hora por ahora</button>';
      h += '<div class="f">NOTAS</div><textarea id="fNotes" rows="2">' + esc(F.notes || '') + '</textarea>';
      h += '<button class="btn" data-ok="1">GUARDAR</button></div>';
      X.openPage(h);
    };
    const read = () => { F.title = $('#fTitle').value; const dl = $('#fDl').value; if (dl) F.deadline = X.atTime(X.parseIso(dl), '21:00'); F.place = $('#fPlace').value || null; F.notes = $('#fNotes').value; };
    search(); draw();
    $('#page').onchange = () => { read(); search(); draw(); };
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { X.closePage(); X.render(); return; }
      const du = e.target.closest('[data-du]'); if (du) { read(); F.dur = +du.dataset.du; search(); draw(); return; }
      const tp = e.target.closest('[data-tp]'); if (tp) { read(); F.tipo = tp.dataset.tp; search(); draw(); return; }
      const pk = e.target.closest('[data-pk]'); if (pk) { read(); pick = +pk.dataset.pk; draw(); return; }
      if (e.target.closest('[data-ok]')) {
        read(); if (!F.title.trim()) { X.toast('Escribe qué tienes que hacer'); return; }
        const slot = pick >= 0 && opts[pick] ? opts[pick].at : null;
        if (x) { Object.assign(x, { title: F.title.trim(), dur: F.dur, deadline: F.deadline, place: F.place, tipo: F.tipo, notes: F.notes, slot }); X.save(); X.scheduleNotifs(); }
        else addFlex({ title: F.title.trim(), dur: F.dur, deadline: F.deadline, place: F.place, tipo: F.tipo, notes: F.notes, slot });
        X.closePage(); X.setHoyView('agenda'); agDay = slot ? Math.max(0, Math.min(6, X.dayDiff(slot))) : 0; X.setTab('hoy'); X.toast(slot ? '🔄 Agendado: ' + X.fmtWhen(slot) : 'Guardado sin hora');
      }
    };
  }

  // ---------- avisos ----------
  X.hooks.notif.push((push, now) => {
    items().forEach((x) => {
      if (x.done) return;
      if (x.kind === 'cita') {
        push(x.start - X.DAY, 'cita|' + x.id, '📍 Mañana: ' + x.title, X.fmtWhen(x.start) + (conflicts(x.start, x.end).length ? ' · ⚠️ choca con tu horario: avisa con tiempo.' : ''));
        push(x.start - 60 * 60000, 'cita|' + x.id, '📍 En 1 hora: ' + x.title, X.h12(X.hhmmOf(x.start)) + (placeOf(x.place) ? ' · ' + placeOf(x.place).name : ''));
      }
      if (x.kind === 'flex' && x.slot) push(x.slot, 'flex|' + x.id, '🔄 Ahora: ' + x.title + ' (' + (x.dur || DUR_DEF) + ' min)', (window.AS ? AS.line('flex', 'h') + ' ' : '') + (placeOf(x.place) ? '📍 ' + placeOf(x.place).name : ''));
    });
  });
  X.hooks.check.push((a, b) => { if (a === 'flex' || a === 'cita') { setItemDone(b, true); return true; } return false; });
  X.hooks.resume.push(reprogram);
  X.hooks.boot.push(reprogram);

  window.AG = { render, pendingCount, findSlots, fallbackSlot, addCita, addFlex, conflicts, dayList, unscheduled, placeOf, byId, setItemDone, openItem, citaForm, flexForm, setDay(k) { agDay = k; } };
})();
