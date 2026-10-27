---
id: "INTAKE-AYB-0001"
tipo: intake
titulo: "Ficha de Intake - Aybar Atiende"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.5"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-26"
relacionados: ["AYB-0001"]
tags: [intake, g0]
---

# Ficha de Intake (T-INTAKE) - G0

- Ticket: [AYB-0001]. Es el ticket del paquete (`docs/analisis/decisiones.md`, D-005); cuando Nexora tenga el ítem real se reemplaza de una vez, sin cambiar contenido.
- Solicitante: Eddie Huamaní (Dueño de Producto, Aybar Atiende) y la Gerencia de Experiencia del Cliente.
- Problema: hoy la atención al cliente se registra en canales y planillas sueltas (Excel, WhatsApp). Eso incluye los reclamos, las consultas, la postventa, los casos sensibles y la morosidad. No hay un número de ticket único, no se puede trazar el SLA ni el plazo legal del Libro de Reclamaciones y no hay evidencia ante una fiscalización de INDECOPI.
- Valor esperado: toda solicitud del cliente se registra una sola vez, se atiende con un plazo trazable (el SLA se congela al abrir) y se cierra con evidencia auditable. Así desaparecen la exposición legal ante INDECOPI y los registros paralelos del dato de cliente. Se mide con los objetivos de G1 (`docs/analisis/BRD.md` §2): 0 respuestas del Libro fuera del plazo legal, cierre en ≤ 72 horas hábiles sin escalamiento, 0 registros paralelos del cliente, NPS-C y las metas de negocio de cada épica (PLT-02 v1.3).
- Tipo: [T3] (propuesta IA; se aprueba con la firma de G0, PO y TL juntos). Motivo:
  - Es la Etapa 1 completa del plan v1.3 del PO: 11 épicas, 23 funcionalidades y 62 historias de usuario, 243 h en 10 días hábiles de desarrollo (21-oct → 03-nov-2026). Con P-025 (decisión del equipo del 26-oct, `analisis/decisiones.md`), que activa el recorte flexible del R-01 del PO (el PO conserva la decisión de revertirlo), la Etapa 1 queda en 10 épicas, 22 funcionalidades y 57 historias, con 227 h de historias más 28 h técnicas de DT-02: salen las 5 historias de alcance flexible del PO (HU-ATC-037, 038, 039, 048 y 053). Sigue siendo T3.
  - Tiene integraciones externas: SIGDA/TAXON, Cobranza, Contratos y Activos, la plataforma del call center, la herramienta de Legal, el motor de consultas de José y el proveedor de IA (este, sin consumo en la Etapa 1: HU-048 y HU-053 salen por P-025).
  - Tiene implicancias legales: la Ley 29571 (Libro de Reclamaciones) y la Ley 29733 (datos personales).
  - Toca varias áreas de negocio: ATC, Legal, Postventa, Cobranza, Comercial y TI.
  - Queda muy por encima de un cambio T1 o T2.
- Owner de negocio: Eddie Huamaní (PO). Los patrocinadores por épica son la propuesta del PO, que el paquete adopta (decisión del equipo, 26-oct):
  - Gerencia de Experiencia del Cliente: EP-ATC-01, 02, 06 y 09.
  - Gerencia Legal: EP-ATC-03.
  - Gerencia Legal y Dirección UX: EP-ATC-04.
  - Gerencia de Postventa: EP-ATC-05.
  - Dirección UX: EP-ATC-07 y 08 (EP-ATC-08 fuera de la Etapa 1 por P-025).
  - Gerencia de TI y Gerencia Legal: EP-ATC-10.
  - Gerencia de Cobranza y Gerencia Comercial: EP-ATC-11.
  - El detalle está en `docs/roadmap/RMP-001-roadmap-aybar-atiende.md`.
- Duplicado de item existente: [No]. No había un ítem ni un paquete Definir previo para este servicio. El documento duplicado de una historia que hay en Nexora (HU-DOC-001, `decisiones.md` P-019) es un documento repetido, no otro pedido, y no forma parte del paquete: el equipo publica en Nexora una versión «RETIRADO» con id distinto y el PO o el administrador lo borran (ED-21).
- Correo de formalización: [acto formal de G0: lo envía el PO al formalizar el intake]. Todavía no existe un correo real. El acto formal lo hace una persona, no este borrador. Tiene que traer de, para, fecha, asunto y pedido.
- Generado por IA: sí. Versión base de Nexora (v1, de Daniel, 15-oct, sobre el plan v1.2), actualizada a la v1.3 del PO (Etapa 1) por Brayan con IA (Claude, 21-oct-2026). Texto adaptado al alcance de la Etapa 1 (se omiten las frases de los documentos del PO que remiten a fases posteriores). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.3) por Brayan Hurtado con IA (Claude) a partir de las decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): AYB-0001 como ticket del paquete, patrocinadores adoptados, tipo T3 con la firma de G0 y duplicado fuera del paquete. — Revisado por: (pendiente)

Historial: 0.4 · 2026-10-26 · Brayan Hurtado, con IA · P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): alcance de la Etapa 1 en 10 épicas, 22 funcionalidades y 57 historias (227 h de historias más 28 h técnicas de DT-02); EP-ATC-08 y el proveedor de IA sin uso en la Etapa 1. Tipo T3 sin cambio. — Revisado por: (pendiente)

Historial: 0.5 · 2026-10-26 · Brayan Hurtado, con IA · Segunda revisión del Líder Técnico: P-025 como recorte del R-01 del PO, retiro de HU-DOC-001 con una versión «RETIRADO» (ED-21) y citas sin versión. — Revisado por: (pendiente)
