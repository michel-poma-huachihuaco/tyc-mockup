import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AyAlert } from '@aybarcorp/ui-angular';
import { esDiaHabil, fmtFechaHora } from '../datos-atc';

/** Lo que muestra la card «Plazos de atención (SLA)» de Nuevo ticket, ya calculado con la política vigente. */
export interface SlaPrevisto {
  /** «SLA-CTA-HIGH · v2». */
  readonly politica: string;
  readonly origen: 'especifica' | 'generica' | 'global';
  /** «Específica (CTA + HIGH)». */
  readonly etiquetaOrigen: string;
  readonly apertura: Date;
  readonly venceRespuesta: Date;
  readonly venceResolucion: Date;
  readonly respuestaH: number;
  readonly resolucionH: number;
  /** Solo en tipos del Libro de Reclamaciones: plazo legal de 15 días hábiles. */
  readonly libroFecha: Date | null;
  readonly nombreTipo: string;
}

export const fecha = (d: Date): string => fmtFechaHora(d);

/** «lun. 19 oct.». */
export const diaCorto = (d: Date): string =>
  d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

/** «11:30 a. m.». */
export const hora = (d: Date): string =>
  d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });

const mismoDia = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Parte de la jornada (9:00 a 18:00) ocupada por un tramo, en % del ancho de la jornada. */
export interface Segmento {
  readonly izq: number;
  readonly ancho: number;
}

export interface DiaDelPlazo {
  readonly dia: Date;
  readonly habil: boolean;
  readonly nombre: string;
  /** Desde la apertura hasta la 1.ª respuesta. */
  readonly respuesta: Segmento | null;
  /** Desde la 1.ª respuesta hasta la resolución. */
  readonly resolucion: Segmento | null;
  readonly hitoRespuesta: string | null;
  readonly hitoResolucion: string | null;
}

function solape(desde: number, hasta: number, jornadaIni: number, jornadaFin: number): Segmento | null {
  const i = Math.max(desde, jornadaIni);
  const f = Math.min(hasta, jornadaFin);
  if (f <= i) return null;
  const total = jornadaFin - jornadaIni;
  return { izq: ((i - jornadaIni) / total) * 100, ancho: ((f - i) / total) * 100 };
}

/**
 * Los días entre la apertura y el vencimiento de la resolución, con la parte de la jornada hábil
 * (lunes a viernes, 9:00 a 18:00, sin feriados) que consume cada tramo del plazo.
 */
export function diasDelPlazo(s: SlaPrevisto): DiaDelPlazo[] {
  const dias: DiaDelPlazo[] = [];
  const d = new Date(s.apertura);
  d.setHours(0, 0, 0, 0);
  const fin = new Date(s.venceResolucion);
  fin.setHours(0, 0, 0, 0);
  while (d.getTime() <= fin.getTime()) {
    const ini = new Date(d);
    ini.setHours(9, 0, 0, 0);
    const cierre = new Date(d);
    cierre.setHours(18, 0, 0, 0);
    const habil = esDiaHabil(d);
    dias.push({
      dia: new Date(d),
      habil,
      nombre: d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }).replace('.', ''),
      respuesta: habil
        ? solape(s.apertura.getTime(), s.venceRespuesta.getTime(), ini.getTime(), cierre.getTime())
        : null,
      resolucion: habil
        ? solape(s.venceRespuesta.getTime(), s.venceResolucion.getTime(), ini.getTime(), cierre.getTime())
        : null,
      hitoRespuesta: mismoDia(d, s.venceRespuesta) ? hora(s.venceRespuesta) : null,
      hitoResolucion: mismoDia(d, s.venceResolucion) ? hora(s.venceResolucion) : null,
    });
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

/** Cuántos días de calendario hay entre la apertura y el vencimiento de la resolución. */
export function diasCalendario(s: SlaPrevisto): number {
  return diasDelPlazo(s).length;
}

/** Los avisos que acompañan a la card en las tres propuestas. */
@Component({
  selector: 'app-avisos-sla',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [AyAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sla().origen === 'global') {
      <ay-alert tono="warning" size="sm" titulo="Sin política específica para este tipo">
        «{{ sla().nombreTipo }}» no tiene política activa: se aplicará la genérica global y se registrará una alerta en Workflow.
      </ay-alert>
    }
    @if (sla().libroFecha; as libro) {
      <ay-alert tono="info" size="sm" titulo="Exige asiento en el Libro de Reclamaciones">
        Plazo legal improrrogable de 15 días hábiles ({{ dia(libro) }}).
      </ay-alert>
    }
  `,
})
export class AvisosSla {
  readonly sla = input.required<SlaPrevisto>();
  protected readonly dia = diaCorto;
}
