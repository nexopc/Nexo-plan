/* NEXO PLAN — Código NEXO: la misma información en Android, iPhone y PC.
   Tus datos viajan cifrados con tu clave (AES-GCM); en la nube solo queda texto ilegible. */
(function () {
  'use strict';
  const X = window.NP; const $ = X.$, esc = X.esc;
  const FB = window.NEXO_FB;
  const LKEY = 'nexoplan.sync'; // se queda en este dispositivo
  let L; try { L = JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { L = {}; }
  const saveL = () => { try { localStorage.setItem(LKEY, JSON.stringify(L)); } catch (e) {} };
  if (!L.dev) { L.dev = 'd' + Math.random().toString(36).slice(2, 10); saveL(); }
  // lo que es solo de este dispositivo y no viaja
  const LOCAL = ['appUpd', 'seenVersion', 'welcomed', 'lastCheck', 'lastLoc', 'remote', '_t'];
  const MAPS = ['done', 'bst', 'ej', 'metas', 'dias', 'dayEdit', 'metaAuto', 'autoSkip'];
  let key = null, busy = false, timer = null, status = '';

  // ---------- cifrado ----------
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (u8) => { let s = ''; u8.forEach((c) => { s += String.fromCharCode(c); }); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  async function docId(code) { const h = await crypto.subtle.digest('SHA-256', enc.encode('nexo:' + normCode(code))); return Array.from(new Uint8Array(h)).map((x) => x.toString(16).padStart(2, '0')).join(''); }
  async function deriveKey(code, clave) {
    const base = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('nexo-plan:' + normCode(code)), iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function seal(obj) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)))); return b64(iv) + '.' + b64(ct); }
  async function open(s) { const [iv, ct] = s.split('.'); const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct)); return JSON.parse(dec.decode(pt)); }
  function newCode() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; const r = crypto.getRandomValues(new Uint8Array(12)); let s = ''; r.forEach((x) => { s += A[x % A.length]; }); return 'NX-' + s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12); }

  // ---------- Firebase por REST (sirve igual en Android, iPhone y PC) ----------
  async function token() {
    if (L.tok && L.exp > Date.now() + 60000) return L.tok;
    let r;
    if (L.ref) r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + FB.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(L.ref) }).then((x) => x.json()).then((j) => j.id_token ? { idToken: j.id_token, refreshToken: j.refresh_token, expiresIn: j.expires_in } : null).catch(() => null);
    if (!r) r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) }).then((x) => x.json());
    if (!r || !r.idToken) throw new Error('auth');
    L.tok = r.idToken; L.ref = r.refreshToken; L.exp = Date.now() + (+r.expiresIn || 3600) * 1000; saveL(); return L.tok;
  }
  const docUrl = () => 'https://firestore.googleapis.com/v1/projects/' + FB.projectId + '/databases/(default)/documents/nexo/' + L.id;
  async function getDoc() {
    const r = await fetch(docUrl(), { headers: { Authorization: 'Bearer ' + await token() } });
    if (r.status === 404) return null; if (!r.ok) throw new Error('get ' + r.status);
    const j = await r.json(); const f = j.fields || {};
    return { d: f.d && f.d.stringValue, t: +(f.t && f.t.integerValue) || 0 };
  }
  async function putDoc(d, t) {
    const r = await fetch(docUrl(), { method: 'PATCH', headers: { Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { d: { stringValue: d }, t: { integerValue: String(t) }, v: { integerValue: '1' } } }) });
    if (!r.ok) throw new Error('put ' + r.status);
  }

  // ---------- unir datos: las marcas se suman, lo demás gana lo más reciente ----------
  function payload() { const o = {}; Object.keys(X.S).forEach((k) => { if (!LOCAL.includes(k)) o[k] = X.S[k]; }); return o; }
  function merge(local, remote, remoteNewer) {
    const W = remoteNewer ? remote : local, O = remoteNewer ? local : remote; const out = Object.assign({}, O, W);
    MAPS.forEach((k) => {
      const a = O[k] || {}, b = W[k] || {}; const m = Object.assign({}, a);
      Object.keys(b).forEach((x) => { m[x] = b[x] && a[x] && typeof b[x] === 'object' && !Array.isArray(b[x]) && k !== 'dayEdit' ? Object.assign({}, a[x], b[x]) : b[x]; });
      out[k] = m;
    });
    return out;
  }
  function applyRemote(obj) {
    const keep = {}; LOCAL.forEach((k) => { if (k in X.S) keep[k] = X.S[k]; });
    Object.keys(X.S).forEach((k) => { if (!LOCAL.includes(k)) delete X.S[k]; });
    Object.assign(X.S, obj, keep);
    X.saveQuiet(); X.reload();
  }
  function devName() { const u = navigator.userAgent; return window.NexoNative ? '📱 Android' : /iPhone|iPad/.test(u) ? '📱 iPhone' : /Android/.test(u) ? '📱 Android (web)' : '💻 PC'; }

  // ---------- sincronizar ----------
  async function sync(why) {
    if (!FB || !L.id || !key || busy) return; busy = true;
    try {
      const rem = await getDoc(); const lt = X.S._t || 0;
      if (rem && rem.d && rem.t > (L.seen || 0)) {
        const robj = await open(rem.d);
        const m = merge(payload(), robj, why === 'join' || rem.t >= lt); applyRemote(m); L.seen = rem.t; // al unirse, gana la nube
      }
      if (!rem || (X.S._t || 0) > (L.seen || 0) || why === 'join-new' || why === 'join') {
        const S = X.S; S.devices = S.devices || {}; S.devices[L.dev] = { n: devName(), t: Date.now() };
        const t = Date.now(); await putDoc(await seal(payload()), t); L.seen = t; X.S._t = t; X.saveQuiet();
      }
      L.last = Date.now(); status = 'ok'; saveL();
    } catch (e) { status = /OperationError|decrypt/i.test(String(e && e.name)) ? 'clave' : 'red'; console.warn('sync', e); }
    busy = false;
    if (X.tab === 'yo') X.render();
  }
  function later() { if (!L.id) return; clearTimeout(timer); timer = setTimeout(() => sync('save'), 4000); }

  async function link(code, clave, isNew) {
    L.code = code; L.id = await docId(code); key = await deriveKey(code, clave);
    if (!isNew) { const rem = await getDoc(); if (!rem) { L.id = null; key = null; saveL(); throw new Error('nocode'); } try { await open(rem.d); } catch (e) { L.id = null; key = null; saveL(); throw new Error('clave'); } }
    L.k = clave; saveL(); // la clave se queda guardada solo en este dispositivo para no pedirla cada vez
    await sync(isNew ? 'join-new' : 'join');
  }
  function unlink() { ['id', 'code', 'k', 'seen', 'last', 'tok', 'ref', 'exp'].forEach((k) => delete L[k]); key = null; saveL(); }

  // ---------- pantalla en Progreso ----------
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'ahora' : m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : 'hace ' + Math.round(m / 1440) + ' d'; };
  X.hooks.yo.push(() => {
    let h = '<div class="sec">☁️ Sincronizar tus dispositivos</div><div class="card">';
    if (!FB) return h + '<div class="muted">Se activa cuando conectemos tu proyecto de Firebase. Mientras tanto usa Copia de seguridad (Exportar → Importar).</div></div>';
    if (!L.id) {
      h += '<div class="muted" style="margin-bottom:8px">Con tu <b>Código NEXO</b> y tu clave, tu Android, tu iPhone y tu PC tienen la misma información. Va cifrada: nadie más la puede leer.</div>';
      h += '<div class="row2"><button class="btn cy sm" data-sy="new">Crear mi Código NEXO</button><button class="btn alt sm" data-sy="join">Ya tengo un código</button></div></div>';
      return h;
    }
    const D = (X.S.devices || {});
    h += '<div class="set-row"><span>' + (status === 'red' ? '🟠 <b>Sin conexión</b>' : status === 'clave' ? '🔴 <b>La clave no coincide</b>' : '🟢 <b>Sincronizado</b>') + '<br><span class="muted">' + (L.last ? ago(L.last) : 'todavía no') + '</span></span><button class="chipbtn" data-sy="now">Sincronizar ahora</button></div>';
    h += '<div class="set-row"><span>Tu código<br><b style="letter-spacing:1px">' + esc(L.code) + '</b></span><button class="chipbtn" data-sy="share">Compartir</button></div>';
    Object.keys(D).sort((a, b) => D[b].t - D[a].t).forEach((k) => { h += '<div class="set-row"><span>' + esc(D[k].n) + '</span><span class="' + (k === L.dev ? 'ok' : 'muted') + '">' + (k === L.dev ? 'este' : ago(D[k].t)) + '</span></div>'; });
    h += '<div class="muted" style="margin-top:6px">Marcas, metas, tareas, horario y perfil llegan a todos. Sin internet sigue funcionando y sube los cambios cuando vuelva la señal.</div><button class="chipbtn" data-sy="out" style="margin-top:8px">Desconectar este dispositivo</button></div>';
    return h;
  });
  function form(isNew) {
    const code = isNew ? newCode() : '';
    X.openSheet('<div class="det"><h2>☁️ ' + (isNew ? 'Tu Código NEXO' : 'Entrar con tu código') + '</h2>' +
      (isNew ? '<div class="box">Tu código es <strong style="font-size:17px;letter-spacing:1px">' + code + '</strong><br>Anótalo: lo escribes en tu iPhone y en tu PC.</div>' : '<div class="f">CÓDIGO NEXO</div><input id="syC" placeholder="NX-XXXX-XXXX-XXXX" autocapitalize="characters">') +
      '<div class="f">' + (isNew ? 'CREA UNA CLAVE (MÍNIMO 6 LETRAS O NÚMEROS)' : 'TU CLAVE') + '</div><input id="syK" type="password" autocomplete="new-password">' +
      (isNew ? '<div class="f">REPITE LA CLAVE</div><input id="syK2" type="password" autocomplete="new-password"><p class="muted" style="margin-top:8px">⚠️ Guarda la clave en un lugar seguro. Si la olvidas, nadie puede abrir tus datos de la nube (ni yo). Lo de este celular no se pierde.</p>' : '<p class="muted" style="margin-top:8px">Lo que tengas en este dispositivo se une con lo de la nube.</p>') +
      '<button class="btn" data-sgo="1">' + (isNew ? 'Crear y subir mis datos' : 'Entrar') + '</button></div>');
    $('#sheet').onclick = async (e) => {
      const b = e.target.closest('[data-sgo]'); if (!b || b.dataset.busy) return;
      const k = $('#syK').value; const c = isNew ? code : $('#syC').value.trim();
      if (!isNew && normCode(c).length < 14) { X.toast('Escribe el código completo'); return; }
      if (k.length < 6) { X.toast('La clave debe tener mínimo 6 letras o números'); return; }
      if (isNew && k !== $('#syK2').value) { X.toast('Las claves no son iguales'); return; }
      b.dataset.busy = '1'; b.textContent = 'Conectando…';
      try { await link(c, k, isNew); X.closeSheet(); X.render(); X.toast(isNew ? '☁️ Listo: tus datos ya están en la nube' : '☁️ Listo: este dispositivo ya tiene tu información', 4000); }
      catch (er) { delete b.dataset.busy; b.textContent = isNew ? 'Crear y subir mis datos' : 'Entrar'; X.toast(er.message === 'clave' ? 'La clave no es correcta' : er.message === 'nocode' ? 'Ese código no existe todavía' : 'No pude conectar. Revisa el internet.', 4000); }
    };
  }
  X.hooks.yoClick.push((e) => {
    const b = e.target.closest('[data-sy]'); if (!b) return false; const a = b.dataset.sy;
    if (a === 'new') form(true); if (a === 'join') form(false);
    if (a === 'now') { status = ''; sync('manual'); X.toast('Sincronizando…'); }
    if (a === 'share') { const t = 'Mi Código NEXO: ' + L.code; if (X.N && X.N.shareText) X.N.shareText(t); else if (navigator.share) navigator.share({ text: t }).catch(() => {}); else { navigator.clipboard && navigator.clipboard.writeText(L.code); X.toast('Código copiado'); } }
    if (a === 'out') { if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '¿Seguro? Tus datos se quedan aquí y en la nube'; return true; } unlink(); X.render(); X.toast('Este dispositivo ya no sincroniza'); }
    return true;
  });

  // ---------- cuándo sincroniza ----------
  X.hooks.saved.push(later);
  X.hooks.resume.push(() => sync('resume'));
  X.hooks.boot.push(async () => { if (FB && L.id && L.k) { try { key = await deriveKey(L.code, L.k); sync('boot'); } catch (e) {} } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync('visible'); });
  setInterval(() => { if (!document.hidden) sync('tick'); }, 60000);

  window.SYNC = { sync, link, unlink, merge, docId, newCode, get state() { return L; } };
})();
