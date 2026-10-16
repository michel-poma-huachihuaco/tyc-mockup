---
id: "HU-ATC-048"
tipo: hu
titulo: "Retroalimentación de IA al agente durante la atención"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-19", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-048-retroalimentacion-ia-agente-atencion.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets quiero que la IA me retroalimente mientras atiendo y al cerrar: que sugiera respuesta, verifique que se cumplan los criterios de cierre de la guía y señale tono o datos faltantes, para cerrar con mejor calidad y aprender en el momento.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Recibir una sugerencia de la IA
  Dado un gestor atendiendo un ticket
  Cuando solicita ayuda de la IA
  Entonces el sistema le sugiere una respuesta y registra la sugerencia con la decisión del gestor (aceptar, editar o descartar), sin enviarla al cliente por sí sola
```

## Reglas de negocio

- RN-SVC-032: IA asesora, el gestor de tickets decide; ninguna respuesta se envía al cliente sin su acción y sin datos personales hacia modelos externos.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets/{id}/sugerencia-ia` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SVC_TICKET, guía de solución
- Entidades/campos que ESCRIBE o modifica: SVC_IA_SUGGESTION (sugerencia, decisión del gestor)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_IA_SUGGESTION', el diccionario de F4 lo llama 'SVC_AI_SUGGESTION_LOG' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
