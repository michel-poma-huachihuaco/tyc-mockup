---
id_documento: DOC-ATC-00
tipo: indice_contexto
titulo: Índice Maestro y Guía de Navegación de Contexto Scrum
proposito: Proporcionar a los agentes de codificación de IA (Claude Code CLI, GPT Codex, OpenCode) el mapa mental completo, el protocolo de ejecución autónoma y el árbol de trazabilidad unificado (Épica -> Feature -> Historia de Usuario) para el desarrollo de la Plataforma Aybar Atiende.
version: 1.2
fecha: 2026-10-14
autor: Eddie Huamaní (PO) / Staff AI Software Engineer
archivos_relacionados:
  - docs/scrum/01-master-plan.md
  - docs/scrum/02-definition-of-ready.md
  - docs/scrum/03-epics.md
  - docs/scrum/04-features.md
  - docs/scrum/05-user-stories.md
---

# 00 · MAPA DE NAVEGACIÓN Y CONTEXTO MAESTRO SCRUM
## Plataforma de Atención al Cliente «Aybar Atiende» · AYBARCORP SAC

---

## 1. RESUMEN EJECUTIVO DEL PROYECTO (1 PÁRRAFO)

La plataforma **«Aybar Atiende»** es la solución omnicanal y transversal de Atención al Cliente de **AYBARCORP SAC** diseñada para centralizar, tipificar y gestionar en una sola fuente de verdad todas las solicitudes, reclamos de garantía, trámites del Libro de Reclamaciones (Ley 29571) y controversias de 11 razones sociales inmobiliarias provenientes de canales telefónicos (CTI/Call Center), WhatsApp y correo electrónico, eliminando registros paralelos en hojas de cálculo y garantizando trazabilidad absoluta mediante números correlativos únicos por RUC, control paramétrico de Acuerdos de Nivel de Servicio (SLA) con alertas no redundantes, contención de riesgos legales e indemnizaciones en la Mesa de Casos Sensibles (Gate Legal Eje 3), gestión de resoluciones por morosidad y soporte en vivo para eventos masivos (EntregaFest); todo soportado sobre una arquitectura de monolito modular en Node.js 20/NestJS con TypeScript, frontend en React, almacenamiento inmutable con Object Lock en AWS S3, base de datos transaccional PostgreSQL Multi-AZ con bitácoras selladas criptográficamente vía HMAC-SHA256, y cumplimiento riguroso de la Ley 29733 de Protección de Datos Personales.

---

## 2. GUÍA DE OPERACIÓN PARA AGENTES DE CODIFICACIÓN IA

Como agente de codificación de IA (Claude Code, GPT Codex, OpenCode, etc.), debes operar bajo las siguientes reglas mandatorias antes de generar, refactorizar o evaluar cualquier componente de código:

### Protocolo 1: Verificación DoR Previa al Código (Pre-Code Gate)
1. **Nunca inicies la implementación de una Historia de Usuario (`[US-XX]`)** sin consultar antes `02-definition-of-ready.md`.
2. Verifica que los contratos de interfaz de las dependencias (`DEP-XX`) asociadas a la historia estén definidos o simulados mediante adaptadores Mock (`contract-first`).
3. Si una funcionalidad figura como `NO LISTO` (ej. `[FEAT-11]` UrbeMind), no generes código de producción hasta que se levante la condición de bloqueo.

### Protocolo 2: Trazabilidad Bidireccional Estricta
- Cada commit, archivo de código fuente, suite de pruebas automatizadas y documentación debe referenciar explícitamente la tríada de identificadores:
  `[EPIC-XX]` -> `[FEAT-XX]` -> `[US-XX]` (ejemplo: `EP-ATC-01` -> `FT-ATC-01` -> `HU-ATC-001` / `RF-SVC-001`).

### Protocolo 3: Terminología de Negocio Obligatoria (RNF-USA-003)
- Queda terminantemente prohibido utilizar el término «agente» o «operador» para referirse al usuario del sistema en interfaces, variables o comentarios de código. Debe usarse siempre **`Gestor de tickets`** (o `TicketManager` en código).

### Protocolo 4: Privacidad y Cumplimiento Normativo (Ley 29733)
- **Cero PII en logs y notas internas:** Nunca persistas DNI, nombres de clientes ni datos sensibles en campos de notas libres (`Notes_*`) o bitácoras de auditoría (`RNF-SEC-008`).
- **Anonimización en prompts de IA:** Cualquier llamada al proveedor de IA debe pasar por el servicio de sanitización y anonimización de datos (`RNF-SEC-009`).
- **Asistencia, no decisión:** Los modelos de IA únicamente sugieren soluciones o respuestas; la decisión y el cierre formal son potestad exclusiva del gestor humano (`RN-SVC-032`).

### Protocolo 5: Definición de Terminado (DoD)
- Código generado por IA requiere:
  1. Pruebas unitarias y de integración que cubran el 100 % de los criterios de aceptación Gherkin (`Dado / Cuando / Entonces`).
  2. Inmutabilidad y cálculo de hash `IntegrityHash` (HMAC-SHA256) en bitácoras (`STATUS_LOG`, `ASSIGNMENT_LOG`).
  3. Revisión de pares y análisis SAST sin vulnerabilidades antes de integrar en `develop`.

---

## 3. MAPA DE ESTRUCTURA DOCUMENTAL

```mermaid
graph TD
    DOC00["00-CONTEXT-INDEX.md<br/><b>Mapa Mental y Trazabilidad</b>"] --> DOC01["01-master-plan.md<br/><b>Plan de 2 Semanas y Arquitectura</b>"]
    DOC00 --> DOC02["02-definition-of-ready.md<br/><b>Checklist DoR y Modelo de Datos</b>"]
    DOC01 --> DOC03["03-epics.md<br/><b>11 Épicas Detalladas</b>"]
    DOC02 --> DOC03
    DOC03 --> DOC04["04-features.md<br/><b>22 Features y 60 Requerimientos</b>"]
    DOC04 --> DOC05["05-user-stories.md<br/><b>60 Historias de Usuario con Gherkin</b>"]
```

---

## 4. ÁRBOL MAESTRO DE TRAZABILIDAD (EPIC -> FEAT -> US)

El proyecto consta de **11 Épicas**, **22 Funcionalidades** y **60 Historias de Usuario** cubriendo **60 Requerimientos Funcionales (RF)**, **25 Requerimientos No Funcionales (RNF)** y **42 Reglas de Negocio (RN)** distribuidas en 4 desarrolladores en un horizonte de 10 días hábiles (227 horas estimadas con IA).

```mermaid
graph LR
    subgraph EP01 ["EP-ATC-01: Núcleo de tickets omnicanal (22 h)"]
        FT01["FT-ATC-01: Registro y tipificación (9 h)"] --> HU001["HU-ATC-001: Registrar ticket tipificado"]
        FT01 --> HU002["HU-ATC-002: Correlativo único por RUC"]
        FT02["FT-ATC-02: Ciclo de vida e hitos (13 h)"] --> HU004["HU-ATC-004: Cambiar estado del ticket"]
        FT02 --> HU005["HU-ATC-005: Registrar interacciones"]
        FT02 --> HU006["HU-ATC-006: Conservar hitos temporales"]
    end

    subgraph EP02 ["EP-ATC-02: Enrutamiento, SLA y alertas (28 h)"]
        FT03["FT-ATC-03: Derivación y casillero (11 h)"] --> HU007["HU-ATC-007: Derivar con motivo"]
        FT03 --> HU008["HU-ATC-008: Reasignar en bloque"]
        FT03 --> HU009["HU-ATC-009: Casillero de tareas"]
        FT04["FT-ATC-04: Motor SLA y alertas (17 h)"] --> HU003["HU-ATC-003: Congelar SLA"]
        FT04 --> HU010["HU-ATC-010: Alerta no redundante SLA"]
        FT04 --> HU011["HU-ATC-011: Reabrir con compromiso"]
        FT04 --> HU029["HU-ATC-029: Cierre end-to-end"]
    end

    subgraph EP03 ["EP-ATC-03: Libro de Reclamaciones (21 h)"]
        FT05["FT-ATC-05: Libro de Reclamaciones (18 h)"] --> HU012["HU-ATC-012: Asiento correlativo"]
        FT05 --> HU013["HU-ATC-013: Plazo legal y prórroga"]
        FT05 --> HU014["HU-ATC-014: Respuesta formal con carta"]
        FT05 --> HU015["HU-ATC-015: Vigilar plazo y multas"]
        FT06["FT-ATC-06: Apelaciones e INDECOPI (3 h)"] --> HU016["HU-ATC-016: Seguimiento apelaciones"]
    end

    subgraph EP04 ["EP-ATC-04: Gate Legal y Mesa Casos Sensibles (32 h)"]
        FT07["FT-ATC-07: Gate a Eje 3 y Handoff (9 h)"] --> HU026["HU-ATC-026: Bloquear resolución Eje 1/2"]
        FT07 --> HU027["HU-ATC-027: Paquete mínimo handoff"]
        FT07 --> HU028["HU-ATC-028: Nota estado emocional"]
        FT08["FT-ATC-08: Mesa SGD y riesgo (11 h)"] --> HU020["HU-ATC-020: Código Único sensible"]
        FT08 --> HU021["HU-ATC-021: Cargo previo y final"]
        FT08 --> HU022["HU-ATC-022: Matriz riesgo 5x5"]
        FT09["FT-ATC-09: Escalamiento y cierre (12 h)"] --> HU023["HU-ATC-023: Escalar en cadena"]
        FT09 --> HU024["HU-ATC-024: Casos cruzados"]
        FT09 --> HU025["HU-ATC-025: Cierre tipificado"]
    end

    subgraph EP05 ["EP-ATC-05: Reclamos de Garantía Postventa (12 h)"]
        FT10["FT-ATC-10: Garantías postventa (12 h)"] --> HU033["HU-ATC-033: Registrar garantía y partida"]
        FT10 --> HU034["HU-ATC-034: Validar vigencia acta"]
        FT10 --> HU035["HU-ATC-035: Inspección técnica previa"]
        FT10 --> HU036["HU-ATC-036: Escalamiento a Eje 3"]
    end

    subgraph EP06 ["EP-ATC-06: Integración UrbeMind (7 h)"]
        FT11["FT-ATC-11: Incidentes urbanos (7 h)"] --> HU017["HU-ATC-017: Atender incidencia urbana"]
        FT11 --> HU018["HU-ATC-018: Exponer tickets por API"]
    end

    subgraph EP07 ["EP-ATC-07: Calidad y Torre de Control CX (16 h)"]
        FT13["FT-ATC-13: Encuesta post-atención (3 h)"] --> HU019["HU-ATC-019: Disparar encuesta CSAT/NPS"]
        FT14["FT-ATC-14: Torre de Control CX (13 h)"] --> HU030["HU-ATC-030: Monitoreo en tiempo real"]
        FT14 --> HU031["HU-ATC-031: Informe diario y quincenal"]
        FT14 --> HU032["HU-ATC-032: Auditar registros paralelos"]
    end

    subgraph EP08 ["EP-ATC-08: EntregaFest Contención en Vivo (6 h)"]
        FT15["FT-ATC-15: Contención evento (6 h)"] --> HU037["HU-ATC-037: Registrar riesgo verbal"]
        FT15 --> HU038["HU-ATC-038: Derivación Estación 4"]
        FT15 --> HU039["HU-ATC-039: Etiqueta EFEST-2026"]
    end

    subgraph EP09 ["EP-ATC-09: Bandeja y Asistencia al Gestor (32 h)"]
        FT18["FT-ATC-18: Bandeja orquestadora (15 h)"] --> HU043["HU-ATC-043: Flujo configurable área"]
        FT18 --> HU044["HU-ATC-044: Bandeja única unificada"]
        FT18 --> HU045["HU-ATC-045: Rayo de criticidad"]
        FT18 --> HU046["HU-ATC-046: Reasignación por saturación"]
        FT19["FT-ATC-19: Asistencia guía e IA (11 h)"] --> HU047["HU-ATC-047: Base de conocimiento"]
        FT19 --> HU048["HU-ATC-048: Sugerencias IA y registro"]
        FT21["FT-ATC-21: Productividad gestor (6 h)"] --> HU054["HU-ATC-054: Avance diario individual"]
        FT21 --> HU055["HU-ATC-055: Alerta push asignación"]
    end

    subgraph EP10 ["EP-ATC-10: Consulta 360 e Integraciones (34 h)"]
        FT20["FT-ATC-20: Búsqueda 360 (18 h)"] --> HU049["HU-ATC-049: Búsqueda y click-to-call"]
        FT20 --> HU050["HU-ATC-050: Vista 360 consolidada"]
        FT20 --> HU051["HU-ATC-051: Modo degradado de búsqueda"]
        FT20 --> HU052["HU-ATC-052: Conector motor de José"]
        FT20 --> HU053["HU-ATC-053: Búsqueda semántica (flex)"]
        FT17["FT-ATC-17: CTI Call Center (7 h)"] --> HU042["HU-ATC-042: Screen pop y llamada CTI"]
        FT16["FT-ATC-16: Enlace con Legal (9 h)"] --> HU040["HU-ATC-040: Sincronización Legal Eje 3"]
        FT16 --> HU041["HU-ATC-041: Priorizar riesgo 8 % interés"]
    end

    subgraph EP11 ["EP-ATC-11: Morosidad y Formularios Simples (17 h)"]
        FT22["FT-ATC-22: Resolución morosidad (10 h)"] --> HU056["HU-ATC-056: Apertura caso 3 cuotas"]
        FT22 --> HU057["HU-ATC-057: Alerta previa resolución"]
        FT22 --> HU058["HU-ATC-058: Carta notarial y bloqueo"]
        FT23["FT-ATC-23: Formularios simples (7 h)"] --> HU059["HU-ATC-059: Registro ingreso proyecto"]
        FT23 --> HU060["HU-ATC-060: Reserva bus EntregaFest"]
    end
```

---

## 5. MATRIZ DE ASIGNACIÓN, HORAS Y CALENDARIO

| Desarrollador | Épicas Asignadas | Funcionalidades | Horas Asignadas | Capacidad | Carga | Holgura |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Dev 1** | `[EPIC-01]`, `[EPIC-03]`, `[EPIC-05]` | `FT-01`, `FT-02`, `FT-05`, `FT-06`, `FT-10` | 55 h | 60 h | 92 % | 5 h |
| **Dev 2** | `[EPIC-02]`, `[EPIC-04]` | `FT-03`, `FT-04`, `FT-07`, `FT-08`, `FT-09` | 60 h | 60 h | 100 % | 0 h |
| **Dev 3** | `[EPIC-09]`, `[EPIC-07]`, `[EPIC-08]` | `FT-18`, `FT-19`, `FT-21`, `FT-13`, `FT-14`, `FT-15` | 54 h | 60 h | 90 % | 6 h |
| **Dev 4** | `[EPIC-10]`, `[EPIC-11]`, `[EPIC-06]` | `FT-20`, `FT-17`, `FT-16`, `FT-22`, `FT-23`, `FT-11` | 58 h | 60 h | 97 % | 2 h |
| **TOTAL** | **11 Épicas** | **22 Funcionalidades** | **227 h** | **240 h** | **95 %** | **13 h** |

---

## 6. HITOS CLAVE DEL HORIZONTE DE 10 DÍAS

- **Kick-off y Base Técnica:** Lunes 19-oct-2026 (Modelado de datos en base, contratos de interfaz y simuladores).
- **Demo Iteración 1:** Viernes 23-oct-2026 (Presentación de `EP-01`, `EP-02`, `EP-09`, `EP-10`).
- **Control de Alcance:** Martes 27-oct-2026 (Decisión de descarte de flexible: `HU-ATC-053`, `HU-ATC-011`, `HU-ATC-037..039` si hay retraso).
- **Code Freeze:** Jueves 29-oct-2026 18:00 (Congelamiento estricto de ramas `feature/*`).
- **UAT, Demo Final y Go/No-Go:** Viernes 30-oct-2026 (Pruebas con usuarios clave, verificación de integridad y decisión de pase a producción v1.0).
