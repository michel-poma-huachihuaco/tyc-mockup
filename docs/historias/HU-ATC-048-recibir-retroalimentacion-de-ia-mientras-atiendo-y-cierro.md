---
id: "HU-ATC-048"
tipo: hu
titulo: "Recibir retroalimentación de IA mientras atiendo y cierro"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.4.0"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-11-03"
relacionados: ["FT-ATC-19", "EP-ATC-09", "HU-ATC-047", "HU-ATC-068", "HU-ATC-069", "HU-ATC-070", "HU-ATC-071", "HU-ATC-072", "ADR-007"]
tags: [hu, plt-04, flexible]
ui: true
---

# HU-ATC-048 — Recibir retroalimentación de IA mientras atiendo y cierro

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como gestor de tickets quiero que la IA me sugiera respuesta y me avise qué criterios de cierre faltan para cerrar con mejor calidad y aprender en el momento.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-048 | Alta · entra en la Etapa 1 (ya no es flexible; lo confirma el PO) | **por estimar por el equipo** (las 5 h del PO no alcanzan para el pipeline) | Dev 3 (Michel) | (por definir) | (por definir) | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** HU-ATC-047 (RF-SVC-047 es predecesora de RF-SVC-048, PLT-03) · Dependencias externas: DEP-14 (proveedor de IA aprobado; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: las operaciones `pedirSugerenciaIa`, `decidirSugerenciaIa` exigen rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5); la HU está fuera de la Etapa 1, P-025)

**La necesitan:** ninguna

**Alcance en la Etapa 1 (decisión del 3-nov-2026, reemplaza la nota de P-025):** el Núcleo de IA entra en la Etapa 1 con la arquitectura de `adr/ADR-007` v0.9 (módulo Java en el monolito, pipeline con guardianes, Azure OpenAI). HU-048 se reescribe y se suman HU-068 a HU-072 (propuestas). Las horas están **por estimar por el equipo**; R-01 queda como riesgo crítico para el PO. HU-053 sigue fuera de la Etapa 1. Pendiente: que el PO acepte las HU nuevas y que el Líder Técnico apruebe el ADR-007.

**Requerimiento de origen:** El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. Feedback presentación · ítem 8

## Criterios de aceptación (Gherkin, verificables)

Esta HU es el **orquestador del Núcleo de IA**: recibe el ticket, encadena los guardianes de las HU-068 a HU-071 y entrega el resultado al gestor. Los CA originales del PO (CA-01 a CA-03) se conservan y se amplían.

```gherkin
Escenario: CA-01 · Borrador verificado (amplía el CA-01 del PO)
  Dado un ticket que el gestor abre o va a cerrar
  Cuando pide ayuda o el sistema lo procesa
  Entonces el Núcleo entrega un borrador con la fuente de cada dato y la lista de criterios de cierre pendientes de la guía; el gestor acepta, edita o descarta.

Escenario: CA-02 · Registro de la decisión (CA-02 del PO)
  Dado una sugerencia de IA
  Cuando el gestor decide
  Entonces queda registrada (aceptada/editada/descartada) con el veredicto de los guardianes y sin datos personales en el registro.

Escenario: CA-03 · Datos personales (CA-03 del PO)
  Dado un texto con DNI o datos de tarjeta
  Cuando se envía al modelo
  Entonces los datos se anonimizan antes de salir y el dato real se inserta después, desde la consulta al sistema.

Escenario: CA-04 · Nada sale sin el gestor (nuevo)
  Dado un borrador listo
  Cuando nadie lo aprueba
  Entonces no se envía al cliente; no existe ruta del Núcleo al cliente sin acción del gestor (RN-SVC-032).

Escenario: CA-05 · Escalamiento (nuevo)
  Dado un caso que el Núcleo no puede resolver
  Cuando termina
  Entonces el ticket vuelve al gestor como «needs_human» con motivo del catálogo (HU-071), sin borrador parcial.

Escenario: CA-06 · Proveedor intercambiable (nuevo)
  Dado el proveedor de modelo configurado
  Cuando se cambia por otro o por el simulador
  Entonces el módulo funciona igual: el modelo está detrás de un puerto (ADR-004).
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Respuesta automática de la IA al cliente; entrenamiento o fine-tuning del modelo; búsqueda por significado de documentos del cliente (HU-053).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Ticket (asistente)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-016 SVC_AI_SUGGESTION_LOG, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-14
- Datos de prueba / analítica (PLT-04): Evento ia_sugerencia {decision} Preguntas abiertas ¿Qué proveedor o modelo de IA esta aprobado por TI y Seguridad? ¿Se permite enviar datos del cliente al modelo o solo texto anonimizado?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · atención asistida
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · sugerencia de IA
- 6.5 Diagrama entidad-relación · guías y sugerencias

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota de alcance: fuera de la Etapa 1 por P-025 (decisión del equipo del 26-oct-2026, `analisis/decisiones.md` v0.8); sus tareas pasan sin cambios a `roadmap/alcance-diferido.md` y en `backlog/tareas/` queda una tarea de 0 h que lo dice. El bloque «Depende de / La necesitan» conserva las dependencias del PO para cuando se retome. No cambia texto del PO. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.2) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)

Historial: 1.4.0 · 2026-11-03 · Jesús Chávez Elías, con IA · Arquitectura del Núcleo de IA del Líder del equipo, adaptada a ATC (`adr/ADR-007` v0.9): entra en la Etapa 1 (reemplaza la salida por P-025); CA ampliados (CA-04 a CA-06); nuevas HU-068 a HU-072; horas por estimar. No se borra el texto del PO. — Revisado por: (pendiente)
