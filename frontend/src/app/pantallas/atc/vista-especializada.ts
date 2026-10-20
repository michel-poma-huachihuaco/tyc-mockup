import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AyAlert,
  AyBadge,
  AyButton,
  AyCard,
  AyCardBody,
  AyCardHeader,
  AyCardPairs,
  AyCelda,
  AyCheckbox,
  AyDivider,
  AyForm,
  AyFormField,
  AyFormGroup,
  AyGrid,
  AyInput,
  AyList,
  AyListItem,
  AyProgressBar,
  AyRow,
  AyStack,
  AyStatistic,
  AyTable,
  AyTextarea,
  AyText,
  type AyColumna,
  type ParCardPairs,
} from '@aybarcorp/ui-angular';
import {
  AHORA_BASE,
  crearDirectorioAtcDemo,
  diasHabilesEntre,
  fmtFecha,
  sumarDiasHabiles,
  type AsientoLibro,
  type AsistenteProyecto,
  type BusEntregaFest,
  type CasoMorosidad,
  type CasoSgd,
  type ColaboradorDirectorioAtc,
  type ReclamoGarantia,
} from './datos-atc';

@Component({
  selector: 'app-vista-especializada',
  standalone: true,
  imports: [
    AyAlert,
    AyBadge,
    AyButton,
    AyCard,
    AyCardBody,
    AyCardHeader,
    AyCardPairs,
    AyCelda,
    AyCheckbox,
    AyDivider,
    AyForm,
    AyFormField,
    AyFormGroup,
    AyGrid,
    AyInput,
    AyList,
    AyListItem,
    AyProgressBar,
    AyRow,
    AyStack,
    AyStatistic,
    AyTable,
    AyTextarea,
    AyText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ====================================================================== -->
    <!-- SUBVISTA 1: LIBRO DE RECLAMACIONES Y APELACIONES INDECOPI              -->
    <!-- ====================================================================== -->
    @if (subvista() === 'libro') {
      <div ayStack gap="4">
        <ay-alert
          tono="info"
          titulo="Vigilancia del Plazo Legal Improrrogable de 15 Días Hábiles (Ley 29571)"
        >
          El reloj legal corre desde el registro del asiento con numeración correlativa por razón social y
          establecimiento. Control de integridad activo: <strong>0 asientos sin ticket padre vinculado</strong>.
        </ay-alert>

        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            [titulo]="'Asientos regulados (' + asientosLibro().length + ')'"
            subtitulo="Libro de Reclamaciones y Expedientes de Apelación INDECOPI"
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Asientos del Libro de Reclamaciones regulado"
              [columnas]="columnasLibro"
              [filas]="asientosLibro()"
              [cabeceraFija]="true"
              [rayada]="true"
            >
              <ng-template ayCelda="asiento" let-fila>
                @let b = comoAsiento(fila);
                <div ayStack gap="1">
                  <strong ayText="mono" size="xs">{{ b.co }}-2026-{{ b.n }}</strong>
                  <span ayText="body" size="xs">{{ b.est }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="ticket" let-fila>
                @let b = comoAsiento(fila);
                <span ayText="mono" size="xs">{{ b.ticket }}</span>
              </ng-template>
              <ng-template ayCelda="kind" let-fila>
                @let b = comoAsiento(fila);
                <div ayStack gap="1">
                  <ay-badge size="sm" [tono]="b.kind === 'RECLAMO' ? 'warning' : 'neutral'">
                    {{ b.kind }}
                  </ay-badge>
                  <span ayText="body" size="xs">{{ b.amount ?? 'Sin monto' }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="cli" let-fila>
                @let b = comoAsiento(fila);
                <div ayStack gap="1">
                  <strong>{{ b.cli }}</strong>
                  <span ayText="body" size="xs">{{ b.facts }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="plazo" let-fila>
                @let b = comoAsiento(fila);
                <div ayStack gap="1">
                  <ay-badge size="sm" [tono]="plazoLibro(b).tono">{{ plazoLibro(b).texto }}</ay-badge>
                  <span ayText="mono" size="xs">Vence: {{ plazoLibro(b).vence }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="prorroga" let-fila>
                @let b = comoAsiento(fila);
                @if (b.ext) {
                  <ay-badge size="sm" tono="warning">Prórroga aplicada</ay-badge>
                } @else if (!b.resp) {
                  <ay-button tamano="sm" variante="secondary" (click)="aplicarProrrogaUnica(b)">
                    Prórroga única (+15 d)
                  </ay-button>
                } @else {
                  <span ayText="body" size="xs">No requerida</span>
                }
              </ng-template>
              <ng-template ayCelda="respuesta" let-fila>
                @let b = comoAsiento(fila);
                @if (!b.resp) {
                  <ay-button tamano="sm" variante="primary" (click)="emitirRespuestaConCargo(b)">
                    Emitir carta + cargo
                  </ay-button>
                } @else {
                  <div ayStack gap="1">
                    <ay-badge size="sm" tono="success">Respondido {{ fmtDia(b.resp) }}</ay-badge>
                    @if (b.appeal) {
                      <span ayText="body" size="xs">
                        Apelación {{ b.appeal.to }}: <strong>{{ b.appeal.caseNo }}</strong> ({{ b.appeal.st }})
                      </span>
                    } @else {
                      <ay-button tamano="sm" variante="ghost" (click)="registrarApelacionIndecopi(b)">
                        + Registrar apelación INDECOPI
                      </ay-button>
                    }
                  </div>
                }
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- SUBVISTA 2: MESA DE CASOS SGD + RESOLUCIÓN MOROSIDAD 3 MESES           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'sgd') {
      <div ayStack gap="4">
        <!-- Mesa de Resolución de Contrato por 3 Meses Impagos -->
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Casos de resolución, alerta de cancelación de servicios y carta al proyecto"
            subtitulo="Gestión preventiva y resolución contractual por morosidad acumulada de 3 meses"
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Casos de resolución contractual por morosidad de 3 meses"
              [columnas]="columnasMorosidad"
              [filas]="casosMorosidad()"
              [rayada]="true"
            >
              <ng-template ayCelda="id" let-fila>
                @let m = comoMorosidad(fila);
                <div ayStack gap="1">
                  <strong ayText="mono" size="xs">{{ m.id }}</strong>
                  <span ayText="body" size="xs">Contrato {{ m.contrato }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="cliente" let-fila>
                @let m = comoMorosidad(fila);
                <div ayStack gap="1">
                  <strong>{{ m.cliente }}</strong>
                  <span ayText="body" size="xs">{{ m.proyecto }} · {{ m.lote }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="mora" let-fila>
                @let m = comoMorosidad(fila);
                <div ayStack gap="1">
                  <ay-badge size="sm" tono="danger">{{ m.cuotasImpagas }} meses impagos</ay-badge>
                  <span ayText="body" size="xs">Mora exigible: {{ m.montoMora }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="alerta" let-fila>
                @let m = comoMorosidad(fila);
                <ay-badge size="sm" [tono]="m.alertaServicioEnviada ? 'success' : 'warning'">
                  {{ m.alertaServicioEnviada ? 'Alerta enviada con constancia' : 'Pendiente de despacho' }}
                </ay-badge>
              </ng-template>
              <ng-template ayCelda="carta" let-fila>
                @let m = comoMorosidad(fila);
                <div ayStack gap="1">
                  <span ayText="body" size="xs">Para: <strong>{{ m.responsableProyecto }}</strong></span>
                  <span ayText="body" size="xs">CC: {{ m.supervisor }}</span>
                  <ay-badge size="sm" [tono]="m.cartaProyectoEnviada ? 'success' : 'warning'">
                    {{ m.cartaProyectoEnviada ? 'Carta notificada al proyecto' : 'Pendiente de carta' }}
                  </ay-badge>
                </div>
              </ng-template>
              <ng-template ayCelda="accion" let-fila>
                @let m = comoMorosidad(fila);
                <div ayRow gap="2" [ajuste]="true">
                  <ay-button tamano="sm" variante="ghost" (click)="verContrato.emit(m.contrato)">
                    Ver contrato
                  </ay-button>
                  @if (!m.alertaServicioEnviada || !m.cartaProyectoEnviada) {
                    <ay-button tamano="sm" variante="primary" (click)="dispararFlujoMorosidad3Meses(m)">
                      Ejecutar alerta + carta
                    </ay-button>
                  } @else {
                    <ay-badge size="sm" tono="success">Flujo auditado</ay-badge>
                  }
                </div>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>

        <!-- Mesa de Casos SGD y Matriz Objetiva de Riesgo -->
        <div ayGrid [columnas]="2" gap="md">
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Cargo previo vs. activación, casos vinculados y cierre GLI"
              subtitulo="Mesa de Casos Documentales SGD y Comité Multidisciplinario"
              nivel="h3"
              [separador]="true"
            />
            <ay-card-body padding="sm">
              <ay-table
                leyenda="Casos documentales SGD y custodia GLI"
                [columnas]="columnasSgd"
                [filas]="casosSgd()"
                [rayada]="true"
              >
                <ng-template ayCelda="code" let-fila>
                  @let s = comoSgd(fila);
                  <strong ayText="mono" size="xs">{{ s.code }}</strong>
                </ng-template>
                <ng-template ayCelda="line" let-fila>
                  @let s = comoSgd(fila);
                  <div ayStack gap="1">
                    <strong>{{ s.line }}</strong>
                    <span ayText="body" size="xs">{{ s.cli }}</span>
                  </div>
                </ng-template>
                <ng-template ayCelda="cargo" let-fila>
                  @let s = comoSgd(fila);
                  <div ayStack gap="1">
                    <span ayText="body" size="xs">Previo: {{ fmtDia(s.pre) }}</span>
                    @if (s.act) {
                      <ay-badge size="sm" tono="info">
                        Activado: {{ fmtDia(s.act) }} (SLA {{ s.slaDays }}d)
                      </ay-badge>
                    } @else {
                      <ay-button tamano="sm" variante="secondary" (click)="activarCargoSgd(s)">
                        Activar cargo (inicia SLA)
                      </ay-button>
                    }
                  </div>
                </ng-template>
                <ng-template ayCelda="linked" let-fila>
                  @let s = comoSgd(fila);
                  <span ayText="mono" size="xs">{{ s.linked ?? 'Sin cruce' }}</span>
                </ng-template>
                <ng-template ayCelda="estado" let-fila>
                  @let s = comoSgd(fila);
                  @if (s.closeState) {
                    <ay-badge size="sm" tono="success">{{ s.closeState }} · GLI</ay-badge>
                  } @else {
                    <ay-button tamano="sm" variante="primary" [disabled]="!s.act" (click)="cerrarCasoSgdConGli(s)">
                      Cerrar con evidencia GLI
                    </ay-button>
                  }
                </ng-template>
              </ay-table>
            </ay-card-body>
          </ay-card>

          <!-- Calculadora de Matriz Objetiva de Riesgo -->
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Matriz Objetiva de Clasificación de Riesgo"
              subtitulo="Ponderación automática para escalamiento a Eje 3 y Comité SGD"
              nivel="h3"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <ay-form-group leyenda="Factores de exposición detectados" variante="card">
                <ay-checkbox
                  [marcado]="riesgoAutoridad()"
                  (marcadoChange)="riesgoAutoridad.set($event)"
                >
                  Intervención de autoridad (INDECOPI / Fiscalía / Municipalidad) (+40 pts)
                </ay-checkbox>
                <ay-checkbox
                  [marcado]="riesgoCartaNotarial()"
                  (marcadoChange)="riesgoCartaNotarial.set($event)"
                >
                  Carta notarial o apercibimiento de resolución (+30 pts)
                </ay-checkbox>
                <ay-checkbox
                  [marcado]="riesgoCuantioso()"
                  (marcadoChange)="riesgoCuantioso.set($event)"
                >
                  Exposición económica &gt; 5 UIT o colectivo vecinal (+25 pts)
                </ay-checkbox>
              </ay-form-group>

              <ay-progress-bar
                etiqueta="Puntaje objetivo de riesgo"
                [detalle]="puntajeRiesgo() + ' / 95 pts'"
                [valor]="(puntajeRiesgo() / 95) * 100"
                [tono]="puntajeRiesgo() >= 55 ? 'danger' : 'brand'"
              />

              <ay-alert
                [tono]="puntajeRiesgo() >= 55 ? 'danger' : puntajeRiesgo() >= 30 ? 'warning' : 'success'"
                [titulo]="'Puntaje: ' + puntajeRiesgo() + ' / 95'"
                size="sm"
              >
                {{
                  puntajeRiesgo() >= 55
                    ? 'RIESGO CRÍTICO · DERIVACIÓN OBLIGATORIA A EJE 3 + COMITÉ SGD'
                    : puntajeRiesgo() >= 30
                      ? 'RIESGO MEDIO · SUPERVISIÓN PREVENTIVA'
                      : 'RIESGO BAJO · RESOLUCIÓN EN EJE 1'
                }}
              </ay-alert>
            </ay-card-body>
          </ay-card>
        </div>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- SUBVISTA 3: GARANTÍAS POSTVENTA VINCULADAS A ACTA DE ENTREGA           -->
    <!-- ====================================================================== -->
    @if (subvista() === 'garantias') {
      <div ayStack gap="4">
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Reclamos vinculados a Acta de Entrega y cobertura por rubro"
            subtitulo="Gestión de Garantías Postventa, Inspecciones de Campo y Sincronización Organizacional"
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="sm">
            <ay-table
              leyenda="Solicitudes de garantía postventa vinculadas a acta de entrega"
              [columnas]="columnasGarantias"
              [filas]="garantias()"
              [rayada]="true"
            >
              <ng-template ayCelda="id" let-fila>
                @let g = comoGarantia(fila);
                <div ayStack gap="1">
                  <strong ayText="mono" size="xs">{{ g.id }}</strong>
                  <span ayText="body" size="xs">Ticket {{ g.ticket }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="unit" let-fila>
                @let g = comoGarantia(fila);
                <div ayStack gap="1">
                  <strong>{{ g.unit }}</strong>
                  <span ayText="body" size="xs">Acta firmada: {{ g.handover }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="type" let-fila>
                @let g = comoGarantia(fila);
                <ay-badge size="sm" tono="info">{{ g.type }} ({{ g.cov }} meses)</ay-badge>
              </ng-template>
              <ng-template ayCelda="insp" let-fila>
                @let g = comoGarantia(fila);
                @if (g.insp) {
                  <span ayText="mono" size="xs">Programada: {{ g.insp }}</span>
                } @else {
                  <ay-button tamano="sm" variante="secondary" (click)="agendarInspeccion(g)">
                    Agendar inspección
                  </ay-button>
                }
              </ng-template>
              <ng-template ayCelda="state" let-fila>
                @let g = comoGarantia(fila);
                <div ayRow gap="2" [ajuste]="true">
                  <ay-badge
                    size="sm"
                    [tono]="
                      g.state === 'APPROVED'
                        ? 'success'
                        : g.state === 'REJECTED' || g.state === 'ESCALATED_EJE3'
                          ? 'danger'
                          : 'warning'
                    "
                  >
                    {{ g.state }}
                  </ay-badge>
                  @if (g.state === 'UNDER_REVIEW') {
                    <ay-button tamano="sm" variante="primary" (click)="g.state = 'APPROVED'">
                      Aprobar
                    </ay-button>
                    <ay-button tamano="sm" variante="danger" (click)="g.state = 'ESCALATED_EJE3'">
                      Escalar a Eje 3 Legal
                    </ay-button>
                  }
                </div>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>

        <!-- Panel de Directorio Operativo de Gestores, Roles y Líderes de Área -->
        <ay-card variante="elevated" superficie="solid">
          <ay-card-header
            titulo="Directorio Operativo de Gestores, Roles y Líderes de Área (Gobierno de Asignación)"
            subtitulo="Control de disponibilidad, correo de líder inmediato en CC y reasignación automática por rotación"
            nivel="h2"
            [separador]="true"
          />
          <ay-card-body padding="sm" gap="md">
            @if (mensajeDirectorio()) {
              <ay-alert tono="success" titulo="Bitácora de directorio operativo ATC" size="sm">
                {{ mensajeDirectorio() }}
              </ay-alert>
            }

            <ay-table
              leyenda="Directorio operativo de gestores y líderes de área"
              [columnas]="columnasDirectorio"
              [filas]="directorioAtc()"
              [rayada]="true"
            >
              <ng-template ayCelda="userId" let-fila>
                @let v = comoDirectorio(fila);
                <div ayStack gap="1">
                  <strong ayText="mono" size="xs">{{ v.userId }}</strong>
                  <span ayText="body" size="xs">Cód: {{ v.codigoEmpleado }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="gestor" let-fila>
                @let v = comoDirectorio(fila);
                <div ayStack gap="1">
                  <strong>{{ v.gestor }}</strong>
                  <span ayText="body" size="xs">{{ v.rol }}</span>
                </div>
              </ng-template>
              <ng-template ayCelda="area" let-fila>
                @let v = comoDirectorio(fila);
                <div ayStack gap="1">
                  <ay-badge size="sm" tono="neutral">{{ v.area }}</ay-badge>
                  <span ayText="body" size="xs">CC Líder: <strong>{{ v.lider }}</strong></span>
                </div>
              </ng-template>
              <ng-template ayCelda="estado" let-fila>
                @let v = comoDirectorio(fila);
                @if (v.cesadoEnDirectorio) {
                  <ay-badge size="sm" tono="danger">EN ROTACIÓN / CESE · Reasignar cartera</ay-badge>
                } @else if (v.disponible) {
                  <ay-badge size="sm" tono="success">ACTIVO · {{ v.actualizadoHace }}</ay-badge>
                } @else {
                  <ay-badge size="sm" tono="warning">AUSENTE</ay-badge>
                }
              </ng-template>
              <ng-template ayCelda="acciones" let-fila>
                @let v = comoDirectorio(fila);
                <div ayRow gap="2" [ajuste]="true">
                  <ay-button tamano="sm" variante="secondary" (click)="actualizarLiderArea(v)">
                    Actualizar líder inmediato
                  </ay-button>
                  @if (!v.cesadoEnDirectorio) {
                    <ay-button tamano="sm" variante="danger" (click)="registrarRotacion(v)">
                      Registrar cese / rotación
                    </ay-button>
                  }
                </div>
              </ng-template>
            </ay-table>
          </ay-card-body>
        </ay-card>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- SUBVISTA 4: ENTREGAFEST EN VIVO, INGRESO Y BUSES                       -->
    <!-- ====================================================================== -->
    @if (subvista() === 'evento') {
      <div ayStack gap="4">
        @if (imputacionPenalDetectada()) {
          <ay-alert
            tono="danger"
            titulo="PROTOCOLO DE CONTENCIÓN ACTIVADO — DERIVACIÓN OBLIGATORIA A ESTACIÓN 4 LEGAL"
          >
            Se detectó vocabulario de imputación penal («estafa», «robo», «denuncia penal», «fiscalía»). El anfitrión de
            primera línea <strong>no debate ni argumenta</strong>: aplica la Frase Ancla #3 y acompaña al cliente a la
            <strong>Estación 4 (Mesa Legal Eje 3)</strong>.
          </ay-alert>
        }

        <div ayGrid [columnas]="2" gap="md">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Clasificación verbal, Frases Ancla y Estación 4"
              subtitulo="Protocolo de Contención en Evento Presencial EntregaFest"
              nivel="h3"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <ay-form-field
                etiqueta="Transcripción o manifestación verbal del asistente en mesa"
              >
                <ay-textarea
                  [filas]="3"
                  [valor]="textoEvento()"
                  (valorChange)="textoEvento.set($event)"
                  placeholder="Ej. «Esto es una estafa, voy a traer a la fiscalía si no me entregan hoy…»"
                />
              </ay-form-field>
              <div ayRow gap="2" [ajuste]="true">
                <ay-button
                  tamano="sm"
                  variante="danger"
                  (click)="textoEvento.set('Exijo mi minuta ahora mismo, esto es una estafa y robo')"
                >
                  Probar alerta de imputación penal
                </ay-button>
                <ay-button
                  tamano="sm"
                  variante="secondary"
                  (click)="textoEvento.set('Quiero confirmar el plano de ubicación de mi lote C-07')"
                >
                  Cargar consulta regular
                </ay-button>
              </div>

              <ay-alert tono="info" size="sm" titulo="Frases Ancla oficiales para anfitriones">
                <ay-list
                  etiqueta="Frases Ancla oficiales"
                  [ordenada]="true"
                  [separadores]="true"
                  [elementos]="frasesAncla"
                >
                  <ng-template #elemento let-frase>
                    <ay-list-item [titulo]="frase" />
                  </ng-template>
                </ay-list>
              </ay-alert>
            </ay-card-body>
          </ay-card>

          <!-- Registro de ingreso a proyecto y Buses EntregaFest -->
          <div ayStack gap="4">
            <ay-card superficie="solid">
              <ay-card-header
                titulo="Registro de ingreso a proyecto"
                subtitulo="Control presencial de propietarios, visitantes y acompañantes"
                nivel="h3"
                [separador]="true"
              >
                <div ayAcciones>
                  <ay-badge tono="info">{{ asistentes().length }} ingresos hoy</ay-badge>
                </div>
              </ay-card-header>
              <ay-card-body padding="md" gap="md">
                <ay-form (enviar)="registrarIngresoProyecto()">
                  <div ayGrid [columnas]="3" gap="sm">
                    <ay-form-field etiqueta="Nombre del visitante" obligatorio>
                      <ay-input
                        size="sm"
                        placeholder="Nombre completo"
                        [valor]="nuevoAsistenteNombre()"
                        (valorChange)="nuevoAsistenteNombre.set($event)"
                      />
                    </ay-form-field>
                    <ay-form-field etiqueta="DNI">
                      <ay-input
                        size="sm"
                        placeholder="DNI"
                        [valor]="nuevoAsistenteDni()"
                        (valorChange)="nuevoAsistenteDni.set($event)"
                      />
                    </ay-form-field>
                    <ay-form-field etiqueta="Lote">
                      <ay-input
                        size="sm"
                        placeholder="Lote"
                        [valor]="nuevoAsistenteLote()"
                        (valorChange)="nuevoAsistenteLote.set($event)"
                      />
                    </ay-form-field>
                  </div>
                  <div ayRow gap="2" justificar="end">
                    <ay-button tamano="sm" tipo="submit" variante="primary">
                      + Check-in en proyecto
                    </ay-button>
                  </div>
                </ay-form>

                <ay-divider espaciado="none" />
                <ay-card-pairs [pares]="paresAsistentes()" />
              </ay-card-body>
            </ay-card>

            <ay-card superficie="solid">
              <ay-card-header
                titulo="Buses y cupos de EntregaFest"
                subtitulo="Logística de transporte, paraderos y control de aforo"
                nivel="h3"
                [separador]="true"
              />
              <ay-card-body padding="md" gap="md">
                <div ayStack gap="3">
                  @for (bus of buses(); track bus.id) {
                    <ay-card superficie="solid">
                      <ay-card-header
                        [titulo]="bus.id + ' · ' + bus.ruta + ' (Placa ' + bus.placa + ')'"
                        [subtitulo]="bus.paradero + ' · Salida ' + bus.salida"
                        nivel="h4"
                        [separador]="true"
                      >
                        <div ayAcciones>
                          <ay-badge size="sm" [tono]="bus.ocupados >= bus.capacidad ? 'danger' : 'success'">
                            {{ bus.ocupados }} / {{ bus.capacidad }} asientos
                          </ay-badge>
                        </div>
                      </ay-card-header>
                      <ay-card-body padding="sm" gap="sm">
                        <ay-progress-bar
                          size="sm"
                          [valor]="(bus.ocupados / bus.capacidad) * 100"
                          [tono]="bus.ocupados >= bus.capacidad ? 'danger' : 'brand'"
                          etiqueta="Ocupación de asientos"
                        />
                        <div ayRow gap="2" justificar="end">
                          <ay-button
                            tamano="sm"
                            variante="secondary"
                            [disabled]="bus.ocupados >= bus.capacidad"
                            (click)="reservarCupoBus(bus)"
                          >
                            + Reservar cupo
                          </ay-button>
                        </div>
                      </ay-card-body>
                    </ay-card>
                  }
                </div>
              </ay-card-body>
            </ay-card>
          </div>
        </div>
      </div>
    }

    <!-- ====================================================================== -->
    <!-- SUBVISTA 5: TORRE DE CONTROL CX, RADAR LEGAL +8% Y FLUJOS              -->
    <!-- ====================================================================== -->
    @if (subvista() === 'torre') {
      <div ayStack gap="4">
        <div ayGrid [columnas]="4" gap="md">
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-statistic
                etiqueta="SLA E2E 72 h Experiencia"
                valor="91.4%"
                periodo="Meta corporativa ≥ 90%"
                [delta]="{ valor: 2.4, direccion: 'up' }"
                intencion="positive"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-statistic
                etiqueta="NPS Relacional / IGDC"
                valor="+54 · 88%"
                periodo="CSAT post-atención: 4.8 / 5.0"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-statistic
                etiqueta="Exposición Legal Evitada"
                valor="S/ 48,200"
                periodo="Ahorro del +8% de interés legal en 14 casos"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
          <ay-card superficie="solid">
            <ay-card-body padding="md">
              <ay-statistic
                etiqueta="Integridad Maestro SIGDA"
                valor="100%"
                periodo="0 registros duplicados creados"
                size="sm"
              />
            </ay-card-body>
          </ay-card>
        </div>

        <div ayGrid [columnas]="2" gap="md">
          <ay-card variante="elevated" superficie="solid">
            <ay-card-header
              titulo="Calculadora de impacto económico (+8% interés legal)"
              subtitulo="Prevención temprana de contingencias antes de denuncia administrativa o judicial"
              nivel="h3"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <p ayText="body" size="sm">
                Cuando un reclamo escala a denuncia administrativa o judicial sin contención previa, el monto en
                controversia se incrementa con el <strong>8% de interés legal</strong> más costas procesales.
              </p>
              <ay-form-field etiqueta="Capital reclamado (S/)">
                <ay-input
                  tipo="number"
                  size="sm"
                  [valor]="capitalControversiaStr()"
                  (valorChange)="cambiarCapitalControversia($event)"
                />
              </ay-form-field>
              <ay-card-pairs [pares]="paresImpactoLegal()" />
            </ay-card-body>
          </ay-card>

          <!-- Flujos configurables por área y Encuesta CSAT en Mi Portal -->
          <ay-card superficie="solid">
            <ay-card-header
              titulo="Flujos configurables por área y Cierre en Mi Portal"
              subtitulo="Orquestación operativa y medición de satisfacción del propietario"
              nivel="h3"
              [separador]="true"
            />
            <ay-card-body padding="md" gap="md">
              <ay-card-pairs [pares]="paresFlujosTorre" />
              <ay-alert tono="info" size="sm" titulo="Conformidad del cliente en Mi Portal">
                Al resolverse el ticket, el cliente recibe notificación con su constancia y califica de 1 a 5
                estrellas (CSAT), esfuerzo percibido (CES) y recomendación (NPS).
              </ay-alert>
            </ay-card-body>
          </ay-card>
        </div>
      </div>
    }
  `,
})
export class VistaEspecializadaComponent {
  readonly subvista = input.required<'libro' | 'sgd' | 'garantias' | 'evento' | 'torre'>();
  readonly asientosLibro = input.required<AsientoLibro[]>();
  readonly casosSgd = input.required<CasoSgd[]>();
  readonly casosMorosidad = input.required<CasoMorosidad[]>();
  readonly garantias = input.required<ReclamoGarantia[]>();
  readonly asistentes = input.required<AsistenteProyecto[]>();
  readonly buses = input.required<BusEntregaFest[]>();
  readonly mostrarHu = input<boolean>(false);

  readonly verContrato = output<string>();

  readonly columnasLibro: readonly AyColumna[] = [
    { clave: 'asiento', cabecera: 'Asiento / Establecimiento', ancho: '13rem' },
    { clave: 'ticket', cabecera: 'Ticket Padre', ancho: '8rem' },
    { clave: 'kind', cabecera: 'Tipo / Monto', ancho: '9rem' },
    { clave: 'cli', cabecera: 'Cliente y Hechos' },
    { clave: 'plazo', cabecera: 'Plazo Legal (15 d)', ancho: '11rem' },
    { clave: 'prorroga', cabecera: 'Prórroga Única', ancho: '11rem' },
    { clave: 'respuesta', cabecera: 'Respuesta / Apelación', ancho: '15rem' },
  ];

  readonly columnasMorosidad: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'Caso / Contrato', ancho: '11rem' },
    { clave: 'cliente', cabecera: 'Cliente / Lote' },
    { clave: 'mora', cabecera: 'Morosidad acumulada', ancho: '12rem' },
    { clave: 'alerta', cabecera: 'Alerta Cancelación Servicios', ancho: '14rem' },
    { clave: 'carta', cabecera: 'Carta a Proyecto + CC Sup.' },
    { clave: 'accion', cabecera: 'Acciones', alineacion: 'end', ancho: '15rem' },
  ];

  readonly columnasSgd: readonly AyColumna[] = [
    { clave: 'code', cabecera: 'Código SGD', ancho: '9rem' },
    { clave: 'line', cabecera: 'Línea / Cliente' },
    { clave: 'cargo', cabecera: 'Cargo Previo vs. Activación' },
    { clave: 'linked', cabecera: 'Vínculo Cruzado', ancho: '8rem' },
    { clave: 'estado', cabecera: 'Estado / Custodia GLI', alineacion: 'end', ancho: '12rem' },
  ];

  readonly columnasGarantias: readonly AyColumna[] = [
    { clave: 'id', cabecera: 'ID Garantía / Ticket', ancho: '11rem' },
    { clave: 'unit', cabecera: 'Unidad / Acta de Entrega' },
    { clave: 'type', cabecera: 'Rubro y Cobertura', ancho: '13rem' },
    { clave: 'insp', cabecera: 'Inspección Técnica', ancho: '13rem' },
    { clave: 'state', cabecera: 'Estado / Escalamiento Eje 3', alineacion: 'end', ancho: '18rem' },
  ];

  readonly columnasDirectorio: readonly AyColumna[] = [
    { clave: 'userId', cabecera: 'Usuario ATC / Correo', ancho: '12rem' },
    { clave: 'gestor', cabecera: 'Gestor y Rol Operativo' },
    { clave: 'area', cabecera: 'Área y Líder Inmediato (CC)' },
    { clave: 'estado', cabecera: 'Estado / Disponibilidad', ancho: '14rem' },
    { clave: 'acciones', cabecera: 'Acciones de Directorio', alineacion: 'end', ancho: '18rem' },
  ];

  readonly frasesAncla: string[] = [
    '«Entiendo la importancia de su consulta; permítame registrarla con código verificable.»',
    '«Para darle una respuesta documentada y exacta, su caso queda asignado con compromiso de hora.»',
    '«[Ante imputación penal] Para atender su solicitud con las garantías legales correspondientes, lo acompañamos de inmediato a la Estación 4 con nuestro especialista apoderado.»',
  ];

  readonly paresFlujosTorre: ParCardPairs[] = [
    {
      clave: 'Flujo Cobranza (CTA / MORO)',
      valor: 'Recepción → Conciliación en línea → Respuesta con voucher → Encuesta Mi Portal',
    },
    {
      clave: 'Flujo Legal Eje 3 (REC / CONFLICTO)',
      valor: 'Derivación Eje 3 → Paquete 6/6 → Sincronización Legal → Carta con cargo GLI',
    },
    {
      clave: 'Flujo Postventa (GAR)',
      valor: 'Validación Acta Entrega → Inspección técnica → Informe procedencia → Cierre',
    },
  ];

  readonly riesgoAutoridad = signal<boolean>(true);
  readonly riesgoCartaNotarial = signal<boolean>(true);
  readonly riesgoCuantioso = signal<boolean>(false);

  readonly textoEvento = signal<string>('');
  readonly nuevoAsistenteNombre = signal<string>('');
  readonly nuevoAsistenteDni = signal<string>('');
  readonly nuevoAsistenteLote = signal<string>('');

  readonly capitalControversia = signal<number>(18500);
  readonly capitalControversiaStr = computed(() => String(this.capitalControversia()));

  readonly puntajeRiesgo = computed(
    () =>
      (this.riesgoAutoridad() ? 40 : 0) +
      (this.riesgoCartaNotarial() ? 30 : 0) +
      (this.riesgoCuantioso() ? 25 : 0),
  );

  readonly imputacionPenalDetectada = computed(() => {
    const t = this.textoEvento().toLowerCase();
    return ['estafa', 'robo', 'fiscalía', 'fiscalia', 'denuncia penal', 'delito'].some((w) =>
      t.includes(w),
    );
  });

  readonly paresAsistentes = computed<ParCardPairs[]>(() =>
    this.asistentes().map((a) => ({
      clave: `${a.hora} · ${a.nombre} (DNI ${a.dni})`,
      valor: `${a.proyecto} · Lote ${a.lote} (+${a.acompanantes} acomp.)`,
    })),
  );

  readonly paresImpactoLegal = computed<ParCardPairs[]>(() => {
    const cap = this.capitalControversia();
    return [
      {
        clave: 'Resolución en Eje 1 / Conciliación temprana',
        valor: `S/ ${cap.toFixed(2)} (Ahorro 100% sobrecosto)`,
      },
      {
        clave: 'Proyección en caso de denuncia (+8% interés legal)',
        valor: `S/ ${(cap * 1.08).toFixed(2)} (+S/ ${(cap * 0.08).toFixed(2)} de recargo)`,
      },
    ];
  });

  comoAsiento(fila: unknown): AsientoLibro {
    return fila as AsientoLibro;
  }

  comoMorosidad(fila: unknown): CasoMorosidad {
    return fila as CasoMorosidad;
  }

  comoSgd(fila: unknown): CasoSgd {
    return fila as CasoSgd;
  }

  comoGarantia(fila: unknown): ReclamoGarantia {
    return fila as ReclamoGarantia;
  }

  comoDirectorio(fila: unknown): ColaboradorDirectorioAtc {
    return fila as ColaboradorDirectorioAtc;
  }

  cambiarCapitalControversia(val: string): void {
    this.capitalControversia.set(Number(val) || 0);
  }

  fmtDia(d: Date): string {
    return fmtFecha(d);
  }

  plazoLibro(b: AsientoLibro): { tono: 'success' | 'warning' | 'danger'; texto: string; vence: string } {
    const diasPlazo = b.ext ? 30 : 15;
    const venceDate = sumarDiasHabiles(b.reg, diasPlazo);
    if (b.resp) {
      return { tono: 'success', texto: 'Respondido en plazo', vence: fmtFecha(venceDate) };
    }
    const rest = diasHabilesEntre(AHORA_BASE, venceDate);
    if (rest < 0) return { tono: 'danger', texto: `Vencido (${Math.abs(rest)} d)`, vence: fmtFecha(venceDate) };
    if (rest <= 5) return { tono: 'warning', texto: `Quedan ${rest} d hábiles`, vence: fmtFecha(venceDate) };
    return { tono: 'success', texto: `Quedan ${rest} d hábiles`, vence: fmtFecha(venceDate) };
  }

  aplicarProrrogaUnica(b: AsientoLibro): void {
    b.ext = true;
    b.extJustificacion = 'Complejidad pericial / conciliación histórica comunicada al consumidor dentro de los primeros 15 días.';
  }

  emitirRespuestaConCargo(b: AsientoLibro): void {
    b.resp = AHORA_BASE;
    b.respResumen = 'Carta formal emitida con cargo de entrega custodiado en GLI.';
  }

  registrarApelacionIndecopi(b: AsientoLibro): void {
    b.appeal = {
      to: 'INDECOPI',
      st: 'EN DESCARGOS LEGAL',
      caseNo: `0891-2026/ILN-PS0`,
    };
  }

  dispararFlujoMorosidad3Meses(m: CasoMorosidad): void {
    m.alertaServicioEnviada = true;
    m.cartaProyectoEnviada = true;
    m.estado = 'NOTIFICADO_PROYECTO';
  }

  activarCargoSgd(s: CasoSgd): void {
    s.act = AHORA_BASE;
  }

  cerrarCasoSgdConGli(s: CasoSgd): void {
    s.closeState = 'ATENDIDO_CON_CARGO';
  }

  agendarInspeccion(g: ReclamoGarantia): void {
    g.insp = '2026-10-25';
  }

  registrarIngresoProyecto(): void {
    const nombre = this.nuevoAsistenteNombre().trim();
    if (!nombre) return;
    this.asistentes().unshift({
      id: `ING-0${this.asistentes().length + 1}`,
      nombre,
      dni: this.nuevoAsistenteDni().trim() || '7000••••',
      proyecto: 'Villa Sol · Etapa II',
      lote: this.nuevoAsistenteLote().trim() || 'A-01',
      acompanantes: 1,
      hora: '10:35',
    });
    this.nuevoAsistenteNombre.set('');
    this.nuevoAsistenteDni.set('');
    this.nuevoAsistenteLote.set('');
  }

  reservarCupoBus(bus: BusEntregaFest): void {
    if (bus.ocupados < bus.capacidad) {
      bus.ocupados++;
    }
  }

  readonly directorioAtc = signal<ColaboradorDirectorioAtc[]>(crearDirectorioAtcDemo());
  readonly mensajeDirectorio = signal<string>('');

  actualizarLiderArea(v: ColaboradorDirectorioAtc): void {
    v.lider = v.lider.includes('Mirtha') ? 'Sup. Carlos Zambrano (Nuevo líder)' : 'Sup. Mirtha Delgado';
    v.actualizadoHace = 'actualizado ahora';
    this.mensajeDirectorio.set(
      `Estructura actualizada: ${v.gestor} cambió de líder inmediato → Próximos correos de asignación irán con copia (CC) a ${v.lider}.`,
    );
  }

  registrarRotacion(v: ColaboradorDirectorioAtc): void {
    v.cesadoEnDirectorio = true;
    v.disponible = false;
    v.actualizadoHace = 'rotación registrada';
    this.mensajeDirectorio.set(
      `Rotación registrada: ${v.gestor} fue marcado en rotación/cese → Sus tickets abiertos se habilitan automáticamente para reasignación en bloque.`,
    );
  }
}
