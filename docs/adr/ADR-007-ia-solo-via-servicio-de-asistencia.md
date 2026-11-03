---
id: "ADR-007"
tipo: "adr"
titulo: "ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.9"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-11-03"
relacionados: [ADR-001, ADR-003, ADR-004, ADR-008, ADR-012, ADR-013, ADR-014]
tags: [adr, arquitectura, g3]
---

# ADR-007: IA solo vía servicio de asistencia, con anonimización y registro; la IA sugiere, el gestor decide

- Estado: propuesto
- Ticket: AYB-0001 · Versión 0.9 · Fecha: 2026-11-03 (historial al final)
- Owner: Jesús Chávez Elías (Dev 2) · Aprueba: Líder Técnico (`aprobadores: [tech_lead]`)
- Compatibilidad con M0 (Arquitectura de Directorio): **requiere dispensa (solicitada)**, igual que en la v0.8 (P-005, ED-25).
- Origen: convierte a la plantilla del marco el ADR-07 del PLT-05 v1.3 y, desde la v0.9, **incorpora la arquitectura del Núcleo de IA que entregó el Líder del equipo** (presentación «Núcleo de resolución de reclamos», Aybar Legal v1, y la guía «Agente Legal Aybar»). Esa arquitectura nació para otro proyecto: aquí se toman sus bases y se adaptan a ATC; lo propio de Legal (Notion, Gmail/INDECOPI, cartas notariales, Libro de reclamos, GCP) **no se trae**.
- **Alcance (decisión del 3-nov-2026): el Núcleo de IA entra en la Etapa 1**, lo que **reemplaza la salida de HU-048 por P-025**. HU-053 (búsqueda por significado de documentos) sigue fuera de la Etapa 1. Las horas de las HU nuevas quedan **por estimar por el equipo**; R-01 (243 h de 252 h) queda como riesgo crítico para el PO.

## Contexto

RN-SVC-032 (la IA asesora y el gestor decide) y RNF-SEC-009 («Uso seguro de IA»: proveedores aprobados, sin datos personales sin anonimizar, cada sugerencia y su decisión registradas) siguen vigentes. Lo que cambia es **qué hace la IA**: pasa de un asistente que sugiere texto a un **núcleo que lee el ticket, lo clasifica, redacta un borrador verificado con datos reales y lo deja listo para que el gestor lo apruebe, o lo escala a una persona con un motivo tipificado**. La premisa heredada de la referencia: el sistema no busca acertar siempre; busca que **ninguna respuesta incorrecta llegue al cliente**.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Cada módulo llama al proveedor de IA | Datos personales sin anonimizar y sin registro; no se audita qué salió. | — |
| La IA actúa y resuelve sola | Contradice RN-SVC-032. | Que el patrocinador apruebe un agente autónomo y re-apruebe la regla. |
| Un solo prompt grande con todas las reglas | ~15 mil tokens fijos por llamada; las reglas de dinero, plazos y permisos quedarían a criterio del modelo. | — |
| Cadena de agentes con una librería (p. ej. LangChain) | Abstracción que oculta la llamada al modelo; la reanudación ya la da la máquina de estados propia. | Que más de un módulo comparta el pipeline. |
| Núcleo en Python/FastAPI como servicio aparte (referencia del Líder) | Contradice DT-01 y ADR-001 (monolito Java 21 sobre el SDK) y suma operación por servicio sin horas (R-01). | Medir carga o ritmo de cambio distintos (ADR-001, punto 4: IA es el primer módulo a extraer). |
| Fine-tuning o entrenamiento propio | Congela en los pesos datos que cambian a diario; sin rollback fino; sin datos propios aún. | Evidencia medida de que prompt + skills + corpus no alcanzan. |

## Decisión

La IA se usa **solo a través de un módulo de asistencia dentro del monolito modular** (paquete `assistant`, hexagonal, Java 21; **decisión del 3-nov-2026**: la lógica de la referencia se reimplementa en Java; no hay servicio Python aparte). El módulo es la **única puerta al proveedor**: anonimiza antes de enviar, verifica lo que vuelve y registra cada sugerencia con la decisión del gestor (`SVC_AI_SUGGESTION_LOG`). **La IA propone; el gestor aprueba**: ningún texto sale al cliente sin acción del gestor.

### 1. Fronteras (adaptación de la referencia)

- **Entrada y salida del módulo = dos objetos.** `CasoEntrante` (ticket ya normalizado por ATC: `caso_id`, `trace_id`, `ticket_id`, `party_id` cuando existe, `scopes[]`, `texto` **no confiable y siempre delimitado**, `adjuntos[]` como referencias —nunca bytes—, `recibido_en`, `canal`) y `BorradorSalida` (`estado` = `borrador` | `needs_human`, `intencion`, `texto?`, `claims[]` con su fuente, `veredictos[]`, `motivo_escalamiento?`, `prompt_version`, `costo`). El `canal` es **solo traza**: está prohibido ramificar la lógica por él; una prueba corre el mismo caso con dos canales y exige salida idéntica.
- **El módulo no lee ni escribe tablas de otros módulos** (ADR-001, regla 2). Lee el ticket y los datos del cliente por **puertos de lectura** (consulta 360, ADR-003: nunca se copia el dato) y entrega el resultado por la API pública del módulo de tickets o por un evento del outbox (ADR-013). Es dueño de una sola tabla: `SVC_AI_SUGGESTION_LOG`.
- **Aislamiento por estructura:** ninguna herramienta recibe un identificador de cliente del modelo; el contexto lo inyecta el runtime desde el token (`x-roles`, DEP-16). Acceder a datos de otro cliente es imposible por diseño.
- **Texto no confiable:** el mensaje del cliente nunca asciende a instrucción, en ninguna llamada.

### 2. Pipeline (cuatro llamadas al modelo, el resto es código)

| # | Paso | ¿Modelo? |
|---|---|---|
| 1 | **Guardián de Seguridad (entrada):** scopes contra la intención, patrones de inyección, datos fuera de alcance; si bloquea, deriva sin reintento | No |
| 2 | **Anonimizar** (punto 4) y armar el contexto mínimo | No |
| 3 | **Clasificar** el ticket: tipo/subtipo del catálogo ATC (`MAE_TICKET_TYPE`, ED-14) e intención; un caso mixto o sin tipo **se deriva, no se fuerza** | Sí (1) |
| 4 | **Router** y reglas de vigencia en código: elige la skill y aplica las reglas de plazo y SLA antes de redactar (p. ej. ticket ya vencido o cerrado: se corta aquí) | No |
| 5 | **Skill** del tipo: reúne datos por herramientas (consulta 360, guía de solución, historial del ticket) y arma los hechos | Sí (2) |
| 6 | **Redactor:** escribe el borrador con el estilo del área usando solo esos hechos | Sí (3) |
| 7 | **Guardián de Calidad (salida):** cada monto, fecha y número del borrador debe existir **literal** en la fuente; toda afirmación lleva su fuente; frescura del dato dentro de la ventana | No |
| 8 | **Juez de tono:** tono y lista de prohibidos del área (es el único punto que depende del criterio del modelo) | Sí (4) |
| 9 | **Guardián de Estado:** transiciones por reglas fijas; el modelo solo entra cuando la transición es ambigua | No / Sí |
| 10 | Persistir el resultado y devolver `BorradorSalida` al gestor | No |

Si un guardián rechaza: **un reintento** con el motivo inyectado; el segundo rechazo **escala**. Nunca un tercer intento, nunca «enviar igual». Cualquier excepción, tiempo agotado o presupuesto excedido termina en escalamiento (falla cerrada), nunca en un borrador parcial.

### 3. Piezas y quién decide qué se carga

| Si… | entonces es… |
|---|---|
| Conocimiento que cambia por criterio humano (guía de solución, estilo, plantillas) | **Skill** (versionada en git, HU-047) |
| Dato que vive en otro sistema (cliente 360, SLA, historial) | **Herramienta** por puerto, con simulador (ADR-004) |
| Regla verificable sin juicio (plazos, permisos, montos, fuentes) | **Guardián en código** |
| Varios pasos con contexto propio | **Agente** (solo el orquestador en la Etapa 1) |

Skills de ATC (propuesta; reemplazan a las de Legal): `catalogo-tipificacion`, `guia-de-solucion` (la de HU-047), `reglas-sla-y-plazos`, `estilo-atencion-aybar`, `plantillas-respuesta`. Presupuesto por caso (perfil `atc-tickets`): máx. 10 pasos, 60.000 tokens y 300 s; valores iniciales a medir.

### 4. Anonimización y datos (sin cambio de fondo respecto de la v0.8)

Todo texto que sale hacia el proveedor se anonimiza: nombre, DNI, correo y teléfono del cliente o del gestor, dirección, número de contrato, número de ticket visible al cliente y cualquier número de tarjeta o cuenta en texto libre; más secretos, credenciales y dumps productivos (skill `aybar-datos-que-no-salen`; Ley 29733). El dato real que el borrador necesita (saldo, fecha) **no lo «sabe» el modelo**: viene siempre de una consulta al sistema, se inserta tras la anonimización y el guardián lo compara literal. Se detecta un DNI o una tarjeta en texto libre y se advierte antes de guardar (HU-005 CA-04; RN-SVC-012).

### 5. Conocimiento (tres corpus separados; sin entrenamiento)

| Corpus | Contenido | Regla |
|---|---|---|
| A · Estilo | Respuestas ya enviadas por ATC | Solo correos **efectivamente enviados**; marcado **no citable**; ningún borrador del propio sistema vuelve como ejemplo |
| B · Políticas y guías | Guías por tipo (HU-047), políticas del área | Citable |
| C · Contratos y documentos del cliente | Archivo documental | **Sin índice vectorial**: búsqueda por metadatos exactos cliente-lote (HU-052). Esto deja a HU-053 (búsqueda por significado de documentos del cliente) fuera de la Etapa 1 |

Método: prompt + skills + RAG sobre A y B con ejemplos dinámicos por caso. Un set congelado de ~50 casos corre en cada cambio de prompt o skill y es **puerta de despliegue**: si el resultado baja, no se despliega. Los casos del set pasan primero por la anonimización.

### 6. Catálogo cerrado de motivos de escalamiento (propuesta a validar con el PO)

El módulo solo avisa «necesita persona» con un código; **no decide a quién** (lo hace el flujo de derivación, HU-007). Prefijo = dueño del problema; sin categoría «otro».

| Código | Se dispara cuando | Reintenta |
|---|---|---|
| `SEG_PROMPT_INJECTION` | texto con intento de manipular al sistema | No |
| `SEG_ALCANCE_AJENO` | pide datos de otro cliente o contrato | No |
| `ALC_TIPO_NO_CUBIERTO` | el ticket no encaja en un tipo con skill | No |
| `ALC_CASO_MIXTO` | mezcla varios tipos | No |
| `ALC_LEGAL_SENSIBLE` | reclamo con riesgo legal o de denuncia (se deriva por el gate a Eje 3, FT-ATC-07) | No |
| `DAT_FUENTE_NO_DISPONIBLE` | la consulta 360 falla o está degradada (HU-051) | Sí, 1 vez |
| `DAT_SIN_DATO_DE_RESPALDO` | una afirmación no tiene fuente | No |
| `CAL_DATO_NO_COINCIDE` | monto o fecha no coincide con la fuente tras el reintento | No |
| `CAL_TONO_RECHAZADO` | el juez rechaza tras el reintento | No |
| `OPS_PRESUPUESTO_EXCEDIDO` | pasos, tokens o tiempo agotados | No |
| `OPS_MODELO_NO_DISPONIBLE` | error del proveedor | Sí, 1 vez |

Lectura del tablero: suben los `ALC_` → falta cobertura de skills; suben los `DAT_` → el problema es el dato, no la IA; suben los `CAL_` → prompts y skills.

### 6 bis. Estados del caso de IA

`recibido → en_verificacion → redactando → listo_para_revision → aprobado | derivado`. Cada transición se guarda **antes** de avanzar; si el proceso se interrumpe, el caso retoma donde quedó sin repetir consultas. La persistencia usa `SVC_AI_SUGGESTION_LOG` ampliada con `estado` y `motivo_escalamiento` (**cambio al v7 en el acta F4, pendiente de firma del Data Chief**, ED-23).

### 7. Proveedor y despliegue (decisión del equipo, ED-17; se mantiene Azure)

**Azure OpenAI Service** en la suscripción de ATC (DT-07): **`gpt-4o-mini`** (2024-07-18) para las cuatro llamadas y **`text-embedding-3-small`** para recuperar ejemplos y políticas del corpus (pgvector en la base única; ADR-012 «Búsqueda»). Credencial por identidad administrada o Key Vault (ADR-014). El modelo queda **detrás del puerto**: cambiar de proveedor no toca el módulo. Mientras la habilitación de TI y Seguridad (DEP-14) no esté, corre el **simulador** con el mismo contrato (ADR-004). DEP-14 **vuelve a aplicar en la Etapa 1**. Se descarta Kafka y cualquier base vectorial aparte (pgvector alcanza a este volumen).

### 8. Streaming

Hacia el cliente es imposible por diseño: el guardián valida el texto completo antes de mostrarlo. Hacia la bandeja del gestor solo se informa el avance de la revisión.

## Consecuencias

- Obliga a:
  - Un módulo `assistant` con puertos (modelo, consulta 360, guía, historial), un simulador, el anonimizador, los cuatro guardianes y la máquina de estados.
  - Registrar cada sugerencia, su veredicto y la decisión del gestor (aceptada, editada, descartada) sin datos personales.
  - Que los datos personales y credenciales nunca entren a un prompt ni a los datos de prueba.
  - Un set de evaluación congelado en CI como puerta de despliegue.
  - Operaciones nuevas del contrato (`pedirSugerenciaIa`, `decidirSugerenciaIa` y las de revisión) con roles del token (DEP-16).
- Impide:
  - Enviar datos personales sin anonimizar; que el modelo «sepa» un saldo o un plazo; que la IA resuelva o cierre un ticket sin decisión del gestor; ramificar por canal; un tercer reintento.
- Cuesta (**supuesto, a recalcular en `arquitectura/costo-cloud.md`**): con los tamaños de la referencia (~2.000 tokens en clasificar, ~4.000 en la skill, ~8.000 en redactar, ~2.000 en el juez y ~1.500 de salida por caso) y 500 a 1.000 casos al mes, la inferencia cuesta **USD 1,7 a 3,3 al mes** con los precios de la v0.8 (`gpt-4o-mini`: USD 0,00015 de entrada y 0,0006 de salida por 1.000 tokens); más embeddings (USD 0,04 al mes). El costo dominante es el desarrollo.
- **Horas: por estimar por el equipo** (las 5 h de HU-048 no alcanzan para el pipeline). Quedan HU-ATC-048 (reescrita) y HU-ATC-068 a HU-ATC-072 (nuevas, propuestas). R-01 queda como riesgo crítico para el PO.
- **Excepción solicitada a la regla de «núcleo sin acceso a la base» de la referencia:** el módulo escribe solo su propia tabla de registro y estado; no toca tablas de otros módulos.

## Datos (puerta F4 de Gobierno de Datos)

- `SVC_AI_SUGGESTION_LOG` (ENT-SVC-016 del PLT-05) no existe en el v7: cambio al v7 en el acta F4, lista para la firma del Data Chief (ED-23). Columnas: identificador, ticket, versión de la guía y del prompt usados, hora, estado, motivo de escalamiento, veredictos de los guardianes (códigos), resultado de la decisión (aceptada, editada, descartada), identificador del gestor (referencia a `PARTY`) y hash de la sugerencia; **sin** el texto enviado ni el devuelto.
- Con HU-053 fuera, `SVC_SEARCH_INDEX` (ENT-SVC-017) no cambia (colección del almacén de lectura para HU-049, ADR-012); los embeddings de corpus A y B requieren una tabla de fragmentos que **no existe en el v7** (a definir en el acta F4).
- PII: anonimizada antes de salir; el registro no guarda texto libre.

## Preguntas abiertas

1. ¿El Líder Técnico acepta el módulo Java y la reimplementación de la referencia (esta versión) o prefiere el servicio Python aparte (ADR-001, excepción)?
2. Horas de HU-048 y HU-068 a 072 y qué sale de la Etapa 1 si no caben (R-01).
3. Validar con el PO el catálogo de motivos (punto 6) y la lista de prohibidos del área.
4. Corpus A: ¿existe un histórico de respuestas enviadas por ATC y quién marca cuáles son imitables (revisión humana, fecha, revisor)?

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Borrador |
| 0.1 (v4 en Nexora) | 2026-10-21 | Brayan, con IA | Título completo del ADR-07 |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Proveedor pendiente con su fecha requerida (DEP-14), lista de campos anonimizados (propuesta), `SVC_AI_SUGGESTION_LOG` como cambio al v7 con columnas propuestas |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Estado de DEP-14 al 26-oct; evidencia de RNF-SEC-009 en el Excel (hoja `03_RNF`, fila 30); costo con número y fuente |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo: fecha de corte propuesta para DEP-14 (29-oct, control de alcance H-06) y su consecuencia: sin proveedor, HU-048 y HU-053 salen de la Etapa 1 por R-01; la deciden el PO y el Líder Técnico |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Barrido de coherencia (misma versión, sin cambio de decisión): el origen cita `analisis/decisiones.md` v0.6, la versión vigente (decía v0.5). |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo del 26-oct (`analisis/decisiones.md` v0.7): proveedor decidido, Azure OpenAI Service con `gpt-4o-mini` y `text-embedding-3-small` en despliegue estándar global, con precios de la API pública de Azure (ED-17); se retira el corte del 29-oct y HU-048 y HU-053 siguen en la Etapa 1 (P-020); la habilitación de TI y Seguridad es una aprobación, con el simulador mientras tanto; lista de campos anonimizados y Q-048-2 decididas; `SVC_AI_SUGGESTION_LOG` en el acta F4 (ED-23); costo USD 0,45 al mes en producción |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): HU-048 y HU-053 salen de la Etapa 1 (alcance flexible, R-01). El proveedor (ED-17) queda decidido, sin consumo en la Etapa 1, y se usa cuando entren HU-048 y HU-053; DEP-14 deja de aplicar en la Etapa 1; costo de IA en la Etapa 1: USD 0 (USD 0,45 al mes en PROD cuando entren); `SVC_AI_SUGGESTION_LOG` no se crea en la Etapa 1; tareas en `roadmap/alcance-diferido.md` |
| 0.7 | 2026-10-26 | Brayan Hurtado, con IA | Revisión interna del equipo del 26-oct: sin cambio de decisión. Citas a documentos del paquete sin número de versión, que lo fija Nexora (O-22). Desde esta versión cada cambio de texto sube la versión; las filas repetidas del historial se conservan como registro (O-26) |
| 0.8 | 2026-10-27 | Brayan Hurtado, con IA | Sin cambio de contenido: las revisiones del 26-oct se citan como internas del equipo, no del Líder Técnico (`analisis/decisiones.md`, nota del 27-oct) |
| 0.9 | 2026-11-03 | Jesús Chávez Elías, con IA | Incorpora la arquitectura del Núcleo de IA del Líder del equipo adaptada a ATC: módulo Java en el monolito, pipeline con guardianes, contrato de entrada y salida, catálogo de motivos, estados, corpus, set de evaluación. Entra en la Etapa 1 (reemplaza la salida de HU-048 por P-025); HU-053 sigue fuera; Azure OpenAI se mantiene; horas por estimar |

Generado por IA: actualizado con IA (Claude, 2026-11-03) a partir de las referencias del Líder del equipo; pendiente de revisión humana. — Revisado por: (pendiente) · Aprueba: TL
