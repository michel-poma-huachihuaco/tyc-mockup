---
id: "HU-ATC-048"
tipo: hu
titulo: "Recibir retroalimentación de IA mientras atiendo y cierro"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-19", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-048-retroalimentacion-ia-agente-atencion.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets quiero que la IA me sugiera respuesta y me avise qué criterios de cierre faltan para cerrar con mejor calidad y aprender en el momento.
- Requerimiento origen (RF-SVC-048 — Retroalimentacion de IA al agente durante la atencion): El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. Feedback presentación · ítem 8 · Proceso: PROC-SVC-018 (Asistencia al agente para resolver y cerrar) · Fuente: PLT-04 · HU-ATC-048 · traza RF-SVC-048
- Etapa del proyecto (RN-SVC-043): **Fuera de la Etapa 1 (Etapa 3, por definir)** — se integra a futuro con el asistente interno del gestor (ADR-009); decisión D-12 de 2026-10-19. La iteración y las fechas de la línea de planificación (PLT-04 v1.2) ya no aplican.
- Planificación (PLT-04 v1.2): Prioridad: **PODRIA** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 3** (2026-10-22 → 2026-10-23) · *Flexible* · Depende de HU: HU-ATC-047 · Dependencias externas: DEP-14 (Proveedor de IA aprobado por TI y Seguridad, con política de datos personales)
- Observaciones de alcance: Fuera de alcance: Respuesta automática de la IA al cliente.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · atención asistida | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · sugerencia de IA | 6.5 Diagrama entidad-relación · guías y sugerencias

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Recibir retroalimentación de IA mientras atiendo y cierro

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

- Evidencia / prueba esperada (PLT-04): `Evento ia_sugerencia {decision} Preguntas abiertas ¿Qué proveedor o modelo de IA esta aprobado por TI y Seguridad? ¿Se permite enviar datos del cliente al modelo o solo texto anonimizado?`

## Reglas de negocio

- RN-SVC-032 (IA asesora, el agente decide): La IA solo sugiere: el agente acepta, edita o descarta; ninguna respuesta se envia al cliente sin accion del agente y no se envian datos personales sin anonimizar a modelos externos.
- RN-SVC-012 (DLP en bitacoras): Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Ticket (asistente) — Mockups: P-13 "Guía de solución y asistente IA" (Panel de guía y asistente IA en el ticket)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/sugerencia-ia` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-016 SVC_AI_SUGGESTION_LOG, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-14
- Entidades/campos que LEE: SVC_TICKET, guía de solución
- Entidades/campos que ESCRIBE o modifica: SVC_IA_SUGGESTION (sugerencia, decisión del gestor)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_IA_SUGGESTION', el diccionario de F4 lo llama 'SVC_AI_SUGGESTION_LOG' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
