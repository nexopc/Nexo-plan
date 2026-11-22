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

  // ---------- Vacaciones: ciclo de 4 semanas (12 h de trabajo, 4 de descanso y 8 de sueño cada día) ----------
  // [día, inicio, fin, tipo, nombre] · día 1 = lunes
  const V4 = {"1":{"n":"Semana 1 · Enfoque App Web","d":"App Web todas las mañanas y en la tarde: es tu meta de 6 meses.","b":[[1,"05:00","05:30","ejercicio","Ejercicio"],
    [1,"05:30","06:00","rutina","Aseo y desayuno"],
    [1,"06:00","08:00","app","App Web"],
    [1,"08:00","08:15","libre","Pausa"],
    [1,"08:15","10:15","video","Edición (Filmora)"],
    [1,"10:15","10:30","libre","Pausa"],
    [1,"10:30","12:00","agencia","Agencia"],
    [1,"12:00","13:00","rutina","Almuerzo y descanso"],
    [1,"13:00","15:00","app","App Web: práctica"],
    [1,"15:00","17:00","ingles","Inglés (clase)"],
    [1,"17:00","17:30","libre","Pausa y merienda"],
    [1,"17:30","19:00","nexo","NEXO PC"],
    [1,"19:00","19:30","rutina","Cena"],
    [1,"19:30","20:00","libre","Libre"],
    [1,"20:00","20:30","ingles","Inglés: Anki"],
    [1,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [2,"05:00","05:30","ejercicio","Ejercicio"],
    [2,"05:30","06:00","rutina","Aseo y desayuno"],
    [2,"06:00","08:00","app","App Web"],
    [2,"08:00","08:15","libre","Pausa"],
    [2,"08:15","10:15","creador","Creador: grabar"],
    [2,"10:15","10:30","libre","Pausa"],
    [2,"10:30","12:00","nexo","NEXO PC"],
    [2,"12:00","13:00","rutina","Almuerzo y descanso"],
    [2,"13:00","15:00","video","Edición (Filmora)"],
    [2,"15:00","17:00","app","App Web: práctica"],
    [2,"17:00","17:30","libre","Pausa y merienda"],
    [2,"17:30","19:00","agencia","Agencia"],
    [2,"19:00","19:30","rutina","Cena"],
    [2,"19:30","20:00","libre","Libre"],
    [2,"20:00","20:30","ingles","Inglés: Anki"],
    [2,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [3,"05:00","05:30","ejercicio","Ejercicio"],
    [3,"05:30","06:00","rutina","Aseo y desayuno"],
    [3,"06:00","08:00","app","App Web"],
    [3,"08:00","08:15","libre","Pausa"],
    [3,"08:15","10:15","video","Edición (Filmora)"],
    [3,"10:15","10:30","libre","Pausa"],
    [3,"10:30","12:00","agencia","Agencia"],
    [3,"12:00","13:00","rutina","Almuerzo y descanso"],
    [3,"13:00","15:00","creador","Creador: editar"],
    [3,"15:00","17:00","ingles","Inglés (clase)"],
    [3,"17:00","17:30","libre","Pausa y merienda"],
    [3,"17:30","19:00","app","App Web"],
    [3,"19:00","19:30","rutina","Cena"],
    [3,"19:30","20:00","libre","Libre"],
    [3,"20:00","20:30","ingles","Inglés: Anki"],
    [3,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [4,"05:00","05:30","ejercicio","Ejercicio"],
    [4,"05:30","06:00","rutina","Aseo y desayuno"],
    [4,"06:00","08:00","app","App Web"],
    [4,"08:00","08:15","libre","Pausa"],
    [4,"08:15","10:15","creador","Creador: grabar"],
    [4,"10:15","10:30","libre","Pausa"],
    [4,"10:30","12:00","nexo","NEXO PC"],
    [4,"12:00","13:00","rutina","Almuerzo y descanso"],
    [4,"13:00","15:00","video","Edición (Filmora)"],
    [4,"15:00","17:00","app","App Web: práctica"],
    [4,"17:00","17:30","libre","Pausa y merienda"],
    [4,"17:30","19:00","agencia","Agencia"],
    [4,"19:00","19:30","rutina","Cena"],
    [4,"19:30","20:00","libre","Libre"],
    [4,"20:00","20:30","ingles","Inglés: Anki"],
    [4,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [5,"05:00","05:30","ejercicio","Ejercicio"],
    [5,"05:30","06:00","rutina","Aseo y desayuno"],
    [5,"06:00","08:00","app","App Web"],
    [5,"08:00","08:15","libre","Pausa"],
    [5,"08:15","10:15","video","Edición (Filmora)"],
    [5,"10:15","10:30","libre","Pausa"],
    [5,"10:30","12:00","nexo","NEXO PC"],
    [5,"12:00","13:00","rutina","Almuerzo y descanso"],
    [5,"13:00","15:00","creador","Creador: publicar"],
    [5,"15:00","17:00","ingles","Inglés (clase)"],
    [5,"17:00","17:30","libre","Pausa y merienda"],
    [5,"17:30","19:00","agencia","Agencia"],
    [5,"19:00","19:30","rutina","Cena"],
    [5,"19:30","20:00","libre","Libre"],
    [5,"20:00","20:30","ingles","Inglés: Anki"],
    [5,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [6,"05:00","05:30","ejercicio","Ejercicio"],
    [6,"05:30","06:00","rutina","Aseo y desayuno"],
    [6,"06:00","08:00","creador","Creador: grabar"],
    [6,"08:00","08:15","libre","Pausa"],
    [6,"08:15","10:15","app","App Web"],
    [6,"10:15","10:30","libre","Pausa"],
    [6,"10:30","12:00","video","Edición (Filmora)"],
    [6,"12:00","13:00","rutina","Almuerzo y descanso"],
    [6,"13:00","16:00","cliente","Video de cliente"],
    [6,"16:00","16:30","libre","Pausa"],
    [6,"16:30","19:00","nexo","NEXO PC"],
    [6,"19:00","19:30","rutina","Cena"],
    [6,"19:30","20:00","libre","Libre"],
    [6,"20:00","20:30","ingles","Inglés: Anki"],
    [6,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [7,"05:00","05:30","ejercicio","Ejercicio suave"],
    [7,"05:30","06:00","rutina","Aseo y desayuno"],
    [7,"06:00","08:00","app","App Web"],
    [7,"08:00","11:00","cliente","Video de cliente"],
    [7,"11:00","11:30","libre","Pausa"],
    [7,"11:30","12:30","creador","Creador: ideas y guiones"],
    [7,"12:30","13:30","rutina","Almuerzo y descanso"],
    [7,"13:30","15:30","video","Edición (Filmora)"],
    [7,"15:30","16:00","libre","Pausa"],
    [7,"16:00","17:30","agencia","Agencia: plan de la semana"],
    [7,"17:30","18:00","ingles","Inglés: Anki"],
    [7,"18:00","18:30","libre","Libre"],
    [7,"18:30","19:00","rutina","Cena"],
    [7,"19:00","20:30","nexo","Revisión semanal y plan"],
    [7,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"]]},"2":{"n":"Semana 2 · Cámara y edición","d":"Más Creador y Filmora: grabas con luz de mañana y editas en la tarde.","b":[[1,"05:00","05:30","ejercicio","Ejercicio"],
    [1,"05:30","06:00","rutina","Aseo y desayuno"],
    [1,"06:00","08:00","creador","Creador: grabar"],
    [1,"08:00","08:15","libre","Pausa"],
    [1,"08:15","10:15","video","Edición (Filmora)"],
    [1,"10:15","10:30","libre","Pausa"],
    [1,"10:30","12:00","agencia","Agencia"],
    [1,"12:00","13:00","rutina","Almuerzo y descanso"],
    [1,"13:00","15:00","app","App Web"],
    [1,"15:00","17:00","ingles","Inglés (clase)"],
    [1,"17:00","17:30","libre","Pausa y merienda"],
    [1,"17:30","19:00","creador","Creador: editar"],
    [1,"19:00","19:30","rutina","Cena"],
    [1,"19:30","20:00","libre","Libre"],
    [1,"20:00","20:30","ingles","Inglés: Anki"],
    [1,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [2,"05:00","05:30","ejercicio","Ejercicio"],
    [2,"05:30","06:00","rutina","Aseo y desayuno"],
    [2,"06:00","08:00","app","App Web"],
    [2,"08:00","08:15","libre","Pausa"],
    [2,"08:15","10:15","video","Edición (Filmora)"],
    [2,"10:15","10:30","libre","Pausa"],
    [2,"10:30","12:00","nexo","NEXO PC"],
    [2,"12:00","13:00","rutina","Almuerzo y descanso"],
    [2,"13:00","15:00","creador","Creador: editar"],
    [2,"15:00","17:00","creador","Creador: guiones"],
    [2,"17:00","17:30","libre","Pausa y merienda"],
    [2,"17:30","19:00","agencia","Agencia"],
    [2,"19:00","19:30","rutina","Cena"],
    [2,"19:30","20:00","libre","Libre"],
    [2,"20:00","20:30","ingles","Inglés: Anki"],
    [2,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [3,"05:00","05:30","ejercicio","Ejercicio"],
    [3,"05:30","06:00","rutina","Aseo y desayuno"],
    [3,"06:00","08:00","creador","Creador: grabar"],
    [3,"08:00","08:15","libre","Pausa"],
    [3,"08:15","10:15","video","Edición (Filmora)"],
    [3,"10:15","10:30","libre","Pausa"],
    [3,"10:30","12:00","agencia","Agencia"],
    [3,"12:00","13:00","rutina","Almuerzo y descanso"],
    [3,"13:00","15:00","app","App Web"],
    [3,"15:00","17:00","ingles","Inglés (clase)"],
    [3,"17:00","17:30","libre","Pausa y merienda"],
    [3,"17:30","19:00","nexo","NEXO PC"],
    [3,"19:00","19:30","rutina","Cena"],
    [3,"19:30","20:00","libre","Libre"],
    [3,"20:00","20:30","ingles","Inglés: Anki"],
    [3,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [4,"05:00","05:30","ejercicio","Ejercicio"],
    [4,"05:30","06:00","rutina","Aseo y desayuno"],
    [4,"06:00","08:00","app","App Web"],
    [4,"08:00","08:15","libre","Pausa"],
    [4,"08:15","10:15","video","Edición (Filmora)"],
    [4,"10:15","10:30","libre","Pausa"],
    [4,"10:30","12:00","creador","Creador: editar"],
    [4,"12:00","13:00","rutina","Almuerzo y descanso"],
    [4,"13:00","15:00","creador","Creador: publicar"],
    [4,"15:00","17:00","app","App Web: práctica"],
    [4,"17:00","17:30","libre","Pausa y merienda"],
    [4,"17:30","19:00","agencia","Agencia"],
    [4,"19:00","19:30","rutina","Cena"],
    [4,"19:30","20:00","libre","Libre"],
    [4,"20:00","20:30","ingles","Inglés: Anki"],
    [4,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [5,"05:00","05:30","ejercicio","Ejercicio"],
    [5,"05:30","06:00","rutina","Aseo y desayuno"],
    [5,"06:00","08:00","creador","Creador: grabar"],
    [5,"08:00","08:15","libre","Pausa"],
    [5,"08:15","10:15","video","Edición (Filmora)"],
    [5,"10:15","10:30","libre","Pausa"],
    [5,"10:30","12:00","nexo","NEXO PC"],
    [5,"12:00","13:00","rutina","Almuerzo y descanso"],
    [5,"13:00","15:00","app","App Web"],
    [5,"15:00","17:00","ingles","Inglés (clase)"],
    [5,"17:00","17:30","libre","Pausa y merienda"],
    [5,"17:30","19:00","creador","Creador: editar"],
    [5,"19:00","19:30","rutina","Cena"],
    [5,"19:30","20:00","libre","Libre"],
    [5,"20:00","20:30","ingles","Inglés: Anki"],
    [5,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [6,"05:00","05:30","ejercicio","Ejercicio"],
    [6,"05:30","06:00","rutina","Aseo y desayuno"],
    [6,"06:00","08:00","app","App Web"],
    [6,"08:00","08:15","libre","Pausa"],
    [6,"08:15","10:15","creador","Creador: grabar"],
    [6,"10:15","10:30","libre","Pausa"],
    [6,"10:30","12:00","nexo","NEXO PC"],
    [6,"12:00","13:00","rutina","Almuerzo y descanso"],
    [6,"13:00","16:00","cliente","Video de cliente"],
    [6,"16:00","16:30","libre","Pausa"],
    [6,"16:30","19:00","agencia","Agencia"],
    [6,"19:00","19:30","rutina","Cena"],
    [6,"19:30","20:00","libre","Libre"],
    [6,"20:00","20:30","ingles","Inglés: Anki"],
    [6,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [7,"05:00","05:30","ejercicio","Ejercicio suave"],
    [7,"05:30","06:00","rutina","Aseo y desayuno"],
    [7,"06:00","08:00","app","App Web"],
    [7,"08:00","11:00","cliente","Video de cliente"],
    [7,"11:00","11:30","libre","Pausa"],
    [7,"11:30","12:30","creador","Creador: ideas y guiones"],
    [7,"12:30","13:30","rutina","Almuerzo y descanso"],
    [7,"13:30","15:30","video","Edición (Filmora)"],
    [7,"15:30","16:00","libre","Pausa"],
    [7,"16:00","17:30","video","Edición: reel de la semana"],
    [7,"17:30","18:00","ingles","Inglés: Anki"],
    [7,"18:00","18:30","libre","Libre"],
    [7,"18:30","19:00","rutina","Cena"],
    [7,"19:00","20:30","nexo","Revisión semanal y plan"],
    [7,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"]]},"3":{"n":"Semana 3 · Negocio","d":"NEXO PC y Agencia: mercado, proveedores, visitas y propuestas a negocios.","b":[[1,"05:00","05:30","ejercicio","Ejercicio"],
    [1,"05:30","06:00","rutina","Aseo y desayuno"],
    [1,"06:00","08:00","app","App Web"],
    [1,"08:00","08:15","libre","Pausa"],
    [1,"08:15","10:15","nexo","NEXO PC: mercado"],
    [1,"10:15","10:30","libre","Pausa"],
    [1,"10:30","12:00","agencia","Agencia"],
    [1,"12:00","13:00","rutina","Almuerzo y descanso"],
    [1,"13:00","15:00","agencia","Agencia: visitar negocios"],
    [1,"15:00","17:00","ingles","Inglés (clase)"],
    [1,"17:00","17:30","libre","Pausa y merienda"],
    [1,"17:30","19:00","video","Edición (Filmora)"],
    [1,"19:00","19:30","rutina","Cena"],
    [1,"19:30","20:00","libre","Libre"],
    [1,"20:00","20:30","ingles","Inglés: Anki"],
    [1,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [2,"05:00","05:30","ejercicio","Ejercicio"],
    [2,"05:30","06:00","rutina","Aseo y desayuno"],
    [2,"06:00","08:00","app","App Web"],
    [2,"08:00","08:15","libre","Pausa"],
    [2,"08:15","10:15","agencia","Agencia: propuestas"],
    [2,"10:15","10:30","libre","Pausa"],
    [2,"10:30","12:00","nexo","NEXO PC"],
    [2,"12:00","13:00","rutina","Almuerzo y descanso"],
    [2,"13:00","15:00","nexo","NEXO PC: proveedores"],
    [2,"15:00","17:00","creador","Creador: grabar"],
    [2,"17:00","17:30","libre","Pausa y merienda"],
    [2,"17:30","19:00","video","Edición (Filmora)"],
    [2,"19:00","19:30","rutina","Cena"],
    [2,"19:30","20:00","libre","Libre"],
    [2,"20:00","20:30","ingles","Inglés: Anki"],
    [2,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [3,"05:00","05:30","ejercicio","Ejercicio"],
    [3,"05:30","06:00","rutina","Aseo y desayuno"],
    [3,"06:00","08:00","app","App Web"],
    [3,"08:00","08:15","libre","Pausa"],
    [3,"08:15","10:15","nexo","NEXO PC"],
    [3,"10:15","10:30","libre","Pausa"],
    [3,"10:30","12:00","agencia","Agencia"],
    [3,"12:00","13:00","rutina","Almuerzo y descanso"],
    [3,"13:00","15:00","video","Edición (Filmora)"],
    [3,"15:00","17:00","ingles","Inglés (clase)"],
    [3,"17:00","17:30","libre","Pausa y merienda"],
    [3,"17:30","19:00","creador","Creador: editar"],
    [3,"19:00","19:30","rutina","Cena"],
    [3,"19:30","20:00","libre","Libre"],
    [3,"20:00","20:30","ingles","Inglés: Anki"],
    [3,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [4,"05:00","05:30","ejercicio","Ejercicio"],
    [4,"05:30","06:00","rutina","Aseo y desayuno"],
    [4,"06:00","08:00","app","App Web"],
    [4,"08:00","08:15","libre","Pausa"],
    [4,"08:15","10:15","agencia","Agencia: visitar negocios"],
    [4,"10:15","10:30","libre","Pausa"],
    [4,"10:30","12:00","nexo","NEXO PC"],
    [4,"12:00","13:00","rutina","Almuerzo y descanso"],
    [4,"13:00","15:00","video","Edición (Filmora)"],
    [4,"15:00","17:00","app","App Web: práctica"],
    [4,"17:00","17:30","libre","Pausa y merienda"],
    [4,"17:30","19:00","creador","Creador: publicar"],
    [4,"19:00","19:30","rutina","Cena"],
    [4,"19:30","20:00","libre","Libre"],
    [4,"20:00","20:30","ingles","Inglés: Anki"],
    [4,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [5,"05:00","05:30","ejercicio","Ejercicio"],
    [5,"05:30","06:00","rutina","Aseo y desayuno"],
    [5,"06:00","08:00","app","App Web"],
    [5,"08:00","08:15","libre","Pausa"],
    [5,"08:15","10:15","nexo","NEXO PC: finanzas"],
    [5,"10:15","10:30","libre","Pausa"],
    [5,"10:30","12:00","agencia","Agencia"],
    [5,"12:00","13:00","rutina","Almuerzo y descanso"],
    [5,"13:00","15:00","creador","Creador: editar"],
    [5,"15:00","17:00","ingles","Inglés (clase)"],
    [5,"17:00","17:30","libre","Pausa y merienda"],
    [5,"17:30","19:00","app","App Web"],
    [5,"19:00","19:30","rutina","Cena"],
    [5,"19:30","20:00","libre","Libre"],
    [5,"20:00","20:30","ingles","Inglés: Anki"],
    [5,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [6,"05:00","05:30","ejercicio","Ejercicio"],
    [6,"05:30","06:00","rutina","Aseo y desayuno"],
    [6,"06:00","08:00","nexo","NEXO PC"],
    [6,"08:00","08:15","libre","Pausa"],
    [6,"08:15","10:15","app","App Web"],
    [6,"10:15","10:30","libre","Pausa"],
    [6,"10:30","12:00","video","Edición (Filmora)"],
    [6,"12:00","13:00","rutina","Almuerzo y descanso"],
    [6,"13:00","16:00","cliente","Video de cliente"],
    [6,"16:00","16:30","libre","Pausa"],
    [6,"16:30","19:00","agencia","Agencia: visitar negocios"],
    [6,"19:00","19:30","rutina","Cena"],
    [6,"19:30","20:00","libre","Libre"],
    [6,"20:00","20:30","ingles","Inglés: Anki"],
    [6,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [7,"05:00","05:30","ejercicio","Ejercicio suave"],
    [7,"05:30","06:00","rutina","Aseo y desayuno"],
    [7,"06:00","08:00","app","App Web"],
    [7,"08:00","11:00","cliente","Video de cliente"],
    [7,"11:00","11:30","libre","Pausa"],
    [7,"11:30","12:30","creador","Creador: ideas y guiones"],
    [7,"12:30","13:30","rutina","Almuerzo y descanso"],
    [7,"13:30","15:30","video","Edición (Filmora)"],
    [7,"15:30","16:00","libre","Pausa"],
    [7,"16:00","17:30","agencia","Agencia: plan de la semana"],
    [7,"17:30","18:00","ingles","Inglés: Anki"],
    [7,"18:00","18:30","libre","Libre"],
    [7,"18:30","19:00","rutina","Cena"],
    [7,"19:00","20:30","nexo","Revisión semanal y plan"],
    [7,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"]]},"4":{"n":"Semana 4 · Días temáticos","d":"Cada día un protagonista de 4 horas seguidas: menos cambios de tema.","b":[[1,"05:00","05:30","ejercicio","Ejercicio"],
    [1,"05:30","06:00","rutina","Aseo y desayuno"],
    [1,"06:00","08:00","app","App Web"],
    [1,"08:00","08:15","libre","Pausa"],
    [1,"08:15","10:15","app","App Web: práctica"],
    [1,"10:15","10:30","libre","Pausa"],
    [1,"10:30","12:00","agencia","Agencia"],
    [1,"12:00","13:00","rutina","Almuerzo y descanso"],
    [1,"13:00","15:00","video","Edición (Filmora)"],
    [1,"15:00","17:00","ingles","Inglés (clase)"],
    [1,"17:00","17:30","libre","Pausa y merienda"],
    [1,"17:30","19:00","nexo","NEXO PC"],
    [1,"19:00","19:30","rutina","Cena"],
    [1,"19:30","20:00","libre","Libre"],
    [1,"20:00","20:30","ingles","Inglés: Anki"],
    [1,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [2,"05:00","05:30","ejercicio","Ejercicio"],
    [2,"05:30","06:00","rutina","Aseo y desayuno"],
    [2,"06:00","08:00","video","Edición (Filmora)"],
    [2,"08:00","08:15","libre","Pausa"],
    [2,"08:15","10:15","video","Edición (Filmora)"],
    [2,"10:15","10:30","libre","Pausa"],
    [2,"10:30","12:00","creador","Creador: editar"],
    [2,"12:00","13:00","rutina","Almuerzo y descanso"],
    [2,"13:00","15:00","app","App Web"],
    [2,"15:00","17:00","agencia","Agencia"],
    [2,"17:00","17:30","libre","Pausa y merienda"],
    [2,"17:30","19:00","nexo","NEXO PC"],
    [2,"19:00","19:30","rutina","Cena"],
    [2,"19:30","20:00","libre","Libre"],
    [2,"20:00","20:30","ingles","Inglés: Anki"],
    [2,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [3,"05:00","05:30","ejercicio","Ejercicio"],
    [3,"05:30","06:00","rutina","Aseo y desayuno"],
    [3,"06:00","08:00","app","App Web"],
    [3,"08:00","08:15","libre","Pausa"],
    [3,"08:15","10:15","app","App Web: práctica"],
    [3,"10:15","10:30","libre","Pausa"],
    [3,"10:30","12:00","nexo","NEXO PC"],
    [3,"12:00","13:00","rutina","Almuerzo y descanso"],
    [3,"13:00","15:00","creador","Creador: editar"],
    [3,"15:00","17:00","ingles","Inglés (clase)"],
    [3,"17:00","17:30","libre","Pausa y merienda"],
    [3,"17:30","19:00","agencia","Agencia"],
    [3,"19:00","19:30","rutina","Cena"],
    [3,"19:30","20:00","libre","Libre"],
    [3,"20:00","20:30","ingles","Inglés: Anki"],
    [3,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [4,"05:00","05:30","ejercicio","Ejercicio"],
    [4,"05:30","06:00","rutina","Aseo y desayuno"],
    [4,"06:00","08:00","creador","Creador: grabar"],
    [4,"08:00","08:15","libre","Pausa"],
    [4,"08:15","10:15","creador","Creador: editar"],
    [4,"10:15","10:30","libre","Pausa"],
    [4,"10:30","12:00","agencia","Agencia"],
    [4,"12:00","13:00","rutina","Almuerzo y descanso"],
    [4,"13:00","15:00","video","Edición (Filmora)"],
    [4,"15:00","17:00","app","App Web"],
    [4,"17:00","17:30","libre","Pausa y merienda"],
    [4,"17:30","19:00","nexo","NEXO PC"],
    [4,"19:00","19:30","rutina","Cena"],
    [4,"19:30","20:00","libre","Libre"],
    [4,"20:00","20:30","ingles","Inglés: Anki"],
    [4,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [5,"05:00","05:30","ejercicio","Ejercicio"],
    [5,"05:30","06:00","rutina","Aseo y desayuno"],
    [5,"06:00","08:00","nexo","NEXO PC"],
    [5,"08:00","08:15","libre","Pausa"],
    [5,"08:15","10:15","nexo","NEXO PC: finanzas"],
    [5,"10:15","10:30","libre","Pausa"],
    [5,"10:30","12:00","agencia","Agencia"],
    [5,"12:00","13:00","rutina","Almuerzo y descanso"],
    [5,"13:00","15:00","app","App Web"],
    [5,"15:00","17:00","ingles","Inglés (clase)"],
    [5,"17:00","17:30","libre","Pausa y merienda"],
    [5,"17:30","19:00","creador","Creador: publicar"],
    [5,"19:00","19:30","rutina","Cena"],
    [5,"19:30","20:00","libre","Libre"],
    [5,"20:00","20:30","ingles","Inglés: Anki"],
    [5,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [6,"05:00","05:30","ejercicio","Ejercicio"],
    [6,"05:30","06:00","rutina","Aseo y desayuno"],
    [6,"06:00","08:00","creador","Creador: grabar"],
    [6,"08:00","08:15","libre","Pausa"],
    [6,"08:15","10:15","video","Edición (Filmora)"],
    [6,"10:15","10:30","libre","Pausa"],
    [6,"10:30","12:00","app","App Web"],
    [6,"12:00","13:00","rutina","Almuerzo y descanso"],
    [6,"13:00","16:00","cliente","Video de cliente"],
    [6,"16:00","16:30","libre","Pausa"],
    [6,"16:30","19:00","app","App Web"],
    [6,"19:00","19:30","rutina","Cena"],
    [6,"19:30","20:00","libre","Libre"],
    [6,"20:00","20:30","ingles","Inglés: Anki"],
    [6,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"],
    [7,"05:00","05:30","ejercicio","Ejercicio suave"],
    [7,"05:30","06:00","rutina","Aseo y desayuno"],
    [7,"06:00","08:00","app","App Web"],
    [7,"08:00","11:00","cliente","Video de cliente"],
    [7,"11:00","11:30","libre","Pausa"],
    [7,"11:30","12:30","creador","Creador: ideas y guiones"],
    [7,"12:30","13:30","rutina","Almuerzo y descanso"],
    [7,"13:30","15:30","video","Edición (Filmora)"],
    [7,"15:30","16:00","libre","Pausa"],
    [7,"16:00","17:30","agencia","Agencia: plan de la semana"],
    [7,"17:30","18:00","ingles","Inglés: Anki"],
    [7,"18:00","18:30","libre","Libre"],
    [7,"18:30","19:00","rutina","Cena"],
    [7,"19:00","20:30","nexo","Revisión semanal y plan"],
    [7,"20:30","21:00","dormir","Prepararme para dormir · 10 págs"]]}};
  const V = {};
  Object.keys(V4).forEach((k) => { V[k] = V4[k].b.map(([d, s, e, cat, title]) => ({ d, s, e, cat, title })); V[k].n = V4[k].n; V[k].desc = V4[k].d; });
  window.HORARIO_VAC = V;
})();
