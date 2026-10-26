# Correos para cerrar la revisión del Líder Técnico (26-oct-2026)

Borradores listos para enviar. **No se envió ninguno.** Los envía Brayan Hurtado (o Jesús Chávez) por el canal del equipo.
Al enviarlos, anotar la fecha y el canal en `paquete-definir-etapa1-v1.3/analisis/decisiones.md`, sección «Pedidos al área de Roles y
Permisos». Todas las referencias (P-0xx, ADR, DEP) están en ese paquete y en Nexora (PJ-06).

---

## 1. A Sony Montoya (Roles y Permisos, PJ-05) · copia: Jose Jara

**Asunto:** ATC (PJ-06): pedidos y preguntas para integrar con Control de acceso

Hola, Sony:

El Líder Técnico decidió el 22-oct que ATC consume la identidad y los permisos de Control de acceso (DT-03 a DT-05). Para cumplirlo
necesitamos del área:

1. El cliente con `CATALOG_REGISTRAR` para registrar el catálogo de ATC por el ADR-021 de PJ-05 (catálogo en
   `arquitectura/roles-y-permisos-atc.md`: 9 roles, 31 opciones, 75 permisos). P-039.
2. Los clientes OAuth de la consola de ATC, de Mi Portal y de la API, y la política de API Management con su `aud`. P-038, P-039.
3. La aprobación del catálogo de ATC, para que los roles `ATC_*` lleguen en el token. P-028, P-034.
4. La invitación de los gestores de ATC como cuentas `EMPLOYEE` con sus roles, y `PROSPECT_VALIDATOR` para los que nombra
   `analisis/proceso-atencion-prospectos.md`. P-040, P-041.
5. **La fecha comprometida de Control de acceso en DEV (DEP-16).** ATC la necesita desde el 21-oct (HU-ATC-001). P-026, P-040.

Y estas preguntas, que salen del paquete aprobado de PJ-05 (cada una tiene su cita en `decisiones.md`):

- **P-033:** el token no trae `PartyID`. ¿Lo pueden agregar como claim, o hay una consulta para saber el cliente del usuario autenticado?
- **P-034:** el token trae roles, no permisos. ¿Autorizamos por rol o consultamos `GET /api/v1/mi/permisos/{codigoOpcion}`?
- **P-035:** no hay API con `client_credentials` para obtener el líder de un área ni los gestores por rol (hoy exigen `ROLE_IT_ADMIN`).
  ¿La pueden exponer, y para cuándo?
- **P-036:** ¿confirman que la tabla de áreas (`NEX_COMPANY_AREA`) no existe y que Control de acceso no administra jefaturas?
- **P-037:** ¿confirman que ATC no crea la `PARTY` del interesado y que la autoregistra Control de acceso?
- **P-038:** D-44 y D-224 dan valores distintos para la audiencia. ¿Cuál es el `aud` de ATC?
- **P-039:** la ruta para otorgar `CATALOG_REGISTRAR` está «propuesta». ¿Cómo la recibimos mientras tanto?
- **P-041:** los casos manuales de prospectos (D-84 y D-291): ¿cómo los deriva el área a ATC?

Gracias.

---

## 2. A Jose Jara (Líder Técnico) · copia: Jesús Chávez, Michel Poma, Eddie Huamaní

**Asunto:** ATC (PJ-06): corrección de la revisión del 22-oct, lista para su revisión en Nexora

Hola, Jose:

Publicamos en Nexora las versiones nuevas que atienden su revisión del 22-oct. Todo queda pendiente de su firma.

- **Decisiones:** DT-01 a DT-10 están registradas con su nombre y fecha en `analisis/decisiones.md`, y quedan cerradas D-001, D-003,
  P-001 a P-004, P-006, P-008 a P-010 y P-021.
- **Las 14 ADR:** las 6 que no pasaban están reescritas. Las 8 con condiciones las cumplen. Las 14 tienen los 6 puntos que usted pidió:
  dispensa M0 solicitada, owner y `aprobadores: [tech_lead]`, historial, costo con número y fuente (USD 2.592,53 al mes con PRE) y
  las reglas con su evidencia.
- **Colisiones C-01 a C-12:** atendidas. Hay documentos nuevos para el catálogo de roles de ATC, el registro de tablas y el proceso de
  prospectos.
- **Evidencias del G3:** diagramas, contrato de API (Mi Portal sin login ni sesión propios, con `x-permiso` y errores `AYB-<ÁREA>-<HTTP>`),
  seguridad, costo por ambiente, migración y acta F4 lista para el Data Chief.

Le pedimos decidir cuatro puntos donde el paquete aprobado de Control de acceso no respalda lo que se pidió. Dejamos el diseño posible
y las preguntas a Sony:

1. **P-033:** el token de PJ-05 no trae `PartyID`.
2. **P-034:** el token trae roles, no permisos.
3. **P-035:** no hay API de servicio para obtener líderes ni gestores.
4. **P-037:** ATC no puede crear la `PARTY` del interesado.

Además le toca decidir:

- **P-025:** 63 h de lo que el SDK no trae frente a 9 h de holgura. Proponemos sacar primero las 16 h flexibles (HU-037, 038, 039,
  048 y 053) y decidir las 38 h restantes con el PO en el control de alcance del 29-oct.
- **P-044:** región, SKU y ambientes del costo.
- **P-005:** la dispensa M0.
- **P-042:** una observación respetuosa. PJ-05 se aprobó con M0 «no bloquea» (D-123), costo «no bloquea» (D-98) y `aprobadores: []`.
  ¿Aplica el mismo criterio a ATC?

Dos datos de su revisión que no coinciden con los documentos:

- RNF-SEC-009 y RNF-SEC-010 **sí están en el Excel** del PO (hoja 03_RNF, filas 30 y 31).
- RN-SVC-044 y RN-SVC-045 están en los PDF del PO v1.3. Faltan en el Excel y las registra el PO (P-022).

Quedan en Nexora 4 gates sueltos de la v1.2 y una HU duplicada que dan error de identificador duplicado (P-029). Los tiene que retirar
el PO o el admin.

Gracias.

---

## 3. A Eddie Huamaní (PO) · copia: Jose Jara

**Asunto:** ATC (PJ-06): decisiones que le tocan tras la revisión técnica del 22-oct

Hola, Eddie:

Tras la revisión del Líder Técnico, estas decisiones le corresponden:

1. **P-027, cambios a sus documentos por decisión del Líder Técnico:**
   - stack Java + Angular en lugar de NestJS (PLT-01 §1 y PLT-05 §4.1);
   - sin usuarios, roles ni líderes locales (regla RN-SVC-043 y leyenda del Excel; DEP-02);
   - Mi Portal entra con el login de Control de acceso (HU-064 CA-01).
2. **P-025, horas:** lo que el SDK no trae suma unas 63 h y el plan tiene 9 h de holgura. Proponemos sacar primero las 16 h
   flexibles (HU-037, 038, 039, 048 y 053) y decidir las 38 h restantes en el control de alcance del 29-oct.
3. **P-022, Excel:** faltan RF-SVC-064 a 067 y RN-SVC-044/045; la salida dice 30-oct y los PDF dicen 03-nov; RF-001 a 039 no tienen
   prioridad. La lista celda por celda está en `correcciones-excel-v1.3.md`.
4. **P-041, alcance nuevo:** Control de acceso deriva a ATC casos manuales de prospectos (DNI tomado, impostor, correo distinto).
   Proponemos un tipo de ticket con 4 subtipos. ¿Entra en la Etapa 1?
5. **P-017:** las 9 combinaciones tipo · subtipo · área del piloto que propone ADR-008.
6. **La D-12** de la rama de Daniel (sacar HU-048 y 053 de la Etapa 1) sigue sin decidir.
7. **P-029 y P-023, Nexora:** crear los ítems de trabajo de PJ-06 (la carga lista está en `nexora-items/carga-items-pj06.csv`, con
   responsable y dependencias de cada HU), y retirar los 4 gates sueltos y la HU duplicada `HU-DOC-001`.

Gracias.

---

## 4. A Legal · copia: Jose Jara

**Asunto:** ATC (PJ-06): retención del Libro de Reclamaciones y excepción de la hoja

Hola:

Para cerrar las ADR-006 y ADR-003 de ATC necesitamos su confirmación (DEP-05):

1. El plazo de retención de la evidencia del Libro de Reclamaciones. Proponemos al menos 2 años, con almacenamiento inmutable (Azure
   Blob Storage).
2. La excepción de la hoja del Libro de Reclamaciones: los datos del consumidor se guardan en la hoja aunque el resto del cliente no se
   copie.

Gracias.

---

## 5. A Enrique Albán (Data Chief) · copia: Jose Jara, Jesús Chávez

**Asunto:** ATC (PJ-06): acta F4 lista para su firma y tablas nuevas en la base única

Hola, Enrique:

- El acta `datos/acta-validacion-arquitectura-datos.md` está lista para su firma, con los hallazgos H-01, H-02, H-03, H-05 y H-08
  resueltos según DT-06.
- **P-031:** tablas y accesos nuevos que ATC propone como cambio al v7 en la base única:
  - `shedlock` y el outbox propio `SVC_OUTBOX_EVENT`;
  - `SVC_AI_SUGGESTION_LOG`;
  - las tablas de flujo y subtipo;
  - la tabla de historial de Flyway `flyway_schema_history_atc`.
- **P-043:** necesitamos un dueño único de migración para los maestros compartidos y una fecha. Sin ella, la primera migración de ATC
  no corre en DEV.
- **P-015:** contrastar con el fragmento 10 del v7 las recetas de hash que propone ADR-002.

El detalle está en `datos/registro-de-tablas.md`. Gracias.

---

## Lo que tiene que hacer Brayan antes de que el Líder Técnico revise

- **«Revisado por»:** en cada documento que publicamos, el Líder Técnico pide el nombre y la fecha de quien revisó el texto generado
  por IA. Solo puede ponerlo quien lo leyó. Cuando revises cada documento, se cambia «Revisado por: (pendiente)» por tu nombre y la
  fecha, y se publica la versión nueva.
- **Las 63 h de P-025:** confirmarlas con Jesús, Michel y Daniel.
