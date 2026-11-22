/* NEXO PLAN — metas por días: se llenan solas con tus bloques o con casillas que marcas tú */
(function () {
  'use strict';
  const X = window.NP; const esc = X.esc;
  const S = () => X.S;

  // n: días (o semanas) que pide la meta · src: de dónde sale solo · man: la marcas tú · racha: tienen que ser seguidos
  const SPEC = {
    'habitos:1.1': { n: 5, src: 'dormir', racha: 1, u: 'noches' },
    'habitos:1.2': { n: 7, man: 1, u: 'noches', hoy: 'Celular lejos de la cama' },
    'habitos:1.3': { n: 10, src: 'dormir', u: 'noches' },
    'habitos:1.4': { n: 14, man: 1, u: 'días', hoy: 'Me levanté sin posponer la alarma' },
    'habitos:1.5': { n: 21, src: 'dormir', racha: 1, u: 'días' },
    'habitos:1.6': { n: 30, man: 1, u: 'días', hoy: 'Sin siesta larga' },
    'habitos:1.7': { n: 30, man: 1, u: 'días', hoy: 'Sin cafeína después de las 2 pm' },
    'habitos:1.8': { n: 66, src: 'dormir', u: 'días' },
    'habitos:2.1': { n: 7, src: 'ej', u: 'rutinas' },
    'habitos:2.2': { n: 7, src: 'ej', racha: 1, u: 'días' },
    'habitos:2.5': { n: 30, src: 'ej', u: 'rutinas' },
    'habitos:2.7': { n: 12, src: 'ejsem', u: 'semanas' },
    'habitos:3.1': { n: 4, src: 'ingles', racha: 1, u: 'semanas' },
    'habitos:5.1': { n: 30, man: 1, u: 'días', hoy: 'Registré mis gastos' },
    'habitos:6.1': { n: 4, src: 'revision', racha: 1, u: 'domingos' },
    'habitos:6.2': { n: 14, man: 1, u: 'días', hoy: 'Menos de 2 h de ocio en el celular' },
    'habitos:6.8': { n: 4, src: 'sem90', u: 'semanas' },
    'habitos:7.1': { n: 21, man: 1, u: 'días', hoy: 'Leí 10 páginas' },
    'habitos:8.1': { n: 14, man: 1, u: 'días', hoy: 'Tomé 2 litros de agua' },
    'habitos:8.2': { n: 14, man: 1, u: 'días', hoy: 'Desayuno con proteína' },
    'habitos:8.3': { n: 30, man: 1, u: 'días', hoy: 'Sin gaseosa ni mucho azúcar' },
    'creador:3.1': { n: 30, man: 1, racha: 1, u: 'días', hoy: 'Hablé 1 minuto a cámara' }
  };
  const SRC_TXT = {
    dormir: 'cuenta cada noche que marcas <b>Prepararme para dormir</b> como hecho o a medias',
    ej: 'cuenta cada día que terminas tu rutina en la pestaña <b>Ejercicio</b> (o marcas ese bloque)',
    ejsem: 'cuenta cada semana en la que haces al menos el <b>80%</b> de tus rutinas',
    ingles: 'cuenta cada semana en la que marcas <b>todas</b> tus clases de inglés',
    revision: 'cuenta cada domingo que marcas tu <b>revisión semanal</b> (bloque de las 8:30 pm)',
    sem90: 'cuenta cada semana en la que cumples el <b>90%</b> o más de tus bloques (a medias vale la mitad)'
  };
  const WEEKLY = { ejsem: 1, ingles: 1, sem90: 1 };
  const seg = (u) => (/^(noches|semanas|rutinas)$/.test(u) ? ' seguidas' : ' seguidos');
  let showAll = false;
  const good = (st) => st === 'ok' || st === 'half';
  const blockOf = (d, cat) => X.blocksOf(d).find((b) => b.cat === cat);

  // ---------- valor de un día o una semana: true, false, null (no cuenta) o 'p' (todavía en curso) ----------
  function dayVal(k, d) {
    const sp = SPEC[k]; const di = X.iso(d); const isT = di === X.iso(X.today());
    let v;
    if (sp.man) { v = !!(S().dias[k] && S().dias[k][di]); if (!v && X.tripOf(di)) return null; return v ? true : isT ? 'p' : false; }
    if (X.tripOf(di)) return null;
    if (sp.src === 'ej') { const e = S().ej[di]; const b = blockOf(d, 'ejercicio'); v = !!(e && e.fin) || (b ? good(X.blockState(di, b.id)) : false); }
    else if (sp.src === 'dormir' || sp.src === 'revision') {
      if (sp.src === 'revision' && X.dow(d) !== 7) return null;
      const b = blockOf(d, 'dormir'); if (!b) return null; v = good(X.blockState(di, b.id));
    }
    return v ? true : isT ? 'p' : false;
  }
  function weekVal(src, wk) {
    const mon = X.mondayOf(wk); const td = X.today(); let plan = 0, ok = 0;
    for (let i = 0; i < 7; i++) {
      const d = X.addDays(mon, i); if (d > td) break; const di = X.iso(d); if (X.tripOf(di)) continue;
      if (src === 'ejsem') { plan++; const e = S().ej[di]; const b = blockOf(d, 'ejercicio'); if ((e && e.fin) || (b && good(X.blockState(di, b.id)))) ok++; continue; }
      X.blocksOf(d).forEach((b) => {
        if (!window.CATS[b.cat].check || X.pausa(b, d)) return;
        if (src === 'ingles' && b.cat !== 'ingles') return;
        plan++; ok += src === 'ingles' ? (good(X.blockState(di, b.id)) ? 1 : 0) : X.blockScore(di, b.id);
      });
    }
    const cur = X.addDays(mon, 6) >= td;
    if (!plan) return cur ? 'p' : null;
    const r = ok / plan; const pass = src === 'ejsem' ? r >= 0.8 : src === 'ingles' ? r >= 1 : r >= 0.9;
    return pass && !cur ? true : cur ? 'p' : false;
  }
  // serie completa desde el inicio del plan
  function series(k) {
    const sp = SPEC[k]; const out = []; const td = X.today();
    if (WEEKLY[sp.src]) { const w = X.weekOf(td); for (let i = 1; i <= w; i++) out.push({ wk: i, v: weekVal(sp.src, i) }); return out; }
    let d = X.parseIso(S().start); if (d > td) d = td;
    for (let i = 0; i < 1500 && d <= td; i++) { out.push({ d, v: dayVal(k, d) }); d = X.addDays(d, 1); }
    return out;
  }
  // memo corto: se borra en el siguiente ciclo, así nunca queda viejo
  let cache = null;
  function prog(k) {
    if (!cache) { cache = {}; setTimeout(() => { cache = null; }, 0); }
    if (cache[k]) return cache[k];
    const sp = SPEC[k]; const L = series(k);
    let total = 0, cur = 0, best = 0, broke = false;
    L.forEach((x) => { if (x.v === true) { total++; cur++; if (cur > best) best = cur; } else if (x.v === false) { if (cur > 0) broke = true; cur = 0; } });
    const v = sp.racha ? best : total;
    return (cache[k] = { sp, L, total, cur, best, v: Math.min(v, sp.n), broke: broke && cur === 0 });
  }

  // ---------- en la lista de metas ----------
  function icon(sp) { return sp.man ? '✋' : sp.racha ? '🔥' : '⚡'; }
  function pill(pid, id) {
    const k = pid + ':' + id; const sp = SPEC[k]; if (!sp) return null;
    const done = X.metaDone(pid, id); const p = prog(k); const v = done ? sp.n : p.v;
    const cls = done ? 'ok' : sp.man ? 'm' : sp.racha ? 'r' : 'a';
    const col = sp.man ? '#b39dff' : sp.racha ? '#ff6e40' : 'var(--grn)';
    return {
      pill: '<span class="cpill ' + cls + '">' + icon(sp) + ' ' + v + '/' + sp.n + '</span>',
      bar: done ? '' : '<div class="cprog" style="--b:' + col + '"><i style="width:' + Math.round(v / sp.n * 100) + '%"></i></div>',
      sub: done && S().metaAuto[k] ? 'se marcó sola' : sp.man ? 'tú marcas el día' : sp.racha ? 'racha automática' : 'se llena sola'
    };
  }

  // ---------- en el detalle de la meta ----------
  const DC = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  function detail(pid, id) {
    const k = pid + ':' + id; const sp = SPEC[k]; if (!sp) return '';
    const done = X.metaDone(pid, id); const p = prog(k); const td = X.iso(X.today()); const yd = X.iso(X.addDays(X.today(), -1));
    const col = sp.man ? '#b39dff' : sp.racha ? '#ff6e40' : '#00e676';
    const v = done ? sp.n : p.v; const pct = Math.round(v / sp.n * 100);
    let h = '<div class="ctrk"><div class="chd">' + (sp.man ? '✋ CONTADOR DE DÍAS' : '⚡ CONTADOR AUTOMÁTICO') + (sp.racha ? ' · TIENEN QUE SER SEGUIDOS' : '') + '</div>';
    h += '<div class="ctop"><div class="cring" style="background:conic-gradient(' + col + ' 0 ' + pct + '%,var(--line) ' + pct + '% 100%)"><div><div><b>' + v + '/' + sp.n + '</b><small>' + esc(sp.racha ? sp.u + seg(sp.u) : sp.u) + '</small></div></div></div>';
    h += '<div class="cnums"><div>' + p.total + '<small>' + (WEEKLY[sp.src] ? 'semanas logradas' : 'en total') + '</small></div><div>' + Math.max(0, sp.n - v) + '<small>faltan</small></div><div style="color:#ff6e40">' + p.cur + '<small>racha actual</small></div><div>' + p.best + '<small>mejor racha</small></div></div></div>';
    if (sp.man) h += '<div class="cinfo m"><b>✋ MANUAL</b> — la app no puede saber esto: toca el día cuando cumplas. Puedes marcar <b>hoy y ayer</b> (por si se te olvidó); más atrás no, para que el conteo sea honesto.' + (sp.racha ? ' Si dejas pasar un día, la racha vuelve a 0 (tu mejor racha queda guardada).' : '') + '</div>';
    else h += '<div class="cinfo a"><b>⚡ AUTOMÁTICO</b> — ' + SRC_TXT[sp.src] + '. Al llegar a ' + sp.n + ' la meta se chulea sola y te llega un aviso. Los días de viaje no cuentan en contra.</div>';
    // casillas: últimos 14 días o últimas 8 semanas
    if (WEEKLY[sp.src]) {
      const L = p.L.slice(-8);
      h += '<div class="cleg">Últimas semanas</div><div class="cgrid" style="grid-template-columns:repeat(' + Math.max(4, L.length) + ',1fr)">' + L.map((x) => '<div class="cd ' + (x.v === true ? 'ok' : x.v === false ? 'no' : x.v === 'p' ? 'p' : 'tr') + '">S' + x.wk + '<i>' + (x.v === true ? '✓' : x.v === false ? '✕' : x.v === 'p' ? '…' : '–') + '</i></div>').join('') + '</div>';
    } else {
      const L = []; for (let i = 13; i >= 0; i--) { const d = X.addDays(X.today(), -i); const inPlan = X.iso(d) >= S().start; L.push({ d, v: inPlan ? dayVal(k, d) : null, out: !inPlan }); }
      h += '<div class="cleg">Últimos 14 días' + (sp.man ? ' · toca hoy o ayer para marcar' : '') + '</div><div class="cgrid">' + L.map((x) => {
        const di = X.iso(x.d); const tap = sp.man && !done && (di === td || di === yd);
        const cls = x.v === true ? (sp.man ? 'mk' : 'ok') : x.v === false ? 'no' : x.v === 'p' ? 'p' : 'tr';
        return '<div class="cd ' + cls + (tap ? ' tap' : '') + '"' + (tap ? ' data-cd="' + di + '" role="button"' : '') + '>' + (di === td ? 'HOY' : DC[x.d.getDay()] + ' ' + x.d.getDate()) + '<i>' + (x.v === true ? '✓' : x.v === false ? '✕' : x.v === 'p' ? '☐' : x.out ? '' : '✈') + '</i></div>';
      }).join('') + '</div>';
    }
    if (sp.man && !done) {
      const on = !!(S().dias[k] && S().dias[k][td]);
      h += '<button class="btn ' + (on ? 'alt' : 'pur') + '" data-cd="' + td + '">' + (on ? 'Desmarcar hoy' : '✓ Hoy cumplí: ' + esc(sp.hoy)) + '</button>';
      const shown = S().cntHoy[k] !== false;
      h += '<button class="btn alt sm" data-chs="1">' + (shown ? 'Quitar de “Marca tus días” en Hoy' : 'Mostrar en “Marca tus días” en Hoy') + '</button>';
    }
    if (!done && window.AS) h += AS.duo(p.broke ? 'rachaRota' : p.cur >= 2 ? 'racha' : 'motivacion', String(Math.max(0, sp.n - v)), k);
    return h + '</div>';
  }
  function toggleDay(k, di) {
    const sp = SPEC[k]; const td = X.iso(X.today()); const yd = X.iso(X.addDays(X.today(), -1));
    if (!sp || !sp.man || (di !== td && di !== yd)) return false;
    S().dias[k] = S().dias[k] || {};
    if (S().dias[k][di]) delete S().dias[k][di]; else { S().dias[k][di] = 1; if (navigator.vibrate) navigator.vibrate(25); }
    cache = null; X.save(); evaluate(); X.scheduleNotifs(); return true;
  }
  function detailClick(e, pid, id) {
    const k = pid + ':' + id;
    const c = e.target.closest('[data-cd]'); if (c) return toggleDay(k, c.dataset.cd);
    if (e.target.closest('[data-chs]')) { S().cntHoy[k] = S().cntHoy[k] === false; X.save(); return true; }
    return false;
  }

  // ---------- en Hoy: “Marca tus días de hoy” ----------
  function activeManual() {
    const w = X.weekOf(X.today());
    return Object.keys(SPEC).filter((k) => {
      const sp = SPEC[k]; if (!sp.man || S().cntHoy[k] === false) return false;
      const [pid, id] = k.split(':'); if (X.metaDone(pid, id)) return false;
      const r = X.RUTA.find((x) => x.pid === pid && x.id === id);
      const any = S().dias[k] && Object.keys(S().dias[k]).length;
      return any || !r || !r.w || r.w.s <= w;
    }).sort((a, b) => { const n = (k) => Object.keys(S().dias[k] || {}).length; return (n(b) > 0) - (n(a) > 0); });
  }
  function hoyHtml() {
    const A0 = activeManual(); if (!A0.length) return '';
    const td = X.iso(X.today()); const L = showAll ? A0 : A0.slice(0, 5);
    return '<div class="sec">✋ Marca tus días de hoy</div>' + L.map((k) => {
      const sp = SPEC[k]; const on = !!(S().dias[k] && S().dias[k][td]); const p = prog(k); const [pid, id] = k.split(':');
      return '<div class="cnt-row ' + (on ? 'on' : '') + '"><button class="chk" data-cday="' + k + '" aria-label="' + esc(sp.hoy) + '">' + (on ? '✓' : '') + '</button><div style="flex:1" data-cmeta="' + k + '"><div class="t">' + esc(sp.hoy) + '</div><div class="m">' + (pid === 'habitos' ? '' : esc(X.P[pid].name) + ' · ') + p.v + '/' + sp.n + ' ' + esc(sp.u) + (sp.racha ? seg(sp.u) : '') + ' · meta ' + id + '</div></div></div>';
    }).join('') + (A0.length > 5 ? '<button class="chipbtn" data-callx="1" style="margin-bottom:8px">' + (showAll ? 'Ver menos' : 'Ver ' + (A0.length - 5) + ' más') + '</button>' : '') +
      '<p class="muted" style="margin:2px 0 10px">Solo salen las metas de días que ya empezaron. Toca una para ver su contador o quitarla de aquí.</p>';
  }
  function hoyClick(e) {
    const c = e.target.closest('[data-cday]'); if (c) return toggleDay(c.dataset.cday, X.iso(X.today()));
    if (e.target.closest('[data-callx]')) { showAll = !showAll; return true; }
    const m = e.target.closest('[data-cmeta]'); if (m) { const [pid, id] = m.dataset.cmeta.split(':'); X.openMeta(pid, id); return false; }
    return false;
  }
  function pendingToday() { const td = X.iso(X.today()); return activeManual().filter((k) => !(S().dias[k] && S().dias[k][td])).map((k) => SPEC[k].hoy.toLowerCase()); }

  // ---------- se marca sola al llegar ----------
  function evaluate() {
    const out = [];
    Object.keys(SPEC).forEach((k) => {
      const [pid, id] = k.split(':'); if (X.metaDone(pid, id) || S().autoSkip[k]) return;
      const p = prog(k); if (p.v < SPEC[k].n) return;
      S().metas[k] = X.iso(X.today()); S().metaAuto[k] = 1; out.push(k);
    });
    if (!out.length) return out;
    X.save();
    out.forEach((k) => {
      const [pid, id] = k.split(':'); const g = X.getMeta(pid, id); const sp = SPEC[k];
      const nx = nextOf(pid, id);
      const o = window.AS ? AS.lines('metaAuto', nx ? nx.id : '', k) : {};
      const body = X.P[pid].name + ' ' + id + ' quedó chuleada: ' + sp.n + ' ' + sp.u + (sp.racha ? seg(sp.u) : '') + '.' + (o.h ? '\nHarvey: ' + o.h : '') + (o.m ? '\nMike: ' + o.m : '') + (nx ? '\nLa siguiente: ' + nx.id + ' ' + nx.t + '.' : '');
      if (X.N && X.N.notifyNow) { try { X.N.notifyNow('🎯 Meta cumplida sola: ' + g.meta.t, body, ''); } catch (er) {} }
      X.toast('🎯 Meta cumplida sola: ' + g.meta.t, 4500);
    });
    return out;
  }
  // la siguiente meta del mismo área que tenga contador y no esté cumplida
  function nextOf(pid, id) {
    const [a] = id.split('.'); const ar = X.P[pid].areas[a - 1];
    for (let j = 0; j < ar.metas.length; j++) { const id2 = a + '.' + (j + 1); if (!X.metaDone(pid, id2)) return { id: id2, t: ar.metas[j].t }; }
    return null;
  }

  // ---------- ajustes ----------
  X.hooks.yo.push(() => {
    const M = S().marcar; const ci = M.cierre || '20:35';
    let h = '<div class="sec">✓ Marcar bloques</div><div class="card">';
    h += '<div class="set-row"><span>Preguntarme al terminar cada bloque<br><span class="muted">Aviso con ✓ Hecho · ½ A medias · ✕ No pude</span></span><button class="sw ' + (M.fin !== false ? 'on' : '') + '" data-mk="fin"></button></div>';
    h += '<div class="set-row"><span>🌙 Cierra tu día<br><span class="muted">Si te quedan bloques o días sin marcar</span></span><span>' + (ci === 'off' ? '<button class="chipbtn" data-mk="cierreOn">Activar</button>' : '<input type="time" id="mkCi" value="' + ci + '" style="width:auto"> <button class="chipbtn" data-mk="cierreOff">Quitar</button>') + '</span></div>';
    h += '<div class="muted" style="margin-top:6px">✓ Hecho cuenta completo · ½ A medias cuenta para tus rachas y vale la mitad en el % · ✕ No pude no cuenta.</div></div>';
    return h;
  });
  X.hooks.yoBind.push(() => { const c = X.$('#mkCi'); if (c) c.onchange = () => { S().marcar.cierre = c.value || '20:35'; X.save(); X.scheduleNotifs(); X.toast('Cierra tu día a las ' + X.h12(S().marcar.cierre)); }; });
  X.hooks.yoClick.push((e) => {
    const b = e.target.closest('[data-mk]'); if (!b) return false;
    const M = S().marcar; const a = b.dataset.mk;
    if (a === 'fin') M.fin = M.fin === false; if (a === 'cierreOff') M.cierre = 'off'; if (a === 'cierreOn') M.cierre = '20:35';
    X.save(); X.scheduleNotifs(); X.render(); return true;
  });
  X.hooks.changed.push(() => { cache = null; evaluate(); });

  window.CNT = { SPEC, prog, pill, detail, detailClick, hoyHtml, hoyClick, pendingToday, evaluate, series, activeManual };
})();
