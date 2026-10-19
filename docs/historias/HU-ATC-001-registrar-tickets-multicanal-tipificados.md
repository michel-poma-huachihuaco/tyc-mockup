---
id: "HU-ATC-001"
tipo: hu
titulo: "Registrar un ticket tipificado desde cualquier canal"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-01", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-001-registrar-tickets-multicanal-tipificados.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como gestor de tickets quiero registrar la solicitud del cliente en un ticket con canal, cliente, empresa, línea de negocio, tipo, prioridad y resumen para tipificar cada solicitud desde el primer contacto y no volver a pedir datos.
- Requerimiento origen (RF-SVC-001 — Registrar tickets multicanal tipificados): El sistema debe registrar tickets de teléfono, WhatsApp y correo con canal, cliente, empresa (RUC), línea de negocio, tipo, prioridad, resumen y descripción. · Proceso: PROC-SVC-001 (Registro multicanal del ticket) · Fuente: PLT-04 · HU-ATC-001 · traza RF-SVC-001
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Etapa 1 con usuarios y roles locales; el SSO de NEXUS entra en la Etapa 2 (RF-SVC-061)
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **6 h** · Asignado: **Dev 1** (2026-10-19 → 2026-10-20) · Dependencias externas: DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato))
- Observaciones de alcance: Fuera de alcance: Creación automática por conectores de WhatsApp y correo (pendientes de producto).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ciclo de registro de la solicitud | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro de un ticket | 6.5 Diagrama entidad-relación · datos del registro

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar un ticket tipificado desde cualquier canal

Escenario: CA-01 · Campos obligatorios
  Dado que registro un ticket nuevo
  Cuando intento guardarlo sin empresa (RUC) o sin línea de negocio
  Entonces el sistema no lo guarda y señala los campos faltantes; empresa y línea no se derivan de otro dato.

Escenario: CA-02 · Canal remoto sin local
  Dado que la solicitud llega por WhatsApp
  Cuando registro el ticket sin establecimiento
  Entonces el ticket se guarda con el establecimiento vacío.

Escenario: CA-03 · Cliente desde SIGDA/TAXON (agregado por el PO)
  Dado que busco al cliente por DNI o nombre
  Cuando lo selecciono
  Entonces los datos se traen del maestro único y no se crea un registro paralelo del cliente.

Escenario: CA-04 · Permiso (agregado por el PO)
  Dado que mi rol no es de atención
  Cuando intento registrar un ticket
  Entonces el sistema me lo impide y registra el intento.
```

- Evidencia / prueba esperada (PLT-04): `Evento ticket_creado {canal, tipo, prioridad, empresa}`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-005 (Empresa y linea obligatorias): CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable).
- RN-SVC-026 (Cero registros paralelos del dato de cliente): No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoria quincenal debe arrojar cero casos y crear uno es gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo Aybar Atiende › Nuevo ticket — Mockups: P-02 "Nuevo ticket" (Formulario con SLA que se congelará y señales de conflicto), P-18 "Contingencia: alta manual" (Alta manual y cola de conciliación)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-REF-001 MAE_CHANNEL, ENT-SVC-005 MAE_TICKET_TYPE, ENT-SVC-006 MAE_TICKET_PRIORITY
- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET, MAE_CHANNEL, MAE_TICKET_TYPE, MAE_TICKET_PRIORITY · DEP-01 SIGDA/TAXON
- Entidades/campos que LEE: cliente (SIGDA/TAXON), catálogo de tipos y prioridades
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (canal, cliente, empresa, línea de negocio, establecimiento, tipo, prioridad, resumen, descripción)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
