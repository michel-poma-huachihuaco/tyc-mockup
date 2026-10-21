---
id: "ADR-014"
tipo: "adr"
titulo: "ADR-014: Plataforma: nube, emisor de tokens y servicios gestionados (decisión pendiente)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-001]
tags: [adr, arquitectura, g3]
---

# ADR-014: Plataforma: nube, emisor de tokens y servicios gestionados (decisión pendiente)

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-19
- Compatibilidad con M0 (Arquitectura de Directorio): **por confirmar** (M0 no está en el repositorio; la declara el TL o se solicita dispensa al Data Chief o al Directorio)
- Origen: nuevo en esta propuesta
- Este ADR **no decide**: registra lo que falta decidir. Las skills `aybar-lexico` y `aybar-paquete-definir` piden que la nube, el emisor de tokens y los servicios gestionados los fije un ADR del proyecto, y que el agente no los suponga: «pregúntaselo al TL».
- **Conflicto abierto con el PLT-01 v1.3 (ADR-01 y ADR-06 del PO): decide el líder técnico.** El PO da por hecha la infraestructura vigente: PostgreSQL Multi-AZ y S3 «provienen del requerimiento» (PLT-05 v1.3 §4; RNF-DIS-003 y RNF-CUM-007 del Excel). Este ADR deja la nube y los servicios por decidir. No está en el registro de 11 ADR del PO.

> Las opciones evaluadas son una propuesta de redacción a partir del motivo del PLT-05 y de las skills del SDK: el arquitecto las confirma o corrige antes de pedir la aprobación del TL.

## Contexto

El SDK es neutral de nube. Lo que el repositorio permite inferir: la imagen y los valores por defecto están pensados para contenedores en ECS Fargate; los secretos pueden venir de AWS Secrets Manager, Azure Key Vault o variables de entorno; la auditoría puede ir a S3 o MinIO; el PLT-05 nombra S3 con Object Lock y PostgreSQL Multi-AZ (RNF-DIS-003, primario y standby síncrono en 2 zonas). Ningún documento dice qué nube se usa.

El emisor de tokens es un hueco concreto: el SDK solo valida JWT y el emisor de la plataforma (`access-control-service`) no existe. Sin emisor, los endpoints protegidos no responden ni en la Etapa 1.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| AWS | Por decidir. Equivalentes: PostgreSQL → RDS o Aurora; API de MongoDB → DocumentDB; Kafka → MSK; secretos → Secrets Manager; emisor OIDC → Cognito; contenedores → ECS Fargate o EKS; imágenes → ECR; objetos → S3; logs → CloudWatch. | Que el TL confirme AWS (S3 ya figura en el PLT-05). |
| Azure | Por decidir. Equivalentes: PostgreSQL → Azure Database for PostgreSQL; API de MongoDB → Cosmos DB for MongoDB (vCore); Kafka → Event Hubs; secretos → Key Vault; emisor → Entra ID; contenedores → Container Apps o AKS; objetos → Blob Storage; logs → Azure Monitor. | Que el TL elija Azure. |
| Emisor de tokens: `access-control-service` | No existe todavía (no suponer URL, host ni puerto). | Que se publique antes del 21-oct. |
| Emisor de tokens: un emisor OIDC gestionado (Cognito, Entra ID, Auth0…) | Por decidir; se integra con `aybar.security.claims.*` sin tocar el SDK. | Que el TL lo elija para la Etapa 1. |

## Decisión

**POR DECIDIR (TL).** Registrar aquí, con nombre del servicio gestionado y responsable: (1) nube; (2) servicio de PostgreSQL, de almacén documental con API de MongoDB y de bus Kafka; (3) gestor de secretos; (4) emisor OIDC de la Etapa 1 y cómo obtiene su token la sesión de Mi Portal; (5) orquestador de contenedores y registro de imágenes; (6) observabilidad (logs, trazas y métricas); (7) autenticación del broker de eventos.

## Consecuencias

- Obliga a:
  - Que el TL decida antes de aprobar G3: sin él, el costo cloud y las variables de entorno quedan sin fijar.
  - Reflejar la decisión en `docs/arquitectura/costo-cloud.md` y en `.env.example`.
- Impide:
  - Que un agente suponga la plataforma.
- Cuesta: Por estimar tras la decisión.

## Datos (puerta F4 de Gobierno de Datos)

- Sin entidades propias; fija dónde residen los datos y quién custodia las claves. El v7 ya fija una sola instancia PostgreSQL y una llave HMAC en KMS: condicionan la elección del servicio gestionado.

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v3 de Jesús Chávez Elías en Nexora; actualizado por Brayan con IA (Claude, 2026-10-21) a la v1.3 del PO: línea de conflicto abierto con los ADR-01 y ADR-06 del PO (infraestructura vigente y S3). — Revisado por: (pendiente) · Aprueba: TL
