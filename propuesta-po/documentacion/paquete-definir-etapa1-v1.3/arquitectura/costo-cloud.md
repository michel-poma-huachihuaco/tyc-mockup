---
id: "SPEC-ARQ-COSTO"
tipo: "spec"
titulo: "Impacto en costo cloud (por estimar)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.1"
owner: "[por asignar: arquitecto / TL]"
aprobadores: []
fecha: "2026-10-19"
relacionados: [ADR-014]
tags: [arquitectura, costo, g3]
---

# Impacto en costo cloud

El criterio de G3 pide el «impacto en costo cloud estimado», con número y fuente. **No hay estimación**: depende de la nube que decida el ADR-014 y de volúmenes que los documentos no dan. Este archivo deja la estructura para que el TL o DevOps la llenen.

| Componente | Servicio (según ADR-014) | Dimensionamiento | Costo mensual estimado | Fuente |
|---|---|---|---|---|
| Contenedores del servicio | por decidir | por definir | POR COMPLETAR | |
| PostgreSQL Multi-AZ (primario y standby síncrono en 2 zonas, RNF-DIS-003) | por decidir | por definir | POR COMPLETAR | |
| Almacén de lectura (API de MongoDB) | por decidir | por definir | POR COMPLETAR | |
| Bus de eventos (protocolo Kafka) | por decidir | por definir | POR COMPLETAR | |
| Almacenamiento de objetos con Object Lock | por decidir | por definir | POR COMPLETAR | |
| Gestor de secretos | por decidir | — | POR COMPLETAR | |
| Emisor OIDC | por decidir | — | POR COMPLETAR | |
| Balanceador, pasarela y WAF | por decidir | — | POR COMPLETAR | |
| Registro de imágenes | por decidir | — | POR COMPLETAR | |
| Logs, trazas y métricas | por decidir | por definir | POR COMPLETAR | |
| Proveedor de IA (ADR-007) | DEP-14, por evaluar | por definir | POR COMPLETAR | |
| Envío de códigos de Mi Portal (ADR-011) | por definir | por definir | POR COMPLETAR | |
| **Total** | | | **POR COMPLETAR** | |

Generado por IA: borrador completo (Claude, 2026-10-19) — Revisado por: (pendiente)
