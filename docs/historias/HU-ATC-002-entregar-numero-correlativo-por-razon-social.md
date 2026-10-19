---
id: "HU-ATC-002"
tipo: hu
titulo: "Entregar al cliente un número de ticket por razón social"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-01", "EP-ATC-01", "AYB-0001"]
tags: [hu]
ui: false
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-002-entregar-numero-correlativo-por-razon-social.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-01 / docs/analisis/BRD.md
- Como gestor de tickets quiero que el sistema genere un número correlativo propio de cada razón social al guardar el ticket para entregarle al cliente un número con el que pueda dar seguimiento.
- Requerimiento origen (RF-SVC-002 — Entregar numero correlativo por razon social): El sistema debe generar un número correlativo único por razón social y entregarlo al cliente. · Proceso: PROC-SVC-001 (Registro multicanal del ticket) · Fuente: PLT-04 · HU-ATC-002 · traza RF-SVC-002
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 1** (2026-10-20 → 2026-10-20) · Depende de HU: HU-ATC-001
- Observaciones de alcance: Fuera de alcance: Envío automático del número por el canal de origen (pendientes de producto).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ciclo de registro de la solicitud | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · registro de un ticket | 6.5 Diagrama entidad-relación · datos del registro
- Referencia visual / plantilla en prototipo: Prototipo › Detalle de ticket (cabecera) [P-03 "Detalle de ticket", P-17 "Mi Portal del cliente"]

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Entregar al cliente un número de ticket por razón social

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

- Evidencia / prueba esperada (PLT-04): `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

## Reglas de negocio

- RN-SVC-004 (Correlativo por RUC): TicketNumber UNIQUE por CompanyID; el libro corre ademas por establecimiento (UNIQUE Company+Address+Numero).

## Datos (CAD-F5)

- Entidades catalogadas (.ods): ENT-SVC-001 SVC_TICKET
- Entidades y dependencias declaradas en PLT-04: Secuencia por CompanyID; formato visible por definir (pregunta abierta de FT-01)
- Entidades/campos que LEE: SVC_TICKET.CompanyID
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET.TicketNumber (correlativo por CompanyID)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
