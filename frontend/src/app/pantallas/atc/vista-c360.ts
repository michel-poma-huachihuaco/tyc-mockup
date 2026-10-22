import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  AyAlert,
  AyAvatar,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyCelda,
  AyDivider,
  AyEmptyState,
  AyFormField,
  AyGrid,
  AyHeading,
  AyPageHeader,
  AyRow,
  AySearchInput,
  AySegmentedControl,
  AySelect,
  AyStack,
  AyTable,
  AyTag,
  AyText,
  type AyColumna,
  type AyOpcionSelect,
  type AySegmentoOpcion,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import { subscribeAppearance } from '@aybarcorp/tokens/apariencia';
import {
  CLIENTES_360,
  CONSULTAS_SEMANTICAS,
  FUENTES_360,
  NODOS_360,
  crearTicketsDemo,
  fmtFecha,
  type Cliente360,
  type Fuente360,
  type NodoDato360,
} from './datos-atc';
import { css } from './three/comun';
import { crearPaleta, type PaletaGrafo } from './three/paleta';
import { inyectarEstilos } from './three/estilos';
import {
  ETIQUETA_TIPO_MOVIMIENTO,
  MAX_MOVIMIENTOS_360,
  ultimosMovimientos,
  type TipoMovimiento360,
} from './datos-movimientos';
import { CATALOGO_GRAFO_360 } from './config-grafo-360';
import { buscarCandidatos, type Candidato } from './busqueda-fonetica';
import {
  CONTEXTO_VACIO,
  ID_CLIENTE_GRAFO,
  contextoDe,
  idRelacion,
  type Contexto360,
} from './relaciones-360';
import {
  montarGrafo,
  type ContextoGrafo,
  type PulsoGrafo,
  type Ref,
  type VistaGrafo,
} from './three/grafo360';

/** La consola precarga «Nuevo ticket» con el cliente y lote de `crearTicketDesde360` (GRA-02). */
const PRECARGA_NUEVA_GESTION_INTEGRADA = true;

/** Tickets del demo (cruce por DNI para las áreas vinculadas; sin los tickets nuevos de la sesión). */
const TICKETS_DEMO_360 = crearTicketsDemo();

interface NodoCanvasPos {
  readonly kind: 'cli' | 'src' | 'node';
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly s?: Fuente360;
  readonly n?: NodoDato360;
}

interface ConsultaMotorRapida {
  readonly id: string;
  readonly nombre: string;
  readonly respuesta: (cli: Cliente360, lote: string) => string;
}

interface MetaTrazabilidad360 {
  readonly hu: string;
  readonly rfRn: string;
  readonly entidadDep: string;
  readonly inputReal: string;
}

export type DestinoRedireccionNodo =
  | 'contrato'
  | 'bandeja'
  | 'detalle'
  | 'nuevo'
  | 'libro'
  | 'sgd'
  | 'garantias'
  | 'evento';

export interface AccionRedireccionNodo360 {
  readonly etiqueta: string;
  readonly destino: DestinoRedireccionNodo;
  readonly moduloNombre: string;
}

const REDIRECCION_NODOS_360: Readonly<Record<string, AccionRedireccionNodo360>> = {
  kyc: {
    etiqueta: 'Ver contrato y titulares',
    destino: 'contrato',
    moduloNombre: 'Visor de Contrato Inmobiliario',
  },
  cont: {
    etiqueta: 'Ver tickets del cliente',
    destino: 'bandeja',
    moduloNombre: 'Bandeja de Tickets',
  },
  lote: {
    etiqueta: 'Ver ficha técnica y contrato',
    destino: 'contrato',
    moduloNombre: 'Visor de Contrato Inmobiliario',
  },
  contrato: {
    etiqueta: 'Abrir contrato y adendas',
    destino: 'contrato',
    moduloNombre: 'Visor de Contrato Inmobiliario',
  },
  acta: {
    etiqueta: 'Ir a EntregaFest en Vivo',
    destino: 'evento',
    moduloNombre: 'EntregaFest en Vivo',
  },
  gar: {
    etiqueta: 'Ir a Garantías Postventa',
    destino: 'garantias',
    moduloNombre: 'Garantías Postventa',
  },
  crono: {
    etiqueta: 'Ver cronograma en contrato',
    destino: 'contrato',
    moduloNombre: 'Visor de Contrato Inmobiliario',
  },
  cuotas: {
    etiqueta: 'Ir a Comité SGD y Morosidad',
    destino: 'sgd',
    moduloNombre: 'Comité y Casos SGD',
  },
  saldo: {
    etiqueta: 'Ver liquidación en contrato',
    destino: 'contrato',
    moduloNombre: 'Visor de Contrato Inmobiliario',
  },
  ecta: {
    etiqueta: 'Ir a Comité y Casos SGD',
    destino: 'sgd',
    moduloNombre: 'Comité y Casos SGD',
  },
  docs: {
    etiqueta: 'Abrir contrato y custodia GLI',
    destino: 'contrato',
    moduloNombre: 'Visor de Contrato Inmobiliario',
  },
  correos: {
    etiqueta: 'Abrir hilo en detalle de ticket',
    destino: 'detalle',
    moduloNombre: 'Detalle del Ticket',
  },
  llam: {
    etiqueta: 'Abrir ticket y grabación CTI',
    destino: 'detalle',
    moduloNombre: 'Detalle del Ticket',
  },
  tick: {
    etiqueta: 'Filtrar tickets en Bandeja',
    destino: 'bandeja',
    moduloNombre: 'Bandeja de Tickets',
  },
  libro: {
    etiqueta: 'Ir a Libro de Reclamaciones',
    destino: 'libro',
    moduloNombre: 'Libro e INDECOPI',
  },
  expo: {
    etiqueta: 'Ir a Comité SGD y Riesgo Legal',
    destino: 'sgd',
    moduloNombre: 'Comité y Casos SGD',
  },
};

const TRAZABILIDAD_FUENTES_360: Readonly<Record<string, MetaTrazabilidad360>> = {
  sigda: {
    hu: 'Identidad única, KYC y Contratos',
    rfRn: 'Maestro único de clientes sin duplicidad local',
    entidadDep: 'SIGDA / TAXON · Maestro Corporativo',
    inputReal: 'DNI/CE/RUC o teléfono: devuelve identificador del titular, KYC, contratos y contacto maestro.',
  },
  contr: {
    hu: 'Inventario inmobiliario y postventa',
    rfRn: 'Consulta en línea de lotes, contratos, actas y vigencia de garantías',
    entidadDep: 'Contratos y Activos Inmobiliarios',
    inputReal: 'Código de cliente / lote: devuelve manzana-lote, contrato, acta de entrega firmada y meses de garantía.',
  },
  cob: {
    hu: 'Financiamiento, letras y cobranza',
    rfRn: 'Visibilidad de cronogramas, saldos y alertas de morosidad',
    entidadDep: 'Sistema de Cobranza y Cartera',
    inputReal: 'Contrato / lote: devuelve cronograma, letras vencidas, mora, saldo y alerta de 3 meses impagos.',
  },
  jose: {
    hu: 'Motor de Consultas en Línea',
    rfRn: 'Respuestas consolidadas en tiempo real sin copia local',
    entidadDep: 'API Motor de Consultas',
    inputReal: 'Tipo de consulta + lote: responde saldo, estado de cuenta, independización, boletas y EntregaFest.',
  },
  repo: {
    hu: 'Expediente digital y búsqueda semántica',
    rfRn: 'Indexación inteligente por significado sobre documentos',
    entidadDep: 'Repositorio Documental S3 / GLI',
    inputReal: 'Consulta en lenguaje natural o cliente: devuelve minutas, adendas, planos y cargos con relevancia %.',
  },
  mail: {
    hu: 'Comunicaciones oficiales y notificaciones',
    rfRn: 'Trazabilidad de correos, cargos y cartas de resolución',
    entidadDep: 'Servidor de Correo Corporativo',
    inputReal: 'Correo del cliente / ticket: devuelve hilos enviados/recibidos y cartas de resolución de contrato.',
  },
  cti: {
    hu: 'Telefonía integrada y grabaciones',
    rfRn: 'Llamada directa desde ficha y vínculo automático de audio',
    entidadDep: 'Central Telefónica CTI',
    inputReal: 'Teléfono del titular: inicia llamada saliente y vincula la grabación de audio al ticket.',
  },
  atc: {
    hu: 'Historial de atención, Libro y Comité SGD',
    rfRn: 'Consolidado de tickets, hojas de reclamación y riesgo legal',
    entidadDep: 'Motor Central Aybar Atiende',
    inputReal: 'Identificador del cliente: devuelve historial de tickets ATC, asientos del Libro y exposición legal SGD.',
  },
};

const TRAZABILIDAD_NODOS_360: Readonly<Record<string, MetaTrazabilidad360>> = {
  kyc: {
    hu: 'Identificación y verificación del titular',
    rfRn: 'Validación contra el registro único corporativo',
    entidadDep: 'SIGDA · Maestro de Clientes',
    inputReal: 'DNI/CE/RUC validado contra el maestro; si no figura, habilita el registro controlado de Interesado.',
  },
  cont: {
    hu: 'Canales de contacto y telefonía directa',
    rfRn: 'Preferencia de canal y enlace telefónico directo',
    entidadDep: 'SIGDA · Central Telefónica CTI',
    inputReal: 'Teléfono verificado (Click-to-Call), correo titular y canal preferido de notificación.',
  },
  lote: {
    hu: 'Ubicación y ficha técnica de unidades',
    rfRn: 'Trazabilidad por manzana, lote y habilitación urbana',
    entidadDep: 'Contratos y Activos · Unidades',
    inputReal: 'Proyecto inmobiliario, etapa, manzana-lote, metraje y estado de habilitación urbana.',
  },
  contrato: {
    hu: 'Estado contractual, minutas y adendas',
    rfRn: 'Seguimiento de firmas y causales de resolución',
    entidadDep: 'SIGDA · Repositorio Documental S3/GLI',
    inputReal: 'Estado de minuta/adenda, modalidad de venta y causal de resolución si supera 3 meses impagos.',
  },
  acta: {
    hu: 'Hito formal de entrega de unidad',
    rfRn: 'Fecha base para el cómputo de garantías de postventa',
    entidadDep: 'Contratos y Activos · Actas de Entrega',
    inputReal: 'Fecha de firma de acta de entrega (hito que inicia el cómputo de garantías de postventa).',
  },
  gar: {
    hu: 'Cobertura de garantías por partida',
    rfRn: 'Cálculo automático de vigencia en meses',
    entidadDep: 'Contratos y Activos · Matriz de Garantías',
    inputReal: 'Cálculo automático en meses desde el acta para infraestructura y acabados (vigente / vencida).',
  },
  crono: {
    hu: 'Calendario de pagos y letras',
    rfRn: 'Sincronización en línea con cartera y recaudación',
    entidadDep: 'Cobranza · Motor de Consultas',
    inputReal: 'Total de letras del financiamiento, letras canceladas, fecha de próximo vencimiento y banco.',
  },
  cuotas: {
    hu: 'Control de morosidad y vencimientos',
    rfRn: 'Alerta temprana por acumulación de letras impagas',
    entidadDep: 'Sistema de Cobranza',
    inputReal: 'Letras vencidas, días de mora y disparo automático de alerta si llega a 3 cuotas impagas.',
  },
  saldo: {
    hu: 'Posición de deuda y liquidación',
    rfRn: 'Cálculo actualizado de capital e intereses',
    entidadDep: 'Cobranza · Motor de Consultas',
    inputReal: 'Saldo capital financiado, intereses moratorios y monto de liquidación al día.',
  },
  ecta: {
    hu: 'Detalle reservado de movimientos financieros',
    rfRn: 'Control de acceso por perfil del usuario',
    entidadDep: 'Cobranza · Motor de Consultas',
    inputReal: 'Detalle financiero reservado (restringido para perfil Gestor; visible para Supervisor y Legal).',
  },
  docs: {
    hu: 'Buscador inteligente de documentos',
    rfRn: 'Búsqueda semántica por significado en lenguaje natural',
    entidadDep: 'Repositorio Documental S3 / GLI',
    inputReal: 'Búsqueda vectorial sobre contratos, adendas, planos y cartas notariales sin recordar el nombre exacto.',
  },
  correos: {
    hu: 'Bandeja histórica de comunicaciones',
    rfRn: 'Evidencia de notificaciones y cargos enviados',
    entidadDep: 'Servidor de Correo Corporativo',
    inputReal: 'Historial de correos enviados/recibidos con el cliente y notificaciones formales con cargo.',
  },
  llam: {
    hu: 'Trazabilidad de llamadas y grabaciones',
    rfRn: 'Asociación automática de audio a la atención',
    entidadDep: 'Central Telefónica CTI',
    inputReal: 'Registro de llamadas entrantes/salientes, duración, agente y grabación vinculada al ticket.',
  },
  tick: {
    hu: 'Expedientes de atención multicanal',
    rfRn: 'Un casillero independiente por cada consulta',
    entidadDep: 'Motor de Tickets ATC',
    inputReal: 'Tickets históricos y activos del cliente (casillero único por consulta, SLA y estado).',
  },
  libro: {
    hu: 'Quejas y reclamos de consumo (Ley 29571)',
    rfRn: 'Control de plazo legal de 15 días hábiles',
    entidadDep: 'Libro de Reclamaciones INDECOPI',
    inputReal: 'Hojas de reclamación (Queja / Reclamo), plazo legal INDECOPI, prórroga única y cargo de respuesta.',
  },
  expo: {
    hu: 'Evaluación de riesgo legal y regulatorio',
    rfRn: 'Acceso controlado por perfil y custodia 6/6',
    entidadDep: 'Mesa SGD · Handoff Legal',
    inputReal: 'Riesgo regulatorio/judicial y paquete documental 6/6 (restringido para perfil Gestor).',
  },
};

const CONSULTAS_MOTOR_RAPIDAS: readonly ConsultaMotorRapida[] = [
  {
    id: 'saldo-ecta',
    nombre: 'Saldo total y estado de cuenta por lote',
    respuesta: (cli, lote) =>
      `Lote ${lote} (${cli.proyecto}): ${cli.datos['saldo']?.[0]?.[1] ?? 'S/ 0'} · Estado de cuenta: ${cli.datos['ecta']?.map((f) => `${f[0]} ${f[1]}`).join(' · ') ?? 'Al día'}.`,
  },
  {
    id: 'independizacion',
    nombre: 'Estado de independización y partida registral',
    respuesta: (cli, lote) =>
      `Lote ${lote} (${cli.proyecto}): Independización en trámite registral SUNARP · Acta: ${cli.datos['acta']?.[0]?.[1] ?? 'En proceso'}.`,
  },
  {
    id: 'boletas-abonos',
    nombre: 'Validación de boletas y últimos abonos conciliados',
    respuesta: (cli, lote) =>
      `Lote ${lote}: ${cli.datos['crono']?.[0]?.[1] ?? 'Pagos conciliados'} · Última conciliación bancaria verificada sin observaciones.`,
  },
  {
    id: 'entregafest',
    nombre: 'Elegibilidad y requisitos para EntregaFest',
    respuesta: (cli, lote) =>
      `Lote ${lote} (${cli.nombre}): Estado en padrón EntregaFest verificado · Garantía: ${cli.datos['gar']?.[0]?.[1] ?? 'Vigente'}.`,
  },
];

@Component({
  selector: 'app-vista-c360',
  standalone: true,
  imports: [
    AyAlert,
    AyAvatar,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCelda,
    AyDivider,
    AyEmptyState,
    AyFormField,
    AyGrid,
    AyHeading,
    AyPageHeader,
    AyRow,
    AySearchInput,
    AySegmentedControl,
    AySelect,
    AyStack,
    AyTable,
    AyTag,
    AyText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .c360-cuerpo {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 19rem;
        gap: var(--aybar-space-4);
        align-items: start;
      }
      @media (max-width: 1100px) {
        .c360-cuerpo {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .c360-movs {
        display: flex;
        flex-direction: column;
        gap: var(--aybar-space-3);
        padding: var(--aybar-space-3);
        border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);
        border-radius: var(--aybar-radius-lg);
      }
      .c360-movs__lista {
        display: flex;
        flex-direction: column;
        gap: var(--aybar-space-2);
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .c360-mov {
        display: flex;
        flex-direction: column;
        gap: var(--aybar-space-1);
        inline-size: 100%;
        padding: var(--aybar-space-2) var(--aybar-space-3);
        text-align: start;
        font: inherit;
        color: var(--aybar-color-fg-default);
        background: transparent;
        border: var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);
        border-radius: var(--aybar-radius-lg);
        cursor: pointer;
      }
      .c360-mov:hover,
      .c360-mov:focus-visible {
        border-color: var(--aybar-color-secondary-400);
      }
      .c360-mov__fila {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--aybar-space-2);
        font-size: var(--aybar-font-size-xs);
        color: var(--aybar-color-fg-muted);
      }
    `,
  ],
  template: `
    <div ayStack gap="6">
      <ay-page-header
        [titulo]="clienteSeleccionado() ? 'Consulta 360 · ' + clienteActual().nombre : 'Consulta 360'"
        [descripcion]="
          clienteSeleccionado()
            ? clienteActual().doc + ' · ' + clienteActual().telefono + ' · ' + correoCliente(clienteActual())
            : 'Busca a un cliente y consulta en línea sus lotes, cuotas, contratos, documentos, correos y llamadas.'
        "
      >
        <ay-badge ayEstado size="sm" [tono]="fuentesCaidas().length > 0 ? 'warning' : 'success'">
          {{ (8 - fuentesCaidas().length) + '/8 fuentes en línea' }}
        </ay-badge>
        <ng-container ayAcciones>
          @if (clienteSeleccionado()) {
            <ay-button
              tamano="sm"
              variante="secondary"
              (click)="volverABusquedaClientes()"
            >
              ← Limpiar búsqueda
            </ay-button>
            <ay-button
              tamano="sm"
              variante="primary"
              (click)="abrirNuevoTicketCliente(clienteActual())"
            >
              + Crear ticket al cliente
            </ay-button>
          }
          <ay-segmented-control
            etiqueta="Modo de visualización 360"
            size="sm"
            [opciones]="opcionesModoVista"
            [valor]="modoRenderizado()"
            (valorChange)="cambiarModoRenderizado($event)"
          />
        </ng-container>
      </ay-page-header>

      <!-- =========================================================================
           1. BUSCADOR + GRAFO 360 EN 3D Y 2D (APAGADO HASTA BUSCAR UN CLIENTE)
           ========================================================================= -->
      <ay-card>
        <ay-card-body>
          <div ayStack gap="3">
            <!-- Barra superior: Buscador de cliente / documental -->
            <div #buscador360Host ayRow gap="2" [ajuste]="true" role="search">
              <ay-search-input
                [etiqueta]="
                  clienteSeleccionado()
                    ? 'Buscar otro cliente (DNI, nombre, lote, contrato) o consultar documentos/secciones 360'
                    : 'Buscar cliente (DNI, nombre, código, lote, teléfono o contrato)'
                "
                size="sm"
                [retardo]="0"
                [valor]="busquedaTexto()"
                (valorChange)="alCambiarBusqueda($event)"
                (buscar)="ejecutarBusquedaSemantica($event)"
                placeholder="Ej. 72282555, Huamaní, Paredes, Mamani, Quispe, Soto (sin lote/contrato) o VS-2025-0507…"
              />
              <ay-button tamano="sm" variante="primary" (click)="ejecutarBusquedaSemantica()">
                {{ clienteSeleccionado() ? 'Consultar' : 'Buscar cliente' }}
              </ay-button>
            </div>

            @if (!clienteSeleccionado() && busquedaTexto().trim().length >= 2) {
              @if (fuentesCaidas().includes('sigda')) {
                <ay-alert
                  tono="danger"
                  titulo="SIGDA/TAXON no respondió (503)"
                >
                  La búsqueda del maestro de clientes no está disponible en este momento. Puedes continuar atendiendo
                  registrando al cliente como <strong>Interesado en cola de conciliación</strong>; el sistema lo vinculará
                  automáticamente cuando SIGDA/TAXON vuelva en línea.
                  <div ayAcciones ayRow gap="2" [ajuste]="true">
                    <ay-button tamano="sm" variante="secondary" (click)="crearTicketContingencia()">
                      Registrar como interesado
                    </ay-button>
                  </div>
                </ay-alert>
              } @else {
                <ay-table
                  leyenda="Coincidencias en el maestro SIGDA/TAXON"
                  [columnas]="columnasBusquedaClientes"
                  [filas]="clientesCoincidentesIdle()"
                  [rayada]="true"
                >
                  <ng-template ayCelda="nombre" let-fila>
                    @let c = comoCliente360(fila);
                    <div ayStack gap="1">
                      <strong>{{ c.nombre }}</strong>
                      <span ayText="body" size="xs">{{ c.telefono }} · {{ correoCliente(c) }}</span>
                    </div>
                  </ng-template>
                  <ng-template ayCelda="doc" let-fila>
                    @let c = comoCliente360(fila);
                    <span ayText="mono" size="xs">{{ c.doc }}</span>
                  </ng-template>
                  <ng-template ayCelda="lote" let-fila>
                    @let c = comoCliente360(fila);
                    @if (c.lotes.length > 0) {
                      <span>{{ c.proyecto }} · Lote {{ c.lotes.join(', ') }}</span>
                    } @else {
                      <span ayText="subtitle" size="xs">{{ c.proyecto }} · Sin lote aún</span>
                    }
                  </ng-template>
                  <ng-template ayCelda="contrato" let-fila>
                    @let c = comoCliente360(fila);
                    @if (c.contratoPrincipal) {
                      <ay-badge size="sm" tono="neutral">{{ c.contratoPrincipal }}</ay-badge>
                    } @else {
                      <ay-badge size="sm" tono="warning">Sin contrato aún</ay-badge>
                    }
                  </ng-template>
                  <ng-template ayCelda="accion" let-fila>
                    @let c = comoCliente360(fila);
                    <ay-button
                      tamano="sm"
                      variante="primary"
                      (click)="entrarAFichaCliente(c.k)"
                    >
                      Activar Grafo 360 →
                    </ay-button>
                  </ng-template>
                  <ay-empty-state
                    ayVacio
                    variante="no-results"
                    size="compact"
                    titulo="No se encontró al cliente"
                    descripcion="Revisa el dato buscado. Puedes registrarlo como interesado para no detener la atención."
                  >
                    <ay-button
                      ayAccion
                      tamano="sm"
                      variante="secondary"
                      (click)="crearTicketContingencia()"
                    >
                      Registrar como interesado
                    </ay-button>
                  </ay-empty-state>
                </ay-table>
              }
            }

            <!-- Contenedor de escena (Grafo 3D + Grafo 2D + Ficha flotante) junto al panel de últimos movimientos -->
            <div class="c360-cuerpo">
            <div class="pt-escena-wrap">
              <!-- Escena 3D Principal (dos anillos, curvas Bézier 3D, pulsos y etiquetas interactivas) -->
              <div
                #poGrafoHost
                class="pt-escena-grafo"
                [hidden]="modoRenderizado() !== 'po3d'"
              >
                <canvas
                  #poGrafoCanvas
                  role="img"
                  [attr.aria-label]="
                    clienteSeleccionado()
                      ? 'Red de consulta 360 de ' + clienteActual().nombre + ': ' + fuentes.length + ' sistemas de origen y ' + nodos.length + ' datos.'
                      : 'Red de consulta 360 en espera de búsqueda de cliente.'
                  "
                  (click)="alClickPoGrafo($event)"
                  (mousemove)="alMoverMousePoGrafo($event)"
                  (mouseleave)="alSalirMousePoGrafo()"
                ></canvas>
              </div>

              <!-- Escena 2D Radial (alternativa) -->
              <canvas
                #astraCanvas
                class="atc-astra-canvas"
                [hidden]="modoRenderizado() !== '2d'"
                (mousemove)="alMoverMouseCanvas($event)"
                (mouseleave)="alSalirMouseCanvas()"
                (click)="alClickCanvas()"
              ></canvas>

              <!-- Ficha lateral desplegable tipo drawer del nodo o sistema seleccionado (nace desde el borde derecho hacia la izquierda y se contrae al cerrar) -->
              @if (clienteSeleccionado()) {
                  @if (fuenteInspeccionada(); as src) {
                    <div
                      class="pl-atc-ficha-flotante"
                      [class.pl-atc-ficha-flotante--abierta]="fichaAbierta()"
                      [attr.aria-hidden]="!fichaAbierta()"
                      role="dialog"
                      aria-modal="false"
                      [attr.aria-label]="'Sistema de origen ' + src.nombre"
                    >
                      <button
                        type="button"
                        class="pl-atc-ficha-flotante__cerrar"
                        aria-label="Cerrar ficha"
                        (click)="cerrarFichaFlotante()"
                      >
                        ✕
                      </button>
                      <ay-card>
                        <ay-card-header
                          [titulo]="'Sistema: ' + src.nombre"
                          [subtitulo]="src.detalle + ' · ' + trazabilidadFuente(src.id).hu"
                          nivel="h3"
                        >
                          <div ayAcciones ayRow gap="2" [ajuste]="true">
                            <ay-badge
                              size="sm"
                              [tono]="fuentesCaidas().includes(src.id) ? 'danger' : 'success'"
                            >
                              {{ fuentesCaidas().includes(src.id) ? 'Sin respuesta' : 'En línea' }}
                            </ay-badge>
                            <ay-badge size="sm" tono="info">Latencia {{ src.ms }} ms</ay-badge>
                          </div>
                        </ay-card-header>

                        <ay-card-body>
                          <div ayStack gap="3">
                            <ay-card-pairs [pares]="paresFuente(src)" />
                            <div ayStack gap="1">
                              <span ayText="label" size="xs">Secciones alimentadas por {{ src.nombre }}</span>
                              <div ayRow gap="2" [ajuste]="true">
                                @for (nd of nodosDeFuente(src.id); track nd.id) {
                                  <ay-button
                                    tamano="sm"
                                    [variante]="nodoSeleccionadoId() === nd.id ? 'primary' : 'secondary'"
                                    (click)="seleccionarNodo(nd.id)"
                                  >
                                    {{ nd.nombre }}
                                  </ay-button>
                                }
                              </div>
                            </div>
                            <ay-divider espaciado="sm" />
                            <div ayRow gap="2" [ajuste]="true">
                              <ay-button
                                tamano="sm"
                                [variante]="fuentesCaidas().includes(src.id) ? 'primary' : 'danger'"
                                (click)="alternarFallaFuente(src.id)"
                              >
                                {{
                                  fuentesCaidas().includes(src.id)
                                    ? 'Restaurar fuente en línea'
                                    : 'Probar desconexión'
                                }}
                              </ay-button>
                            </div>
                          </div>
                        </ay-card-body>
                      </ay-card>
                    </div>
                  } @else {
                    <div
                      class="pl-atc-ficha-flotante"
                      [class.pl-atc-ficha-flotante--abierta]="fichaAbierta()"
                      [attr.aria-hidden]="!fichaAbierta()"
                      role="dialog"
                      aria-modal="false"
                      [attr.aria-label]="'Nodo 360 ' + nodoActual().nombre"
                    >
                      <button
                        type="button"
                        class="pl-atc-ficha-flotante__cerrar"
                        aria-label="Cerrar ficha"
                        (click)="cerrarFichaFlotante()"
                      >
                        ✕
                      </button>
                      <ay-card>
                        <ay-card-header
                          [titulo]="nodoActual().nombre"
                          [subtitulo]="trazabilidadNodo(nodoActual().id).hu + ' · ' + clienteActual().nombre"
                          nivel="h3"
                        >
                          <div ayAcciones ayRow gap="2" [ajuste]="true">
                            <ay-badge size="sm" [tono]="estadoNodo(nodoActual()).tono">
                              {{ estadoNodo(nodoActual()).etiqueta }}
                            </ay-badge>
                            <ay-badge size="sm" tono="info">
                              Origen: {{ nombresFuentesNodoActual() }}
                            </ay-badge>
                          </div>
                        </ay-card-header>

                        <ay-card-body>
                          <div ayStack gap="3">
                            @if (avisoAcceso()) {
                              <ay-alert tono="info" titulo="Acceso no disponible">{{ avisoAcceso() }}</ay-alert>
                            }
                            @if (estadoNodo(nodoActual()).codigo === 'locked') {
                              <ay-alert tono="warning" titulo="Acceso restringido por perfil">
                                Tu perfil ({{ etiquetaRolActivo() }}) no tiene acceso a este dato reservado.
                                Cambia de perfil a Supervisor o Legal en «Herramientas → Ver como» para visualizarlo.
                              </ay-alert>
                            } @else if (estadoNodo(nodoActual()).codigo === 'down') {
                              <ay-alert tono="danger" titulo="Fuente no disponible temporalmente">
                                {{ nombresFuentesCaidasNodoActual() || 'Esta sección' }} no está disponible en este instante. Las demás
                                secciones siguen activas.
                              </ay-alert>
                            } @else if (estadoNodo(nodoActual()).codigo === 'empty') {
                              <ay-alert tono="info" titulo="Disponible, sin registros">
                                La fuente responde pero {{ clienteActual().nombre }} no tiene registros en «{{ nodoActual().nombre }}».
                                El acceso sigue disponible para iniciar una nueva gestión.
                              </ay-alert>
                            } @else {
                              @if (nodoActual().id === 'lote') {
                                <ay-card-pairs [pares]="paresLoteCliente()" />
                              }
                              @if (nodoActual().id === 'saldo') {
                                <ay-card-pairs [pares]="paresSaldo()" />
                              } @else {
                                <ay-card-pairs [pares]="paresNodo(nodoActual().id)" />
                              }

                              @if (nodoActual().semantico && hitsSemanticos().length > 0) {
                                <ay-card variante="default">
                                  <ay-card-header titulo="Coincidencias semánticas" nivel="h4" />
                                  <ay-card-body>
                                    <div ayStack gap="2">
                                      @for (h of hitsSemanticos(); track h.titulo) {
                                        <div ayRow gap="2" [ajuste]="true">
                                          <ay-badge size="sm" tono="info">{{ h.relevancia }}%</ay-badge>
                                          <strong ayText="title" size="xs">{{ h.titulo }}</strong>
                                          <span ayText="subtitle" size="xs">«{{ h.fragmento }}»</span>
                                        </div>
                                      }
                                    </div>
                                  </ay-card-body>
                                </ay-card>
                              }
                            }

                            <ay-divider espaciado="sm" />
                            <ay-card-pairs [pares]="paresTrazabilidadNodo(nodoActual().id)" />
                            <ay-card-pairs [pares]="paresContexto()" />

                            <div ayRow gap="2" [ajuste]="true">
                              <ay-button
                                tamano="sm"
                                variante="primary"
                                [disabled]="estadoNodo(nodoActual()).codigo === 'locked'"
                                (click)="ejecutarRedireccionNodo(nodoActual().id)"
                              >
                                {{ obtenerRedireccionNodo(nodoActual().id).etiqueta }} →
                              </ay-button>
                              @if (obtenerRedireccionNodo(nodoActual().id).destino !== 'contrato' && clienteActual().contratoPrincipal) {
                                <ay-button
                                  tamano="sm"
                                  variante="secondary"
                                  (click)="verContrato.emit(clienteActual().contratoPrincipal)"
                                >
                                  Contrato {{ clienteActual().contratoPrincipal }}
                                </ay-button>
                              }
                              <ay-button
                                tamano="sm"
                                variante="secondary"
                                [disabled]="estadoNodo(nodoActual()).codigo === 'locked'"
                                (click)="abrirNuevoTicketCliente(clienteActual(), nodoActual().id)"
                              >
                                {{ nodoActual().id === 'libro' ? '+ Nuevo reclamo' : '+ Nueva gestión' }}
                              </ay-button>
                            </div>
                            <span ayText="subtitle" size="xs">
                              Nueva gestión abre «Nuevo ticket» con cliente {{ clienteActual().nombre }}
                              @if (loteContexto()) {
                                y lote {{ loteContexto() }}
                              }
                              @if (!precargaIntegrada) {
                                · precarga del formulario pendiente de integración en la consola.
                              }
                            </span>
                          </div>
                        </ay-card-body>
                      </ay-card>
                    </div>
                  }
                }
              </div>

              <!-- V360-01: últimos movimientos del cliente seleccionado -->
              <aside class="c360-movs" aria-labelledby="c360-movs-titulo">
                <div ayRow gap="2" [ajuste]="true" justificar="between">
                  <ay-heading id="c360-movs-titulo" [nivel]="3" size="sm">Últimos movimientos</ay-heading>
                </div>
                @if (!clienteSeleccionado()) {
                  <span ayText="subtitle" size="xs">Selecciona un cliente para ver sus últimos movimientos.</span>
                } @else if (movimientos().length === 0) {
                  <ay-empty-state
                    variante="first-use"
                    size="compact"
                    titulo="Sin movimientos"
                    descripcion="Este cliente aún no registra pagos, cuotas, reclamos ni otras operaciones."
                  />
                } @else {
                  <span ayText="subtitle" size="xs">
                    {{ movimientos().length }} de {{ maxMovimientos }} · del más reciente al más antiguo
                  </span>
                  <ol class="c360-movs__lista">
                    @for (m of movimientos(); track m.id) {
                      <li>
                        <button
                          type="button"
                          class="c360-mov"
                          [attr.aria-label]="etiquetaTipoMovimiento(m.tipo) + ': ' + m.titulo + (m.estado ? ', ' + m.estado : '') + ', ' + fechaMovimiento(m.fecha) + '. Resaltar en el grafo'"
                          (click)="seleccionarNodo(m.nodoId)"
                        >
                          <span class="c360-mov__fila">
                            <ay-tag variante="outline">{{ etiquetaTipoMovimiento(m.tipo) }}</ay-tag>
                            @if (m.estado) {
                              <ay-badge size="sm" [tono]="m.tono">{{ m.estado }}</ay-badge>
                            }
                          </span>
                          <strong ayText="title" size="xs">{{ m.titulo }}</strong>
                          <span class="c360-mov__fila">{{ fechaMovimiento(m.fecha) }}</span>
                        </button>
                      </li>
                    }
                  </ol>
                  @if (movimientos().length < maxMovimientos) {
                    <span ayText="subtitle" size="xs">
                      Solo hay {{ movimientos().length }} movimiento(s) registrado(s) para este cliente.
                    </span>
                  }
                }
              </aside>
            </div>

              <!-- Barra inferior de leyenda y telemetría -->
              <div ayRow gap="2" [ajuste]="true" justificar="between">
                <div ayRow gap="2" [ajuste]="true">
                  <ay-tag variante="outline" colorPunto="var(--aybar-color-secondary-400)">Cliente</ay-tag>
                  <ay-tag variante="outline" colorPunto="var(--aybar-color-primary-500)">
                    Sistema de origen ({{ clienteSeleccionado() ? fuentes.length - fuentesCaidas().length : 0 }}/{{ fuentes.length }})
                  </ay-tag>
                  <ay-tag variante="outline" colorPunto="var(--aybar-color-fg-link)">
                    Dato del cliente ({{ clienteSeleccionado() ? nodosEncendidosCount() : 0 }}/{{ nodos.length }})
                  </ay-tag>
                  <ay-tag variante="outline" colorPunto="var(--aybar-color-fg-muted)">
                    ○ Disponible sin registros (punteado)
                  </ay-tag>
                  <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-warning-border)">
                    ▲ Restringido (borde discontinuo)
                  </ay-tag>
                  <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-danger-border)">
                    ✕ Sin conexión
                  </ay-tag>
                </div>
                <div ayRow gap="2" [ajuste]="true">
                  <span ayText="label" size="xs" role="status" aria-live="polite">
                    {{ clienteSeleccionado() ? estadoConsultaTexto() : 'En espera de búsqueda · Grafo 360 apagado' }}
                  </span>
                  <ay-badge size="sm" [tono]="clienteSeleccionado() ? 'info' : 'neutral'">
                    {{ clienteSeleccionado() ? 'Consulta en línea (< 2 s)' : 'Sin cliente activo' }}
                  </ay-badge>
                </div>
              </div>
            </div>
          </ay-card-body>
        </ay-card>

      <!-- Alertas de contingencia / disponibilidad de fuentes / búsqueda semántica -->
      @if (modoNoEncontrado()) {
        <ay-alert
          tono="warning"
          titulo="Cliente no ubicado en el maestro SIGDA — Registro como Interesado"
        >
          No se encontró coincidencia para el documento consultado. Para preservar la integridad del maestro único,
          se registra como <strong>Interesado en cola de conciliación</strong> con datos mínimos verificables y el ticket
          continúa su atención sin bloquear al cliente.
          <div ayAcciones ayRow gap="2" [ajuste]="true">
            <ay-button tamano="sm" variante="primary" (click)="crearTicketContingencia()">
              Registrar ticket como Interesado
            </ay-button>
            <ay-button tamano="sm" variante="ghost" (click)="modoNoEncontrado.set(false)">
              Cerrar aviso
            </ay-button>
          </div>
        </ay-alert>
      }

      @if (clienteSeleccionado()) {
        @if (fuentesCaidas().length > 0) {
        <ay-alert
          tono="warning"
          [titulo]="'Continuidad operativa activa — ' + fuentesCaidas().length + ' sistema(s) externo(s) sin respuesta'"
        >
          La vista 360 mantiene operativas las {{ fuentes.length - fuentesCaidas().length }} fuentes restantes
          (los nodos del sistema sin conexión se marcan como «no disponible» mientras el resto de la ficha responde con normalidad).
        </ay-alert>
      }

      @if (explicacionSemantica()) {
        <ay-alert tono="info" titulo="Búsqueda semántica documental por significado">
          {{ explicacionSemantica() }}
        </ay-alert>
      }

      <!-- Cabecera de Ficha del Cliente + Click-to-Call CTI + Síntesis Copiloto IA -->
      @if (clienteActual(); as cli) {
        <ay-card>
          <ay-card-body>
            <div ayStack gap="3">
              <div ayRow gap="4" [ajuste]="true" justificar="between">
                <div ayRow gap="3" [ajuste]="true">
                  <ay-avatar [nombre]="cli.nombre" size="lg" />
                  <div ayStack gap="1">
                    <div ayRow gap="2" [ajuste]="true">
                      <span ayText="label" size="xs">Clientes / {{ cli.nombre }}</span>
                      <ay-badge size="sm" tono="success">Titular verificado en SIGDA</ay-badge>
                    </div>
                    <div ayRow gap="2" [ajuste]="true">
                      <span ayText="title" size="lg">{{ cli.nombre }}</span>
                      <ay-badge size="sm" tono="info">{{ cli.doc }}</ay-badge>
                      <ay-badge size="sm" tono="neutral">{{ cli.telefono }}</ay-badge>
                      <ay-badge size="sm" tono="neutral">{{ correoCliente(cli) }}</ay-badge>
                      @if (cli.lotes.length > 0) {
                        <ay-badge size="sm" tono="neutral">{{ cli.proyecto }} · Lote {{ cli.lotes.join(', ') }}</ay-badge>
                      } @else {
                        <ay-badge size="sm" tono="warning">{{ cli.proyecto }} · Sin lotes aún</ay-badge>
                      }
                      @if (cli.contratoPrincipal) {
                        <ay-badge size="sm" tono="info">Contrato {{ cli.contratoPrincipal }}</ay-badge>
                      } @else {
                        <ay-badge size="sm" tono="warning">Sin contrato aún</ay-badge>
                      }
                    </div>
                    <p ayText="body" size="sm">
                      <strong>Contexto de atención:</strong> {{ cli.estadoEmocional }}
                    </p>
                  </div>
                </div>

                <div ayRow gap="2" [ajuste]="true">
                  <ay-card variante="default">
                    <ay-card-body>
                      <div ayRow gap="3" [ajuste]="true">
                        <div ayStack gap="1">
                          <span ayText="label" size="xs">Central Telefónica CTI</span>
                          <strong ayText="mono" size="sm">{{ cli.telefono }}</strong>
                        </div>
                        @if (!llamadaActiva()) {
                          <ay-button tamano="sm" variante="primary" (click)="iniciarLlamadaCti()">
                            Llamar
                          </ay-button>
                        } @else {
                          <ay-badge size="sm" tono="success">
                            En llamada · 00:{{ segundosLlamada() < 10 ? '0' + segundosLlamada() : segundosLlamada() }}
                          </ay-badge>
                          <ay-button tamano="sm" variante="danger" (click)="finalizarLlamadaCti()">
                            Colgar y guardar grabación
                          </ay-button>
                        }
                      </div>
                    </ay-card-body>
                  </ay-card>

                  @if (cli.contratoPrincipal) {
                    <ay-button tamano="sm" variante="primary" (click)="verContrato.emit(cli.contratoPrincipal)">
                      Ver contrato {{ cli.contratoPrincipal }}
                    </ay-button>
                  }
                  <ay-button tamano="sm" variante="secondary" (click)="abrirNuevoTicketCliente(cli)">
                    + Crear ticket
                  </ay-button>
                  <ay-button tamano="sm" variante="ghost" (click)="activarContingenciaNoEncontrado()">
                    Registrar Interesado no ubicado
                  </ay-button>
                </div>
              </div>

              <ay-alert tono="info" titulo="Síntesis Copiloto IA en tiempo real">
                {{ cli.sintesisIa }} — <strong>Acción sugerida:</strong> {{ cli.guiaRecomendada }}
              </ay-alert>
            </div>
          </ay-card-body>
        </ay-card>
      }

      <!-- =========================================================================
           SECCIÓN INFERIOR: Consultas rápidas al motor + Tarjetas por origen
           ========================================================================= -->
      <div ayRow gap="2" [ajuste]="true" justificar="between">
        <span ayText="subtitle" size="xs">
          <strong>Vista estructurada en tarjetas (consulta directa a las fuentes de origen):</strong>
          los datos se consultan en tiempo real sin duplicarse localmente.
        </span>
        <div ayRow gap="2" [ajuste]="true">
          <ay-badge size="sm" tono="neutral">{{ estadoConsultaTexto() }}</ay-badge>
          <ay-badge size="sm" tono="info">Tiempo de respuesta &lt; 2 s</ay-badge>
        </div>
      </div>

      <!-- Tarjeta «Consultas rápidas» al motor de consultas en línea (título fuera del componente) -->
      <div ayStack gap="2">
        <div ayRow gap="2" justificar="between" [ajuste]="true">
          <div ayStack gap="1">
            <ay-heading [nivel]="2" size="sm">Consultas rápidas en línea</ay-heading>
            <span ayText="subtitle" size="xs">
              Respuestas instantáneas del motor de consultas por lote y contrato.
            </span>
          </div>
          @if (consultasRapidasDisponibles()) {
            <div ayRow gap="2" [ajuste]="true">
              <ay-button tamano="sm" variante="primary" (click)="ejecutarConsultaMotor()">
                Consultar ahora
              </ay-button>
              <ay-button tamano="sm" variante="secondary" (click)="verContrato.emit(clienteActual().contratoPrincipal)">
                Abrir contrato {{ clienteActual().contratoPrincipal }}
              </ay-button>
            </div>
          } @else {
            <ay-badge size="sm" tono="danger">No disponible</ay-badge>
          }
        </div>
        <ay-card>
          <ay-card-body>
          @if (consultasRapidasDisponibles()) {
            <div ayStack gap="3">
              <div ayGrid [columnas]="2" gap="md">
                <ay-form-field etiqueta="Tipo de consulta">
                  <ay-select
                    size="sm"
                    [opciones]="opcionesConsultasMotor"
                    [valor]="consultaMotorId()"
                    (valorChange)="consultaMotorId.set($event)"
                  />
                </ay-form-field>
                <ay-form-field etiqueta="Lote del cliente">
                  <ay-select
                    size="sm"
                    [opciones]="opcionesLotesCliente()"
                    [valor]="loteMotorSeleccionado()"
                    (valorChange)="loteMotorSeleccionado.set($event)"
                  />
                </ay-form-field>
              </div>

              @if (respuestaMotor()) {
                <ay-alert
                  [tono]="fuentesCaidas().includes('jose') ? 'danger' : 'success'"
                  [titulo]="nombreConsultaMotorActual()"
                >
                  {{ respuestaMotor() }}
                </ay-alert>
              }

              <span ayText="subtitle" size="xs">
                Consulta ejecutada en tiempo real contra los sistemas financieros e inmobiliarios con registro de auditoría.
              </span>
            </div>
          } @else {
            <span ayText="subtitle" size="xs">
              No hay disponibilidad actualmente.
            </span>
          }
          </ay-card-body>
        </ay-card>
      </div>

      <!-- Malla completa de los 16 nodos de datos del cliente con su sistema de origen y redirección (título fuera del componente) -->
      <div ayStack gap="2">
        <div ayRow gap="2" justificar="between" [ajuste]="true">
          <div ayStack gap="1">
            <ay-heading [nivel]="2" size="sm">
              {{ nodos.length + ' secciones de datos en línea de ' + clienteActual().nombre + ' (con redirección directa por nodo)' }}
            </ay-heading>
            <span ayText="subtitle" size="xs">
              Haz clic en cualquier tarjeta para enfocarla en el Grafo 3D o usa el botón de redirección para ir a su módulo operativo
            </span>
          </div>
          <div ayRow gap="2" [ajuste]="true">
            <ay-badge size="sm" tono="neutral">{{ estadoConsultaTexto() }}</ay-badge>
            <ay-badge size="sm" tono="info">Tiempo de respuesta &lt; 2 s</ay-badge>
          </div>
        </div>
        <ay-card>
          <ay-card-body>
          <div ayGrid [columnas]="4" gap="md">
            @for (n of nodos; track n.id) {
              <ay-card
                variante="selectable"
                [seleccionada]="nodoSeleccionadoId() === n.id"
                (click)="seleccionarNodo(n.id)"
              >
                <ay-card-header
                  [titulo]="n.nombre"
                  [subtitulo]="'Origen: ' + nombresFuentesDeNodo(n)"
                  nivel="h4"
                >
                  <ay-badge ayAcciones size="sm" [tono]="estadoNodo(n).tono">
                    {{ estadoNodo(n).etiqueta }}
                  </ay-badge>
                </ay-card-header>
                <ay-card-body>
                  <div ayStack gap="2">
                    @if (estadoNodo(n).codigo === 'ok') {
                      <ay-card-pairs [pares]="paresNodo(n.id)" />
                    } @else if (estadoNodo(n).codigo === 'empty') {
                      <div ayRow gap="2" [ajuste]="true" justificar="between">
                        <span ayText="subtitle" size="xs">Disponible, sin registros para este cliente.</span>
                        <ay-button
                          tamano="sm"
                          variante="secondary"
                          (click)="$event.stopPropagation(); abrirNuevoTicketCliente(clienteActual(), n.id)"
                        >
                          Nueva gestión
                        </ay-button>
                      </div>
                    } @else if (estadoNodo(n).codigo === 'locked') {
                      <p ayText="subtitle" size="xs">
                        Tu perfil ({{ etiquetaRolActivo() }}) no tiene acceso a «{{ n.nombre.toLowerCase() }}». Solicítalo a tu supervisor ATC si lo requieres.
                      </p>
                    } @else {
                      <div ayRow gap="2" [ajuste]="true" justificar="between">
                        <span ayText="subtitle" size="xs">No se pudo consultar. Las demás secciones siguen disponibles.</span>
                        <ay-button
                          tamano="sm"
                          variante="secondary"
                          (click)="$event.stopPropagation(); reintentarFuentesDeNodo(n)"
                        >
                          Reintentar
                        </ay-button>
                      </div>
                    }
                    <ay-divider espaciado="sm" />
                    <div ayRow gap="2" [ajuste]="true" justificar="between" (click)="$event.stopPropagation()">
                      <span ayText="label" size="xs">{{ obtenerRedireccionNodo(n.id).moduloNombre }}</span>
                      <ay-button
                        tamano="sm"
                        variante="ghost"
                        (click)="ejecutarRedireccionNodo(n.id)"
                      >
                        {{ obtenerRedireccionNodo(n.id).etiqueta }} →
                      </ay-button>
                    </div>
                  </div>
                </ay-card-body>
              </ay-card>
            }
          </div>
          </ay-card-body>
        </ay-card>
      </div>
      }
    </div>
  `,
})
export class VistaC360Component {
  readonly mostrarHu = input<boolean>(false);
  readonly rolExterno = input<'gestor' | 'supervisor' | 'legal' | 'cx'>('gestor');
  readonly nodoFocoExterno = input<string>('lote');
  readonly fuentesCaidasExternas = input<readonly string[]>([]);
  readonly fuentesCaidasChange = output<string[]>();
  readonly crearTicketDesde360 = output<{
    cliente: string;
    dni: string;
    proyecto: string;
    contingencia: boolean;
    lote?: string;
    contrato?: string;
    nodoId?: string;
  }>();
  readonly verContrato = output<string>();
  readonly redirigirModulo = output<{
    destino: DestinoRedireccionNodo;
    clienteNombre: string;
    dni: string;
    contrato: string;
    nodoId: string;
  }>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly buscador360HostRef = viewChild<ElementRef<HTMLDivElement>>('buscador360Host');
  private readonly poGrafoHostRef = viewChild<ElementRef<HTMLDivElement>>('poGrafoHost');
  private readonly poGrafoCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('poGrafoCanvas');
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('astraCanvas');

  readonly clientes = CLIENTES_360;
  readonly fuentes = FUENTES_360;
  readonly nodos = NODOS_360;
  readonly consultasSemanticas = CONSULTAS_SEMANTICAS;
  readonly consultasMotor = CONSULTAS_MOTOR_RAPIDAS;

  readonly maxMovimientos = MAX_MOVIMIENTOS_360;
  readonly precargaIntegrada = PRECARGA_NUEVA_GESTION_INTEGRADA;
  readonly avisoAcceso = signal<string>('');

  readonly clienteSeleccionado = signal<boolean>(false);
  readonly busquedaClienteIdle = signal<string>('');

  readonly columnasBusquedaClientes: readonly AyColumna[] = [
    { clave: 'nombre', cabecera: 'Titular / Razón social', ancho: '28%' },
    { clave: 'doc', cabecera: 'Documento', ancho: '16%' },
    { clave: 'lote', cabecera: 'Proyecto y lote(s)', ancho: '28%' },
    { clave: 'contrato', cabecera: 'Contrato / Contacto', ancho: '16%' },
    { clave: 'accion', cabecera: 'Acción', ancho: '12%', alineacion: 'end' },
  ];

  /** BUS-01: exactas (nombre, DNI, documento, teléfono, proyecto, contrato, lote) y después fonéticas por nombre. */
  private candidatosCliente(termino: string): Candidato<Cliente360>[] {
    return buscarCandidatos(this.clientes, termino, {
      nombre: (c) => c.nombre,
      exactos: (c) => [c.nombre, c.dni, c.doc, c.telefono, c.proyecto, c.contratoPrincipal, ...c.lotes],
    });
  }

  /** El único candidato inequívoco: una sola exacta, o sin exactas una sola fonética. Nunca elige entre empatados. */
  private clienteInequivoco(cands: readonly Candidato<Cliente360>[]): Cliente360 | null {
    const exactas = cands.filter((c) => c.motivo === 'exacta');
    if (exactas.length === 1) return exactas[0].item;
    return exactas.length === 0 && cands.length === 1 ? cands[0].item : null;
  }

  readonly clientesCoincidentesIdle = computed<readonly Cliente360[]>(() => {
    const q = this.busquedaTexto().trim();
    return q ? this.candidatosCliente(q).map((c) => c.item) : this.clientes;
  });

  readonly rolesOpciones: readonly { rol: 'gestor' | 'supervisor' | 'legal' | 'cx'; etiqueta: string }[] = [
    { rol: 'gestor', etiqueta: 'Gestor de tickets' },
    { rol: 'supervisor', etiqueta: 'Supervisor ATC' },
    { rol: 'legal', etiqueta: 'Legal' },
    { rol: 'cx', etiqueta: 'Coordinador CX' },
  ];

  readonly opcionesModoVista: AySegmentoOpcion[] = [
    { valor: 'po3d', etiqueta: 'Grafo 3D' },
    { valor: '2d', etiqueta: 'Grafo 2D' },
  ];

  readonly opcionesConsultasMotor: AyOpcionSelect[] = CONSULTAS_MOTOR_RAPIDAS.map((c) => ({
    value: c.id,
    label: c.nombre,
  }));

  readonly modoRenderizado = signal<'po3d' | '2d'>('po3d');

  readonly clienteKey = signal<string>('eh');
  readonly rolActivo = signal<'gestor' | 'supervisor' | 'legal' | 'cx'>('gestor');
  readonly nodoSeleccionadoId = signal<string>('');
  readonly nodoDrawerId = signal<string>('kyc');
  readonly fuenteInspeccionadaId = signal<string | null>(null);
  readonly fichaAbierta = signal<boolean>(false);
  readonly fuentesCaidas = signal<readonly string[]>([]);
  readonly busquedaTexto = signal<string>('');
  readonly consultaSemanticaActiva = signal<string>('');
  readonly explicacionSemantica = signal<string>('');
  readonly hitsSemanticos = signal<readonly { titulo: string; fragmento: string; relevancia: number }[]>([]);
  readonly modoNoEncontrado = signal<boolean>(false);

  readonly estadoConsultaTexto = signal<string>('respuesta en 0.54 s · 8 fuentes en línea');
  readonly nodosEncendidosCount = signal<number>(NODOS_360.length);

  readonly consultaMotorId = signal<string>(CONSULTAS_MOTOR_RAPIDAS[0].id);
  readonly loteMotorSeleccionado = signal<string>('C-07');
  readonly respuestaMotor = signal<string>('');

  readonly llamadaActiva = signal<boolean>(false);
  readonly segundosLlamada = signal<number>(0);

  // Referencias mutables compartidas con montarGrafo (three/grafo360.ts)
  private readonly vistaGrafoRef: Ref<VistaGrafo | null> = { current: null };
  private readonly selGrafoRef: Ref<string> = { current: '' };
  private readonly abiertaGrafoRef: Ref<boolean> = { current: false };
  private readonly semGrafoRef: Ref<{ hits: unknown[] } | null> = { current: null };
  private readonly hoverGrafoRef: Ref<string | null> = { current: null };
  private readonly litGrafoRef: Ref<Set<string>> = { current: new Set<string>() };
  private readonly pulsosGrafoRef: Ref<PulsoGrafo[]> = { current: [] };
  private readonly t0GrafoRef: Ref<number> = { current: 0 };
  private readonly posGrafoRef: Ref<Record<string, { x: number; y: number; r: number }>> = { current: {} };
  private readonly contextoGrafoRef: Ref<ContextoGrafo> = {
    current: { ids: new Set<string>(), rels: new Set<string>(), texto: '' },
  };

  private desmontarPoGrafo: (() => void) | null = null;
  private timerLlamada: ReturnType<typeof setInterval> | null = null;
  private timerConsulta: ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;
  private hitTargets: NodoCanvasPos[] = [];
  private hoverTarget: NodoCanvasPos | null = null;
  private desp2dX = 0;

  readonly clienteActual = computed<Cliente360>(
    () => this.clientes.find((c) => c.k === this.clienteKey()) ?? this.clientes[0],
  );

  readonly tieneLotesYContrato = computed<boolean>(() => {
    const cli = this.clienteActual();
    const tieneLotes = cli.lotes.length > 0 && Boolean(cli.datos['lote']?.length);
    const tieneContrato = Boolean(cli.contratoPrincipal) && Boolean(cli.datos['contrato']?.length);
    return tieneLotes && tieneContrato && !this.modoNoEncontrado();
  });

  readonly consultasRapidasDisponibles = computed<boolean>(() => {
    const caidas = this.fuentesCaidas();
    if (caidas.includes('jose') || caidas.includes('contr')) {
      return false;
    }
    return this.tieneLotesYContrato();
  });

  /** V360-01: se recalcula al cambiar de cliente, no conserva nada del anterior. */
  readonly movimientos = computed(() =>
    this.clienteSeleccionado() ? ultimosMovimientos(this.clienteActual()) : [],
  );

  readonly loteContexto = computed<string>(() => {
    const cli = this.clienteActual();
    const l = this.loteMotorSeleccionado();
    return cli.lotes.includes(l) ? l : (cli.lotes[0] ?? '');
  });

  /** GRA-03: elementos relacionados con la selección actual (vacío si no hay ficha abierta). */
  readonly contextoSel = computed<Contexto360>(() => {
    if (!this.clienteSeleccionado() || !this.fichaAbierta()) return CONTEXTO_VACIO;
    const sel = this.fuenteInspeccionadaId() ?? this.nodoSeleccionadoId();
    const tickets = TICKETS_DEMO_360.filter((t) => t.dni === this.clienteActual().dni);
    return contextoDe(sel, {
      fuentes: this.fuentes,
      nodos: this.nodos,
      procesoDe: (id) => REDIRECCION_NODOS_360[id]?.moduloNombre,
      areasDe: (id) =>
        id === 'tick'
          ? tickets.map((t) => t.area)
          : id === 'libro'
            ? tickets.filter((t) => t.type === 'REC' || t.type === 'QUE').map((t) => t.area)
            : [],
      catalogoAreas: CATALOGO_GRAFO_360.areas,
    });
  });

  readonly contextoGrafo = computed<ContextoGrafo>(() => {
    const c = this.contextoSel();
    const partes = [
      c.areas.length ? `Áreas: ${c.areas.join(' · ')}` : '',
      c.procesos.length ? `Proceso: ${c.procesos.join(' · ')}` : '',
    ].filter(Boolean);
    return { ids: c.ids, rels: new Set(c.relaciones.map((r) => r.id)), texto: partes.join('  |  ') };
  });

  readonly nodoActual = computed<NodoDato360>(
    () =>
      this.nodos.find((n) => n.id === (this.nodoSeleccionadoId() || this.nodoDrawerId())) ??
      this.nodos[0],
  );

  readonly fuenteInspeccionada = computed<Fuente360 | null>(() => {
    const id = this.fuenteInspeccionadaId();
    if (!id) return null;
    return this.fuentes.find((f) => f.id === id) ?? null;
  });

  readonly opcionesLotesCliente = computed<AyOpcionSelect[]>(() =>
    this.clienteActual().lotes.map((l) => ({
      value: l,
      label: `${this.clienteActual().proyecto} · Lote ${l}`,
    })),
  );

  readonly nombreConsultaMotorActual = computed<string>(
    () => this.consultasMotor.find((c) => c.id === this.consultaMotorId())?.nombre ?? 'Consulta al motor',
  );

  constructor() {
    effect(() => {
      const rExt = this.rolExterno();
      this.rolActivo.set(rExt);
    });

    effect(() => {
      const fExt = this.fuentesCaidasExternas();
      this.fuentesCaidas.set(fExt);
    });

    effect(() => {
      const sel = this.fuenteInspeccionadaId() ?? this.nodoSeleccionadoId();
      const hits = this.hitsSemanticos();
      const abierta = this.fichaAbierta();

      this.selGrafoRef.current = abierta ? sel : '';
      this.abiertaGrafoRef.current = abierta;
      this.contextoGrafoRef.current = this.contextoGrafo();
      this.semGrafoRef.current = hits.length > 0 ? { hits: [...hits] } : null;
    });

    // Efecto para recalcular la vista del Grafo 3D y disparar la oleada de pulsos cuando cambia cliente, rol, fuentes caídas o estado activo
    effect(() => {
      const cli = this.clienteActual();
      const caidas = this.fuentesCaidas();
      const rol = this.rolActivo();
      const activo = this.clienteSeleccionado();
      this.dispararOleadaPulsosGrafo(cli, caidas, rol, activo);
    });

    // Montar / desmontar el Grafo 3D cuando el canvas aparece al seleccionar un cliente o se oculta al volver a la búsqueda idle
    effect(() => {
      const host = this.poGrafoHostRef()?.nativeElement;
      const canvas = this.poGrafoCanvasRef()?.nativeElement;
      if (host && canvas) {
        if (!this.desmontarPoGrafo) {
          this.inicializarPoGrafo3D();
        }
      } else if (this.desmontarPoGrafo) {
        this.desmontarPoGrafo();
        this.desmontarPoGrafo = null;
      }
    });

    afterNextRender(() => {
      inyectarEstilos();
      this.inicializarPoGrafo3D();
      this.iniciarLoopCanvas();
    });

    const desuscribirTema = subscribeAppearance(() => {
      this.paletaGrafo = null;
      if (this.desmontarPoGrafo) {
        this.desmontarPoGrafo();
        this.desmontarPoGrafo = null;
        this.inicializarPoGrafo3D();
      }
    });
    this.destroyRef.onDestroy(() => {
      desuscribirTema();
      this.desmontarPoGrafo?.();
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      if (this.timerLlamada !== null) clearInterval(this.timerLlamada);
      if (this.timerConsulta !== null) clearTimeout(this.timerConsulta);
    });
  }

  private paletaGrafo: PaletaGrafo | null = null;

  private inicializarPoGrafo3D(): void {
    const host = this.poGrafoHostRef()?.nativeElement;
    const canvas = this.poGrafoCanvasRef()?.nativeElement;
    if (!host || !canvas) return;

    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    this.desmontarPoGrafo = montarGrafo({
      canvas,
      host,
      reducido,
      vista: this.vistaGrafoRef,
      sel: this.selGrafoRef,
      abierta: this.abiertaGrafoRef,
      sem: this.semGrafoRef,
      hover: this.hoverGrafoRef,
      contexto: this.contextoGrafoRef,
      lit: this.litGrafoRef,
      pulsos: this.pulsosGrafoRef,
      t0: this.t0GrafoRef,
      pos: this.posGrafoRef,
      alClickNodo: (id) => {
        if (!this.clienteSeleccionado()) return;
        this.seleccionarNodo(id);
      },
      alClickFuente: (id) => {
        if (!this.clienteSeleccionado()) return;
        this.inspeccionarFuente360(id);
      },
    });
  }

  private dispararOleadaPulsosGrafo(
    cli: Cliente360,
    caidas: readonly string[],
    rol: 'gestor' | 'supervisor' | 'legal' | 'cx',
    activo = this.clienteSeleccionado(),
  ): void {
    const rolPermiso = rol === 'cx' ? 'supervisor' : rol;
    const vista: VistaGrafo = {
      apagado: !activo,
      cliente: { nombre: cli.nombre },
      fuentes: this.fuentes.map((s) => ({
        id: s.id,
        n: s.nombre,
        d: s.detalle,
        caida: caidas.includes(s.id),
      })),
      nodos: this.nodos.map((n) => {
        const restringido = Boolean(n.restringidoPara?.includes(rolPermiso));
        const sinDatosNodo = !cli.datos[n.id]?.length;
        const caido = n.fuentes.some((fid) => caidas.includes(fid));
        return {
          id: n.id,
          n: n.nombre,
          // GRA-01: fuente caída = no disponible; fuente en línea sin registros = disponible sin registros
          estado: restringido ? 'restringido' : caido ? 'caido' : sinDatosNodo ? 'vacio' : 'ok',
          sem: n.semantico,
          fuentes: n.fuentes,
        };
      }),
    };

    this.vistaGrafoRef.current = vista;
    this.litGrafoRef.current = new Set<string>();
    if (!activo) {
      this.pulsosGrafoRef.current = [];
      if (this.timerConsulta !== null) clearTimeout(this.timerConsulta);
      this.nodosEncendidosCount.set(0);
      this.estadoConsultaTexto.set('En espera de búsqueda · Grafo 360 apagado');
      return;
    }

    const latenciaDe = (fid: string): number =>
      caidas.includes(fid) ? 1200 : this.fuentes.find((f) => f.id === fid)?.ms ?? 220;

    const nuevosPulsos: PulsoGrafo[] = [];
    vista.fuentes.forEach((s) => {
      nuevosPulsos.push({
        a: 'c',
        b: s.id,
        t0: 0,
        dur: latenciaDe(s.id) * 0.55,
        src: s.id,
      });
    });
    vista.nodos.forEach((d) => {
      d.fuentes.forEach((sid) => {
        const ms = latenciaDe(sid);
        nuevosPulsos.push({
          a: sid,
          b: d.id,
          t0: ms * 0.55,
          dur: ms * 0.45 + 120,
          src: sid,
          dst: d.id,
        });
      });
    });

    this.pulsosGrafoRef.current = nuevosPulsos;
    this.t0GrafoRef.current = typeof performance !== 'undefined' ? performance.now() : 0;

    const maxMs =
      Math.max(...vista.nodos.map((d) => Math.min(...d.fuentes.map(latenciaDe)))) + 120;
    const numCaidas = caidas.length;
    const resumenFinal = `respuesta en ${(maxMs / 1000).toFixed(2)} s · ${
      numCaidas > 0
        ? `${numCaidas} ${numCaidas === 1 ? 'fuente no disponible' : 'fuentes no disponibles'}`
        : `${vista.fuentes.length} fuentes en línea`
    }`;

    this.estadoConsultaTexto.set('consultando…');
    if (this.timerConsulta !== null) clearTimeout(this.timerConsulta);
    this.timerConsulta = setTimeout(() => {
      this.estadoConsultaTexto.set(resumenFinal);
      const disponibles = vista.nodos.filter((n) => n.estado === 'ok').length;
      this.nodosEncendidosCount.set(disponibles);
    }, maxMs + 140);
  }

  alClickPoGrafo(ev: MouseEvent): void {
    if (!this.clienteSeleccionado()) return;
    const canvas = this.poGrafoCanvasRef()?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const pos = this.posGrafoRef.current;

    let mejorNodo: string | null = null;
    let mejorDist = 26;
    for (const n of this.nodos) {
      const p = pos[n.id];
      if (!p) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < mejorDist) {
        mejorDist = d;
        mejorNodo = n.id;
      }
    }
    if (mejorNodo) {
      this.seleccionarNodo(mejorNodo);
      return;
    }

    // Permitir también clic sobre una esfera de sistema de origen para inspeccionarla y ver sus nodos conectados
    for (const s of this.fuentes) {
      const p = pos[s.id];
      if (!p) continue;
      if (Math.hypot(p.x - x, p.y - y) < 26) {
        this.inspeccionarFuente360(s.id);
        return;
      }
    }

    const pc = pos['c'];
    if (pc && Math.hypot(pc.x - x, pc.y - y) < 32) {
      this.seleccionarNodo('kyc');
    }
  }

  alMoverMousePoGrafo(ev: MouseEvent): void {
    const canvas = this.poGrafoCanvasRef()?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const pos = this.posGrafoRef.current;

    let hallado: string | null = null;
    let mejorDist = 26;
    for (const n of this.nodos) {
      const p = pos[n.id];
      if (!p) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < mejorDist) {
        mejorDist = d;
        hallado = n.id;
      }
    }
    if (!hallado) {
      for (const s of this.fuentes) {
        const p = pos[s.id];
        if (!p) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < 24) {
          hallado = s.id;
          break;
        }
      }
    }
    this.hoverGrafoRef.current = hallado;
    canvas.style.cursor = hallado ? 'pointer' : 'default';
  }

  alSalirMousePoGrafo(): void {
    this.hoverGrafoRef.current = null;
  }

  cambiarModoRenderizado(modo: string): void {
    if (modo === 'po3d' || modo === '2d') {
      this.modoRenderizado.set(modo);
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    }
  }

  seleccionarNodo(nodoId: string): void {
    if (
      this.fichaAbierta() &&
      this.nodoSeleccionadoId() === nodoId &&
      !this.fuenteInspeccionadaId()
    ) {
      this.cerrarFichaFlotante();
      return;
    }
    this.avisoAcceso.set('');
    this.fuenteInspeccionadaId.set(null);
    this.nodoDrawerId.set(nodoId);
    this.nodoSeleccionadoId.set(nodoId);
    this.selGrafoRef.current = nodoId;
    this.abiertaGrafoRef.current = true;
    this.fichaAbierta.set(true);
  }

  inspeccionarFuente360(fuenteId: string): void {
    if (this.fichaAbierta() && this.fuenteInspeccionadaId() === fuenteId) {
      this.cerrarFichaFlotante();
      return;
    }
    this.avisoAcceso.set('');
    this.fuenteInspeccionadaId.set(fuenteId);
    this.nodoSeleccionadoId.set('');
    this.selGrafoRef.current = fuenteId;
    this.abiertaGrafoRef.current = true;
    this.fichaAbierta.set(true);
  }

  cerrarFichaFlotante(): void {
    this.avisoAcceso.set('');
    this.fichaAbierta.set(false);
    this.abiertaGrafoRef.current = false;
    this.nodoSeleccionadoId.set('');
    this.selGrafoRef.current = '';
  }

  nodosDeFuente(fuenteId: string): readonly NodoDato360[] {
    return this.nodos.filter((n) => n.fuentes.includes(fuenteId));
  }

  trazabilidadFuente(fuenteId: string): MetaTrazabilidad360 {
    return (
      TRAZABILIDAD_FUENTES_360[fuenteId] ?? {
        hu: 'Consulta 360 en línea',
        rfRn: 'Integración en tiempo real sin copia local',
        entidadDep: fuenteId.toUpperCase(),
        inputReal: 'Consulta en línea sin copia local.',
      }
    );
  }

  trazabilidadNodo(nodoId: string): MetaTrazabilidad360 {
    return (
      TRAZABILIDAD_NODOS_360[nodoId] ?? {
        hu: 'Sección de ficha 360',
        rfRn: 'Consulta en tiempo real por perfil',
        entidadDep: 'Sistema de origen conectado',
        inputReal: 'Dato consultado en línea desde la fuente.',
      }
    );
  }

  obtenerRedireccionNodo(nodoId: string): AccionRedireccionNodo360 {
    return (
      REDIRECCION_NODOS_360[nodoId] ?? {
        etiqueta: 'Ir a Bandeja del Cliente',
        destino: 'bandeja',
        moduloNombre: 'Bandeja de Tickets',
      }
    );
  }

  ejecutarRedireccionNodo(nodoId: string): void {
    const cli = this.clienteActual();
    const acc = this.obtenerRedireccionNodo(nodoId);
    if (acc.destino === 'contrato') {
      if (!cli.contratoPrincipal) {
        this.avisoAcceso.set(`${cli.nombre} aún no tiene contrato: no hay contrato que abrir. Puedes iniciar una nueva gestión.`);
        return;
      }
      this.verContrato.emit(cli.contratoPrincipal);
      return;
    }
    this.redirigirModulo.emit({
      destino: acc.destino,
      clienteNombre: cli.nombre,
      dni: cli.dni,
      contrato: cli.contratoPrincipal,
      nodoId,
    });
  }

  comoCliente360(fila: unknown): Cliente360 {
    return fila as Cliente360;
  }

  ejecutarBusquedaIdle(termino?: string): void {
    const q = (termino ?? this.busquedaClienteIdle()).trim();
    this.busquedaClienteIdle.set(q);
    if (!q) return;
    if (q.includes('99999999') || q.toLowerCase().includes('no existe')) {
      this.activarContingenciaNoEncontrado();
      return;
    }
    const unico = this.clienteInequivoco(this.candidatosCliente(q));
    if (unico) {
      this.entrarAFichaCliente(unico.k);
    }
  }

  entrarAFichaCliente(k: string): void {
    this.seleccionarCliente(k);
    this.clienteSeleccionado.set(true);
    this.cerrarFichaFlotante();
  }

  volverABusquedaClientes(): void {
    this.clienteSeleccionado.set(false);
    this.cerrarFichaFlotante();
    this.busquedaTexto.set('');
    this.busquedaClienteIdle.set('');
    this.modoNoEncontrado.set(false);
    this.explicacionSemantica.set('');
    this.hitsSemanticos.set([]);
  }

  seleccionarCliente(k: string): void {
    if (!k) return;
    this.modoNoEncontrado.set(false);
    this.clienteKey.set(k);
    this.cerrarFichaFlotante();
    const cli = this.clientes.find((c) => c.k === k);
    if (cli?.lotes[0]) {
      this.loteMotorSeleccionado.set(cli.lotes[0]);
    }
    this.respuestaMotor.set('');
  }

  cambiarRol(rol: string): void {
    if (rol === 'gestor' || rol === 'supervisor' || rol === 'legal' || rol === 'cx') {
      this.rolActivo.set(rol);
    }
  }

  etiquetaRolActivo(): string {
    return this.rolesOpciones.find((r) => r.rol === this.rolActivo())?.etiqueta ?? this.rolActivo();
  }

  restaurarTodasLasFuentes(): void {
    this.fuentesCaidas.set([]);
    this.fuentesCaidasChange.emit([]);
  }

  reintentarFuentesDeNodo(n: NodoDato360): void {
    const nuevo = this.fuentesCaidas().filter((fid) => !n.fuentes.includes(fid));
    this.fuentesCaidas.set(nuevo);
    this.fuentesCaidasChange.emit([...nuevo]);
  }

  alCambiarBusqueda(valor: string): void {
    this.busquedaTexto.set(valor);
    this.busquedaClienteIdle.set(valor);
    const v = valor.trim().toLowerCase();
    if (!v) {
      this.explicacionSemantica.set('');
      this.consultaSemanticaActiva.set('');
      this.hitsSemanticos.set([]);
      return;
    }
    if (!this.clienteSeleccionado()) {
      return;
    }
    const encontrado = this.clientes.find(
      (c) =>
        c.dni.toLowerCase().includes(v) ||
        c.doc.toLowerCase().includes(v) ||
        c.nombre.toLowerCase().includes(v) ||
        c.telefono.toLowerCase().includes(v) ||
        c.contratoPrincipal.toLowerCase().includes(v) ||
        c.lotes.some((l) => l.toLowerCase().includes(v)),
    );
    if (encontrado && encontrado.k !== this.clienteKey()) {
      this.modoNoEncontrado.set(false);
      this.seleccionarCliente(encontrado.k);
    }
  }

  private leerInputDomBusqueda(): string | null {
    const host = this.buscador360HostRef()?.nativeElement;
    if (!host) return null;
    const inp = host.querySelector<HTMLInputElement>('input[type="search"], input');
    return inp ? inp.value : null;
  }

  ejecutarBusquedaSemantica(terminoExplicito?: string): void {
    const raw = (terminoExplicito ?? this.leerInputDomBusqueda() ?? this.busquedaTexto()).trim();
    this.busquedaTexto.set(raw);
    this.busquedaClienteIdle.set(raw);
    const q = raw.toLowerCase();

    if (!this.clienteSeleccionado()) {
      if (!q) {
        this.entrarAFichaCliente(this.clienteKey());
        return;
      }
      if (q.includes('99999999') || q.includes('no existe')) {
        this.activarContingenciaNoEncontrado();
        return;
      }
      const cands = this.candidatosCliente(raw);
      const unico = this.clienteInequivoco(cands);
      if (unico) {
        this.entrarAFichaCliente(unico.k);
      } else if (cands.length === 0) {
        this.activarContingenciaNoEncontrado();
      }
      // Varios candidatos: queda la tabla para que el asesor elija (sin autoselección).
      return;
    }

    if (!q) {
      this.cerrarFichaFlotante();
      this.dispararOleadaPulsosGrafo(this.clienteActual(), this.fuentesCaidas(), this.rolActivo());
      return;
    }

    if (q.includes('99999999') || q.includes('no existe')) {
      this.activarContingenciaNoEncontrado();
      return;
    }

    const cliMatch = this.clienteInequivoco(this.candidatosCliente(raw));
    if (cliMatch && cliMatch.k !== this.clienteKey()) {
      this.seleccionarCliente(cliMatch.k);
    }

    const cs = this.consultasSemanticas.find(
      (item) => item.q.toLowerCase().includes(q) || q.includes(item.q.toLowerCase()) || q === item.nodo,
    );
    if (cs) {
      this.aplicarConsultaSemantica(cs.q, cs.nodo, cs.explicacion);
      return;
    }

    const nodoMatch = this.nodos.find(
      (n) => n.nombre.toLowerCase().includes(q) || n.id.toLowerCase() === q,
    );
    if (nodoMatch) {
      this.hitsSemanticos.set([]);
      this.explicacionSemantica.set('');
      this.seleccionarNodo(nodoMatch.id);
      this.dispararOleadaPulsosGrafo(this.clienteActual(), this.fuentesCaidas(), this.rolActivo());
      return;
    }

    const fuenteMatch = this.fuentes.find(
      (s) => s.nombre.toLowerCase().includes(q) || s.id.toLowerCase() === q,
    );
    if (fuenteMatch) {
      this.hitsSemanticos.set([]);
      this.explicacionSemantica.set('');
      this.inspeccionarFuente360(fuenteMatch.id);
      this.dispararOleadaPulsosGrafo(this.clienteActual(), this.fuentesCaidas(), this.rolActivo());
      return;
    }

    if (cliMatch) {
      this.hitsSemanticos.set([]);
      this.explicacionSemantica.set('');
      this.cerrarFichaFlotante();
      this.dispararOleadaPulsosGrafo(cliMatch, this.fuentesCaidas(), this.rolActivo());
      return;
    }

    this.seleccionarNodo('docs');
    const docs = this.filasNodo('docs');
    this.hitsSemanticos.set(
      docs.map((f, i) => ({
        titulo: f[0],
        fragmento: `${f[1]} · coincidencia semántica para «${raw}»`,
        relevancia: Math.max(74, 96 - i * 8),
      })),
    );
    this.explicacionSemantica.set(
      `Búsqueda semántica documental: indexación vectorial sobre S3/GLI para «${raw}» completada en 310 ms.`,
    );
    this.dispararOleadaPulsosGrafo(this.clienteActual(), this.fuentesCaidas(), this.rolActivo());
  }

  aplicarConsultaSemantica(q: string, nodoId: string, explicacion: string): void {
    this.busquedaTexto.set(q);
    this.consultaSemanticaActiva.set(q);
    this.seleccionarNodo(nodoId);
    this.explicacionSemantica.set(explicacion);
    const filas = this.filasNodo(nodoId);
    this.hitsSemanticos.set(
      filas.map((f, i) => ({
        titulo: f[0],
        fragmento: f[1],
        relevancia: Math.max(82, 98 - i * 6),
      })),
    );
    this.dispararOleadaPulsosGrafo(this.clienteActual(), this.fuentesCaidas(), this.rolActivo());
  }

  ejecutarConsultaMotor(): void {
    const cli = this.clienteActual();
    const lote = this.loteMotorSeleccionado() || cli.lotes[0] || 'M-14';
    if (this.fuentesCaidas().includes('jose')) {
      this.respuestaMotor.set(
        'El motor de consultas en línea no está disponible en este momento. La atención no se bloquea: continúa con el ticket y vuelve a consultar más tarde.',
      );
      return;
    }
    const consulta =
      this.consultasMotor.find((c) => c.id === this.consultaMotorId()) ?? this.consultasMotor[0];
    this.respuestaMotor.set(consulta.respuesta(cli, lote));
  }

  activarContingenciaNoEncontrado(): void {
    this.modoNoEncontrado.set(true);
    this.busquedaTexto.set('DNI 99999999 (No registrado en SIGDA)');
  }

  crearTicketContingencia(): void {
    this.crearTicketDesde360.emit({
      cliente: 'Interesado en verificación (Cola de conciliación)',
      dni: '9999••••',
      proyecto: 'Por confirmar en SIGDA',
      contingencia: true,
    });
  }

  /** GRA-02: nueva gestión por el flujo existente de tickets/reclamos, con el contexto cliente/lote/nodo. */
  abrirNuevoTicketCliente(cli: Cliente360, nodoId?: string): void {
    const lote = cli.lotes.includes(this.loteContexto()) ? this.loteContexto() : (cli.lotes[0] ?? '');
    this.crearTicketDesde360.emit({
      cliente: cli.nombre,
      dni: cli.dni,
      proyecto: lote ? `${cli.proyecto} · Lote ${lote}` : cli.proyecto,
      contingencia: false,
      lote,
      contrato: cli.contratoPrincipal,
      nodoId,
    });
  }

  etiquetaTipoMovimiento(t: TipoMovimiento360): string {
    return ETIQUETA_TIPO_MOVIMIENTO[t];
  }

  fechaMovimiento(d: Date): string {
    return fmtFecha(d);
  }

  iniciarLlamadaCti(): void {
    this.llamadaActiva.set(true);
    this.segundosLlamada.set(1);
    if (this.timerLlamada !== null) clearInterval(this.timerLlamada);
    this.timerLlamada = setInterval(() => {
      this.segundosLlamada.update((s) => s + 1);
    }, 1000);
  }

  finalizarLlamadaCti(): void {
    this.llamadaActiva.set(false);
    if (this.timerLlamada !== null) {
      clearInterval(this.timerLlamada);
      this.timerLlamada = null;
    }
    this.seleccionarNodo('llam');
  }

  alternarFallaFuente(fuenteId: string): void {
    const actual = this.fuentesCaidas();
    const nuevo = actual.includes(fuenteId)
      ? actual.filter((id) => id !== fuenteId)
      : [...actual, fuenteId];
    this.fuentesCaidas.set(nuevo);
    this.fuentesCaidasChange.emit([...nuevo]);
  }

  nombreFuente(id: string): string {
    return this.fuentes.find((f) => f.id === id)?.nombre ?? id;
  }

  nombresFuentesDeNodo(n: NodoDato360): string {
    return n.fuentes.map((fid) => this.nombreFuente(fid)).join(' + ');
  }

  nombresFuentesNodoActual(): string {
    return this.nombresFuentesDeNodo(this.nodoActual());
  }

  nombresFuentesCaidasNodoActual(): string {
    return this.nodoActual()
      .fuentes.filter((fid) => this.fuentesCaidas().includes(fid))
      .map((fid) => this.nombreFuente(fid))
      .join(', ');
  }

  resumenDato(nodoId: string): string {
    return this.filasNodo(nodoId)[0]?.[1] ?? '—';
  }

  correoCliente(cli: Cliente360): string {
    return cli.datos['cont']?.[1]?.[1] ?? cli.datos['cont']?.[0]?.[1] ?? `${cli.k}@cliente.aybar.pe`;
  }

  estadoNodo(n: NodoDato360): {
    codigo: 'ok' | 'locked' | 'down' | 'empty';
    tono: 'success' | 'warning' | 'danger' | 'neutral';
    etiqueta: string;
  } {
    const rolPermiso = this.rolActivo() === 'cx' ? 'supervisor' : this.rolActivo();
    if (n.restringidoPara?.includes(rolPermiso)) {
      return { codigo: 'locked', tono: 'warning', etiqueta: 'Restringido' };
    }
    if (n.fuentes.some((fid) => this.fuentesCaidas().includes(fid))) {
      return { codigo: 'down', tono: 'danger', etiqueta: 'No disponible' };
    }
    if (!this.clienteActual().datos[n.id]?.length) {
      return { codigo: 'empty', tono: 'neutral', etiqueta: 'Sin registros' };
    }
    return { codigo: 'ok', tono: 'success', etiqueta: 'En línea' };
  }

  filasNodo(nodoId: string): readonly (readonly [string, string])[] {
    return this.clienteActual().datos[nodoId] ?? [['Sin registros', '—']];
  }

  paresFuente(src: Fuente360): ParCardPairs[] {
    const traz = this.trazabilidadFuente(src.id);
    return [
      { clave: 'Plataforma', valor: traz.entidadDep },
      { clave: 'Integración', valor: traz.rfRn },
      { clave: 'Consulta en línea', valor: traz.inputReal },
    ];
  }

  paresNodo(nodoId: string): ParCardPairs[] {
    return this.filasNodo(nodoId).map(([clave, valor]) => ({ clave, valor }));
  }

  /** GRA-02: saldo e interés moratorio solo con lo que trae el dato del nodo «saldo» (no el estado de cuenta, restringido). */
  paresSaldo(): ParCardPairs[] {
    const filas = this.filasNodo('saldo');
    const saldo = filas.find(([k]) => /saldo/i.test(k));
    const mora = filas.find(([k, v]) => /morator/i.test(`${k} ${v}`));
    const sinDato = 'No informado por la fuente';
    return [
      { clave: saldo?.[0] ?? 'Saldo', valor: saldo?.[1] ?? sinDato },
      { clave: mora?.[0] ?? 'Interés moratorio', valor: mora?.[1] ?? sinDato },
      ...filas.filter((f) => f !== saldo && f !== mora).map(([clave, valor]) => ({ clave, valor })),
    ];
  }

  paresLoteCliente(): ParCardPairs[] {
    const cli = this.clienteActual();
    return [
      { clave: 'Cliente', valor: `${cli.nombre} · ${cli.doc}` },
      { clave: 'Proyecto', valor: cli.proyecto },
      { clave: 'Lote(s)', valor: cli.lotes.join(', ') || 'Sin lote aún' },
      { clave: 'Contrato', valor: cli.contratoPrincipal || 'Sin contrato aún' },
    ];
  }

  private nombreElementoGrafo(id: string): string {
    if (id === ID_CLIENTE_GRAFO) return 'Cliente';
    return this.fuentes.find((f) => f.id === id)?.nombre ?? this.nodos.find((n) => n.id === id)?.nombre ?? id;
  }

  /** GRA-03: áreas, procesos y relaciones (id · tipo) del elemento seleccionado. */
  paresContexto(): ParCardPairs[] {
    const c = this.contextoSel();
    return [
      { clave: 'Áreas vinculadas', valor: c.areas.join(', ') || 'Sin áreas vinculadas en los datos' },
      { clave: 'Proceso / módulo', valor: c.procesos.join(', ') || 'Sin proceso definido' },
      ...c.relaciones.map((r) => ({
        clave: r.id,
        valor: `${r.tipo} · ${this.nombreElementoGrafo(r.de)} → ${this.nombreElementoGrafo(r.a)}`,
      })),
    ];
  }

  paresTrazabilidadNodo(nodoId: string): ParCardPairs[] {
    const traz = this.trazabilidadNodo(nodoId);
    return [
      { clave: 'Sistema de origen', valor: traz.entidadDep },
      { clave: 'Criterio', valor: traz.rfRn },
      { clave: 'Consulta en línea', valor: traz.inputReal },
    ];
  }

  alMoverMouseCanvas(ev: MouseEvent): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    let hallado: NodoCanvasPos | null = null;
    for (const h of this.hitTargets) {
      if (Math.hypot(mx - h.x, my - h.y) <= h.r + 5) {
        hallado = h;
        break;
      }
    }
    this.hoverTarget = hallado;
    canvas.style.cursor = hallado ? 'pointer' : 'default';
  }

  alSalirMouseCanvas(): void {
    this.hoverTarget = null;
  }

  alClickCanvas(): void {
    if (!this.clienteSeleccionado()) return;
    const h = this.hoverTarget;
    if (!h) return;
    if (h.kind === 'node' && h.n) {
      this.seleccionarNodo(h.n.id);
    } else if (h.kind === 'src' && h.s) {
      this.inspeccionarFuente360(h.s.id);
    } else if (h.kind === 'cli') {
      this.seleccionarNodo('kyc');
    }
  }

  private iniciarLoopCanvas(): void {
    const renderizar = (ts: number): void => {
      if (this.modoRenderizado() === '2d') {
        this.dibujarRedNeuronal(ts);
      }
      this.rafId = requestAnimationFrame(renderizar);
    };
    this.rafId = requestAnimationFrame(renderizar);
  }

  private dibujarRedNeuronal(ts: number): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight || 736;
    if (!W) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(W * dpr) || canvas.height !== Math.floor(H * dpr)) {
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Canvas siempre oscuro (también en tema claro): colores «sobre oscuro» de three/paleta.ts.
    const P = (this.paletaGrafo ??= crearPaleta());
    const tealOscuro = css(P.fondo);
    const tealBase = css(P.base);
    const naranja = css(P.acento);
    const verde = css(P.ok);
    const ambar = css(P.warn);
    const rojo = css(P.bad);
    const blanco = css(P.texto);
    const mudo = css(P.mudo);
    const activoCliente = this.clienteSeleccionado();

    ctx.fillStyle = tealOscuro;
    ctx.fillRect(0, 0, W, H);

    const target2dX =
      activoCliente && this.fichaAbierta() ? -Math.min(456, W * 0.42) * 0.45 : 0;
    this.desp2dX += (target2dX - this.desp2dX) * 0.1;

    const cx = W * 0.5 + this.desp2dX;
    const cy = H * 0.51;
    const m = Math.min(W, H);
    const rSrc = m * 0.22;
    const rNode = m * 0.38;

    [rSrc * 0.52, rSrc, rNode].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle =
        idx === 1 && activoCliente ? css(P.acento, 0.20) : css(P.texto, 0.08);
      ctx.setLineDash(idx === 2 ? [3, 6] : []);
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const posFuentes: Record<string, NodoCanvasPos> = {};
    this.fuentes.forEach((s, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / this.fuentes.length;
      posFuentes[s.id] = {
        kind: 'src',
        s,
        x: cx + Math.cos(a) * rSrc,
        y: cy + Math.sin(a) * rSrc,
        r: 16,
      };
    });

    const posNodos: Record<string, NodoCanvasPos> = {};
    this.nodos.forEach((n, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / this.nodos.length;
      posNodos[n.id] = {
        kind: 'node',
        n,
        x: cx + Math.cos(a) * rNode,
        y: cy + Math.sin(a) * rNode,
        r: 13,
      };
    });

    const foco = activoCliente ? this.hoverTarget : null;
    const selId = activoCliente ? this.nodoSeleccionadoId() : '';
    const ctxG = activoCliente ? this.contextoGrafo() : null;
    const hayCtx = Boolean(ctxG && ctxG.ids.size > 0);
    const enCtx = (id: string): boolean => !hayCtx || Boolean(ctxG?.ids.has(id));
    const caidas = this.fuentesCaidas();
    const t = ts * 0.001;

    const bezierPt = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      u: number,
    ): [number, number] => {
      const v = 1 - u;
      return [v * v * x0 + 2 * v * u * x1 + u * u * x2, v * v * y0 + 2 * v * u * y1 + u * u * y2];
    };

    this.nodos.forEach((n, idx) => {
      const np = posNodos[n.id];
      const st = this.estadoNodo(n).codigo;
      n.fuentes.forEach((sid, j) => {
        const sp = posFuentes[sid];
        if (!sp) return;
        const sDown = caidas.includes(sid);
        const activo =
          activoCliente &&
          (Boolean(ctxG?.rels.has(idRelacion(sid, n.id))) ||
            selId === n.id ||
            (foco?.kind === 'node' && foco.n?.id === n.id) ||
            (foco?.kind === 'src' && foco.s?.id === sid));
        const cpx = (sp.x + np.x) * 0.5 + (cx - (sp.x + np.x) * 0.5) * 0.18;
        const cpy = (sp.y + np.y) * 0.5 + (cy - (sp.y + np.y) * 0.5) * 0.18;

        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.quadraticCurveTo(cpx, cpy, np.x, np.y);
        ctx.strokeStyle = !activoCliente
          ? css(P.texto, 0.10)
          : sDown
            ? css(P.bad, 0.57)
            : activo
              ? css(P.acento, 0.90)
              : st === 'locked'
                ? css(P.warn, 0.55)
                : css(P.texto, 0.18);
        ctx.lineWidth = activo ? 2.2 : 1.1;
        ctx.stroke();

        if (activoCliente && !sDown && st === 'ok') {
          const u = (t * 0.42 + idx * 0.07 + j * 0.19) % 1;
          const [px, py] = bezierPt(sp.x, sp.y, cpx, cpy, np.x, np.y, u);
          ctx.beginPath();
          ctx.arc(px, py, activo ? 3.2 : 2.1, 0, Math.PI * 2);
          ctx.fillStyle = activo ? naranja : css(P.texto, 0.78);
          ctx.fill();
        }
      });
    });

    this.fuentes.forEach((s, idx) => {
      const sp = posFuentes[s.id];
      const down = caidas.includes(s.id);
      const activo =
        activoCliente &&
        (Boolean(ctxG?.rels.has(idRelacion(ID_CLIENTE_GRAFO, s.id))) ||
          (foco?.kind === 'src' && foco.s?.id === s.id));
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sp.x, sp.y);
      ctx.strokeStyle = !activoCliente
        ? css(P.texto, 0.12)
        : down
          ? css(P.bad, 0.63)
          : activo
            ? css(P.acento, 0.85)
            : css(P.texto, 0.22);
      ctx.lineWidth = activo ? 2 : 1.15;
      ctx.stroke();

      if (activoCliente && !down) {
        const u = (t * 0.55 + idx * 0.13) % 1;
        const px = cx + (sp.x - cx) * u;
        const py = cy + (sp.y - cy) * u;
        ctx.beginPath();
        ctx.arc(px, py, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = naranja;
        ctx.fill();
      }
    });

    this.hitTargets = [];

    this.fuentes.forEach((s) => {
      const p = posFuentes[s.id];
      if (activoCliente) this.hitTargets.push(p);
      const down = caidas.includes(s.id);
      const isHover = activoCliente && foco?.kind === 'src' && foco.s?.id === s.id;
      ctx.globalAlpha = enCtx(s.id) ? 1 : 0.35;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + (isHover ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = !activoCliente
        ? css(P.texto, 0.08)
        : down
          ? css(P.bad, 0.43000000000000005)
          : css(P.acento, 0.20);
      ctx.fill();
      ctx.lineWidth = isHover ? 2.4 : 1.6;
      ctx.strokeStyle = !activoCliente ? css(P.texto, 0.24) : down ? rojo : naranja;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = !activoCliente ? css(P.texto, 0.35) : down ? rojo : naranja;
      ctx.fill();

      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = !activoCliente ? mudo : blanco;
      ctx.textAlign = 'center';
      ctx.fillText(activoCliente && down ? `✕ ${s.nombre}` : s.nombre, p.x, p.y + p.r + 13);
      ctx.globalAlpha = 1;
    });

    this.nodos.forEach((n) => {
      const p = posNodos[n.id];
      if (activoCliente) this.hitTargets.push(p);
      const st = this.estadoNodo(n).codigo;
      const isSel = activoCliente && selId === n.id;
      const isHover = activoCliente && foco?.kind === 'node' && foco.n?.id === n.id;
      ctx.globalAlpha = enCtx(n.id) ? 1 : 0.35;
      const col = !activoCliente
        ? css(P.texto, 0.25)
        : st === 'ok'
          ? verde
          : st === 'locked'
            ? ambar
            : st === 'empty'
              ? mudo
              : rojo;

      if (isSel || isHover || (hayCtx && ctxG?.ids.has(n.id))) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
        ctx.fillStyle = css(P.acento, 0.24);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? tealBase : css(P.base, 0.92);
      ctx.fill();
      ctx.lineWidth = isSel || isHover ? 2.5 : 2;
      ctx.strokeStyle = isSel ? naranja : col;
      // Segundo canal (no solo color): discontinuo = restringido, punteado = sin registros, aspa = sin conexión.
      if (activoCliente) ctx.setLineDash(st === 'locked' ? [5, 3] : st === 'empty' ? [1.5, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      if (activoCliente && st === 'down') {
        ctx.beginPath();
        ctx.moveTo(p.x - 3.5, p.y - 3.5);
        ctx.lineTo(p.x + 3.5, p.y + 3.5);
        ctx.moveTo(p.x + 3.5, p.y - 3.5);
        ctx.lineTo(p.x - 3.5, p.y + 3.5);
        ctx.lineWidth = 2;
        ctx.strokeStyle = col;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        if (activoCliente && st === 'empty') {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = col;
          ctx.stroke();
        } else {
          ctx.fillStyle = col;
          ctx.fill();
        }
      }

      const ang = Math.atan2(p.y - cy, p.x - cx);
      const lx = p.x + Math.cos(ang) * (p.r + 10);
      const ly = p.y + Math.sin(ang) * (p.r + 10);
      ctx.font = `${isSel ? '700' : '600'} 10.5px Inter, system-ui, sans-serif`;
      ctx.fillStyle =
        !activoCliente || st === 'locked' ? mudo : blanco;
      ctx.textAlign = Math.cos(ang) > 0.22 ? 'left' : Math.cos(ang) < -0.22 ? 'right' : 'center';
      ctx.textBaseline = 'middle';
      const sufijo = !activoCliente ? '' : st === 'empty' ? ' · ○ sin registros' : st === 'down' ? ' · ✕ no disponible' : st === 'locked' ? ' · ▲ restringido' : '';
      ctx.fillText(n.nombre + sufijo, lx, ly);
      ctx.globalAlpha = 1;
    });

    const cli = this.clienteActual();
    if (activoCliente) {
      const pulso = 34 + Math.sin(t * 2.6) * 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, pulso + 8, 0, Math.PI * 2);
      ctx.fillStyle = css(P.acento, 0.16);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = tealBase;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = activoCliente ? naranja : css(P.texto, 0.25);
    ctx.stroke();

    ctx.fillStyle = activoCliente ? blanco : mudo;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 15px Inter, system-ui, sans-serif';
    ctx.fillText(activoCliente ? cli.iniciales : '360', cx, cy - 4);
    ctx.font = '600 9.5px Inter, system-ui, sans-serif';
    ctx.fillStyle = activoCliente ? naranja : mudo;
    ctx.fillText(activoCliente ? cli.lotes.join(' · ') || 'Sin lote' : 'En espera', cx, cy + 12);

    if (activoCliente) {
      this.hitTargets.push({ kind: 'cli', x: cx, y: cy, r: 32 });
    }
    ctx.restore();
  }
}
