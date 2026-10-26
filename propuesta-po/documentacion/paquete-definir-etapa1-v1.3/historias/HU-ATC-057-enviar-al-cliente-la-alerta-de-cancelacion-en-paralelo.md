---
id: "HU-ATC-057"
tipo: hu
titulo: "Enviar al cliente la alerta de cancelación en paralelo"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-22", "EP-ATC-11", "HU-ATC-056"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-057 — Enviar al cliente la alerta de cancelación en paralelo

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-11 / FT-ATC-22
- Como analista de Cobranza quiero que al abrir el caso se envíe de inmediato al cliente la alerta de cancelación del servicio para que el cliente pueda regularizar antes de la resolución.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-057 | Debe | 3 h con IA | Dev 4 (Daniel) | 2 | 28-oct-2026 → 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-056 (RF-SVC-056 es predecesora de RF-SVC-057, PLT-03) · Dependencias externas: DEP-05 (validación legal del texto de la alerta de cancelación; PLT-05), DEP-08 (API de Cobranza; PLT-03, PLT-04 y PLT-05), DEP-15 (maestro de responsables de proyecto y supervisores; PLT-03 y PLT-05)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe enviar al cliente, en paralelo al proceso de resolución, una alerta de cancelación del servicio (deuda, plazo para regularizar y consecuencias) por correo, WhatsApp y Mi Portal, dejando constancia de envío. Feedback 2.ª reunión · ítem 2

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Envío en paralelo
  Dado un ticket de resolución de contrato creado
  Cuando se registra
  Entonces en ese mismo momento se envía al cliente la alerta de cancelación del servicio, sin esperar el avance del flujo de resolución.

Escenario: CA-02 · Constancia
  Dado una alerta enviada
  Cuando se consulta el ticket
  Entonces se ve la constancia (fecha, hora, canal, destinatario y estado de entrega) como evidencia.

Escenario: CA-03 · Canal fallido (agregado por el PO)
  Dado que el correo del cliente rebota
  Cuando se envía la alerta
  Entonces se reintenta por WhatsApp y Mi Portal y la constancia registra cada intento.
```

## Reglas de negocio

- RN-SVC-038 Alerta de cancelación en paralelo
- RN-SVC-012 DLP en bitácoras

**Fuera de alcance:** Gestión de cobranza telefónica.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Plantilla de alerta de cancelación
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-08
- Datos de prueba / analítica (PLT-04): Evento alerta_cancelacion {canal} Preguntas abiertas ¿Qué significa «cancelación del servicio»: resolución del contrato, suspensión de beneficios u otro? ¿Qué plazo de regularización se da al cliente? ¿Legal aprueba el texto de la alerta?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso de resolución por morosidad
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · apertura del caso de resolución
- 6.5 Diagrama entidad-relación · caso y alertas de morosidad

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
