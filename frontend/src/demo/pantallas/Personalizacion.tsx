import {
  Alert,
  AppearancePanel,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Chip,
  FormField,
  Icon,
  Input,
  ProgressBar,
  Select,
  Switch,
  Table,
  useAppearance,
} from '@aybarcorp/ui'
import { useLayoutEffect, useMemo } from 'react'
import { instalarTemaLocal } from '../temaLocal'
import { configuracionActual } from '../marco/PanelPersonalizar'
import { Encabezado } from '../marco/Encabezado'
import { BASE } from '../rutas'
import { LOTES, formatoSoles } from '../datos'
import { copiar } from '../utiles'

const FILAS = LOTES.slice(0, 3).map((l) => ({ id: l.id, lote: l.id, area: `${l.area} m²`, precio: formatoSoles(l.precio) }))

/**
 * /demo/personalizacion: el Appearance Panel del framework a la izquierda y, a la derecha,
 * una vista previa viva de lo que cambia —botones, campos, tarjetas, una tabla, avisos e
 * insignias— en claro y en oscuro lado a lado. El tema solo existe en `:root`, así que cada
 * mitad lleva `data-theme` con las reglas de tema copiadas a su ámbito (apariencia.ts); la
 * paleta, el acento, los grises, el radio, la tipografía y el estilo llegan por herencia.
 */
export default function Personalizacion() {
  const { appearance } = useAppearance()
  // Antes del primer pintado: sin la hoja local, la mitad oscura se pintaría clara un instante.
  useLayoutEffect(() => instalarTemaLocal(), [])
  // Se rehace con cada cambio de apariencia: lee los data-* que el núcleo acaba de escribir.
  const config = useMemo(() => configuracionActual(), [appearance])

  return (
    <div className="gl-pagina gl-pagina--ancha">
      <Encabezado
        titulo="Personalización"
        descripcion="Elige paleta, acento, grises, radio, tipografía, densidad, profundidad y estilo: se aplica en <html>, se recuerda en este navegador y llega a todas las pestañas y a los remotos."
        migas={[{ label: 'Galería', href: BASE }, { label: 'Personalización' }]}
        acciones={
          <>
            <Button variant="secondary" size="sm" leadingIcon={<Icon name="copy" size={16} />} onClick={() => void copiar(config.html, 'Fragmento HTML')}>
              Copiar como HTML
            </Button>
            <Button variant="secondary" size="sm" leadingIcon={<Icon name="copy" size={16} />} onClick={() => void copiar(config.json, 'JSON')}>
              Copiar como JSON
            </Button>
          </>
        }
      />
      <div className="gl-personalizar">
        <aside className="gl-personalizar__panel" aria-label="Controles de apariencia">
          <Card>
            <CardBody>
              <AppearancePanel headingLevel={2} title="Apariencia" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader as="h2" title="Configuración actual" subtitle="Pégala en el <html> de index.html para que sea la de partida." />
            <CardBody>
              <pre className="gl-codigo__pre gl-config" tabIndex={0} aria-label="Configuración actual en HTML">
                <code>{config.html}</code>
              </pre>
            </CardBody>
          </Card>
        </aside>
        <section className="gl-personalizar__vista" aria-label="Vista previa en claro y en oscuro">
          <VistaPrevia tema="light" />
          <VistaPrevia tema="dark" />
        </section>
      </div>
    </div>
  )
}

/** Una mitad de la vista previa, con su tema fijo. */
function VistaPrevia({ tema }: { tema: 'light' | 'dark' }) {
  const nombre = tema === 'light' ? 'Claro' : 'Oscuro'
  return (
    <div className="gl-tema-local gl-vista" data-theme={tema}>
      <h2 className="gl-vista__titulo">
        <span className={`gl-vista__punto gl-vista__punto--${tema}`} aria-hidden="true" />
        {nombre}
      </h2>
      <div className="gl-vista__fila" role="group" aria-label={`Botones en ${nombre.toLowerCase()}`}>
        <Button variant="primary" size="sm">
          Reservar
        </Button>
        <Button variant="secondary" size="sm">
          Comparar
        </Button>
        <Button variant="accent" size="sm">
          Destacar
        </Button>
        <Button variant="ghost" size="sm">
          Ver detalle
        </Button>
        <Button variant="danger" size="sm">
          Liberar
        </Button>
      </div>
      <Card variant="elevated">
        <CardHeader as="h3" title="Lote B-07" subtitle="Manzana B · 200 m²" lead={<Avatar name="Lote B" size="sm" shape="square" decorative />} actions={<Badge tone="success">Disponible</Badge>} />
        <CardBody>
          <div className="gl-vista__campos">
            <FormField label="Cliente">
              <Input placeholder="Nombre del cliente" />
            </FormField>
            <FormField label="Forma de pago">
              <Select
                value="cuotas"
                onChange={() => undefined}
                options={[
                  { value: 'contado', label: 'Al contado' },
                  { value: 'cuotas', label: 'En 24 cuotas' },
                ]}
              />
            </FormField>
          </div>
          <div className="gl-vista__fila">
            <Checkbox label="Separar 72 horas" defaultChecked />
            <Switch label="Avisarme" checked onCheckedChange={() => undefined} />
          </div>
          <ProgressBar value={62} label="Avance de la obra" detail="62 %" size="sm" />
        </CardBody>
        <CardFooter meta="Actualizado hace 5 min">
          <Button variant="primary" size="sm">
            Reservar el lote
          </Button>
        </CardFooter>
      </Card>
      <Table caption={`Lotes en la vista ${nombre.toLowerCase()}`} columns={[{ key: 'lote', header: 'Lote' }, { key: 'area', header: 'Área' }, { key: 'precio', header: 'Precio', align: 'end' }]} rows={FILAS} striped />
      <div className="gl-vista__avisos">
        <Alert tone="info" size="sm" live="off">
          Cuota 4 de 24 conciliada.
        </Alert>
        <Alert tone="warning" size="sm" live="off">
          La reserva vence mañana.
        </Alert>
        <Alert tone="danger" size="sm" live="off">
          El pago fue rechazado.
        </Alert>
      </div>
      <div className="gl-vista__fila">
        <Badge tone="neutral">Borrador</Badge>
        <Badge tone="info">En revisión</Badge>
        <Badge tone="success">Aprobado</Badge>
        <Badge tone="warning">Por vencer</Badge>
        <Badge tone="danger">Vencido</Badge>
        <Chip variant="selectable">Preferente</Chip>
      </div>
    </div>
  )
}
