/* NEXO PLAN — en PC: columnas y atajos de teclado. En el celular no cambia nada. */
(function () {
  'use strict';
  const X = window.NP; const view = document.getElementById('view');
  const wide = () => window.matchMedia('(min-width: 1000px)').matches;
  const SIDE_HOY = ['.banner', '.now', '.dayr', '.top3', '.rutaline'];
  const wrap = (cls, a, b) => { const g = document.createElement('div'); g.className = 'd2 ' + cls; const m = document.createElement('div'); const s = document.createElement('div'); s.className = 'side'; a.forEach((n) => m.appendChild(n)); b.forEach((n) => s.appendChild(n)); g.appendChild(m); g.appendChild(s); return g; };
  function layout() {
    const tab = X.tab; view.className = 'view-' + (tab === 'hoy' ? (X.hoyView === 'dia' ? 'hoy' : X.hoyView) : tab);
    if (!wide() || view.querySelector(':scope > .d2, :scope > .cols2')) return;
    const kids = Array.from(view.children).filter((n) => !n.classList.contains('fab'));
    if (tab === 'hoy' && X.hoyView === 'dia' && view.querySelector('.dayhead')) {
      // arriba: selector de ventana y día · izquierda: tus bloques · derecha: ahora, tu día y tus 3
      const top = kids.filter((n) => n.matches('.sw3b, .dayhead'));
      let inCnt = false; const side = [], main = [];
      kids.forEach((n) => {
        if (top.includes(n)) return;
        if (n.matches('.sec') && /Marca tus días/.test(n.textContent)) inCnt = true; else if (n.matches('.sec, .item, .mini-row, .addb')) inCnt = false;
        (SIDE_HOY.some((s) => n.matches(s)) || n.matches('.box') || inCnt ? side : main).push(n);
      });
      const g = wrap('hoy', main, side); view.insertBefore(g, view.querySelector('.fab')); top.reverse().forEach((n) => view.prepend(n));
    } else if (tab === 'metas' && view.querySelector(':scope > .grid')) {
      const gi = kids.indexOf(view.querySelector(':scope > .grid'));
      const top = kids.slice(0, gi), left = [kids[gi]], right = kids.slice(gi + 1);
      const g = wrap('metas', left, right); view.appendChild(g); top.reverse().forEach((n) => view.prepend(n));
    } else if (tab === 'yo' || tab === 'ejercicio' || (tab === 'semana' && view.querySelector('.wkgrid'))) {
      // Progreso y Ejercicio a 2 columnas; en Semana, lo de debajo de la cuadrícula
      let from = 0;
      if (tab === 'ejercicio') from = kids.findIndex((n) => n.matches('.days')) + 1;
      if (tab === 'semana') from = kids.findIndex((n) => n.matches('.wkgrid')) + 1;
      const c = document.createElement('div'); c.className = 'cols2'; kids.slice(from).forEach((n) => c.appendChild(n)); view.appendChild(c);
    }
  }
  let busy = false;
  new MutationObserver(() => { if (busy) return; busy = true; try { layout(); } catch (e) { console.error(e); } busy = false; }).observe(view, { childList: true });
  window.addEventListener('resize', () => { const was = !!view.querySelector(':scope > .d2, :scope > .cols2'); if (was !== wide()) X.render(); });

  // atajos de teclado (PC)
  const TABS = ['hoy', 'metas', 'ejercicio', 'semana', 'yo'];
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === 'Escape') { if (window.handleBack && window.handleBack()) e.preventDefault(); return; }
    if (typing) return;
    const open = !document.getElementById('sheet').classList.contains('hidden') || !document.getElementById('page').classList.contains('hidden');
    if (open) return;
    if (/^[1-5]$/.test(e.key)) { X.setTab(TABS[+e.key - 1]); e.preventDefault(); return; }
    if ((e.key === 'n' || e.key === 'N' || e.key === '+') && X.quickAdd) { X.quickAdd(); e.preventDefault(); return; }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && X.tab === 'hoy' && X.hoyView === 'dia') { const a = document.querySelector('[data-a="' + (e.key === 'ArrowLeft' ? 'prev' : 'next') + '"]'); if (a) { a.click(); e.preventDefault(); } }
  });
})();
