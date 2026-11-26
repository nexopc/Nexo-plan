/* NEXO PLAN — Reorganizar el día con IA (Claude).
   Toma tus bloques, tareas, agenda y lo que te pasó, y propone el día completo.
   Nada cambia hasta que tocas "Sí, aplicar". Cambia SOLO ese día (S.dayEdit), tu horario base queda igual. */
(function () {
  'use strict';
  const X = window.NP; const $ = X.$, esc = X.esc;
  const IKEY = 'nexoplan.ia'; // solo en este dispositivo (no viaja con el Código NEXO)
  const cfg = () => { try { return JSON.parse(localStorage.getItem(IKEY) || '{}'); } catch (e) { return {}; } };
  const setCfg = (o) => { try { localStorage.setItem(IKEY, JSON.stringify(Object.assign(cfg(), o))); } catch (e) {} };
  // si ya pusiste la clave en Harvey (red NEXO, mismo sitio), se usa la misma
  const sharedKey = () => { try { return JSON.parse(localStorage.getItem('nexo:pref:anthropicKey') || 'null'); } catch (e) { return null; } };
  const apiKey = () => cfg().key || sharedKey() || '';
  const CAT_OK = ['app', 'video', 'creador', 'agencia', 'nexo', 'ingles', 'ejercicio', 'cliente', 'tareas', 'colegio', 'dormir', 'rutina', 'libre'];
  const RAZONES = ['Me salió algo', 'No alcancé lo de antes', 'Tengo examen o entrega', 'Estoy cansado', 'Tengo más tiempo libre', 'Llegó un cliente'];

  function dayDate() { return X.addDays(X.today(), X.dayOffset || 0); }
  function context(d, razon) {
    const di = X.iso(d); const isToday = di === X.iso(X.today());
    const bl = X.blocksOf(d).map((b) => ({ s: b.s, e: b.e, cat: b.cat, title: b.title, ancla: !!X.S.anchors[b.id], estado: X.blockState(di, b.id) || null, tema: (() => { try { const t = X.topicOf(b, d); return t ? (t.title || t[1] || '') : ''; } catch (e) { return ''; } })() }));
    const tasks = (X.S.tasks || []).filter((t) => !t.done).map((t) => ({ titulo: t.title, tipo: t.type, para: t.due ? new Date(t.due).toISOString().slice(0, 16) : null })).slice(0, 25);
    const agenda = (X.S.agenda || []).filter((a) => !a.done).slice(0, 15).map((a) => ({ titulo: a.title || a.t, cuando: a.at || a.date || null, min: a.min || null }));
    return { fecha: di, dia: X.DIAS[X.dow(d)], es_hoy: isToday, hora_actual: isToday ? new Date().toTimeString().slice(0, 5) : null,
      modo: X.modoOn(di), bloques_actuales: bl, tareas_pendientes: tasks, agenda_pendiente: agenda, lo_que_paso: razon };
  }
  const SYSTEM = `Eres el planificador de NEXO PLAN de Cristóbal (18 años, Quibdó, Colombia). Ya no trabaja en la tienda (nov 2026).
Proyectos: App Web (catálogo de tiendas, prioridad de 6 meses), Edición de video (Filmora 16), Agencia de marketing, NEXO PC (su tienda a 4 años), Creador de contenido, Inglés, Ejercicio.
Tu trabajo: reorganizar UN día según lo que le pasó, sus tareas, entregas y prioridades.
Reglas:
- Devuelve el día COMPLETO, de la primera a la última actividad, sin huecos raros ni bloques que se crucen.
- No muevas Colegio, Dormir ni los bloques ancla. Si es hoy, no cambies lo que ya pasó antes de la hora actual.
- Prioriza entregas y exámenes cercanos, luego App Web, luego lo demás. Mantén comidas y traslados (cat "rutina").
- Bloques de mínimo 25 minutos. Deja un descanso corto cada 2 horas de trabajo. Nada después de las 22:00 salvo dormir.
- cat debe ser una de: ${CAT_OK.join(', ')}. title corto en español.
- En "cambios" explica en 1 línea por cambio qué moviste y por qué. En "consejo" una frase directa, estilo Harvey.`;
  const SCHEMA = { type: 'object', additionalProperties: false, required: ['bloques', 'cambios', 'consejo'], properties: {
    bloques: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['s', 'e', 'cat', 'title'], properties: {
      s: { type: 'string', description: 'HH:MM' }, e: { type: 'string', description: 'HH:MM' }, cat: { type: 'string', enum: CAT_OK }, title: { type: 'string' } } } },
    cambios: { type: 'array', items: { type: 'string' } }, consejo: { type: 'string' } } };

  async function propose(d, razon) {
    const { Anthropic, betaJSONSchemaOutputFormat } = await import('../vendor/anthropic/anthropic.js');
    // la clave se guarda solo en este dispositivo
    const client = new Anthropic({ apiKey: apiKey(), dangerouslyAllowBrowser: true });
    const res = await client.beta.messages.parse({
      model: cfg().model || 'claude-opus-5-5', max_tokens: 16000,
      output_config: { effort: 'medium', format: betaJSONSchemaOutputFormat(SCHEMA) },
      betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(context(d, razon)) }],
    });
    if (res.stop_reason === 'refusal') throw new Error('La IA no pudo ayudar con eso. Intenta explicarlo de otra forma.');
    const out = res.parsed_output;
    if (!out || !Array.isArray(out.bloques) || !out.bloques.length) throw new Error('La respuesta llegó incompleta. Toca “Pedir otra”.');
    const hm = /^\d{2}:\d{2}$/;
    out.bloques = out.bloques.filter((b) => hm.test(b.s) && hm.test(b.e) && X.mins(b.e) > X.mins(b.s) && CAT_OK.includes(b.cat))
      .sort((a, b) => X.mins(a.s) - X.mins(b.s));
    return out;
  }

  // ---------- Hoja: pedir ----------
  let busy = false;
  function openAsk() {
    if (!apiKey()) return openKey(true);
    const d = dayDate(); const sel = new Set();
    const draw = () => {
      X.openSheet('<div class="det"><h2>🟣 Reorganizar ' + (X.iso(d) === X.iso(X.today()) ? 'mi día' : esc(X.fmtDate(d))) + '</h2>' +
        '<p>Cuéntame qué pasó y armo tu día de nuevo con tus tareas y prioridades. Solo cambia este día.</p>' +
        '<div class="chips wrap">' + RAZONES.map((r, i) => '<button class="chip ' + (sel.has(i) ? 'on' : '') + '" data-rz="' + i + '">' + esc(r) + '</button>').join('') + '</div>' +
        '<textarea id="iaTxt" rows="3" placeholder="Ej: me pusieron examen de química mañana y hoy salgo a las 3"></textarea>' +
        '<button class="btn" data-go="1">🟣 Reorganizar</button>' +
        (X.S.dayEdit[X.iso(d)] ? '<button class="btn alt sm" data-reset="1">↺ Volver a mi horario normal en este día</button>' : '') +
        '<button class="btn alt sm" data-key="1">⚙︎ Clave y modelo de IA</button></div>');
    };
    draw();
    $('#sheet').onclick = (e) => {
      const rz = e.target.closest('[data-rz]'); if (rz) { const t = $('#iaTxt').value; const i = +rz.dataset.rz; sel.has(i) ? sel.delete(i) : sel.add(i); draw(); $('#iaTxt').value = t; return; }
      if (e.target.closest('[data-key]')) return openKey(false);
      if (e.target.closest('[data-reset]')) { delete X.S.dayEdit[X.iso(d)]; X.save(); X.closeSheet(); X.reload(); X.toast('↺ Volviste a tu horario normal'); return; }
      if (e.target.closest('[data-go]')) { const razon = [...sel].map((i) => RAZONES[i]).concat($('#iaTxt').value.trim()).filter(Boolean).join('. ') || 'Organiza mi día lo mejor posible'; run(d, razon); }
    };
  }

  async function run(d, razon) {
    if (busy) return; busy = true;
    X.openSheet('<div class="det"><h2>🟣 Pensando tu día…</h2><p class="muted">Revisando bloques, tareas y prioridades. Tarda unos segundos.</p><div class="ia-load"><i></i><i></i><i></i></div></div>');
    try { const out = await propose(d, razon); preview(d, razon, out); }
    catch (err) {
      const st = err && err.status;
      const msg = st === 401 ? 'La clave de IA no es válida. Revísala en ⚙︎.' : st === 429 ? 'Muchas solicitudes seguidas. Espera un minuto.' : st >= 500 ? 'La IA está saturada. Intenta en un rato.' : !navigator.onLine ? 'Necesitas internet para reorganizar con IA.' : (err.message || 'No se pudo reorganizar.');
      X.openSheet('<div class="det"><h2>No se pudo 😕</h2><p>' + esc(msg) + '</p><button class="btn alt" data-close="1">Cerrar</button></div>');
      $('#sheet').onclick = (e) => { if (e.target.closest('[data-close]')) X.closeSheet(); };
    }
    busy = false;
  }

  // ---------- Hoja: vista previa con Sí / No ----------
  function preview(d, razon, out) {
    const di = X.iso(d); const C = window.CATS;
    const now = X.blocksOf(d).map((b) => b.s + '-' + b.e + ' ' + b.title);
    const nw = out.bloques.map((b) => b.s + '-' + b.e + ' ' + b.title);
    const quita = now.filter((x) => !nw.includes(x)); const pone = nw.filter((x) => !now.includes(x));
    let h = '<div class="det"><h2>🗓 Tu nuevo día</h2>';
    if (out.consejo) h += '<div class="hv h"><div class="av">H</div><div><b class="n">HARVEY</b>' + esc(out.consejo) + '</div></div>';
    if (out.cambios && out.cambios.length) h += '<div class="box tool"><strong>Cambios:</strong><br>' + out.cambios.map(esc).join('<br>') + '</div>';
    h += '<div class="ia-diff">' + quita.map((x) => '<div class="out">− ' + esc(x) + '</div>').join('') + pone.map((x) => '<div class="in">+ ' + esc(x) + '</div>').join('') + (quita.length + pone.length ? '' : '<div class="muted">Sin cambios</div>') + '</div>';
    h += '<div class="sec">Así queda</div>' + out.bloques.map((b) => '<div class="item" style="--c:' + ((C[b.cat] && C[b.cat].color) || '#8a94ad') + '"><div class="bd"><div class="t">' + esc(b.title) + '</div><div class="h">' + X.h12(b.s) + ' – ' + X.h12(b.e) + '</div></div><span class="tag">' + esc((C[b.cat] && C[b.cat].tag) || '') + '</span></div>').join('');
    h += '<div class="row2"><button class="btn alt" data-no="1">✕ No</button><button class="btn" data-yes="1">✓ Sí, aplicar</button></div><button class="btn alt sm" data-again="1">↻ Pedir otra propuesta</button></div>';
    X.openSheet(h);
    $('#sheet').onclick = (e) => {
      if (e.target.closest('[data-no]')) { X.closeSheet(); X.toast('Tu día queda igual'); return; }
      if (e.target.closest('[data-again]')) { run(d, razon + '. Dame otra opción distinta.'); return; }
      if (e.target.closest('[data-yes]')) {
        X.S.dayEdit[di] = out.bloques.map((b) => ({ s: b.s, e: b.e, cat: b.cat, title: b.title }));
        X.save(); X.closeSheet(); X.reload();
        if (navigator.vibrate) navigator.vibrate(30);
        X.toast('✓ Día reorganizado. Tu horario base no cambió.', 3500);
      }
    };
  }

  // ---------- Clave y modelo ----------
  function openKey(thenAsk) {
    const c = cfg();
    X.openSheet('<div class="det"><h2>⚙︎ IA de NEXO PLAN</h2><p>Para reorganizar con IA se usa la API de Claude. La clave se guarda solo en este dispositivo.' + (sharedKey() ? ' <b>Ya tienes la clave de Harvey (red NEXO): no hace falta ponerla otra vez.</b>' : '') + '</p>' +
      '<div class="f">CLAVE DE CLAUDE</div><input id="iaKey" type="password" autocomplete="off" placeholder="sk-ant-…" value="' + esc(c.key || '') + '">' +
      '<div class="f">MODELO</div><div class="chips wrap">' + [['claude-opus-5-5', 'Opus 5.5 · el mejor'], ['claude-sonnet-5-5', 'Sonnet 5.5 · más barato']].map(([k, l]) => '<button class="chip ' + ((c.model || 'claude-opus-5-5') === k ? 'on' : '') + '" data-m="' + k + '">' + l + '</button>').join('') + '</div>' +
      '<p class="muted" style="margin-top:6px">Créala en platform.claude.com → API keys y ponle un límite de gasto. Cada reorganización cuesta menos de $100 COP con Opus 5.5.</p>' +
      '<button class="btn" data-save="1">Guardar</button></div>');
    $('#sheet').onclick = (e) => {
      const m = e.target.closest('[data-m]'); if (m) { setCfg({ model: m.dataset.m, key: $('#iaKey').value.trim() || c.key }); openKey(thenAsk); return; }
      if (e.target.closest('[data-save]')) { setCfg({ key: $('#iaKey').value.trim() }); X.closeSheet(); X.toast('Guardado'); if (thenAsk && apiKey()) setTimeout(openAsk, 250); }
    };
  }

  // ---------- Botón en “Mi día” ----------
  const view = document.getElementById('view');
  function inject() {
    if (X.tab !== 'hoy' || X.hoyView !== 'dia') return;
    const head = view.querySelector('.dayhead'); if (!head || view.querySelector('.ia-btn')) return;
    const b = document.createElement('button'); b.className = 'ia-btn';
    const edited = !!X.S.dayEdit[X.iso(dayDate())];
    b.innerHTML = '<span>🟣</span> Reorganizar ' + (X.dayOffset ? 'este día' : 'mi día') + ' con IA' + (edited ? ' <em>· ajustado</em>' : '');
    b.onclick = openAsk; head.insertAdjacentElement('afterend', b);
  }
  new MutationObserver(() => { try { inject(); } catch (e) { console.error(e); } }).observe(view, { childList: true, subtree: true });
  X.hooks.boot.push(inject);
  window.NPIA = { open: openAsk, settings: () => openKey(false) };
})();
