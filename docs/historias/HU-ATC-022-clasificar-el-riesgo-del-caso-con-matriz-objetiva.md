---
id: "HU-ATC-022"
tipo: hu
titulo: "Clasificar el riesgo del caso con matriz objetiva"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-08", "EP-ATC-04", "HU-ATC-020"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-022 — Clasificar el riesgo del caso con matriz objetiva

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-08
- Como gestor de la Mesa de Casos (SGD) quiero que el nivel de riesgo se calcule con criterios ponderados y pueda recalibrarse para priorizar sin depender de un juicio subjetivo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-022 | Debe | 4 h con IA | Dev 2 (Jesús) | 2 | 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-020 (RF-SVC-020 es predecesora de RF-SVC-022, PLT-03) · Dependencias externas: DEP-03 (plazos de línea de la Mesa SGD; PLT-05); el PLT-03 pone «modelo de datos SGD», que no es una DEP, DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `clasificarRiesgo` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** HU-ATC-023

**Requerimiento de origen:** El sistema debe calcular el nivel de riesgo con una matriz objetiva de criterios ponderados y permitir recalibrarlo con registro.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Cálculo objetivo
  Dado un caso activado
  Cuando marco los criterios
  Entonces el nivel de riesgo resulta de la matriz y no de un campo de opinión.

Escenario: CA-02 · Recalibración
  Dado un caso de riesgo medio al que se suma un elemento legal
  Cuando recalibro
  Entonces el nivel se actualiza y queda registro de quién, cuándo y por qué.
```

## Reglas de negocio

- RN-SVC-016

**Fuera de alcance:** Definición de criterios y pesos (Mesa SGD, R-08).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Mesa SGD (matriz de riesgo)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Entidad por modelar (R-06)
- Datos de prueba / analítica (PLT-04): Evento riesgo_recalibrado
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso sensible en la Mesa SGD
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · recepción y activación
- 6.5 Diagrama entidad-relación · casos sensibles (por modelar · R-06)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
