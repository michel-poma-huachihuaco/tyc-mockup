# Carga de ítems de trabajo · PJ-06 · Etapa 1

**Para qué.** En Nexora, cada tarjeta de HU dice «Responsable: sin asignar» y «Depende de: libre» porque PJ-06 todavía no tiene ítems de trabajo. Estos dos archivos traen los 96 ítems del paquete, listos para crearlos: 11 épicas, 23 funcionalidades y 62 historias. **Tras P-025 (decidida por el equipo el 26-oct-2026), 89 son de la Etapa 1:** 10 épicas, 22 funcionalidades y 57 historias. Los otros 7 (EP-ATC-08, FT-ATC-15 y HU-ATC-037, 038, 039, 048 y 053) llevan «fuera de E1 (P-025)» en la columna `etapa`: son el alcance flexible del PO (R-01), que se retoma en una etapa posterior. Se cargan igual, para que su documento y sus dependencias no se pierdan. Cada ítem lleva su responsable, horas, fechas, iteración, prioridad, dependencias y la ruta de su documento en Nexora.

**Quién lo carga.** El PO (Eddie Huamaní) o el admin de Nexora. El perfil desarrollador no puede crear ni editar ítems.

**Archivos.**

- `carga-items-pj06.csv`: UTF-8, separado por comas. En las columnas de listas, los códigos van separados por «;».
- `carga-items-pj06.json`: las mismas filas en `items`, con las listas como arreglos.

**Columnas.**

| Columna | Qué lleva |
|---|---|
| `tipo` | `épica`, `funcionalidad` o `historia` |
| `codigo`, `titulo` | Código y título del documento del paquete |
| `padre` | Para una funcionalidad, su épica. Para una historia, su funcionalidad. Las épicas no tienen padre |
| `responsable` | Nombre en Nexora: Dev 1 Brayan Manuel Hurtado Paucar, Dev 2 Jesus Chavez Elias, Dev 3 Michel Poma Huachihuaco, Dev 4 Daniel David Lorenzo Ramos (PLT-01 y PLT-04) |
| `horas`, `inicio`, `fin` | Horas con IA y fechas ISO. Salen del PLT-04 para las historias, del PLT-03 para las funcionalidades y del PLT-01 §2b para las épicas. Las 62 historias dan 243 h (61, 60, 60 y 62 por desarrollador); las 57 de la Etapa 1, 227 h (55, 60, 55 y 57). Las horas de las funcionalidades y épicas son las del PO: en la Etapa 1, FT-ATC-19 tiene 4 h, FT-ATC-20 17 h, EP-ATC-09 39 h y EP-ATC-10 31 h. Las 28 h técnicas de DT-02 (P-025) son tareas del backlog (`backlog/tareas/EP-ATC-01.json`), no ítems |
| `iteracion` | `1`, `2` o `1;2` |
| `prioridad` | MoSCoW del PO. Las historias flexibles dicen «Podría · flexible» |
| `depende_de` | En una historia, las HU de las que depende (PLT-03, PLT-02, Gantt del PLT-01 y PLT-04): 54 en total, 49 entre ítems de la Etapa 1 (desde P-025, HU-ATC-042 depende de HU-ATC-052 en lugar de HU-ATC-053). En una funcionalidad, las funcionalidades derivadas de esas HU, con el criterio de `roadmap/analisis-dependencias.md` §4: 17, 16 entre ítems de la Etapa 1. En una épica, solo las 6 dependencias lógicas del Gantt del PLT-01 y de la PLT-02 (regla de abajo) |
| `dependencias_externas` | Las DEP-xx del bloque «Depende de» de cada historia; en una funcionalidad o una épica, la unión de las de sus historias. La DEP-16 es Control de acceso (PJ-05): el Líder Técnico la puso en lugar de la DEP-02 (DT-03) y la pidió en su revisión (C-12); el equipo la aceptó como riesgo con mitigación (P-026 y ED-08 de `analisis/decisiones.md`) y su incorporación al PLT-01 es del PO. La llevan 24 historias (23 en la Etapa 1). En las funcionalidades y épicas es la unión de todas sus historias documentadas: la DEP-14 de FT-ATC-19, FT-ATC-20, EP-ATC-09 y EP-ATC-10 no aplica en la Etapa 1 (P-025) |
| `etapa` | `E1` o `fuera de E1 (P-025)`. Fuera de la Etapa 1: EP-ATC-08, FT-ATC-15 y HU-ATC-037, 038, 039, 048 y 053. Ningún ítem de la Etapa 1 depende de uno que está fuera |
| `ruta_documento` | Ruta del documento en Nexora, por ejemplo `historias/HU-ATC-001-….md` |

**Orden sugerido.**

1. Crear las épicas.
2. Crear las funcionalidades.
3. Crear las historias.
4. Cuando ya existan los 96 ítems, cargar `depende_de`.

La EP-ATC-04 → EP-ATC-08 (y su HU-025 → HU-037) va contra el calendario del PO. Es el hallazgo A-03 y se carga igual. Tras P-025, EP-ATC-08 está fuera de la Etapa 1 y A-03 queda resuelto en el plan de la Etapa 1; la dependencia se conserva para cuando se retome.

**Regla de las épicas.** El `depende_de` de una épica son solo las 6 dependencias lógicas del PO: EP-01 → EP-03, EP-01 → EP-11, EP-02 → EP-04, EP-02 → EP-07, EP-09 → EP-06 (Gantt del PLT-01) y EP-04 → EP-08 (PLT-02); en la Etapa 1 son 5, porque EP-ATC-08 está fuera. No se deriva de las historias. Dos dependencias entre funcionalidades de épicas distintas llegan por una sola historia y no suben a la épica: FT-ATC-07 → FT-ATC-10 (HU-026 → HU-036) y FT-ATC-13 → FT-ATC-24 (HU-019 → HU-066). A nivel de épica irían contra el calendario: EP-04 termina el 2-nov y EP-05 empieza el 29-oct; EP-07 termina el 2-nov y EP-06 empieza el 30-oct. Se cargan en la historia y en la funcionalidad.

**Dependencias externas de las épicas.** Salen de sus historias. El PLT-01 pone además la DEP-06 en EP-ATC-01, pero ninguna historia de EP-ATC-01 la nombra: no se carga hasta que el PO lo confirme (`roadmap/analisis-dependencias.md` §2). Al revés, por sus historias, la DEP-01 alcanza a EP-ATC-07 (HU-032) y la DEP-05 a EP-ATC-10 (HU-041), aunque el PLT-01 no las pone en esas épicas.

**Después.** Cada desarrollador revisa el bloque «Responsable / Depende de / La necesitan» de sus historias y declara sus dependencias en la declaración de la HU en Nexora. Si al construir aparece otra dependencia, la declara allí y se actualizan la HU y este archivo.

Generado por IA: Brayan Hurtado con IA (Claude), 26-oct-2026, a partir de PLT-01 a PLT-05 v1.3 y DT-03. — Revisado por: (pendiente)

**Historial.**

- 0.1 · 2026-10-26 · Brayan Hurtado, con IA · Versión inicial: 96 ítems con responsable, horas, fechas, iteración, prioridad, dependencias y ruta del documento.
- 0.2 · 2026-10-26 · Brayan Hurtado, con IA · HU-ATC-049 con DEP-16; reglas de las épicas y de sus dependencias externas. — Revisado por: (pendiente)
- 0.3 · 2026-10-26 · Brayan Hurtado, con IA · P-025: columna `etapa` («E1» o «fuera de E1 (P-025)») en el CSV y el JSON; HU-ATC-042 depende de HU-ATC-052; cifras de la Etapa 1 (89 ítems, 57 historias, 227 h; 49, 16 y 5 dependencias); DEP-16 en 23 HU de la Etapa 1 y P-026 como la deja `decisiones.md`. — Revisado por: (pendiente)

**Cambios de la 0.2 (26-oct-2026, tarde).** HU-ATC-049 suma la DEP-16 (su regla RN-SVC-036, «Búsqueda respeta permisos», autoriza por rol, como HU-050, 052 y 053; P-034): ya la tenían FT-ATC-20 y EP-ATC-10, así que solo cambia esa fila del CSV y del JSON. Se escriben la regla de las épicas y la de sus dependencias externas. Brayan Hurtado con IA (Claude). — Revisado por: (pendiente)

**Cambios de la 0.3 (26-oct-2026, noche).** P-025, decidida por el equipo (`analisis/decisiones.md` v0.8): las 5 HU de alcance flexible del PO salen de la Etapa 1 con su épica EP-ATC-08 y su funcionalidad FT-ATC-15. Cambian: la columna nueva `etapa` (al final, en las 96 filas del CSV y en `columnas` e `items` del JSON), la `descripcion` del JSON y el `depende_de` de HU-ATC-042 (HU-ATC-052; FT-ATC-20 sigue siendo predecesora de FT-ATC-17). No cambian horas, fechas, responsables ni prioridades del PO. Brayan Hurtado con IA (Claude). — Revisado por: (pendiente)
