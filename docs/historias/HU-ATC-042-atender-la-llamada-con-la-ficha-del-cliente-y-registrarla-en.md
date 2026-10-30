---
id: "HU-ATC-042"
tipo: hu
titulo: "Atender la llamada con la ficha del cliente y registrarla en el ticket"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-17", "EP-ATC-10", "HU-ATC-052"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-042 — Atender la llamada con la ficha del cliente y registrarla en el ticket

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-17
- Como gestor de tickets del call center quiero ver la ficha del cliente al contestar y que la llamada quede registrada en su ticket para atender sin cambiar de sistema ni volver a escribir los datos.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-042 | Debe | 5 h con IA | Dev 4 (Daniel) | 1 | 26-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-052 (FT-ATC-20 es predecesora de FT-ATC-17, PLT-02, y esta es su última HU en la Etapa 1) (HU-053 fuera de la Etapa 1: antes dependía de ella, la última HU de FT-ATC-20) · Dependencias externas: DEP-11 (plataforma del call center; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: las operaciones `registrarInteraccion`, `obtenerFichaLlamada` exigen rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5))

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe integrarse con la plataforma que usa el equipo de call center para mostrar los datos del cliente al recibir la llamada (screen pop), abrir o ubicar su ticket y registrar la llamada como interacción con su grabación. Feedback presentación · ítem 5

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Screen pop
  Dado una llamada entrante de un número registrado
  Cuando el gestor de tickets contesta
  Entonces ve la ficha del cliente y sus tickets abiertos en 2 s o menos.

Escenario: CA-02 · Registro de la llamada
  Dado una llamada finalizada
  Cuando se cierra
  Entonces queda registrada como interacción del ticket con duración y enlace a la grabación.

Escenario: CA-03 · Número desconocido (agregado por el PO)
  Dado una llamada de un número no registrado
  Cuando contesto
  Entonces veo la búsqueda del cliente abierta para identificarlo o registrarlo como interesado.
```

## Reglas de negocio

- RN-SVC-005 Empresa y línea obligatorias

**Fuera de alcance:** Marcador predictivo; campañas salientes.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Consola (panel de llamada)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVC-004 SVC_TICKET_INTERACTION, ENT-REF-001 MAE_CHANNEL · DEP-11
- Datos de prueba / analítica (PLT-04): Evento llamada_registrada {duracion} Preguntas abiertas ¿Qué plataforma de call center usa hoy el equipo (proveedor y versión)? ¿Expone API o CTI para screen pop y grabaciones?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · llamada en el call center
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · screen pop y registro de llamada
- 6.5 Diagrama entidad-relación · llamada como interacción

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Depende de HU-052 en lugar de HU-053, que sale de la Etapa 1 por P-025 (`analisis/decisiones.md` v0.8): FT-20 sigue siendo predecesora de FT-17 (PLT-02) y HU-052 es su última HU en la Etapa 1; `relacionados` y la tarea HU-ATC-042-T01 cambian igual. No cambia texto del PO. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.2) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
