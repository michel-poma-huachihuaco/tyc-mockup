# Plan de Rollback de Datos (F9)

Un plan no probado se considera inexistente, sin importar su calidad
documental. Ocho secciones obligatorias:

1. **Alcance**: objetos afectados y volumetria estimada. [...]
2. **Estado previo esperado**: verificable (conteos, checksums). [...]
3. **Punto de recuperacion**: backup/snapshot con nombre, fecha, hora,
   ubicacion y responsable. [...]
4. **Ventana de reversion**: RPO y RTO comprometidos por el dueño del dato;
   tiempo real medido en QA: [minutos].
5. **Procedimiento de reversion**: script o pasos con orden explicito de
   dependencias. [...]
6. **Validacion posterior**: consultas concretas con resultado esperado. [...]
7. **Responsables con suplente**: decide [..], ejecuta [..] (DBA/Infra),
   valida [..].
8. **Riesgos residuales**: que NO se recupera y que accion compensatoria
   aplica. [...]

- Prueba en QA: [fecha, log/captura, duracion real, resultado]
- Excepcion formal (solo con riesgo residual): aceptacion expresa y escrita
  del dueño del dato, registrada en el Acta. Se documenta, no se asume.

Valida y aprueba el plan: Gobierno de Datos. Ejecuta la reversion: DBA/Infra.
