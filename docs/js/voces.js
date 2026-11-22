// Voces del asistente: Harvey (estrategia, decisión, ganar) y Mike (detalle, atajos, aprender rápido).
// Frases originales escritas "al estilo" de cada uno. {x} se reemplaza con datos reales.
window.VOCES = {
  entrega: {
    h: ['Lo que tiene fecha va primero. Lo demás puede esperar; esto no.',
      'No negocies con una entrega de {x}. Ciérrala y después hablamos.',
      'Un ganador no entrega “casi listo”. Termínala hoy.',
      'La presión no se maneja: se elimina. Hazla ya y duerme tranquilo.',
      'Si la dejas para la noche, ya perdiste la mitad. Ahora.',
      'Tu reputación empieza con cumplir lo pequeño. Entrégala impecable.'],
    m: ['Divídela en 3 partes de 10 minutos; empieza por la más fácil para arrancar con impulso.',
      'Revisa los apuntes de la última clase: casi siempre la tarea sale de ahí.',
      'Antes de empezar, deja todo a la mano (cuaderno, libro, calculadora). Así no te levantas cada 5 minutos.',
      'Haz primero lo que ya sabes; cuando llevas la mitad, lo difícil se ve más pequeño.',
      'Tómale foto a lo que hiciste y guárdala: si se te queda el cuaderno, tienes respaldo.',
      'Escribe en una línea qué tiene que quedar listo. Cuando lo cumplas, paras.']
  },
  examen: {
    h: ['Un examen no se gana el día del examen; se gana hoy.',
      'No vayas a “pasar”. Ve a ganar.',
      'Nadie te va a regalar la nota. Sal a buscarla.',
      'La confianza sale de la preparación. Lo demás es suerte, y la suerte no es un plan.',
      'Cada hora que te queda antes del examen cuenta. Úsala como si fuera la última.'],
    m: ['Haz tarjetas con lo que más te cuesta y repásalas 3 veces hoy: repasar en tandas cortas se queda más que leer 2 horas seguidas.',
      'Explica el tema en voz alta como si se lo enseñaras a alguien. Donde te trabas, ahí tienes que estudiar.',
      'Resuelve ejercicios viejos del profe: los exámenes se parecen más a eso que al libro.',
      'Estudia 25 minutos y descansa 5. Tu cerebro guarda más en bloques cortos.',
      'La noche antes no estudies temas nuevos: repasa tus tarjetas y duerme 8 horas.']
  },
  bloque: {
    h: ['Tienes el bloque y tienes el tema. Ejecuta.',
      'Disciplina es hacer lo que dijiste que ibas a hacer, aunque no tengas ganas.',
      'Este bloque es tuyo. No se lo regales al celular.',
      'Los que llegan lejos no son los más talentosos; son los que aparecen. Aparece.',
      'Empieza ya. Las ganas llegan después de los primeros 5 minutos.',
      'Hoy no se trata de hacerlo perfecto; se trata de hacerlo.'],
    m: ['Celular boca abajo y modo Estudio activado: te ahorras unos 20 minutos de distracciones.',
      'Escribe en una línea qué vas a tener listo al final del bloque. Así sabes cuándo terminaste.',
      'Si te trabas más de 10 minutos, anota la duda y sigue con otra parte.',
      'Repasa 2 minutos lo de la última sesión antes de empezar: lo nuevo se conecta mejor.',
      'Usa la técnica Pomodoro: 25 minutos de trabajo y 5 de descanso.']
  },
  app: {
    h: ['Tu app no se va a programar sola. Cada línea de hoy es un cliente mañana.', 'Las tiendas de Quibdó no van a esperar a que estés listo. Avanza.'],
    m: ['Escribe el código tú, no lo copies: lo que tecleas se te queda.', 'Abre la consola (F12) desde el principio: los errores te dicen exactamente qué arreglar.']
  },
  video: {
    h: ['Cada video que editas es portafolio. Edítalo como si te fueran a pagar por él.', 'El que edita rápido y bien cobra más. Hoy entrenas eso.'],
    m: ['Usa tus atajos (dividir, J/K/L): te ahorran la mitad del tiempo.', 'Mira la retención de tu último reel y corrige ese segundo donde la gente se fue.']
  },
  agencia: {
    h: ['Los clientes no compran ideas, compran resultados. Practica hasta que tus guiones vendan.', 'Vender es ayudar a alguien a decidir. Prepárate para ayudar bien.'],
    m: ['Copia la estructura de un reel que funcionó y cámbiale el tema: así aprendes el patrón.', 'Escribe 5 ganchos distintos y escoge el mejor: el primero casi nunca es el bueno.']
  },
  nexo: {
    h: ['NEXO PC no es un sueño, es un plan con fechas. Hoy avanzas una.', 'Los negocios se construyen con datos, no con intuición. Ve por los datos.'],
    m: ['Anota cada precio que investigues en tu hoja: en 3 meses vale oro.', 'Pregúntale a tu jefe en la tienda cómo hace los pedidos: es información que no está en internet.']
  },
  creador: {
    h: ['La cámara no te va a esperar. Graba aunque no sea perfecto.', 'Un millón de seguidores empieza con un video publicado. Publícalo.'],
    m: ['Graba en lote: 4 reels con la misma luz y la misma ropa en una hora.', 'Los primeros 3 segundos deciden todo. Prueba el gancho en voz alta antes de grabar.']
  },
  ejercicio: {
    h: ['Nadie se arrepiente de haber entrenado. Levántate y hazlo.', 'Tu cuerpo es tu primer negocio. Invierte en él cada mañana.', 'La racha no se rompe hoy.'],
    m: ['Ya tienes la ropa lista: son unos 20 minutos y la app te cuenta las series.', 'Si estás muy cansado, haz solo el calentamiento y la primera serie: el hábito cuenta igual.']
  },
  ingles: {
    h: ['El inglés abre puertas que el talento solo no abre. Ve a clase con todo.', 'Los negocios grandes hablan inglés. Tú también vas a hablarlo.'],
    m: ['Anota 3 palabras nuevas de hoy en Anki antes de salir del salón.', 'Di en voz alta la frase de la clase que más te costó: hablar se aprende hablando.']
  },
  tareas: {
    h: ['Primero lo que se entrega antes. Organiza y ejecuta.', 'Las tareas no se acumulan si las matas el mismo día.'],
    m: ['Empieza por la más corta: ganar rápido te da impulso para la difícil.', 'Mira la ventana Agenda: ahí ves qué se entrega primero.']
  },
  cliente: {
    h: ['Un cliente contento te trae tres más. Entrégale más de lo que esperaba.', 'El precio lo justifica la calidad. Hoy la demuestras.'],
    m: ['Guarda el proyecto con tu plantilla: el próximo video te sale en la mitad del tiempo.', 'Pídele un testimonio cuando le entregues: es el mejor momento.']
  },
  trabajo: {
    h: ['En la tienda estás aprendiendo gratis cómo funciona tu futuro negocio. Pon atención.', 'Trata a cada cliente como si fuera de NEXO PC. Algún día lo será.'],
    m: ['Fíjate qué preguntan más los clientes y anótalo: son tus primeras ideas de contenido.', 'Aprende cómo se hace una garantía en la tienda: vas a necesitar ese proceso.']
  },
  colegio: {
    h: ['Estás en clase: ahí también se gana. Atento.', 'Las notas de hoy son las becas de mañana.'],
    m: ['Pregunta lo que no entiendas ahora; en la casa cuesta el doble.', 'Anota en el celular cualquier tarea que pongan, apenas la digan: la agendo yo.']
  },
  dormir: {
    h: ['Mañana a las 5 se gana o se pierde el día. Celular lejos y a dormir.', 'Dormir bien no es descansar: es prepararse para ganar.'],
    m: ['Deja la maleta lista y la ropa del ejercicio a la vista: mañana arrancas sin pensar.', 'Si no te llega el sueño, lee 10 páginas en papel: la pantalla te lo quita.']
  },
  flex: {
    h: ['Una vuelta pendiente es ruido en la cabeza. Sácala del camino.', 'Si te toma menos de 30 minutos, no la pienses: hazla.', 'Lo pequeño que se acumula te quita lo grande. Resuélvelo.'],
    m: ['Junta esta vuelta con otra que te quede cerca y haces dos en una salida.', 'Revisa que el sitio esté abierto antes de salir.', 'Anota lo que necesitas comprar en el celular para no devolverte.']
  },
  meta: {
    h: ['Ir atrasado no es el problema; quedarse quieto sí. Recupera una hoy.', 'No necesitas ponerte al día de golpe. Necesitas ganar la de hoy.', 'Los planes se cumplen un paso a la vez. Da el de hoy.'],
    m: ['Haz solo el primer paso de la meta: es el que más cuesta y el que más destraba.', 'Escoge la meta atrasada más corta: cerrar una rápido te devuelve el ritmo.', 'Lee el “se cumple cuando” de la meta: así sabes exactamente qué entregar.']
  },
  cansado: {
    h: ['Cansado no es lo mismo que derrotado. Haz lo mínimo que mantiene el hábito y descansa de verdad.', 'Hoy no ganas por cantidad; ganas por no romper la racha.'],
    m: ['Haz solo tus bloques ancla en versión corta y acuéstate a las 9:00 pm. Mañana rindes el doble.', 'Toma un vaso de agua y camina 5 minutos: la mitad del cansancio es el cuerpo quieto.']
  },
  pocoTiempo: {
    h: ['Con {x} bien usados le ganas a 2 horas perdidas.', 'El tiempo corto no es excusa: es la prueba de que sabes priorizar.'],
    m: ['En poco tiempo haz lo que ya tienes preparado. No es momento de empezar algo nuevo.', 'Pon un temporizador de {x}: cuando suene, paras y chuleas.']
  },
  motivacion: {
    h: ['Las ganas son opcionales. Los resultados no.', 'Mientras otros esperan el momento perfecto, tú ya vas en el segundo paso.', 'Quieres NEXO PC en 2030. Eso se construye en días como hoy.', 'Si fuera fácil, todo el mundo lo haría. Por eso vale la pena.'],
    m: ['Pon un temporizador de 10 minutos y empieza. Casi siempre sigues después.', 'Mira tu gráfica en Mi ruta: un solo día bueno ya mueve la línea.', 'Cambia de lugar: estudiar en otro rincón engaña al cerebro y arranca más fácil.']
  },
  celebrar: {
    h: ['Eso. Así se cierra.', 'Una menos. Sigue.', 'Ganaste esta. Ahora la siguiente.', 'Así se trabaja.'],
    m: ['Anota qué te funcionó para repetirlo.', 'Ya llevas {x} hoy. Vas bien.', 'Lo hiciste más rápido de lo que calculaste.']
  },
  reprogramar: {
    h: ['No pasa nada: se reprograma y se cumple. Lo que no se vale es olvidarlo.', 'Moverla una vez es estrategia. Moverla tres veces es excusa.'],
    m: ['La moví al siguiente hueco libre. Si no te sirve, cámbiala.', 'Si se te pasó por falta de tiempo, revisa si la duración que pusiste era real.']
  },
  conflicto: {
    h: ['Dos cosas a la misma hora es una mala negociación. Escoge y avisa con tiempo.', 'El que avisa con tiempo queda bien. El que no, queda mal. Avisa hoy.'],
    m: ['Si es una cita médica, pide el permiso en la tienda desde ya: con días de anticipación casi siempre te lo dan.', 'Mira si puedes mover la cita a un bloque Libre: el sábado en la tarde tienes espacio.']
  },
  sinHueco: {
    h: ['No hay hueco libre: algo tiene que ceder. Decide tú qué, antes de que el tiempo decida por ti.'],
    m: ['Te propongo usar un bloque que no sea ancla. Pierdes un poco de ese proyecto, pero cumples.']
  },
  buscar: {
    h: ['No busques todo: busca lo que te sirve para decidir.', 'Información sin decisión es pérdida de tiempo. Busca, compara y decide.'],
    m: ['Filtré por Colombia y precios en pesos. Compara al menos 3 tiendas antes de decidir.', 'Si es un tutorial, mira primero el más reciente: Filmora y los precios cambian rápido.']
  },
  ruta: {
    h: ['Una salida, varias vueltas. Así se aprovecha el tiempo.', 'Primero lo que cierra antes. El orden también es estrategia.'],
    m: ['Ordené las paradas por cercanía y horario para que no te devuelvas.', 'Si un tramo es corto, camínalo: te ahorras el mototaxi y haces ejercicio.']
  },
  bien: {
    h: ['Vas al día. No aflojes: el que va adelante es al que todos persiguen.', 'Así se ve el que cumple. Sigue igual.'],
    m: ['Ya que vas bien, adelanta una meta de la próxima semana.', 'Revisa qué hiciste distinto esta semana y repítelo.']
  },
  mal: {
    h: ['Vas atrasado. La buena noticia: hoy puedes empezar a remontar.', 'No te compares con el plan perfecto; compárate con el de ayer y gánale.'],
    m: ['Enfócate en una meta por proyecto, no en todas: así la gráfica sube rápido.', 'Marca tus 3 bloques ancla y cúmplelos 7 días seguidos: eso solo ya cambia tu semana.']
  },
  viaje: {
    h: ['Viajar no es excusa; es entrenamiento. Mantén lo mínimo.'],
    m: ['Ya tienes tu plan de viaje: son pocos minutos al día y cada tarea trae instrucciones.']
  },
  manana: {
    h: ['Mañana lo único que de verdad importa es: {x}.', 'Mañana se gana con lo que dejes listo esta noche.'],
    m: ['Deja listo esta noche lo que necesitas para: {x}.', 'Revisa la maleta y la alarma antes de acostarte.']
  },
  noEntendi: {
    h: ['Sé concreto: qué, cuándo y dónde.'],
    m: ['Prueba algo como: “examen de química el viernes”, “cita médica el jueves a las 4 pm” o “tengo 30 minutos”.']
  }
};

// 1.4: más frases. Harvey y Mike llegan a 250 cada uno. {n} = tu nombre.
(function (V) {
  const add = (cat, h, m) => { V[cat] = V[cat] || { h: [], m: [] }; V[cat].h.push.apply(V[cat].h, h); V[cat].m.push.apply(V[cat].m, m); };

  // ---------- nuevas categorías ----------
  add('racha', [
    'Llevas una racha. No la cuides: aliméntala.',
    'Cada día seguido vale más que el anterior. Hoy no es el día de cortarla.',
    'La racha es tu reputación contigo mismo. Defiéndela.',
    'Te faltan {x}. Nadie gana una carrera parándose antes de la meta.',
    'El que cumple varios días seguidos ya no depende de las ganas.',
    'Vas en racha. Ahora el que tiene que alcanzarte es el Cristóbal de ayer.',
    'Esto ya no es suerte: es sistema. Sigue.',
    'Una racha larga se construye igual que una corta: con el día de hoy.',
    'No celebres todavía. Celebra cuando llegues.',
    'La constancia le gana al talento que se queda en la casa.'
  ], [
    'Haz lo de hoy temprano: si lo dejas para la noche, la racha corre peligro.',
    'Te faltan {x}. Si mantienes el ritmo, la meta se marca sola.',
    'Pon el recordatorio en el mismo momento todos los días: el hábito se pega al horario.',
    'Si un día está muy pesado, haz la versión mínima: también cuenta.',
    'Mira el contador de la meta cada noche: ver el número subir motiva más de lo que crees.',
    'Deja preparado desde la noche lo que necesitas mañana. Así mañana no tienes que decidir nada.',
    'Los días de viaje no te rompen la racha: solo se congelan.',
    'Si vas en racha con algo, súmale otro hábito pequeño justo después. Se pegan más fácil.',
    'Anota qué te ayudó a no fallar esta semana. Eso es lo que hay que repetir.',
    'Tu mejor racha queda guardada. Hoy puedes empezar a superarla.'
  ]);
  add('rachaRota', [
    'Fallaste un día. Fallar dos ya es una decisión.',
    'La racha se rompió. Tu palabra no tiene por qué romperse. Empieza otra hoy.',
    'Caerse una vez es normal. No levantarse ya es otra cosa.',
    'No te castigues; corrige. Hoy se arranca de nuevo.',
    'Un día malo no define tu semana. Lo que hagas hoy sí.',
    'Los mejores también pierden rachas. La diferencia es que empiezan otra al día siguiente.',
    'Volver a cero duele. Por eso la próxima la vas a cuidar más.',
    'El récord sigue ahí. Ve por él.',
    'Nadie se acuerda de cuándo fallaste; se acuerdan de si terminaste.',
    'Perdiste el día, no la meta. Sigue.'
  ], [
    'Tu mejor racha sigue guardada. Empieza la nueva hoy y en pocos días la pasas.',
    'Revisa qué pasó el día que fallaste: si fue cansancio, muévelo a una hora más temprana.',
    'Pon el hábito justo después de algo que ya haces sí o sí, como cepillarte.',
    'Hazlo hoy aunque sea en versión mínima: lo importante es no fallar dos días seguidos.',
    'Si fallaste por olvido, puedes marcar el día de ayer en la meta (solo ayer, por honestidad).',
    'Los días de viaje no cuentan en contra: si estabas fuera, activa el modo fuera de casa.',
    'Baja la meta del día a algo ridículamente fácil. Lo difícil es arrancar otra vez.',
    'Anota el motivo cuando marques “No pude”: en unas semanas te muestro el patrón.',
    'Una racha nueva de 3 días ya te devuelve el ritmo. Apunta a 3, no a 30.',
    'Mira tu contador: el total no se borra, solo la racha. Llevas más de lo que crees.'
  ]);
  add('medias', [
    'A medias se acepta una vez. La segunda ya es tu nuevo estándar.',
    'Medio bloque es mejor que nada. Pero no te acostumbres.',
    'Hiciste algo. Ahora la próxima vez hazlo completo.',
    'Lo que haces a medias te da resultados a medias.',
    'Aparecer cuenta. Terminar cuenta más.',
    'No pasa nada por hoy. Mañana ese bloque va completo.',
    'Un ganador no se queda con la mitad. Recupera lo que faltó.',
    'Bien que no lo dejaste en cero. Ahora sube la vara.',
    'La mitad del esfuerzo nunca abre la puerta completa.',
    'Si fue a medias por falta de tiempo, el problema es el plan. Arréglalo.',
    'Acepto el medio bloque. No acepto la media excusa.',
    'Hoy fue a medias. Que no se vuelva costumbre.'
  ], [
    'A medias igual cuenta para tus rachas. En el % del día vale la mitad.',
    'Anota en una línea dónde quedaste: mañana arrancas desde ahí sin perder tiempo.',
    'Si te pasa seguido en el mismo bloque, puede que esté mal ubicado. Pregúntame “¿por qué voy mal?”.',
    'Divide el bloque en dos partes: la primera mitad es la que nunca puede faltar.',
    'Revisa qué te interrumpió: si fue el celular, pon el modo Estudio antes de empezar.',
    'Lo que te faltó puedes recuperarlo en un bloque Libre. Te busco el hueco si me lo pides.',
    'A veces a medias es lo correcto: si estabas muy cansado, mejor eso que nada.',
    'Pon un temporizador al inicio del bloque: saber cuánto falta ayuda a terminar.',
    'Haz primero la parte más importante del bloque. Así, si se corta, ya está lo que vale.',
    'Medio bloque de App Web bien hecho vale más que uno completo copiando código.',
    'Si fue a medias por llegar tarde, revisa el traslado anterior: ahí está el problema.',
    'Marca honesto: medio bloque marcado como medio te ayuda a ver la verdad de tu semana.'
  ]);
  add('noPude', [
    'No pudiste. Ya está. Lo que importa es qué haces con el próximo.',
    'Anotado. Un día perdido no es una semana perdida.',
    'Las excusas no se anotan; los motivos sí. Bien que pusiste el tuyo.',
    'Hoy no salió. Mañana ese bloque va primero.',
    'No ganas todas. Ganas la mayoría, y eso basta.',
    'Lo que no se hizo se reprograma o se suelta. Decide tú, no el tiempo.',
    'Si la razón fue el trabajo, está bien: también estás construyendo NEXO PC ahí.',
    'Un no a tiempo es mejor que un sí a medias. Pero que no se repita.',
    'Perdiste este. El siguiente bloque es tuyo.',
    'Reconocerlo ya es mejor que mentirte. Ahora ajusta.'
  ], [
    'Si te faltó tiempo, pregúntame “¿por qué voy mal?” y te propongo un hueco libre para recuperarlo.',
    'Guardé el motivo. En unas semanas verás qué es lo que más te frena.',
    'Si fue por cansancio, revisa si estás durmiendo a las 9:00 pm.',
    'Si fue por tareas, la semana que viene mueve las tareas al bloque de la tarde.',
    'Si fue por falta de internet, deja descargado el material desde la noche anterior.',
    'Un bloque perdido no se recupera haciendo el doble mañana. Mejor súmale 15 minutos a los dos siguientes.',
    'Mira si este bloque falla siempre el mismo día: puede que ese día tenga demasiado.',
    'Si te enfermaste, descansa. Tu plan está hecho para años, no para un día.',
    'Revisa tu Agenda: a veces un pendiente se come el bloque sin que te des cuenta.',
    'Marcarlo como “No pude” es mejor que dejarlo vacío: así la app sabe la verdad.'
  ]);
  add('cierre', [
    'Un día sin cerrar es un día que no puedes medir.',
    'Marca lo que hiciste. Lo que no se mide, no mejora.',
    'Diez segundos. Cierra el día y a dormir.',
    'Termina el día como terminas una entrega: completo.',
    'El que lleva la cuenta sabe dónde está parado.',
    'No te acuestes con el día abierto.',
    'Cerrar el día es tu reunión contigo mismo. Corta, pero no la saltes.',
    'Mañana se planea mejor si hoy quedó claro.',
    'Sé honesto al marcar. Mentirte no te da ningún punto.',
    'Los números no mienten. Por eso hay que anotarlos.',
    'Revisa, marca y apaga. Mañana a las 5 te necesito.'
  ], [
    'Toca cada bloque: ✓ hecho, ½ a medias o ✕ no pude. Te toma 10 segundos.',
    'Marca también tus días: agua, lectura y lo que estés contando.',
    'Si marcas todo, tu gráfica de Mi ruta muestra la verdad de tu semana.',
    'Revisa la Agenda de mañana después de marcar: así duermes sin pendientes en la cabeza.',
    'Deja el celular cargando lejos de la cama apenas termines de marcar.',
    'Si algo quedó a medias, anota en una línea dónde quedaste.',
    'Mira tu % del día: si pasó del 70%, fue un buen día.',
    'Lo que no hiciste hoy, pásalo a la Agenda en vez de dejarlo en la cabeza.',
    'Si olvidaste marcar ayer, en las metas de días puedes marcar ayer. Más atrás no.',
    'Cerrar el día a la misma hora siempre lo vuelve automático en unas semanas.',
    'Antes de dormir, alista la ropa del ejercicio. Mañana arrancas sin pensar.'
  ]);
  add('metaAuto', [
    'Meta cerrada. Así se ve el trabajo constante.',
    'Esto no fue suerte; fueron días seguidos. Bien hecho.',
    'Primera de muchas. Ahora la siguiente.',
    'Cumpliste sin que nadie te lo pidiera. Eso es disciplina.',
    'La app la marcó sola porque tú hiciste el trabajo. Sigue así.',
    'Una meta menos y un hábito más. Así se construye NEXO PC.',
    'No aflojes ahora. La siguiente es más difícil y por eso vale más.',
    'El que cumple lo pequeño se gana el derecho a lo grande.',
    'Ya demostraste que puedes. Ahora demuestra que puedes seguir.'
  ], [
    'Mira la siguiente meta del área: ya tienes el hábito arrancado, aprovéchalo.',
    'Anota qué te funcionó para cumplirla: te sirve para la próxima.',
    'Esta meta sube tu línea en Mi ruta. Échale un ojo a la gráfica.',
    'Si quieres desmarcarla, puedes; pero no se volverá a marcar sola.',
    'Comparte el logro con alguien: decirlo en voz alta lo vuelve más real.',
    'El contador sigue corriendo: tu racha no se borra por haber cumplido.',
    'La siguiente meta del área suele empezar donde esta terminó. Arranca hoy.',
    'Celebra con algo pequeño que no rompa el hábito, nada de trasnochar.',
    'Revisa si la próxima meta necesita casillas o se llena sola: está en su detalle.'
  ]);
  add('plata', [
    'NEXO PC se paga con lo que ahorres hoy, no con lo que pienses ahorrar.',
    'La plata que no anotas se va sin avisar.',
    'Primero te pagas a ti: ahorra antes de gastar.',
    'Un negocio sin números es un pasatiempo caro.',
    'Cada gasto pequeño es una decisión. Decide bien.',
    'El que maneja bien poco, después maneja bien mucho.',
    'No compres para impresionar. Ahorra para construir.',
    'La plata del negocio no es tu plata. Sepáralas desde ya.',
    'Un fondo de emergencia es tranquilidad para pensar en grande.',
    'Los clientes de la agencia pagan tu tienda. Cóbrales bien y a tiempo.',
    'Ahorrar no es tacañería; es estrategia.',
    'Mide cuánto te falta para NEXO PC. Una meta con número se cumple.'
  ], [
    'Si guardas 20.000 a la semana, en un año tienes más de un millón para NEXO PC. Empieza con lo que tengas.',
    'Anota cada gasto el mismo día en Monefy o en una hoja: 1 minuto basta.',
    'Separa la plata del negocio: en Nequi puedes crear un bolsillo aparte solo para eso.',
    'Revisa tus gastos hormiga de la semana: gaseosas, recargas, domicilios. Ahí se escapa la plata.',
    'Cobra la mitad por adelantado en los videos de clientes: es lo normal y te protege.',
    'Haz un presupuesto simple: lo que entra, lo que sale y cuánto ahorras. Nada más.',
    'Un fondo de emergencia de 1 a 3 meses de gastos te deja dormir tranquilo.',
    'Antes de comprar algo de más de 100.000, espera 48 horas. Si lo sigues queriendo, cómpralo.',
    'Compara en 3 tiendas antes de comprar tecnología: Mercado Libre, Alkosto y Ktronix.',
    'Si te sobra plata un mes, ponla en un ahorro que te pague intereses, no debajo del colchón.',
    'Lleva en una hoja cuánto llevas ahorrado para NEXO PC y míralo cada domingo.',
    'Pregúntame “¿cómo voy con la plata?” y te digo tu siguiente meta de finanzas.'
  ]);
  add('perfil', [
    'Te conozco, {n}. Por eso no te voy a dejar conformarte.',
    'Sé de dónde vienes y para dónde vas. Ahora camina.',
    'Tu meta es clara. Lo que falta es ejecutarla todos los días.',
    'Tienes 18 años y un plan de 4. Eso ya te pone adelante de muchos.',
    'Quibdó necesita una tienda como NEXO PC. Tú la vas a abrir.',
    'Conozco tu horario. No me digas que no hay tiempo: dime qué vas a mover.'
  ], [
    'Si algo de tu perfil cambió, edítalo: así mis consejos te sirven más.',
    'Todo lo que sé de ti está guardado en tu celular. No sale a internet.',
    'Mientras más bloques marques, más aprendo de cuándo rindes y cuándo fallas.',
    'En tu perfil está lo que voy aprendiendo de tus marcas. Revísalo cada semana.',
    'Si cambia tu horario del colegio o del trabajo, avísame y lo ajustamos.',
    'Puedes agregar en tu perfil cosas que quieras que sepa, como tus materias difíciles.'
  ]);
  add('finde', [
    'El fin de semana no es para descansar del plan; es para adelantarlo.',
    'Mientras otros se desconectan, tú avanzas. Ahí está la ventaja.',
    'Sábado y domingo también cuentan para tu racha.',
    'Hoy tienes más tiempo libre. Úsalo antes de que se te vaya.',
    'Trabajas, editas y aprendes el fin de semana. Así se construye algo grande.',
    'El lunes se gana el domingo en la noche.'
  ], [
    'Aprovecha la luz del sábado para grabar en lote tus reels de la semana.',
    'El domingo en la noche haz tu revisión semanal: 15 minutos y arrancas el lunes claro.',
    'Si tienes un bloque Libre largo, pídeme “¿qué hago?” y te propongo algo útil.',
    'Descansa de verdad en tus horas libres: también es parte del plan.',
    'Junta tus vueltas del fin de semana en una sola salida. Te armo la ruta.',
    'Revisa tus marcas de la semana el domingo: te digo qué bloque está fallando.'
  ]);

  // ---------- más frases para las categorías de antes ----------
  add('entrega', [
    'Entregar a tiempo es la forma más barata de ganarse la confianza de alguien.',
    'Hecho y entregado le gana a perfecto y tarde. Siempre.',
    'El profe no califica tus intenciones. Califica lo que entregas.'
  ], [
    'Revisa la rúbrica o lo que pidió el profe antes de empezar: no hagas de más ni de menos.',
    'Si es en grupo, escribe hoy en el chat qué parte hace cada uno y para cuándo.',
    'Guarda una copia en Drive apenas la termines: el celular se puede dañar justo ese día.'
  ]);
  add('examen', [
    'El nervio es energía. Úsala para estudiar, no para preocuparte.',
    'Llega al examen sabiendo que hiciste todo. Así se entra a ganar.',
    'Una buena nota abre puertas: becas, universidad, confianza. Ve por ella.',
    'No estudies para saber el tema. Estudia para poder explicarlo.'
  ], [
    'Hazte un examen de prueba con las preguntas que tú pondrías si fueras el profe.',
    'Escribe en una hoja todo lo que recuerdes sin mirar. Lo que no salió es lo que debes repasar.',
    'Usa Anki para las fórmulas y definiciones: te las repite justo antes de olvidarlas.',
    'Desayuna bien el día del examen: el cerebro sin comida rinde mucho menos.'
  ]);
  add('bloque', [
    'El plan ya está hecho. Ahora solo falta que tú aparezcas.',
    'Concentración total por un rato corto vale más que una tarde distraído.',
    'No esperes a sentirte listo. Nadie se siente listo.',
    'Lo que haces en este bloque te acerca o te aleja de NEXO PC. Decide.',
    'Un bloque bien hecho al día, y en un año eres otra persona.'
  ], [
    'Ten a la mano agua y lo que vas a usar. Cada vez que te levantas pierdes el hilo.',
    'Cierra todas las pestañas que no tengan que ver con el bloque.',
    'Si el tema es largo, haz solo la primera parte hoy. Mejor avanzar poco que no avanzar.',
    'Al terminar, marca el bloque y anota en una línea lo que hiciste.',
    'Si te sobra tiempo, adelanta el siguiente paso de la meta: así sumas sin esfuerzo extra.'
  ]);
  add('app', [
    'Las apps que funcionan resuelven un problema real. El tuyo es claro: encontrar tiendas en Quibdó.',
    'Programar es frustrante al principio. Todos los buenos pasaron por ahí.',
    'Tu app es tu primer producto digital. Trátala como un negocio.',
    'Nadie te va a contratar por los cursos que viste. Te contratan por lo que construiste.',
    'Termina una función antes de empezar otra. Lo que queda a medias no sirve.'
  ], [
    'Haz commit en GitHub al final de cada bloque: si algo se daña, vuelves atrás.',
    'Cuando te salga un error, copia el mensaje exacto y búscalo. Casi siempre alguien ya lo resolvió.',
    'Prueba tu página en el celular, no solo en el PC: tus usuarios la van a ver en el celular.',
    'Usa la extensión Live Server en VS Code: ves los cambios sin recargar a mano.',
    'Antes de programar una pantalla, dibújala en papel. Te ahorra la mitad del tiempo.'
  ]);
  add('video', [
    'Un buen editor se nota por lo que corta, no por lo que agrega.',
    'Hoy editas para aprender. Mañana editas para cobrar.',
    'El público no perdona un video lento. Corta sin miedo.',
    'Tu estilo de edición es tu firma. Empieza a construirla.',
    'Cada video terminado vale más que diez ideas guardadas.'
  ], [
    'En Filmora usa la detección de silencios para limpiar el audio en segundos.',
    'Pon subtítulos siempre: mucha gente ve los reels sin sonido.',
    'Corta cada toma justo cuando empieza la acción, no un segundo antes.',
    'Guarda una plantilla con tus textos y colores: el siguiente video te sale más rápido.',
    'Exporta en 1080 × 1920 para reels y TikTok; es el tamaño que piden.'
  ]);
  add('agencia', [
    'El primer cliente es el más difícil. Después vienen por recomendación.',
    'No vendas videos; vende más clientes para el negocio.',
    'Un negocio de Quibdó con buenas redes le gana al de la esquina. Tú puedes dárselas.',
    'Cobra lo justo. Lo barato atrae a los clientes que menos valoran tu trabajo.',
    'Tu portafolio habla por ti antes de que abras la boca.'
  ], [
    'Antes de proponerle algo a un negocio, mira sus redes y anota 3 cosas que mejorarías.',
    'Ten un mensaje de WhatsApp listo para presentarte: corto, con un ejemplo de tu trabajo.',
    'Pide los datos del negocio en un formulario de Google: no pierdes nada en el chat.',
    'Haz un reporte mensual sencillo para tu cliente: vistas, mensajes y qué mejoró.',
    'Graba el contenido de un cliente en una sola visita: 4 videos en una mañana.'
  ]);
  add('nexo', [
    'Una tienda de confianza no se improvisa. Se prepara con años de ventaja. Tú ya empezaste.',
    'Excelencia digital, confianza real. Que cada decisión lo demuestre.',
    'Aprende de los errores de otras tiendas antes de cometer los tuyos.',
    'El gaming en Quibdó está creciendo. El que llegue preparado se queda con el mercado.',
    'Tu jefe de hoy es tu mejor profesor de negocio. Observa todo.'
  ], [
    'Lleva una lista de los productos que más te preguntan en la tienda: es tu primer inventario.',
    'Anota a quién le compran tus proveedores en Medellín o Bogotá y a qué precio llega a Quibdó.',
    'Calcula el margen de 5 productos: precio de compra, envío y precio de venta.',
    'Mira cómo atienden las garantías en la tienda: es lo que más confianza da a un cliente.',
    'Empieza a armar una base de clientes interesados: un grupo de WhatsApp sirve.'
  ]);
  add('creador', [
    'Nadie nace sabiendo hablar a cámara. Se aprende hablando a cámara.',
    'El algoritmo premia al que publica seguido. Sé ese.',
    'Tu historia de Quibdó a NEXO PC es tu mejor contenido. Cuéntala.',
    'No busques un millón de seguidores. Busca a los primeros cien que de verdad te vean.',
    'El que publica con miedo igual publica. Eso es lo que importa.'
  ], [
    'Graba con la luz de una ventana de frente: es gratis y se ve mejor que muchas lámparas.',
    'Mira tus estadísticas a las 48 horas: ahí sabes si el video funcionó.',
    'Responde todos los comentarios del primer día: el algoritmo lo nota.',
    'Ten una lista de 20 ideas en las notas del celular. Nunca te quedas en blanco.',
    'Un micrófono de solapa barato mejora más el video que una cámara nueva.'
  ]);
  add('ejercicio', [
    'Treinta minutos al día y en un año tienes otro cuerpo.',
    'El cuerpo se entrena igual que la mente: con repetición.',
    'No te vas a sentir con ganas a las 5:00 am. Hazlo igual.',
    'La disciplina que ganas aquí la usas en todo lo demás.'
  ], [
    'Calienta bien los hombros antes de las flexiones: evitas lesiones.',
    'Si una serie te cuesta mucho, baja un nivel la variante y termina las repeticiones.',
    'Respira: bota el aire al subir y tómalo al bajar.',
    'Toma agua apenas termines y desayuna con algo de proteína.'
  ]);
  add('ingles', [
    'Cada palabra nueva es una puerta más que se abre.',
    'Los mejores tutoriales de tecnología están en inglés. Gánatelos.',
    'Equivocarte hablando es parte del precio. Págalo con gusto.',
    'Un día vas a negociar con proveedores en inglés. Hoy te preparas.'
  ], [
    'Cambia el idioma del celular a inglés por una semana: aprendes sin darte cuenta.',
    'Mira un video corto de tecnología en inglés con subtítulos en inglés, no en español.',
    'Repite en voz alta las frases del profe: la pronunciación se aprende con la boca.'
  ]);
  add('tareas', [
    'Una tarea hecha hoy es un problema menos mañana.',
    'Sin tareas atrasadas tu cabeza queda libre para tus proyectos.'
  ], [
    'Haz primero las que tienen nota más alta o entrega más cercana.',
    'Si una tarea te traba, pregúntale a un compañero por WhatsApp antes de perder una hora.'
  ]);
  add('cliente', [
    'Cumplir el plazo con un cliente vale más que cualquier efecto bonito.',
    'Un cliente feliz es publicidad gratis en Quibdó. Aquí todo el mundo se conoce.',
    'Trabaja para ese cliente como si fuera el más grande que tienes.'
  ], [
    'Muéstrale un avance a mitad de camino: así corriges antes de terminar.',
    'Entrégale el video en el formato de cada red: vertical para reels, horizontal para YouTube.',
    'Pregúntale qué resultado espera antes de empezar: mensajes, ventas o seguidores.'
  ]);
  add('trabajo', [
    'Cada cliente que atiendes bien es práctica para NEXO PC.',
    'En la tienda aprendes lo que ninguna universidad te enseña: vender.',
    'Haz tu trabajo tan bien que te quieran recomendar.'
  ], [
    'Fíjate qué productos se venden más en diciembre: te sirve para planear tu tienda.',
    'Aprende a diagnosticar un PC rápido: es un servicio que vas a cobrar.'
  ]);
  add('colegio', [
    'El colegio es tu primera inversión. No la desperdicies.',
    'Las notas no lo son todo, pero abren puertas que necesitas.'
  ], [
    'Siéntate adelante: te distraes menos y el profe te recuerda.',
    'Si no entiendes algo, pregúntalo al final de la clase. Es más fácil.',
    'Anota la fecha de cada evaluación apenas la digan: yo te aviso con tiempo.'
  ]);
  add('dormir', [
    'Lo que no hiciste hoy no se arregla trasnochando.',
    'El que duerme bien decide mejor. Y tú tienes muchas decisiones mañana.'
  ], [
    'Baja el brillo y activa el filtro de luz azul desde las 8:00 pm.',
    'Si te quedas pensando en pendientes, anótalos en la Agenda y suéltalos.'
  ]);
  add('flex', [
    'Las vueltas pequeñas se hacen rápido o se vuelven grandes.'
  ], [
    'Si la vuelta es cerca del colegio, hazla de regreso a la casa.',
    'Lleva la plata justa y la lista en el celular: sales y entras en 20 minutos.'
  ]);
  add('meta', [
    'Una meta atrasada no es un fracaso; es una deuda. Págala hoy.',
    'Las metas se cumplen cuando les das hora y fecha.',
    'No necesitas motivación para una meta. Necesitas el siguiente paso.'
  ], [
    'Abre la meta y mira su primer paso: casi siempre son menos de 30 minutos.',
    'Si una meta te parece muy grande, divídela en 3 partes y marca cada una en la Agenda.',
    'Mira en Mi ruta cuál es la meta más vieja sin cumplir: esa va primero.'
  ]);
  add('cansado', [
    'El cansancio de hoy es la fuerza de mañana, si descansas bien.',
    'Hoy toca cuidarte. Eso también es estrategia.'
  ], [
    'Haz una siesta de máximo 20 minutos antes de las 3:00 pm: más larga te daña la noche.',
    'Come algo con proteína: el cansancio a veces es hambre.',
    'Revisa si estás durmiendo 8 horas. Si no, ahí está la respuesta.'
  ]);
  add('pocoTiempo', [
    'Poco tiempo y mucho foco. Esa es la combinación.',
    'En {x} se puede cerrar algo pequeño. Ciérralo.'
  ], [
    'Con {x}, haz la tarea más corta de tu lista: te deja con impulso.',
    'Usa {x} para dejar preparado el siguiente bloque: material, archivos y apuntes listos.'
  ]);
  add('motivacion', [
    'Tú escogiste este camino. Ahora recórrelo.',
    'La diferencia entre un sueño y un plan es lo que haces hoy.',
    'No necesitas que todos crean en ti. Necesitas creer tú y trabajar.',
    'En cuatro años vas a agradecer este día. Úsalo.',
    'Lo difícil de hoy es lo normal de mañana.'
  ], [
    'Mira la foto o la meta que más te importa antes de empezar: te recuerda para qué es esto.',
    'Empieza por lo que más te gusta del plan: después lo demás pesa menos.',
    'Cuéntale a alguien lo que vas a hacer hoy: cumplir delante de otros cuesta menos.',
    'Mira cuánto llevas en Progreso: ya hiciste más de lo que crees.',
    'Haz solo 2 minutos. Si quieres parar después, paras. Casi nunca pasa.'
  ]);
  add('celebrar', [
    'Eso es cumplir. Sigue así.',
    'Bloque cerrado. El siguiente.',
    'Así se construye una semana ganadora.'
  ], [
    'Llevas {x} marcados hoy. Mira tu anillo del día.',
    'Cada bloque hecho sube tu gráfica en Mi ruta.',
    'Si vas sobrado de tiempo, adelanta el siguiente paso de una meta.',
    'Tómate 5 minutos de descanso real antes del siguiente bloque.'
  ]);
  add('reprogramar', ['Moverlo está bien. Olvidarlo, no.'], ['Si se mueve mucho, puede que la duración sea muy corta. Súbele 15 minutos.']);
  add('conflicto', ['Escoge lo que tiene más consecuencias si fallas. Lo otro se reprograma.'], ['Escribe hoy para mover lo que choca: avisar con tiempo siempre cae mejor.']);
  add('sinHueco', ['Si no cabe, algo sobra. Revisa qué estás haciendo que no te acerca a tus metas.'], ['Mira tu sábado en la tarde: suele tener bloques Libre que te salvan.']);
  add('buscar', ['Compara precios como si fuera la plata de NEXO PC. Porque lo es.'], ['Mira la fecha de la página: un precio de hace un año ya no sirve en Colombia.']);
  add('ruta', ['Sal con un plan y vuelve con todo hecho.'], ['Revisa que no esté lloviendo antes de salir a pie: en Quibdó llueve fuerte y rápido.']);
  add('bien', [
    'Vas bien. Ahora haz que se vuelva costumbre.',
    'Ritmo de ganador. Mantenlo.'
  ], [
    'Aprovecha que vas bien para meter algo de la próxima semana.',
    'Mira qué bloques te están funcionando mejor y no los muevas.',
    'Anota en tu revisión semanal qué hiciste distinto. Es tu fórmula.'
  ]);
  add('mal', [
    'Ir mal una semana no es ir mal en el plan. Corrige ya.',
    'Mira los números sin excusas. Después decide qué cambias.'
  ], [
    'Escoge un solo bloque para cumplir sí o sí esta semana. Empieza por ahí.',
    'Revisa tus motivos de “No pude”: si se repite uno, ese es el problema a resolver.',
    'Si todo se te cae a la misma hora, puede que esa hora no te sirva. Cámbiala.'
  ]);
  add('viaje', ['Fuera de casa también se cumple. Con menos, pero se cumple.', 'Volver con el hábito intacto es ganar el viaje.'], ['Descarga antes de viajar lo que vas a necesitar: videos, PDF y música.', 'Lleva cuaderno: sin internet también puedes planear y escribir guiones.']);
  add('manana', ['Si mañana empieza bien a las 5:00 am, el día ya está ganado.', 'Prepara la noche y mañana solo ejecutas.'], ['Mira tu Agenda de mañana antes de dormir: {x} es lo primero.', 'Deja el uniforme y la maleta listos: mañana sales sin carreras.']);
  add('noEntendi', ['Dímelo de otra forma. Te escucho.'], ['También puedes preguntarme “¿qué sabes de mí?” o “¿por qué voy mal?”.']);
})(window.VOCES);
