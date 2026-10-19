---
id: "HU-ATC-047"
tipo: hu
titulo: "Consultar la guía de solución del tipo de ticket"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-19", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-047-guia-solucion-por-tipo-ticket.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como gestor de tickets quiero ver en el ticket la guía de cómo resolver ese tipo: pasos, plantillas y criterios de cierre para resolver de forma estándar en el primer contacto.
- Requerimiento origen (RF-SVC-047 — Guia de solucion por tipo de ticket): El sistema debe mostrar al gestor de tickets una guía de como solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional. Feedback presentación · ítem 7 · Proceso: PROC-SVC-018 (Asistencia al agente para resolver y cerrar) · Fuente: PLT-04 · HU-ATC-047 · traza RF-SVC-047
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBERIA** · Iteración: **I1** · Estimación: **4 h** · Asignado: **Dev 3** (2026-10-21 → 2026-10-22)
- Observaciones de alcance: Fuera de alcance: Gestión documental de manuales.
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · atención asistida | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · sugerencia de IA | 6.5 Diagrama entidad-relación · guías y sugerencias

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Consultar la guía de solución del tipo de ticket

Escenario: CA-01 · Guía en el ticket
  Dado un ticket de tipo «Consulta de cuenta»
  Cuando el gestor de tickets lo abre
  Entonces ve la guía de ese tipo con pasos, plantillas y criterios de cierre.

Escenario: CA-02 · Versión
  Dado una guía actualizada por el administrador
  Cuando se publica
  Entonces los gestores de tickets ven la nueva versión y queda el historial de versiones.

Escenario: CA-03 · Tipo sin guía (agregado por el PO)
  Dado un tipo de ticket sin guía publicada
  Cuando abro el ticket
  Entonces veo el aviso «sin guía» y el sistema lo reporta al administrador funcional.
```

- Evidencia / prueba esperada (PLT-04): `Evento guia_consultada {tipo} Preguntas abiertas ¿Quién redacta y aprueba las guías por área? ¿Existe hoy un manual de atención que sirva de base?`

## Reglas de negocio

- RN-SVC-023 (Gate: cierre fuera de Mi Portal): Un ticket cerrado fuera de Mi Portal, sin cierre formal en el sistema, es un gate no compensable.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Ticket (panel guía) — Mockups: P-13 "Guía de solución y asistente IA" (Panel de guía y asistente IA en el ticket)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `GET /api/v1/guias-solucion/{tipoTicket}` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-015 SVC_KNOWLEDGE_ARTICLE, ENT-SVC-005 MAE_TICKET_TYPE
- Entidades/campos que LEE: SVC_SOLUTION_GUIDE (por tipo de ticket, versionada)
- Entidades/campos que ESCRIBE o modifica: ninguna (solo lectura para el gestor; la mantiene el administrador funcional)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_SOLUTION_GUIDE', el diccionario de F4 lo llama 'SVC_KNOWLEDGE_ARTICLE' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
