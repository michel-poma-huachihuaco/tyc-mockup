---
id: "HU-ATC-055"
tipo: hu
titulo: "Recibir un correo al asignarme un ticket, con copia a mi líder"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-21", "EP-ATC-09"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-055 — Recibir un correo al asignarme un ticket, con copia a mi líder

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-21
- Como gestor de tickets quiero recibir un correo cada vez que me asignan o reasignan un ticket, con copia a mi líder para que ninguna asignación pase desapercibida.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-055 | Debe | 2 h con IA | Dev 3 (Michel) | 2 | 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 del PLT-03 y del PLT-04, DT-03; copia al líder del gestor, CA-01 y CA-03)

**La necesitan:** HU-ATC-064

**Requerimiento de origen:** El sistema debe enviar una alerta por correo al gestor de tickets cada vez que se le asigna o reasigna un ticket, con copia a su líder, indicando N.º, tipo, prioridad y vencimiento de SLA. Feedback presentación · ítem 15

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Correo de asignación
  Dado un ticket asignado a un gestor de tickets
  Cuando se guarda la asignación
  Entonces el gestor de tickets recibe un correo en 1 min o menos con copia a su líder.

Escenario: CA-02 · Reasignación masiva
  Dado una reasignación masiva
  Cuando se ejecuta
  Entonces cada gestor de tickets recibe un solo correo con el resumen de sus tickets.

Escenario: CA-03 · Sin líder (agregado por el PO)
  Dado un gestor sin líder registrado en el maestro local
  Cuando se le asigna un ticket
  Entonces el correo sale solo al gestor y se alerta al administrador para completar el dato.
```

## Reglas de negocio

- RN-SVC-035 Aviso de asignación con copia al líder
- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Notificaciones por WhatsApp interno.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Plantilla de correo de asignación
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG · DEP-02 · Etapa 1: líder de cada gestor del maestro local
- Datos de prueba / analítica (PLT-04): Evento correo_asignacion Preguntas abiertas ¿El correo incluye datos del cliente o solo el enlace al ticket (por DLP)? ¿Quién es el líder de cada gestor de tickets (maestro local en Etapa 1)?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · asignación notificada
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · correo de asignación
- 6.5 Diagrama entidad-relación · notificación y avance

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
