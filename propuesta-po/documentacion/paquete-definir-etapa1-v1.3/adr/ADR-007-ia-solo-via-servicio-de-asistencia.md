---
id: "ADR-007"
tipo: "adr"
titulo: "ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.4"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-004, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.4 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora (P-005).
- Origen: convierte a la plantilla del marco el ADR-07 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: proveedor con fecha (DEP-14), lista de campos que se anonimizan y `SVC_AI_SUGGESTION_LOG` como cambio al v7. Registrado en `analisis/decisiones.md` v0.6.

## Contexto

Motivo: RN-SVC-032 (la IA asesora y el gestor decide) y RNF-SEC-009 («Uso seguro de IA»: proveedores aprobados, sin datos personales sin anonimizar y registrando cada sugerencia y su decisión). RNF-SEC-009 **está en el Excel** `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 30, capa «feedback presentación oct-2026 · ítem 8», y también la cita el PLT-01 v1.3 (registro de ADR, ADR-07): se conserva (P-030). El proveedor de IA debe estar aprobado por TI y Seguridad con política de datos personales (DEP-14). Los datos que nunca entran a un prompt están en la skill `aybar-datos-que-no-salen`.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Cada módulo llama al proveedor de IA | Datos personales sin anonimizar y sin registro; imposible auditar qué salió. | — |
| La IA actúa y resuelve sola | Contradice RN-SVC-032: la IA sugiere, el gestor decide. | Que el patrocinador apruebe la propuesta de agente de IA y re-apruebe la regla. |

## Decisión

La IA solo se usa a través de un **servicio de asistencia** que anonimiza antes de enviar y registra cada sugerencia y la decisión del gestor (`SVC_AI_SUGGESTION_LOG`). La IA sugiere; el gestor decide.

1. **Proveedor y fecha (DEP-14).** El proveedor lo aprueban TI y Seguridad, con su política de datos personales. Al 26-oct, **DEP-14 sigue «Por evaluar», sin proveedor elegido y sin fecha comprometida**, y su fecha requerida (**23-oct**, responsable: TI · Seguridad) ya pasó. Este ADR no puede nombrar un proveedor: lo hará cuando TI y Seguridad respondan. Hasta entonces el servicio se construye contra un **simulador** del mismo contrato (ADR-004).
   **Fecha de corte (propuesta del equipo; la deciden el PO y el Líder Técnico):** el jueves **29-oct**, en el control de alcance del roadmap (hito H-06 de `RMP-001`, regla R-01). Si para entonces TI y Seguridad no aprobaron un proveedor con su política de datos personales, **HU-048 y HU-053 salen de la Etapa 1** por R-01 (las dos son «Podría · flexible» del PLT-04) y sus 10 h vuelven a la holgura. La HU-047 (guía de solución, «Debería») también tiene la DEP-14 en el PLT-03 y el PLT-05: qué parte se construye sin proveedor lo decide el PO en el mismo control de alcance. Si hay proveedor, se nombra aquí, en la tabla de ADR-004 y en `arquitectura/costo-cloud.md`.
2. **Qué se anonimiza.** La anonimización es obligatoria para todo texto que sale hacia el proveedor (RNF-SEC-009). Las categorías, según la skill `aybar-datos-que-no-salen` y la Ley 29733, son:
   - **Datos personales:** nombres reales, documentos de identidad (DNI), correos, teléfonos, direcciones y cualquier dato que identifique a una persona;
   - **Secretos:** claves de API, tokens, contraseñas, certificados y claves privadas;
   - **Credenciales** que autentiquen contra un sistema real;
   - **Dumps productivos:** extractos o exportaciones de la base de producción.
   **Lista de campos de ATC que se reemplazan por una marca antes de enviar** (propuesta del equipo, la confirman TI y Seguridad): nombre, DNI, correo y teléfono del cliente o del gestor, dirección, número de contrato, número de ticket visible al cliente, y cualquier número de tarjeta o cuenta que aparezca en texto libre. Si el texto libre contiene un DNI o una tarjeta, el sistema lo advierte antes de guardar (HU-005 CA-04; RN-SVC-012). Q-048-2 («¿se permite enviar datos del cliente al modelo o solo texto anonimizado?») sigue abierta: mientras no se responda, se envía solo texto anonimizado.
3. **Registro.** Cada sugerencia y la decisión del gestor (aceptada, editada o descartada) se guardan sin datos personales (HU-048 CA-02, CA-03).
4. **Tabla `SVC_AI_SUGGESTION_LOG` como cambio al v7.** La entidad (ENT-SVC-016 del PLT-05) **no existe en el v7**: se presenta a Gobierno de Datos como cambio formal (P-031), con estas columnas propuestas: identificador, ticket, versión de la guía usada, hora, resultado de la decisión (aceptada, editada, descartada), identificador del gestor (referencia a `PARTY`) y hash de la sugerencia; sin el texto enviado ni el devuelto, que pueden contener datos personales.

## Consecuencias

- Obliga a:
  - Un adaptador al proveedor aprobado y un simulador (ADR-004) y un anonimizador.
  - Registrar la sugerencia y la decisión del gestor.
  - Que los datos personales y credenciales nunca entren a un prompt ni a datos de prueba.
  - Que TI y Seguridad nombren el proveedor y fijen una fecha comprometida (DEP-14).
  - Presentar `SVC_AI_SUGGESTION_LOG` a Gobierno de Datos (P-031).
- Impide:
  - Enviar datos personales sin anonimizar al proveedor.
  - Que la IA resuelva o cierre un ticket sin la decisión del gestor.
- Cuesta: **USD 0 al mes mientras no haya proveedor**: el servicio corre contra el simulador (ADR-004) dentro del contenedor ya costeado en el ADR-014, y `arquitectura/costo-cloud.md` v0.4 (§1.4) deja el proveedor de IA sin tarifa hasta que TI y Seguridad lo elijan (DEP-14). **5 h** de desarrollo de HU-048, del plan del PO (`backlog/tareas/EP-ATC-09.json`), que incluyen el servicio de asistencia, el anonimizador y el registro; HU-053 suma 5 h.

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016 del PLT-05) no existe en el v7: cambio propuesto a G3 y a Gobierno de Datos.
- PII: anonimizada antes de salir (lista del punto 2, a confirmar); el registro no guarda texto libre.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-07 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Proveedor pendiente con su fecha requerida (DEP-14), lista de campos anonimizados (propuesta), `SVC_AI_SUGGESTION_LOG` como cambio al v7 con columnas propuestas |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Estado de DEP-14 al 26-oct; evidencia de RNF-SEC-009 en el Excel (hoja `03_RNF`, fila 30); costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: fecha de corte propuesta para DEP-14 (29-oct, control de alcance H-06) y su consecuencia: sin proveedor, HU-048 y HU-053 salen de la Etapa 1 por R-01; la deciden el PO y el Líder Técnico |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
