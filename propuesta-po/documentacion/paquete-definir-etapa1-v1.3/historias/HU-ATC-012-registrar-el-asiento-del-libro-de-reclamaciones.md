---
id: "HU-ATC-012"
tipo: hu
titulo: "Registrar el asiento del Libro de Reclamaciones"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-05", "EP-ATC-03", "HU-ATC-006"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-012 — Registrar el asiento del Libro de Reclamaciones

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-03 / FT-ATC-05
- Como responsable legal de reclamos quiero que cada queja o reclamo genere su asiento con hechos, pedido y monto reclamado para dejar constancia formal conforme al formato regulado.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-012 | Debe | 4 h con IA | Dev 1 (Brayan) | 1 | 26-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-006 (dependencia lógica EP-ATC-01 → EP-ATC-03 del Gantt del PLT-01 y esta es la última HU de EP-ATC-01) · Dependencias externas: DEP-05 (validación legal del Libro: asiento, textos y plazos; PLT-03, PLT-04 y PLT-05), DEP-06 (repositorio documental y GLI; PLT-03)

**La necesitan:** HU-ATC-013, HU-ATC-014

**Requerimiento de origen:** El sistema debe crear el asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Correlativo
  Dado dos asientos de la misma empresa en establecimientos distintos
  Cuando se numeran
  Entonces cada establecimiento lleva su propio correlativo.

Escenario: CA-02 · Monto y moneda
  Dado un reclamo con monto
  Cuando lo guardo sin moneda
  Entonces el sistema lo rechaza; sin monto, ambos campos quedan vacíos.

Escenario: CA-03 · Empresa inmutable (agregado por el PO)
  Dado un asiento registrado
  Cuando alguien intenta cambiar su razón social
  Entonces la operación se rechaza.
```

## Reglas de negocio

- RN-SVC-004
- RN-SVC-013 empresa inmutable en el libro

**Fuera de alcance:** Hoja de reclamación pública web.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Libro de Reclamaciones
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY · DEP-05 validación legal
- Datos de prueba / analítica (PLT-04): Evento asiento_libro {tipo, empresa, establecimiento}
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
