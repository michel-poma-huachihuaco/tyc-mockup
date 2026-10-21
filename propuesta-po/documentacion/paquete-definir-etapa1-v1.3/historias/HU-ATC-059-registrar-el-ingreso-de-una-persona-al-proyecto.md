---
id: "HU-ATC-059"
tipo: hu
titulo: "Registrar el ingreso de una persona al proyecto"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-23", "EP-ATC-11"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-059 — Registrar el ingreso de una persona al proyecto

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-11 / FT-ATC-23
- Como personal de control de acceso quiero registrar desde el celular, con un formulario simple, a cada persona que ingresa al proyecto para que su visita quede registrada y su motivo se atienda.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-059 | Debería | 4 h con IA | Dev 4 (Daniel) | 2 | 29-oct-2026 → 30-oct-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe permitir registrar el ingreso de una persona al proyecto con un formulario simple (nombre, DNI, teléfono, motivo, lote o área a visitar y fecha y hora) que genera automáticamente un ticket asignado al responsable del proyecto. Feedback 2.ª reunión · ítem 5

## Criterios de aceptación (Gherkin, verificables)

```gherkin
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

## Reglas de negocio

- RN-SVC-041 Formulario simple genera ticket
- RN-SVC-005 Empresa y línea obligatorias

**Fuera de alcance:** Control de salida y torniquetes.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Formulario de ingreso (móvil)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-019 SVC_SIMPLE_FORM_DEFINITION, ENT-SVC-001 SVC_TICKET, ENT-REF-001 MAE_CHANNEL
- Datos de prueba / analítica (PLT-04): Evento ingreso_proyecto Preguntas abiertas ¿Qué personas ingresan (clientes, interesados, contratistas, proveedores)? ¿Se registra también la salida? ¿Todo ingreso es un ticket o solo los que traen una solicitud? ¿Hay conectividad en el proyecto?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · formulario simple
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · reserva de bus del Entrega Fest
- 6.5 Diagrama entidad-relación · formularios y reservas

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
