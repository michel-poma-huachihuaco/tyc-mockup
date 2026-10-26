---
id: "HU-ATC-050"
tipo: hu
titulo: "Ver la consulta 360 del cliente dentro del ticket"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-20", "EP-ATC-10", "HU-ATC-049"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-050 — Ver la consulta 360 del cliente dentro del ticket

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-20
- Como gestor de tickets quiero ver en el ticket los lotes, cuotas, correos, tickets previos y documentos del cliente para responder sin salir del ticket.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-050 | Debe | 7 h con IA | Dev 4 (Daniel) | 1 | 21-oct-2026 → 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-049 (RF-SVC-049 es predecesora de RF-SVC-050, PLT-03) · Dependencias externas: DEP-01 (API de SIGDA/TAXON; PLT-03, PLT-04 y PLT-05), DEP-08 (API de Cobranza; PLT-04), DEP-13 (motor de consultas de José; PLT-03 y PLT-05), DEP-16 (Control de acceso, PJ-05: datos por rol, CA-02 y CA-07, RN-SVC-036)

**La necesitan:** HU-ATC-052

**Requerimiento de origen:** El sistema debe mostrar en el ticket un submódulo de consulta del cliente con su detalle: lotes, cuotas y estado de cuenta, correos y mensajes, tickets e interacciones previas y documentos. Feedback presentación · ítem 12

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Consulta 360
  Dado un ticket con cliente identificado
  Cuando el gestor de tickets abre la pestaña del cliente
  Entonces ve sus lotes, cuotas, correos y tickets previos consultados en línea (sin copiarlos).

Escenario: CA-02 · Sección restringida
  Dado un gestor de tickets sin permiso a estado de cuenta
  Cuando abre la consulta
  Entonces esa sección aparece restringida.

Escenario: CA-03 · Fuente caída (agregado por el PO)
  Dado que Cobranza no responde
  Cuando abro la consulta 360
  Entonces las demás secciones cargan y la de cuotas muestra «no disponible» con hora del intento.

Escenario: CA-04 · Mapa de fuentes (agregado por PO · prototipo «Consulta 360»)
  Dado un ticket con cliente identificado
  Cuando el gestor abre la pestaña Cliente
  Entonces ve al cliente al centro unido a sus sistemas de origen (SIGDA/TAXON, Tickets ATC, Call center, Correo, Repositorio S3/GLI, Motor de José, Cobranza, Contratos y Activos) y a cada dato con su sistema, con la leyenda cliente · sistema · dato · restringido o caído.

Escenario: CA-05 · Ficha resumen (agregado por PO · prototipo «Consulta 360»)
  Dado la consulta cargada
  Cuando se muestra la ficha
  Entonces ve nombre, DNI, proyecto y etapa, lotes, cuotas vencidas, tickets y el contador «datos visibles n de 16» según su rol.

Escenario: CA-06 · Detalle del dato (agregado por PO · prototipo «Consulta 360»)
  Dado el mapa del cliente
  Cuando el gestor toca un dato (por ejemplo «DNI y KYC» o «Cuotas»)
  Entonces un panel muestra el valor, el sistema de origen, su estado y fecha (por ejemplo «verificado» o «conforme · 15-ene-2026») y la etiqueta «consulta en línea, sin copiar el dato».

Escenario: CA-07 · Datos por rol (agregado por PO · prototipo «Consulta 360»)
  Dado el mismo cliente consultado por un gestor, un supervisor y Legal
  Cuando cada uno abre la consulta
  Entonces cada rol ve solo los datos que su permiso permite; «Estado de cuenta» y «Exposición legal» aparecen con candado para quien no tiene permiso (RN-SVC-036).

Escenario: CA-08 · Cliente no encontrado (agregado por PO · prototipo «Consulta 360»)
  Dado un DNI que no existe en SIGDA/TAXON
  Cuando se consulta
  Entonces se abre el flujo de excepción (RF-SVC-051): registrar como interesado o derivar, sin crear un registro paralelo del cliente.

Escenario: CA-09 · Tiempo de respuesta (agregado por PO · prototipo «Consulta 360»)
  Dado 8 fuentes en línea
  Cuando se abre la consulta
  Entonces responde en 2 s o menos (p95) y muestra al pie el tiempo de respuesta y cuántas fuentes respondieron (RNF-REN-007).

Escenario: CA-10 · Trazabilidad de la consulta (agregado por PO · prototipo «Consulta 360»)
  Dado que el gestor abre la consulta 360 desde el ticket
  Cuando termina la consulta
  Entonces queda en la bitácora del ticket quién consultó, cuándo y qué secciones vio, sin guardar los datos personales consultados (RNF-SEC-008).
```

## Reglas de negocio

- RN-SVC-036 Búsqueda respeta permisos
- RN-SVC-026 Cero registros paralelos del dato de cliente

**Fuera de alcance:** Edición de datos de las fuentes.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo Aybar Atiende v2.0 › Consulta 360 del cliente (archivo «consultas 360»), embebida en la pestaña Cliente del ticket
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-01 · DEP-08
- Datos de prueba / analítica (PLT-04): Evento consulta360 {secciones, rol, fuentes_en_linea, ms} · datos de prueba: DNI 72282555 (cliente de ejercicio del prototipo, lote C-07) y un DNI inexistente para la excepción Preguntas abiertas ¿Qué sistemas fuente alimentan cada sección (SIGDA/TAXON, Cobranza, Contratos, correo)? ¿Qué secciones ve cada rol?
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

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
