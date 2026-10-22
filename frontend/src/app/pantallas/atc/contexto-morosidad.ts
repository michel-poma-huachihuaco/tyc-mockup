/**
 * MOR-01 · Contexto de morosidad para el asesor (solo consulta).
 * La condición se conserva literal: «más de tres cuotas» (> 3). Regla PENDIENTE de validación
 * contractual: esto informa, no decide ni dispara disolución alguna.
 */
export const UMBRAL_CUOTAS_VENCIDAS = 3;

export interface ContextoMorosidad {
  readonly cuotasVencidas: number;
  /** ¿Cumple «más de tres cuotas»? (3 no cumple, 4 sí). Indicativo, no contractual. */
  readonly superaCondicion: boolean;
  readonly lectura: string;
  /** Etapa de negociación cliente-Iver: sin dato en el prototipo hasta definir el flujo. */
  readonly etapaNegociacion: string;
}

export function evaluarContextoMorosidad(
  cuotasVencidas: number,
  etapaNegociacion?: string | null,
): ContextoMorosidad {
  const superaCondicion = cuotasVencidas > UMBRAL_CUOTAS_VENCIDAS;
  return {
    cuotasVencidas,
    superaCondicion,
    lectura: superaCondicion
      ? `${cuotasVencidas} cuotas vencidas: supera «más de tres cuotas». Posible disolución contractual, sujeta a validación contractual.`
      : `${cuotasVencidas} cuotas vencidas: no supera «más de tres cuotas».`,
    etapaNegociacion: etapaNegociacion?.trim() || 'Sin dato · flujo de negociación pendiente de definición',
  };
}
