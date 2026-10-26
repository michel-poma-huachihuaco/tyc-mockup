---
id: "ADR-007"
tipo: "adr"
titulo: "ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.5"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-001, ADR-004, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.5 · Fecha: 2026-10-26 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`) · Revisado por: (pendiente)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**. El Líder Técnico la pidió a Enrique Albán (Data Chief) el 22-oct-2026; M0 no está en el repositorio ni en Nexora. La dispensa es una firma, no una condición del contenido (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-07 del PLT-05 v1.3. Incorpora las condiciones de la revisión del Líder Técnico del 22-oct-2026: proveedor con fecha (DEP-14), lista de campos que se anonimizan y `SVC_AI_SUGGESTION_LOG` como cambio al v7. Registrado en `analisis/decisiones.md` v0.7; el proveedor lo decide el equipo (DEP-14, ED-17).

## Contexto

Motivo: RN-SVC-032 (la IA asesora y el gestor decide) y RNF-SEC-009 («Uso seguro de IA»: proveedores aprobados, sin datos personales sin anonimizar y registrando cada sugerencia y su decisión). RNF-SEC-009 **está en el Excel** `ATC_requerimientos (3).xlsx`, hoja `03_RNF`, fila 30, capa «feedback presentación oct-2026 · ítem 8», y también la cita el PLT-01 v1.3 (registro de ADR, ADR-07): se conserva (P-030). El proveedor de IA debe estar habilitado por TI y Seguridad con política de datos personales (DEP-14): esa habilitación es una aprobación, no una condición de este ADR. Los datos que nunca entran a un prompt están en la skill `aybar-datos-que-no-salen`.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Cada módulo llama al proveedor de IA | Datos personales sin anonimizar y sin registro; imposible auditar qué salió. | — |
| La IA actúa y resuelve sola | Contradice RN-SVC-032: la IA sugiere, el gestor decide. | Que el patrocinador apruebe la propuesta de agente de IA y re-apruebe la regla. |

## Decisión

La IA solo se usa a través de un **servicio de asistencia** que anonimiza antes de enviar y registra cada sugerencia y la decisión del gestor (`SVC_AI_SUGGESTION_LOG`). La IA sugiere; el gestor decide.

1. **Proveedor (decisión del equipo, ED-17).** **Azure OpenAI Service** en la suscripción de Azure de ATC (DT-07: Azure para todo ATC), con despliegue estándar global: **`gpt-4o-mini`** (versión 2024-07-18) para las sugerencias de HU-048 y **`text-embedding-3-small`** para la búsqueda vectorial de HU-053 (ADR-012, punto «Búsqueda»). Solo recibe texto anonimizado (punto 2; RNF-SEC-009) y queda en el mismo tenant que el resto de ATC. Credencial por identidad administrada o en Azure Key Vault (ADR-014). Precios de la API pública de Azure del 26-oct-2026: `gpt-4o-mini-0718-Inp-glbl` USD 0,00015 y `gpt-4o-mini-0718-Outp-glbl` USD 0,0006 por 1.000 tokens en `brazilsouth`; `text-embedding-3-small-glbl` USD 0,00002 por 1.000 tokens en `eastus2` (la lista no publica ese medidor en `brazilsouth`). La habilitación de TI y Seguridad en cada ambiente (DEP-14) es una aprobación; mientras no esté, el servicio usa su **simulador** con el mismo contrato (ADR-004). **HU-048 y HU-053 siguen en la Etapa 1**, como las cuenta el PO (alcance flexible, R-01; P-020, ED-17): se retira el corte del 29-oct de la v0.4. Si el recorte de horas de P-025 las alcanza, lo ajusta el coordinador.
2. **Qué se anonimiza.** La anonimización es obligatoria para todo texto que sale hacia el proveedor (RNF-SEC-009). Las categorías, según la skill `aybar-datos-que-no-salen` y la Ley 29733, son:
   - **Datos personales:** nombres reales, documentos de identidad (DNI), correos, teléfonos, direcciones y cualquier dato que identifique a una persona;
   - **Secretos:** claves de API, tokens, contraseñas, certificados y claves privadas;
   - **Credenciales** que autentiquen contra un sistema real;
   - **Dumps productivos:** extractos o exportaciones de la base de producción.
   **Lista de campos de ATC que se reemplazan por una marca antes de enviar** (decisión del equipo): nombre, DNI, correo y teléfono del cliente o del gestor, dirección, número de contrato, número de ticket visible al cliente, y cualquier número de tarjeta o cuenta que aparezca en texto libre. Si el texto libre contiene un DNI o una tarjeta, el sistema lo advierte antes de guardar (HU-005 CA-04; RN-SVC-012). Q-048-2 está decidida: al modelo va **solo texto anonimizado** (HU-048 CA-03; RNF-SEC-009; ED-26).
3. **Registro.** Cada sugerencia y la decisión del gestor (aceptada, editada o descartada) se guardan sin datos personales (HU-048 CA-02, CA-03).
4. **Tabla `SVC_AI_SUGGESTION_LOG` como cambio al v7.** La entidad (ENT-SVC-016 del PLT-05) **no existe en el v7**: va como cambio formal en el acta F4, lista para la firma del Data Chief (P-031, ED-23), con estas columnas: identificador, ticket, versión de la guía usada, hora, resultado de la decisión (aceptada, editada, descartada), identificador del gestor (referencia a `PARTY`) y hash de la sugerencia; sin el texto enviado ni el devuelto, que pueden contener datos personales.

## Consecuencias

- Obliga a:
  - Un adaptador a Azure OpenAI Service, un simulador (ADR-004) y un anonimizador.
  - Registrar la sugerencia y la decisión del gestor.
  - Que los datos personales y credenciales nunca entren a un prompt ni a datos de prueba.
  - Desplegar los dos modelos en la suscripción de cada ambiente cuando TI y Seguridad lo habiliten (DEP-14, riesgo R-02 con el simulador como mitigación).
  - Crear `SVC_AI_SUGGESTION_LOG` con la migración de ATC (acta F4, ED-23).
- Impide:
  - Enviar datos personales sin anonimizar al proveedor.
  - Que la IA resuelva o cierre un ticket sin la decisión del gestor.
- Cuesta: **USD 0,45 al mes en producción** (`arquitectura/costo-cloud.md` v0.5, §1.4; supuestos fijados en ED-12): HU-048, 1.000 sugerencias al mes (2 por ticket × 500 tickets) de 1.500 tokens de entrada y 300 de salida = 1,5 millones × 0,00015 + 0,3 millones × 0,0006 por 1.000 = USD 0,41; HU-053, 2,1 millones de tokens de embeddings al mes (documentos indexados y consultas) × 0,00002 por 1.000 = USD 0,04. En DEV, QA y PRE corre el simulador, salvo las pruebas, que no suman una cifra apreciable. **5 h** de desarrollo de HU-048, del plan del PO (`backlog/tareas/EP-ATC-09.json`), que incluyen el servicio de asistencia, el anonimizador y el registro; HU-053 suma 5 h.

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016 del PLT-05) no existe en el v7: cambio al v7 en el acta F4, lista para la firma del Data Chief (ED-23).
- PII: anonimizada antes de salir (lista del punto 2, decisión del equipo); el registro no guarda texto libre.

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-07 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Proveedor pendiente con su fecha requerida (DEP-14), lista de campos anonimizados (propuesta), `SVC_AI_SUGGESTION_LOG` como cambio al v7 con columnas propuestas |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Estado de DEP-14 al 26-oct; evidencia de RNF-SEC-009 en el Excel (hoja `03_RNF`, fila 30); costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: fecha de corte propuesta para DEP-14 (29-oct, control de alcance H-06) y su consecuencia: sin proveedor, HU-048 y HU-053 salen de la Etapa 1 por R-01; la deciden el PO y el Líder Técnico |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): proveedor decidido, Azure OpenAI Service con `gpt-4o-mini` y `text-embedding-3-small` en despliegue estándar global, con precios de la API pública de Azure (ED-17); se retira el corte del 29-oct y HU-048 y HU-053 siguen en la Etapa 1 (P-020); la habilitación de TI y Seguridad es una aprobación, con el simulador mientras tanto; lista de campos anonimizados y Q-048-2 decididas; `SVC_AI_SUGGESTION_LOG` en el acta F4 (ED-23); costo USD 0,45 al mes en producción |

Generado por IA: borrador completo (Claude, 2026-10-19), versión base v4 de Nexora; actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct y (Claude, 2026-10-26). — Revisado por: (pendiente) · Aprueba: TL
