---
id: "HU-ATC-064"
tipo: hu
titulo: "Registrar y consultar mis tickets en Mi Portal"
estado: draft
producto: "Aybar Atiende · Plataforma ATC (DOM-SVC-001)"
version: "1.3"
owner: "Eddie Huamaní (PO)"
aprobadores: []
fecha: "2026-10-16"
relacionados: ["FT-ATC-24", "EP-ATC-06"]
tags: [hu, plt-04]
ui: true
---

# HU-ATC-064 — Registrar y consultar mis tickets en Mi Portal

- Ticket: (pendiente: AYB-NNNN del proyecto) - Tipo: (pendiente: T1/T2/T3) - Épica/feature: EP-ATC-06 / FT-ATC-24
- Como cliente de Aybar quiero registrar mi solicitud y ver la lista de mis tickets sin llamar para tener un número de caso y saber en qué estado está.

| Traza | Prioridad | Horas | Desarrollador | Iteración | Fechas (PLT-04) | Estado |
|---|---|---|---|---|---|---|
| RF-SVC-064 | Debe | 4 h con IA | Dev 4 (Daniel) | 2 | 30-oct-2026 → 2-nov-2026 | Pendiente DoR |

**Requerimiento de origen:** El sistema debe permitir al cliente identificado registrar un ticket desde Mi Portal, con tipo y subtipo guiados, descripción y adjuntos, y consultar la lista de sus tickets con número, estado, área y fecha de compromiso. Propuesta PO v1.3 · decisión de etapas del 16-oct-2026 (EP-ATC-06)

## Criterios de aceptación (Gherkin, verificables)

```gherkin
Escenario: CA-01 · Registro guiado (agregado por el PO)
  Dado que ingresé a Mi Portal con mi DNI y el código enviado a mi correo o celular
  Cuando elijo tipo y subtipo, describo mi caso y adjunto un archivo
  Entonces se crea el ticket con canal «Mi Portal», recibo su número y la fecha de compromiso según el flujo (HU-043).

Escenario: CA-02 · Mis tickets (agregado por el PO)
  Dado que tengo tickets abiertos y cerrados
  Cuando abro «Mis tickets»
  Entonces veo solo los míos con número, tipo, estado, área y fecha de compromiso, ordenados del más reciente al más antiguo.

Escenario: CA-03 · Datos del cliente (agregado por el PO)
  Dado que registro un ticket
  Cuando se guarda
  Entonces los datos del cliente se toman de SIGDA/TAXON y no se crea un registro paralelo (RN-SVC-026).

Escenario: CA-04 · Reclamo legal (agregado por el PO)
  Dado que elijo el tipo «Reclamo» o «Queja»
  Cuando continúo
  Entonces se me deriva al Libro de Reclamaciones con el aviso legal y no se crea un ticket común (EP-ATC-03).

Escenario: CA-05 · Adjunto no permitido (agregado por el PO)
  Dado un archivo de más de 10 MB o de un formato no admitido
  Cuando lo adjunto
  Entonces el sistema lo rechaza e indica el tamaño y los formatos permitidos.
```

## Reglas de negocio

- RN-SVC-005 empresa y línea obligatorias
- RN-SVC-026 cero registros paralelos
- RN-SVC-044 visibilidad para el cliente

**Fuera de alcance:** Libro de Reclamaciones desde Mi Portal; inicio de sesión con un proveedor de identidad externo.

## Pantalla (`ui: true`)

- Referencia del PLT-04: Prototipo Aybar Atiende › Mi Portal › Nuevo ticket y Mis tickets (por diseñar en la etapa de diseño)
- Frames de Figma de esta HU (versión fija): (pendiente: enlace del envío de G2)
- Estados que aplican: (pendiente de G2: vacío / carga / error / sin permisos / responsive)
- Operaciones del contrato que consume: (pendiente: `docs/arquitectura/`)

## Datos (CAD-F5)

- Notas técnicas y dependencias (PLT-04): ENT-SVC-001 SVC_TICKET (canal MI_PORTAL), MAE_TICKET_TYPE y subtipo, adjuntos en S3 · DEP-01 contacto del cliente
- Datos de prueba / analítica (PLT-04): Evento ticket_creado {canal: mi_portal, tipo, subtipo} Preguntas abiertas ¿Qué tipos y subtipos se habilitan al cliente en el piloto? ¿El código de acceso va al correo, al celular o a ambos?
- Entidades que LEE / ESCRIBE: (pendiente de detallar con `docs/datos/`)
- Migración / backfill / borrado: (pendiente)

## Diagramas (PLT-04, sección 6)

- 6.1 Diagrama de estados · ticket visto por el cliente en Mi Portal
- 6.2 Diagrama de procesos AS-IS · situación actual (hipótesis a validar)
- 6.3 Diagrama de procesos TO-BE · situación objetivo
- 6.4 Diagrama de secuencia · registro y seguimiento en Mi Portal
- 6.5 Diagrama entidad-relación · ticket del cliente y su trazabilidad

## DoR (G4) - no entra al sprint sin esto

- [ ] Valor claro - [ ] Gherkin verificable - [ ] Reglas explícitas
- [ ] G2 cerrado si `ui: true` - [ ] G3 cerrado si aplica
- [ ] Dependencias desbloqueadas - [ ] Casos iniciales de QA
- [ ] Estimada por el equipo - [ ] Cabe en un sprint

Generado por IA: transcripción al formato del paquete Definir desde los documentos del PO (PLT-04 v1.3), sin cambiar su contenido Texto adaptado al alcance de la Etapa 1 (se omiten las frases del documento que remiten a fases posteriores). — Revisado por: (pendiente)
