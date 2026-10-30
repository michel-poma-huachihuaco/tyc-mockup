---
id: "HU-ATC-065"
tipo: hu
titulo: "Ver la trazabilidad de mi ticket"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-24", "EP-ATC-06", "HU-ATC-064"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-065 — Ver la trazabilidad de mi ticket

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-06 / FT-ATC-24
- Como cliente de Aybar quiero ver en qué paso está mi ticket, qué área lo tiene y cuándo vence el plazo para no tener que llamar para preguntar cómo va mi caso.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-065 | Debe | 3 h con IA | Dev 4 (Daniel) | 2 | 2-nov-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-064 (RF-SVC-064 es predecesora de RF-SVC-065, PLT-03) · Dependencias externas: DEP-01 (API de SIGDA/TAXON: contacto del cliente; PLT-03 y PLT-05), DEP-16 (Control de acceso, PJ-05: cliente autenticado de Mi Portal, DT-04; ticket de otro cliente, CA-04 y RN-SVC-044)

**La necesitan:** HU-ATC-066

**Requerimiento de origen:** El sistema debe mostrar al cliente la línea de tiempo de su ticket: cada paso (registrado, asignado, en atención, pendiente del cliente, resuelto, cerrado) con fecha y hora, área responsable y fecha de compromiso, y avisarle por correo y WhatsApp en cada cambio de estado. Propuesta PO v1.3 · decisión de etapas del 16-oct-2026 (EP-ATC-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Línea de tiempo (agregado por el PO)
  Dado un ticket en atención
  Cuando abro su detalle en Mi Portal
  Entonces veo cada paso con fecha y hora, el área responsable y la fecha de compromiso, en el mismo orden que la bitácora de estados.

Escenario: CA-02 · Aviso de cambio (agregado por el PO)
  Dado un ticket que cambia de estado
  Cuando el gestor lo actualiza
  Entonces recibo un aviso por correo y WhatsApp con el nuevo estado y el enlace al ticket.

Escenario: CA-03 · Notas internas (agregado por el PO)
  Dado un ticket con notas internas del gestor
  Cuando veo su línea de tiempo
  Entonces las notas internas y el nombre del gestor no se muestran (RN-SVC-044).

Escenario: CA-04 · Ticket de otro cliente (agregado por el PO)
  Dado el enlace de un ticket que no es mío
  Cuando intento abrirlo
  Entonces el sistema no lo muestra y registra el intento en la bitácora.
```

## Reglas de negocio

- RN-SVC-044 visibilidad para el cliente
- RN-SVC-006 bitácora append-only

**Fuera de alcance:** Chat en vivo con el gestor.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo Aybar Atiende v2.0 › Seguimiento del ticket (línea de tiempo) adaptado a Mi Portal
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, STATUS_LOG, INTERACTION (Visible = sí) · servicio de notificaciones
- Datos de prueba / analítica (PLT-04): Evento portal_seguimiento {ticket, estado} Preguntas abiertas ¿Se muestra el nombre del área o un nombre genérico («Atención al cliente»)?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket visto por el cliente en Mi Portal
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · registro y seguimiento en Mi Portal
- 6.5 Diagrama entidad-relación · ticket del cliente y su trazabilidad

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
