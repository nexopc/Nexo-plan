// Temas específicos por semana. Cada sesión: [meta, título, tarea concreta]
// El orden de cada lista sigue el orden de los bloques en la semana (lunes → domingo).
// app: Lun 5:30 · Lun 17:00 · Mar 5:30 · Mar 13:20 (papel) · Mié 5:30 · Mié 17:00 · Jue 5:30 · Vie 5:30 · Sáb 5:30 · Dom 11:00
// video: Jue 13:20 (celular) · Jue 19:00 · Vie 17:00 · Dom 12:00
// agencia: Lun 19:30 · Mié 19:30 · Vie 13:20 (guiones) · Dom 19:30
// nexo: Mar 19:00 · Vie 19:30
window.SESIONES = {
1: { foco: 'Arrancar: entorno listo, primeras etiquetas HTML y primera rutina de ejercicio.',
  app: [
    ['1.1','Prepara tu entorno','Instala VS Code + Live Server + Prettier (o Acode en el celular). Crea la carpeta proyectos-web y un index.html con “Hola Quibdó”.'],
    ['1.2','HTML: estructura básica','freeCodeCamp “Diseño web responsivo” (español): primeras lecciones. Aprende html, head, body, h1–h6, p, img, a.'],
    ['1.2','Repaso de etiquetas','Escribe de memoria 15 etiquetas HTML y para qué sirve cada una. Compruébalas.'],
    ['3.1','Wireframe: pantalla de inicio','En papel: 3 versiones distintas de la pantalla de inicio del catálogo (buscador, categorías, tiendas). Tómales foto.'],
    ['1.2','Listas y enlaces','Practica ul, ol, li y enlaces a otras páginas y a WhatsApp (https://wa.me/57…).'],
    ['1.2','Página “Sobre mí”','Crea sobre-mi.html: tu foto, quién eres, tus 4 proyectos en lista y enlaces. Todavía sin CSS.'],
    ['4.1','Lista de tiendas (1)','Google Sheets con columnas Nombre, Categoría, Barrio, WhatsApp, Instagram. Agrega 10 tiendas que conozcas.'],
    ['1.2','Imágenes y atributos','img con src, alt y width. Aprende por qué el alt importa (accesibilidad y Google).'],
    ['1.2','Mini proyecto: ficha de producto','producto.html de un mouse gamer: título, foto, precio, características en lista y enlace “Pedir por WhatsApp”.'],
    ['4.1','Lista de tiendas (2) + revisión','Agrega 10 tiendas más (van 20). Escribe en 5 líneas qué aprendiste esta semana.']],
  video: [
    ['1.1','Tutorial: interfaz de Filmora','Busca “Filmora tutorial interfaz español” y toma notas de las 4 zonas: medios, visor, línea de tiempo y propiedades.'],
    ['1.1','Recorre la interfaz','Crea un proyecto 9:16, importa 5 clips y explora cada panel. Explica en voz alta qué hace cada zona.'],
    ['1.2','Sistema de carpetas','Crea 01_Video, 02_Audio, 03_Musica, 04_Graficos, 05_Export y organiza ahí lo del cliente 1.'],
    ['2.1','Cortes básicos','Edita un video de 60 s: dividir, recortar, borrar partes malas y cerrar huecos.']],
  agencia: [
    ['1.1','Embudo de marketing','Aprende AIDA (Atención, Interés, Deseo, Acción). Dibuja el embudo de una tienda de Quibdó.'],
    ['1.2','Cliente ideal','Escribe el cliente ideal de NEXO PC: edad, qué juega, dónde compra y qué le preocupa.'],
    ['2.1','20 ganchos','Escribe 20 ganchos de 1 frase para reels de tecnología (ej.: “No compres un PC gamer sin ver esto”).'],
    ['1.4','Curso gratis','Inscríbete en HubSpot Academy o Meta Blueprint y haz la primera lección.']],
  nexo: [
    ['2.1','Bolsillo de ahorro','Crea un bolsillo en Nequi llamado “NEXO PC” y define el 20% de cada pago.'],
    ['1.1','Compatibilidad (1)','Sockets AM4, AM5, LGA1700 y LGA1851 y sus chipsets. Haz una tabla.']],
  ingles: 'Partes del PC: motherboard, power supply, graphics card, storage, cooling fan, case, RAM, CPU, port, cable.' },

2: { foco: 'HTML semántico, guion de entrevista y atajos de Filmora.',
  app: [
    ['1.3','HTML semántico','header, nav, main, section, article, footer. Reescribe sobre-mi.html con etiquetas semánticas.'],
    ['1.3','Formularios','form, label, input (text, email, number), select, textarea, button. Crea el formulario “Registra tu tienda”.'],
    ['1.3','Repaso semántico','Dibuja la estructura semántica de la página de Mercado Libre: ¿qué es header, main y footer?'],
    ['3.1','Wireframe: lista y perfil','En papel: lista de tiendas por categoría y perfil de tienda (logo, horario, WhatsApp, productos).'],
    ['1.3','Tablas','table, tr, th, td: tabla de precios de 5 productos.'],
    ['1.3','Tienda ficticia completa','tienda.html: header con logo, nav, 6 productos (article), formulario de contacto y footer.'],
    ['4.2','Guion de entrevista','Escribe 7 preguntas para tiendas: cómo venden hoy, si usan catálogo de WhatsApp, qué les cuesta y si pagarían.'],
    ['1.3','Valida tu HTML','Pasa tienda.html por validator.w3.org y corrige todos los errores.'],
    ['3.2','Analiza apps referentes','Usa Rappi, Mercado Libre y Google Maps. Tabla: qué copiar, qué evitar y qué idea te da cada una.'],
    ['4.2','Prueba el guion','Entrevista a 1 tienda (puede ser tu trabajo) y ajusta las preguntas que no se entendieron.']],
  video: [
    ['1.3','Tutorial: atajos','Busca los atajos de teclado de Filmora y escribe tu hoja con 10.'],
    ['1.3','Practica atajos','Edita 10 minutos sin usar el mouse para cortar: solo atajos.'],
    ['1.4','Configuración y rendimiento','Ajusta resolución y fps del proyecto. Si se traba, prueba proxy o renderizar la previsualización.'],
    ['1.5','Exporta bien','Exporta el mismo video en MP4 1080×1920 (Reels/TikTok) y en versión para WhatsApp. Compara calidad y peso.']],
  agencia: [
    ['1.3','Propuesta de valor','¿Qué te hace distinto como mercadólogo en Quibdó? Escribe 3 frases.'],
    ['1.7','Perfil de Negocio de Google','Busca 10 tiendas de Quibdó en Google Maps: ¿cuántas tienen el perfil completo?'],
    ['2.2','Estructura de guion','Escribe 2 guiones de 30 s: Gancho → Problema → Solución → CTA.'],
    ['1.4','Curso (2)','Avanza 2 lecciones del curso de marketing.']],
  nexo: [
    ['1.1','Compatibilidad (2)','RAM DDR4 vs DDR5, PCIe y cómo escoger la fuente (vatios y 80 Plus). Revisa en PCPartPicker.'],
    ['3.1','Competencia (1)','Lista las tiendas de tecnología de Quibdó: qué venden y precios aproximados.']],
  ingles: 'Verbos de tecnología: install, plug in, boot, update, download, upgrade, restart, shut down, connect, charge.' },

3: { foco: 'Primer CSS, entrevistas a tiendas y detección de silencios.',
  app: [
    ['1.4','CSS: cómo se conecta','link rel="stylesheet", selectores de etiqueta, clase e id. Cambia colores y tipografía de tienda.html.'],
    ['1.4','Modelo de caja','margin, padding, border, width, box-sizing. Convierte cada producto en tarjeta con borde, sombra y espacio.'],
    ['1.4','Colores NEXO','Variables CSS en :root con la paleta NEXO (cian #00E5FF, morado #7C4DFF, fondo #0B0F1A).'],
    ['3.3','Arquitectura de información','En papel: todos los datos de una TIENDA y de un PRODUCTO (nombre, categoría, barrio, horario, fotos, precio…).'],
    ['1.4','Google Fonts','Agrega una tipografía (Inter o Poppins) y define tamaños para h1, h2 y p.'],
    ['1.4','Estiliza la tienda ficticia','Aplica la paleta NEXO: header oscuro, botones cian, tarjetas. Que se vea profesional.'],
    ['4.3','Agenda entrevistas','Escribe a 5 tiendas de tu lista para pedir 10 minutos de entrevista.'],
    ['1.4','Pseudoclases',':hover y :active en botones y tarjetas con transition.'],
    ['4.3','Entrevistas (1–2)','Haz 2 entrevistas a tiendas. Anota respuestas textuales.'],
    ['3.3','Documento de campos','Pasa a un documento los campos de tienda y producto: será tu base de datos.']],
  video: [
    ['2.2','Tutorial: detección de silencios','Mira cómo funciona la detección de silencios de Filmora en videos hablados.'],
    ['2.2','Limpia un video hablado','Grábate 2 min hablando de un producto y usa la detección de silencios. Revisa los cortes a mano.'],
    ['2.3','Cortes J y L','En una conversación: el audio del siguiente clip entra antes (J) o sigue después (L).'],
    ['2.4','Jump cuts y punch-in','En el video hablado alterna zoom 100% y 115% en cada corte.']],
  agencia: [
    ['1.8','WhatsApp Business','Explora catálogo, respuestas rápidas, etiquetas y mensaje de bienvenida.'],
    ['1.5','Métricas clave','Alcance, interacción, CTR, conversión, CPA y ROAS: un ejemplo de cada una.'],
    ['2.2','Guiones (3–4)','2 guiones para NEXO PC: “3 errores al armar un PC” y “Qué mouse comprar con $100.000”.'],
    ['1.6','Competencia','Analiza 3 negocios o freelancers de marketing de Quibdó/Chocó: qué ofrecen y qué les falta.']],
  nexo: [
    ['1.2','Armado de PC','En el trabajo (con permiso) observa o haz paso a paso un armado y toma notas.'],
    ['3.1','Competencia (2)','Visita 2 tiendas como cliente: atención, surtido y garantía. Anota fortalezas y debilidades.']],
  ingles: 'Servicio al cliente: How can I help you? / It is in stock / The warranty covers… / Would you like…? / Here is your receipt.' },

4: { foco: 'Flexbox, Figma y audio limpio.',
  app: [
    ['1.5','Flexbox Froggy (1)','Juega flexboxfroggy.com en español, niveles 1–12.'],
    ['1.5','Flexbox en práctica','Termina Froggy (24 niveles). Haz la barra de navegación de tienda.html con display:flex.'],
    ['1.5','Repaso flex','Escribe qué hacen justify-content, align-items, flex-wrap y gap.'],
    ['3.4','Figma: primeros pasos','App de Figma en el celular: crea cuenta, un frame de 360×800 y pasa tu wireframe de inicio.'],
    ['1.5','Tarjetas en fila','3 tarjetas en fila con flex y gap que bajen a columna con flex-wrap.'],
    ['1.5','Header y footer con flex','Header con logo a la izquierda y menú a la derecha. Footer en 3 columnas.'],
    ['4.3','Entrevistas (3–4)','Agenda o haz 2 entrevistas más. Llevas 4 de 10.'],
    ['1.5','Centrar elementos','Centra horizontal y verticalmente con flex (el clásico).'],
    ['4.3','Entrevistas + patrones','1–2 entrevistas y un resumen: ¿qué se repite entre tiendas?'],
    ['3.4','Figma: Auto Layout','Aprende Auto Layout y componentes. Crea el componente “tarjeta de tienda”.']],
  video: [
    ['3.1','Tutorial: niveles de audio','Aprende el medidor: voz entre -12 y -6 dB y música mucho más baja.'],
    ['3.1','Mezcla básica','Mezcla voz + música en un reel: voz clara, música de fondo sin tapar.'],
    ['3.2','Reducción de ruido','Limpia con IA un audio grabado en la calle o en la tienda (sin dejarlo robótico).'],
    ['3.3','Ducking automático','Activa el ducking para que la música baje sola cuando hablan.']],
  agencia: [
    ['2.4','Pilares de contenido','4 pilares para NEXO PC: educar, entretener, vender y comunidad. 3 ideas por pilar.'],
    ['2.3','Banco de ideas','Llega a 50 ideas en Google Sheets (pilar, formato, gancho).'],
    ['2.1','Ganchos (2)','Analiza 10 reels virales de tecnología y escribe 10 ganchos más.'],
    ['2.5','Calendario editorial','Calendario de 1 mes (3 publicaciones por semana) en Sheets o Notion.']],
  nexo: [
    ['1.3','Diagnóstico','Diagrama: no enciende / sin video / pantallazo azul. Qué revisar en cada caso.'],
    ['1.8','SENA','Busca en Sofia Plus cursos de mantenimiento de equipos y hardware. Anota fechas.']],
  ingles: 'Desarrollo web: tag, element, layout, button, link, page, browser, code, file, folder.' },

5: { foco: 'CSS Grid, guía de estilo y B-roll.',
  app: [
    ['1.6','CSS Grid Garden (1)','cssgridgarden.com niveles 1–14.'],
    ['1.6','Galería con Grid','Termina Grid Garden (28) y crea una cuadrícula de 8 productos con repeat(auto-fill, minmax(160px, 1fr)).'],
    ['1.6','Grid vs Flex','Escribe cuándo usar Grid y cuándo Flex (1 línea cada uno).'],
    ['3.5','Guía de estilo en papel','Colores, 2 tipografías, 3 tamaños de texto, estilo de botón y de tarjeta.'],
    ['1.7','Mobile first','Meta viewport y por qué se diseña primero para celular.'],
    ['1.7','Media queries','Galería con 2 columnas en celular, 3 en tablet y 4 en PC.'],
    ['4.4','Encuesta a compradores','Google Forms de 6 preguntas: cómo buscan productos en Quibdó, qué les frustra y qué app usan.'],
    ['1.7','Unidades','rem, em, %, vw, vh: cambia los px por rem en tu proyecto.'],
    ['4.4','Difunde la encuesta','Mándala a 3 grupos de WhatsApp. Meta: 30 respuestas en 2 semanas.'],
    ['3.5','Guía de estilo en Figma','Página “Estilos” en Figma con colores y textos guardados.']],
  video: [
    ['2.5','Tutorial: B-roll','Qué es el B-roll: mira ejemplos en reels de tecnología.'],
    ['2.5','Graba B-roll','15 tomas de apoyo en tu trabajo: manos armando un PC, teclados, luces RGB.'],
    ['2.5','Cubre los cortes','Pon B-roll encima de los jump cuts del video hablado.'],
    ['2.7','Gancho–desarrollo–cierre','Reel de 30 s con gancho en los primeros 3 s y CTA al final.']],
  agencia: [
    ['5.1','Canva','Crea el kit de marca de NEXO en Canva (colores, logo, tipografías).'],
    ['5.2','Principios de diseño','Contraste, jerarquía, alineación y espacio. Rediseña un post feo de una tienda.'],
    ['2.2','Guiones (5–6)','2 guiones para tus clientes reales de video (los del sábado y domingo).'],
    ['5.4','Plantillas','3 plantillas de post y 2 de historia en Canva.']],
  nexo: [
    ['1.7','Cotiza 3 PCs','PC gamer básico, medio y alto con precios de esta semana (la RAM y los SSD subieron desde finales de 2025).'],
    ['3.2','Encuesta gamer','Google Forms: qué juegan, qué quieren comprar, dónde compran y cuánto gastan.']],
  ingles: 'Edición de video: cut, trim, clip, footage, timeline, render, export, frame rate, soundtrack, transition.' },

6: { foco: 'Responsive y tu primera página publicada en internet.',
  app: [
    ['1.7','Pruebas responsive','DevTools (F12 → modo dispositivo): prueba en 360, 768 y 1280 px. Corrige lo que se rompa.'],
    ['1.8','Landing NEXO PC (1)','nexo-pc/index.html: portada con slogan, servicios (venta, armado, soporte) y contacto por WhatsApp.'],
    ['1.8','Textos de la landing','Escribe los textos reales: slogan, 3 servicios y “por qué NEXO PC”.'],
    ['3.6','Prototipo: inicio + lista','Figma: conecta inicio → lista de tiendas con Prototype.'],
    ['1.8','Imágenes livianas','Comprime las fotos con squoosh.app (WebP, menos de 150 KB).'],
    ['1.8','Landing NEXO PC (2)','Termínala: responsive, botón flotante de WhatsApp y footer.'],
    ['4.3','Entrevistas (5–7)','Haz 3 entrevistas más. Van 7.'],
    ['4.4','Revisa la encuesta','¿Cuántas respuestas van? Recuérdala en los grupos.'],
    ['1.8','¡Publícala!','Sube la landing gratis a Netlify Drop (app.netlify.com/drop) o GitHub Pages. Manda el link.'],
    ['4.3','Entrevistas (8–10)','Completa las 10 entrevistas o agenda las que falten.']],
  video: [
    ['3.4','Tutorial: música y derechos','Qué música puedes usar: biblioteca de Filmora, biblioteca de audio de YouTube y audios de la app.'],
    ['2.6','Cortar al ritmo','Marcadores en el beat de la canción y corta los clips en cada uno.'],
    ['3.5','Efectos de sonido','Agrega whoosh, pop y clicks en transiciones y textos de un reel.'],
    ['2.8','Recrea un reel viral','Escoge un reel de tecnología con mucho alcance y recréalo toma por toma.']],
  agencia: [
    ['3.1','Perfil de Instagram','Optimiza un perfil: foto, bio con propuesta y CTA, destacados y link.'],
    ['3.2','Algoritmo de TikTok','Retención y re-vistos: escribe 5 reglas para tus videos.'],
    ['2.6','Storytelling','Guion contando la historia de un cliente que armó su PC.'],
    ['3.4','Meta Business Suite','Instálala y programa 3 publicaciones de la semana.']],
  nexo: [
    ['3.2','Difunde la encuesta','Compártela en grupos gamer y en la tienda. Meta: 50 respuestas.'],
    ['5.1','Identidad NEXO','Logo base, 2 colores y tipografía de NEXO PC con el slogan, en Canva.']],
  ingles: 'Solución de problemas: it does not turn on, blue screen, overheating, slow, error message, freeze, crash, fix, check, replace.' },

7: { foco: 'Primeros pasos en JavaScript y decisión honesta sobre la app.',
  app: [
    ['2.1','JavaScript: primeros pasos','Consola del navegador: let, const, string, number, boolean, console.log. freeCodeCamp JS, primeras lecciones.'],
    ['2.1','Operadores y variables','20 ejercicios: sumar precios, unir textos y comparar (===, >, <).'],
    ['2.1','Repaso de tipos','5 ejemplos de cada tipo de dato usando productos de tienda.'],
    ['3.6','Prototipo: perfil y producto','Figma: diseña el perfil de tienda y el producto y conéctalos al prototipo.'],
    ['2.2','Condicionales','if / else if / else: si el precio es mayor a 500.000 mostrar “Envío gratis”.'],
    ['2.2','Funciones','calcularIVA(precio) con 19%, aplicarDescuento(precio, %) y formatearCOP(n) con toLocaleString("es-CO").'],
    ['4.5','Analiza entrevistas','Lee las 10 entrevistas: los 3 problemas más repetidos y cuántas tiendas pagarían.'],
    ['2.2','Funciones flecha','Reescribe tus funciones como funciones flecha.'],
    ['4.5','Decisión honesta','1 página: ¿la idea sigue, se ajusta o se cambia? Con datos, no con lo que quieres oír.'],
    ['4.6','Propuesta de valor','5 versiones de la frase de tu app. Escoge la que 5 personas entiendan sin explicación.']],
  video: [
    ['4.1','Tutorial: color básico','Exposición, contraste, balance de blancos y saturación en el panel de color.'],
    ['4.1','Corrección básica','Corrige 5 clips de clientes: naturales y con blancos realmente blancos.'],
    ['4.5','Tonos de piel','Expón bien pieles morenas y negras: sin contraste de más ni caras oscuras.'],
    ['4.3','Igualar clips','Usa la coincidencia de color para que 3 clips grabados distinto se vean iguales.']],
  agencia: [
    ['3.3','Grupos de Facebook','Encuentra 5 grupos de compra/venta de Quibdó: ¿qué publicaciones tienen más respuesta?'],
    ['2.7','Copywriting','Captions para 5 posts con gancho, valor, CTA y 5 hashtags locales.'],
    ['2.8','Grabación en lote','Guiones de 4 reels para grabarlos todos el mismo día.'],
    ['3.5','Estadísticas','Alcance, guardados y retención de tus publicaciones. Anota qué funcionó.']],
  nexo: [
    ['1.4','Windows y drivers','Instalar Windows desde USB, drivers y actualizar BIOS de forma segura.'],
    ['3.3','Compras online','¿Cuánto tarda y cuesta llegar a Quibdó desde Mercado Libre y Amazon? Tu ventaja: entregar hoy.']],
  ingles: 'Phrasal verbs de tecnología: set up, turn on, turn off, log in, log out, plug in, back up, sign up, look up, shut down.' },

8: { foco: 'Arrays y objetos, Git y subtítulos perfectos.',
  app: [
    ['2.3','Arrays','Array de 10 productos: push, length y recorrido con for…of.'],
    ['2.3','Arrays de objetos','productos = [{nombre, precio, categoria, tienda}]: filter por precio, map de nombres, find por nombre.'],
    ['2.3','Repaso de métodos','Escribe sin mirar filter, map, find y sort con un ejemplo cada uno.'],
    ['3.6','Prototipo: búsqueda','Figma: pantalla de búsqueda con filtros. Completa el prototipo de 5 pantallas.'],
    ['5.2','Git: qué es','Video de Git en español (15 min): repositorio, commit y push.'],
    ['5.2','GitHub','Crea cuenta, instala GitHub Desktop y sube la landing NEXO PC como repositorio.'],
    ['4.7','Tiendas fundadoras (1)','Escoge las 10 tiendas con más interés y escríbeles: “¿Quieres aparecer gratis en el lanzamiento?”.'],
    ['2.3','Ordenar productos','sort por precio de menor a mayor y al revés.'],
    ['2.3','Mini reto','Función que reciba categoría y precio máximo y devuelva los productos que cumplen.'],
    ['4.7','Seguimiento de fundadoras','Anota respuestas (sí / no / tal vez). Meta: 3 “sí” esta semana.']],
  video: [
    ['5.1','Tutorial: títulos','Títulos básicos y tipografías legibles en celular.'],
    ['5.2','Subtítulos automáticos','Genera subtítulos con voz a texto y corrige cada error.'],
    ['5.3','Subtítulos estilo reel','Grandes, con palabra resaltada y dentro de la zona segura 9:16.'],
    ['5.8','Video educativo','“Cómo elegir un mouse gamer” en 60 s con subtítulos perfectos.']],
  agencia: [
    ['4.1','Meta Blueprint','Curso gratis de Meta Blueprint sobre cómo crear anuncios.'],
    ['4.2','Estructura de campaña','Campaña → conjunto de anuncios → anuncio, y los objetivos.'],
    ['2.2','Guion de anuncio','2 guiones de anuncio de 15 s para una campaña de mensajes a WhatsApp.'],
    ['4.3','Segmentación','Público: Quibdó + radio, 16–35 años, intereses gaming. Todavía sin publicar.']],
  nexo: [
    ['1.5','Mantenimiento','Limpieza, pasta térmica y orden de cables. Haz 1 mantenimiento con temperaturas antes y después.'],
    ['4.1','Mayoristas','Investiga Unilago (Bogotá), CC Monterrey (Medellín) y distribuidores mayoristas. Anota contactos.']],
  ingles: 'Números y precios: How much is it? / It costs… / discount / price / total / change / cash / transfer / hundred / thousand.' },

9: { foco: 'El DOM: tu código empieza a pintar la página.',
  app: [
    ['2.4','El DOM','querySelector, textContent, innerHTML, classList. Cambia textos de tu página con JS.'],
    ['2.4','Pintar productos','Genera las tarjetas de producto desde el array (createElement o template strings).'],
    ['2.4','Repaso del DOM','Los 5 métodos del DOM que más usaste y qué hacen.'],
    ['3.7','Prepara la prueba de usabilidad','3 tareas: encontrar una tienda de celulares, ver su horario y escribirle por WhatsApp.'],
    ['2.5','Eventos','addEventListener("click"): botón que muestra u oculta detalles del producto.'],
    ['2.5','Buscador en vivo','Input que filtra mientras escribes (evento input + filter + toLowerCase).'],
    ['3.7','Pruebas (1–3)','Prueba el prototipo de Figma con 3 personas. Anota dónde dudan sin explicarles.'],
    ['2.5','Filtro por categoría','Botones de categoría que filtran los productos.'],
    ['3.7','Pruebas (4–5) + cambios','2 personas más y la lista de 5 cambios prioritarios.'],
    ['7.1','Nombre de la app','10 nombres. Verifica Play Store, Instagram y dominio. Escoge 1.']],
  video: [
    ['6.1','Tutorial: keyframes','Keyframes de posición, escala y opacidad.'],
    ['6.1','Zoom suave','3 zooms suaves (Ken Burns) en fotos de productos.'],
    ['6.3','Rampas de velocidad','Speed ramp (rápido–lento–rápido) en una toma de producto girando.'],
    ['5.4','Textos animados','Anima títulos con keyframes y guarda 2 como preset.']],
  agencia: [
    ['6.1','Nombre de la agencia','10 nombres. Verifica que estén libres en Instagram.'],
    ['6.2','Perfil de la agencia','Instagram y WhatsApp Business de la agencia con bio clara.'],
    ['2.1','Ganchos para negocios','10 ganchos para dueños de negocio en Quibdó.'],
    ['6.7','Contenido de autoridad','Graba tu primer tip: “Cómo aparecer en Google Maps gratis”.']],
  nexo: [
    ['3.2','Analiza la encuesta','Los 5 productos más pedidos y el precio que pagarían.'],
    ['7.1','Ventas por encargo','Ofrece a 5 conocidos conseguirles periféricos por encargo, sin comprar inventario.']],
  ingles: 'Describir productos: fast, reliable, wireless, durable, lightweight, affordable, powerful, quiet, bright, compatible.' },

10: { foco: 'localStorage, alcance del MVP y efectos con IA.',
  app: [
    ['2.6','localStorage','setItem, getItem, JSON.stringify/parse. Guarda un contador de visitas.'],
    ['2.6','Favoritos','Botón ❤ en cada producto que se guarda y sigue ahí al recargar.'],
    ['5.1','Cliente y servidor','Video sobre servidor, base de datos y API. Explícalo en una nota de voz de 1 min.'],
    ['3.8','Diseño final v1','Aplica los 5 cambios de las pruebas al diseño de Figma.'],
    ['6.1','Alcance del MVP','Lista SÍ (directorio, perfil, productos, WhatsApp) y NO (pagos, pedidos, chat).'],
    ['2.6','Pedido por WhatsApp','Lista “Mi pedido” que genera un mensaje de WhatsApp con todos los productos (encodeURIComponent).'],
    ['4.7','Tiendas fundadoras (2)','Visita o escribe a las que dijeron “tal vez”. Meta: 6 “sí”.'],
    ['5.2','Commit y push','Sube tu catálogo a GitHub con mensajes claros.'],
    ['2.7','JSON','Pasa tus productos a productos.json y entiende su formato.'],
    ['4.7','Seguimiento','Actualiza la hoja de fundadoras y agradece a quienes dijeron sí.']],
  video: [
    ['6.4','Tutorial: quitar fondo','Croma (pantalla verde) y recorte inteligente con IA.'],
    ['6.4','Recorte con IA','Separa a una persona del fondo y ponle detrás un fondo de NEXO PC.'],
    ['6.5','Seguimiento de movimiento','Pega un texto o flecha a un producto en movimiento.'],
    ['6.7','Auto Reframe','Convierte un video 16:9 a 9:16 y revisa el encuadre.']],
  agencia: [
    ['7.1','Servicios','3 paquetes: Básico (Google + WhatsApp Business), Contenido (reels al mes) y Pauta (anuncios).'],
    ['7.2','Precios','Horas por paquete × tu valor hora + costos. Ponle precio a los 3.'],
    ['2.2','Guiones de servicios','3 guiones de 30 s explicando cada paquete.'],
    ['7.3','Prospectos','30 negocios para ofrecerles servicios (cruza con tu lista de la app).']],
  nexo: [
    ['1.6','Periféricos gaming','Switches de teclado, DPI y polling rate, Hz y tipo de panel de monitores.'],
    ['6.1','Figura legal','Persona natural comerciante vs SAS: costos, ventajas y cuándo conviene cada una.']],
  ingles: 'Correos y mensajes: Dear…, I would like to…, Could you send me…, Attached…, Best regards, quote, order, delivery, invoice, deadline.' },

11: { foco: 'fetch/async y tu Proyecto 2 publicado.',
  app: [
    ['2.7','fetch y async/await','Carga productos.json con fetch y async/await. Maneja errores con try/catch.'],
    ['2.8','Proyecto 2 (1)','Catálogo que carga JSON, con buscador, filtros por categoría y favoritos.'],
    ['2.7','Repaso asíncrono','En 3 líneas: qué es una promesa y por qué se usa await.'],
    ['3.8','Panel de la tienda','En papel: pantalla para agregar y editar productos.'],
    ['2.8','Botón WhatsApp','Botón “Pedir” en cada producto que abre wa.me con mensaje prellenado.'],
    ['2.8','Proyecto 2 (2)','Pule los estilos con tu guía y que funcione perfecto en tu A25.'],
    ['4.7','Tiendas fundadoras (3)','Meta: 8 “sí”.'],
    ['2.8','Errores en consola','Corrige todos los errores y advertencias de la consola.'],
    ['2.8','Publica el Proyecto 2','Publícalo en Netlify o GitHub Pages y pide a 3 personas que lo usen.'],
    ['4.8','Contenido de tiendas','Carpeta de Drive por tienda fundadora: pide logo, fotos y 10 productos con precio.']],
  video: [
    ['7.3','Tutorial: cámara del A25','Fija enfoque y exposición (mantén presionado), 1080p a 30/60 fps y modo Pro.'],
    ['7.2','Luz natural','Graba el mismo producto con luz de ventana, contraluz y luz del techo. Compara.'],
    ['7.5','Tomas de producto','Como un comercial: fondo limpio, giro, detalles cerca y manos usándolo.'],
    ['6.8','Comercial de 30 s','Comercial gamer (unboxing) con todo lo aprendido.']],
  agencia: [
    ['7.4','Mini-auditoría','Plantilla de mini-auditoría gratis: 5 puntos de redes y Google de un negocio.'],
    ['7.4','Primeras auditorías','Haz 2 mini-auditorías de negocios de tu lista.'],
    ['7.6','Objeciones','Respuestas a: “está caro”, “ya tengo quien me maneje”, “no creo en redes”.'],
    ['7.5','Propuesta en PDF','Propuesta comercial de 3 páginas en Canva.']],
  nexo: [
    ['4.3','Logística a Quibdó','Cotiza envíos desde Bogotá/Medellín con Servientrega, Coordinadora e Interrapidísimo.'],
    ['2.5','Presupuesto de apertura','Primer borrador: inventario, arriendo, adecuación, legal y marketing.']],
  ingles: 'Redes y marketing: followers, reach, engagement, post, story, ad, brand, customer, sale, feedback.' },

12: { foco: 'Firebase, portafolio de video y revisión de 3 meses.',
  app: [
    ['5.3','Firebase: crear proyecto','console.firebase.google.com: proyecto en plan gratis (Spark) y activa Firestore.'],
    ['5.4','Modelo de datos','Colecciones “tiendas” y “productos”. Carga 3 tiendas de prueba a mano.'],
    ['5.3','Repaso de Firebase','Qué es colección, documento y campo en Firestore.'],
    ['6.2','Wireframe final de inicio','Ajusta en papel la pantalla de inicio que vas a programar.'],
    ['5.5','Conectar Firebase','Agrega el SDK web de Firebase a tu proyecto.'],
    ['5.5','Leer de Firestore','Reemplaza productos.json por datos de Firestore (getDocs).'],
    ['4.7','Cierre de fundadoras','Meta: 10 tiendas. Si no llegas, escribe por qué y qué cambiar.'],
    ['5.5','Revisión de 3 meses','¿Cuántas metas de App Web cumpliste? Ajusta el plan con honestidad.'],
    ['6.2','Inicio del MVP','Programa el inicio: buscador, categorías y tiendas destacadas desde Firestore.'],
    ['4.8','Recolecta contenido','¿Qué tiendas ya enviaron fotos y productos? Recuérdales a las que no.']],
  video: [
    ['7.6','Tutorial: lista de tomas','Aprende a hacer un shot list y escribe uno para tu próximo cliente.'],
    ['8.1','Tu mejor trabajo','Escoge los 8 mejores momentos de todo lo que has editado.'],
    ['8.1','Reel portafolio','Reel de 60 s con música y tu contacto al final.'],
    ['8.2','Precios','Investiga precios de edición en Colombia y arma tu lista de precios.']],
  agencia: [
    ['7.4','Envía auditorías','Envía las auditorías por WhatsApp con un mensaje corto y ofrece una llamada.'],
    ['7.6','Practica la venta','Ensayo de llamada de venta con un amigo. Grábate.'],
    ['6.8','Caso de estudio','Ofrece 1 trabajo con descuento o canje a cambio de testimonio y permiso de mostrar resultados.'],
    ['8.6','Revisión trimestral','¿Qué cumpliste? Sé honesto con tu tiempo real (4,2 h por semana).']],
  nexo: [
    ['3.8','Estudio de mercado','Junta competencia, encuesta y logística en un documento de 2 páginas.'],
    ['2.3','Revisión de ahorro','Revisa el ahorro de los 3 meses y las metas de NEXO PC cumplidas.']],
  ingles: 'Repaso general: escoge las 20 palabras que más te costaron en estas 12 semanas y úsalas en frases.' }
};

// Tips para los videos de clientes (rotan cada semana)
window.TIPS_CLIENTE = [
  'Organiza los archivos del cliente con tu sistema de carpetas antes de editar.',
  'Usa los atajos de teclado que aprendiste: cronometra cuánto te demoras.',
  'Limpia las pausas con la detección de silencios y revisa a mano.',
  'Revisa los niveles: voz entre -12 y -6 dB, música baja.',
  'Graba 10 tomas de B-roll del negocio del cliente.',
  'Corta al ritmo de la música y agrega 3 efectos de sonido.',
  'Corrige el color y cuida los tonos de piel.',
  'Pon subtítulos automáticos y corrige cada palabra.',
  'Agrega un zoom suave con keyframes en el gancho.',
  'Prueba Auto Reframe para sacar una versión vertical.',
  'Fija enfoque y exposición en el celular antes de grabar.',
  'Pídele al cliente un testimonio para tu portafolio.'
];
