<!-- Renderizado desde datos/marco.json del repositorio aybar-estrategia-tecnica.
     Ese JSON es la fuente; si el marco cambia, esto se regenera, no se edita a mano. -->

# Fases y gates del marco de entrega

Once fases (F0-F10) y diez gates (G0-G9). Un gate no es una reunion: es un criterio objetivo, una evidencia enlazable en el repositorio y una firma humana. Solo `approved` es evidencia valida.

## Fases

| Fase | Nombre | Gate | Responsables |
|---|---|---|---|
| F0 | Intake | G0 | PO aprueba · Stakeholder ejecuta · TL consultado |
| F1 | Discovery | G1 | PO aprueba · Stakeholder ejecuta · TL y QA consultados |
| F2 | Requirements | — | PO aprueba y ejecuta · TL, Dev, QA y UX consultados |
| F3 | UX/UI + IA | G2 | UX ejecuta · PO aprueba · TL consultado si hay impacto técnico |
| F4 | Arquitectura | G3 | TL aprueba y ejecuta · Dev ejecuta · Data Chief consultado si hay desviación de M0 |
| F5 | Refinement | G4 | PO aprueba · equipo ejecuta · SM facilita |
| F6 | Planning | — | PO aprueba · equipo y SM ejecutan |
| F7 | Development | G5 | Dev ejecuta · TL aprueba · QA consultado |
| F8 | QA + Security | G6 G7 | QA aprueba y ejecuta · Dev ejecuta · DevOps en escaneos |
| F9 | Release | G8 | DevOps ejecuta · TL aprueba lo técnico · PO aprueba el negocio |
| F10 | Operación | G9 | DevOps y QA ejecutan · TL aprueba · PO consultado |

### Regla de cada fase

- **F0 Intake**: Sin correo de formalización no hay ítem; sin ficha de intake no hay estimación.
- **F1 Discovery**: Si no se puede escribir cómo sabremos que funcionó, no pasa el gate.
- **F2 Requirements**: Todo requisito no funcional lleva número (p95 < 400 ms), no adjetivos.
- **F3 UX/UI + IA**: Una HU con UI no llega a Ready sin mockup validado. El mockup no se hace dentro del sprint.
- **F4 Arquitectura**: Un ADR que contradice la Arquitectura de Directorio no pasa G3. La dispensa la firman el Data Chief o el Directorio.
- **F5 Refinement**: Una HU sin DoR no entra al Sprint Backlog. Sin excepciones por urgencia.
- **F6 Planning**: El Sprint Backlog no se amplía a mitad de sprint sin retirar trabajo equivalente.
- **F7 Development**: PR pequeño, un propósito por PR, autor distinto del aprobador. Nadie hace merge directo.
- **F8 QA + Security**: QA no reporta a quien desarrolla la HU. El rechazo de QA no se negocia, se corrige.
- **F9 Release**: Nadie despliega producción fuera del pipeline. Sin Rollback Plan no hay despliegue.
- **F10 Operación**: Un release se cierra cuando pasa su ventana de estabilización, no el día del deploy.

## Gates: aprobador, que bloquea y criterios completos

### G0 - Intake Gate

Aprueba **PO** - bloquea: **Entrada al backlog** (fase F0).

- Correo de formalización: de, para, fecha, asunto y pedido
- Ficha de intake completa: solicitante, problema y valor esperado
- Tipo asignado: T1, T2 o T3
- No es duplicado de un ítem existente
- Owner de negocio identificado

### G1 - Discovery Gate

Aprueba **PO** - bloquea: **Paso a requisitos** (fase F1).

- BRD aprobado por el stakeholder
- Objetivos medibles: métrica y valor objetivo
- Alcance y fuera de alcance explícitos
- Riesgos y supuestos registrados

### G2 - Design Gate

Aprueba **PO + UX** - bloquea: **Que la HU sea Ready** (fase F3).

- User flow documentado
- Mockup en Figma con enlace versionado
- Prototipo cuando hay interacción no trivial
- Estados cubiertos: vacío, carga, error, sin permisos, responsive
- Consistencia con el design system verificada
- Accesibilidad básica: contraste, foco, teclado, etiquetas
- Validación de stakeholder registrada
- Si hubo IA: revisión humana explícita registrada

### G3 - Architecture Gate

Aprueba **TL** - bloquea: **Inicio de desarrollo** (fase F4).

- La decisión es compatible con la Arquitectura de Directorio (M0), o hay dispensa firmada por Data Chief o Directorio
- ADR con contexto, opciones evaluadas, decisión y consecuencias
- Diagrama de arquitectura actualizado
- Contrato de API versionado con compatibilidad declarada
- Cambios de modelo de datos identificados
- Seguridad: authn, authz, datos sensibles y secretos
- Impacto en costo cloud estimado
- Estrategia de migración y reversión esbozada

### G4 - Definition of Ready

Aprueba **PO** - bloquea: **Entrada al sprint** (fase F5).

- Historia con valor claro para el usuario
- Criterios de aceptación verificables en Gherkin
- Reglas de negocio explícitas
- Diseño UX aprobado si hay UI (G2 cerrado)
- ADR aprobado si aplica (G3 cerrado)
- Dependencias identificadas y desbloqueadas
- Consideraciones técnicas y de datos
- Casos de prueba iniciales definidos por QA
- Estimada por el equipo
- Cabe en un sprint

### G5 - Code Gate

Aprueba **TL o revisor** - bloquea: **Merge a rama protegida** (fase F7).

- Al menos 1 aprobación de revisor distinto del autor (2 en T3)
- Build correcto
- Pruebas unitarias en verde y cobertura que no disminuye
- Análisis estático sin bloqueantes nuevos
- Escaneo de secretos limpio
- Escaneo de dependencias bajo el umbral
- Sin credenciales, endpoints ni datos reales en el código
- Migraciones incluidas y reversibles
- Documentación actualizada en el repo

### G6 - QA Gate

Aprueba **QA** - bloquea: **Promoción a Pre-Producción** (fase F8).

- Test Plan ejecutado al 100% del alcance definido
- Defectos críticos = 0
- Defectos bloqueantes = 0
- Defectos mayores con plan y aprobación explícita del PO
- Regresión ejecutada y aprobada
- E2E de flujos críticos en verde
- Requisitos no funcionales verificados contra su número objetivo
- Evidencias adjuntas y enlazadas

### G7 - Security Gate

Aprueba **DevOps + TL** - bloquea: **Promoción a Pre-Producción** (fase F8).

- SAST sin hallazgos críticos o altos abiertos
- Dependencias: 0 críticas; altas justificadas con fecha de corrección
- Escaneo de secretos limpio en código e imágenes
- Revisión OWASP Top 10 en cambios expuestos a internet
- Permisos IAM mínimos necesarios verificados
- Datos sensibles cifrados en tránsito y en reposo, enmascarados en logs

### G8 - Release Gate

Aprueba **TL + PO** - bloquea: **Despliegue a Producción** (fase F9).

- G6 y G7 aprobados
- Release Plan: versión, alcance, features, bugs y dependencias
- Deployment Plan con pasos y responsables
- Migration Plan con validación y reconciliación, si hay cambio de datos
- Rollback Plan probado en Pre-Producción
- Backup verificado y tiempo de restauración conocido
- Validación de negocio en Pre-Producción firmada por el PO
- Ventana de despliegue y comunicación acordadas
- Observabilidad y alertas listas para el cambio
- Responsable de guardia identificado

### G9 - Post-Release Gate

Aprueba **TL** - bloquea: **Cierre del release (48–72 h)** (fase F10).

- Smoke en producción correcto
- Sin incidentes Sev1 o Sev2 atribuibles al release
- Métricas técnicas dentro de SLO: errores, latencia, saturación, costo
- Métrica de negocio del BRD instrumentada y en observación
- Notas de versión publicadas y documentación cerrada
- Postmortem / lecciones aprendidas registrado (obligatorio en Sev1 y Sev2; en T2 y T3 al cierre del release)
- Deuda técnica generada registrada en el backlog

## Reglas de cierre

- Todo cambio se tipifica antes de estimarse.
- Una historia sin DoR no entra al sprint.
- Un gate sin evidencia enlazable no está aprobado.
- Sin plan de rollback no hay despliegue.
- La documentación vive en el repositorio, o no existe.
