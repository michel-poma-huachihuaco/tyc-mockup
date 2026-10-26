/**
 * Catálogo que lee el Grafo 360 (GRA-04), separado del renderizado. Reutiliza los catálogos del
 * prototipo; NO es el catálogo definitivo: la reunión pide 2 empresas y 12 áreas con sus menús y
 * ese catálogo aún no llegó (hoy hay 11 empresas y 6 áreas). Al recibirlo se cambia solo este
 * fichero (o se lee de la fuente real) y se pone `validado` en true.
 */
import { AREAS_ATC, EMPRESAS_AYBAR } from './datos-atc';

export const CATALOGO_GRAFO_360 = {
  empresas: EMPRESAS_AYBAR,
  areas: AREAS_ATC as readonly string[],
  validado: false,
} as const;
