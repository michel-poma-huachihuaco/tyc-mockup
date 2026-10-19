import { Badge, Card, CardBody, CardHeader, CardPairs, EmptyState } from '@aybarcorp/ui'
import { ETIQUETA_ESTADO } from '../datos'
import type { Lote } from '../datos'
import { TONO_ESTADO, anuncioDeLote, paresDeFicha } from './plano'

/**
 * La ficha del lote elegido: su código, el estado con el mismo tono que en el plano y
 * sus datos (área, frente × fondo, precio y ubicación). Sin lote, dice cómo elegir uno.
 * Al elegir, una región viva lo anuncia, porque la ficha cambia lejos del foco.
 */
export function FichaLote({ lote }: { lote: Readonly<Lote> | undefined }) {
  return (
    <>
      {lote ? (
        <Card aria-labelledby="gl-maqueta-ficha">
          <CardHeader
            as="h2"
            titleId="gl-maqueta-ficha"
            title={`Lote ${lote.id}`}
            subtitle={`Manzana ${lote.manzana} · lote ${lote.numero}`}
            actions={
              <Badge tone={TONO_ESTADO[lote.estado]} dot>
                {ETIQUETA_ESTADO[lote.estado]}
              </Badge>
            }
          />
          <CardBody>
            <CardPairs pairs={paresDeFicha(lote)} />
          </CardBody>
        </Card>
      ) : (
        <Card aria-labelledby="gl-maqueta-ficha">
          <CardHeader as="h2" titleId="gl-maqueta-ficha" title="Ficha del lote" />
          <CardBody>
            <EmptyState size="compact" variant="first-use" title="Elige un lote" description="Tócalo en el plano, o recorre la lista con las flechas y pulsa Enter." />
          </CardBody>
        </Card>
      )}
      <p className="ay-visually-hidden" role="status">
        {lote ? anuncioDeLote(lote) : ''}
      </p>
    </>
  )
}
