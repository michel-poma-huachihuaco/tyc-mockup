---
id: "HU-ATC-003"
tipo: hu
titulo: "Congelar el SLA del ticket al abrirlo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-04", "EP-ATC-02"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-003 — Congelar el SLA del ticket al abrirlo

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-02 / FT-ATC-04
- Como supervisor ATC quiero que al abrir un ticket se elija la política SLA correcta y se congelen sus vencimientos en tiempo hábil para tener un compromiso estable que no cambie si la política se actualiza después.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-003 | Debe | 6 h con IA | Dev 2 (Jesús) | 1 | 22-oct-2026 → 23-oct-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-03 (matriz SLA por tipo y prioridad; PLT-03, PLT-04 y PLT-05), DEP-04 (calendario MAE_TIME y MAE_HOLIDAY; PLT-03 y PLT-04)

**La necesitan:** HU-ATC-010, HU-ATC-029

**Requerimiento de origen:** El sistema debe elegir la política SLA vigente por precedencia y congelar los vencimientos de 1.ª respuesta y resolución al abrir el ticket.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Precedencia
  Dado un tipo con política específica (tipo+prioridad) y otra genérica activas
  Cuando se abre un ticket de esa prioridad
  Entonces se aplica la específica; si no existe, la genérica.

Escenario: CA-02 · Feriado
  Dado un ticket abierto el viernes a las 18:00 antes de un feriado, con base BUSINESS_HOURS
  Cuando se congela el SLA
  Entonces el vencimiento cae en horas hábiles posteriores y el ticket no nace incumplido.

Escenario: CA-03 · Cambio de política (agregado por el PO)
  Dado un ticket abierto con su SLA congelado
  Cuando se modifica la política
  Entonces los vencimientos del ticket no cambian.

Escenario: CA-04 · Sin política (agregado por el PO)
  Dado un tipo sin política activa
  Cuando se abre un ticket
  Entonces el sistema aplica la genérica global y registra una alerta de configuración.
```

## Reglas de negocio

- RN-SVC-001 precedencia
- RN-SVC-002 compromisos congelados
- RN-SVC-003 días hábiles únicos

**Fuera de alcance:** Definición de los tiempos de la matriz (DEP-03).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Nuevo ticket (panel «SLA que se congelará»)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): MAE_SLA_POLICY, MAE_TIME, MAE_HOLIDAY · DEP-03, DEP-04
- Datos de prueba / analítica (PLT-04): Evento sla_congelado {política, fr_due, res_due}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · compromiso SLA del ciclo
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · congelamiento y alerta de SLA
- 6.5 Diagrama entidad-relación · política y alertas

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
