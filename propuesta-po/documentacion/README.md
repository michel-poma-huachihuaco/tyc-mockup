# Documentación de Aybar Atiende · v1.3, Etapa 1 (copia de consulta)

Esta carpeta junta, al lado del mockup, los documentos con los que se construye y se revisa. Así el equipo los encuentra en
el repositorio sin buscarlos en el correo o en Drive. Preparada el 19-oct-2026 por Brayan Hurtado (Dev 1) con asistencia de
IA (Claude).

**Esto no es el paquete Definir del repositorio.** El paquete se escribe y se aprueba en Nexora (proyecto PJ-06). La carpeta
`docs/` del repositorio solo la escribe `aybar paquete sellar` desde Nexora. Nada de lo que hay aquí está aprobado: si algo
no coincide con Nexora, manda Nexora.

## Qué hay

### `po-v1.3/`: los documentos del PO, tal como los publicó el 16-oct-2026

Son la fuente del alcance. El mockup se contrasta con los criterios de aceptación del PLT-04 (`04_Historias…`). Los archivos
están sin cambios; la huella sha256 permite comprobarlo.

| Archivo | Qué es | sha256 (inicio) |
|---|---|---|
| `01_Plan_Maestro_de_Trabajo_Plataforma_ATC_AYBARCORP.pdf` | PLT-01 · Plan maestro: etapas, calendario, capacidad, ADR | `0079f3100ae5da5c` |
| `02_Epicas_Plataforma_ATC_AYBARCORP.pdf` | PLT-02 · 11 épicas | `169bc1cd693d6fdb` |
| `03_Funcionalidades_Catalogo_Requerimientos_Plataforma_ATC_AYBARCORP.pdf` | PLT-03 · 23 funcionalidades y catálogo de requerimientos | `cc0f8b625706a906` |
| `04_Historias_de_Usuario_Plataforma_ATC_AYBARCORP.pdf` | PLT-04 · 62 historias de usuario con sus criterios de aceptación | `70b199bfa7aa34d5` |
| `05_DoR_Definicion_de_Listo_Plataforma_ATC_AYBARCORP.pdf` | PLT-05 · Definición de Listo, dependencias y riesgos | `22a8e2616af0c1c2` |
| `ATC_requerimientos (3).xlsx` | Excel de requerimientos con la división por etapas | `ffef99850ad99f87` |

Una diferencia entre los documentos, ya avisada: el Excel (regla RN-SVC-043) dice «salida 30-oct» y los PDF, 03-nov.

### `paquete-definir-etapa1-v1.3/`: el paquete Definir de toda la Etapa 1, todavía no subido a Nexora

Son todas las épicas, funcionalidades e historias de la Etapa 1 según la v1.3, en el formato del SDK (frontmatter de 11 campos
y `ui:`), generadas desde los PDF del PO:

- 11 épicas, 23 funcionalidades, 62 historias y 23 DoR (uno por funcionalidad);
- de los 4 desarrolladores: cada documento dice a quién le toca según el PLT-01;
- solo la Etapa 1: no nombra NEXUS, DAEDALUS ni UrbeMind;
- textos del PO tal cual: el «Como / quiero / para», los criterios de aceptación, las reglas, las horas y las fechas no se
  reescriben.

Para recorrerlo:
- [`README.md`](paquete-definir-etapa1-v1.3/README.md) lo ordena por épica y enlaza cada funcionalidad, su DoR y sus historias;
- [`explorador.html`](paquete-definir-etapa1-v1.3/explorador.html) es la página del SDK (`aybar paquete explorador`) y se abre
  en el navegador sin instalar nada.

[`NEXORA-BRAYAN-v1.3.md`](paquete-definir-etapa1-v1.3/NEXORA-BRAYAN-v1.3.md) dice qué cambia en Nexora documento por documento
para Dev 1: 27 pasan a versión 2 y 6 son nuevos (la EP-ATC-08 EntregaFest pasa de Dev 3 a Dev 1).

Para validarlo hace falta Java 21:

```bash
aybar paquete validar propuesta-po/documentacion/paquete-definir-etapa1-v1.3
```

Resultado al 20-oct: **sin errores, con 24 advertencias que se esperan en esta etapa**:

- todavía no hay tareas (`backlog/tareas`);
- las 23 funcionalidades tienen pantallas y aún no tienen G2, que aprueban el PO y UX.

Cada documento termina con «Generado por IA … — Revisado por: (pendiente)». Cada responsable publica los suyos en Nexora
cuando el equipo lo decida. Quedan como versión pendiente, porque los aprueba el PO.

### `cobertura-v1.3.md`: el mockup frente a las 62 historias

Para cada historia del PLT-04 dice dónde verla en el mockup. Al 20-oct, las 62 permiten comprobar todos sus criterios.

## Qué no está aquí

- **El paquete del resto del equipo** (Jesús, Michel, Daniel) está en Nexora a nombre de cada uno.
- **El modelo de datos corporativo v7 y el arquetipo Party** se compartieron como referencia y no son documentos del alcance
  de ATC. Además, la presentación pesa 18 MB. Se pide al Líder Técnico.
