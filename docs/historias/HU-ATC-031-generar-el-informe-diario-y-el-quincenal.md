---
id: "HU-ATC-031"
tipo: hu
titulo: "Generar el informe diario y el quincenal"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-14", "EP-ATC-07", "HU-ATC-030"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-031 — Generar el informe diario y el quincenal

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-07 / FT-ATC-14
- Como coordinador CX quiero recibir un informe diario operativo y uno quincenal analítico para que las jefaturas y el Comité decidan con datos consolidados.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-031 | Debería | 4 h con IA | Dev 3 (Michel) | 2 | 30-oct-2026 → 2-nov-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** HU-ATC-030 (RF-SVC-030 es predecesora de RF-SVC-031, PLT-03) · Dependencias externas: DEP-10 (KPI Engine y encuestas; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `listarInformes` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe generar el informe diario operativo y el informe quincenal analítico.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Diario
  Dado el cierre de una jornada
  Cuando se genera el informe
  Entonces incluye tickets por eje, NPS preliminar, derivaciones y cumplimiento de SLA.

Escenario: CA-02 · Quincenal
  Dado el cierre de una quincena
  Cuando se genera el informe
  Entonces incluye tendencias de KPI y adopción de Mi Portal.
```

## Reglas de negocio

- (el PLT-04 no indica reglas para esta HU)

**Fuera de alcance:** Informes de otros dominios.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Torre de Control (Informes)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): DEP-10 KPI Engine
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket monitoreado en la Torre de Control
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · tablero e informes
- 6.5 Diagrama entidad-relación · analítica

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
