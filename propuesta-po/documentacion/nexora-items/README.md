# Carga de ítems de trabajo · PJ-06 · Etapa 1

**Para qué.** En Nexora, cada tarjeta de HU dice «Responsable: sin asignar» y «Depende de: libre» porque PJ-06 todavía no tiene ítems de trabajo. Estos dos archivos traen los 96 ítems de la Etapa 1, listos para crearlos: 11 épicas, 23 funcionalidades y 62 historias. Cada ítem lleva su responsable, horas, fechas, iteración, prioridad, dependencias y la ruta de su documento en Nexora.

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
| `horas`, `inicio`, `fin` | Horas con IA y fechas ISO. Salen del PLT-04 para las historias, del PLT-03 para las funcionalidades y del PLT-01 §2b para las épicas. Dan 243 h: 61, 60, 60 y 62 por desarrollador |
| `iteracion` | `1`, `2` o `1;2` |
| `prioridad` | MoSCoW del PO. Las historias flexibles dicen «Podría · flexible» |
| `depende_de` | En una historia, las HU de las que depende (PLT-03, PLT-02, Gantt del PLT-01 y PLT-04): 54 en total. En una funcionalidad, las funcionalidades derivadas de esas HU, con el criterio de `roadmap/analisis-dependencias.md` §4: 17. En una épica, solo las 6 dependencias lógicas del Gantt del PLT-01 y de la PLT-02 (regla de abajo) |
| `dependencias_externas` | Las DEP-xx del bloque «Depende de» de cada historia; en una funcionalidad o una épica, la unión de las de sus historias. La DEP-16 es Control de acceso (PJ-05): el Líder Técnico la puso en lugar de la DEP-02 (DT-03) y la pidió en su revisión (C-12); el PO todavía tiene que aceptarla e incorporarla al PLT-01 (P-026, abierta). La llevan 24 historias |
| `ruta_documento` | Ruta del documento en Nexora, por ejemplo `historias/HU-ATC-001-….md` |

**Orden sugerido.**

1. Crear las épicas.
2. Crear las funcionalidades.
3. Crear las historias.
4. Cuando ya existan los 96 ítems, cargar `depende_de`.

La EP-ATC-04 → EP-ATC-08 (y su HU-025 → HU-037) va contra el calendario del PO. Es el hallazgo A-03 y se carga igual.

**Regla de las épicas.** El `depende_de` de una épica son solo las 6 dependencias lógicas del PO: EP-01 → EP-03, EP-01 → EP-11, EP-02 → EP-04, EP-02 → EP-07, EP-09 → EP-06 (Gantt del PLT-01) y EP-04 → EP-08 (PLT-02). No se deriva de las historias. Dos dependencias entre funcionalidades de épicas distintas llegan por una sola historia y no suben a la épica: FT-ATC-07 → FT-ATC-10 (HU-026 → HU-036) y FT-ATC-13 → FT-ATC-24 (HU-019 → HU-066). A nivel de épica irían contra el calendario: EP-04 termina el 2-nov y EP-05 empieza el 29-oct; EP-07 termina el 2-nov y EP-06 empieza el 30-oct. Se cargan en la historia y en la funcionalidad.

**Dependencias externas de las épicas.** Salen de sus historias. El PLT-01 pone además la DEP-06 en EP-ATC-01, pero ninguna historia de EP-ATC-01 la nombra: no se carga hasta que el PO lo confirme (`roadmap/analisis-dependencias.md` §2). Al revés, por sus historias, la DEP-01 alcanza a EP-ATC-07 (HU-032) y la DEP-05 a EP-ATC-10 (HU-041), aunque el PLT-01 no las pone en esas épicas.

**Después.** Cada desarrollador revisa el bloque «Responsable / Depende de / La necesitan» de sus historias y declara sus dependencias en la declaración de la HU en Nexora. Si al construir aparece otra dependencia, la declara allí y se actualizan la HU y este archivo.

Generado por IA: Brayan Hurtado con IA (Claude), 26-oct-2026, a partir de PLT-01 a PLT-05 v1.3 y DT-03. — Revisado por: (pendiente)

**Historial.**

- 0.1 · 2026-10-26 · Brayan Hurtado, con IA · Versión inicial: 96 ítems con responsable, horas, fechas, iteración, prioridad, dependencias y ruta del documento.
- 0.2 · 2026-10-26 · Brayan Hurtado, con IA · HU-ATC-049 con DEP-16; reglas de las épicas y de sus dependencias externas. — Revisado por: (pendiente)

**Cambios de la 0.2 (26-oct-2026, tarde).** HU-ATC-049 suma la DEP-16 (su regla RN-SVC-036, «Búsqueda respeta permisos», autoriza por rol, como HU-050, 052 y 053; P-034): ya la tenían FT-ATC-20 y EP-ATC-10, así que solo cambia esa fila del CSV y del JSON. Se escriben la regla de las épicas y la de sus dependencias externas. Brayan Hurtado con IA (Claude). — Revisado por: (pendiente)
