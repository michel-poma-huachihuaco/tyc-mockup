// Piezas del artifact que usa Mi Portal, con nombre legible. Todo sale de los chunks ya cargados (misma instancia de React,
// mismo estado del prototipo y mismos componentes del sistema de diseño @aybarcorp): Mi Portal no trae React propio.
import * as C from 'aybar:comun'
import { h as CardHeader, x as Select } from 'aybar:prototipo'
import { t as FormField } from 'aybar:FormField'
import { t as Textarea } from 'aybar:Textarea'
import { t as Input } from 'aybar:Input'
import { n as Card, t as CardBody } from 'aybar:CardBody'
import { t as EmptyState } from 'aybar:EmptyState'
import { t as DataGrid } from 'aybar:DataGrid'
import { t as Breadcrumb } from 'aybar:Breadcrumb'
import { t as FileItem } from 'aybar:FileItem'
import { n as RadioGroup, t as Radio } from 'aybar:Radio'
import type { Nucleo } from './tipos.ts'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const React: any = C.Ii()
export const h: (tipo: any, props?: Record<string, any> | null, ...hijos: any[]) => any = React.createElement
export const Fragmento = React.Fragment
export const { useState, useEffect, useMemo, useRef, useId, useCallback } = React as {
  useState: <T>(v: T | (() => T)) => [T, (v: T | ((p: T) => T)) => void]
  useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void
  useMemo: <T>(fn: () => T, deps: unknown[]) => T
  useRef: <T>(v: T) => { current: T }
  useId: () => string
  useCallback: <T>(fn: T, deps: unknown[]) => T
}

export const nucleo: Nucleo = C.__ptNucleo
export const usarEstado = C.k
export const usarPersona = C.A
export const usarAccion = C.x
export const erroresPorCampo = C.p
export const avisar = C.Wr
export const clientePorId = C.Kn
export const clientes = C.Un
export const lotesDe = C.Ut
export const nombreTipo = C.Ar
export const nombreArea = C.mr
export const fechaCorta = C.m
export const fechaLarga = C.g
export const fechaDia = C.h
export const usarMedia = C.C
export const DESDE_ESCRITORIO = C.u
export const ruta = C.Jn

export const ui = {
  Button: C.Ai, Badge: C.$r, Tag: C.Qr, Alert: C.Gr, PageHeader: C.Nr, ErrorState: C.Mr, FileUpload: C.ii, ErrorAccion: C.t,
  CardHeader, Select, FormField, Textarea, Input, Card, CardBody, EmptyState, DataGrid, Breadcrumb, FileItem, RadioGroup, Radio,
}

/** Registra un texto en el panel «Notas» de las herramientas (supuestos y pendientes de la pantalla), como el resto del prototipo. */
export function Nota({ children }: { children: string }) {
  ;(globalThis as any).__ptNota?.(children)
  return null
}
