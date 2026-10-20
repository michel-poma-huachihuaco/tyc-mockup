// Piezas del artifact que usa la «Operación en Vivo», con nombre legible: misma instancia de React, mismo estado y mismos
// componentes del sistema de diseño (@aybarcorp/ui 0.3.0, el mismo de @aybarcorp/ui-angular que usa la vista de Daniel).
// Los componentes de Daniel que el artifact no trae compilados (Statistic, CircularProgress, Rating, Timeline, Tag, Grid,
// Row, Stack, Divider y Text) se pintan aquí con el mismo marcado y las mismas clases `ay-*` que sus fuentes de @aybarcorp/ui.
import * as C from 'aybar:comun'
import { h as CardHeader, x as Select, u as Drawer, n as SegmentedControl, m as CardPairs } from 'aybar:prototipo'
import { n as Card, t as CardBody } from 'aybar:CardBody'
import { t as Breadcrumb } from 'aybar:Breadcrumb'
import { t as ProgressBar } from 'aybar:ProgressBar'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const React: any = C.Ii()
export const h: (tipo: any, props?: Record<string, any> | null, ...hijos: any[]) => any = React.createElement
export const { useState, useEffect, useRef } = React as {
  useState: <T>(v: T | (() => T)) => [T, (v: T | ((p: T) => T)) => void]
  useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void
  useRef: <T>(v: T) => { current: T }
}
export const usarEstado = C.k
export const usarPersona = C.A
export const ruta = C.Jn

export const ui = {
  Button: C.Ai, Badge: C.$r, PageHeader: C.Nr, Card, CardBody, CardHeader, CardPairs, Select, Drawer, SegmentedControl, Breadcrumb,
  ProgressBar,
}

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
const LOCALE = 'es-PE'

/** Statistic (ay-stat): etiqueta, cifra y unidad. */
export function Stat(p: { label: string; value: string | number; unit?: string; size?: 'sm' | 'md' | 'lg' }) {
  const v = typeof p.value === 'number' ? new Intl.NumberFormat(LOCALE).format(p.value) : p.value
  return h('dl', { className: cx('ay-stat', `ay-stat--${p.size ?? 'md'}`) },
    h('dt', { className: 'ay-stat__label' }, p.label),
    h('dd', { className: 'ay-stat__value' }, v, p.unit ? h('span', { className: 'ay-stat__unit' }, ` ${p.unit}`) : null))
}

/** CircularProgress (ay-circ). */
export function Circ(p: { value: number; label: string; size?: 'sm' | 'md' | 'lg'; tone?: 'brand' | 'success' | 'warning' | 'danger' }) {
  const pct = Math.max(0, Math.min(100, Math.round(p.value))), size = p.size ?? 'md'
  return h('div', {
    className: cx('ay-circ', `ay-circ--${size}`, `ay-circ--${p.tone ?? 'brand'}`), role: 'progressbar', 'aria-label': p.label,
    'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100,
  },
  h('svg', { viewBox: '0 0 36 36', 'aria-hidden': 'true' },
    h('circle', { className: 'ay-circ__track', cx: 18, cy: 18, r: 15.5 }),
    pct !== 0 ? h('circle', { className: 'ay-circ__fill', cx: 18, cy: 18, r: 15.5, style: { '--ay-dash': pct } }) : null),
  size !== 'sm' ? h('span', { className: 'ay-circ__value' }, `${pct}%`) : null)
}

const ESTRELLA = 'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z'
/** Rating de solo lectura (ay-rating). */
export function Rating(p: { label: string; value: number; allowHalf?: boolean; count?: number; size?: 'sm' | 'md' | 'lg' }) {
  const max = 5, v = p.value, mostrado = p.allowHalf ? Math.round(v * 2) / 2 : Math.round(v)
  const texto = v > 0 ? `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 }).format(v)} de ${max}` : 'Sin valoraciones'
  const recuento = p.count != null ? `${new Intl.NumberFormat(LOCALE).format(p.count)} ${p.count === 1 ? 'valoración' : 'valoraciones'}` : null
  return h('p', { className: cx('ay-rating', `ay-rating--${p.size ?? 'md'}`), 'aria-label': `${p.label}: ${recuento ? `${texto}, ${recuento}` : texto}` },
    h('span', { className: 'ay-rating__icons', 'aria-hidden': 'true' }, ...Array.from({ length: max }, (_, i) => {
      const relleno = mostrado >= i + 1 ? 'full' : mostrado >= i + 0.5 ? 'half' : 'empty'
      return h('svg', { key: i, viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': 'true', focusable: 'false', className: `ay-rating__glyph ay-rating__glyph--${relleno}` },
        h('path', { className: 'ay-rating__glyph-empty', d: ESTRELLA }), h('path', { className: 'ay-rating__glyph-full', d: ESTRELLA }))
    })),
    h('span', { className: 'ay-rating__value' }, texto),
    recuento ? h('span', { className: 'ay-rating__count' }, recuento) : null)
}

export interface Hito { id: string; titulo: string; fecha: Date; autor?: string; tono?: 'default' | 'accent' | 'success' | 'danger' }
const relativo = (f: Date) => {
  // contra `new Date()` y no `Date.now()`: el reloj del prototipo puede ir adelantado (Herramientas › Simulación)
  const min = (f.getTime() - new Date().getTime()) / 60000, rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })
  return Math.abs(min) < 1 ? rtf.format(0, 'second') : Math.abs(min) < 60 ? rtf.format(Math.round(min), 'minute') : rtf.format(Math.round(min / 60), 'hour')
}
const horaMin = (f: Date) => f.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
/** Timeline vertical (ay-timeline): autor en negrita, título y tiempo relativo (con la hora si se repite), como la del SDK. */
export function Timeline(p: { label: string; hitos: Hito[] }) {
  const rel = p.hitos.map((e) => relativo(e.fecha))
  return h('ol', { className: 'ay-timeline ay-timeline--vertical', 'aria-label': p.label }, ...p.hitos.map((e, i) => {
    const repetido = rel[i] === rel[i - 1] || rel[i] === rel[i + 1]
    return h('li', { key: e.id, className: 'ay-timeline__event' },
      h('span', { className: cx('ay-timeline__dot', `ay-timeline__dot--${e.tono ?? 'default'}`), 'aria-hidden': 'true' }),
      h('div', { className: 'ay-timeline__body' },
        h('p', { className: 'ay-timeline__title' }, h('strong', null, e.autor || 'Sistema'), ' ', e.titulo),
        h('time', { className: 'ay-timeline__time', dateTime: e.fecha.toISOString() }, repetido ? `${rel[i]} · ${horaMin(e.fecha)}` : rel[i])))
  }))
}

/** Tag con punto de color (ay-tag). */
export const Tag = (p: { variant?: 'neutral' | 'brand' | 'outline'; dotColor?: string; children: any }) =>
  h('span', { className: cx('ay-tag', `ay-tag--${p.variant ?? 'neutral'}`, 'ay-tag--md') },
    p.dotColor ? h('span', { className: 'ay-tag__dot', 'aria-hidden': 'true', style: { background: p.dotColor } }) : null, p.children)

// los hijos van como argumentos (no como lista): así React no pide `key` a cada uno
const hijos = (c: any): any[] => (Array.isArray(c) ? c : [c])
/** Row (ay-row) y Stack (ay-stack) del sistema de diseño. */
export const Row = (p: { gap?: '1' | '2' | '3' | '4' | '6'; wrap?: boolean; justify?: 'between' | 'end'; className?: string; children?: any }) =>
  h('div', { className: cx('ay-row', `ay-row--${p.gap ?? '2'}`, p.wrap && 'ay-row--wrap', p.justify && `ay-row--${p.justify}`, p.className) }, ...hijos(p.children))
export const Stack = (p: { gap?: '1' | '2' | '3' | '4' | '6'; align?: 'start' | 'center'; className?: string; 'aria-label'?: string; children?: any }) =>
  h('div', { className: cx('ay-stack', `ay-stack--${p.gap ?? '4'}`, p.align && `ay-stack--align-${p.align}`, p.className), 'aria-label': p['aria-label'] }, ...hijos(p.children))
/** Grid (ay-grid) de N columnas iguales; en pantallas estrechas pasa a menos columnas (clase vv-grid de estilos.ts). */
export const Grid = (p: { columnas: number; children?: any }) =>
  h('div', { className: 'ay-grid ay-grid--gap-sm vv-grid', style: { '--vv-cols': p.columnas } }, ...hijos(p.children))
export const Divider = () => h('hr', { className: 'ay-divider ay-divider--horizontal ay-divider--sm' })
