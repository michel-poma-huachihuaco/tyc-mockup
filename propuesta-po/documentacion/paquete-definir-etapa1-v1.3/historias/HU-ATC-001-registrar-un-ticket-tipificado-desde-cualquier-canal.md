---
id: "HU-ATC-001"
tipo: hu
titulo: "Registrar un ticket tipificado desde cualquier canal"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-01", "EP-ATC-01"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-001 — Registrar un ticket tipificado desde cualquier canal

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-01 / FT-ATC-01
- Como gestor de tickets quiero registrar la solicitud del cliente en un ticket con canal, cliente, empresa, línea de negocio, tipo, prioridad y resumen para tipificar cada solicitud desde el primer contacto y no volver a pedir datos.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-001 | Debe | 6 h con IA | Dev 1 (Brayan) | 1 | 21-oct-2026 | Pendiente DoR |

**Responsable:** Dev 1 · Brayan Manuel Hurtado Paucar (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-01 (API de SIGDA/TAXON; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05: usuarios y roles de ATC que el PLT-01 §0 y el PLT-04 tenían locales; rol de atención, CA-04)

**La necesitan:** HU-ATC-002

**Requerimiento de origen:** El sistema debe registrar tickets de teléfono, WhatsApp y correo con canal, cliente, empresa (RUC), línea de negocio, tipo, prioridad, resumen y descripción.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Campos obligatorios
  Dado que registro un ticket nuevo
  Cuando intento guardarlo sin empresa (RUC) o sin línea de negocio
  Entonces el sistema no lo guarda y señala los campos faltantes; empresa y línea no se derivan de otro dato.

Escenario: CA-02 · Canal remoto sin local
  Dado que la solicitud llega por WhatsApp
  Cuando registro el ticket sin establecimiento
  Entonces el ticket se guarda con el establecimiento vacío.

Escenario: CA-03 · Cliente desde SIGDA/TAXON (agregado por el PO)
  Dado que busco al cliente por DNI o nombre
  Cuando lo selecciono
  Entonces los datos se traen del maestro único y no se crea un registro paralelo del cliente.

Escenario: CA-04 · Permiso (agregado por el PO)
  Dado que mi rol no es de atención
  Cuando intento registrar un ticket
  Entonces el sistema me lo impide y registra el intento.
```

## Reglas de negocio

- RN-SVC-005 empresa y línea obligatorias
- RN-SVC-026 cero registros paralelos

**Fuera de alcance:** Creación automática por conectores de WhatsApp y correo (pendientes de producto).

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo Aybar Atiende › Nuevo ticket
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET, MAE_CHANNEL, MAE_TICKET_TYPE, MAE_TICKET_PRIORITY · DEP-01 SIGDA/TAXON · Etapa 1: usuarios y roles locales de ATC
- Datos de prueba / analítica (PLT-04): Evento ticket_creado {canal, tipo, prioridad, empresa}
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

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
