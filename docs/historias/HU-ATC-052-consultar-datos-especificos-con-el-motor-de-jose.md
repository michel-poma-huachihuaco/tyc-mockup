---
id: "HU-ATC-052"
tipo: hu
titulo: "Consultar datos específicos con el motor de José"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-20", "EP-ATC-10"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-052 — Consultar datos específicos con el motor de José

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-20
- Como gestor de tickets quiero ejecutar consultas específicas del cliente usando el motor que ya construyó José para obtener el dato sin un desarrollo nuevo.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-052 | Debería | 3 h con IA | Dev 4 (Daniel) | 1 | 23-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe consumir el motor de consultas que ya construyó José para obtener datos especificos del cliente, integrándolo por API en lugar de desarrollar uno nuevo. Feedback presentación · ítem 17

## Criterios de aceptación (Gherkin, verificables)

```gherkin
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

## Reglas de negocio

- RN-SVC-036 Búsqueda respeta permisos

**Fuera de alcance:** Mantenimiento del motor de José.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Ticket › Consultas rápidas
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-017 SVC_SEARCH_INDEX · DEP-13
- Datos de prueba / analítica (PLT-04): Evento consulta_motor {consulta} Preguntas abiertas ¿Qué expone hoy el motor de José (API, base de datos, reportes)? ¿Quién lo mantiene y con que SLA?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · consulta del cliente
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · consulta 360
- 6.5 Diagrama entidad-relación · búsqueda y consulta

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
