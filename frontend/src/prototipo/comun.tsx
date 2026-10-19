import { Alert, Badge, Button, ErrorPage, FileUpload, Tag, toast } from '@aybarcorp/ui'
import type { UploadFile } from '@aybarcorp/ui'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { NOMBRE_ESTADO, nombrePrioridad } from './datos/catalogos.ts'
import type { Estado } from './datos/catalogos.ts'
import { hrefDe } from './rutas.ts'
import { api } from './servicio/api.ts'
import { ErrorSimulado } from './servicio/nucleo.ts'
import type { CierreE2E, EstadoSla } from './servicio/nucleo.ts'
import type { Documento, NivelPlazo } from './servicio/libro.ts'

/** Piezas que comparten las pantallas del prototipo. Solo componentes y tokens del sistema. */

export const LOCALE = 'es-PE'

export const fecha = (d: Date) =>
  d.toLocaleString(LOCALE, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export const fechaLarga = (d: Date) =>
  d.toLocaleString(LOCALE, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** «vence en 2 h 20 min» / «venció hace 1 d 3 h», en tiempo de reloj. */
export function restante(vence: Date, ahora: Date, verbo: [string, string] = ['vence en', 'venció hace']): string {
  const minutos = Math.round((vence.getTime() - ahora.getTime()) / 60_000)
  const m = Math.abs(minutos)
  const texto = m >= 1440 ? `${Math.floor(m / 1440)} d ${Math.floor((m % 1440) / 60)} h` : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`
  return `${minutos < 0 ? verbo[1] : verbo[0]} ${texto}`
}

export const horas = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(1)} h`

type Tono = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const TONO_ESTADO: Record<Estado, Tono> = {
  OPEN: 'info',
  IN_PROGRESS: 'info',
  PENDING_CUSTOMER: 'warning',
  ESCALATED: 'danger',
  RESOLVED: 'success',
  CLOSED: 'neutral',
  REOPENED: 'warning',
}

export function BadgeEstado({ estado, size = 'md' }: { estado: Estado; size?: 'sm' | 'md' }) {
  return (
    <Badge tone={TONO_ESTADO[estado]} size={size}>
      {NOMBRE_ESTADO[estado]}
    </Badge>
  )
}

export function BadgePrioridad({ prioridad, size = 'md' }: { prioridad: string; size?: 'sm' | 'md' }) {
  const tono: Tono = prioridad === 'URGENT' ? 'danger' : prioridad === 'HIGH' ? 'warning' : 'neutral'
  return (
    <Badge tone={tono} size={size}>
      Prioridad {nombrePrioridad(prioridad).toLowerCase()}
    </Badge>
  )
}

export function textoSla(sla: EstadoSla): string {
  switch (sla.nivel) {
    case 'en-plazo':
      return 'En plazo'
    case 'en-riesgo':
      return 'En riesgo'
    case 'vencido':
      return sla.hito === 'respuesta' ? '1.ª respuesta vencida' : 'Resolución vencida'
    case 'cumplido':
      return 'SLA cumplido'
    case 'fuera-de-plazo':
      return 'Resuelto fuera de plazo'
  }
}

export function BadgeSla({ sla, size = 'md' }: { sla: EstadoSla; size?: 'sm' | 'md' }) {
  const tono: Tono = sla.nivel === 'vencido' || sla.nivel === 'fuera-de-plazo' ? 'danger' : sla.nivel === 'en-riesgo' ? 'warning' : 'success'
  return (
    <Badge tone={tono} size={size} dot>
      {textoSla(sla)}
    </Badge>
  )
}

export const TEXTO_E2E: Record<CierreE2E['nivel'], string> = {
  'en-plazo': 'En plazo',
  'por-vencer': 'Por vencer',
  'en-riesgo': 'En riesgo de incumplimiento',
  cerrado: 'Cerrado',
}

export function BadgeE2E({ e2e }: { e2e: CierreE2E }) {
  const tono: Tono = e2e.nivel === 'en-riesgo' ? 'danger' : e2e.nivel === 'por-vencer' ? 'warning' : e2e.nivel === 'cerrado' ? 'neutral' : 'success'
  return (
    <Badge tone={tono} size="sm" dot>
      {TEXTO_E2E[e2e.nivel]}
    </Badge>
  )
}

export const fechaDia = (d: Date) => d.toLocaleDateString(LOCALE, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

export const dinero = (monto: number, moneda: string) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: moneda, minimumFractionDigits: 2 }).format(monto)

/** El plazo legal de un asiento: palabra escrita y color de apoyo. */
export function BadgePlazo({ nivel, dias, size = 'md' }: { nivel: NivelPlazo; dias: number; size?: 'sm' | 'md' }) {
  const tono: Tono = nivel === 'vencido' || nivel === 'respondido-fuera' ? 'danger' : nivel === 'por-vencer' ? 'warning' : nivel === 'respondido' ? 'success' : 'info'
  const texto =
    nivel === 'respondido'
      ? 'Respondido con cargo'
      : nivel === 'respondido-fuera'
        ? 'Respondido fuera de plazo'
        : nivel === 'vencido'
          ? `Vencido hace ${-dias} ${dias === -1 ? 'día hábil' : 'días hábiles'}`
          : dias === 0
            ? 'Vence hoy'
            : `Quedan ${dias} ${dias === 1 ? 'día hábil' : 'días hábiles'}`
  return (
    <Badge tone={tono} size={size} dot>
      {texto}
    </Badge>
  )
}

/** SHA-256 del archivo, en el navegador: la huella que el backend guardaría en el IntegrityHash. */
export async function documentoDe(archivo: File): Promise<Documento> {
  const huella = await crypto.subtle.digest('SHA-256', await archivo.arrayBuffer())
  const sha256 = [...new Uint8Array(huella)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return { nombre: archivo.name, tamano: archivo.size, sha256 }
}

/** Un PDF probatorio (carta, cargo): uno solo, con su huella SHA-256. No sale del navegador. */
export function CampoPdf({ id, etiqueta, requisitos, documento, onCambio, error }: { id?: string; etiqueta: string; requisitos: string; documento: Documento | null; onCambio: (d: Documento | null) => void; error?: string }) {
  const [enCurso, setEnCurso] = useState<UploadFile | null>(null)
  const archivos: UploadFile[] = documento ? [{ id: documento.sha256, name: documento.nombre, size: documento.tamano, status: 'done' }] : enCurso ? [enCurso] : []
  return (
    <div className="pt-pila pt-pila--chica" id={id}>
      <FileUpload
        label={etiqueta}
        accept="application/pdf"
        maxFiles={1}
        maxSize={10 * 1024 * 1024}
        requirements={requisitos}
        files={archivos}
        error={error}
        onFilesAdd={(lista) => {
          const f = lista[0]
          if (!f) return
          setEnCurso({ id: 'calculando', name: f.name, size: f.size, status: 'uploading' })
          documentoDe(f).then(
            (d) => {
              setEnCurso(null)
              onCambio(d)
            },
            () => {
              setEnCurso({ id: 'error', name: f.name, size: f.size, status: 'error', error: 'No se pudo leer el archivo.' })
            },
          )
        }}
        onFileRemove={() => {
          setEnCurso(null)
          onCambio(null)
        }}
      />
      {documento ? <code className="pt-huella">SHA-256 {documento.sha256.slice(0, 16)}…</code> : null}
    </div>
  )
}

/**
 * Un valor que depende de una pregunta abierta del PO: se ve como tal en la pantalla, con
 * el texto de lo que se supuso, para que la revisión de G2 lo decida y no pase inadvertido.
 */
export function Supuesto({ children }: { children: ReactNode }) {
  return (
    <span className="pt-supuesto">
      <Tag size="sm" variant="outline">
        Supuesto
      </Tag>
      <span className="pt-supuesto__texto">{children}</span>
    </span>
  )
}

/** Error de una operación: qué pasó, qué hacer y el código de soporte (correlationId). */
export function AvisoDeError({ error, reintentar, titulo }: { error: unknown; reintentar?: () => void; titulo?: string }) {
  const e = error instanceof ErrorSimulado ? error : null
  const sinPermiso = e?.status === 403
  const tituloPorDefecto = sinPermiso
    ? 'No tienes permiso para esta acción'
    : e?.status === 0
      ? 'Sin conexión'
      : e && e.status >= 500
        ? 'El servicio no respondió'
        : e?.status === 409
          ? 'No se pudo completar'
          : 'Algo salió mal'
  return (
    <Alert
      tone={sinPermiso || e?.status === 409 ? 'warning' : 'danger'}
      title={titulo ?? tituloPorDefecto}
      actions={
        reintentar && !sinPermiso && e?.status !== 409 ? (
          <Button variant="secondary" size="sm" onClick={reintentar}>
            Reintentar
          </Button>
        ) : undefined
      }
    >
      <span className="pt-alerta__texto">{e?.message ?? 'Error inesperado del prototipo.'}</span>
      {sinPermiso ? <span className="pt-alerta__texto">Pídelo a tu supervisor ATC.</span> : null}
      {e ? <span className="pt-alerta__codigo">Código de soporte: {e.correlationId}</span> : null}
    </Alert>
  )
}

/**
 * Sin permiso (403) en una pantalla. Se compone con ErrorPage y no con Error403: Error403
 * trae fijo «Volver a mis promociones» y un mailto a soporte real (pedido al framework).
 * «Solicitar acceso» es una simulación declarada: no envía nada.
 */
export function Prohibido({ requiere, recurso, volver = true }: { requiere: string; recurso: string; volver?: boolean }) {
  const [pedido, setPedido] = useState(false)
  return (
    <ErrorPage
      status={403}
      scope="region"
      title={`No tienes permiso para ${recurso}`}
      description={`Hace falta el rol ${requiere}. Puede darte acceso la supervisora ATC (Gabriela Núñez, persona ficticia).`}
      actions={
        <>
          <Button
            variant="secondary"
            disabled={pedido}
            onClick={() => {
              setPedido(true)
              toast({ message: 'Solicitud simulada: en la consola real le llegaría a la supervisora ATC.', tone: 'info' })
            }}
          >
            {pedido ? 'Acceso solicitado' : 'Solicitar acceso'}
          </Button>
          {volver ? (
            <Button variant="primary" onClick={() => irA(hrefDe('bandeja'))}>
              Volver a la bandeja
            </Button>
          ) : null}
        </>
      }
    />
  )
}

/** Errores por campo de un 400: `{ campo: mensaje }`. */
export function erroresDeCampos(error: unknown): Record<string, string> {
  if (!(error instanceof ErrorSimulado) || error.status !== 400) return {}
  return Object.fromEntries(error.campos.map((c) => [c.campo, c.mensaje]))
}

export type EstadoCarga = { readonly fase: 'cargando' } | { readonly fase: 'listo' } | { readonly fase: 'error'; readonly error: unknown }

/** La lectura inicial de una pantalla (con su latencia y su posible fallo). */
export function useCarga(clave: string): [EstadoCarga, () => void] {
  const [estado, setEstado] = useState<EstadoCarga>({ fase: 'cargando' })
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    let vigente = true
    setEstado({ fase: 'cargando' })
    api.cargar().then(
      () => vigente && setEstado({ fase: 'listo' }),
      (error: unknown) => vigente && setEstado({ fase: 'error', error }),
    )
    return () => {
      vigente = false
    }
  }, [clave, intento])
  return [estado, useCallback(() => setIntento((n) => n + 1), [])]
}

/** Una acción con su «en curso» y su error, sin doble envío. */
export function useAccion() {
  const [enCurso, setEnCurso] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const ejecutar = useCallback(async <T,>(accion: () => Promise<T>): Promise<T | undefined> => {
    setEnCurso(true)
    setError(null)
    try {
      return await accion()
    } catch (e) {
      setError(e)
      return undefined
    } finally {
      setEnCurso(false)
    }
  }, [])
  return { enCurso, error, ejecutar, limpiar: useCallback(() => setError(null), []) }
}

export const irA = (ruta: string) => {
  location.hash = ruta
}

/** 768px = --aybar-breakpoint-md; 1024px = lg (las media queries no admiten var()). */
export const TABLETA = '(min-width: 768px)'
export const ESCRITORIO = '(min-width: 1024px)'

export function useMedia(consulta: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const lista = matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    () => matchMedia(consulta).matches,
  )
}

/** De la llamada de un número desconocido a «Nuevo ticket» en modo interesado (HU-ATC-042 CA-03). */
export const precarga: { telefono: string | null } = { telefono: null }
