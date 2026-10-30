---
id: "HU-ATC-051"
tipo: hu
titulo: "Continuar la atención cuando la consulta del cliente falla"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3.1"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-28"
relacionados: ["FT-ATC-20", "EP-ATC-10", "HU-ATC-049"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-051 — Continuar la atención cuando la consulta del cliente falla

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-10 / FT-ATC-20
- Como gestor de tickets quiero registrar la solicitud aunque el cliente no se encuentre o el sistema fuente no responda para no perder la solicitud.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-051 | Debe | 3 h con IA | Dev 4 (Daniel) | 1 | 22-oct-2026 | Pendiente DoR |

**Responsable:** Dev 4 · Daniel David Lorenzo Ramos (PLT-01/PLT-04)

**Depende de:** HU-ATC-049 (RF-SVC-049 es predecesora de RF-SVC-051, PLT-03) · Dependencias externas: DEP-01 (API de SIGDA/TAXON; PLT-03, PLT-04 y PLT-05), DEP-13 (motor de consultas de José; PLT-03 y PLT-05), DEP-16 (Control de acceso, PJ-05; añadida el 28-oct-2026 al revisar las operaciones del contrato: las operaciones `registrarTicket`, `consulta360` exigen rol del token (`x-roles`; `arquitectura/roles-y-permisos-atc.md` §5)) · Supuesto de diseño de ATC (28-oct-2026): mapa documento → PartyID para clientes existentes. PJ-05 carga `PARTY` desde `LEGACY_ANTIGUO`, `SLIN` y `URBEMIND` (D-60; HU-IDN-061 CA-12) y no tiene API de búsqueda por documento (D-119: nadie lee las tablas de personas directamente). ATC lo declara como dependencia propia (adaptador y fuente del mapa por definir por ATC, sin plazo) y el simulador no lo prueba

**La necesitan:** ninguna

**Requerimiento de origen:** El sistema debe manejar las excepciones de la consulta del cliente: cliente no encontrado, interesado sin contrato, datos incompletos o sistema fuente no disponible, permitiendo continuar el registro con un flujo controlado. Feedback presentación · ítem 14

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Cliente no encontrado
  Dado un DNI que no existe en SIGDA/TAXON
  Cuando el gestor de tickets registra
  Entonces el ticket se crea como «Interesado» con datos mínimos y queda pendiente de vincular al cliente.

Escenario: CA-02 · Sistema fuente caído
  Dado SIGDA/TAXON no disponible
  Cuando el gestor de tickets busca
  Entonces ve un aviso, registra el ticket con datos mínimos y el sistema reintenta la vinculación automáticamente.

Escenario: CA-03 · Vinculación posterior (agregado por el PO)
  Dado un ticket con vinculación pendiente
  Cuando el sistema fuente vuelve a responder
  Entonces el ticket se vincula al cliente y se registra el cambio en la bitácora.
```

## Reglas de negocio

- RN-SVC-026 Cero registros paralelos del dato de cliente
- RN-SVC-005 Empresa y línea obligatorias

**Fuera de alcance:** Alta de clientes nuevos en SIGDA.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo › Nuevo ticket (modo excepción)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET · DEP-01
- Datos de prueba / analítica (PLT-04): Evento consulta_excepcion {motivo} Preguntas abiertas Confirmar a que se refiere «excepción para la consulta de usuario»: ¿cliente no encontrado, permisos especiales o caída del sistema fuente?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · consulta del cliente
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · consulta 360
- 6.5 Diagrama entidad-relación · búsqueda y consulta

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido — Revisado por: (pendiente)

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude): responsable y dependencias explícitas. — Revisado por: (pendiente)

Actualizado el 28-oct-2026 (v1.3.1) por Jesús Chávez Elías con IA (Claude): añade la dependencia DEP-16 (operaciones con x-roles o cuenta CUSTOMER de Mi Portal) y el supuesto «mapa documento → PartyID» (C11). No cambian criterios de aceptación ni horas. — Revisado por: (pendiente)
