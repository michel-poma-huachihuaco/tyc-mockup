# Correos para pedir la nueva revisión del Líder Técnico (26 y 27-oct-2026)

Borradores listos para enviar. **No se envió ninguno.** Los envía Brayan Hurtado. Todas las referencias (ED, P, DEP, R) están en
`paquete-definir-etapa1-v1.3/analisis/decisiones.md` (0.9). El correo de formalización de G3 no va aquí: lo envía el Líder Técnico
al aprobar (revisión del 22-oct, §4).

Estado al 27-oct: todo está publicado en Nexora, pendiente de firma, y la tabla del correo 2 tiene la versión y la huella que
devolvió Nexora. Orden: enviar el 1 y el 2 el mismo día (el 2 dice que el 1 salió hoy); después el 3, el 4 y el 5; anotar la hora
del 1 en `decisiones.md`, sección «Entregables de Control de acceso para ATC».

---

## 1. A Sony Montoya (Roles y Permisos, PJ-05) · copia: Jose Jara, Eddie Huamaní

**Asunto:** ATC (PJ-06): solicitud de entregables de la DEP-16 e información de decisiones de ATC

Hola, Sony:

ATC consume la identidad y los permisos de Control de acceso (decisiones DT-03 a DT-05 del Líder Técnico). Te pedimos, con fecha
comprometida para **DEV, QA y PRE** (la UAT del 03-nov es en PRE):

1. **Cliente `CONFIDENTIAL` de ATC** creado con el script de TI (D-223) y con el rol de cliente `CATALOG_REGISTRAR` ya otorgado
   (su fila en `IDN_OAUTH_CLIENT_SCOPE`), porque la ruta para otorgarlo sigue en propuesta (D-171). Con él cargamos el catálogo por
   las rutas del ADR-021: 27 opciones, 8 roles, 65 permisos y 3 incompatibilidades. `ATC_EVENT` y 4 opciones sin operación en la
   Etapa 1 irán en una solicitud posterior.
2. **Clientes `PUBLIC`** de la consola y de Mi Portal con su `redirect_uri` por ambiente, y `aybar-atc` en
   `AYBAR_EMISOR_SERVICIOS_DESTINO` del emisor de cada ambiente.
3. **Aprobación del catálogo:** 103 tareas de `ROLE_IT_ADMIN`.
4. **Invitación de los gestores** como cuentas `EMPLOYEE` con sus roles, y `PROSPECT_VALIDATOR` para los supervisores de la cola `ATC`.
5. **Permiso de lectura por columna sobre `IDN_USER_ACCOUNT`** (`UserAccountID`, `PartyID`, `AccountTypeID`, `AccountStatusID` y
   `Username`) para el rol `app_atc_servicio`, con el visto bueno del dueño de la tabla. Como salida definitiva, un claim `party_id`
   en el token.
6. Opcional: que la cuenta que nace por DNI reciba el rol `CUSTOMER`. Mientras no, Mi Portal admite la cuenta `CUSTOMER` activa sin el rol.

Si Control de acceso no está en PRE el lunes 02-nov a mediodía, la UAT corre con el emisor de pruebas de Control de acceso desplegado en PRE y el PO
decide el Go/No-Go. Mientras Control de acceso no esté en QA, los E2E de QA usan ese mismo emisor de pruebas.

Para tu información, estas son las decisiones de ATC (ED-01 a ED-09). Si no hay objeción en 48 h hábiles, se aplican:

- ED-01: la persona del token sale de `IDN_USER_ACCOUNT` (punto 5).
- ED-02: autorizamos por rol del token; `GET /api/v1/mi/permisos/{codigoOpcion}` solo en la consola, para mostrar u ocultar acciones.
- ED-03: los gestores y líderes salen de datos de ATC y de `ATC_SUPERVISOR`; no pedimos una API de líderes.
- ED-04: `MAE_AREA` es solo la cola de atención.
- ED-05: ATC no crea `PARTY`; el interesado queda «sin cliente vinculado» hasta que se autorregistra.
- ED-06: `aud` = `aybar-atc`.
- ED-07: catálogo en los lotes del ADR-021 (punto 1).
- ED-08: mientras tanto, emisor de pruebas en local, DEV y QA; en PRE, solo con el criterio de corte de la UAT; en producción, nunca.
- ED-09: los casos de identidad de prospectos entran como ticket «Validación de identidad (prospecto)» en la cola `ATC` y se
  resuelven en la consola de Control de acceso (valida `PROSPECT_VALIDATOR`; suspende `IT_ADMIN`).

Gracias.

Brayan

---

## 2. A Jose Jara (Líder Técnico) · copia: Eddie Huamaní, Jesús Chávez, Michel Poma, Daniel David Lorenzo Ramos

**Asunto:** ATC (PJ-06): correcciones a su revisión del 22-oct, publicadas en Nexora para su revisión

Hola, Jose:

Publicamos en Nexora (PJ-06, apartado Tiketes) las versiones que corrigen su revisión del 22-oct. Todas están pendientes de su
firma; ninguna está aprobada.

| Documento | Nexora (versión · huella) |
|---|---|
| `analisis/decisiones.md` | v9 · `81ed2e4807db` |
| `adr/ADR-001` | v9 · `dbcfe28f8bc6` |
| `adr/ADR-002` | v9 · `1c7da938d901` |
| `adr/ADR-003` | v9 · `421b79732887` |
| `adr/ADR-004` | v8 · `96eeaba8eaa8` |
| `adr/ADR-005` | v10 · `66f86838446a` |
| `adr/ADR-006` | v9 · `1795ccef9aea` |
| `adr/ADR-007` | v9 · `535d42b00118` |
| `adr/ADR-008` | v10 · `c4af203a1800` |
| `adr/ADR-009` | v9 · `823ceba1a296` |
| `adr/ADR-010` | v8 · `abf679378025` |
| `adr/ADR-011` | v10 · `8210f5824e9c` |
| `adr/ADR-012` | v9 · `56089302232c` |
| `adr/ADR-013` | v9 · `b3c0e288ae17` |
| `adr/ADR-014` | v9 · `c5a216ae44f2` |
| `arquitectura/aybar-atc.openapi.yaml` | v9 · `f54e485e77e9` |
| `arquitectura/seguridad.md` | v8 · `c75658c09729` |
| `arquitectura/roles-y-permisos-atc.md` (C-02) | v5 · `c31483aa108c` |
| `arquitectura/diagrama-arquitectura.md` | v8 · `7a4c0a6e2be8` |
| `arquitectura/costo-cloud.md` | v6 · `50572c27de45` |
| `arquitectura/migracion-y-reversion.md` | v6 · `bbae33b87c44` |
| `datos/acta-validacion-arquitectura-datos.md` (acta F4) | v11 · `39e973e9ada4` |
| `datos/registro-de-tablas.md` (C-11) | v4 · `662c14dc32ff` |
| `gates/AYB-0001/G3.md` | v5 · `3bd7775de9e6` |
| `gates/AYB-0001/G4.md` | v5 · `6e2e955d4a94` |
| `roadmap/RMP-001-roadmap-aybar-atiende.md` (DEP-16, C-12) | v7 · `038d0558d3df` |
| `roadmap/alcance-diferido.md` | v2 · `d1f6951b005d` |
| 23 DoR y 11 archivos de `backlog/tareas/` | v4 a v6 |

La huella es el comienzo del sha256; la completa está en el índice de Nexora.

**Cómo lo revisamos.** Antes de enviárselo hicimos dos revisiones internas del equipo (26-oct), con IA y con los criterios de su
revisión: una técnica y otra de coherencia. Los documentos las citan como «revisión interna del equipo», y a sus observaciones
como O-01 a O-29: no son suyas. Lo único suyo es la revisión del 22-oct, con DT-01 a DT-10.

Lo principal:

- **Sus decisiones:** DT-01 a DT-10 registradas con su nombre y fecha; ADR-005, 009, 011, 012, 013 y 014 reescritos y las
  condiciones de los demás aplicadas. Las 14 ADR tienen «Revisado por: Brayan Manuel Hurtado Paucar, 26-oct-2026».
- **Decisiones del equipo:** ED-01 a ED-28 se las proponemos; ninguna cambia una DT. Se apartan de lo que usted pidió: ED-01
  (leemos `IDN_USER_ACCOUNT`; el permiso se pide a su dueño), ED-02 (por rol, no por permiso), ED-03 (gestores desde la bitácora de
  ATC), ED-05 (no se crea `PARTY`) y ED-13 (la norma en lugar de Legal).
- **Plazo del Libro:** la Ley 31435 fija 15 días hábiles improrrogables (verificado en El Peruano y en el Archivo Digital del
  Congreso). La prórroga de HU-013 queda deshabilitada por parámetro, con una nota en la historia (ED-28).
- **Prospectos (C-06):** entra en la Etapa 1 el tipo «Validación de identidad (prospecto)» con 4 subtipos, sin HU ni horas (ED-09).
- **Contrato:** 69 operaciones (63 en la Etapa 1): las 57 HU de la Etapa 1 tienen operación.
- **Control de acceso (C-12):** hoy pedimos a Sony Montoya los entregables de la DEP-16, con usted en copia. Si Control de acceso no
  está en PRE el 02-nov a mediodía, la UAT corre con el emisor de pruebas en PRE y el PO decide el Go/No-Go (R-12).
- **Horas (P-025):** 28 h técnicas de DT-02 (DT02-T01 a T06: Brayan 9, Jesús 4, Michel 9 y Daniel 6); salen HU-037, 038, 039, 048
  y 053 (16 h), el R-01 del PO, que puede revertirlo. Etapa 1: 57 HU, 227 h + 28 h = 255 h. **Sobrecosto real: 7 h** sobre 252 h de
  capacidad (con las 4 h de la reestimación de ADR-009); el PO lo acepta al firmar G4.
- **Duplicados en Nexora:** los 4 gates sueltos y `HU-DOC-001` tienen una versión «RETIRADO»; le pedimos a Eddie que los borre.
- Diferencias con el PO: ED-19. RN-SVC-044 y 045 se citan por su criterio de origen (ED-18).

Le pedimos dos cosas:

1. **Firma del Data Chief en el acta F4.** En Nexora, `datos/acta-validacion-arquitectura-datos.md` solo pide la firma del Líder
   Técnico. Para que Enrique Albán emita el acta (§4 de su revisión), ¿puede pedir al administrador de Nexora que lo agregue como
   firmante? Nuestro perfil no configura firmas.
2. **Lo que quedó de su lado el 22-oct:** la dispensa M0 con el Data Chief y el correo de formalización del G3.

Gracias.

Brayan

---

## 3. A Eddie Huamaní (PO) · copia: Jose Jara

**Asunto:** ATC (PJ-06): lo que le toca aceptar al firmar G4

Hola, Eddie:

1. **P-025, su R-01:** para dar cabida a las 28 h técnicas que pidió el Líder Técnico, el equipo activó el recorte flexible que usted
   previó (salen HU-037, 038, 039, 048 y 053; 16 h). Usted conserva la decisión de revertirlo. **Sobrecosto real: 7 h** (cálculo en
   `roadmap/RMP-001` §1); le pedimos aceptarlo al firmar G4 o decidir qué más sale en el control del 29-oct.
2. **ED-26 y ED-19:** las respuestas a sus 58 + 23 preguntas y las diferencias con sus textos son propuestas que usted acepta o cambia
   con su firma de G4.
3. **Plazo legal (HU-013):** la Ley 31435 fija 15 días hábiles improrrogables; la prórroga queda deshabilitada (ED-28). Su texto no
   cambia: la historia lleva una nota.
4. **Prospectos:** el tipo «Validación de identidad (prospecto)» entra en la Etapa 1, sin horas (ED-09).
5. **UAT del 03-nov:** si Control de acceso no está en PRE el 02-nov a mediodía, corre con el emisor de pruebas y usted decide el
   Go/No-Go (R-12).
6. **Nexora:** crear los ítems de PJ-06 (P-023) y borrar los 5 documentos retirados.

Gracias.

Brayan

---

## 4. A Legal · copia: Jose Jara

**Asunto:** ATC (PJ-06): Libro de Reclamaciones, lo que aplicamos (informativo)

Hola:

Para su conocimiento; solo responda si ve una objeción:

1. **Plazo:** 15 días hábiles improrrogables desde el registro (Ley 31435, art. 24.1 del Código; D.S. 101-2022-PCM, arts. 6 y 6-B).
   El plan pedía una prórroga única de 15 días (HU-013): no se aplica y queda deshabilitada. Si conocen un supuesto en que la ley
   permita ampliar, avísennos.
2. **Retención:** 2 años desde el registro (art. 12 del Reglamento), en almacenamiento inmutable, y retención legal mientras el caso
   siga en apelación, ante INDECOPI o en la Mesa SGD.
3. **Hoja:** los datos del Anexo I del Reglamento.

Gracias.

Brayan

---

## 5. A Enrique Albán (Data Chief) · copia: Jose Jara, Jesús Chávez

**Asunto:** ATC (PJ-06): acta F4 y dispensa M0, listas para su firma

Hola, Enrique:

- **Acta F4** (`datos/acta-validacion-arquitectura-datos.md`): lista para su firma, con los hallazgos resueltos.
- **Cambios al v7** (ED-23): `shedlock`, `SVC_OUTBOX_EVENT`, `IntegrityHash` en las 5 bitácoras, `flyway_schema_history_atc`, las
  tablas del flujo y `SVC_TICKET_PROSPECT` (se borra al vincular o a los 30 días hábiles del cierre; ED-05). `SVC_AI_SUGGESTION_LOG`
  no se crea en la Etapa 1.
- **Acceso entre dominios:** lectura por columna de `IDN_USER_ACCOUNT` (ED-01), que pedimos a su dueño.
- **Custodia de ATC:** `ORG_COMPANY_ADDRESS`, `ORG_PRODUCT` y `GOV_DOCUMENT_REPOSITORY` (ED-11).
- **Deuda registrada (DEU-01):** la FK diferida en QA, PRE y producción mientras falte la tabla ajena; se cierra a más tardar el
  30-nov (ED-11).
- **Decididas:** dueño de migración (P-043, ED-11) y tipos y largos (P-015, ED-16).
- **Dispensa M0:** la pidió el Líder Técnico el 22-oct; las 14 ADR dicen «requiere dispensa (solicitada)».
- **Firma en Nexora:** hoy el acta solo pide la firma del Líder Técnico. Le pedimos a Jose que el administrador de Nexora lo agregue
  a usted como firmante; si al entrar no ve la opción de firmar, es por eso.

Gracias.

Brayan

---

## Lo que tiene que hacer Brayan

- Hecho: publicado en Nexora (26-oct por la noche y 27-oct, `PLAN-NEXORA.md`), con la tabla del correo 2 completa.
- Enviar el 1 y el 2 el mismo día, y después el 3, el 4 y el 5; anotar la hora del 1 en `decisiones.md`.
- «Revisado por»: las 14 ADR ya lo tienen; faltan 145 documentos y las 308 tareas. Lo pone quien lea cada uno; se propone a Jesús
  como segundo revisor de lo que escribió Brayan.

Historial: 0.3 · 2026-10-27 · Brayan Hurtado, con IA · Correo 2 rehecho: corrige la revisión del 22-oct (las del 26-oct fueron internas del equipo), tabla con la versión y la huella de Nexora y pedido de la firma del Data Chief en el acta; correo 5 con el aviso de la firma.
0.2 · 2026-10-26 · Brayan Hurtado, con IA · Rehechos tras la revisión interna del equipo: horas de P-025 (28 h, opción A, sobrecosto real de 7 h), todas las P como decisiones del equipo, permiso sobre `IDN_USER_ACCOUNT`, Ley 31435, tipo de ticket de prospectos, criterio de la UAT, Daniel Lorenzo en copia y aviso de publicación con lo publicado.
