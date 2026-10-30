---
id: "HU-ATC-005"
tipo: hu
titulo: "Registrar interacciones visibles o internas con evidencia"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-02", "EP-ATC-01", "HU-ATC-004"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-005 — Registrar interacciones visibles o internas con evidencia

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-01 / FT-ATC-02
- Como colaborador de área quiero registrar mensajes al cliente y notas internas, con fotos o documentos adjuntos para separar lo que ve el cliente de lo interno y conservar la evidencia del caso.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-005 | Debe | 5 h con IA | Dev 1 (Brayan) | 1 | 23-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-004 (RF-SVC-004 es predecesora de RF-SVC-005, PLT-03) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 de la traza del PLT-03, DT-03)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe registrar cada interacción con canal, gestor de tickets, visibilidad al cliente y evidencia multimedia adjunta.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Primera respuesta
  Dado un ticket sin respuestas
  Cuando registro la primera respuesta visible al cliente
  Entonces se completa el hito FirstRespondedDateTime.

Escenario: CA-02 · Evidencia
  Dado una incidencia con foto o video
  Cuando la adjunto
  Entonces queda dentro de la interacción, sin tabla de adjuntos aparte.

Escenario: CA-03 · Nota interna (agregado por el PO)
  Dado que marco una interacción como interna
  Cuando el cliente consulta su caso en Mi Portal
  Entonces la nota no se muestra.

Escenario: CA-04 · DLP (agregado por el PO)
  Dado que escribo un DNI o una tarjeta en una nota de bitácora
  Cuando intento guardarla
  Entonces el sistema advierte que no se permite PII en ese campo.
```

## Reglas de negocio

- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Chat en vivo; edición de interacciones enviadas.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle de ticket (Interacciones)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-004 SVC_TICKET_INTERACTION · RNF-SEC-008
- Datos de prueba / analítica (PLT-04): Evento interacción_registrada {tipo, visible, adjuntos}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ciclo de vida del ticket
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · cambio de estado e interacción
- 6.5 Diagrama entidad-relación · estado, interacciones e hitos

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
