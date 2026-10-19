# Checklist de cierre del G2 por ola

**Para qué sirve:** ordenar lo que falta para que PO y UX puedan aprobar cada envío de G2. No es un gate ni
aprueba nada. Un G2 solo cuenta como aprobado con `estado: approved` en `origin/main`, por un PR aprobado por
los CODEOWNERS de PO y de UX (skill `aybar-gates`). La IA prepara y no firma.

**Leyenda:** `[x]` = ya está escrito en el borrador del envío (sigue en `draft`, sin revisión humana);
`[ ]` = falta, y lo hace la persona o el rol indicado.

## A. Previos transversales (se hacen una vez, valen para las 8 olas)

| # | Qué | Quién | Estado |
|---|---|---|---|
| T1 | **Tickets reales.** Crear en Nexora (proyecto PJ-06, hoy con 0 ítems) un ticket `AYB-NNNN` por envío; luego renombrar `docs/gates/AYB-PENDIENTE*` y los `id: GATE-AYB-NNNN-G2` | PO o TL | [ ] |
| T2 | **Que el G2 sea exigible.** Hoy ninguna HU lleva `ui: true` y el paquete vive en `docs/SCRUM/` fuera del formato Definir, así que `aybar paquete validar` y el guardián de G4 no piden G2. Publicar el paquete por el MCP `nexora` (skill `aybar-nexora-publicar`) con `ui: true` en las HU con pantalla | PO + TL | [ ] |
| T3 | **Versión fija del diseño.** El equipo decidió que el prototipo sustituye a Figma: confirmar con PO y UX que lo aceptan y fijar la versión (hash de commit + versión del artifact), nunca «el archivo vivo». Los 8 envíos hoy citan v8 | UX + PO | [ ] |
| T4 | **Contrato (fila «Contrato» del envío).** No existe el OpenAPI (G3). Decidir: cerrar G3 primero, o cerrar G2 con la fila marcada «pendiente de G3» y una excepción escrita | TL + PO | [ ] |
| T5 | **CODEOWNERS activo.** `.github/CODEOWNERS` está todo comentado: poner los handles reales de PO y UX y activar la protección de `main` (PR obligatorio, revisión de CODEOWNERS) | TL | [ ] |
| T6 | **Evidencia reproducible.** Los guiones de los recorridos en Chrome (44, 29, 34, 19, 30, 28, 39 y 32 comprobaciones) no están en el repo: guardarlos junto al prototipo para que UX pueda repetirlos | Dev | [ ] |
| T7 | **Sección «IA» de cada envío:** nombre y fecha de quien revisó lo que preparó la IA | UX | [ ] |
| T8 | **Responder las 116 preguntas** de `docs/gates/AYB-PENDIENTE/preguntas-po.md` (la columna «Respuesta» está vacía; el prototipo usa el supuesto «a» y lo marca en pantalla) | PO | [ ] |

## B. Por ola

Recomendación de orden: **1 → 2 → 3 → 4 → 5, 6, 7, 8.** La ola 3 (pregunta 32) puede cambiar las derivaciones de la ola 1.

### Ola 1 · EP-ATC-01 y EP-ATC-02 · `docs/gates/AYB-PENDIENTE/G2.md`
**HU:** 001–011 y 029 (12) · **Pantallas:** Bandeja, Nuevo ticket, Detalle de ticket, Reasignar, Alertas, Políticas, Cierre E2E · **Preguntas:** 1–17 · **Pruebas:** `prototipo.test.ts`
- [x] Flujos, matriz HU→CA→pantalla→verificación, estados, accesibilidad y design system escritos
- [ ] PO responde las preguntas 1–17 (formato del N.º, horario hábil, SLA en «Espera cliente», transiciones, plazo del Eje 3…)
- [ ] Validación de stakeholder: PO y supervisor ATC (acta)
- [ ] Si alguna respuesta no es «a», ajustar el prototipo y repetir pruebas y axe
- [ ] T1, T3, T4, T7 aplicados a este envío · [ ] PR aprobado por PO y UX

### Ola 2 · EP-ATC-03 · `docs/gates/AYB-PENDIENTE-EP03/G2.md`
**HU:** 012–016 (5) · **Pantallas:** Libro, Asiento · **Preguntas:** 18–30 · **Pruebas:** `prototipo-libro.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 18–30 (formato del asiento, quién firma por razón social, plazos legales, estados de apelación)
- [ ] Validación de stakeholder: PO y responsable legal de reclamos
- [ ] Confirmar la regla del plazo legal (pregunta 30) antes de aprobar el cálculo
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX

### Ola 3 · EP-ATC-04 · `docs/gates/AYB-PENDIENTE-EP04/G2.md`
**HU:** 020–028 (9) · **Pantallas:** Mesa SGD, Caso SGD, Conflicto del ticket · **Preguntas:** 31–45 · **Pruebas:** `prototipo-mesa.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 31–45 (**la 32 puede cambiar las derivaciones de la ola 1**; pesos de la matriz de riesgo, SLA por línea, umbrales de la escalera)
- [ ] Validación de stakeholder: PO, jefatura legal y Mesa SGD
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX

### Ola 4 · EP-ATC-05 · `docs/gates/AYB-PENDIENTE-EP05/G2.md`
**HU:** 033–036 (4) · **Pantallas:** Garantías, Garantía · **Preguntas:** 46–55 · **Pruebas:** `prototipo-garantias.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 46–55 (cobertura por tipo de defecto, quién registra la inspección, «Resuelto» frente a «Aprobado»)
- [ ] Validación de stakeholder: PO y Postventa
- [ ] Aceptar por escrito las limitaciones: actas ficticias, una sola foto por inspección, sin costeo de reparación
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX

### Ola 5 · EP-ATC-06, 07 y 08 · `docs/gates/AYB-PENDIENTE-EP06-08/G2.md`
**HU:** 017, 018, 019, 030, 031, 032, 037, 038, 039 (9) · **Pantallas:** UrbeMind, Torre, Fest · **Preguntas:** 56–70 · **Pruebas:** `prototipo-ola5.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 56–70 (CSAT 1–5 y CES 1–7, quién opera la Torre, palabras gatillo)
- [ ] Validación de stakeholder: PO, Dirección UX y Coordinación CX
- [ ] **Falta el guion completo de las Frases Ancla** (las HU solo traen el texto de las Frases 4 y 6)
- [ ] Aceptar: sin API Gateway ni bus de eventos (DEP-09) y sin KPI Engine (DEP-10)
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX

### Ola 6 · EP-ATC-09 · `docs/gates/AYB-PENDIENTE-EP09/G2.md`
**HU:** 043–048, 054, 055 (8) · **Pantallas:** Mi día, Configuración, Asistencia al ticket · **Preguntas:** 71–85 · **Pruebas:** `prototipo-ola6.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 71–85 (carga ponderada y su límite, rayo hasta el 10 %, «interacción en curso»)
- [ ] Validación de stakeholder: PO y administrador funcional
- [ ] Aceptar: IA simulada con plantillas, sin correo ni turnos reales; el líder sale de una tabla que imita NEXUS
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX
- Nota: es la ola donde chocan las reglas con la propuesta del PO (ver el paquete aparte `propuesta-po/`)

### Ola 7 · EP-ATC-10 · `docs/gates/AYB-PENDIENTE-EP10/G2.md`
**HU:** 040–042, 049–053 (8) · **Pantallas:** Clientes, Cliente, Consulta 360, Integración con el ticket, Panel de llamada · **Preguntas:** 86–100 · **Pruebas:** `prototipo-ola7.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 86–100 (permisos por rol, interés legal del 8 % y alerta desde S/ 500, riesgo de denuncia)
- [ ] Validación de stakeholder: PO, Legal y TI
- [ ] Aceptar: ninguna integración es real (call center, modelo semántico y herramienta de Legal están por definir)
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX

### Ola 8 · EP-ATC-11 · `docs/gates/AYB-PENDIENTE-EP11/G2.md`
**HU:** 056–060 (5) · **Pantallas:** Morosidad, Ingreso, Buses · **Preguntas:** 101–116 · **Pruebas:** `prototipo-ola8.test.ts`
- [x] Matriz y estados escritos
- [ ] PO responde 101–116 (causal de 3 cuotas, plazos, aforos de bus, confirmaciones)
- [ ] Validación de stakeholder: PO, Cobranza, Legal y Comercial
- [ ] Decidir el hallazgo: los formularios simples (ingreso y bus) los crea el «servicio de formularios», no la persona
- [ ] Decidir si el caso suspendido por reclamo necesita recorrido propio en pantalla
- [ ] T1, T3, T4, T7 · [ ] PR aprobado por PO y UX

## C. Cierre global
- [ ] Índice (`docs/gates/AYB-PENDIENTE/INDICE-G2.md`) actualizado con los tickets reales y el estado de cada envío
- [ ] Las 8 carpetas con `estado: approved` en `origin/main` (dos firmas con nombre en cada una)
- [ ] `aybar paquete validar` en verde, con G2 exigido y aprobado en las HU con `ui: true`
- [ ] Siguiente paso: DoR de cada feature → G4 → construir (hoy no se construye nada sin G3 y G4 aprobados)

## No entra a ningún G2
La propuesta del PO («Vista en vivo» animada, gamificación, escalamiento de tickets comunes al Comité) no
tiene HU aprobada. Va en su propio paquete y sus decisiones, en un bloque aparte de preguntas (desde la 117).
