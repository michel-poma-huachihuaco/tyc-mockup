---
id: "ADR-009"
tipo: adr
titulo: "Asistente interno del gestor: un puerto con capacidades, no una integración por caso de uso"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "[Lider tecnico]"
aprobadores: []
fecha: "2026-10-19"
relacionados: ["ADR-008", "ADR-002", "ADR-003", "ADR-007", "FT-ATC-19", "AYB-0001"]
tags: [adr, f4, g3]
---

# ADR-009: Asistente interno del gestor: un puerto con capacidades, no una integración por caso de uso

- Estado: propuesto
- Ticket: AYB-0001 (placeholder) - Fecha: 2026-10-19
- Compatibilidad con M0: [M0 no disponible en este repositorio - verificar con Arquitectura/TL en G3]

## Contexto

El producto va a incorporar un asistente de IA **interno**: ayuda a los gestores
de tickets mientras atienden y no habla con el cliente. Hoy hay dos usos
identificados: `HU-ATC-048` (sugerir respuesta y verificar criterios de cierre) y
`HU-ATC-053` (búsqueda semántica). Se esperan más (resumir un ticket, proponer
la tipificación, redactar una carta de Legal).

`ADR-008` ya obliga a que toda IA pase por un servicio de asistencia que
anonimiza y registra, y `RN-SVC-032` fija que la IA solo sugiere y el gestor
decide. Lo que `ADR-008` no define es la **forma** de ese servicio. Si cada HU
agrega su propio endpoint (`POST /tickets/{id}/sugerencia-ia` para `048`, otro
para `053`), cada capacidad nueva repite el contexto, el filtro de permisos, el
registro y los controles de costo.

Dos decisiones del paquete ya preparan el terreno: la guía de solución
versionada por tipo de ticket (`ENT-SVC-015`, `HU-ATC-047`) es la base de
conocimiento del asistente, y los permisos de la búsqueda se heredan del sistema
de origen (`RN-SVC-036`). La Etapa 1 sale el 30-oct-2026 sin holgura, así que lo
que se decida aquí debe costar poco en esa etapa.

## Opciones evaluadas

| Opción | Por qué no | Qué la haría reconsiderar |
|---|---|---|
| Un endpoint y un registro por cada uso de IA | Cada capacidad nueva duplica anonimización, permisos, registro y control de costo; el registro queda en formatos distintos y no sirve para medir la calidad del asistente | Nunca, si se espera más de dos usos de IA |
| Que el asistente lea la base de datos directamente para armar el contexto | Se salta los permisos de `RN-SVC-036` y copia datos del cliente, contra `ADR-003` | Nunca |
| Plataforma de agentes autónomos que ejecutan acciones en ATC | Fuera de alcance: la IA no actúa sobre tickets, solo sugiere (`RN-SVC-032`); además exigiría otro modelo de permisos y de auditoría | Que el negocio apruebe acciones automáticas y exista proveedor aprobado (`DEP-14`) |
| Un puerto único con capacidades registradas, que arma el contexto con los permisos del gestor (elegida) | - | - |

## Decisión

1. **Un solo puerto de salida `AsistenteIA` en el dominio.** Recibe una
   *capacidad* (`sugerir-respuesta`, `verificar-cierre`, `buscar-semantico`; las
   siguientes se suman sin cambiar el puerto) y una *referencia al contexto*, y
   devuelve una sugerencia. El adaptador del proveedor (`DEP-14`) vive detrás de
   `ADR-007` con simulador, de modo que el proveedor se cambia sin tocar casos de
   uso.
2. **El contexto lo arma la capa de aplicación con los permisos del gestor que
   pide la ayuda.** El asistente nunca consulta tablas ni sistemas por su
   cuenta: lee solo lo que ese gestor puede ver (`RN-SVC-036`) y consulta al
   cliente por API (`ADR-003`). Pasa por la anonimización de `ADR-008` antes de
   salir del perímetro.
3. **Un solo registro, ampliado.** `SVC_AI_SUGGESTION_LOG` (`ENT-SVC-016`) guarda
   por cada sugerencia: ticket, capacidad, versión del modelo y de la plantilla
   de instrucciones, referencias al contexto (identificadores, nunca el texto),
   tokens y latencia, y la decisión del gestor (acepta, edita, descarta). Es
   append-only con el mismo mecanismo de integridad de `ADR-002`. La tasa de
   aceptación por capacidad es la medida de calidad del asistente.
4. **Eventos estables.** Cada sugerencia y cada decisión salen como evento
   (`ia_sugerencia {capacidad, decision}`), y los eventos de ticket (creación,
   asignación, cambio de estado, cierre) mantienen un contrato versionado, para
   que una capacidad futura se suscriba sin modificar el núcleo.
5. **Cada capacidad se puede apagar sola.** Interruptor por capacidad y por
   usuario o área. Sin IA el ticket funciona igual: el asistente nunca está en
   el camino de registrar, asignar ni cerrar.
6. **Límite de uso por capacidad** (tokens por gestor y por día), visible en el
   registro, para que el costo no sorprenda cuando se sumen capacidades.
7. **Etiqueta `ia` en las HU.** Una HU que usa o podría usar el asistente lo
   declara en su front matter (como `ui: true` para pantallas), con la capacidad.
   La definición de terminado de esas HU incluye: registra en
   `SVC_AI_SUGGESTION_LOG`, anonimiza antes de salir, funciona con el interruptor
   apagado y muestra siempre la opción de editar o descartar.

## Consecuencias

- Obliga a: que `HU-ATC-048` y `HU-ATC-053` usen el mismo puerto y el mismo
  registro; que toda capacidad nueva se registre en el puerto, no en un endpoint
  propio; que el contexto se arme con casos de uso de `application`, no con
  consultas directas.
- Impide: que la IA ejecute acciones sobre tickets o escriba al cliente; enviar
  texto de tickets sin anonimizar; guardar texto de tickets en el registro de
  sugerencias.
- Cuesta: en Etapa 1, ampliar el modelo de `ENT-SVC-016` y generalizar el
  contrato de `HU-ATC-048` (mismo trabajo, otra forma; se estima sin horas
  nuevas, a confirmar con el equipo). Después de Etapa 1, cada capacidad nueva es
  una HU pequeña. El costo del proveedor sigue sin estimarse mientras `DEP-14`
  esté pendiente. **Pendiente de confirmar cuando exista proveedor.**

## Cambios que este ADR pide al paquete (no aplicados; los decide el PO y el TL)

| Documento | Cambio propuesto |
|---|---|
| `docs/datos/diccionario.md` (`ENT-SVC-016`) | Agregar capacidad, versión de modelo e instrucciones, referencias al contexto, tokens, latencia |
| `docs/arquitectura/aybar-atc.openapi.yaml` | Reemplazar `POST /tickets/{id}/sugerencia-ia` por un contrato de asistente con capacidad como parámetro (G3) |
| `HU-ATC-048` y `HU-ATC-053` | Marcar `ia`, referenciar este ADR, alinear el nombre de la entidad (`SVC_IA_SUGGESTION` → `SVC_AI_SUGGESTION_LOG`) |
| `docs/dor/` y definición de terminado | Agregar el criterio «listo para IA» a las HU con la etiqueta `ia` |
| Etapa 3 (después del 15-dic-2026) | Épica habilitadora «Asistencia con IA» para las capacidades nuevas (resumen de ticket, propuesta de tipificación, borrador de cartas de Legal) |

## Datos (puerta F4 de Gobierno de Datos)

- Entidades y dueño de dato: `SVC_AI_SUGGESTION_LOG` (ampliada) - dueño: Gestión
  de Tickets.
- Linaje: gestor pide ayuda, la aplicación arma el contexto con sus permisos,
  anonimización, proveedor de IA, sugerencia, decisión del gestor, registro y
  evento.
- PII/sensibilidad: el texto anonimizado sale del perímetro; el registro guarda
  identificadores y la decisión, no el texto del cliente (`RNF-SEC-009`,
  `RN-SVC-012`).
- Reglas de calidad para F10: 100 % de sugerencias registradas con decisión;
  0 sugerencias con datos personales (`RNF-SEC-009`); tasa de aceptación por
  capacidad reportada.

Generado por IA: documento completo, a partir de `ADR-008`, `HU-ATC-048`,
`HU-ATC-053`, `FT-ATC-19`, `RN-SVC-032`, `RN-SVC-036` y el diccionario de datos -
Revisado por: [pendiente, nombre y fecha] - Aprueba: TL
