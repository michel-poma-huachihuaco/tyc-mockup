import { Component, computed, input } from '@angular/core';
import { AyCard, AyCardBody, AyCardHeader, AyCardPairs } from '@aybarcorp/ui-angular';
import type { ParCardPairs } from '@aybarcorp/ui-angular';
import { esSesionDemo, nombreVisible, rolesVisibles } from '../sesion';
import type { SesionVisible } from '../sesion';

/** Quién inició sesión, con qué roles y de dónde sale la sesión. */
@Component({
  selector: 'app-tarjeta-sesion',
  imports: [AyCard, AyCardBody, AyCardHeader, AyCardPairs],
  template: `
    <ay-card>
      <ay-card-header [titulo]="titulo()" nivel="h2" subtitulo="Sesión" />
      <ay-card-body>
        <ay-card-pairs [pares]="pares()" />
      </ay-card-body>
    </ay-card>
  `,
})
export class TarjetaSesion {
  readonly sesion = input.required<SesionVisible>();
  /** En un remoto la sesión no es suya: la entrega el anfitrión al montarlo. */
  readonly delAnfitrion = input(false);

  protected readonly titulo = computed(() => nombreVisible(this.sesion()));
  protected readonly pares = computed<ParCardPairs[]>(() => {
    const sesion = this.sesion();
    const demo = esSesionDemo(sesion);
    const origen = demo ? 'Modo demo: sesión simulada, sin token' : 'Emisor OIDC';
    return [
      { clave: 'Usuario', valor: sesion.usuarioId ?? '—' },
      ...(sesion.empresaId ? [{ clave: 'Empresa', valor: sesion.empresaId }] : []),
      { clave: 'Roles', valor: rolesVisibles(sesion) },
      { clave: 'Origen', valor: this.delAnfitrion() ? `Del anfitrión · ${origen}` : origen },
    ];
  });
}
