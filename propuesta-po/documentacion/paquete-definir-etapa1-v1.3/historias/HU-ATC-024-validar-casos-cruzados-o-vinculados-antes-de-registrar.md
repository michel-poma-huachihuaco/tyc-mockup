---
id: "HU-ATC-024"
tipo: hu
titulo: "Validar casos cruzados o vinculados antes de registrar"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-09", "EP-ATC-04"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-024 — Validar casos cruzados o vinculados antes de registrar

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-09
- Como gestor de la Mesa de Casos (SGD) quiero que el sistema me advierta si un caso nuevo coincide con uno existente para gestionarlos en un solo hilo de evidencia y evitar duplicados.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-024 | Debe | 4 h con IA | Dev 2 (Jesús) | 2 | 30-oct-2026 → 2-nov-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-06 (repositorio documental y GLI; PLT-03)

**La necesitan:** HU-ATC-025

**Requerimiento de origen:** El sistema debe validar si un caso nuevo está vinculado a uno existente antes de registrarlo como independiente.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Coincidencia
  Dado un caso nuevo con el mismo cliente y hechos que uno abierto
  Cuando intento registrarlo
  Entonces el sistema propone vincularlo y no lo registra como independiente.

Escenario: CA-02 · Hilo único
  Dado dos casos vinculados
  Cuando los gestiono
  Entonces comparten un único hilo de evidencia trazable.
```

## Reglas de negocio

- RN-SVC-018

## Pantalla (`ui: true`)

- Referencia del PLT-04: Por diseñar
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Criterio de coincidencia por definir (pregunta abierta)
- Datos de prueba / analítica (PLT-04): Evento caso_vinculado
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · escalamiento en cadena
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · escalamiento y cierre
- 6.5 Diagrama entidad-relación · escalamiento y cierre (por modelar · R-06)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
