import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AyCard, AyCardBody, AyCardHeader, AyStatGroup, AyTimeline } from '@aybarcorp/ui-angular';
import type { AyStatItem, AyTimelineEvento } from '@aybarcorp/ui-angular';
import { AREAS_DISPONIBLES, AUDITORIA, ETIQUETA_ESTADO, LOTES, PERSONAS, formatoSoles, resumenLotes } from '../datos';
import type { EstadoLote } from '../datos';
import { contar, porcentaje } from '../formato';
import { RAIZ_GALERIA } from '../navegacion';
import { EstadoAdmin } from './estado';
import { recuentoPor } from './logica';
import { hitoDe } from './hitos';

const ESTADOS_LOTE: readonly EstadoLote[] = ['disponible', 'reservado', 'vendido', 'bloqueado'];

/**
 * Resumen: los indicadores en un Stat Group —calculados de las personas (las de la
 * administración, con lo editado), los lotes y la auditoría—, dos gráficos de barras hechos
 * con CSS, con sus cifras en texto, y la actividad reciente en una Timeline corta.
 */
@Component({
  selector: 'gl-admin-resumen',
  imports: [AyCard, AyCardBody, AyCardHeader, AyStatGroup, AyTimeline, RouterLink],
  template: `
    <div class="gl-seccion">
      <ay-stat-group [elementos]="indicadores()" periodo="Datos sintéticos, al 1 de octubre de 2026." />

      <div class="gl-rejilla-2">
        <ay-card>
          <ay-card-header titulo="Personas por área" nivel="h2" [subtitulo]="contar(personas().length, 'persona', 'personas')" />
          <ay-card-body>
            <ul class="gl-barras" aria-label="Personas por área">
              @for (barra of porArea(); track barra.etiqueta) {
                <li class="gl-barras__fila">
                  <span class="gl-barras__etiqueta">{{ barra.etiqueta }}</span>
                  <span class="gl-barras__pista" aria-hidden="true"><span class="gl-barras__valor" [style.inline-size.%]="barra.ancho"></span></span>
                  <span class="gl-barras__cifra">{{ barra.valor }}</span>
                </li>
              }
            </ul>
          </ay-card-body>
        </ay-card>

        <ay-card>
          <ay-card-header titulo="Lotes por estado" nivel="h2" [subtitulo]="contar(lotes.length, 'lote', 'lotes') + ' en 8 manzanas'" />
          <ay-card-body>
            <div class="gl-apilada" aria-hidden="true">
              @for (tramo of lotesPorEstado; track tramo.estado) {
                <span class="gl-apilada__tramo" [attr.data-estado]="tramo.estado" [style.flex-grow]="tramo.valor"></span>
              }
            </div>
            <dl class="gl-leyenda">
              @for (tramo of lotesPorEstado; track tramo.estado) {
                <div class="gl-leyenda__item">
                  <dt><span class="gl-leyenda__muestra" [attr.data-estado]="tramo.estado" aria-hidden="true"></span>{{ tramo.etiqueta }}</dt>
                  <dd>{{ tramo.valor }} · {{ tramo.porcentaje }} %</dd>
                </div>
              }
            </dl>
            <p class="gl-nota">Valor de lo disponible: <strong>{{ valorDisponible }}</strong>. <a class="gl-enlace" [routerLink]="raiz + '/3d'">Verlos en 3D</a></p>
          </ay-card-body>
        </ay-card>
      </div>

      <ay-card>
        <ay-card-header titulo="Actividad reciente" nivel="h2" subtitulo="Lo último de la auditoría.">
          <a ayAcciones class="gl-enlace" [routerLink]="raiz + '/admin/auditoria'">Ver toda la auditoría</a>
        </ay-card-header>
        <ay-card-body>
          <ay-timeline etiqueta="Actividad reciente" [hitos]="recientes" />
        </ay-card-body>
      </ay-card>
    </div>
  `,
})
export class AdminResumen {
  private readonly admin = inject(EstadoAdmin);

  protected readonly raiz = RAIZ_GALERIA;
  protected readonly contar = contar;
  protected readonly personas = this.admin.personas;
  protected readonly lotes = LOTES;

  protected readonly indicadores = computed<AyStatItem[]>(() => {
    const personas = this.personas();
    const estados = recuentoPor(personas, 'estado', ['activo', 'invitado', 'suspendido'] as const);
    const conDobleFactor = personas.filter((p) => p.dobleFactor).length;
    const lotes = resumenLotes();
    const hace7 = new Date(AUDITORIA[0]?.fecha ?? 0).getTime() - 7 * 86400000;
    const criticos = AUDITORIA.filter((e) => e.gravedad === 'critico' && new Date(e.fecha).getTime() >= hace7).length;
    const nuevas = personas.length - PERSONAS.length;
    return [
      {
        id: 'personas',
        etiqueta: 'Personas activas',
        valor: String(estados.activo),
        ...(nuevas > 0 ? { delta: { valor: `+${nuevas} invitadas hoy`, direccion: 'up' as const } } : {}),
      },
      { id: 'dos-pasos', etiqueta: 'Con verificación en dos pasos (%)', valor: String(porcentaje(conDobleFactor, personas.length)) },
      { id: 'disponibles', etiqueta: 'Lotes disponibles', valor: String(lotes.disponible) },
      { id: 'criticos', etiqueta: 'Eventos críticos (7 días)', valor: String(criticos) },
    ];
  });

  protected readonly porArea = computed(() => {
    const recuento = recuentoPor(this.personas(), 'area', AREAS_DISPONIBLES);
    const maximo = Math.max(1, ...Object.values(recuento));
    return AREAS_DISPONIBLES.map((area) => ({ etiqueta: area, valor: recuento[area], ancho: (recuento[area] / maximo) * 100 }));
  });

  protected readonly lotesPorEstado = (() => {
    const resumen = resumenLotes();
    return ESTADOS_LOTE.map((estado) => ({
      estado,
      etiqueta: ETIQUETA_ESTADO[estado],
      valor: resumen[estado],
      porcentaje: porcentaje(resumen[estado], LOTES.length),
    }));
  })();

  protected readonly valorDisponible = formatoSoles(LOTES.filter((l) => l.estado === 'disponible').reduce((s, l) => s + l.precio, 0));

  protected readonly recientes: AyTimelineEvento[] = AUDITORIA.slice(0, 6).map(hitoDe);
}
