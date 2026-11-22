// Horario semanal de Cristóbal. d: 1=Lunes … 7=Domingo
window.CATS = {
  ejercicio: { n: 'Ejercicio',  tag: 'EJERCICIO', color: '#ff5252', check: true,  notif: true },
  app:       { n: 'App Web',    tag: 'APP WEB',   color: '#00e5ff', check: true,  notif: true, project: 'app' },
  video:     { n: 'Edición de video', tag: 'VIDEO', color: '#7c4dff', check: true, notif: true, project: 'video' },
  agencia:   { n: 'Agencia de marketing', tag: 'AGENCIA', color: '#ff4081', check: true, notif: true, project: 'agencia' },
  nexo:      { n: 'NEXO PC',    tag: 'NEXO PC',   color: '#00e676', check: true,  notif: true, project: 'nexo' },
  creador:   { n: 'Creador de contenido', tag: 'CREADOR', color: '#ff6e40', check: true, notif: true, project: 'creador' },
  cliente:   { n: 'Video de cliente', tag: 'CLIENTE', color: '#e040fb', check: true, notif: true, project: 'video' },
  ingles:    { n: 'Inglés',     tag: 'INGLÉS',    color: '#26c6da', check: true,  notif: true, project: 'habitos' },
  tareas:    { n: 'Tareas del colegio', tag: 'COLEGIO', color: '#66bb6a', check: true, notif: true },
  trabajo:   { n: 'Trabajo tienda', tag: 'TRABAJO', color: '#90a4ae', check: true, notif: true },
  colegio:   { n: 'Colegio',    tag: 'CLASES',    color: '#8a94ad', check: true,  notif: false },
  dormir:    { n: 'Prepararme para dormir', tag: 'HÁBITOS', color: '#ffab00', check: true, notif: true, project: 'habitos' },
  rutina:    { n: 'Rutina',     tag: '',          color: '#4a5570', check: false, notif: false },
  libre:     { n: 'Libre',      tag: 'LIBRE',     color: '#c6ff00', check: false, notif: false },
  ocupado:   { n: 'Ocupado',    tag: '',          color: '#4a5570', check: false, notif: false },
  // solo para avisos (no son bloques)
  clase:     { n: 'Clases del colegio (al entrar)', color: '#8a94ad', check: false, notif: true, toggle: true },
  tarea:     { n: 'Tareas y exámenes (recordatorios)', color: '#ff5252', check: false, notif: true, toggle: true },
  viaje:     { n: 'Plan de viaje (2 avisos al día)', color: '#ffab00', check: false, notif: true, toggle: true }
};

(function () {
  const H = [];
  const add = (d, s, e, cat, title) => H.push({ d, s, e, cat, title });
  const clases = {
    1: [['07:30','08:30','Inglés'],['08:30','09:30','Sociales / Filosofía'],['09:30','10:30','Naturales'],['10:30','11:00','Descanso'],['11:00','12:00','Matemáticas'],['12:00','13:00','Español']],
    2: [['07:00','07:50','Física'],['07:50','08:40','Inglés'],['08:40','09:30','Sociales'],['09:30','10:20','Filosofía'],['10:20','10:50','Descanso'],['10:50','11:40','Informática'],['11:40','12:30','Educación física'],['12:30','13:20','Español']],
    3: [['07:00','07:50','Física'],['07:50','08:40','Música'],['08:40','09:30','Matemáticas'],['09:30','10:20','Danza'],['10:20','10:50','Descanso'],['10:50','11:40','Economía y política'],['11:40','12:30','Química'],['12:30','13:20','Inglés']],
    4: [['07:00','07:50','Español'],['07:50','08:40','Matemáticas'],['08:40','09:30','Naturales'],['09:30','10:20','Inglés'],['10:20','10:50','Descanso'],['10:50','11:40','Filosofía'],['11:40','12:30','Artística'],['12:30','13:20','Cátedra']],
    5: [['07:00','07:50','Matemáticas'],['07:50','08:40','Estadística'],['08:40','09:30','Español'],['09:30','10:20','Ética y valores'],['10:20','10:50','Descanso'],['10:50','11:40','Química'],['11:40','12:30','Física'],['12:30','13:20','Inglés']]
  };
  window.CLASES = clases;

  // LUNES
  add(1,'05:00','05:30','ejercicio','Ejercicio');
  add(1,'05:30','06:30','app','App Web');
  add(1,'06:30','07:30','rutina','Aseo, desayuno y traslado');
  add(1,'07:30','13:00','colegio','Colegio');
  add(1,'13:00','14:30','tareas','Tareas del colegio');
  add(1,'14:30','15:00','rutina','Traslado');
  add(1,'15:00','17:00','ingles','Inglés (almuerzo en clase)');
  add(1,'17:00','19:00','app','App Web');
  add(1,'19:00','19:30','rutina','Cena');
  add(1,'19:30','20:30','agencia','Agencia de marketing');
  add(1,'20:30','21:00','dormir','Prepararme para dormir');
  // MARTES
  add(2,'05:00','05:30','ejercicio','Ejercicio');
  add(2,'05:30','06:00','app','App Web (30 min)');
  add(2,'06:00','07:00','rutina','Aseo, desayuno y traslado');
  add(2,'07:00','13:20','colegio','Colegio');
  add(2,'13:20','14:30','app','App Web: wireframes en papel');
  add(2,'14:30','15:00','rutina','Traslado');
  add(2,'15:00','15:30','rutina','Almuerzo');
  add(2,'15:30','18:30','trabajo','Trabajo tienda');
  add(2,'18:30','19:00','rutina','Cena');
  add(2,'19:00','20:30','nexo','NEXO PC');
  add(2,'20:30','21:00','dormir','Prepararme para dormir');
  // MIÉRCOLES
  add(3,'05:00','05:30','ejercicio','Ejercicio');
  add(3,'05:30','06:00','app','App Web (30 min)');
  add(3,'06:00','07:00','rutina','Aseo, desayuno y traslado');
  add(3,'07:00','13:20','colegio','Colegio');
  add(3,'13:20','14:30','tareas','Tareas del colegio');
  add(3,'14:30','15:00','rutina','Traslado');
  add(3,'15:00','17:00','ingles','Inglés (almuerzo en clase)');
  add(3,'17:00','19:00','app','App Web');
  add(3,'19:00','19:30','rutina','Cena');
  add(3,'19:30','20:30','agencia','Agencia de marketing');
  add(3,'20:30','21:00','dormir','Prepararme para dormir');
  // JUEVES
  add(4,'05:00','05:30','ejercicio','Ejercicio');
  add(4,'05:30','06:00','app','App Web (30 min)');
  add(4,'06:00','07:00','rutina','Aseo, desayuno y traslado');
  add(4,'07:00','13:20','colegio','Colegio');
  add(4,'13:20','14:30','video','Edición: tutoriales de Filmora (celular)');
  add(4,'14:30','15:00','rutina','Traslado');
  add(4,'15:00','15:30','rutina','Almuerzo');
  add(4,'15:30','18:30','trabajo','Trabajo tienda');
  add(4,'18:30','19:00','rutina','Cena');
  add(4,'19:00','20:30','video','Edición de video (Filmora)');
  add(4,'20:30','21:00','dormir','Prepararme para dormir');
  // VIERNES
  add(5,'05:00','05:30','ejercicio','Ejercicio');
  add(5,'05:30','06:00','app','App Web (30 min)');
  add(5,'06:00','07:00','rutina','Aseo, desayuno y traslado');
  add(5,'07:00','13:20','colegio','Colegio');
  add(5,'13:20','14:30','agencia','Marketing: guiones de reel');
  add(5,'14:30','15:00','rutina','Traslado');
  add(5,'15:00','17:00','ingles','Inglés (almuerzo en clase)');
  add(5,'17:00','19:00','video','Edición de video (Filmora)');
  add(5,'19:00','19:30','rutina','Cena');
  add(5,'19:30','20:30','nexo','NEXO PC');
  add(5,'20:30','21:00','dormir','Prepararme para dormir');
  // SÁBADO
  add(6,'05:00','05:30','ejercicio','Ejercicio');
  add(6,'05:30','07:00','app','App Web');
  add(6,'07:00','07:30','rutina','Desayuno');
  add(6,'07:30','08:00','rutina','Arreglarme');
  add(6,'08:00','12:00','trabajo','Trabajo tienda');
  add(6,'12:00','12:30','rutina','Almuerzo');
  add(6,'12:30','13:00','libre','Libre');
  add(6,'13:00','16:00','cliente','Video cliente 1 (grabar + editar)');
  add(6,'16:00','17:30','ingles','Taller de inglés');
  add(6,'17:30','19:00','libre','Libre');
  add(6,'19:00','19:30','rutina','Cena');
  add(6,'19:30','20:30','libre','Libre');
  add(6,'20:30','21:00','dormir','Prepararme para dormir');
  // DOMINGO
  add(7,'05:00','05:30','ejercicio','Ejercicio');
  add(7,'05:30','06:00','rutina','Arreglarme');
  add(7,'06:00','06:30','rutina','Desayuno');
  add(7,'06:30','08:00','libre','Libre');
  add(7,'08:00','11:00','cliente','Video cliente 2 (grabar + editar)');
  add(7,'11:00','12:00','app','App Web');
  add(7,'12:00','13:30','video','Edición de video (Filmora)');
  add(7,'13:30','14:00','rutina','Almuerzo');
  add(7,'14:00','19:00','ocupado','Ocupado');
  add(7,'19:00','19:30','rutina','Cena');
  add(7,'19:30','20:30','agencia','Agencia de marketing');
  add(7,'20:30','21:00','dormir','Prepararme para dormir · revisión semanal');

  // índice de “slot” por categoría (orden de la semana) para asignar el tema de cada semana
  const cnt = {};
  H.forEach(b => { cnt[b.cat] = (cnt[b.cat] || 0); b.slot = cnt[b.cat]++; b.id = b.d + '-' + b.s; });
  window.HORARIO = H;

  // ---------- Vacaciones: ciclo de 2 semanas (A = enfoque, B = variedad) ----------
  // máximo 4 bloques de trabajo al día y tardes libres desde las 5 pm
  const V = { A: [], B: [] };
  const v = (k, d, s, e, cat, title) => V[k].push({ d, s, e, cat, title });
  const base = (k, d, m1, m2, t1, t2) => { // m1: 6:30–8:30 · m2: 9–11 · t1: 2–3 pm · t2: 3–5 pm
    v(k, d, '05:00', '05:30', 'ejercicio', 'Ejercicio');
    v(k, d, '05:30', '06:30', 'rutina', 'Aseo y desayuno');
    v(k, d, '06:30', '08:30', m1[0], m1[1]);
    v(k, d, '08:30', '09:00', 'rutina', 'Descanso');
    v(k, d, '09:00', '11:00', m2[0], m2[1]);
    v(k, d, '11:00', '12:00', 'libre', 'Libre');
    v(k, d, '12:00', '13:00', 'rutina', 'Almuerzo');
    v(k, d, '13:00', '14:00', 'libre', 'Libre');
    v(k, d, '14:00', '15:00', t1[0], t1[1]);
    v(k, d, '15:00', '17:00', t2[0], t2[1]);
    v(k, d, '17:00', '19:00', 'libre', 'Libre');
    v(k, d, '19:00', '19:30', 'rutina', 'Cena');
    v(k, d, '19:30', '20:30', 'libre', 'Libre');
    v(k, d, '20:30', '21:00', 'dormir', 'Prepararme para dormir');
  };
  const APP = ['app', 'App Web'], VID = ['video', 'Edición de video (Filmora)'], CRE = ['creador', 'Creador de contenido'], AGE = ['agencia', 'Agencia de marketing'],
    ING = ['ingles', 'Inglés (curso)'], NEX = ['nexo', 'NEXO PC'], LIB = ['libre', 'Libre'];
  // Semana A
  base('A', 1, APP, VID, AGE, ING); base('A', 2, APP, CRE, LIB, NEX); base('A', 3, APP, VID, AGE, ING); base('A', 4, APP, CRE, LIB, NEX); base('A', 5, APP, VID, AGE, ING);
  // Semana B
  base('B', 1, CRE, APP, AGE, ING); base('B', 2, APP, NEX, LIB, VID); base('B', 3, VID, APP, AGE, ING); base('B', 4, APP, CRE, LIB, NEX); base('B', 5, APP, ['libre', 'Libre (mañana corta)'], AGE, ING);
  // sábados
  ['A', 'B'].forEach((k) => {
    v(k, 6, '05:00', '05:30', 'ejercicio', 'Ejercicio');
    if (k === 'A') { v(k, 6, '05:30', '07:00', 'app', 'App Web'); v(k, 6, '07:00', '08:00', 'rutina', 'Desayuno'); v(k, 6, '08:00', '10:00', 'creador', 'Creador: grabar con luz de día'); v(k, 6, '10:00', '12:00', 'libre', 'Libre'); }
    else v(k, 6, '05:30', '12:00', 'libre', 'Mañana de descanso');
    v(k, 6, '12:00', '13:00', 'rutina', 'Almuerzo');
    v(k, 6, '13:00', '16:00', 'cliente', 'Video de cliente (grabar + editar)');
    v(k, 6, '16:00', '17:30', 'ingles', 'Taller de inglés');
    v(k, 6, '17:30', '19:00', 'libre', 'Libre');
    v(k, 6, '19:00', '19:30', 'rutina', 'Cena');
    v(k, 6, '19:30', '20:30', 'libre', 'Libre');
    v(k, 6, '20:30', '21:00', 'dormir', 'Prepararme para dormir');
    // domingo: igual al de clases
    H.filter((b) => b.d === 7).forEach((b) => v(k, 7, b.s, b.e, b.cat, b.title));
  });
  window.HORARIO_VAC = V;
})();
