---
id: "HU-ATC-044"
tipo: hu
titulo: "Trabajar desde una bandeja única ordenada por urgencia"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-18", "EP-ATC-09", "HU-ATC-043"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-044 — Trabajar desde una bandeja única ordenada por urgencia

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-18
- Como gestor de tickets quiero ver en una sola bandeja los tickets de todos los canales ordenados por rayo, vencimiento de SLA y prioridad para atender primero lo más urgente.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-044 | Debe | 5 h con IA | Dev 3 (Michel) | 1 | 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** HU-ATC-043 (RF-SVC-043 es predecesora de RF-SVC-044, PLT-03) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 del PLT-03, DT-03; área y rol del gestor, CA-03)

**La necesitan:** HU-ATC-045, HU-ATC-046, HU-ATC-067

**Requerimiento de origen:** El sistema debe ofrecer una bandeja orquestadora que reúne los tickets de todos los canales y los ordena y asigna según flujo, prioridad, marca de rayo y vencimiento de SLA. Feedback presentación · ítem 11

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Orden de la bandeja
  Dado tickets de teléfono, WhatsApp, correo y Mi Portal
  Cuando el gestor de tickets abre la bandeja
  Entonces los ve juntos ordenados por rayo, SLA más próximo y prioridad.

Escenario: CA-02 · Asignación por flujo
  Dado un ticket nuevo sin responsable
  Cuando entra a la bandeja
  Entonces el orquestador lo asigna según el flujo del área o lo deja en la cola del área.

Escenario: CA-03 · Sin permiso de área (agregado por el PO)
  Dado un ticket de un área a la que no pertenezco
  Cuando abro la bandeja
  Entonces no lo veo, salvo que sea supervisor de esa área.
```

## Reglas de negocio

- RN-SVC-031 Prioridad rayo controlada
- RN-SVC-008 Alerta única por ciclo

**Fuera de alcance:** Bandejas personalizadas por gestor.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Bandeja
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG
- Datos de prueba / analítica (PLT-04): Evento bandeja_tomado {orden} Preguntas abiertas ¿La asignación es automática (push) o el gestor de tickets toma el siguiente (pull)? ¿Se mezclan tickets de varias áreas en la misma bandeja?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket en la bandeja orquestadora
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · asignación por la bandeja
- 6.5 Diagrama entidad-relación · flujos y asignación

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
