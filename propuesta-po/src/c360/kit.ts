// Piezas del artifact que usa la Consulta 360, con nombre legible: React y los componentes de @aybarcorp/ui 0.3.0 que ya cargan los
// chunks (mismas clases ay-* que @aybarcorp/ui-angular 0.3.0 de la rama de Daniel). Lo que el artifact no trae en React (Avatar,
// Divider, Text, Stack, Row, Grid) se pinta con sus mismas clases ay-*.
import * as C from 'aybar:comun'
import { h as CardHeader, m as CardPairs, n as SegmentedControl, v as SearchInput, c as Tabs, x as Select } from 'aybar:prototipo'
import { n as Card, t as CardBody } from 'aybar:CardBody'
import { t as Breadcrumb } from 'aybar:Breadcrumb'
import { t as FormField } from 'aybar:FormField'
import { t as Dialog } from 'aybar:Dialog'
import { t as Table } from 'aybar:Table'
import { t as EmptyState } from 'aybar:EmptyState'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const React: any = C.Ii()
export const h: (tipo: any, props?: Record<string, any> | null, ...hijos: any[]) => any = React.createElement
export const Fragmento = React.Fragment
export const { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } = React as {
  useState: <T>(v: T | (() => T)) => [T, (v: T | ((p: T) => T)) => void]
  useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void
  useMemo: <T>(fn: () => T, deps: unknown[]) => T
  useRef: <T>(v: T) => { current: T }
  useCallback: <T>(fn: T, deps: unknown[]) => T
  lazy: any
  Suspense: any
}

export const ui = {
  Button: C.Ai, Badge: C.$r, Tag: C.Qr, Alert: C.Gr, PageHeader: C.Nr,
  CardHeader, CardPairs, SegmentedControl, SearchInput, Tabs, Select, Card, CardBody, Breadcrumb, FormField, Dialog, Table, EmptyState,
}

const unir = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

// Primitivas de maquetación de @aybarcorp/ui-angular (ayStack, ayRow, ayGrid, ayGridItem, ayText) con sus mismas clases
type Props = Record<string, any> & { children?: any }
export const Stack = ({ gap = '4', className, children, ...p }: Props) => h('div', { ...p, className: unir('ay-stack', `ay-stack--${gap}`, className) }, children)
export const Row = ({ gap = '2', ajuste, justificar, className, children, ...p }: Props) =>
  h('div', { ...p, className: unir('ay-row', `ay-row--${gap}`, ajuste && 'ay-row--wrap', justificar && justificar !== 'start' && `ay-row--${justificar}`, className) }, children)
export const Grid = ({ columnas, gap = 'md', className, children, ...p }: Props) =>
  h('div', { ...p, className: unir('ay-grid', columnas && `ay-grid--${columnas}`, `ay-grid--gap-${gap}`, className) }, children)
export const Texto = ({ as = 'span', estilo = 'body', size, className, style, children, ...p }: Props) =>
  h(as, { ...p, className: unir('ay-text', `ay-text--${estilo}`, className), style: size ? { ...style, fontSize: `var(--aybar-font-size-${size})` } : style }, children)
export const Divider = ({ espaciado = 'md' }: { espaciado?: string }) => h('hr', { className: unir('ay-divider', `ay-divider--${espaciado}`), 'aria-hidden': 'true' })
/** ay-avatar de ui-angular: iniciales del nombre (las dos primeras palabras) y el nombre para el lector de pantalla */
export const Avatar = ({ nombre, size = 'md' }: { nombre: string; size?: string }) =>
  h('span', { className: unir('ay-avatar', `ay-avatar--${size}`, 'ay-avatar--circle') },
    h('span', { className: 'ay-avatar__initials', 'aria-hidden': 'true' }, nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()),
    h('span', { className: 'ay-visually-hidden' }, nombre))
