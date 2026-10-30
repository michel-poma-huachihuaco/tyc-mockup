---
id: "HU-ATC-002"
tipo: hu
titulo: "Entregar al cliente un número de ticket por razón social"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-01", "EP-ATC-01", "HU-ATC-001"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-002 — Entregar al cliente un número de ticket por razón social

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-01 / FT-ATC-01
- Como gestor de tickets quiero que el sistema genere un número correlativo propio de cada razón social al guardar el ticket para entregarle al cliente un número con el que pueda dar seguimiento.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-002 | Debe | 3 h con IA | Dev 1 (Brayan) | 1 | 21-oct-2026 → 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** HU-ATC-001 (RF-SVC-001 es predecesora de RF-SVC-002, PLT-03) · Dependencias externas: DEP-01 (API de SIGDA/TAXON; PLT-03 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: la operación `registrarTicket` exige rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** HU-ATC-004

**Requerimiento de origen:** El sistema debe generar un número correlativo único por razón social y entregarlo al cliente.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Correlativo por empresa
  Dado dos tickets de empresas distintas registrados el mismo día
  Cuando se numeran
  Entonces cada empresa sigue su propio correlativo, sin saltos ni duplicados.

Escenario: CA-02 · Número visible
  Dado que guardo el ticket
  Cuando termina el registro
  Entonces veo el número en pantalla para dictarlo o enviarlo al cliente.

Escenario: CA-03 · Concurrencia (agregado por el PO)
  Dado que dos gestores de tickets guardan tickets de la misma empresa al mismo tiempo
  Cuando se numeran
  Entonces cada ticket recibe un número distinto.
```

## Reglas de negocio

- RN-SVC-004 correlativo por RUC

**Fuera de alcance:** Envío automático del número por el canal de origen (pendientes de producto).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Detalle de ticket (cabecera)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): Secuencia por CompanyID; formato visible por definir (pregunta abierta de FT-01)
- Datos de prueba / analítica (PLT-04): Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ciclo de registro de la solicitud
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · registro de un ticket
- 6.5 Diagrama entidad-relación · datos del registro

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
