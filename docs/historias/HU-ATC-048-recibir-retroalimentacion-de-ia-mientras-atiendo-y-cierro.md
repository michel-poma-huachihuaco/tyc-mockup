---
id: "HU-ATC-048"
tipo: hu
titulo: "Recibir retroalimentación de IA mientras atiendo y cierro"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-19", "EP-ATC-09", "HU-ATC-047"]
tags: [hu, plt-04, flexible]
ui: true
---

# HU-ATC-048 — Recibir retroalimentación de IA mientras atiendo y cierro

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como gestor de tickets quiero que la IA me sugiera respuesta y me avise qué criterios de cierre faltan para cerrar con mejor calidad y aprender en el momento.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-048 | Podría · flexible | 5 h con IA | Dev 3 (Michel) | 2 | 27-oct-2026 → 28-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** HU-ATC-047 (RF-SVC-047 es predecesora de RF-SVC-048, PLT-03) · Dependencias externas: DEP-14 (proveedor de IA aprobado; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: las operaciones `pedirSugerenciaIa`, `decidirSugerenciaIa` exigen rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5); la HU está fuera de la Etapa 1, P-025)

**La necesitan:** ninguna

**Alcance:** fuera de la Etapa 1 por decisión del equipo del 26-oct-2026 (P-025): alcance flexible R-01 del PO; se retoma en una etapa posterior.

**Requerimiento de origen:** El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. Feedback presentación · ítem 8

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Sugerencia
  Dado un gestor de tickets que redacta una respuesta
  Cuando pide ayuda o va a cerrar
  Entonces la IA sugiere texto y lista los criterios de cierre pendientes; el gestor de tickets acepta, edita o descarta.

Escenario: CA-02 · Registro de la decisión
  Dado una sugerencia de IA
  Cuando el gestor de tickets decide
  Entonces queda registrada (aceptada/editada/descartada) sin datos personales en el registro.

Escenario: CA-03 · Datos personales (agregado por el PO)
  Dado un texto con DNI o datos de tarjeta
  Cuando pido ayuda a la IA
  Entonces los datos se anonimizan antes de enviarse al modelo.
```

## Reglas de negocio

- RN-SVC-032 IA asesora, el gestor de tickets decide
- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Respuesta automática de la IA al cliente.

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
