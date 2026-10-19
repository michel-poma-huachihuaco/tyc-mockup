import type { ClienteHttp } from '@aybarcorp/http'

/**
 * Servicio del endpoint de ejemplo del backend del SDK (`RecursosEjemploController`).
 * Las llamadas viven aquí y no en los componentes: el cliente de @aybarcorp/http pone el
 * Bearer de la sesión y el X-Correlation-Id, y convierte un error RFC 7807 en ErrorAybar.
 * Recibe el cliente porque cada papel lo obtiene distinto: la app y el shell lo importan
 * de src/aybar/api.ts; un remoto lo fabrica con la sesión que le entrega el anfitrión.
 */

/** El `AybarUserContext` que el backend arma desde el JWT validado. */
export interface QuienSoy {
  readonly userAccountId?: string | null
  readonly username?: string | null
  readonly companyId?: string | null
  readonly roles?: readonly string[]
  readonly rolesPorEmpresa?: Readonly<Record<string, readonly string[]>>
}

export const RUTA_QUIEN_SOY = '/recursos-ejemplo/quien-soy'

export function quienSoy(api: ClienteHttp, senal?: AbortSignal): Promise<QuienSoy> {
  return api.get<QuienSoy>(RUTA_QUIEN_SOY, senal ? { senal } : {})
}
