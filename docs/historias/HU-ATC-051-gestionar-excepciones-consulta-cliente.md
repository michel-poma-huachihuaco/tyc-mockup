---
id: "HU-ATC-051"
tipo: hu
titulo: "Gestionar excepciones en la consulta del cliente"
estado: draft
producto: "Aybar Atiende (aybar-atc)"
version: "0.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-15"
relacionados: ["FT-ATC-20", "EP-ATC-10", "AYB-0001"]
tags: [hu]
ui: true
---

# Historia de Usuario (T-HU)

Va en `docs/historias/HU-ATC-051-gestionar-excepciones-consulta-cliente.md`.

- Ticket: [AYB-0001] - Tipo: T3 - Epica/BRD: EP-ATC-10 / docs/analisis/BRD.md
- Como gestor de tickets quiero manejar las excepciones de la consulta del cliente (cliente no encontrado, interesado sin contrato, datos incompletos o sistema fuente no disponible), permitiendo continuar el registro con un flujo controlado, para no perder la solicitud cuando la consulta falla.

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: Continuar el registro cuando el sistema fuente no responde
  Dado que SIGDA/TAXON no está disponible al buscar al cliente
  Cuando el gestor intenta registrar el ticket
  Entonces el sistema permite crear el ticket con los datos mínimos y marca la vinculación del cliente como pendiente
```

## Reglas de negocio

- No aplica una regla de negocio adicional a las ya cubiertas por RF-SVC-051.

## Pantalla (solo con `ui: true`)

- Frames de Figma de esta HU (versión fija): [pendiente - G2 no iniciado]
- Estados que aplican: vacío, carga, error, sin permisos, responsive
- Operaciones del contrato que consume: `POST /api/v1/tickets` con flujo de excepción de cliente (a definir en docs/arquitectura/, G3)

## Datos (CAD-F5)

- Entidades/campos que LEE: SIGDA/TAXON (estado de disponibilidad)
- Entidades/campos que ESCRIBE o modifica: SVC_TICKET (con vinculación de cliente pendiente)
- Migración / backfill / borrado: no
- Checklist CAD-F5: Aprobado con observaciones - entidades presentes en docs/datos/diccionario.md, pero el modelo de F4 sigue en estado: draft y Gobierno de Datos no ha corrido la puerta formal F4 todavia

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: contenido completo, a partir del artefacto de Nexora (fuente de verdad del texto de RF/HU) — Revisado por: pendiente
