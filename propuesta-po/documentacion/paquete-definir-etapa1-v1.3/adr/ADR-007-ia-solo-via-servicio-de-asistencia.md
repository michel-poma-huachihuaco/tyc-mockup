---
id: "ADR-007"
tipo: "adr"
titulo: "ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.2"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-22"
relacionados: [ADR-001, ADR-004, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide

- Estado: propuesto
- Ticket: AYB-0001 · Fecha: 2026-10-22
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pide a Enrique Albán (Data Chief); M0 no está en el repositorio.
- Origen: convierte a la plantilla del marco el ADR-07 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: proveedor con fecha (DEP-14), lista de campos que se anonimizan y `SVC_AI_SUGGESTION_LOG` como cambio al v7. Registrado en `analisis/decisiones.md` v0.3.

## Contexto

Motivo: RN-SVC-032 (la IA asesora y el gestor decide) y RNF-SEC-009 (anonimizar antes de enviar a modelos de IA; está en el Excel (3), hoja `03_RNF`, capa «feedback de la presentación, oct-2026»). El proveedor de IA debe estar aprobado por TI y Seguridad con política de datos personales (DEP-14). Los datos que nunca entran a un prompt están en la skill `aybar-datos-que-no-salen`.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Cada módulo llama al proveedor de IA | Datos personales sin anonimizar y sin registro; imposible auditar qué salió. | — |
| La IA actúa y resuelve sola | Contradice RN-SVC-032: la IA sugiere, el gestor decide. | Que el patrocinador apruebe la propuesta de agente de IA y re-apruebe la regla. |

## Decisión

La IA solo se usa a través de un **servicio de asistencia** que anonimiza antes de enviar y registra cada sugerencia y la decisión del gestor (`SVC_AI_SUGGESTION_LOG`). La IA sugiere; el gestor decide.

1. **Proveedor y fecha (DEP-14).** El proveedor lo aprueban TI y Seguridad, con su política de datos personales. A hoy, **DEP-14 está «Por evaluar», sin proveedor elegido y sin fecha comprometida**; la fecha requerida es el **23-oct** (responsable: TI · Seguridad). Este ADR no puede nombrar un proveedor: lo hará cuando TI y Seguridad respondan. Hasta entonces el servicio se construye contra un **simulador** del mismo contrato (ADR-004). La historia HU-048 y la HU-053 son alcance flexible (R-01) y salen primero si hay atraso.
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
- Cuesta: costo del proveedor de IA: **sin cifra** (sin proveedor ni tarifa, DEP-14); horas en P-025.

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016 del PLT-05) no existe en el v7: cambio propuesto a G3 y a Gobierno de Datos.
- PII: anonimizada antes de salir (lista del punto 2, a confirmar); el registro no guarda texto libre.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-07 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Proveedor pendiente con su fecha requerida (DEP-14), lista de campos anonimizados (propuesta), `SVC_AI_SUGGESTION_LOG` como cambio al v7 con columnas propuestas |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL
