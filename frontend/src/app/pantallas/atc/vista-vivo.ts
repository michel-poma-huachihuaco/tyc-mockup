import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyCircularProgress,
  AyDivider,
  AyDrawer,
  AyHeading,
  AyPageHeader,
  AyProgressBar,
  AyRating,
  AyRow,
  AySegmentedControl,
  AySelect,
  AyStack,
  AyStatistic,
  AyTag,
  AyText,
  AyTimeline,
  type AyOpcionSelect,
  type AySegmentoOpcion,
  type AyTimelineEvento,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import { subscribeAppearance } from '@aybarcorp/tokens/apariencia';
import {
  PUERTAS_CANAL,
  SALAS_OFICINA,
  TIPOS_SIMULACION,
  type SalaOficina,
} from './datos-atc';
import { leerTokenRgb } from './three/comun';
import { montarVivo, type Cols, type Estatico, type Snap } from './three/vivo';

interface TicketVivo {
  id: string;
  numero: string;
  gate: string;
  type: string;
  area: string;
  cli: string;
  lote: string;
  prio: 'Normal' | 'Alta' | 'Urgente';
  rayo: boolean;
  etapa: 'bandeja' | 'cola' | 'atencion' | 'salida';
  stateRf004: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'ESCALATED' | 'REOPENED' | 'RESOLVED' | 'CLOSED';
  resp?: string;
  respNombre?: string;
  workNeed: number;
  workDone: number;
  age: number;
  slaMax: number;
  esc: boolean;
  resumen: string;
  hitos: string[];
}

interface CorreoAsignacionLog {
  readonly id: string;
  readonly hora: string;
  readonly ticketId: string;
  readonly gestor: string;
  readonly liderCopia: string;
  readonly sala: string;
  readonly slaTexto: string;
}

const CLIENTES_SIM: readonly (readonly [string, string, string])[] = [
  ['Eddie Huamaní', 'Villa Sol II · Lote C-07', 'Consulta de cupo en bus EntregaFest y pase QR'],
  ['Lucía Paredes', 'Mirador del Sur · Lote C-21', 'Inspección de fisura en muro perimétrico (Garantía)'],
  ['Jorge Ramos', 'Los Álamos I · Lote A-03', 'Reclamo por demora de minuta y suspensión de resolución'],
  ['María Quispe', 'Villa Sol II · Lote B-14', 'Validación de voucher de cuota pagada en agente BCP'],
  ['Carlos Mendoza', 'Praderas de Lurín · Lote D-09', 'Solicitud de estado de cuenta y cronograma actualizado'],
  ['Rosa Chávez', 'Oasis de Ancón · Lote E-02', 'Confirmación de asistencia familiar a EntregaFest'],
  ['Pedro Soto', 'Valle Verde · Lote A-18', 'Consulta sobre independización registral y firma'],
  ['Ana Flores', 'Bosques del Norte · Lote F-11', 'Reporte de alumbrado en vía principal del proyecto'],
];

const LIDERES_SALA: Readonly<Record<string, string>> = {
  eje1: 'Sup. Mirtha Delgado (Líder ATC)',
  cob: 'Jefe Raúl Cárdenas (Líder Cobranza)',
  libro: 'Dra. Patricia Vílchez (Oficial Cumplimiento)',
  legal: 'Dr. Ernesto Alarcón (Gerencia Legal Eje 3)',
  post: 'Ing. Roberto Castañeda (Jefe Postventa)',
  proy: 'Arq. Claudia Mendoza (Responsable Proyecto)',
};

const TOKEN_ZONA: Readonly<Record<string, string>> = {
  eje1: 'primary-400',
  cob: 'primary-700',
  libro: 'secondary-500',
  legal: 'feedback-danger-border',
  post: 'feedback-success-border',
  proy: 'secondary-700',
};

const TOKEN_CANAL: Readonly<Record<string, string>> = {
  tel: 'primary-600',
  wa: 'feedback-success-border',
  mail: 'primary-500',
  portal: 'primary-700',
  form: 'secondary-600',
};

interface MetaEstacionVivo {
  readonly clave: string;
  readonly categoria: 'Canal de entrada' | 'Orquestación' | 'Área operativa' | 'Escalamiento' | 'Cierre y CX';
  readonly nombre: string;
  readonly hu: string;
  readonly rfRn: string;
  readonly entidad: string;
  readonly lider: string;
  readonly slaRegla: string;
  readonly inputsReales: string;
  readonly areaKey?: string;
  readonly gateKey?: string;
}

const META_ESTACIONES_VIVO: Readonly<Record<string, MetaEstacionVivo>> = {
  'canal:tel': {
    clave: 'canal:tel',
    categoria: 'Canal de entrada',
    nombre: 'Call Center / Teléfono (CTI)',
    hu: 'Identificación automática y grabación',
    rfRn: 'Enlace telefónico CTI con apertura de ticket por consulta',
    entidad: 'Central Telefónica CTI',
    lider: 'Sup. Mirtha Delgado (Líder ATC)',
    slaRegla: 'Identificación automática por número o DNI y grabación vinculada al ticket.',
    inputsReales: 'Teléfono entrante (ANI), DNI/CE, motivo tipificado, grabación de llamada y casillero único por consulta.',
    gateKey: 'tel',
  },
  'canal:wa': {
    clave: 'canal:wa',
    categoria: 'Canal de entrada',
    nombre: 'WhatsApp Corporativo',
    hu: 'Mensajería verificada multicanal',
    rfRn: 'Apertura de casillero independiente por consulta',
    entidad: 'Canal WhatsApp Oficial',
    lider: 'Sup. Mirtha Delgado (Líder ATC)',
    slaRegla: '1 casillero (ticket) por cada consulta distinta del cliente.',
    inputsReales: 'Número WhatsApp verificado, texto/audios/fotos de sustento, lote asociado y consentimiento.',
    gateKey: 'wa',
  },
  'canal:mail': {
    clave: 'canal:mail',
    categoria: 'Canal de entrada',
    nombre: 'Correo Electrónico ATC',
    hu: 'Buzón corporativo con acuse',
    rfRn: 'Notificación automática al cliente y al líder de área',
    entidad: 'Buzón Digital ATC',
    lider: 'Sup. Mirtha Delgado (Líder ATC)',
    slaRegla: 'Acuse automático con código de seguimiento y alerta por correo en cada asignación.',
    inputsReales: 'Remitente, asunto, cuerpo del mensaje, adjuntos PDF/imagen y vínculo con contrato/lote.',
    gateKey: 'mail',
  },
  'canal:portal': {
    clave: 'canal:portal',
    categoria: 'Canal de entrada',
    nombre: 'Mi Portal (Autogestión Cliente)',
    hu: 'Seguimiento en vivo y conformidad',
    rfRn: 'Confirmación del titular para cierre definitivo',
    entidad: 'Portal del Propietario',
    lider: 'Coordinación CX / Mi Portal',
    slaRegla: 'El cliente ve el estado en vivo y confirma la solución para cerrar el ticket.',
    inputsReales: 'Sesión autenticada del titular en Mi Portal, lote seleccionado, tipo de solicitud y adjuntos.',
    gateKey: 'portal',
  },
  'canal:form': {
    clave: 'canal:form',
    categoria: 'Canal de entrada',
    nombre: 'Formulario QR / Pórtico de Obra',
    hu: 'Control de visitas y pre-tickets en campo',
    rfRn: 'Registro rápido en pórtico y captura de evidencias',
    entidad: 'Control de Accesos Obra',
    lider: 'Arq. Claudia Mendoza (Responsable Proyecto)',
    slaRegla: 'Registro rápido de ingreso a proyecto en pórtico y derivación directa a obra.',
    inputsReales: 'DNI visitante/propietario, manzana-lote, placa de vehículo, motivo de visita a obra y pase QR.',
    gateKey: 'form',
  },
  'etapa:bandeja': {
    clave: 'etapa:bandeja',
    categoria: 'Orquestación',
    nombre: 'Bandeja Orquestadora Central (Robot Despachador)',
    hu: 'Despacho inteligente por prioridad y carga',
    rfRn: 'Tope máximo de 10% de cola con prioridad Rayo',
    entidad: 'Motor de Despacho ATC',
    lider: 'Sup. Mirtha Delgado (Supervisión Orquestación)',
    slaRegla: 'Orden estricto: 1.º Rayo (máx. 10% de cola) · 2.º SLA más próximo a vencer · 3.º Prioridad · Menor carga.',
    inputsReales: 'Tipificación en 5 familias, prioridad, marca Rayo con motivo obligatorio, carga por gestor y correo CC al líder.',
  },
  'sala:eje1': {
    clave: 'sala:eje1',
    categoria: 'Área operativa',
    nombre: 'Atención Eje 1 (ATC General)',
    hu: 'Consultas generales, pedidos y primera línea',
    rfRn: 'Base de conocimiento y casillero único por consulta',
    entidad: 'Área Atención Eje 1',
    lider: LIDERES_SALA['eje1'],
    slaRegla: '1.ª respuesta ≤ 2 h hábiles · Resolución consultas/pedidos simples ≤ 24 h hábiles.',
    inputsReales: 'Consultas generales, pedidos simples, guía de solución recomendada y casillero independiente por consulta.',
    areaKey: 'eje1',
  },
  'sala:cob': {
    clave: 'sala:cob',
    categoria: 'Área operativa',
    nombre: 'Cobranza (Eje 2 · Financiamiento y Letras)',
    hu: 'Validación de abonos, letras y prevención de mora',
    rfRn: 'Sincronización con Motor de Cobranza y control de resolución',
    entidad: 'Área de Cobranza y Cartera',
    lider: LIDERES_SALA['cob'],
    slaRegla: 'Validación de abonos ≤ 24 h · Alerta automática al cumplir 3 meses de letras impagas.',
    inputsReales: 'Vouchers de pago, cronograma de letras, estado de cartera en línea, carta de resolución y alerta paralela de cancelación.',
    areaKey: 'cob',
  },
  'sala:libro': {
    clave: 'sala:libro',
    categoria: 'Área operativa',
    nombre: 'Libro de Reclamaciones (INDECOPI)',
    hu: 'Gestión legal de quejas y reclamos de consumo',
    rfRn: 'Plazo legal Ley 29571 con control de prórroga y cargo',
    entidad: 'Oficialía de Cumplimiento',
    lider: LIDERES_SALA['libro'],
    slaRegla: 'Plazo legal improrrogable de 15 días hábiles (Ley 29571) con 1 sola prórroga motivada.',
    inputsReales: 'Asiento correlativo (Queja / Reclamo), pedido concreto del consumidor, cargo de notificación al cliente, control de huérfanos y expediente INDECOPI.',
    areaKey: 'libro',
  },
  'sala:legal': {
    clave: 'sala:legal',
    categoria: 'Área operativa',
    nombre: 'Legal · Eje 3 (Handoff y Custodia)',
    hu: 'Dictamen jurídico y custodia probatoria',
    rfRn: 'Validación obligatoria de checklist documental 6/6',
    entidad: 'Gerencia Legal Eje 3',
    lider: LIDERES_SALA['legal'],
    slaRegla: 'No acepta derivación sin paquete documental completo 6/6 validado.',
    inputsReales: 'Checklist 6/6 (contrato, estado de cuenta, cartas previas, evidencias, hoja de ruta y dictamen), resolución legal y custodia probatoria inmutable.',
    areaKey: 'legal',
  },
  'sala:post': {
    clave: 'sala:post',
    categoria: 'Área operativa',
    nombre: 'Postventa (Eje 4 · Garantías e Inspección)',
    hu: 'Cobertura de garantías, visitas técnicas y cuadrillas',
    rfRn: 'Matriz de vigencia en meses desde el Acta de Entrega',
    entidad: 'Ingeniería de Postventa',
    lider: LIDERES_SALA['post'],
    slaRegla: 'Vigencia calculada en meses desde el Acta de Entrega · Inspección de campo y control de reincidencia.',
    inputsReales: 'Fecha de acta de entrega, partida observada (infraestructura/acabados), vigencia en meses, informe de visita técnica, presupuesto y acta de conformidad.',
    areaKey: 'post',
  },
  'sala:proy': {
    clave: 'sala:proy',
    categoria: 'Área operativa',
    nombre: 'Proyecto · Entrega Fest (Administración / Obra)',
    hu: 'Visitas a proyecto y logística de eventos de entrega',
    rfRn: 'Control de cupos por bus, asistencia QR y encuestas',
    entidad: 'Administración de Proyectos',
    lider: LIDERES_SALA['proy'],
    slaRegla: 'Control de aforo por bus y bloqueo automático de sobrecupo en EntregaFest.',
    inputsReales: 'Formulario de ingreso a proyecto (DNI, lote, motivo, fecha/hora) y padrón de buses, asientos y pases QR de EntregaFest.',
    areaKey: 'proy',
  },
  'etapa:comite': {
    clave: 'etapa:comite',
    categoria: 'Escalamiento',
    nombre: 'Comité (Mesa SGD · Casos Complejos y Vencidos)',
    hu: 'Escalamiento automático y acuerdos multidisciplinarios',
    rfRn: 'Matriz objetiva de riesgo y trazabilidad de acuerdos',
    entidad: 'Mesa de Comité SGD',
    lider: 'Comité Multidisciplinario SGD (ATC + Legal + Cobranza + Proyectos)',
    slaRegla: 'Todo ticket cuyo SLA vence escala automáticamente en cadena (Gestor · Supervisor · Jefe · Comité SGD).',
    inputsReales: 'Registro multilínea por lote/contrato, matriz objetiva de riesgo, acuerdos de comité con responsables y casos cruzados.',
  },
  'etapa:salida': {
    clave: 'etapa:salida',
    categoria: 'Cierre y CX',
    nombre: 'Cierre en Mi Portal + Encuesta CSAT / CES / NPS',
    hu: 'Conformidad del propietario y medición de satisfacción',
    rfRn: 'Doble paso Resuelto a Cerrado y alerta de detractores',
    entidad: 'Experiencia del Cliente (CX)',
    lider: 'Coordinación CX / Calidad de Atención',
    slaRegla: 'Un ticket resuelto solo pasa a cerrado cuando el cliente confirma en Mi Portal o vence la ventana de conformidad; dispara encuesta CSAT/CES/NPS.',
    inputsReales: 'Evidencia de solución cargada por el gestor, confirmación del cliente en Mi Portal, calificación CSAT (1-5), CES y NPS (-100 a +100) y alerta de detractor.',
  },
};

@Component({
  selector: 'app-vista-vivo',
  standalone: true,
  imports: [
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCircularProgress,
    AyDivider,
    AyDrawer,
    AyHeading,
    AyPageHeader,
    AyProgressBar,
    AyRating,
    AyRow,
    AySegmentedControl,
    AySelect,
    AyStack,
    AyStatistic,
    AyTag,
    AyText,
    AyTimeline,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div ayStack gap="6" aria-label="Panel unificado de Operación en Vivo">
      <ay-page-header
        titulo="Operación en Vivo"
        descripcion="Los tickets entran por cada canal, la bandeja orquestadora los ordena y los asigna por carga, y cada área los atiende. Toca un ticket para seguirlo."
      >
        <ay-button
          ayAcciones
          tamano="sm"
          variante="primary"
          (click)="inyectarTicketCustomizado()"
        >
          + Ticket
        </ay-button>
        <ay-button
          ayAcciones
          tamano="sm"
          [variante]="cajonLateralAbierto() ? 'primary' : 'secondary'"
          (click)="cajonLateralAbierto.set(!cajonLateralAbierto())"
        >
          {{
            cajonLateralAbierto()
              ? 'Cerrar bandejas'
              : 'Bandejas (' + ticketsFiltradosBandeja().length + ')'
          }}
        </ay-button>
      </ay-page-header>

      <!-- 1. 5 KPIs en vivo -->
      <div ayStack gap="3">
        <!-- 5 KPIs principales con componentes del SDK -->
        <div class="pl-atc-grid-kpis">
          <ay-card variante="default">
            <ay-card-body padding="sm">
              <div ayStack gap="2">
                <ay-statistic
                  etiqueta="Tickets activos"
                  [valor]="activosEnCursoCount()"
                  size="sm"
                />
                <ay-badge size="sm" [tono]="enRiesgoCount() > 0 ? 'warning' : 'success'">
                  {{ enRiesgoCount() > 0 ? enRiesgoCount() + ' en riesgo' : 'Sin riesgos' }}
                </ay-badge>
              </div>
            </ay-card-body>
          </ay-card>

          <ay-card variante="default">
            <ay-card-body padding="sm">
              <div ayRow gap="3">
                <ay-circular-progress
                  etiqueta="Resueltos en SLA"
                  [valor]="pctCumplimientoSla()"
                  size="md"
                  [tono]="pctCumplimientoSla() >= 90 ? 'success' : 'warning'"
                />
                <div ayStack gap="1">
                  <ay-statistic
                    etiqueta="Resueltos en SLA"
                    [valor]="pctCumplimientoSla()"
                    unidad="%"
                    size="sm"
                  />
                  <span ayText="subtitle" size="xs">
                    {{ cerradosEnSlaHoy() }} de {{ cerradosHoy() }} (Meta 90%)
                  </span>
                </div>
              </div>
            </ay-card-body>
          </ay-card>

          <ay-card variante="default">
            <ay-card-body padding="sm">
              <div ayStack gap="2">
                <ay-statistic
                  etiqueta="CSAT del día"
                  [valor]="csatPromedio().toFixed(1)"
                  unidad="/ 5"
                  size="sm"
                />
                <ay-rating
                  etiqueta="Satisfacción CSAT"
                  [valor]="csatPromedio()"
                  [mediosPuntos]="true"
                  [recuento]="csatRespuestas()"
                  [soloLectura]="true"
                  size="sm"
                />
              </div>
            </ay-card-body>
          </ay-card>

          <ay-card variante="default">
            <ay-card-body padding="sm">
              <div ayStack gap="2">
                <div ayRow gap="2" justificar="between">
                  <ay-statistic
                    [etiqueta]="'Nivel ' + nivelEquipo() + ' del equipo'"
                    [valor]="xpEquipo()"
                    [unidad]="'/ ' + metaXpNivel + ' XP'"
                    size="sm"
                  />
                  <ay-badge size="sm" tono="info">Racha {{ rachaSla() }}</ay-badge>
                </div>
                <ay-progress-bar
                  etiqueta="Experiencia del equipo"
                  [etiquetaOculta]="true"
                  [valor]="pctXpEquipo()"
                  [detalle]="'Faltan ' + (metaXpNivel - xpEquipo()) + ' XP'"
                  size="sm"
                  tono="brand"
                />
              </div>
            </ay-card-body>
          </ay-card>

          <ay-card variante="default">
            <ay-card-body padding="sm">
              <div ayStack gap="2">
                <ay-statistic
                  etiqueta="NPS del turno"
                  [valor]="(npsPreliminarValor() > 0 ? '+' : '') + npsPreliminarValor()"
                  size="sm"
                />
                <ay-badge size="sm" [tono]="npsPreliminarValor() >= 30 ? 'success' : 'warning'">
                  Encuestas n={{ csatRespuestas() }}
                </ay-badge>
              </div>
            </ay-card-body>
          </ay-card>
        </div>
      </div>

      <!-- 2. Distribución en tiempo real por los 7 estados (título fuera del componente) -->
      <div ayStack gap="2">
        <div ayRow gap="2" justificar="between" [ajuste]="true">
          <div ayStack gap="1">
            <ay-heading [nivel]="2" size="sm">Tickets por estado (RF-SVC-004)</ay-heading>
            <span ayText="subtitle" size="xs">
              Distribución en tiempo real: Abierto, En curso, Espera cliente, Escalado, Reabierto, Resuelto y Cerrado
            </span>
          </div>
          <ay-badge size="sm" tono="neutral">{{ totalEstadosCount() }} en total</ay-badge>
        </div>
        <ay-card variante="default">
          <ay-card-body padding="sm">
            <div class="pl-atc-grid-estados">
              @for (est of estadosResumen(); track est.id) {
                <ay-card variante="default">
                  <ay-card-body padding="sm">
                    <div ayStack gap="1">
                      <div ayRow gap="2" justificar="between">
                        <span ayText="label" size="xs">{{ est.n }}</span>
                        <ay-badge size="sm" [tono]="est.tono">{{ est.v }}</ay-badge>
                      </div>
                      <ay-progress-bar
                        [etiqueta]="est.n"
                        [etiquetaOculta]="true"
                        [valor]="est.pct"
                        [tono]="est.tonoBarra"
                        size="sm"
                      />
                    </div>
                  </ay-card-body>
                </ay-card>
              }
            </div>
          </ay-card-body>
        </ay-card>
      </div>

      <!-- 3. Cuerpo del escenario 3D (título fuera del componente) -->
      <div ayStack gap="2">
        <div ayRow gap="2" justificar="between" [ajuste]="true">
          <div ayStack gap="1">
            <ay-heading [nivel]="2" size="sm">
              Planta de Atención en Vivo · Robot Orquestador · 6 Salas · Comité SGD · Cierre en Mi Portal
            </ay-heading>
            <span ayText="subtitle" size="xs">
              Haz clic en cualquier tarjeta 3D, canal o sala para inspeccionar su detalle en tiempo real o abre el cajón de bandejas.
            </span>
          </div>
          <div ayRow gap="2" [ajuste]="true">
            <ay-badge size="sm" tono="success">{{ cerradosHoy() }} resueltos hoy</ay-badge>
            <ay-badge size="sm" tono="warning">{{ conRayoCount() }} con Rayo</ay-badge>
            <ay-badge size="sm" [tono]="escaladosCount() > 0 ? 'danger' : 'neutral'">
              {{ escaladosCount() }} en Comité SGD
            </ay-badge>
          </div>
        </div>
        <ay-card>
          <ay-card-body>
          <div ayStack gap="3">
            <!-- Barra de Simulación y Customización de Entradas -->
            <div ayRow gap="3" justificar="between" alinear="center" [ajuste]="true">
              <div ayRow gap="2" alinear="center" [ajuste]="true">
                <ay-button tamano="sm" variante="secondary" (click)="alternarPausa()">
                  {{ enEjecucion() ? 'Pausa' : 'Reanudar' }}
                </ay-button>
                <ay-segmented-control
                  etiqueta="Velocidad de planta"
                  size="sm"
                  [opciones]="opcionesVelocidad"
                  [valor]="velocidadStr()"
                  (valorChange)="cambiarVelocidad($event)"
                />
              </div>

              <div ayRow gap="2" alinear="center" [ajuste]="true">
                <div class="pl-atc-vivo-select">
                  <ay-select
                    size="sm"
                    [opciones]="opcionesCanalesSelect"
                    [valor]="canalEntradaCustom()"
                    (valorChange)="canalEntradaCustom.set($event)"
                  />
                </div>
                <div class="pl-atc-vivo-select">
                  <ay-select
                    size="sm"
                    [opciones]="opcionesSalasSelect"
                    [valor]="areaFiltro()"
                    (valorChange)="areaFiltro.set($event)"
                  />
                </div>
                <ay-button
                  tamano="sm"
                  [variante]="rayoEntradaCustom() ? 'primary' : 'secondary'"
                  (click)="rayoEntradaCustom.set(!rayoEntradaCustom())"
                >
                  ⚡ {{ rayoEntradaCustom() ? 'Con Rayo' : 'Rayo' }}
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="primary"
                  (click)="inyectarTicketCustomizado()"
                >
                  + Ticket
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="ghost"
                  (click)="simularPicoMasivo()"
                >
                  Pico +5
                </ay-button>
              </div>
            </div>

            <!-- Lienzo 3D + Ficha flotante del ticket -->
            <div #stageHost class="atc-vivo-stage-area">
              <canvas #threeCanvas style="display: block; width: 100%; cursor: pointer;"></canvas>

              <!-- Ficha flotante del ticket seleccionado dentro de la escena 3D (lado izquierdo) -->
              @if (ticketSeleccionado(); as tk) {
                <div
                  class="pl-atc-ficha-flotante pl-atc-ficha-flotante--abierta pl-atc-ficha-flotante--izq"
                  role="dialog"
                  aria-modal="false"
                  aria-label="Ficha del ticket en escena 3D"
                >
                  <ay-card>
                    <ay-card-header
                      [titulo]="tk.numero"
                      [subtitulo]="tk.resumen"
                      nivel="h3"
                    >
                      <div ayAcciones ayRow gap="2" [ajuste]="true">
                        <ay-badge size="sm" [tono]="tk.rayo ? 'warning' : 'info'">
                          {{ tk.rayo ? 'Prioridad Rayo' : tk.prio }}
                        </ay-badge>
                        <ay-badge size="sm" [tono]="tonoSlaBadge(tk)">
                          {{ etiquetaSlaTicket(tk) }}
                        </ay-badge>
                        <ay-button
                          tamano="sm"
                          variante="ghost"
                          aria-label="Cerrar ficha"
                          (click)="ticketSeleccionadoId.set(null)"
                        >
                          Cerrar
                        </ay-button>
                      </div>
                    </ay-card-header>
                    <ay-card-body>
                      <div ayStack gap="3">
                        <ay-progress-bar
                          etiqueta="SLA restante en turno"
                          [valor]="pctSlaRestante(tk)"
                          [detalle]="pctSlaRestante(tk) + '% restante'"
                          [tono]="tonoSlaBarra(tk)"
                          size="sm"
                        />
                        <ay-card-pairs [pares]="paresTicketVivo(tk)" />
                        <div ayStack gap="1">
                          <span ayText="label" size="xs">Recorrido en tiempo real</span>
                          <ay-timeline
                            etiqueta="Recorrido del ticket en planta"
                            [hitos]="hitosTicketVivo(tk)"
                          />
                        </div>
                        <ay-divider espaciado="sm" />
                        <div ayRow gap="2" [ajuste]="true">
                          <ay-button tamano="sm" variante="secondary" (click)="alternarRayoTicket(tk.id)">
                            ⚡ {{ tk.rayo ? 'Quitar Rayo' : 'Prioridad Rayo' }}
                          </ay-button>
                          @if (!tk.esc) {
                            <ay-button tamano="sm" variante="danger" (click)="escalarTicketAComite(tk.id)">
                              Escalar a Comité SGD
                            </ay-button>
                          }
                          <ay-button tamano="sm" variante="primary" (click)="resolverTicketInmediato(tk.id)">
                            Resolver a Mi Portal
                          </ay-button>
                          <ay-button tamano="sm" variante="ghost" (click)="reasignarMenorCarga(tk.id)">
                            Reasignar gestor
                          </ay-button>
                          <ay-button tamano="sm" variante="ghost" (click)="seleccionarTicket.emit(tk.numero)">
                            Ver expediente
                          </ay-button>
                        </div>
                      </div>
                    </ay-card-body>
                  </ay-card>
                </div>
              }
            </div>

            <!-- Leyenda de escena 3D con componentes del SDK -->
            <div ayRow gap="2" [ajuste]="true">
              <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-success-border)">
                LED verde: En plazo SLA
              </ay-tag>
              <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-warning-border)">
                LED ámbar pulsante: SLA en riesgo (&lt;25%)
              </ay-tag>
              <ay-tag variante="outline" colorPunto="var(--aybar-color-feedback-danger-border)">
                LED rojo / Comité SGD: SLA vencido
              </ay-tag>
              <ay-tag variante="outline" colorPunto="var(--aybar-color-secondary-400)">
                Relámpago 3D giratorio: Prioridad Rayo
              </ay-tag>
              <ay-tag variante="outline" colorPunto="var(--aybar-color-primary-500)">
                Robot Orquestador: Despacho automático por carga
              </ay-tag>
            </div>
          </div>
          </ay-card-body>
        </ay-card>
      </div>

      <!-- 3. Cajón lateral de bandejas operativas con <ay-drawer> del SDK -->
      <ay-drawer
        [(abierto)]="cajonLateralAbierto"
        [modal]="false"
        lado="end"
        size="lg"
        titulo="Bandejas, Estación 3D y Correos CC"
      >
        <div ayStack gap="3">
          <ay-segmented-control
            etiqueta="Vista del cajón"
            size="sm"
            [opciones]="opcionesVistaCajon"
            [valor]="vistaCajon()"
            (valorChange)="cambiarVistaCajon($event)"
          />

          <!-- Bandeja 1: Bandeja Orquestadora y Salas -->
          @if (vistaCajon() === 'todo' || vistaCajon() === 'bandeja') {
            <ay-card>
              <ay-card-header
                [titulo]="'Bandeja Orquestadora y Salas (' + ticketsFiltradosBandeja().length + ')'"
                subtitulo="Orden: Rayo · SLA · Menor carga (clic para abrir ficha en escena)"
                nivel="h3"
              >
                <div ayAcciones ayRow gap="2" [ajuste]="true">
                  <ay-badge size="sm" tono="info">
                    {{ areaFiltro() ? nombreSala(areaFiltro()) : 'Todas las salas' }}
                  </ay-badge>
                  <ay-button tamano="sm" variante="ghost" (click)="irABandeja.emit()">
                    Ir a Bandeja
                  </ay-button>
                </div>
              </ay-card-header>
              <ay-card-body>
                <div ayStack gap="2">
                  @for (tk of ticketsFiltradosBandeja(); track tk.id) {
                    <ay-card
                      variante="selectable"
                      [seleccionada]="ticketSeleccionadoId() === tk.id"
                      (click)="ticketSeleccionadoId.set(tk.id)"
                    >
                      <ay-card-body padding="sm">
                        <div ayStack gap="1">
                          <div ayRow gap="2" [ajuste]="true" justificar="between">
                            <div ayRow gap="2" [ajuste]="true">
                              <strong ayText="mono" size="xs">{{ tk.numero }}</strong>
                              @if (tk.rayo) {
                                <ay-badge size="sm" tono="warning">RAYO</ay-badge>
                              }
                              <span ayText="subtitle" size="xs">{{ tk.cli }}</span>
                            </div>
                            <ay-badge
                              size="sm"
                              [tono]="tk.esc ? 'danger' : pctSlaRestante(tk) < 25 ? 'warning' : 'success'"
                            >
                              {{ tk.esc ? 'Comité SGD' : pctSlaRestante(tk) + '% SLA' }}
                            </ay-badge>
                          </div>
                          <div ayRow gap="2" [ajuste]="true" justificar="between">
                            <span ayText="subtitle" size="xs">
                              {{ nombreTipoSim(tk.type) }} · {{ nombreSala(tk.area) }} ({{ etiquetaEtapa(tk.etapa) }})
                            </span>
                            <div ayRow gap="1" [ajuste]="true">
                              <ay-button
                                tamano="sm"
                                variante="ghost"
                                (click)="$event.stopPropagation(); alternarRayoTicket(tk.id)"
                              >
                                ⚡ {{ tk.rayo ? 'Quitar Rayo' : 'Rayo' }}
                              </ay-button>
                              @if (!tk.esc) {
                                <ay-button
                                  tamano="sm"
                                  variante="danger"
                                  (click)="$event.stopPropagation(); escalarTicketAComite(tk.id)"
                                >
                                  Comité SGD
                                </ay-button>
                              }
                            </div>
                          </div>
                        </div>
                      </ay-card-body>
                    </ay-card>
                  }
                </div>
              </ay-card-body>
            </ay-card>
          }

          <!-- Bandeja 2: Inspector de Estación / Sala / Canal 3D Seleccionado -->
          @if ((vistaCajon() === 'todo' || vistaCajon() === 'estacion') && estacionActual(); as est) {
            <ay-card>
              <ay-card-header
                [titulo]="est.nombre"
                [subtitulo]="est.categoria + ' · ' + est.hu"
                nivel="h3"
              >
                <ay-badge ayAcciones size="sm" tono="info">{{ est.entidad }}</ay-badge>
              </ay-card-header>
              <ay-card-body>
                <div ayStack gap="3">
                  <ay-card-pairs [pares]="paresEstacionVivo(est)" />

                  <div ayRow gap="2" [ajuste]="true">
                    @if (est.gateKey) {
                      <ay-button
                        tamano="sm"
                        variante="primary"
                        (click)="inyectarTicket({ gate: est.gateKey, rayo: false })"
                      >
                        + Ingresar por {{ nombreCanal(est.gateKey) }}
                      </ay-button>
                      <ay-button
                        tamano="sm"
                        variante="secondary"
                        (click)="inyectarTicket({ gate: est.gateKey, rayo: true })"
                      >
                        Ingresar con Rayo
                      </ay-button>
                    }
                    @if (est.areaKey) {
                      <ay-button
                        tamano="sm"
                        variante="primary"
                        (click)="inyectarTicketEnSala(est.areaKey, false)"
                      >
                        + Ticket hacia {{ nombreSala(est.areaKey) }}
                      </ay-button>
                      <ay-button
                        tamano="sm"
                        variante="secondary"
                        (click)="inyectarTicketEnSala(est.areaKey, true)"
                      >
                        Con Rayo a esta sala
                      </ay-button>
                      @if (areaFiltro() === est.areaKey) {
                        <ay-button tamano="sm" variante="ghost" (click)="areaFiltro.set('')">
                          Ver todas las salas
                        </ay-button>
                      }
                    }
                    @if (est.clave === 'etapa:comite') {
                      <ay-button tamano="sm" variante="danger" (click)="forzarVencimientoSla()">
                        Escalar caso a Comité SGD
                      </ay-button>
                    }
                  </div>
                </div>
              </ay-card-body>
            </ay-card>
          }

          <!-- Bandeja 3: Alertas de correo de asignación con copia al líder -->
          @if (vistaCajon() === 'todo' || vistaCajon() === 'correos') {
            <ay-card>
              <ay-card-header
                titulo="Correos de asignación (CC Líder de Área)"
                subtitulo="Notificación automática en cada despacho"
                nivel="h3"
              >
                <ay-badge ayAcciones size="sm" tono="info">{{ correosEnviados().length }} recientes</ay-badge>
              </ay-card-header>
              <ay-card-body>
                <ay-timeline
                  etiqueta="Correos de asignación enviados"
                  [hitos]="hitosCorreosEnviados()"
                />
              </ay-card-body>
            </ay-card>
          }
        </div>
      </ay-drawer>
    </div>
  `,
})
export class VistaVivoComponent {
  readonly mostrarHu = input<boolean>(false);
  readonly seleccionarTicket = output<string>();
  readonly irABandeja = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly stageHostRef = viewChild<ElementRef<HTMLDivElement>>('stageHost');
  private readonly threeCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('threeCanvas');

  readonly puertas = PUERTAS_CANAL;
  readonly salas = SALAS_OFICINA;
  readonly metaXpNivel = 150;

  readonly opcionesVelocidad: AySegmentoOpcion[] = [
    { valor: '1', etiqueta: '1× Normal' },
    { valor: '2', etiqueta: '2× Rápido' },
    { valor: '4', etiqueta: '4× Turbo' },
  ];

  readonly opcionesVistaCajon: AySegmentoOpcion[] = [
    { valor: 'todo', etiqueta: 'Todas' },
    { valor: 'bandeja', etiqueta: 'Bandeja' },
    { valor: 'estacion', etiqueta: 'Estación' },
    { valor: 'correos', etiqueta: 'Correos CC' },
  ];

  readonly opcionesSalasSelect: AyOpcionSelect[] = [
    { value: '', label: 'Todas las salas (6 áreas)' },
    ...SALAS_OFICINA.map((s) => ({ value: s.k, label: s.nombre })),
  ];

  readonly opcionesCanalesSelect: AyOpcionSelect[] = [
    { value: '', label: 'Todos los canales (5)' },
    ...PUERTAS_CANAL.map((p) => ({ value: p.k, label: `${p.nombre} (${p.ic})` })),
  ];

  readonly enEjecucion = signal<boolean>(true);
  readonly velocidad = signal<number>(1);
  readonly velocidadStr = computed(() => String(this.velocidad()));
  readonly cajonLateralAbierto = signal<boolean>(false);
  readonly vistaCajon = signal<'todo' | 'bandeja' | 'estacion' | 'correos'>('todo');
  readonly areaFiltro = signal<string>('');
  readonly canalEntradaCustom = signal<string>('');
  readonly rayoEntradaCustom = signal<boolean>(false);
  readonly estacionSeleccionadaKey = signal<string>('etapa:bandeja');
  readonly ticketSeleccionadoId = signal<string | null>(null);

  readonly cerradosHoy = signal<number>(38);
  readonly cerradosEnSlaHoy = signal<number>(35);
  readonly escaladosCount = signal<number>(2);
  readonly reabiertosHoy = signal<number>(1);
  readonly xpEquipo = signal<number>(115);
  readonly nivelEquipo = signal<number>(4);
  readonly rachaSla = signal<number>(11);
  readonly csatPromedio = signal<number>(4.8);
  readonly csatRespuestas = signal<number>(29);

  readonly ticketsActivos = signal<TicketVivo[]>([]);
  readonly correosEnviados = signal<CorreoAsignacionLog[]>([
    {
      id: 'MAIL-01',
      hora: '10:28:14',
      ticketId: 'AIN-000201',
      gestor: 'Ana P. (Atención Eje 1)',
      liderCopia: LIDERES_SALA['eje1'],
      sala: 'Atención Eje 1',
      slaTexto: 'SLA 1.ª resp: 2 h hábiles',
    },
    {
      id: 'MAIL-02',
      hora: '10:29:02',
      ticketId: 'AIN-000202',
      gestor: 'Carla V. (Cobranza)',
      liderCopia: LIDERES_SALA['cob'],
      sala: 'Cobranza',
      slaTexto: 'Prioridad Rayo · SLA resolución: 24 h',
    },
  ]);

  private desmontarVivo: (() => void) | null = null;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private seqId = 200;
  private spawnTimer = 0;
  private readonly hitsRef: { current: { id: string; x: number; y: number }[] } = { current: [] };

  private readonly ocupacionEscritorios: Record<
    string,
    { id: string; nombre: string; ticketId: string | null; atendidos: number }[]
  > = {};

  readonly conRayoCount = computed(() => this.ticketsActivos().filter((t) => t.rayo).length);

  readonly activosEnCursoCount = computed(
    () => this.ticketsActivos().filter((t) => t.etapa !== 'salida').length,
  );

  readonly enRiesgoCount = computed(
    () =>
      this.ticketsActivos().filter(
        (t) => t.etapa !== 'salida' && (t.esc || (t.slaMax - t.age) / t.slaMax < 0.25),
      ).length,
  );

  readonly pctCumplimientoSla = computed(() => {
    const res = this.cerradosHoy();
    const enSla = Math.min(res, this.cerradosEnSlaHoy());
    return res > 0 ? Math.round((enSla / res) * 100) : 92;
  });

  readonly npsPreliminarValor = computed(() => {
    const nCsat = this.csatRespuestas();
    if (nCsat <= 0) return 46;
    const prom = Math.round(nCsat * 0.72);
    const pas = Math.round(nCsat * 0.18);
    const det = Math.max(0, nCsat - prom - pas);
    return Math.round(((prom - det) / nCsat) * 100);
  });

  readonly ticketSeleccionado = computed<TicketVivo | null>(() => {
    const id = this.ticketSeleccionadoId();
    if (!id) return null;
    return this.ticketsActivos().find((t) => t.id === id) ?? null;
  });

  readonly estacionActual = computed<MetaEstacionVivo | null>(() => {
    const k = this.estacionSeleccionadaKey();
    return META_ESTACIONES_VIVO[k] ?? META_ESTACIONES_VIVO['etapa:bandeja'] ?? null;
  });

  readonly ticketsFiltradosBandeja = computed<TicketVivo[]>(() => {
    const filtro = this.areaFiltro();
    const lista = this.ticketsActivos().filter((t) => !filtro || t.area === filtro);
    lista.sort((a, b) => {
      if (a.rayo !== b.rayo) return a.rayo ? -1 : 1;
      return a.slaMax - a.age - (b.slaMax - b.age);
    });
    return lista.slice(0, 10);
  });

  constructor() {
    this.salas.forEach((r) => {
      this.ocupacionEscritorios[r.k] = r.gestores.map((nombre, i) => ({
        id: `${r.k}:g${i}`,
        nombre,
        ticketId: null,
        atendidos: 3 + (i % 2),
      }));
    });

    for (let i = 0; i < 10; i++) {
      this.inyectarTicket({ rayo: i === 1 || i === 5, silencioso: true });
    }
    for (let i = 0; i < 14; i++) {
      this.ejecutarPasoSimulacion();
    }

    afterNextRender(() => {
      this.inicializarEscena3D();
      this.sincronizarHudDom();
      this.tickInterval = setInterval(() => {
        if (!this.enEjecucion()) return;
        for (let k = 0; k < this.velocidad(); k++) {
          this.ejecutarPasoSimulacion();
        }
        this.sincronizarHudDom();
      }, 220);
    });

    const desuscribirTema = subscribeAppearance(() => {
      if (this.desmontarVivo) {
        this.desmontarVivo();
        this.desmontarVivo = null;
        this.inicializarEscena3D();
      }
    });

    this.destroyRef.onDestroy(() => {
      desuscribirTema();
      if (this.tickInterval !== null) clearInterval(this.tickInterval);
      this.desmontarVivo?.();
    });
  }

  private inicializarEscena3D(): void {
    const host = this.stageHostRef()?.nativeElement;
    const canvas = this.threeCanvasRef()?.nativeElement;
    if (!host || !canvas) return;

    const cols: Cols = {
      teal: leerTokenRgb('primary-700', [2, 66, 78]),
      teal2: leerTokenRgb('primary-500', [70, 134, 150]),
      orange: leerTokenRgb('secondary-400', [255, 167, 38]),
      ok: leerTokenRgb('feedback-success-border', [29, 139, 68]),
      warn: leerTokenRgb('feedback-warning-border', [184, 129, 0]),
      bad: leerTokenRgb('feedback-danger-border', [225, 90, 78]),
      line: leerTokenRgb('border-subtle', [212, 212, 212]),
      muted: leerTokenRgb('fg-muted', [74, 74, 74]),
      texto: leerTokenRgb('fg-default', [29, 29, 29]),
      superficie: leerTokenRgb('bg-surface', [255, 255, 255]),
      suelo: leerTokenRgb('bg-surface-sunken', [232, 232, 232]),
      lienzo: leerTokenRgb('bg-canvas', [246, 246, 246]),
    };

    const est: Estatico = {
      zonas: this.salas.map((s) => ({
        k: s.k,
        n: s.nombre,
        color: leerTokenRgb(TOKEN_ZONA[s.k] ?? 'primary-500', cols.teal2),
      })),
      compuertas: this.puertas.map((p) => ({
        k: p.k,
        n: p.nombre,
        sigla: p.ic,
        color: leerTokenRgb(TOKEN_CANAL[p.k] ?? 'primary-500', cols.teal2),
      })),
    };

    const reducido =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.desmontarVivo = montarVivo({
      canvas,
      host,
      cols,
      reducido,
      est,
      hits: this.hitsRef,
      obtener: () => this.construirSnapshotEscena(),
      alClickTicket: (id) => {
        this.ticketSeleccionadoId.set(id);
      },
      alClickCanal: (gateKey) => {
        this.inspeccionarCanal3D(gateKey);
      },
      alClickSala: (areaKey) => {
        this.inspeccionarSala3D(areaKey);
      },
      alClickEtapa: (etapa) => {
        this.inspeccionarEtapa3D(etapa);
      },
    });
  }

  inspeccionarCanal3D(gateKey: string): void {
    this.estacionSeleccionadaKey.set(`canal:${gateKey}`);
    this.vistaCajon.set('estacion');
    this.cajonLateralAbierto.set(true);
    this.inyectarTicket({ gate: gateKey });
  }

  inspeccionarSala3D(areaKey: string): void {
    this.estacionSeleccionadaKey.set(`sala:${areaKey}`);
    this.vistaCajon.set('estacion');
    this.cajonLateralAbierto.set(true);
    this.areaFiltro.set(areaKey);
    const primeroDeSala = this.ticketsActivos().find((t) => t.area === areaKey && t.etapa !== 'salida');
    if (primeroDeSala) {
      this.ticketSeleccionadoId.set(primeroDeSala.id);
    }
  }

  inspeccionarEtapa3D(etapa: 'bandeja' | 'comite' | 'salida'): void {
    this.estacionSeleccionadaKey.set(`etapa:${etapa}`);
    this.vistaCajon.set('estacion');
    this.cajonLateralAbierto.set(true);
    if (etapa === 'bandeja') {
      this.areaFiltro.set('');
    }
  }

  inyectarTicketEnSala(areaKey: string, rayo: boolean): void {
    const entrada = Object.entries(TIPOS_SIMULACION).find(([, v]) => v.area === areaKey);
    const typeKey = entrada?.[0] ?? 'cons';
    this.inyectarTicket({ type: typeKey, rayo });
  }

  private construirSnapshotEscena(): Snap {
    const lista = this.ticketsActivos();
    const selId = this.ticketSeleccionadoId();
    const zonas = this.salas.map((s) => {
      const desks = this.ocupacionEscritorios[s.k] ?? [];
      const enSala = lista.filter((t) => t.area === s.k && t.etapa !== 'salida');
      const cola = enSala.filter((t) => t.etapa === 'cola' || t.etapa === 'bandeja').length;
      const atencion = enSala.filter((t) => t.etapa === 'atencion').length;
      const riesgo = enSala.some((t) => this.nivelSlaTicket(t) !== 'ok');
      return {
        k: s.k,
        cola,
        atencion,
        riesgo,
        gente: desks.map((d) => ({
          id: d.id,
          nombre: d.nombre,
          ocupado: d.ticketId !== null,
        })),
      };
    });

    return {
      zonas,
      bandeja: lista.filter((t) => t.etapa === 'bandeja').length,
      escalados: this.escaladosCount(),
      tickets: lista.map((t) => ({
        id: t.id,
        numero: t.numero,
        gate: t.gate,
        zona: t.area,
        etapa: t.etapa,
        sla: this.nivelSlaTicket(t),
        rayo: t.rayo,
        sel: t.id === selId,
        resp: t.resp,
      })),
    };
  }

  readonly pctXpEquipo = computed<number>(() =>
    Math.min(100, Math.round((this.xpEquipo() / this.metaXpNivel) * 100)),
  );

  readonly estadosResumen = computed<
    readonly {
      id: string;
      n: string;
      v: number;
      pct: number;
      tono: 'info' | 'warning' | 'danger' | 'success' | 'neutral';
      tonoBarra: 'brand' | 'success' | 'danger';
    }[]
  >(() => {
    const lista = this.ticketsActivos();
    const enCurso = lista.filter((t) => t.etapa !== 'salida');
    const abiertos = enCurso.filter((t) => t.stateRf004 === 'OPEN').length;
    const enProgreso = enCurso.filter((t) => t.stateRf004 === 'IN_PROGRESS').length;
    const esperaCli = enCurso.filter((t) => t.stateRf004 === 'PENDING_CUSTOMER').length;
    const escalados = this.escaladosCount();
    const reabiertos = this.reabiertosHoy();
    const resueltosRecientes = lista.filter((t) => t.etapa === 'salida').length;
    const res = this.cerradosHoy();

    const crudos: readonly {
      id: string;
      n: string;
      v: number;
      tono: 'info' | 'warning' | 'danger' | 'success' | 'neutral';
      tonoBarra: 'brand' | 'success' | 'danger';
    }[] = [
      { id: 'OPEN', n: 'Abierto', v: abiertos, tono: 'info', tonoBarra: 'brand' },
      { id: 'IN_PROGRESS', n: 'En curso', v: enProgreso, tono: 'info', tonoBarra: 'brand' },
      { id: 'PENDING_CUSTOMER', n: 'Espera cliente', v: esperaCli, tono: 'warning', tonoBarra: 'brand' },
      { id: 'ESCALATED', n: 'Escalado', v: escalados, tono: 'danger', tonoBarra: 'danger' },
      { id: 'REOPENED', n: 'Reabierto', v: reabiertos, tono: 'warning', tonoBarra: 'danger' },
      { id: 'RESOLVED', n: 'Resuelto', v: resueltosRecientes, tono: 'success', tonoBarra: 'success' },
      { id: 'CLOSED', n: 'Cerrado hoy', v: res, tono: 'success', tonoBarra: 'success' },
    ];
    const maxV = Math.max(1, ...crudos.map((e) => e.v));
    return crudos.map((e) => ({
      ...e,
      pct: Math.round((e.v / maxV) * 100),
    }));
  });

  readonly totalEstadosCount = computed<number>(() =>
    this.estadosResumen().reduce((acc, e) => acc + e.v, 0),
  );

  private sincronizarHudDom(): void {
    // Los KPIs y los 7 estados se renderizan declarativamente con componentes de @aybarcorp/ui-angular.
  }

  alternarPausa(): void {
    this.enEjecucion.update((v) => !v);
  }

  cambiarVelocidad(val: string): void {
    const num = Number(val);
    if (num === 1 || num === 2 || num === 4) {
      this.velocidad.set(num);
    }
  }

  cambiarVistaCajon(vista: string): void {
    if (vista === 'todo' || vista === 'bandeja' || vista === 'estacion' || vista === 'correos') {
      this.vistaCajon.set(vista);
      this.cajonLateralAbierto.set(true);
    }
  }

  tonoSlaBadge(tk: TicketVivo): 'success' | 'warning' | 'danger' {
    const niv = this.nivelSlaTicket(tk);
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'warning' : 'success';
  }

  tonoSlaBarra(tk: TicketVivo): 'brand' | 'success' | 'danger' {
    const niv = this.nivelSlaTicket(tk);
    return niv === 'vencido' ? 'danger' : niv === 'riesgo' ? 'brand' : 'success';
  }

  paresTicketVivo(tk: TicketVivo): ParCardPairs[] {
    return [
      { clave: 'Cliente / Lote', valor: `${tk.cli} · ${tk.lote}` },
      { clave: 'Canal de entrada', valor: this.nombreCanal(tk.gate) },
      { clave: 'Sala / Área', valor: this.nombreSala(tk.area) },
      { clave: 'Responsable', valor: tk.respNombre ?? 'Bandeja Orquestadora' },
    ];
  }

  hitosTicketVivo(tk: TicketVivo): AyTimelineEvento[] {
    return tk.hitos.map((hito, idx) => ({
      id: `${tk.id}-h-${idx}`,
      titulo: hito,
      fecha: new Date(),
      autor: tk.respNombre ?? 'Robot Orquestador',
      tono: idx === 0 ? (tk.esc ? 'danger' : tk.rayo ? 'accent' : 'success') : 'default',
    }));
  }

  paresEstacionVivo(est: MetaEstacionVivo): ParCardPairs[] {
    return [
      { clave: 'Política operativa', valor: est.rfRn },
      { clave: 'Líder / Custodio', valor: est.lider },
      { clave: 'Acuerdo de servicio (SLA)', valor: est.slaRegla },
      { clave: 'Información gestionada', valor: est.inputsReales },
    ];
  }

  hitosCorreosEnviados(): AyTimelineEvento[] {
    return this.correosEnviados().map((c) => ({
      id: c.id,
      titulo: `Ticket ${c.ticketId} asignado a ${c.gestor} en ${c.sala} · ${c.slaTexto} (CC: ${c.liderCopia})`,
      fecha: new Date(),
      autor: c.hora,
      tono: 'accent',
    }));
  }

  inyectarTicket(opts?: { gate?: string; type?: string; rayo?: boolean; silencioso?: boolean }): void {
    const g = opts?.gate
      ? (this.puertas.find((p) => p.k === opts.gate) ?? this.puertas[0]!)
      : this.puertas[Math.floor(Math.random() * this.puertas.length)]!;
    const tiposKeys = Object.keys(TIPOS_SIMULACION);
    const tkKey = opts?.type ?? tiposKeys[Math.floor(Math.random() * tiposKeys.length)]!;
    const tp = TIPOS_SIMULACION[tkKey] ?? TIPOS_SIMULACION['cons']!;
    const cli = CLIENTES_SIM[Math.floor(Math.random() * CLIENTES_SIM.length)]!;
    const rayo = opts?.rayo ?? Math.random() < 0.18;
    const numSeq = ++this.seqId;
    const id = `T-0${numSeq}`;
    const numero = `AIN-000${numSeq}`;
    const hora = new Date().toTimeString().slice(0, 8);

    const nuevo: TicketVivo = {
      id,
      numero,
      gate: g.k,
      type: tkKey,
      area: tp.area,
      cli: cli[0],
      lote: cli[1],
      prio: rayo ? 'Urgente' : Math.random() < 0.35 ? 'Alta' : 'Normal',
      rayo,
      etapa: 'bandeja',
      stateRf004: 'OPEN',
      workNeed: Math.round(tp.pt[0] + Math.random() * (tp.pt[1] - tp.pt[0])),
      workDone: 0,
      age: 0,
      slaMax: tp.sla,
      esc: false,
      resumen: cli[2],
      hitos: [
        `${hora} · Ingresó por ${g.nombre} y aterrizó en Bandeja Orquestadora`,
        ...(rayo ? [`${hora} · Marcado con Prioridad Rayo`] : []),
      ],
    };

    this.ticketsActivos.update((lista) => [...lista, nuevo]);
    if (!opts?.silencioso) {
      this.sincronizarHudDom();
    }
  }

  inyectarTicketCustomizado(): void {
    const canal = this.canalEntradaCustom();
    const sala = this.areaFiltro();
    const rayo = this.rayoEntradaCustom();
    const tipoMatch = sala
      ? Object.keys(TIPOS_SIMULACION).find((k) => TIPOS_SIMULACION[k]?.area === sala)
      : undefined;
    this.inyectarTicket({
      gate: canal !== 'auto' ? canal : undefined,
      type: tipoMatch,
      rayo,
    });
  }

  simularPicoMasivo(): void {
    for (let i = 0; i < 5; i++) {
      this.inyectarTicket({ rayo: i === 0, silencioso: i < 4 });
    }
  }

  escalarTicketAComite(ticketId: string): void {
    const hora = new Date().toTimeString().slice(0, 8);
    let escalo = false;
    this.ticketsActivos.update((lista) =>
      lista.map((t) => {
        if (t.id !== ticketId || t.esc) return t;
        escalo = true;
        return {
          ...t,
          age: Math.max(t.age, t.slaMax + 5),
          esc: true,
          stateRf004: 'ESCALATED',
          hitos: [
            `${hora} · SLA vencido: Correo CC al líder y escalado a Sala de Comité SGD`,
            ...t.hitos,
          ].slice(0, 5),
        };
      }),
    );
    if (escalo) {
      this.escaladosCount.update((n) => Math.min(6, n + 1));
      this.rachaSla.set(0);
      this.ticketSeleccionadoId.set(ticketId);
      this.sincronizarHudDom();
    }
  }

  forzarVencimientoSla(): void {
    const lista = [...this.ticketsActivos()];
    const cand = lista.find((t) => !t.esc && t.etapa !== 'salida');
    if (!cand) {
      this.inyectarTicket({ type: 'recl' });
      return;
    }
    cand.age = cand.slaMax + 5;
    cand.esc = true;
    cand.stateRf004 = 'ESCALATED';
    const hora = new Date().toTimeString().slice(0, 8);
    cand.hitos = [
      `${hora} · SLA vencido: Escalado en cadena a Comité (Mesa SGD)`,
      ...cand.hitos,
    ].slice(0, 5);
    this.escaladosCount.update((n) => Math.min(6, n + 1));
    this.rachaSla.set(0);
    this.ticketSeleccionadoId.set(cand.id);
    this.ticketsActivos.set(lista);
    this.sincronizarHudDom();
  }

  alternarRayoTicket(ticketId: string): void {
    const hora = new Date().toTimeString().slice(0, 8);
    this.ticketsActivos.update((lista) =>
      lista.map((t) => {
        if (t.id !== ticketId) return t;
        const nuevoRayo = !t.rayo;
        return {
          ...t,
          rayo: nuevoRayo,
          prio: nuevoRayo ? 'Urgente' : t.prio,
          hitos: [
            `${hora} · ${nuevoRayo ? 'Prioridad Rayo activada: sube al tope de cola' : 'Prioridad Rayo retirada'}`,
            ...t.hitos,
          ].slice(0, 5),
        };
      }),
    );
    this.sincronizarHudDom();
  }

  resolverTicketInmediato(ticketId: string): void {
    const lista = [...this.ticketsActivos()];
    const tk = lista.find((t) => t.id === ticketId);
    if (!tk) return;
    this.liberarEscritorioDeTicket(tk);
    tk.etapa = 'salida';
    tk.stateRf004 = 'RESOLVED';
    const hora = new Date().toTimeString().slice(0, 8);
    tk.hitos = [
      `${hora} · Resuelto y enviado a Cierre en Mi Portal (encuesta CSAT/NPS)`,
      ...tk.hitos,
    ].slice(0, 5);
    this.registrarCierreConXp(tk);
    this.ticketsActivos.set(lista);
    this.sincronizarHudDom();
  }

  reasignarMenorCarga(ticketId: string): void {
    const lista = [...this.ticketsActivos()];
    const tk = lista.find((t) => t.id === ticketId);
    if (!tk) return;
    this.liberarEscritorioDeTicket(tk);
    const sala = this.salas.find((s) => s.k === tk.area);
    const desks = this.ocupacionEscritorios[tk.area];
    if (!sala || !desks) return;

    let mejorIdx = desks.findIndex((d) => d.ticketId === null);
    if (mejorIdx < 0) mejorIdx = 0;
    const puesto = desks[mejorIdx]!;
    puesto.ticketId = tk.id;
    tk.resp = puesto.id;
    tk.respNombre = puesto.nombre;
    tk.etapa = 'atencion';
    tk.stateRf004 = 'IN_PROGRESS';
    const hora = new Date().toTimeString().slice(0, 8);
    tk.hitos = [
      `${hora} · Reasignado por menor carga a ${puesto.nombre} (${sala.nombre})`,
      ...tk.hitos,
    ].slice(0, 5);
    this.registrarCorreoAsignacion(tk, sala, puesto.nombre);
    this.ticketsActivos.set(lista);
    this.sincronizarHudDom();
  }

  private liberarEscritorioDeTicket(tk: TicketVivo): void {
    const desks = this.ocupacionEscritorios[tk.area];
    if (!desks) return;
    for (const d of desks) {
      if (d.ticketId === tk.id) {
        d.ticketId = null;
      }
    }
  }

  private registrarCierreConXp(tk: TicketVivo): void {
    const enPlazo = !tk.esc && tk.age <= tk.slaMax;
    this.cerradosHoy.update((n) => n + 1);
    if (enPlazo) {
      this.cerradosEnSlaHoy.update((n) => n + 1);
      this.rachaSla.update((r) => r + 1);
    } else {
      this.rachaSla.set(0);
    }
    this.csatRespuestas.update((n) => n + 1);
    const ganados = (enPlazo ? 10 : 3) + (tk.rayo ? 5 : 0);
    let nuevoXp = this.xpEquipo() + ganados;
    if (nuevoXp >= this.metaXpNivel) {
      nuevoXp -= this.metaXpNivel;
      this.nivelEquipo.update((nv) => nv + 1);
    }
    this.xpEquipo.set(nuevoXp);
  }

  private registrarCorreoAsignacion(tk: TicketVivo, sala: SalaOficina, gestor: string): void {
    const ahora = new Date();
    const hora = ahora.toTimeString().slice(0, 8);
    const nuevoCorreo: CorreoAsignacionLog = {
      id: `MAIL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      hora,
      ticketId: tk.numero,
      gestor: `${gestor} (${sala.nombre})`,
      liderCopia: LIDERES_SALA[sala.k] ?? 'Supervisor ATC',
      sala: sala.nombre,
      slaTexto: tk.rayo ? 'Prioridad Rayo · Atención inmediata' : `SLA dentro de plazo`,
    };
    this.correosEnviados.update((prev) => [nuevoCorreo, ...prev].slice(0, 6));
  }

  private ejecutarPasoSimulacion(): void {
    this.spawnTimer++;
    if (this.spawnTimer >= 12 && this.ticketsActivos().length < 26) {
      this.spawnTimer = 0;
      this.inyectarTicket({ silencioso: true });
    }

    const lista = [...this.ticketsActivos()];
    const hora = new Date().toTimeString().slice(0, 8);

    // 1. Avanzar edad, trabajo en escritorio y retiro de tickets ya cerrados
    const sobrevivientes: TicketVivo[] = [];
    for (const t of lista) {
      t.age++;

      if (t.etapa === 'salida') {
        t.workDone += 2;
        if (t.workDone >= t.workNeed + 18) {
          if (this.ticketSeleccionadoId() === t.id) {
            this.ticketSeleccionadoId.set(null);
          }
          continue;
        }
        sobrevivientes.push(t);
        continue;
      }

      if (!t.esc && t.age >= t.slaMax) {
        t.esc = true;
        t.stateRf004 = 'ESCALATED';
        this.escaladosCount.update((n) => Math.min(6, n + 1));
        this.rachaSla.set(0);
        t.hitos = [
          `${hora} · SLA vencido: Escalado automático a Comité (Mesa SGD)`,
          ...t.hitos,
        ].slice(0, 5);
      }

      if (t.etapa === 'bandeja' && t.age >= 5) {
        t.etapa = 'cola';
        t.hitos = [
          `${hora} · Robot Orquestador despachó el ticket hacia la cola de ${this.nombreSala(t.area)}`,
          ...t.hitos,
        ].slice(0, 5);
      } else if (t.etapa === 'atencion') {
        t.workDone += t.rayo ? 1.5 : 1.05;
        if (t.workDone >= t.workNeed) {
          const desks = this.ocupacionEscritorios[t.area] ?? [];
          const puesto = desks.find((d) => d.ticketId === t.id);
          if (puesto) {
            puesto.ticketId = null;
            puesto.atendidos++;
          }
          t.etapa = 'salida';
          t.stateRf004 = 'RESOLVED';
          t.hitos = [
            `${hora} · Resuelto por ${t.respNombre ?? 'Gestor'} · pasa a Cierre en Mi Portal`,
            ...t.hitos,
          ].slice(0, 5);
          this.registrarCierreConXp(t);
        }
      }

      sobrevivientes.push(t);
    }

    // 2. Asignar tickets en cola/bandeja a escritorios libres ordenando por Rayo -> SLA -> Menor carga
    const candidatos = sobrevivientes.filter((t) => t.etapa === 'cola' || (t.etapa === 'bandeja' && t.age >= 3));
    candidatos.sort((a, b) => {
      if (a.rayo !== b.rayo) return a.rayo ? -1 : 1;
      return a.slaMax - a.age - (b.slaMax - b.age);
    });

    for (const t of candidatos) {
      const sala = this.salas.find((s) => s.k === t.area);
      const desks = this.ocupacionEscritorios[t.area];
      if (!sala || !desks) continue;

      let mejorIdx = -1;
      let menorCarga = Number.POSITIVE_INFINITY;
      desks.forEach((d, idx) => {
        if (d.ticketId === null && d.atendidos < menorCarga) {
          menorCarga = d.atendidos;
          mejorIdx = idx;
        }
      });

      if (mejorIdx >= 0) {
        const puesto = desks[mejorIdx]!;
        puesto.ticketId = t.id;
        t.resp = puesto.id;
        t.respNombre = puesto.nombre;
        t.etapa = 'atencion';
        t.stateRf004 = Math.random() < 0.18 ? 'PENDING_CUSTOMER' : 'IN_PROGRESS';
        t.hitos = [
          `${hora} · Ingresó a puesto de ${puesto.nombre} (${sala.nombre})`,
          ...t.hitos,
        ].slice(0, 5);
        this.registrarCorreoAsignacion(t, sala, puesto.nombre);
      }
    }

    this.ticketsActivos.set(sobrevivientes);
  }

  pctSlaRestante(tk: TicketVivo): number {
    return Math.max(0, Math.round(((tk.slaMax - tk.age) / tk.slaMax) * 100));
  }

  nivelSlaTicket(tk: TicketVivo): 'ok' | 'riesgo' | 'vencido' {
    if (tk.esc || tk.age >= tk.slaMax) return 'vencido';
    if (this.pctSlaRestante(tk) < 25) return 'riesgo';
    return 'ok';
  }

  etiquetaSlaTicket(tk: TicketVivo): string {
    const niv = this.nivelSlaTicket(tk);
    if (niv === 'vencido') return 'SLA vencido';
    if (niv === 'riesgo') return `En riesgo (${this.pctSlaRestante(tk)}%)`;
    return `En plazo (${this.pctSlaRestante(tk)}%)`;
  }

  colorChipSla(tk: TicketVivo): string {
    const niv = this.nivelSlaTicket(tk);
    return niv === 'vencido' ? 'var(--v3-bad)' : niv === 'riesgo' ? 'var(--v3-warn)' : 'var(--v3-ok)';
  }

  etiquetaEtapa(etapa: TicketVivo['etapa']): string {
    switch (etapa) {
      case 'bandeja':
        return 'Bandeja Orquestadora';
      case 'cola':
        return 'En cola de sala';
      case 'atencion':
        return 'En escritorio';
      case 'salida':
        return 'Cierre Mi Portal';
    }
  }

  nombreSala(k: string): string {
    if (k === 'bandeja') return 'Bandeja Orquestadora';
    if (k === 'comite') return 'Comité (Mesa SGD)';
    return this.salas.find((s) => s.k === k)?.nombre ?? k;
  }

  nombreCanal(k: string): string {
    return this.puertas.find((p) => p.k === k)?.nombre ?? k;
  }

  nombreTipoSim(k: string): string {
    return TIPOS_SIMULACION[k]?.nombre ?? k;
  }
}
