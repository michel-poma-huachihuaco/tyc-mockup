---
id: "FT-ATC-24"
tipo: feature
titulo: "Integraciones de plataforma: NEXUS y DAEDALUS (Etapa 2)"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.2"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["EP-ATC-10", "AYB-0001"]
tags: [feature, plt-03, etapa-2]
---

# PLT-03 - FT-ATC-24 Integraciones de plataforma: NEXUS y DAEDALUS (Etapa 2)

Va en `docs/features/FT-ATC-24-integraciones-plataforma-nexus-daedalus.md`.

| ID | Nombre | Epica padre |
|---|---|---|
| FT-ATC-24 | Integraciones de plataforma: NEXUS y DAEDALUS (Etapa 2) (`PROC-SVC-023` / `CAP-SVC-018`) | EP-ATC-10 |
| **Product Owner** | **Prioridad (MoSCoW)** | **Estado** |
| Eddie Huamaní | Debe (RF-061, 062) / Debería (RF-063) | Borrador · Etapa 2 (RN-SVC-043) |
| **Release objetivo** | **Estimacion** | **Fecha / Version** |
| Etapa 2 - cierre estimado 15-dic-2026 (Dev 4 · Daniel) | 14 h (3 HU) | 2026-10-19 / v0.2 |

## 1 Descripción y valor

Conecta Aybar Atiende (`aybar-atc`) en la **Etapa 2 (cierre estimado 15-dic-2026)** con las plataformas corporativas en construcción por terceros: **NEXUS** (`ACT-050`: identidad, SSO, roles y estructura organizacional de líderes, áreas, disponibilidad y ceses) y **DAEDALUS** (`ACT-051`: consulta en línea de propuestas comerciales y reservas en la ficha 360 del cliente). Conforme a la regla `RN-SVC-043`, ninguna funcionalidad de la **Etapa 1 (salida 30-oct-2026)** se bloquea por estas integraciones, ya que Etapa 1 opera con usuarios, roles y líderes locales y sin la sección DAEDALUS en la consulta 360.

## 2 Requerimientos funcionales

| ID | Requerimiento | Prioridad (MoSCoW) | Origen | Criterio de verificación | Estado |
|---|---|---|---|---|---|
| RF-SVC-061 | El sistema debe autenticar a los usuarios con el SSO de NEXUS y obtener de NEXUS su rol y área, reemplazando los usuarios y roles locales de la Etapa 1 para todos los usuarios de ATC permitiendo entrar con una sola cuenta corporativa y gestionar los permisos en un solo lugar. | Debe | NEXUS (`ACT-050`) · Decisión PO oct-2026 | Login SSO NEXUS + sincronización auditada de rol/área en `SVC_IDENTITY_LINK` | Propuesto (Etapa 2) |
| RF-SVC-062 | El sistema debe obtener de NEXUS el líder, el área y la disponibilidad de cada gestor de tickets para el correo de asignación con copia al líder, el tablero del equipo y la reasignación por cese o por carga para los supervisores y líderes permitiendo que asignaciones, copias y reasignaciones usen siempre la organización vigente. | Debe | NEXUS (`ACT-050`) · Decisión PO oct-2026 | CC al nuevo líder vigente + propuesta de reasignación en bloque ante cese en NEXUS | Propuesto (Etapa 2) |
| RF-SVC-063 | El sistema debe mostrar en la consulta 360 del cliente la propuesta comercial y la reserva registradas en DAEDALUS (proyecto, lote, precio y estado), consultadas en línea por API para el gestor de tickets permitiendo responder consultas comerciales sin pedir el dato a otra área. | Debería | DAEDALUS (`ACT-051`) · Decisión PO oct-2026 | Visualización en línea sin copia local (RN-SVC-026) + estado «no disponible» sin bloquear la ficha 360 | Propuesto (Etapa 2) |

## 3 Requerimientos no funcionales

| ID | Categoria | Requerimiento | Metrica / umbral |
|---|---|---|---|
| RNF-SEC-001 | Seguridad | Autenticación SSO OAuth2/OIDC corporativa y control de acceso por rol | 100% de rutas protegidas validando JWT del emisor corporativo |
| RNF-DIS-005 | Disponibilidad | Degradación elegante en consulta 360 ante caída de fuente externa (DAEDALUS) | Resto de la ficha 360 carga en ≤ 2 s mostrando «no disponible» en la sección afectada |

## 4 Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-SVC-043 | Etapas del proyecto: Etapa 1 (salida 30-oct-2026) con usuarios, roles y líderes locales y sin UrbeMind/DAEDALUS; Etapa 2 (cierre estimado 15-dic-2026) con integraciones NEXUS, DAEDALUS y UrbeMind | Negocio / Decisión PO |
| RN-SVC-036 | Búsqueda y consulta respetan los permisos del rol y del sistema de origen | Negocio / Ley 29733 |
| RN-SVC-035 | Aviso de asignación por correo con copia al líder inmediato sincronizado desde NEXUS | Negocio |
| RN-SVC-033 | Reasignación automática al gestor disponible del área con menor carga ponderada | Negocio |
| RN-SVC-026 | Cero registros paralelos del dato de cliente o propuesta comercial (consulta en línea a DAEDALUS) | Negocio |

## 5 Trazabilidad

| RF | HU (ATC_requerimientos.xlsx.ods) | Horas / Asignación | Dependencia | Riesgo |
|---|---|---|---|---|
| RF-SVC-061 | HU-ATC-061 — Integrar identidad, SSO y roles con NEXUS | 5 h · Dev 4 (Daniel) (Etapa 2 · cierre est. 15-dic-2026) | HU-ATC-001, DEP-02 (NEXUS SSO/roles) | R-02 |
| RF-SVC-062 | HU-ATC-062 — Sincronizar la estructura organizacional desde NEXUS | 5 h · Dev 4 (Daniel) (Etapa 2 · cierre est. 15-dic-2026) | HU-ATC-061, HU-ATC-008, HU-ATC-046, HU-ATC-054, HU-ATC-055, DEP-02 | R-02 |
| RF-SVC-063 | HU-ATC-063 — Mostrar la propuesta comercial de DAEDALUS en la consulta 360 | 4 h · Dev 4 (Daniel) (Etapa 2 · cierre est. 15-dic-2026) | HU-ATC-050, HU-ATC-051, DEP-16 (DAEDALUS API) | R-02 |

## 6 Fuera de alcance

- Construcción interna de las plataformas NEXUS o DAEDALUS (responsabilidad de terceros).
- Edición o creación de propuestas comerciales desde ATC (solo consulta en línea en la ficha 360).

## 7 Preguntas abiertas

| # | Pregunta | Dueño | Fecha limite | Bloquea G4 |
|---|---|---|---|---|
| P-01 | ¿NEXUS expone OIDC o SAML y qué atributos de rol, área, líder, disponibilidad y cese publica? | TI Corporativa / Proveedor NEXUS | 15-dic-2026 (Etapa 2) | Sí (para Etapa 2) |
| P-02 | ¿Qué contrato de API REST/eventos expone DAEDALUS para consultar propuestas y reservas 1:1 por cliente? | TI Comercial / Proveedor DAEDALUS | 15-dic-2026 (Etapa 2) | Sí (para Etapa 2) |

Generado por IA: incorporado desde `ATC_requerimientos.xlsx.ods` (`PROC-SVC-023`, `CAP-SVC-018`, `RF-SVC-061..063`, Etapa 2) — Revisado por: pendiente
