---
name: aybar-lexico
description: Término canónico para nombrar tecnología — el del servicio gestionado que decide el ADR del proyecto, no el apodo de mercado ("Mongo", "Kafka", "Postgres") — con la tabla de equivalencias AWS y Azure. Usar al nombrar infraestructura en código, commits, ADR o documentación, o al hablar de un componente de plataforma.
---

# Léxico

Nombrar el producto equivocado en un ADR, un comentario o un nombre de clase deja
un rastro falso sobre qué corre en producción, y quien lo lee después decide sobre
infraestructura que no existe. No es una regla de estilo.

## Qué término usar

1. **En ADR, infraestructura, runbooks y documentación del servicio**: el nombre del servicio gestionado que decidió el ADR `approved` del proyecto (`docs/adr/`), escrito como lo escribe el proveedor.
2. **En código y en el SDK**: el protocolo o el motor, que es lo que el código conoce y lo que el SDK soporta: PostgreSQL, API de MongoDB, Kafka, OIDC/JWT. El SDK es neutral y no nombra nube. Las propiedades `aybar.data.mongo.*` o `AYBAR_MONGO_URI` nombran el protocolo: no las renombres.
3. **Nunca el apodo como nombre de infraestructura**: "Mongo", "Kafka" o "Postgres" a secas en un ADR no dicen qué corre ni quién lo opera.

Si el ADR del proyecto no decidió la plataforma de un componente, no la supongas.
Pregúntaselo al TL y que quede escrito en un ADR. Un despliegue autogestionado
(el motor instalado en máquinas propias) también es una decisión de plataforma:
vale solo si un ADR `approved` lo decide.

## Equivalencias AWS / Azure

| Capacidad, como la ve el SDK | Starter | AWS | Azure |
|---|---|---|---|
| Almacén relacional de escritura (PostgreSQL) | `aybar-starter-data` | Amazon RDS for PostgreSQL · Amazon Aurora PostgreSQL | Azure Database for PostgreSQL (servidor flexible) |
| Almacén documental de lectura (API de MongoDB) | `aybar-starter-data` | Amazon DocumentDB | Azure Cosmos DB for MongoDB (vCore) |
| Bus de eventos (protocolo Kafka) | `aybar-starter-messaging` | Amazon MSK | Azure Event Hubs (endpoint Kafka) |
| Secretos | `aybar-starter-config` | AWS Secrets Manager | Azure Key Vault |
| Emisor OIDC de tokens | `aybar-starter-security` | Amazon Cognito | Microsoft Entra ID |
| Contenedores | — | Amazon ECS (Fargate) · Amazon EKS | Azure Container Apps · Azure Kubernetes Service |
| Registro de imágenes | — | Amazon ECR | Azure Container Registry |
| Almacenamiento de objetos | — | Amazon S3 | Azure Blob Storage |
| Logs y métricas | `aybar-starter-logging` | Amazon CloudWatch | Azure Monitor |

- El emisor de tokens de la plataforma será `access-control-service` (todavía no existe), que conserva el contrato de claims corporativo. Keycloak ya no forma parte del SDK (decisión del Technical Lead del 2026-10-06): no lo nombres como emisor corporativo ni como entorno local. Un servicio puede usar otro emisor OIDC, gestionado o propio, si su ADR lo decide.
- Compatible con el protocolo no significa idéntico. Un servicio gestionado que implementa la API de MongoDB o el protocolo Kafka puede no soportar todo lo que soporta el motor original. Las diferencias que afectan al servicio se declaran en el ADR.
- Los nombres comerciales cambian. Manda el que figura en el ADR y en la documentación vigente del proveedor; esta tabla es orientativa.
- Lo que el SDK soporta hoy de cada capacidad (por ejemplo, de qué nube son los secretos): skill `aybar-estado-del-sdk`.

## Estrategia corporativa frente a ADR del proyecto

La estrategia corporativa de referencia nombra productos concretos. Si el ADR
`approved` del proyecto elige otro, en el servicio se usa el término del ADR y la
divergencia se informa en el envío de G3 al TL. El léxico no corrige un ADR.
