---
id_documento: DOC-ATC-05
tipo: historias_de_usuario
titulo: Catálogo Maestro de Historias de Usuario · Criterios Gherkin, DoD y Diagramas
proposito: Proporcionar a los agentes de codificación de IA (Claude Code, GPT Codex, OpenCode) las 60 Historias de Usuario completas de la Plataforma Aybar Atiende con criterios de aceptación Gherkin ejecutables, reglas de negocio, checklist de Definition of Done (DoD) y diagramas técnicos de secuencia y datos.
version: 1.2
fecha: 2026-10-14
autor: Eddie Huamaní (Dueño de Producto - PO)
fuente: ATC_requerimientos.xlsx · Versión con feedback de presentación y 2.ª reunión usuaria
archivos_relacionados:
  - docs/scrum/00-CONTEXT-INDEX.md
  - docs/scrum/01-master-plan.md
  - docs/scrum/02-definition-of-ready.md
  - docs/scrum/03-epics.md
  - docs/scrum/04-features.md
---

# 05 · HISTORIAS DE USUARIO DETALLADAS (60 HISTORIAS)
## Plataforma de Atención al Cliente «Aybar Atiende» · AYBARCORP SAC

---

## [US-001] HU-ATC-001: Registrar un ticket tipificado desde cualquier canal

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-001]` (`HU-ATC-001`)
- **Requerimiento Funcional de Origen:** `RF-SVC-001`
- **Funcionalidad Padre:** `[FEAT-01]` (`FT-ATC-01`)
- **Épica Padre:** `[EPIC-01]` (`EP-ATC-01`)
- **Prioridad:** Debe
- **Estimación con IA:** 6 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · lun 19-oct → mar 20-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-001 · El sistema debe registrar tickets de teléfono, WhatsApp y correo con canal, cliente, empresa (RUC), línea de negocio, tipo, prioridad, resumen y descripción.

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** registrar la solicitud del cliente en un ticket con canal, cliente, empresa, línea de negocio, tipo, prioridad y resumen
> **PARA** tipificar cada solicitud desde el primer contacto y no volver a pedir datos

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Campos obligatorios
```gherkin
DADO que registro un ticket nuevo
CUANDO intento guardarlo sin empresa (RUC) o sin línea de negocio
ENTONCES el sistema no lo guarda y señala los campos faltantes; empresa y línea no se derivan de otro dato.
```

#### CA-02 · Canal remoto sin local
```gherkin
DADO que la solicitud llega por WhatsApp
CUANDO registro el ticket sin establecimiento
ENTONCES el ticket se guarda con el establecimiento vacío.
```

#### CA-03 · Cliente desde SIGDA/TAXON (agregado por PO)
```gherkin
DADO que busco al cliente por DNI o nombre
CUANDO lo selecciono
ENTONCES los datos se traen del maestro único y no se crea un registro paralelo del cliente.
```

#### CA-04 · Permiso (agregado por PO)
```gherkin
DADO que mi rol no es de atención
CUANDO intento registrar un ticket
ENTONCES el sistema me lo impide y registra el intento.
```

### Reglas de Negocio Asociadas
- **RN-SVC-005 empresa y línea obligatorias**
- **RN-SVC-026 cero registros paralelos**

**Fuera de alcance:**
Creación automática por conectores de WhatsApp y correo (pendientes de producto).

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** `Prototipo Aybar Atiende › Nuevo ticket`
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET, MAE_CHANNEL, MAE_TICKET_TYPE, MAE_TICKET_PRIORITY · DEP-01 SIGDA/TAXON`
- **Evento de Analítica / Telemetría:** `Evento ticket_creado {canal, tipo, prioridad, empresa}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento ticket_creado {canal, tipo, prioridad, empresa}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca cliente por DNI
    Note over UI,Core: 2 Consultar cliente / KYC
    Note over UI,Core: 3 Datos del cliente
    Note over UI,Core: 4 Completa tipo, prioridad, RUC
    Note over UI,Core: 5 Crear ticket
    Note over UI,Core: 6 Congelar vencimientos
    Note over UI,Core: 7 N.º correlativo por RUC
    Note over UI,Core: 8 Muestra N.º para el cliente
    Note over Gestor,Ext: ALT
```

---

## [US-002] HU-ATC-002: Entregar al cliente un número de ticket por razón social

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-002]` (`HU-ATC-002`)
- **Requerimiento Funcional de Origen:** `RF-SVC-002`
- **Funcionalidad Padre:** `[FEAT-01]` (`FT-ATC-01`)
- **Épica Padre:** `[EPIC-01]` (`EP-ATC-01`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · mar 20-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-002 · El sistema debe generar un número correlativo único por razón social y entregarlo al cliente.

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** que el sistema genere un número correlativo propio de cada razón social al guardar el ticket
> **PARA** entregarle al cliente un número con el que pueda dar seguimiento

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Correlativo por empresa
```gherkin
DADO dos tickets de empresas distintas registrados el mismo día
CUANDO se numeran
ENTONCES cada empresa sigue su propio correlativo, sin saltos ni duplicados.
```

#### CA-02 · Número visible
```gherkin
DADO que guardo el ticket
CUANDO termina el registro
ENTONCES veo el número en pantalla para dictarlo o enviarlo al cliente.
```

#### CA-03 · Concurrencia (agregado por PO)
```gherkin
DADO que dos gestores de tickets guardan tickets de la misma empresa al mismo tiempo
CUANDO se numeran
ENTONCES cada ticket recibe un número distinto.
```

### Reglas de Negocio Asociadas
- **RN-SVC-004 correlativo por RUC**

**Fuera de alcance:**
Envío automático del número por el canal de origen (pendientes de producto). Diseño / UX Prototipo › Detalle de ticket (cabecera) Notas técnicas y dependencias Secuencia por CompanyID; formato visible por definir (pregunta abierta de FT-01)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca cliente por DNI
    Note over UI,Core: 2 Consultar cliente / KYC
    Note over UI,Core: 3 Datos del cliente
    Note over UI,Core: 4 Completa tipo, prioridad, RUC
    Note over UI,Core: 5 Crear ticket
    Note over UI,Core: 6 Congelar vencimientos
    Note over UI,Core: 7 N.º correlativo por RUC
    Note over UI,Core: 8 Muestra N.º para el cliente
    Note over Gestor,Ext: ALT
```

---

## [US-003] HU-ATC-003: Congelar el SLA del ticket al abrirlo

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-003]` (`HU-ATC-003`)
- **Requerimiento Funcional de Origen:** `RF-SVC-003`
- **Funcionalidad Padre:** `[FEAT-04]` (`FT-ATC-04`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 6 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · mié 21-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-003 · El sistema debe elegir la política SLA vigente por precedencia y congelar los vencimientos de 1.ª respuesta y resolución al abrir el ticket.

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** que al abrir un ticket se elija la política SLA correcta y se congelen sus vencimientos en tiempo hábil
> **PARA** tener un compromiso estable que no cambie si la política se actualiza después

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Precedencia
```gherkin
DADO un tipo con política específica (tipo+prioridad) y otra genérica activas
CUANDO se abre un ticket de esa prioridad
ENTONCES se aplica la específica; si no existe, la genérica.
```

#### CA-02 · Feriado
```gherkin
DADO un ticket abierto el viernes a las 18:00 antes de un feriado, con base BUSINESS_HOURS
CUANDO se congela el SLA
ENTONCES el vencimiento cae en horas hábiles posteriores y el ticket no nace incumplido.
```

#### CA-03 · Cambio de política (agregado por PO)
```gherkin
DADO un ticket abierto con su SLA congelado
CUANDO se modifica la política
ENTONCES los vencimientos del ticket no cambian.
```

#### CA-04 · Sin política (agregado por PO)
```gherkin
DADO un tipo sin política activa
CUANDO se abre un ticket
ENTONCES el sistema aplica la genérica global y registra una alerta de configuración.
```

### Reglas de Negocio Asociadas
- **RN-SVC-001 precedencia**
- **RN-SVC-002 compromisos congelados**
- **RN-SVC-003 días hábiles únicos**

**Fuera de alcance:**
Definición de los tiempos de la matriz (DEP-03). Diseño / UX Prototipo › Nuevo ticket (panel «SLA que se congelará»)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `MAE_SLA_POLICY, MAE_TIME, MAE_HOLIDAY · DEP-03, DEP-04`
- **Evento de Analítica / Telemetría:** `Evento sla_congelado {política, fr_due, res_due}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento sla_congelado {política, fr_due, res_due}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Ticket abierto (tipo, prioridad)
    Note over UI,Core: 2 Precedencia de política
    Note over UI,Core: 3 Días hábiles y feriados
    Note over UI,Core: 4 Calendario
    Note over UI,Core: 5 Vencimientos congelados
    Note over UI,Core: 6 Evaluar vencidos
    Note over UI,Core: 7 Alerta RESOLUTION_OVERDUE
    Note over Gestor,Ext: ALT
```

---

## [US-004] HU-ATC-004: Cambiar el estado del ticket con historial inmutable

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-004]` (`HU-ATC-004`)
- **Requerimiento Funcional de Origen:** `RF-SVC-004`
- **Funcionalidad Padre:** `[FEAT-02]` (`FT-ATC-02`)
- **Épica Padre:** `[EPIC-01]` (`EP-ATC-01`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · mar 20-oct → mié 21-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-004 · El sistema debe gestionar 7 estados y registrar cada transición con fecha y autor en un historial append-only.

### Narrativa de Usuario
> **COMO** colaborador de área
> **QUIERO** cambiar el estado del ticket (abierto, en atención, espera cliente, escalado, resuelto, cerrado, reabierto)
> **PARA** que todos conozcan el estado real y su historial completo

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Historial
```gherkin
DADO un ticket en atención
CUANDO cambio su estado
ENTONCES se agrega una fila al STATUS_LOG con fecha y autor y el puntero del ticket se actualiza.
```

#### CA-02 · Inmutabilidad
```gherkin
DADO un historial con transiciones
CUANDO alguien intenta editar o borrar una fila
ENTONCES la operación se rechaza.
```

#### CA-03 · Cambio automático (agregado por PO)
```gherkin
DADO un cambio realizado por el sistema
CUANDO se registra
ENTONCES la fila queda con marca automática en lugar de autor.
```

#### CA-04 · Transición inválida (agregado por PO)
```gherkin
DADO un ticket CLOSED
CUANDO intento pasarlo a IN_PROGRESS sin reabrirlo
ENTONCES el sistema lo impide e indica que primero debo reabrirlo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-006 append-only**
- **RN-SVC-023 cierre formal en Mi Portal**

**Fuera de alcance:**
Estados personalizados por área.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** `Prototipo › Detalle de ticket (stepper y «Cambiar estado»)`
- **Entidades y Dependencias:** `ENT-SVC-002 SVC_TICKET_STATUS_LOG · RNF-AUD-004 hash`
- **Evento de Analítica / Telemetría:** `Evento ticket_estado {de, a, autor}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento ticket_estado {de, a, autor}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Registra respuesta visible
    Note over UI,Core: 2 Guardar interacción
    Note over UI,Core: 3 Fila + IntegrityHash
    Note over UI,Core: 4 Marca FirstResponded
    Note over UI,Core: 5 Cambia a RESOLVED
    Note over UI,Core: 6 Transición de estado
    Note over UI,Core: 7 STATUS_LOG append
    Note over UI,Core: 8 Publica estado al cliente
    Note over Gestor,Ext: ALT
```

---

## [US-005] HU-ATC-005: Registrar interacciones visibles o internas con evidencia

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-005]` (`HU-ATC-005`)
- **Requerimiento Funcional de Origen:** `RF-SVC-005`
- **Funcionalidad Padre:** `[FEAT-02]` (`FT-ATC-02`)
- **Épica Padre:** `[EPIC-01]` (`EP-ATC-01`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · mié 21-oct → jue 22-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-005 · El sistema debe registrar cada interacción con canal, gestor de tickets, visibilidad al cliente y evidencia multimedia adjunta.

### Narrativa de Usuario
> **COMO** colaborador de área
> **QUIERO** registrar mensajes al cliente y notas internas, con fotos o documentos adjuntos
> **PARA** separar lo que ve el cliente de lo interno y conservar la evidencia del caso

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Primera respuesta
```gherkin
DADO un ticket sin respuestas
CUANDO registro la primera respuesta visible al cliente
ENTONCES se completa el hito FirstRespondedDateTime.
```

#### CA-02 · Evidencia
```gherkin
DADO una incidencia con foto o video
CUANDO la adjunto
ENTONCES queda dentro de la interacción, sin tabla de adjuntos aparte.
```

#### CA-03 · Nota interna (agregado por PO)
```gherkin
DADO que marco una interacción como interna
CUANDO el cliente consulta su caso en Mi Portal
ENTONCES la nota no se muestra.
```

#### CA-04 · DLP (agregado por PO)
```gherkin
DADO que escribo un DNI o una tarjeta en una nota de bitácora
CUANDO intento guardarla
ENTONCES el sistema advierte que no se permite PII en ese campo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-012 DLP en bitácoras**

**Fuera de alcance:**
Chat en vivo; edición de interacciones enviadas.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** `Prototipo › Detalle de ticket (Interacciones)`
- **Entidades y Dependencias:** `ENT-SVC-004 SVC_TICKET_INTERACTION · RNF-SEC-008`
- **Evento de Analítica / Telemetría:** `Evento interacción_registrada {tipo, visible, adjuntos}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento interacción_registrada {tipo, visible, adjuntos}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Registra respuesta visible
    Note over UI,Core: 2 Guardar interacción
    Note over UI,Core: 3 Fila + IntegrityHash
    Note over UI,Core: 4 Marca FirstResponded
    Note over UI,Core: 5 Cambia a RESOLVED
    Note over UI,Core: 6 Transición de estado
    Note over UI,Core: 7 STATUS_LOG append
    Note over UI,Core: 8 Publica estado al cliente
    Note over Gestor,Ext: ALT
```

---

## [US-006] HU-ATC-006: Conservar los hitos temporales probatorios

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-006]` (`HU-ATC-006`)
- **Requerimiento Funcional de Origen:** `RF-SVC-006`
- **Funcionalidad Padre:** `[FEAT-02]` (`FT-ATC-02`)
- **Épica Padre:** `[EPIC-01]` (`EP-ATC-01`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · jue 22-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-006 · El sistema debe registrar 1.ª respuesta, 1.ª resolución (inmutable), última resolución y cierre.

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** que el ticket guarde la primera respuesta, la primera resolución, la última resolución y el cierre
> **PARA** medir el cumplimiento del SLA incluso si el ticket se reabre

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Reapertura
```gherkin
DADO un ticket resuelto que se reabre
CUANDO se resuelve de nuevo
ENTONCES FirstResolvedDateTime conserva la primera fecha y ResolvedDateTime refleja el último ciclo.
```

#### CA-02 · Cierre
```gherkin
DADO un ticket resuelto
CUANDO pasa a CLOSED
ENTONCES se registra ClosedDateTime y ya no se modifica salvo que se reabra.
```

### Reglas de Negocio Asociadas
- **RN-SVC-002 compromisos congelados**
- **RN-SVC-007 reapertura**

**Fuera de alcance:**
— Diseño / UX Prototipo › Detalle de ticket (Compromisos SLA) Notas técnicas y dependencias Campos de SVC_TICKET Datos de prueba / analítica Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Registra respuesta visible
    Note over UI,Core: 2 Guardar interacción
    Note over UI,Core: 3 Fila + IntegrityHash
    Note over UI,Core: 4 Marca FirstResponded
    Note over UI,Core: 5 Cambia a RESOLVED
    Note over UI,Core: 6 Transición de estado
    Note over UI,Core: 7 STATUS_LOG append
    Note over UI,Core: 8 Publica estado al cliente
    Note over Gestor,Ext: ALT
```

---

## [US-007] HU-ATC-007: Derivar un ticket a otra área con motivo tipificado

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-007]` (`HU-ATC-007`)
- **Requerimiento Funcional de Origen:** `RF-SVC-007`
- **Funcionalidad Padre:** `[FEAT-03]` (`FT-ATC-03`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · lun 19-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-007 · El sistema debe derivar tickets entre las 6 áreas y colaboradores registrando cada movimiento con motivo en bitácora append-only.

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** derivar el ticket a otra área o colaborador indicando el motivo
> **PARA** conservar el rastro completo de quién tuvo el ticket en cada momento

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Área sin persona
```gherkin
DADO que derivo al área de Cobranza sin elegir persona
CUANDO confirmo
ENTONCES AssignedToPartyID queda vacío y CurrentAreaID se actualiza.
```

#### CA-02 · Rastro
```gherkin
DADO un ticket con varias derivaciones
CUANDO consulto su historial
ENTONCES cada fila muestra quién lo tenía antes, a quién pasó y por qué.
```

#### CA-03 · Motivo obligatorio (agregado por PO)
```gherkin
DADO que intento derivar sin motivo
CUANDO confirmo
ENTONCES el sistema pide elegir un motivo del catálogo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-006 asignación append-only**
- **RN-SVC-012 DLP**

**Fuera de alcance:**
Asignación por habilidades (la reasignación por carga es RF-SVC-046). Diseño / UX Prototipo › Detalle › «Derivar / reasignar» Notas técnicas y dependencias ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG, MAE_Área

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento ticket_derivado {de_área, a_área, motivo}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento ticket_derivado {de_área, a_área, motivo}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Deriva a Cobranza con motivo
    Note over UI,Core: 2 Derivar ticket
    Note over UI,Core: 3 ASSIGNMENT_LOG append
    Note over UI,Core: 4 Bandeja actualizada
    Note over UI,Core: 5 Reasigna en bloque (cese)
    Note over UI,Core: 6 Validar rol supervisor
    Note over UI,Core: 7 Fila REASSIGNMENT_CESE x ticket
    Note over UI,Core: 8 Resumen por destinatario
    Note over Gestor,Ext: ALT
```

---

## [US-008] HU-ATC-008: Reasignar en bloque los tickets de un colaborador que cesa

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-008]` (`HU-ATC-008`)
- **Requerimiento Funcional de Origen:** `RF-SVC-008`
- **Funcionalidad Padre:** `[FEAT-03]` (`FT-ATC-03`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · mar 20-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-008 · El sistema debe reasignar los tickets pendientes de un colaborador que rota o cesa, sin borrar el rastro anterior.

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** reasignar todos los tickets pendientes de un colaborador que rota, renuncia o cesa
> **PARA** continuar la atención sin perder la trazabilidad

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Cese
```gherkin
DADO un colaborador con 12 tickets pendientes que cesa
CUANDO reasigno sus tickets a otro responsable
ENTONCES cada ticket recibe una fila nueva con motivo REASSIGNMENT_CESE y el nuevo responsable.
```

#### CA-02 · Reparto
```gherkin
DADO que elijo varios destinatarios
CUANDO confirmo
ENTONCES los tickets se reparten y el resumen muestra cuántos recibió cada uno.
```

#### CA-03 · Permiso (agregado por PO)
```gherkin
DADO que no soy supervisor
CUANDO intento reasignar en bloque
ENTONCES la acción no está disponible.
```

### Reglas de Negocio Asociadas
- **RN-SVC-006 asignación append-only**

**Fuera de alcance:**
Detección automática de ceses desde RR. HH. (propuesta futura). Diseño / UX Por diseñar: Bandeja › Acciones masivas Notas técnicas y dependencias SVC_TICKET_ASSIGNMENT_LOG

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento reasignación_masiva {n_tickets, motivo}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento reasignación_masiva {n_tickets, motivo}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Deriva a Cobranza con motivo
    Note over UI,Core: 2 Derivar ticket
    Note over UI,Core: 3 ASSIGNMENT_LOG append
    Note over UI,Core: 4 Bandeja actualizada
    Note over UI,Core: 5 Reasigna en bloque (cese)
    Note over UI,Core: 6 Validar rol supervisor
    Note over UI,Core: 7 Fila REASSIGNMENT_CESE x ticket
    Note over UI,Core: 8 Resumen por destinatario
    Note over Gestor,Ext: ALT
```

---

## [US-009] HU-ATC-009: Ver mi casillero de tareas por área y responsable

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-009]` (`HU-ATC-009`)
- **Requerimiento Funcional de Origen:** `RF-SVC-009`
- **Funcionalidad Padre:** `[FEAT-03]` (`FT-ATC-03`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · mar 20-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-009 · El sistema debe ofrecer el casillero por área y responsable como consulta sobre los tickets, sin tabla adicional.

### Narrativa de Usuario
> **COMO** colaborador de área
> **QUIERO** ver en una bandeja los tickets de mi área y los míos, ordenados por vencimiento
> **PARA** conocer mi carga pendiente sin duplicar el estado del ticket

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Bandeja
```gherkin
DADO que abro mi casillero
CUANDO se carga
ENTONCES veo los tickets de CurrentAreaID + CurrentOwnerPartyID + estado activo.
```

#### CA-02 · Filtros
```gherkin
DADO que filtro por «en riesgo o vencidos»
CUANDO aplico el filtro
ENTONCES solo veo los tickets con SLA en riesgo o vencido, resaltados.
```

#### CA-03 · Sin asignar (agregado por PO)
```gherkin
DADO tickets derivados a mi área sin persona
CUANDO abro la bandeja del área
ENTONCES aparecen como «sin asignar» para que alguien los tome.
```

### Reglas de Negocio Asociadas
- **RN-SVC-006**

**Fuera de alcance:**
Tablero Kanban configurable. Diseño / UX Prototipo › Bandeja de tickets Notas técnicas y dependencias Vista/consulta sobre SVC_TICKET + ASSIGNMENT_LOG

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Deriva a Cobranza con motivo
    Note over UI,Core: 2 Derivar ticket
    Note over UI,Core: 3 ASSIGNMENT_LOG append
    Note over UI,Core: 4 Bandeja actualizada
    Note over UI,Core: 5 Reasigna en bloque (cese)
    Note over UI,Core: 6 Validar rol supervisor
    Note over UI,Core: 7 Fila REASSIGNMENT_CESE x ticket
    Note over UI,Core: 8 Resumen por destinatario
    Note over Gestor,Ext: ALT
```

---

## [US-010] HU-ATC-010: Recibir una sola alerta por incumplimiento de SLA

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-010]` (`HU-ATC-010`)
- **Requerimiento Funcional de Origen:** `RF-SVC-010`
- **Funcionalidad Padre:** `[FEAT-04]` (`FT-ATC-04`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · mié 21-oct → jue 22-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-010 · El sistema debe detectar por job FIRST_RESPONSE_OVERDUE y RESOLUTION_OVERDUE y alertar una sola vez por tipo y ciclo.

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** recibir una alerta cuando un ticket incumple su primera respuesta o su resolución
> **PARA** actuar a tiempo sin recibir alertas duplicadas

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Sin duplicados
```gherkin
DADO un ticket que ya alertó FIRST_RESPONSE_OVERDUE en este ciclo
CUANDO el job vuelve a correr
ENTONCES no se genera otra alerta de ese tipo.
```

#### CA-02 · Constancia
```gherkin
DADO una alerta generada
CUANDO la consulto
ENTONCES muestra destinatario, fecha, canal, vencimiento evaluado (EvaluatedDueDateTime) y ciclo.
```

#### CA-03 · Ticket resuelto (agregado por PO)
```gherkin
DADO un ticket resuelto antes de su vencimiento
CUANDO corre el job
ENTONCES no se genera alerta.
```

### Reglas de Negocio Asociadas
- **RN-SVC-008 alerta única por ciclo**

**Fuera de alcance:**
Escalamiento a jefaturas (casos sensibles: FT-ATC-09). Diseño / UX Prototipo › Bandeja (chip «En riesgo / vencido») Notas técnicas y dependencias ENT-SVC-009 SVC_SLA_BREACH_ALERT · job batch

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento sla_alerta {tipo, ciclo}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento sla_alerta {tipo, ciclo}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Ticket abierto (tipo, prioridad)
    Note over UI,Core: 2 Precedencia de política
    Note over UI,Core: 3 Días hábiles y feriados
    Note over UI,Core: 4 Calendario
    Note over UI,Core: 5 Vencimientos congelados
    Note over UI,Core: 6 Evaluar vencidos
    Note over UI,Core: 7 Alerta RESOLUTION_OVERDUE
    Note over Gestor,Ext: ALT
```

---

## [US-011] HU-ATC-011: Reabrir un ticket con un nuevo compromiso sin borrar el original

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-011]` (`HU-ATC-011`)
- **Requerimiento Funcional de Origen:** `RF-SVC-011`
- **Funcionalidad Padre:** `[FEAT-04]` (`FT-ATC-04`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · jue 22-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-011 · El sistema debe soportar la reapertura con ReopenCount y un nuevo vencimiento calculado con la política vigente, conservando el original.

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** que al reabrir un ticket se calcule un nuevo compromiso con la política vigente
> **PARA** vigilar el ciclo actual sin perder la evidencia del primer compromiso

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Nuevo compromiso
```gherkin
DADO un ticket cerrado que se reabre
CUANDO se calcula ReopenedResolutionDueDateTime
ENTONCES el vencimiento original no se reescribe y las alertas evalúan el nuevo.
```

#### CA-02 · Contador
```gherkin
DADO un ticket reabierto dos veces
CUANDO consulto el ticket
ENTONCES ReopenCount = 2 y cada ciclo tiene sus propias alertas.
```

### Reglas de Negocio Asociadas
- **RN-SVC-007 reapertura**
- **RN-SVC-008**

**Fuera de alcance:**
Límite máximo de reaperturas (por definir). Diseño / UX Prototipo › Detalle › «Cambiar estado: Reabierto» Notas técnicas y dependencias SVC_TICKET, SVC_SLA_BREACH_ALERT Datos de prueba / analítica Evento ticket_reabierto {ciclo}

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-012] HU-ATC-012: Registrar el asiento del Libro de Reclamaciones

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-012]` (`HU-ATC-012`)
- **Requerimiento Funcional de Origen:** `RF-SVC-012`
- **Funcionalidad Padre:** `[FEAT-05]` (`FT-ATC-05`)
- **Épica Padre:** `[EPIC-03]` (`EP-ATC-03`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · jue 22-oct → vie 23-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-012 · El sistema debe crear el asiento QUEJA/RECLAMO como extensión 1:1 del ticket, con correlativo por empresa y establecimiento.

### Narrativa de Usuario
> **COMO** responsable legal de reclamos
> **QUIERO** que cada queja o reclamo genere su asiento con hechos, pedido y monto reclamado
> **PARA** dejar constancia formal conforme al formato regulado

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Correlativo
```gherkin
DADO dos asientos de la misma empresa en establecimientos distintos
CUANDO se numeran
ENTONCES cada establecimiento lleva su propio correlativo.
```

#### CA-02 · Monto y moneda
```gherkin
DADO un reclamo con monto
CUANDO lo guardo sin moneda
ENTONCES el sistema lo rechaza; sin monto, ambos campos quedan vacíos.
```

#### CA-03 · Empresa inmutable (agregado por PO)
```gherkin
DADO un asiento registrado
CUANDO alguien intenta cambiar su razón social
ENTONCES la operación se rechaza.
```

### Reglas de Negocio Asociadas
- **RN-SVC-004**
- **RN-SVC-013 empresa inmutable en el libro**

**Fuera de alcance:**
Hoja de reclamación pública web. Diseño / UX Prototipo › Libro de Reclamaciones Notas técnicas y dependencias ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY · DEP-05 validación legal

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento asiento_libro {tipo, empresa, establecimiento}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento asiento_libro {tipo, empresa, establecimiento}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Crear asiento (QUEJA/RECLAMO)
    Note over UI,Core: 2 Correlativo + plazo legal
    Note over UI,Core: 3 Evaluar plazo legal
    Note over UI,Core: 4 Alerta EXTENSION_WINDOW
    Note over UI,Core: 5 Registra prórroga con cargo
    Note over UI,Core: 6 Registra respuesta + carta
    Note over UI,Core: 7 Guardar PDF + checksum
    Note over UI,Core: 8 Asiento respondido
    Note over Gestor,Ext: ALT
```

---

## [US-013] HU-ATC-013: Calcular el plazo legal y gestionar la prórroga única

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-013]` (`HU-ATC-013`)
- **Requerimiento Funcional de Origen:** `RF-SVC-013`
- **Funcionalidad Padre:** `[FEAT-05]` (`FT-ATC-05`)
- **Épica Padre:** `[EPIC-03]` (`EP-ATC-03`)
- **Prioridad:** Debe
- **Estimación con IA:** 6 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 1 · vie 23-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-013 · El sistema debe calcular 15 días hábiles desde el registro y gestionar una prórroga única de 15 días con justificación, cargo y canal, bloqueando una segunda.

### Narrativa de Usuario
> **COMO** responsable legal de reclamos
> **QUIERO** ver el plazo legal de cada reclamo y registrar una única prórroga justificada
> **PARA** responder dentro del plazo y acreditar la prórroga ante una fiscalización

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Requisitos de prórroga
```gherkin
DADO un reclamo dentro de plazo
CUANDO registro la prórroga
ENTONCES el sistema exige justificación, cargo, canal y fecha de comunicación anterior al vencimiento original.
```

#### CA-02 · Sin reescritura
```gherkin
DADO un vencimiento ya prorrogado
CUANDO alguien intenta modificarlo
ENTONCES se rechaza y cualquier cambio queda como fila nueva en el historial.
```

#### CA-03 · Segunda prórroga (agregado por PO)
```gherkin
DADO un reclamo ya prorrogado
CUANDO intento prorrogar otra vez
ENTONCES la acción está bloqueada.
```

#### CA-04 · Fuera de ventana (agregado por PO)
```gherkin
DADO un reclamo con el plazo original vencido
CUANDO intento prorrogar
ENTONCES el sistema lo impide porque la prórroga debe comunicarse antes del vencimiento.
```

### Reglas de Negocio Asociadas
- **RN-SVC-009 plazo 15+15**
- **RN-SVC-003 días hábiles**

**Fuera de alcance:**
Plazos distintos por sector regulado. Diseño / UX Prototipo › Libro › «Prorrogar 15 d»

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `SVC_COMPLAINT_BOOK_ENTRY, MAE_TIME · DEP-04`
- **Evento de Analítica / Telemetría:** `Evento prorroga_registrada`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento prorroga_registrada` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Crear asiento (QUEJA/RECLAMO)
    Note over UI,Core: 2 Correlativo + plazo legal
    Note over UI,Core: 3 Evaluar plazo legal
    Note over UI,Core: 4 Alerta EXTENSION_WINDOW
    Note over UI,Core: 5 Registra prórroga con cargo
    Note over UI,Core: 6 Registra respuesta + carta
    Note over UI,Core: 7 Guardar PDF + checksum
    Note over UI,Core: 8 Asiento respondido
    Note over Gestor,Ext: ALT
```

---

## [US-014] HU-ATC-014: Registrar la respuesta formal con cargo

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-014]` (`HU-ATC-014`)
- **Requerimiento Funcional de Origen:** `RF-SVC-014`
- **Funcionalidad Padre:** `[FEAT-05]` (`FT-ATC-05`)
- **Épica Padre:** `[EPIC-03]` (`EP-ATC-03`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · lun 26-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-014 · El sistema debe registrar la respuesta formal (fecha, resumen, carta PDF con cargo y firmante) y la constancia del derecho a acudir a INDECOPI.

### Narrativa de Usuario
> **COMO** responsable legal de reclamos
> **QUIERO** registrar la respuesta con la carta firmada, su cargo y la constancia del derecho a INDECOPI
> **PARA** acreditar una respuesta válida ante INDECOPI

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Respuesta válida
```gherkin
DADO un reclamo por responder
CUANDO registro la respuesta
ENTONCES se guardan CompanyResponseDate, la carta con cargo (PDF en S3, dentro del hash) y ResponderPartyID.
```

#### CA-02 · Derecho INDECOPI
```gherkin
DADO una respuesta registrada
CUANDO la consulto
ENTONCES consta CustomerNotifiedOfIndecopiRight.
```

#### CA-03 · Sin cargo (agregado por PO)
```gherkin
DADO que intento registrar la respuesta sin adjuntar el cargo
CUANDO confirmo
ENTONCES el sistema no la acepta como respuesta válida.
```

### Reglas de Negocio Asociadas
- **RN-SVC-010 respuesta válida con cargo**

**Fuera de alcance:**
Firma digital certificada (dependerá de un proveedor). Diseño / UX Prototipo › Libro › «Responder» Notas técnicas y dependencias DEP-06 repositorio S3 · RNF-CUM-007

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento respuesta_libro {días_hábiles_usados}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento respuesta_libro {días_hábiles_usados}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Crear asiento (QUEJA/RECLAMO)
    Note over UI,Core: 2 Correlativo + plazo legal
    Note over UI,Core: 3 Evaluar plazo legal
    Note over UI,Core: 4 Alerta EXTENSION_WINDOW
    Note over UI,Core: 5 Registra prórroga con cargo
    Note over UI,Core: 6 Registra respuesta + carta
    Note over UI,Core: 7 Guardar PDF + checksum
    Note over UI,Core: 8 Asiento respondido
    Note over Gestor,Ext: ALT
```

---

## [US-015] HU-ATC-015: Vigilar el plazo legal y detectar reclamos huérfanos

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-015]` (`HU-ATC-015`)
- **Requerimiento Funcional de Origen:** `RF-SVC-015`
- **Funcionalidad Padre:** `[FEAT-05]` (`FT-ATC-05`)
- **Épica Padre:** `[EPIC-03]` (`EP-ATC-03`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · lun 26-oct → mar 27-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-015 · El sistema debe vigilar por job el plazo legal (alertas LEGAL_RESPONSE_OVERDUE y LEGAL_Extensión_WINDOW_CLOSING) y detectar a diario tickets sin asiento.

### Narrativa de Usuario
> **COMO** responsable legal de reclamos
> **QUIERO** que el sistema me alerte cuando un plazo legal está por vencer y detecte reclamos sin asiento
> **PARA** evitar incumplimientos legales y reclamos no registrados

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Alerta legal
```gherkin
DADO un reclamo a 3 días hábiles de vencer sin prórroga
CUANDO corre el job
ENTONCES se genera LEGAL_Extensión_WINDOW_CLOSING, sin exigir política comercial.
```

#### CA-02 · Huérfano
```gherkin
DADO un ticket activo de un tipo con RequiresComplaintBook y sin asiento al cierre del día
CUANDO corre el control diario
ENTONCES se inserta GOV_INTEGRITY_EXCEPTION (ORPHAN_REFERENCE).
```

#### CA-03 · Plazo prorrogado (agregado por PO)
```gherkin
DADO un reclamo prorrogado
CUANDO el job evalúa el plazo
ENTONCES usa el vencimiento prorrogado (COALESCE) y no el original.
```

### Reglas de Negocio Asociadas
- **RN-SVC-011 flag indicativo, fila decisiva**
- **RN-SVC-008**

**Fuera de alcance:**
— Diseño / UX Prototipo › Libro (indicador «Tickets huérfanos hoy») Notas técnicas y dependencias SVC_SLA_BREACH_ALERT, GOV_INTEGRITY_EXCEPTION

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento huerfano_detectado`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento huerfano_detectado` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Crear asiento (QUEJA/RECLAMO)
    Note over UI,Core: 2 Correlativo + plazo legal
    Note over UI,Core: 3 Evaluar plazo legal
    Note over UI,Core: 4 Alerta EXTENSION_WINDOW
    Note over UI,Core: 5 Registra prórroga con cargo
    Note over UI,Core: 6 Registra respuesta + carta
    Note over UI,Core: 7 Guardar PDF + checksum
    Note over UI,Core: 8 Asiento respondido
    Note over Gestor,Ext: ALT
```

---

## [US-016] HU-ATC-016: Dar seguimiento a apelaciones internas y ante INDECOPI

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-016]` (`HU-ATC-016`)
- **Requerimiento Funcional de Origen:** `RF-SVC-016`
- **Funcionalidad Padre:** `[FEAT-06]` (`FT-ATC-06`)
- **Épica Padre:** `[EPIC-03]` (`EP-ATC-03`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · mar 27-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-016 · El sistema debe gestionar apelaciones con estados PENDING … WITHDRAWN, número de caso y resolución de INDECOPI, con historial.

### Narrativa de Usuario
> **COMO** responsable legal de reclamos
> **QUIERO** registrar la apelación del consumidor, su número de caso y la resolución
> **PARA** dar seguimiento hasta la resolución final

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Resolución INDECOPI
```gherkin
DADO una apelación ante INDECOPI
CUANDO se resuelve
ENTONCES registro IndecopiCaseNumber, fecha y resumen de la resolución.
```

#### CA-02 · Historial
```gherkin
DADO una apelación con varios estados
CUANDO la consulto
ENTONCES veo cada estado con fecha y autor.
```

#### CA-03 · Desistimiento (agregado por PO)
```gherkin
DADO que el consumidor desiste
CUANDO registro WITHDRAWN
ENTONCES la apelación queda cerrada y el ticket no puede volver a apelarse por la misma respuesta.
```

### Reglas de Negocio Asociadas
- **RN-SVC-010**

**Fuera de alcance:**
Escritos y audiencias del procedimiento. Diseño / UX Por diseñar: Libro › Apelaciones Notas técnicas y dependencias ENT-SVC-012/013 SVC_COMPLAINT_APPEAL(+_STATUS_LOG)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento apelación_estado`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento apelación_estado` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Notifica apelación (N.º caso)
    Note over UI,Core: 2 Registra apelación
    Note over UI,Core: 3 Crear apelación PENDING
    Note over UI,Core: 4 Actualiza a UNDER_REVIEW
    Note over UI,Core: 5 Resolución
    Note over UI,Core: 6 Registra resolución
    Note over UI,Core: 7 Apelación resuelta + historial
    Note over Gestor,Ext: ALT
```

---

## [US-017] HU-ATC-017: Atender incidencias de ciudad como tickets

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-017]` (`HU-ATC-017`)
- **Requerimiento Funcional de Origen:** `RF-SVC-017`
- **Funcionalidad Padre:** `[FEAT-11]` (`FT-ATC-11`)
- **Épica Padre:** `[EPIC-06]` (`EP-ATC-06`)
- **Prioridad:** Debería
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-017 · El sistema debe vincular opcionalmente el ticket CITY_INCIDENT a un contrato y/o unidad; si deriva en cobro, a un contrato CITY_SERVICE_FEE.

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** atender las incidencias de ciudad como tickets vinculables a un contrato o unidad
> **PARA** reutilizar la misma infraestructura y poder cobrar cuando corresponda

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Cobro
```gherkin
DADO una incidencia que deriva en cobro
CUANDO la vinculo
ENTONCES ContractID apunta a un contrato de tipo CITY_SERVICE_FEE.
```

#### CA-02 · Sin contrato
```gherkin
DADO una incidencia en un área común
CUANDO la registro
ENTONCES el ticket se guarda sin contrato ni unidad.
```

### Reglas de Negocio Asociadas
- **RN-SVC-005**

**Fuera de alcance:**
Facturación del cobro. Diseño / UX Prototipo › Nuevo ticket (tipo «Incidencia de ciudad») Notas técnicas y dependencias SVC_TICKET, MAE_TICKET_TYPE · DEP-09 · R-02 alcance Datos de prueba / analítica Evento incidencia_ciudad

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-018] HU-ATC-018: Exponer tickets a UrbeMind por API y eventos

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-018]` (`HU-ATC-018`)
- **Requerimiento Funcional de Origen:** `RF-SVC-018`
- **Funcionalidad Padre:** `[FEAT-11]` (`FT-ATC-11`)
- **Épica Padre:** `[EPIC-06]` (`EP-ATC-06`)
- **Prioridad:** Debería
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · jue 29-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-018 · El sistema debe exponer creación y consulta de tickets vía API/evento a UrbeMind, sin JOIN físico.

### Narrativa de Usuario
> **COMO** producto UrbeMind (sistema)
> **QUIERO** crear y consultar tickets por API y recibir eventos de cambio de estado
> **PARA** operar como un canal más sin acoplarme a la base del holding

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Creación
```gherkin
DADO una incidencia reportada en UrbeMind
CUANDO UrbeMind llama al API de creación
ENTONCES se crea un ticket CITY_INCIDENT y se devuelve su número.
```

#### CA-02 · Eventos
```gherkin
DADO un ticket de UrbeMind que cambia de estado
CUANDO ocurre el cambio
ENTONCES se publica un evento que UrbeMind puede consumir.
```

#### CA-03 · Seguridad (agregado por PO)
```gherkin
DADO una llamada sin credencial válida
CUANDO llega al API
ENTONCES se rechaza y queda en el log.
```

### Reglas de Negocio Asociadas
- **RNF-INT-003 frontera API/evento**

**Fuera de alcance:**
Cambios dentro de la app UrbeMind. Diseño / UX No aplica (integración) Notas técnicas y dependencias API Gateway, bus de eventos · DEP-09

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Métrica de llamadas y errores por endpoint`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Métrica de llamadas y errores por endpoint` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 POST /tickets (CITY_INCIDENT)
    Note over UI,Core: 2 Crear ticket
    Note over UI,Core: 3 N.º de ticket
    Note over UI,Core: 4 201 Created
    Note over UI,Core: 5 ticket.status_changed
    Note over UI,Core: 6 Evento al suscriptor
    Note over Gestor,Ext: ALT
```

---

## [US-019] HU-ATC-019: Disparar la encuesta al cerrar el ticket

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-019]` (`HU-ATC-019`)
- **Requerimiento Funcional de Origen:** `RF-SVC-019`
- **Funcionalidad Padre:** `[FEAT-13]` (`FT-ATC-13`)
- **Épica Padre:** `[EPIC-07]` (`EP-ATC-07`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · lun 26-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-019 · El sistema debe disparar la encuesta POST_TRANSACTION al cerrar el ticket y permitir medir CSAT/CES por tipo, área y gestor de tickets.

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** que al cerrar un ticket se envíe la encuesta y pueda ver CSAT/CES por tipo, área y gestor de tickets
> **PARA** medir la calidad de la atención

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Disparo
```gherkin
DADO un ticket que pasa a CLOSED
CUANDO se cierra
ENTONCES se registra el envío de la encuesta con puntero polimórfico (SubjectEntityName = 'SVC_TICKET').
```

#### CA-02 · Medición
```gherkin
DADO respuestas recibidas
CUANDO consulto los resultados
ENTONCES veo CSAT/CES por tipo de ticket, área y gestor de tickets.
```

#### CA-03 · Reapertura (agregado por PO)
```gherkin
DADO un ticket con encuesta respondida que se reabre y se vuelve a cerrar
CUANDO se cierra de nuevo
ENTONCES se dispara una nueva encuesta asociada al nuevo ciclo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-007**
- **RNF-INT-004**

**Fuera de alcance:**
Diseño de preguntas. Diseño / UX Prototipo › Torre de Control (CSAT por área) Notas técnicas y dependencias ENT-SVY-001 SVY_SURVEY_RESPONSE · DEP-10 KPI Engine Datos de prueba / analítica Evento encuesta_enviada / encuesta_respondida

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-020] HU-ATC-020: Registrar un caso sensible con Código Único

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-020]` (`HU-ATC-020`)
- **Requerimiento Funcional de Origen:** `RF-SVC-020`
- **Funcionalidad Padre:** `[FEAT-08]` (`FT-ATC-08`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · lun 26-oct → mar 27-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-020 · El sistema debe registrar todo caso sensible por su línea de origen (5 líneas) con un Código Único Estandarizado.

### Narrativa de Usuario
> **COMO** gestor de la Mesa de Casos (SGD)
> **QUIERO** registrar cada caso sensible indicando su línea de ingreso y obtener un Código Único
> **PARA** rastrearlo de punta a punta sin importar el canal

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Código único
```gherkin
DADO un caso detectado por cualquiera de las 5 líneas
CUANDO lo registro
ENTONCES recibe un Código Único que nunca se reutiliza.
```

#### CA-02 · Reclasificación
```gherkin
DADO un caso de Legal Atiende (preventivo) que no se resuelve
CUANDO lo reclasifico
ENTONCES se re-registra como reclamo formal (línea 2) conservando la trazabilidad del origen.
```

### Reglas de Negocio Asociadas
- **RN-SVC-014 cinco líneas de ingreso**

**Fuera de alcance:**
Digitalización del pendientes de producto en papel. Diseño / UX Prototipo › Mesa de Casos SGD Notas técnicas y dependencias Entidad por modelar (R-06) Datos de prueba / analítica Evento caso_sensible_registrado {línea}

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Registra caso (línea Notarial)
    Note over UI,Core: 2 Crear caso
    Note over UI,Core: 3 Código Único
    Note over UI,Core: 4 Emite cargo previo
    Note over UI,Core: 5 Emite cargo de activación
    Note over UI,Core: 6 Iniciar SLA de línea
    Note over UI,Core: 7 Marca criterios de riesgo
    Note over UI,Core: 8 Nivel de riesgo
    Note over Gestor,Ext: ALT
```

---

## [US-021] HU-ATC-021: Emitir cargo previo y cargo de activación por separado

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-021]` (`HU-ATC-021`)
- **Requerimiento Funcional de Origen:** `RF-SVC-021`
- **Funcionalidad Padre:** `[FEAT-08]` (`FT-ATC-08`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · mar 27-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-021 · El sistema debe emitir el cargo previo de asignación y un cargo de activación separado; el SLA de línea inicia solo con la activación.

### Narrativa de Usuario
> **COMO** gestor de la Mesa de Casos (SGD)
> **QUIERO** emitir un cargo previo al recibir el caso y un cargo de activación aparte
> **PARA** que el SLA de línea arranque solo cuando el caso queda formalmente activado

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Cargo previo
```gherkin
DADO un caso recién registrado
CUANDO emito el cargo previo
ENTONCES el SLA de línea todavía no inicia.
```

#### CA-02 · Activación
```gherkin
DADO un caso con cargo previo
CUANDO emito el cargo de activación
ENTONCES el reloj del SLA de línea empieza a correr desde ese instante.
```

#### CA-03 · Limbo (agregado por PO)
```gherkin
DADO un caso con cargo previo sin activar por más de 2 días hábiles
CUANDO corre el control
ENTONCES aparece en la lista de casos en limbo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-015**

**Fuera de alcance:**
— Diseño / UX Prototipo › Mesa SGD («Emitir cargo de activación») Notas técnicas y dependencias Entidad por modelar (R-06)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento caso_activado`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento caso_activado` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Registra caso (línea Notarial)
    Note over UI,Core: 2 Crear caso
    Note over UI,Core: 3 Código Único
    Note over UI,Core: 4 Emite cargo previo
    Note over UI,Core: 5 Emite cargo de activación
    Note over UI,Core: 6 Iniciar SLA de línea
    Note over UI,Core: 7 Marca criterios de riesgo
    Note over UI,Core: 8 Nivel de riesgo
    Note over Gestor,Ext: ALT
```

---

## [US-022] HU-ATC-022: Clasificar el riesgo del caso con matriz objetiva

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-022]` (`HU-ATC-022`)
- **Requerimiento Funcional de Origen:** `RF-SVC-022`
- **Funcionalidad Padre:** `[FEAT-08]` (`FT-ATC-08`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · mar 27-oct → mié 28-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-022 · El sistema debe calcular el nivel de riesgo con una matriz objetiva de criterios ponderados y permitir recalibrarlo con registro.

### Narrativa de Usuario
> **COMO** gestor de la Mesa de Casos (SGD)
> **QUIERO** que el nivel de riesgo se calcule con criterios ponderados y pueda recalibrarse
> **PARA** priorizar sin depender de un juicio subjetivo

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Cálculo objetivo
```gherkin
DADO un caso activado
CUANDO marco los criterios
ENTONCES el nivel de riesgo resulta de la matriz y no de un campo de opinión.
```

#### CA-02 · Recalibración
```gherkin
DADO un caso de riesgo medio al que se suma un elemento legal
CUANDO recalibro
ENTONCES el nivel se actualiza y queda registro de quién, cuándo y por qué.
```

### Reglas de Negocio Asociadas
- **RN-SVC-016**

**Fuera de alcance:**
Definición de criterios y pesos (Mesa SGD, R-08). Diseño / UX Prototipo › Mesa SGD (matriz de riesgo) Notas técnicas y dependencias Entidad por modelar (R-06) Datos de prueba / analítica Evento riesgo_recalibrado

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Registra caso (línea Notarial)
    Note over UI,Core: 2 Crear caso
    Note over UI,Core: 3 Código Único
    Note over UI,Core: 4 Emite cargo previo
    Note over UI,Core: 5 Emite cargo de activación
    Note over UI,Core: 6 Iniciar SLA de línea
    Note over UI,Core: 7 Marca criterios de riesgo
    Note over UI,Core: 8 Nivel de riesgo
    Note over Gestor,Ext: ALT
```

---

## [US-023] HU-ATC-023: Escalar en cadena un caso que incumple su SLA

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-023]` (`HU-ATC-023`)
- **Requerimiento Funcional de Origen:** `RF-SVC-023`
- **Funcionalidad Padre:** `[FEAT-09]` (`FT-ATC-09`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-023 · El sistema debe escalar automáticamente, sin saltar niveles: alerta temprana, memorándum a jefatura, Comité y Directorio.

### Narrativa de Usuario
> **COMO** gestor de la Mesa de Casos (SGD)
> **QUIERO** que un caso que incumple su SLA escale automáticamente de alerta a memorándum, Comité y Directorio
> **PARA** que ningún caso se estanque sin que una instancia superior lo sepa

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Alerta temprana
```gherkin
DADO un caso próximo a vencer su SLA de línea
CUANDO se alcanza el umbral
ENTONCES el responsable recibe una alerta temprana.
```

#### CA-02 · Cadena
```gherkin
DADO un caso vencido sin resolución
CUANDO se cumple el plazo
ENTONCES escala a memorándum a la jefatura y, si persiste, a Comité y luego a Directorio, sin saltar niveles.
```

#### CA-03 · Resolución (agregado por PO)
```gherkin
DADO un caso escalado a Comité
CUANDO se resuelve
ENTONCES se detiene la cadena y queda el historial de niveles alcanzados.
```

### Reglas de Negocio Asociadas
- **RN-SVC-017**

**Fuera de alcance:**
Agenda de sesiones del Comité. Diseño / UX Prototipo › Mesa SGD (escalera de escalamiento) Notas técnicas y dependencias Job batch · entidad por modelar

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento escalamiento {nivel}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento escalamiento {nivel}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Evaluar SLA de línea
    Note over UI,Core: 2 Alerta temprana
    Note over UI,Core: 3 Memorándum (vencido)
    Note over UI,Core: 4 Escalar a Comité
    Note over UI,Core: 5 Cierre tipificado + evidencia
    Note over UI,Core: 6 Referencia a original custodiado
    Note over UI,Core: 7 Caso cerrado
    Note over Gestor,Ext: ALT
```

---

## [US-024] HU-ATC-024: Validar casos cruzados o vinculados antes de registrar

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-024]` (`HU-ATC-024`)
- **Requerimiento Funcional de Origen:** `RF-SVC-024`
- **Funcionalidad Padre:** `[FEAT-09]` (`FT-ATC-09`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · jue 29-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-024 · El sistema debe validar si un caso nuevo está vinculado a uno existente antes de registrarlo como independiente.

### Narrativa de Usuario
> **COMO** gestor de la Mesa de Casos (SGD)
> **QUIERO** que el sistema me advierta si un caso nuevo coincide con uno existente
> **PARA** gestionarlos en un solo hilo de evidencia y evitar duplicados

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Coincidencia
```gherkin
DADO un caso nuevo con el mismo cliente y hechos que uno abierto
CUANDO intento registrarlo
ENTONCES el sistema propone vincularlo y no lo registra como independiente.
```

#### CA-02 · Hilo único
```gherkin
DADO dos casos vinculados
CUANDO los gestiono
ENTONCES comparten un único hilo de evidencia trazable.
```

### Reglas de Negocio Asociadas
- **RN-SVC-018**

**Fuera de alcance:**
— Diseño / UX Por diseñar Notas técnicas y dependencias Criterio de coincidencia por definir (pregunta abierta) Datos de prueba / analítica Evento caso_vinculado

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-025] HU-ATC-025: Cerrar el caso con estado homologado y evidencia

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-025]` (`HU-ATC-025`)
- **Requerimiento Funcional de Origen:** `RF-SVC-025`
- **Funcionalidad Padre:** `[FEAT-09]` (`FT-ATC-09`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · jue 29-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-025 · El sistema debe cerrar cada caso en uno de los 8 estados homologados, con evidencia, y referenciar la custodia en el GLI.

### Narrativa de Usuario
> **COMO** gestor de la Mesa de Casos (SGD)
> **QUIERO** cerrar el caso eligiendo uno de los 8 estados homologados y adjuntando la evidencia
> **PARA** que los cierres sean comparables y los originales queden custodiados en el GLI

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Estado homologado
```gherkin
DADO un caso listo para cerrar
CUANDO lo cierro
ENTONCES debo elegir uno de los 8 estados y no puedo cerrar sin evidencia.
```

#### CA-02 · Custodia
```gherkin
DADO un original probatorio crítico
CUANDO lo registro
ENTONCES la plataforma guarda la referencia al Repositorio Legal GLI y no reemplaza la custodia.
```

### Reglas de Negocio Asociadas
- **RN-SVC-019**
- **RN-SVC-020**

**Fuera de alcance:**
Custodia física de originales. Diseño / UX Prototipo › Mesa SGD (cierre tipificado) Notas técnicas y dependencias DEP-06 GLI · RNF-CUM-007 · nota: el CA-2 del Excel está truncado Datos de prueba / analítica Evento caso_cerrado {estado}

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-026] HU-ATC-026: Bloquear la resolución en Eje 1/2 ante señal de conflicto

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-026]` (`HU-ATC-026`)
- **Requerimiento Funcional de Origen:** `RF-SVC-026`
- **Funcionalidad Padre:** `[FEAT-07]` (`FT-ATC-07`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · vie 23-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-026 · El sistema debe impedir que un ticket con señal de conflicto permanezca o se resuelva en Eje 1 o Eje 2 y exigir su derivación a Eje 3.

### Narrativa de Usuario
> **COMO** gestor de tickets o gestor de Postventa
> **QUIERO** que el sistema me obligue a derivar a Legal un ticket con carta notarial, INDECOPI, abogado o prensa
> **PARA** que el conflicto no se intente resolver fuera de Eje 3

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Detección
```gherkin
DADO un ticket en Eje 2 que recibe una carta notarial
CUANDO se marca la señal de conflicto
ENTONCES el sistema bloquea su resolución en Eje 1/2 y exige derivarlo a Eje 3.
```

#### CA-02 · Gate
```gherkin
DADO un ticket marcado con conflicto
CUANDO intento cerrarlo en Eje 1/2
ENTONCES el sistema lo rechaza como gate no compensable.
```

#### CA-03 · Marca por error (agregado por PO)
```gherkin
DADO una señal marcada por error
CUANDO un supervisor la retira con justificación
ENTONCES queda registro del retiro en el historial.
```

### Reglas de Negocio Asociadas
- **RN-SVC-021**

**Fuera de alcance:**
— Diseño / UX Prototipo › Nuevo ticket (señales de conflicto) y Detalle (banner) Notas técnicas y dependencias SVC_TICKET

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento gate_conflicto`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento gate_conflicto` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Marca carta notarial
    Note over UI,Core: 2 Activar gate
    Note over UI,Core: 3 Cierre bloqueado en Eje 1/2
    Note over UI,Core: 4 KYC, lote y estado de cuenta
    Note over UI,Core: 5 Datos del paquete
    Note over UI,Core: 6 Derivar a Eje 3 (6/6)
    Note over UI,Core: 7 Handoff recibido
    Note over UI,Core: 8 Confirma recepción
    Note over Gestor,Ext: ALT
```

---

## [US-027] HU-ATC-027: Armar el paquete mínimo de handoff y confirmar su recepción

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-027]` (`HU-ATC-027`)
- **Requerimiento Funcional de Origen:** `RF-SVC-027`
- **Funcionalidad Padre:** `[FEAT-07]` (`FT-ATC-07`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · vie 23-oct → lun 26-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-027 · El sistema debe armar el paquete mínimo de handoff (6 elementos) en toda derivación entre ejes y permitir al eje destino confirmar la recepción.

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** que al derivar entre ejes se arme el paquete mínimo con sus 6 elementos
> **PARA** que el eje destino confirme la recepción y no quede un vacío de responsabilidad

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Paquete completo
```gherkin
DADO un ticket que se deriva de Eje 2 a Eje 3
CUANDO armo el handoff
ENTONCES los 6 elementos (ID, KYC validado, proyecto y lote, pagos y estado de cuenta, atención previa, próximo paso)
deben estar completos antes de enviar.
```

#### CA-02 · Confirmación
```gherkin
DADO un handoff recibido en Eje 3
CUANDO el Especialista Legal Senior lo recibe
ENTONCES confirma la recepción en el mismo ticket.
```

#### CA-03 · Sin confirmar (agregado por PO)
```gherkin
DADO un handoff sin confirmar tras 1 día hábil
CUANDO corre el control
ENTONCES se alerta al supervisor del eje destino.
```

### Reglas de Negocio Asociadas
- **RN-SVC-022**

**Fuera de alcance:**
— Diseño / UX Prototipo › Detalle › «Derivar a Eje 3» Notas técnicas y dependencias DEP-01 KYC · DEP-08 Cobranza

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento handoff {completo, confirmado}`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento handoff {completo, confirmado}` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Marca carta notarial
    Note over UI,Core: 2 Activar gate
    Note over UI,Core: 3 Cierre bloqueado en Eje 1/2
    Note over UI,Core: 4 KYC, lote y estado de cuenta
    Note over UI,Core: 5 Datos del paquete
    Note over UI,Core: 6 Derivar a Eje 3 (6/6)
    Note over UI,Core: 7 Handoff recibido
    Note over UI,Core: 8 Confirma recepción
    Note over Gestor,Ext: ALT
```

---

## [US-028] HU-ATC-028: Registrar la nota de estado emocional sin juicios de valor

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-028]` (`HU-ATC-028`)
- **Requerimiento Funcional de Origen:** `RF-SVC-028`
- **Funcionalidad Padre:** `[FEAT-07]` (`FT-ATC-07`)
- **Épica Padre:** `[EPIC-04]` (`EP-ATC-04`)
- **Prioridad:** Debe
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 2 · lun 26-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-028 · El sistema debe registrar una nota del estado emocional del cliente ante frustración o conflicto, sin juicios de valor.

### Narrativa de Usuario
> **COMO** referente de atención
> **QUIERO** registrar cómo se encuentra el cliente describiendo lo observado
> **PARA** que el siguiente atendedor conozca el contexto sin prejuicios

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Nota objetiva
```gherkin
DADO un cliente frustrado
CUANDO registro la nota
ENTONCES describe el estado observado sin adjetivos de juicio y queda visible para el siguiente atendedor.
```

#### CA-02 · Aviso
```gherkin
DADO un conflicto derivado a Eje 3
CUANDO se deriva
ENTONCES se notifica al Director UX y se habilita la coordinación de vocería sin respuesta pública del atendedor.
```

#### CA-03 · Palabras de juicio (agregado por PO)
```gherkin
DADO que escribo «grosero» o «conflictivo»
CUANDO guardo
ENTONCES el sistema advierte y pide reformular.
```

### Reglas de Negocio Asociadas
- **RN-SVC-023**
- **RN-SVC-024**

**Fuera de alcance:**
Vocería pública. Diseño / UX Prototipo › Detalle (nota de estado emocional) Notas técnicas y dependencias Campo en SVC_TICKET o interacción (por modelar)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Marca carta notarial
    Note over UI,Core: 2 Activar gate
    Note over UI,Core: 3 Cierre bloqueado en Eje 1/2
    Note over UI,Core: 4 KYC, lote y estado de cuenta
    Note over UI,Core: 5 Datos del paquete
    Note over UI,Core: 6 Derivar a Eje 3 (6/6)
    Note over UI,Core: 7 Handoff recibido
    Note over UI,Core: 8 Confirma recepción
    Note over Gestor,Ext: ALT
```

---

## [US-029] HU-ATC-029: Medir el cierre end-to-end de la experiencia

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-029]` (`HU-ATC-029`)
- **Requerimiento Funcional de Origen:** `RF-SVC-029`
- **Funcionalidad Padre:** `[FEAT-04]` (`FT-ATC-04`)
- **Épica Padre:** `[EPIC-02]` (`EP-ATC-02`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 2 · vie 23-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-029 · El sistema debe medir el cierre end-to-end y alertar al acercarse a 72 horas hábiles sin escalamiento o al plazo del eje si hay escalamiento.

### Narrativa de Usuario
> **COMO** coordinador CX
> **QUIERO** ver cuánto lleva cada ticket de punta a punta y recibir alerta antes de las 72 horas hábiles
> **PARA** cerrar la experiencia a tiempo

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Sin escalamiento
```gherkin
DADO un ticket en Eje 2 sin escalar
CUANDO transcurren 72 horas hábiles sin cierre
ENTONCES se marca en riesgo de incumplimiento.
```

#### CA-02 · Con escalamiento
```gherkin
DADO un ticket escalado a Eje 3
CUANDO se mide su cierre
ENTONCES se compara contra el plazo del eje y no contra las 72 horas.
```

### Reglas de Negocio Asociadas
- **RN-SVC-025**

**Fuera de alcance:**
— Diseño / UX Prototipo › Torre de Control Notas técnicas y dependencias SVC_TICKET, MAE_SLA_POLICY Datos de prueba / analítica Métrica tiempo_cierre_e2e

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-030] HU-ATC-030: Monitorear en tiempo real y corregir antes del incumplimiento

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-030]` (`HU-ATC-030`)
- **Requerimiento Funcional de Origen:** `RF-SVC-030`
- **Funcionalidad Padre:** `[FEAT-14]` (`FT-ATC-14`)
- **Épica Padre:** `[EPIC-07]` (`EP-ATC-07`)
- **Prioridad:** Debería
- **Estimación con IA:** 6 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · lun 26-oct → mar 27-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-030 · El sistema debe mostrar en tiempo real tickets activos, NPS, tiempos, SLA y derivaciones en curso.

### Narrativa de Usuario
> **COMO** coordinador CX
> **QUIERO** ver en un tablero los tickets activos, SLA, NPS y derivaciones
> **PARA** detectar casos en riesgo y redistribuir la carga antes del incumplimiento

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Riesgo
```gherkin
DADO un ticket con SLA por vencer
CUANDO el tablero lo detecta
ENTONCES se marca como caso en riesgo antes del incumplimiento.
```

#### CA-02 · Redistribución
```gherkin
DADO un ticket estancado
CUANDO lo reviso en el tablero
ENTONCES puedo reasignarlo desde ahí antes de que venza.
```

### Reglas de Negocio Asociadas
- **—**

**Fuera de alcance:**
Modelos predictivos. Diseño / UX Prototipo › Torre de Control CX Notas técnicas y dependencias SVC_TICKET, SVC_SLA_BREACH_ALERT Datos de prueba / analítica Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-031] HU-ATC-031: Generar el informe diario y el quincenal

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-031]` (`HU-ATC-031`)
- **Requerimiento Funcional de Origen:** `RF-SVC-031`
- **Funcionalidad Padre:** `[FEAT-14]` (`FT-ATC-14`)
- **Épica Padre:** `[EPIC-07]` (`EP-ATC-07`)
- **Prioridad:** Debería
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · mar 27-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-031 · El sistema debe generar el informe diario operativo y el informe quincenal analítico.

### Narrativa de Usuario
> **COMO** coordinador CX
> **QUIERO** recibir un informe diario operativo y uno quincenal analítico
> **PARA** que las jefaturas y el Comité decidan con datos consolidados

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Diario
```gherkin
DADO el cierre de una jornada
CUANDO se genera el informe
ENTONCES incluye tickets por eje, NPS preliminar, derivaciones y cumplimiento de SLA.
```

#### CA-02 · Quincenal
```gherkin
DADO el cierre de una quincena
CUANDO se genera el informe
ENTONCES incluye tendencias de KPI y adopción de Mi Portal.
```

### Reglas de Negocio Asociadas
- **—**

**Fuera de alcance:**
Informes de otros dominios. Diseño / UX Prototipo › Torre de Control (Informes) Notas técnicas y dependencias DEP-10 KPI Engine Datos de prueba / analítica Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-032] HU-ATC-032: Auditar registros paralelos del dato de cliente

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-032]` (`HU-ATC-032`)
- **Requerimiento Funcional de Origen:** `RF-SVC-032`
- **Funcionalidad Padre:** `[FEAT-14]` (`FT-ATC-14`)
- **Épica Padre:** `[EPIC-07]` (`EP-ATC-07`)
- **Prioridad:** Debería
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · mar 27-oct → mié 28-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-032 · El sistema debe auditar quincenalmente la existencia de registros paralelos del dato de cliente fuera de SIGDA/TAXON.

### Narrativa de Usuario
> **COMO** CDO o coordinador CX
> **QUIERO** una auditoría quincenal de registros paralelos del dato de cliente
> **PARA** mantener una única fuente del cliente

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Corte
```gherkin
DADO el corte quincenal
CUANDO se ejecuta la auditoría
ENTONCES el número de registros paralelos detectados debe ser cero.
```

#### CA-02 · Hallazgo
```gherkin
DADO un registro paralelo detectado
CUANDO se reporta
ENTONCES se eleva como gate no compensable, no como observación menor.
```

### Reglas de Negocio Asociadas
- **RN-SVC-026**

**Fuera de alcance:**
Limpieza de datos en otros sistemas. Diseño / UX Prototipo › Torre de Control (auditoría) Notas técnicas y dependencias DEP-01 SIGDA/TAXON Datos de prueba / analítica Métrica registros_paralelos

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-033] HU-ATC-033: Registrar un reclamo de garantía vinculado a la entrega

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-033]` (`HU-ATC-033`)
- **Requerimiento Funcional de Origen:** `RF-SVC-033`
- **Funcionalidad Padre:** `[FEAT-10]` (`FT-ATC-10`)
- **Épica Padre:** `[EPIC-05]` (`EP-ATC-05`)
- **Prioridad:** Debería
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · mar 27-oct → mié 28-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-033 · El sistema debe registrar el reclamo de garantía tipificado y vinculado obligatoriamente a un Acta de Entrega existente.

### Narrativa de Usuario
> **COMO** gestor de Postventa
> **QUIERO** registrar el reclamo de garantía tipificado y vinculado al Acta de Entrega
> **PARA** gestionar la postventa sobre el mismo caso que originó la entrega

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Vínculo obligatorio
```gherkin
DADO un cliente que reporta un defecto
CUANDO registro el reclamo
ENTONCES queda vinculado a un CONTRACT_UNIT_HANDOVER existente; sin entrega no hay reclamo.
```

#### CA-02 · Catálogo cerrado
```gherkin
DADO un reclamo registrado
CUANDO lo tipifico
ENTONCES el tipo pertenece al catálogo: estructural, impermeabilización, acabados o instalaciones.
```

### Reglas de Negocio Asociadas
- **RN-SVC-027**

**Fuera de alcance:**
Órdenes de trabajo. Diseño / UX Prototipo › Garantías postventa Notas técnicas y dependencias CONTRACT_WARRANTY_CLAIM, CONTRACT_UNIT_HANDOVER · DEP-07 Datos de prueba / analítica Evento garantía_registrada {tipo}

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-034] HU-ATC-034: Validar la vigencia de la garantía contra la cobertura

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-034]` (`HU-ATC-034`)
- **Requerimiento Funcional de Origen:** `RF-SVC-034`
- **Funcionalidad Padre:** `[FEAT-10]` (`FT-ATC-10`)
- **Épica Padre:** `[EPIC-05]` (`EP-ATC-05`)
- **Prioridad:** Debería
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-034 · El sistema debe validar la vigencia contra el periodo de cobertura y la fecha real de entrega, y rechazar automáticamente lo que está fuera de cobertura.

### Narrativa de Usuario
> **COMO** gestor de Postventa
> **QUIERO** que el sistema valide la fecha del reclamo contra la cobertura y la entrega
> **PARA** rechazar automáticamente lo que está fuera de cobertura

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Validación
```gherkin
DADO un reclamo nuevo
CUANDO se registra
ENTONCES se valida su fecha contra el periodo vigente y la fecha real de entrega antes de admitirlo.
```

#### CA-02 · Fuera de cobertura
```gherkin
DADO un reclamo fuera del periodo
CUANDO se valida
ENTONCES se marca como no procedente por vigencia y se informa al cliente el motivo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-027**

**Fuera de alcance:**
— Diseño / UX Prototipo › Garantías (chip de cobertura) Notas técnicas y dependencias MAE_WARRANTY_COVERAGE_PERIOD · DEP-07 Datos de prueba / analítica Evento garantía_no_procedente

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-035] HU-ATC-035: Registrar la inspección técnica antes de resolver

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-035]` (`HU-ATC-035`)
- **Requerimiento Funcional de Origen:** `RF-SVC-035`
- **Funcionalidad Padre:** `[FEAT-10]` (`FT-ATC-10`)
- **Épica Padre:** `[EPIC-05]` (`EP-ATC-05`)
- **Prioridad:** Debería
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-035 · El sistema debe registrar la inspección técnica con su evidencia antes de resolver el reclamo.

### Narrativa de Usuario
> **COMO** gestor de Postventa
> **QUIERO** programar y registrar la inspección con su informe y fotos antes de resolver
> **PARA** aprobar, rechazar o resolver con trazabilidad completa

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Inspección
```gherkin
DADO un reclamo en revisión
CUANDO programo la inspección
ENTONCES queda la fecha y, luego, el informe y las fotos antes de resolver.
```

#### CA-02 · Resolución
```gherkin
DADO un reclamo inspeccionado
CUANDO lo resuelvo
ENTONCES pasa a APPROVED, REJECTED o RESOLVED con fecha y descripción.
```

### Reglas de Negocio Asociadas
- **—**

**Fuera de alcance:**
Costeo de la reparación. Diseño / UX Prototipo › Garantías Notas técnicas y dependencias CONTRACT_WARRANTY_CLAIM Datos de prueba / analítica Evento inspección_registrada

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-036] HU-ATC-036: Escalar la garantía a Eje 3 y gestionar la adenda

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-036]` (`HU-ATC-036`)
- **Requerimiento Funcional de Origen:** `RF-SVC-036`
- **Funcionalidad Padre:** `[FEAT-10]` (`FT-ATC-10`)
- **Épica Padre:** `[EPIC-05]` (`EP-ATC-05`)
- **Prioridad:** Debería
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 1 · mié 28-oct → jue 29-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-036 · El sistema debe escalar a Eje 3 un reclamo de garantía que derive en conflicto legal y permitir gestionar la reincorporación contractual por adenda.

### Narrativa de Usuario
> **COMO** gestor de Postventa
> **QUIERO** escalar a Legal un reclamo de garantía con conflicto y gestionar la adenda cuando corresponda
> **PARA** no resolver en Postventa lo que es legal y cerrar la reincorporación contractual

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Conflicto
```gherkin
DADO un reclamo que recibe carta notarial
CUANDO se detecta
ENTONCES se deriva a Eje 3 sin intentar resolverlo en Eje 2.
```

#### CA-02 · Adenda
```gherkin
DADO un caso de reincorporación contractual tras una devolución
CUANDO se gestiona
ENTONCES se resuelve con una adenda registrada en Postventa.
```

### Reglas de Negocio Asociadas
- **RN-SVC-021**

**Fuera de alcance:**
Redacción de la adenda (Legal). Diseño / UX Prototipo › Garantías Notas técnicas y dependencias Reutiliza el gate de FT-ATC-07 Datos de prueba / analítica Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-037] HU-ATC-037: Registrar el riesgo verbal y la secuencia de Frases Ancla

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-037]` (`HU-ATC-037`)
- **Requerimiento Funcional de Origen:** `RF-SVC-037`
- **Funcionalidad Padre:** `[FEAT-15]` (`FT-ATC-15`)
- **Épica Padre:** `[EPIC-08]` (`EP-ATC-08`)
- **Prioridad:** Podría · alcance flexible
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-037 · El sistema debe registrar la clasificación de riesgo de la intervención en vivo y la secuencia de Frases Ancla (4, 5, 6) aplicada.

### Narrativa de Usuario
> **COMO** moderador de evento
> **QUIERO** registrar la clasificación de riesgo y qué Frases Ancla apliqué
> **PARA** contener la insistencia antes de derivar formalmente

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Frase 4
```gherkin
DADO un propietario que divaga
CUANDO aplico la Frase 4
ENTONCES queda registrado el intento de concreción.
```

#### CA-02 · Frase 6
```gherkin
DADO un propietario que persiste tras la Frase 5
CUANDO aplico la Frase 6
ENTONCES el sistema exige registrar el caso para cerrar el tema en sala.
```

### Reglas de Negocio Asociadas
- **RN-SVC-030**

**Fuera de alcance:**
Guion completo del moderador. Diseño / UX Prototipo › EntregaFest en vivo Notas técnicas y dependencias Entidad por modelar (R-06) Datos de prueba / analítica Evento frase_ancla {n}

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-038] HU-ATC-038: Derivar de inmediato a la Estación 4 sin debate

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-038]` (`HU-ATC-038`)
- **Requerimiento Funcional de Origen:** `RF-SVC-038`
- **Funcionalidad Padre:** `[FEAT-15]` (`FT-ATC-15`)
- **Épica Padre:** `[EPIC-08]` (`EP-ATC-08`)
- **Prioridad:** Podría · alcance flexible
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-038 · El sistema debe registrar la derivación inmediata a la Estación 4 de todo caso sensible o imputación penal en vivo.

### Narrativa de Usuario
> **COMO** moderador de evento
> **QUIERO** que al detectar «estafa», «fraude», «abuso» o «delito» el sistema me pida derivar a la Estación 4
> **PARA** cerrar el tema en sala sin debatirlo

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Palabra gatillo
```gherkin
DADO un propietario que menciona una palabra de riesgo muy alto
CUANDO la identifico
ENTONCES el sistema exige la derivación inmediata a la Estación 4.
```

#### CA-02 · Sin reapertura
```gherkin
DADO un caso derivado
CUANDO se cierra el tema en sala
ENTONCES el moderador no puede reabrirlo; queda con el especialista de la Estación 4.
```

### Reglas de Negocio Asociadas
- **RN-SVC-028**
- **RN-SVC-029**

**Fuera de alcance:**
— Diseño / UX Prototipo › EntregaFest (detector de palabras) Notas técnicas y dependencias Entidad por modelar Datos de prueba / analítica Evento derivación_estación4

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-039] HU-ATC-039: Registrar el caso con la etiqueta estándar

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-039]` (`HU-ATC-039`)
- **Requerimiento Funcional de Origen:** `RF-SVC-039`
- **Funcionalidad Padre:** `[FEAT-15]` (`FT-ATC-15`)
- **Épica Padre:** `[EPIC-08]` (`EP-ATC-08`)
- **Prioridad:** Podría · alcance flexible
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 3 · mié 28-oct → jue 29-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-039 · El sistema debe registrar todo caso sensible del evento con la etiqueta «Atención especial — derivación a Legal».

### Narrativa de Usuario
> **COMO** coordinador CX o personal de apoyo
> **QUIERO** que cada caso del evento se registre con la etiqueta estándar
> **PARA** darle un seguimiento uniforme en el Registro de Casos Sensibles

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Etiqueta
```gherkin
DADO un caso sensible detectado en el evento
CUANDO se registra
ENTONCES usa literalmente «Atención especial — derivación a Legal».
```

#### CA-02 · Revisión
```gherkin
DADO el cierre del bloque
CUANDO el coordinador revisa el registro
ENTONCES cada caso aparece con su estado (sí/no derivado a la Estación 4).
```

### Reglas de Negocio Asociadas
- **RN-SVC-028**

**Fuera de alcance:**
— Diseño / UX Prototipo › EntregaFest (registro de casos) Notas técnicas y dependencias Registro de Casos Sensibles Datos de prueba / analítica Sin evento específico; datos de prueba: 2 razones sociales, 3 tipos de ticket y 1 feriado.

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** ``

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
```

---

## [US-040] HU-ATC-040: Sincronizar con Legal los tickets derivados a Eje 3

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-040]` (`HU-ATC-040`)
- **Requerimiento Funcional de Origen:** `RF-SVC-040`
- **Funcionalidad Padre:** `[FEAT-16]` (`FT-ATC-16`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · vie 23-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-040 · El sistema debe sincronizar los tickets derivados a Eje 3 con la herramienta que usa el equipo de Legal (responsable: Rosario), enviando el paquete mínimo y recibiendo estado y resolución. Feedback presentación · ítem 2

### Narrativa de Usuario
> **COMO** responsable legal de reclamos
> **QUIERO** recibir en mi herramienta los tickets derivados a Eje 3 con su paquete mínimo y devolver su estado
> **PARA** seguir cada caso legal en un solo lugar sin registrarlo dos veces

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Envío a Legal
```gherkin
DADO un ticket derivado a Eje 3
CUANDO se confirma el handoff
ENTONCES el caso aparece en la herramienta de Legal con el paquete mínimo y el N.º de ticket.
```

#### CA-02 · Estado de vuelta
```gherkin
DADO un caso que Legal actualiza o resuelve en su herramienta
CUANDO se sincroniza
ENTONCES el ticket refleja el nuevo estado sin registro manual.
```

#### CA-03 · Legal no disponible (agregado por PO)
```gherkin
DADO que la herramienta de Legal no responde
CUANDO se confirma un handoff a Eje 3
ENTONCES el envío queda en cola, se reintenta y el ticket muestra «pendiente de sincronizar».
```

### Reglas de Negocio Asociadas
- **RN-SVC-021 Gate: un caso de conflicto no se resuelve en Eje 1/2**
- **RN-SVC-022 Gate: derivación sin paquete mínimo**

**Fuera de alcance:**
Gestión del expediente judicial. Diseño / UX Prototipo › Ticket › pestaña Legal

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG · DEP-12`
- **Evento de Analítica / Telemetría:** `Evento legal_sync {estado} Preguntas abiertas ¿Qué herramienta usa hoy Legal (sistema, Excel, correo)? ¿Rosario es la dueña funcional de la integración? ¿La sincronización es en línea o por lotes?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento legal_sync {estado} Preguntas abiertas ¿Qué herramienta usa hoy Legal (sistema, Excel, correo)? ¿Rosario es la dueña funcional de la integración? ¿La sincronización es en línea o por lotes?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Confirma handoff Eje 3
    Note over UI,Core: 2 Registrar derivación
    Note over UI,Core: 3 Enviar caso + paquete
    Note over UI,Core: 4 Acuse con ID de Legal
    Note over UI,Core: 5 Calcula exposición
    Note over UI,Core: 6 Alerta de riesgo
    Note over UI,Core: 7 Estado / resolución
    Note over Gestor,Ext: ALT
```

---

## [US-041] HU-ATC-041: Priorizar los reclamos con riesgo de denuncia por su exposición

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-041]` (`HU-ATC-041`)
- **Requerimiento Funcional de Origen:** `RF-SVC-041`
- **Funcionalidad Padre:** `[FEAT-16]` (`FT-ATC-16`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · vie 23-oct → lun 26-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-041 · El sistema debe identificar los tickets con riesgo de escalar a denuncia o INDECOPI y calcular su exposición económica (monto reclamado + interés legal referencial del 8 %) para priorizarlos y alertar a Legal. Feedback presentación · ítem 16

### Narrativa de Usuario
> **COMO** coordinador CX
> **QUIERO** ver la exposición económica de cada reclamo con riesgo de denuncia y recibir una alerta antes del plazo
> **PARA** actuar antes de que el caso llegue a denuncia

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Cálculo de exposición
```gherkin
DADO un reclamo con monto
CUANDO se registra o cambia
ENTONCES el sistema calcula la exposición (monto + interés legal al día) y la muestra en el ticket y en la Torre de Control.
```

#### CA-02 · Alerta a Legal
```gherkin
DADO un ticket que supera el umbral de riesgo de denuncia
CUANDO se evalúa
ENTONCES se marca como prioritario y se alerta a Legal antes del vencimiento del plazo.
```

#### CA-03 · Sin monto (agregado por PO)
```gherkin
DADO un reclamo sin monto registrado
CUANDO se evalúa el riesgo
ENTONCES la exposición se muestra como «por estimar» y el caso no se descarta de la priorización.
```

### Reglas de Negocio Asociadas
- **RN-SVC-034 Exposición económica por denuncia**
- **RN-SVC-016 Clasificación de riesgo objetiva y recalibrable**

**Fuera de alcance:**
Cálculo de costas procesales. Diseño / UX Prototipo › Torre de Control (columna «exposición»)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET, ENT-SVC-010 SVC_COMPLAINT_BOOK_ENTRY · DEP-12`
- **Evento de Analítica / Telemetría:** `Evento riesgo_denuncia {exposicion} Preguntas abiertas ¿El 8 % es la tasa de interés legal que Legal quiere usar o un referencial? ¿Qué señales definen riesgo de denuncia (reincidencia, monto, palabras, abogado)? ¿Umbral de alerta?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento riesgo_denuncia {exposicion} Preguntas abiertas ¿El 8 % es la tasa de interés legal que Legal quiere usar o un referencial? ¿Qué señales definen riesgo de denuncia (reincidencia, monto, palabras, abogado)? ¿Umbral de alerta?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Confirma handoff Eje 3
    Note over UI,Core: 2 Registrar derivación
    Note over UI,Core: 3 Enviar caso + paquete
    Note over UI,Core: 4 Acuse con ID de Legal
    Note over UI,Core: 5 Calcula exposición
    Note over UI,Core: 6 Alerta de riesgo
    Note over UI,Core: 7 Estado / resolución
    Note over Gestor,Ext: ALT
```

---

## [US-042] HU-ATC-042: Atender la llamada con la ficha del cliente y registrarla en el ticket

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-042]` (`HU-ATC-042`)
- **Requerimiento Funcional de Origen:** `RF-SVC-042`
- **Funcionalidad Padre:** `[FEAT-17]` (`FT-ATC-17`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · jue 22-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-042 · El sistema debe integrarse con la plataforma que usa el equipo de call center para mostrar los datos del cliente al recibir la llamada (screen pop), abrir o ubicar su ticket y registrar la llamada como interacción con su grabación. Feedback presentación · ítem 5

### Narrativa de Usuario
> **COMO** gestor de tickets del call center
> **QUIERO** ver la ficha del cliente al contestar y que la llamada quede registrada en su ticket
> **PARA** atender sin cambiar de sistema ni volver a escribir los datos

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Screen pop
```gherkin
DADO una llamada entrante de un número registrado
CUANDO el gestor de tickets contesta
ENTONCES ve la ficha del cliente y sus tickets abiertos en 2 s o menos.
```

#### CA-02 · Registro de la llamada
```gherkin
DADO una llamada finalizada
CUANDO se cierra
ENTONCES queda registrada como interacción del ticket con duración y enlace a la grabación.
```

#### CA-03 · Número desconocido (agregado por PO)
```gherkin
DADO una llamada de un número no registrado
CUANDO contesto
ENTONCES veo la búsqueda del cliente abierta para identificarlo o registrarlo como interesado.
```

### Reglas de Negocio Asociadas
- **RN-SVC-005 Empresa y línea obligatorias**

**Fuera de alcance:**
Marcador predictivo; campañas salientes. Diseño / UX Prototipo › Consola (panel de llamada) Notas técnicas y dependencias ENT-SVC-001 SVC_TICKET, ENT-SVC-004 SVC_TICKET_INTERACTION, ENT-REF-001 MAE_CHANNEL · DEP-11

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento llamada_registrada {duracion} Preguntas abiertas ¿Qué plataforma de call center usa hoy el equipo (proveedor y versión)? ¿Expone API o CTI para screen pop y grabaciones?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento llamada_registrada {duracion} Preguntas abiertas ¿Qué plataforma de call center usa hoy el equipo (proveedor y versión)? ¿Expone API o CTI para screen pop y grabaciones?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Llamada entrante
    Note over UI,Core: 2 Evento: número llamante
    Note over UI,Core: 3 Buscar por teléfono
    Note over UI,Core: 4 Ficha + tickets abiertos
    Note over UI,Core: 5 Abrir / ubicar ticket
    Note over UI,Core: 6 Fin: duración + grabación
    Note over Gestor,Ext: ALT
```

---

## [US-043] HU-ATC-043: Configurar el flujo de trabajo de un tipo de ticket por área

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-043]` (`HU-ATC-043`)
- **Requerimiento Funcional de Origen:** `RF-SVC-043`
- **Funcionalidad Padre:** `[FEAT-18]` (`FT-ATC-18`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debe
- **Estimación con IA:** 6 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · lun 19-oct → mar 20-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-043 · El sistema debe permitir configurar, sin desarrollo, el flujo de trabajo (workflow) de cada tipo de ticket por área: pasos, estados, responsables, aprobaciones y SLA de cada paso. Feedback presentación · ítem 6

### Narrativa de Usuario
> **COMO** administrador funcional
> **QUIERO** definir sin desarrollo los pasos, estados, responsables y SLA del flujo de cada tipo de ticket por área
> **PARA** adaptar la atención a cada área sin esperar cambios de sistema

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Flujo aplicado
```gherkin
DADO un tipo de ticket de Cobranza
CUANDO el administrador define sus pasos y responsables
ENTONCES los nuevos tickets de ese tipo siguen el flujo configurado.
```

#### CA-02 · Versión del flujo
```gherkin
DADO un flujo modificado
CUANDO se publica
ENTONCES solo aplica a tickets nuevos y los abiertos conservan su flujo y SLA congelado.
```

#### CA-03 · Flujo incompleto (agregado por PO)
```gherkin
DADO un flujo sin responsable en un paso
CUANDO intento publicarlo
ENTONCES el sistema no lo publica e indica el paso incompleto.
```

### Reglas de Negocio Asociadas
- **RN-SVC-006 Asignación append-only**
- **RN-SVC-001 Precedencia SLA**

**Fuera de alcance:**
Editor gráfico de procesos (BPMN). Diseño / UX Prototipo › Configuración › Flujos

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-014 SVC_WORKFLOW_DEFINITION, ENT-SVC-007 MAE_Área, ENT-SVC-008 MAE_SLA_POLICY`
- **Evento de Analítica / Telemetría:** `Evento flujo_publicado {area, tipo} Preguntas abiertas ¿Cuántas áreas necesitan flujo propio en el piloto? ¿Quién aprueba los cambios de flujo?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento flujo_publicado {area, tipo} Preguntas abiertas ¿Cuántas áreas necesitan flujo propio en el piloto? ¿Quién aprueba los cambios de flujo?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Publica flujo del área
    Note over UI,Core: 2 Ticket nuevo: ¿paso y responsable?
    Note over UI,Core: 3 Área + responsable
    Note over UI,Core: 4 Ordena rayo > SLA > prioridad
    Note over UI,Core: 5 Asigna ticket
    Note over UI,Core: 6 Registra asignación
    Note over UI,Core: 7 Reasigna si supera carga
    Note over Gestor,Ext: ALT
```

---

## [US-044] HU-ATC-044: Trabajar desde una bandeja única ordenada por urgencia

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-044]` (`HU-ATC-044`)
- **Requerimiento Funcional de Origen:** `RF-SVC-044`
- **Funcionalidad Padre:** `[FEAT-18]` (`FT-ATC-18`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · mar 20-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-044 · El sistema debe ofrecer una bandeja orquestadora que reúne los tickets de todos los canales y los ordena y asigna según flujo, prioridad, marca de rayo y vencimiento de SLA. Feedback presentación · ítem 11

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** ver en una sola bandeja los tickets de todos los canales ordenados por rayo, vencimiento de SLA y prioridad
> **PARA** atender primero lo más urgente

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Orden de la bandeja
```gherkin
DADO tickets de teléfono, WhatsApp, correo y Mi Portal
CUANDO el gestor de tickets abre la bandeja
ENTONCES los ve juntos ordenados por rayo, SLA más próximo y prioridad.
```

#### CA-02 · Asignación por flujo
```gherkin
DADO un ticket nuevo sin responsable
CUANDO entra a la bandeja
ENTONCES el orquestador lo asigna según el flujo del área o lo deja en la cola del área.
```

#### CA-03 · Sin permiso de área (agregado por PO)
```gherkin
DADO un ticket de un área a la que no pertenezco
CUANDO abro la bandeja
ENTONCES no lo veo, salvo que sea supervisor de esa área.
```

### Reglas de Negocio Asociadas
- **RN-SVC-031 Prioridad rayo controlada**
- **RN-SVC-008 Alerta única por ciclo**

**Fuera de alcance:**
Bandejas personalizadas por gestor. Diseño / UX Prototipo › Bandeja

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET, ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG`
- **Evento de Analítica / Telemetría:** `Evento bandeja_tomado {orden} Preguntas abiertas ¿La asignación es automática (push) o el gestor de tickets toma el siguiente (pull)? ¿Se mezclan tickets de varias áreas en la misma bandeja?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento bandeja_tomado {orden} Preguntas abiertas ¿La asignación es automática (push) o el gestor de tickets toma el siguiente (pull)? ¿Se mezclan tickets de varias áreas en la misma bandeja?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Publica flujo del área
    Note over UI,Core: 2 Ticket nuevo: ¿paso y responsable?
    Note over UI,Core: 3 Área + responsable
    Note over UI,Core: 4 Ordena rayo > SLA > prioridad
    Note over UI,Core: 5 Asigna ticket
    Note over UI,Core: 6 Registra asignación
    Note over UI,Core: 7 Reasigna si supera carga
    Note over Gestor,Ext: ALT
```

---

## [US-045] HU-ATC-045: Marcar un ticket crítico con el rayo de prioridad

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-045]` (`HU-ATC-045`)
- **Requerimiento Funcional de Origen:** `RF-SVC-045`
- **Funcionalidad Padre:** `[FEAT-18]` (`FT-ATC-18`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debería
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · mié 21-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-045 · El sistema debe permitir marcar un ticket con un icono de rayo que lo sube al tope de la bandeja, registrando quien lo marco y por que. Feedback presentación · ítem 10

### Narrativa de Usuario
> **COMO** supervisor o líder
> **QUIERO** marcar un ticket con el icono de rayo indicando el motivo
> **PARA** que se atienda de inmediato sin cambiar su tipo ni su SLA

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Marca con motivo
```gherkin
DADO un ticket crítico
CUANDO el líder lo marca con rayo e indica el motivo
ENTONCES aparece primero en la bandeja con el icono visible y queda en la bitácora.
```

#### CA-02 · Permiso
```gherkin
DADO un gestor de tickets sin rol de líder
CUANDO intenta marcar el rayo
ENTONCES la acción no esta disponible.
```

#### CA-03 · Límite del área (agregado por PO)
```gherkin
DADO un área con el 10 % de su bandeja ya marcada con rayo
CUANDO intento marcar otro
ENTONCES el sistema me avisa que se superó el límite y pide confirmar o desmarcar otro.
```

### Reglas de Negocio Asociadas
- **RN-SVC-031 Prioridad rayo controlada**

**Fuera de alcance:**
Cambio automático del SLA por el rayo. Diseño / UX Prototipo › Bandeja (icono rayo) Notas técnicas y dependencias ENT-SVC-001 SVC_TICKET

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento rayo_marcado {motivo} Preguntas abiertas ¿Quiénes pueden marcar el rayo? ¿El rayo cambia el SLA o solo el orden? ¿Hay un límite por bandeja?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento rayo_marcado {motivo} Preguntas abiertas ¿Quiénes pueden marcar el rayo? ¿El rayo cambia el SLA o solo el orden? ¿Hay un límite por bandeja?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Publica flujo del área
    Note over UI,Core: 2 Ticket nuevo: ¿paso y responsable?
    Note over UI,Core: 3 Área + responsable
    Note over UI,Core: 4 Ordena rayo > SLA > prioridad
    Note over UI,Core: 5 Asigna ticket
    Note over UI,Core: 6 Registra asignación
    Note over UI,Core: 7 Reasigna si supera carga
    Note over Gestor,Ext: ALT
```

---

## [US-046] HU-ATC-046: Reasignar automáticamente al gestor con menos carga

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-046]` (`HU-ATC-046`)
- **Requerimiento Funcional de Origen:** `RF-SVC-046`
- **Funcionalidad Padre:** `[FEAT-18]` (`FT-ATC-18`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debería
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · mié 21-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-046 · El sistema debe reasignar un ticket al gestor de tickets disponible del mismo área y habilidad con menor carga de trabajo cuando el responsable no esta disponible o su carga supera el límite. Feedback presentación · ítem 18

### Narrativa de Usuario
> **COMO** supervisor ATC
> **QUIERO** que un ticket pase al gestor disponible del mismo área y habilidad con menos carga cuando el responsable está saturado o ausente
> **PARA** evitar incumplimientos por saturación

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Balanceo
```gherkin
DADO un gestor de tickets con carga mayor al límite
CUANDO entra un ticket nuevo
ENTONCES se asigna al gestor de tickets disponible con menos tickets activos ponderados y se registra el motivo
REASSIGNMENT_CARGA.
```

#### CA-02 · Exclusiones
```gherkin
DADO un ticket con rayo, en Eje 3 o con interacción en curso
CUANDO corre el balanceo
ENTONCES no se reasigna.
```

#### CA-03 · Nadie disponible (agregado por PO)
```gherkin
DADO que no hay gestores disponibles en el área
CUANDO corre el balanceo
ENTONCES el ticket queda en la cola del área y se alerta al supervisor.
```

### Reglas de Negocio Asociadas
- **RN-SVC-033 Reasignación por menor carga**
- **RN-SVC-006 Asignación append-only**

**Fuera de alcance:**
Gestión de turnos y vacaciones. Diseño / UX Prototipo › Bandeja (supervisor)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG, ENT-SVC-001 SVC_TICKET · DEP-02`
- **Evento de Analítica / Telemetría:** `Evento reasignacion_carga Preguntas abiertas ¿Cómo se mide la carga (n.º de tickets, ponderado por prioridad, tiempo estimado)? ¿Se considera ausencia por vacaciones o turno?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento reasignacion_carga Preguntas abiertas ¿Cómo se mide la carga (n.º de tickets, ponderado por prioridad, tiempo estimado)? ¿Se considera ausencia por vacaciones o turno?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Publica flujo del área
    Note over UI,Core: 2 Ticket nuevo: ¿paso y responsable?
    Note over UI,Core: 3 Área + responsable
    Note over UI,Core: 4 Ordena rayo > SLA > prioridad
    Note over UI,Core: 5 Asigna ticket
    Note over UI,Core: 6 Registra asignación
    Note over UI,Core: 7 Reasigna si supera carga
    Note over Gestor,Ext: ALT
```

---

## [US-047] HU-ATC-047: Consultar la guía de solución del tipo de ticket

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-047]` (`HU-ATC-047`)
- **Requerimiento Funcional de Origen:** `RF-SVC-047`
- **Funcionalidad Padre:** `[FEAT-19]` (`FT-ATC-19`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debería
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · mié 21-oct → jue 22-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-047 · El sistema debe mostrar al gestor de tickets una guía de como solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional. Feedback presentación · ítem 7

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** ver en el ticket la guía de cómo resolver ese tipo: pasos, plantillas y criterios de cierre
> **PARA** resolver de forma estándar en el primer contacto

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Guía en el ticket
```gherkin
DADO un ticket de tipo «Consulta de cuenta»
CUANDO el gestor de tickets lo abre
ENTONCES ve la guía de ese tipo con pasos, plantillas y criterios de cierre.
```

#### CA-02 · Versión
```gherkin
DADO una guía actualizada por el administrador
CUANDO se publica
ENTONCES los gestores de tickets ven la nueva versión y queda el historial de versiones.
```

#### CA-03 · Tipo sin guía (agregado por PO)
```gherkin
DADO un tipo de ticket sin guía publicada
CUANDO abro el ticket
ENTONCES veo el aviso «sin guía» y el sistema lo reporta al administrador funcional.
```

### Reglas de Negocio Asociadas
- **RN-SVC-023 Gate: cierre fuera de Mi Portal**

**Fuera de alcance:**
Gestión documental de manuales. Diseño / UX Prototipo › Ticket (panel guía)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-015 SVC_KNOWLEDGE_ARTICLE, ENT-SVC-005 MAE_TICKET_TYPE`
- **Evento de Analítica / Telemetría:** `Evento guia_consultada {tipo} Preguntas abiertas ¿Quién redacta y aprueba las guías por área? ¿Existe hoy un manual de atención que sirva de base?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento guia_consultada {tipo} Preguntas abiertas ¿Quién redacta y aprueba las guías por área? ¿Existe hoy un manual de atención que sirva de base?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Pide ayuda al cerrar
    Note over UI,Core: 2 Texto + guía del tipo
    Note over UI,Core: 3 Anonimiza datos
    Note over UI,Core: 4 Prompt anonimizado
    Note over UI,Core: 5 Sugerencia
    Note over UI,Core: 6 Sugerencia + criterios faltantes
    Note over UI,Core: 7 Acepta / edita / descarta
    Note over UI,Core: 8 Guarda decisión
    Note over Gestor,Ext: ALT
```

---

## [US-048] HU-ATC-048: Recibir retroalimentación de IA mientras atiendo y cierro

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-048]` (`HU-ATC-048`)
- **Requerimiento Funcional de Origen:** `RF-SVC-048`
- **Funcionalidad Padre:** `[FEAT-19]` (`FT-ATC-19`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Podría · alcance flexible
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · jue 22-oct → vie 23-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-048 · El sistema debe usar IA para retroalimentar al gestor de tickets mientras atiende y al cerrar: sugerir respuesta, verificar que se cumplan los criterios de cierre de la guía y señalar tono o datos faltantes. Feedback presentación · ítem 8

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** que la IA me sugiera respuesta y me avise qué criterios de cierre faltan
> **PARA** cerrar con mejor calidad y aprender en el momento

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Sugerencia
```gherkin
DADO un gestor de tickets que redacta una respuesta
CUANDO pide ayuda o va a cerrar
ENTONCES la IA sugiere texto y lista los criterios de cierre pendientes; el gestor de tickets acepta, edita o descarta.
```

#### CA-02 · Registro de la decisión
```gherkin
DADO una sugerencia de IA
CUANDO el gestor de tickets decide
ENTONCES queda registrada (aceptada/editada/descartada) sin datos personales en el registro.
```

#### CA-03 · Datos personales (agregado por PO)
```gherkin
DADO un texto con DNI o datos de tarjeta
CUANDO pido ayuda a la IA
ENTONCES los datos se anonimizan antes de enviarse al modelo.
```

### Reglas de Negocio Asociadas
- **RN-SVC-032 IA asesora, el gestor de tickets decide**
- **RN-SVC-012 DLP en bitácoras**

**Fuera de alcance:**
Respuesta automática de la IA al cliente. Diseño / UX Prototipo › Ticket (asistente)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-016 SVC_AI_SUGGESTION_LOG, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-14`
- **Evento de Analítica / Telemetría:** `Evento ia_sugerencia {decision} Preguntas abiertas ¿Qué proveedor o modelo de IA esta aprobado por TI y Seguridad? ¿Se permite enviar datos del cliente al modelo o solo texto anonimizado?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento ia_sugerencia {decision} Preguntas abiertas ¿Qué proveedor o modelo de IA esta aprobado por TI y Seguridad? ¿Se permite enviar datos del cliente al modelo o solo texto anonimizado?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Pide ayuda al cerrar
    Note over UI,Core: 2 Texto + guía del tipo
    Note over UI,Core: 3 Anonimiza datos
    Note over UI,Core: 4 Prompt anonimizado
    Note over UI,Core: 5 Sugerencia
    Note over UI,Core: 6 Sugerencia + criterios faltantes
    Note over UI,Core: 7 Acepta / edita / descarta
    Note over UI,Core: 8 Guarda decisión
    Note over Gestor,Ext: ALT
```

---

## [US-049] HU-ATC-049: Buscar al cliente y llamarlo desde su ficha

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-049]` (`HU-ATC-049`)
- **Requerimiento Funcional de Origen:** `RF-SVC-049`
- **Funcionalidad Padre:** `[FEAT-20]` (`FT-ATC-20`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · lun 19-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-049 · El sistema debe ofrecer un motor de búsqueda de clientes por DNI, nombre, código de cliente, lote, teléfono o N.º de ticket, con opción de llamar a la cuenta desde la ficha. Feedback presentación · ítem 9

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** buscar al cliente por DNI, nombre, código, lote, teléfono o N.º de ticket y llamarlo desde la ficha
> **PARA** ubicarlo en segundos y contactarlo sin marcar a mano

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Búsqueda
```gherkin
DADO un DNI o código de cliente
CUANDO el gestor de tickets busca
ENTONCES obtiene el cliente desde SIGDA/TAXON en 2 s o menos con sus tickets y lotes.
```

#### CA-02 · Llamar desde la ficha
```gherkin
DADO un cliente encontrado
CUANDO el gestor de tickets pulsa «Llamar»
ENTONCES se inicia la llamada por la plataforma de call center y queda como interacción del ticket.
```

#### CA-03 · Varias coincidencias (agregado por PO)
```gherkin
DADO una búsqueda por nombre con varios resultados
CUANDO busco
ENTONCES veo la lista con DNI parcial y lote para elegir al cliente correcto.
```

### Reglas de Negocio Asociadas
- **RN-SVC-026 Cero registros paralelos del dato de cliente**
- **RN-SVC-036 Búsqueda respeta permisos**

**Fuera de alcance:**
Edición de datos del cliente. Diseño / UX Prototipo › Búsqueda de cliente

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-017 SVC_SEARCH_INDEX, ENT-SVC-001 SVC_TICKET · DEP-01 · DEP-11`
- **Evento de Analítica / Telemetría:** `Evento cliente_buscado {criterio} Preguntas abiertas ¿Qué significa «llamar la cuenta»: llamada telefónica (click-to-call) o consultar la cuenta del cliente? ¿Qué campos de búsqueda son obligatorios?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento cliente_buscado {criterio} Preguntas abiertas ¿Qué significa «llamar la cuenta»: llamada telefónica (click-to-call) o consultar la cuenta del cliente? ¿Qué campos de búsqueda son obligatorios?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca por DNI
    Note over UI,Core: 2 Buscar (con rol)
    Note over UI,Core: 3 Cliente + lotes
    Note over UI,Core: 4 Datos
    Note over UI,Core: 5 Cuotas y consultas
    Note over UI,Core: 6 Datos o «no disponible»
    Note over UI,Core: 7 Vista 360 filtrada por permisos
    Note over Gestor,Ext: ALT
```

---

## [US-050] HU-ATC-050: Ver la consulta 360 del cliente dentro del ticket

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-050]` (`HU-ATC-050`)
- **Requerimiento Funcional de Origen:** `RF-SVC-050`
- **Funcionalidad Padre:** `[FEAT-20]` (`FT-ATC-20`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debe
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · mar 20-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-050 · El sistema debe mostrar en el ticket un submódulo de consulta del cliente con su detalle: lotes, cuotas y estado de cuenta, correos y mensajes, tickets e interacciones previas y documentos. Feedback presentación · ítem 12

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** ver en el ticket los lotes, cuotas, correos, tickets previos y documentos del cliente
> **PARA** responder sin salir del ticket

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Consulta 360
```gherkin
DADO un ticket con cliente identificado
CUANDO el gestor de tickets abre la pestaña del cliente
ENTONCES ve sus lotes, cuotas, correos y tickets previos consultados en línea (sin copiarlos).
```

#### CA-02 · Sección restringida
```gherkin
DADO un gestor de tickets sin permiso a estado de cuenta
CUANDO abre la consulta
ENTONCES esa sección aparece restringida.
```

#### CA-03 · Fuente caída (agregado por PO)
```gherkin
DADO que Cobranza no responde
CUANDO abro la consulta 360
ENTONCES las demás secciones cargan y la de cuotas muestra «no disponible» con hora del intento.
```

### Reglas de Negocio Asociadas
- **RN-SVC-036 Búsqueda respeta permisos**
- **RN-SVC-026 Cero registros paralelos del dato de cliente**

**Fuera de alcance:**
Edición de datos de las fuentes. Diseño / UX Prototipo › Ticket › pestaña Cliente

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-01 · DEP-08`
- **Evento de Analítica / Telemetría:** `Evento consulta360 {secciones} Preguntas abiertas ¿Qué sistemas fuente alimentan cada sección (SIGDA/TAXON, Cobranza, Contratos, correo)? ¿Qué secciones ve cada rol?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento consulta360 {secciones} Preguntas abiertas ¿Qué sistemas fuente alimentan cada sección (SIGDA/TAXON, Cobranza, Contratos, correo)? ¿Qué secciones ve cada rol?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca por DNI
    Note over UI,Core: 2 Buscar (con rol)
    Note over UI,Core: 3 Cliente + lotes
    Note over UI,Core: 4 Datos
    Note over UI,Core: 5 Cuotas y consultas
    Note over UI,Core: 6 Datos o «no disponible»
    Note over UI,Core: 7 Vista 360 filtrada por permisos
    Note over Gestor,Ext: ALT
```

---

## [US-051] HU-ATC-051: Continuar la atención cuando la consulta del cliente falla

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-051]` (`HU-ATC-051`)
- **Requerimiento Funcional de Origen:** `RF-SVC-051`
- **Funcionalidad Padre:** `[FEAT-20]` (`FT-ATC-20`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · mar 20-oct → mié 21-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-051 · El sistema debe manejar las excepciones de la consulta del cliente: cliente no encontrado, interesado sin contrato, datos incompletos o sistema fuente no disponible, permitiendo continuar el registro con un flujo controlado. Feedback presentación · ítem 14

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** registrar la solicitud aunque el cliente no se encuentre o el sistema fuente no responda
> **PARA** no perder la solicitud

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Cliente no encontrado
```gherkin
DADO un DNI que no existe en SIGDA/TAXON
CUANDO el gestor de tickets registra
ENTONCES el ticket se crea como «Interesado» con datos mínimos y queda pendiente de vincular al cliente.
```

#### CA-02 · Sistema fuente caído
```gherkin
DADO SIGDA/TAXON no disponible
CUANDO el gestor de tickets busca
ENTONCES ve un aviso, registra el ticket con datos mínimos y el sistema reintenta la vinculación automáticamente.
```

#### CA-03 · Vinculación posterior (agregado por PO)
```gherkin
DADO un ticket con vinculación pendiente
CUANDO el sistema fuente vuelve a responder
ENTONCES el ticket se vincula al cliente y se registra el cambio en la bitácora.
```

### Reglas de Negocio Asociadas
- **RN-SVC-026 Cero registros paralelos del dato de cliente**
- **RN-SVC-005 Empresa y línea obligatorias**

**Fuera de alcance:**
Alta de clientes nuevos en SIGDA. Diseño / UX Prototipo › Nuevo ticket (modo excepción)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET · DEP-01`
- **Evento de Analítica / Telemetría:** `Evento consulta_excepcion {motivo} Preguntas abiertas Confirmar a que se refiere «excepción para la consulta de usuario»: ¿cliente no encontrado, permisos especiales o caída del sistema fuente?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento consulta_excepcion {motivo} Preguntas abiertas Confirmar a que se refiere «excepción para la consulta de usuario»: ¿cliente no encontrado, permisos especiales o caída del sistema fuente?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca por DNI
    Note over UI,Core: 2 Buscar (con rol)
    Note over UI,Core: 3 Cliente + lotes
    Note over UI,Core: 4 Datos
    Note over UI,Core: 5 Cuotas y consultas
    Note over UI,Core: 6 Datos o «no disponible»
    Note over UI,Core: 7 Vista 360 filtrada por permisos
    Note over Gestor,Ext: ALT
```

---

## [US-052] HU-ATC-052: Consultar datos específicos con el motor de José

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-052]` (`HU-ATC-052`)
- **Requerimiento Funcional de Origen:** `RF-SVC-052`
- **Funcionalidad Padre:** `[FEAT-20]` (`FT-ATC-20`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Debería
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · mié 21-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-052 · El sistema debe consumir el motor de consultas que ya construyó José para obtener datos especificos del cliente, integrándolo por API en lugar de desarrollar uno nuevo. Feedback presentación · ítem 17

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** ejecutar consultas específicas del cliente usando el motor que ya construyó José
> **PARA** obtener el dato sin un desarrollo nuevo

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Consulta vía API
```gherkin
DADO una consulta especifica del cliente (p. ej.. saldo de un lote)
CUANDO el gestor de tickets la ejecuta desde el ticket
ENTONCES la respuesta proviene del motor de consultas de José vía API.
```

#### CA-02 · Motor no disponible
```gherkin
DADO el motor no disponible
CUANDO se consulta
ENTONCES el ticket muestra un aviso y no bloquea la atención.
```

#### CA-03 · Permisos (agregado por PO)
```gherkin
DADO una consulta sobre datos que mi rol no puede ver
CUANDO la ejecuto
ENTONCES el motor no devuelve el dato y queda registrado el intento.
```

### Reglas de Negocio Asociadas
- **RN-SVC-036 Búsqueda respeta permisos**

**Fuera de alcance:**
Mantenimiento del motor de José. Diseño / UX Prototipo › Ticket › Consultas rápidas Notas técnicas y dependencias ENT-SVC-017 SVC_SEARCH_INDEX · DEP-13

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento consulta_motor {consulta} Preguntas abiertas ¿Qué expone hoy el motor de José (API, base de datos, reportes)? ¿Quién lo mantiene y con que SLA?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento consulta_motor {consulta} Preguntas abiertas ¿Qué expone hoy el motor de José (API, base de datos, reportes)? ¿Quién lo mantiene y con que SLA?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca por DNI
    Note over UI,Core: 2 Buscar (con rol)
    Note over UI,Core: 3 Cliente + lotes
    Note over UI,Core: 4 Datos
    Note over UI,Core: 5 Cuotas y consultas
    Note over UI,Core: 6 Datos o «no disponible»
    Note over UI,Core: 7 Vista 360 filtrada por permisos
    Note over Gestor,Ext: ALT
```

---

## [US-053] HU-ATC-053: Buscar documentos del cliente por significado

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-053]` (`HU-ATC-053`)
- **Requerimiento Funcional de Origen:** `RF-SVC-053`
- **Funcionalidad Padre:** `[FEAT-20]` (`FT-ATC-20`)
- **Épica Padre:** `[EPIC-10]` (`EP-ATC-10`)
- **Prioridad:** Podría · alcance flexible
- **Estimación con IA:** 5 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 4 · mié 21-oct → jue 22-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-053 · El sistema debe indexar con un modelo de red neuronal (búsqueda semántica) los archivos y documentos de los clientes para que el motor de búsqueda encuentre información por significado y no solo por palabras exactas. Feedback presentación · ítem 19

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** buscar en lenguaje natural dentro de los documentos del cliente
> **PARA** encontrar el documento aunque no sepa cómo está escrito

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Búsqueda semántica
```gherkin
DADO una búsqueda en lenguaje natural (p. ej.. «adenda de cambio de lote»)
CUANDO el gestor de tickets la ejecuta
ENTONCES obtiene los documentos del cliente más relevantes con su fragmento.
```

#### CA-02 · Documento restringido
```gherkin
DADO un documento que el rol del gestor de tickets no puede ver
CUANDO busca
ENTONCES no aparece en los resultados.
```

#### CA-03 · Sin resultados (agregado por PO)
```gherkin
DADO una búsqueda sin coincidencias relevantes
CUANDO la ejecuto
ENTONCES veo sugerencias de búsqueda por palabras exactas.
```

### Reglas de Negocio Asociadas
- **RN-SVC-036 Búsqueda respeta permisos**
- **RN-SVC-012 DLP en bitácoras**

**Fuera de alcance:**
Indexación de repositorios no aprobados. Diseño / UX Prototipo › Búsqueda (documentos)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-017 SVC_SEARCH_INDEX, ENT-GOV-004 GOV_DOCUMENT_REPOSITORY · DEP-06 · DEP-14`
- **Evento de Analítica / Telemetría:** `Evento busqueda_semantica Preguntas abiertas ¿Qué repositorios de documentos se indexan (S3, GLI, correo)? ¿Hay restricciones legales para indexar contratos?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento busqueda_semantica Preguntas abiertas ¿Qué repositorios de documentos se indexan (S3, GLI, correo)? ¿Hay restricciones legales para indexar contratos?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Busca por DNI
    Note over UI,Core: 2 Buscar (con rol)
    Note over UI,Core: 3 Cliente + lotes
    Note over UI,Core: 4 Datos
    Note over UI,Core: 5 Cuotas y consultas
    Note over UI,Core: 6 Datos o «no disponible»
    Note over UI,Core: 7 Vista 360 filtrada por permisos
    Note over Gestor,Ext: ALT
```

---

## [US-054] HU-ATC-054: Ver mi avance diario y el de mi equipo

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-054]` (`HU-ATC-054`)
- **Requerimiento Funcional de Origen:** `RF-SVC-054`
- **Funcionalidad Padre:** `[FEAT-21]` (`FT-ATC-21`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debería
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · vie 23-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-054 · El sistema debe mostrar a cada gestor de tickets y a su líder un tablero de avance diario: tickets atendidos, pendientes, cumplimiento de SLA, tiempo medio y CSAT. Feedback presentación · ítem 13

### Narrativa de Usuario
> **COMO** gestor de tickets y su líder
> **QUIERO** ver un tablero con tickets atendidos, pendientes, en riesgo y CSAT del día
> **PARA** seguir la productividad y corregir a tiempo

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Tablero del gestor
```gherkin
DADO un gestor de tickets en su jornada
CUANDO abre su tablero
ENTONCES ve sus tickets atendidos, pendientes, en riesgo y su CSAT del día actualizados.
```

#### CA-02 · Tablero del líder
```gherkin
DADO un líder
CUANDO abre el tablero de su equipo
ENTONCES ve el avance diario de cada gestor de tickets y puede ir al ticket en riesgo.
```

#### CA-03 · Privacidad (agregado por PO)
```gherkin
DADO un gestor que abre el tablero
CUANDO consulta el avance
ENTONCES ve solo el suyo; el del equipo es visible para su líder.
```

### Reglas de Negocio Asociadas
- **RN-SVC-025 Cierre end-to-end en 72 horas hábiles**

**Fuera de alcance:**
Evaluación de desempeño. Diseño / UX Prototipo › Mi día Notas técnicas y dependencias ENT-SVC-001 SVC_TICKET, ENT-SVY-001 SVY_SURVEY_RESPONSE · DEP-02

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento tablero_visto Preguntas abiertas ¿Qué metas diarias tiene cada gestor de tickets? ¿El tablero del gestor de tickets es visible para sus pares?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento tablero_visto Preguntas abiertas ¿Qué metas diarias tiene cada gestor de tickets? ¿El tablero del gestor de tickets es visible para sus pares?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Evento ticket.asignado
    Note over UI,Core: 2 ¿Líder del gestor?
    Note over UI,Core: 3 Líder
    Note over UI,Core: 4 Correo con copia
    Note over UI,Core: 5 Actualiza indicadores
    Note over Gestor,Ext: ALT
```

---

## [US-055] HU-ATC-055: Recibir un correo al asignarme un ticket, con copia a mi líder

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-055]` (`HU-ATC-055`)
- **Requerimiento Funcional de Origen:** `RF-SVC-055`
- **Funcionalidad Padre:** `[FEAT-21]` (`FT-ATC-21`)
- **Épica Padre:** `[EPIC-09]` (`EP-ATC-09`)
- **Prioridad:** Debe
- **Estimación con IA:** 2 h con IA
- **Asignación / Fechas:** Iteración 1 · Dev 3 · vie 23-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-055 · El sistema debe enviar una alerta por correo al gestor de tickets cada vez que se le asigna o reasigna un ticket, con copia a su líder, indicando N.º, tipo, prioridad y vencimiento de SLA. Feedback presentación · ítem 15

### Narrativa de Usuario
> **COMO** gestor de tickets
> **QUIERO** recibir un correo cada vez que me asignan o reasignan un ticket, con copia a mi líder
> **PARA** que ninguna asignación pase desapercibida

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Correo de asignación
```gherkin
DADO un ticket asignado a un gestor de tickets
CUANDO se guarda la asignación
ENTONCES el gestor de tickets recibe un correo en 1 min o menos con copia a su líder.
```

#### CA-02 · Reasignación masiva
```gherkin
DADO una reasignación masiva
CUANDO se ejecuta
ENTONCES cada gestor de tickets recibe un solo correo con el resumen de sus tickets.
```

#### CA-03 · Sin líder (agregado por PO)
```gherkin
DADO un gestor sin líder registrado en NEXUS
CUANDO se le asigna un ticket
ENTONCES el correo sale solo al gestor y se alerta al administrador para completar el dato.
```

### Reglas de Negocio Asociadas
- **RN-SVC-035 Aviso de asignación con copia al líder**
- **RN-SVC-012 DLP en bitácoras**

**Fuera de alcance:**
Notificaciones por WhatsApp interno. Diseño / UX Plantilla de correo de asignación Notas técnicas y dependencias ENT-SVC-003 SVC_TICKET_ASSIGNMENT_LOG · DEP-02

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** ``
- **Evento de Analítica / Telemetría:** `Evento correo_asignacion Preguntas abiertas ¿El correo incluye datos del cliente o solo el enlace al ticket (por DLP)? ¿Quién es el líder de cada gestor de tickets (fuente NEXUS)?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento correo_asignacion Preguntas abiertas ¿El correo incluye datos del cliente o solo el enlace al ticket (por DLP)? ¿Quién es el líder de cada gestor de tickets (fuente NEXUS)?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Evento ticket.asignado
    Note over UI,Core: 2 ¿Líder del gestor?
    Note over UI,Core: 3 Líder
    Note over UI,Core: 4 Correo con copia
    Note over UI,Core: 5 Actualiza indicadores
    Note over Gestor,Ext: ALT
```

---

## [US-056] HU-ATC-056: Abrir el caso de resolución por 3 meses impagos

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-056]` (`HU-ATC-056`)
- **Requerimiento Funcional de Origen:** `RF-SVC-056`
- **Funcionalidad Padre:** `[FEAT-22]` (`FT-ATC-22`)
- **Épica Padre:** `[EPIC-11]` (`EP-ATC-11`)
- **Prioridad:** Debe
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · lun 26-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-056 · El sistema debe generar automáticamente un ticket de resolución de contrato cuando un cliente acumula 3 meses (cuotas) sin pagar, o cuando se registra un reclamo con 3 meses de no pago, y derivarlo al flujo de resolución con Cobranza y Legal. Feedback 2.ª reunión · ítem 1

### Narrativa de Usuario
> **COMO** analista de Cobranza
> **QUIERO** que el sistema abra un caso de resolución de contrato cuando un cliente acumula 3 meses sin pagar
> **PARA** aplicar la cláusula resolutoria a tiempo y con trazabilidad

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Detección diaria
```gherkin
DADO un contrato con 3 cuotas vencidas e impagas según Cobranza
CUANDO corre la evaluación diaria
ENTONCES se crea un ticket «Resolución de contrato» vinculado al cliente y al lote, y se deriva al flujo de Cobranza y Legal.
```

#### CA-02 · Regularización
```gherkin
DADO un cliente que regulariza su deuda antes de la resolución
CUANDO Cobranza registra el pago
ENTONCES el ticket se cierra como «Regularizado» y el proceso se detiene.
```

#### CA-03 · Reclamo abierto (agregado por PO)
```gherkin
DADO un cliente con 3 meses impagos y un reclamo abierto en el Libro
CUANDO se evalúa el caso
ENTONCES el caso queda en «suspendido por reclamo» hasta responderlo (propuesta del PO, a validar con Legal).
```

### Reglas de Negocio Asociadas
- **RN-SVC-037 Causal de resolución por 3 meses impagos**
- **RN-SVC-006 Asignación append-only**

**Fuera de alcance:**
Redacción de la resolución y carta notarial. Diseño / UX Prototipo › Casos de resolución

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-001 SVC_TICKET, ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-SVC-014 SVC_WORKFLOW_DEFINITION · DEP-08`
- **Evento de Analítica / Telemetría:** `Evento caso_resolucion {meses} Preguntas abiertas ¿El disparador son 3 cuotas consecutivas o acumuladas? ¿Se cuenta desde el vencimiento o desde el reclamo? Si el cliente tiene un reclamo abierto en el Libro de Reclamaciones, ¿se suspende la resolución hasta responderlo? ¿El contrato exige carta notarial?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento caso_resolucion {meses} Preguntas abiertas ¿El disparador son 3 cuotas consecutivas o acumuladas? ¿Se cuenta desde el vencimiento o desde el reclamo? Si el cliente tiene un reclamo abierto en el Libro de Reclamaciones, ¿se suspende la resolución hasta responderlo? ¿El contrato exige carta notarial?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Cuotas vencidas por contrato
    Note over UI,Core: 2 Contratos con 3 meses
    Note over UI,Core: 3 Abrir caso de resolución
    Note over UI,Core: 4 Alerta de cancelación
    Note over UI,Core: 5 Alerta al cliente (constancia)
    Note over UI,Core: 6 Carta al proyecto
    Note over UI,Core: 7 Carta + copia supervisor
    Note over Gestor,Ext: ALT
```

---

## [US-057] HU-ATC-057: Enviar al cliente la alerta de cancelación en paralelo

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-057]` (`HU-ATC-057`)
- **Requerimiento Funcional de Origen:** `RF-SVC-057`
- **Funcionalidad Padre:** `[FEAT-22]` (`FT-ATC-22`)
- **Épica Padre:** `[EPIC-11]` (`EP-ATC-11`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · lun 26-oct → mar 27-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-057 · El sistema debe enviar al cliente, en paralelo al proceso de resolución, una alerta de cancelación del servicio (deuda, plazo para regularizar y consecuencias) por correo, WhatsApp y Mi Portal, dejando constancia de envío. Feedback 2.ª reunión · ítem 2

### Narrativa de Usuario
> **COMO** analista de Cobranza
> **QUIERO** que al abrir el caso se envíe de inmediato al cliente la alerta de cancelación del servicio
> **PARA** que el cliente pueda regularizar antes de la resolución

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Envío en paralelo
```gherkin
DADO un ticket de resolución de contrato creado
CUANDO se registra
ENTONCES en ese mismo momento se envía al cliente la alerta de cancelación del servicio, sin esperar el avance del flujo
de resolución.
```

#### CA-02 · Constancia
```gherkin
DADO una alerta enviada
CUANDO se consulta el ticket
ENTONCES se ve la constancia (fecha, hora, canal, destinatario y estado de entrega) como evidencia.
```

#### CA-03 · Canal fallido (agregado por PO)
```gherkin
DADO que el correo del cliente rebota
CUANDO se envía la alerta
ENTONCES se reintenta por WhatsApp y Mi Portal y la constancia registra cada intento.
```

### Reglas de Negocio Asociadas
- **RN-SVC-038 Alerta de cancelación en paralelo**
- **RN-SVC-012 DLP en bitácoras**

**Fuera de alcance:**
Gestión de cobranza telefónica. Diseño / UX Plantilla de alerta de cancelación

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-SVC-004 SVC_TICKET_INTERACTION · DEP-08`
- **Evento de Analítica / Telemetría:** `Evento alerta_cancelacion {canal} Preguntas abiertas ¿Qué significa «cancelación del servicio»: resolución del contrato, suspensión de beneficios u otro? ¿Qué plazo de regularización se da al cliente? ¿Legal aprueba el texto de la alerta?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento alerta_cancelacion {canal} Preguntas abiertas ¿Qué significa «cancelación del servicio»: resolución del contrato, suspensión de beneficios u otro? ¿Qué plazo de regularización se da al cliente? ¿Legal aprueba el texto de la alerta?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Cuotas vencidas por contrato
    Note over UI,Core: 2 Contratos con 3 meses
    Note over UI,Core: 3 Abrir caso de resolución
    Note over UI,Core: 4 Alerta de cancelación
    Note over UI,Core: 5 Alerta al cliente (constancia)
    Note over UI,Core: 6 Carta al proyecto
    Note over UI,Core: 7 Carta + copia supervisor
    Note over Gestor,Ext: ALT
```

---

## [US-058] HU-ATC-058: Enviar la carta de alerta al responsable del proyecto y su

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-058]` (`HU-ATC-058`)
- **Requerimiento Funcional de Origen:** `RF-SVC-058`
- **Funcionalidad Padre:** `[FEAT-22]` (`FT-ATC-22`)
- **Épica Padre:** `[EPIC-11]` (`EP-ATC-11`)
- **Prioridad:** Debe
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · mar 27-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-058 · El sistema debe generar y enviar una carta de alerta al responsable del proyecto del lote, con copia a su supervisor, indicando cliente, deuda, estado del caso y fecha prevista de resolución. Feedback 2.ª reunión · ítem 3

### Narrativa de Usuario
> **COMO** responsable de proyecto
> **QUIERO** recibir una carta de alerta de cada caso de resolución de mi proyecto, con copia a mi supervisor
> **PARA** gestionar el caso antes de que se resuelva

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Carta con copia
```gherkin
DADO un ticket de resolución de contrato
CUANDO se crea
ENTONCES se genera la carta de alerta desde la plantilla y se envía al responsable del proyecto con copia a su supervisor.
```

#### CA-02 · Escalamiento
```gherkin
DADO una carta enviada
CUANDO el responsable no registra una acción en el plazo definido
ENTONCES el caso se escala al supervisor según la matriz de escalamiento.
```

#### CA-03 · Sin responsable (agregado por PO)
```gherkin
DADO un lote cuyo proyecto no tiene responsable registrado
CUANDO se genera la carta
ENTONCES se envía al supervisor del área comercial y se alerta para completar el maestro.
```

### Reglas de Negocio Asociadas
- **RN-SVC-039 Carta de alerta al responsable del proyecto**
- **RN-SVC-035 Aviso de asignación con copia al líder**

**Fuera de alcance:**
Firma digital de la carta. Diseño / UX Plantilla de carta de alerta

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-GOV-004 GOV_DOCUMENT_REPOSITORY · DEP-15`
- **Evento de Analítica / Telemetría:** `Evento carta_alerta Preguntas abiertas ¿Quién es el responsable de cada proyecto y su supervisor (fuente maestra)? ¿La carta es un correo formal o un PDF firmado? ¿Qué acción se espera del responsable del proyecto?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento carta_alerta Preguntas abiertas ¿Quién es el responsable de cada proyecto y su supervisor (fuente maestra)? ¿La carta es un correo formal o un PDF firmado? ¿Qué acción se espera del responsable del proyecto?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Cuotas vencidas por contrato
    Note over UI,Core: 2 Contratos con 3 meses
    Note over UI,Core: 3 Abrir caso de resolución
    Note over UI,Core: 4 Alerta de cancelación
    Note over UI,Core: 5 Alerta al cliente (constancia)
    Note over UI,Core: 6 Carta al proyecto
    Note over UI,Core: 7 Carta + copia supervisor
    Note over Gestor,Ext: ALT
```

---

## [US-059] HU-ATC-059: Registrar el ingreso de una persona al proyecto

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-059]` (`HU-ATC-059`)
- **Requerimiento Funcional de Origen:** `RF-SVC-059`
- **Funcionalidad Padre:** `[FEAT-23]` (`FT-ATC-23`)
- **Épica Padre:** `[EPIC-11]` (`EP-ATC-11`)
- **Prioridad:** Debería
- **Estimación con IA:** 4 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · mar 27-oct → mié 28-oct
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-059 · El sistema debe permitir registrar el ingreso de una persona al proyecto con un formulario simple (nombre, DNI, teléfono, motivo, lote o área a visitar y fecha y hora) que genera automáticamente un ticket asignado al responsable del proyecto. Feedback 2.ª reunión · ítem 5

### Narrativa de Usuario
> **COMO** personal de control de acceso
> **QUIERO** registrar desde el celular, con un formulario simple, a cada persona que ingresa al proyecto
> **PARA** que su visita quede registrada y su motivo se atienda

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Formulario simple
```gherkin
DADO una persona que llega al proyecto
CUANDO el personal completa el formulario simple en el celular (máximo 6 campos)
ENTONCES se crea un ticket «Ingreso a proyecto» con número y se notifica al responsable del proyecto.
```

#### CA-02 · Cliente reconocido
```gherkin
DADO un DNI que ya es cliente
CUANDO se registra el ingreso
ENTONCES el ticket se vincula automáticamente a su ficha y a su lote.
```

#### CA-03 · Sin conexión (agregado por PO)
```gherkin
DADO que no hay internet en la garita
CUANDO registro un ingreso
ENTONCES el formulario lo guarda en el celular y lo envía al recuperar la conexión.
```

### Reglas de Negocio Asociadas
- **RN-SVC-041 Formulario simple genera ticket**
- **RN-SVC-005 Empresa y línea obligatorias**

**Fuera de alcance:**
Control de salida y torniquetes. Diseño / UX Prototipo › Formulario de ingreso (móvil)

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-019 SVC_SIMPLE_FORM_DEFINITION, ENT-SVC-001 SVC_TICKET, ENT-REF-001 MAE_CHANNEL`
- **Evento de Analítica / Telemetría:** `Evento ingreso_proyecto Preguntas abiertas ¿Qué personas ingresan (clientes, interesados, contratistas, proveedores)? ¿Se registra también la salida? ¿Todo ingreso es un ticket o solo los que traen una solicitud? ¿Hay conectividad en el proyecto?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento ingreso_proyecto Preguntas abiertas ¿Qué personas ingresan (clientes, interesados, contratistas, proveedores)? ¿Se registra también la salida? ¿Todo ingreso es un ticket o solo los que traen una solicitud? ¿Hay conectividad en el proyecto?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Completa formulario
    Note over UI,Core: 2 Crear ticket
    Note over UI,Core: 3 ¿Cupo en bus y horario?
    Note over UI,Core: 4 Cupo descontado
    Note over UI,Core: 5 Confirmación
    Note over UI,Core: 6 Punto y hora de embarque
    Note over Gestor,Ext: ALT
```

---

## [US-060] HU-ATC-060: Reservar un cupo en el bus del Entrega Fest

### Metadatos de la Historia de Usuario
- **ID Historia:** `[US-060]` (`HU-ATC-060`)
- **Requerimiento Funcional de Origen:** `RF-SVC-060`
- **Funcionalidad Padre:** `[FEAT-23]` (`FT-ATC-23`)
- **Épica Padre:** `[EPIC-11]` (`EP-ATC-11`)
- **Prioridad:** Debería
- **Estimación con IA:** 3 h con IA
- **Asignación / Fechas:** Iteración 2 · Dev 4 · mié 28-oct ESTADO
- **Estado DoR:** Pendiente DoR
- **Requerimiento Textual:** RF-SVC-060 · El sistema debe permitir que el cliente solicite cupo en los buses del Entrega Fest con un formulario simple que genera un ticket, controla el aforo por bus y horario y envía la confirmación con punto y hora de embarque. Feedback 2.ª reunión · ítem 6

### Narrativa de Usuario
> **COMO** cliente convocado al Entrega Fest
> **QUIERO** reservar mi cupo en un bus indicando acompañantes y punto de embarque
> **PARA** llegar al evento de entrega de mi lote sin coordinar por teléfono

### Criterios de Aceptación (Escenarios Gherkin)
#### CA-01 · Reserva con aforo
```gherkin
DADO un cliente convocado al Entrega Fest
CUANDO completa el formulario con acompañantes y punto de embarque
ENTONCES se crea un ticket, se descuenta el cupo del bus y recibe la confirmación por WhatsApp o correo.
```

#### CA-02 · Lista de espera
```gherkin
DADO un bus sin cupo
CUANDO el cliente intenta reservar
ENTONCES el formulario ofrece otro bus u horario o lo deja en lista de espera.
```

#### CA-03 · Cancelación (agregado por PO)
```gherkin
DADO un cliente con cupo confirmado
CUANDO cancela su reserva
ENTONCES el cupo se libera y se asigna al primero de la lista de espera, que recibe la confirmación.
```

### Reglas de Negocio Asociadas
- **RN-SVC-042 Aforo de buses del Entrega Fest**
- **RN-SVC-041 Formulario simple genera ticket**

**Fuera de alcance:**
Contratación y pago del proveedor de buses. Diseño / UX Prototipo › Formulario Entrega Fest

### Especificaciones Técnicas y Dependencias
- **Diseño / UX:** ``
- **Entidades y Dependencias:** `ENT-SVC-020 SVC_EVENT_BUS_BOOKING, ENT-SVC-019 SVC_SIMPLE_FORM_DEFINITION, ENT-SVC-001 SVC_TICKET`
- **Evento de Analítica / Telemetría:** `Evento reserva_bus {acompanantes} Preguntas abiertas Confirmar el alcance de «Buses entrega fest»: ¿reserva de cupo del cliente, logística de buses con el proveedor o ambas? ¿Cuántos acompañantes se permiten? ¿Se asocia al proyecto y a la fecha de entrega?`

### Definición de Terminado (DoD) para la Historia
- [ ] Criterios de aceptación cubiertos por pruebas automatizadas (generadas con IA y revisadas por el dev).
- [ ] Revisión de pares obligatoria en Pull Request y análisis SAST sin vulnerabilidades en verde.
- [ ] Accesibilidad y diseño responsivo verificados (escritorio y móvil).
- [ ] Emisión del evento de telemetría `Evento reserva_bus {acompanantes} Preguntas abiertas Confirmar el alcance de «Buses entrega fest»: ¿reserva de cupo del cliente, logística de buses con el proveedor o ambas? ¿Cuántos acompañantes se permiten? ¿Se asocia al proyecto y a la fecha de entrega?` validada.
- [ ] Bitácoras con hash verificado HMAC-SHA256 y cero PII expuesto (RNF-AUD-004 · RNF-SEC-008).
- [ ] Documentación técnica de la funcionalidad actualizada.
- [ ] Aceptado formalmente por el Dueño de Producto (PO) a las 17:00.

### Diagrama de Secuencia
```mermaid
sequenceDiagram
    autonumber
    actor Gestor as Gestor de tickets
    participant UI as Consola ATC
    participant Core as Servicio de Tickets
    participant Ext as Sistemas Externos / SLA
    Note over UI,Core: 1 Completa formulario
    Note over UI,Core: 2 Crear ticket
    Note over UI,Core: 3 ¿Cupo en bus y horario?
    Note over UI,Core: 4 Cupo descontado
    Note over UI,Core: 5 Confirmación
    Note over UI,Core: 6 Punto y hora de embarque
    Note over Gestor,Ext: ALT
```

---
