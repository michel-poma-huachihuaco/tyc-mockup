---
id: "FT-ATC-15"
tipo: feature
titulo: "EntregaFest: contención en vivo"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["EP-ATC-08", "AYB-0001"]
tags: [feature, plt-03]
---

# PLT-03 - FT-ATC-15 EntregaFest: contención en vivo

Va en `docs/features/FT-ATC-15-entregafest-contencion-en-vivo.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-15 | EntregaFest: contención en vivo | EP-ATC-08 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Podría | Borrador |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| v1.0 - 30-oct-2026 | 6 h (talla S) | 2026-10-15 / v0.1 |

## 1 Descripción y valor

Registra la clasificación de riesgo verbal y la secuencia de Frases Ancla, detecta palabras de riesgo muy alto y deriva el caso a la Estación 4 con la etiqueta estándar. Da contención ordenada en eventos y cero casos sensibles sin registro.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-037 | El sistema debe registrar la clasificación de riesgo de la intervención en vivo y la secuencia de Frases Ancla (4, 5, 6) aplicada. | Podría | Moderador de evento | Frase 6 exige registrar el caso | Propuesto |
| RF-SVC-038 | El sistema debe registrar la derivación inmediata a la Estación 4 de todo caso sensible o imputación penal en vivo. | Podría | Moderador de evento | Derivación exigida ante palabra gatillo | Propuesto |
| RF-SVC-039 | El sistema debe registrar todo caso sensible del evento con la etiqueta estándar «Atención especial — derivación a Legal». | Podría | Moderador de evento | Etiqueta literal registrada | Propuesto |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-REN-006 | Rendimiento | Post-mortem de EntregaFest dentro de 3 días hábiles | pct_eventos_con_postmortem_a_tiempo: 100% dentro de 3 días hábiles (gate no compensable) |
| RNF-USA-006 (id a confirmar en el Excel origen) | Usabilidad | Registro rápido desde tablet durante el evento | ≤ 3 toques para derivar |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-028 | Gate: casos sensibles no se debaten en sala: se derivan de inmediato a la Estación 4 | Negocio |
| RN-SVC-029 | Palabras de riesgo muy alto ("estafa", "fraude", "abuso", "delito") obligan canalización formal | Negocio |
| RN-SVC-030 | Secuencia de contención verbal 4-5-6, en ese orden, antes de derivar | Negocio |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-037 | HU-ATC-037 | EP-ATC-04 (gate legal) | R-04 |
| RF-SVC-038 | HU-ATC-038 | EP-ATC-04 | R-04 |
| RF-SVC-039 | HU-ATC-039 | EP-ATC-04 | R-04 |

## 6 Fuera de alcance

- Transcripción automática de audio.
- Logística del evento.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿El registro lo hace el moderador o el personal de apoyo? | PO | por definir | No |
| P-02 | ¿Funciona sin conexión en el recinto? | PO | por definir | Sí |

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) y del PDF `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` — Revisado por: pendiente
