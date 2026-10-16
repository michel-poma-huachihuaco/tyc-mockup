import { Component, computed, signal } from '@angular/core';
import { AyButton, AyChip, AyCombobox, AyDateRangePicker, AyEmptyState, AyTimeline } from '@aybarcorp/ui-angular';
import type { AyAtajoIntervalo, AyComboOpcion, AyComboValor, AyIntervaloFechas, AyTimelineEvento } from '@aybarcorp/ui-angular';
import { AUDITORIA, PERSONAS } from '../datos';
import type { Gravedad } from '../datos';
import { contar } from '../formato';
import { ETIQUETA_GRAVEDAD, hitoDe } from './hitos';
import { filtrarAuditoria } from './logica';

const GRAVEDADES: readonly Gravedad[] = ['info', 'aviso', 'critico'];
const PASO = 20;

const fechaDe = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const MAS_RECIENTE = fechaDe(AUDITORIA[0]?.fecha ?? new Date().toISOString());
const MAS_ANTIGUO = fechaDe(AUDITORIA[AUDITORIA.length - 1]?.fecha ?? new Date().toISOString());
const diasAntes = (dias: number) => new Date(MAS_RECIENTE.getFullYear(), MAS_RECIENTE.getMonth(), MAS_RECIENTE.getDate() - dias);

/**
 * Auditoría: los 96 eventos sintéticos en una ay-timeline agrupada por día, con filtros
 * por intervalo (Date Range Picker, con atajos), gravedad (Chip) y actor (Combobox), y
 * «Cargar más» de veinte en veinte. Las IP son del bloque de documentación (TEST-NET-1).
 */
@Component({
  selector: 'gl-admin-auditoria',
  imports: [AyButton, AyChip, AyCombobox, AyDateRangePicker, AyEmptyState, AyTimeline],
  template: `
    <div class="gl-seccion">
      <div class="gl-filtros gl-superficie">
        <ay-date-range-picker
          etiqueta="Entre fechas"
          [fechaMinima]="minimo"
          [fechaMaxima]="maximo"
          [atajos]="atajos"
          [valor]="intervalo()"
          (valorChange)="cambiar(() => intervalo.set($event))"
        />
        <fieldset class="gl-filtros__chips">
          <legend class="ay-legend">Gravedad</legend>
          <div class="gl-chips">
            @for (g of gravedades; track g) {
              <ay-chip [seleccionado]="elegidas().includes(g)" (seleccionadoChange)="alternar(g, $event)">{{ etiqueta(g) }}</ay-chip>
            }
          </div>
        </fieldset>
        <ay-combobox etiqueta="Actor" placeholder="Cualquiera" [opciones]="actores" [valor]="actor()" (valorChange)="elegirActor($event)" />
      </div>

      <div class="gl-auditoria__resumen" aria-live="polite">
        <p class="gl-nota">{{ contar(filtrados().length, 'evento', 'eventos') }}{{ filtrados().length < total ? ' de ' + total : '' }}</p>
        @if (hayFiltros()) {
          <ay-button variante="ghost" tamano="sm" (click)="limpiar()">Quitar los filtros</ay-button>
        }
      </div>

      @if (filtrados().length === 0) {
        <ay-empty-state variante="no-results" titulo="Ningún evento coincide" descripcion="Amplía el intervalo o quita algún filtro." />
      } @else {
        <div class="gl-superficie gl-auditoria__linea">
          <ay-timeline etiqueta="Eventos de auditoría" agruparPorDia [hitos]="hitos()" [hayMas]="hitos().length < filtrados().length" (cargarMas)="visibles.set(visibles() + paso)" />
        </div>
      }
    </div>
  `,
})
export class AdminAuditoria {
  protected readonly contar = contar;
  protected readonly gravedades = GRAVEDADES;
  protected readonly total = AUDITORIA.length;
  protected readonly paso = PASO;
  protected readonly minimo = MAS_ANTIGUO;
  protected readonly maximo = MAS_RECIENTE;
  protected readonly atajos: AyAtajoIntervalo[] = [
    { etiqueta: 'Últimos 7 días', intervalo: [diasAntes(6), MAS_RECIENTE] },
    { etiqueta: 'Últimos 15 días', intervalo: [diasAntes(14), MAS_RECIENTE] },
    { etiqueta: 'Todo', intervalo: [MAS_ANTIGUO, MAS_RECIENTE] },
  ];
  protected readonly actores: AyComboOpcion[] = [...new Set(AUDITORIA.map((e) => e.actor))]
    .map((id) => PERSONAS.find((p) => p.id === id))
    .filter((p) => p !== undefined)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map((p) => ({ valor: p.id, etiqueta: p.nombre, descripcion: `${p.area} · ${p.correo}` }));

  protected readonly intervalo = signal<AyIntervaloFechas>([null, null]);
  protected readonly elegidas = signal<Gravedad[]>([]);
  protected readonly actor = signal<string | undefined>(undefined);
  protected readonly visibles = signal(PASO);

  protected readonly filtrados = computed(() => {
    const [desde, hasta] = this.intervalo();
    return filtrarAuditoria(AUDITORIA, { desde, hasta, gravedades: this.elegidas(), actor: this.actor() ?? null });
  });
  protected readonly hitos = computed<AyTimelineEvento[]>(() => this.filtrados().slice(0, this.visibles()).map(hitoDe));
  protected readonly hayFiltros = computed(
    () => this.intervalo().some(Boolean) || this.elegidas().length > 0 || Boolean(this.actor()),
  );

  protected etiqueta(g: Gravedad): string {
    return ETIQUETA_GRAVEDAD[g];
  }

  /** Cualquier filtro nuevo vuelve a la primera página. */
  protected cambiar(aplicar: () => void): void {
    aplicar();
    this.visibles.set(PASO);
  }

  protected alternar(g: Gravedad, marcada: boolean): void {
    this.cambiar(() => this.elegidas.update((lista) => (marcada ? [...lista, g] : lista.filter((x) => x !== g))));
  }

  protected elegirActor(valor: AyComboValor): void {
    this.cambiar(() => this.actor.set(typeof valor === 'string' && valor ? valor : undefined));
  }

  protected limpiar(): void {
    this.cambiar(() => {
      this.intervalo.set([null, null]);
      this.elegidas.set([]);
      this.actor.set(undefined);
    });
  }
}
