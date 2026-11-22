/* NEXO PLAN — Asistente Harvey + Mike (gratis, sin internet: reglas + tus datos) */
(function () {
  'use strict';
  const X = window.NP; const $ = X.$, esc = X.esc;
  const A = () => X.S.asis;
  const opt = (k, d) => (A()[k] != null ? A()[k] : d);
  const V = window.VOCES;

  // ---------- voces ----------
  function line(cat, who, x, seed) {
    const c = V[cat] || V.bloque; const arr = (c && c[who]) || V.bloque[who];
    const i = X.hash(cat + who + (seed || '') + X.iso(X.today())) % arr.length;
    return arr[i].replace(/\{x\}/g, x == null ? '' : x).replace(/\{n\}/g, pf().nombre.split(' ')[0]);
  }
  function lines(cat, x, seed) {
    const v = opt('voz', 'ambos'); const o = {};
    if (v !== 'mike') o.h = line(cat, 'h', x, seed);
    if (v !== 'harvey') o.m = line(cat, 'm', x, seed);
    return o;
  }
  const hv = (who, t) => '<div class="hv ' + who + '"><div class="av">' + (who === 'h' ? 'H' : 'M') + '</div><div><b class="n">' + (who === 'h' ? 'HARVEY' : 'MIKE') + '</b>' + esc(t) + '</div></div>';
  function duo(cat, x, seed) { const o = lines(cat, x, seed); return (o.h ? hv('h', o.h) : '') + (o.m ? hv('m', o.m) : ''); }
  const plainDuo = (o) => [o.h ? 'Harvey: ' + o.h : '', o.m ? 'Mike: ' + o.m : ''].filter(Boolean).join('\n');

  // ---------- perfil: lo que Harvey y Mike saben de ti (solo en tu celular) ----------
  const PERFIL_DEF = { nombre: 'Cristóbal', edad: '18', ciudad: 'Quibdó, Chocó', grado: '10.° grado', trabajo: 'Trabajo en una tienda de computadores',
    cel: 'Samsung A25', mueve: 'A pie y en mototaxi', meta: 'Abrir NEXO PC (hardware y gaming) en Quibdó en 4 años', eslogan: 'Excelencia digital, confianza real',
    carrera: 'Ingeniería en Nanotecnología', herramientas: 'Filmora 16, Canva, Figma, VS Code, Google Sheets',
    estilo: 'Directo, con datos reales y crítica constructiva. Que me digan cuando no estoy dando lo mejor.', extra: '' };
  const PF_CAMPOS = [['nombre', 'Nombre'], ['edad', 'Edad'], ['ciudad', 'Ciudad'], ['grado', 'Colegio'], ['trabajo', 'Trabajo'], ['cel', 'Celular'], ['mueve', 'Cómo te mueves'],
    ['meta', 'Tu meta grande'], ['eslogan', 'Eslogan de NEXO PC'], ['carrera', 'Qué quieres estudiar'], ['herramientas', 'Herramientas que usas'], ['estilo', 'Cómo te gusta que te hablen'], ['extra', 'Otras cosas que deben saber']];
  function pf() { return Object.assign({}, PERFIL_DEF, X.S.perfil || {}); }
  // resume el horario real: “Colegio: Lun 7:30 am–1:00 pm · Mar–Vie 7:00 am–1:20 pm”
  function diasTxt(arr) {
    const D = X.DIAS_S; const runs = []; let a = arr[0], b = arr[0];
    for (let i = 1; i <= arr.length; i++) { if (arr[i] === b + 1) b = arr[i]; else { runs.push(a === b ? D[a] : b === a + 1 ? D[a] + ', ' + D[b] : D[a] + '–' + D[b]); a = b = arr[i]; } }
    return runs.join(', ');
  }
  function catTxt(cat, onlyStart) {
    const G = {}; window.HORARIO.filter((b) => b.cat === cat).forEach((b) => { const k = onlyStart ? b.s : b.s + '-' + b.e; (G[k] = G[k] || []).push(b.d); });
    return Object.keys(G).map((k) => { const [s0, e0] = k.split('-'); return diasTxt(G[k]) + ' ' + X.h12(s0) + (e0 ? '–' + X.h12(e0) : ''); }).join(' · ');
  }
  function semanaTxt() {
    return [['Ejercicio', catTxt('ejercicio', true)], ['Colegio', catTxt('colegio')], ['Inglés', catTxt('ingles')], ['Tienda', catTxt('trabajo')], ['A dormir', catTxt('dormir', true)]].filter((x) => x[1]).map((x) => '<b>' + x[0] + ':</b> ' + esc(x[1])).join('<br>');
  }
  // lo que va aprendiendo de tus marcas (últimas 4 semanas, solo días en que marcaste algo)
  const CAT_N = (c) => (window.CATS[c] && window.CATS[c].n) || c;
  function insights() {
    const td = X.today(); const byCat = {}, byDay = {}, band = { 'la mañana': [0, 0], 'la tarde': [0, 0], 'la noche': [0, 0] }; const why = {}; let half = 0, days = 0, marks = 0;
    for (let i = 1; i <= 28; i++) {
      const d = X.addDays(td, -i); const di = X.iso(d); if (X.tripOf(di) || di < X.S.start) continue;
      const bl = X.blocksOf(d).filter((b) => window.CATS[b.cat].check && !X.pausa(b, d) && b.cat !== 'colegio');
      const m = bl.filter((b) => X.blockState(di, b.id)).length; if (!m) continue; days++; marks += m;
      bl.forEach((b) => {
        const sc = X.blockScore(di, b.id); const st = X.blockState(di, b.id);
        (byCat[b.cat] = byCat[b.cat] || [0, 0]); byCat[b.cat][0] += sc; byCat[b.cat][1]++;
        const wd = X.dow(d); (byDay[wd] = byDay[wd] || [0, 0]); byDay[wd][0] += sc; byDay[wd][1]++;
        const hb = X.mins(b.s) < 720 ? 'la mañana' : X.mins(b.s) < 1080 ? 'la tarde' : 'la noche'; band[hb][0] += sc; band[hb][1]++;
        if (st === 'half') half++;
        if (st === 'no') { const w = X.blockWhy(di, b.id) || 'sin motivo'; why[w] = (why[w] || 0) + 1; }
      });
    }
    if (days < 3 || marks < 8) return { ok: false, days };
    const rate = (x) => Math.round(x[0] / x[1] * 100);
    const cats = Object.keys(byCat).filter((c) => byCat[c][1] >= 3).sort((a, b) => rate(byCat[b]) - rate(byCat[a]));
    const wds = Object.keys(byDay).filter((k) => byDay[k][1] >= 4).sort((a, b) => rate(byDay[a]) - rate(byDay[b]));
    const bands = Object.keys(band).filter((k) => band[k][1] >= 4).sort((a, b) => rate(band[b]) - rate(band[a]));
    const ws = Object.keys(why).filter((w) => w !== 'sin motivo').sort((a, b) => why[b] - why[a]);
    const L = [];
    if (cats.length) L.push('Cumples mejor: ' + CAT_N(cats[0]) + ' (' + rate(byCat[cats[0]]) + '%)');
    if (cats.length > 1) L.push('Te cuesta más: ' + CAT_N(cats[cats.length - 1]) + ' (' + rate(byCat[cats[cats.length - 1]]) + '%)');
    if (wds.length) L.push('Tu día más difícil: ' + X.DIAS[wds[0]].toLowerCase() + ' (' + rate(byDay[wds[0]]) + '%)');
    if (bands.length > 1) L.push('Rindes más en ' + bands[0] + ' (' + rate(band[bands[0]]) + '%)');
    if (ws.length) L.push('Cuando no puedes, casi siempre es por: ' + ws[0].toLowerCase() + ' (' + why[ws[0]] + ' veces)');
    if (half >= 3) L.push(half + ' bloques a medias en 4 semanas');
    return { ok: true, days, L, worst: cats[cats.length - 1], best: cats[0] };
  }
  function perfilTxt() {
    const p = pf(); const ej = X.ejStreak(); const R = X.ruta(null);
    const lag = X.ORDER.map((id) => ({ id, n: X.ruta(id).atrasadas.length })).sort((a, b) => b.n - a.n)[0];
    return 'Eres ' + p.nombre + ', ' + p.edad + ' años, de ' + p.ciudad.split(',')[0] + '. Estás en ' + p.grado.replace(/ grado$/, '') + ' y ' + (p.trabajo.charAt(0).toLowerCase() + p.trabajo.slice(1)).replace(/^trabajo /, 'trabajas ') + '. Tu meta: ' + p.meta.charAt(0).toLowerCase() + p.meta.slice(1) + '. ' +
      'Llevas ' + ej + ' día(s) de racha de ejercicio y ' + R.llevas + ' metas cumplidas' + (lag && lag.n ? '; el proyecto que más se te atrasa es ' + X.P[lag.id].name + ' (' + lag.n + ' metas)' : '') + '.';
  }
  function openPerfil(edit) {
    const p = pf(); const I = insights();
    let h = '<button class="back" data-x="1">‹ Asistente</button><div class="det"><h2>👤 Lo que Harvey y Mike saben de ti</h2>';
    h += '<div class="lock">🔒 Se guarda solo en tu celular. Nada sale a internet.</div>';
    if (edit) {
      PF_CAMPOS.forEach(([k, n]) => { h += '<div class="f">' + esc(n.toUpperCase()) + '</div>' + (k === 'estilo' || k === 'extra' || k === 'meta' ? '<textarea id="pf_' + k + '" rows="2">' + esc(p[k]) + '</textarea>' : '<input id="pf_' + k + '" value="' + esc(p[k]) + '">'); });
      h += '<button class="btn" data-pfs="1">Guardar</button><button class="btn alt" data-pfr="1">Volver a los datos de fábrica</button></div>';
    } else {
      h += '<div class="pf"><div class="k">TÚ <i data-pfe="1" role="button">✎ editar</i></div><div class="v">' + esc([p.nombre, p.edad + ' años', p.ciudad, p.grado, p.trabajo.toLowerCase(), p.cel, 'te mueves ' + p.mueve.toLowerCase()].join(' · ')) + '</div></div>';
      h += '<div class="pf"><div class="k">TU META GRANDE</div><div class="v">' + esc(p.meta) + ' · “' + esc(p.eslogan) + '” · después: ' + esc(p.carrera) + '</div></div>';
      h += '<div class="pf"><div class="k">TUS ' + X.ORDER.length + ' PROYECTOS</div><div class="v">' + X.ORDER.map((id) => esc(X.P[id].name) + ' <span class="muted">(' + countDone(id) + '/64)</span>').join(' · ') + '</div></div>';
      h += '<div class="pf"><div class="k">TU SEMANA</div><div class="v">' + semanaTxt() + '</div></div>';
      h += '<div class="pf"><div class="k">HERRAMIENTAS</div><div class="v">' + esc(p.herramientas) + '</div></div>';
      h += '<div class="pf"><div class="k">CÓMO TE GUSTA QUE TE HABLEN</div><div class="v">' + esc(p.estilo) + '</div></div>';
      if (p.extra) h += '<div class="pf"><div class="k">OTRAS COSAS</div><div class="v">' + esc(p.extra) + '</div></div>';
      h += '<div class="pf"><div class="k">LO QUE VA APRENDIENDO DE TUS MARCAS <i>automático</i></div><div class="v">' + (I.ok ? '<ul>' + I.L.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><span class="muted">Últimas 4 semanas · ' + I.days + ' días con marcas.</span>' : 'Todavía estoy aprendiendo. Marca tus bloques (✓, ½ o ✕) unos días y aquí te digo en qué fallas y cuándo rindes más.') + '</div></div>';
      h += '<button class="btn alt" data-pfe="1">✎ Editar mis datos</button></div>';
    }
    X.openPage(h);
    X.$('#page').onchange = null;
    X.$('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { X.closePage(); X.render(); return; }
      if (e.target.closest('[data-pfe]')) { openPerfil(true); return; }
      if (e.target.closest('[data-pfs]')) { const o = {}; PF_CAMPOS.forEach(([k]) => { const el = X.$('#pf_' + k); if (el) o[k] = el.value.trim() || PERFIL_DEF[k]; }); X.S.perfil = o; X.save(); X.toast('✓ Perfil guardado'); openPerfil(false); return; }
      if (e.target.closest('[data-pfr]')) { X.S.perfil = null; X.save(); openPerfil(false); }
    };
  }
  const countDone = (pid) => X.RUTA.filter((x) => x.pid === pid && X.metaDone(x.pid, x.id)).length;
  // análisis de la semana con tus marcas
  function semanaAnalisis() {
    const td = X.today(); const mon = X.mondayOf(X.weekOf(td)); const C = {}; let plan = 0, sc = 0, nOk = 0, nHalf = 0, nNo = 0, nSin = 0; const why = {};
    for (let d = mon; d <= td; d = X.addDays(d, 1)) {
      const di = X.iso(d); if (X.tripOf(di)) continue; const isT = di === X.iso(td);
      X.blocksOf(d).forEach((b) => {
        if (!window.CATS[b.cat].check || X.pausa(b, d) || b.cat === 'colegio') return;
        if (isT && X.mins(b.e) > X.nowMin()) return;
        const st = X.blockState(di, b.id); plan++; sc += X.blockScore(di, b.id);
        if (st === 'ok') nOk++; else if (st === 'half') nHalf++; else if (st === 'no') nNo++; else nSin++;
        const c = (C[b.cat] = C[b.cat] || { plan: 0, sc: 0, half: 0, no: 0, sin: 0, title: b.title });
        c.plan++; c.sc += X.blockScore(di, b.id); if (st === 'half') c.half++; if (st === 'no') c.no++; if (!st) c.sin++;
        if (st === 'no') { const w = X.blockWhy(di, b.id); if (w) why[w] = (why[w] || 0) + 1; }
      });
    }
    const proj = Object.keys(C).filter((c) => ['app', 'video', 'agencia', 'nexo', 'cliente'].includes(c) && C[c].plan >= 2).sort((a, b) => C[a].sc / C[a].plan - C[b].sc / C[b].plan);
    return { plan, pct: plan ? Math.round(sc / plan * 100) : 0, nOk, nHalf, nNo, nSin, C, worst: proj[0] || null, why };
  }

  // ---------- chat ----------
  const chat = () => X.S.chat;
  function push(msg) { msg.ts = Date.now(); chat().push(msg); while (chat().length > 60) chat().shift(); X.save(); return msg; }
  function say(cat, text, extra) { return push(Object.assign({ who: 'ai', text, v: lines(cat, extra && extra.x, text) }, extra || {})); }

  // ---------- normalización ----------
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const DIAS_N = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 7 };
  const MESES_N = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
  const stripTimePhrases = (t) => t.replace(/(de|en|por) la (manana|tarde|noche)/g, ' ');

  function parseDay(t0) {
    const t = stripTimePhrases(t0); const td = X.today();
    let m;
    if (/pasado manana/.test(t)) return X.addDays(td, 2);
    if ((m = t.match(/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)/))) {
      let d = new Date(td.getFullYear(), MESES_N[m[2]], +m[1]); if (d < td) d = new Date(td.getFullYear() + 1, MESES_N[m[2]], +m[1]); return d;
    }
    if ((m = t.match(/\b(\d{1,2})\/(\d{1,2})\b/))) { let d = new Date(td.getFullYear(), +m[2] - 1, +m[1]); if (d < td) d = new Date(td.getFullYear() + 1, +m[2] - 1, +m[1]); return d; }
    if (/\bhoy\b|esta tarde|esta noche/.test(t)) return td;
    for (const k in DIAS_N) {
      if (new RegExp('\\b' + k + '\\b').test(t)) {
        const want = DIAS_N[k]; let diff = (want - X.dow(td) + 7) % 7; if (diff === 0) diff = 7;
        if (new RegExp('proximo ' + k + '|' + k + ' de la otra semana').test(t)) diff += diff < 7 ? 7 : 0;
        return X.addDays(td, diff);
      }
    }
    if (/\bmanana\b/.test(t)) return X.addDays(td, 1);
    return null;
  }
  function parseTime(t) {
    let m = t.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.? ?m\.?|p\.? ?m\.?)(?![a-z])/);
    let h, mi, mer = null;
    if (m) { h = +m[1]; mi = +(m[2] || 0); mer = /p/.test(m[3]) ? 'pm' : 'am'; }
    else if ((m = t.match(/a las? (\d{1,2})(?:[:.](\d{2}))?(?:\s*(de la manana|de la tarde|de la noche|del mediodia))?/))) { h = +m[1]; mi = +(m[2] || 0); mer = m[3] ? (/manana/.test(m[3]) ? 'am' : 'pm') : null; }
    else if ((m = t.match(/\b(\d{1,2}):(\d{2})\b/))) { h = +m[1]; mi = +m[2]; }
    else return null;
    if (h > 23 || mi > 59) return null;
    if (mer === 'pm' && h < 12) h += 12; else if (mer === 'am' && h === 12) h = 0; else if (!mer && h >= 1 && h <= 6) h += 12;
    return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
  }
  function parseDur(t) {
    let m;
    if (/hora y media/.test(t)) return 90;
    if (/media hora/.test(t)) return 30;
    if ((m = t.match(/(\d+)\s*(min|minutos|mins)\b/))) return Math.min(240, +m[1]);
    if ((m = t.match(/(\d+(?:[.,]5)?)\s*(h|hr|hrs|hora|horas)\b/))) return Math.min(240, Math.round(parseFloat(m[1].replace(',', '.')) * 60));
    if (/una hora/.test(t)) return 60;
    return null;
  }
  function parseDeadline(t) {
    let m;
    if ((m = t.match(/antes del? ((?:pasado )?manana|lunes|martes|miercoles|jueves|viernes|sabado|domingo|\d{1,2} de [a-z]+|\d{1,2}\/\d{1,2})/))) { const d = parseDay(m[1]); if (d) return X.atTime(X.addDays(d, -1), '21:00'); }
    if (/esta semana/.test(t)) { const d = X.addDays(X.today(), 7 - X.dow(X.today())); return X.atTime(d, '21:00'); }
    const d = parseDay(t); if (d) return X.atTime(d, '21:00');
    return X.atTime(X.addDays(X.today(), 6), '21:00');
  }
  const SUBJ_ALIAS = [['educacion fisica', 'Educación física'], ['ed fisica', 'Educación física'], ['economia', 'Economía y política'], ['etica', 'Ética y valores'], ['estadistica', 'Estadística'],
    ['matematica', 'Matemáticas'], ['mate', 'Matemáticas'], ['fisica', 'Física'], ['quimica', 'Química'], ['espanol', 'Español'], ['lengua', 'Español'], ['sociales', 'Sociales'], ['filosofia', 'Filosofía'],
    ['naturales', 'Naturales'], ['biologia', 'Naturales'], ['informatica', 'Informática'], ['sistemas', 'Informática'], ['musica', 'Música'], ['danza', 'Danza'], ['artistica', 'Artística'], ['catedra', 'Cátedra']];
  function parseSubj(t) {
    if (/ingles/.test(t)) return /curso|taller de ingles|clase de la tarde/.test(t) ? 'Curso de inglés' : 'Inglés';
    for (const [a, k] of SUBJ_ALIAS) if (new RegExp('\\b' + a).test(t)) return k;
    if (/del trabajo|en la tienda|para la tienda|mi turno/.test(t)) return 'Trabajo';
    return null;
  }
  function parseType(t) {
    if (/examen|evaluacion|parcial|quiz|prueba/.test(t)) return 'examen';
    if (/exposicion|\bexpo\b|sustentacion/.test(t)) return 'expo';
    if (/en grupo|grupal/.test(t)) return 'grupo';
    if (/tarea|taller|informe|ensayo|ejercicio|trabajo escrito|cartelera|maqueta|guia|resumen|mapa conceptual/.test(t)) return 'tarea';
    return null;
  }
  const PLACE_KW = { papeleria: /papeler/, barberia: /barber|motilar|cortarme el pelo|corte de pelo/, super: /supermercado|mercado|\bsuper\b|mercar/, salud: /\beps\b|hospital|medic|dentista|odontolog|drogueria|farmacia/, casa: /\bcasa\b/, colegio: /colegio/, trabajo: /\btienda\b|trabajo/ };
  function parsePlace(t) {
    const P = X.S.places;
    const byName = P.find((p) => p.name && norm(p.name).length > 3 && t.includes(norm(p.name)));
    if (byName) return byName.id;
    for (const c in PLACE_KW) if (PLACE_KW[c].test(t)) { const p = P.find((x) => x.cat === c); if (p) return p.id; }
    return null;
  }
  function cleanTitle(raw) {
    let s = raw.trim().replace(/^(por favor,?\s*)?(an[oó]ta(me)? que|an[oó]ta(me)?|recu[eé]rdame( que)?|gu[aá]rdame|ag[eé]ndame|agenda|tengo que|debo|hay que|necesito)\s+/i, '');
    s = s.replace(/\s*,?\s*(\d+\s*(min|minutos)|media hora|una hora|\d+\s*horas?)\b.*$/i, '').replace(/\s+(antes del?|para el|el|este|esta)\s+(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|ma[nñ]ana|hoy).*$/i, '');
    s = s.replace(/\s+(ma[nñ]ana|hoy|pasado ma[nñ]ana)$/i, '');
    s = s.charAt(0).toUpperCase() + s.slice(1);
    return s.slice(0, 70) || raw.slice(0, 70);
  }
  const notesOf = (t) => (t.match(/(capitulo|cap|pagina|pag|unidad|tema)\s*\.?\s*\d+[a-z]?/g) || []).join(', ');

  // ---------- la mejor acción en un momento dado ----------
  function bestActions(at) {
    at = at || Date.now();
    const d = new Date(at); const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const di = X.iso(d0);
    const nm = d.getHours() * 60 + d.getMinutes(); const C = [];
    const add = (o) => C.push(o);
    if (nm >= 20 * 60 + 30 || nm < 5 * 60) add({ s: 999, cat: 'dormir', t: 'A dormir: celular lejos de la cama', w: 'Mañana a las 5:00 am empieza tu día. Dormir 8 horas también es parte del plan.', o: { t: 'none' } });
    const tr = X.tripOf(di);
    if (tr) add({ s: 500, cat: 'viaje', t: 'Tu plan de viaje de hoy', w: 'Estás en modo fuera de casa: haz las tareas cortas del plan.', o: { t: 'hoy' } });
    // bloque actual
    const cur = X.blocksOf(d0).find((b) => X.mins(b.s) <= nm && nm < X.mins(b.e) && !X.pausa(b, d0));
    if (cur && !tr) {
      if (cur.cat === 'colegio') {
        const cl = X.sessionsOn(d0).find((x) => x.kind === 'clase' && X.mins(x.s) <= nm && nm < X.mins(x.e));
        add({ s: 400, cat: 'colegio', t: cl ? 'Estás en ' + cl.n : 'Estás en el colegio', w: cl && X.tasksDueAt(X.atTime(d0, cl.s), cl.keys).length ? '📌 En esta clase entregas: ' + X.tasksDueAt(X.atTime(d0, cl.s), cl.keys).map((t) => t.title).join(', ') : 'Pon atención y anota cualquier tarea que dejen: me la dices y la agendo.', o: { t: 'none' } });
      } else if (cur.cat === 'trabajo') add({ s: 380, cat: 'trabajo', t: 'Estás en tu turno de la tienda', w: X.topicOf(cur, d0).t, o: { t: 'block', id: cur.id, di } });
      else if (window.CATS[cur.cat].check && !X.isDone(di, cur.id)) {
        const tp = X.topicOf(cur, d0);
        add({ s: 200 + (X.S.anchors[cur.id] ? 40 : 0), cat: V[cur.cat] ? cur.cat : 'bloque', t: (X.S.anchors[cur.id] ? '⚓ ' : '') + cur.title + (tp.t ? ': ' + tp.t : ''), w: (tp.d || '') + ' Termina a las ' + X.h12(cur.e) + '.', o: { t: 'block', id: cur.id, di } });
      }
    }
    // entregas
    const future = at > Date.now() + 30 * 60000;
    X.pending().forEach((t) => {
      const hrs = (t.due - at) / 3600000; const ty = X.TT[t.type] || X.TT.tarea;
      if (hrs < 0 && future) return; // en avisos a futuro no sabemos si ya la entregó
      if (hrs < 0) add({ s: 330, cat: 'entrega', t: '⛔ ' + t.title + ' (atrasada)', w: 'Era para ' + X.fmtWhen(t.due) + '. Entrégala cuanto antes y habla con el profe.', o: { t: 'task', id: t.id } });
      else if (hrs <= 48) add({ s: 300 - hrs, cat: t.type === 'examen' ? 'examen' : 'entrega', x: hrs < 24 ? 'mañana' : 'pasado mañana', t: ty.i + ' ' + t.title, w: 'Se entrega ' + X.fmtWhen(t.due) + ' · ' + X.subj(t.subj).n + '.', o: { t: 'task', id: t.id } });
      else if (t.type === 'examen' && hrs <= 5 * 24) add({ s: 160 - hrs / 24 * 8, cat: 'examen', x: Math.ceil(hrs / 24) + ' días', t: '📖 Estudia 25 min para: ' + t.title, w: 'El examen es ' + X.fmtWhen(t.due) + '. Estudiar un poco cada día rinde más que una noche entera.', o: { t: 'task', id: t.id } });
    });
    // pendientes flexibles
    X.S.agenda.forEach((x) => {
      if (x.kind !== 'flex' || x.done) return;
      const dur = (x.dur || 30) * 60000;
      if (x.slot && x.slot - 10 * 60000 <= at && at <= x.slot + dur + 30 * 60000) add({ s: 260, cat: 'flex', t: '🔄 ' + x.title + ' (' + (x.dur || 30) + ' min)', w: 'Lo agendaste para ahora.' + (window.AG && AG.placeOf(x.place) ? ' 📍 ' + AG.placeOf(x.place).name : ''), o: { t: 'flex', id: x.id } });
      else if (!x.slot && x.deadline && x.deadline - at < 2 * X.DAY) add({ s: 140, cat: 'flex', t: '🔄 ' + x.title, w: 'Vence ' + X.fmtShort(new Date(x.deadline)) + ' y no tiene hora. Agéndala o hazla ya.', o: { t: 'flex', id: x.id } });
    });
    // metas atrasadas
    const R = X.ruta(null); const pool = R.atrasadas.concat(R.enCurso); const m = future && pool.length ? pool[X.hash(String(at)) % Math.min(pool.length, 12)] : (R.atrasadas[0] || R.enCurso[0]);
    const late = m && R.atrasadas.includes(m);
    if (m) add({ s: late ? 90 : 60, cat: late ? 'meta' : 'motivacion', t: (late ? 'Recupera la meta ' : 'Avanza la meta ') + m.id + ' de ' + X.P[m.pid].name + ': ' + m.m.t, w: 'Primer paso: ' + m.m.s[0], o: { t: 'meta', pid: m.pid, id: m.id } });
    // ejercicio
    const ej = X.S.ej[di];
    if (!future && !(ej && ej.fin) && nm < 20 * 60 && nm >= 5 * 60) add({ s: cur && cur.cat === 'libre' ? 120 : 70, cat: 'ejercicio', t: '⚡ Tu rutina de ejercicio de hoy', w: 'Todavía no la marcas. En versión corta son 10 a 15 minutos.', o: { t: 'ej' } });
    // siguiente bloque
    const nx = X.blocksOf(d0).find((b) => X.mins(b.s) > nm && window.CATS[b.cat].check && !X.pausa(b, d0));
    if (nx && cur && cur.cat === 'libre') add({ s: 50, cat: 'bloque', t: 'Prepárate para ' + nx.title + ' (' + X.h12(nx.s) + ')', w: X.topicOf(nx, d0).t || '', o: { t: 'block', id: nx.id, di } });
    if (!C.length) add({ s: 1, cat: 'bien', t: 'Vas al día: adelanta algo de la próxima semana', w: 'Mira Metas → Mi ruta y escoge una meta próxima.', o: { t: 'ruta' } });
    return C.sort((a, b) => b.s - a.s);
  }
  function bestCard(limitMin, cat) {
    const L = bestActions().slice(0, 6).map((c) => ({ t: c.t, w: c.w, cat: c.cat, x: c.x || '', o: c.o }));
    return { type: 'best', cands: L, idx: 0, limit: limitMin || null, extraCat: cat || null };
  }

  // ---------- comprender lo que escribe ----------
  function understand(raw) {
    const t = norm(raw);
    push({ who: 'me', text: raw });
    let m;
    // viaje
    if (/(me voy|viajo|de viaje|voy a viajar|salgo para|me voy de vacaciones)/.test(t)) {
      m = t.match(/del? (\d{1,2})(?: de ([a-z]+))? al (\d{1,2})(?: de ([a-z]+))?/);
      if (m) {
        const mes2 = m[4] || m[2]; const mes1 = m[2] || m[4];
        const d1 = parseDay(m[1] + ' de ' + (mes1 || Object.keys(MESES_N)[X.today().getMonth()])); const d2 = parseDay(m[3] + ' de ' + (mes2 || Object.keys(MESES_N)[X.today().getMonth()]));
        if (d1 && d2) return say('viaje', 'Entendí un viaje del ' + X.fmtShort(d1) + ' al ' + X.fmtShort(d2) + '. Completa qué llevas y te armo el plan.', { card: { type: 'trip', from: X.iso(d1), to: X.iso(d2) } });
      }
      return say('viaje', 'Dime las fechas así: “me voy a Medellín del 19 al 23 de diciembre”.');
    }
    // entrega del colegio / trabajo
    const subj = parseSubj(t); const type = parseType(t);
    if (subj && (type || /entregar|para la clase|traer|llevar a clase/.test(t))) {
      const day = parseDay(t); const time = parseTime(t);
      let due = null, mode = 'next';
      const ses = X.nextSessions(subj, Date.now(), 12);
      if (day) { const s = ses.find((x) => X.iso(x.d) === X.iso(day)); if (s) { due = s.at; mode = s === ses[0] ? 'next' : 'pick'; } else { due = X.atTime(day, time || '07:00'); mode = 'custom'; } }
      else if (ses.length) due = ses[0].at;
      if (!due) return say('noEntendi', 'No encontré la próxima clase de ' + X.subj(subj).n + '. Dime el día: “… el viernes”.');
      const ty = type || 'tarea';
      const title = ty === 'examen' && !/examen de/.test(t) ? 'Examen de ' + X.subj(subj).n + (notesOf(t) ? ' (' + notesOf(t) + ')' : '') : cleanTitle(raw);
      return say(ty === 'examen' ? 'examen' : 'entrega', 'Entendí esto. ¿Lo agendo?', { x: X.dayDiff(due) <= 1 ? 'mañana' : X.fmtShort(new Date(due)), card: { type: 'task', p: { type: ty, subj, due, mode, title, notes: notesOf(t) } } });
    }
    // cita fija
    const day = parseDay(t); const time = parseTime(t); const dur = parseDur(t);
    if (/(cita|reunion|medico|odontolog|dentista|partido|entrevista|consulta|evento|cumpleanos|clase de manejo)/.test(t) || (day && time && !dur && !/(comprar|recoger|pagar|hacer)/.test(t))) {
      if (!day) return say('noEntendi', '¿Qué día es? Ej.: “cita médica el jueves a las 4 pm”.');
      const st = X.atTime(day, time || '16:00'); const en = st + (dur || 60) * 60000;
      const c = window.AG ? AG.conflicts(st, en) : [];
      return say(c.length ? 'conflicto' : 'flex', (time ? '' : 'No me dijiste la hora; puse 4:00 pm. ') + (c.length ? '⚠️ Ojo: choca con ' + c.map((b) => b.title).join(', ') + '.' : 'No choca con nada de tu horario.'), { card: { type: 'cita', p: { title: cleanTitle(raw), start: st, end: en, place: parsePlace(t) } } });
    }
    // pendiente flexible
    if (/(guardame|recuerdame|tengo que|debo|anota|agendame|hacer|comprar|pagar|llevar|recoger|ir a|ir al|cortarme|motilarme|lavar|arreglar|imprimir|sacar)/.test(t)) {
      const p = { title: cleanTitle(raw), dur: dur || 30, deadline: parseDeadline(t), place: parsePlace(t), tipo: /colegio|tarea|estudiar/.test(t) ? 'colegio' : 'general' };
      let opts = window.AG ? AG.findSlots(p.dur, p.deadline, { tipo: p.place ? 'vuelta' : p.tipo, place: AG.placeOf(p.place), count: 2 }) : [];
      let cat = 'flex';
      if (!opts.length && window.AG) { const fb = AG.fallbackSlot(p.dur, p.deadline); if (fb) { opts = [fb]; cat = 'sinHueco'; } }
      return say(cat, opts.length ? 'Te encontré ' + (opts.length === 1 ? 'este hueco' : 'estos huecos') + ' que no tocan colegio, trabajo ni tus bloques ancla:' : 'No encontré hueco antes del límite. Lo guardo sin hora y lo movemos después.', { card: { type: 'flex', p, opts: opts.map((o) => ({ at: o.at, b: o.block.title, steal: !!o.steal })), pick: 0 } });
    }
    // tengo X minutos
    if ((m = t.match(/tengo (\d+)\s*(min|minutos|hora|horas|h)\b/)) || /tengo (media hora|una hora|un rato)/.test(t)) {
      const mins = m ? (/h/.test(m[2]) ? +m[1] * 60 : +m[1]) : /media/.test(t) ? 30 : 60;
      return say('pocoTiempo', 'Con ' + mins + ' minutos, esto es lo mejor que puedes hacer:', { x: mins + ' minutos', card: bestCard(mins) });
    }
    if (/(cansad|sin energia|agotad|no doy mas|mucho sueno|enfermo)/.test(t)) {
      const anc = window.HORARIO.filter((b) => X.S.anchors[b.id] && b.d === X.dow(X.today()));
      return say('cansado', anc.length ? 'Hoy haz solo tus bloques ancla en versión corta: ' + anc.map((b) => b.title + ' (' + X.h12(b.s) + ')').join(', ') + '. Lo demás lo movemos.' : 'Hoy haz lo mínimo: tu ejercicio en versión corta, lo que se entrega mañana y a dormir a las 9:00 pm.');
    }
    if (/(que tengo|agenda|que hay|pendientes).*(manana)|^manana\??$/.test(t)) return say('manana', tomorrowText(), { x: tomorrowTop() });
    if (/(que tengo|agenda|que hay).*(hoy)|^hoy\??$/.test(t)) return say('bloque', todayText());
    if (/(que sabes de mi|quien soy|mi perfil|que conoces de mi|sabes quien soy|conoces de mi)/.test(t)) {
      const I = insights();
      return say('perfil', perfilTxt() + (I.ok && I.L.length ? ' Lo que veo en tus marcas: ' + I.L.slice(0, 2).join('; ') + '.' : ''), { card: { type: 'perfil' } });
    }
    if (/(por que voy mal|que estoy fallando|en que fallo|en que estoy fallando|analiza mi semana|como voy (esta|en la) semana|como me (fue|va) (esta|en la) semana|por que no cumplo|que me falta esta semana)/.test(t)) {
      const A2 = semanaAnalisis();
      if (!A2.plan) return say('motivacion', 'Esta semana todavía no tienes bloques terminados para analizar. Marca tus bloques al terminarlos y te digo cómo vas.');
      let txt = 'Esta semana vas al ' + A2.pct + '% de tus bloques: ' + A2.nOk + ' hechos, ' + A2.nHalf + ' a medias, ' + A2.nNo + ' no pude y ' + A2.nSin + ' sin marcar.';
      const w = A2.worst && A2.C[A2.worst]; let card = null;
      if (w && w.sc / w.plan < 0.75) {
        txt += ' Lo que más se te cae: ' + CAT_N(A2.worst) + ' (' + (w.half ? w.half + ' a medias' : '') + (w.half && (w.no + w.sin) ? ', ' : '') + (w.no + w.sin ? (w.no + w.sin) + ' sin hacer' : '') + ').';
        const ws = Object.keys(A2.why).sort((a, b) => A2.why[b] - A2.why[a]); if (ws.length) txt += ' Motivo que más marcas: ' + ws[0].toLowerCase() + '.';
        if (window.AG) {
          const dl = X.atTime(X.addDays(X.today(), 7 - X.dow(X.today())), '21:00');
          const opts = AG.findSlots(60, dl, { tipo: 'general', count: 2 });
          if (opts.length) { txt += ' Te propongo recuperarlo en un hueco libre:'; card = { type: 'flex', p: { title: 'Recuperar: ' + CAT_N(A2.worst), dur: 60, deadline: dl, place: null, tipo: 'general' }, opts: opts.map((o) => ({ at: o.at, b: o.block.title, steal: !!o.steal })), pick: 0 }; }
        }
      } else if (A2.nSin > A2.plan / 3) txt += ' Ojo: casi un tercio de tus bloques está sin marcar. Si no marcas, no puedo medir.';
      const cat = A2.nHalf >= 3 && A2.nHalf >= A2.nNo ? 'medias' : A2.pct >= 75 ? 'bien' : 'mal';
      return say(cat, txt, card ? { card } : {});
    }
    if (/(plata|dinero|ahorr|platica|presupuesto|gastos|cuanto me falta)/.test(t)) {
      const ar = X.P.habitos.areas[4]; let id = null; for (let j = 0; j < 8; j++) if (!X.metaDone('habitos', '5.' + (j + 1))) { id = '5.' + (j + 1); break; }
      return say('plata', id ? 'Tu siguiente meta de plata es Hábitos ' + id + ': ' + ar.metas[+id.split('.')[1] - 1].t + '. Primer paso: ' + ar.metas[+id.split('.')[1] - 1].s[0] : 'Ya cumpliste tus 8 metas de finanzas personales. Ahora la plata va para NEXO PC.', id ? { card: { type: 'meta', pid: 'habitos', id } } : {});
    }
    if (/(como voy|progreso|atrasad|voy bien|mi ruta)/.test(t)) { const R = X.ruta(null); const diff = R.llevas - R.deberias; return say(diff >= 0 ? 'bien' : 'mal', 'Llevas ' + R.llevas + ' metas cumplidas y el plan pedía ' + R.deberias + ' (' + (diff >= 0 ? '+' + diff : diff) + '). ' + (R.atrasadas[0] ? 'La más urgente: ' + X.P[R.atrasadas[0].pid].short + ' ' + R.atrasadas[0].id + ' — ' + R.atrasadas[0].m.t + '.' : 'No tienes metas atrasadas.'), { card: { type: 'ruta' } }); }
    if (/(ruta|vueltas|mandados|diligencias|salir a)/.test(t)) { const st = window.MAPA ? MAPA.stopsToday() : []; return say('ruta', st.length ? 'Hoy tienes ' + st.length + ' vuelta(s) con sitio. Te armo el orden:' : 'No tienes vueltas con sitio para hoy. Dime algo como “comprar cartulina en la papelería antes del viernes”.', st.length ? { card: { type: 'mapa' } } : {}); }
    if (/^(busca|buscar|buscame|precio|cuanto cuesta|cuanto vale)/.test(t)) { const q = raw.replace(/^(busca(me)?|buscar|precio( de)?|cu[aá]nto (cuesta|vale))\s*/i, ''); return say('buscar', 'Te mejoré la búsqueda:', { card: { type: 'search', q } }); }
    if (/(ganas|motiv|pereza|procrastin|no quiero|aburrid)/.test(t)) return say('motivacion', 'Hagamos un trato: 10 minutos de lo más importante y después decides si sigues.', { card: bestCard() });
    if (/(gracias|listo|hecho|ya lo hice|termine)/.test(t)) return say('celebrar', '¡Eso! Márcalo en la app para que cuente en tu ruta.', { x: doneToday() });
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|ey)\b/.test(t)) return greet();
    if (/(que hago|que sigue|ahora que|que me recomiendas|que deberia)/.test(t)) return say(bestActions()[0].cat, 'Esto es lo mejor que puedes hacer ahora:', { card: bestCard() });
    if (/(ayuda|que puedes hacer|como funciona)/.test(t)) return say('noEntendi', 'Puedo hacer esto, sin internet y gratis:', { card: { type: 'help' } });
    return say('noEntendi', 'No te entendí del todo.', { card: { type: 'help' } });
  }
  function doneToday() { const di = X.iso(X.today()); return Object.keys(X.S.done[di] || {}).length + ' área(s)'; }
  function tomorrowList() { return window.AG ? AG.dayList(X.addDays(X.today(), 1)) : []; }
  function tomorrowTop() { const L = tomorrowList(); const y = L[0]; return y ? (y.t ? y.t.title : y.x.title) : 'dormir bien y cumplir tus bloques ancla'; }
  function itemLine(y) { return y.k === 'entrega' ? (X.TT[y.t.type] || X.TT.tarea).i + ' ' + y.t.title + ' · ' + X.h12(X.hhmmOf(y.at)) : y.k === 'cita' ? '📍 ' + y.x.title + ' · ' + X.h12(X.hhmmOf(y.at)) : '🔄 ' + y.x.title + ' · ' + X.h12(X.hhmmOf(y.at)); }
  function tomorrowText() { const L = tomorrowList(); return L.length ? 'Mañana tienes: ' + L.map(itemLine).join(' · ') + '.' : 'Mañana no tienes entregas, citas ni pendientes agendados. Cumple tus bloques y adelanta una meta.'; }
  function todayText() { const L = window.AG ? AG.dayList(X.today()) : []; return L.length ? 'Hoy tienes: ' + L.map(itemLine).join(' · ') + '.' : 'Hoy no tienes entregas ni citas en la agenda. Tu horario normal manda.'; }
  function greet() {
    const h = new Date().getHours(); const sal = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
    const R = X.ruta(null);
    const fin = X.dow(X.today()) >= 6;
    return say(R.atrasadas.length ? 'mal' : fin ? 'finde' : 'bien', sal + ', ' + pf().nombre.split(' ')[0] + '. ' + todayText() + ' ' + (R.atrasadas.length ? 'Tienes ' + R.atrasadas.length + ' meta(s) atrasada(s).' : 'Vas al día con tus metas.'), { card: bestCard() });
  }

  // ---------- tarjetas del chat ----------
  function cardHtml(c, i) {
    if (!c) return '';
    const done = c.status ? '<div class="cst">' + esc(c.status) + '</div>' : '';
    if (c.type === 'best') {
      const x = c.cands[c.idx] || c.cands[0]; if (!x) return '';
      return '<div class="ans"><div class="k">✦ TU MEJOR ACCIÓN' + (c.limit ? ' · ' + c.limit + ' MIN' : '') + ' · ' + (c.idx + 1) + '/' + c.cands.length + '</div><div class="tt">' + esc(x.t) + '</div><div class="why">' + esc(x.w || '') + '</div>' + duo(x.cat, x.x, x.t) + (c.limit ? hv('m', line('pocoTiempo', 'm', c.limit + ' minutos')) : '') +
        '<div class="bt"><button class="ok2" data-ca="' + i + '|go">▶ Empezar</button><button class="no2" data-ca="' + i + '|next">Otra opción</button></div></div>';
    }
    if (c.type === 'task') {
      const p = c.p; const ty = X.TT[p.type] || X.TT.tarea;
      return '<div class="act"><div class="h1">✦ ENTENDÍ ESTO · ¿LO AGENDO?</div>' + ty.i + ' <b>' + esc(ty.n) + '</b> · ' + esc(X.subj(p.subj).n) + '<br>📅 ' + X.fmtWhen(p.due) + (p.mode === 'next' ? ' (próxima clase)' : '') + '<br>📝 ' + esc(p.title) + (p.notes ? '<br>🗒️ ' + esc(p.notes) : '') +
        '<br>🔔 Avisos: ' + X.remindersOf(Object.assign({ created: Date.now() }, p)).filter((r) => r.at > Date.now()).map((r) => r.l).join(', ') + (c.status ? done : '<div class="bt"><button class="ok2" data-ca="' + i + '|ok">✓ Agendar</button><button class="no2" data-ca="' + i + '|edit">Corregir</button></div>') + '</div>';
    }
    if (c.type === 'cita') {
      const p = c.p; const pl = window.AG && AG.placeOf(p.place);
      return '<div class="act"><div class="h1">✦ CITA FIJA · ¿LA AGENDO?</div>📍 <b>' + esc(p.title) + '</b><br>📅 ' + X.fmtWhen(p.start) + ' – ' + X.h12(X.hhmmOf(p.end)) + (pl ? '<br>🗺️ ' + esc(pl.name) : '') + (c.status ? done : '<div class="bt"><button class="ok2" data-ca="' + i + '|ok">✓ Agendar</button><button class="no2" data-ca="' + i + '|edit">Corregir</button></div>') + '</div>';
    }
    if (c.type === 'flex') {
      const p = c.p; const pl = window.AG && AG.placeOf(p.place);
      return '<div class="act"><div class="h1">✦ PENDIENTE FLEXIBLE · ' + p.dur + ' MIN · LÍMITE ' + esc(X.fmtShort(new Date(p.deadline)).toUpperCase()) + '</div><b>' + esc(p.title) + '</b>' + (pl ? ' · 📍 ' + esc(pl.name) : '') +
        c.opts.map((o, k) => '<button class="slot ' + (k === c.pick ? 'on' : '') + '" data-ca="' + i + '|pick|' + k + '"><div><b>' + X.fmtWhen(o.at) + '</b><br><span>' + esc(o.b) + (o.steal ? ' · ⚠️ le quita tiempo a este bloque' : '') + '</span></div>' + (k === c.pick ? '✓' : '') + '</button>').join('') +
        (c.status ? done : '<div class="bt"><button class="ok2" data-ca="' + i + '|ok">✓ Agendar</button><button class="no2" data-ca="' + i + '|edit">Otra hora</button></div>') + '</div>';
    }
    if (c.type === 'trip') return '<div class="act"><div class="h1">✦ MODO FUERA DE CASA</div>✈️ ' + X.fmtShort(X.parseIso(c.from)) + ' → ' + X.fmtShort(X.parseIso(c.to)) + (c.status ? done : '<div class="bt"><button class="ok2" data-ca="' + i + '|ok">Completar plan</button></div>') + '</div>';
    if (c.type === 'perfil') return '<div class="bt"><button class="ok2" data-ca="' + i + '|perfil">👤 Ver y editar mi perfil</button></div>';
    if (c.type === 'meta') return '<div class="bt"><button class="no2" data-ca="' + i + '|meta">🎯 Ver la meta</button></div>';
    if (c.type === 'ruta') return '<div class="bt"><button class="no2" data-ca="' + i + '|ruta">🧭 Ver Mi ruta</button></div>';
    if (c.type === 'mapa') return '<div class="bt"><button class="ok2" data-ca="' + i + '|route">🗺️ Ver ruta de hoy</button></div>';
    if (c.type === 'search') return '<div class="bt"><button class="ok2" data-ca="' + i + '|search">🔍 Abrir el buscador</button></div>';
    if (c.type === 'help') return '<div class="sum"><ul><li><b>“¿Qué hago ahora?”</b>: tu mejor acción.</li><li><b>“examen de química el viernes”</b>: agenda la entrega.</li><li><b>“cita médica el jueves a las 4 pm”</b>: cita fija.</li><li><b>“comprar cartulina en la papelería antes del sábado”</b>: busco el hueco.</li><li><b>“tengo 30 min”</b>, <b>“estoy cansado”</b>, <b>“¿qué tengo mañana?”</b>, <b>“¿cómo voy?”</b>, <b>“ruta”</b>.</li><li><b>“busca precio ssd 1tb”</b>: búsqueda mejorada.</li><li><b>“me voy del 19 al 23 de diciembre”</b>: plan de viaje.</li><li><b>“¿qué sabes de mí?”</b>, <b>“¿por qué voy mal?”</b>, <b>“¿cómo voy con la plata?”</b></li></ul></div>';
    return '';
  }
  function msgHtml(m, i) {
    if (m.who === 'me') return '<div class="msg me">' + esc(m.text) + '</div>';
    const v = m.card && m.card.type === 'best' ? {} : (m.v || {});
    return '<div class="aiw">' + (m.text ? '<div class="msg ai">' + esc(m.text) + '</div>' : '') + (v.h ? hv('h', v.h) : '') + (v.m ? hv('m', v.m) : '') + cardHtml(m.card, i) + '</div>';
  }

  // ---------- vista ----------
  function render(h) {
    if (!chat().length) greet();
    const nm = X.ORDER.reduce((a, id) => a + X.P[id].areas.length * 8, 0);
    h += '<div class="ctx">✦ Harvey y Mike conocen: <b>tu perfil · tu horario · ' + nm + ' metas · ' + X.pending().length + ' entregas · ' + X.S.agenda.filter((x) => !x.done).length + ' pendientes · ' + X.S.places.length + ' sitios</b><button class="pfb" data-perfil="1">👤 Mi perfil ›</button></div>';
    h += '<button class="ask" data-ask="1">✦ ¿Qué hago ahora?</button>';
    h += '<div class="sug">' + ['⏱️ Tengo 30 min', '📉 ¿Por qué voy mal?', '👤 ¿Qué sabes de mí?', '😴 Estoy cansado', '📅 ¿Qué tengo mañana?', '🧭 ¿Cómo voy?', '🗺️ Ruta de hoy', '🔍 Buscador', '❓ Ayuda'].map((s) => '<button data-sg="' + esc(s) + '">' + s + '</button>').join('') + '</div>';
    const start = Math.max(0, chat().length - 24);
    h += '<div class="chatlog" id="chatlog">' + chat().slice(start).map((m, k) => msgHtml(m, start + k)).join('') + '</div>';
    h += '<div class="cbar"><input id="cin" placeholder="Escribe: “examen de química el viernes”…" autocomplete="off"><button data-send="1">➤</button></div>';
    $('#view').innerHTML = h;
    const lg = $('#chatlog'); if (lg && lg.lastElementChild) setTimeout(() => lg.lastElementChild.scrollIntoView({ block: 'end' }), 30);
    const inp = $('#cin'); inp.onkeydown = (e) => { if (e.key === 'Enter') send(); };
    $('#view').onclick = onClick;
  }
  function send() { const inp = $('#cin'); const v = inp.value.trim(); if (!v) return; inp.value = ''; understand(v); X.renderHoy(); }
  function onClick(e) {
    const v = e.target.closest('[data-v]'); if (v) { X.setHoyView(v.dataset.v); X.renderHoy(); return; }
    if (e.target.closest('[data-send]')) { send(); return; }
    if (e.target.closest('[data-perfil]')) { openPerfil(false); return; }
    if (e.target.closest('[data-ask]')) { push({ who: 'me', text: '¿Qué hago ahora?' }); say(bestActions()[0].cat, '', { card: bestCard() }); X.renderHoy(); return; }
    const sg = e.target.closest('[data-sg]');
    if (sg) {
      const s = sg.dataset.sg;
      if (/Buscador/.test(s)) { openSearch(''); return; }
      if (/Ruta/.test(s)) { if (window.MAPA) MAPA.openRoute(); return; }
      understand(s.replace(/^[^\wáéíóú¿]+/, '')); X.renderHoy(); return;
    }
    const ca = e.target.closest('[data-ca]'); if (!ca) return;
    const [i, act, arg] = ca.dataset.ca.split('|'); const m = chat()[+i]; if (!m || !m.card) return; const c = m.card;
    if (c.type === 'best') {
      if (act === 'next') { c.idx = (c.idx + 1) % c.cands.length; X.save(); X.renderHoy(); return; }
      if (act === 'go') { goTo(c.cands[c.idx].o); return; }
    }
    if (c.type === 'task') {
      if (act === 'ok') { const p = c.p; const t = { id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: p.type, title: p.title, subj: p.subj, due: p.due, mode: p.mode, notes: p.notes || '', created: Date.now(), done: false }; X.S.tasks.push(t); c.status = '✓ Agendado · ' + X.fmtWhen(p.due); X.save(); X.scheduleNotifs(); say('celebrar', 'Listo, quedó en tu Agenda con sus avisos.'); X.renderHoy(); return; }
      if (act === 'edit') { X.openTaskForm(Object.assign({ id: null }, c.p)); return; }
    }
    if (c.type === 'cita') {
      if (act === 'ok') { AG.addCita(c.p); c.status = '✓ Cita agendada'; X.save(); say('celebrar', 'Cita guardada. Te aviso 1 día y 1 hora antes.'); X.renderHoy(); return; }
      if (act === 'edit') { AG.citaForm(null, c.p); return; }
    }
    if (c.type === 'flex') {
      if (act === 'pick') { c.pick = +arg; X.save(); X.renderHoy(); return; }
      if (act === 'ok') { const o = c.opts[c.pick]; AG.addFlex(Object.assign({}, c.p, { slot: o ? o.at : null })); c.status = o ? '✓ Agendado · ' + X.fmtWhen(o.at) : '✓ Guardado sin hora'; X.save(); say('celebrar', o ? 'Quedó para ' + X.fmtWhen(o.at) + '. Si no alcanzas, lo reprogramo solo.' : 'Guardado. Cuando quieras le buscamos hora.'); X.renderHoy(); return; }
      if (act === 'edit') { AG.flexForm(null, c.p); return; }
    }
    if (c.type === 'trip' && act === 'ok') { X.openTripForm({ id: 'v' + Date.now().toString(36), from: c.from, to: c.to, motivo: 'viaje', tools: { cel: true, pc: false, cuaderno: true, audif: true, net: 'limitado' }, min: 60, times: ['09:00', '19:00'], done: {} }); return; }
    if (act === 'ruta') { X.setMetaView('ruta'); X.setTab('metas'); return; }
    if (act === 'perfil') { openPerfil(false); return; }
    if (act === 'meta') { X.openMeta(c.pid, c.id); return; }
    if (act === 'route') { if (window.MAPA) MAPA.openRoute(); return; }
    if (act === 'search') { openSearch(c.q || ''); return; }
  }
  function goTo(o) {
    if (!o) return;
    if (o.t === 'task') X.openTask(o.id);
    else if (o.t === 'block') X.openBlock(window.HORARIO.find((b) => b.id === o.id), X.parseIso(o.di));
    else if (o.t === 'flex') AG.openItem(o.id);
    else if (o.t === 'meta') X.openMeta(o.pid, o.id);
    else if (o.t === 'ej') { X.setEjDay(null); X.setTab('ejercicio'); }
    else if (o.t === 'ruta') { X.setMetaView('ruta'); X.setTab('metas'); }
    else if (o.t === 'hoy') { X.setHoyView('dia'); X.renderHoy(); }
    else X.toast(line('dormir', 'h'));
  }

  // ---------- buscador inteligente ----------
  const TIENDAS_DEF = ['mercadolibre.com.co', 'alkosto.com', 'ktronix.com', 'exito.com', 'falabella.com.co'];
  let SF = { co: true, cop: true, year: true, stores: true, video: false, en: false };
  function improve(q) {
    const t = norm(q); const year = new Date().getFullYear();
    const price = /(precio|cuanto|barat|comprar|ssd|ram|gpu|tarjeta|mouse|teclado|monitor|portatil|pc|celular|audifonos|procesador)/.test(t);
    const tuto = /(como|tutorial|aprender|curso|paso a paso|filmora|canva|figma|html|css|javascript)/.test(t);
    let s = q.replace(/^(busca(me)?|buscar|quiero saber|precio de|cu[aá]nto (cuesta|vale))\s*/i, '').trim();
    if (price && !tuto) { if (!/precio/i.test(s)) s += ' precio'; if (SF.co) s += ' Colombia'; if (SF.cop) s += ' COP'; s += ' ' + year; if (SF.stores) s += ' (' + (opt('tiendas', TIENDAS_DEF)).map((d) => 'site:' + d).join(' OR ') + ')'; }
    else if (tuto) { s += SF.en ? ' tutorial ' + year : ' tutorial español ' + year; }
    else { if (SF.co) s += ' Colombia'; }
    let u = 'https://www.google.com/search?q=' + encodeURIComponent(s) + '&hl=' + (SF.en ? 'en' : 'es');
    if (SF.co) u += '&gl=co'; if (SF.year) u += '&tbs=qdr:y'; if (SF.video) u += '&tbm=vid';
    return { s, u, kind: price && !tuto ? 'precio' : tuto ? 'tutorial' : 'general' };
  }
  function summarize(html, q) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,noscript,nav,header,footer,aside,form,svg,iframe').forEach((n) => n.remove());
    const title = (doc.querySelector('title') || {}).textContent || '';
    const blocks = Array.from(doc.querySelectorAll('h1,h2,h3,p,li,td')).map((n) => n.textContent.replace(/\s+/g, ' ').trim()).filter((s) => s.length > 30);
    const sents = []; blocks.forEach((b, bi) => b.split(/(?<=[.!?])\s+/).forEach((s) => { if (s.length >= 40 && s.length <= 320) sents.push({ s, bi }); }));
    const terms = norm(q).split(' ').filter((w) => w.length > 2);
    sents.forEach((x, k) => { const n = norm(x.s); let sc = 0; terms.forEach((w) => { if (n.includes(w)) sc += 3; }); if (/\$\s?\d|\d+\s?(gb|tb|mhz|ghz|%|cop|pesos)/i.test(x.s)) sc += 2; sc += Math.max(0, 2 - k / 30); x.sc = sc; });
    const top = sents.slice().sort((a, b) => b.sc - a.sc).slice(0, 5).sort((a, b) => a.bi - b.bi);
    const prices = Array.from(new Set((doc.body ? doc.body.textContent : '').match(/\$\s?\d{1,3}(?:\.\d{3})+/g) || [])).slice(0, 6);
    return { title: title.trim().slice(0, 120), top: top.map((x) => x.s), prices };
  }
  function openSearch(q0) {
    let q = q0 || ''; let res = null; let url = '';
    const draw = () => {
      const I = improve(q || '…');
      let h = '<button class="back" data-x="1">‹ Asistente</button><div class="det"><h2>🔍 Buscador inteligente</h2>';
      h += '<div class="f">¿QUÉ QUIERES BUSCAR?</div><input id="sq" placeholder="Ej: precio ssd 1tb · cómo hacer subtítulos en Filmora" value="' + esc(q) + '">';
      h += '<div class="chips wrap" style="margin-top:8px">' + [['co', '🇨🇴 Colombia'], ['cop', '💲 COP'], ['year', '📅 Último año'], ['stores', '🏪 Tiendas confiables'], ['video', '🎥 Videos'], ['en', '🇺🇸 En inglés']].map(([k, n]) => '<button class="chip ' + (SF[k] ? 'on' : '') + '" data-sf="' + k + '">' + n + '</button>').join('') + '</div>';
      if (q) { h += '<div class="f">ASÍ LA MEJORÉ</div><div class="q">' + esc(I.s) + '</div><button class="btn" data-gs="1">Buscar en Google</button>'; h += duo('buscar', null, q); }
      if (!X.N) h += '<p class="muted" style="margin-top:12px">📱 En iPhone, Safari no deja leer otras páginas desde la app: usa “Buscar en Google”.</p>';
      else h += '<div class="sec">📄 Resumir una página (sin IA)</div><input id="su" placeholder="Pega aquí el enlace de la página" value="' + esc(url) + '"><button class="btn alt" data-sum="1">Resumir</button>';
      if (res === 'loading') h += '<p class="muted" style="margin-top:8px">Leyendo la página…</p>';
      else if (res && res.err) h += '<div class="box warn" style="margin-top:8px">' + esc(res.err) + '</div>';
      else if (res) {
        h += '<div class="box" style="margin-top:8px"><strong>' + esc(res.title || 'Resumen') + '</strong><ul class="sumlist">' + res.top.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>' + (res.prices.length ? '<div class="muted">💲 Precios que aparecen: ' + res.prices.map(esc).join(' · ') + '</div>' : '') + '</div><p class="muted">Resumen automático: son las frases más relacionadas con tu búsqueda. Si se ve incompleto, abre la página completa.</p><button class="btn alt sm" data-op="1">Abrir la página completa</button>';
      }
      h += '</div>';
      X.openPage(h);
    };
    const read = () => { const a = $('#sq'); if (a) q = a.value.trim(); const b = $('#su'); if (b) url = b.value.trim(); };
    draw();
    $('#page').onchange = () => { read(); draw(); };
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { X.closePage(); X.render(); return; }
      const f = e.target.closest('[data-sf]'); if (f) { read(); SF[f.dataset.sf] = !SF[f.dataset.sf]; draw(); return; }
      if (e.target.closest('[data-gs]')) { read(); if (q) X.openUrl(improve(q).u); return; }
      if (e.target.closest('[data-op]')) { if (url) X.openUrl(url); return; }
      if (e.target.closest('[data-sum]')) {
        read(); if (!/^https?:\/\//i.test(url)) { X.toast('Pega un enlace que empiece por http'); return; }
        res = 'loading'; draw();
        X.fetchText(url, (ok, txt) => { if (!ok || !txt) res = { err: 'No pude leer esa página (sin internet o la página no deja). Ábrela completa.' }; else { try { res = summarize(txt, q || url); if (!res.top.length) res = { err: 'La página no tiene texto que se pueda resumir (puede ser una tienda que carga con programas). Ábrela completa.' }; } catch (er) { res = { err: 'No pude resumir esta página.' }; } } draw(); });
      }
    };
  }

  // ---------- avisos: acciones sugeridas y agenda de mañana ----------
  X.hooks.notif.push((push2, now, t0) => {
    const sug = opt('sug', 'libres');
    for (let k = 0; k < 7; k++) {
      const d = X.addDays(t0, k); const di = X.iso(d); if (X.tripOf(di)) continue;
      if (sug !== 'off') X.blocksOf(d).forEach((b) => {
        if (b.cat !== 'libre') return; const len = X.mins(b.e) - X.mins(b.s); if (len < 30) return;
        const at = X.atTime(d, b.s); if (at <= now) return;
        const c = bestActions(at + 60000)[0]; if (!c || c.cat === 'dormir') return;
        const o = lines(c.cat, c.x, c.t + at);
        push2(at, '', '💡 Acción sugerida · tienes ' + (len >= 60 ? (len / 60).toString().replace('.', ',') + ' h' : len + ' min') + ' libre', c.t + '\n' + plainDuo(o));
      });
      const mh = opt('manana', '20:30'); if (mh !== 'off') {
        const at = X.atTime(d, mh); if (at > now) {
          const L = window.AG ? AG.dayList(X.addDays(d, 1)).filter((y) => !(y.t ? y.t.done : y.x.done)) : [];
          const top = L[0] ? (L[0].t ? L[0].t.title : L[0].x.title) : 'tus bloques ancla';
          push2(at, '', '📅 Tu agenda de mañana', (L.length ? L.slice(0, 4).map(itemLine).join(' · ') : 'No tienes entregas ni citas. Cumple tus bloques ancla.') + '\n' + plainDuo(lines('manana', top, di)));
        }
      }
    }
  });

  // ---------- ajustes ----------
  X.hooks.yo.push(() => {
    const v = opt('voz', 'ambos'); const sug = opt('sug', 'libres'); const mh = opt('manana', '20:30');
    let h = '<div class="sec">✦ Asistente Harvey + Mike</div><div class="card">';
    h += '<div class="f" style="margin-top:0">VOZ DE LOS CONSEJOS</div><div class="seg2">' + [['ambos', 'Los dos'], ['harvey', 'Solo Harvey'], ['mike', 'Solo Mike']].map(([k, n]) => '<button class="' + (v === k ? 'on' : '') + '" data-av="' + k + '">' + n + '</button>').join('') + '</div>';
    h += '<div class="set-row"><span>Acciones sugeridas<br><span class="muted">Al empezar tus bloques Libre</span></span><button class="sw ' + (sug !== 'off' ? 'on' : '') + '" data-as="1"></button></div>';
    h += '<div class="set-row"><span>Agenda de mañana</span><input type="time" id="aMan" value="' + (mh === 'off' ? '20:30' : mh) + '" style="width:auto"></div>';
    h += '<div class="f">REGLAS DE LA AGENDA</div>';
    h += '<div class="set-row"><span>Proteger bloques ancla, colegio, trabajo y sueño</span><span class="ok">Siempre</span></div>';
    h += '<div class="set-row"><span>Reprogramar si no lo hago</span><button class="sw ' + (opt('reprog', true) ? 'on' : '') + '" data-ab="reprog"></button></div>';
    h += '<div class="set-row"><span>Máximo de pendientes flexibles por día</span><span>' + [1, 2, 3].map((n) => '<button class="chipbtn ' + (opt('maxFlex', 2) === n ? 'onb' : '') + '" data-amf="' + n + '">' + n + '</button>').join(' ') + '</span></div>';
    h += '<div class="set-row"><span>Margen entre cosas</span><span>' + [5, 10, 15].map((n) => '<button class="chipbtn ' + (opt('margen', 10) === n ? 'onb' : '') + '" data-amg="' + n + '">' + n + ' min</button>').join(' ') + '</span></div>';
    h += '<div class="set-row"><span>Botón “Pasar a Google Calendar”</span><button class="sw ' + (opt('gcal', true) ? 'on' : '') + '" data-ab="gcal"></button></div>';
    h += '<div class="set-row"><span>👤 Mi perfil<br><span class="muted">Lo que Harvey y Mike saben de ti</span></span><button class="chipbtn" data-apf="1">Ver</button></div>';
    h += '<div class="set-row"><span>Borrar la conversación</span><button class="chipbtn" data-aclr="1">Borrar</button></div></div>';
    return h;
  });
  X.hooks.yoBind.push(() => { const m = $('#aMan'); if (m) m.onchange = () => { A().manana = m.value || '20:30'; X.save(); X.scheduleNotifs(); X.toast('Agenda de mañana a las ' + X.h12(A().manana)); }; });
  X.hooks.yoClick.push((e) => {
    const av = e.target.closest('[data-av]'); if (av) { A().voz = av.dataset.av; X.save(); X.scheduleNotifs(); X.render(); return true; }
    if (e.target.closest('[data-as]')) { A().sug = opt('sug', 'libres') === 'off' ? 'libres' : 'off'; X.save(); X.scheduleNotifs(); X.render(); return true; }
    const ab = e.target.closest('[data-ab]'); if (ab) { A()[ab.dataset.ab] = !opt(ab.dataset.ab, true); X.save(); X.render(); return true; }
    const mf = e.target.closest('[data-amf]'); if (mf) { A().maxFlex = +mf.dataset.amf; X.save(); X.render(); return true; }
    const mg = e.target.closest('[data-amg]'); if (mg) { A().margen = +mg.dataset.amg; X.save(); X.render(); return true; }
    if (e.target.closest('[data-apf]')) { openPerfil(false); return true; }
    const cl = e.target.closest('[data-aclr]'); if (cl) { if (cl.dataset.sure) { X.S.chat = []; X.save(); X.render(); X.toast('Conversación borrada'); } else { cl.dataset.sure = '1'; cl.textContent = '¿Seguro?'; } return true; }
    return false;
  });

  window.AS = { cleanTitle, render, say, line, duo, lines, pf, openPerfil, insights, semanaAnalisis, perfilTxt, bestActions, understand, openSearch, improve, summarize, parseDay, parseTime, parseDur, parseDeadline, parseSubj, parseType };
})();
