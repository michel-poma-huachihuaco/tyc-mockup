---
id: "HU-ATC-043"
tipo: hu
titulo: "Configurar el flujo de trabajo de un tipo de ticket por área"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["FT-ATC-18", "EP-ATC-09", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-043-configurar-flujos-trabajo-tickets-por-area.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-09 / docs/analisis/BRD.md
- Como administrador funcional quiero definir sin desarrollo los pasos, estados, responsables y SLA del flujo de cada tipo de ticket por área para adaptar la atención a cada área sin esperar cambios de sistema.
- Requerimiento origen (RF-SVC-043 — Configurar flujos de trabajo de tickets por area): El sistema debe permitir configurar, sin desarrollo, el flujo de trabajo (workflow) de cada tipo de ticket por área: pasos, estados, responsables, aprobaciones y SLA de cada paso. Feedback presentación · ítem 6 · Proceso: PROC-SVC-017 (Orquestacion de bandeja y flujos de trabajo por area) · Fuente: PLT-04 · HU-ATC-043 · traza RF-SVC-043
- Etapa del proyecto (RN-SVC-043): **Etapa 1** — Salida 30-oct-2026
- Planificación (PLT-04 v1.2): Prioridad: **DEBE** · Iteración: **I1** · Estimación: **6 h** · Asignado: **Dev 3** (2026-10-19 → 2026-10-20)
- Observaciones de alcance: Fuera de alcance: Editor gráfico de procesos (BPMN).
- Diagramas asociados (PLT-04 §6): 6.1 Diagrama de estados · ticket en la bandeja orquestadora | 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar) | 6.3 Diagrama de procesos TO-BE · situación objetivo | 6.4 Diagrama de secuencia · asignación por la bandeja | 6.5 Diagrama entidad-relación · flujos y asignación

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Característica: Configurar el flujo de trabajo de un tipo de ticket por área

Escenario: CA-01 · Flujo aplicado
  Dado un tipo de ticket de Cobranza
  Cuando el administrador define sus pasos y responsables
  Entonces los nuevos tickets de ese tipo siguen el flujo configurado.

Escenario: CA-02 · Versión del flujo
  Dado un flujo modificado
  Cuando se publica
  Entonces solo aplica a tickets nuevos y los abiertos conservan su flujo y SLA congelado.

Escenario: CA-03 · Flujo incompleto (agregado por el PO)
  Dado un flujo sin responsable en un paso
  Cuando intento publicarlo
  Entonces el sistema no lo publica e indica el paso incompleto.
```

- Evidencia / prueba esperada (PLT-04): `Evento flujo_publicado {area, tipo} Preguntas abiertas ¿Cuántas áreas necesitan flujo propio en el piloto? ¿Quién aprueba los cambios de flujo?`

## Reglas de negocio

- RN-SVC-006 (Asignacion append-only): Cada movimiento de area/responsable es fila nueva con motivo tipificado; los punteros actuales son denormalizados.
- RN-SVC-001 (Precedencia SLA): Fila especifica (tipo+prioridad) precede a la generica (PriorityID NULL); maximo una generica activa por tipo (UNIQUEs parciales).

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Prototipo / pantalla de referencia (artefacto): Prototipo › Configuración › Flujos — Mockups: P-12 "Configurador de flujos por área" (Editor de flujo Cobranza · Consulta de cuenta)
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/flujos` (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades y dependencias declaradas en PLT-04: ENT-SVC-014 SVC_WORKFLOW_DEFINITION, ENT-SVC-007 MAE_Área, ENT-SVC-008 MAE_SLA_POLICY
- Entidades/campos que LEE: catálogo de tipos de ticket y áreas
- Entidades/campos que ESCRIBE o modifica: SVC_WORKFLOW_CONFIG (pasos, estados, responsables, aprobaciones, SLA por paso)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - nomenclatura a reconciliar con docs/datos/diccionario.md: la HU dice 'SVC_WORKFLOW_CONFIG', el diccionario de F4 lo llama 'SVC_WORKFLOW_DEFINITION' (mismo concepto) - desviacion MENOR de CAD-F5 (nomenclatura)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: actualizado con el detalle íntegro del artefacto de Claude «Tablero Aybar Atiende» (PLT-01..05 v1.2, versión `1792099647-bef0`, `assets/js/datos.js`) — Revisado por: pendiente
