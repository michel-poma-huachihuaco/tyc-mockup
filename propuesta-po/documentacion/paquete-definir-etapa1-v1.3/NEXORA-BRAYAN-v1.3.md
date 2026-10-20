# Nexora · Brayan (Dev 1): qué está desactualizado y qué te toca hacer

Revisión del 19-oct-2026 en PJ-06 contra los documentos del PO v1.3 (16-oct). Solo lectura: no se subió nada.

## Estado de Nexora hoy

- PJ-06 tiene 68 documentos, ninguno aprobado, y 0 ítems: sigue sin G0 ni ticket AYB.
- Tus 27 documentos siguen en la v1 que publicamos el 16-oct (las huellas coinciden), escrita sobre la v1.2. El `analisis/decisiones.md` que subió Jesús lo anota como pendiente P-013: «hoy conviven v1.2 (épicas, features, historias y DoR) y v1.3 (roadmap, ADR y datos)».
- Faltan los 6 documentos de la EP-ATC-08 EntregaFest, que en la v1.3 pasa de Dev 3 a ti.

## Documento por documento (33)

| Documento | Qué hacer | Qué cambia |
|---|---|---|
| `dor/DOR-FT-ATC-01-registro-multicanal-y-tipificacion.md` | Versión 2 | Comité DoR el 20-oct (antes 16-oct); horas a confirmar en el cierre funcional del 19-oct; dependencias con fechas v1.3; registro de las 11 ADR v1.3 |
| `dor/DOR-FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md` | Versión 2 | Comité DoR el 20-oct (antes 16-oct); horas a confirmar en el cierre funcional del 19-oct; dependencias con fechas v1.3; registro de las 11 ADR v1.3; condición: antes «DEP-02 (roles)», ahora «DEP-02 maestro local de roles» |
| `dor/DOR-FT-ATC-05-libro-de-reclamaciones.md` | Versión 2 | Comité DoR el 20-oct (antes 16-oct); horas a confirmar en el cierre funcional del 19-oct; dependencias con fechas v1.3; registro de las 11 ADR v1.3; condición: antes «DEP-05 textos al 23-oct», ahora «DEP-05 textos al lun 26-oct» |
| `dor/DOR-FT-ATC-06-apelaciones-internas-e-indecopi.md` | Versión 2 | Comité DoR el 20-oct (antes 16-oct); horas a confirmar en el cierre funcional del 19-oct; dependencias con fechas v1.3; registro de las 11 ADR v1.3 |
| `dor/DOR-FT-ATC-10-reclamos-de-garantia-postventa.md` | Versión 2 | Comité DoR el 20-oct (antes 16-oct); horas a confirmar en el cierre funcional del 19-oct; dependencias con fechas v1.3; registro de las 11 ADR v1.3 |
| `dor/DOR-FT-ATC-15-entregafest-contencion-en-vivo.md` | Crear (v1) | Antes de Dev 3; condición del PO: «Modelo de casos del evento (día 1)» |
| `epicas/EP-ATC-01-nucleo-de-tickets-omnicanal.md` | Versión 2 | Fechas: antes 19-oct a 22-oct, ahora 21-oct a 26-oct. Tablas de funcionalidades, dependencias y riesgos con las fechas v1.3 |
| `epicas/EP-ATC-03-libro-de-reclamaciones-y-apelaciones.md` | Versión 2 | Fechas: antes 22-oct a 27-oct, ahora 26-oct a 29-oct. Tablas de funcionalidades, dependencias y riesgos con las fechas v1.3 |
| `epicas/EP-ATC-05-postventa-reclamos-de-garantia.md` | Versión 2 | Fechas: antes 27-oct a 29-oct, ahora 29-oct a 30-oct. Tablas de funcionalidades, dependencias y riesgos con las fechas v1.3 |
| `epicas/EP-ATC-08-entregafest-contencion-y-derivacion-en-vivo.md` | Crear (v1) | Antes de Dev 3; ahora tuya: 30-oct a 2-nov, 6 h, flexible por sus HU |
| `features/FT-ATC-01-registro-multicanal-y-tipificacion.md` | Versión 2 | Ventana: antes 19-oct a 20-oct, ahora 21-oct a 22-oct. Release «v1.0 · Etapa 1 · 03-nov-2026». Fechas de sus HU en la trazabilidad |
| `features/FT-ATC-02-ciclo-de-vida-interacciones-e-hitos.md` | Versión 2 | Ventana: antes 20-oct a 22-oct, ahora 22-oct a 26-oct. Release «v1.0 · Etapa 1 · 03-nov-2026». Fechas de sus HU en la trazabilidad |
| `features/FT-ATC-05-libro-de-reclamaciones.md` | Versión 2 | Ventana: antes 22-oct a 27-oct, ahora 26-oct a 28-oct. Release «v1.0 · Etapa 1 · 03-nov-2026». Fechas de sus HU en la trazabilidad |
| `features/FT-ATC-06-apelaciones-internas-e-indecopi.md` | Versión 2 | Ventana: antes 27-oct, ahora 28-oct a 29-oct. Release «v1.0 · Etapa 1 · 03-nov-2026». Fechas de sus HU en la trazabilidad |
| `features/FT-ATC-10-reclamos-de-garantia-postventa.md` | Versión 2 | Ventana: antes 27-oct a 29-oct, ahora 29-oct a 30-oct. Release «v1.0 · Etapa 1 · 03-nov-2026». Fechas de sus HU en la trazabilidad |
| `features/FT-ATC-15-entregafest-contencion-en-vivo.md` | Crear (v1) | Antes de Dev 3; ahora tuya: 30-oct a 2-nov, 6 h |
| `historias/HU-ATC-001-registrar-un-ticket-tipificado-desde-cualquier-canal.md` | Versión 2 | Fechas: antes 19-oct a 20-oct, ahora 21-oct. Notas técnicas: en la Etapa 1 se usan usuarios y roles locales de ATC |
| `historias/HU-ATC-002-entregar-al-cliente-un-numero-de-ticket-por-razon-social.md` | Versión 2 | Fechas: antes 20-oct, ahora 21-oct a 22-oct |
| `historias/HU-ATC-004-cambiar-el-estado-del-ticket-con-historial-inmutable.md` | Versión 2 | Fechas: antes 20-oct a 21-oct, ahora 22-oct |
| `historias/HU-ATC-005-registrar-interacciones-visibles-o-internas-con-evidencia.md` | Versión 2 | Fechas: antes 21-oct a 22-oct, ahora 23-oct |
| `historias/HU-ATC-006-conservar-los-hitos-temporales-probatorios.md` | Versión 2 | Fechas: antes 22-oct, ahora 23-oct a 26-oct |
| `historias/HU-ATC-012-registrar-el-asiento-del-libro-de-reclamaciones.md` | Versión 2 | Fechas: antes 22-oct a 23-oct, ahora 26-oct |
| `historias/HU-ATC-013-calcular-el-plazo-legal-y-gestionar-la-prorroga-unica.md` | Versión 2 | Fechas: antes 23-oct, ahora 26-oct a 27-oct |
| `historias/HU-ATC-014-registrar-la-respuesta-formal-con-cargo.md` | Versión 2 | Fechas: antes 26-oct, ahora 27-oct a 28-oct |
| `historias/HU-ATC-015-vigilar-el-plazo-legal-y-detectar-reclamos-huerfanos.md` | Versión 2 | Fechas: antes 26-oct a 27-oct, ahora 28-oct |
| `historias/HU-ATC-016-dar-seguimiento-a-apelaciones-internas-y-ante-indecopi.md` | Versión 2 | Fechas: antes 27-oct, ahora 28-oct a 29-oct |
| `historias/HU-ATC-033-registrar-un-reclamo-de-garantia-vinculado-a-la-entrega.md` | Versión 2 | Fechas: antes 27-oct a 28-oct, ahora 29-oct |
| `historias/HU-ATC-034-validar-la-vigencia-de-la-garantia-contra-la-cobertura.md` | Versión 2 | Fechas: antes 28-oct, ahora 29-oct |
| `historias/HU-ATC-035-registrar-la-inspeccion-tecnica-antes-de-resolver.md` | Versión 2 | Fechas: antes 28-oct, ahora 30-oct |
| `historias/HU-ATC-036-escalar-la-garantia-a-eje-3-y-gestionar-la-adenda.md` | Versión 2 | Fechas: antes 28-oct a 29-oct, ahora 30-oct |
| `historias/HU-ATC-037-registrar-el-riesgo-verbal-y-la-secuencia-de-frases-ancla.md` | Crear (v1) | Antes de Dev 3; ahora tuya: 30-oct a 2-nov, 2 h, flexible |
| `historias/HU-ATC-038-derivar-de-inmediato-a-la-estacion-4-sin-debate.md` | Crear (v1) | Antes de Dev 3; ahora tuya: 2-nov, 2 h, flexible |
| `historias/HU-ATC-039-registrar-el-caso-con-la-etiqueta-estandar.md` | Crear (v1) | Antes de Dev 3; ahora tuya: 2-nov, 2 h, flexible |

En todos cambian la versión (1.2 → 1.3), la fecha (16-oct-2026) y la línea de trazabilidad. Ningún documento menciona la Etapa 2: donde el texto del PO remitía a ella (DEP-02, notas técnicas de la HU-001 y las ADR-04 y 09 de los DoR) se omite esa frase y la línea de trazabilidad lo dice.

## Lo que te toca hacer a ti

1. **Revisar el paquete local**: `paquete-brayan-v13/docs`, 33 documentos, 0 errores con `aybar paquete validar`.
2. **Publicarlo cuando decidas** (mejor después del comité del 20-oct): 27 versiones 2 y 6 nuevos, todos pendientes de aprobación. Se hace con el MCP de Nexora, primero en simulación.
3. **Pedir que se retire la HU-001 duplicada** (`historias/HU-DOC-001 HU-ATC-001-…md.md`, de Daniel). Solo Eddie puede rechazarla.
4. **Ticket:** tus HU dicen «(pendiente: AYB-NNNN)». El `decisiones.md` propone AYB-0001 como marcador provisional (D-005, «Equipo · Provisional»). Si Eddie lo aprueba, va en la versión 2.
5. **Llevar al comité lo que no puedes resolver solo:**
   - el stack (D-001: Java/Spring Boot + Angular, «por confirmar por escrito»);
   - dónde vive el cliente (P-010);
   - el subtipo y la identidad local en tu HU-001;
   - que EntregaFest empieza el 30-oct pero depende de EP-04, que termina el 02-nov.
6. **Para el G4 de tus funcionalidades siguen faltando:**
   - G2 (el diseño de tus 17 HU con pantalla);
   - G3 (líder técnico);
   - las tareas estimadas en `backlog/tareas/`;
   - los casos de prueba de QA.
