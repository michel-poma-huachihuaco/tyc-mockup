---
id: "BRD-001"
tipo: brd
titulo: "BRD - Aybar Atiende (plataforma de atencion al cliente)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Product Owner] (Eddie Huamani)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [brd, intake, plt-01]
---

# BRD - Aybar Atiende

Va en `docs/analisis/BRD.md`. Documento 1 (F1/G1) del paquete Definir.
No existe plantilla de BRD en este repositorio (vive en el repo del SDK, no
en `aybar-atc`): este documento sigue el mismo estilo de frontmatter que
`roadmap.md`/`epica.md` y cubre exactamente los criterios de G1.

> Fuente de verdad: `docs/analisis/decisiones.md`. Si este BRD la contradice,
> manda el registro y el BRD se corrige.

## 1 Resumen y problema

**Producto**: Aybar Atiende — Plataforma de Atencion al Cliente (servicio `aybar-atc`).
**Dueño de Producto**: Eddie Huamani.

**Problema**: la atencion al cliente (reclamos, consultas, postventa,
incidencias de ciudad, formularios de eventos) se gestiona hoy sin un sistema
unico: canales y registros sueltos, sin numero de ticket correlativo
confiable, sin SLA trazable, sin plazo legal del Libro de Reclamaciones
controlado y sin evidencia auditable ante una fiscalizacion de INDECOPI.

**Vision del producto** (PLT-01 v1.2): "Toda solicitud del cliente se
registra una sola vez, se atiende con un plazo trazable y se cierra con
evidencia, sin exposicion ante INDECOPI."

## 2 Objetivos medibles

> Propuesta IA — no existia en las fuentes una lista explicita de `OBJ-NN`;
> se derivan de la vision del producto y de los requisitos no funcionales
> (RNF) ya definidos en el catalogo de requerimientos. **Pendientes de
> validacion por el PO** (ver `docs/analisis/decisiones.md` D-05).

| ID | Objetivo | Metrica | Valor objetivo | Fuente |
|---|---|---|---|---|
| OBJ-01 | Cerrar tickets dentro de un plazo trazable sin escalamiento | Cierre end-to-end del ticket | ≤ 72 horas habiles sin escalamiento | RNF-REN-005 |
| OBJ-02 | Cumplir el plazo legal del Libro de Reclamaciones | Respuestas fuera del plazo legal (15 + 15 dias habiles) | 0 | RNF-CUM-006 |
| OBJ-03 | Eliminar el riesgo de doble registro del dato de cliente | Registros paralelos del dato de cliente fuera de SIGDA/TAXON | 0 | RNF-INT-007 / RNF-REN-007... |
| OBJ-04 | Medir la experiencia del cliente de forma unificada | NPS-C = (JOU×0.45)+(POS×0.35)+(EVT×0.20) | Linea base a definir en el primer corte, meta la fija el PO | RNF-USA-001 |
| OBJ-05 | Sostener evidencia probatoria integra ante fiscalizacion | Documentos probatorios sin checksum | 0 | RNF-CUM-007 |
| OBJ-06 | Resolver con ayuda de IA sin perder control humano | Sugerencias de IA registradas y revisadas | 100% | RNF-SEC-009 |

## 3 Alcance

### Dentro (IN) — "Ahora"

Las 60 historias de usuario del plan vigente (11 epicas, 22 funcionalidades
FT-01..FT-23), incluyendo: registro multicanal de tickets, SLA con
congelamiento y alertas, derivacion y reasignacion entre areas, Libro de
Reclamaciones y apelaciones (INDECOPI), Mesa de Casos sensibles con gate
legal obligatorio a Eje 3, postventa de garantias, integracion UrbeMind,
encuestas post-atencion, monitoreo y reporting, bandeja orquestadora con
asistencia de IA al agente, consulta 360 del cliente, resolucion de contrato
por morosidad de 3 meses y formularios simples (control de acceso, buses del
Entrega Fest).

### Flexible — primero que sale si el control de alcance (27-oct) muestra atraso

RF-048 (retroalimentacion de IA durante la atencion), RF-053 (busqueda
semantica), RF-037 a RF-039 (contencion verbal en EntregaFest). No afecta la
v1.0 si se recorta.

### Fuera (OUT) — "Despues"

Conectores automaticos de WhatsApp y correo (ingreso manual/API simulada en
esta version); cualquier funcionalidad no listada en las 60 HU del catalogo
vigente.

## 4 Riesgos y supuestos

Riesgos detallados (R-01 a R-10, con dueño y mitigacion) y dependencias
(DEP-01 a DEP-15) viven en `docs/roadmap/RMP-001-aybar-atiende.md` — el BRD
no los duplica, los referencia.

**Supuestos** (PLT-01): 4 desarrolladores dedicados al 100%, asistidos por
IA; el PO acepta historias a diario; las integraciones externas se
construyen contra simuladores hasta que cada responsable entregue su API
real; PostgreSQL Multi-AZ y S3 existen en la arquitectura vigente.

**Restricciones**: plazo fijo de 10 dias habiles (19→30-oct-2026, segun el
plan de trabajo vigente); sin QA dedicado; Ley 29571 art. 24 (Libro de
Reclamaciones) y Ley 29733 (datos personales); UrbeMind solo por API/evento;
la IA solo sugiere, nunca decide (RN-SVC-032).

## 5 Aprobacion

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Stakeholder | | | [pendiente] |
| Product Owner | Eddie Huamani | | [pendiente] |

Generado por IA: contenido completo, a partir de PLT-01 (Plan Maestro de
Trabajo) y del artefacto de planificacion compartido por el usuario —
Revisado por: [pendiente, nombre y fecha]
