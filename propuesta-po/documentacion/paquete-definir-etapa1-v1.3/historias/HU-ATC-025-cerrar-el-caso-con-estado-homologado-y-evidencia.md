---
id: "HU-ATC-025"
tipo: hu
titulo: "Cerrar el caso con estado homologado y evidencia"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-09", "EP-ATC-04", "HU-ATC-023", "HU-ATC-024"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-025 — Cerrar el caso con estado homologado y evidencia

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-04 / FT-ATC-09
- Como gestor de la Mesa de Casos (SGD) quiero cerrar el caso eligiendo uno de los 8 estados homologados y adjuntando la evidencia para que los cierres sean comparables y los originales queden custodiados en el GLI.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-025 | Debe | 3 h con IA | Dev 2 (Jesús) | 2 | 2-nov-2026 | Pendiente DoR |

**Responsable:** Dev 2 · Jesus Chavez Elias (PLT-01/PLT-04)

**Depende de:** HU-ATC-023 (RF-SVC-023 es predecesora de RF-SVC-025, PLT-03), HU-ATC-024 (RF-SVC-024 es predecesora de RF-SVC-025, PLT-03) · Dependencias externas: DEP-06 (repositorio documental y GLI; PLT-03 y PLT-04)

**La necesitan:** HU-ATC-037

**Requerimiento de origen:** El sistema debe cerrar cada caso en uno de los 8 estados homologados, con evidencia, y referenciar la custodia en el GLI.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Estado homologado
  Dado un caso listo para cerrar
  Cuando lo cierro
  Entonces debo elegir uno de los 8 estados y no puedo cerrar sin evidencia.

Escenario: CA-02 · Custodia
  Dado un original probatorio crítico
  Cuando lo registro
  Entonces la plataforma guarda la referencia al Repositorio Legal GLI y no reemplaza la custodia.
```

## Reglas de negocio

- RN-SVC-019
- RN-SVC-020

**Fuera de alcance:** Custodia física de originales.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Mesa SGD (cierre tipificado)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): DEP-06 GLI · RNF-CUM-007 · nota: el CA-2 del Excel está truncado
- Datos de prueba / analítica (PLT-04): Evento caso_cerrado {estado}
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · escalamiento en cadena
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · escalamiento y cierre
- 6.5 Diagrama entidad-relación · escalamiento y cierre (por modelar · R-06)

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
