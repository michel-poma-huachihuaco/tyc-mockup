import { Breadcrumb, Card, CardBody, Chip, DataGrid, EmptyState, Header, ProgressBar, StatGroup } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useMemo, useState } from 'react'
import { ESTADOS_ACTIVOS, NOMBRE_AREA } from '../datos/catalogos.ts'
import { AvisoDeError, BadgeE2E, Prohibido, Supuesto, TEXTO_E2E, horas, irA, useCarga } from '../comun.tsx'
import { hrefDe } from '../rutas.ts'
import { useConsola, useSesion } from '../servicio/api.ts'
import { cierreE2E, puede } from '../servicio/nucleo.ts'
import type { CierreE2E as E2E, Ticket } from '../servicio/nucleo.ts'

type Fila = { readonly ticket: Ticket; readonly e2e: E2E }
type Nivel = Exclude<E2E['nivel'], 'cerrado'>

/**
 * Cierre end-to-end — HU-ATC-029. Cuánto lleva cada ticket activo de punta a punta, en
 * horas hábiles, contra 72 h sin escalamiento o contra el plazo del eje si está escalado.
 * La vista completa vive en la Torre de Control (EP-ATC-07, próxima ola).
 */
export default function CierreE2EPantalla() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('cierre')
  const [niveles, setNiveles] = useState<Nivel[]>([])

  const filas = useMemo<Fila[]>(
    () =>
      datos.tickets
        .filter((t) => ESTADOS_ACTIVOS.includes(t.estado) || t.estado === 'RESOLVED')
        .map((t) => ({ ticket: t, e2e: cierreE2E(t, datos.ahora) }))
        .sort((a, b) => b.e2e.horas / b.e2e.limite - a.e2e.horas / a.e2e.limite),
    [datos],
  )

  if (!puede.verCierreE2E(sesion.rol)) {
    return (
      <div className="pt-pagina">
        <Header title="Cierre end-to-end" />
        <Prohibido requiere="Coordinador CX o Supervisor ATC" recurso="ver el cierre end-to-end" />
      </div>
    )
  }

  const visibles = filas.filter((f) => !niveles.length || niveles.includes(f.e2e.nivel as Nivel))
  const cuenta = (n: Nivel) => filas.filter((f) => f.e2e.nivel === n).length
  const columnas: GridColumn<Fila>[] = [
    {
      key: 'numero',
      header: 'Ticket',
      width: '8.5rem',
      renderCell: (f) => (
        <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => irA(hrefDe(`ticket/${f.ticket.id}`))}>
          {f.ticket.numero}
        </button>
      ),
    },
    { key: 'resumen', header: 'Solicitud', width: '16rem', renderCell: (f) => f.ticket.resumen },
    { key: 'area', header: 'Área', width: '8rem', renderCell: (f) => NOMBRE_AREA[f.ticket.area] },
    { key: 'eje', header: 'Escalamiento', width: '9rem', renderCell: (f) => (f.e2e.escalado ? 'Escalado (Eje 3)' : `Sin escalar (Eje ${f.ticket.eje})`) },
    {
      key: 'avance',
      header: 'Horas hábiles',
      width: '14rem',
      renderCell: (f) => (
        <ProgressBar
          size="sm"
          value={Math.min(100, Math.round((f.e2e.horas / f.e2e.limite) * 100))}
          label={`${f.ticket.numero}: horas hábiles contra el plazo`}
          hideLabel
          detail={`${horas(Math.round(f.e2e.horas * 10) / 10)} de ${horas(f.e2e.limite)}`}
          tone={f.e2e.nivel === 'en-riesgo' ? 'danger' : 'brand'}
        />
      ),
    },
    { key: 'nivel', header: 'Situación', width: '12rem', renderCell: (f) => <BadgeE2E e2e={f.e2e} /> },
  ]

  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Cierre end-to-end"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Cierre end-to-end' }]} />}
        description="Sin escalamiento, el objetivo es cerrar en 72 horas hábiles; escalado, el plazo de su eje."
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={(['en-riesgo', 'por-vencer', 'en-plazo'] as const).map((n) => ({ id: n, label: TEXTO_E2E[n], value: String(cuenta(n)) }))}
          />
          <Card>
            <CardBody>
              <div className="pt-pila">
                <div className="pt-en-linea" role="group" aria-label="Filtrar por situación">
                  {(['en-riesgo', 'por-vencer', 'en-plazo'] as const).map((n) => (
                    <Chip key={n} variant="selectable" selected={niveles.includes(n)} onSelectedChange={(s) => setNiveles((l) => (s ? [...l, n] : l.filter((x) => x !== n)))}>
                      {TEXTO_E2E[n]} ({cuenta(n)})
                    </Chip>
                  ))}
                </div>
                <DataGrid<Fila>
                  caption="Cierre end-to-end de los tickets abiertos"
                  columns={columnas}
                  rows={carga.fase === 'listo' ? visibles : []}
                  getRowId={(f) => f.ticket.id}
                  loading={carga.fase === 'cargando'}
                  emptyState={<EmptyState size="compact" variant="no-results" title="Ningún ticket en esa situación" description="Quita el filtro para ver todos los abiertos." />}
                />
                <Supuesto>Plazo del Eje 3: 10 días hábiles (90 h); «por vencer» desde el 80 % del plazo.</Supuesto>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
