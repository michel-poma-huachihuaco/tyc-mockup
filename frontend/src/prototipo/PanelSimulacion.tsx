import { Button, ButtonGroup, DateTimePicker, FormField, SegmentedControl, Select, SidePanel, Switch, toast } from '@aybarcorp/ui'
import { useState } from 'react'
import type { Rol } from './datos/catalogos.ts'
import { EMPRESAS, nombrePersona } from './datos/catalogos.ts'
import { AvisoDeError, fecha, fechaLarga, useAccion } from './comun.tsx'
import { CLIENTES } from './datos/clientes.ts'
import { PERSONA_DE_ROL, api, resumenJob, simulacion, useConsola, useSesion } from './servicio/api.ts'
import { FUENTES } from './servicio/ola7.ts'

/** Vie 26-jun-2026 18:00; el lunes 29 es feriado (HU-ATC-003 CA-02). */
const CASO_FERIADO = new Date(2026, 5, 26, 18, 0)


/**
 * Los mandos del recorrido de revisión. No son parte del producto: sirven para llegar a
 * los estados que los criterios de aceptación describen (un vencimiento, un feriado, un
 * fallo de red, dos guardados a la vez) sin esperar días reales.
 */
export function PanelSimulacion({
  abierto,
  onCerrar,
  roles,
}: {
  abierto: boolean
  onCerrar: () => void
  roles: ReadonlyArray<{ readonly rol: Rol; readonly etiqueta: string }>
}) {
  const { datos, sim } = useConsola()
  const sesion = useSesion()
  const concurrencia = useAccion()
  const inmutable = useAccion()
  const empresaInmutable = useAccion()
  const vencimientoInmutable = useAccion()
  const gate = useAccion()
  const [numeros, setNumeros] = useState<string[] | null>(null)
  const [empresaPrueba, setEmpresaPrueba] = useState('AIN')
  const [numeroLlamada, setNumeroLlamada] = useState(CLIENTES[2].telefono)
  const enLegal = [...datos.sincLegal].reverse().find((s) => s.estado === 'ENVIADO' || s.estado === 'EN_REVISION')
  const ultimaFila = datos.filasEstado.at(-1)
  const ultimoJob = datos.ejecuciones.at(-1)
  const unAsiento = datos.asientos[0]
  const unProrrogado = datos.asientos.find((a) => a.prorroga)
  const enConflicto = datos.tickets.find((t) => t.eje !== 3 && datos.senales.some((s) => s.ticketId === t.id) && (t.estado === 'IN_PROGRESS' || t.estado === 'OPEN' || t.estado === 'PENDING_CUSTOMER'))

  const avanzar = (horas: number, texto: string) => {
    const job = simulacion.avanzar(horas)
    toast({ message: `Reloj +${texto}. ${resumenJob(job)}`, tone: 'info' })
  }

  return (
    <SidePanel open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Simulación" size="md" resizable>
      <div className="pt-panel">
        <p className="pt-texto-chico">Mandos para revisar el prototipo. No son parte del producto ni de la consola real.</p>

        <section className="pt-panel__seccion" aria-labelledby="sim-sesion">
          <h2 id="sim-sesion" className="pt-panel__titulo">
            Sesión
          </h2>
          <FormField label="Ver como" helper="Cambia la persona ficticia y sus permisos.">
            <Select
              value={sesion.rol}
              onChange={(e) => simulacion.ajustar({ personaId: PERSONA_DE_ROL[e.target.value as Rol] })}
              options={roles.map((r) => ({ value: r.rol, label: `${r.etiqueta} · ${nombrePersona(PERSONA_DE_ROL[r.rol])}` }))}
            />
          </FormField>
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-reloj">
          <h2 id="sim-reloj" className="pt-panel__titulo">
            Reloj simulado
          </h2>
          <p className="pt-texto" aria-live="polite">
            Ahora: <strong>{fechaLarga(datos.ahora)}</strong>
          </p>
          <ButtonGroup>
            <Button size="sm" variant="secondary" onClick={() => avanzar(1, '1 hora hábil')}>
              +1 hora hábil
            </Button>
            <Button size="sm" variant="secondary" onClick={() => avanzar(9, '1 día hábil')}>
              +1 día hábil
            </Button>
            <Button size="sm" variant="secondary" onClick={() => avanzar(27, '3 días hábiles')}>
              +3 días hábiles
            </Button>
          </ButtonGroup>
          <p className="pt-texto-chico">Al avanzar, corre el job de alertas como lo haría el programado.</p>
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-job">
          <h2 id="sim-job" className="pt-panel__titulo">
            Job de alertas (SLA y legales)
          </h2>
          <Button size="sm" variant="secondary" onClick={() => toast({ message: resumenJob(simulacion.ejecutarJob()), tone: 'info' })}>
            Ejecutar el job ahora
          </Button>
          {ultimoJob ? (
            <p className="pt-texto-chico">
              Última corrida: {fecha(ultimoJob.fecha)} · {ultimoJob.nuevas} nuevas · {ultimoJob.omitidas} omitidas.
            </p>
          ) : null}
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-apertura">
          <h2 id="sim-apertura" className="pt-panel__titulo">
            Apertura del próximo ticket
          </h2>
          <Switch
            label="Usar una fecha de apertura simulada"
            description="Para probar vencimientos en fin de semana y feriados."
            checked={sim.apertura !== null}
            onCheckedChange={(c) => simulacion.ajustar({ apertura: c ? CASO_FERIADO : null })}
          />
          {sim.apertura ? (
            <>
              <DateTimePicker label="Apertura simulada" value={sim.apertura} onValueChange={(d) => d && simulacion.ajustar({ apertura: d })} locale="es-PE" timeStep={30} />
              <Button size="sm" variant="ghost" onClick={() => simulacion.ajustar({ apertura: CASO_FERIADO })}>
                Caso feriado: vie 26-jun-2026, 18:00
              </Button>
            </>
          ) : null}
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-red">
          <h2 id="sim-red" className="pt-panel__titulo">
            Red y servicios
          </h2>
          <SegmentedControl
            label="Latencia del servicio"
            size="sm"
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'lenta', label: 'Lenta (2,6 s)' },
            ]}
            value={sim.latencia}
            onValueChange={(v) => simulacion.ajustar({ latencia: v === 'lenta' ? 'lenta' : 'normal' })}
          />
          <Switch
            label="Sin conexión"
            description="Toda carga, guardado o acción falla hasta que lo apagues; después, «Reintentar» recupera."
            checked={sim.sinConexion}
            onCheckedChange={(c) => simulacion.ajustar({ sinConexion: c })}
          />
          <Switch
            label="SIGDA/TAXON no disponible"
            description="La búsqueda de clientes responde 503; al volver, se vinculan solos los interesados con DNI."
            checked={sim.sigdaCaido}
            onCheckedChange={(c) => simulacion.fuente('SIGDA', c)}
          />
          {FUENTES.filter((f) => f.id !== 'SIGDA').map((f) => (
            <Switch
              key={f.id}
              label={`${f.nombre} no disponible`}
              description={f.id === 'LEGAL' ? 'El envío a Legal queda en cola y se reintenta; al volver, se envía.' : 'Esa sección o integración responde 503 y el resto sigue.'}
              checked={datos.fuentesCaidas.includes(f.id)}
              onCheckedChange={(c) => simulacion.fuente(f.id, c)}
            />
          ))}
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-reglas">
          <h2 id="sim-reglas" className="pt-panel__titulo">
            Pruebas de reglas
          </h2>
          <FormField label="Empresa para la prueba de concurrencia">
            <Select value={empresaPrueba} onChange={(e) => setEmpresaPrueba(e.target.value)} options={EMPRESAS.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` }))} />
          </FormField>
          <Button
            size="sm"
            variant="secondary"
            loading={concurrencia.enCurso}
            onClick={async () => {
              setNumeros(null)
              const r = await concurrencia.ejecutar(() => simulacion.guardadosSimultaneos(empresaPrueba))
              if (r) setNumeros(r.map((t) => t.numero))
            }}
          >
            Dos guardados simultáneos
          </Button>
          {numeros ? (
            <p className="pt-texto" role="status">
              Números asignados: <strong>{numeros.join(' y ')}</strong> — distintos y consecutivos.
            </p>
          ) : null}
          {concurrencia.error ? <AvisoDeError error={concurrencia.error} /> : null}

          <Button
            size="sm"
            variant="secondary"
            disabled={!ultimaFila}
            loading={inmutable.enCurso}
            onClick={() => inmutable.ejecutar(() => api.modificarFila(ultimaFila?.id ?? '', 'editar'))}
          >
            Intentar editar la última fila del historial de estados
          </Button>
          {inmutable.error ? <AvisoDeError error={inmutable.error} titulo="Rechazado: el historial es inmutable" /> : null}

          <Button
            size="sm"
            variant="secondary"
            disabled={!unAsiento}
            loading={empresaInmutable.enCurso}
            onClick={() => empresaInmutable.ejecutar(() => api.cambiarEmpresaDeAsiento(unAsiento?.codigo ?? ''))}
          >
            Intentar cambiar la razón social de {unAsiento?.codigo ?? 'un asiento'}
          </Button>
          {empresaInmutable.error ? <AvisoDeError error={empresaInmutable.error} titulo="Rechazado: la empresa del asiento no cambia" /> : null}

          <Button
            size="sm"
            variant="secondary"
            disabled={!unProrrogado}
            loading={vencimientoInmutable.enCurso}
            onClick={() => vencimientoInmutable.ejecutar(() => api.modificarVencimiento(unProrrogado?.codigo ?? ''))}
          >
            Intentar modificar el vencimiento prorrogado de {unProrrogado?.codigo ?? 'un asiento'}
          </Button>
          {vencimientoInmutable.error ? <AvisoDeError error={vencimientoInmutable.error} titulo="Rechazado: el vencimiento no se reescribe" /> : null}

          <Button
            size="sm"
            variant="secondary"
            disabled={!enConflicto}
            loading={gate.enCurso}
            onClick={() => gate.ejecutar(() => api.cambiarEstado(enConflicto?.id ?? '', 'RESOLVED', null))}
          >
            Intentar resolver en Eje {enConflicto?.eje ?? '1/2'} un ticket con conflicto{enConflicto ? ` (${enConflicto.numero})` : ''}
          </Button>
          {gate.error ? <AvisoDeError error={gate.error} titulo="Rechazado: gate no compensable" /> : null}

          <Button size="sm" variant="secondary" onClick={() => { simulacion.registroParalelo(); toast({ message: 'Registro paralelo creado. Ejecuta la auditoría en la Torre de Control.', tone: 'info' }) }}>
            Crear un registro paralelo del dato de cliente
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const r = simulacion.evaluarMorosidad()
              toast({ message: `Evaluación de morosidad: ${r.nuevos} casos nuevos (${r.suspendidos} suspendidos por reclamo), ${r.reactivados} reactivados y ${r.escaladas} cartas escaladas.`, tone: 'info' })
            }}
          >
            Evaluar la morosidad (corrida diaria)
          </Button>

          <FormField label="Número que llama">
            <Select
              value={numeroLlamada}
              onChange={(e) => setNumeroLlamada(e.target.value)}
              options={[...CLIENTES.slice(0, 4).map((c) => ({ value: c.telefono, label: `${c.nombre} · ${c.telefono}` })), { value: '+51 900 000 000', label: 'Número no registrado · +51 900 000 000' }]}
            />
          </FormField>
          <Button size="sm" variant="secondary" disabled={sim.llamada !== null} onClick={() => simulacion.ajustar({ llamada: { numero: numeroLlamada, id: Date.now() } })}>
            Simular una llamada entrante
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={!enLegal}
            onClick={() => {
              try {
                if (enLegal) simulacion.legalActualiza(enLegal.ticketId, 'RESUELTO', 'Se resolvió el caso legal y se notificó al cliente.')
                toast({ message: 'Legal resolvió el caso en su herramienta: el ticket lo refleja.', tone: 'info' })
              } catch (e) {
                toast({ message: e instanceof Error ? e.message : 'No se pudo sincronizar.', tone: 'warning' })
              }
            }}
          >
            Legal resuelve el último caso enviado
          </Button>

          <Button size="sm" variant="secondary" onClick={() => { const r = simulacion.ticketEntrante('CTA'); toast({ message: r.resultado === 'asignado' ? `${r.numero} entró por Mi Portal y el flujo lo asignó.` : `${r.numero} entró por Mi Portal y quedó en la cola del área.`, tone: 'info' }) }}>
            Simular un ticket entrante por Mi Portal
          </Button>
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-datos">
          <h2 id="sim-datos" className="pt-panel__titulo">
            Datos
          </h2>
          <ButtonGroup>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                simulacion.vaciar()
                toast({ message: 'Consola vacía: así se ve el primer uso.', tone: 'info' })
              }}
            >
              Vaciar (primer uso)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                simulacion.reiniciar()
                setNumeros(null)
                toast({ message: 'Datos y reloj de vuelta al estado inicial.', tone: 'info' })
              }}
            >
              Restaurar el estado inicial
            </Button>
          </ButtonGroup>
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-eventos">
          <h2 id="sim-eventos" className="pt-panel__titulo">
            Telemetría emitida ({datos.eventos.length})
          </h2>
          {datos.eventos.length ? (
            <ol className="pt-registro">
              {[...datos.eventos].reverse().slice(0, 15).map((e) => (
                <li key={e.id}>
                  <code>{e.nombre}</code> <span className="pt-texto-chico">{fecha(e.fecha)}</span>
                  <pre className="pt-registro__datos">{JSON.stringify(e.datos)}</pre>
                </li>
              ))}
            </ol>
          ) : (
            <p className="pt-texto-chico">Aún no hay eventos en esta sesión. Registra un ticket o cambia un estado.</p>
          )}
        </section>

        <section className="pt-panel__seccion" aria-labelledby="sim-auditoria">
          <h2 id="sim-auditoria" className="pt-panel__titulo">
            Auditoría: intentos rechazados ({datos.auditoria.length})
          </h2>
          {datos.auditoria.length ? (
            <ol className="pt-registro">
              {[...datos.auditoria].reverse().map((a) => (
                <li key={a.id}>
                  <strong>{a.accion}</strong> · {nombrePersona(a.actor)} · <span className="pt-texto-chico">{fecha(a.fecha)}</span>
                  <p className="pt-texto-chico">{a.detalle}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="pt-texto-chico">Sin intentos rechazados.</p>
          )}
        </section>
      </div>
    </SidePanel>
  )
}
