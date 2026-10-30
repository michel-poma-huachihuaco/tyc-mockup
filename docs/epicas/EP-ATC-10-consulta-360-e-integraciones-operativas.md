---
id: "EP-ATC-10"
tipo: epica
titulo: "Consulta 360 e integraciones operativas"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-20", "FT-ATC-17", "FT-ATC-16"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-10 Consulta 360 e integraciones operativas

**Alcance en la Etapa 1:** la Etapa 1 no incluye HU-053 (fuera por decisión del equipo del 26-oct-2026, P-025: alcance flexible R-01 del PO; se retoma en una etapa posterior). En la Etapa 1 la épica suma 31 h de las 36 h del PO; la DEP-14 no aplica y la DEP-06 no la usa ninguna historia de la épica en la Etapa 1. HU-042 depende de HU-052 en lugar de HU-053.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-10 | Consulta 360 e integraciones operativas | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de TI · Gerencia Legal (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| mié 21-oct → mié 28-oct 2026 · Dev 4 · 36 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica habilitadora | Dev 4 (Daniel) | 36 h · iteración 1 y 2 |

## 1 Contexto

- **Problema**: Para atender, el gestor de tickets consulta 3 o 4 sistemas (SIGDA/TAXON, Cobranza, correo, carpetas) y la plataforma telefónica no está conectada al ticket. Los casos de Legal se siguen fuera del sistema y un reclamo puede escalar a denuncia sin que nadie mida su costo.
- **Usuarios**: Gestores de tickets y operadores del call center, el equipo de Legal (responsable: Rosario) y el Coordinador CX.
- **Evidencia**: Feedback de la presentación, ítems 2, 5, 9, 12, 14, 16, 17 y 19; NEC-SVC-007 «resolver en el primer contacto» y NEC-SVC-008 «evitar que un reclamo escale a denuncia».
- **Alineamiento**: Cumplir el Libro de Reclamaciones sin exposición ante INDECOPI (OBJ-SVC-002) y atender en el primer contacto (OBJ-SVC-001).
- **Procesos**: PROC-SVC-015, PROC-SVC-016, PROC-SVC-019

## 2 Objetivos

Objetivo de negocio:
- Ningún reclamo del piloto llega a denuncia y el 70 % de las consultas se resuelve en el primer contacto, en los 3 meses siguientes al pase a producción.

Objetivo del usuario:
- El gestor encuentra al cliente en segundos, ve sus lotes, cuotas, correos y documentos sin salir del ticket y lo llama con un clic.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Reclamos que escalan a denuncia o INDECOPI | no indicada en el PLT-02 | 0 | — | — |
| Resolución en el primer contacto | no indicada en el PLT-02 | ≥ 70 % | — | — |
| Tiempo de búsqueda del cliente (RNF-REN-007) | no indicada en el PLT-02 | p95 ≤ 2 s | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Sincronización con la herramienta de Legal y exposición económica por riesgo de denuncia | Copia del maestro de clientes (se consulta, RN-SVC-026) |
| Integración con la plataforma del call center (screen pop, registro de llamada, click-to-call) | Gestión del expediente judicial |
| Motor de búsqueda del cliente y consulta 360 (lotes, cuotas, correos, documentos) | Reemplazo de la plataforma de call center |
| Excepciones de consulta (cliente no encontrado, sistema caído) |  |
| Reutilización del motor de consultas de José y búsqueda semántica en documentos |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-20 | Búsqueda y consulta 360 del cliente | Debe | 22 | mié 21-oct → lun 26-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-17 | Integración con la plataforma del call center | Debe | 5 | lun 26-oct → lun 26-oct | FT-ATC-20 | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-16 | Integración con Legal y prevención de denuncias | Debe | 9 | lun 26-oct → mié 28-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-20 → FT-ATC-17 (27 h)
- **Supuestos**: Las integraciones se construyen contra contratos de interfaz y simuladores; la conexión real se activa cuando cada sistema externo entregue su API (DEP-01, 12, 13, 15).
- **Restricciones**: Ley 29733: la búsqueda respeta los permisos del sistema de origen (RN-SVC-036). La tasa del 8 % es referencial hasta que Legal la valide (RN-SVC-034).
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON · DEP-11 call center · DEP-12 herramienta de Legal · DEP-13 motor de José · R-02 terceros
- **Criterios de éxito**: Integraciones funcionando con simuladores al 29-oct y en real dentro del mes siguiente; 0 accesos indebidos en la búsqueda. Indicadores: Reclamos que escalan a denuncia o INDECOPI: 0; Resolución en el primer contacto: ≥ 70 %; Tiempo de búsqueda del cliente (RNF-REN-007): p95 ≤ 2 s.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato) | Interna | EP-ATC-01, EP-ATC-04, EP-ATC-06, EP-ATC-10 | CDO / Equipo Datos | 21-oct-2026 | Pendiente |
| DEP-11 | Plataforma del call center: API/CTI para screen pop, registro de llamadas, grabación y click-to-call | Externa | EP-ATC-10 | TI / proveedor de call center | 21-oct-2026 | Por evaluar |
| DEP-12 | Herramienta de Legal (responsable: Rosario): API o intercambio para sincronizar casos de Eje 3 | Interna | EP-ATC-10 | Gerencia Legal · TI | 26-oct-2026 | Por evaluar |
| DEP-13 | Motor de consultas de José: contrato de API y responsable de mantenimiento | Interna | EP-ATC-10 | José · TI | 23-oct-2026 | Por evaluar |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-02 | APIs externas no disponibles en el plazo (SIGDA/TAXON, call center, Legal, Cobranza, motor de José) | Alta | Alto | Contratos de interfaz y simuladores cerrados en la etapa de diseño (20-oct); pase a producción de cada integración condicionado a su API real | Líder técnico | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)

Historial: 1.3.1 · 2026-10-26 · Brayan Hurtado, con IA · Nota de alcance al inicio del cuerpo: P-025 (decisión del equipo del 26-oct-2026, `analisis/decisiones.md` v0.8). La Etapa 1 no incluye HU-053 (31 h de 36 h). No se cambia texto del PO. — Revisado por: (pendiente)
