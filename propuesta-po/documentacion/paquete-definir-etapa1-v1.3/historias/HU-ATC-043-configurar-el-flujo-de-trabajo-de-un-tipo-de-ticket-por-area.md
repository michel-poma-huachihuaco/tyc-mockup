---
id: "HU-ATC-043"
tipo: hu
titulo: "Configurar el flujo de trabajo de un tipo de ticket por área"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-18", "EP-ATC-09"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-043 — Configurar el flujo de trabajo de un tipo de ticket por área

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-18
- Como administrador funcional quiero definir sin desarrollo el flujo de cada tipo y subtipo de ticket por área: responsable, actividades en orden y SLA de cada actividad para adaptar la atención a cada área sin esperar cambios de sistema.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-043 | Debe | 8 h con IA | Dev 3 (Michel) | 1 | 21-oct-2026 → 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-16 (Control de acceso, PJ-05: reemplaza a la DEP-02 del PLT-03, DT-03; rol de administrador funcional, CA-08)

**La necesitan:** HU-ATC-044, HU-ATC-064, HU-ATC-067

**Requerimiento de origen:** El sistema debe permitir configurar, sin desarrollo, el flujo de trabajo de cada combinación de tipo y subtipo de ticket por área, con su responsable, sus actividades en orden y el SLA de cada actividad y del flujo completo. Feedback presentación · ítem 6

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Flujo aplicado
  Dado un flujo publicado para el tipo «Reclamo», subtipo «Garantía postventa» y el área Postventa
  Cuando se registra un ticket de ese tipo y subtipo
  Entonces el orquestador lo envía al área Postventa, lo asigna a su responsable y crea sus actividades en orden, cada una con su SLA.

Escenario: CA-02 · Versión del flujo
  Dado un flujo modificado
  Cuando se publica
  Entonces solo aplica a tickets nuevos y los abiertos conservan su flujo y SLA congelado.

Escenario: CA-03 · Datos obligatorios (agregado por el PO)
  Dado un flujo nuevo
  Cuando el administrador lo guarda
  Entonces el sistema exige tipo, subtipo, área, responsable, al menos una actividad y el SLA de cada actividad; si falta alguno no lo publica e indica cuál.

Escenario: CA-04 · Actividades en orden (agregado por el PO)
  Dado un flujo con las actividades «Inspección», «Informe técnico» y «Respuesta al cliente»
  Cuando se cierra la primera actividad
  Entonces se habilita la siguiente para su responsable (rol o persona) y su SLA empieza a correr en horas hábiles.

Escenario: CA-05 · SLA del flujo (agregado por el PO)
  Dado actividades con SLA de 8, 16 y 8 horas hábiles
  Cuando se publica el flujo
  Entonces el SLA total del ticket es la suma (32 horas hábiles), salvo que la política SLA del tipo sea menor; en ese caso prevalece la política (RN-SVC-001).

Escenario: CA-06 · Combinación única (agregado por el PO)
  Dado un flujo publicado para un tipo, subtipo y área
  Cuando creo otro flujo con la misma combinación
  Entonces el sistema no lo permite y ofrece crear una nueva versión (RN-SVC-045).

Escenario: CA-07 · Sin flujo (agregado por el PO)
  Dado un ticket de un tipo y subtipo sin flujo publicado en el área
  Cuando entra a la bandeja
  Entonces se usa el flujo por defecto del área y se alerta al administrador funcional.

Escenario: CA-08 · Permiso y bitácora (agregado por el PO)
  Dado un usuario sin rol de administrador funcional
  Cuando intenta publicar o modificar un flujo
  Entonces el sistema lo impide; toda publicación queda en bitácora con autor, fecha y versión.
```

## Reglas de negocio

- RN-SVC-045 clave única del flujo
- RN-SVC-006 asignación append-only
- RN-SVC-001 precedencia SLA

**Fuera de alcance:** Editor gráfico de procesos (BPMN); aprobaciones con firma digital.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Configuración › Flujos (tabla tipo · subtipo · área · responsable · actividades · SLA)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-014 SVC_WORKFLOW_DEFINITION (tipo, subtipo, área, versión) y actividades, MAE_AREA, MAE_SLA_POLICY · base del visor 3D (HU-067) y de Mi Portal (HU-064)
- Datos de prueba / analítica (PLT-04): Evento flujo_publicado {area, tipo, subtipo, actividades, sla_total} Preguntas abiertas ¿Cuántas áreas y combinaciones tipo-subtipo tiene el piloto? ¿Quién aprueba los cambios de flujo? ¿Un paso puede tener aprobación?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket en la bandeja orquestadora
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · asignación por la bandeja
- 6.5 Diagrama entidad-relación · flujos y asignación

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
