---
id: "HU-ATC-038"
tipo: hu
titulo: "Derivar de inmediato a la Estación 4 sin debate"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-15", "EP-ATC-08", "HU-ATC-037"]
tags: [hu, plt-04, flexible]
ui: true
---

# HU-ATC-038 — Derivar de inmediato a la Estación 4 sin debate

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-08 / FT-ATC-15
- Como moderador de evento quiero que al detectar «estafa», «fraude», «abuso» o «delito» el sistema me pida derivar a la Estación 4 para cerrar el tema en sala sin debatirlo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-038 | Podría · flexible | 2 h con IA | Dev 1 (Brayan) | 2 | 2-nov-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-037 (RF-SVC-037 es predecesora de RF-SVC-038, PLT-03) · Dependencias externas: ninguna (PLT-03 y PLT-05; el PLT-03 pone «EP-ATC-04 gate legal», que es interna: HU-ATC-025 → HU-ATC-037)

**La necesitan:** HU-ATC-039

**Alcance:** fuera de la Etapa 1 por decisión del equipo del 26-oct-2026 (P-025): alcance flexible R-01 del PO; se retoma en una etapa posterior.

**Requerimiento de origen:** El sistema debe registrar la derivación inmediata a la Estación 4 de todo caso sensible o imputación penal en vivo.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Palabra gatillo
  Dado un propietario que menciona una palabra de riesgo muy alto
  Cuando la identifico
  Entonces el sistema exige la derivación inmediata a la Estación 4.

Escenario: CA-02 · Sin reapertura
  Dado un caso derivado
  Cuando se cierra el tema en sala
  Entonces el moderador no puede reabrirlo; queda con el especialista de la Estación 4.
```

## Reglas de negocio

- RN-SVC-028
- RN-SVC-029

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › EntregaFest (detector de palabras)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Entidad por modelar
- Datos de prueba / analítica (PLT-04): Evento derivación_estación4
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

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota de alcance: fuera de la Etapa 1 por P-025 (decisión del equipo del 26-oct-2026, `analisis/decisiones.md` v0.8); sus tareas pasan sin cambios a `roadmap/alcance-diferido.md` y en `backlog/tareas/` queda una tarea de 0 h que lo dice. El bloque «Depende de / La necesitan» conserva las dependencias del PO para cuando se retome. No cambia texto del PO. — Revisado por: (pendiente)
