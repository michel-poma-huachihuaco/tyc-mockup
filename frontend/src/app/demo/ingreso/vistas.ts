import type { Type } from '@angular/core';
import { IngresoAnimado } from './variantes/animado';
import { IngresoBloqueo } from './variantes/bloqueo';
import { IngresoCelular } from './variantes/celular';
import { IngresoDosPasos } from './variantes/dos-pasos';
import { IngresoEnlaceMagico } from './variantes/enlace-magico';
import { IngresoMinimal } from './variantes/minimal';
import { IngresoPartido } from './variantes/partido';
import { IngresoRecuperar } from './variantes/recuperar';
import { IngresoRegistro } from './variantes/registro';
import { IngresoSso } from './variantes/sso';
import { IngresoVidrio } from './variantes/vidrio';

/**
 * El componente de cada variante de ingreso, por su id de navegacion.ts. Todas aceptan
 * `incrustada` (la miniatura del índice: sin `main`, sin temporizadores ni animación).
 */
export const VISTAS_INGRESO: Readonly<Record<string, Type<unknown>>> = {
  partido: IngresoPartido,
  minimal: IngresoMinimal,
  animado: IngresoAnimado,
  vidrio: IngresoVidrio,
  celular: IngresoCelular,
  'enlace-magico': IngresoEnlaceMagico,
  sso: IngresoSso,
  'dos-pasos': IngresoDosPasos,
  registro: IngresoRegistro,
  recuperar: IngresoRecuperar,
  bloqueo: IngresoBloqueo,
};
