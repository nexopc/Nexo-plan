/* NEXO PLAN — Mapa de Quibdó, sitios, ubicación y rutas (a pie y en mototaxi) */
(function () {
  'use strict';
  const X = window.NP; const $ = X.$, esc = X.esc;
  const A = () => X.S.asis;
  const opt = (k, d) => (A()[k] != null ? A()[k] : d);
  const QUIBDO = [5.6935, -76.6525];
  const CATP = {
    casa: { n: 'Casa', i: '🏠', c: '#00e676' }, colegio: { n: 'Colegio', i: '🏫', c: '#a78bfa' }, trabajo: { n: 'Tienda (trabajo)', i: '🖥️', c: '#00e5ff' },
    barberia: { n: 'Barbería', i: '💈', c: '#ff4081' }, super: { n: 'Supermercado', i: '🛒', c: '#ff6e40' }, papeleria: { n: 'Papelería', i: '📎', c: '#ffab00' },
    salud: { n: 'Salud', i: '🏥', c: '#ff5252' }, otro: { n: 'Otro', i: '📍', c: '#8a94ad' }
  };
  let lluvia = false, modo = 'auto', mini = null, big = null;

  // ---------- utilidades ----------
  const R = 6371000;
  function dist(a, b) {
    const t = (x) => x * Math.PI / 180;
    const dLat = t(b.lat - a.lat), dLon = t(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h)) * 1.3; // 1,3 = las calles no son línea recta
  }
  const fmtM = (m) => (m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km');
  function legOf(m) {
    const limit = opt('walk', 1000);
    let mode = modo === 'pie' ? 'pie' : modo === 'moto' ? 'moto' : (m > limit || (lluvia && opt('lluviaMoto', true)) ? 'moto' : 'pie');
    const min = mode === 'pie' ? Math.max(1, Math.round(m / 80)) : Math.max(2, Math.round(m / 330) + 3);
    return { m, mode, min };
  }
  function isOpen(p, at) {
    if (!p.hours) return true; const d = new Date(at); const dw = X.dow(d);
    if (p.hours.days && !p.hours.days.includes(dw)) return false;
    const mm = d.getHours() * 60 + d.getMinutes();
    return mm >= X.mins(p.hours.from || '00:00') && mm <= X.mins(p.hours.to || '23:59');
  }
  const placeOf = (id) => X.S.places.find((p) => p.id === id) || null;
  const byCat = (c) => X.S.places.find((p) => p.cat === c) || null;

  // ---------- ubicación (GPS del celular, solo con la app abierta) ----------
  function getLoc(cb, quiet) {
    if (X.N && X.N.requestLocation) {
      X.N.requestLocation(X.regCb((ok, txt) => {
        let o = null; try { o = ok ? JSON.parse(txt) : null; } catch (e) {}
        if (o && o.lat) { X.S.lastLoc = { lat: o.lat, lon: o.lon, t: Date.now() }; X.save(); cb(X.S.lastLoc); }
        else { if (!quiet) X.toast(txt === 'perm' ? 'Dale permiso de ubicación a NEXO PLAN' : 'No pude leer tu ubicación (¿GPS apagado?)'); cb(null); }
      }), !!quiet);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => { X.S.lastLoc = { lat: p.coords.latitude, lon: p.coords.longitude, t: Date.now() }; X.save(); cb(X.S.lastLoc); }, () => { if (!quiet) X.toast('No pude leer tu ubicación'); cb(null); }, { timeout: 15000 });
    } else cb(null);
  }
  const freshLoc = () => (X.S.lastLoc && Date.now() - X.S.lastLoc.t < 15 * 60000 ? X.S.lastLoc : null);

  // ---------- ruta del día ----------
  function nextCommitment() {
    const d = X.today(); const nm = X.nowMin();
    const b = X.blocksOf(d).find((x) => X.mins(x.s) > nm && ['trabajo', 'colegio', 'cliente'].includes(x.cat) && !X.pausa(x, d));
    if (b && b.cat === 'trabajo' && byCat('trabajo')) return { p: byCat('trabajo'), at: X.atTime(d, b.s), b };
    if (b && b.cat === 'colegio' && byCat('colegio')) return { p: byCat('colegio'), at: X.atTime(d, b.s), b };
    if (nm >= 17 * 60 && byCat('casa')) return { p: byCat('casa'), at: X.atTime(d, '20:30'), b: null };
    return null;
  }
  function stopsToday() {
    const now = Date.now(); const endDay = X.atTime(X.today(), '21:00');
    return X.S.agenda.filter((x) => x.kind === 'flex' && !x.done && x.place && placeOf(x.place) &&
      ((x.slot && x.slot >= X.today().getTime() && x.slot <= endDay) || (x.deadline && x.deadline <= now + 3 * X.DAY) || (!x.slot && !x.deadline)));
  }
  function buildRoute(from) {
    const stops = stopsToday().map((x) => ({ x, p: placeOf(x.place) })).filter((s) => isOpen(s.p, Date.now() + 20 * 60000));
    const dest = nextCommitment();
    const order = []; let cur = from; const left = stops.slice();
    while (left.length) { left.sort((a, b) => dist(cur, a.p) - dist(cur, b.p)); const s = left.shift(); order.push(s); cur = s.p; }
    if (dest && !order.find((s) => s.p.id === dest.p.id)) order.push({ p: dest.p, dest });
    let t = Date.now(); let prev = from; const legs = []; let cost = 0;
    order.forEach((s) => { const lg = legOf(dist(prev, s.p)); t += lg.min * 60000; s.arrive = t; s.leg = lg; if (lg.mode === 'moto') cost += +opt('tarifa', 0) || 0; if (s.x) t += (s.x.dur || 10) * 60000; prev = s.p; legs.push(lg); });
    const total = Math.round((t - Date.now()) / 60000);
    return { from, order, total, cost, dest };
  }
  function mapsUrl(route) {
    const pts = route.order.map((s) => s.p.lat + ',' + s.p.lon);
    if (!pts.length) return null;
    const anyMoto = route.order.some((s) => s.leg && s.leg.mode === 'moto');
    let u = 'https://www.google.com/maps/dir/?api=1&destination=' + pts[pts.length - 1] + '&travelmode=' + (anyMoto ? 'driving' : 'walking');
    if (route.from) u += '&origin=' + route.from.lat + ',' + route.from.lon;
    if (pts.length > 1) u += '&waypoints=' + encodeURIComponent(pts.slice(0, -1).join('|'));
    return u;
  }
  function directionsTo(p) { X.openUrl('https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lon + '&travelmode=walking'); }

  // ---------- Leaflet ----------
  function pinIcon(p) {
    const c = CATP[p.cat] || CATP.otro;
    return L.divIcon({ className: 'pin3', html: '<b style="background:' + c.c + '"><i>' + c.i + '</i></b><span>' + esc(p.name) + '</span>', iconSize: [24, 24], iconAnchor: [12, 26] });
  }
  const meIcon = () => L.divIcon({ className: 'me3', html: '<i></i>', iconSize: [16, 16], iconAnchor: [8, 8] });
  function tiles(map) {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  }

  // ---------- en la Agenda ----------
  function agendaTop() {
    if (typeof L === 'undefined') return '';
    if (!X.S.places.length) return '<button class="ans" data-mapa="1" style="display:block;width:100%;text-align:left"><div class="k">🗺️ MAPA DE QUIBDÓ</div><div class="tt">Marca tus sitios: casa, colegio, tienda…</div><div class="why">Así el asistente te arma rutas a pie y en mototaxi para hacer tus vueltas.</div></button>';
    const st = stopsToday();
    let h = '<div class="minimap" id="minimap" data-mapa="1"></div>';
    if (st.length) h += '<button class="ans" data-ruta="1" style="display:block;width:100%;text-align:left;margin-top:8px"><div class="k">🗺️ RUTA DE HOY · ' + st.length + ' VUELTA(S)</div><div class="tt">' + st.map((x) => esc(placeOf(x.place).name)).join(' → ') + '</div><div class="why">Toca para ver el orden, a pie o en mototaxi.</div></button>';
    return h;
  }
  function afterAgenda() {
    const el = document.getElementById('minimap'); if (!el || typeof L === 'undefined') return;
    if (mini) { mini.remove(); mini = null; }
    mini = L.map(el, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false, tap: false, attributionControl: true });
    tiles(mini);
    const pts = [];
    X.S.places.forEach((p) => { L.marker([p.lat, p.lon], { icon: pinIcon(p), interactive: false }).addTo(mini); pts.push([p.lat, p.lon]); });
    const me = freshLoc(); if (me) { L.marker([me.lat, me.lon], { icon: meIcon(), interactive: false }).addTo(mini); pts.push([me.lat, me.lon]); }
    const st = stopsToday();
    if (st.length && me) { const r = buildRoute(me); L.polyline([[me.lat, me.lon]].concat(r.order.map((s) => [s.p.lat, s.p.lon])), { color: '#00e5ff', weight: 4, dashArray: '8 6' }).addTo(mini); }
    if (pts.length > 1) mini.fitBounds(pts, { padding: [24, 24], maxZoom: 16 }); else mini.setView(pts[0] || QUIBDO, 15);
  }
  function onClick(e) {
    if (e.target.closest('[data-ruta]')) { openRoute(); return true; }
    if (e.target.closest('[data-mapa]')) { openMap(); return true; }
    return false;
  }

  // ---------- mapa completo ----------
  function openMap() {
    let h = '<div class="maphead"><button class="back" data-x="1">‹ Agenda</button><span class="muted">Toca el mapa para marcar un sitio</span></div><div id="bigmap" class="bigmap"></div>' +
      '<div class="row2"><button class="btn alt sm" data-me="1">📍 Dónde estoy</button><button class="btn cy sm" data-rt="1">🗺️ Ruta de hoy</button></div>' +
      '<div class="sec">Mis sitios (' + X.S.places.length + ')</div>' + (X.S.places.length ? X.S.places.map((p) => '<div class="set-row" data-pl="' + p.id + '"><span>' + (CATP[p.cat] || CATP.otro).i + ' ' + esc(p.name) + '</span><span class="muted">' + (p.hours ? esc(p.hours.from) + '–' + esc(p.hours.to) : '') + ' ›</span></div>').join('') : '<p class="muted">Todavía no tienes sitios. Empieza por tu casa, tu colegio y la tienda.</p>');
    X.openPage(h);
    $('#page').onchange = null;
    big = L.map('bigmap', { zoomControl: true }).setView(QUIBDO, 15); tiles(big);
    const pts = [];
    X.S.places.forEach((p) => { const m = L.marker([p.lat, p.lon], { icon: pinIcon(p) }).addTo(big); m.on('click', () => placeForm(p)); pts.push([p.lat, p.lon]); });
    const me = freshLoc(); if (me) { L.marker([me.lat, me.lon], { icon: meIcon() }).addTo(big); pts.push([me.lat, me.lon]); }
    if (pts.length > 1) big.fitBounds(pts, { padding: [30, 30], maxZoom: 16 }); else if (pts.length) big.setView(pts[0], 16);
    big.on('click', (ev) => placeForm({ lat: ev.latlng.lat, lon: ev.latlng.lng }));
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { X.closePage(); X.render(); return; }
      if (e.target.closest('[data-me]')) { getLoc((l) => { if (l) { big.setView([l.lat, l.lon], 16); L.marker([l.lat, l.lon], { icon: meIcon() }).addTo(big); } }); return; }
      if (e.target.closest('[data-rt]')) { openRoute(); return; }
      const pl = e.target.closest('[data-pl]'); if (pl) placeForm(placeOf(pl.dataset.pl));
    };
  }
  function placeForm(p) {
    const isNew = !p.id; const F = Object.assign({ name: '', cat: 'otro', hours: null }, p);
    const H = F.hours || { days: [1, 2, 3, 4, 5, 6], from: '08:00', to: '19:00' };
    let useH = !!F.hours;
    const draw = () => {
      let h = '<div class="det"><h2>' + (isNew ? '➕ Nuevo sitio' : (CATP[F.cat] || CATP.otro).i + ' ' + esc(F.name)) + '</h2>';
      h += '<div class="f">NOMBRE</div><input id="pName" placeholder="Ej: Papelería del centro" value="' + esc(F.name) + '">';
      h += '<div class="f">TIPO</div><div class="cats2">' + Object.keys(CATP).map((k) => '<button class="' + (F.cat === k ? 'on' : '') + '" data-pc="' + k + '"><i>' + CATP[k].i + '</i>' + CATP[k].n + '</button>').join('') + '</div>';
      h += '<div class="set-row"><span>Tiene horario de atención</span><button class="sw ' + (useH ? 'on' : '') + '" data-uh="1"></button></div>';
      if (useH) {
        h += '<div class="chips wrap">' + [1, 2, 3, 4, 5, 6, 7].map((d) => '<button class="chip ' + (H.days.includes(d) ? 'on' : '') + '" data-hd="' + d + '">' + X.DIAS_S[d] + '</button>').join('') + '</div>';
        h += '<div class="row2"><div style="flex:1"><div class="f">ABRE</div><input type="time" id="pFrom" value="' + H.from + '"></div><div style="flex:1"><div class="f">CIERRA</div><input type="time" id="pTo" value="' + H.to + '"></div></div>';
      }
      h += '<button class="btn" data-ok="1">GUARDAR SITIO</button>' + (isNew ? '' : '<div class="row2"><button class="btn alt sm" data-go="1">🧭 Cómo llegar</button><button class="btn alt sm" data-del="1">Eliminar</button></div>') + '</div>';
      X.openSheet(h);
    };
    const read = () => { F.name = $('#pName').value; if (useH && $('#pFrom')) { H.from = $('#pFrom').value || H.from; H.to = $('#pTo').value || H.to; } };
    draw();
    $('#sheet').onclick = (e) => {
      const pc = e.target.closest('[data-pc]'); if (pc) { read(); F.cat = pc.dataset.pc; if (!F.name) F.name = CATP[F.cat].n; draw(); return; }
      if (e.target.closest('[data-uh]')) { read(); useH = !useH; draw(); return; }
      const hd = e.target.closest('[data-hd]'); if (hd) { read(); const d = +hd.dataset.hd; H.days = H.days.includes(d) ? H.days.filter((x) => x !== d) : H.days.concat([d]).sort(); draw(); return; }
      if (e.target.closest('[data-go]')) { directionsTo(F); return; }
      const del = e.target.closest('[data-del]');
      if (del) { if (del.dataset.sure) { X.S.places = X.S.places.filter((x) => x.id !== F.id); X.save(); X.closeSheet(); openMap(); } else { del.dataset.sure = '1'; del.textContent = '¿Seguro?'; del.style.color = '#ff5252'; } return; }
      if (e.target.closest('[data-ok]')) {
        read(); if (!F.name.trim()) { X.toast('Ponle nombre al sitio'); return; }
        const o = { id: F.id || ('p' + Date.now().toString(36)), name: F.name.trim(), cat: F.cat, lat: F.lat, lon: F.lon, hours: useH ? { days: H.days, from: H.from, to: H.to } : null };
        const i = X.S.places.findIndex((x) => x.id === o.id); if (i >= 0) X.S.places[i] = o; else X.S.places.push(o);
        X.save(); X.closeSheet(); openMap(); X.toast('📍 Sitio guardado');
      }
    };
  }

  // ---------- pantalla de ruta ----------
  function openRoute() {
    const draw = (from) => {
      let h = '<button class="back" data-x="1">‹ Atrás</button><div class="det"><h2>🗺️ Ruta de hoy</h2>';
      h += '<div class="modes2">' + [['auto', '✦ Auto (a pie + mototaxi)'], ['pie', '🚶 Solo a pie'], ['moto', '🛵 Mototaxi']].map(([k, n]) => '<button class="' + (modo === k ? 'on' : '') + '" data-md="' + k + '">' + n + '</button>').join('') + '</div>';
      h += '<div class="set-row"><span>🌧️ Está lloviendo</span><button class="sw ' + (lluvia ? 'on' : '') + '" data-ll="1"></button></div>';
      if (!from) { h += '<div class="box warn">No sé dónde estás. Toca “📍 Usar mi ubicación” o marca tu casa en el mapa.</div><button class="btn cy" data-loc="1">📍 Usar mi ubicación</button></div>'; X.openPage(h); return; }
      const r = buildRoute(from);
      if (!r.order.length) { h += '<div class="box">No tienes vueltas con sitio para hoy. Agrega un pendiente flexible con sitio (o díselo al asistente: “comprar cartulina en la papelería”).</div></div>'; X.openPage(h); return; }
      h += '<div class="stop2"><div class="ln"></div><div class="dot" style="background:#3987e5;color:#fff">●</div><div><div class="tt">Estás aquí</div><div class="wh">Sales ahora</div></div></div>';
      r.order.forEach((s, i) => {
        const c = CATP[s.p.cat] || CATP.otro; const last = i === r.order.length - 1;
        h += '<div class="stop2">' + (last ? '' : '<div class="ln"></div>') + '<div class="dot" style="background:' + c.c + '">' + (i + 1) + '</div><div><div class="mv">' + (s.leg.mode === 'pie' ? '🚶 A pie' : '🛵 Mototaxi') + ' · ' + fmtM(s.leg.m) + ' · ≈ ' + s.leg.min + ' min</div><div class="tt">' + c.i + ' ' + esc(s.p.name) + '</div><div class="wh">' +
          (s.x ? esc(s.x.title) + ' · ' + (s.x.dur || 10) + ' min' : s.dest ? (s.dest.b ? esc(s.dest.b.title) + ' a las ' + X.h12(X.hhmmOf(s.dest.at)) : 'Tu destino') + ' · llegas ' + X.h12(X.hhmmOf(s.arrive)) + (s.dest.at && s.arrive > s.dest.at ? ' ⚠️ tarde' : ' ✓') : '') +
          (s.p.hours ? ' · cierra ' + X.h12(s.p.hours.to) : '') + '</div></div></div>';
      });
      const motos = r.order.filter((s) => s.leg.mode === 'moto').length;
      h += '<div class="box">⏱️ Total ≈ ' + r.total + ' min · ' + (motos ? '🛵 ' + motos + ' mototaxi(s)' + (r.cost ? ' ≈ $' + r.cost.toLocaleString('es-CO') : ' (pon tu tarifa en Progreso)') : '🚶 todo a pie') + '</div>';
      if (window.AS) h += AS.duo('ruta');
      h += '<button class="btn" data-gm="1">🧭 Abrir en Google Maps</button></div>';
      X.openPage(h);
      $('#page').dataset.url = mapsUrl(r) || '';
    };
    const go = () => { const l = freshLoc() || (byCat('casa') ? { lat: byCat('casa').lat, lon: byCat('casa').lon } : null); draw(l); };
    go();
    getLoc((l) => { if (l) draw(l); }, true);
    $('#page').onchange = null;
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { X.closePage(); X.render(); return; }
      const md = e.target.closest('[data-md]'); if (md) { modo = md.dataset.md; go(); return; }
      if (e.target.closest('[data-ll]')) { lluvia = !lluvia; go(); return; }
      if (e.target.closest('[data-loc]')) { getLoc((l) => { if (l) draw(l); }); return; }
      if (e.target.closest('[data-gm]')) { const u = $('#page').dataset.url; if (u) X.openUrl(u); }
    };
  }

  // ---------- avisos por cercanía (mientras la app está abierta) ----------
  function proximity() {
    if (!opt('cerca', true) || document.hidden) return;
    const L2 = X.S.agenda.filter((x) => x.kind === 'flex' && !x.done && x.place && placeOf(x.place));
    if (!L2.length) return;
    getLoc((me) => {
      if (!me) return; const di = X.iso(X.today());
      L2.forEach((x) => {
        const p = placeOf(x.place); const d = dist(me, p);
        if (d < 350 && x.near !== di && isOpen(p, Date.now())) {
          x.near = di; X.save();
          const msg = '📍 Estás a ' + fmtM(d) + ' de ' + p.name + ': aprovecha y haz “' + x.title + '” (' + (x.dur || 10) + ' min).';
          X.toast(msg); if (X.N && X.N.notifyNow) X.N.notifyNow('📍 Estás cerca de ' + p.name, x.title + ' · ' + (x.dur || 10) + ' min. ' + (window.AS ? AS.line('flex', 'h') : ''), 'flex|' + x.id);
          if (window.AS) AS.say('flex', msg);
        }
      });
    }, true);
  }
  setInterval(proximity, 120000);
  X.hooks.resume.push(() => setTimeout(proximity, 3000));

  // ---------- ajustes en Progreso ----------
  X.hooks.yo.push(() => {
    let st = {}; try { st = X.N && X.N.locStatus ? JSON.parse(X.N.locStatus()) : {}; } catch (e) {}
    let h = '<div class="sec">📍 Ubicación y rutas</div><div class="card">';
    h += '<div class="set-row"><span>Permiso de ubicación<br><span class="muted">Solo con la app abierta · nunca sale de tu celular</span></span>' + (st.perm ? '<span class="ok">Sí</span>' : '<button class="chipbtn" data-y="locperm">Activar</button>') + '</div>';
    h += '<div class="set-row"><span>Avisos por cercanía</span><button class="sw ' + (opt('cerca', true) ? 'on' : '') + '" data-y="cerca"></button></div>';
    h += '<div class="set-row"><span>Camino a pie hasta</span><span>' + [500, 1000, 1500].map((m) => '<button class="chipbtn ' + (opt('walk', 1000) === m ? 'onb' : '') + '" data-yw="' + m + '">' + fmtM(m / 1.0) + '</button>').join(' ') + '</span></div>';
    h += '<div class="set-row"><span>Tarifa de mototaxi (COP)</span><input id="yTar" type="number" inputmode="numeric" placeholder="Ponla tú" value="' + (opt('tarifa', 0) || '') + '" style="width:110px"></div>';
    h += '<div class="set-row"><span>Si llueve, todo en mototaxi</span><button class="sw ' + (opt('lluviaMoto', true) ? 'on' : '') + '" data-y="lluviaMoto"></button></div>';
    h += '<div class="set-row" data-y="mapa"><span>🗺️ Mis sitios (' + X.S.places.length + ')</span><span class="chipbtn">Abrir mapa ›</span></div>';
    h += '<p class="muted" style="margin-top:6px">El mapa guarda las zonas que ya viste para cuando no tengas señal.</p></div>';
    return h;
  });
  X.hooks.yoBind.push(() => { const t = $('#yTar'); if (t) t.onchange = () => { A().tarifa = Math.max(0, parseInt(t.value, 10) || 0); X.save(); X.toast('Tarifa guardada'); }; });
  X.hooks.yoClick.push((e) => {
    const w = e.target.closest('[data-yw]'); if (w) { A().walk = +w.dataset.yw; X.save(); X.render(); return true; }
    const y = e.target.closest('[data-y]'); if (!y) return false;
    const k = y.dataset.y;
    if (k === 'locperm') { getLoc(() => X.render()); return true; }
    if (k === 'mapa') { openMap(); return true; }
    if (k === 'cerca' || k === 'lluviaMoto') { A()[k] = !opt(k, true); X.save(); X.render(); return true; }
    return false;
  });

  window.MAPA = { agendaTop, afterAgenda, onClick, openMap, openRoute, directionsTo, getLoc, dist, buildRoute, stopsToday, placeOf, byCat, CATP, fmtM, isOpen, freshLoc };
})();
