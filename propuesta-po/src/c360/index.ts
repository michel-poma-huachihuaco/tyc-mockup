// Consulta 360 del Cliente (#/consulta360) igual que la de la rama de Daniel. Se compila aparte, como Mi Portal y la Operación
// en Vivo (vite.portal.config.ts, entrada «consulta360-daniel» → artefacto/assets/consulta360-daniel.js), y el shell la carga
// solo al entrar a la página (scripts/shell.js › __Consulta360).
export { Consulta360Daniel } from './pagina.ts'
export type { PropsConsulta360, Modulo360 } from './pagina.ts'
