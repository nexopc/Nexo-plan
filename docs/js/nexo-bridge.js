/* NEXO PLAN ↔ red NEXO (Hub, Finanzas, Negocios, Studio, Aprende y Harvey).
   1) Publica un resumen de tu plan en NEXO Brain para que Harvey lo lea desde cualquier app.
   2) Recibe lo que Harvey te manda (reorganizar un día, tareas nuevas) y lo aplica aquí.
   Funciona porque todas las apps viven en el mismo sitio (nexopc.github.io). */
(function () {
  'use strict';
  const X = window.NP;
  const OUT = 'nexo:data:planBridge';
  const INBOX = 'nexo:plan:inbox';
  const ch = 'BroadcastChannel' in window ? new BroadcastChannel('nexo-brain') : null;
  const KIND = { Colegio: 'colegio', Trabajo: 'libre', Estudio: 'tareas', Clientes: 'cliente', Ejercicio: 'ejercicio', Descanso: 'libre', Otro: 'rutina' };
  const OK = ['app', 'video', 'creador', 'agencia', 'nexo', 'ingles', 'ejercicio', 'cliente', 'tareas', 'colegio', 'dormir', 'rutina', 'libre'];

  function dayList(d) {
    const di = X.iso(d);
    return X.blocksOf(d).map((b) => ({ s: b.s, e: b.e, cat: b.cat, title: b.title, estado: X.blockState(di, b.id) || null, ancla: !!X.S.anchors[b.id] }));
  }
  function publish() {
    try {
      const t = X.today(); const di = X.iso(t);
      const week = []; for (let i = 0; i < 7; i++) { const d = X.addDays(X.mondayOf(X.weekOf(t)), i); week.push({ fecha: X.iso(d), bloques: dayList(d).filter((b) => window.CATS[b.cat] && window.CATS[b.cat].check).length, hechos: dayList(d).filter((b) => b.estado === 'ok').length }); }
      const rec = { id: 'nexo-plan', updatedAt: new Date().toISOString(), version: 'NEXO PLAN', fecha: di, semana_plan: X.weekOf(t), modo: X.modoOn(di),
        hoy: dayList(t), manana: dayList(X.addDays(t, 1)), ajustado_hoy: !!X.S.dayEdit[di],
        tareas: (X.S.tasks || []).filter((x) => !x.done).map((x) => ({ titulo: x.title, tipo: x.type, para: x.due ? new Date(x.due).toISOString().slice(0, 16) : null })).slice(0, 40),
        cumplimiento_semana: week };
      localStorage.setItem(OUT, JSON.stringify([rec]));
      ch && ch.postMessage({ col: 'planBridge' });
    } catch (e) { console.warn('puente NEXO', e); }
  }
  function applyInbox() {
    let q; try { q = JSON.parse(localStorage.getItem(INBOX) || '[]'); } catch (e) { q = []; }
    if (!Array.isArray(q) || !q.length) return;
    let n = 0;
    q.forEach((m) => {
      if (m.type === 'dayEdit' && /^\d{4}-\d{2}-\d{2}$/.test(m.date) && Array.isArray(m.blocks)) {
        X.S.dayEdit[m.date] = m.blocks.filter((b) => /^\d{2}:\d{2}$/.test(b.s || b.start) && /^\d{2}:\d{2}$/.test(b.e || b.end) && (b.title))
          .map((b) => { const cat = OK.includes(b.cat) ? b.cat : KIND[b.kind] || 'rutina'; return { s: b.s || b.start, e: b.e || b.end, cat, title: String(b.title) }; })
          .sort((a, b) => X.mins(a.s) - X.mins(b.s));
        n++;
      }
      if (m.type === 'task' && m.title) {
        const due = m.due ? new Date(m.due.length === 10 ? m.due + 'T18:00' : m.due).getTime() : Date.now() + 864e5;
        X.S.tasks.push({ id: 't' + Date.now().toString(36) + n, type: ['tarea', 'examen', 'expo', 'grupo'].includes(m.tipo) ? m.tipo : 'tarea', title: String(m.title), subj: m.subj || '', due, mode: 'custom', notes: m.notes || '🟣 Desde Harvey', created: Date.now(), done: false });
        n++;
      }
    });
    localStorage.removeItem(INBOX);
    if (n) { X.save(); X.reload(); X.toast('🟣 Harvey actualizó tu plan (' + n + ')', 3500); }
  }
  X.hooks.boot.push(() => { applyInbox(); publish(); });
  X.hooks.saved.push(() => { clearTimeout(publish.t); publish.t = setTimeout(publish, 400); });
  window.addEventListener('storage', (e) => { if (e.key === INBOX && e.newValue) applyInbox(); });
  ch && ch.addEventListener('message', (e) => { if (e.data && e.data.col === 'planInbox') applyInbox(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) applyInbox(); });
})();
