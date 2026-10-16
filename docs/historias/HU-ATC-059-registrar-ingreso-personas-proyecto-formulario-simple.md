---
id: "HU-ATC-059"
tipo: hu
titulo: "Registrar el ingreso de personas al proyecto con formulario simple"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-23", "EP-ATC-11", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-059-registrar-ingreso-personas-proyecto-formulario-simple.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-11 / docs/analisis/BRD.md
- Como personal de control de acceso quiero registrar el ingreso de una persona al proyecto con un formulario simple (nombre, DNI, teléfono, motivo, lote o área a visitar y fecha y hora) que genera automáticamente un ticket asignado al responsable del proyecto, para tener trazabilidad de cada visita y atender su motivo sin trámites ni registros en papel.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Registrar un ingreso con el formulario simple
  Dado una persona que ingresa al proyecto
  Cuando el personal de control de acceso completa el formulario (máximo 6 campos) en menos de 1 minuto
  Entonces el sistema genera automáticamente un ticket «Ingreso a proyecto» asignado al responsable del proyecto
```

## Reglas de negocio

- RN-SVC-041: formulario simple genera ticket tipificado, con canal «Formulario» y responsable según el flujo; máximo 6 campos obligatorios.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/formularios/ingreso-proyecto` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: maestro de responsables de proyecto
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (tipo ingreso a proyecto: nombre, DNI, teléfono, motivo, lote/área, fecha y hora)
- Migración / backfill / borrado: no
- Checklist CAD-F5: [pendiente - se completa en F4]

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
