---
id: "HU-ATC-037"
tipo: hu
titulo: "Registrar el riesgo verbal y la secuencia de Frases Ancla"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-15", "EP-ATC-08"]
tags: [hu, plt-04, flexible]
ui: true
---

# HU-ATC-037 — Registrar el riesgo verbal y la secuencia de Frases Ancla

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-08 / FT-ATC-15
- Como moderador de evento quiero registrar la clasificación de riesgo y qué Frases Ancla apliqué para contener la insistencia antes de derivar formalmente.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-037 | Podría · flexible | 2 h con IA | Dev 1 (Brayan) | 2 | 30-oct-2026 → 2-nov-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe registrar la clasificación de riesgo de la intervención en vivo y la secuencia de Frases Ancla (4, 5, 6) aplicada.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Frase 4
  Dado un propietario que divaga
  Cuando aplico la Frase 4
  Entonces queda registrado el intento de concreción.

Escenario: CA-02 · Frase 6
  Dado un propietario que persiste tras la Frase 5
  Cuando aplico la Frase 6
  Entonces el sistema exige registrar el caso para cerrar el tema en sala.
```

## Reglas de negocio

- RN-SVC-030

**Fuera de alcance:** Guion completo del moderador.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › EntregaFest en vivo
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Entidad por modelar (R-06)
- Datos de prueba / analítica (PLT-04): Evento frase_ancla {n}
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
