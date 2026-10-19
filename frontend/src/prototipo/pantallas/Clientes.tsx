import { Alert, Badge, Breadcrumb, Button, DataGrid, EmptyState, FormField, Header, Input } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useEffect, useRef, useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, irA } from '../comun.tsx'
import { dniEnmascarado } from '../datos/clientes.ts'
import { hrefDe } from '../rutas.ts'
import { api, useSesion } from '../servicio/api.ts'
import { ErrorSimulado } from '../servicio/nucleo.ts'
import { puedeVerClientes } from '../servicio/ola7.ts'
import type { ResultadoBusqueda } from '../servicio/ola7.ts'

/**
 * Búsqueda de clientes (HU-ATC-049): por DNI, nombre, código, lote, teléfono o N.º de ticket.
 * La lista trae DNI parcial y lote para elegir al cliente correcto (CA-03). Si SIGDA/TAXON no
 * responde o el cliente no existe, se ofrece la excepción «Interesado» (HU-ATC-051).
 */
export function BuscadorClientes({ accion, onElegir, onInteresado, etiqueta = 'Buscar cliente' }: { accion: string; onElegir: (r: ResultadoBusqueda) => void; onInteresado?: () => void; etiqueta?: string }) {
  const [consulta, setConsulta] = useState('')
  const [fase, setFase] = useState<'inicial' | 'buscando' | 'listo' | 'error'>('inicial')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [error, setError] = useState<unknown>(null)
  const vigente = useRef(0)
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const buscar = (q: string) => {
    clearTimeout(temporizador.current)
    if (q.trim().length < 3) {
      vigente.current++
      setFase('inicial')
      setResultados([])
      return
    }
    setFase('buscando')
    const turno = ++vigente.current
    temporizador.current = setTimeout(() => {
      api.buscarClientes360(q).then(
        (r) => turno === vigente.current && (setResultados(r), setError(null), setFase('listo')),
        (e: unknown) => turno === vigente.current && (setError(e), setResultados([]), setFase('error')),
      )
    }, 250)
  }
  useEffect(() => () => clearTimeout(temporizador.current), [])

  const columnas: GridColumn<ResultadoBusqueda>[] = [
    { key: 'nombre', header: 'Cliente', renderCell: (r) => r.cliente.nombre },
    { key: 'dni', header: 'DNI', width: '8rem', renderCell: (r) => dniEnmascarado(r.cliente.dni) },
    { key: 'lote', header: 'Lote', renderCell: (r) => r.cliente.proyectos.join(' · ') },
    { key: 'coincide', header: 'Coincide por', width: '10rem', renderCell: (r) => <Badge tone="neutral" size="sm">{r.criterio}</Badge> },
    { key: 'accion', header: 'Acción', width: '9rem', renderCell: (r) => <Button size="sm" variant="secondary" aria-label={`${accion}: ${r.cliente.nombre}`} onClick={() => onElegir(r)}>{accion}</Button> },
  ]
  const sigda = error instanceof ErrorSimulado && error.codigo === 'sigda-no-disponible'

  return (
    <div className="pt-pila">
      <FormField label={etiqueta} helper="DNI, nombre, código de cliente, lote, teléfono o N.º de ticket (mínimo 3 caracteres).">
        <Input
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value)
            buscar(e.target.value)
          }}
          placeholder="Ej. 9123, Quispe, Villa Sol II, +51 900 o AIN-0004"
        />
      </FormField>
      {fase === 'error' ? (
        <div className="pt-pila">
          <AvisoDeError error={error} reintentar={() => buscar(consulta)} titulo={sigda ? 'SIGDA/TAXON no respondió' : undefined} />
          {sigda && onInteresado ? (
            <Alert tone="info" size="sm" title="Puedes seguir atendiendo" actions={<Button size="sm" variant="secondary" onClick={onInteresado}>Registrar como interesado</Button>}>
              <span className="pt-alerta__texto">El ticket se crea con datos mínimos y el sistema lo vincula al cliente cuando SIGDA/TAXON vuelva.</span>
            </Alert>
          ) : null}
        </div>
      ) : (
        <>
          <DataGrid<ResultadoBusqueda>
            caption="Resultados de la búsqueda de clientes"
            columns={columnas}
            rows={fase === 'listo' ? resultados : []}
            getRowId={(r) => r.cliente.id}
            loading={fase === 'buscando'}
            emptyState={
              fase === 'inicial' ? (
                <EmptyState size="compact" title="Busca a un cliente" description="Escribe al menos 3 caracteres." />
              ) : (
                <EmptyState
                  size="compact"
                  title="No se encontró al cliente"
                  description="Revisa el dato. El alta del cliente se hace en el maestro, no aquí."
                  action={onInteresado ? <Button size="sm" variant="secondary" onClick={onInteresado}>Registrar como interesado</Button> : undefined}
                />
              )
            }
          />
          {fase === 'listo' && resultados.length > 1 ? <p className="pt-texto-chico">Hay {resultados.length} coincidencias: elige por el lote y el DNI parcial.</p> : null}
        </>
      )}
    </div>
  )
}

export default function Clientes() {
  const sesion = useSesion()
  if (!puedeVerClientes(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="Clientes" />
        <Prohibido requiere="de atención al cliente o Coordinador CX" recurso="buscar clientes" />
      </div>
    )
  }
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="Clientes"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'Clientes' }]} />}
        description="Busca al cliente, mira su consulta 360 y llámalo desde su ficha."
      />
      <BuscadorClientes accion="Ver ficha" onElegir={(r) => irA(hrefDe(`clientes/${r.cliente.id}`))} onInteresado={() => irA(hrefDe('nuevo'))} />
      <Supuesto>La búsqueda consulta SIGDA/TAXON en línea (objetivo: 2 s o menos); el prototipo no guarda ninguna copia del cliente (RN-SVC-026).</Supuesto>
    </div>
  )
}
