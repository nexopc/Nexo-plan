/* NEXO PLAN — volver atrás en cualquier dispositivo (sobre todo iPhone, que no tiene botón atrás):
   - "‹ Atrás" arriba a la izquierda siempre que haya a dónde volver (también dentro de pantallas completas).
   - ✕ en cada ventana de abajo y deslizarla hacia abajo para cerrarla.
   - Deslizar desde el borde izquierdo = atrás. Botón atrás del navegador/Android = atrás.
   Usa window.handleBack(): ventana → pantalla → vista → pestaña Hoy → hoy. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const back = () => { if (window.handleBack && window.handleBack()) { if (navigator.vibrate) navigator.vibrate(8); refresh(); return true; } return false; };

  // 1) botón en la barra de arriba
  const top = $('header.top');
  const btn = document.createElement('button');
  btn.className = 'atras'; btn.type = 'button'; btn.setAttribute('aria-label', 'Atrás'); btn.innerHTML = '‹ <span>Atrás</span>';
  btn.onclick = back;
  if (top) top.insertBefore(btn, top.firstChild);
  // 2) dentro de las pantallas completas que no traen su propio botón de volver
  const page = $('#page'), sheet = $('#sheet');
  function decoratePage() {
    if (!page || page.classList.contains('hidden')) return;
    if (page.querySelector('.back, .atras-p')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'back atras-p'; b.textContent = '‹ Atrás';
    b.onclick = (e) => { e.stopPropagation(); back(); };
    page.insertBefore(b, page.firstChild);
  }
  // 3) ✕ y deslizar hacia abajo en las ventanas de abajo
  function decorateSheet() {
    if (!sheet || sheet.classList.contains('hidden') || sheet.querySelector('.sheet-x')) return;
    const x = document.createElement('button'); x.type = 'button'; x.className = 'sheet-x'; x.setAttribute('aria-label', 'Cerrar'); x.textContent = '✕';
    x.onclick = (e) => { e.stopPropagation(); back(); };
    sheet.insertBefore(x, sheet.firstChild);
  }
  if (sheet) {
    let y0 = null;
    sheet.addEventListener('touchstart', (e) => { y0 = sheet.scrollTop <= 0 && e.touches[0].clientY - sheet.getBoundingClientRect().top < 70 ? e.touches[0].clientY : null; }, { passive: true });
    sheet.addEventListener('touchmove', (e) => { if (y0 == null) return; const d = e.touches[0].clientY - y0; if (d > 0) sheet.style.transform = 'translateY(' + d + 'px)'; }, { passive: true });
    sheet.addEventListener('touchend', (e) => { if (y0 == null) return; const d = e.changedTouches[0].clientY - y0; sheet.style.transform = ''; y0 = null; if (d > 90) back(); }, { passive: true });
  }
  // 4) deslizar desde el borde izquierdo
  let x0 = null, yy = 0;
  document.addEventListener('touchstart', (e) => { const t = e.touches[0]; x0 = t.clientX < 24 ? t.clientX : null; yy = t.clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => { if (x0 == null) return; const t = e.changedTouches[0]; if (t.clientX - x0 > 80 && Math.abs(t.clientY - yy) < 60) back(); x0 = null; }, { passive: true });
  // 5) botón atrás del navegador / Android web: una entrada de guarda en el historial
  const arm = () => { if (!(history.state && history.state.nexoGuard)) history.pushState({ nexoGuard: 1 }, ''); };
  window.addEventListener('popstate', () => { if (back()) arm(); });
  // mostrar u ocultar según haya a dónde volver
  function refresh() {
    const can = window.canBack ? window.canBack() : false;
    btn.classList.toggle('on', can);
    decoratePage(); decorateSheet();
    if (can) arm();
  }
  const mo = new MutationObserver(() => requestAnimationFrame(refresh));
  [page, sheet, $('#view'), $('#nav')].forEach((el) => el && mo.observe(el, { attributes: true, attributeFilter: ['class'], childList: true }));
  document.addEventListener('click', () => setTimeout(refresh, 0), true);
  refresh();
})();
