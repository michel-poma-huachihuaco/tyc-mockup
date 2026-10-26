---
id: "HU-ATC-023"
tipo: hu
titulo: "Escalar en cadena un caso que incumple su SLA"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-09", "EP-ATC-04", "HU-ATC-022"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-023 — Escalar en cadena un caso que incumple su SLA

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-09
- Como gestor de la Mesa de Casos (SGD) quiero que un caso que incumple su SLA escale automáticamente de alerta a memorándum, Comité y Directorio para que ningún caso se estanque sin que una instancia superior lo sepa.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-023 | Debe | 5 h con IA | Dev 2 (Jesús) | 2 | 29-oct-2026 → 30-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-022 (FT-ATC-08 es predecesora de FT-ATC-09 y esta es su última HU, PLT-02) · Dependencias externas: DEP-06 (repositorio documental y GLI; PLT-03)

**La necesitan:** HU-ATC-025

**Requerimiento de origen:** El sistema debe escalar automáticamente, sin saltar niveles: alerta temprana, memorándum a jefatura, Comité y Directorio.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Alerta temprana
  Dado un caso próximo a vencer su SLA de línea
  Cuando se alcanza el umbral
  Entonces el responsable recibe una alerta temprana.

Escenario: CA-02 · Cadena
  Dado un caso vencido sin resolución
  Cuando se cumple el plazo
  Entonces escala a memorándum a la jefatura y, si persiste, a Comité y luego a Directorio, sin saltar niveles.

Escenario: CA-03 · Resolución (agregado por el PO)
  Dado un caso escalado a Comité
  Cuando se resuelve
  Entonces se detiene la cadena y queda el historial de niveles alcanzados.
```

## Reglas de negocio

- RN-SVC-017

**Fuera de alcance:** Agenda de sesiones del Comité.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Mesa SGD (escalera de escalamiento)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Job batch · entidad por modelar
- Datos de prueba / analítica (PLT-04): Evento escalamiento {nivel}
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
