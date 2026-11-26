/* NEXO PLAN ↔ Supabase (red NEXO).
   Con la misma cuenta de Google de la red NEXO:
   1) Tu NEXO PLAN completo se sincroniza entre Android, iPhone y PC, en tiempo real.
   2) El resumen del plan sube a la nube para que Harvey (y Claude) lo lean desde cualquier dispositivo.
   3) Lo que Harvey te manda (reorganizar un día, tareas) llega aquí aunque lo haya pedido desde otro dispositivo.
   Solo en la versión web (nexopc.github.io): comparte la sesión con las apps de la red. */
(function () {
  'use strict';
  const X = window.NP;
  const URL = 'https://tfdxuqvsqdrvbgujooya.supabase.co';
  const KEY = 'sb_publishable_QZE-PJSRxAnaymQ03ephDg_wm6V4mUy'; // pública por diseño; RLS protege los datos
  const LOCAL = ['appUpd', 'seenVersion', 'welcomed', 'lastCheck', 'lastLoc', 'remote'];
  let sb = null, user = null, pushT = 0, applying = false;

  const clean = (S) => { const o = {}; Object.keys(S).forEach((k) => { if (!LOCAL.includes(k)) o[k] = S[k]; }); return o; };

  async function client() {
    if (sb) return sb;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return null; // APK / archivo local
    const { createClient } = await import('../vendor/supabase/supabase.js');
    sb = createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
    return sb;
  }

  // ---------- 1) Estado completo de NEXO PLAN ----------
  function applyRemote(data) {
    if (!data || !(data._t > (X.S._t || 0))) return false;
    applying = true;
    Object.keys(data).forEach((k) => { if (!LOCAL.includes(k)) X.S[k] = data[k]; });
    X.saveQuiet(); X.reload();
    applying = false;
    X.toast('☁️ Plan actualizado desde otro dispositivo', 2500);
    return true;
  }
  async function pushState() {
    if (!sb || !user || applying) return;
    const now = new Date().toISOString();
    const { error } = await sb.from('registros').upsert({ coleccion: 'nexoplan', id: 'estado', app: 'plan', data: clean(X.S), borrado: false, updated_at: now }, { onConflict: 'user_id,coleccion,id' });
    if (error) console.warn('nube', error.message);
  }
  async function pullState() {
    const { data } = await sb.from('registros').select('data').eq('coleccion', 'nexoplan').eq('id', 'estado').maybeSingle();
    if (data && data.data && data.data._t > (X.S._t || 0)) applyRemote(data.data);
    else if (!data || !data.data || (X.S._t || 0) > (data.data._t || 0)) pushState();
  }

  // ---------- 2) Resumen para Harvey ----------
  async function pushBridge() {
    if (!sb || !user) return;
    let rec; try { rec = JSON.parse(localStorage.getItem('nexo:data:planBridge') || '[]')[0]; } catch (e) { rec = null; }
    if (!rec) return;
    await sb.from('registros').upsert({ coleccion: 'planBridge', id: 'nexo-plan', app: 'plan', data: rec, borrado: false, updated_at: rec.updatedAt || new Date().toISOString() }, { onConflict: 'user_id,coleccion,id' });
  }

  // ---------- 3) Buzón de Harvey ----------
  async function pullInbox() {
    const { data } = await sb.from('registros').select('id,data').eq('coleccion', 'planInbox').eq('borrado', false);
    if (!data || !data.length) return;
    const n = window.NEXO_BRIDGE ? window.NEXO_BRIDGE.apply(data.map((r) => r.data)) : 0;
    const ids = data.map((r) => r.id);
    // marcar como leídos (borrado suave) en la nube y en NEXO Brain local
    await sb.from('registros').update({ borrado: true, updated_at: new Date().toISOString() }).eq('coleccion', 'planInbox').in('id', ids);
    try {
      const k = 'nexo:data:planInbox'; const arr = JSON.parse(localStorage.getItem(k) || '[]');
      localStorage.setItem(k, JSON.stringify(arr.map((r) => (ids.includes(r.id) ? Object.assign({}, r, { _deleted: true }) : r))));
    } catch (e) {}
    if (n) X.toast('🟣 Harvey actualizó tu plan (' + n + ')', 3500);
  }

  async function start() {
    try {
      await pullState();
      await pullInbox();
      await pushBridge();
      sb.channel('plan-' + user.id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registros', filter: 'user_id=eq.' + user.id }, (p) => {
          const r = p.new; if (!r) return;
          if (r.coleccion === 'nexoplan' && r.id === 'estado') applyRemote(r.data);
          if (r.coleccion === 'planInbox' && !r.borrado) pullInbox();
        })
        .subscribe();
    } catch (e) { console.warn('nube', e); }
  }

  X.hooks.saved.push(() => { if (applying) return; clearTimeout(pushT); pushT = setTimeout(() => { pushState(); pushBridge(); }, 1200); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && user) { pullState(); pullInbox(); } });

  // Tarjeta en Progreso: estado de la nube y entrar con Google
  X.hooks.yo.push(() => '<div class="sec">Red NEXO</div><div class="card" id="nubeCard"><b>' + (user ? '☁️ Conectado: ' + X.esc(user.email || '') : '☁️ Entra con Google') + '</b><p class="muted" style="margin-top:4px">' +
    (user ? 'Tu plan se sincroniza con tus otros dispositivos y Harvey lo lee desde cualquier app NEXO.' : 'Con la misma cuenta de la red NEXO: tu plan en todos tus dispositivos y conectado a Harvey.') + '</p>' +
    (user ? '' : '<button class="btn sm" data-nube-in="1">Entrar con Google</button>') + '</div>');
  X.hooks.yoClick.push((e) => {
    if (!e.target.closest('[data-nube-in]')) return false;
    client().then((c) => c && c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } }));
    return true;
  });

  X.hooks.boot.push(async () => {
    const c = await client(); if (!c) return;
    c.auth.onAuthStateChange((_e, s) => { const u = s && s.user; if (u && (!user || user.id !== u.id)) { user = u; start(); } if (!u) user = null; });
    const { data } = await c.auth.getSession();
    if (data.session && !user) { user = data.session.user; start(); }
  });
  window.NEXO_NUBE = { token: async () => { const c = await client(); if (!c) return null; const { data } = await c.auth.getSession(); return data.session ? data.session.access_token : null; } };
})();
