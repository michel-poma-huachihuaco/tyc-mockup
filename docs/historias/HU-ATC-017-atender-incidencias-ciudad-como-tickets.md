---
id: "HU-ATC-017"
tipo: hu
titulo: "Atender incidencias de ciudad como tickets"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-11", "EP-ATC-06", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-017-atender-incidencias-ciudad-como-tickets.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-06 / docs/analisis/BRD.md
- Como gestor de tickets quiero atender las incidencias de ciudad como tickets vinculables a un contrato o unidad para reutilizar la misma infraestructura y poder cobrar cuando corresponda.
- Requerimiento origen (RF-SVC-017 — Atender incidencias de ciudad como tickets): El sistema debe vincular opcionalmente el ticket CITY_INCIDENT a un contrato y/o unidad; si deriva en cobro, a un contrato CITY_SERVICE_FEE. · Proceso: PROC-SVC-007 (Integracion UrbeMind (CITY_INCIDENT)) · Fuente: PLT-04 · HU-ATC-017 · traza RF-SVC-017
- Etapa del proyecto (RN-SVC-043): **Etapa 2** — Integración con UrbeMind / NEXUS / DAEDALUS · tecnología de terceros en construcción · cierre estimado 15-dic-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **2 h** · Asignado: **Dev 4** (2026-10-28 → 2026-10-28) · Dependencias externas: DEP-09 (UrbeMind: contrato de API/eventos + decisión de alcance)
- Observaciones de alcance: Fuera de alcance: Facturación del cobro.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · incidencia de ciudad | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · integración UrbeMind | 6.5 Diagrama entidad-relación · incidencias de ciudad
- Referencia visual / plantilla en prototipo: Prototipo › Nuevo ticket (tipo «Incidencia de ciudad») [P-02 "Nuevo ticket"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Atender incidencias de ciudad como tickets

Escenario: CA-01 · Cobro
  Dado una incidencia que deriva en cobro
  Cuando la vinculo
  Entonces ContractID apunta a un contrato de tipo CITY_SERVICE_FEE.

Escenario: CA-02 · Sin contrato
  Dado una incidencia en un área común
  Cuando la registro
  Entonces el ticket se guarda sin contrato ni unidad.
```

- Evidencia / prueba esperada (PLT-04): `Evento incidencia_ciudad`

## Reglas de negocio

- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RN-SVC-005 (Empresa y linea obligatorias): CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable).

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET, ENT-SVC-005 MAE_TICKET_TYPE
- Entidades y dependencias declaradas en PLT-04: SVC_TICKET, MAE_TICKET_TYPE · DEP-09 · R-02 alcance
- Entidades/campos que LEE: contrato/unidad (dominio Contratos y Activos)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.ContractID (CITY_SERVICE_FEE), tipo CITY_INCIDENT
- Migración / backfill / borrado: no
- Checklist CAD-F5: Rechazado - CITY_SERVICE_FEE no esta definido en docs/datos/diccionario.md (CITY_INCIDENT si figura como valor de ejemplo de TicketTypeID) - vacio de definicion MAYOR: falta modelar el contrato de cobro CITY_SERVICE_FEE antes de G4

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
