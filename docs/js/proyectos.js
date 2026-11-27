/* NEXO PLAN — Proyectos + Tareas (importancia × urgencia) + ⚡ Organizar.
   - Tus 6 áreas de metas son proyectos (sus metas son sus tareas, se marcan igual que antes).
   - Tus proyectos y tareas nuevas viven en NEXO Brain (colecciones proyectos y tareas): Harvey, los avisos
     y las otras apps las ven, y se sincronizan con Supabase.
   - ⚡ Organizar: propone dónde poner tus tareas y tu estudio en los huecos libres del día; tú eliges y aplicas. */
(function () {
  'use strict';
  const X = window.NP; const $ = X.$, esc = X.esc;
  const ST = [['activo', '🟢', 'Activo'], ['pausado', '⏸', 'Pausado'], ['futuro', '📅', 'Empieza después'], ['idea', '💡', 'Idea'], ['terminado', '✅', 'Terminado']];
  const stOf = (k) => ST.find((s) => s[0] === k) || ST[0];
  const score = (t) => (Number(t.imp) || 3) * (Number(t.urg) || 3);
  const MINS = [15, 30, 45, 60, 90];
  let view = 'proyectos', tFilter = 'pend';

  // ---------- NEXO Brain (el mismo almacén de la red NEXO) ----------
  const PREFIX = 'nexo:data:';
  const shim = { // respaldo si no carga el núcleo (sin internet la primera vez o la app de Android)
    raw: (c) => { try { return JSON.parse(localStorage.getItem(PREFIX + c) || '[]'); } catch (e) { return []; } },
    list(c) { return this.raw(c).filter((r) => !r._deleted); }, get(c, id) { return this.list(c).find((r) => r.id === id) || null; },
    _w(c, a) { localStorage.setItem(PREFIX + c, JSON.stringify(a)); },
    add(c, d) { const r = Object.assign({}, d, { id: d.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); this._w(c, this.raw(c).concat([r])); return r; },
    update(c, id, p) { let o = null; this._w(c, this.raw(c).map((r) => (r.id === id ? (o = Object.assign({}, r, p, { updatedAt: new Date().toISOString() })) : r))); return o; },
    remove(c, id) { return this.update(c, id, { _deleted: true }); }, subscribe() { return () => {}; }, uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  };
  let B = shim, PL = null, MI = null;
  const CORE = location.pathname.includes('/Nexo-plan/') || location.hostname.endsWith('github.io') ? '/nexo-apps/core/' : null;
  const ready = (async () => {
    if (!CORE) return;
    try {
      B = (await import(CORE + 'store.js')).store;
      PL = await import(CORE + 'planner.js').catch(() => null);
      MI = await import(CORE + 'misiones.js').catch(() => null); // 🎯 misiones de NEXO Negocios
      // la sesión de Google ya la maneja nube.js; el núcleo la reutiliza (esperamos si se está entrando con ?code=)
      const go = () => import(CORE + 'sync.js').then((s) => s.cloud.init()).catch(() => {});
      /[?&]code=/.test(location.search) ? setTimeout(go, 8000) : go();
      B.subscribe('*', (c) => { if (['tareas', 'proyectos', 'topics', 'timeLogs', 'misiones'].includes(c)) rerender(); });
      rerender();
    } catch (e) { B = shim; }
  })();
  let rt = 0;
  function rerender() { clearTimeout(rt); rt = setTimeout(() => { if (X.tab === 'metas' && $('#page').classList.contains('hidden') && $('#sheet').classList.contains('hidden')) X.render(); if (X.tab === 'hoy' && X.hoyView === 'dia' && $('#sheet').classList.contains('hidden')) X.render(); }, 120); }

  // ---------- Proyectos: tus 6 áreas + los que crees ----------
  const pst = () => (X.S.projStatus = X.S.projStatus || {});
  function builtIn() {
    return X.ORDER.map((pid) => { const p = X.P[pid]; const total = p.areas.reduce((a, ar) => a + ar.metas.length, 0);
      const ts = B.list('tareas').filter((t) => t.project === pid);
      return { id: pid, builtin: true, name: p.name, color: p.color, status: pst()[pid] || 'activo', total: ts.length, done: ts.filter((t) => t.done).length }; });
  }
  function mine() { return B.list('proyectos').map((p) => { const ts = B.list('tareas').filter((t) => t.project === p.id); return { id: p.id, name: p.name, color: p.color || '#00e5ff', status: p.status || 'activo', start: p.start, total: ts.length, done: ts.filter((t) => t.done).length, goal: p.goal }; }); }
  const allProjects = () => builtIn().concat(mine());
  const notesOf = (id) => (X.P[id] ? ((X.S.projNotes || {})[id] || '') : ((B.get('proyectos', id) || {}).notes || ''));
  function setNotes(id, v) { if (X.P[id]) { X.S.projNotes = X.S.projNotes || {}; X.S.projNotes[id] = v; X.save(); } else B.update('proyectos', id, { notes: v }); }
  const projName = (id) => (X.P[id] ? X.P[id].name : (B.get('proyectos', id) || {}).name || '');
  const projActive = (id) => { if (!id) return true; const s = X.P[id] ? (pst()[id] || 'activo') : ((B.get('proyectos', id) || {}).status || 'activo'); return s === 'activo'; };

  // ---------- Vista Proyectos / Tareas ----------
  function header() {
    return '<div class="sw2"><button class="' + (view === 'proyectos' ? 'on' : '') + '" data-pv="proyectos">🚀 Proyectos</button><button class="' + (view === 'tareas' ? 'on' : '') + '" data-pv="tareas">✅ Tareas</button></div>';
  }
  function render() {
    let h = header();
    if (view === 'tareas') h += tareasHtml(); else h += proyectosHtml();
    $('#view').innerHTML = h;
    $('#view').onclick = onClick;
    const f = $('#prIdea'); if (f) f.onkeydown = (e) => { if (e.key === 'Enter') addIdea(); };
    const t = $('#prTask'); if (t) t.onkeydown = (e) => { if (e.key === 'Enter') addTaskQuick(); };
  }
  function bar(done, total, color) { return '<div class="mini" style="height:6px;border-radius:6px;background:var(--line);overflow:hidden;margin-top:6px"><i style="display:block;height:100%;width:' + (total ? Math.round(done / total * 100) : 0) + '%;background:' + color + '"></i></div>'; }
  function proyectosHtml() {
    const ps = allProjects();
    let h = '<div class="prrow"><input id="prIdea" maxlength="80" placeholder="💡 Idea o proyecto nuevo… (Enter)" autocomplete="off"><button class="btn sm" data-addidea="1" >＋</button></div>';
    ST.forEach(([k, ic, lb]) => {
      const L = ps.filter((p) => p.status === k); if (!L.length) return;
      h += '<div class="sec">' + ic + ' ' + lb + ' (' + L.length + ')</div>';
      L.forEach((p) => {
        h += '<div class="item" style="--c:' + p.color + '" data-pr="' + esc(p.id) + '"><div class="bd" style="flex:1;min-width:0"><div class="t">' + esc(p.name) + '</div><div class="h">' +
          (p.total ? p.done + '/' + p.total + ' tareas' : (k === 'idea' ? 'Toca para volverla proyecto' : 'Sin tareas: pártelo en pasos pequeños')) + (notesOf(p.id) ? ' · 📝' : '') +
          (k === 'futuro' && p.start ? ' · empieza ' + esc(p.start) : '') + '</div>' + (p.total ? bar(p.done, p.total, p.color) : '') + '</div></div>';
      });
    });
    h += '<p class="muted" style="margin-top:10px">Cada proyecto es su nombre, tus notas y sus tareas. Sus tareas aparecen en sus bloques del día. Pausar un proyecto lo saca del organizador.</p>';
    return h;
  }
  function pendTasks() { return B.list('tareas').filter((t) => !t.done && projActive(t.project)).sort((a, b) => score(b) - score(a) || String(a.due || '9').localeCompare(String(b.due || '9'))); }
  function taskRow(t) {
    const s = score(t); const col = s >= 16 ? '#ff5252' : s >= 9 ? '#ffab00' : '#00e676';
    return '<div class="item ' + (t.done ? 'done' : '') + '" style="--c:' + col + '"><button class="chk" data-tdone="' + esc(t.id) + '" aria-label="Marcar">' + (t.done ? '✓' : '') + '</button><div class="bd" data-topen="' + esc(t.id) + '" style="flex:1;min-width:0"><div class="t">' + esc(t.title) + '</div><div class="h">' +
      [projName(t.project), (t.minutes || 30) + ' min', t.due ? 'para ' + esc(t.due) : ''].filter(Boolean).join(' · ') + '</div></div><span class="chipbtn" style="margin:0;color:' + col + '">' + (t.imp || 3) + '×' + (t.urg || 3) + '=' + s + '</span></div>';
  }
  function tareasHtml() {
    const all = B.list('tareas');
    const L = tFilter === 'hechas' ? all.filter((t) => t.done).sort((a, b) => String(b.doneAt || '').localeCompare(String(a.doneAt || ''))).slice(0, 40) : pendTasks();
    let h = '<div class="prrow"><input id="prTask" maxlength="100" placeholder="＋ Tarea pequeña (15–45 min)… Enter" autocomplete="off"><button class="btn sm" data-addtask="1" >＋</button></div>';
    h += '<div class="chips">' + [['pend', 'Pendientes · ' + pendTasks().length], ['hechas', 'Hechas']].map(([k, n]) => '<button class="chip ' + (tFilter === k ? 'on' : '') + '" data-tf2="' + k + '">' + n + '</button>').join('') + '</div>';
    h += L.map(taskRow).join('') || '<div class="box">Sin tareas ' + (tFilter === 'hechas' ? 'hechas todavía' : 'pendientes') + '. Escribe una arriba: el orden sale de importancia × urgencia (1 a 5).</div>';
    const pz = all.filter((t) => !t.done && !projActive(t.project)).length;
    if (pz && tFilter === 'pend') h += '<p class="muted">' + pz + ' tarea(s) de proyectos pausados o futuros no aparecen aquí.</p>';
    h += '<button class="btn cy" data-org="1">⚡ Organizarlas en mi día</button>';
    return h;
  }
  function addIdea() { const i = $('#prIdea'); const v = (i.value || '').trim(); if (!v) return; B.add('proyectos', { name: v, status: 'idea', color: '#00e5ff' }); i.value = ''; X.toast('💡 Idea guardada'); render(); }
  function addTaskQuick(project) { const i = $('#prTask'); const v = (i.value || '').trim(); if (!v) return; B.add('tareas', { title: v, imp: 3, urg: 3, minutes: 30, done: false, project: project || '' }); i.value = ''; X.toast('✓ Tarea guardada'); render(); setTimeout(() => { const n = $('#prTask'); if (n) n.focus(); }, 30); }
  function onClick(e) {
    const pv = e.target.closest('[data-pv]'); if (pv) { if (pv.dataset.pv === 'ruta') { view = 'proyectos'; X.setMetaView('ruta'); X.render(); return; } view = pv.dataset.pv; render(); return; }
    if (e.target.closest('[data-addidea]')) return addIdea();
    if (e.target.closest('[data-addtask]')) return addTaskQuick();
    const tf = e.target.closest('[data-tf2]'); if (tf) { tFilter = tf.dataset.tf2; render(); return; }
    const td = e.target.closest('[data-tdone]'); if (td) { toggleTask(td.dataset.tdone); render(); return; }
    const to = e.target.closest('[data-topen]'); if (to) return taskSheet(B.get('tareas', to.dataset.topen));
    const pr = e.target.closest('[data-pr]'); if (pr) return projectPage(pr.dataset.pr);
    if (e.target.closest('[data-org]')) { X.setTab('hoy'); setTimeout(() => organize(X.today()), 60); }
  }
  function toggleTask(id) { const t = B.get('tareas', id); if (!t) return; B.update('tareas', id, { done: !t.done, doneAt: !t.done ? new Date().toISOString() : null }); if (!t.done) { X.toast('✓ ¡Tarea hecha!'); if (navigator.vibrate) navigator.vibrate(30); } }

  // ---------- Página de un proyecto ----------
  let showAll = false;
  function flushNotes() { const n = document.getElementById('prNotes'); if (n && n.dataset.pid && n.value !== notesOf(n.dataset.pid)) setNotes(n.dataset.pid, n.value); }
  function projectPage(id) {
    flushNotes(); // si estabas escribiendo una nota, se guarda antes de redibujar
    const isB = !!X.P[id]; const p = isB ? X.P[id] : B.get('proyectos', id); if (!p) return;
    const status = isB ? (pst()[id] || 'activo') : (p.status || 'activo'); const color = p.color || '#00e5ff';
    let h = '<button class="back" data-x="1">‹ Proyectos</button><div class="det"><div class="pill" style="background:' + color + '33;color:' + color + '">PROYECTO</div><h2>' + esc(p.name) + '</h2>';
    h += '<div class="f">ESTADO</div><div class="chips wrap">' + ST.map(([k, ic, lb]) => '<button class="chip ' + (status === k ? 'on' : '') + '" style="--cc:' + color + '" data-ps="' + k + '">' + ic + ' ' + lb + '</button>').join('') + '</div>';
    if (status === 'futuro' && !isB) h += '<div class="f">EMPIEZA</div><input type="date" id="prStart" value="' + esc(p.start || '') + '">';
    h += '<div class="f">📝 NOTAS</div><textarea id="prNotes" data-pid="' + esc(id) + '" rows="4" placeholder="Ideas, enlaces, lo que no quieres olvidar de este proyecto…">' + esc(notesOf(id)) + '</textarea><div class="muted" id="prSaved" style="font-size:12px;min-height:16px"></div>';
    // tareas propias del proyecto
    const ts = B.list('tareas').filter((t) => t.project === id).sort((a, b) => (a.done - b.done) || score(b) - score(a));
    h += '<div class="sec">✅ Tareas (' + ts.filter((t) => !t.done).length + ' pendientes)</div><div class="prrow"><input id="prTask" maxlength="100" placeholder="＋ Paso pequeño… Enter" autocomplete="off"><button class="btn sm" data-addtp="1" >＋</button></div>';
    h += ts.map(taskRow).join('');
    if (isB) {
      h += '<button class="btn alt sm" data-ped="1">✎ Cambiar nombre</button>';
    } else {
      h += '<button class="btn alt sm" data-ped="1">✎ Cambiar nombre</button><button class="btn alt sm" data-pdel="1" style="color:#ff5252">Borrar proyecto</button>';
    }
    h += '</div>';
    X.openPage(h);
    const inp = $('#prTask'); if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') { addTaskQuick(id); projectPage(id); } };
    $('#page').onchange = (e) => { if (e.target.id === 'prStart') { B.update('proyectos', id, { start: e.target.value }); } if (e.target.id === 'prNotes') flushNotes(); };
    let nt = 0; $('#page').oninput = (e) => { if (e.target.id !== 'prNotes') return; clearTimeout(nt); const v = e.target.value; nt = setTimeout(() => { setNotes(id, v); const sv = $('#prSaved'); if (sv) sv.textContent = '✓ Guardado'; }, 500); };
    $('#page').onclick = (e) => {
      if (e.target.closest('[data-x]')) { flushNotes(); X.closePage(); X.render(); return; }
      const ps = e.target.closest('[data-ps]');
      if (ps) { if (isB) { pst()[id] = ps.dataset.ps; X.save(); } else B.update('proyectos', id, { status: ps.dataset.ps }); X.toast(stOf(ps.dataset.ps)[1] + ' ' + stOf(ps.dataset.ps)[2]); projectPage(id); return; }
      if (e.target.closest('[data-addtp]')) { addTaskQuick(id); projectPage(id); return; }
      const td = e.target.closest('[data-tdone]'); if (td) { toggleTask(td.dataset.tdone); projectPage(id); return; }
      const to = e.target.closest('[data-topen]'); if (to) { taskSheet(B.get('tareas', to.dataset.topen), () => projectPage(id)); return; }
      const mc = e.target.closest('[data-mc2]'); if (mc) { X.toggleMeta(id, mc.dataset.mc2); projectPage(id); return; }
      const mo = e.target.closest('[data-mo2]'); if (mo) { X.openMeta(id, mo.dataset.mo2); return; }
      if (e.target.closest('[data-more]')) { showAll = !showAll; projectPage(id); return; }
      if (e.target.closest('[data-ped]')) { renameProject(id); return; }
      const del = e.target.closest('[data-pdel]');
      if (del) { if (!del.dataset.sure) { del.dataset.sure = '1'; del.textContent = '¿Seguro? Sus tareas quedan sueltas · toca otra vez'; return; }
        B.remove('proyectos', id); B.list('tareas').filter((t) => t.project === id).forEach((t) => B.update('tareas', t.id, { project: '' })); X.closePage(); X.render(); X.toast('Proyecto borrado'); }
    };
  }
  function renameProject(id) {
    if (X.P[id]) {
      X.openSheet('<div class="det"><div class="f" style="margin-top:0">NOMBRE</div><input id="pnN" maxlength="80" value="' + esc(X.P[id].name) + '"><button class="btn" data-pns="1">Guardar</button></div>');
      $('#sheet').onclick = (e) => { if (e.target.closest('[data-pns]')) { const n = $('#pnN').value.trim(); if (!n) { X.toast('Ponle un nombre'); return; } X.S.projNames = X.S.projNames || {}; X.S.projNames[id] = n; X.P[id].name = n; X.save(); X.closeSheet(); projectPage(id); } };
      return;
    }
    const p = B.get('proyectos', id);
    X.openSheet('<div class="det"><div class="f" style="margin-top:0">NOMBRE</div><input id="pnN" maxlength="80" value="' + esc(p.name) + '"><button class="btn" data-pns="1">Guardar</button></div>');
    $('#sheet').onclick = (e) => { if (e.target.closest('[data-pns]')) { const n = $('#pnN').value.trim(); if (!n) { X.toast('Ponle un nombre'); return; } B.update('proyectos', id, { name: n }); X.closeSheet(); projectPage(id); } };
  }

  // ---------- Hoja de una tarea (importancia y urgencia 1 a 5) ----------
  function taskSheet(t, after) {
    if (!t) return;
    const F = Object.assign({}, t);
    const projs = allProjects().filter((p) => p.status !== 'terminado');
    const draw = () => {
      const scale = (k, lbl) => '<div class="f">' + lbl + '</div><div class="chips wrap">' + [1, 2, 3, 4, 5].map((n) => '<button class="chip ' + ((Number(F[k]) || 3) === n ? 'on' : '') + '" data-sc="' + k + '|' + n + '" style="min-width:44px;text-align:center">' + n + '</button>').join('') + '</div>';
      X.openSheet('<div class="det"><div class="f" style="margin-top:0">TAREA</div><input id="tkT" maxlength="100" value="' + esc(F.title) + '">' +
        scale('imp', 'IMPORTANCIA (1 poco · 5 mucho)') + scale('urg', 'URGENCIA (1 puede esperar · 5 ya)') +
        '<div class="muted" style="margin-top:6px">Prioridad: <b>' + score(F) + '</b> de 25</div>' +
        '<div class="f">¿CUÁNTO TOMA?</div><div class="chips wrap">' + MINS.map((m) => '<button class="chip ' + ((Number(F.minutes) || 30) === m ? 'on' : '') + '" data-mn="' + m + '">' + m + ' min</button>').join('') + '</div>' +
        '<div class="f">PARA CUÁNDO (opcional)</div><input type="date" id="tkD" value="' + esc(F.due || '') + '">' +
        '<div class="f">PROYECTO</div><div class="chips wrap"><button class="chip ' + (!F.project ? 'on' : '') + '" data-pj="">Ninguno</button>' + projs.map((p) => '<button class="chip ' + (F.project === p.id ? 'on' : '') + '" style="--cc:' + p.color + '" data-pj="' + esc(p.id) + '">' + esc(p.name) + '</button>').join('') + '</div>' +
        '<button class="btn" data-tks="1">Guardar</button><button class="btn alt sm" data-tkd="1">' + (t.done ? '↺ Marcar como pendiente' : '✓ Marcar hecha') + '</button><button class="btn alt sm" data-tkx="1" style="color:#ff5252">Borrar tarea</button></div>');
    };
    const read = () => { const a = $('#tkT'); if (a) F.title = a.value; const d = $('#tkD'); if (d) F.due = d.value; };
    draw();
    $('#sheet').onclick = (e) => {
      const sc = e.target.closest('[data-sc]'); if (sc) { read(); const [k, n] = sc.dataset.sc.split('|'); F[k] = Number(n); draw(); return; }
      const mn = e.target.closest('[data-mn]'); if (mn) { read(); F.minutes = Number(mn.dataset.mn); draw(); return; }
      const pj = e.target.closest('[data-pj]'); if (pj) { read(); F.project = pj.dataset.pj; draw(); return; }
      const done = () => { X.closeSheet(); after ? after() : X.render(); };
      if (e.target.closest('[data-tks]')) { read(); if (!F.title.trim()) { X.toast('Escribe la tarea'); return; } B.update('tareas', t.id, { title: F.title.trim(), imp: F.imp || 3, urg: F.urg || 3, minutes: F.minutes || 30, due: F.due || '', project: F.project || '' }); X.toast('✓ Guardada'); done(); return; }
      if (e.target.closest('[data-tkd]')) { toggleTask(t.id); done(); return; }
      const x = e.target.closest('[data-tkx]'); if (x) { if (!x.dataset.sure) { x.dataset.sure = '1'; x.textContent = '¿Seguro? Toca otra vez'; return; } B.remove('tareas', t.id); X.toast('Tarea borrada'); done(); }
    };
  }

  // ---------- ⚡ Organizar: propuesta → tú eliges → se pone en tu día ----------
  const MAX_MIN = 180, MARGIN = 10, WAKE_GAP = 30;
  const endOf = (d) => X.atTime(d, '23:59');
  function studyCands(d) {
    if (!PL) return [];
    const di = X.iso(d); const dleft = 8 - X.dow(d);
    return B.list('topics').filter((t) => t.type !== 'fija' && Number(t.hoursWeek) > 0).map((t) => {
      const need = PL.topicNeed(t) - PL.topicDone(t, di)
        - X.S.agenda.filter((a) => a.kind === 'flex' && a.topic === t.id && !a.done && a.slot && X.iso(new Date(a.slot)) >= X.iso(X.today())).reduce((s, a) => s + (a.dur || 30), 0);
      const min = Math.min(90, Math.ceil(Math.max(0, need) / Math.max(1, dleft) / 15) * 15);
      return { kind: 'study', id: t.id, title: '📚 ' + t.name, min, score: score(t) + (t.type === 'obligatoria' ? 5 : 0) };
    }).filter((x) => x.min >= 15);
  }
  function taskCands(d) {
    const di = X.iso(d);
    const sched = new Set(X.S.agenda.filter((a) => a.kind === 'flex' && a.task && !a.done && a.slot).map((a) => a.task));
    return pendTasks().filter((t) => !sched.has(t.id)).map((t) => {
      let s = score(t); if (t.due) { const k = Math.round((X.parseIso(t.due) - X.parseIso(di)) / X.DAY); if (k <= 0) s += 10; else if (k <= 2) s += 5; }
      return { kind: 'task', id: t.id, title: t.title, min: Number(t.minutes) || 30, score: s, imp: t.imp || 3, urg: t.urg || 3 };
    }).concat(misCands(d));
  }
  // 🎯 Misiones de NEXO Negocios (cobrar, seguimientos, prospectos…): se crean solas para ese día y compiten por tus ratos libres
  function misCands(d) {
    const di = X.iso(d); if (!MI || di < X.iso(X.today())) return [];
    try { MI.generar(di); } catch (e) { return []; }
    const sched = new Set(X.S.agenda.filter((a) => a.kind === 'flex' && a.mision && a.slot).map((a) => a.mision));
    return B.list('misiones').filter((m) => m.date === di && !m.done && !sched.has(m.id))
      .map((m) => ({ kind: 'mision', id: m.id, title: m.title, min: Number(m.minutes) || 20, score: Math.round((Number(m.prio) || 70) / 5) + 2 }));
  }
  // huecos: bloques "Libre" del día, sin lo ya agendado, con margen, desde ahora y no pegado a la hora de levantarte
  function freeOf(d) {
    const di = X.iso(d); const isT = di === X.iso(X.today());
    const bl = X.blocksOf(d);
    const wake = bl.filter((b) => b.cat === 'dormir' && X.mins(b.e) < 12 * 60).map((b) => X.mins(b.e))[0];
    const busy = X.S.agenda.filter((x) => !x.done && ((x.kind === 'cita' && X.iso(new Date(x.start)) === di) || (x.kind === 'flex' && x.slot && X.iso(new Date(x.slot)) === di)))
      .map((x) => x.kind === 'cita' ? [x.start, x.end] : [x.slot, x.slot + (x.dur || 30) * 60000]);
    let gaps = [];
    bl.filter((b) => b.cat === 'libre' && !X.pausa(b, d)).forEach((b) => {
      let s = X.atTime(d, b.s), e = X.atTime(d, b.e);
      if (wake != null) s = Math.max(s, X.atTime(d, '00:00') + (wake + WAKE_GAP) * 60000);
      if (isT) s = Math.max(s, Math.ceil((Date.now() + MARGIN * 60000) / 300000) * 300000);
      if (e - s >= 15 * 60000) gaps.push([s, e]);
    });
    busy.forEach(([bs, be]) => { gaps = gaps.flatMap(([s, e]) => (be + MARGIN * 60000 <= s || bs - MARGIN * 60000 >= e) ? [[s, e]] : [[s, bs - MARGIN * 60000], [be + MARGIN * 60000, e]]).filter(([s, e]) => e - s >= 15 * 60000); });
    return gaps.sort((a, b) => a[0] - b[0]);
  }
  function propose(d) {
    const gaps = freeOf(d); const out = []; let used = 0; const left = [];
    const cands = taskCands(d).concat(studyCands(d)).sort((a, b) => b.score - a.score);
    for (const c of cands) {
      if (used >= MAX_MIN) break;
      let len = Math.min(c.min, MAX_MIN - used); if (len < 15) { left.push(c); continue; }
      let g = gaps.find(([s, e]) => e - s >= len * 60000);
      if (!g && c.kind === 'study' && len > 30) { len = 30; g = gaps.find(([s, e]) => e - s >= len * 60000); } // el estudio se puede partir
      if (!g) { left.push(c); continue; }
      out.push({ c, at: g[0], end: g[0] + len * 60000, len, on: true });
      g[0] += (len + MARGIN) * 60000; used += len;
    }
    out.sort((a, b) => a.at - b.at); out.left = left;
    out.freeMin = Math.round(freeOf(d).reduce((a, [s, e]) => a + (e - s), 0) / 60000);
    return out;
  }
  function organize(d) {
    d = d || X.today();
    const P = propose(d);
    const label = X.iso(d) === X.iso(X.today()) ? 'hoy' : X.fmtShort(d);
    const draw = () => {
      const n = P.filter((x) => x.on).length;
      let h = '<div class="det"><h2>⚡ Así quedaría ' + esc(label) + '</h2>';
      if (!P.length) {
        const why = !taskCands(d).length && !studyCands(d).length ? 'No tienes tareas pendientes ni horas de estudio por cubrir. Agrega tareas en Proyectos → ✅ Tareas.' : 'No encontré huecos libres suficientes ' + esc(label) + ' (uso solo tus bloques Libre, dejo ' + MARGIN + ' min entre cosas y ' + WAKE_GAP + ' min después de levantarte).';
        h += '<div class="box">' + why + '</div>' + (taskCands(d).length || studyCands(d).length ? '<button class="btn cy" data-otm="1">📅 Probar ' + (label === 'hoy' ? 'mañana' : 'el día siguiente') + '</button>' : '') + '<button class="btn alt" data-oc="1">Cerrar</button></div>'; X.openSheet(h); return;
      }
      h += '<p class="muted">Pongo lo más importante primero (importancia × urgencia), solo en tus bloques Libre y máximo ' + (MAX_MIN / 60) + ' h nuevas al día. Quita lo que no quieras:</p>';
      P.forEach((x, i) => {
        h += '<div class="item ' + (x.on ? '' : 'no') + '" style="--c:' + (x.c.kind === 'study' ? '#ffc23d' : x.c.kind === 'mision' ? '#ff8a1f' : '#00e5ff') + ';opacity:' + (x.on ? 1 : .45) + '"><button class="chk" data-ot="' + i + '" aria-label="Incluir">' + (x.on ? '✓' : '') + '</button><div class="bd" data-ot="' + i + '"><div class="t">' + esc(x.c.title) + '</div><div class="h">' + X.h12(X.hhmmOf(x.at)) + ' – ' + X.h12(X.hhmmOf(x.end)) + ' · ' + x.len + ' min' + (x.c.kind === 'task' ? ' · prioridad ' + x.c.score : x.c.kind === 'mision' ? ' · misión de Negocios' : ' · estudio de la semana') + '</div></div></div>';
      });
      if (P.left && P.left.length) h += '<div class="box warn" style="margin-top:8px">No cupo ' + esc(label) + ': ' + P.left.slice(0, 4).map((c) => esc(c.title) + ' (' + c.min + ' min)').join(', ') + '. Tus bloques Libre ' + esc(label) + ' suman solo ' + P.freeMin + ' min.<br><button class="chipbtn" data-otm="1">📅 Probar ' + (label === 'hoy' ? 'mañana' : 'el día siguiente') + '</button></div>';
      h += '<button class="btn" data-oa="1"' + (n ? '' : ' disabled style="opacity:.5"') + '>✓ Poner ' + n + ' en mi día</button><button class="btn alt sm" data-oc="1">Cancelar</button></div>';
      X.openSheet(h);
    };
    draw();
    $('#sheet').onclick = (e) => {
      const t = e.target.closest('[data-ot]'); if (t) { const x = P[+t.dataset.ot]; x.on = !x.on; draw(); return; }
      if (e.target.closest('[data-oc]')) { X.closeSheet(); return; }
      if (e.target.closest('[data-otm]')) { organize(X.addDays(d, 1)); return; }
      if (e.target.closest('[data-oa]')) {
        const sel = P.filter((x) => x.on); if (!sel.length) return;
        sel.forEach((x) => { window.AG.addFlex({ title: x.c.title, dur: x.len, deadline: endOf(d), slot: x.at, tipo: 'general' }); const it = X.S.agenda[X.S.agenda.length - 1]; if (it) { it[{ task: 'task', mision: 'mision', study: 'topic' }[x.c.kind]] = x.c.id; it.org = true; } });
        X.save(); X.scheduleNotifs(); X.closeSheet(); X.render(); X.toast('⚡ ' + sel.length + ' en tu día. Si no alcanzas alguno, se reprograma solo.', 3500);
      }
    };
  }
  // lo organizado del día, dentro de "Mi día"
  function hoyHtml(d) {
    const di = X.iso(d); if (di < X.iso(X.today())) return '';
    const L = X.S.agenda.filter((x) => x.kind === 'flex' && x.slot && X.iso(new Date(x.slot)) === di).sort((a, b) => a.slot - b.slot);
    let h = '<div class="sec" style="display:flex;justify-content:space-between;align-items:center">⚡ Organizado' + (L.length ? ' (' + L.filter((x) => x.done).length + '/' + L.length + ')' : '') + '<button class="chipbtn onb" data-orgh="1" style="margin:0">⚡ Organizar</button></div>';
    if (!L.length) return h + '<p class="muted" style="margin:0 0 8px">Toca ⚡ Organizar: propongo dónde van tus tareas y tu estudio en tus ratos libres.</p>';
    L.forEach((x) => { h += '<div class="item ' + (x.done ? 'done' : '') + '" style="--c:' + (x.topic ? '#ffc23d' : x.mision ? '#ff8a1f' : '#00e5ff') + '"><button class="chk" data-ofd="' + esc(x.id) + '">' + (x.done ? '✓' : '') + '</button><div class="bd" data-ofo="' + esc(x.id) + '"><div class="t">' + esc(x.title) + '</div><div class="h">' + X.h12(X.hhmmOf(x.slot)) + ' · ' + (x.dur || 30) + ' min' + (x.moves ? ' · reprogramado' : '') + '</div></div></div>'; });
    return h;
  }
  function hoyClick(e, d) {
    if (e.target.closest('[data-orgh]')) { organize(d); return true; }
    const f = e.target.closest('[data-ofd]'); if (f) { const x = window.AG.byId(f.dataset.ofd); if (x) { window.AG.setItemDone(x.id, !x.done); if (!x.done) X.toast('✓ ¡Hecho!'); } X.render(); return true; }
    const o = e.target.closest('[data-ofo]'); if (o) { window.AG.openItem(o.dataset.ofo); return true; }
    return false;
  }
  // al terminar algo organizado: marca la tarea en NEXO Brain y suma el estudio al cronómetro de Aprende
  X.hooks.saved.push(() => {
    (X.S.agenda || []).forEach((x) => {
      if (x.kind !== 'flex' || !x.done || x.synced) return;
      if (!x.task && !x.topic && !x.mision) return;
      x.synced = true;
      if (x.task) { const t = B.get('tareas', x.task); if (t && !t.done) B.update('tareas', t.id, { done: true, doneAt: new Date().toISOString() }); }
      if (x.mision) { const m = B.get('misiones', x.mision); if (m && !m.done) B.update('misiones', m.id, { done: true, doneAt: new Date().toISOString() }); }
      if (x.topic) B.add('timeLogs', { minutes: x.dur || 30, date: X.iso(new Date(x.slot || Date.now())), label: x.title.replace(/^📚 /, ''), kind: 'estudio', topic: x.topic });
      X.saveQuiet();
    });
  });
  // la ruta de metas no marca atrasadas las de proyectos pausados o futuros
  X.isPaused = (pid) => ['pausado', 'futuro', 'idea', 'terminado'].includes(pst()[pid] || 'activo');
  // abrir el organizador desde otra app: …/Nexo-plan/#organizar
  const fromHash = () => { if (location.hash === '#organizar') { history.replaceState(null, '', location.pathname); if (X.tab !== 'hoy') X.setTab('hoy'); setTimeout(() => organize(X.today()), 900); } };
  X.hooks.boot.push(fromHash); window.addEventListener('hashchange', fromHash);

  Object.keys(X.S.projNames || {}).forEach((k) => { if (X.P[k]) X.P[k].name = X.S.projNames[k]; });
  X.hooks.boot.push(() => { window.CNT = null; }); // contadores de metas: apagados (sin metas)
  const pendingCount = () => pendTasks().length;
  const topTask = () => pendTasks()[0] || null;
  const nextTask = (pid) => (projActive(pid) ? B.list('tareas').filter((t) => t.project === pid && !t.done).sort((a, b) => score(b) - score(a))[0] || null : null);
  function progressHtml() {
    let h = '<div class="sec">Tus proyectos</div><div class="card">';
    allProjects().filter((p) => p.status !== 'terminado' && p.status !== 'idea').forEach((p) => { h += '<div class="pbar"><div class="nm">' + esc(p.name) + '</div><div class="tr"><i style="width:' + (p.total ? p.done / p.total * 100 : 0) + '%;background:' + p.color + '"></i></div><div class="v">' + p.done + '/' + p.total + '</div></div>'; });
    const all = B.list('tareas'); h += '<div class="muted">' + all.filter((t) => t.done).length + ' de ' + all.length + ' tareas hechas.</div></div>';
    return h;
  }
  window.PR = { pendingCount, topTask, nextTask, progressHtml, render, organize, hoyHtml, hoyClick, ready, store: () => B, setView(v) { view = v; } };
})();
