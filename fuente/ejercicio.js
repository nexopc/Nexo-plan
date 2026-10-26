// Rutina de ejercicio: tren superior + abdomen, sin equipos, en la habitación.
// Progresión: 8 niveles de 3 semanas (24 semanas). Después sigue subiendo poco a poco.
window.EJ = {
  // u: 'r' repeticiones, 's' segundos, 'rl' reps por lado, 'sl' segundos por lado
  flex_pared: { n: 'Flexiones en la pared', m: 'Pecho · hombros · tríceps', u: 'r',
    how: ['De pie, a un brazo de distancia de la pared.', 'Manos en la pared a la altura del pecho, un poco más abiertas que los hombros.', 'Baja el pecho hacia la pared doblando los codos (a 45°, no abiertos en T).', 'Empuja hasta estirar los brazos.'],
    err: 'Sacar la cola o dejar caer la cadera: el cuerpo va recto como una tabla.' },
  flex_pared_cerrada: { n: 'Flexiones en pared con manos juntas', m: 'Tríceps · pecho', u: 'r',
    how: ['Igual que la flexión en pared, pero con las manos juntas a la altura del pecho.', 'Codos pegados al cuerpo al bajar.', 'Sube empujando con fuerza.'],
    err: 'Abrir los codos hacia los lados.' },
  flex_inclinada: { n: 'Flexiones inclinadas (manos en la cama)', m: 'Pecho · hombros · tríceps', u: 'r',
    how: ['Manos en el borde de la cama (o un escritorio firme que no se mueva).', 'Cuerpo recto de la cabeza a los talones.', 'Baja el pecho hasta casi tocar el borde.', 'Empuja hasta estirar los brazos.'],
    err: 'Usar una superficie que se desliza. Asegúrala contra la pared.' },
  flex_rodillas: { n: 'Flexiones con rodillas', m: 'Pecho · hombros · tríceps', u: 'r',
    how: ['Rodillas en el piso (pon una toalla o ropa doblada si duele).', 'Manos bajo los hombros, un poco abiertas.', 'Línea recta de las rodillas a la cabeza.', 'Baja el pecho casi al piso y empuja.'],
    err: 'Doblar la cadera (cola arriba). Aprieta el abdomen y los glúteos.' },
  negativas: { n: 'Flexiones negativas (bajada lenta)', m: 'Pecho · tríceps · core', u: 'r',
    how: ['Posición de flexión completa (en puntas de pie).', 'Baja muy lento contando 3–4 segundos.', 'Al llegar al piso, apoya las rodillas y vuelve arriba.', 'Repite.'],
    err: 'Dejarte caer rápido: el beneficio está en bajar lento.' },
  flex: { n: 'Flexiones completas', m: 'Pecho · hombros · tríceps · core', u: 'r',
    how: ['Manos bajo los hombros, en puntas de pie.', 'Cuerpo recto: abdomen y glúteos apretados.', 'Baja hasta que el pecho quede a un puño del piso.', 'Empuja hasta estirar los brazos.'],
    err: 'Bajar solo la mitad. Mejor menos repeticiones con buen rango.' },
  flex_diamante_rod: { n: 'Flexiones diamante con rodillas', m: 'Tríceps · pecho', u: 'r',
    how: ['Rodillas en el piso.', 'Manos juntas bajo el pecho formando un diamante con índices y pulgares.', 'Baja con los codos pegados al cuerpo.', 'Empuja.'],
    err: 'Abrir los codos. Si duelen las muñecas, separa un poco las manos.' },
  flex_diamante: { n: 'Flexiones diamante', m: 'Tríceps · pecho', u: 'r',
    how: ['Como la flexión completa, pero con las manos en diamante bajo el pecho.', 'Codos pegados al cuerpo.', 'Rango completo.'],
    err: 'Perder la línea del cuerpo por cansancio. Para antes.' },
  flex_declinada: { n: 'Flexiones declinadas (pies en la cama)', m: 'Pecho alto · hombros', u: 'r',
    how: ['Pies sobre el borde de la cama, manos en el piso.', 'Cuerpo recto.', 'Baja controlado y empuja.'],
    err: 'Hundir la cadera. Si no puedes mantener la línea, vuelve a flexiones normales.' },
  flex_pike: { n: 'Flexiones pike (hombros)', m: 'Hombros · tríceps', u: 'r',
    how: ['Forma una V invertida: cadera arriba, manos y pies en el piso.', 'Dobla los codos llevando la cabeza hacia el piso, entre las manos.', 'Empuja de vuelta arriba.'],
    err: 'Convertirla en flexión normal. La cadera se queda arriba.' },
  fondos_cama: { n: 'Fondos en el borde de la cama', m: 'Tríceps', u: 'r',
    how: ['Sentado en el borde de la cama, manos al lado de la cadera.', 'Desliza la cola fuera de la cama, rodillas dobladas.', 'Baja doblando los codos hacia atrás hasta 90°.', 'Empuja hasta estirar.'],
    err: 'Bajar demasiado (molesta el hombro). Máximo 90° de codo.' },
  superman: { n: 'Superman (sostener)', m: 'Espalda baja · glúteos · espalda alta', u: 's',
    how: ['Acostado boca abajo, brazos estirados al frente.', 'Levanta brazos, pecho y piernas del piso al mismo tiempo.', 'Mira al piso (cuello neutro).', 'Sostén respirando.'],
    err: 'Echar la cabeza hacia atrás. Mira al piso.' },
  bird_dog: { n: 'Bird dog (perro-pájaro)', m: 'Core · espalda baja · hombros', u: 'rl',
    how: ['En cuatro apoyos: manos bajo hombros, rodillas bajo cadera.', 'Estira el brazo derecho al frente y la pierna izquierda atrás.', 'Sostén 2 segundos sin mover la cadera.', 'Vuelve y cambia de lado.'],
    err: 'Rotar la cadera. Imagina un vaso de agua en tu espalda baja.' },
  ytw: { n: 'Y-T-W boca abajo', m: 'Espalda alta · hombros (postura)', u: 'r',
    how: ['Acostado boca abajo, frente apoyada en una toalla.', 'Levanta los brazos en forma de Y y sostén 2 s.', 'Luego en forma de T (2 s) y luego en W, codos atrás (2 s).', 'Y + T + W = 1 repetición.'],
    err: 'Levantar con la espalda baja. El movimiento sale de los omóplatos.' },
  angel_inverso: { n: 'Ángeles de nieve invertidos', m: 'Espalda alta · hombros', u: 'r',
    how: ['Boca abajo, brazos a los lados y pulgares hacia arriba.', 'Levanta un poco los brazos del piso.', 'Llévalos en arco hasta encima de la cabeza sin tocar el piso.', 'Regresa despacio.'],
    err: 'Hacerlo rápido. Lento y controlado.' },
  nadador: { n: 'Nadador boca abajo', m: 'Espalda · glúteos · hombros', u: 'r',
    how: ['Posición de superman.', 'Alterna subir brazo derecho + pierna izquierda y luego al revés, como nadando.', 'Cada cambio = 1 repetición.', 'Mantén el pecho un poco elevado.'],
    err: 'Moverte tan rápido que pierdes el control.' },
  dead_bug: { n: 'Dead bug (bicho muerto)', m: 'Abdomen profundo', u: 'rl',
    how: ['Boca arriba, brazos al techo y rodillas dobladas a 90° en el aire.', 'Pega la espalda baja al piso.', 'Baja lento el brazo derecho y la pierna izquierda sin tocar el piso.', 'Vuelve y cambia de lado.'],
    err: 'Despegar la espalda baja del piso. Si pasa, baja menos.' },
  crunch: { n: 'Encogimientos (crunch)', m: 'Abdomen', u: 'r',
    how: ['Boca arriba, rodillas dobladas y pies en el piso.', 'Manos en el pecho o tocando las sienes (sin jalar el cuello).', 'Sube los hombros del piso apretando el abdomen.', 'Baja lento.'],
    err: 'Jalar la cabeza con las manos.' },
  crunch_inverso: { n: 'Crunch inverso', m: 'Abdomen bajo', u: 'r',
    how: ['Boca arriba, piernas dobladas en el aire.', 'Lleva las rodillas al pecho despegando un poco la cadera del piso.', 'Baja lento sin dejar caer las piernas.'],
    err: 'Usar impulso. Controla la bajada.' },
  bicicleta: { n: 'Abdominales bicicleta', m: 'Oblicuos · abdomen', u: 'rl',
    how: ['Boca arriba, manos en las sienes.', 'Lleva el codo derecho hacia la rodilla izquierda mientras estiras la otra pierna.', 'Alterna lado a lado, despacio.'],
    err: 'Hacerlo rápido moviendo solo los codos. Gira el tronco.' },
  elev_piernas_flex: { n: 'Elevación de piernas dobladas', m: 'Abdomen bajo', u: 'r',
    how: ['Boca arriba, manos bajo la cola.', 'Rodillas dobladas.', 'Sube las rodillas hacia el pecho y baja hasta casi tocar el piso con los talones.'],
    err: 'Arquear la espalda baja.' },
  elev_piernas: { n: 'Elevación de piernas estiradas', m: 'Abdomen bajo', u: 'r',
    how: ['Boca arriba, manos bajo la cola.', 'Piernas estiradas y juntas.', 'Súbelas a 90° y baja lento sin tocar el piso.'],
    err: 'Despegar la espalda baja. Si pasa, dobla un poco las rodillas.' },
  plancha_rod: { n: 'Plancha con rodillas', m: 'Core completo', u: 's',
    how: ['Antebrazos en el piso, codos bajo los hombros.', 'Rodillas apoyadas.', 'Línea recta de las rodillas a la cabeza.', 'Aprieta el abdomen y respira normal.'],
    err: 'Contener la respiración.' },
  plancha: { n: 'Plancha', m: 'Core completo', u: 's',
    how: ['Antebrazos en el piso, codos bajo los hombros, en puntas de pie.', 'Cuerpo recto, abdomen y glúteos apretados.', 'Mira al piso.', 'Respira normal.'],
    err: 'Cadera muy alta o muy baja.' },
  plancha_lat_rod: { n: 'Plancha lateral con rodillas', m: 'Oblicuos', u: 'sl',
    how: ['De lado, apoyado en el antebrazo y las rodillas dobladas.', 'Levanta la cadera hasta formar una línea recta.', 'Sostén y cambia de lado.'],
    err: 'Dejar caer la cadera.' },
  plancha_lat: { n: 'Plancha lateral', m: 'Oblicuos · hombro', u: 'sl',
    how: ['De lado, apoyado en el antebrazo y los pies uno sobre otro.', 'Levanta la cadera: cuerpo recto.', 'Sostén y cambia de lado.'],
    err: 'Girar el pecho hacia el piso.' },
  toques_hombro: { n: 'Plancha alta con toques de hombro', m: 'Core · hombros', u: 'rl',
    how: ['Posición alta de flexión (brazos estirados).', 'Pies separados para tener estabilidad.', 'Toca el hombro izquierdo con la mano derecha sin mover la cadera.', 'Alterna.'],
    err: 'Balancear la cadera. Abre más los pies.' },
  hollow: { n: 'Hollow hold (cuerpo hueco)', m: 'Abdomen', u: 's',
    how: ['Boca arriba, espalda baja pegada al piso.', 'Sube hombros y piernas un poco del piso, brazos estirados atrás.', 'Forma una “banana”.', 'Sostén.'],
    err: 'Despegar la espalda baja. Para hacerlo más fácil, dobla las rodillas.' },
  escaladores: { n: 'Escaladores (lentos)', m: 'Core · hombros · cardio', u: 'rl',
    how: ['Posición alta de flexión.', 'Lleva una rodilla al pecho y regrésala.', 'Alterna con control, sin saltar.'],
    err: 'Subir la cadera.' },
  // Calentamiento y estiramiento
  marcha: { n: 'Marcha en el sitio', m: 'Calentamiento', u: 's', how: ['Marcha subiendo las rodillas y moviendo los brazos.'], err: '' },
  circulos_brazos: { n: 'Círculos de brazos', m: 'Calentamiento de hombros', u: 's', how: ['Brazos estirados a los lados.', 'Círculos pequeños que se van agrandando.', 'Mitad del tiempo hacia adelante, mitad hacia atrás.'], err: '' },
  rot_hombros: { n: 'Rotación de hombros', m: 'Calentamiento', u: 's', how: ['Sube los hombros a las orejas, llévalos atrás y bájalos.', 'Círculos lentos.'], err: '' },
  gato_vaca: { n: 'Gato-vaca', m: 'Movilidad de columna', u: 'r', how: ['En cuatro apoyos.', 'Arquea la espalda mirando arriba (vaca).', 'Redondea la espalda mirando al ombligo (gato).', 'Lento, con la respiración.'], err: '' },
  jacks_suaves: { n: 'Jumping jacks suaves', m: 'Calentamiento', u: 's', how: ['Abre y cierra brazos y piernas a ritmo suave.', 'Si molesta saltar, hazlo paso a paso sin saltar.'], err: '' },
  aguja: { n: 'Rotación torácica (enhebrar la aguja)', m: 'Movilidad de espalda alta', u: 'rl', how: ['En cuatro apoyos.', 'Pasa un brazo por debajo del otro y apoya el hombro en el piso.', 'Luego ábrelo hacia el techo siguiéndolo con la mirada.'], err: '' },
  est_pecho: { n: 'Estiramiento de pecho en el marco de la puerta', m: 'Estiramiento', u: 'sl', how: ['Antebrazo apoyado en el marco de la puerta, codo a la altura del hombro.', 'Avanza un paso hasta sentir el estiramiento en el pecho.'], err: '' },
  est_triceps: { n: 'Estiramiento de tríceps', m: 'Estiramiento', u: 'sl', how: ['Lleva una mano detrás de la cabeza hacia la espalda.', 'Con la otra mano empuja suave el codo.'], err: '' },
  est_hombro: { n: 'Estiramiento de hombro cruzado', m: 'Estiramiento', u: 'sl', how: ['Cruza un brazo estirado frente al pecho.', 'Abrázalo con el otro brazo.'], err: '' },
  cobra: { n: 'Cobra suave', m: 'Estiramiento de abdomen', u: 's', how: ['Boca abajo, manos bajo los hombros.', 'Empuja suave levantando el pecho, cadera en el piso.', 'Relaja los hombros.'], err: '' },
  nino: { n: 'Postura del niño', m: 'Estiramiento de espalda', u: 's', how: ['De rodillas, siéntate sobre los talones.', 'Lleva los brazos al frente y la frente al piso.', 'Respira profundo.'], err: '' },
  respiracion: { n: 'Respiración 4-7-8', m: 'Relajación', u: 'r', how: ['Inhala por la nariz 4 segundos.', 'Sostén 7 segundos.', 'Exhala por la boca 8 segundos.', 'Cada ciclo = 1 repetición.'], err: '' }
};

// Variante y dosis base de cada “hueco” por nivel. [ejercicio, dosis base]
window.EJ_NIVELES = [
  null,
  { nombre: 'Nivel 1 · Despertar',     push: ['flex_pared', 8],       push2: ['flex_pared_cerrada', 6], back1: ['superman', 15], back2: ['bird_dog', 5], core1: ['dead_bug', 5], core2: ['plancha_rod', 15], core3: ['bird_dog', 5] },
  { nombre: 'Nivel 2 · Base',          push: ['flex_inclinada', 8],   push2: ['flex_pared_cerrada', 10], back1: ['superman', 20], back2: ['ytw', 4],      core1: ['crunch', 10],  core2: ['plancha_rod', 25], core3: ['plancha_lat_rod', 10] },
  { nombre: 'Nivel 3 · Constancia',    push: ['flex_rodillas', 6],    push2: ['fondos_cama', 6],        back1: ['angel_inverso', 8], back2: ['ytw', 6], core1: ['bicicleta', 8], core2: ['plancha', 20],    core3: ['plancha_lat_rod', 15] },
  { nombre: 'Nivel 4 · Fuerza',        push: ['flex_rodillas', 10],   push2: ['negativas', 3],          back1: ['nadador', 10], back2: ['superman', 30], core1: ['elev_piernas_flex', 8], core2: ['plancha', 30], core3: ['plancha_lat', 15] },
  { nombre: 'Nivel 5 · Primera flexión', push: ['flex', 4],           push2: ['fondos_cama', 10],       back1: ['angel_inverso', 12], back2: ['nadador', 12], core1: ['crunch_inverso', 10], core2: ['toques_hombro', 8], core3: ['plancha_lat', 20] },
  { nombre: 'Nivel 6 · Control',       push: ['flex', 7],             push2: ['flex_diamante_rod', 6],  back1: ['ytw', 8],      back2: ['superman', 40], core1: ['elev_piernas', 8], core2: ['plancha', 45],     core3: ['bicicleta', 14] },
  { nombre: 'Nivel 7 · Potencia',      push: ['flex', 10],            push2: ['flex_pike', 5],          back1: ['nadador', 16], back2: ['angel_inverso', 15], core1: ['hollow', 15], core2: ['escaladores', 10], core3: ['plancha_lat', 30] },
  { nombre: 'Nivel 8 · Atleta',        push: ['flex_declinada', 6],   push2: ['flex_diamante', 6],      back1: ['ytw', 10],     back2: ['superman', 45], core1: ['hollow', 25],   core2: ['plancha', 60],     core3: ['escaladores', 15] }
];

// Tipo de día: 1=Lun … 7=Dom
window.EJ_DIAS = {
  1: { tipo: 'Empuje + abdomen', slots: ['push', 'push2', 'core1', 'core2'] },
  2: { tipo: 'Espalda + core',   slots: ['back1', 'back2', 'core3', 'core2'] },
  3: { tipo: 'Empuje + abdomen', slots: ['push', 'push2', 'core1', 'core2'] },
  4: { tipo: 'Espalda + core',   slots: ['back1', 'back2', 'core3', 'core2'] },
  5: { tipo: 'Tren superior completo', slots: ['push', 'back1', 'core1', 'core2'] },
  6: { tipo: 'Core suave + movilidad', slots: ['core1', 'core3'], suave: true },
  7: { tipo: 'Movilidad y estiramiento (descanso activo)', slots: [], movilidad: true }
};

window.buildRutina = function (week, dow) {
  const w = Math.max(1, week);
  const lvl = Math.min(8, Math.floor((w - 1) / 3) + 1);
  const wk = w > 24 ? 3 : ((w - 1) % 3) + 1;     // semana dentro del nivel
  const extra = w > 24 ? Math.floor((w - 24) / 2) : 0; // después de 24 semanas sigue subiendo
  const N = EJ_NIVELES[lvl];
  const dia = EJ_DIAS[dow];
  const dose = (id, base, isMain) => {
    const u = EJ[id].u;
    let v = base;
    if (u === 's' || u === 'sl') v = base + 5 * (wk - 1) + 5 * extra;
    else v = base + (u === 'rl' ? 1 : 2) * (wk - 1) + extra;
    return v;
  };
  const fmt = (id, v) => {
    const u = EJ[id].u;
    return u === 'r' ? v + ' rep' : u === 'rl' ? v + ' por lado' : u === 's' ? v + ' s' : v + ' s por lado';
  };
  let sets = (lvl === 1 && wk < 3) ? 2 : 3;
  if (dia.suave) sets = 2;
  const descanso = lvl <= 2 ? 75 : 60;

  const cal = (lvl === 1
    ? [['marcha', 45], ['circulos_brazos', 30], ['rot_hombros', 20], ['gato_vaca', 6]]
    : [['jacks_suaves', 40], ['circulos_brazos', 30], ['rot_hombros', 20], ['gato_vaca', 6]]);
  const est = [['est_pecho', 20], ['est_triceps', 20], ['cobra', 20], ['nino', 30]];
  const mov = [['gato_vaca', 10], ['aguja', 6], ['circulos_brazos', 40], ['cobra', 30], ['est_pecho', 30], ['est_triceps', 25], ['est_hombro', 25], ['nino', 45], ['respiracion', 4]];

  const mk = (arr) => arr.map(([id, v]) => ({ id, ...EJ[id], dosis: fmt(id, v), sets: 1 }));
  const main = dia.slots.map((s) => {
    const [id, base] = N[s];
    const v = dose(id, base);
    return { id, ...EJ[id], dosis: fmt(id, v), sets };
  });
  let bloques;
  if (dia.movilidad) bloques = [{ n: 'Movilidad (todo suave)', items: mk(mov) }];
  else bloques = [
    { n: 'Calentamiento · 3 min', items: mk(cal) },
    { n: 'Principal · ' + sets + ' series · descanso ' + descanso + ' s', items: main },
    { n: 'Estiramiento · 2 min', items: mk(dia.suave ? est.concat([['aguja', 5]]) : est) }
  ];
  // duración estimada
  let min = dia.movilidad ? 12 : Math.round(5 + main.length * sets * (45 + descanso) / 60);
  return { semana: w, nivel: lvl, wk, nivelNombre: N.nombre, tipo: dia.tipo, sets, descanso, bloques, minutos: Math.min(min, 28) };
};
