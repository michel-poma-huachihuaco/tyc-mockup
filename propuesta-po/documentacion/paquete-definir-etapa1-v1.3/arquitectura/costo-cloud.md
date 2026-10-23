---
id: "SPEC-ARQ-COSTO"
tipo: "spec"
titulo: "Impacto en costo cloud (servicios definidos, sin cifras)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-014, ADR-012, ADR-006]
tags: [arquitectura, costo, g3]
---

# Impacto en costo cloud

El criterio de G3 pide el «impacto en costo cloud estimado», con número y fuente. **Todavía no hay cifras.** La nube y los servicios ya están definidos (Azure, DT-07; ADR-014), pero **faltan los volúmenes** que alimentan la calculadora de precios de Azure. Inventar un número sería peor que dejarlo vacío. Este documento fija los servicios y lo que falta para completarlo.

## 1 Servicios (ADR-014)

| Componente | Servicio | Dimensionamiento | Costo mensual estimado | Fuente |
|---|---|---|---|---|
| Contenedores del servicio | Azure Container Apps | Réplicas por ambiente: por definir | POR COMPLETAR | Calculadora de precios de Azure |
| Imágenes | Azure Container Registry | Por definir | POR COMPLETAR | Calculadora de precios de Azure |
| Escritura (PostgreSQL) | Azure Database for PostgreSQL con alta disponibilidad con redundancia de zona (cubre RNF-DIS-003) | Núcleos, memoria y almacenamiento: por definir | POR COMPLETAR | Calculadora de precios de Azure |
| Almacén de lectura (API de MongoDB) | Azure Cosmos DB for MongoDB (vCore) | Por definir; GB de vistas | POR COMPLETAR | Calculadora de precios de Azure |
| Bus de eventos (protocolo Kafka) | Azure Event Hubs | Unidades y retención: por definir | POR COMPLETAR | Calculadora de precios de Azure |
| Evidencia con inmutabilidad | Azure Blob Storage | GB y retención de al menos 2 años para el Libro (la confirma Legal) | POR COMPLETAR | Calculadora de precios de Azure |
| Secretos y llave HMAC | Azure Key Vault | Operaciones por mes: por definir | POR COMPLETAR | Calculadora de precios de Azure |
| Borde | Cloudflare y Azure API Management | Peticiones por mes: por definir | POR COMPLETAR | Calculadora de precios de Azure y tarifa de Cloudflare |
| Logs, trazas y métricas | Azure Monitor | GB por mes: por definir | POR COMPLETAR | Calculadora de precios de Azure |
| Proveedor de IA (ADR-007) | Sin proveedor elegido (DEP-14, «Por evaluar») | Sin tarifa | **Sin cifra posible** | TI y Seguridad |
| **Total** | | | **POR COMPLETAR** | |

**Ya no cuestan a ATC:** el emisor de tokens y el login (son de Control de acceso, PJ-05) y el envío de códigos de Mi Portal (ATC no los envía, DT-04). El job de ShedLock usa la base de PostgreSQL y no agrega un servicio.

## 2 Volúmenes que faltan

Los pide el PO u Operaciones; ningún documento del paquete los da:

- Tickets por día y por mes, y su crecimiento durante la Etapa 1.
- Usuarios internos concurrentes y clientes de Mi Portal.
- Adjuntos por ticket y GB de evidencia por mes (límite de 10 MB por archivo, HU-064 CA-05).
- Retención de la evidencia (al menos 2 años para el Libro, Legal) y de las filas del outbox (7 días, propuesta del ADR-013).
- Eventos por segundo hacia el bus, y consultas por segundo al almacén de lectura.
- Número de réplicas y ambientes (DEV, QA, PRE y producción).

## 3 Horas de desarrollo

El costo de construir lo que el SDK no trae (outbox, proyector, bitácoras con HMAC, calendario, caché, circuit breaker, ShedLock, ArchUnit) tampoco tiene cifra: el equipo debe estimarlo (P-025). El plan del PO tiene 9 h de holgura (243 h de 252 h).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Estructura con servicios «por decidir» |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Servicios de Azure (DT-07), sin cifras; volúmenes que faltan; qué ya no cuesta a ATC |

Generado por IA: borrador completo (Claude, 2026-10-19); actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
