---
id: "HU-ATC-059"
tipo: hu
titulo: "Registrar el ingreso de una persona al proyecto"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-23", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-059-registrar-ingreso-personas-proyecto-formulario-simple.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como personal de control de acceso quiero registrar desde el celular, con un formulario simple, a cada persona que ingresa al proyecto para que su visita quede registrada y su motivo se atienda.
- Requerimiento origen (RF-SVC-059 — Registrar el ingreso de personas al proyecto con formulario simple): El sistema debe permitir registrar el ingreso de una persona al proyecto con un formulario simple (nombre, DNI, teléfono, motivo, lote o área a visitar y fecha y hora) que genera automáticamente un ticket asignado al responsable del proyecto. Feedback 2.ª reunión · ítem 5 · Proceso: PROC-SVC-022 (Registro por formulario simple: ingreso al proyecto y Entrega Fest) · Fuente: PLT-04 · HU-ATC-059 · traza RF-SVC-059
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I2** · Estimación: **4 h** · Asignado: **Dev 4** (2026-10-27 → 2026-10-28)
- Observaciones de alcance: Fuera de alcance: Control de salida y torniquetes.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · formulario simple | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · reserva de bus del Entrega Fest | 6.5 Diagrama entidad-relación · formularios y reservas

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Registrar el ingreso de una persona al proyecto

Escenario: CA-01 · Formulario simple
  Dado una persona que llega al proyecto
  Cuando el personal completa el formulario simple en el celular (máximo 6 campos)
  Entonces se crea un ticket «Ingreso a proyecto» con número y se notifica al responsable del proyecto.

Escenario: CA-02 · Cliente reconocido
  Dado un DNI que ya es cliente
  Cuando se registra el ingreso
  Entonces el ticket se vincula automáticamente a su ficha y a su lote.

Escenario: CA-03 · Sin conexión (agregado por el PO)
  Dado que no hay internet en la garita
  Cuando registro un ingreso
  Entonces el formulario lo guarda en el celular y lo envía al recuperar la conexión.
```

- Evidencia / prueba esperada (PLT-04): `Evento ingreso_proyecto Preguntas abiertas ¿Qué personas ingresan (clientes, interesados, contratistas, proveedores)? ¿Se registra también la salida? ¿Todo ingreso es un ticket o solo los que traen una solicitud? ¿Hay conectividad en el proyecto?`

## Reglas de negocio

- RN-SVC-041 (Formulario simple genera ticket): Cada envio de un formulario simple crea un ticket tipificado con numero, canal «Formulario» y responsable segun el flujo; maximo 6 campos obligatorios.
- RN-SVC-005 (Empresa y linea obligatorias): CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Formulario de ingreso (móvil)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/formularios/ingreso-proyecto` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-019 SVC_SIMPLE_FORM_DEFINITION, ENT-SVC-001 SVC_TICKET, ENT-REF-001 MAE_CHANNEL
- Entidades/campos que LEE: maestro de responsables de proyecto
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (tipo ingreso a proyecto: nombre, DNI, teléfono, motivo, lote/área, fecha y hora)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
