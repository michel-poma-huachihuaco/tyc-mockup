---
id: "HU-ATC-051"
tipo: hu
titulo: "Continuar la atención cuando la consulta del cliente falla"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-051-gestionar-excepciones-consulta-cliente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero registrar la solicitud aunque el cliente no se encuentre o el sistema fuente no responda para no perder la solicitud.
- Requerimiento origen (RF-SVC-051 — Gestionar excepciones en la consulta del cliente): El sistema debe manejar las excepciones de la consulta del cliente: cliente no encontrado, interesado sin contrato, datos incompletos o sistema fuente no disponible, permitiendo continuar el registro con un flujo controlado. Feedback presentación · ítem 14 · Proceso: PROC-SVC-019 (Consulta 360 y busqueda del cliente) · Fuente: PLT-04 · HU-ATC-051 · traza RF-SVC-051
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **3 h** · Asignado: **Dev 4** (2026-10-20 → 2026-10-21) · Depende de HU: HU-ATC-049 · Dependencias externas: DEP-01 (API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato))
- Observaciones de alcance: Fuera de alcance: Alta de clientes nuevos en SIGDA.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · consulta del cliente | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · consulta 360 | 6.5 Diagrama entidad-relación · búsqueda y consulta

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Continuar la atención cuando la consulta del cliente falla

Escenario: CA-01 · Cliente no encontrado
  Dado un DNI que no existe en SIGDA/TAXON
  Cuando el gestor de tickets registra
  Entonces el ticket se crea como «Interesado» con datos mínimos y queda pendiente de vincular al cliente.

Escenario: CA-02 · Sistema fuente caído
  Dado SIGDA/TAXON no disponible
  Cuando el gestor de tickets busca
  Entonces ve un aviso, registra el ticket con datos mínimos y el sistema reintenta la vinculación automáticamente.

Escenario: CA-03 · Vinculación posterior (agregado por el PO)
  Dado un ticket con vinculación pendiente
  Cuando el sistema fuente vuelve a responder
  Entonces el ticket se vincula al cliente y se registra el cambio en la bitácora.
```

- Evidencia / prueba esperada (PLT-04): `Evento consulta_excepcion {motivo} Preguntas abiertas Confirmar a que se refiere «excepción para la consulta de usuario»: ¿cliente no encontrado, permisos especiales o caída del sistema fuente?`

## Reglas de negocio

- RN-SVC-026 (Cero registros paralelos del dato de cliente): No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoria quincenal debe arrojar cero casos y crear uno es gate no compensable.
- RN-SVC-005 (Empresa y linea obligatorias): CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Nuevo ticket (modo excepción) — Mockups: P-10 "Buscador de clientes" (Resultados de clientes con botón Llamar; Documentos por significado («adenda de cambio de lote»); Cliente no encontrado: registrar como Interesado), P-11 "Consulta 360 del cliente" (Pestaña Cliente del ticket (consulta 360)), P-18 "Contingencia: alta manual" (Alta manual y cola de conciliación)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets` con flujo de excepción de cliente (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-001 SVC_TICKET · DEP-01
- Entidades/campos que LEE: SIGDA/TAXON (estado de disponibilidad)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (con vinculación de cliente pendiente)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
