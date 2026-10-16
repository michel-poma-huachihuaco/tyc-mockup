import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { AyButton, AyCircularProgress, AyLoginForm, AySegmentedControl } from '@aybarcorp/ui-angular';
import type { AySegmentoOpcion } from '@aybarcorp/ui-angular';
import { Icono } from '../../icono';
import { MarcaAcceso, usarCuentaAtras, usarEnvioDemo } from '../comun';
import { minutosYSegundos } from '../validacion';

type Estado = 'bloqueada' | 'expirada';

/** Cuánto dura el bloqueo de la maqueta: 15 minutos. */
const BLOQUEO = 15 * 60;

/**
 * Bloqueo: dos estados de la misma pantalla, conmutables arriba. «Cuenta bloqueada», con el
 * tiempo que falta en un Circular Progress y en texto (mm:ss) y la vía para desbloquear;
 * «Sesión expirada», el Login Form del framework con `sesionCaducada`, que explica por qué
 * se pide entrar otra vez.
 */
@Component({
  selector: 'gl-ingreso-bloqueo',
  imports: [AyButton, AyCircularProgress, AyLoginForm, AySegmentedControl, Icono, MarcaAcceso, NgTemplateOutlet],
  host: { class: 'gl-acceso gl-bloqueo' },
  template: `
    <header class="gl-bloqueo__cabecera">
      <gl-marca-acceso />
      @if (!incrustada()) {
        <ay-segmented-control etiqueta="Estado de la maqueta" size="sm" [opciones]="opciones" [valor]="estado()" (valorChange)="elegir($event)" />
      }
    </header>
    <ng-template #contenido>
      @if (estado() === 'bloqueada') {
        <div class="gl-bloqueo__tarjeta gl-superficie">
          <span class="gl-bloqueo__candado" aria-hidden="true"><gl-icono nombre="candado" /></span>
          <h1 class="gl-acceso__titulo">Tu cuenta está bloqueada</h1>
          <p class="gl-acceso__texto">
            Hubo cinco intentos fallidos seguidos. Por seguridad la bloqueamos durante 15 minutos; nadie más puede entrar
            mientras tanto.
          </p>
          <div class="gl-bloqueo__tiempo">
            <ay-circular-progress size="lg" tono="warning" [valor]="progreso()" [mostrarCifra]="false" etiqueta="Tiempo de bloqueo que queda" />
            <p class="gl-bloqueo__cuenta">
              <span class="gl-bloqueo__cifra">{{ tiempo() }}</span>
              <span class="gl-bloqueo__nota">para volver a intentarlo</span>
            </p>
          </div>
          <div class="gl-acceso__secundarias gl-acceso__secundarias--columna">
            <ay-button bloque [cargando]="envio.enviando()" (click)="desbloquear()">Desbloquear con un enlace al correo</ay-button>
            <ay-button variante="ghost" bloque (click)="envio.avisar('Demo: aquí se abriría el canal de soporte.')">Hablar con soporte</ay-button>
          </div>
        </div>
      } @else {
        <ay-login-form
          como="div"
          titulo="Vuelve a entrar"
          etiquetaIdentificador="Correo"
          tipoIdentificador="email"
          sesionCaducada
          hrefRecuperar="/demo/ingreso/recuperar"
          [enviando]="envio.enviando()"
          (acceder)="envio.enviar()"
        />
      }
    </ng-template>
    @if (incrustada()) {
      <div class="gl-bloqueo__centro"><ng-container [ngTemplateOutlet]="contenido" /></div>
    } @else {
      <main class="gl-bloqueo__centro"><ng-container [ngTemplateOutlet]="contenido" /></main>
    }
  `,
})
export class IngresoBloqueo {
  readonly incrustada = input(false);
  protected readonly envio = usarEnvioDemo();
  protected readonly cuenta = usarCuentaAtras();
  protected readonly estado = signal<Estado>('bloqueada');
  protected readonly opciones: AySegmentoOpcion[] = [
    { valor: 'bloqueada', etiqueta: 'Cuenta bloqueada' },
    { valor: 'expirada', etiqueta: 'Sesión expirada' },
  ];
  /** En la miniatura del índice, quieto a mitad de camino; aquí corre desde 14:32. */
  protected readonly restante = computed(() => (this.incrustada() ? 872 : this.cuenta.restante()));
  protected readonly tiempo = computed(() => minutosYSegundos(this.restante()));
  /** Lo que queda del bloqueo, en porcentaje: el anillo se vacía a medida que pasa. */
  protected readonly progreso = computed(() => Math.round((this.restante() / BLOQUEO) * 100));

  constructor() {
    effect(() => {
      if (!this.incrustada()) untracked(() => this.cuenta.iniciar(872));
    });
  }

  protected elegir(valor: string): void {
    if (valor === 'bloqueada' || valor === 'expirada') this.estado.set(valor);
  }

  protected desbloquear(): void {
    this.envio.enviar(() => this.envio.avisar('Demo: te enviaríamos un enlace para desbloquear la cuenta.'));
  }
}
