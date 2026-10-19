---
id: "HU-ATC-039"
tipo: hu
titulo: "Registrar el caso con la etiqueta estándar"
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

Va en `docs/historias/HU-ATC-039-registro-caso-etiqueta-estandar.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-08 / docs/analisis/BRD.md
- Como coordinador CX o personal de apoyo quiero que cada caso del evento se registre con la etiqueta estándar para darle un seguimiento uniforme en el Registro de Casos Sensibles.
- Requerimiento origen (RF-SVC-039 — Registro del caso con etiqueta estandar): El sistema debe registrar todo caso sensible del evento con la etiqueta «Atención especial — derivación a Legal». · Proceso: PROC-SVC-014 (Contencion verbal y derivacion a Legal ante imputaciones en vivo (EntregaFest)) · Fuente: PLT-04 · HU-ATC-039 · traza RF-SVC-039
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **PODRIA** · Iteración: **I2** · Estimación: **2 h** · Asignado: **Dev 3** (2026-10-28 → 2026-10-29) · *Flexible* · Depende de HU: HU-ATC-038
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · intervención en vivo (EntregaFest) | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · derivación a Estación 4 | 6.5 Diagrama entidad-relación · casos del evento (por modelar · R-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar el caso con la etiqueta estándar

Escenario: CA-01 · Etiqueta
  Dado un caso sensible detectado en el evento
  Cuando se registra
  Entonces usa literalmente «Atención especial — derivación a Legal».

Escenario: CA-02 · Revisión
  Dado el cierre del bloque
  Cuando el coordinador revisa el registro
  Entonces cada caso aparece con su estado (sí/no derivado a la Estación 4).
```

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- RN-SVC-028 (Gate: casos sensibles no se debaten en sala): Un caso sensible o una imputacion penal en vivo durante un EntregaFest no se debate en sala: se deriva de inmediato a la Estacion 4 (Legal) y se registra como 'Atencion especial — derivacion a Legal'.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › EntregaFest (registro de casos) — Mockups: P-09 "EntregaFest en vivo" (Intervención en vivo y casos del bloque (tablet))
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET/POST /api/v1/entregafest/registro-casos-sensibles` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: Registro de Casos Sensibles
- Entidades/campos que LEE: SVC_EVENT_SENSITIVE_CASE
- Entidades/campos que ESCRIBE o modifica: SVC_EVENT_SENSITIVE_CASE.Tag (etiqueta literal)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
