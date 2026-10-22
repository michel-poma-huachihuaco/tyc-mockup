---
id: "ADR-014"
tipo: "adr"
titulo: "ADR-014: Plataforma: Azure, emisor de tokens de Control de acceso y servicios gestionados"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-005, ADR-006, ADR-009, ADR-011, ADR-012, ADR-013]
tags: [adr, arquitectura, g3]
---

# ADR-014: Plataforma: Azure, emisor de tokens de Control de acceso y servicios gestionados

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: decisiones DT-01, DT-05, DT-07, DT-08 y DT-10 del Líder Técnico (Jose Jara, 22-oct-2026), registradas en `analisis/decisiones.md` v0.3. Sustituye a la v0.1 (19-oct), que dejaba la nube y el emisor «por decidir».
- Cambia lo que da por hecho el PO: PLT-05 §4 y los requisitos RNF-CUM-007 y RNF-DIS-003 hablan de S3 con Object Lock y PostgreSQL Multi-AZ. Con Azure, el PO los actualiza a su equivalente (Blob Storage con inmutabilidad; alta disponibilidad con redundancia de zona). Ver P-027.

> Las referencias a PJ-05 (Control de acceso) son las del correo del Líder Técnico del 22-oct. Quien redacta este ADR no ve ese apartado en Nexora y no las verificó.

## Contexto

El SDK Aybar 0.7.1 es neutral de nube. Las skills `aybar-lexico` y `aybar-paquete-definir` piden que la nube, el emisor de tokens y los servicios gestionados los fije un ADR del proyecto, y no que el agente los suponga.

El Líder Técnico fijó el 22-oct que ATC corre en Azure, con la base única del modelo corporativo v7 (DT-06), y que ATC consume la seguridad del área de Roles y Permisos (Control de acceso, PJ-05): no emite tokens, no abre sesiones y no administra usuarios, roles ni permisos (DT-03, DT-04 y DT-05). El servicio emisor está en construcción en `aybar-access-control`; esta versión ya no dice que no existe.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| AWS (RDS o Aurora, DocumentDB, MSK, Secrets Manager, ECS Fargate, ECR, S3, CloudWatch) | Azure es la nube de la base única del v7 y del resto de la plataforma corporativa (PJ-05 ADR-015 y 019, según el Líder Técnico). | Que el Líder Técnico cambie la nube. |
| Un emisor OIDC gestionado (Cognito, Entra ID, Auth0) | El emisor es el servidor de autorización de Control de acceso (DT-05). Dos emisores partirían las cuentas y los roles. | — |
| Un emisor propio de ATC o login propio en Mi Portal | ATC no administra identidad (DT-03 y DT-04). | — |
| Programador externo para los jobs | Añade una pieza más que operar. DT-08 fija ShedLock dentro del servicio. | Que se extraiga el módulo `sla` a un servicio propio. |

## Decisión

Azure, para todo ATC (DT-07):

| Capacidad | Servicio | Nota |
|---|---|---|
| Escritura (PostgreSQL) | Azure Database for PostgreSQL | Base única del v7, con FK físicas (DT-06). Alta disponibilidad con redundancia de zona para cubrir RNF-DIS-003 |
| Lectura (API de MongoDB) | Azure Cosmos DB for MongoDB (vCore) | Vistas de ATC (ADR-012) |
| Bus de eventos (protocolo Kafka) | Azure Event Hubs | Endpoint Kafka |
| Evidencia probatoria | Azure Blob Storage con inmutabilidad | Reemplaza a S3 con Object Lock (ADR-006) |
| Secretos y llaves | Azure Key Vault | `aybar.secretos.proveedor=azure` (SDK desde 0.4.0). Incluye la llave HMAC de las bitácoras (ADR-002) |
| Contenedores | Azure Container Apps | |
| Imágenes | Azure Container Registry | |
| Observabilidad | Azure Monitor | Logs, trazas y métricas |
| Borde | Cloudflare + Azure API Management | API Management valida la audiencia (`aud`) por API |

Además:

1. **Emisor de tokens:** el servidor de autorización de Control de acceso (Spring Authorization Server). ATC solo valida el JWT con `aybar-starter-security` y el contrato de claims de PJ-05. No van Cognito, Entra ID ni Auth0 como emisor (DT-05).
2. **Clientes de Mi Portal:** login contra el emisor del área (`@aybarcorp/auth`, Authorization Code con PKCE). ATC filtra por el `PartyID` del token (DT-04).
3. **Llamadas entre servicios:** token de servicio `client_credentials` del emisor corporativo con `aybar-starter-client` (DT-10).
4. **Jobs:** ShedLock sobre PostgreSQL, para que corra una sola réplica (DT-08; ADR-005).
5. **Ambientes:** DEV, QA, PRE y producción; una imagen versionada por release.
6. **Registro en Control de acceso:** ATC solicita al área los clientes OAuth de la consola, de Mi Portal y de la API, el cliente de servicio, el cliente `CATALOG_REGISTRAR` para entregar su catálogo de roles, y la política de API Management con su `aud` (P-026). ATC solo declara su audiencia en `AYBAR_JWT_AUDIENCE`.
7. **Desarrollo local:** con el emisor de pruebas de `aybar-access-control/herramientas/`, mientras no haya Control de acceso en DEV.

**Pendiente de definir y probar (P-032):** la autenticación del broker. El contrato de `aybar-starter-messaging` dice que la autenticación SASL contra un broker gestionado no la resolvió el equipo del SDK. Event Hubs acepta SASL con cadena de conexión (guardada en Key Vault) o con OAuth; el equipo la prueba antes de cerrar el ADR-013.

## Consecuencias

- Obliga a:
  - Que Control de acceso esté disponible en DEV (dependencia nueva `DEP-16`, responsable Sony Montoya; fecha por comprometer). Sin emisor, los endpoints protegidos no responden.
  - Reemplazar el cliente S3 por el de Blob Storage en la evidencia (ADR-006). **`aybar-starter-audit` publica solo a log, archivo NDJSON o S3/MinIO, sin destino Azure Blob**: la auditoría técnica va a log (Azure Monitor) o a archivo, y la evidencia legal se sube desde el servicio.
  - Declarar la dependencia de ShedLock (no está en el SDK ni en el BOM) y registrar su tabla en el registro de tablas de ATC (P-031).
  - Reflejar la decisión en `arquitectura/costo-cloud.md`, en `docs/VARIABLES.md` y en `.env.example`.
  - Actualizar `c4-contexto.mmd`, `c4-contenedores.mmd` y `seguridad.md` (ya no dicen «emisor por decidir»).
  - Que el PO actualice el PLT-05 §4 (S3, Multi-AZ) y sus requisitos (P-027).
- Impide:
  - Suponer otra nube o servicio gestionado sin ADR.
  - Usar un emisor distinto del de Control de acceso, o abrir sesiones propias.
- Cuesta: **sin cifra todavía.** `arquitectura/costo-cloud.md` está sin números porque faltan los volúmenes (tickets por día, usuarios, GB de evidencia y su retención). Fuente prevista: calculadora de precios de Azure. Los volúmenes los da el PO u Operaciones; hasta entonces el costo queda «POR COMPLETAR» y no se inventa.

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades de negocio propias. Fija dónde residen los datos y quién custodia las claves: base única del v7 en Azure Database for PostgreSQL; llave HMAC en Key Vault.
- Tabla nueva por esta decisión: la de ShedLock (`shedlock`), a registrar con Gobierno de Datos (P-031).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador con la decisión «POR DECIDIR» |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Línea de conflicto abierto con el PO v1.3 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Reescrito con DT-05, DT-07, DT-08 y DT-10 del Líder Técnico. Quita «POR DECIDIR» y «access-control no existe» |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; reescrito con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
