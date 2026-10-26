---
id: "HU-ATC-047"
tipo: hu
titulo: "Consultar la guía de solución del tipo de ticket"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-19", "EP-ATC-09"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-047 — Consultar la guía de solución del tipo de ticket

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-09 / FT-ATC-19
- Como gestor de tickets quiero ver en el ticket la guía de cómo resolver ese tipo: pasos, plantillas y criterios de cierre para resolver de forma estándar en el primer contacto.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-047 | Debería | 4 h con IA | Dev 3 (Michel) | 1 | 27-oct-2026 | Pendiente DoR |

**Responsable:** Dev 3 · Michel Poma Huachihuaco (PLT-01/PLT-04)

**Depende de:** ninguna (PLT-04) · Dependencias externas: DEP-14 (proveedor de IA aprobado; PLT-03 y PLT-05)

**La necesitan:** HU-ATC-048

**Requerimiento de origen:** El sistema debe mostrar al gestor de tickets una guía de como solucionar cada tipo de ticket (pasos, plantillas de respuesta, documentos requeridos y criterios de cierre) mantenida por el administrador funcional. Feedback presentación · ítem 7

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Guía en el ticket
  Dado un ticket de tipo «Consulta de cuenta»
  Cuando el gestor de tickets lo abre
  Entonces ve la guía de ese tipo con pasos, plantillas y criterios de cierre.

Escenario: CA-02 · Versión
  Dado una guía actualizada por el administrador
  Cuando se publica
  Entonces los gestores de tickets ven la nueva versión y queda el historial de versiones.

Escenario: CA-03 · Tipo sin guía (agregado por el PO)
  Dado un tipo de ticket sin guía publicada
  Cuando abro el ticket
  Entonces veo el aviso «sin guía» y el sistema lo reporta al administrador funcional.
```

## Reglas de negocio

- RN-SVC-023 Gate: cierre fuera de Mi Portal

**Fuera de alcance:** Gestión documental de manuales.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Ticket (panel guía)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-015 SVC_KNOWLEDGE_ARTICLE, ENT-SVC-005 MAE_TICKET_TYPE
- Datos de prueba / analítica (PLT-04): Evento guia_consultada {tipo} Preguntas abiertas ¿Quién redacta y aprueba las guías por área? ¿Existe hoy un manual de atención que sirva de base?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · atención asistida
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · sugerencia de IA
- 6.5 Diagrama entidad-relación · guías y sugerencias

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)
