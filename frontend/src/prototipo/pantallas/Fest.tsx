import { Alert, Badge, Breadcrumb, Button, Card, CardBody, CardHeader, CardPairs, DataGrid, Dialog, EmptyState, Form, FormField, Header, Select, StatGroup, Tag, Textarea, toast } from '@aybarcorp/ui'
import type { GridColumn } from '@aybarcorp/ui'
import { useId, useState } from 'react'
import { AvisoDeError, Prohibido, Supuesto, erroresDeCampos, fecha, useAccion, useCarga } from '../comun.tsx'
import { NOMBRE_NIVEL_RIESGO } from '../datos/catalogos.ts'
import type { NivelRiesgo } from '../datos/catalogos.ts'
import { hrefDe } from '../rutas.ts'
import { api, useConsola, useSesion } from '../servicio/api.ts'
import { ETIQUETA_FEST, FRASES, PALABRAS_GATILLO, detectarGatillo, puedeModerar, puedeRevisarFest } from '../servicio/ola5.ts'
import type { CasoFest, EstadoFest } from '../servicio/ola5.ts'

const NOMBRE_ESTADO: Record<EstadoFest, string> = { EN_SALA: 'En sala', CERRADO_EN_SALA: 'Cerrado en sala', DERIVADO: 'Derivado a la Estación 4' }
const TONO: Record<EstadoFest, 'info' | 'neutral' | 'danger'> = { EN_SALA: 'info', CERRADO_EN_SALA: 'neutral', DERIVADO: 'danger' }
const RIESGOS: NivelRiesgo[] = ['BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO']

/** EntregaFest en vivo — HU-ATC-037 (riesgo y Frases Ancla), 038 (Estación 4) y 039 (etiqueta y revisión). */
export default function Fest() {
  const sesion = useSesion()
  const { datos } = useConsola()
  const [carga, reintentar] = useCarga('fest')
  const [activo, setActivo] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState(false)
  if (!puedeRevisarFest(sesion)) {
    return (
      <div className="pt-pagina">
        <Header title="EntregaFest en vivo" />
        <Prohibido requiere="Moderador de evento o Coordinador CX" recurso="ver EntregaFest" />
      </div>
    )
  }
  const modera = puedeModerar(sesion)
  const casos = datos.casosFest
  const caso = casos.find((c) => c.id === activo) ?? null
  const columnas: GridColumn<CasoFest>[] = [
    { key: 'codigo', header: 'Caso', width: '8rem', renderCell: (c) => <button type="button" tabIndex={-1} className="pt-enlace-celda" onClick={() => setActivo(c.id)}>{c.codigo}</button> },
    { key: 'resumen', header: 'Lo observado', width: '18rem', renderCell: (c) => c.resumen },
    { key: 'riesgo', header: 'Riesgo verbal', width: '9rem', renderCell: (c) => NOMBRE_NIVEL_RIESGO[c.riesgo] },
    { key: 'frases', header: 'Frases', width: '8rem', renderCell: (c) => (c.frases.length ? `Hasta la ${c.frases.at(-1)?.n}` : '—') },
    { key: 'etiqueta', header: 'Etiqueta', width: '15rem', renderCell: (c) => (c.registro ? <Tag size="sm">{c.registro.etiqueta}</Tag> : <span className="pt-texto-chico">Sin registrar</span>) },
    { key: 'derivado', header: '¿Derivado a la Estación 4?', width: '12rem', renderCell: (c) => (c.derivado ? <Badge tone="danger" size="sm" dot>Sí</Badge> : <Badge tone="neutral" size="sm">No</Badge>) },
    { key: 'estado', header: 'Estado', width: '11rem', renderCell: (c) => <Badge tone={TONO[c.estado]} size="sm">{NOMBRE_ESTADO[c.estado]}</Badge> },
  ]
  return (
    <div className="pt-pagina pt-pagina--ancha">
      <Header
        title="EntregaFest en vivo"
        breadcrumb={<Breadcrumb items={[{ label: 'Bandeja', href: hrefDe('bandeja') }, { label: 'EntregaFest en vivo' }]} />}
        description="Consola del moderador: riesgo verbal, Frases Ancla y derivación inmediata a la Estación 4. El coordinador revisa el bloque."
        actions={modera ? <Button variant="primary" onClick={() => setNuevo(true)}>Registrar caso</Button> : undefined}
      />
      {carga.fase === 'error' ? (
        <AvisoDeError error={carga.error} reintentar={reintentar} />
      ) : (
        <div className="pt-pila">
          <StatGroup
            loading={carga.fase === 'cargando'}
            items={[
              { id: 'tot', label: 'Casos del evento', value: String(casos.length) },
              { id: 'sala', label: 'En sala', value: String(casos.filter((c) => c.estado === 'EN_SALA').length) },
              { id: 'der', label: 'Derivados a la Estación 4', value: String(casos.filter((c) => c.derivado).length) },
            ]}
          />
          {!modera ? <Alert tone="info" size="sm" title="Revisión"><span className="pt-alerta__texto">El coordinador revisa cada caso con su etiqueta y si se derivó; no los modifica.</span></Alert> : null}
          <Card>
            <CardHeader as="h2" title="Registro de casos" subtitle={`Etiqueta estándar: «${ETIQUETA_FEST}».`} />
            <CardBody>
              <div className="pt-pila">
                <DataGrid<CasoFest> caption="Casos del evento" columns={columnas} rows={carga.fase === 'listo' ? [...casos].reverse() : []} getRowId={(c) => c.id} loading={carga.fase === 'cargando'} emptyState={<EmptyState size="compact" variant="first-use" title="Sin casos todavía" description="El moderador registra aquí lo que detecta en sala." />} />
                <Supuesto>Solo el texto de las Frases 4 y 6 viene en las HU; el resto es del guion del moderador (por confirmar). Los casos no llevan nombres ni datos personales.</Supuesto>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      {caso ? <FichaCaso caso={caso} modera={modera} onCerrar={() => setActivo(null)} /> : null}
      <DialogoNuevo abierto={nuevo} onCerrar={() => setNuevo(false)} />
    </div>
  )
}

function DialogoNuevo({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const id = useId()
  const [resumen, setResumen] = useState('')
  const [riesgo, setRiesgo] = useState<NivelRiesgo | ''>('')
  const guardar = useAccion()
  const errores = erroresDeCampos(guardar.error)
  const gatillo = detectarGatillo(resumen)
  const enviar = async () => {
    const c = await guardar.ejecutar(() => api.registrarCasoFest({ resumen, riesgo }))
    if (c) {
      toast({ message: `${c.codigo} registrado en sala.`, tone: 'success' })
      setResumen('')
      setRiesgo('')
      onCerrar()
    }
  }
  return (
    <Dialog open={abierto} onOpenChange={(a) => (a ? undefined : onCerrar())} title="Registrar caso del evento" description="Lo observado y la clasificación de riesgo verbal, sin nombres ni datos personales." size="md" footer={<><Button variant="ghost" onClick={onCerrar}>Cancelar</Button><Button variant="primary" type="submit" form={`${id}-f`} loading={guardar.enCurso}>Registrar</Button></>}>
      <Form id={`${id}-f`} onSubmit={enviar} errors={Object.fromEntries(Object.entries(errores).map(([k, m]) => [`${id}-${k}`, m]))}>
        <FormField label="Lo observado" id={`${id}-resumen`} error={errores.resumen} required helper={gatillo.length ? `Palabra de riesgo muy alto: ${gatillo.join(', ')}. Derivación inmediata a la Estación 4.` : `Palabras gatillo: ${PALABRAS_GATILLO.join(', ')}.`}>
          <Textarea rows={3} value={resumen} onChange={(e) => setResumen(e.target.value)} maxLength={500} showCounter />
        </FormField>
        <FormField label="Riesgo verbal" id={`${id}-riesgo`} error={errores.riesgo} required>
          <Select value={riesgo} placeholder="Elige el nivel" onChange={(e) => setRiesgo(e.target.value as NivelRiesgo)} options={RIESGOS.map((r) => ({ value: r, label: NOMBRE_NIVEL_RIESGO[r] }))} />
        </FormField>
        {guardar.error && !Object.keys(errores).length ? <AvisoDeError error={guardar.error} reintentar={enviar} /> : null}
      </Form>
    </Dialog>
  )
}

function FichaCaso({ caso, modera, onCerrar }: { caso: CasoFest; modera: boolean; onCerrar: () => void }) {
  const id = useId()
  const [nota, setNota] = useState('')
  const accion = useAccion()
  const siguiente = caso.frases.length + 1
  const enSala = caso.estado === 'EN_SALA'
  const hacer = async (fn: () => Promise<unknown>, mensaje: string) => {
    const ok = await accion.ejecutar(async () => {
      await fn()
      return true
    })
    if (ok) toast({ message: mensaje, tone: 'success' })
  }
  const gatilloSinDerivar = caso.gatillo.length > 0 && !caso.derivado
  return (
    <Dialog open onOpenChange={(a) => (a ? undefined : onCerrar())} title={`${caso.codigo} · ${NOMBRE_ESTADO[caso.estado]}`} size="lg" footer={<Button variant="ghost" onClick={onCerrar}>Cerrar</Button>}>
      <div className="pt-pila">
        {gatilloSinDerivar ? (
          <Alert tone="danger" title="Derivación inmediata a la Estación 4">
            <span className="pt-alerta__texto">Se mencionó {caso.gatillo.join(', ')}. No se debate en sala: se deriva ahora (RN-SVC-028).</span>
          </Alert>
        ) : null}
        {caso.derivado ? (
          <Alert tone="info" size="sm" title="Con el especialista de la Estación 4">
            <span className="pt-alerta__texto">Derivado el {fecha(caso.derivado.fecha)}. El moderador no puede reabrirlo (RN-SVC-029).</span>
          </Alert>
        ) : null}
        <CardPairs
          pairs={[
            ['Lo observado', caso.resumen],
            ['Riesgo verbal', NOMBRE_NIVEL_RIESGO[caso.riesgo]],
            ['Etiqueta', caso.registro ? `${caso.registro.etiqueta} · ${fecha(caso.registro.fecha)}` : 'Sin registrar'],
            ['¿Derivado a la Estación 4?', caso.derivado ? 'Sí' : 'No'],
          ]}
        />
        <Card>
          <CardHeader as="h3" title="Frases Ancla" />
          <CardBody padding="sm">
            <ol className="pt-lista-simple">
              {FRASES.map((f) => {
                const aplicada = caso.frases.find((x) => x.n === f.n)
                return (
                  <li key={f.n} className="pt-en-linea">
                    <strong>Frase {f.n}</strong>
                    <span className="pt-texto-chico">{f.texto}</span>
                    {aplicada ? <Badge tone="success" size="sm">Aplicada {fecha(aplicada.fecha)}</Badge> : null}
                    {aplicada?.nota ? <span className="pt-texto-chico pt-hito__texto">{aplicada.nota}</span> : null}
                  </li>
                )
              })}
            </ol>
            {modera && enSala && siguiente <= 6 ? (
              <Form id={`${id}-f`} onSubmit={() => hacer(() => api.aplicarFrase(caso.id, siguiente, nota).then(() => setNota('')), `Frase Ancla ${siguiente} aplicada.`)}>
                <FormField label={`Nota al aplicar la Frase ${siguiente}`} id={`${id}-nota`} optional>
                  <Textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={300} />
                </FormField>
                <div className="pt-acciones pt-acciones--inicio">
                  <Button type="submit" variant="secondary" loading={accion.enCurso}>Aplicar la Frase {siguiente}</Button>
                </div>
              </Form>
            ) : null}
          </CardBody>
        </Card>
        {accion.error ? <AvisoDeError error={accion.error} /> : null}
        {modera ? (
          <div className="pt-acciones pt-acciones--inicio">
            {caso.estado !== 'DERIVADO' ? <Button variant={gatilloSinDerivar ? 'danger' : 'secondary'} loading={accion.enCurso} onClick={() => hacer(() => api.derivarEstacion4(caso.id), `${caso.codigo} derivado a la Estación 4.`)}>Derivar a la Estación 4</Button> : null}
            {!caso.registro ? <Button variant="secondary" loading={accion.enCurso} onClick={() => hacer(() => api.registrarEnSistema(caso.id), `${caso.codigo} registrado con la etiqueta estándar.`)}>Registrar el caso</Button> : null}
            {enSala ? <Button variant="primary" loading={accion.enCurso} onClick={() => hacer(() => api.cerrarEnSala(caso.id), `${caso.codigo}: tema cerrado en sala.`)}>Cerrar el tema en sala</Button> : null}
            {caso.estado === 'CERRADO_EN_SALA' ? <Button variant="ghost" loading={accion.enCurso} onClick={() => hacer(() => api.reabrirCasoFest(caso.id), `${caso.codigo} reabierto.`)}>Reabrir</Button> : null}
            {caso.derivado ? <Button variant="ghost" loading={accion.enCurso} onClick={() => hacer(() => api.reabrirCasoFest(caso.id), 'Reabierto')}>Intentar reabrir</Button> : null}
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
