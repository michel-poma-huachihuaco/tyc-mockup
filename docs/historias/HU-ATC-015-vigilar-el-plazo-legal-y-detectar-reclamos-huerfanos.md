---
id: "HU-ATC-015"
tipo: hu
titulo: "Vigilar el plazo legal y detectar reclamos huérfanos"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-05", "EP-ATC-03", "HU-ATC-013"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-015 — Vigilar el plazo legal y detectar reclamos huérfanos

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-03 / FT-ATC-05
- Como responsable legal de reclamos quiero que el sistema me alerte cuando un plazo legal está por vencer y detecte reclamos sin asiento para evitar incumplimientos legales y reclamos no registrados.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-015 | Debe | 4 h con IA | Dev 1 (Brayan) | 2 | 28-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-013 (RF-SVC-013 es predecesora de RF-SVC-015, PLT-03) · Dependencias externas: DEP-05 (validación legal del Libro: asiento, textos y plazos; PLT-03 y PLT-05), DEP-06 (repositorio documental y GLI; PLT-03), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `consultarVigilanciaLibro` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** HU-ATC-016

**Requerimiento de origen:** El sistema debe vigilar por job el plazo legal (alertas LEGAL_RESPONSE_OVERDUE y LEGAL_EXTENSION_WINDOW_CLOSING) y detectar a diario tickets sin asiento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Alerta legal
  Dado un reclamo a 3 días hábiles de vencer sin prórroga
  Cuando corre el job
  Entonces se genera LEGAL_EXTENSION_WINDOW_CLOSING, sin exigir política comercial.

Escenario: CA-02 · Huérfano
  Dado un ticket activo de un tipo con RequiresComplaintBook y sin asiento al cierre del día
  Cuando corre el control diario
  Entonces se inserta GOV_INTEGRITY_EXCEPTION (ORPHAN_REFERENCE).

Escenario: CA-03 · Plazo prorrogado (agregado por el PO)
  Dado un reclamo prorrogado
  Cuando el job evalúa el plazo
  Entonces usa el vencimiento prorrogado (COALESCE) y no el original.
```

## Reglas de negocio

- RN-SVC-011 flag indicativo, fila decisiva
- RN-SVC-008

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Libro (indicador «Tickets huérfanos hoy»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): SVC_SLA_BREACH_ALERT, GOV_INTEGRITY_EXCEPTION
- Datos de prueba / analítica (PLT-04): Evento huerfano_detectado
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
