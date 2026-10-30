---
id: "HU-ATC-014"
tipo: hu
titulo: "Registrar la respuesta formal con cargo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-05", "EP-ATC-03", "HU-ATC-012"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-014 — Registrar la respuesta formal con cargo

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-03 / FT-ATC-05
- Como responsable legal de reclamos quiero registrar la respuesta con la carta firmada, su cargo y la constancia del derecho a INDECOPI para acreditar una respuesta válida ante INDECOPI.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-014 | Debe | 4 h con IA | Dev 1 (Brayan) | 2 | 27-oct-2026 → 28-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-012 (RF-SVC-012 es predecesora de RF-SVC-014, PLT-03) · Dependencias externas: DEP-05 (validación legal del Libro: asiento, textos y plazos; PLT-03 y PLT-05), DEP-06 (repositorio documental y GLI; PLT-03 y PLT-04), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `registrarRespuestaFormal` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe registrar la respuesta formal (fecha, resumen, carta PDF con cargo y firmante) y la constancia del derecho a acudir a INDECOPI.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Respuesta válida
  Dado un reclamo por responder
  Cuando registro la respuesta
  Entonces se guardan CompanyResponseDate, la carta con cargo (PDF en S3, dentro del hash) y ResponderPartyID.

Escenario: CA-02 · Derecho INDECOPI
  Dado una respuesta registrada
  Cuando la consulto
  Entonces consta CustomerNotifiedOfIndecopiRight.

Escenario: CA-03 · Sin cargo (agregado por el PO)
  Dado que intento registrar la respuesta sin adjuntar el cargo
  Cuando confirmo
  Entonces el sistema no la acepta como respuesta válida.
```

## Reglas de negocio

- RN-SVC-010 respuesta válida con cargo

**Fuera de alcance:** Firma digital certificada (dependerá de un proveedor).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Libro › «Responder»
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): DEP-06 repositorio S3 · RNF-CUM-007
- Datos de prueba / analítica (PLT-04): Evento respuesta_libro {días_hábiles_usados}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · asiento del Libro de Reclamaciones
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · asiento, prórroga y respuesta
- 6.5 Diagrama entidad-relación · Libro de Reclamaciones

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
