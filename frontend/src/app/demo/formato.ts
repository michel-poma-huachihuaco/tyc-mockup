/**
 * Formatos de la galería, sin Angular: fechas relativas al «hoy» fijo de los datos
 * sintéticos (datos/semilla.ts), recuentos con su palabra y porcentajes. Así «hace 3 días»
 * dice lo mismo hoy que dentro de un año. Lo prueba `npm test`.
 */
import { HOY } from './datos/semilla';

const RELATIVA = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const FECHA = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
const FECHA_HORA = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** «hace 5 minutos», «ayer», «hace 3 semanas», respecto de `ahora` (por omisión, HOY). */
export function haceTiempo(iso: string, ahora: Date = HOY): string {
  const segundos = Math.round((new Date(iso).getTime() - ahora.getTime()) / 1000);
  const abs = Math.abs(segundos);
  if (abs < 60) return 'ahora mismo';
  const minutos = Math.round(segundos / 60);
  if (Math.abs(minutos) < 60) return RELATIVA.format(minutos, 'minute');
  const horas = Math.round(segundos / 3600);
  if (Math.abs(horas) < 24) return RELATIVA.format(horas, 'hour');
  const dias = Math.round(segundos / 86400);
  if (Math.abs(dias) < 7) return RELATIVA.format(dias, 'day');
  const semanas = Math.round(dias / 7);
  if (Math.abs(semanas) < 5) return RELATIVA.format(semanas, 'week');
  const meses = Math.round(dias / 30);
  if (Math.abs(meses) < 12) return RELATIVA.format(meses, 'month');
  return RELATIVA.format(Math.round(dias / 365), 'year');
}

/** «12 oct 2026». */
export function fechaCorta(iso: string | null): string {
  return iso ? FECHA.format(new Date(iso)) : '—';
}

/** «12 oct, 09:41». */
export function fechaYHora(iso: string): string {
  return FECHA_HORA.format(new Date(iso));
}

/** «1 persona», «64 personas». */
export function contar(n: number, singular: string, plural: string): string {
  return `${new Intl.NumberFormat('es-PE').format(n)} ${n === 1 ? singular : plural}`;
}

/** Porcentaje entero de `parte` sobre `total`; 0 si no hay total. */
export function porcentaje(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}
