---
id: "HU-ATC-058"
tipo: hu
titulo: "Enviar la carta de alerta al responsable del proyecto y su supervisor"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-22", "EP-ATC-11", "HU-ATC-056"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-058 — Enviar la carta de alerta al responsable del proyecto y su supervisor

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-11 / FT-ATC-22
- Como responsable de proyecto quiero recibir una carta de alerta de cada caso de resolución de mi proyecto, con copia a mi supervisor para gestionar el caso antes de que se resuelva.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-058 | Debe | 3 h con IA | Dev 4 (Daniel) | 2 | 29-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-056 (RF-SVC-056 es predecesora de RF-SVC-058, PLT-03) · Dependencias externas: DEP-05 (validación legal del texto de la carta al proyecto; PLT-05), DEP-08 (API de Cobranza; PLT-03 y PLT-05), DEP-15 (maestro de responsables de proyecto y supervisores; PLT-03, PLT-04 y PLT-05), DEP-16 (Control de acceso, PJ-05: supervisor del responsable del proyecto cuando es una jefatura interna, CA-01 y CA-02; el maestro de proyectos es la DEP-15)

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe generar y enviar una carta de alerta al responsable del proyecto del lote, con copia a su supervisor, indicando cliente, deuda, estado del caso y fecha prevista de resolución. Feedback 2.ª reunión · ítem 3

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Carta con copia
  Dado un ticket de resolución de contrato
  Cuando se crea
  Entonces se genera la carta de alerta desde la plantilla y se envía al responsable del proyecto con copia a su supervisor.

Escenario: CA-02 · Escalamiento
  Dado una carta enviada
  Cuando el responsable no registra una acción en el plazo definido
  Entonces el caso se escala al supervisor según la matriz de escalamiento.

Escenario: CA-03 · Sin responsable (agregado por el PO)
  Dado un lote cuyo proyecto no tiene responsable registrado
  Cuando se genera la carta
  Entonces se envía al supervisor del área comercial y se alerta para completar el maestro.
```

## Reglas de negocio

- RN-SVC-039 Carta de alerta al responsable del proyecto
- RN-SVC-035 Aviso de asignación con copia al líder

**Fuera de alcance:** Firma digital de la carta.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Plantilla de carta de alerta
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-018 SVC_CONTRACT_DEFAULT_ALERT, ENT-GOV-004 GOV_DOCUMENT_REPOSITORY · DEP-15
- Datos de prueba / analítica (PLT-04): Evento carta_alerta Preguntas abiertas ¿Quién es el responsable de cada proyecto y su supervisor (fuente maestra)? ¿La carta es un correo formal o un PDF firmado? ¿Qué acción se espera del responsable del proyecto?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · caso de resolución por morosidad
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · apertura del caso de resolución
- 6.5 Diagrama entidad-relación · caso y alertas de morosidad

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
