---
id: "HU-ATC-053"
tipo: hu
titulo: "Buscar documentos del cliente por significado"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-20", "EP-ATC-10", "HU-ATC-049"]
tags: [hu, plt-04, flexible]
ui: true
---

# HU-ATC-053 — Buscar documentos del cliente por significado

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-20
- Como gestor de tickets quiero buscar en lenguaje natural dentro de los documentos del cliente para encontrar el documento aunque no sepa cómo está escrito.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-053 | Podría · flexible | 5 h con IA | Dev 4 (Daniel) | 1 | 23-oct-2026 → 26-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-049 (RF-SVC-049 es predecesora de RF-SVC-053, PLT-03) · Dependencias externas: DEP-01 (API de SIGDA/TAXON; PLT-03 y PLT-05), DEP-06 (repositorio documental y GLI; PLT-04), DEP-13 (motor de consultas de José; PLT-03 y PLT-05), DEP-14 (proveedor de IA aprobado; PLT-04), DEP-16 (Control de acceso, PJ-05: documentos según el rol del gestor, CA-02)

**La necesitan:** HU-ATC-042

**Requerimiento de origen:** El sistema debe indexar con un modelo de red neuronal (búsqueda semántica) los archivos y documentos de los clientes para que el motor de búsqueda encuentre información por significado y no solo por palabras exactas. Feedback presentación · ítem 19

## Criterios de aceptación (Gherkin, verificables)

```gherkin
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

## Reglas de negocio

- RN-SVC-036 Búsqueda respeta permisos
- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Indexación de repositorios no aprobados.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Búsqueda (documentos)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-017 SVC_SEARCH_INDEX, ENT-GOV-004 GOV_DOCUMENT_REPOSITORY · DEP-06 · DEP-14
- Datos de prueba / analítica (PLT-04): Evento busqueda_semantica Preguntas abiertas ¿Qué repositorios de documentos se indexan (S3, GLI, correo)? ¿Hay restricciones legales para indexar contratos?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · consulta del cliente
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · consulta 360
- 6.5 Diagrama entidad-relación · búsqueda y consulta

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
