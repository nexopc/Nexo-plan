# Cómo se escribe cada actualización semanal

## Quién es el usuario
Cristóbal, 18 años, Quibdó (Chocó, Colombia). Estudia en el colegio y trabaja en una tienda de computadores.
Proyectos: **NEXO PC** (tienda de hardware y gaming, meta 4 años), **App Web** (catálogo de tiendas locales, 6 meses),
**Edición de video** con Filmora 16 (6 meses), **Agencia de marketing** (12 meses) y **Hábitos**.
Español de Colombia, tono directo y motivador, con datos reales y críticas constructivas.

## Calendario
- Semana 1 = lunes 26 de octubre de 2026. Semana N empieza el lunes `2026-10-26 + 7·(N-1)` días.
- Las semanas 1–12 ya vienen dentro de la app (`fuente/sesiones.js`). Solo se publican semanas nuevas (13 en adelante),
  o una semana anterior si hay que corregirla.

## Formato de `plan.json`
```json
{
  "version": "AAAA-MM-DD-semN",          // debe cambiar en cada publicación
  "mensaje": "Texto corto para la semana que empieza",
  "sesiones": {
    "13": {
      "foco": "Frase con el foco de la semana",
      "app":     [["meta","Título","Tarea concreta"], … 10 sesiones],
      "video":   [ … 4 sesiones ],
      "agencia": [ … 4 sesiones ],
      "nexo":    [ … 2 sesiones ],
      "ingles":  "Vocabulario de tecnología de la semana (10 palabras o frases)"
    }
  }
}
```
`sesiones` es acumulativo: deja las semanas ya publicadas y agrega las nuevas.

## Orden de los bloques (cada lista sigue este orden)
- **app** (10): Lun 5:30 (1 h) · Lun 17:00 (2 h) · Mar 5:30 (30 min) · Mar 13:20 (70 min, **en papel, en el colegio**) · Mié 5:30 (30 min) · Mié 17:00 (2 h) · Jue 5:30 (30 min) · Vie 5:30 (30 min) · Sáb 5:30 (1,5 h) · Dom 11:00 (1 h)
- **video** (4): Jue 13:20 (70 min, **tutorial en el celular**) · Jue 19:00 (1,5 h) · Vie 17:00 (2 h) · Dom 12:00 (1,5 h)
- **agencia** (4): Lun 19:30 (1 h) · Mié 19:30 (1 h) · Vie 13:20 (70 min, **guiones de reel en papel/celular**) · Dom 19:30 (1 h)
- **nexo** (2): Mar 19:00 (1,5 h) · Vie 19:30 (1 h)

Las sesiones de 30 minutos son repasos o tareas cortas. Las de 2 horas son la práctica principal.

## Reglas
- Cada sesión apunta a una meta real (`"1.3"` = área 1, meta 3 del proyecto; ver `fuente/metas-*.js`).
- Continúa la secuencia de la semana anterior: no repitas temas ya dados, avanza en orden lógico.
- Tareas concretas y medibles, que quepan en el tiempo del bloque.
- Datos reales (precios, herramientas, leyes colombianas). Si un dato puede haber cambiado, dilo.
- El ejercicio NO va aquí: la app lo sube de nivel sola (`fuente/ejercicio.js`).

## Campo "app" (NO borrarlo)
`plan.json` tiene un campo `app` con la última versión de la app (`version` = número entero, `apk` = enlace de descarga).
Cuando la app instalada ve un `version` mayor que el suyo, muestra el botón "Descargar". Las actualizaciones semanales
deben conservar este campo tal cual. Solo cambia cuando se publica un APK nuevo en `apk/NEXO-PLAN.apk`
(firmado con la misma llave de NEXO PLAN y con versionCode mayor).
