import { Injectable, inject } from '@angular/core';
import { API } from '../aybar/api';

/** El `AybarUserContext` que el backend arma desde el JWT validado. */
export interface QuienSoy {
  readonly userAccountId?: string | null;
  readonly username?: string | null;
  readonly companyId?: string | null;
  readonly roles?: readonly string[];
  readonly rolesPorEmpresa?: Readonly<Record<string, readonly string[]>>;
}

export const RUTA_QUIEN_SOY = '/recursos-ejemplo/quien-soy';

/**
 * Servicio del endpoint de ejemplo del backend del SDK (`RecursosEjemploController`). Las
 * llamadas viven aquí y no en los componentes: el cliente de @aybarcorp/http (`API`, que
 * escribió `aybar-front init` en src/app/aybar/api.ts) pone el Bearer de la sesión y el
 * X-Correlation-Id, y convierte un error RFC 7807 en ErrorAybar. En un remoto, `API` lleva
 * la sesión que entrega el anfitrión.
 */
@Injectable({ providedIn: 'root' })
export class RecursosEjemplo {
  private readonly api = inject(API);

  quienSoy(senal?: AbortSignal): Promise<QuienSoy> {
    return this.api.get<QuienSoy>(RUTA_QUIEN_SOY, senal ? { senal } : {});
  }
}
