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

### `paquete-definir-etapa1-v1.3/`: el paquete Definir de toda la Etapa 1

Son todas las épicas, funcionalidades e historias de la Etapa 1 según la v1.3, en el formato del SDK (frontmatter de 11 campos
y `ui:`), generadas desde los PDF del PO:

- 11 épicas, 23 funcionalidades, 62 historias y 23 DoR (uno por funcionalidad), ya publicados en Nexora y pendientes de aprobación;
- desde el 21-oct, también análisis, roadmap, 14 ADR, arquitectura, datos, backlog de tareas (321 tareas, 243 h) y los gates G0 a G4 del
  ticket provisional AYB-0001, llevados a la v1.3 desde la última versión de Nexora y publicados el 21-oct;
- el 22 y el 26-oct, las decisiones del Líder Técnico (DT-01 a DT-10) y lo que pidieron su segunda revisión y la de coherencia: 14 ADR en 0.4,
  contrato de 59 operaciones (`0.5.0-borrador`), costo cloud de USD 2.592,53 al mes con PRE, registro de tablas y acta F4 (sin firmar),
  54 dependencias entre historias y 17 entre funcionalidades en 5 olas (las mismas que da `aybar paquete plan`), y la DEP-16 (Control de
  acceso) en 24 historias. El registro de decisiones (`analisis/decisiones.md` 0.6) manda sobre el resto;
- de los 4 desarrolladores: cada documento dice a quién le toca según el PLT-01;
- solo la Etapa 1: no nombra NEXUS, DAEDALUS ni UrbeMind;
- textos del PO tal cual: el «Como / quiero / para», los criterios de aceptación, las reglas, las horas y las fechas no se
  reescriben.

Lo decidido y lo abierto: el stack (D-001) y la clave foránea del ticket a `PARTY` (P-021) ya están **cerradas** por el Líder Técnico
(DT-01 y DT-06, 22-oct), igual que la nube Azure (P-001, DT-07). Siguen **abiertas**, con dueño, las pendientes que lista el README del
paquete; las que más frenan son la DEP-16, Control de acceso en DEV, sin fecha (P-026 y P-040: Sony Montoya), las horas de CQRS y outbox
(P-025: el Líder Técnico y el PO el jue 29-oct, con las horas que confirmen los 4 desarrolladores), la dispensa M0 (P-005: el Data
Chief), las combinaciones del piloto y los textos del PO (P-017 y P-027: el PO) y el dueño de migración de los maestros compartidos
(P-043: el Data Chief con el Líder Técnico). Los pedidos a Sony Montoya siguen sin enviar (los envían Brayan Hurtado y Jesús Chávez).

Para recorrerlo:
- [`README.md`](paquete-definir-etapa1-v1.3/README.md) lo ordena por épica y enlaza cada funcionalidad, su DoR y sus historias;
- [`explorador.html`](paquete-definir-etapa1-v1.3/explorador.html) es la página del SDK (`aybar paquete explorador`) y se abre
  en el navegador sin instalar nada.

[`PLAN-NEXORA.md`](paquete-definir-etapa1-v1.3/PLAN-NEXORA.md) registra las publicaciones del 20, 21 y 26-oct documento por documento.
El 20-oct se subieron 27 versiones 2 y 44 documentos nuevos (las épicas, funcionalidades, historias y DoR, 119 documentos); el 21-oct, el
resto del paquete, y el 26-oct, la versión 0.4 de `analisis/decisiones.md` (v6 en Nexora), el backlog de tareas y 19 DoR. Todo está pendiente de aprobación. Las
correcciones posteriores del 26-oct son locales y están **por publicar**: 131 archivos del paquete difieren de Nexora y 2 son nuevos
(`analisis/proceso-atencion-prospectos.md` y `datos/registro-de-tablas.md`).
[`NEXORA-BRAYAN-v1.3.md`](paquete-definir-etapa1-v1.3/NEXORA-BRAYAN-v1.3.md) tiene el detalle de lo que cambia para Dev 1.

Para validarlo hace falta Java 21:

```bash
aybar paquete validar propuesta-po/documentacion/paquete-definir-etapa1-v1.3
```

Resultado al 26-oct: **0 errores y 0 advertencias**, con 158 documentos, 321 tareas y 243 h (61, 60, 60 y 62 por desarrollador), 0 sin
estimar y 0 sin responsable. `aybar paquete plan` da 5 olas sin ciclos, las del roadmap. Ninguna de las 23 funcionalidades está lista para
construir: faltan el DoR en READY y G2, G3 y G4 aprobados.

Cada documento termina con «Generado por IA … — Revisado por: (pendiente)»: el «Revisado por» lo firma una persona (Jesús Chávez
Elías o Brayan Hurtado), no la IA. Quedan como versión pendiente hasta que los aprueben el PO (épicas, funcionalidades, historias,
análisis, roadmap y backlog), el líder técnico (ADR, arquitectura y datos, con la firma del acta F4 por el Data Chief), el líder técnico
con el project manager (DoR) y quien aprueba cada gate. **El paquete sigue sin aprobar.**

### `nexora-items/`: la carga de ítems de trabajo de PJ-06

PJ-06 sigue sin ítems (0 al 26-oct). `carga-items-pj06.csv` y `carga-items-pj06.json` traen los 96 ítems de la Etapa 1 (11 épicas, 23
funcionalidades y 62 historias) con responsable, horas, fechas, dependencias (54 entre historias, 17 entre funcionalidades) y la ruta de
su documento. Los crea el PO o el administrador de Nexora: el perfil desarrollador no puede. El detalle está en su `README.md`.

### `correcciones-excel-v1.3.md`: lo que se le propone corregir al Excel del PO

El Excel es documento del PO y no se toca. Este archivo lista cada corrección con su hoja, celda, valor actual, valor propuesto y la
fuente en los PDF: RF-SVC-064 a 067 que faltan, la salida del 30-oct frente al 03-nov y la prioridad de RF-001 a 039, entre otras.

### `cobertura-v1.3.md`: el mockup frente a las 62 historias

Para cada historia del PLT-04 dice dónde verla en el mockup. Al 20-oct, las 62 permiten comprobar todos sus criterios.

## Qué no está aquí

- **Lo que manda es Nexora.** El resto del paquete de Jesús (ADR, análisis, arquitectura, datos y roadmap) está aquí desde el 21-oct, pero
  si una versión local no coincide con la aprobada en Nexora, vale Nexora.
- **El modelo de datos corporativo v7 y el arquetipo Party** se compartieron como referencia y no son documentos del alcance
  de ATC. Además, la presentación pesa 18 MB. Se pide al Líder Técnico.

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): cifras al 26-oct (158 documentos, 321 tareas, 0 advertencias, 5 olas), lo que cambió el 22 y el 26-oct, la carpeta `nexora-items/` y qué falta publicar y aprobar. — Revisado por: (pendiente)
