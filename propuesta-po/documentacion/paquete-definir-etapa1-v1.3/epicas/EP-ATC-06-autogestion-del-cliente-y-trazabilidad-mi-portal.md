---
id: "EP-ATC-06"
tipo: epica
titulo: "Autogestión del cliente y trazabilidad (Mi Portal)"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-24"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-06 Autogestión del cliente y trazabilidad (Mi Portal)

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-06 | Autogestión del cliente y trazabilidad (Mi Portal) | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Experiencia del Cliente (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| vie 30-oct → lun 02-nov 2026 · Dev 4 · 9 h | Refinamiento · redefinida en v1.3 | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 4 (Daniel) | 9 h · iteración 2 |

## 1 Contexto

- **Problema**: El cliente solo puede abrir o seguir un caso llamando o escribiendo, y no sabe en qué estado está su solicitud. Eso genera llamadas repetidas de «¿cómo va mi caso?» y reclamos por falta de información.
- **Usuarios**: Clientes de las 11 razones sociales (propietarios y compradores con contrato), gestores de tickets que reciben los casos.
- **Evidencia**: Decisión del PO del 16-oct-2026 (división por etapas): la EP-ATC-06 se dedica a la autogestión del cliente. RN-SVC-023 (cierre formal en Mi Portal) y la interacción «visible» del modelo (RF-SVC-005) ya lo anticipaban.
- **Alineamiento**: Atender toda solicitud con compromiso de tiempo trazable (OBJ-SVC-001) y reducir el contacto repetido por seguimiento.
- **Procesos**: PROC-SVC-001, PROC-SVC-002

## 2 Objetivos

Objetivo de negocio:
- Que el 30 % de los tickets nuevos se registre en Mi Portal y que bajen en 40 % las consultas de seguimiento por teléfono y WhatsApp en los 3 meses siguientes al pase.

Objetivo del usuario:
- El cliente registra su caso, ve en qué paso está y cuándo vence el plazo, responde lo que le piden y confirma la solución sin llamar.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Tickets registrados por el cliente en Mi Portal | no indicada en el PLT-02 | 30 % | — | — |
| Consultas de seguimiento por teléfono y WhatsApp | no indicada en el PLT-02 | −40 % | — | — |
| Tickets cerrados con confirmación del cliente | no indicada en el PLT-02 | 60 % | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro de un ticket por el propio cliente, con tipo y subtipo guiados y adjuntos | Registro en el Libro de Reclamaciones desde Mi Portal (sigue su propio formulario legal, EP-ATC-03) |
| Lista «Mis tickets» con número, estado, área y fecha de compromiso | Pagos, cronograma y estado de cuenta en Mi Portal (Cobranza) |
| Línea de tiempo del ticket (trazabilidad) con cada paso, fecha y responsable por área | App móvil nativa (Mi Portal es web adaptable a celular) |
| Responder lo que pide el gestor, adjuntar documentos y confirmar o rechazar la solución | Inicio de sesión con un proveedor de identidad externo |
| Avisos por correo y WhatsApp en cada cambio de estado, con enlace al ticket |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-24 | Autogestión de tickets del cliente en Mi Portal | Debe | 9 | vie 30-oct → lun 02-nov | — | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-24 (9 h)
- **Supuestos**: El cliente tiene un correo o celular registrado en SIGDA/TAXON para recibir el código de acceso (DEP-01); los tipos y subtipos del flujo (HU-043) son la base del formulario.
- **Restricciones**: El cliente solo ve sus tickets y las interacciones visibles (RN-SVC-044); Ley 29733 de datos personales; el reclamo legal sigue en el Libro de Reclamaciones.
- **Dependencias y riesgos**: DEP-01 SIGDA/TAXON (contacto del cliente) · HU-043 flujos por tipo y subtipo · R-02 APIs externas
- **Criterios de éxito**: 30 % de tickets nuevos registrados por el cliente y 60 % de cierres confirmados en Mi Portal durante el piloto. Indicadores: Tickets registrados por el cliente en Mi Portal: 30 %; Consultas de seguimiento por teléfono y WhatsApp: −40 %; Tickets cerrados con confirmación del cliente: 60 %.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-01 | API de SIGDA/TAXON: consulta de cliente y KYC (única fuente del dato) | Interna | EP-ATC-01, EP-ATC-04, EP-ATC-06, EP-ATC-10 | CDO / Equipo Datos | 21-oct-2026 | Pendiente |

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
