---
id: "HU-ATC-032"
tipo: hu
titulo: "Auditar registros paralelos del dato de cliente"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-14", "EP-ATC-07"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-032 — Auditar registros paralelos del dato de cliente

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-07 / FT-ATC-14
- Como CDO o coordinador CX quiero una auditoría quincenal de registros paralelos del dato de cliente para mantener una única fuente del cliente.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-032 | Debería | 3 h con IA | Dev 3 (Michel) | 2 | 2-nov-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe auditar quincenalmente la existencia de registros paralelos del dato de cliente fuera de SIGDA/TAXON.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Corte
  Dado el corte quincenal
  Cuando se ejecuta la auditoría
  Entonces el número de registros paralelos detectados debe ser cero.

Escenario: CA-02 · Hallazgo
  Dado un registro paralelo detectado
  Cuando se reporta
  Entonces se eleva como gate no compensable, no como observación menor.
```

## Reglas de negocio

- RN-SVC-026

**Fuera de alcance:** Limpieza de datos en otros sistemas.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Torre de Control (auditoría)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): DEP-01 SIGDA/TAXON
- Datos de prueba / analítica (PLT-04): Métrica registros_paralelos
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
