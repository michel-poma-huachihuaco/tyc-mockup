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
| `depende_de` | En una historia, las HU de las que depende (PLT-03, PLT-02, Gantt del PLT-01 y PLT-04). En una funcionalidad, las funcionalidades derivadas de esas HU, con el criterio de `roadmap/analisis-dependencias.md` §4. En una épica, las dependencias lógicas del Gantt del PLT-01 y de la PLT-02 |
| `dependencias_externas` | Las DEP-xx del roadmap. La DEP-16 es Control de acceso (PJ-05): el Líder Técnico la puso en lugar de la DEP-02 (DT-03), y el PO todavía tiene que aceptarla (P-026) |
| `ruta_documento` | Ruta del documento en Nexora, por ejemplo `historias/HU-ATC-001-….md` |

**Orden sugerido.**

1. Crear las épicas.
2. Crear las funcionalidades.
3. Crear las historias.
4. Cuando ya existan los 96 ítems, cargar `depende_de`.

La EP-ATC-04 → EP-ATC-08 (y su HU-025 → HU-037) va contra el calendario del PO. Es el hallazgo A-03 y se carga igual.

**Después.** Cada desarrollador revisa el bloque «Responsable / Depende de / La necesitan» de sus historias y declara sus dependencias en la declaración de la HU en Nexora. Si al construir aparece otra dependencia, la declara allí y se actualizan la HU y este archivo.

Generado por IA: Brayan Hurtado con IA (Claude), 26-oct-2026, a partir de PLT-01 a PLT-05 v1.3 y DT-03. — Revisado por: (pendiente)
