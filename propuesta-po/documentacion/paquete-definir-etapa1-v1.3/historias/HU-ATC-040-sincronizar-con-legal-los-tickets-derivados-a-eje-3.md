---
id: "HU-ATC-040"
tipo: hu
titulo: "Sincronizar con Legal los tickets derivados a Eje 3"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-16", "EP-ATC-10"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-040 — Sincronizar con Legal los tickets derivados a Eje 3

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-16
- Como responsable legal de reclamos quiero recibir en mi herramienta los tickets derivados a Eje 3 con su paquete mínimo y devolver su estado para seguir cada caso legal en un solo lugar sin registrarlo dos veces.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-040 | Debe | 5 h con IA | Dev 4 (Daniel) | 1 | 26-oct-2026 → 27-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-12 (herramienta de Legal; PLT-03, PLT-04 y PLT-05)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe sincronizar los tickets derivados a Eje 3 con la herramienta que usa el equipo de Legal (responsable: Rosario), enviando el paquete mínimo y recibiendo estado y resolución. Feedback presentación · ítem 2

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Envío a Legal
  Dado un ticket derivado a Eje 3
  Cuando se confirma el handoff
  Entonces el caso aparece en la herramienta de Legal con el paquete mínimo y el N.º de ticket.

Escenario: CA-02 · Estado de vuelta
  Dado un caso que Legal actualiza o resuelve en su herramienta
  Cuando se sincroniza
  Entonces el ticket refleja el nuevo estado sin registro manual.

Escenario: CA-03 · Legal no disponible (agregado por el PO)
  Dado que la herramienta de Legal no responde
  Cuando se confirma un handoff a Eje 3
  Entonces el envío queda en cola, se reintenta y el ticket muestra «pendiente de sincronizar».
```

## Reglas de negocio

- RN-SVC-021 Gate: un caso de conflicto no se resuelve en Eje 1/2
- RN-SVC-022 Gate: derivación sin paquete mínimo

**Fuera de alcance:** Gestión del expediente judicial.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Ticket › pestaña Legal
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG · DEP-12
- Datos de prueba / analítica (PLT-04): Evento legal_sync {estado} Preguntas abiertas ¿Qué herramienta usa hoy Legal (sistema, Excel, correo)? ¿Rosario es la dueña funcional de la integración? ¿La sincronización es en línea o por lotes?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso legal y riesgo de denuncia
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · sincronización con Legal
- 6.5 Diagrama entidad-relación · caso legal y exposición

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
