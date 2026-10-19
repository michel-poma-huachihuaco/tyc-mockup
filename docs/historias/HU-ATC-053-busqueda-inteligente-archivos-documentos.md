---
id: "HU-ATC-053"
tipo: hu
titulo: "Buscar documentos del cliente por significado"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-053-busqueda-inteligente-archivos-documentos.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero buscar en lenguaje natural dentro de los documentos del cliente para encontrar el documento aunque no sepa cómo está escrito.
- Requerimiento origen (RF-SVC-053 — Busqueda inteligente en archivos y documentos del cliente): El sistema debe indexar con un modelo de red neuronal (búsqueda semántica) los archivos y documentos de los clientes para que el motor de búsqueda encuentre información por significado y no solo por palabras exactas. Feedback presentación · ítem 19 · Proceso: PROC-SVC-019 (Consulta 360 y busqueda del cliente) · Fuente: PLT-04 · HU-ATC-053 · traza RF-SVC-053
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **PODRIA** · Iteración: **I1** · Estimación: **5 h** · Asignado: **Dev 4** (2026-10-21 → 2026-10-22) · *Flexible* · Depende de HU: HU-ATC-049 · Dependencias externas: DEP-06 (Repositorio documental S3 + GOV_DOCUMENT_REPOSITORY y GLI); DEP-14 (Proveedor de IA aprobado por TI y Seguridad, con política de datos personales)
- Observaciones de alcance: Fuera de alcance: Indexación de repositorios no aprobados.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · consulta del cliente | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · consulta 360 | 6.5 Diagrama entidad-relación · búsqueda y consulta

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Buscar documentos del cliente por significado

Escenario: CA-01 · Búsqueda semántica
  Dado una búsqueda en lenguaje natural (p. ej.. «adenda de cambio de lote»)
  Cuando el gestor de tickets la ejecuta
  Entonces obtiene los documentos del cliente más relevantes con su fragmento.

Escenario: CA-02 · Documento restringido
  Dado un documento que el rol del gestor de tickets no puede ver
  Cuando busca
  Entonces no aparece en los resultados.

Escenario: CA-03 · Sin resultados (agregado por el PO)
  Dado una búsqueda sin coincidencias relevantes
  Cuando la ejecuto
  Entonces veo sugerencias de búsqueda por palabras exactas.
```

- Evidencia / prueba esperada (PLT-04): `Evento busqueda_semantica Preguntas abiertas ¿Qué repositorios de documentos se indexan (S3, GLI, correo)? ¿Hay restricciones legales para indexar contratos?`

## Reglas de negocio

- RN-SVC-036 (Busqueda respeta permisos): La busqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen.
- RN-SVC-012 (DLP en bitacoras): Prohibido registrar PII en los campos Notes_*: solo el motivo operativo del movimiento.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Búsqueda (documentos) — Mockups: P-10 "Buscador de clientes" (Resultados de clientes con botón Llamar; Documentos por significado («adenda de cambio de lote»); Cliente no encontrado: registrar como Interesado)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/clientes/{id}/documentos/buscar-semantico` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-017 SVC_SEARCH_INDEX, ENT-GOV-004 GOV_DOCUMENT_REPOSITORY · DEP-06 · DEP-14
- Entidades/campos que LEE: documentos del cliente (repositorios a confirmar), índice semántico
- Entidades/campos que ESCRIBE o modifica: índice semántico de documentos (job de indexación)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
