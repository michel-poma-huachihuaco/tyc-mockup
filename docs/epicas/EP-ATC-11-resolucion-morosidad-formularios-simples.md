---
id: "EP-ATC-11"
tipo: epica
titulo: "Resolución por morosidad y formularios simples"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-11 Resolución por morosidad y formularios simples

Va en `docs/epicas/EP-ATC-11-resolucion-morosidad-formularios-simples.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-11 | Resolución por morosidad y formularios simples | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Gerencia de Cobranza · Gerencia Comercial (por confirmar) | Debe |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Siguiente | Borrador | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: la resolución de contratos con 3 meses impagos depende de seguimiento manual, sin aviso uniforme al cliente ni al responsable del proyecto. Los ingresos de personas al proyecto y las reservas de bus del EntregaFest se anotan en papel o listas.
- **Usuarios**: Cobranza, Legal, responsables de proyecto y sus supervisores, personal de control de acceso, clientes convocados al EntregaFest.
- **Evidencia**: reglas RN-SVC-037..042; necesidad de trazabilidad en campo sin papel ni listas manuales.
- **Alineamiento**: atender toda solicitud con trazabilidad y reducir la cartera morosa con aviso oportuno.

## 2 Objetivos

Objetivos de negocio:
- OBJ-11: El 100% de los contratos con 3 meses impagos tiene caso, alerta al cliente y carta al proyecto en 24 horas, y el 100% de ingresos al proyecto queda registrado, desde el piloto.

Objetivos del usuario:
- El cliente moroso recibe aviso antes de la resolución; el responsable del proyecto se entera a tiempo; el personal de campo registra con un formulario de 1 minuto.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| Casos de resolución con alerta y carta en ≤ 24 h | por medir | 100% | Plataforma ATC | Diaria |
| Contratos regularizados tras la alerta | línea base en el piloto | - | Plataforma ATC | Mensual |
| Ingresos al proyecto con ticket | por medir | 100% | Plataforma ATC | Diaria |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Caso de resolución automático por 3 meses impagos, derivado a Cobranza y Legal | Redacción legal de la resolución contractual y carta notarial (Legal) |
| Alerta de cancelación del servicio al cliente, en paralelo y con constancia | Cobro o refinanciamiento de la deuda (Cobranza) |
| Carta de alerta al responsable del proyecto con copia al supervisor | Contratación del proveedor de buses |
| Formulario simple de ingreso al proyecto que crea ticket | |
| Reserva de cupos de bus del EntregaFest con aforo y lista de espera | |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-22 | Resolución de contrato por morosidad | Debe | v1.0 - 30-oct-2026 |
| FT-ATC-23 | Formularios simples: ingreso al proyecto y EntregaFest | Debería | v1.0 - 30-oct-2026 |

- **Supuestos**: Cobranza entrega el estado de cuotas vencidas por contrato con desfase ≤ 24 h; existe un maestro de responsables de proyecto.
- **Restricciones**: la causal y los textos se validan con Legal antes del pase a producción (propuesta del PO, a validar); máximo 6 campos obligatorios por formulario simple (RNF-USA-004).
- **Dependencias y riesgos**: DEP-08 Cobranza, DEP-15 maestro de responsables de proyecto, DEP-05 validación legal; R-06 alcance ambiguo.
- **Criterios de éxito**: 100% de casos de resolución con alerta y carta en ≤ 24 h; 100% de ingresos al proyecto con ticket desde el piloto.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
