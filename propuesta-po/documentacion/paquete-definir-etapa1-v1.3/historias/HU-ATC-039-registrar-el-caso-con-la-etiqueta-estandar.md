---
id: "HU-ATC-039"
tipo: hu
titulo: "Registrar el caso con la etiqueta estándar"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-15", "EP-ATC-08", "HU-ATC-038"]
tags: [hu, plt-04, flexible]
ui: true
---

# HU-ATC-039 — Registrar el caso con la etiqueta estándar

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-08 / FT-ATC-15
- Como coordinador CX o personal de apoyo quiero que cada caso del evento se registre con la etiqueta estándar para darle un seguimiento uniforme en el Registro de Casos Sensibles.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-039 | Podría · flexible | 2 h con IA | Dev 1 (Brayan) | 2 | 2-nov-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-038 (RF-SVC-038 es predecesora de RF-SVC-039, PLT-03) · Dependencias externas: ninguna (PLT-03 y PLT-05; el PLT-03 pone «EP-ATC-04 gate legal», que es interna: HU-ATC-025 → HU-ATC-037)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe registrar todo caso sensible del evento con la etiqueta «Atención especial — derivación a Legal».

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Etiqueta
  Dado un caso sensible detectado en el evento
  Cuando se registra
  Entonces usa literalmente «Atención especial — derivación a Legal».

Escenario: CA-02 · Revisión
  Dado el cierre del bloque
  Cuando el coordinador revisa el registro
  Entonces cada caso aparece con su estado (sí/no derivado a la Estación 4).
```

## Reglas de negocio

- RN-SVC-028

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › EntregaFest (registro de casos)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Registro de Casos Sensibles
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · intervención en vivo (EntregaFest)
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · derivación a Estación 4
- 6.5 Diagrama entidad-relación · casos del evento (por modelar · R-06)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
