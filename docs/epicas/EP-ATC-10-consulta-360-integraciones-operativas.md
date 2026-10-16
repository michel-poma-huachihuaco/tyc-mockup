---
id: "EP-ATC-10"
tipo: epica
titulo: "Consulta 360 e integraciones operativas"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-10 Consulta 360 e integraciones operativas

Va en `docs/epicas/EP-ATC-10-consulta-360-integraciones-operativas.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-10 | Consulta 360 e integraciones operativas | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de TI / Gerencia Legal (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Siguiente | Borrador | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: para atender, el gestor de tickets consulta 3 o 4 sistemas (SIGDA/TAXON, Cobranza, correo, carpetas) y la plataforma telefónica no está conectada al ticket. Los casos de Legal se siguen fuera del sistema y un reclamo puede escalar a denuncia sin que nadie mida su costo.
- **Usuarios**: gestores de tickets y operadores del call center, el equipo de Legal (responsable: Rosario) y el Coordinador CX.
- **Evidencia**: feedback de la presentación; necesidad de resolver en el primer contacto y evitar que un reclamo escale a denuncia.
- **Alineamiento**: cumplir el Libro de Reclamaciones sin exposición ante INDECOPI y atender en el primer contacto.

## 2 Objetivos

Objetivos de negocio:
- OBJ-10: Ningún reclamo del piloto llega a denuncia y el 70% de las consultas se resuelve en el primer contacto, en los 3 meses siguientes al pase a producción.

Objetivos del usuario:
- El gestor encuentra al cliente en segundos, ve sus lotes, cuotas, correos y documentos sin salir del ticket y lo llama con un clic.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Reclamos que escalan a denuncia o INDECOPI | por medir | 0 | Plataforma ATC | Mensual |
| % de resolución en el primer contacto | por medir | ≥ 70% | Plataforma ATC | Semanal |
| Tiempo de búsqueda del cliente (p95) | por medir | ≤ 2 s | Plataforma ATC | Continua |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Sincronización con la herramienta de Legal y exposición económica por riesgo de denuncia | Copia del maestro de clientes (se consulta, RN-SVC-026) |
| Integración con la plataforma del call center (screen pop, registro de llamada, click-to-call) | Gestión del expediente judicial |
| Motor de búsqueda del cliente y consulta 360 (lotes, cuotas, correos, documentos) | Reemplazo de la plataforma de call center |
| Excepciones de consulta (cliente no encontrado, sistema caído) | |
| Reutilización del motor de consultas de José y búsqueda semántica en documentos | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-16 | Integración con Legal y prevención de denuncias | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-17 | Integración con la plataforma del call center | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-20 | Búsqueda y consulta 360 del cliente | Debe | v1.0 - 30-oct-2026 |

- **Supuestos**: las integraciones se construyen contra contratos de interfaz y simuladores; la conexión real se activa cuando cada sistema externo entregue su API.
- **Restricciones**: Ley 29733: la búsqueda respeta los permisos del sistema de origen (RN-SVC-036); la tasa del 8% es referencial hasta que Legal la valide (RN-SVC-034).
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON, DEP-11 call center, DEP-12 herramienta de Legal, DEP-13 motor de José; R-02 terceros.
- **Criterios de éxito**: integraciones funcionando con simuladores al 29-oct y en real dentro del mes siguiente; 0 accesos indebidos en la búsqueda.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
