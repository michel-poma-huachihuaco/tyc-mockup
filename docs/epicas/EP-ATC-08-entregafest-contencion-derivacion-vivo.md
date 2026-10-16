---
id: "EP-ATC-08"
tipo: epica
titulo: "EntregaFest: contención y derivación en vivo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["AYB-0001", "RMP-001"]
tags: [epica, plt-02]
---

# PLT-02 - EP-ATC-08 EntregaFest: contención y derivación en vivo

Va en `docs/epicas/EP-ATC-08-entregafest-contencion-derivacion-vivo.md`.

| ID | Nombre | Producto |
|---|---|---|
| EP-ATC-08 | EntregaFest: contención y derivación en vivo | Aybar Atiende · Plataforma de Atención al Cliente |
| **Product Owner** | **Sponsor** | **Prioridad (MoSCoW)** |
| Eddie Huamaní | Dirección UX (por confirmar) | Podría |
| **Horizonte** | **Estado** | **Fecha / Version** |
| Siguiente | Borrador | 2026-10-15 / v0.1 |

## 1 Contexto

- **Problema**: en los eventos de entrega (EntregaFest) hay imputaciones públicas (estafa, fraude, abuso, delito) que se debaten en sala y no quedan registradas ni derivadas a Legal.
- **Usuarios**: moderadores de evento, Coordinador CX, Especialista Legal Senior de la Estación 4 y propietarios asistentes.
- **Evidencia**: reglas RN-SVC-028..030; post-mortem de EntregaFest en ≤ 3 días hábiles (RNF-REN-006).
- **Alineamiento**: componente EVT del NPS-C (20%) y reducción del riesgo reputacional.

## 2 Objetivos

Objetivos de negocio:
- OBJ-08: Registrar y derivar a la Estación 4 el 100% de los casos sensibles de cada EntregaFest, con post-mortem en ≤ 3 días hábiles.

Objetivos del usuario:
- El moderador tiene un guion y un registro rápido para cerrar el tema en sala sin debatirlo.

| KPI | Línea base | Meta | Fuente | Frecuencia |
|---|---|---|---|---|
| % de casos sensibles derivados a la Estación 4 | por medir | 100% | Plataforma ATC | Por evento |
| % de eventos con post-mortem a tiempo | por medir | 100% | Plataforma ATC | Por evento |

## 3 Alcance

| Dentro (IN) | Fuera (OUT) |
|---|---|
| Registro de la clasificación de riesgo verbal y de la secuencia de Frases Ancla 4-5-6 | Logística y agenda del evento |
| Detección de palabras de riesgo muy alto y derivación inmediata a la Estación 4 | Guion completo del moderador (lo mantiene Dirección UX) |
| Registro con la etiqueta estándar «Atención especial — derivación a Legal» | Grabación o transcripción automática de audio |

Features:

| ID | Feature | Prioridad (MoSCoW) | Release objetivo |
|---|---|---|---|
| FT-ATC-15 | EntregaFest: contención en vivo | Podría | v1.0 - 30-oct-2026 |

- **Supuestos**: los eventos cuentan con tablet y conectividad; la Estación 4 opera con un especialista legal.
- **Restricciones**: los casos sensibles no se debaten en sala (RN-SVC-028).
- **Dependencias y riesgos**: EP-ATC-04 (gate legal); R-04 adopción.
- **Criterios de éxito**: 100% de derivaciones y post-mortems a tiempo en 3 eventos seguidos.

## 4 Aprobaciones

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | |
| Sponsor | | | |
| Lider tecnico | | | |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad para RF/RN/RNF/HU) y del PDF `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
