---
id: "HU-ATC-018"
tipo: hu
titulo: "Exponer tickets a UrbeMind por API y eventos"
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

Va en `docs/historias/HU-ATC-018-exponer-tickets-api-evento-urbemind.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-06 / docs/analisis/BRD.md
- Como producto UrbeMind (sistema) quiero crear y consultar tickets por API y recibir eventos de cambio de estado para operar como un canal más sin acoplarme a la base del holding.
- Requerimiento origen (RF-SVC-018 — Exponer tickets por API/evento a UrbeMind): El sistema debe exponer creación y consulta de tickets vía API/evento a UrbeMind, sin JOIN físico. · Proceso: PROC-SVC-007 (Integracion UrbeMind (CITY_INCIDENT)) · Fuente: PLT-04 · HU-ATC-018 · traza RF-SVC-018
- Etapa del proyecto (RN-SVC-043): **Etapa 2** — Integración con UrbeMind / NEXUS / DAEDALUS · tecnología de terceros en construcción · cierre estimado 15-dic-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **5 h** · Asignado: **Dev 4** (2026-10-29 → 2026-10-29) · Depende de HU: HU-ATC-017 · Dependencias externas: DEP-09 (UrbeMind: contrato de API/eventos + decisión de alcance)
- Observaciones de alcance: Fuera de alcance: Cambios dentro de la app UrbeMind.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · incidencia de ciudad | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · integración UrbeMind | 6.5 Diagrama entidad-relación · incidencias de ciudad
- Referencia visual / plantilla en prototipo: No aplica (integración)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Exponer tickets a UrbeMind por API y eventos

Escenario: CA-01 · Creación
  Dado una incidencia reportada en UrbeMind
  Cuando UrbeMind llama al API de creación
  Entonces se crea un ticket CITY_INCIDENT y se devuelve su número.

Escenario: CA-02 · Eventos
  Dado un ticket de UrbeMind que cambia de estado
  Cuando ocurre el cambio
  Entonces se publica un evento que UrbeMind puede consumir.

Escenario: CA-03 · Seguridad (agregado por el PO)
  Dado una llamada sin credencial válida
  Cuando llega al API
  Entonces se rechaza y queda en el log.
```

- Evidencia / prueba esperada (PLT-04): `Métrica de llamadas y errores por endpoint`

## Reglas de negocio

- RN-SVC-005 (Empresa y línea obligatorias; ContractID opcional en CITY_INCIDENT): Todo ticket exige CompanyID y BusinessLineID; en incidencias urbanas ContractID puede ser opcional o apuntar a CITY_SERVICE_FEE.
- RN-SVC-043 (Etapas del proyecto): Etapa 1 (salida 30-oct-2026): todo el alcance funcional, con usuarios, roles y líderes locales y sin UrbeMind. Etapa 2 (cierre estimado 15-dic-2026): integraciones con NEXUS, DAEDALUS y UrbeMind, que dependen de tecnología aún en construcción. Ninguna funcionalidad de la Etapa 1 se bloquea por estas integraciones.
- RNF-INT-003 frontera API/evento.

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET
- Entidades y dependencias declaradas en PLT-04: API Gateway, bus de eventos · DEP-09
- Entidades/campos que LEE: SVC_TICKET (consulta)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (creación vía API/evento)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
