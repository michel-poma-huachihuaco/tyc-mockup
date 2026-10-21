---
id: "FT-ATC-24"
tipo: feature
titulo: "Autogestión de tickets del cliente en Mi Portal"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["EP-ATC-06", "HU-ATC-064", "HU-ATC-065", "HU-ATC-066"]
tags: [feature, plt-03, ui]
---

# PLT-03 - FT-ATC-24 Autogestión de tickets del cliente en Mi Portal

| ID | Nombre | Épica padre |
|---|---|---|
| FT-ATC-24 | Autogestión de tickets del cliente en Mi Portal | EP-ATC-06 Autogestión del cliente y trazabilidad (Mi Portal) |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní (PO) | Debe | Refinamiento |
| **Release objetivo** | **Estimación** | **Fecha / Versión** |
| v1.0 · Etapa 1 · 03-nov-2026 | S·9h · 9 h de desarrollo · Dev 4 | 16-oct-2026 · v1.3 |
| **Desarrollador** | **Ventana (PLT-01)** | **Predecesora** |
| Dev 4 (Daniel) | 30-oct-2026 → 2-nov-2026 | — |

## 1 Descripción y valor

Permite al cliente registrar un ticket, consultar sus tickets con su línea de tiempo (trazabilidad paso a paso) y responder, adjuntar documentos y confirmar la solución desde Mi Portal, con avisos en cada cambio de estado.

**Beneficio:** Menos llamadas de seguimiento y un cliente informado del avance y del plazo de su caso.

**Usuarios:** Cliente · Gestor de tickets · Supervisor ATC

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Horas | Predecesora | Estado |
|---|---|---|---|---|---|---|---|
| RF-SVC-064 | El sistema debe permitir al cliente identificado registrar un ticket desde Mi Portal, con tipo y subtipo guiados, descripción y adjuntos, y consultar la lista de sus tickets con número, estado, área y fecha de compromiso. | Debe | PROC-SVC-001 · Cliente Propuesta PO v1.3 · decisión de etapas del 16-oct-2026 (EP-ATC-06) | Ticket creado con canal «Mi Portal» y visible en «Mis tickets» | 4 | — | Pend. DoR |
| RF-SVC-065 | El sistema debe mostrar al cliente la línea de tiempo de su ticket: cada paso (registrado, asignado, en atención, pendiente del cliente, resuelto, cerrado) con fecha y hora, área responsable y fecha de compromiso, y avisarle por correo y WhatsApp en cada cambio de estado. | Debe | PROC-SVC-002 · Cliente Propuesta PO v1.3 · decisión de etapas del 16-oct-2026 (EP-ATC-06) | Línea de tiempo igual a la bitácora de estados, sin notas internas | 3 | RF-SVC-064 | Pend. DoR |
| RF-SVC-066 | El sistema debe permitir al cliente responder lo que pide el gestor, adjuntar documentos y confirmar o rechazar la solución desde Mi Portal; la confirmación cierra el ticket y el rechazo lo reabre con su motivo. | Debe | PROC-SVC-002 · Cliente Propuesta PO v1.3 · decisión de etapas del 16-oct-2026 (EP-ATC-06) | Respuesta del cliente registrada como interacción y cierre formal en Mi Portal | 2 | RF-SVC-065 | Pend. DoR |

Ruta crítica: RF-SVC-064 → RF-SVC-065 → RF-SVC-066 (9 h).

## 3 Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica / umbral | Prioridad |
|---|---|---|---|---|
| RNF-P (P) | Usabilidad | Mi Portal adaptable a celular: registrar un ticket en pocos pasos | Registro completo en ≤ 3 min desde un celular (prueba con 5 clientes) | Debe |
| RNF-P (P) | Seguridad | Acceso del cliente con código de un solo uso | Código de 6 dígitos, vence en 5 min, máximo 3 intentos | Debe |
| RNF-SEC-008 | Seguridad | DLP en bitácoras y narrativa por rol | acceso_narrativa_por_rol: columnas de narrativa solo para roles de atención/legal | Debe |
| RNF-AUD-004 | Auditoría | Cinco bitácoras append-only firmadas | hash_mismatch: 0 en el job de auditoría | Debe |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-044 | Visibilidad del ticket para el cliente (propuesta PO v1.3). En Mi Portal el cliente solo ve sus propios tickets y las interacciones marcadas como visibles; las notas internas, el gestor asignado y los datos de otras áreas no se muestran | Negocio · Excel 05_Catalogos |
| RN-SVC-023 | Gate: cierre fuera de Mi Portal. Un ticket cerrado fuera de Mi Portal, sin cierre formal en el sistema, es un gate no compensable | Negocio · Excel 05_Catalogos |
| RN-SVC-005 | Empresa y línea obligatorias. CompanyID y BusinessLineID son NOT NULL y no derivables (ContractID es nullable) | Negocio · Excel 05_Catalogos |
| RN-SVC-026 | Cero registros paralelos del dato de cliente. No pueden existir registros paralelos del dato de cliente fuera de SIGDA/TAXON; la auditoría quincenal debe arrojar cero casos y crear uno es gate no compensable | Negocio · Excel 05_Catalogos |

## 5 Trazabilidad

| RF | HU | Dependencia | Riesgo |
|---|---|---|---|
| RF-SVC-064 | HU-ATC-064 · Iteración 2 · Dev 4 · vie 30-oct → lun 02-nov | DEP-01 SIGDA/TAXON (contacto del cliente) | R-02, R-07 |
| RF-SVC-065 | HU-ATC-065 · Iteración 2 · Dev 4 · lun 02-nov | DEP-01 SIGDA/TAXON (contacto del cliente) | R-02, R-07 |
| RF-SVC-066 | HU-ATC-066 · Iteración 2 · Dev 4 · lun 02-nov | DEP-01 SIGDA/TAXON (contacto del cliente) | R-02, R-07 |

Cada RF llega a una HU, y cada criterio de la HU a un TC de `docs/pruebas/test-plan.md` (pendiente: lo define QA).

## 6 Fuera de alcance

- Libro de Reclamaciones desde Mi Portal (EP-ATC-03); pagos y estado de cuenta; app nativa.

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha límite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿Con qué dato inicia sesión el cliente (DNI + código al correo o celular)? ¿Qué tipos y subtipos puede registrar el cliente? ¿Cuántos días tiene para confirmar la solución antes del cierre automático? | (por asignar) | (por definir) | (lo decide el PO) |

Una pregunta que bloquea G4 deja la feature en NO READY. Cuando se responde, la respuesta va a `docs/analisis/decisiones.md` y aquí se enlaza.

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-03 v1.3), sin cambiar su contenido — Revisado por: (pendiente)
