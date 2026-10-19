<!-- Renderizado desde datos/marco.json del repositorio aybar-estrategia-tecnica.
     Ese JSON es la fuente; si el marco cambia, esto se regenera, no se edita a mano. -->

# Roles, autoridad y RACI

- **Stakeholder**: Define la necesidad y el valor de negocio. Autoridad: Aprueba el BRD y el alcance.
- **Product Owner**: Backlog, prioridad y criterios de aceptación. Autoridad: Aprueba HU, DoR y el valor del release.
- **Scrum Master**: Proceso, impedimentos y cadencia. Autoridad: Ninguna sobre producto ni sobre técnica.
- **Technical Lead**: Arquitectura, calidad técnica y riesgo. Autoridad: Aprueba ADR, Architecture Gate y Release Gate técnico.
- **UX/UI Designer**: Flujos, wireframes, mockups y prototipos. Autoridad: Aprueba la consistencia de diseño.
- **Developer**: Implementación, pruebas unitarias y PR. Autoridad: Diseño de la solución dentro de la HU.
- **QA Engineer**: Estrategia de prueba, evidencias y defectos. Autoridad: Aprueba o rechaza el QA Gate.
- **DevOps / SRE**: Pipeline, ambientes, despliegue y observabilidad. Autoridad: Aprueba el Security Gate operativo y ejecuta el deploy.

## RACI por fase

| Fase | Stake | PO | SM | TL | UX | Dev | QA | DevOps |
|---|---|---|---|---|---|---|---|---|
| F0 Intake | R | A | I | C | I | I | I | I |
| F1 Discovery | R | A | I | C | C | I | C | I |
| F2 Requirements | C | AR | I | C | C | C | C | I |
| F3 UX/UI + IA | C | A | I | C | R | C | C | I |
| F4 Arquitectura | I | C | I | AR | I | R | C | C |
| F5 Refinement | I | A | R | C | C | R | C | I |
| F6 Planning | I | A | R | C | I | R | C | I |
| F7 Development | I | C | I | A | C | R | C | C |
| F8 QA + Security | I | C | I | C | I | R | AR | R |
| F9 Release | C | A | I | A | I | C | C | R |
| F10 Operación | I | C | I | A | I | C | R | R |

## Permisos operativos

| Accion | Quien |
|---|---|
| Aprobar un PR | TL, nunca el autor |
| Merge a main o release | TL o pipeline |
| Crear el tag de release | TL |
| Ejecutar deploy a Producción | DevOps, o pipeline con G8 aprobado |
| Escritura en base de datos de Producción | Nadie de forma permanente: acceso temporal, justificado y auditado |
| Modificar el pipeline | DevOps con revisión del TL |
| Saltar un gate | Nadie |
