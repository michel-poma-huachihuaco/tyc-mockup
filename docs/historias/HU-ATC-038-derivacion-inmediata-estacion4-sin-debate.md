---
id: "HU-ATC-038"
tipo: hu
titulo: "Derivar de inmediato a la Estación 4 sin debate"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-15", "EP-ATC-08", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-038-derivacion-inmediata-estacion4-sin-debate.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-08 / docs/analisis/BRD.md
- Como moderador de evento quiero que al detectar «estafa», «fraude», «abuso» o «delito» el sistema me pida derivar a la Estación 4 para cerrar el tema en sala sin debatirlo.
- Requerimiento origen (RF-SVC-038 — Derivacion inmediata a Estacion 4 sin debate): El sistema debe registrar la derivación inmediata a la Estación 4 de todo caso sensible o imputación penal en vivo. · Proceso: PROC-SVC-014 (Contencion verbal y derivacion a Legal ante imputaciones en vivo (EntregaFest)) · Fuente: PLT-04 · HU-ATC-038 · traza RF-SVC-038
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **PODRIA** · Iteración: **I2** · Estimación: **2 h** · Asignado: **Dev 3** (2026-10-28 → 2026-10-28) · *Flexible* · Depende de HU: HU-ATC-037
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · intervención en vivo (EntregaFest) | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · derivación a Estación 4 | 6.5 Diagrama entidad-relación · casos del evento (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Derivar de inmediato a la Estación 4 sin debate

Escenario: CA-01 · Palabra gatillo
  Dado un propietario que menciona una palabra de riesgo muy alto
  Cuando la identifico
  Entonces el sistema exige la derivación inmediata a la Estación 4.

Escenario: CA-02 · Sin reapertura
  Dado un caso derivado
  Cuando se cierra el tema en sala
  Entonces el moderador no puede reabrirlo; queda con el especialista de la Estación 4.
```

- Evidencia / prueba esperada (PLT-04): `Evento derivación_estación4`

## Reglas de negocio

- RN-SVC-028 (Gate: casos sensibles no se debaten en sala): Un caso sensible o una imputacion penal en vivo durante un EntregaFest no se debate en sala: se deriva de inmediato a la Estacion 4 (Legal) y se registra como 'Atencion especial — derivacion a Legal'.
- RN-SVC-029 (Palabras de riesgo muy alto obligan canalizacion formal): Las palabras 'estafa', 'fraude', 'abuso' o 'delito' se clasifican como riesgo muy alto (imputacion penal) y obligan a canalizar por vias formales; el moderador nunca niega, discute o se muestra incomodo ante ellas.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › EntregaFest (detector de palabras) — Mockups: P-09 "EntregaFest en vivo" (Intervención en vivo y casos del bloque (tablet))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/entregafest/casos/{id}/derivacion` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Entidad por modelar
- Entidades/campos que LEE: SVC_EVENT_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_EVENT_SENSITIVE_CASE.DerivedToStation4
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
