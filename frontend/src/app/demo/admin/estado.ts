import { Injectable, signal } from '@angular/core';
import { ROLES, copiaDePersonas } from '../datos';
import type { Rol } from '../datos';

/**
 * Los datos de la administración mientras se recorre: una copia editable de las personas
 * y de los roles. Lo provee la pantalla de Administración, así que pasar de Usuarios a
 * Resumen conserva lo hecho; salir de ella lo olvida.
 */
@Injectable()
export class EstadoAdmin {
  readonly personas = signal(copiaDePersonas());
  readonly roles = signal<Rol[]>(ROLES.map((r) => ({ ...r, permisos: [...r.permisos] })));
}
