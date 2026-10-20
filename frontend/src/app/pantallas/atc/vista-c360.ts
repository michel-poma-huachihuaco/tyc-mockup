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
  AyDivider,
  AyFormField,
  AyGrid,
  AyGridItem,
  AyRow,
  AySearchInput,
  AySegmentedControl,
  AySelect,
  AyStack,
  AyTag,
  AyText,
  type AyOpcionSelect,
  type AySegmentoOpcion,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import { readColor, subscribeAppearance } from '@aybarcorp/tokens/apariencia';
import {
  CLIENTES_360,
  CONSULTAS_SEMANTICAS,
  FUENTES_360,
  NODOS_360,
  type Cliente360,
  type Fuente360,
  type NodoDato360,
} from './datos-atc';
import { leerTokenRgb, type RGB } from './three/comun';
import { inyectarEstilos } from './three/estilos';
import {
  montarGrafo,
  type PulsoGrafo,
  type Ref,
  type VistaGrafo,
} from './three/grafo360';

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
    moduloNombre: 'Bandeja y Avance Diario',
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
    moduloNombre: 'Bandeja y Avance Diario',
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
    AyDivider,
    AyFormField,
    AyGrid,
    AyGridItem,
    AyRow,
    AySearchInput,
    AySegmentedControl,
    AySelect,
    AyStack,
    AyTag,
    AyText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div ayStack gap="4">
      <!-- =========================================================================
           1. GRAFO 360 EN 3D Y 2D EN TIEMPO REAL + LATERAL DE INSPECCIÓN
           ========================================================================= -->
      <div ayGrid [columnas]="3" gap="md">
        <!-- Columna izquierda: Buscador + Clientes + Lienzo Grande 3D / 2D + Ficha flotante desplegable + Leyenda -->
        <div ayGridItem [span]="2">
          <ay-card>
            <ay-card-body>
              <div ayStack gap="3">
                <!-- Buscador unificado de cliente o documento por significado -->
                <div #buscador360Host ayRow gap="2" [ajuste]="true" role="search">
                  <ay-search-input
                    etiqueta="Buscar cliente o documento (DNI, lote, teléfono, sección 360 o consulta en lenguaje natural)"
                    size="sm"
                    [retardo]="0"
                    [valor]="busquedaTexto()"
                    (valorChange)="alCambiarBusqueda($event)"
                    (buscar)="ejecutarBusquedaSemantica($event)"
                    placeholder="Ej. Elena, 45892104, M-14, adenda de cambio de lote, cuotas vencidas…"
                  />
                  <ay-button tamano="sm" variante="primary" (click)="ejecutarBusquedaSemantica()">
                    Consultar
                  </ay-button>
                  <ay-segmented-control
                    etiqueta="Modo de visualización 360"
                    size="sm"
                    [opciones]="opcionesModoVista"
                    [valor]="modoRenderizado()"
                    (valorChange)="cambiarModoRenderizado($event)"
                  />
                </div>

                <!-- Clientes frecuentes + Consultas semánticas rápidas -->
                <div ayRow gap="2" [ajuste]="true" aria-label="Clientes frecuentes y búsquedas por significado">
                  <span ayText="label" size="xs">Clientes:</span>
                  @for (c of clientes; track c.k) {
                    <ay-button
                      tamano="sm"
                      [variante]="clienteKey() === c.k ? 'primary' : 'secondary'"
                      (click)="seleccionarCliente(c.k)"
                    >
                      {{ c.nombre }}
                    </ay-button>
                  }
                  <span ayText="label" size="xs">Búsqueda semántica:</span>
                  @for (cs of consultasSemanticas; track cs.q) {
                    <ay-button
                      tamano="sm"
                      variante="ghost"
                      (click)="aplicarConsultaSemantica(cs.q, cs.nodo, cs.explicacion)"
                    >
                      «{{ cs.q }}»
                    </ay-button>
                  }
                </div>

                <!-- Contenedor de escena (Grafo 3D + Grafo 2D + Ficha flotante desplegable del nodo/fuente seleccionado) -->
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
                      [attr.aria-label]="'Red de consulta 360 de ' + clienteActual().nombre + ': ' + fuentes.length + ' sistemas de origen y ' + nodos.length + ' datos.'"
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

                  <!-- Ficha flotante desplegable del nodo o sistema seleccionado con componentes del SDK -->
                  @if (fichaAbierta()) {
                    @if (fuenteInspeccionada(); as src) {
                      <div
                        class="pl-atc-ficha-flotante"
                        role="dialog"
                        aria-modal="false"
                        [attr.aria-label]="'Sistema de origen ' + src.nombre"
                      >
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
                              <ay-button
                                tamano="sm"
                                variante="ghost"
                                (click)="fichaDesplegada.set(!fichaDesplegada())"
                              >
                                {{ fichaDesplegada() ? 'Contraer' : 'Desplegar' }}
                              </ay-button>
                              <ay-button
                                tamano="sm"
                                variante="ghost"
                                aria-label="Cerrar ficha"
                                (click)="fichaAbierta.set(false)"
                              >
                                Cerrar
                              </ay-button>
                            </div>
                          </ay-card-header>

                          @if (fichaDesplegada()) {
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
                                  <ay-button
                                    tamano="sm"
                                    variante="ghost"
                                    (click)="fuenteInspeccionadaId.set(null)"
                                  >
                                    Ver nodo actual
                                  </ay-button>
                                </div>
                              </div>
                            </ay-card-body>
                          }
                        </ay-card>
                      </div>
                    } @else {
                      <div
                        class="pl-atc-ficha-flotante"
                        role="dialog"
                        aria-modal="false"
                        [attr.aria-label]="'Nodo 360 ' + nodoActual().nombre"
                      >
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
                              <ay-button
                                tamano="sm"
                                variante="ghost"
                                (click)="fichaDesplegada.set(!fichaDesplegada())"
                              >
                                {{ fichaDesplegada() ? 'Contraer' : 'Desplegar' }}
                              </ay-button>
                              <ay-button
                                tamano="sm"
                                variante="ghost"
                                aria-label="Cerrar ficha"
                                (click)="fichaAbierta.set(false)"
                              >
                                Cerrar
                              </ay-button>
                            </div>
                          </ay-card-header>

                          @if (fichaDesplegada()) {
                            <ay-card-body>
                              <div ayStack gap="3">
                                @if (estadoNodo(nodoActual()).codigo === 'locked') {
                                  <ay-alert tono="warning" titulo="Acceso restringido por perfil">
                                    Tu perfil ({{ etiquetaRolActivo() }}) no tiene acceso a este dato reservado.
                                    Cambia de perfil a Supervisor o Legal en el encabezado superior para visualizarlo.
                                  </ay-alert>
                                } @else if (estadoNodo(nodoActual()).codigo === 'down') {
                                  <ay-alert tono="danger" titulo="Fuente no disponible temporalmente">
                                    {{ nombresFuentesCaidasNodoActual() }} no responde en este instante. Las demás
                                    secciones siguen activas.
                                  </ay-alert>
                                } @else {
                                  <ay-card-pairs [pares]="paresNodo(nodoActual().id)" />

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

                                <div ayRow gap="2" [ajuste]="true">
                                  <ay-button
                                    tamano="sm"
                                    variante="primary"
                                    (click)="ejecutarRedireccionNodo(nodoActual().id)"
                                  >
                                    {{ obtenerRedireccionNodo(nodoActual().id).etiqueta }} →
                                  </ay-button>
                                  @if (obtenerRedireccionNodo(nodoActual().id).destino !== 'contrato') {
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
                                    (click)="abrirNuevoTicketCliente(clienteActual())"
                                  >
                                    + Crear ticket
                                  </ay-button>
                                </div>
                              </div>
                            </ay-card-body>
                          }
                        </ay-card>
                      </div>
                    }
                  }
                </div>

                <!-- Barra inferior de leyenda y telemetría -->
                <div ayRow gap="2" [ajuste]="true" justificar="between">
                  <div ayRow gap="2" [ajuste]="true">
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-secondary-400)">Cliente</ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-primary-500)">
                      Sistema de origen ({{ fuentes.length - fuentesCaidas().length }}/{{ fuentes.length }})
                    </ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-fg-link)">
                      Dato del cliente ({{ nodosEncendidosCount() }}/{{ nodos.length }})
                    </ay-tag>
                    <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-danger-border)">
                      Restringido / sin conexión
                    </ay-tag>
                  </div>
                  <div ayRow gap="2" [ajuste]="true">
                    <span ayText="label" size="xs" role="status" aria-live="polite">
                      {{ estadoConsultaTexto() }}
                    </span>
                    <ay-badge size="sm" tono="info">Consulta en línea (&lt; 2 s)</ay-badge>
                  </div>
                </div>
              </div>
            </ay-card-body>
          </ay-card>
        </div>

        <!-- Columna derecha: Resumen cliente + Perfil de visualización + Estado de fuentes + Selector rápido de nodos -->
        <aside ayGridItem [span]="1" ayStack gap="3" aria-label="Cliente, controles y navegación rápida">
          <!-- 1. Resumen compacto del cliente en el maestro -->
          <ay-card>
            <ay-card-header
              [titulo]="clienteActual().nombre"
              [subtitulo]="clienteActual().doc + ' · ' + clienteActual().proyecto + ' · Contrato ' + clienteActual().contratoPrincipal"
              nivel="h3"
            >
              <ay-badge ayAcciones size="sm" tono="success">Maestro SIGDA</ay-badge>
            </ay-card-header>
            <ay-card-body>
              <div ayStack gap="3">
                <div ayRow gap="2" [ajuste]="true">
                  <ay-badge size="sm" tono="neutral">Lotes {{ clienteActual().lotes.length }}</ay-badge>
                  <ay-badge size="sm" tono="neutral">Cuotas: {{ resumenDato('cuotas') }}</ay-badge>
                  <ay-badge size="sm" tono="neutral">Exposición: {{ resumenDato('expo') }}</ay-badge>
                </div>
                <div ayRow gap="2" [ajuste]="true">
                  <ay-button
                    tamano="sm"
                    variante="primary"
                    (click)="verContrato.emit(clienteActual().contratoPrincipal)"
                  >
                    Ver contrato {{ clienteActual().contratoPrincipal }}
                  </ay-button>
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    (click)="ejecutarRedireccionNodo('tick')"
                  >
                    Tickets en Bandeja
                  </ay-button>
                </div>
              </div>
            </ay-card-body>
          </ay-card>

          <!-- 2. Estado de conexión de sistemas de origen -->
          <ay-card>
            <ay-card-header
              titulo="Estado de sistemas de origen"
              subtitulo="Monitoreo de disponibilidad y continuidad por fuente"
              nivel="h3"
            />
            <ay-card-body>
              <div ayRow gap="2" [ajuste]="true">
                <ay-button
                  tamano="sm"
                  [variante]="fuentesCaidas().length === 0 ? 'primary' : 'secondary'"
                  (click)="restaurarTodasLasFuentes()"
                >
                  Todas en línea
                </ay-button>
                @for (s of fuentes; track s.id) {
                  <ay-button
                    tamano="sm"
                    [variante]="fuentesCaidas().includes(s.id) ? 'primary' : 'secondary'"
                    (click)="alternarFallaFuente(s.id)"
                  >
                    {{ s.nombre }}
                  </ay-button>
                }
              </div>
            </ay-card-body>
          </ay-card>

          <!-- 4. Navegación rápida de nodos del Grafo 360 -->
          <ay-card>
            <ay-card-header
              titulo="Nodos del Grafo 360 y Redirección"
              subtitulo="Haz clic en un nodo para inspeccionarlo o redirigir a su módulo operativo"
              nivel="h3"
            />
            <ay-card-body>
              <div ayStack gap="3">
                <div ayRow gap="2" [ajuste]="true">
                  @for (nd of nodos; track nd.id) {
                    <ay-button
                      tamano="sm"
                      [variante]="nodoSeleccionadoId() === nd.id && !fuenteInspeccionadaId() ? 'primary' : 'secondary'"
                      (click)="seleccionarNodo(nd.id)"
                    >
                      {{ nd.nombre }}
                    </ay-button>
                  }
                </div>
                <div ayRow gap="2" [ajuste]="true">
                  <ay-button
                    tamano="sm"
                    variante="secondary"
                    (click)="ejecutarRedireccionNodo(nodoActual().id)"
                  >
                    {{ obtenerRedireccionNodo(nodoActual().id).etiqueta }} →
                  </ay-button>
                  <ay-button
                    tamano="sm"
                    variante="ghost"
                    (click)="fichaAbierta.set(!fichaAbierta()); fichaDesplegada.set(true)"
                  >
                    {{ fichaAbierta() ? 'Ocultar ficha' : 'Mostrar ficha' }}
                  </ay-button>
                </div>
              </div>
            </ay-card-body>
          </ay-card>
        </aside>
      </div>

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
              Volver a ficha 360
            </ay-button>
          </div>
        </ay-alert>
      }

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
                      <ay-badge size="sm" tono="neutral">{{ cli.proyecto }} · Lote {{ cli.lotes.join(', ') }}</ay-badge>
                      <ay-badge size="sm" tono="info">Contrato {{ cli.contratoPrincipal }}</ay-badge>
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

                  <ay-button tamano="sm" variante="primary" (click)="verContrato.emit(cli.contratoPrincipal)">
                    Ver contrato {{ cli.contratoPrincipal }}
                  </ay-button>
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

      <!-- Tarjeta «Consultas rápidas» al motor de consultas en línea -->
      <ay-card>
        <ay-card-header
          titulo="Consultas rápidas en línea"
          subtitulo="Respuestas instantáneas del motor de consultas por lote y contrato."
          nivel="h3"
        >
          <div ayAcciones ayRow gap="2" [ajuste]="true">
            <ay-button tamano="sm" variante="primary" (click)="ejecutarConsultaMotor()">
              Consultar ahora
            </ay-button>
            <ay-button tamano="sm" variante="secondary" (click)="verContrato.emit(clienteActual().contratoPrincipal)">
              Abrir contrato {{ clienteActual().contratoPrincipal }}
            </ay-button>
          </div>
        </ay-card-header>
        <ay-card-body>
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
        </ay-card-body>
      </ay-card>

      <!-- Malla completa de los 16 nodos de datos del cliente con su sistema de origen y redirección -->
      <ay-card>
        <ay-card-header
          [titulo]="nodos.length + ' secciones de datos en línea de ' + clienteActual().nombre + ' (con redirección directa por nodo)'"
          subtitulo="Haz clic en cualquier tarjeta para enfocarla en el Grafo 3D o usa el botón de redirección para ir a su módulo operativo"
          nivel="h3"
        />
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
  `,
})
export class VistaC360Component {
  readonly mostrarHu = input<boolean>(false);
  readonly rolExterno = input<'gestor' | 'supervisor' | 'legal' | 'cx'>('gestor');
  readonly nodoFocoExterno = input<string>('lote');
  readonly crearTicketDesde360 = output<{ cliente: string; dni: string; proyecto: string; contingencia: boolean }>();
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
  readonly nodoSeleccionadoId = signal<string>('lote');
  readonly fuenteInspeccionadaId = signal<string | null>(null);
  readonly fichaAbierta = signal<boolean>(true);
  readonly fichaDesplegada = signal<boolean>(true);
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
  private readonly selGrafoRef: Ref<string> = { current: 'lote' };
  private readonly semGrafoRef: Ref<{ hits: unknown[] } | null> = { current: null };
  private readonly hoverGrafoRef: Ref<string | null> = { current: null };
  private readonly litGrafoRef: Ref<Set<string>> = { current: new Set<string>() };
  private readonly pulsosGrafoRef: Ref<PulsoGrafo[]> = { current: [] };
  private readonly t0GrafoRef: Ref<number> = { current: 0 };
  private readonly posGrafoRef: Ref<Record<string, { x: number; y: number; r: number }>> = { current: {} };

  private desmontarPoGrafo: (() => void) | null = null;
  private timerLlamada: ReturnType<typeof setInterval> | null = null;
  private timerConsulta: ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;
  private hitTargets: NodoCanvasPos[] = [];
  private hoverTarget: NodoCanvasPos | null = null;

  readonly clienteActual = computed<Cliente360>(
    () => this.clientes.find((c) => c.k === this.clienteKey()) ?? this.clientes[0],
  );

  readonly nodoActual = computed<NodoDato360>(
    () => this.nodos.find((n) => n.id === this.nodoSeleccionadoId()) ?? this.nodos[0],
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
      const nExt = this.nodoFocoExterno();
      this.rolActivo.set(rExt);
      if (nExt && this.nodos.some((n) => n.id === nExt)) {
        this.fuenteInspeccionadaId.set(null);
        this.nodoSeleccionadoId.set(nExt);
        this.selGrafoRef.current = nExt;
        this.fichaAbierta.set(true);
        this.fichaDesplegada.set(true);
      }
    });

    effect(() => {
      const sel = this.nodoSeleccionadoId();
      const hits = this.hitsSemanticos();

      this.selGrafoRef.current = sel;
      this.semGrafoRef.current = hits.length > 0 ? { hits: [...hits] } : null;
    });

    // Efecto para recalcular la vista del Grafo 3D y disparar la oleada de pulsos cuando cambia cliente, rol o fuentes caídas
    effect(() => {
      const cli = this.clienteActual();
      const caidas = this.fuentesCaidas();
      const rol = this.rolActivo();
      this.dispararOleadaPulsosGrafo(cli, caidas, rol);
    });

    afterNextRender(() => {
      inyectarEstilos();
      this.inicializarPoGrafo3D();
      this.iniciarLoopCanvas();
    });

    const desuscribirTema = subscribeAppearance(() => {
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

  private inicializarPoGrafo3D(): void {
    const host = this.poGrafoHostRef()?.nativeElement;
    const canvas = this.poGrafoCanvasRef()?.nativeElement;
    if (!host || !canvas) return;

    const cache = new Map<string, RGB>();
    const colorToken = (token: string): RGB => {
      const prev = cache.get(token);
      if (prev) return prev;
      const rgb = leerTokenRgb(token);
      cache.set(token, rgb);
      return rgb;
    };

    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    this.desmontarPoGrafo = montarGrafo({
      canvas,
      host,
      color: colorToken,
      reducido,
      vista: this.vistaGrafoRef,
      sel: this.selGrafoRef,
      sem: this.semGrafoRef,
      hover: this.hoverGrafoRef,
      lit: this.litGrafoRef,
      pulsos: this.pulsosGrafoRef,
      t0: this.t0GrafoRef,
      pos: this.posGrafoRef,
      alClickNodo: (id) => {
        this.seleccionarNodo(id);
      },
      alClickFuente: (id) => {
        this.inspeccionarFuente360(id);
      },
    });
  }

  private dispararOleadaPulsosGrafo(
    cli: Cliente360,
    caidas: readonly string[],
    rol: 'gestor' | 'supervisor' | 'legal' | 'cx',
  ): void {
    const rolPermiso = rol === 'cx' ? 'supervisor' : rol;
    const vista: VistaGrafo = {
      cliente: { nombre: cli.nombre },
      fuentes: this.fuentes.map((s) => ({
        id: s.id,
        n: s.nombre,
        d: s.detalle,
        caida: caidas.includes(s.id),
      })),
      nodos: this.nodos.map((n) => {
        const restringido = Boolean(n.restringidoPara?.includes(rolPermiso));
        const caido = n.fuentes.some((fid) => caidas.includes(fid));
        return {
          id: n.id,
          n: n.nombre,
          estado: restringido ? 'restringido' : caido ? 'caido' : 'ok',
          sem: n.semantico,
          fuentes: n.fuentes,
        };
      }),
    };

    this.vistaGrafoRef.current = vista;
    this.litGrafoRef.current = new Set<string>();
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
    this.fuenteInspeccionadaId.set(null);
    this.nodoSeleccionadoId.set(nodoId);
    this.selGrafoRef.current = nodoId;
    this.fichaAbierta.set(true);
    this.fichaDesplegada.set(true);
  }

  inspeccionarFuente360(fuenteId: string): void {
    this.fuenteInspeccionadaId.set(fuenteId);
    const primerNodo = this.nodos.find((n) => n.fuentes.includes(fuenteId));
    if (primerNodo) {
      this.nodoSeleccionadoId.set(primerNodo.id);
      this.selGrafoRef.current = primerNodo.id;
    }
    this.fichaAbierta.set(true);
    this.fichaDesplegada.set(true);
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
        moduloNombre: 'Bandeja y Avance Diario',
      }
    );
  }

  ejecutarRedireccionNodo(nodoId: string): void {
    const cli = this.clienteActual();
    const acc = this.obtenerRedireccionNodo(nodoId);
    if (acc.destino === 'contrato') {
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

  seleccionarCliente(k: string): void {
    if (!k) return;
    this.modoNoEncontrado.set(false);
    this.clienteKey.set(k);
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
  }

  reintentarFuentesDeNodo(n: NodoDato360): void {
    this.fuentesCaidas.update((actual) => actual.filter((fid) => !n.fuentes.includes(fid)));
  }

  alCambiarBusqueda(valor: string): void {
    this.busquedaTexto.set(valor);
    const v = valor.trim().toLowerCase();
    if (!v) {
      this.explicacionSemantica.set('');
      this.consultaSemanticaActiva.set('');
      this.hitsSemanticos.set([]);
      return;
    }
    const encontrado = this.clientes.find(
      (c) =>
        c.dni.toLowerCase().includes(v) ||
        c.doc.toLowerCase().includes(v) ||
        c.nombre.toLowerCase().includes(v) ||
        c.telefono.toLowerCase().includes(v) ||
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
    const q = raw.toLowerCase();

    if (!q) {
      this.fichaAbierta.set(true);
      this.fichaDesplegada.set(true);
      this.dispararOleadaPulsosGrafo(this.clienteActual(), this.fuentesCaidas(), this.rolActivo());
      return;
    }

    if (q.includes('99999999') || q.includes('no existe')) {
      this.activarContingenciaNoEncontrado();
      return;
    }

    const cliMatch = this.clientes.find(
      (c) =>
        c.dni.toLowerCase().includes(q) ||
        c.doc.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        c.lotes.some((l) => l.toLowerCase().includes(q)),
    );
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
      const coincideLote = cliMatch.lotes.some((l) => l.toLowerCase().includes(q));
      this.seleccionarNodo(coincideLote ? 'lote' : 'kyc');
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

  abrirNuevoTicketCliente(cli: Cliente360): void {
    this.crearTicketDesde360.emit({
      cliente: cli.nombre,
      dni: cli.dni,
      proyecto: `${cli.proyecto} · Lote ${cli.lotes[0] ?? ''}`,
      contingencia: false,
    });
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
    this.fuentesCaidas.update((actual) =>
      actual.includes(fuenteId) ? actual.filter((id) => id !== fuenteId) : [...actual, fuenteId],
    );
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
    codigo: 'ok' | 'locked' | 'down';
    tono: 'success' | 'warning' | 'danger';
    etiqueta: string;
  } {
    const rolPermiso = this.rolActivo() === 'cx' ? 'supervisor' : this.rolActivo();
    if (n.restringidoPara?.includes(rolPermiso)) {
      return { codigo: 'locked', tono: 'warning', etiqueta: 'Restringido' };
    }
    if (n.fuentes.some((fid) => this.fuentesCaidas().includes(fid))) {
      return { codigo: 'down', tono: 'danger', etiqueta: 'No disponible' };
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
    const H = canvas.clientHeight || 560;
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

    const tealOscuro = readColor('--aybar-color-primary-900') || '#012B33';
    const tealBase = readColor('--aybar-color-primary-700') || '#02424E';
    const naranja = readColor('--aybar-color-secondary-400') || '#FFA726';
    const verde = readColor('--aybar-color-success-500') || '#36A558';
    const ambar = readColor('--aybar-color-warning-500') || '#B88100';
    const rojo = readColor('--aybar-color-danger-500') || '#D63D4A';
    const blanco = readColor('--aybar-color-neutral-0') || '#FFFFFF';

    ctx.fillStyle = tealOscuro;
    ctx.fillRect(0, 0, W, H);

    const cx = W * 0.5;
    const cy = H * 0.51;
    const m = Math.min(W, H);
    const rSrc = m * 0.24;
    const rNode = m * 0.41;

    [rSrc * 0.52, rSrc, rNode].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 1 ? 'rgba(255, 167, 38, 0.20)' : 'rgba(255, 255, 255, 0.08)';
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

    const foco = this.hoverTarget;
    const selId = this.nodoSeleccionadoId();
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
          selId === n.id ||
          (foco?.kind === 'node' && foco.n?.id === n.id) ||
          (foco?.kind === 'src' && foco.s?.id === sid);
        const cpx = (sp.x + np.x) * 0.5 + (cx - (sp.x + np.x) * 0.5) * 0.18;
        const cpy = (sp.y + np.y) * 0.5 + (cy - (sp.y + np.y) * 0.5) * 0.18;

        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.quadraticCurveTo(cpx, cpy, np.x, np.y);
        ctx.strokeStyle = sDown
          ? 'rgba(214, 61, 74, 0.42)'
          : activo
            ? 'rgba(255, 167, 38, 0.90)'
            : st === 'locked'
              ? 'rgba(184, 129, 0, 0.32)'
              : 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = activo ? 2.2 : 1.1;
        ctx.stroke();

        if (!sDown && st === 'ok') {
          const u = (t * 0.42 + idx * 0.07 + j * 0.19) % 1;
          const [px, py] = bezierPt(sp.x, sp.y, cpx, cpy, np.x, np.y, u);
          ctx.beginPath();
          ctx.arc(px, py, activo ? 3.2 : 2.1, 0, Math.PI * 2);
          ctx.fillStyle = activo ? naranja : 'rgba(255, 255, 255, 0.78)';
          ctx.fill();
        }
      });
    });

    this.fuentes.forEach((s, idx) => {
      const sp = posFuentes[s.id];
      const down = caidas.includes(s.id);
      const activo = foco?.kind === 'src' && foco.s?.id === s.id;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sp.x, sp.y);
      ctx.strokeStyle = down
        ? 'rgba(214, 61, 74, 0.48)'
        : activo
          ? 'rgba(255, 167, 38, 0.85)'
          : 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = activo ? 2 : 1.15;
      ctx.stroke();

      if (!down) {
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
      this.hitTargets.push(p);
      const down = caidas.includes(s.id);
      const isHover = foco?.kind === 'src' && foco.s?.id === s.id;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + (isHover ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = down ? 'rgba(214, 61, 74, 0.28)' : 'rgba(255, 167, 38, 0.20)';
      ctx.fill();
      ctx.lineWidth = isHover ? 2.4 : 1.6;
      ctx.strokeStyle = down ? rojo : naranja;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = down ? rojo : naranja;
      ctx.fill();

      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = blanco;
      ctx.textAlign = 'center';
      ctx.fillText(s.nombre, p.x, p.y + p.r + 13);
    });

    this.nodos.forEach((n) => {
      const p = posNodos[n.id];
      this.hitTargets.push(p);
      const st = this.estadoNodo(n).codigo;
      const isSel = selId === n.id;
      const isHover = foco?.kind === 'node' && foco.n?.id === n.id;
      const col = st === 'ok' ? verde : st === 'locked' ? ambar : rojo;

      if (isSel || isHover) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 167, 38, 0.24)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? tealBase : 'rgba(2, 66, 78, 0.92)';
      ctx.fill();
      ctx.lineWidth = isSel || isHover ? 2.5 : 1.6;
      ctx.strokeStyle = isSel ? naranja : col;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      const ang = Math.atan2(p.y - cy, p.x - cx);
      const lx = p.x + Math.cos(ang) * (p.r + 10);
      const ly = p.y + Math.sin(ang) * (p.r + 10);
      ctx.font = `${isSel ? '700' : '600'} 10.5px Inter, system-ui, sans-serif`;
      ctx.fillStyle = st === 'locked' ? 'rgba(255, 255, 255, 0.60)' : blanco;
      ctx.textAlign = Math.cos(ang) > 0.22 ? 'left' : Math.cos(ang) < -0.22 ? 'right' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.nombre, lx, ly);
    });

    const cli = this.clienteActual();
    const pulso = 34 + Math.sin(t * 2.6) * 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, pulso + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 167, 38, 0.16)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = tealBase;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = naranja;
    ctx.stroke();

    ctx.fillStyle = blanco;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 15px Inter, system-ui, sans-serif';
    ctx.fillText(cli.iniciales, cx, cy - 4);
    ctx.font = '600 9.5px Inter, system-ui, sans-serif';
    ctx.fillStyle = naranja;
    ctx.fillText(cli.lotes.join(' · '), cx, cy + 12);

    this.hitTargets.push({ kind: 'cli', x: cx, y: cy, r: 32 });
    ctx.restore();
  }
}
