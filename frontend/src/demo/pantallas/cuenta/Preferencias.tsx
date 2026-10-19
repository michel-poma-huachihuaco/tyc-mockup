import { AppearancePanel, Button, Card, CardBody, CardHeader, FormField, Select, toast } from '@aybarcorp/ui'
import { useState } from 'react'
import { HOY } from '../../datos'

const IDIOMAS = [
  { value: 'es-PE', label: 'Español (Perú)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'en-US', label: 'English (United States)' },
]

const ZONAS = [
  { value: 'America/Lima', label: 'Lima (UTC−5)' },
  { value: 'America/Bogota', label: 'Bogotá (UTC−5)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (UTC−6)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1 / +2)' },
]

/**
 * Preferencias: el Appearance Panel del framework en línea (lo mismo que «Personalizar», en
 * el sitio donde lo buscaría quien usa la aplicación) y el idioma y la zona horaria, con una
 * vista previa del formato de fecha, número y moneda que resultan.
 */
export function Preferencias() {
  const [idioma, setIdioma] = useState('es-PE')
  const [zona, setZona] = useState('America/Lima')
  const fecha = new Intl.DateTimeFormat(idioma, { dateStyle: 'full', timeStyle: 'short', timeZone: zona }).format(HOY)
  const monto = new Intl.NumberFormat(idioma, { style: 'currency', currency: 'PEN' }).format(127300.5)
  return (
    <div className="gl-cuenta__rejilla">
      <Card>
        <CardBody>
          <AppearancePanel title="Apariencia" headingLevel={2} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader as="h2" title="Idioma y región" subtitle="Cómo se escriben las fechas, las horas y los montos." />
        <CardBody>
          <div className="gl-campos">
            <FormField label="Idioma">
              <Select value={idioma} onChange={(e) => setIdioma(e.target.value)} options={IDIOMAS} />
            </FormField>
            <FormField label="Zona horaria">
              <Select value={zona} onChange={(e) => setZona(e.target.value)} options={ZONAS} />
            </FormField>
          </div>
          <dl className="gl-vista-formato" aria-live="polite">
            <div>
              <dt>Fecha y hora</dt>
              <dd>{fecha}</dd>
            </div>
            <div>
              <dt>Monto</dt>
              <dd>{monto}</dd>
            </div>
          </dl>
          <div className="gl-acciones">
            <Button variant="primary" onClick={() => toast({ message: 'Preferencias guardadas en esta maqueta.', tone: 'success' })}>
              Guardar las preferencias
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
