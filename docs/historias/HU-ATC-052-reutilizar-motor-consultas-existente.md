---
id: "HU-ATC-052"
tipo: hu
titulo: "Consultar datos específicos con el motor de José"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-052-reutilizar-motor-consultas-existente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero ejecutar consultas específicas del cliente usando el motor que ya construyó José para obtener el dato sin un desarrollo nuevo.
- Requerimiento origen (RF-SVC-052 — Reutilizar el motor de consultas existente (Jose)): El sistema debe consumir el motor de consultas que ya construyó José para obtener datos especificos del cliente, integrándolo por API en lugar de desarrollar uno nuevo. Feedback presentación · ítem 17 · Proceso: PROC-SVC-019 (Consulta 360 y busqueda del cliente) · Fuente: PLT-04 · HU-ATC-052 · traza RF-SVC-052
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 4** (2026-10-21 → 2026-10-21) · Depende de HU: HU-ATC-050 · Dependencias externas: DEP-13 (Motor de consultas de José: contrato de API y responsable de mantenimiento)
- Observaciones de alcance: Fuera de alcance: Mantenimiento del motor de José.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · consulta del cliente | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · consulta 360 | 6.5 Diagrama entidad-relación · búsqueda y consulta
- Referencia visual / plantilla en prototipo: Prototipo › Ticket › Consultas rápidas [P-11 "Consulta 360 del cliente"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Consultar datos específicos con el motor de José

Escenario: CA-01 · Consulta vía API
  Dado una consulta especifica del cliente (p. ej.. saldo de un lote)
  Cuando el gestor de tickets la ejecuta desde el ticket
  Entonces la respuesta proviene del motor de consultas de José vía API.

Escenario: CA-02 · Motor no disponible
  Dado el motor no disponible
  Cuando se consulta
  Entonces el ticket muestra un aviso y no bloquea la atención.

Escenario: CA-03 · Permisos (agregado por el PO)
  Dado una consulta sobre datos que mi rol no puede ver
  Cuando la ejecuto
  Entonces el motor no devuelve el dato y queda registrado el intento.
```

- Evidencia / prueba esperada (PLT-04): `Evento consulta_motor {consulta} Preguntas abiertas ¿Qué expone hoy el motor de José (API, base de datos, reportes)? ¿Quién lo mantiene y con que SLA?`

## Reglas de negocio

- RN-SVC-036 (Busqueda respeta permisos): La busqueda y la consulta 360 solo muestran documentos y datos que el rol del usuario puede ver en el sistema de origen.

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-017 SVC_SEARCH_INDEX · DEP-13
- Entidades/campos que LEE: motor de consultas de José (vía API)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
