/* NEXO PLAN — lógica de la app */
(function () {
  'use strict';
  const APP_VERSION = 14, APP_NAME = '1.11';
  const NO_METAS = true; // (27 nov 2026) sin metas: los proyectos son nombre, notas y tareas
  const N = window.NexoNative || null; // puente con Android (no existe en el navegador)
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const DIAS_S = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const DIAS_C = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DAY = 864e5;

  // ---------- Estado ----------
  const KEY = 'nexoplan.v1';
  const DEF = { start: '2026-10-26', done: {}, metas: {}, ej: {}, notif: {}, updateUrl: '', remote: null, lastCheck: 0,
    tasks: [], anchors: {}, trips: [], vac: null, appUpd: null, seenVersion: 0,
    agenda: [], places: [], chat: [], asis: {}, lastLoc: null,
    bst: {}, dias: {}, perfil: null, autoSkip: {}, metaAuto: {}, marcar: {}, cntHoy: {},
    modoLog: [], cycleShift: 0, mine: null, dayEdit: {}, qStart: '', qSkip: {} };
  let S;
  try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, DEF); }
  const fix = () => { ['tasks', 'trips', 'agenda', 'places', 'chat', 'modoLog'].forEach((k) => { if (!Array.isArray(S[k])) S[k] = []; }); ['anchors', 'done', 'metas', 'ej', 'notif', 'asis', 'bst', 'dias', 'autoSkip', 'metaAuto', 'marcar', 'cntHoy', 'dayEdit', 'qSkip'].forEach((k) => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; }); };
  fix();
  // save: guarda y avisa a la sincronización · saveQuiet: guarda sin marcar un cambio nuevo
  const saveQuiet = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const save = () => { S._t = Date.now(); saveQuiet(); if (window.NP) NP.hooks.saved.forEach((f) => { try { f(); } catch (e) {} }); };

  // aplica actualizaciones descargadas (temas de semanas nuevas)
  function applyRemote() {
    if (!S.remote) return;
    if (S.remote.sesiones) Object.keys(S.remote.sesiones).forEach((k) => { SESIONES[k] = S.remote.sesiones[k]; });
    if (S.remote.tips) window.TIPS_CLIENTE = S.remote.tips;
  }
  applyRemote();

  // ---------- Fechas ----------
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const parseIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dow = (d) => ((d.getDay() + 6) % 7) + 1;
  const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const addDays = (d, k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k);
  const atTime = (d, hhmm) => { const [h, m] = hhmm.split(':').map(Number); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime(); };
  const weekOf = (d) => { const st = parseIso(S.start); return Math.max(1, Math.floor((Math.round((d - st) / DAY)) / 7) + 1); };
  const mondayOf = (w) => addDays(parseIso(S.start), (w - 1) * 7);
  const fmtDate = (d) => DIAS[dow(d)] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()];
  const fmtShort = (d) => DIAS_S[dow(d)] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()];
  const h12 = (hhmm) => { let [h, m] = hhmm.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + ':' + String(m).padStart(2, '0') + ' ' + ap; };
  const hhmmOf = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const fmtWhen = (ms) => fmtShort(new Date(ms)) + ' · ' + h12(hhmmOf(ms));
  const dayDiff = (ms) => Math.round((new Date(new Date(ms).toDateString()) - today()) / DAY);
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) % 2000000000; };

  // ---------- Viajes y vacaciones ----------
  const tripOf = (di) => S.trips.find((t) => di >= t.from && di <= t.to) || null;
  const vacOn = (di) => !!(S.vac && S.vac.from && di >= S.vac.from && (!S.vac.to || di <= S.vac.to));
  const VAC_PAUSA = ['colegio', 'tareas'];
  function pausa(b, d) {
    const di = iso(d);
    if (tripOf(di)) return 'viaje';
    if (vacOn(di) && VAC_PAUSA.includes(b.cat)) return 'vacaciones';
    return null;
  }
  function tripDaysBefore(di) {
    let n = 0;
    S.trips.forEach((t) => { let d = parseIso(t.from); const end = parseIso(t.to); while (d <= end && iso(d) < di) { n++; d = addDays(d, 1); } });
    return n;
  }
  // semana de ejercicio: durante un viaje el nivel se congela
  function ejWeek(d) {
    const tr = tripOf(iso(d));
    if (tr) return ejWeek(addDays(parseIso(tr.from), -1));
    return Math.max(1, weekOf(d) - Math.floor(tripDaysBefore(iso(d)) / 7));
  }

  // ---------- Datos derivados ----------
  const P = {}; PROJECTS.forEach((p) => { P[p.id] = p; });
  const ORDER = ['nexo', 'app', 'video', 'creador', 'agencia', 'habitos'];
  // ---------- Horarios: clases o vacaciones (cuando quieras) y ciclo de 2 semanas ----------
  const MODELO = HORARIO.map((b) => ({ d: b.d, s: b.s, e: b.e, cat: b.cat, title: b.title }));
  const plain = (b) => { const o = { d: b.d, s: b.s, e: b.e, cat: b.cat, title: b.title }; if (b.was) o.was = b.was; if (b.fijo) o.fijo = true; return o; };
  // 🔒 fijo: colegio y dormir siempre; los demás si los marcas (el organizador y Harvey no los mueven)
  const isFijo = (b) => !!(b && (b.fijo || b.cat === 'colegio' || b.cat === 'dormir'));
  // clases: el horario de siempre sin la tienda (renunció en nov 2026)
  const BASE = {
    clases: () => MODELO.map((b) => (b.cat === 'trabajo' ? { d: b.d, s: b.s, e: b.e, cat: 'libre', title: 'Libre', was: b.title } : plain(b))),
    vac1: () => HORARIO_VAC[1].map(plain), vac2: () => HORARIO_VAC[2].map(plain), vac3: () => HORARIO_VAC[3].map(plain), vac4: () => HORARIO_VAC[4].map(plain)
  };
  const KEY_N = { clases: 'Clases', vac1: 'Vacaciones · ' + HORARIO_VAC[1].n, vac2: 'Vacaciones · ' + HORARIO_VAC[2].n, vac3: 'Vacaciones · ' + HORARIO_VAC[3].n, vac4: 'Vacaciones · ' + HORARIO_VAC[4].n };
  function normalize(arr) {
    const L = arr.map(plain).sort((a, b) => a.d - b.d || mins(a.s) - mins(b.s)); const cnt = {};
    L.forEach((b) => { cnt[b.cat] = cnt[b.cat] || 0; b.slot = cnt[b.cat]++; b.id = b.d + '-' + b.s; });
    return L;
  }
  const modoOn = (di) => { let m = 'clases'; S.modoLog.forEach((x) => { if (x.from <= di) m = x.modo; }); return m; };
  // semana 1 = A; “Pasar a B” corre el ciclo una semana
  // ciclo de 4 semanas: la semana 5 del plan (23 nov) es la Semana 1; “Pasar a la siguiente” corre el ciclo
  const cycleOf = (d) => ((((weekOf(d) + (S.cycleShift || 0) - 1) % 4) + 4) % 4) + 1;
  const keyOf = (d) => (modoOn(iso(d)) === 'vacaciones' ? 'vac' + cycleOf(d) : 'clases');
  const SCHED = {};
  function sched(k) { if (!SCHED[k]) SCHED[k] = normalize((S.mine && S.mine[k]) || BASE[k]()); return SCHED[k]; }
  function applySchedule() { Object.keys(SCHED).forEach((k) => delete SCHED[k]); const L = sched(keyOf(today())); HORARIO.length = 0; L.forEach((b) => HORARIO.push(b)); }
  function blocksOf(d) {
    const di = iso(d); const w = dow(d); let L = sched(keyOf(d)).filter((b) => b.d === w);
    const ov = S.dayEdit[di];
    if (ov) {
      const base = L; const used = {};
      const slotOf = (c) => { const bs = base.filter((b) => b.cat === c); const k = used[c] = (used[c] || 0) + 1; return bs[k - 1] ? bs[k - 1].slot : 99; };
      const same = (b) => base.some((x) => x.s === b.s && x.e === b.e && x.cat === b.cat && x.title === b.title);
      L = ov.map(plain).sort((a, b) => mins(a.s) - mins(b.s)).map((b) => Object.assign(b, { d: w, id: w + '-' + b.s, slot: slotOf(b.cat), hoy: !same(b) }));
    }
    return L;
  }
  const blockById = (id, d) => blocksOf(d).find((b) => b.id === id) || HORARIO.find((b) => b.id === id);
  // quita o recorta los bloques que se cruzan con el nuevo
  function fitIn(list, nb) {
    const a = mins(nb.s), z = mins(nb.e); const out = [];
    list.forEach((b) => {
      if (b.d !== nb.d) { out.push(b); return; }
      const x = mins(b.s), y = mins(b.e);
      if (y <= a || x >= z) { out.push(b); return; }
      if (x < a && a - x >= 10) out.push(Object.assign({}, b, { e: nb.s }));
      if (y > z && y - z >= 10) out.push(Object.assign({}, b, { s: nb.e }));
    });
    out.push(nb); return out;
  }
  // lo que queda del bloque viejo fuera del nuevo pasa a Libre
  function leftovers(orig, nb, w) {
    if (!orig || !nb || (orig.cat === 'libre' && nb.cat === 'libre')) return [];
    const out = []; const a = mins(orig.s), z = mins(orig.e), x = mins(nb.s), y = mins(nb.e);
    if (x - a >= 10) out.push({ d: w, s: orig.s, e: x < z ? nb.s : orig.e, cat: 'libre', title: 'Libre' });
    if (z - y >= 10) out.push({ d: w, s: y > a ? nb.e : orig.s, e: orig.e, cat: 'libre', title: 'Libre' });
    return out;
  }
  // scope: 'hoy' (solo ese día) o 'siempre' (ese día de la semana en este horario)
  function saveBlock(d, orig, nb, scope) {
    const di = iso(d); const w = dow(d); const k = keyOf(d);
    const same = (b) => orig && b.d === w && b.s === orig.s && b.cat === orig.cat;
    const extra = leftovers(orig, nb, w);
    const put = (L) => { extra.forEach((x) => { L = fitIn(L, x); }); return nb ? fitIn(L, Object.assign({ d: w }, nb)) : L; };
    const strip = (L) => L.map((x) => { const o = plain(x); delete o.d; return o; });
    if (scope === 'hoy') {
      const L = (S.dayEdit[di] ? S.dayEdit[di].map((x) => Object.assign(plain(x), { d: w })) : blocksOf(d).map(plain));
      S.dayEdit[di] = strip(put(L.filter((b) => !same(b))));
    } else {
      S.mine = S.mine || {};
      S.mine[k] = normalize(put(sched(k).map(plain).filter((b) => !same(b)))).map(plain);
      if (S.dayEdit[di]) S.dayEdit[di] = strip(put(S.dayEdit[di].map((x) => Object.assign(plain(x), { d: w })).filter((b) => !same(b))));
    }
    save(); applySchedule(); scheduleNotifs(); changed();
  }
  function resetSchedule(k) { if (S.mine) delete S.mine[k]; save(); applySchedule(); scheduleNotifs(); changed(); }
  function setModo(m) {
    const t = iso(today()); S.modoLog = S.modoLog.filter((x) => x.from < t); S.modoLog.push({ from: t, modo: m });
    save(); applySchedule(); scheduleNotifs(); changed();
  }

  // ---------- Fila de tareas por proyecto: lo que no haces pasa al siguiente bloque ----------
  const QCATS = ['app', 'video', 'agencia', 'nexo'];
  let QSEQ = null;
  function qseq() {
    if (QSEQ) return QSEQ; QSEQ = {};
    QCATS.forEach((c) => { QSEQ[c] = []; Object.keys(SESIONES).map(Number).sort((a, b) => a - b).forEach((w) => (SESIONES[w][c] || []).forEach((s, i) => QSEQ[c].push({ w, i, s }))); });
    return QSEQ;
  }
  let QMEMO = null;
  // recorre los bloques desde que empezó la fila: ✓ o ½ avanzan, ✕ o sin marcar se arrastran
  function queueMap(cat) {
    if (!QMEMO) { QMEMO = {}; setTimeout(() => { QMEMO = null; }, 0); }
    if (QMEMO[cat]) return QMEMO[cat];
    const seq = qseq()[cat]; const skip = (S.qSkip && S.qSkip[cat]) || [];
    const st0 = parseIso(S.qStart); const w0 = weekOf(st0);
    let idx = seq.findIndex((x) => x.w >= w0); if (idx < 0) idx = seq.length;
    const adv = () => { while (skip.includes(idx)) idx++; };
    adv();
    const map = {}; let carry = 0; const t0 = iso(today()); const nm = nowMin(); const end = addDays(today(), 21);
    for (let d = st0; d <= end; d = addDays(d, 1)) {
      const di = iso(d); if (tripOf(di)) continue;
      blocksOf(d).filter((b) => b.cat === cat && !pausa(b, d)).forEach((b) => {
        map[di + '|' + b.id] = { idx, carry };
        const st = blockState(di, b.id); const ok = st === 'ok' || st === 'half';
        const past = di < t0 || (di === t0 && mins(b.e) <= nm);
        if (ok || !past) { idx++; carry = 0; adv(); } else carry++;
      });
    }
    QMEMO[cat] = map; return map;
  }
  function queueAt(cat, b, d) {
    const di = iso(d); if (!S.qStart || di < S.qStart) return null;
    const q = queueMap(cat)[di + '|' + b.id]; if (!q) return null;
    const x = qseq()[cat][q.idx]; return x ? { idx: q.idx, carry: q.carry, s: x.s } : { idx: q.idx, carry: q.carry, s: null };
  }
  if (!S.updateUrl) S.updateUrl = 'https://raw.githubusercontent.com/nexopc/Nexo-plan/main/plan.json';
  // primera vez con la 1.6: vacaciones desde hoy y la fila empieza esta semana
  if (!S.modoLog.length && !S.qStart) S.modoLog.push({ from: iso(today()), modo: 'vacaciones' });
  if (!S.qStart) { S.qStart = iso(mondayOf(weekOf(today()))); save(); }
  // 1.7: el ciclo de 4 semanas arranca el lunes 23 nov; la fila empieza limpia ese día
  if (!S.q17) { if (S.qStart < '2026-11-23') S.qStart = '2026-11-23'; S.q17 = 1; save(); }
  applySchedule();
  function skipTask(cat, idx) { S.qSkip = S.qSkip || {}; (S.qSkip[cat] = S.qSkip[cat] || []).push(idx); QMEMO = null; save(); scheduleNotifs(); }
  const metaKey = (pid, id) => pid + ':' + id;
  const getMeta = (pid, id) => { const [a, m] = id.split('.').map(Number); const ar = P[pid].areas[a - 1]; return ar && ar.metas[m - 1] ? { area: ar, meta: ar.metas[m - 1], a, m } : null; };
  const metaDone = (pid, id) => !!S.metas[metaKey(pid, id)];
  const countDone = (pid, ai) => {
    let c = 0; const p = P[pid];
    p.areas.forEach((ar, i) => { if (ai != null && i !== ai) return; ar.metas.forEach((_, j) => { if (metaDone(pid, (i + 1) + '.' + (j + 1))) c++; }); });
    return c;
  };
  function nextPendingMeta(pid) {
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const id = (i + 1) + '.' + (j + 1); if (!metaDone(pid, id)) return id; }
    return null;
  }
  // ---------- Ruta: en qué semana debería estar cumplida cada meta ----------
  const WK_MES = 4.345;
  function metaWindow(txt) {
    const s = String(txt).toLowerCase(); let r;
    const R = (a, b) => ({ s: Math.max(1, Math.round(a)), e: Math.max(1, Math.round(b)) });
    if ((r = s.match(/desde semana (\d+)/))) return R(+r[1], +r[1] + 11);
    if ((r = s.match(/desde mes (\d+)/))) return R((r[1] - 1) * WK_MES + 1, (+r[1] + 2) * WK_MES);
    if (s.includes('1.ª venta')) return R(2 * WK_MES + 1, 6 * WK_MES);
    if ((r = s.match(/semana (\d+)(?:–(\d+))?(\+)?/))) { const a = +r[1], b = r[2] ? +r[2] : a; return R(a, r[3] ? b + 7 : b); }
    if ((r = s.match(/mes (\d+)(?:–(\d+))?(\+)?/))) { const a = +r[1], b = r[2] ? +r[2] : a; return R((a - 1) * WK_MES + 1, (r[3] ? b + 2 : b) * WK_MES); }
    if ((r = s.match(/año (\d+)(?:–(\d+))?/))) { const a = +r[1], b = r[2] ? +r[2] : a; return R((a - 1) * 52 + 1, b * 52); }
    return null; // permanente o sin fecha
  }
  const RUTA = [];
  if (!NO_METAS) PROJECTS.forEach((p) => p.areas.forEach((ar, i) => ar.metas.forEach((m, j) => RUTA.push({ pid: p.id, id: (i + 1) + '.' + (j + 1), m, ar, w: metaWindow(m.m) }))));
  const doneWeek = (x) => { const v = S.metas[metaKey(x.pid, x.id)]; return v ? weekOf(parseIso(v)) : null; };
  function ruta(pid) {
    const w = weekOf(today());
    const L = RUTA.filter((x) => (pid ? x.pid === pid : !(window.NP && NP.isPaused && NP.isPaused(x.pid))));
    const F = L.filter((x) => x.w);
    const pend = (x) => !metaDone(x.pid, x.id);
    const byE = (a, b) => a.w.e - b.w.e || a.w.s - b.w.s;
    return {
      w, total: F.length, permanentes: L.filter((x) => !x.w).length,
      llevas: F.filter((x) => metaDone(x.pid, x.id)).length,
      deberias: F.filter((x) => x.w.e < w).length,
      estaSemana: F.filter((x) => x.w.e === w).length,
      atrasadas: F.filter((x) => x.w.e < w && pend(x)).sort(byE),
      enCurso: F.filter((x) => x.w.s <= w && x.w.e >= w && pend(x)).sort(byE),
      proximas: F.filter((x) => x.w.s > w && pend(x)).sort((a, b) => a.w.s - b.w.s).slice(0, 3),
      F
    };
  }
  const weekRange = (wk) => { const a = mondayOf(wk); return a.getDate() + ' ' + MESES[a.getMonth()]; };

  // gráfica de líneas: metas esperadas vs reales (acumuladas por semana)
  const C_ESP = '#d95926', C_REAL = '#3987e5';
  function lineChart(R, X) {
    const W = 340, Hh = 190, l = 30, rr = 46, t = 12, b = 24, iw = W - l - rr, ih = Hh - t - b;
    const esp = [], real = [];
    for (let k = 0; k <= X; k++) {
      esp.push(R.F.filter((x) => x.w.e <= k).length);
      if (k <= R.w) real.push(R.F.filter((x) => { const d = doneWeek(x); return d != null && d <= k; }).length);
    }
    const ymax = Math.max(4, Math.ceil(Math.max(...esp, ...real) / 4) * 4);
    const px = (k) => l + iw * k / X, py = (v) => t + ih - ih * v / ymax;
    const path = (arr) => arr.map((v, k) => (k ? 'L' : 'M') + px(k).toFixed(1) + ' ' + py(v).toFixed(1)).join(' ');
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = ymax * i / 4; g += '<line x1="' + l + '" x2="' + (l + iw) + '" y1="' + py(v) + '" y2="' + py(v) + '" class="gl"/><text x="' + (l - 6) + '" y="' + (py(v) + 3) + '" class="ax" text-anchor="end">' + v + '</text>'; }
    const step = X <= 12 ? 2 : X <= 26 ? 4 : 8;
    for (let k = 0; k <= X; k += step) g += '<text x="' + px(k) + '" y="' + (Hh - 6) + '" class="ax" text-anchor="middle">' + (k || '') + '</text>';
    g += '<line x1="' + px(R.w) + '" x2="' + px(R.w) + '" y1="' + t + '" y2="' + (t + ih) + '" class="hoy"/><text x="' + px(R.w) + '" y="' + (t - 2) + '" class="ax" text-anchor="middle">hoy</text>';
    g += '<path d="' + path(esp) + '" fill="none" stroke="' + C_ESP + '" stroke-width="2" stroke-dasharray="5 4"/>';
    g += '<path d="' + path(real) + '" fill="none" stroke="' + C_REAL + '" stroke-width="2"/>';
    const le = esp[X], lr = real[real.length - 1];
    g += '<circle cx="' + px(real.length - 1) + '" cy="' + py(lr) + '" r="4" fill="' + C_REAL + '" stroke="#121829" stroke-width="2"/>';
    g += '<text x="' + (l + iw + 4) + '" y="' + (py(le) + 3) + '" class="dl">' + le + ' plan</text>';
    g += '<text x="' + (px(real.length - 1) + 7) + '" y="' + (py(lr) + (Math.abs(py(lr) - py(le)) < 12 ? 13 : 3)) + '" class="dl">' + lr + ' real</text>';
    g += '<line class="xh" x1="0" x2="0" y1="' + t + '" y2="' + (t + ih) + '" style="display:none"/>';
    const data = { esp, real, X, l, iw };
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '" data-line=\'' + JSON.stringify(data) + '\' role="img" aria-label="Metas esperadas contra metas cumplidas por semana">' + g + '<rect x="' + l + '" y="' + t + '" width="' + iw + '" height="' + ih + '" fill="transparent"/></svg>';
  }
  // bloques por semana: planeados vs hechos
  const RUTA_CATS = { app: ['app'], video: ['video', 'cliente'], agencia: ['agencia'], nexo: ['nexo'], habitos: ['ejercicio', 'ingles', 'dormir'], creador: ['creador', 'video', 'cliente', 'agencia'] };
  function blocksWeek(wk, pid) {
    const cats = pid ? RUTA_CATS[pid] : null; const mon = mondayOf(wk); let plan = 0, hecho = 0;
    for (let k = 0; k < 7; k++) {
      const d = addDays(mon, k); if (tripOf(iso(d))) continue;
      blocksOf(d).forEach((b) => { if (!CATS[b.cat].check || pausa(b, d)) return; if (cats ? !cats.includes(b.cat) : false) return; plan++; if (isDone(iso(d), b.id)) hecho++; });
    }
    return { plan, hecho };
  }
  function barChart(pid, w) {
    const from = Math.max(1, w - 5); const weeks = []; for (let k = from; k <= w; k++) weeks.push(k);
    const D = weeks.map((k) => Object.assign({ k }, blocksWeek(k, pid)));
    const W = 340, Hh = 170, l = 30, r = 8, t = 12, b = 24, iw = W - l - r, ih = Hh - t - b;
    const ymax = Math.max(4, Math.ceil(Math.max(...D.map((x) => x.plan)) / 5) * 5);
    const gw = iw / 6, bw = Math.min(18, (gw - 10) / 2);
    const py = (v) => t + ih - ih * v / ymax;
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = Math.round(ymax * i / 4); g += '<line x1="' + l + '" x2="' + (l + iw) + '" y1="' + py(v) + '" y2="' + py(v) + '" class="gl"/><text x="' + (l - 6) + '" y="' + (py(v) + 3) + '" class="ax" text-anchor="end">' + v + '</text>'; }
    const bar = (x, v, c) => { const y = py(v), h = t + ih - y; if (h <= 0) return ''; const rr = Math.min(4, h); return '<path d="M' + x + ' ' + (t + ih) + 'V' + (y + rr) + 'Q' + x + ' ' + y + ' ' + (x + rr) + ' ' + y + 'H' + (x + bw - rr) + 'Q' + (x + bw) + ' ' + y + ' ' + (x + bw) + ' ' + (y + rr) + 'V' + (t + ih) + 'Z" fill="' + c + '"/>'; };
    D.forEach((x, i) => {
      const cx = l + gw * i + gw / 2;
      g += bar(cx - bw - 1, x.plan, C_ESP) + bar(cx + 1, x.hecho, C_REAL);
      g += '<text x="' + cx + '" y="' + (Hh - 6) + '" class="ax" text-anchor="middle">' + (x.k === w ? 'Esta' : 'S' + x.k) + '</text>';
      g += '<rect x="' + (l + gw * i) + '" y="' + t + '" width="' + gw + '" height="' + ih + '" fill="transparent" data-bi="' + i + '"/>';
    });
    const last = D[D.length - 1];
    return { svg: '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '" data-bars=\'' + JSON.stringify(D) + '\' role="img" aria-label="Bloques planeados contra bloques hechos por semana">' + g + '</svg>', D, last };
  }
  const isNotifOn = (cat) => (S.notif[cat] != null ? S.notif[cat] : CATS[cat].notif);
  const isDone = (dateIso, bid) => !!(S.done[dateIso] && S.done[dateIso][bid]);
  function setDone(dateIso, bid, v) {
    S.done[dateIso] = S.done[dateIso] || {};
    if (v) S.done[dateIso][bid] = Date.now(); else delete S.done[dateIso][bid];
    save();
  }
  // estado de un bloque: 'ok' (hecho), 'half' (a medias), 'no' (no pude) o null (sin marcar)
  function blockState(dateIso, bid) {
    if (isDone(dateIso, bid)) return 'ok';
    const x = S.bst[dateIso] && S.bst[dateIso][bid]; return x ? x.s : null;
  }
  const blockWhy = (dateIso, bid) => { const x = S.bst[dateIso] && S.bst[dateIso][bid]; return (x && x.why) || ''; };
  function setBlockState(dateIso, bid, st, why) {
    setDone(dateIso, bid, st === 'ok');
    if (S.bst[dateIso]) { delete S.bst[dateIso][bid]; if (!Object.keys(S.bst[dateIso]).length) delete S.bst[dateIso]; }
    if (st === 'half' || st === 'no') { S.bst[dateIso] = S.bst[dateIso] || {}; S.bst[dateIso][bid] = why ? { s: st, why } : { s: st }; }
    save(); changed();
  }
  // puntaje de un bloque: hecho 1, a medias 0,5
  const blockScore = (dateIso, bid) => { const st = blockState(dateIso, bid); return st === 'ok' ? 1 : st === 'half' ? 0.5 : 0; };
  function changed() { if (window.NP) NP.hooks.changed.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }
  const V_CAT = { creador: 'creador', app: 'app', video: 'video', agencia: 'agencia', nexo: 'nexo', ejercicio: 'ejercicio', ingles: 'ingles', tareas: 'tareas', cliente: 'cliente', trabajo: 'trabajo' };
  const MOTIVOS_NO = ['Cansado', 'Trabajo', 'Tareas', 'Sin internet', 'Me enfermé', 'Otra cosa'];
  // frase de “No pude” que tenga que ver con el motivo que escogió
  const NO_RX = { 'Cansado': /cansancio|durmiendo|cansado/, 'Trabajo': /trabajo/, 'Tareas': /tareas/, 'Sin internet': /internet/, 'Me enfermé': /enferm/ };
  function vozNo(why) {
    const V = window.VOCES && VOCES.noPude; const rx = NO_RX[why]; if (!V) return '';
    const v = (S.asis && S.asis.voz) || 'ambos'; const L = [];
    if (rx) { if (v !== 'mike') V.h.filter((x) => rx.test(x)).forEach((x) => L.push('Harvey: ' + x)); if (v !== 'harvey') V.m.filter((x) => rx.test(x)).forEach((x) => L.push('Mike: ' + x)); }
    return L.length ? L[Date.now() % L.length] : voz('noPude');
  }
  // frase corta de Harvey o Mike para los avisos rápidos
  function voz(cat, x) {
    if (!window.AS) return '';
    const o = AS.lines(cat, x, String(Date.now()));
    return o.h && (!o.m || Date.now() % 2) ? 'Harvey: ' + o.h : o.m ? 'Mike: ' + o.m : '';
  }

  // ---------- Materias, clases y espacios ----------
  const SUBJ_COLOR = { 'Matemáticas': '#2f6bff', 'Estadística': '#2f6bff', 'Física': '#14b8a6', 'Química': '#14b8a6', 'Naturales': '#14b8a6',
    'Español': '#f97316', 'Inglés': '#f97316', 'Sociales': '#a78bfa', 'Filosofía': '#a78bfa', 'Economía y política': '#a78bfa',
    'Ética y valores': '#a78bfa', 'Cátedra': '#a78bfa', 'Música': '#ec4899', 'Danza': '#ec4899', 'Educación física': '#ec4899', 'Artística': '#ec4899', 'Informática': '#6366f1' };
  const SUBJ = {};
  Object.keys(CLASES).forEach((k) => CLASES[k].forEach((c) => {
    if (c[2] === 'Descanso') return;
    c[2].split(' / ').forEach((n) => { if (!SUBJ[n]) SUBJ[n] = { k: n, n: n === 'Inglés' ? 'Inglés (colegio)' : n, color: SUBJ_COLOR[n] || '#8a94ad', kind: 'clase' }; });
  }));
  SUBJ['Curso de inglés'] = { k: 'Curso de inglés', n: 'Curso de inglés', color: '#26c6da', kind: 'curso' };
  if (HORARIO.some((b) => b.cat === 'trabajo') || S.tasks.some((t) => t.subj === 'Trabajo')) SUBJ['Trabajo'] = { k: 'Trabajo', n: 'Trabajo tienda', color: '#90a4ae', kind: 'trabajo' };
  SUBJ['Otro'] = { k: 'Otro', n: 'Otro / personal', color: '#ffab00', kind: 'otro' };
  const subj = (k) => SUBJ[k] || SUBJ.Otro;
  const className = (n) => n.split(' / ').map((x) => (x === 'Inglés' ? 'Inglés (colegio)' : x)).join(' / ');

  // sesiones de clase, curso y trabajo de un día (sirven para calcular entregas)
  function sessionsOn(d) {
    const di = iso(d); if (tripOf(di)) return [];
    const out = []; const w = dow(d);
    if (!vacOn(di) && modoOn(di) !== 'vacaciones') (CLASES[w] || []).forEach((c) => { if (c[2] !== 'Descanso') out.push({ keys: c[2].split(' / '), n: className(c[2]), s: c[0], e: c[1], kind: 'clase' }); });
    blocksOf(d).filter((b) => b.cat === 'ingles').forEach((b) => out.push({ keys: ['Curso de inglés'], n: b.title, s: b.s, e: b.e, kind: 'curso', bid: b.id }));
    blocksOf(d).filter((b) => b.cat === 'trabajo').forEach((b) => out.push({ keys: ['Trabajo'], n: 'Trabajo tienda', s: b.s, e: b.e, kind: 'trabajo', bid: b.id }));
    return out;
  }
  function nextSessions(key, after, count) {
    const res = [];
    for (let k = 0; k < 150 && res.length < count; k++) {
      const d = addDays(today(), k);
      sessionsOn(d).filter((x) => x.keys.includes(key)).forEach((x) => { const at = atTime(d, x.s); if (at > after && res.length < count) res.push({ at, d, x }); });
    }
    return res;
  }

  // ---------- Tareas ----------
  const TT = { tarea: { n: 'Tarea', i: '📝', v: 'entregas' }, examen: { n: 'Examen', i: '📖', v: 'tienes examen' }, expo: { n: 'Exposición', i: '🎤', v: 'expones' }, grupo: { n: 'Trabajo en grupo', i: '👥', v: 'entregas' } };
  const OFFS = { examen: [[5 * 1440, '5 d'], [3 * 1440, '3 d'], [1440, '1 d'], [60, '1 h']], def: [[3 * 1440, '3 d'], [1440, '1 d'], [60, '1 h']] };
  // recordatorios: los que caen entre 9 pm y 5 am pasan a las 8:30 pm de la noche anterior
  function remindersOf(t) {
    return OFFS[t.type === 'examen' ? 'examen' : 'def'].map(([m, l]) => {
      let at = t.due - m * 60000; const x = new Date(at); const h = x.getHours(); let moved = false;
      if (h >= 21) { x.setHours(20, 30, 0, 0); at = x.getTime(); moved = true; }
      else if (h < 5) { x.setDate(x.getDate() - 1); x.setHours(20, 30, 0, 0); at = x.getTime(); moved = true; }
      return { l, at, m, moved };
    });
  }
  const pending = () => S.tasks.filter((t) => !t.done);
  const tasksDueAt = (at, keys) => pending().filter((t) => t.due === at && keys.includes(t.subj));
  const nextTaskOf = (key) => pending().filter((t) => t.subj === key && t.due > Date.now()).sort((a, b) => a.due - b.due)[0];
  function setTaskDone(id, v) { const t = S.tasks.find((x) => x.id === id); if (t) { t.done = v; t.doneAt = v ? Date.now() : null; save(); } }

  // ---------- Tema concreto de un bloque ----------
  function topicOf(b, d) {
    const w = weekOf(d); const ses = SESIONES[w]; const cat = CATS[b.cat];
    if (['app', 'video', 'agencia', 'nexo', 'creador'].includes(b.cat) && NO_METAS) {
      const tk = window.PR && PR.nextTask(b.cat);
      return tk ? { t: '✅ ' + tk.title, d: 'Próxima tarea del proyecto · ' + (tk.minutes || 30) + ' min. Márcala en Proyectos cuando la termines.', task: tk.id } : { t: '', d: '' };
    }
    if (['app', 'video', 'agencia', 'nexo', 'creador'].includes(b.cat)) {
      const q = QCATS.includes(b.cat) ? queueAt(b.cat, b, d) : null;
      if (q && q.s) return { meta: q.s[0], pid: b.cat, t: q.s[1], d: q.s[2], carry: q.carry, qi: q.idx };
      const s = !q && ses && ses[b.cat] && ses[b.cat][b.slot];
      if (s) return { meta: s[0], pid: b.cat, t: s[1], d: s[2] };
      const id = nextPendingMeta(b.cat); const g = id && getMeta(b.cat, id);
      return g ? { meta: id, pid: b.cat, t: 'Siguiente meta: ' + g.meta.t, d: 'Tu plan de la semana ' + w + ' aún no se ha descargado. Avanza en tu próxima meta pendiente (' + id + ').' } : { t: cat.n, d: '' };
    }
    if (b.cat === 'ejercicio') { const r = buildRutina(ejWeek(d), dow(d)); return { t: r.nivelNombre + ' · ' + r.tipo, d: '≈ ' + r.minutos + ' min · semana ' + r.wk + ' de 3 del nivel. Toca para abrir la rutina.' }; }
    if (b.cat === 'cliente') { const tip = TIPS_CLIENTE[(w - 1) % TIPS_CLIENTE.length]; return { t: 'Reto de la semana', d: tip }; }
    if (b.cat === 'ingles') {
      const due = tasksDueAt(atTime(d, b.s), ['Curso de inglés']);
      return { t: due.length ? '📌 Hoy entregas: ' + due.map((x) => x.title).join(', ') : 'Vocabulario de la semana', d: (ses && ses.ingles) || 'Repasa tus tarjetas de Anki y anota 10 palabras nuevas de tecnología.' };
    }
    if (b.cat === 'tareas') {
      const n = pending().filter((t) => subj(t.subj).kind === 'clase').length;
      return { t: n ? n + ' tarea(s) pendiente(s) del colegio' : 'Primero lo urgente', d: 'Haz primero lo que se entrega antes (mira la ventana Tareas). Si terminas, repasa la materia que más te cuesta.' };
    }
    if (b.cat === 'dormir') return { t: dow(d) === 7 ? 'Revisión semanal' : 'Cierra tu día', d: dow(d) === 7 ? 'Mira la pestaña Semana: % cumplido, tus bloques ancla y 3 prioridades para la próxima. Luego, celular lejos de la cama.' : 'Chulea tu día en la app, revisa las tareas de mañana, alista ropa y maleta, y deja el celular lejos de la cama a las 8:45.' };
    if (b.cat === 'trabajo') {
      const due = tasksDueAt(atTime(d, b.s), ['Trabajo']);
      return { t: due.length ? '📌 Pendiente para este turno: ' + due.map((x) => x.title).join(', ') : 'Aprende mientras trabajas', d: 'Observa qué preguntan y compran los clientes: anota 1 idea para NEXO PC.' };
    }
    if (b.cat === 'colegio') return { t: (CLASES[b.d] || []).filter((c) => c[2] !== 'Descanso').length + ' clases', d: (CLASES[b.d] || []).map((c) => className(c[2])).join(' · ') };
    return { t: b.title, d: '' };
  }

  // ---------- Plan de viaje (cada tarea trae instrucciones) ----------
  const H = (t, how, open) => ({ t, how, open });
  const TRIP_OPC = {
    appPc: [
      H('Avanza tu sesión pendiente de App Web en el portátil', ['Abre Hoy (o Semana) y busca el último tema de App Web que no chuleaste.', 'Haz solo la primera parte de esa tarea: lo que quepa en el tiempo.', 'Guarda el avance (commit en GitHub o copia en Drive).', 'Anota en 1 línea dónde quedaste para retomarlo al volver.']),
      H('Programa 1 función nueva en tu proyecto', ['Escoge una mejora pequeña: un filtro, un botón o un mensaje.', 'Escríbela en VS Code y pruébala en el navegador.', 'Si algo se rompe, abre la consola (F12) y lee el error.', 'Guarda y anota qué aprendiste.']),
      H('Ejercicios de freeCodeCamp en el portátil', ['Entra a freecodecamp.org/espanol y abre el curso en el que vas.', 'Haz de 3 a 5 lecciones seguidas.', 'Si una te traba más de 10 minutos, mira la pista y sigue.', 'Anota la lección donde quedaste.'])],
    appCel: [
      H('freeCodeCamp en el celular: 3 lecciones', ['Abre freecodecamp.org/espanol en Chrome (funciona en el celular).', 'Inicia sesión para que se guarde tu avance.', 'Haz 3 lecciones del curso en el que vas.', 'Para gastar menos datos: carga la página con wifi y no cierres la pestaña.']),
      H('Mira un video corto de JavaScript y anota 3 ideas', ['En YouTube busca “JavaScript desde cero” y escoge un video de menos de 15 minutos.', 'Ponlo en 360p para gastar menos datos.', 'Pausa y anota 3 cosas nuevas.', 'Escribe un ejemplo propio de cada una.']),
      H('Figma en el celular: mejora 1 pantalla de tu app', ['Abre la app de Figma con tu cuenta.', 'Escoge una pantalla de tu catálogo: inicio, tienda o producto.', 'Mejora 1 cosa: espacios, tamaño de textos o un botón más claro.', 'Toma captura del antes y el después.'])],
    appPapel: [
      H('En el cuaderno: dibuja el wireframe de 1 pantalla', ['Dibuja el marco de un celular (más alto que ancho).', 'Pon cajas para cada parte: buscador, categorías y tarjetas de tiendas.', 'Escribe al lado qué hace cada botón.', 'Tómale foto para pasarlo a Figma cuando vuelvas.']),
      H('Escribe de memoria 10 etiquetas HTML y para qué sirven', ['Sin mirar nada, escribe 10 etiquetas (h1, p, img, a, ul…).', 'Al lado, para qué sirve cada una en 1 línea.', 'Marca con un círculo las que dudaste.', 'Cuando tengas internet, revisa solo esas.']),
      H('Escribe en papel una función de JS que filtre productos', ['Escribe un array de 5 productos con nombre y precio.', 'Escribe una función que devuelva los de menos de $100.000 usando filter.', 'Sigue el código paso a paso y escribe qué devolvería.', 'Cuando vuelvas, pruébala en la consola del navegador.'])],
    appNada: [H('Piensa 3 ideas para tu app y anótalas', ['Piensa qué te frustra al buscar productos en Quibdó.', 'Escribe 3 funciones que lo resolverían.', 'Marca la más fácil de hacer primero.'])],
    video: [
      H('Graba 10 tomas de B-roll del lugar donde estás', ['Busca buena luz: de día y con la luz de frente o de lado.', 'Graba 10 tomas de 5 a 10 segundos: paisaje, detalles, manos, comida, movimiento.', 'Mantén el celular quieto: apóyalo o usa las dos manos.', 'Guárdalas en un álbum “B-roll viaje” para usarlas después.']),
      H('Edita un reel de 15 s del viaje en Filmora móvil o CapCut', ['Escoge de 5 a 7 tomas cortas del viaje.', 'Pon primero la más llamativa: es tu gancho.', 'Corta al ritmo de una canción de la biblioteca de la app.', 'Agrega un texto corto y exporta en vertical (9:16).']),
      H('Graba la misma toma con luz natural y a contraluz', ['Escoge un objeto o una persona.', 'Graba una toma con la luz de frente y otra con la luz detrás.', 'Compáralas: ¿en cuál se ve mejor la cara o el objeto?', 'Anota la regla que aprendiste.'])],
    videoNet: H('Mira un tutorial de edición con audífonos y anota 3 trucos', ['En YouTube busca “Filmora tutorial” + un tema (cortes, textos o audio).', 'Míralo con audífonos y en 360p para gastar menos datos.', 'Anota 3 trucos.', 'Pruébalos en tu próxima edición.']),
    videoRitmo: H('Edita un video corto con cortes al ritmo de una canción', ['Escoge una canción con ritmo marcado.', 'Corta cada toma justo en el golpe de la música.', 'Que cada toma dure entre medio segundo y 2 segundos.', 'Mira el resultado y corrige los cortes que se sientan tarde.']),
    videoNada: H('Anota 5 ideas de video sobre tu viaje', ['Piensa qué le interesaría ver a alguien de Quibdó de este lugar.', 'Escribe 5 ideas, cada una con su gancho.', 'Marca la mejor para grabarla.']),
    agPapel: [
      H('Escribe 5 ganchos para reels en el cuaderno', ['Un gancho es la primera frase: la que hace que no pasen el video.', 'Escribe 5 para NEXO PC (ej.: “No compres un mouse sin ver esto”).', 'Usa fórmulas: pregunta, error común, número o secreto.', 'Encierra en un círculo el mejor.']),
      H('Escribe 1 guion de 30 s: gancho → problema → solución → CTA', ['Gancho (3 s): una frase que detenga el dedo.', 'Problema (8 s): qué le pasa al cliente.', 'Solución (15 s): qué hacer o qué ofreces.', 'CTA (4 s): qué debe hacer ahora (escribir por WhatsApp, seguirte).']),
      H('Observa 3 negocios del lugar: ¿cómo se promocionan?', ['Mira 3 negocios: letreros, redes, WhatsApp, volantes.', 'Anota qué hacen bien y qué les falta.', 'Escribe 1 idea que podrías venderle a un negocio así en Quibdó.'])],
    agCel: [
      H('Analiza 5 reels de negocios y por qué funcionan', ['Busca en Instagram o TikTok 5 reels de negocios con muchas vistas.', 'Para cada uno anota el gancho, la duración y el llamado a la acción.', 'Escribe qué patrón se repite en los 5.']),
      H('Escribe 5 ganchos en las notas del celular', ['Un gancho es la primera frase: la que hace que no pasen el video.', 'Escribe 5 para NEXO PC.', 'Usa fórmulas: pregunta, error común, número o secreto.', 'Marca el mejor.'])],
    nexo: [
      H('Visita una tienda de tecnología del lugar', ['Entra como cliente y pregunta por un mouse gamer y un SSD.', 'Anota precios, marcas y cómo te atendieron.', 'Fíjate qué venden más y cómo lo exhiben.', 'Compara con Quibdó: ¿qué copiarías para NEXO PC?']),
      H('Investiga un componente (GPU, CPU o SSD) y sus precios', ['Escoge un componente.', 'Busca 2 modelos populares y su precio en Colombia (Mercado Libre o tiendas).', 'Anota la diferencia de rendimiento entre los dos.', 'Si cambió algo, actualiza tu cotización de NEXO PC.']),
      H('Pregunta a 2 personas dónde compran tecnología y por qué', ['Pregunta con naturalidad: “¿Dónde compras tus cosas de tecnología?”.', 'Pregunta qué les gusta y qué no de esa tienda.', 'Anota las respuestas: son datos para tu estudio de mercado.'])],
    ingCel: [
      H('Anki: repasa 20 tarjetas', ['Abre AnkiDroid (gratis en la Play Store).', 'Repasa 20 tarjetas de tu mazo de vocabulario de tecnología.', 'Califícalas con honestidad (Again si no la sabías).', 'Agrega 2 palabras nuevas que veas en el viaje.']),
      null,
      H('Escribe 5 frases en inglés sobre tu viaje', ['Escribe 5 frases simples: dónde estás, qué hiciste, qué comiste.', 'Usa pasado: I went, I saw, I ate.', 'Léelas en voz alta.', 'Si tienes internet, revisa con un traductor solo las que dudes.'])],
    ingPod: H('Escucha 10 min de un podcast en inglés', ['Escoge un podcast para estudiantes, por ejemplo “6 Minute English” de la BBC.', 'Escúchalo con audífonos.', 'Anota 3 palabras nuevas.', 'Repite en voz alta 1 frase que te guste.']),
    ingLee: H('Lee 1 artículo corto en inglés', ['Busca una noticia corta de tecnología en inglés.', 'Léela la primera vez sin traductor.', 'Subraya 5 palabras que no sepas y búscalas.', 'Resume la noticia en 2 frases en inglés.']),
    ingPapel: H('Escribe 5 frases en inglés sobre tu día', ['Escribe 5 frases simples sobre lo que hiciste hoy.', 'Usa pasado: I went, I saw, I ate.', 'Léelas en voz alta.'])
  };
  function tripPlan(tr, d) {
    const idx = Math.max(0, Math.round((d - parseIso(tr.from)) / DAY)); const T = tr.tools || {}; const min = +tr.min || 60;
    const pick = (arr) => arr[idx % arr.length];
    const net = T.net !== 'no';
    const r = buildRutina(ejWeek(d), dow(d), { corta: true });
    const O = TRIP_OPC;
    const app = T.pc ? pick(O.appPc) : (T.cel && net) ? pick(O.appCel) : T.cuaderno ? pick(O.appPapel) : O.appNada[0];
    const video = T.cel ? pick(O.video.concat([(T.audif && net) ? O.videoNet : O.videoRitmo])) : O.videoNada;
    const ag = T.cuaderno ? pick(O.agPapel) : pick(O.agCel);
    const nexo = pick(O.nexo);
    const ing = T.cel ? pick([O.ingCel[0], (T.audif && net) ? O.ingPod : O.ingLee, O.ingCel[2]]) : O.ingPapel;
    const ej = H('Rutina de viaje: ' + r.nivelNombre + ' (versión corta)', ['Busca un espacio de 2 × 1 metros en el cuarto donde te quedes.', 'Abre la pestaña Ejercicio: ya tiene la versión corta (2 series).', 'Haz el calentamiento, la parte principal y el estiramiento.', 'Toca “Terminé la rutina” para que cuente en tu racha.'], 'ej');
    const L = [];
    const add = (cat, m, x) => L.push({ cat, min: m, t: x.t, how: x.how, open: x.open });
    if (min <= 30) { add('ejercicio', 10, ej); if (idx % 2) add('video', 10, video); else add('app', 10, app); add('agencia', 5, ag); add('ingles', 5, ing); }
    else if (min <= 60) { add('ejercicio', 15, ej); add('app', 15, app); add('video', 15, video); add('agencia', 10, ag); add('ingles', 5, ing); }
    else { add('ejercicio', 20, ej); add('app', 30, app); add('video', 30, video); add('agencia', 20, ag); add('nexo', 10, nexo); add('ingles', 10, ing); }
    return L;
  }
  const MOTIVOS = { viaje: '✈️ Viaje', vacaciones: '🏖️ Vacaciones', enfermo: '🤒 Enfermo', otro: '📍 Otro' };
  const minLabel = (m) => (m >= 120 ? '2 horas' : m >= 60 ? '1 hora' : '30 min');

  // ---------- UI básica ----------
  let tab = 'hoy', hoyView = 'dia', tFilter = 'pend';
  let markOpen = null, markNo = false; // bloque con el menú de marcar abierto
  let dayOffset = 0;
  let metaProj = 'nexo', metaArea = 0, metaView = 'mandala';
  let ejDay = null, weekView = null;

  function toast(msg, ms) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), ms || 2400); }
  function openSheet(html) { $('#sheet').innerHTML = '<div class="grab"></div>' + html; $('#sheet').classList.remove('hidden'); $('#sheetBg').classList.remove('hidden'); $('#sheet').scrollTop = 0; }
  function closeSheet() { $('#sheet').classList.add('hidden'); $('#sheetBg').classList.add('hidden'); }
  function openPage(html) { $('#page').innerHTML = html; $('#page').classList.remove('hidden'); $('#page').scrollTop = 0; }
  function closePage() { $('#page').classList.add('hidden'); }
  $('#sheetBg').addEventListener('click', closeSheet);

  window.handleBack = function () {
    if (!$('#sheet').classList.contains('hidden')) { closeSheet(); return true; }
    if (!$('#page').classList.contains('hidden')) { const pn = $('#prNotes'); if (pn) pn.dispatchEvent(new Event('change', { bubbles: true })); closePage(); render(); return true; }
    if (tab === 'hoy' && hoyView !== 'dia') { hoyView = 'dia'; render(); return true; }
    if (tab === 'metas' && metaView !== 'mandala') { metaView = 'mandala'; render(); return true; }
    if (tab !== 'hoy') { setTab('hoy'); return true; }
    if (dayOffset !== 0) { dayOffset = 0; render(); return true; }
    return false;
  };
  // ¿hay a dónde volver? (para mostrar el botón ‹ Atrás)
  window.canBack = function () {
    return !$('#sheet').classList.contains('hidden') || !$('#page').classList.contains('hidden') || tab !== 'hoy' || hoyView !== 'dia' || dayOffset !== 0;
  };

  function setTab(t) {
    tab = t;
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    render(); window.scrollTo(0, 0);
  }
  $('#nav').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { if (b.dataset.tab === 'hoy') dayOffset = 0; setTab(b.dataset.tab); } });

  function render() {
    const d = today(); const tr = tripOf(iso(d));
    $('#topRight').innerHTML = tr ? '✈️ Fuera de casa<br>' + d.getDate() + ' ' + MESES[d.getMonth()] : 'Semana ' + weekOf(d) + '<br>' + d.getDate() + ' ' + MESES[d.getMonth()];
    ({ hoy: renderHoy, metas: renderMetas, ejercicio: renderEj, semana: renderSemana, yo: renderYo })[tab]();
  }
  function updBanner() {
    const u = S.appUpd;
    if (!N || !u || !(u.version > APP_VERSION)) return ''; // en iPhone la app se actualiza sola
    return '<div class="banner" data-upd="1"><b>⬆️ Nueva versión ' + esc(u.nombre || '') + ' disponible</b><span>' + esc(u.notas || 'Toca para descargarla e instalarla encima. No pierdes tu progreso.') + '</span><div class="chipbtn">Descargar</div></div>';
  }
  function onUpd(e) { if (e.target.closest('[data-upd]')) { openUrl(S.appUpd.apk); toast('Descargando… cuando termine, ábrela e instálala'); return true; } return false; }

  // ---------- HOY ----------
  function renderHoy() {
    const np = pending().length;
    let h = updBanner();
    const na = np + (window.AG ? AG.pendingCount() : 0);
    h += '<div class="sw3b"><button class="' + (hoyView === 'dia' ? 'on' : '') + '" data-v="dia">Mi día</button><button class="' + (hoyView === 'agenda' ? 'on' : '') + '" data-v="agenda">📅 Agenda' + (na ? ' <span class="badge">' + na + '</span>' : '') + '</button><button class="' + (hoyView === 'asis' ? 'on' : '') + '" data-v="asis">✦ Asistente</button></div>';
    if (hoyView === 'agenda' && window.AG) { AG.render(h); return; }
    if (hoyView === 'asis' && window.AS) { AS.render(h); return; }

    const d = addDays(today(), dayOffset); const di = iso(d); const isToday = dayOffset === 0;
    const tr = tripOf(di);
    h += '<div class="dayhead"><button class="arr" data-a="prev">‹</button><div class="d"><b>' + fmtDate(d) + '</b><span>' + (tr ? '✈️ Fuera de casa' : 'Semana ' + weekOf(d)) + '</span>' +
      (isToday ? '' : '<br><button class="chipbtn" data-a="today">Volver a hoy</button>') + '</div><button class="arr" data-a="next">›</button></div>';

    if (tr) {
      const plan = tripPlan(tr, d); const dn = (tr.done && tr.done[di]) || {};
      const total = Math.round((parseIso(tr.to) - parseIso(tr.from)) / DAY) + 1; const n = Math.round((d - parseIso(tr.from)) / DAY) + 1;
      const ok = plan.filter((_, i) => dn[i]).length;
      h += '<div class="trip"><small>' + esc(MOTIVOS[tr.motivo] || '✈️ Fuera de casa').toUpperCase() + ' · DÍA ' + n + ' DE ' + total + ' · VUELVES EL ' + esc(fmtShort(addDays(parseIso(tr.to), 1)).toUpperCase()) + '</small><h3>Tu plan de hoy · ' + minLabel(tr.min) + '</h3><p>' + ok + ' de ' + plan.length + ' hechas</p></div>';
      plan.forEach((x, i) => {
        const c = CATS[x.cat];
        h += '<div class="item ' + (dn[i] ? 'done' : '') + '" style="--c:' + c.color + '"><button class="chk" data-tc="' + i + '">' + (dn[i] ? '✓' : '') + '</button><div class="bd" data-ti="' + i + '"><div class="t">' + esc(x.t) + '</div><div class="h">' + esc(c.n) + ' · ' + x.min + ' min · <span class="how-l">Ver cómo hacerla ›</span></div></div></div>';
      });
      h += '<div class="paused">⏸️ En pausa: colegio, trabajo, bloques normales y sus avisos.<br>🔥 Tu racha de ejercicio se congela, no se pierde. El nivel de ejercicio no sube hasta que vuelvas.</div>';
      $('#view').innerHTML = h;
      $('#view').onclick = (e) => {
        if (onUpd(e)) return;
        const v = e.target.closest('[data-v]'); if (v) { hoyView = v.dataset.v; renderHoy(); return; }
        const a = e.target.closest('[data-a]'); if (a) { dayOffset += a.dataset.a === 'prev' ? -1 : a.dataset.a === 'next' ? 1 : -dayOffset; renderHoy(); return; }
        const c = e.target.closest('[data-tc]'); if (c) { tr.done = tr.done || {}; tr.done[di] = tr.done[di] || {}; tr.done[di][c.dataset.tc] = !tr.done[di][c.dataset.tc]; save(); if (navigator.vibrate) navigator.vibrate(30); renderHoy(); return; }
        const ti = e.target.closest('[data-ti]'); if (ti) openTripItem(tr, d, +ti.dataset.ti);
      };
      return;
    }

    const bl = blocksOf(d); const nm = nowMin();
    const act = bl.filter((b) => CATS[b.cat].check && !pausa(b, d));
    const stc = { ok: 0, half: 0, no: 0 }; act.forEach((b) => { const st = blockState(di, b.id); if (st) stc[st]++; });
    const nPend = act.length - stc.ok - stc.half - stc.no;
    const anc = act.filter((b) => S.anchors[b.id]); const ancOk = anc.filter((b) => isDone(di, b.id)).length;
    let cur = null, next = null;
    if (isToday) { cur = bl.find((b) => !pausa(b, d) && mins(b.s) <= nm && nm < mins(b.e)); next = bl.find((b) => !pausa(b, d) && mins(b.s) > nm); }
    const ses = sessionsOn(d);

    if (isToday) {
      const b = cur || next;
      if (b) {
        const live = b === cur; let title = b.title, sub = topicOf(b, d).t, s0 = b.s, e0 = b.e;
        if (b.cat === 'colegio') {
          const cl = ses.find((x) => x.kind === 'clase' && (live ? mins(x.s) <= nm && nm < mins(x.e) : mins(x.s) > nm)) || null;
          if (cl) { title = cl.n; s0 = cl.s; e0 = cl.e; const due = tasksDueAt(atTime(d, cl.s), cl.keys); sub = due.length ? '📌 Hoy entregas: ' + due.map((t) => t.title).join(', ') : 'Sin entregas en esta clase'; }
          else if (live) { title = 'Descanso'; sub = 'Recarga energía'; }
        }
        const pct = live ? Math.round(100 * (nm - mins(s0)) / Math.max(1, mins(e0) - mins(s0))) : 0;
        h += '<div class="now ' + (live ? '' : 'off') + '" data-open="' + b.id + '"><small>● ' + (live ? 'AHORA' : 'SIGUE') + ' · ' + h12(s0) + ' – ' + h12(e0) + '</small><h3>' + (S.anchors[b.id] ? '⚓ ' : '') + esc(title) + '</h3><p>' + esc(sub) + '</p>' + (live ? '<div class="bar"><i style="width:' + Math.min(100, pct) + '%"></i></div>' : '') + '</div>';
      } else {
        h += '<div class="now off"><small>● DESCANSO</small><h3>A dormir 😴</h3><p>Mañana a las 5:00 am empieza tu día.</p></div>';
      }
    }
    if (act.length) {
      const L = act.length; const a1 = stc.ok / L * 100, a2 = (stc.ok + stc.half) / L * 100, a3 = (stc.ok + stc.half + stc.no) / L * 100;
      const pct = Math.round((stc.ok + stc.half * 0.5) / L * 100);
      h += '<div class="dayr"><div class="ring2" style="background:conic-gradient(var(--grn) 0 ' + a1 + '%,var(--amb) ' + a1 + '% ' + a2 + '%,var(--red) ' + a2 + '% ' + a3 + '%,var(--line) ' + a3 + '% 100%)" role="img" aria-label="' + stc.ok + ' de ' + L + ' bloques hechos"><div>' + stc.ok + '/' + L + '</div></div>' +
        '<div class="leg2"><b class="g">' + stc.ok + '</b> hechos · <b class="a">' + stc.half + '</b> a medias · <b class="r">' + stc.no + '</b> no pude<br>' + (nPend ? nPend + ' por marcar · ' : '') + 'día al <b>' + pct + '%</b>' + (anc.length ? ' · ⚓ ' + ancOk + '/' + anc.length : '') + '</div></div>';
    }
    if (isToday) {
      const T3 = top3(d);
      if (T3.length) h += '<div class="top3"><div class="k">🎯 TUS 3 DE HOY · SI SOLO HACES ESTO, GANASTE EL DÍA</div>' + T3.map((x) => '<div class="r ' + (x.st === 'ok' || x.st === 'half' ? 'ok' : '') + '"><button class="c3" data-t3="' + x.b.id + '" aria-label="Marcar">' + (x.st === 'ok' ? '✓' : x.st === 'half' ? '½' : '') + '</button><span data-open="' + x.b.id + '">' + esc(CATS[x.b.cat].n.replace(' de marketing', '').replace(' (Filmora)', '') + ': ' + (x.tp.t || x.b.title)) + ' <i>' + h12(x.b.s) + '</i></span></div>').join('') + '</div>';
    }
    const cntH = isToday && window.CNT && !NO_METAS ? CNT.hoyHtml() : '';
    if (cntH && nm >= 18 * 60) h += cntH;
    if (isToday && !NO_METAS) { const R = ruta(null); const n = R.atrasadas.length; h += '<button class="rutaline ' + (n ? 'bad' : '') + '" data-ruta="1">🧭 Tu ruta: ' + (n ? n + ' meta(s) atrasada(s) · deberías estar en ' + esc(P[R.atrasadas[0].pid].short) + ' ' + R.atrasadas[0].id : 'vas al día ✓ · ' + R.enCurso.length + ' meta(s) en curso') + ' ›</button>'; }
    if (window.PR) h += PR.hoyHtml(d); // ⚡ lo organizado, arriba y a la vista
    if (!Object.keys(S.anchors).length && isToday) h += '<div class="box">⚓ <strong>Escoge 3 bloques ancla:</strong> los que no negocias pase lo que pase. Toca un bloque y luego “Hacer bloque ancla”. Cuando esos estén firmes, sumas los demás.</div>';
    bl.forEach((b) => {
      const c = CATS[b.cat]; const pz = pausa(b, d);
      if (!c.check || pz) { h += '<div class="mini-row"' + (pz ? '' : ' data-eb="' + b.id + '"') + '><b>' + h12(b.s) + '</b>' + (pz ? '⏸️ ' : '') + esc(b.title) + (pz ? ' · ' + pz : b.cat === 'libre' ? ' <span class="mini-ed">✎</span>' : '') + '</div>'; return; }
      const st = blockState(di, b.id); const tp = topicOf(b, d);
      const isCur = cur && cur.id === b.id; const why = blockWhy(di, b.id);
      const stTxt = st === 'half' ? '½ A medias' : st === 'no' ? '✕ No pude' + (why ? ' · ' + why : '') : '';
      h += '<div class="item ' + ({ ok: 'done ', half: 'half ', no: 'no ' }[st] || '') + (isCur ? 'cur' : '') + '" style="--c:' + c.color + '">' +
        '<button class="chk" data-chk="' + b.id + '" aria-label="Marcar ' + esc(b.title) + '">' + ({ ok: '✓', half: '½', no: '✕' }[st] || '') + '</button>' +
        '<div class="bd" data-open="' + b.id + '"><div class="t">' + (S.anchors[b.id] ? '⚓ ' : '') + (b.fijo ? '🔒 ' : '') + esc(b.title) + '</div><div class="h">' + h12(b.s) + ' – ' + h12(b.e) + (stTxt ? ' · <span class="stt">' + esc(stTxt) + '</span>' : '') + '</div>' +
        (tp.t && b.cat !== 'colegio' && !stTxt ? '<div class="sub">' + esc(tp.t) + '</div>' : '') + (tp.carry && !st ? '<div class="carry">↪ ' + tp.carry + ' bloque' + (tp.carry > 1 ? 's' : '') + ' sin hacer' + (tp.carry >= 3 ? ' · sigue aquí' : '') + '</div>' : '') + (isCur && !st ? '<div class="sub cy">AHORA · toca el cuadro para marcar</div>' : '') + '</div>' +
        (c.tag ? '<div class="tag">' + c.tag + '</div>' : '') + '</div>';
      if (markOpen === di + '|' + b.id) {
        h += '<div class="mpop"><div class="mq">¿Cómo te fue en ' + esc(b.title) + '?</div><div class="mopts"><button class="o1" data-ms="ok">✓ Hecho</button><button class="o2" data-ms="half">½ A medias</button><button class="o3" data-ms="no">✕ No pude</button></div>' +
          (markNo || st === 'no' ? '<div class="mq" style="margin-top:8px">¿Qué pasó? (opcional)</div><div class="mwhy">' + MOTIVOS_NO.map((m) => '<button class="' + (why === m ? 'on' : '') + '" data-mw="' + esc(m) + '">' + esc(m) + '</button>').join('') + '</div>' : '') +
          (st ? '<button class="mclr" data-ms="clr">Quitar la marca</button>' : '') + '</div>';
      }
      if (b.cat === 'colegio') {
        (CLASES[b.d] || []).forEach((x) => {
          const keys = x[2].split(' / '); const isDesc = x[2] === 'Descanso';
          const due = isDesc ? [] : tasksDueAt(atTime(d, x[0]), keys);
          const curCl = isToday && mins(x[0]) <= nm && nm < mins(x[1]);
          h += '<div class="cls ' + (curCl ? 'cur' : '') + '" style="--c:' + (isDesc ? '#4a5570' : subj(keys[0]).color) + '"><b>' + h12(x[0]).replace(' am', '').replace(' pm', '') + '</b><span class="n' + (isDesc ? ' dim' : '') + '">' + esc(className(x[2])) + '</span>' +
            (due.length ? '<span class="pin">📌 ' + (due[0].type === 'examen' ? 'EXAMEN' : due[0].type === 'expo' ? 'EXPONES' : 'ENTREGA') + '</span>' : '') + '</div>';
        });
      }
    });
    if (cntH && nm < 18 * 60) h += cntH;
    h += '<button class="addb" data-addb="1">＋ Agregar un bloque a este día</button><button class="fab" data-qa="1" aria-label="Nueva tarea">+</button>';
    $('#view').innerHTML = h;
    $('#view').onclick = (e) => {
      if (onUpd(e)) return;
      if (window.PR && PR.hoyClick(e, d)) return;
      const v = e.target.closest('[data-v]'); if (v) { hoyView = v.dataset.v; renderHoy(); return; }
      const a = e.target.closest('[data-a]'); if (a) { markOpen = null; dayOffset += a.dataset.a === 'prev' ? -1 : a.dataset.a === 'next' ? 1 : -dayOffset; renderHoy(); return; }
      if (e.target.closest('[data-ruta]')) { metaView = 'ruta'; rutaProj = ''; setTab('metas'); return; }
      if (window.CNT && CNT.hoyClick(e)) { renderHoy(); return; }
      const c = e.target.closest('[data-chk]'); if (c) { const k = di + '|' + c.dataset.chk; markOpen = markOpen === k ? null : k; markNo = false; renderHoy(); return; }
      const ms = e.target.closest('[data-ms]');
      if (ms && markOpen) { markBlock(markOpen.split('|')[0], markOpen.split('|')[1], ms.dataset.ms); return; }
      const mw = e.target.closest('[data-mw]');
      if (mw && markOpen) { const [d0, b0] = markOpen.split('|'); setBlockState(d0, b0, 'no', mw.dataset.mw); markOpen = null; markNo = false; scheduleNotifs(); renderHoy(); toast(vozNo(mw.dataset.mw) || 'Anotado', 4500); return; }
      if (e.target.closest('[data-qa]')) { quickAdd(); return; }
      const eb = e.target.closest('[data-eb]'); if (eb) { blockForm(d, blockById(eb.dataset.eb, d)); return; }
      if (e.target.closest('[data-addb]')) { blockForm(d, null); return; }
      const t3 = e.target.closest('[data-t3]'); if (t3) { const bid = t3.dataset.t3; setBlockState(di, bid, blockState(di, bid) ? null : 'ok'); if (navigator.vibrate) navigator.vibrate(30); scheduleNotifs(); renderHoy(); return; }
      const o = e.target.closest('[data-open]'); if (o) openBlock(blockById(o.dataset.open, d), d);
    };
  }
  // ---------- 🎯 Tus 3 de hoy ----------
  const TOP_ORDER = ['app', 'video', 'creador', 'agencia', 'nexo', 'cliente', 'ingles', 'tareas'];
  function top3(d) {
    const di = iso(d);
    const L = blocksOf(d).filter((b) => TOP_ORDER.includes(b.cat) && !pausa(b, d)).map((b) => ({ b, tp: topicOf(b, d), st: blockState(di, b.id) }));
    L.sort((x, y) => ((y.tp.carry || 0) > 0) - ((x.tp.carry || 0) > 0) || TOP_ORDER.indexOf(x.b.cat) - TOP_ORDER.indexOf(y.b.cat) || mins(x.b.s) - mins(y.b.s));
    return L.slice(0, 3).sort((x, y) => mins(x.b.s) - mins(y.b.s));
  }
  // ---------- ＋ guardar una tarea rápido ----------
  function quickAdd() {
    let when = 'hoy';
    const parse = (raw) => {
      const A = window.AS; const t = String(raw).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      let day = A ? A.parseDay(t) : null; const time = A ? A.parseTime(t) : null;
      if (!day) day = when === 'manana' ? addDays(today(), 1) : today();
      const subj = A && A.parseSubj(t); const type = A && A.parseType(t);
      let title = (A && A.cleanTitle ? A.cleanTitle(raw) : raw.trim())
        .replace(/\s*(a las?\s*)?\b\d{1,2}([:.]\d{2})?\s*(am|pm|a\.\s?m\.?|p\.\s?m\.?)(?![a-z])/gi, '')
        .replace(/\s+(para\s+)?(el\s+|este\s+|esta\s+)?(hoy|pasado ma[nñ]ana|ma[nñ]ana|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|semana)\b/gi, '')
        .replace(/\s{2,}/g, ' ').trim();
      if (!title) title = raw.trim();
      return { day, time, subj, type, title, week: when === 'semana' && !(A && A.parseDay(t)) };
    };
    const info = (p) => {
      if (!p.title) return '';
      if (p.subj && p.type) return '📚 ' + (TT[p.type] || TT.tarea).n + ' de ' + subj(p.subj).n + ' · ' + fmtShort(p.day) + ' · con sus avisos';
      if (p.week) return '🔄 “' + p.title + '” · para esta semana, sin hora fija';
      return '✓ “' + p.title + '” · ' + fmtShort(p.day) + (p.time ? ' · ' + h12(p.time) + ' · te aviso 1 h antes' : ' · sin hora');
    };
    const draw = (txt) => {
      openSheet('<div class="det"><div class="f" style="margin-top:0">＋ NUEVA TAREA</div><input id="qaT" maxlength="120" placeholder="Ej: comprar cartulina mañana 4 pm" value="' + esc(txt || '') + '" autocomplete="off">' +
        '<div class="chips wrap" style="margin-top:8px">' + [['hoy', 'Hoy'], ['manana', 'Mañana'], ['semana', 'Esta semana']].map(([k, n]) => '<button class="chip ' + (when === k ? 'on' : '') + '" style="--cc:#00e5ff" data-qw="' + k + '">' + n + '</button>').join('') + '</div>' +
        '<div class="muted" id="qaI" style="margin-top:8px;color:#00e676"></div><button class="btn" data-qs="1">Guardar</button>' +
        '<p class="muted" style="margin-top:8px">Escribe como hablas: “examen de química el viernes”, “llamar al proveedor 3 pm”. Va directo a tu Agenda.</p></div>');
      const inp = $('#qaT'); const upd = () => { $('#qaI').textContent = info(parse(inp.value)); };
      inp.oninput = upd; inp.onkeydown = (e) => { if (e.key === 'Enter') saveQ(); }; upd(); setTimeout(() => inp.focus(), 50);
    };
    const saveQ = () => {
      const raw = $('#qaT').value.trim(); if (!raw) { toast('Escribe la tarea'); return; }
      const p = parse(raw); const id = (x) => x + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      if (p.subj && p.type) {
        const ses = nextSessions(p.subj, Date.now(), 12); const s = ses.find((x) => iso(x.d) === iso(p.day)) || (window.AS && AS.parseDay(raw.toLowerCase()) ? null : ses[0]);
        const due = s ? s.at : atTime(p.day, p.time || '07:00');
        S.tasks.push({ id: id('t'), type: p.type, title: p.title, subj: p.subj, due, mode: s ? 'pick' : 'custom', notes: '', created: Date.now(), done: false });
      } else if (window.AG && p.time && !p.week) {
        const st = atTime(p.day, p.time); AG.addCita({ title: p.title, start: st, end: st + 30 * 60000, place: null });
      } else if (window.AG) {
        const dl = p.week ? atTime(addDays(today(), 7 - dow(today())), '21:00') : atTime(p.day, '21:00');
        AG.addFlex({ title: p.title, dur: 30, deadline: dl, place: null, tipo: 'general', slot: null });
      }
      save(); scheduleNotifs(); closeSheet(); render(); toast('✓ Guardada en tu Agenda');
    };
    draw('');
    $('#sheet').onclick = (e) => {
      const w = e.target.closest('[data-qw]'); if (w) { when = w.dataset.qw; const v = $('#qaT').value; draw(v); return; }
      if (e.target.closest('[data-qs]')) saveQ();
    };
  }
  // ---------- ✎ cambiar un bloque (solo hoy o siempre) ----------
  const EDIT_CATS = ['app', 'video', 'creador', 'agencia', 'nexo', 'ingles', 'ejercicio', 'cliente', 'libre', 'rutina'];
  const catLabel = (k) => ({ video: 'Edición', agencia: 'Agencia', creador: 'Creador', tareas: 'Tareas', rutina: 'Otro', ingles: 'Inglés', dormir: 'Dormir', colegio: 'Colegio', cliente: 'Cliente', ocupado: 'Ocupado', trabajo: 'Trabajo' }[k] || CATS[k].n);
  function blockForm(d, b) {
    const isT = iso(d) === iso(today()); const dn = DIAS[dow(d)].toLowerCase() + (dow(d) >= 6 ? 's' : ''); const k = keyOf(d);
    const h0 = isT ? Math.min(22, Math.floor(nowMin() / 60) + 1) : 15; const p2 = (n) => String(n).padStart(2, '0');
    const F2 = b ? { cat: b.cat, s: b.s, e: b.e, title: b.title, scope: b.hoy ? 'hoy' : 'siempre', fijo: !!b.fijo } : { cat: 'app', s: p2(h0) + ':00', e: p2(Math.min(23, h0 + 1)) + ':00', title: CATS.app.n, scope: 'hoy', fijo: false };
    let typed = false;
    const draw = () => {
      const cats = EDIT_CATS.includes(F2.cat) ? EDIT_CATS : [F2.cat].concat(EDIT_CATS);
      let h = '<div class="det"><h2>' + (b ? '✎ Cambiar bloque' : '＋ Nuevo bloque') + '</h2>';
      h += '<div class="f">¿QUÉ VAS A HACER?</div><div class="chips wrap">' + cats.map((c) => '<button class="chip ' + (F2.cat === c ? 'on' : '') + '" style="--cc:' + CATS[c].color + '" data-bc="' + c + '">' + esc(catLabel(c)) + '</button>').join('') + '</div>';
      h += '<div class="f">NOMBRE</div><input id="bfT" maxlength="60" value="' + esc(F2.title) + '">';
      h += '<div class="f">HORA</div><div class="row2"><input type="time" id="bfS" value="' + F2.s + '"><input type="time" id="bfE" value="' + F2.e + '"></div>';
      h += '<div class="f">¿SE PUEDE MOVER?</div><div class="row2"><button class="btn ' + (!F2.fijo ? 'cy' : 'alt') + ' sm" data-bfx="0">↔ Flexible</button><button class="btn ' + (F2.fijo ? 'cy' : 'alt') + ' sm" data-bfx="1">🔒 Fijo</button></div>';
      h += '<div class="f">¿PARA CUÁNDO?</div><div class="row2"><button class="btn ' + (F2.scope === 'hoy' ? 'cy' : 'alt') + ' sm" data-bsc="hoy">' + (isT ? 'Solo hoy' : 'Solo este día') + '</button><button class="btn ' + (F2.scope === 'siempre' ? 'cy' : 'alt') + ' sm" data-bsc="siempre">Todos los ' + dn + '</button></div>';
      h += '<p class="muted" style="margin-top:6px">' + (F2.scope === 'hoy' ? 'Anota lo que de verdad hiciste. Tu horario no cambia.' : 'Cambia los ' + dn + ' de tu horario de ' + KEY_N[k] + '.') + '</p>';
      h += '<button class="btn" data-bsave="1">Guardar</button>' + (b ? '<button class="btn alt sm" data-bdel="1">Quitar este bloque</button>' : '') + '</div>';
      openSheet(h);
    };
    const read = () => { const t = $('#bfT'), a = $('#bfS'), z = $('#bfE'); if (t) F2.title = t.value; if (a && a.value) F2.s = a.value; if (z && z.value) F2.e = z.value; };
    draw();
    $('#sheet').oninput = (e) => { if (e.target.id === 'bfT') typed = true; };
    $('#sheet').onclick = (e) => {
      const bc = e.target.closest('[data-bc]'); if (bc) { read(); F2.cat = bc.dataset.bc; if (!typed || !F2.title.trim()) { F2.title = F2.cat === 'libre' ? 'Libre' : F2.cat === 'rutina' ? 'Otro' : CATS[F2.cat].n; typed = false; } draw(); return; }
      const sc = e.target.closest('[data-bsc]'); if (sc) { read(); F2.scope = sc.dataset.bsc; draw(); return; }
      const fx = e.target.closest('[data-bfx]'); if (fx) { read(); F2.fijo = fx.dataset.bfx === '1'; draw(); return; }
      if (e.target.closest('[data-bsave]')) {
        read(); if (mins(F2.e) <= mins(F2.s)) { toast('La hora final va después de la inicial'); return; }
        saveBlock(d, b, Object.assign({ s: F2.s, e: F2.e, cat: F2.cat, title: (F2.title || '').trim() || CATS[F2.cat].n }, F2.fijo ? { fijo: true } : {}), F2.scope);
        closeSheet(); render(); toast(F2.scope === 'hoy' ? '✓ Cambiado solo ' + (isT ? 'hoy' : 'ese día') : '✓ Cambiaste los ' + dn);
        return;
      }
      const del = e.target.closest('[data-bdel]');
      if (del) {
        if (!del.dataset.sure) { del.dataset.sure = '1'; del.textContent = '¿Seguro? ' + (F2.scope === 'hoy' ? 'Solo este día' : 'Todos los ' + dn) + ' · toca otra vez'; del.style.color = '#ff5252'; return; }
        saveBlock(d, b, null, F2.scope); closeSheet(); render(); toast('Bloque quitado');
      }
    };
  }
  // marca un bloque desde el menú (Hecho, A medias, No pude, Quitar)
  function markBlock(di, bid, st) {
    if (st === 'clr') { setBlockState(di, bid, null); markOpen = null; scheduleNotifs(); renderHoy(); toast('Marca quitada'); return; }
    setBlockState(di, bid, st);
    if (navigator.vibrate) navigator.vibrate(st === 'ok' ? 30 : 15);
    if (st === 'no') { markNo = true; scheduleNotifs(); renderHoy(); return; }
    markOpen = null; scheduleNotifs(); renderHoy();
    const b = blockById(bid, parseIso(di));
    if (st === 'half') toast(voz('medias') || '½ Anotado a medias', 4500);
    else toast(voz('celebrar', countOkDay(di) + ' bloque(s)') || '✓ ¡Bien! ' + (b ? b.title : ''), 3500);
  }
  function countOkDay(di) { return Object.keys(S.done[di] || {}).length; }

  function openTripItem(tr, d, i) {
    const x = tripPlan(tr, d)[i]; const c = CATS[x.cat]; const di = iso(d); const dn = !!(tr.done && tr.done[di] && tr.done[di][i]);
    let h = '<div class="pill" style="background:' + c.color + '33;color:' + c.color + '">' + esc(c.n.toUpperCase()) + ' · ' + x.min + ' MIN · MODO FUERA DE CASA</div><div class="det"><h2>' + esc(x.t) + '</h2><div class="sec">Cómo hacerla</div>';
    x.how.forEach((s2, k) => { h += '<div class="step"><b>' + (k + 1) + '</b><span>' + esc(s2) + '</span></div>'; });
    h += '<div class="box">⏱️ <strong>Tiempo:</strong> ' + x.min + ' minutos. Si te sobra tiempo, repite el último paso; si te falta, haz solo el primero.</div>';
    if (x.open === 'ej') h += '<button class="btn cy" data-goej="1">Abrir la rutina</button>';
    h += '<button class="btn ' + (dn ? 'alt' : '') + '" data-tg="1">' + (dn ? 'Desmarcar' : '✓ Marcar como hecha') + '</button></div>';
    openSheet(h);
    $('#sheet').onclick = (e) => {
      if (e.target.closest('[data-goej]')) { closeSheet(); ejDay = dow(d); setTab('ejercicio'); return; }
      if (e.target.closest('[data-tg]')) { tr.done = tr.done || {}; tr.done[di] = tr.done[di] || {}; tr.done[di][i] = !dn; save(); closeSheet(); renderHoy(); toast(dn ? 'Desmarcada' : '✓ ¡Bien! Tarea de viaje lista'); }
    };
  }
  function openBlock(b, d) {
    const c = CATS[b.cat]; const tp = topicOf(b, d); const di = iso(d); const dn = isDone(di, b.id);
    if (b.cat === 'ejercicio' && !tripOf(di)) { ejDay = dow(d); setTab('ejercicio'); return; }
    let h = '<div class="pill" style="background:' + c.color + '33;color:' + c.color + '">' + (c.tag || c.n) + ' · ' + DIAS[b.d] + ' ' + h12(b.s) + ' – ' + h12(b.e) + '</div>';
    h += '<div class="det"><h2>' + (S.anchors[b.id] ? '⚓ ' : '') + esc(b.title) + '</h2>';
    if (tp.t) h += '<div class="box"><strong>' + esc(tp.t) + '</strong>' + (tp.d && b.cat !== 'colegio' ? '<br>' + esc(tp.d) : '') + '</div>';
    if (b.cat === 'colegio') {
      (CLASES[b.d] || []).forEach((x) => {
        const keys = x[2].split(' / '); const due = x[2] === 'Descanso' ? [] : tasksDueAt(atTime(d, x[0]), keys);
        h += '<div class="cls" style="--c:' + (x[2] === 'Descanso' ? '#4a5570' : subj(keys[0]).color) + '"><b>' + h12(x[0]) + '</b><span class="n">' + esc(className(x[2])) + '</span>' + (due.length ? '<span class="pin">📌 ' + esc(due.map((t) => t.title).join(', ')) + '</span>' : '') + '</div>';
      });
    }
    if (tp.carry) {
      h += '<div class="box warn">↪ <strong>Esta tarea lleva ' + tp.carry + ' bloque' + (tp.carry > 1 ? 's' : '') + ' sin hacerse.</strong> No se pierde: pasa al siguiente bloque de ' + esc(c.n) + ' hasta que la marques ✓ o ½.' + (tp.carry >= 3 && window.AS ? '<br><br><b>Harvey:</b> ' + esc(AS.line('reprogramar', 'h', '', tp.t)) : '') + '</div>';
      if (tp.carry >= 3) h += '<div class="row2"><button class="btn cy sm" data-short="1">Hacer versión corta (20 min)</button><button class="btn alt sm" data-skip="' + tp.qi + '">Saltar esta tarea</button></div>';
    }
    if (tp.meta && tp.pid) {
      const g = getMeta(tp.pid, tp.meta);
      if (g) h += '<div class="box tool">🎯 Avanzas en la meta <strong>' + tp.meta + '</strong> de ' + esc(P[tp.pid].name) + ': ' + esc(g.meta.t) + '<br><button class="chipbtn" data-meta="' + tp.pid + '|' + tp.meta + '">Ver meta completa</button></div>';
    }
    if (c.check) {
      const st = blockState(di, b.id);
      h += '<div class="sec">¿Cómo te fue?</div><div class="mopts big"><button class="o1 ' + (st === 'ok' ? 'sel' : '') + '" data-bs="ok">✓ Hecho</button><button class="o2 ' + (st === 'half' ? 'sel' : '') + '" data-bs="half">½ A medias</button><button class="o3 ' + (st === 'no' ? 'sel' : '') + '" data-bs="no">✕ No pude</button></div>';
      if (st) h += '<button class="btn alt sm" data-bs="clr">Quitar la marca</button>';
      h += '<button class="btn alt" data-chg="1">✎ Cambiar este bloque</button>';
      h += '<button class="btn alt" data-anc="1">' + (S.anchors[b.id] ? '⚓ Quitar de bloques ancla' : '⚓ Hacer bloque ancla') + '</button>';
    }
    h += '</div>';
    openSheet(h);
    $('#sheet').onclick = (e) => {
      if (e.target.closest('[data-chg]')) { blockForm(d, b); return; }
      if (e.target.closest('[data-short]')) { closeSheet(); toast('Haz solo el primer paso de la tarea en 20 minutos y márcala ½. Con eso avanza.', 5000); return; }
      const sk = e.target.closest('[data-skip]'); if (sk) { skipTask(b.cat, +sk.dataset.skip); closeSheet(); render(); toast('Tarea saltada: el siguiente bloque trae la que sigue'); return; }
      const bs = e.target.closest('[data-bs]');
      if (bs) { closeSheet(); const v0 = bs.dataset.bs; if (v0 === 'no') { tab = 'hoy'; hoyView = 'dia'; dayOffset = Math.round((d - today()) / DAY); markOpen = di + '|' + b.id; markNo = true; setBlockState(di, b.id, 'no'); scheduleNotifs(); setTab('hoy'); return; } setBlockState(di, b.id, v0 === 'clr' ? null : v0); scheduleNotifs(); render(); toast(v0 === 'clr' ? 'Marca quitada' : v0 === 'half' ? (voz('medias') || '½ A medias') : (voz('celebrar', countOkDay(di) + ' bloque(s)') || '¡Bien! ✓'), v0 === 'clr' ? 2000 : 4000); }
      if (e.target.closest('[data-anc]')) {
        if (S.anchors[b.id]) delete S.anchors[b.id]; else S.anchors[b.id] = true; save(); closeSheet(); render(); scheduleNotifs();
        toast(S.anchors[b.id] ? '⚓ Ahora es un bloque ancla (' + Object.keys(S.anchors).length + ')' : 'Ya no es bloque ancla');
      }
      const m = e.target.closest('[data-meta]'); if (m) { closeSheet(); const [pid, id] = m.dataset.meta.split('|'); openMeta(pid, id); }
    };
  }

  // ---------- TAREAS (ventana dentro de Hoy) ----------
  function remChips(t) {
    const now = Date.now();
    return '<div class="rem">' + remindersOf(t).map((r) => {
      const cls = r.at < (t.created || 0) ? 'skip' : r.at <= now ? 'ok' : '';
      return '<span class="' + cls + '">' + r.l + (cls === 'ok' ? ' ✓' : '') + '</span>';
    }).join('') + '</div>';
  }
  function taskCard(t) {
    const s = subj(t.subj); const ty = TT[t.type] || TT.tarea;
    return '<div class="task ' + (t.done ? 'done' : '') + '" style="--c:' + s.color + '"><button class="chk" data-tk="' + t.id + '">' + (t.done ? '✓' : '') + '</button>' +
      '<div class="bd" data-to="' + t.id + '"><div class="tg">' + esc(s.n.toUpperCase()) + ' · ' + ty.i + ' ' + ty.n.toUpperCase() + '</div><div class="t">' + esc(t.title) + '</div>' +
      '<div class="h">' + fmtWhen(t.due) + (t.mode === 'next' ? ' · ' + (s.kind === 'trabajo' ? 'próximo turno' : 'próxima clase') : '') + '</div>' + (t.done ? '' : remChips(t)) + '</div></div>';
  }
  function tareasHtml() {
    const chips = [['pend', 'Pendientes'], ['colegio', 'Colegio'], ['trabajo', 'Trabajo'], ['hechas', 'Hechas']];
    let h = '<div class="chips">' + chips.map(([k, n]) => '<button class="chip ' + (tFilter === k ? 'on' : '') + '" data-tf="' + k + '">' + n + '</button>').join('') + '</div>';
    let L = S.tasks.slice();
    if (tFilter === 'hechas') L = L.filter((t) => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 40);
    else {
      L = L.filter((t) => !t.done);
      if (tFilter === 'colegio') L = L.filter((t) => ['clase', 'curso'].includes(subj(t.subj).kind));
      if (tFilter === 'trabajo') L = L.filter((t) => subj(t.subj).kind === 'trabajo');
      L.sort((a, b) => a.due - b.due);
    }
    if (!L.length) h += '<div class="empty">' + (tFilter === 'hechas' ? 'Todavía no has marcado tareas como hechas.' : '🎉 No tienes tareas pendientes aquí.<br>Toca <b>+</b> para agregar una.') + '</div>';
    else if (tFilter === 'hechas') h += L.map(taskCard).join('');
    else {
      const G = [['⛔ ATRASADAS', (t) => t.due < Date.now(), 'red'], ['📌 HOY', (t) => dayDiff(t.due) === 0, 'red'], ['⚠️ PARA MAÑANA', (t) => dayDiff(t.due) === 1, 'red'],
        ['ESTA SEMANA', (t) => dayDiff(t.due) > 1 && dayDiff(t.due) <= 7, ''], ['MÁS ADELANTE', (t) => dayDiff(t.due) > 7, '']];
      const used = new Set();
      G.forEach(([n, f, cl]) => { const g = L.filter((t) => !used.has(t.id) && f(t)); if (!g.length) return; g.forEach((t) => used.add(t.id)); h += '<div class="sec ' + cl + '">' + n + '</div>' + g.map(taskCard).join(''); });
    }
    h += '<button class="fab" data-new="1">+</button>';
    return h;
  }
  function onTareasClick(e) {
    if (onUpd(e)) return;
    const v = e.target.closest('[data-v]'); if (v) { hoyView = v.dataset.v; renderHoy(); return; }
    const f = e.target.closest('[data-tf]'); if (f) { tFilter = f.dataset.tf; renderHoy(); return; }
    const k = e.target.closest('[data-tk]'); if (k) { const t = S.tasks.find((x) => x.id === k.dataset.tk); setTaskDone(t.id, !t.done); if (!t.done) toast('Tarea pendiente otra vez'); else { toast('✓ ¡Tarea lista! Sus avisos se cancelaron'); if (navigator.vibrate) navigator.vibrate(30); } scheduleNotifs(); renderHoy(); return; }
    const o = e.target.closest('[data-to]'); if (o) { openTask(o.dataset.to); return; }
    if (e.target.closest('[data-new]')) openTaskForm(null);
  }
  function openTask(id) {
    const t = S.tasks.find((x) => x.id === id); if (!t) return; const s = subj(t.subj); const ty = TT[t.type] || TT.tarea;
    let h = '<div class="pill" style="background:' + s.color + '33;color:' + s.color + '">' + esc(s.n.toUpperCase()) + ' · ' + ty.i + ' ' + ty.n.toUpperCase() + '</div><div class="det"><h2>' + esc(t.title) + '</h2>';
    h += '<div class="box">📅 <strong>Entrega:</strong> ' + fmtWhen(t.due) + '</div>';
    if (t.notes) h += '<div class="box">📝 ' + esc(t.notes) + '</div>';
    if (!t.done) {
      h += '<div class="sec">Recordatorios</div>';
      remindersOf(t).forEach((r) => {
        const st = r.at < (t.created || 0) ? '<span class="dim">ya había pasado · se omitió</span>' : r.at <= Date.now() ? '<span class="ok">enviado ✓</span>' : fmtWhen(r.at) + (r.moved ? ' <span class="mv">(movido: caía de noche)</span>' : '');
        h += '<div class="set-row"><span>' + r.l.replace(' d', ' días antes').replace('1 días', '1 día').replace(' h', ' hora antes') + '</span><span style="font-size:12px;text-align:right">' + st + '</span></div>';
      });
    }
    h += '<button class="btn ' + (t.done ? 'alt' : '') + '" data-d="1">' + (t.done ? 'Marcar como pendiente' : '✓ YA LA HICE') + '</button><div class="row2"><button class="btn alt sm" data-ed="1">Editar</button><button class="btn alt sm" data-del="1">Eliminar</button></div></div>';
    openSheet(h);
    $('#sheet').onclick = (e) => {
      if (e.target.closest('[data-d]')) { setTaskDone(t.id, !t.done); closeSheet(); scheduleNotifs(); render(); toast(t.done ? '✓ ¡Tarea lista!' : 'Pendiente otra vez'); }
      if (e.target.closest('[data-ed]')) { closeSheet(); openTaskForm(t); }
      const del = e.target.closest('[data-del]');
      if (del) {
        if (del.dataset.sure) { S.tasks = S.tasks.filter((x) => x.id !== t.id); save(); closeSheet(); scheduleNotifs(); render(); toast('Tarea eliminada'); }
        else { del.dataset.sure = '1'; del.textContent = '¿Seguro? Toca otra vez'; del.style.color = '#ff5252'; }
      }
    };
  }

  let F = null;
  const toLocalInput = (ms) => { const d = new Date(ms); return iso(d) + 'T' + hhmmOf(ms); };
  const fromLocalInput = (v) => { const [a, b] = v.split('T'); if (!a || !b) return null; const d = parseIso(a); return atTime(d, b); };
  function openTaskForm(t) {
    F = t ? Object.assign({}, t) : { id: null, type: 'tarea', title: '', subj: null, due: null, mode: 'next', notes: '' };
    drawForm();
  }
  function readForm() { const ti = $('#ftTitle'); if (ti) F.title = ti.value; const no = $('#ftNotes'); if (no) F.notes = no.value; const dt = $('#ftDate'); if (dt && dt.value) F.due = fromLocalInput(dt.value); }
  function drawForm() {
    const keys = Object.keys(SUBJ);
    const isOtro = F.subj === 'Otro';
    const ses = F.subj && !isOtro ? nextSessions(F.subj, Date.now(), 4) : [];
    if (isOtro && F.mode !== 'custom') F.mode = 'custom';
    if (F.mode === 'next') F.due = ses.length ? ses[0].at : null;
    let h = '<button class="back" data-x="1">‹ ' + (F.id ? 'Editar tarea' : 'Nueva tarea') + '</button><div class="det">';
    h += '<div class="f">TIPO</div><div class="types">' + Object.keys(TT).map((k) => '<button class="ty ' + (F.type === k ? 'on' : '') + '" data-ft="' + k + '">' + TT[k].i + ' ' + TT[k].n + '</button>').join('') + '</div>';
    h += '<div class="f">¿QUÉ TIENES QUE HACER?</div><input id="ftTitle" maxlength="120" placeholder="Ej: Taller de cinemática (pág. 45)" value="' + esc(F.title) + '">';
    h += '<div class="f">¿DE QUÉ CLASE O ESPACIO?</div><div class="sgrid">' + keys.map((k) => '<button class="g ' + (F.subj === k ? 'on' : '') + '" style="--sc:' + SUBJ[k].color + '" data-fs="' + esc(k) + '">' + esc(SUBJ[k].n) + '</button>').join('') + '</div>';
    if (F.subj) {
      const s = subj(F.subj);
      if (!isOtro) {
        h += '<div class="f">¿CUÁNDO SE ENTREGA?</div>';
        if (!ses.length) h += '<div class="box warn">No encontré próximas clases de esta materia (¿vacaciones o viaje?). Elige otra fecha.</div>';
        ses.forEach((x, i) => {
          const on = (F.mode === 'next' && i === 0) || (F.mode === 'pick' && F.due === x.at);
          h += '<button class="due ' + (on ? 'on' : '') + '" data-fd="' + i + '">' + (i === 0 ? '📌 ' + (s.kind === 'trabajo' ? 'Próximo turno' : 'Próxima clase') + ': ' : '') + '<b>' + fmtWhen(x.at) + '</b></button>';
        });
        h += '<button class="due ' + (F.mode === 'custom' ? 'on' : '') + '" data-fc="1">📅 Otra fecha y hora</button>';
      } else h += '<div class="f">¿CUÁNDO?</div>';
      if (F.mode === 'custom') h += '<input type="datetime-local" id="ftDate" value="' + (F.due ? toLocalInput(F.due) : '') + '">';
      if (F.due) {
        h += '<div class="f">RECORDATORIOS</div>';
        const tmp = Object.assign({}, F, { created: Date.now() });
        remindersOf(tmp).forEach((r) => {
          const past = r.at <= Date.now();
          h += '<div class="set-row ' + (past ? 'off' : '') + '"><span>' + r.l.replace(' d', ' días antes').replace('1 días', '1 día').replace(' h', ' hora antes') + '</span><span style="font-size:12px">' + (past ? 'ya pasó · se omite' : fmtWhen(r.at) + (r.moved ? ' ↻' : '')) + '</span></div>';
        });
        if (F.type === 'examen') h += '<p class="muted" style="margin-top:6px">📖 En exámenes llega un aviso extra 5 días antes para empezar a estudiar.</p>';
      }
    }
    h += '<div class="f">NOTAS (OPCIONAL)</div><textarea id="ftNotes" rows="2" placeholder="Páginas, materiales, con quién…">' + esc(F.notes || '') + '</textarea>';
    h += '<button class="btn" data-save="1">GUARDAR</button></div>';
    openPage(h);
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { closePage(); render(); return; }
      const ty = e.target.closest('[data-ft]'); if (ty) { readForm(); F.type = ty.dataset.ft; drawForm(); return; }
      const fs = e.target.closest('[data-fs]'); if (fs) { readForm(); F.subj = fs.dataset.fs; F.mode = F.subj === 'Otro' ? 'custom' : 'next'; drawForm(); return; }
      const fd = e.target.closest('[data-fd]'); if (fd) { readForm(); const i = +fd.dataset.fd; F.mode = i === 0 ? 'next' : 'pick'; F.due = ses[i].at; drawForm(); return; }
      if (e.target.closest('[data-fc]')) { readForm(); F.mode = 'custom'; drawForm(); return; }
      if (e.target.closest('[data-save]')) {
        readForm();
        if (!F.title.trim()) { toast('Escribe qué tienes que hacer'); return; }
        if (!F.subj) { toast('Escoge la clase o espacio'); return; }
        if (!F.due) { toast('Escoge la fecha de entrega'); return; }
        const t = { id: F.id || ('t' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)), type: F.type, title: F.title.trim(), subj: F.subj, due: F.due, mode: F.mode, notes: (F.notes || '').trim(), created: Date.now(), done: false };
        const i = S.tasks.findIndex((x) => x.id === t.id);
        if (i >= 0) S.tasks[i] = t; else S.tasks.push(t);
        save(); scheduleNotifs(); closePage(); hoyView = 'agenda'; tab = 'hoy'; setTab('hoy');
        const nx = remindersOf(t).filter((r) => r.at > Date.now()).length;
        toast('✓ Guardada · ' + nx + ' recordatorio(s) programado(s)');
      }
    };
    $('#page').onchange = (e) => { if (e.target.id === 'ftDate') { readForm(); drawForm(); } };
  }

  // ---------- METAS → MI RUTA ----------
  let rutaProj = '', showTable = false;
  function metaLine(x, extra) {
    const p = P[x.pid];
    return '<div class="meta-row" style="--cc:' + p.color + '" data-rm="' + x.pid + '|' + x.id + '"><div style="flex:1"><div class="t">' + (rutaProj ? '' : '<span style="color:' + p.color + '">' + esc(p.short) + '</span> · ') + x.id + ' ' + esc(x.m.t) + '</div><div class="m">' + extra + '</div></div><span class="arrow">›</span></div>';
  }
  function renderRuta(h) {
    const R = ruta(rutaProj || null); const w = R.w;
    h += '<div class="chips">' + [['', 'Todos']].concat(ORDER.map((id) => [id, P[id].name])).map(([id, n]) => '<button class="chip ' + (rutaProj === id ? 'on' : '') + '" style="--cc:' + (id ? P[id].color : '#00e5ff') + '" data-rp="' + id + '">' + esc(n) + '</button>').join('') + '</div>';
    // qué debería estar haciendo
    const foco = (pid) => { const r = ruta(pid); return r.atrasadas[0] || r.enCurso[0] || r.proximas[0] || null; };
    h += '<div class="now"><small>🧭 SEMANA ' + w + ' · DEBERÍAS ESTAR EN</small>';
    if (rutaProj) {
      const f = foco(rutaProj);
      if (f) h += '<h3>' + f.id + ' · ' + esc(f.m.t) + '</h3><p>' + (f.w.e < w ? '⛔ Atrasada: vencía en la semana ' + f.w.e + '. ' : 'Vence en la semana ' + f.w.e + ' (' + weekRange(f.w.e) + '). ') + 'Primer paso: ' + esc(f.m.s[0]) + '</p>';
      else h += '<h3>¡Vas al día! 🎉</h3><p>No tienes metas pendientes con fecha en este momento.</p>';
    } else {
      h += '<div class="foco">' + ORDER.map((pid) => { const f = foco(pid); return '<div data-rp="' + pid + '"><b>' + esc(P[pid].short) + '</b>' + (f ? (f.w.e < w ? '⛔ ' : '') + f.id + ' ' + esc(f.m.t) : '✓ al día') + '</div>'; }).join('') + '</div>';
    }
    h += '</div>';
    const diff = R.llevas - R.deberias;
    h += '<div class="stat"><div><b>' + R.llevas + '</b><span>metas cumplidas</span></div><div><b>' + R.deberias + '</b><span>deberías llevar</span></div><div><b class="' + (diff >= 0 ? 'ok' : 'bad') + '">' + (diff >= 0 ? '+' + diff : diff) + '</b><span>' + (diff >= 0 ? 'al día' : 'atrasado') + '</span></div></div>';
    if (R.estaSemana) h += '<p class="muted" style="margin:-2px 0 8px">Esta semana vencen ' + R.estaSemana + ' meta(s) más: todavía no cuentan como atraso.</p>';
    // gráfica 1
    const X = Math.max(12, w + 8);
    h += '<div class="card"><div class="ch">Metas: plan vs real</div><div class="leg"><span><i style="background:' + C_ESP + '"></i>Plan (lo que deberías llevar)</span><span><i style="background:' + C_REAL + '"></i>Real (lo que llevas)</span></div>' + lineChart(R, X) + '<div class="cap" id="capL">Toca la gráfica para ver cada semana.</div></div>';
    // gráfica 2
    const B = barChart(rutaProj || null, w);
    h += '<div class="card"><div class="ch">Bloques de estudio por semana</div><div class="leg"><span><i style="background:' + C_ESP + '"></i>Planeados</span><span><i style="background:' + C_REAL + '"></i>Hechos</span></div>' + B.svg + '<div class="cap" id="capB">Esta semana: ' + B.last.hecho + ' de ' + B.last.plan + ' bloques (' + (B.last.plan ? Math.round(B.last.hecho / B.last.plan * 100) : 0) + '%).</div></div>';
    h += '<button class="chipbtn" data-tab2="1">' + (showTable ? 'Ocultar tabla' : 'Ver los datos en tabla') + '</button>';
    if (showTable) {
      h += '<table class="tbl"><tr><th>Semana</th><th>Metas plan</th><th>Metas real</th><th>Bloques plan</th><th>Bloques hechos</th></tr>';
      for (let k = Math.max(1, w - 5); k <= w; k++) { const bw = blocksWeek(k, rutaProj || null); h += '<tr><td>' + k + '</td><td>' + R.F.filter((x) => x.w.e <= k).length + '</td><td>' + R.F.filter((x) => { const d = doneWeek(x); return d != null && d <= k; }).length + '</td><td>' + bw.plan + '</td><td>' + bw.hecho + '</td></tr>'; }
      h += '</table>';
    }
    // listas
    if (R.atrasadas.length) h += '<div class="sec red">⛔ Atrasadas (' + R.atrasadas.length + ')</div>' + R.atrasadas.slice(0, 8).map((x) => metaLine(x, 'Vencía en la semana ' + x.w.e + ' · ' + esc(x.m.m))).join('') + (R.atrasadas.length > 8 ? '<p class="muted">… y ' + (R.atrasadas.length - 8) + ' más.</p>' : '');
    if (R.enCurso.length) h += '<div class="sec">▶ En curso ahora (' + R.enCurso.length + ')</div>' + R.enCurso.slice(0, 8).map((x) => metaLine(x, 'Hasta la semana ' + x.w.e + ' (' + weekRange(x.w.e) + ') · ' + esc(x.m.m))).join('');
    if (R.proximas.length) h += '<div class="sec">⏭ Próximas</div>' + R.proximas.map((x) => metaLine(x, 'Empieza en la semana ' + x.w.s + ' (' + weekRange(x.w.s) + ')')).join('');
    if (R.permanentes) h += '<p class="muted" style="margin-top:10px">' + R.permanentes + ' meta(s) permanentes (sin fecha fija) no entran en la gráfica.</p>';
    h += '<p class="muted" style="margin-top:6px">El plan sale del plazo de cada meta (“Semana 3”, “Mes 2–4”, “Año 1”…). Para que el “real” suba, marca tus metas como cumplidas.</p>';
    $('#view').innerHTML = h;
    $('#view').onclick = (e) => {
      const v = e.target.closest('[data-mv]'); if (v) { metaView = v.dataset.mv; renderMetas(); return; }
      const rp = e.target.closest('[data-rp]'); if (rp) { rutaProj = rp.dataset.rp; renderMetas(); return; }
      if (e.target.closest('[data-tab2]')) { showTable = !showTable; renderMetas(); return; }
      const rm = e.target.closest('[data-rm]'); if (rm) { const [pid, id] = rm.dataset.rm.split('|'); openMeta(pid, id); return; }
      const svg = e.target.closest('svg.chart'); if (!svg) return;
      const box = svg.getBoundingClientRect(); const xv = (e.clientX - box.left) / box.width * 340;
      if (svg.dataset.line) {
        const d = JSON.parse(svg.dataset.line); const k = Math.max(0, Math.min(d.X, Math.round((xv - d.l) / d.iw * d.X)));
        const xh = svg.querySelector('.xh'); const x = d.l + d.iw * k / d.X; xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.style.display = '';
        $('#capL').innerHTML = '<b>Semana ' + k + '</b>' + (k ? ' (' + weekRange(k) + ')' : '') + ': plan ' + d.esp[k] + ' metas · real ' + (k < d.real.length ? d.real[k] : '—');
      }
      if (svg.dataset.bars) {
        const D = JSON.parse(svg.dataset.bars); const i = Math.max(0, Math.min(D.length - 1, Math.floor((xv - 30) / (302 / 6))));
        const x = D[i]; if (!x) return;
        $('#capB').innerHTML = '<b>Semana ' + x.k + '</b>: ' + x.hecho + ' de ' + x.plan + ' bloques hechos (' + (x.plan ? Math.round(x.hecho / x.plan * 100) : 0) + '%)';
      }
    };
  }
  // ---------- METAS ----------
  function renderMetas() {
    if ((NO_METAS || metaView !== 'ruta') && window.PR) { PR.render(); return; } // la mandala se reemplazó por Proyectos (27 nov 2026)
    let h = '<div class="sw2"><button class="' + (metaView === 'mandala' ? 'on' : '') + '" data-mv="mandala">🚀 Proyectos</button><button class="' + (metaView === 'ruta' ? 'on' : '') + '" data-mv="ruta">🧭 Mi ruta</button></div>';
    if (metaView === 'ruta') { renderRuta(h); return; }
    const p = P[metaProj];
    h += '<div class="chips">' + ORDER.map((id) => '<button class="chip ' + (id === metaProj ? 'on' : '') + '" style="--cc:' + P[id].color + '" data-p="' + id + '">' + esc(P[id].name) + '</button>').join('') + '</div>';
    h += '<div class="muted" style="margin-bottom:8px">' + esc(p.center) + ' · <b>' + esc(p.plazo) + '</b> · ' + countDone(p.id) + '/64 ✔</div>';
    h += '<div class="grid" style="--cc:' + p.color + '">';
    [0, 1, 2, 3, -1, 4, 5, 6, 7].forEach((ai) => {
      if (ai === -1) { h += '<div class="cell center">' + esc(p.name) + '<br><span style="font-size:10px;font-weight:600">' + countDone(p.id) + ' / 64</span></div>'; return; }
      const ar = p.areas[ai]; const cd = countDone(p.id, ai);
      h += '<button class="cell ' + (ai === metaArea ? 'sel' : '') + '" data-a="' + ai + '">' + (ai + 1) + '. ' + esc(ar.n) + '<div class="cnt">' + cd + '/8</div><div class="mini"><i style="width:' + (cd / 8 * 100) + '%"></i></div></button>';
    });
    h += '</div>';
    const ar = p.areas[metaArea];
    h += '<div class="sec">' + (metaArea + 1) + '. ' + esc(ar.n) + ' — 8 metas</div>';
    ar.metas.forEach((m, j) => {
      const id = (metaArea + 1) + '.' + (j + 1); const dn = metaDone(p.id, id);
      const cp = window.CNT ? CNT.pill(p.id, id) : null;
      h += '<div class="meta-row ' + (dn ? 'done' : '') + '" style="--cc:' + p.color + '"><button class="chk" data-mc="' + id + '">' + (dn ? '✓' : '') + '</button><div style="flex:1;min-width:0" data-mo="' + id + '"><div class="t">' + id + ' ' + esc(m.t) + '</div><div class="m">' + esc(m.m) + (cp ? ' · ' + cp.sub : '') + '</div>' + (cp ? cp.bar : '') + '</div>' + (cp ? '<span data-mo="' + id + '">' + cp.pill + '</span>' : '') + '</div>';
    });
    $('#view').innerHTML = h;
    $('#view').onclick = (e) => {
      const mv = e.target.closest('[data-mv]'); if (mv) { metaView = mv.dataset.mv; renderMetas(); return; }
      const pb = e.target.closest('[data-p]'); if (pb) { metaProj = pb.dataset.p; metaArea = 0; renderMetas(); return; }
      const ab = e.target.closest('[data-a]'); if (ab) { metaArea = +ab.dataset.a; renderMetas(); return; }
      const mc = e.target.closest('[data-mc]'); if (mc) { toggleMeta(p.id, mc.dataset.mc); renderMetas(); return; }
      const mo = e.target.closest('[data-mo]'); if (mo) openMeta(p.id, mo.dataset.mo);
    };
  }
  function toggleMeta(pid, id) {
    const k = metaKey(pid, id);
    if (S.metas[k]) { delete S.metas[k]; if (S.metaAuto[k]) { delete S.metaAuto[k]; S.autoSkip[k] = true; } } else { S.metas[k] = iso(today()); toast('🎯 ¡Meta cumplida! ' + countDone(pid) + '/64'); if (navigator.vibrate) navigator.vibrate([40, 60, 40]); }
    save();
  }
  function sesionesDeMeta(pid, id) {
    const out = [];
    Object.keys(SESIONES).forEach((w) => { const arr = SESIONES[w][pid] || []; arr.forEach((s, i) => { if (s[0] === id) out.push({ w: +w, i, s }); }); });
    return out;
  }
  function openMeta(pid, id) {
    const g = getMeta(pid, id); if (!g) return; const p = P[pid]; const m = g.meta; const dn = metaDone(pid, id);
    let h = '<button class="back" data-x="1">‹ ' + esc(g.area.n) + '</button><div class="det">';
    h += '<div class="pill" style="background:' + p.color + '33;color:' + p.color + '">' + esc(p.name.toUpperCase()) + ' · META ' + id + ' · ' + esc(m.m) + '</div>';
    h += '<h2>' + esc(m.t) + '</h2><p>' + esc(m.p) + '</p><div class="sec">Cómo cumplirla</div>';
    m.s.forEach((s, i) => { h += '<div class="step"><b>' + (i + 1) + '</b><span>' + esc(s) + '</span></div>'; });
    h += '<div class="box">📏 <strong>Se cumple cuando:</strong> ' + esc(m.c) + '</div>';
    if (window.CNT) h += CNT.detail(pid, id);
    if (m.e) h += '<div class="box warn">⚠️ <strong>Error común:</strong> ' + esc(m.e) + '</div>';
    if (m.h) h += '<div class="box tool">🔌 <strong>Herramienta:</strong> ' + esc(m.h) + '</div>';
    const ss = sesionesDeMeta(pid, id);
    if (ss.length) {
      h += '<div class="sec">En tu horario</div>';
      ss.forEach((x) => { h += '<div class="box"><b>Semana ' + x.w + '</b> · ' + esc(x.s[1]) + '<br><span class="muted">' + esc(x.s[2]) + '</span></div>'; });
    }
    h += '<button class="btn ' + (dn ? 'alt' : '') + '" data-t="1">' + (dn ? 'Desmarcar meta' : '✓ MARCAR COMO CUMPLIDA') + '</button>';
    if (dn) h += '<p class="muted" style="text-align:center;margin-top:8px">Cumplida el ' + esc(S.metas[metaKey(pid, id)]) + (S.metaAuto[metaKey(pid, id)] ? ' · se marcó sola ⚡' : '') + '</p>';
    h += '</div>';
    openPage(h);
    $('#page').onchange = null;
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { closePage(); render(); }
      if (e.target.closest('[data-t]')) { toggleMeta(pid, id); openMeta(pid, id); return; }
      if (window.CNT && CNT.detailClick(e, pid, id)) { const sc = $('#page').scrollTop; openMeta(pid, id); $('#page').scrollTop = sc; }
    };
  }

  // ---------- EJERCICIO ----------
  let timerInt = null;
  function startTimer(sec) {
    clearInterval(timerInt); let left = sec; const el = $('#timer'); el.classList.remove('hidden');
    const tick = () => { el.textContent = '⏱ Descanso ' + left + ' s  ✕'; if (left <= 0) { clearInterval(timerInt); el.textContent = '¡Siguiente serie! 💪'; if (navigator.vibrate) navigator.vibrate([300, 150, 300]); setTimeout(() => el.classList.add('hidden'), 2500); } left--; };
    tick(); timerInt = setInterval(tick, 1000);
  }
  $('#timer').addEventListener('click', () => { clearInterval(timerInt); $('#timer').classList.add('hidden'); });

  // la racha no se rompe en días de viaje (se congela)
  function ejStreak() {
    let n = 0; let d = today();
    if (!(S.ej[iso(d)] && S.ej[iso(d)].fin)) d = addDays(d, -1);
    for (let i = 0; i < 1000; i++) {
      const di = iso(d);
      if (S.ej[di] && S.ej[di].fin) n++; else if (!tripOf(di)) break;
      d = addDays(d, -1);
    }
    return n;
  }
  function renderEj() {
    const t = today(); const w = weekOf(t); const td = dow(t);
    const sel = ejDay || td; const d = addDays(mondayOf(w), sel - 1); const di = iso(d);
    const tr = tripOf(di); const ew = ejWeek(d);
    const r = buildRutina(ew, sel, { corta: !!tr });
    const rec = S.ej[di] = S.ej[di] || { sets: {} };
    let h = '<div class="lvl"><small>SEMANA DE EJERCICIO ' + ew + ' · ' + r.wk + ' DE 3 EN ESTE NIVEL</small><h3>' + esc(r.nivelNombre) + '</h3><p>' + esc(r.tipo) + ' · ≈ ' + r.minutos + ' min · 🔥 racha ' + ejStreak() + ' días</p><div class="bar"><i style="width:' + Math.min(100, Math.round(((r.nivel - 1) * 3 + r.wk) / 24 * 100)) + '%"></i></div></div>';
    h += '<div class="days">' + [1, 2, 3, 4, 5, 6, 7].map((k) => { const dd = iso(addDays(mondayOf(w), k - 1)); return '<button class="' + (k === sel ? 'on ' : '') + (S.ej[dd] && S.ej[dd].fin ? 'ok' : '') + '" data-day="' + k + '">' + DIAS_C[k] + '</button>'; }).join('') + '</div>';
    if (tr) h += '<div class="box warn">✈️ <strong>Modo fuera de casa:</strong> versión corta (2 series) y el nivel queda congelado hasta que vuelvas. Hazla en el cuarto donde te quedes.</div>';
    else if (ew === 1 && sel === td) h += '<div class="box">👋 <strong>Semana 1:</strong> el objetivo es crear el hábito, no cansarte. Si algo duele (dolor agudo, no cansancio), para. Cada semana la app sube un poco la dificultad sola.</div>';
    r.bloques.forEach((bq, bi) => {
      h += '<div class="sec">' + esc(bq.n) + '</div>';
      bq.items.forEach((x, xi) => {
        const k = bi + '-' + xi; const done = rec.sets[k] || 0;
        h += '<div class="ex" data-ex="' + k + '"><div class="top2"><div><div class="nm">' + esc(x.n) + '</div><div class="ms">' + esc(x.m) + '</div></div><div class="ds">' + (x.sets > 1 ? x.sets + ' × ' : '') + esc(x.dosis) + '</div></div>';
        h += '<div class="dots">' + Array.from({ length: x.sets }, (_, i) => '<button class="' + (i < done ? 'on' : '') + '" data-set="' + k + '|' + (i + 1) + '">' + (i + 1) + '</button>').join('') + '</div>';
        h += '<button class="more" data-how="' + k + '">Cómo hacerlo ▾</button><div class="how">' + x.how.map((s, i) => '<div class="step"><b>' + (i + 1) + '</b><span>' + esc(s) + '</span></div>').join('') +
          (x.err ? '<div class="box warn">⚠️ <strong>Evita:</strong> ' + esc(x.err) + '</div>' : '') +
          '<button class="btn alt sm" data-yt="' + esc(x.n) + '">▶ Ver video de cómo se hace</button></div></div>';
      });
    });
    const fin = rec.fin;
    h += '<button class="btn ' + (fin ? 'alt' : '') + '" data-fin="1">' + (fin ? 'Rutina completada ✓ (desmarcar)' : '✓ TERMINÉ LA RUTINA') + '</button>';
    if (!tr) {
      const nx = buildRutina(ew + 1, sel);
      h += '<div class="sec">La próxima semana</div><div class="box">' + (nx.nivel > r.nivel ? '⬆️ <strong>¡Subes a ' + esc(nx.nivelNombre) + '!</strong> Nuevos ejercicios: ' + esc(nx.bloques[1] ? nx.bloques[1].items.map((i) => i.n).join(', ') : 'movilidad') : '➕ Mismos ejercicios con un poco más de repeticiones o segundos.') + '</div>';
    }
    h += '<p class="muted" style="margin-top:10px">Esta rutina es solo de tren superior y abdomen, como pediste. Cuando el hábito esté firme (nivel 5), vale la pena sumar sentadillas y zancadas: las piernas son la mitad de tu fuerza.</p>';
    $('#view').innerHTML = h; save();
    $('#view').onclick = (e) => {
      const dy = e.target.closest('[data-day]'); if (dy) { ejDay = +dy.dataset.day; renderEj(); return; }
      const st = e.target.closest('[data-set]');
      if (st) {
        const [k, n] = st.dataset.set.split('|'); const cur = rec.sets[k] || 0; const v = +n;
        rec.sets[k] = cur >= v ? v - 1 : v; save();
        const x = r.bloques[+k.split('-')[0]].items[+k.split('-')[1]];
        if (rec.sets[k] > cur && x.sets > 1 && rec.sets[k] < x.sets) startTimer(r.descanso);
        if (navigator.vibrate) navigator.vibrate(25);
        renderEj(); return;
      }
      const hw = e.target.closest('[data-how]'); if (hw) { hw.parentElement.classList.toggle('open'); return; }
      const yt = e.target.closest('[data-yt]'); if (yt) { openUrl('https://www.youtube.com/results?search_query=' + encodeURIComponent('cómo hacer ' + yt.dataset.yt + ' correctamente principiantes')); return; }
      if (e.target.closest('[data-fin]')) {
        rec.fin = !rec.fin; const b = blocksOf(d).find((x) => x.cat === 'ejercicio');
        if (b) setBlockState(di, b.id, rec.fin ? 'ok' : null);
        if (tr) { const plan = tripPlan(tr, d); const i = plan.findIndex((x) => x.cat === 'ejercicio'); if (i >= 0) { tr.done = tr.done || {}; tr.done[di] = tr.done[di] || {}; tr.done[di][i] = rec.fin; } }
        save();
        if (rec.fin) { toast('💪 ¡Rutina completada! Racha: ' + ejStreak() + ' días'); if (navigator.vibrate) navigator.vibrate([60, 80, 60]); }
        renderEj();
      }
    };
  }

  // ---------- SEMANA ----------
  function renderSemana() {
    const t = today(); const w = weekView || weekOf(t); const mon = mondayOf(w);
    const ses = SESIONES[w];
    let h = '<div class="dayhead"><button class="arr" data-w="-1">‹</button><div class="d"><b>Semana ' + w + '</b><span>' + mon.getDate() + ' ' + MESES[mon.getMonth()] + ' – ' + addDays(mon, 6).getDate() + ' ' + MESES[addDays(mon, 6).getMonth()] + '</span></div><button class="arr" data-w="1">›</button></div>';
    if (ses && ses.foco) h += '<div class="box">🎯 <strong>Foco:</strong> ' + esc(ses.foco) + '</div>';
    else h += '<div class="box warn">⚠️ <strong>Semana sin plan descargado.</strong> Los bloques usarán tu próxima meta pendiente. Busca actualizaciones en Progreso.</div>';
    let tot = 0, ok = 0, at = 0, ao = 0;
    for (let k = 0; k < 7; k++) {
      const d = addDays(mon, k);
      blocksOf(d).forEach((b) => { if (CATS[b.cat].check && !pausa(b, d)) { tot++; const dn = isDone(iso(d), b.id); ok += blockScore(iso(d), b.id); if (S.anchors[b.id]) { at++; if (dn) ao++; } } });
    }
    h += '<div class="stat"><div><b>' + (tot ? Math.round(ok / tot * 100) : 0) + '%</b><span>cumplido (½ = medio)</span></div><div><b>' + (at ? Math.round(ao / at * 100) + '%' : '—') + '</b><span>⚓ anclas</span></div><div><b>' + ejStreak() + '</b><span>racha ejercicio</span></div></div>';
    const H0 = 5 * 60, H1 = 21 * 60, PX = 560 / (H1 - H0);
    h += '<div class="wkgrid"><div></div>' + [1, 2, 3, 4, 5, 6, 7].map((k) => '<div class="hd ' + (iso(addDays(mon, k - 1)) === iso(t) ? 'today' : '') + '">' + DIAS_C[k] + '</div>').join('');
    h += '<div class="wkhours">' + [5, 7, 9, 11, 13, 15, 17, 19, 21].map((x) => '<span style="top:' + ((x * 60 - H0) * PX) + 'px">' + (x > 12 ? x - 12 : x) + '</span>').join('') + '</div>';
    for (let k = 1; k <= 7; k++) {
      const d = addDays(mon, k - 1); const tr = tripOf(iso(d));
      h += '<div class="wkcol">' + (tr ? '<div class="wb" style="top:0;height:559px;background:#ffab00">✈️</div>' : blocksOf(d).map((b) => {
        const c = CATS[b.cat]; const top = (mins(b.s) - H0) * PX; const hh = (mins(b.e) - mins(b.s)) * PX - 1;
        const ghost = !c.check || pausa(b, d); // libre y comidas en gris para que la semana no se vea cargada
        return '<div class="wb ' + (ghost ? 'ghost ' : '') + (isDone(iso(d), b.id) ? 'done' : '') + '" data-b="' + b.id + '|' + k + '" style="top:' + top + 'px;height:' + hh + 'px;background:' + c.color + '">' + (hh > 14 && !ghost ? (S.anchors[b.id] ? '⚓' : '') + esc(c.tag || c.n).slice(0, 9) : '') + '</div>';
      }).join('')) + '</div>';
    }
    h += '</div>';
    // entregas de la semana
    const wkTasks = S.tasks.filter((x) => x.due >= mon.getTime() && x.due < addDays(mon, 7).getTime()).sort((a, b) => a.due - b.due);
    if (wkTasks.length) h += '<div class="sec" style="color:#ff5252">Entregas de la semana</div>' + wkTasks.map(taskCard).join('');
    if (ses && !NO_METAS) {
      [['app', 'App Web'], ['video', 'Edición de video'], ['creador', 'Creador de contenido'], ['agencia', 'Agencia'], ['nexo', 'NEXO PC']].forEach(([k, n]) => {
        let rows = '';
        for (let i = 0; i < 7; i++) { const dd = addDays(mon, i); blocksOf(dd).filter((b) => b.cat === k).forEach((b) => { const tp = topicOf(b, dd); rows += '<div class="item ' + (isDone(iso(dd), b.id) ? 'done' : '') + '" style="--c:' + CATS[k].color + '" data-b="' + b.id + '|' + (i + 1) + '"><div class="bd"><div class="t">' + esc(tp.t) + '</div><div class="h">' + DIAS[i + 1] + ' ' + h12(b.s) + (tp.meta ? ' · meta ' + tp.meta : '') + (tp.carry ? ' · ↪ ' + tp.carry + ' sin hacer' : '') + '</div></div></div>'; }); }
        if (rows) h += '<div class="sec" style="color:' + CATS[k].color + '">' + n + '</div>' + rows;
      });
      h += '<div class="sec" style="color:' + CATS.ingles.color + '">Inglés</div><div class="box">' + esc(ses.ingles) + '</div>';
    }
    $('#view').innerHTML = h;
    $('#view').onclick = (e) => {
      const a = e.target.closest('[data-w]'); if (a) { weekView = Math.max(1, w + +a.dataset.w); renderSemana(); return; }
      const tk = e.target.closest('[data-tk]'); if (tk) { const x = S.tasks.find((y) => y.id === tk.dataset.tk); setTaskDone(x.id, !x.done); scheduleNotifs(); renderSemana(); return; }
      const to = e.target.closest('[data-to]'); if (to) { openTask(to.dataset.to); return; }
      const b = e.target.closest('[data-b]'); if (b) { const [bid, k] = b.dataset.b.split('|'); openBlock(blockById(bid, addDays(mon, +k - 1)), addDays(mon, +k - 1)); }
    };
  }

  // ---------- PROGRESO / AJUSTES ----------
  function activeTrip() { const di = iso(today()); return S.trips.find((t) => t.to >= di) || null; }
  function renderYo() {
    let h = updBanner();
    if (NO_METAS && window.PR) h += PR.progressHtml(); else {
    h += '<div class="sec">Progreso de tus ' + ORDER.length + ' proyectos</div><div class="card">';
    ORDER.forEach((id) => { const c = countDone(id); h += '<div class="pbar"><div class="nm">' + esc(P[id].name) + '</div><div class="tr"><i style="width:' + (c / 64 * 100) + '%;background:' + P[id].color + '"></i></div><div class="v">' + c + '/64</div></div>'; });
    const total = ORDER.reduce((a, id) => a + countDone(id), 0);
    h += '<div class="muted">Total: ' + total + ' de ' + RUTA.length + ' metas cumplidas.</div></div>'; }

    // Modo fuera de casa
    const tr = activeTrip();
    h += '<div class="sec">✈️ Modo fuera de casa</div><div class="card">';
    if (tr) {
      const live = tr.from <= iso(today());
      h += '<div class="set-row"><span>' + (live ? '🟢 Activo' : '🗓️ Programado') + ' · ' + esc(MOTIVOS[tr.motivo] || '') + '</span><span style="font-size:12px">' + fmtShort(parseIso(tr.from)) + ' → ' + fmtShort(parseIso(tr.to)) + '</span></div>';
      h += '<div class="muted" style="margin:6px 0">' + minLabel(tr.min) + ' al día · llevas: ' + [['cel', '📱'], ['pc', '💻'], ['cuaderno', '📓'], ['audif', '🎧']].filter(([k]) => tr.tools[k]).map((x) => x[1]).join(' ') + ' · avisos ' + h12(tr.times[0]) + ' y ' + h12(tr.times[1]) + '</div>';
      h += '<div class="row2"><button class="btn alt sm" data-act="tripEdit">Editar</button><button class="btn alt sm" data-act="tripEnd">' + (live ? 'Ya volví' : 'Cancelar') + '</button></div>';
    } else h += '<div class="muted">¿Vas a viajar o no vas a estar en casa? Cuéntale a la app cuántos días y qué llevas, y te arma un plan corto para no dejar tus cosas de lado.</div><button class="btn cy sm" data-act="trip">Planear salida</button>';
    h += '</div>';

    // Tu horario: clases o vacaciones y ciclo de 2 semanas
    const mo = modoOn(iso(today())); const cy = cycleOf(today()); const kk = keyOf(today());
    h += '<div class="sec">🗓️ Tu horario</div><div class="card"><div class="f" style="margin-top:0">MODO</div><div class="row2"><button class="btn ' + (mo === 'clases' ? 'cy' : 'alt') + ' sm" data-act="modoC">🏫 Clases</button><button class="btn ' + (mo === 'vacaciones' ? 'cy' : 'alt') + ' sm" data-act="modoV">🏖️ Vacaciones</button></div>';
    h += '<div class="muted" style="margin:6px 0 4px">Lo cambias cuando quieras. Con clases vuelve tu horario de colegio (ya sin la tienda).</div>';
    if (mo === 'vacaciones') { const nx = cy % 4 + 1; h += '<div class="f">CICLO DE 4 SEMANAS</div><div class="set-row"><span>Esta semana: <b>' + esc(HORARIO_VAC[cy].n) + '</b><br><span class="muted">' + esc(HORARIO_VAC[cy].desc) + '</span></span><button class="chipbtn" data-act="cyc">Pasar a la ' + nx + '</button></div><div class="set-row"><span class="muted">Próxima: ' + esc(HORARIO_VAC[nx].n) + '</span><span class="muted">' + fmtShort(addDays(mondayOf(weekOf(today())), 7)) + '</span></div>'; }
    h += '<div class="set-row"><span class="muted">Para cambiar un bloque, tócalo en Hoy → ✎ Cambiar</span>' + (S.mine && S.mine[kk] ? '<button class="chipbtn" data-act="resetH">Volver al original</button>' : '') + '</div></div>';

    // Vacaciones del colegio (ya no se muestra: lo reemplaza el modo)
    if (false) h += '<div class="sec">🏫 Vacaciones del colegio</div><div class="card"><div class="muted" style="margin-bottom:8px">Cuando sepas la fecha, ponla aquí: se pausan las clases, las tareas del colegio y sus avisos. El curso de inglés y el trabajo siguen.</div>' +
      '<div class="row2"><div style="flex:1"><div class="f">DESDE</div><input type="date" id="vacFrom" value="' + esc((S.vac && S.vac.from) || '') + '"></div><div style="flex:1"><div class="f">HASTA (OPCIONAL)</div><input type="date" id="vacTo" value="' + esc((S.vac && S.vac.to) || '') + '"></div></div>' +
      '<div class="row2"><button class="btn cy sm" data-act="vacSave">Guardar</button>' + (S.vac ? '<button class="btn alt sm" data-act="vacDel">Quitar</button>' : '') + '</div></div>';

    // Bloques ancla
    const anc = HORARIO.filter((b) => S.anchors[b.id]);
    h += '<div class="sec">⚓ Bloques ancla</div><div class="card">' + (anc.length ? anc.map((b) => '<div class="set-row"><span>' + DIAS_S[b.d] + ' ' + h12(b.s) + ' · ' + esc(b.title) + '</span><button class="chipbtn" data-unanc="' + b.id + '">Quitar</button></div>').join('') :
      '<div class="muted">Aún no tienes. En Hoy, toca un bloque → “Hacer bloque ancla”. Recomendado: empieza con 3.</div>') + '</div>';

    NP.hooks.yo.forEach((f) => { try { h += f(); } catch (e) { console.error(e); } });
    h += '<div class="sec">Notificaciones</div><div class="card" id="nst">' + (N ? 'Revisando…' : '📱 Estás en la versión web (iPhone). Los avisos con la app cerrada llegan en una próxima fase: mientras tanto, abre la app y mira “Tus 3 de hoy”. Se actualiza sola.' + (window.matchMedia && !matchMedia('(display-mode: standalone)').matches && !navigator.standalone ? '<br><br><b>Para instalarla:</b> en Safari toca Compartir ⬆️ → “Agregar a inicio”.' : '')) + '</div>';
    if (N) h += '<div class="row2"><button class="btn cy sm" data-act="perm">Activar permisos</button><button class="btn alt sm" data-act="test">Probar aviso</button></div><div class="row2"><button class="btn alt sm" data-act="bat">Batería: sin restricción</button><button class="btn alt sm" data-act="resched">Reprogramar</button></div>';
    h += '<div class="sec">Avisarme…</div><div class="card">';
    Object.keys(CATS).filter((k) => (CATS[k].check || CATS[k].toggle) && k !== 'colegio' && (k !== 'trabajo' || HORARIO.some((b) => b.cat === 'trabajo'))).forEach((k) => { h += '<div class="set-row"><span>' + esc(CATS[k].n) + '</span><button class="sw ' + (isNotifOn(k) ? 'on' : '') + '" data-nt="' + k + '"></button></div>'; });
    h += '</div>';

    h += '<div class="sec">Actualizaciones del plan</div><div class="card"><div class="muted" style="margin-bottom:8px">Tienes temas detallados hasta la semana ' + Math.max.apply(null, Object.keys(SESIONES).map(Number)) + '. Las semanas nuevas se descargan desde este enlace:</div>' +
      '<input id="upUrl" placeholder="https://… /plan.json" value="' + esc(S.updateUrl) + '"><div class="row2"><button class="btn cy sm" data-act="upd">Buscar actualización</button><button class="btn alt sm" data-act="paste">Pegar plan</button></div>' +
      (S.remote ? '<div class="muted" style="margin-top:8px">Última actualización: ' + esc(S.remote.version || '') + '</div>' : '') + '</div>';

    h += '<div class="sec">Plan</div><div class="card"><div class="set-row"><span>Inicio (semana 1)</span><input type="date" id="stDate" value="' + S.start + '" style="width:auto"></div></div>';
    h += '<div class="sec">Copia de seguridad</div><div class="row2"><button class="btn alt sm" data-act="exp">Exportar</button><button class="btn alt sm" data-act="imp">Importar</button></div>';
    h += '<p class="muted" style="text-align:center;margin:18px 0 0">NEXO PLAN v' + APP_NAME + ' · Excelencia digital, confianza real</p>';
    $('#view').innerHTML = h;
    refreshNotifStatus();
    $('#stDate').onchange = (e) => { if (e.target.value) { S.start = e.target.value; save(); scheduleNotifs(); toast('Inicio actualizado'); } };
    $('#upUrl').onchange = (e) => { S.updateUrl = e.target.value.trim(); save(); };
    NP.hooks.yoBind.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    $('#view').onclick = (e) => {
      if (onUpd(e)) return;
      if (NP.hooks.yoClick.some((f) => f(e))) return;
      const nt = e.target.closest('[data-nt]'); if (nt) { const k = nt.dataset.nt; S.notif[k] = !isNotifOn(k); save(); nt.classList.toggle('on'); scheduleNotifs(); return; }
      const ua = e.target.closest('[data-unanc]'); if (ua) { delete S.anchors[ua.dataset.unanc]; save(); renderYo(); return; }
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'perm') { N.requestPermissions(); setTimeout(refreshNotifStatus, 1500); }
      if (act === 'test') { N.testNotification(); }
      if (act === 'bat') { N.openBatterySettings(); }
      if (act === 'resched') { scheduleNotifs(); toast('Avisos reprogramados'); refreshNotifStatus(); }
      if (act === 'upd') { S.updateUrl = $('#upUrl').value.trim(); save(); checkUpdate(true); }
      if (act === 'paste') pastePlan();
      if (act === 'exp') { const txt = JSON.stringify(S); if (N) N.shareText(txt); else if (navigator.share) navigator.share({ title: 'Copia NEXO PLAN', text: txt }).catch(() => {}); else { navigator.clipboard && navigator.clipboard.writeText(txt); toast('Copiado'); } }
      if (act === 'imp') importBackup();
      if (act === 'trip') openTripForm(null);
      if (act === 'tripEdit') openTripForm(tr);
      if (act === 'tripEnd') {
        const y = iso(addDays(today(), -1));
        if (tr.from > y) S.trips = S.trips.filter((x) => x !== tr); else tr.to = y;
        save(); scheduleNotifs(); renderYo(); toast('¡Bienvenido de vuelta! Tu horario normal está activo');
      }
      if (act === 'vacSave') {
        const f = $('#vacFrom').value, t2 = $('#vacTo').value;
        if (!f) { toast('Pon la fecha de inicio'); return; }
        if (t2 && t2 < f) { toast('La fecha final va después de la inicial'); return; }
        S.vac = { from: f, to: t2 || '' }; save(); scheduleNotifs(); renderYo(); toast('🏖️ Vacaciones guardadas');
      }
      if (act === 'modoC' || act === 'modoV') { setModo(act === 'modoV' ? 'vacaciones' : 'clases'); renderYo(); toast(act === 'modoV' ? '🏖️ Modo vacaciones desde hoy' : '🏫 Modo clases desde hoy'); return; }
      if (act === 'cyc') { S.cycleShift = (S.cycleShift || 0) + 1; save(); applySchedule(); scheduleNotifs(); changed(); renderYo(); toast('Esta semana ahora es la ' + HORARIO_VAC[cycleOf(today())].n); return; }
      if (act === 'resetH') { if (!a.dataset.sure) { a.dataset.sure = '1'; a.textContent = '¿Seguro?'; a.style.color = '#ff5252'; return; } resetSchedule(keyOf(today())); renderYo(); toast('Horario original de vuelta. Tus marcas siguen.'); return; }
      if (act === 'vacDel') { S.vac = null; save(); scheduleNotifs(); renderYo(); toast('Vacaciones quitadas'); }
    };
  }

  let TF = null;
  function openTripForm(tr) {
    const t0 = iso(today());
    TF = tr ? JSON.parse(JSON.stringify(tr)) : { id: 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), from: t0, to: iso(addDays(today(), 4)), motivo: 'viaje', tools: { cel: true, pc: false, cuaderno: true, audif: true, net: 'limitado' }, min: 60, times: ['09:00', '19:00'], done: {} };
    TF._edit = !!tr; drawTripForm();
  }
  function readTrip() { ['tfFrom', 'tfTo', 'tfT1', 'tfT2'].forEach((id) => { const el = $('#' + id); if (!el || !el.value) return; if (id === 'tfFrom') TF.from = el.value; if (id === 'tfTo') TF.to = el.value; if (id === 'tfT1') TF.times[0] = el.value; if (id === 'tfT2') TF.times[1] = el.value; }); }
  function drawTripForm() {
    const days = Math.round((parseIso(TF.to) - parseIso(TF.from)) / DAY) + 1;
    const tool = (k, n) => '<button class="tool ' + (TF.tools[k] ? 'y' : 'n') + '" data-tt="' + k + '">' + n + '<span class="k">' + (TF.tools[k] ? '✓' : '✗') + '</span></button>';
    let h = '<button class="back" data-x="1">‹ Progreso</button><div class="det"><h2>✈️ Modo fuera de casa</h2><p>La app pausa tu horario normal y te arma un plan corto con lo que llevas.</p>';
    h += '<div class="f">¿CUÁNDO TE VAS Y CUÁNDO VUELVES?</div><div class="row2"><input type="date" id="tfFrom" value="' + TF.from + '"><input type="date" id="tfTo" value="' + TF.to + '"></div>';
    h += '<div class="muted" style="color:#00e5ff;font-weight:700;margin-top:4px">' + (days > 0 ? days + ' día(s) fuera' : 'Revisa las fechas') + '</div>';
    h += '<div class="f">MOTIVO</div><div class="chips wrap">' + Object.keys(MOTIVOS).map((k) => '<button class="chip ' + (TF.motivo === k ? 'on' : '') + '" style="--cc:#7c4dff" data-mo2="' + k + '">' + MOTIVOS[k] + '</button>').join('') + '</div>';
    h += '<div class="f">¿QUÉ LLEVAS?</div>' + tool('cel', '📱 Celular') + tool('pc', '💻 Portátil / PC') + tool('cuaderno', '📓 Cuaderno') + tool('audif', '🎧 Audífonos');
    h += '<div class="f">📶 INTERNET</div><div class="chips wrap">' + [['si', 'Sí, bueno'], ['limitado', 'Datos limitados'], ['no', 'No tendré']].map(([k, n]) => '<button class="chip ' + (TF.tools.net === k ? 'on' : '') + '" style="--cc:#00e5ff" data-net="' + k + '">' + n + '</button>').join('') + '</div>';
    h += '<div class="f">TIEMPO AL DÍA PARA TUS PROYECTOS</div><div class="chips wrap">' + [[30, '30 min'], [60, '1 hora'], [120, '2 horas']].map(([k, n]) => '<button class="chip ' + (+TF.min === k ? 'on' : '') + '" style="--cc:#7c4dff" data-min="' + k + '">' + n + '</button>').join('') + '</div>';
    h += '<div class="f">TUS 2 AVISOS DEL DÍA</div><div class="row2"><input type="time" id="tfT1" value="' + TF.times[0] + '"><input type="time" id="tfT2" value="' + TF.times[1] + '"></div><p class="muted" style="margin-top:4px">El primero te dice tu plan del día y el segundo te recuerda chulear lo que hiciste.</p>';
    if (days > 0) {
      h += '<div class="f">ASÍ SE VE UN DÍA</div>' + tripPlan(TF, parseIso(TF.from)).map((x) => '<div class="mini-row"><b style="color:' + CATS[x.cat].color + '">' + x.min + ' min</b>' + esc(x.t) + '</div>').join('');
    }
    h += '<button class="btn" data-ok="1">' + (TF._edit ? 'GUARDAR CAMBIOS' : 'CREAR MI PLAN DE VIAJE') + '</button></div>';
    openPage(h);
    $('#page').onchange = () => { readTrip(); drawTripForm(); };
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { closePage(); render(); return; }
      readTrip();
      const m = e.target.closest('[data-mo2]'); if (m) { TF.motivo = m.dataset.mo2; drawTripForm(); return; }
      const tt = e.target.closest('[data-tt]'); if (tt) { TF.tools[tt.dataset.tt] = !TF.tools[tt.dataset.tt]; drawTripForm(); return; }
      const nt = e.target.closest('[data-net]'); if (nt) { TF.tools.net = nt.dataset.net; drawTripForm(); return; }
      const mi = e.target.closest('[data-min]'); if (mi) { TF.min = +mi.dataset.min; drawTripForm(); return; }
      if (e.target.closest('[data-ok]')) {
        if (TF.to < TF.from) { toast('La fecha de regreso va después de la salida'); return; }
        if (TF.to < iso(today())) { toast('Esas fechas ya pasaron'); return; }
        const other = S.trips.find((x) => x.id !== TF.id && !(TF.to < x.from || TF.from > x.to));
        if (other) { toast('Ya tienes otra salida en esas fechas'); return; }
        const clean = Object.assign({}, TF); delete clean._edit;
        const i = S.trips.findIndex((x) => x.id === clean.id);
        if (i >= 0) S.trips[i] = clean; else S.trips.push(clean);
        save(); scheduleNotifs(); closePage(); setTab('yo'); toast('✈️ Plan de viaje listo. ¡Buen viaje!');
      }
    };
  }

  function refreshNotifStatus() {
    if (!N || !$('#nst')) return;
    let st = {}; try { st = JSON.parse(N.status()); } catch (e) {}
    const r = (ok, t) => '<div class="set-row"><span>' + t + '</span><span class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? 'Sí' : 'No') + '</span></div>';
    $('#nst').innerHTML = r(st.notif, 'Notificaciones permitidas') + r(st.exact, 'Alarmas exactas') + r(st.battery, 'Sin optimización de batería') +
      '<div class="muted" style="margin-top:6px">Próximo aviso: ' + esc(st.next || '—') + '</div>';
  }
  function pastePlan() {
    openSheet('<div class="det"><h2>Pegar plan</h2><p>Pega aquí el plan que te dé Claude (texto JSON).</p><textarea id="pl" rows="8"></textarea><button class="btn" data-ok="1">Aplicar</button></div>');
    $('#sheet').onclick = (e) => { if (e.target.closest('[data-ok]')) { applyUpdateText($('#pl').value); closeSheet(); render(); } };
  }
  function importBackup() {
    openSheet('<div class="det"><h2>Importar copia</h2><p>Pega el texto de tu copia de seguridad. Reemplaza tu progreso actual.</p><textarea id="bk" rows="8"></textarea><button class="btn" data-ok="1">Importar</button></div>');
    $('#sheet').onclick = (e) => {
      if (!e.target.closest('[data-ok]')) return;
      try { const o = JSON.parse($('#bk').value); if (!o.done) throw 0; S = Object.assign({}, DEF, o); fix(); save(); applyRemote(); closeSheet(); scheduleNotifs(); render(); toast('Copia importada ✓'); } catch (er) { toast('Ese texto no es una copia válida'); }
    };
  }

  // ---------- Actualizaciones remotas ----------
  function noteApp(o) { if (o && o.app && o.app.version) { S.appUpd = o.app; save(); } }
  function applyUpdateText(txt) {
    try {
      const o = JSON.parse(txt);
      if (!o || !o.sesiones) throw 0;
      noteApp(o);
      const prev = (S.remote && S.remote.sesiones) || {};
      S.remote = { version: o.version || iso(today()), sesiones: Object.assign({}, prev, o.sesiones), tips: o.tips || (S.remote && S.remote.tips) };
      save(); applyRemote(); scheduleNotifs();
      const n = Object.keys(o.sesiones).length;
      toast(n ? 'Plan actualizado: ' + n + ' semana(s) ✓' : 'Plan actualizado ✓');
      // el mensaje sale cuando no tengas nada abierto (para no taparte lo que estás haciendo)
      if (o.mensaje) { const show = () => { if ($('#sheet').classList.contains('hidden') && $('#page').classList.contains('hidden')) openSheet('<div class="det"><h2>Mensaje de tu plan</h2><p>' + esc(o.mensaje) + '</p></div>'); else setTimeout(show, 4000); }; setTimeout(show, 600); }
      return true;
    } catch (e) { toast('El plan no tiene el formato correcto'); return false; }
  }
  const cbs = {}; let cbn = 0;
  window.__nativeCb = (id, ok, txt) => { const f = cbs[id]; delete cbs[id]; if (f) f(ok, txt); };
  function regCb(cb) { const id = 'c' + (++cbn); cbs[id] = cb; return id; }
  function fetchText(url, cb) {
    if (N && N.fetchUrl) { const id = 'c' + (++cbn); cbs[id] = cb; N.fetchUrl(url, id); }
    else fetch(url, { cache: 'no-store' }).then((r) => r.text()).then((t) => cb(true, t)).catch(() => cb(false, ''));
  }
  function checkUpdate(manual) {
    if (!S.updateUrl) { if (manual) toast('Primero escribe el enlace de actualización'); return; }
    S.lastCheck = Date.now(); save();
    fetchText(S.updateUrl + (S.updateUrl.includes('?') ? '&' : '?') + 't=' + Date.now(), (ok, txt) => {
      if (!ok) { if (manual) toast('Sin conexión o enlace incorrecto'); return; }
      let o; try { o = JSON.parse(txt); } catch (e) { if (manual) toast('El archivo no es válido'); return; }
      noteApp(o);
      if (S.remote && S.remote.version === o.version) { if (manual) toast(S.appUpd && S.appUpd.version > APP_VERSION ? 'Hay una versión nueva de la app ⬆️' : 'Ya tienes la última versión'); render(); return; }
      applyUpdateText(txt); render();
    });
  }

  // ---------- Notificaciones (las programa Android) ----------
  function scheduleNotifs() {
    if (!N) return;
    const items = []; const now = Date.now(); const t0 = today();
    const push = (t, key, title, body, x) => { if (t > now) items.push(Object.assign({ t, key, title, body, nid: hash(key + '#' + t) }, x || {})); };
    const askEnd = S.marcar.fin !== false; const cierre = S.marcar.cierre || '20:35';
    for (let k = 0; k < 14; k++) {
      const d = addDays(t0, k); const di = iso(d); const tr = tripOf(di);
      if (tr) {
        if (isNotifOn('viaje')) {
          const plan = tripPlan(tr, d);
          push(atTime(d, tr.times[0]), '', '✈️ Tu plan de hoy · ' + minLabel(tr.min), plan.map((x) => x.min + ' min · ' + x.t).join('\n'));
          push(atTime(d, tr.times[1]), '', '✈️ ¿Cumpliste tu plan de viaje?', 'Abre NEXO PLAN y chulea lo que hiciste hoy. Tu racha está congelada mientras estás fuera.');
        }
        continue;
      }
      blocksOf(d).forEach((b) => {
        if (!CATS[b.cat].check || !isNotifOn(b.cat) || pausa(b, d)) return;
        const tp = topicOf(b, d);
        push(atTime(d, b.s), di + '|' + b.id, (S.anchors[b.id] ? '⚓ ' : '⏰ ') + h12(b.s) + ' · ' + b.title, (tp.t || '') + (tp.d ? ' — ' + tp.d : ''));
        // al terminar: preguntar cómo le fue (reemplaza el aviso de inicio)
        if (askEnd && b.cat !== 'dormir' && !blockState(di, b.id) && !(cierre !== 'off' && Math.abs(mins(b.e) - mins(cierre)) <= 15)) {
          const v = voz(V_CAT[b.cat] || 'bloque');
          push(atTime(d, b.e), di + '|' + b.id, '⏱ Terminó: ' + b.title, '¿Lo hiciste? Márcalo aquí mismo.' + (v ? '\n' + v : ''), { acts: 3, nid: hash(di + '|' + b.id + '#' + atTime(d, b.s)) });
        }
      });
      // cierra tu día
      if (cierre !== 'off') {
        const at = atTime(d, cierre); const cm = mins(cierre);
        if (k === 0) {
          const L = blocksOf(d).filter((b) => CATS[b.cat].check && !pausa(b, d) && mins(b.e) <= cm && !blockState(di, b.id)).map((b) => b.title);
          const C = window.CNT ? CNT.pendingToday() : [];
          if (L.length || C.length) push(at, '', '🌙 Cierra tu día' + (L.length ? ' · ' + L.length + ' bloque(s) sin marcar' : ''), (L.length ? 'Sin marcar: ' + L.slice(0, 3).join(', ') + (L.length > 3 ? '…' : '') + '.' : '') + (C.length ? (L.length ? ' ' : '') + 'Tus días: ' + C.slice(0, 3).join(', ') + '.' : '') + ' Te toma 10 segundos.\n' + voz('cierre'));
        } else push(at, '', '🌙 Cierra tu día', 'Marca tus bloques y tus días de hoy: hecho, a medias o no pude. Te toma 10 segundos.\n' + voz('cierre'));
      }
      if (isNotifOn('clase')) {
        sessionsOn(d).filter((x) => x.kind === 'clase').forEach((x) => {
          const at = atTime(d, x.s); const due = tasksDueAt(at, x.keys);
          let body;
          if (due.length) body = '📌 Hoy ' + (TT[due[0].type] || TT.tarea).v + ': ' + due.map((t) => t.title).join(', ');
          else { const nx = x.keys.map(nextTaskOf).filter(Boolean)[0]; body = nx && nx.due > at ? 'Sin entregas hoy. Próxima: ' + nx.title + ' (' + fmtShort(new Date(nx.due)) + ')' : 'Sin entregas hoy.'; }
          push(at, due.length ? 'task|' + due[0].id : '', '🏫 Entras a ' + x.n + ' · ' + h12(x.s) + ' – ' + h12(x.e), body);
        });
      }
    }
    if (isNotifOn('tarea')) {
      pending().forEach((t) => {
        const s = subj(t.subj).n; const ty = TT[t.type] || TT.tarea;
        remindersOf(t).forEach((r) => {
          if (r.at < (t.created || 0) || r.at > now + 30 * DAY) return;
          let title, body;
          if (r.l === '5 d') { title = '📖 Faltan 5 días · ' + s; body = t.title + ' (examen, ' + fmtWhen(t.due) + '). Empieza a estudiar hoy: 20 minutos bastan.'; }
          else if (r.l === '3 d') { title = '📚 Faltan 3 días · ' + s; body = t.title + ' (' + ty.n.toLowerCase() + ', ' + fmtWhen(t.due) + '). Empieza hoy en tu bloque de tareas.'; }
          else if (r.l === '1 d') { title = '⚠️ Mañana ' + ty.v + ' · ' + s; body = t.title + '. ' + (t.type === 'examen' ? 'Repasa lo más importante hoy.' : '¿Ya está lista?'); }
          else { const kd = subj(t.subj).kind; title = '🔔 En 1 hora · ' + s; body = t.title + '. ' + (t.type === 'examen' ? 'Repasa 10 minutos y respira.' : kd === 'trabajo' ? 'Prepárate para tu turno.' : kd === 'otro' ? 'Es en 1 hora.' : 'Revisa que esté en la maleta.'); }
          push(r.at, 'task|' + t.id, title, body);
        });
      });
    }
    NP.hooks.notif.forEach((f) => { try { f(push, now, t0); } catch (e) { console.error(e); } });
    const template = HORARIO.filter((b) => CATS[b.cat].check && isNotifOn(b.cat)).map((b) => ({ dow: b.d, min: mins(b.s), id: b.id, title: '⏰ ' + h12(b.s) + ' · ' + b.title, body: 'Abre NEXO PLAN para ver el tema de hoy.' }));
    try { N.setSchedule(JSON.stringify({ items, template })); } catch (e) {}
  }

  function takeChecks() {
    if (!N || !N.takePendingChecks) return;
    let arr = []; try { arr = JSON.parse(N.takePendingChecks() || '[]'); } catch (e) {}
    let nt = 0, nb = 0;
    arr.forEach((k) => {
      const [a, b, c] = k.split('|');
      if (a === 'task') { setTaskDone(b, true); nt++; }
      else if (NP.hooks.check.some((f) => f(a, b))) nt++;
      else if (a && b) { setBlockState(a, b, ['ok', 'half', 'no'].includes(c) ? c : 'ok'); nb++; }
    });
    if (nt || nb) { toast('✓ Marcado desde la notificación: ' + (nb ? nb + ' bloque(s) ' : '') + (nt ? nt + ' tarea(s)' : '')); scheduleNotifs(); }
  }

  function openUrl(u) { if (N && N.openUrl) N.openUrl(u); else window.open(u, '_blank'); }

  window.onNativeResume = function () {
    takeChecks(); changed(); NP.hooks.resume.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); scheduleNotifs(); render();
    if (S.updateUrl && Date.now() - (S.lastCheck || 0) > 12 * 3600e3) checkUpdate(false);
  };

  // ---------- API interna para los módulos (agenda, asistente, mapa) ----------
  window.NP = {
    get S() { return S; }, save, saveQuiet, reload() { fix(); applyRemote(); applySchedule(); scheduleNotifs(); render(); }, $, esc, iso, parseIso, dow, mins, nowMin, today, addDays, atTime, weekOf, mondayOf, fmtDate, fmtShort, fmtWhen, h12, hhmmOf, dayDiff, hash, DAY, DIAS, DIAS_S, MESES,
    P, ORDER, RUTA, blocksOf, tripOf, vacOn, pausa, topicOf, pending, tasksDueAt, setTaskDone, TT, SUBJ, subj, nextSessions, sessionsOn, remindersOf, className, ejWeek, ejStreak,
    openTaskForm, openTask, taskCard, openBlock, openMeta, toggleMeta, countDone, isFijo, blockById, saveBlock, blockForm, quickAdd, modoOn, keyOf, cycleOf, setModo, queueAt, skipTask, blockState, blockWhy, setBlockState, blockScore, MOTIVOS_NO, voz, RUTA_CATS, metaKey, openTripForm, openSheet, closeSheet, openPage, closePage, toast, setTab, render, renderHoy, scheduleNotifs, isDone, setDone, ruta, getMeta, metaDone, nextPendingMeta, isNotifOn, openUrl, fetchText, regCb, N,
    get tab() { return tab; }, get dayOffset() { return dayOffset; }, get hoyView() { return hoyView; }, setHoyView(v) { hoyView = v; }, setEjDay(v) { ejDay = v; }, setMetaView(v, p) { metaView = v; rutaProj = p || ''; },
    hooks: { notif: [], check: [], resume: [], yo: [], yoBind: [], yoClick: [], boot: [], changed: [], saved: [] }
  };
  NP.boot = function () {
  // ---------- Arranque ----------
  NP.hooks.boot.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  takeChecks(); changed();
  render();
  scheduleNotifs();
  if (S.updateUrl && Date.now() - (S.lastCheck || 0) > 12 * 3600e3) checkUpdate(false);
  if (!S.welcomed) {
    S.welcomed = true; S.seenVersion = APP_VERSION; save();
    openSheet('<div class="det"><h2>¡Bienvenido a NEXO PLAN, Cristóbal! 🚀</h2><p>Tu horario, tus tareas, tus 384 metas y tu rutina de ejercicio, en un solo lugar.</p>' +
      '<div class="step"><b>1</b><span>Toca <b>Activar avisos</b> y acepta el permiso de notificaciones.</span></div>' +
      '<div class="step"><b>2</b><span>En la pestaña <b>Progreso</b>, toca “Batería: sin restricción” para que Samsung no bloquee los avisos.</span></div>' +
      '<div class="step"><b>3</b><span>Marca cada bloque cuando termine: ✓ Hecho, ½ A medias o ✕ No pude. También desde la notificación.</span></div>' +
      (N ? '<button class="btn cy" data-perm="1">Activar avisos</button>' : '') + '<button class="btn alt" data-close="1">Empezar</button></div>');
    $('#sheet').onclick = (e) => { if (e.target.closest('[data-perm]')) { N.requestPermissions(); } if (e.target.closest('[data-close]')) closeSheet(); };
  } else if (false) {
    // vuelve de la 1.5: sin hoja de novedades
    S.seenVersion = APP_VERSION; if (S.appUpd && S.appUpd.version <= APP_VERSION) S.appUpd = null; save();
    toast('Volviste a NEXO PLAN 1.4. Tu progreso sigue igual.', 4000);
  } else if ((S.seenVersion || 1) < APP_VERSION) {
    const prevSeen = S.seenVersion || 1;
    S.seenVersion = APP_VERSION; if (S.appUpd && S.appUpd.version <= APP_VERSION) S.appUpd = null; save();
    openSheet('<div class="det"><h2>Novedades de NEXO PLAN ' + APP_NAME + ' ✨</h2>' +
      '<div class="step"><b>🎯</b><span><b>Misiones de NEXO Negocios:</b> cobrar, hacer seguimiento, contactar prospectos… se crean solas según tu meta y ⚡ Organizar las mete en tus ratos Libre (en naranja). Al marcarlas aquí se marcan en Negocios.</span></div>' +
      (prevSeen < 13 ? '<div class="step"><b>‹</b><span><b>Botón Atrás en iPhone:</b> arriba a la izquierda siempre que haya a dónde volver, ✕ en cada ventana (o deslízala hacia abajo) y desliza desde el borde izquierdo para volver.</span></div>' : '') +
      '<div class="step"><b>🧹</b><span><b>Sin metas:</b> cada proyecto es solo su nombre, tus notas y sus tareas. Tus bloques muestran la próxima tarea del proyecto.</span></div>' +
      (prevSeen < 11 ? '<div class="step"><b>🚀</b><span><b>Proyectos:</b> tus 6 áreas son proyectos y puedes crear los tuyos desde una idea, con estado: activo, pausado o empieza después.</span></div>' +
      '<div class="step"><b>✅</b><span><b>Tareas 1 a 5:</b> cada tarea con importancia y urgencia; el orden sale solo. Las ve Harvey y las demás apps NEXO.</span></div>' +
      '<div class="step"><b>⚡</b><span><b>Organizar mi día</b> (en Mi día): te propongo dónde van tus tareas y tu estudio en tus ratos Libre. Tú quitas lo que no quieras y aplicas.</span></div>' +
      '<div class="step"><b>🔒</b><span><b>Bloques fijos y flexibles:</b> al cambiar un bloque eliges si es fijo (no se mueve) o flexible.</span></div>' : '') +
      '<div class="step"><b>🔁</b><span><b>Ciclo de 4 semanas:</b> Enfoque App Web, Cámara y edición, Negocio y Días temáticos. Cada día: 12 h de trabajo, 4 de descanso y 8 de sueño. Lo mínimo del día son “Tus 3 de hoy”. Míralo en Progreso → Tu horario.</span></div>' +
      '<div class="step"><b>💻</b><span><b>En el PC</b> ahora se ve a lo ancho: menú a la izquierda, tu día en dos columnas y atajos (1–5 pestañas, N nueva tarea, ← → días, Esc cerrar).</span></div>' +
      (prevSeen < 8 ? '' +
      '<div class="step"><b>🏖️</b><span><b>Modo vacaciones</b> (ya está puesto): en Progreso cambias entre 🏫 Clases y 🏖️ Vacaciones cuando quieras. Ya no aparece la tienda.</span></div>' +
      '<div class="step"><b>↪</b><span><b>Lo que no haces se arrastra:</b> si no marcas un bloque, su tarea pasa al siguiente bloque del mismo proyecto y te dice cuántas veces va sin hacerse.</span></div>' +
      '<div class="step"><b>🎯</b><span><b>Tus 3 de hoy</b> arriba en Mi día: si solo haces eso, ganaste el día.</span></div>' +
      '<div class="step"><b>＋</b><span><b>Guardar rápido:</b> toca + y escribe “comprar cartulina mañana 4 pm”. Toca un bloque → “✎ Cambiar” para moverlo solo hoy o siempre.</span></div>' +
      '<div class="step"><b>📱</b><span><b>Ya está para iPhone y PC:</b> abre nexopc.github.io/Nexo-plan en Safari (iPhone) o Chrome/Edge (PC) e instálala.</span></div>' +
      '<div class="step"><b>☁️</b><span><b>La misma información en tus 3 dispositivos:</b> en Progreso → “Crear mi Código NEXO”. En los otros, “Ya tengo un código”. Guarda bien tu clave.</span></div>' : '') +
      (prevSeen < 5 ? '<div class="step"><b>✓</b><span><b>Marca tus bloques con 3 opciones:</b> toca el cuadro de un bloque y escoge ✓ Hecho, ½ A medias o ✕ No pude. Al terminar cada bloque te llega un aviso con los 3 botones, y a las 8:35 pm “Cierra tu día”.</span></div>' +
      '<div class="step"><b>⚡</b><span><b>Metas por días:</b> las de ejercicio, sueño, inglés y revisión semanal se llenan solas con tus bloques y se chulean solas al llegar. Las demás (leer, agua, gastos, cámara…) traen casillas: márcalas en Hoy → “Marca tus días de hoy”.</span></div>' +
      '<div class="step"><b>👤</b><span><b>Tu perfil en el asistente:</b> Harvey y Mike ya saben quién eres, tu horario y tus proyectos. Pregúntales “¿qué sabes de mí?” o “¿por qué voy mal?”. Puedes editarlo y no sale del celular.</span></div>' +
      '<div class="step"><b>💬</b><span><b>500 frases</b> de Harvey y Mike (antes 150).</span></div>' : '') +
      (prevSeen < 4 ? '<div class="step"><b>✦</b><span><b>Asistente Harvey + Mike</b> (en Hoy): toca “¿Qué hago ahora?” o escríbele como a un amigo: “examen de química el viernes”, “tengo 30 min”, “estoy cansado”. Harvey decide qué va primero y Mike te dice cómo hacerlo más rápido. Gratis y sin internet.</span></div>' +
      '<div class="step"><b>📅</b><span><b>Agenda</b> (en Hoy): tus entregas, citas fijas y pendientes flexibles juntos. El asistente busca el mejor hueco sin tocar colegio, trabajo, sueño ni tus bloques ancla, y reprograma lo que no alcanzaste.</span></div>' +
      '<div class="step"><b>🗺️</b><span><b>Mapa de Quibdó</b> (en la Agenda): marca tu casa, colegio, tienda, papelería… y te armo rutas a pie o en mototaxi. Activa la ubicación en Progreso.</span></div>' +
      '<div class="step"><b>🎬</b><span><b>Nuevo proyecto: Creador de contenido</b>, con sus 64 metas en Metas y en Mi ruta.</span></div>' : '') +
      (prevSeen < 3 ? '<div class="step"><b>🧭</b><span><b>Mi ruta</b> (en Metas): en qué meta deberías estar y gráficas de plan contra real.</span></div>' +
      '<div class="step"><b>✈️</b><span><b>Tareas de viaje con instrucciones</b> paso a paso.</span></div>' : '') +
      (prevSeen < 2 ? '<div class="step"><b>1</b><span><b>Tareas:</b> en Hoy, toca “Tareas” y luego <b>+</b>. Escoge la materia y la app calcula sola la próxima clase. Te avisa 3 días, 1 día y 1 hora antes (y 5 días antes si es examen).</span></div>' +
      '<div class="step"><b>2</b><span><b>Todas tus clases</b> aparecen en Hoy y te avisan al entrar: “🏫 Entras a Física”.</span></div>' +
      '<div class="step"><b>3</b><span><b>⚓ Bloques ancla:</b> toca un bloque y márcalo como ancla. Empieza con 3 que no negocies.</span></div>' +
      '<div class="step"><b>4</b><span><b>✈️ Modo fuera de casa</b> y <b>🏫 vacaciones del colegio</b> están en Progreso.</span></div>' +
      '<div class="step"><b>5</b><span>Las próximas versiones se descargan desde la misma app con un botón “Descargar”.</span></div>' : '') +
      '<button class="btn" data-close="1">¡Listo!</button></div>');
    $('#sheet').onclick = (e) => { if (e.target.closest('[data-close]')) closeSheet(); };
  }
  setInterval(() => { if (tab === 'hoy' && hoyView === 'dia' && $('#page').classList.contains('hidden') && $('#sheet').classList.contains('hidden')) renderHoy(); }, 60000);
  };
})();
