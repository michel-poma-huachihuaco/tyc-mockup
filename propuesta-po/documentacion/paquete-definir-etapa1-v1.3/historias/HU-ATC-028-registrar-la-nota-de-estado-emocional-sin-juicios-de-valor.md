---
id: "HU-ATC-028"
tipo: hu
titulo: "Registrar la nota de estado emocional sin juicios de valor"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-07", "EP-ATC-04", "HU-ATC-026"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-028 — Registrar la nota de estado emocional sin juicios de valor

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-07
- Como referente de atención quiero registrar cómo se encuentra el cliente describiendo lo observado para que el siguiente atendedor conozca el contexto sin prejuicios.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-028 | Debe | 2 h con IA | Dev 2 (Jesús) | 2 | 28-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-026 (RF-SVC-026 es predecesora de RF-SVC-028, PLT-03) · Dependencias externas: DEP-01 (API de SIGDA/TAXON; PLT-03 y PLT-05), DEP-08 (API de Cobranza; PLT-03 y PLT-05)

**La necesitan:** HU-ATC-020

**Requerimiento de origen:** El sistema debe registrar una nota del estado emocional del cliente ante frustración o conflicto, sin juicios de valor.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Nota objetiva
  Dado un cliente frustrado
  Cuando registro la nota
  Entonces describe el estado observado sin adjetivos de juicio y queda visible para el siguiente atendedor.

Escenario: CA-02 · Aviso
  Dado un conflicto derivado a Eje 3
  Cuando se deriva
  Entonces se notifica al Director UX y se habilita la coordinación de vocería sin respuesta pública del atendedor.

Escenario: CA-03 · Palabras de juicio (agregado por el PO)
  Dado que escribo «grosero» o «conflictivo»
  Cuando guardo
  Entonces el sistema advierte y pide reformular.
```

## Reglas de negocio

- RN-SVC-023
- RN-SVC-024

**Fuera de alcance:** Vocería pública.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle (nota de estado emocional)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Campo en SVC_TICKET o interacción (por modelar)
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket con señal de conflicto
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · gate y handoff a Eje 3
- 6.5 Diagrama entidad-relación · conflicto y handoff

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
