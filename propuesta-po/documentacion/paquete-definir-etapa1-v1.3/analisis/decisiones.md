---
id: "DECISIONES-AYB-0001"
tipo: "decisiones"
titulo: "Registro de decisiones del TL (fuente de verdad del paquete)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.3"
owner: "Jose Jara (Líder Técnico)"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-005, ADR-009, ADR-011, ADR-012, ADR-013, ADR-014]
tags: [decisiones, g3]
---

# Registro de decisiones del TL

Esta es la fuente de verdad del paquete Definir: manda sobre el BRD, las épicas, las features, las
historias, el DoR y el plan de pruebas (skill `aybar-paquete-definir`). **Es un borrador:** lo escribe
el agente a partir de lo que dijo el TL, y el TL lo confirma y lo mantiene.

**Actualización del 22-oct-2026.** El Líder Técnico (Jose Jara) revisó los 14 ADR y fijó las decisiones DT-01 a DT-10 (sección siguiente); este registro las toma de su revisión del 22-oct. Cierra D-001, D-003, P-001 a P-004, P-006, P-008 a P-010 y deja P-021 resuelta en lo técnico. No cierra P-005 ni P-007. Añade las pendientes P-025 a P-032 que salen de aplicarlas. Ningún documento del paquete está aprobado.

**Actualización del 21-oct-2026.** Es el día 1 de desarrollo de la Etapa 1, con el plan v1.3 del PO.
Se conservan las decisiones D-001 a D-008 y las pendientes P-001 a P-019 de la v3 de Nexora, y se
actualiza su estado en la columna «Estado (21-oct)». Al final se añaden las pendientes P-020 a P-024
para el PO. Las decisiones del mockup están en `propuesta-po/DECISIONES.md` §5.9 a 5.11 (rama
`feature/AYB-0001-propuesta-po-v1-3` de `tyc-mockup`).

| # | Fecha | Decisión | Quién | Estado (22-oct) |
|---|---|---|---|---|
| D-001 | 2026-10-19 | **Stack de la Etapa 1: por decidir entre dos opciones.** Opción (a), la del PO en el PLT-01 v1.3 (ADR-01) y el PLT-05 §4.1: monolito modular en Node.js 20 con NestJS, React con TypeScript y PostgreSQL Multi-AZ con índice de búsqueda; el PLT-05 dice «stack propuesto por el PO, a validar con Arquitectura». Opción (b), la de ADR-001 y ADR-012 en Nexora: Java con Spring Boot, Angular, PostgreSQL para escribir, MongoDB para leer y Kafka con outbox (ADR-013). La v3 de este registro anotaba la (b) como decidida («reemplaza el NestJS y React del PLT-05»), pero no hay confirmación escrita y los documentos del PO siguen con la (a). | Jose Jara (Líder Técnico), 22-oct-2026 (DT-01) | **Cerrada por DT-01** (22-oct-2026): gana la opción (b). Falta que el PO actualice el PLT-01 §1 y el PLT-05 §4.1 (ver P-027) |
| D-002 | 2026-10-19 | La fuente de verdad del stack técnico es el repositorio `aybar-ATC` y las skills y contratos del SDK Aybar 0.7.1. | PO | **Confirmada por DT-01** (22-oct-2026): el stack es el del SDK Aybar 0.7.1. La confirma el Líder Técnico; el PO actualiza sus PLT |
| D-003 | 2026-10-19 | Según la revisión del Líder Técnico (diagnóstico del paquete, 19-oct), la empresa ya aprobó: Azure como nube, una base única de PostgreSQL con el modelo corporativo, el emisor de tokens corporativo (Control de acceso), Azure Key Vault para llaves y secretos, tareas programadas con ShedLock y códigos de error `AYB-<SVC>-<HTTP>`. El diagnóstico cita PJ-05 (ADR-015, ADR-016 y ADR-019). Afecta a ADR-001, 006, 009, 011 y 014. | Jose Jara (Líder Técnico), 22-oct-2026 | **Decidida por DT-03, DT-05 a DT-10** (22-oct-2026). Las referencias a PJ-05 (ADR-001, 012, 015, 016 y 019; D-30, D-46, D-47, D-50, D-169) vienen del correo del Líder Técnico: quien redacta el paquete no ve el apartado PJ-05 en Nexora y no las verificó |
| D-004 | 2026-10-19 | Los requisitos de origen son los del Excel de ATC en sus tres capas (base, feedback de la presentación y feedback de la 2.ª reunión) más los del PLT-04 v1.3. Cada cita lleva su capa (`cobertura-requisitos.md`). | PO | Por confirmar. Desde el 16-oct el Excel vigente es `ATC_requerimientos (3).xlsx`, que suma la división por etapas (RN-SVC-043); `cobertura-requisitos.md` v0.2 ya lo usa. Las diferencias del Excel con los PDF están en P-022 |
| D-005 | 2026-10-19 | `AYB-0001` es el marcador de ticket de todo el paquete (el mismo del análisis del PO) mientras no exista el ticket del backlog. | Equipo | Provisional (sigue igual) |
| D-006 | 2026-10-20 | El Modelo de Datos Corporativo v7 (fragmento SERVICE) es la fuente de la estructura de datos de ATC: 13 entidades, claves y relaciones. Tipos, largos y obligatoriedad de los atributos quedan pendientes (archivos de Drive del v7). | Líder Técnico (DT-06) | **Reafirmada por DT-06** (22-oct-2026): las tablas de ATC (`SVC_*` y `MAE_*`) van en la base única del v7 con FK físicas y `PARTY` es la fuente viva del cliente, no una copia. Falta la confirmación del PO (P-021) y de Gobierno de Datos |
| D-007 | 2026-10-20 | Las decisiones del mockup de la Etapa 1 (rama `feature/AYB-0001-propuesta-po-v1-3` de `tyc-mockup`: Mi Portal, flujos con actividades, pausa del SLA, cierre automático, áreas y subtipos de la plataforma actual) son propuesta del equipo y las decide el PO en el comité (`DECISIONES.md` del mockup, §5.9). | Equipo (Dev 1) | Por confirmar por el PO. Ver `DECISIONES.md` §5.9 (27 respuestas del equipo, 20-oct), §5.10 (mejoras traídas de la rama de Daniel que contradicen la HU-067 v1.3, y la pregunta sobre su D-12) y §5.11 (decisiones de Brayan sobre la revisión del 20-oct) |
| D-008 | 2026-10-20 | Las 62 historias publicadas en PJ-06 (carpeta `historias/`, todas en v1.3) son el texto de referencia de los criterios de aceptación. El paquete G3 las refleja una por una en `arquitectura/trazabilidad-historias.md`; lo que las historias piden y el v7 o el contrato no tenían queda como propuesta marcada. | Equipo | Por confirmar por el PO. Las 62 historias siguen pendientes de su aprobación en Nexora (P-024) |

## Decisiones del Líder Técnico (22-oct-2026)

Autor: **Jose Jara, Líder Técnico**, 22-oct-2026 (revisión de los ADR de PJ-06; texto en el correo «Revisión de los ADR de Aybar Atiende»). Marco: Marco de Entrega v1.1 y SDK Aybar 0.7.1. Las referencias a PJ-05 (Control de acceso) son las que cita el Líder Técnico; este documento no las verificó.

| # | Decisión | Cierra | Base |
|---|---|---|---|
| **DT-01** | **Stack:** el del SDK Aybar 0.7.1. Backend en Java 21 (Amazon Corretto) con Spring Boot y `aybar-bom` 0.7.1, sobre la plantilla hexagonal (`domain`, `application`, `adapters`, `infrastructure`, `boot`). Frontend con el framework `@aybarcorp/*` en Angular (`@aybarcorp/ui-angular`). Node/NestJS queda descartado. | D-001, D-002, P-004 (parcial) | SDK 0.7.1; acuerdo del 4-sep (Corretto 21) |
| **DT-02** | **CQRS completo desde la Etapa 1:** escritura en PostgreSQL, lectura en el almacén con API de MongoDB y bus con protocolo Kafka. El **outbox transaccional** se construye en el servicio, porque el SDK no lo trae. El proyector del servicio es el único que escribe en el almacén de lectura. | P-003, P-009 | Skills `aybar-cqrs` y `aybar-outbox` |
| **DT-03** | **ATC consume la seguridad; no la administra.** El área de Roles y Permisos (Control de acceso, PJ-05) administra usuarios, cuentas, roles, permisos, asignaciones, jefaturas, sesiones y autenticación. ATC no guarda usuarios, roles ni permisos, y no construye pantallas para administrarlos. Solo entrega su catálogo (roles, opciones de menú y acciones) por el mecanismo del ADR-021 de PJ-05. **Se eliminan el maestro local del ADR-009 y el módulo `identidad`.** | P-002 (parte), ADR-009 | PJ-05 ADR-021, D-30 y D-46 |
| **DT-04** | **Mi Portal consume el login de clientes de Control de acceso:** cuenta `CUSTOMER`, búsqueda por DNI con correo coincidente, verificación y niveles de autenticación de PJ-05. **ATC no abre sesiones, no emite códigos y no verifica identidades.** | P-002, P-008, ADR-011 | PJ-05 D-47, D-63 y ADR-014 de PJ-05 |
| **DT-05** | **Emisor de tokens:** el servidor de autorización de Control de acceso (Spring Authorization Server). ATC solo valida el JWT con `aybar-starter-security` y el contrato de claims de PJ-05. No van Cognito, Entra ID ni Auth0 como emisor. | P-002, ADR-014 | PJ-05 ADR-001, 012 y 016 |
| **DT-06** | **Base de datos:** las tablas de ATC (`SVC_*` y `MAE_*` del fragmento 10) van en la **base única del modelo v7**, en Azure Database for PostgreSQL, con FK físicas. **`PARTY` es la fuente viva del cliente, no una copia.** | D-006, P-010, P-021 | PJ-05 ADR-019 |
| **DT-07** | **Nube: Azure** para todo ATC: Azure Database for PostgreSQL (base única); Azure Cosmos DB for MongoDB (vCore) para el almacén de lectura; Azure Event Hubs con protocolo Kafka para el bus; Azure Blob Storage con inmutabilidad para la evidencia; Azure Key Vault para secretos y llaves; Azure Container Apps para los contenedores; Azure Container Registry para las imágenes; Azure Monitor para la observabilidad; Cloudflare + Azure API Management en el borde. | P-001, ADR-014, ADR-006 | PJ-05 ADR-015 y 019; skill `aybar-lexico` |
| **DT-08** | **Jobs:** tareas programadas con **ShedLock** sobre PostgreSQL, para que corra una sola réplica. | P-006 | PJ-05 D-90 |
| **DT-09** | **Errores:** ProblemDetail del SDK con `codigo` en formato `AYB-<ÁREA>-<HTTP>` y `AybarException`. Se enciende `aybar-starter-web`. ATC usa áreas de error propias, distintas de las de Control de acceso. | — | PJ-05 D-169; SDK |
| **DT-10** | **Llamadas entre servicios:** token de servicio `client_credentials` del emisor corporativo (`aybar-starter-client`). | — | PJ-05 D-50 |

**Gestiones en curso (22-oct):** el Líder Técnico pide la dispensa M0 a Enrique Albán (Data Chief). Legal confirma la retención de la evidencia y el plazo legal del Libro de Reclamaciones.

## Decisiones pendientes del TL (bloquean G3)

| # | Pendiente | ADR | Estado (22-oct) |
|---|---|---|---|
| P-001 | Nube, servicios gestionados, orquestador, secretos, observabilidad | ADR-014 | **Resuelta por DT-07** (Azure y servicios gestionados), **DT-08** (ShedLock) y **DT-10**. Ver ADR-014 v0.2 |
| P-002 | Quién emite el token en la Etapa 1 y cómo obtiene su token la sesión de Mi Portal | ADR-014, ADR-009, ADR-011 | **Resuelta por DT-05** (emisor: servidor de autorización de Control de acceso) y **DT-04** (Mi Portal usa el login de clientes de Control de acceso). Depende de P-026 |
| P-003 | Quién escribe en el almacén de lectura y qué vistas viven allí; retraso tolerado | ADR-012 | **Resuelta por DT-02**: el proyector del servicio es el único que escribe en el almacén de lectura. Retraso máximo: propuesta de 5 s en ADR-012 v0.2 (como HU-067 CA-08), a confirmar por el Líder Técnico |
| P-004 | Papel del frontend Angular (`app` o `shell` con remotos) | ADR-012 | **Parcial.** DT-01 fija Angular con `@aybarcorp/ui-angular`. El papel (`app` o `shell` con remotos) sigue abierto: propuesta del equipo en ADR-012 v0.2, `app` único en la Etapa 1 |
| P-005 | Compatibilidad con la Arquitectura de Directorio (M0) o dispensa | todos | Abierta. El Líder Técnico pide la dispensa M0 a Enrique Albán (Data Chief); gestión en curso al 22-oct. Los ADR dicen «requiere dispensa (solicitada)» |
| P-006 | Mecanismo de programación de jobs y ejecución única con varias réplicas | ADR-005 | **Resuelta por DT-08**: tareas programadas con ShedLock sobre PostgreSQL. ShedLock no está en el SDK ni en el BOM: hay que declarar la dependencia y registrar su tabla (P-031) |
| P-007 | Si el hash de las bitácoras se encadena; modo y plazo de retención del Object Lock | ADR-002, ADR-006 | Abierta. La revisión del 22-oct pide **encadenar el hash** (ADR-002) y una retención de al menos 2 años del Libro (ADR-006, a confirmar por Legal), pero no las registra como decisión DT: el Líder Técnico debe fijarlas |
| P-008 | Canal y proveedor de envío del código de Mi Portal. Propuesta del equipo en el mockup: código de 6 dígitos al correo y al celular (vence a los 5 min, 3 intentos); falta el proveedor y la confirmación del PO | ADR-011 | **Resuelta por DT-04**: ATC no abre sesiones, no emite códigos ni verifica identidades; lo hace el login de clientes de Control de acceso. El PO debe aceptar el cambio de HU-064 CA-01 (código propio de 6 dígitos, 5 min, 3 intentos) (P-027) |
| P-009 | CQRS y mensajería en la Etapa 1: estimar el outbox y el proyector (el SDK no los trae) y elegir los servicios en Azure, o declarar la desviación y construir sin CQRS | ADR-012, ADR-013 | **Decisión tomada por DT-02**: CQRS completo desde la Etapa 1, con el outbox construido en el servicio. **Faltan las horas** (P-025): el plan del PO (243 h de 252 h) no las tiene |
| P-010 | Origen del cliente de ATC: `PARTY` de la base única (el v7 trae `PARTY` y `PARTY_SENSITIVE_DATA`) o el registro de SIGDA/TAXON, y cómo se reconcilian | ADR-003 | **Resuelta en lo técnico por DT-06**: `PARTY` es la fuente viva. El PO confirma la regla en P-021 |
| P-011 | Alcance de ADR-007 (IA), ADR-008 (motor de flujos) y ADR-010 (visor 3D): el PO confirma o retira | ADR-007, ADR-008, ADR-010 | **En los documentos del PO v1.3 las tres siguen en la Etapa 1**: el registro de ADR de la Etapa 1 del PLT-01 v1.3 (§1) incluye ADR-07, ADR-08 y ADR-10, con las HU-043 y HU-067 como prioridades 1 y 3. Falta la aprobación: el acuerdo 6 del PLT-05 («ADR-01 … 11 aprobadas y registradas» el 20-oct) no consta en Nexora (P-024) |
| P-012 | Requisitos sin historia: los RF del Excel sin historia y los RNF sin cobertura. ¿Van a otra historia, se retiran o se dejan fuera de la Etapa 1? | `cobertura-requisitos.md` | **RF: resuelta por la v1.3.** Los RF del Excel sin historia son los 5 que la columna `etapa` deja fuera de la Etapa 1 (RN-SVC-043); los 62 RF de la Etapa 1 tienen historia. **RNF: abierta.** Los 24 RNF de la Etapa 1 están declarados en alguna funcionalidad del PLT-03, pero 19 no los cita ninguna historia. Se propone cubrirlos en el plan de pruebas de cada funcionalidad, un TC por umbral. Deciden el TL y QA |
| P-013 | Una sola versión del plan. **Actualizado el 20-oct:** el paquete v1.3 de 119 documentos (11 épicas, 23 funcionalidades, 62 historias y 23 DoR) ya está en Nexora, todo pendiente del PO; faltan por aprobar. Las 8 épicas, 18 funcionalidades y 18 DoR nuevas están en v1 y las que ya existían pasaron a v2 | PO | **Resuelta el 20-oct.** Las épicas, funcionalidades, historias y DoR v1.3 están publicados en Nexora: 119 documentos (11 épicas, 23 funcionalidades, 62 historias y 23 DoR), iguales byte a byte a los del repo (sha256). Siguen pendientes de aprobación (P-024). En Nexora quedan documentos de la línea v1.2 en otras carpetas (`backlog/tareas` y `gates`); se corrigen aparte |
| P-014 | Qué escribe ATC en tablas de otros fragmentos (por ejemplo `CONTRACT_WARRANTY_CLAIM` en postventa) y cómo se accede a ellas | ADR-001 | Abierta |
| P-015 | Tipos, largos y obligatoriedad de los atributos no clave: salen de los archivos de Drive del v7 | `datos/diccionario.md` | Abierta. Parte de los valores de lista y nombres de columna ya los trae el Excel (columna `fragmentos` de 02_RF_Micro) |
| P-016 | Dónde viven el flujo con actividades, el subtipo, las pausas del SLA y el parámetro de cierre automático (el v7 no tiene tablas para ellos) | ADR-008, `datos/diccionario.md` | Abierta |
| P-017 | Catálogos de tipos, subtipos, áreas y canales: ¿se hereda el de la plataforma actual o se adopta el del PLT-04 y el v7? ¿Cuáles son las combinaciones tipo · subtipo · área del piloto? | ADR-008, `datos/diccionario.md` | Abierta. Sigue como pregunta 1 para el comité en `DECISIONES.md` §5.9 |
| P-018 | Las 58 preguntas abiertas que traen 25 historias de Nexora (lista completa en la sección siguiente): el PO las responde antes de que cada historia pase el DoR | varios (columna «Afecta a») | Abierta. El 20-oct el equipo propuso 27 respuestas (`DECISIONES.md` §5.9); las decide el PO en el comité |
| P-019 | Nexora tiene el documento suelto `historias/HU-DOC-001 HU-ATC-001-registrar-tickets-multicanal-tipificados.md.md` (v0.1, id `HU-ATC-001`, ticket AYB-0001) junto a la `HU-ATC-001` en v1.3: dos historias con el mismo id. El PO decide cuál queda | `historias/` | **Abierta** (sigue en Nexora el 21-oct). El PO la rechaza o el administrador de Nexora la retira; el perfil desarrollador no puede borrar. Repetida en la lista para el PO |

El Líder Técnico decidió el 22-oct lo que D-003 dejaba por verificar: el ADR-014 pasa a ser la adopción de la plataforma corporativa (DT-05, DT-07, DT-08 y DT-10). Que Control de acceso esté disponible en DEV es ahora una dependencia del proyecto (P-026).

## Preguntas abiertas de las historias (P-018)

Salen de «Datos de prueba / analítica» de cada historia (PLT-04) y están **sin responder**. «Afecta a» dice en qué documento del paquete pega la respuesta.

| # | Historia | Pregunta | Afecta a |
|---|---|---|---|
| Q-040-1 | HU-040 | ¿Qué herramienta usa hoy Legal (sistema, Excel, correo)? | ADR-004, DEP-12 |
| Q-040-2 | HU-040 | ¿Rosario es la dueña funcional de la integración? | ADR-004, DEP-12 |
| Q-040-3 | HU-040 | ¿La sincronización es en línea o por lotes? | ADR-004, DEP-12 |
| Q-041-1 | HU-041 | ¿El 8 % es la tasa de interés legal que Legal quiere usar o un referencial? | datos/diccionario.md (exposición), DEP-12 |
| Q-041-2 | HU-041 | ¿Qué señales definen riesgo de denuncia (reincidencia, monto, palabras, abogado)? | datos/diccionario.md (exposición), DEP-12 |
| Q-041-3 | HU-041 | ¿Umbral de alerta? | datos/diccionario.md (exposición), DEP-12 |
| Q-042-1 | HU-042 | ¿Qué plataforma de call center usa hoy el equipo (proveedor y versión)? | ADR-004, DEP-11 |
| Q-042-2 | HU-042 | ¿Expone API o CTI para screen pop y grabaciones? | ADR-004, DEP-11 |
| Q-043-1 | HU-043 | ¿Cuántas áreas y combinaciones tipo-subtipo tiene el piloto? | ADR-008, P-017 |
| Q-043-2 | HU-043 | ¿Quién aprueba los cambios de flujo? | ADR-008, P-017 |
| Q-043-3 | HU-043 | ¿Un paso puede tener aprobación? | ADR-008, P-017 |
| Q-044-1 | HU-044 | ¿La asignación es automática (push) o el gestor de tickets toma el siguiente (pull)? | ADR-008 (push o pull) |
| Q-044-2 | HU-044 | ¿Se mezclan tickets de varias áreas en la misma bandeja? | ADR-008 (push o pull) |
| Q-045-1 | HU-045 | ¿Quiénes pueden marcar el rayo? | ADR-008, operación marcarRayo |
| Q-045-2 | HU-045 | ¿El rayo cambia el SLA o solo el orden? | ADR-008, operación marcarRayo |
| Q-045-3 | HU-045 | ¿Hay un límite por bandeja? | ADR-008, operación marcarRayo |
| Q-046-1 | HU-046 | ¿Cómo se mide la carga (n.º de tickets, ponderado por prioridad, tiempo estimado)? | ADR-008 (medida de la carga), DEP-02 |
| Q-046-2 | HU-046 | ¿Se considera ausencia por vacaciones o turno? | ADR-008 (medida de la carga), DEP-02 |
| Q-047-1 | HU-047 | ¿Quién redacta y aprueba las guías por área? | datos/diccionario.md (guía), P-016 |
| Q-047-2 | HU-047 | ¿Existe hoy un manual de atención que sirva de base? | datos/diccionario.md (guía), P-016 |
| Q-048-1 | HU-048 | ¿Qué proveedor o modelo de IA esta aprobado por TI y Seguridad? | ADR-007, DEP-14 |
| Q-048-2 | HU-048 | ¿Se permite enviar datos del cliente al modelo o solo texto anonimizado? | ADR-007, DEP-14 |
| Q-049-1 | HU-049 | ¿Qué significa «llamar la cuenta»: llamada telefónica (click-to-call) o consultar la cuenta del cliente? | operación llamarCliente, DEP-11 |
| Q-049-2 | HU-049 | ¿Qué campos de búsqueda son obligatorios? | operación llamarCliente, DEP-11 |
| Q-050-1 | HU-050 | ¿Qué sistemas fuente alimentan cada sección (SIGDA/TAXON, Cobranza, Contratos, correo)? | ADR-003, DEP-01, DEP-08 |
| Q-050-2 | HU-050 | ¿Qué secciones ve cada rol? | ADR-003, DEP-01, DEP-08 |
| Q-051-1 | HU-051 | Confirmar a que se refiere «excepción para la consulta de usuario»: ¿cliente no encontrado, permisos especiales o caída del sistema fuente? | ADR-003, P-010 |
| Q-052-1 | HU-052 | ¿Qué expone hoy el motor de José (API, base de datos, reportes)? | ADR-004, DEP-13 |
| Q-052-2 | HU-052 | ¿Quién lo mantiene y con que SLA? | ADR-004, DEP-13 |
| Q-053-1 | HU-053 | ¿Qué repositorios de documentos se indexan (S3, GLI, correo)? | ADR-003 (índice), DEP-06, DEP-14 |
| Q-053-2 | HU-053 | ¿Hay restricciones legales para indexar contratos? | ADR-003 (índice), DEP-06, DEP-14 |
| Q-054-1 | HU-054 | ¿Qué metas diarias tiene cada gestor de tickets? | datos/linaje.md |
| Q-054-2 | HU-054 | ¿El tablero del gestor de tickets es visible para sus pares? | datos/linaje.md |
| Q-055-1 | HU-055 | ¿El correo incluye datos del cliente o solo el enlace al ticket (por DLP)? | seguridad.md (DLP), ADR-009 |
| Q-055-2 | HU-055 | ¿Quién es el líder de cada gestor de tickets (maestro local en Etapa 1)? | seguridad.md (DLP), ADR-009 |
| Q-056-1 | HU-056 | ¿El disparador son 3 cuotas consecutivas o acumuladas? | datos/estados.md, DEP-08 |
| Q-056-2 | HU-056 | ¿Se cuenta desde el vencimiento o desde el reclamo? | datos/estados.md, DEP-08 |
| Q-056-3 | HU-056 | ¿se suspende la resolución hasta responderlo? | datos/estados.md, DEP-08 |
| Q-056-4 | HU-056 | ¿El contrato exige carta notarial? | datos/estados.md, DEP-08 |
| Q-057-1 | HU-057 | ¿Qué significa «cancelación del servicio»: resolución del contrato, suspensión de beneficios u otro? | datos/estados.md, DEP-08 |
| Q-057-2 | HU-057 | ¿Qué plazo de regularización se da al cliente? | datos/estados.md, DEP-08 |
| Q-057-3 | HU-057 | ¿Legal aprueba el texto de la alerta? | datos/estados.md, DEP-08 |
| Q-058-1 | HU-058 | ¿Quién es el responsable de cada proyecto y su supervisor (fuente maestra)? | DEP-15 |
| Q-058-2 | HU-058 | ¿La carta es un correo formal o un PDF firmado? | DEP-15 |
| Q-058-3 | HU-058 | ¿Qué acción se espera del responsable del proyecto? | DEP-15 |
| Q-059-1 | HU-059 | ¿Qué personas ingresan (clientes, interesados, contratistas, proveedores)? | datos/diccionario.md (formularios) |
| Q-059-2 | HU-059 | ¿Se registra también la salida? | datos/diccionario.md (formularios) |
| Q-059-3 | HU-059 | ¿Todo ingreso es un ticket o solo los que traen una solicitud? | datos/diccionario.md (formularios) |
| Q-059-4 | HU-059 | ¿Hay conectividad en el proyecto? | datos/diccionario.md (formularios) |
| Q-060-1 | HU-060 | Confirmar el alcance de «Buses entrega fest»: ¿reserva de cupo del cliente, logística de buses con el proveedor o ambas? | datos/diccionario.md (reserva de cupo) |
| Q-060-2 | HU-060 | ¿Cuántos acompañantes se permiten? | datos/diccionario.md (reserva de cupo) |
| Q-060-3 | HU-060 | ¿Se asocia al proyecto y a la fecha de entrega? | datos/diccionario.md (reserva de cupo) |
| Q-064-1 | HU-064 | ¿Qué tipos y subtipos se habilitan al cliente en el piloto? | ADR-011, P-008, P-017 |
| Q-064-2 | HU-064 | ¿El código de acceso va al correo, al celular o a ambos? | ADR-011, P-008, P-017 |
| Q-065-1 | HU-065 | ¿Se muestra el nombre del área o un nombre genérico («Atención al cliente»)? | ADR-011, datos/linaje.md |
| Q-066-1 | HU-066 | ¿Cuántos días hábiles se espera la confirmación antes del cierre automático? | datos/estados.md (cierre automático) |
| Q-067-1 | HU-067 | ¿Qué áreas forman la sede del piloto y quién las ordena? | ADR-010 |
| Q-067-2 | HU-067 | ¿El visor se proyecta en una pantalla de la sala de operaciones? | ADR-010 |

## Preguntas abiertas de las funcionalidades (P-018)

Cada una de las 23 funcionalidades publicadas en Nexora trae su pregunta P-01 en la sección 7 («Preguntas abiertas»); ninguna tiene dueño ni fecha límite. Varias repiten las de las historias (tabla anterior); aquí van completas para que ninguna se pierda. Una pregunta que bloquea G4 deja la funcionalidad en NO READY.

| Funcionalidad | Nombre | Preguntas |
|---|---|---|
| FT-01 | Registro multicanal y tipificación | ¿La numeración reinicia por año? ¿Cuál es el formato del N.º visible al cliente (prefijo por RUC)? ¿Quién registra a un interesado sin rol contractual (ACT-003)? |
| FT-02 | Ciclo de vida, interacciones e hitos | ¿Qué tipos de archivo y tamaño máximo se aceptan como evidencia? ¿Cuánto tiempo después de RESOLVED pasa a CLOSED si el cliente no responde? |
| FT-03 | Derivación, reasignación y casillero | ¿Quién puede reasignar en bloque: solo el supervisor o también el jefe de área? ¿Hay un catálogo cerrado de motivos de derivación? |
| FT-04 | Motor SLA y alertas | ¿Se pausa el SLA en PENDING_CUSTOMER? ¿Cuál es el horario hábil por sede? ¿Por qué canal llegan las alertas (correo, notificación en consola)? |
| FT-05 | Libro de Reclamaciones | ¿El libro virtual actual de la web se integra o se reemplaza? ¿Quién firma la carta de respuesta por cada razón social? |
| FT-06 | Apelaciones internas e INDECOPI | ¿Cuál es el plazo interno para resolver la segunda instancia? |
| FT-07 | Gate de derivación a Eje 3 y handoff | ¿Qué rol puede retirar una señal de conflicto marcada por error? ¿El historial de pagos se adjunta o solo se enlaza? |
| FT-08 | Mesa SGD: recepción, activación y riesgo | ¿Cuál es el plazo de SLA de cada línea? ¿Qué criterios y ponderaciones tiene la matriz de riesgo? ¿Formato del Código Único? |
| FT-09 | Escalamiento, vinculación y cierre tipificado | ¿Umbrales de tiempo entre cada nivel de escalamiento? ¿Qué criterio define que dos casos «coinciden en hechos»? |
| FT-10 | Reclamos de garantía postventa | ¿Periodos de cobertura por tipo de defecto? ¿La inspección la registra Postventa o un tercero? |
| FT-13 | Encuesta post-atención | ¿Canal de envío de la encuesta (WhatsApp, correo, SMS)? ¿Qué pasa si el ticket se reabre después de responder la encuesta? |
| FT-14 | Torre de Control CX | ¿Quiénes reciben el informe diario? ¿Qué frecuencia de actualización se considera «tiempo real» (≤ 1 min)? |
| FT-15 | EntregaFest: contención en vivo | ¿El registro lo hace el moderador o el personal de apoyo? ¿Funciona sin conexión en el recinto? |
| FT-16 | Integración con Legal y prevención de denuncias | ¿Qué herramienta usa hoy Legal? ¿La tasa del 8 % es la que Legal quiere usar? ¿Qué señales definen riesgo de denuncia? |
| FT-17 | Integración con la plataforma del call center | ¿Qué proveedor y versión de call center se usa? ¿Expone API o CTI para screen pop y grabaciones? |
| FT-18 | Bandeja orquestadora y flujos por área | ¿Asignación automática (push) o el gestor toma el siguiente (pull)? ¿Quiénes pueden marcar el rayo? ¿Cómo se mide la carga? |
| FT-19 | Asistencia al gestor: guía e IA | ¿Qué proveedor de IA aprueban TI y Seguridad? ¿Quién redacta y aprueba las guías por área? |
| FT-20 | Búsqueda y consulta 360 del cliente | ¿Qué significa «llamar la cuenta»? ¿Qué sistemas alimentan cada sección? ¿Qué repositorios de documentos se indexan? |
| FT-21 | Productividad y notificaciones del gestor | ¿Qué metas diarias tiene cada gestor? ¿El correo incluye datos del cliente o solo el enlace? |
| FT-22 | Resolución de contrato por morosidad | ¿3 cuotas consecutivas o acumuladas? ¿Se suspende la resolución con un reclamo abierto? ¿Qué plazo se da para regularizar? |
| FT-23 | Formularios simples: ingreso al proyecto y Entrega Fest | ¿Todo ingreso es un ticket? ¿«Buses entrega fest» es reserva del cliente o logística con el proveedor? |
| FT-24 | Autogestión de tickets del cliente en Mi Portal | ¿Con qué dato inicia sesión el cliente (DNI + código al correo o celular)? ¿Qué tipos y subtipos puede registrar el cliente? ¿Cuántos días tiene para confirmar la solución antes del cierre automático? |
| FT-25 | Visor del proceso 3D (operación en vivo) | ¿Qué áreas y en qué orden se muestran en la sede? ¿El visor va en pantalla grande de la sala de operaciones? ¿Se activa el nivel y XP del equipo en el piloto? |

## Sugerencias del equipo (no son parte de los PLT ni de las opciones de stack de D-001)

- Arquitectura de microservicios como camino de crecimiento (ADR-001 la deja abierta).
- Que el módulo Clientes reemplace a SIGDA/TAXON detrás del mismo contrato (ADR-003).


## Pendientes para el PO (21-oct)

Las decide o las destraba el PO. Ninguna está aplicada en el paquete v1.3.

| # | Pendiente | Qué dice cada fuente | Quién decide | Estado |
|---|---|---|---|---|
| P-020 | **D-12 de la rama de Daniel** (`prototipo-polar`): saca HU-ATC-048 (IA al gestor) y HU-ATC-053 (búsqueda en documentos) del alcance de la Etapa 1 | La tomó una sesión de trabajo de esa rama el 19-oct, no el PO. Los documentos del PO v1.3 cuentan las dos historias en la Etapa 1 como **flexibles**, y este registro no la recoge. El backlog de tareas publicado en Nexora (línea v1.2) sí la aplica, y además cita D-09 y D-10 de esa rama, que tampoco están aquí. Antecedente: `DECISIONES.md` §5.10 | PO | **No aplicada.** Si el PO la confirma, cambian el alcance flexible (R-01), FT-ATC-19, FT-ATC-20, DEP-14 y las horas |
| P-021 | **El modelo de datos tiene una FK a `PARTY` y el ADR-03 del PO dice que el cliente no se copia** | En Nexora, `datos/er.md` y ADR-003 (modelo v7) guardan en `SVC_TICKET` el `PartyID` como FK a `PARTY`, junto con `ContractID` y `UnitID`. El PO fija SIGDA/TAXON como única fuente del dato: ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01, con «0 registros paralelos fuera de SIGDA/TAXON». Si `PARTY` es una réplica, es un registro paralelo. Además, una FK obligatoria impide el ticket de un interesado que no está en el maestro (HU-ATC-051) | El PO confirma la regla. El líder técnico, con Gobierno de Datos o el CDO, decide la fuente viva y si `PartyID` admite nulos (P-010) | **Resuelta en lo técnico por DT-06** (22-oct). Falta que el PO reescriba el ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01 («0 registros paralelos fuera de SIGDA/TAXON») y diga cómo se relaciona `PARTY` con SIGDA/TAXON. El ticket del interesado sin `PARTY` se resuelve creando su `PARTY` como no verificada (PJ-05 R29, según el Líder Técnico); quién la escribe sigue abierto (P-031) |
| P-022 | **El Excel (3) no coincide con los PDF v1.3** | (a) No tiene RF-SVC-064 a 067, que el PLT-03 da «por registrar en el Excel», ni RN-SVC-044 y 045, que citan el PLT-03 y el PLT-04. (b) RN-SVC-043 y la leyenda dicen «Etapa 1 · salida 30-oct-2026», y también la columna `etapa_nota` de 02_RF_Micro, 03_RNF y 04_Trazabilidad. Los PDF ponen el desarrollo del 21-oct al 03-nov, con UAT y Go/No-Go el 03-nov; 10 historias terminan después del 30-oct. (c) RF-SVC-001 a 039 tienen la prioridad en «pendiente», mientras el PLT-03 y el PLT-04 dan Debe, Debería o Podría. La propuesta celda a celda va en un documento aparte para el PO (`correcciones-excel-v1.3.md`) | PO (dueño del Excel) | Abierta |
| P-019 | **Duplicado `HU-DOC-001` en Nexora** (ver arriba) | Dos documentos con el id `HU-ATC-001` | PO (rechazar) o administrador de Nexora (retirar) | Abierta |
| P-023 | **PJ-06 no tiene ítems de trabajo** | Nexora tiene 0 ítems en el proyecto: ni épicas, ni historias, ni tareas. Sin ítems no se puede registrar avance con el commit ni vincular PR, y el desarrollo empezó hoy | PO, project manager o administrador de Nexora (el perfil desarrollador no crea ítems) | Abierta |
| P-024 | **No hay ningún documento aprobado** | En Nexora están todos pendientes: épicas, funcionalidades, historias, DoR, ADR, arquitectura, datos, análisis, roadmap y gates. No consta en Nexora la aprobación que piden los criterios de salida de la etapa de diseño del PLT-01 v1.3: PLT-02, 03 y 04 aprobados el 19-oct, y ADR-01 a 11 aprobadas el 20-oct (acuerdo 6 del PLT-05). Con la regla del equipo (G3 y G4 aprobados, y G2 si hay pantallas, y las 62 historias tienen `ui: true`), hoy no se puede construir ninguna historia | PO (negocio y análisis), líder técnico (ADR, arquitectura y datos), líder técnico con project manager (DoR) y quien aprueba cada gate. El agente nunca aprueba | Abierta |

## Pendientes que salen de las decisiones del 22-oct

| # | Pendiente | Quién decide | Estado |
|---|---|---|---|
| P-025 | **Horas de DT-02.** Outbox, publicador, proyector y bus no tienen horas en el plan (243 h de 252 h: holgura de 9 h). Hay que sumar las bitácoras HMAC (5 tablas), el calendario de días hábiles, la caché, el circuit breaker, ShedLock y las reglas ArchUnit de frontera. Estimar y decidir qué sale del alcance o cuántas horas se suman | Líder Técnico y PO | Abierta |
| P-026 | **Control de acceso (PJ-05) disponible en DEV** (dependencia nueva, propuesta `DEP-16`; la numeración del PLT-01 salta de DEP-01 a DEP-15): emisor, clientes OAuth de la consola, Mi Portal y la API, catálogo de ATC aprobado, gestores invitados, política de API Management con `aud`, y las API que ATC consulta (líder de un área, gestores con un rol, disponibilidad). Responsable: área de Roles y Permisos (Sony Montoya). Reemplaza a DEP-02 (carga de RR. HH.). Fecha comprometida: sin fijar. Mientras tanto, en local, el emisor de pruebas de `aybar-access-control/herramientas/` | Área de Roles y Permisos | Abierta |
| P-027 | **Historias y textos del PO que cambian con DT-01, DT-03, DT-04 y DT-06:** PLT-01 §1 y PLT-05 §4.1 (stack); HU-064 CA-01 (DNI y código propio de 6 dígitos, 5 min, 3 intentos); HU-055 CA-03 y Q-055-2 (líder en el maestro local); HU-045, HU-046, HU-008, HU-054 y HU-058 (líder, supervisor, carga, responsable de proyecto, ahora por consulta a Control de acceso); ADR-03, RN-SVC-026, RNF-INT-007 y DEP-01 (fuente del cliente) | PO | Abierta |
| P-028 | **Catálogo de roles de ATC** (`arquitectura/roles-y-permisos-atc.md`: `ATC_AGENT`, `ATC_SUPERVISOR`, `ATC_LEGAL`, `ATC_POSTVENTA`, `ATC_ADMIN_FUNCIONAL`). Por cerrar: si «líder» (HU-045) es un rol o la jefatura que administra Control de acceso; el formato del permiso en el token; quién necesita rol global y quién por empresa (11 razones sociales); qué gestores necesitan `PROSPECT_VALIDATOR`; el tipo de ticket «correo distinto» (cambia alcance y horas) | Líder Técnico, PO y Control de acceso | Abierta |
| P-029 | **Documentos duplicados en Nexora:** `gates/G0.md`, `G1.md`, `G3.md` y `G4.md` sueltos (repiten el id de `gates/AYB-0001/`) y `HU-DOC-001`. El perfil desarrollador no puede borrar ni rechazar | Líder Técnico (gates), PO (historia) o administrador de Nexora | Abierta. Se amplía P-019 |
| P-030 | **Reglas que el Excel no tiene.** La revisión del 22-oct cuenta RN-SVC-044, RN-SVC-045, RNF-SEC-009 y RNF-SEC-010 como ausentes. En el Excel (3), hoja `03_RNF`, **RNF-SEC-009 y 010 sí están** (capa feedback de la presentación, oct-2026). **RN-SVC-044 y 045 no están** (P-022). Confirmar qué Excel usó el Líder Técnico | Líder Técnico y PO | Abierta |
| P-031 | **Tablas y accesos nuevos en la base única:** `shedlock` (DT-08); outbox propio si `INTG_OUTBOX_EVENT` no sirve (ADR-013); tablas de flujo, subtipo y versión (P-016); `SVC_AI_SUGGESTION_LOG`; quién escribe el `PARTY` del interesado no verificado (P-014). Hallazgos H-01, H-02 y H-03 del acta F4 | Gobierno de Datos (Data Chief) | Abierta |
| P-032 | **Huecos del SDK para estas decisiones:** formato de tópico y de nombre de evento (ADR-013); `aybar-starter-audit` publica solo a log, archivo o S3/MinIO, sin Azure Blob; rotación de la llave HMAC en Key Vault (la versión de la llave debe poder leerse en cada hash); autenticación del broker con Event Hubs (SASL); `aybar-starter-data` es de solo lectura y el proyector necesita su propia credencial de escritura | Líder Técnico y equipo del SDK | Abierta |

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| v3 en Nexora (0.1) | 2026-10-20 | Jesús (Dev 2), con IA | D-001 a D-008 y P-001 a P-019, con las preguntas abiertas de historias y funcionalidades |
| 0.2 | 2026-10-21 | Brayan (Dev 1), con IA | Se conservan todas las decisiones y pendientes y se añade el estado al 21-oct. D-001 pasa a «abierta» con sus dos opciones. P-012 queda resuelta en la parte de RF por la v1.3. P-011 tiene el alcance en los PLT v1.3 y la aprobación pendiente. P-013 queda resuelta el 20-oct. Se añaden P-020 a P-024 para el PO y se remite a `DECISIONES.md` §5.9 a 5.11 |
| 0.3 | 2026-10-22 | Jesús (Dev 2), con IA | Registra DT-01 a DT-10 del Líder Técnico (revisión del 22-oct). Cierra D-001, P-001 a P-004 (P-004 parcial), P-006, P-008 a P-010 y deja P-021 resuelta en lo técnico. Deja abiertas P-005 y P-007. Añade P-025 a P-032 y corrige que RNF-SEC-009 y 010 sí están en el Excel (3) |

Generado por IA: borrador completo. Versión base de Nexora (v3, de Jesús, 20-oct), con el estado actualizado a la v1.3 del PO (Etapa 1) por Brayan con IA (Claude, 21-oct-2026). Texto adaptado al alcance de la Etapa 1 (se omiten las frases que remiten a fases posteriores). El agente no decide ni aprueba: las decisiones abiertas siguen abiertas. — Revisado por: (pendiente)

Actualizado el 22-oct-2026 por Jesús (Dev 2) con IA (Claude): registro de DT-01 a DT-10 según la revisión del Líder Técnico, sin cambiar lo que él decidió. — Revisado por: (pendiente)
