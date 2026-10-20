---
id: "EP-ATC-11"
tipo: epica
titulo: "Resolución por morosidad y formularios simples"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-22", "FT-ATC-23"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-11 Resolución por morosidad y formularios simples

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-11 | Resolución por morosidad y formularios simples | Plataforma ATC (DOM-SVC-001) |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Cobranza · Gerencia Comercial (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Versión** |
| mié 28-oct → vie 30-oct 2026 · Dev 4 · 17 h | Refinamiento | 16-oct-2026 · v1.3 |
| **Tipo** | **Desarrollador** | **Horas · iteración** |
| Épica de valor de negocio | Dev 4 (Daniel) | 17 h · iteración 2 |

## 1 Contexto

- **Problema**: La resolución de contratos con 3 meses impagos depende de seguimiento manual, sin aviso uniforme al cliente ni al responsable del proyecto. Los ingresos de personas al proyecto y las reservas de bus del Entrega Fest se anotan en papel o listas.
- **Usuarios**: Cobranza, Legal, responsables de proyecto y sus supervisores, personal de control de acceso, clientes convocados al Entrega Fest.
- **Evidencia**: 2.ª reunión con el área usuaria (oct-2026), ítems 1, 2, 3, 5 y 6; NEC-SVC-010 y NEC-SVC-011; reglas RN-SVC-037…042.
- **Alineamiento**: Atender toda solicitud con trazabilidad (OBJ-SVC-001) y reducir la cartera morosa con aviso oportuno.
- **Procesos**: PROC-SVC-021, PROC-SVC-022

## 2 Objetivos

Objetivo de negocio:
- El 100 % de los contratos con 3 meses impagos tiene caso, alerta al cliente y carta al proyecto en 24 h, y el 100 % de ingresos al proyecto queda registrado, desde el piloto.

Objetivo del usuario:
- El cliente moroso recibe aviso antes de la resolución; el responsable del proyecto se entera a tiempo; el personal de campo registra con un formulario de 1 minuto.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Casos de resolución con alerta y carta en ≤ 24 h | no indicada en el PLT-02 | 100 % | — | — |
| Contratos regularizados tras la alerta | no indicada en el PLT-02 | Línea base en el piloto | — | — |
| Ingresos al proyecto con ticket | no indicada en el PLT-02 | 100 % | — | — |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Caso de resolución automático por 3 meses impagos, derivado a Cobranza y Legal | Redacción legal de la resolución contractual y carta notarial (Legal) |
| Alerta de cancelación del servicio al cliente, en paralelo y con constancia | Cobro o refinanciamiento de la deuda (Cobranza) |
| Carta de alerta al responsable del proyecto con copia al supervisor | Contratación del proveedor de buses |
| Formulario simple de ingreso al proyecto que crea ticket |  |
| Reserva de cupos de bus del Entrega Fest con aforo y lista de espera |  |

Features:

| ID | Feature | Prioridad (MoSCoW) | Horas | Fechas (PLT-01) | Predecesora | Release objetivo |
|---|---|---|---|---|---|---|
| FT-ATC-22 | Resolución de contrato por morosidad | Debe | 10 | mié 28-oct → jue 29-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |
| FT-ATC-23 | Formularios simples: ingreso al proyecto y Entrega Fest | Debería | 7 | jue 29-oct → vie 30-oct | — | v1.0 · Etapa 1 · 03-nov-2026 |

- **Ruta crítica**: FT-ATC-22 (10 h)
- **Supuestos**: Cobranza entrega el estado de cuotas vencidas por contrato con desfase ≤ 24 h (DEP-08); existe un maestro de responsables de proyecto y supervisores (DEP-15).
- **Restricciones**: La causal y los textos se validan con Legal antes del pase a producción (RN-SVC-037); si hay un reclamo abierto, la resolución se suspende hasta responderlo (propuesta del PO, a validar).
- **Dependencias y riesgos**: DEP-08 Cobranza · DEP-15 maestro de responsables de proyecto · DEP-05 validación legal · R-06 alcance ambiguo
- **Criterios de éxito**: 100 % de casos con alerta y carta en 24 h durante el piloto y 0 resoluciones sin aviso previo. Indicadores: Casos de resolución con alerta y carta en ≤ 24 h: 100 %; Contratos regularizados tras la alerta: Línea base en el piloto; Ingresos al proyecto con ticket: 100 %.

Dependencias (PLT-01):

| ID | Dependencia | Tipo | Bloquea a | Responsable | Fecha requerida (PLT-01) | Estado (PLT-01) |
|---|---|---|---|---|---|---|
| DEP-08 | Cobranza: estado de cuenta, historial de pagos y cuotas vencidas por contrato (desfase ≤ 24 h) | Interna | EP-ATC-04, EP-ATC-10, EP-ATC-11 | Cobranza | 21-oct-2026 | Pendiente |
| DEP-15 | Maestro de responsables de proyecto y supervisores (fuente única) | Interna | EP-ATC-11 | Gerencia Comercial · Datos | 29-oct-2026 | Pendiente |
| DEP-05 | Validación legal: formato del asiento, textos y plazos del Libro | Legal | EP-ATC-03, EP-ATC-11 | Gerencia Legal | 26-oct-2026 | Pendiente |

Riesgos (PLT-01):

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Estado |
|---|---|---|---|---|---|---|
| R-06 | Ítems con alcance ambiguo (8 % de interés, rayo, «llamar la cuenta», cancelación del servicio, buses, acceso del cliente a Mi Portal) | Alta | Medio | Cerrarlos en el cierre funcional del 19-oct; lo no resuelto se construye parametrizable | PO | Abierto |

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decisión |
|---|---|---|---|
| Dueño de Producto (PO) | Eddie Huamaní | 16-oct-2026 | Versión del documento |
| Patrocinador | (pendiente) |  |  |
| Líder técnico | (pendiente) |  |  |

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-02 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
