import * as e from "./comun-CVU2GQ4h.js";
import { S as t, c as n, h as r, m as i, n as a, v as o, x as s } from "./prototipo-B6qmgYQk.js";
import { t as ee } from "./FormField-BR5f57fp.js";
import { n as c, t as l } from "./CardBody-WQ8Pzs3R.js";
import { t as u } from "./EmptyState-DMKP8Bhj.js";
import { t as d } from "./Breadcrumb-BtXUT3bJ.js";
import { leerTokenRgb as te, montarGrafoDaniel as f, montarRed2D as ne } from "./escenas-three.js";
import { t as p } from "./Dialog-BcfHiG-J.js";
import { t as m } from "./Table-BJWCycht.js";
import * as h from "./Grafo360-BzaG42VX.js";
//#region src/c360/datos.ts
var g = [
	{
		id: "sigda",
		nombre: "SIGDA / TAXON",
		detalle: "Maestro único del cliente",
		ms: 180
	},
	{
		id: "contr",
		nombre: "Contratos y Activos",
		detalle: "Contrato, unidad, acta",
		ms: 240
	},
	{
		id: "cob",
		nombre: "Cobranza",
		detalle: "Cronograma y pagos",
		ms: 310
	},
	{
		id: "jose",
		nombre: "Motor de Consultas",
		detalle: "Saldos, abonos e independización",
		ms: 220
	},
	{
		id: "repo",
		nombre: "Repositorio S3 / GLI",
		detalle: "Documentos indexados IA",
		ms: 420
	},
	{
		id: "mail",
		nombre: "Correo",
		detalle: "Hilos con el cliente",
		ms: 260
	},
	{
		id: "cti",
		nombre: "Call center CTI",
		detalle: "Llamadas y grabaciones",
		ms: 200
	},
	{
		id: "atc",
		nombre: "Tickets ATC",
		detalle: "Historial y Libro",
		ms: 120
	}
], _ = [
	{
		id: "kyc",
		nombre: "DNI y KYC",
		fuentes: ["sigda"]
	},
	{
		id: "cont",
		nombre: "Contactos",
		fuentes: ["sigda"]
	},
	{
		id: "lote",
		nombre: "Lotes",
		fuentes: ["contr", "sigda"]
	},
	{
		id: "contrato",
		nombre: "Contrato y adendas",
		fuentes: ["contr", "repo"]
	},
	{
		id: "acta",
		nombre: "Acta de entrega",
		fuentes: ["contr"]
	},
	{
		id: "gar",
		nombre: "Garantía",
		fuentes: ["contr"]
	},
	{
		id: "crono",
		nombre: "Cronograma",
		fuentes: ["cob"]
	},
	{
		id: "cuotas",
		nombre: "Cuotas",
		fuentes: ["cob", "jose"]
	},
	{
		id: "saldo",
		nombre: "Saldo por lote",
		fuentes: ["jose"]
	},
	{
		id: "ecta",
		nombre: "Estado de cuenta",
		fuentes: ["cob", "jose"],
		restringidoPara: ["gestor"]
	},
	{
		id: "docs",
		nombre: "Documentos (IA)",
		fuentes: ["repo"],
		semantico: !0
	},
	{
		id: "correos",
		nombre: "Correos",
		fuentes: ["mail"]
	},
	{
		id: "llam",
		nombre: "Llamadas CTI",
		fuentes: ["cti"]
	},
	{
		id: "tick",
		nombre: "Tickets previos",
		fuentes: ["atc"]
	},
	{
		id: "libro",
		nombre: "Reclamos del Libro",
		fuentes: ["atc"]
	},
	{
		id: "expo",
		nombre: "Exposición legal",
		fuentes: ["atc", "cob"],
		restringidoPara: ["gestor"]
	}
], v = [
	{
		k: "eh",
		iniciales: "EH",
		nombre: "Titular de ejemplo",
		doc: "DNI 00000001",
		dni: "00000001",
		telefono: "+51 987 654 321",
		proyecto: "Villa Sol · Etapa II",
		lotes: ["C-07"],
		contratoPrincipal: "VS-2025-0507",
		estadoEmocional: "Tono cordial; consulta por logística de entrega y bus para EntregaFest.",
		sintesisIa: "Cliente al día (13/13 cuotas pagadas). Tiene adenda de cambio al Lote C-07 firmada y entrega programada para EntregaFest del 07-nov-2026. Ticket activo AIN-000486 por cupo en bus.",
		guiaRecomendada: "Confirmación de cupo EntregaFest y envío de pase QR por WhatsApp.",
		datos: {
			kyc: [
				["DNI 00000001", "Verificado en RENIEC / SIGDA"],
				["Estado KYC", "Conforme · 15-ene-2026"],
				["Estado Civil", "Casado · con copropietaria"]
			],
			cont: [
				["titular.ejemplo@ejemplo.test", "Correo verificado"],
				["+51 987 654 321", "Celular principal · Click-to-Call disponible"],
				["Canal preferido", "WhatsApp Corporativo y Mi Portal"]
			],
			lote: [["Lote C-07 · 160.00 m²", "Villa Sol · Etapa II"], ["Mz. C · frente a parque central", "Uso vivienda RDM · Independizado P01489213"]],
			contrato: [
				["Contrato VS-2025-0507", "Vigente · Aybar Inmobiliaria S.A.C."],
				["Adenda N.º 01 cambio de lote", "Firmada el 18-jun-2025 (custodia GLI)"],
				["Notaría / Kardex", "Notaría Gálvez · Kardex K-91820"]
			],
			acta: [["Acta de entrega C-07", "Programada · EntregaFest 07-nov-2026"], ["Hitos de habilitación", "Agua, desagüe y electrificación al 100%"]],
			gar: [["Cobertura postventa", "Inicia con la firma del acta de entrega"], ["Plazo legal previsto", "120 meses estructural / 12 meses acabados"]],
			crono: [
				["Cuota 14 de 60", "S/ 1,180.00"],
				["Próximo vencimiento", "30-oct-2026"],
				["Última cuota", "30-oct-2030 · Banco recaudador BCP"]
			],
			cuotas: [["Cuotas vencidas", "0 (Al día)"], ["Pagadas a tiempo", "13 de 13 letras conciliadas"]],
			saldo: [["Saldo capital C-07", "S/ 54,280.00"], ["Interés moratorio", "S/ 0.00"]],
			ecta: [["Capital pagado", "S/ 15,340.00 + Inicial S/ 12,000.00"], ["Saldo pendiente", "S/ 54,280.00 (47 letras por vencer)"]],
			docs: [
				["Contrato VS-2025-0507.pdf", "Firmado digitalmente · Custodia GLI #99102"],
				["Adenda cambio de lote.pdf", "Fragmento IA: «…se reubica del lote B-11 al lote C-07 manteniendo precio…»"],
				["Voucher cuota 13.jpg", "Conciliado el 29-sep-2026 · Op. BCP #774120"]
			],
			correos: [["«Fecha de entrega de mi lote C-07»", "2 mensajes · 06-oct-2026"], ["«Confirmación de adenda firmada»", "Enviado con constancia · 19-jun-2025"]],
			llam: [["Llamada entrante (3 min 12 s)", "09-oct-2026 · Grabación CTI #9921"]],
			tick: [["AIN-000486 · Cupo bus EntregaFest", "En atención · Administración"], ["AIN-000241 · Consulta de cuenta", "Cerrado en SLA · CSAT 5/5"]],
			libro: [["Sin asientos en Libro", "—"]],
			expo: [["Exposición legal", "S/ 0.00 · Sin riesgo de denuncia"]]
		}
	},
	{
		k: "jr",
		iniciales: "JM",
		nombre: "Jorge Mamani Ccori",
		doc: "DNI 70134409",
		dni: "70134409",
		telefono: "+51 991 224 266",
		proyecto: "Los Álamos de Carabayllo · Etapa I",
		lotes: ["F-03"],
		contratoPrincipal: "LA-2023-0117",
		estadoEmocional: "Frustración alta; mencionó carta notarial en llamada del 13-oct.",
		sintesisIa: "ALERTA CRÍTICA: Acumula 3 cuotas vencidas (S/ 2,940) con caso de resolución contractual suspendido por reclamo activo en Libro (ALT-2026-0042) y ticket ALT-001204 en Eje 3 Legal. Exposición económica estimada: S/ 3,180.",
		guiaRecomendada: "Contención y derivación a Legal con expediente documental completo 6/6.",
		datos: {
			kyc: [["DNI 70134409", "Verificado en SIGDA"], ["Domicilio contractual", "Av. Túpac Amaru 1840, Carabayllo, Lima"]],
			cont: [["jorge.mamani@ejemplo.test", "Correo registrado para notificaciones"], ["+51 991 224 266", "Celular principal · 2 llamadas esta semana"]],
			lote: [["Lote F-03 · 140.00 m²", "Los Álamos de Carabayllo · Etapa I"], ["Partida matriz", "P01322489 · En independización notarial"]],
			contrato: [["Contrato LA-2023-0117", "En evaluación por morosidad (3 meses)"], ["Cláusula 9.ª Resolutoria", "Suspendida temporalmente por reclamo activo ALT-001204"]],
			acta: [["Sin acta de entrega", "Lote pendiente de cancelación de saldo de independización"]],
			gar: [["No aplica aún", "Requiere firma previa del Acta de Entrega"]],
			crono: [["Cuota 22 de 48", "S/ 980.00 mensual"], ["Vencida desde", "15-jul-2026 (Letras 20, 21 y 22 impagas)"]],
			cuotas: [["Cuotas vencidas", "3 cuotas (S/ 2,940.00)"], ["Caso de resolución", "MOR-2026-0019 generado por 3 meses impagos"]],
			saldo: [["Saldo capital F-03", "S/ 25,480.00"]],
			ecta: [["Pagado acumulado", "S/ 20,580.00 (19 letras + inicial)"], ["Mora exigible", "S/ 2,940.00 + S/ 142.00 interés moratorio"]],
			docs: [
				["Contrato LA-2023-0117.pdf", "Fragmento IA: «…cláusula 9: resolución de pleno derecho al 3.er mes impago…»"],
				["Carta de alerta al proyecto.pdf", "Emitida 14-oct-2026 con copia a supervisión"],
				["Reclamo ALT-2026-0042.pdf", "Hoja de reclamación por demora de minuta"]
			],
			correos: [["«Alerta de cancelación de servicios»", "Enviado con constancia el 14-oct-2026"]],
			llam: [["Llamada de 7 min 40 s", "13-oct-2026 · Reclamo grabado CTI #9840"]],
			tick: [["ALT-001204 · Reclamo minuta", "Escalado a Legal (Eje 3)"], ["ALT-001190 · Resolución contrato", "Suspendido por reclamo abierto"]],
			libro: [["Reclamo ALT-2026-0042", "En plazo · vence 03-nov-2026 (15 días hábiles)"]],
			expo: [["Riesgo alto de denuncia", "S/ 3,180.00 (capital + 8% interés legal) · Caso SGD-2026-000318"]]
		}
	},
	{
		k: "lp",
		iniciales: "LP",
		nombre: "Lucía Paredes V.",
		doc: "CE 00451277",
		dni: "00451277",
		telefono: "+51 944 812 731",
		proyecto: "Mirador del Sur",
		lotes: ["C-21"],
		contratoPrincipal: "MS-2025-0210",
		estadoEmocional: "Cliente colaborativa; envió fotografías de fisura por Mi Portal y espera fecha de visita.",
		sintesisIa: "Cuenta con Acta de Entrega del 20-sep-2026 y garantía estructural vigente (120 meses). Inspección técnica programada para el 22-oct-2026 en ticket APV-000412 y garantía GAR-0092.",
		guiaRecomendada: "Confirmar inspección técnica de postventa y enviar acta de visita al cierre.",
		datos: {
			kyc: [["CE 00451277", "Verificado en Migraciones / SIGDA"], ["Estado KYC", "Conforme · Titular única"]],
			cont: [["lucia.paredes@ejemplo.test", "Correo verificado"], ["+51 944 812 731", "WhatsApp activo · Mi Portal habilitado"]],
			lote: [["Lote C-21 · 180.00 m²", "Mirador del Sur · Etapa I"], ["Ubicación", "Esquina Av. Los Precursores · Zonificación RDM"]],
			contrato: [["Contrato MS-2025-0210", "Vigente · cuotas al día"], ["Escritura pública", "Kardex K-44109 · Notaría Paino"]],
			acta: [["Acta de entrega C-21", "Firmada el 20-sep-2026 sin observaciones estructurales"]],
			gar: [["Cobertura estructural (120 m)", "Vigente hasta sep-2036"], ["Reclamo GAR-0092", "Inspección programada 22-oct-2026 (Ing. Pedro L.)"]],
			crono: [["Cuota 9 de 36", "S/ 1,560.00"], ["Próximo vencimiento", "05-nov-2026 · Débito automático Interbank"]],
			cuotas: [["Cuotas vencidas", "0 (Al día · 8/8 pagadas)"]],
			saldo: [["Saldo C-21", "S/ 42,120.00"]],
			ecta: [["Pagado acumulado", "S/ 14,040.00 + Inicial S/ 18,000.00"], ["Saldo por vencer", "S/ 42,120.00"]],
			docs: [
				["Contrato MS-2025-0210.pdf", "Firmado y elevado a Escritura Pública · GLI"],
				["Acta de Entrega C-21.pdf", "Fragmento IA: «…entrega conforme de unidad C-21 con garantía de 10 años…»"],
				["Fotos de fisura en muro.jpg", "Subidas desde Mi Portal el 16-oct-2026"]
			],
			correos: [["«Fisura en muro perimétrico»", "2 mensajes en hilo · Acuse enviado"]],
			llam: [["Sin llamadas recientes", "Prefiere canal Mi Portal / WhatsApp"]],
			tick: [["APV-000412 · Garantía postventa", "En atención · Postventa"]],
			libro: [["Sin reclamos en Libro", "—"]],
			expo: [["Sin riesgo legal", "S/ 0.00 · En cobertura ordinaria postventa"]]
		}
	},
	{
		k: "mq",
		iniciales: "MQ",
		nombre: "María Quispe Huamán",
		doc: "DNI 45218834",
		dni: "45218834",
		telefono: "+51 982 310 445",
		proyecto: "Villa Sol · Etapa II",
		lotes: ["C-14"],
		contratoPrincipal: "VS-2024-0412",
		estadoEmocional: "Preocupada por figurar con mora pese a haber pagado en agente BCP; trato cordial.",
		sintesisIa: "Tiene ticket prioritario con Rayo AIN-000482 en Cobranza. Presentó voucher BCP operación #88231 por S/ 1,250.00 del 28-sep-2026. Requiere conciliación inmediata para habilitar firma de adenda.",
		guiaRecomendada: "Conciliar operación #88231 en Cobranza y emitir constancia de no adeudo hoy.",
		datos: {
			kyc: [["DNI 45218834", "Verificado en RENIEC / SIGDA"], ["Estado KYC", "Conforme · Titular activa"]],
			cont: [["maria.quispe@ejemplo.test", "Correo verificado"], ["+51 982 310 445", "WhatsApp verificado · Envió voucher por chat"]],
			lote: [["Lote C-14 · 150.00 m²", "Villa Sol · Etapa II"], ["Estado físico", "Habilitación urbana concluida · Listo para entrega"]],
			contrato: [["Contrato VS-2024-0412", "Vigente · Aybar Inmobiliaria S.A.C."], ["Adenda en trámite", "Adenda de reprogramación sujeta a validación de cuota 18"]],
			acta: [["Acta de entrega C-14", "Pre-programada para noviembre 2026"]],
			gar: [["Cobertura postventa", "Se activará con la firma del acta de entrega"]],
			crono: [["Cuota 18 de 48", "S/ 1,250.00"], ["Operación en tránsito", "Voucher BCP #88231 en conciliación por Cobranza"]],
			cuotas: [["Cuotas pagadas", "17 conciliadas + 1 en validación bancaria"], ["Prioridad Rayo", "Activada en ticket AIN-000482"]],
			saldo: [["Saldo capital C-14", "S/ 37,500.00"]],
			ecta: [["Pagado acumulado", "S/ 21,250.00"], ["Abono en conciliación", "S/ 1,250.00 (28-sep-2026 · Agente BCP)"]],
			docs: [["Contrato VS-2024-0412.pdf", "Firmado · Custodia GLI #84120"], ["Voucher_BCP_88231.jpg", "Fragmento IA: «…Agente BCP #4102 · Monto S/ 1,250.00 · 28/09/2026…»"]],
			correos: [["«Envío comprobante de pago septiembre»", "Recibido 18-oct-2026"]],
			llam: [["3 llamadas previas registradas", "Última llamada 18-oct-2026 (4 min 05 s)"]],
			tick: [["AIN-000482 · Consulta de cuenta (Rayo)", "En atención · Cobranza (R. Salazar)"]],
			libro: [["Sin asientos en Libro", "—"]],
			expo: [["Exposición legal", "S/ 0.00 · Caso operativo de conciliación"]]
		}
	},
	{
		k: "rh",
		iniciales: "RH",
		nombre: "Rosa Huamán Paredes",
		doc: "DNI 42889102",
		dni: "42889102",
		telefono: "+51 975 118 902",
		proyecto: "Residencial Brisas",
		lotes: ["Torre B-402"],
		contratoPrincipal: "RB-2024-0318",
		estadoEmocional: "Expectante por solución definitiva de filtración antes de temporada de lluvias.",
		sintesisIa: "Propietaria con unidad entregada el 14-nov-2025. Ticket APV-000089 y reclamo de garantía GAR-0091 por impermeabilización en baño principal dentro del plazo de cobertura de 12 meses.",
		guiaRecomendada: "Confirmar cuadrilla de impermeabilización el 22-oct-2026 y firmar acta de conformidad.",
		datos: {
			kyc: [["DNI 42889102", "Verificado en RENIEC / SIGDA"]],
			cont: [["rosa.huaman@ejemplo.test", "Correo verificado"], ["+51 975 118 902", "Celular principal · Autogestión Mi Portal"]],
			lote: [["Dpto. Torre B-402 · 84.50 m²", "Residencial Brisas · Etapa I"], ["Independización", "Inscrita en Partida P01561029 SUNARP"]],
			contrato: [["Contrato RB-2024-0318", "Vigente · Aybar Postventa / Vivienda"], ["Modalidad", "Crédito hipotecario desembolsado 100%"]],
			acta: [["Acta de entrega B-402", "Firmada el 14-nov-2025"]],
			gar: [["Impermeabilización (12 m)", "Vigente hasta 14-nov-2026 (GAR-0091)"], ["Estructural (120 m)", "Vigente hasta 14-nov-2035"]],
			crono: [["Crédito cancelado a inmobiliaria", "100% desembolsado por entidad bancaria"]],
			cuotas: [["Cuotas vencidas", "0 (Cancelado total)"]],
			saldo: [["Saldo inmobiliario", "S/ 0.00"]],
			ecta: [["Precio total cancelado", "S/ 268,000.00"], ["Deuda pendiente", "S/ 0.00"]],
			docs: [
				["Contrato RB-2024-0318.pdf", "Escritura Pública · Custodia GLI"],
				["Acta de Entrega B-402.pdf", "Firmada el 14-nov-2025"],
				["Informe Preliminar GAR-0091.pdf", "Fragmento IA: «…humedad en junta de ducha requiere sellado epóxico…»"]
			],
			correos: [["«Programación de inspección GAR-0091»", "Enviado el 18-oct-2026"]],
			llam: [["Llamada saliente Postventa (2 min 50 s)", "18-oct-2026 · L. Ccahuana"]],
			tick: [["APV-000089 · Garantía postventa", "En atención · Postventa (L. Ccahuana)"]],
			libro: [["Sin asientos en Libro", "—"]],
			expo: [["Exposición baja", "Atención cubierta por fondo de garantía postventa"]]
		}
	},
	{
		k: "hq",
		iniciales: "HQ",
		nombre: "Hernán Quispe Condori",
		doc: "DNI 41902311",
		dni: "41902311",
		telefono: "+51 964 501 887",
		proyecto: "Villa Sol · Etapa II",
		lotes: ["E-19"],
		contratoPrincipal: "VS-2024-0891",
		estadoEmocional: "Solicita fraccionamiento de 3 letras vencidas para evitar resolución contractual.",
		sintesisIa: "Caso MOR-2026-0024 detectado con 3 meses impagos (S/ 3,540.00). Pendiente de despacho de alerta paralela de cancelación de servicios y carta al responsable de proyecto.",
		guiaRecomendada: "Ejecutar alerta preventiva o formalizar compromiso de pago en Comité SGD.",
		datos: {
			kyc: [["DNI 41902311", "Verificado en SIGDA"]],
			cont: [["hernan.quispe@ejemplo.test", "Correo registrado"], ["+51 964 501 887", "Celular principal"]],
			lote: [["Lote E-19 · 160.00 m²", "Villa Sol · Etapa II"]],
			contrato: [["Contrato VS-2024-0891", "En evaluación de resolución por 3 meses impagos"], ["Cláusula 9.ª Resolutoria", "Habilitada · Caso MOR-2026-0024"]],
			acta: [["Sin acta de entrega", "Sujeto a regularización de cartera"]],
			gar: [["No aplica", "Unidad no entregada"]],
			crono: [["Cuota 16 de 60", "S/ 1,180.00"], ["Letras impagas", "Letras 14, 15 y 16 (jul, ago, sep 2026)"]],
			cuotas: [["Cuotas vencidas", "3 cuotas (S/ 3,540.00)"], ["Estado en Mesa Morosidad", "MOR-2026-0024 · DETECTADO"]],
			saldo: [["Saldo capital E-19", "S/ 51,920.00"]],
			ecta: [["Pagado acumulado", "S/ 15,340.00"], ["Mora exigible", "S/ 3,540.00"]],
			docs: [["Contrato VS-2024-0891.pdf", "Firmado · Custodia GLI #81044"], ["Liquidación de mora MOR-2026-0024.pdf", "Emitida por Cobranza el 17-oct-2026"]],
			correos: [["«Recordatorio de vencimiento de 3.ª letra»", "Enviado 05-oct-2026"]],
			llam: [["Llamada saliente Cobranza (5 min 18 s)", "15-oct-2026 · Grabación CTI #9892"]],
			tick: [["AIN-000491 · Solicitud de reprogramación", "Abierto · Cobranza"]],
			libro: [["Sin asientos en Libro", "—"]],
			expo: [["Riesgo contractual medio", "S/ 3,540.00 en mora · Caso MOR-2026-0024"]]
		}
	}
], re = [
	{
		codigo: "VS-2025-0507",
		tipo: "Contrato de Compraventa de Lote Urbano con Reserva de Dominio",
		estado: "VIGENTE",
		empresa: "Aybar Inmobiliaria S.A.C.",
		rucEmpresa: "20601234561",
		clienteNombre: "Titular de ejemplo",
		clienteDoc: "DNI 00000001",
		clienteKey360: "eh",
		proyecto: "Villa Sol",
		etapa: "Etapa II",
		manzanaLote: "Mz. C · Lote 07",
		areaMetros: "160.00 m² (8.00 m × 20.00 m)",
		zonificacion: "RDM · Residencial de Densidad Media",
		linderos: "Frente: Parque Central (8.00 m) · Derecha: Lote C-08 (20.00 m) · Izquierda: Lote C-06 (20.00 m) · Fondo: Lote C-22 (8.00 m)",
		partidaMatrizSunarp: "P01489213 · Zona Registral N.º IX - Sede Lima",
		notaria: "Notaría Gálvez Succar · Lima",
		kardexNotarial: "K-91820-2025",
		fechaSuscripcion: "15 de septiembre de 2025",
		moneda: "PEN",
		precioTotal: "S/ 81,620.00",
		cuotaInicial: "S/ 12,000.00",
		capitalFinanciado: "S/ 69,620.00",
		totalLetras: 60,
		letrasPagadas: 13,
		letrasVencidas: 0,
		saldoPendiente: "S/ 54,280.00",
		moraAcumulada: "S/ 0.00",
		actaEntregaEstado: "Programada para EntregaFest del 07-nov-2026",
		clausulas: [
			{
				numero: "PRIMERA",
				titulo: "Antecedentes y Titularidad Registral del Proyecto",
				contenido: "LA VENDEDORA (Aybar Inmobiliaria S.A.C., RUC 20601234561) es propietaria registral del predio matriz inscrito en la Partida Electrónica N.º P01489213 del Registro de Predios de Lima, donde se desarrolla la Habilitación Urbana denominada «Villa Sol - Etapa II»."
			},
			{
				numero: "SEGUNDA",
				titulo: "Objeto del Contrato e Identificación de la Unidad Inmobiliaria",
				contenido: "Por el presente instrumento, LA VENDEDORA transfiere en compraventa con reserva de propiedad a favor de EL COMPRADOR (Titular de ejemplo, DNI 00000001) el Lote 07 de la Manzana C, con un área superficial de 160.00 m², según Adenda de Reubicación N.º 01."
			},
			{
				numero: "TERCERA",
				titulo: "Precio de Venta, Cuota Inicial y Financiamiento Directo",
				contenido: "El precio total pactado de común acuerdo asciende a S/ 81,620.00 (Ochenta y un mil seiscientos veinte con 00/100 Soles), cancelados mediante una cuota inicial de S/ 12,000.00 y el saldo de S/ 69,620.00 financiado en 60 letras mensuales iguales de S/ 1,180.00 con vencimiento los días 30 de cada mes."
			},
			{
				numero: "NOVENA",
				titulo: "Cláusula Resolutoria Expresa por Incumplimiento (Art. 1430° Código Civil)",
				contenido: "La falta de pago de tres (03) cuotas mensuales consecutivas o alternadas facultará a LA VENDEDORA a resolver de pleno derecho el presente contrato mediante comunicación fehaciente, activando simultáneamente la alerta de cancelación de servicios y notificación a la jefatura del proyecto."
			},
			{
				numero: "DÉCIMA",
				titulo: "Entrega de Posesión, Acta de Entrega y Cómputo de Garantías",
				contenido: "La entrega física de la unidad se formaliza únicamente con la suscripción del Acta de Entrega. A partir de dicha fecha se computan automáticamente los plazos de garantía postventa: diez (10) años para partidas estructurales y doce (12) meses para acabados e instalaciones."
			}
		],
		adendas: [{
			codigo: "ADE-VS-2025-0507-01",
			fecha: "18-jun-2025",
			titulo: "Adenda N.º 01 de Reubicación de Unidad (Lote B-11 a Lote C-07)",
			estado: "FIRMADA",
			resumen: "Reubicación voluntaria del Lote B-11 al Lote C-07 frente a parque central conservando el precio por m² y el cronograma original.",
			detalleClausula: "ACUERDO SEGUNDO: Las partes acuerdan sustituir el objeto de la compraventa por el Lote C-07 (160.00 m²), reconociendo el 100% de las cuotas abonadas a la fecha y manteniendo la cuota mensual en S/ 1,180.00."
		}],
		firmantes: [{
			rol: "REPRESENTANTE_EMPRESA",
			nombre: "Dr. Ernesto Alarcón Vargas (Apoderado Aybar Inmobiliaria S.A.C.)",
			documento: "DNI 09841203 · Partida Poderes N.º 14098211",
			fechaFirma: "15-sep-2025 11:14:22",
			modalidad: "Firma Digital Certificada INDECOPI / GLI",
			hashCustodia: "SHA256:9f84a2c1...77e10b"
		}, {
			rol: "COMPRADOR_TITULAR",
			nombre: "Titular de ejemplo",
			documento: "DNI 00000001",
			fechaFirma: "15-sep-2025 11:18:05",
			modalidad: "Firma Biométrica RENIEC + Token SMS",
			hashCustodia: "SHA256:4c2019be...31a904"
		}],
		cronograma: [
			{
				numero: 11,
				vencimiento: "2026-07-30",
				monto: "S/ 1,180.00",
				estado: "PAGADA",
				fechaPago: "2026-07-29",
				operacion: "BCP-661902"
			},
			{
				numero: 12,
				vencimiento: "2026-08-30",
				monto: "S/ 1,180.00",
				estado: "PAGADA",
				fechaPago: "2026-08-28",
				operacion: "BCP-710498"
			},
			{
				numero: 13,
				vencimiento: "2026-09-30",
				monto: "S/ 1,180.00",
				estado: "PAGADA",
				fechaPago: "2026-09-29",
				operacion: "BCP-774120"
			},
			{
				numero: 14,
				vencimiento: "2026-10-30",
				monto: "S/ 1,180.00",
				estado: "POR_VENCER"
			},
			{
				numero: 15,
				vencimiento: "2026-11-30",
				monto: "S/ 1,180.00",
				estado: "POR_VENCER"
			}
		]
	},
	{
		codigo: "LA-2023-0117",
		tipo: "Contrato de Compraventa de Lote con Cláusula Resolutoria",
		estado: "EN_EVALUACION_RESOLUCION",
		empresa: "Aybar Lotes y Terrenos S.A.C.",
		rucEmpresa: "20601234572",
		clienteNombre: "Jorge Mamani Ccori",
		clienteDoc: "DNI 70134409",
		clienteKey360: "jr",
		proyecto: "Los Álamos de Carabayllo",
		etapa: "Etapa I",
		manzanaLote: "Mz. F · Lote 03",
		areaMetros: "140.00 m² (7.00 m × 20.00 m)",
		zonificacion: "RDM · Residencial de Densidad Media",
		linderos: "Frente: Calle Los Cedros (7.00 m) · Derecha: Lote F-04 (20.00 m) · Izquierda: Lote F-02 (20.00 m) · Fondo: Lote F-18 (7.00 m)",
		partidaMatrizSunarp: "P01322489 · Zona Registral N.º IX - Sede Lima",
		notaria: "Notaría Carpio Vélez · Independencia",
		kardexNotarial: "K-33019-2023",
		fechaSuscripcion: "15 de noviembre de 2023",
		moneda: "PEN",
		precioTotal: "S/ 56,040.00",
		cuotaInicial: "S/ 9,000.00",
		capitalFinanciado: "S/ 47,040.00",
		totalLetras: 48,
		letrasPagadas: 19,
		letrasVencidas: 3,
		saldoPendiente: "S/ 25,480.00",
		moraAcumulada: "S/ 2,940.00 (3 letras impagas: jul, ago, sep 2026)",
		actaEntregaEstado: "Suspendida por morosidad y controversia en Eje 3 Legal",
		clausulas: [
			{
				numero: "PRIMERA",
				titulo: "Partida Matriz y Habilitación Urbana Los Álamos",
				contenido: "Aybar Lotes y Terrenos S.A.C. (RUC 20601234572) desarrolla el proyecto «Los Álamos de Carabayllo - Etapa I» sobre la Partida Matriz P01322489."
			},
			{
				numero: "TERCERA",
				titulo: "Precio y Cronograma de 48 Letras Mensuales",
				contenido: "El precio total de venta es de S/ 56,040.00, pagadero con inicial de S/ 9,000.00 y 48 cuotas mensuales de S/ 980.00 con vencimiento el día 15 de cada mes."
			},
			{
				numero: "NOVENA",
				titulo: "Resolución de Pleno Derecho al 3.er Mes Impago y Suspensión por Reclamo",
				contenido: "El incumplimiento de tres (03) cuotas consecutivas habilita la resolución contractual (Caso MOR-2026-0019). Conforme a la política corporativa de protección al consumidor, la ejecución resolutoria queda en custodia de Eje 3 Legal mientras se resuelve el reclamo vinculado ALT-001204 / Asiento ALT-2026-0042.",
				alerta: "ACTIVA CON SUSPENSIÓN LEGAL: 3 cuotas vencidas (S/ 2,940.00) · Vinculado a Caso SGD-2026-000318."
			}
		],
		adendas: [{
			codigo: "ADE-LA-2023-0117-01",
			fecha: "10-mar-2025",
			titulo: "Adenda de Actualización de Domicilio y Correo de Notificación",
			estado: "FIRMADA",
			resumen: "Actualización de correo electrónico para recepción de estados de cuenta y notificaciones notariales.",
			detalleClausula: "Se fija como correo oficial de notificación jorge.mamani@ejemplo.test."
		}],
		firmantes: [{
			rol: "REPRESENTANTE_EMPRESA",
			nombre: "Dra. Rosario Villavicencio (Apoderada Legal Aybar Lotes y Terrenos S.A.C.)",
			documento: "DNI 10448920",
			fechaFirma: "15-nov-2023 16:40:10",
			modalidad: "Firma Digital Certificada GLI",
			hashCustodia: "SHA256:7a11bc09...8821ef"
		}, {
			rol: "COMPRADOR_TITULAR",
			nombre: "Jorge Mamani Ccori",
			documento: "DNI 70134409",
			fechaFirma: "15-nov-2023 16:45:00",
			modalidad: "Firma Biométrica Presencial Caseta Carabayllo",
			hashCustodia: "SHA256:1d9904fa...55c12e"
		}],
		cronograma: [
			{
				numero: 19,
				vencimiento: "2026-06-15",
				monto: "S/ 980.00",
				estado: "PAGADA",
				fechaPago: "2026-06-15",
				operacion: "BBVA-441092"
			},
			{
				numero: 20,
				vencimiento: "2026-07-15",
				monto: "S/ 980.00",
				estado: "VENCIDA"
			},
			{
				numero: 21,
				vencimiento: "2026-08-15",
				monto: "S/ 980.00",
				estado: "VENCIDA"
			},
			{
				numero: 22,
				vencimiento: "2026-09-15",
				monto: "S/ 980.00",
				estado: "VENCIDA"
			},
			{
				numero: 23,
				vencimiento: "2026-10-15",
				monto: "S/ 980.00",
				estado: "POR_VENCER"
			}
		]
	},
	{
		codigo: "MS-2025-0210",
		tipo: "Escritura Pública de Compraventa e Independización con Garantía Postventa",
		estado: "ENTREGADO_CON_GARANTIA",
		empresa: "Aybar Desarrollos del Sur S.A.C.",
		rucEmpresa: "20601234649",
		clienteNombre: "Lucía Paredes V.",
		clienteDoc: "CE 00451277",
		clienteKey360: "lp",
		proyecto: "Mirador del Sur",
		etapa: "Etapa I",
		manzanaLote: "Mz. C · Lote 21",
		areaMetros: "180.00 m² (9.00 m × 20.00 m)",
		zonificacion: "RDM · Esquina Comercial / Residencial",
		linderos: "Frente: Av. Los Precursores (9.00 m) · Derecha: Calle 4 (20.00 m) · Izquierda: Lote C-20 (20.00 m) · Fondo: Lote C-12 (9.00 m)",
		partidaMatrizSunarp: "P01609412 · Zona Registral N.º IX - Sede Lima",
		notaria: "Notaría Paino · Surquillo",
		kardexNotarial: "K-44109-2025",
		fechaSuscripcion: "20 de enero de 2025",
		moneda: "PEN",
		precioTotal: "S/ 74,160.00",
		cuotaInicial: "S/ 18,000.00",
		capitalFinanciado: "S/ 56,160.00",
		totalLetras: 36,
		letrasPagadas: 8,
		letrasVencidas: 0,
		saldoPendiente: "S/ 42,120.00",
		moraAcumulada: "S/ 0.00",
		actaEntregaEstado: "Firmada el 20-sep-2026 · Garantía estructural vigente hasta 20-sep-2036",
		clausulas: [{
			numero: "PRIMERA",
			titulo: "Transferencia e Independización de Unidad",
			contenido: "Aybar Desarrollos del Sur S.A.C. transfiere a favor de Lucía Paredes V. (CE 00451277) el Lote C-21 de 180.00 m² ubicado en el proyecto Mirador del Sur."
		}, {
			numero: "OCTAVA",
			titulo: "Acta de Entrega y Régimen de Garantías Postventa",
			contenido: "Suscrita el Acta de Entrega con fecha 20-sep-2026, se encuentran activas las coberturas de garantía por 120 meses en partidas estructurales (muros de contención y cimentación) y 12 meses en acabados, bajo las cuales se atiende el expediente GAR-0092 / Ticket APV-000412."
		}],
		adendas: [],
		firmantes: [{
			rol: "REPRESENTANTE_EMPRESA",
			nombre: "Ing. Roberto Castañeda (Apoderado Aybar Desarrollos del Sur S.A.C.)",
			documento: "DNI 08219344",
			fechaFirma: "20-ene-2025 10:05:12",
			modalidad: "Firma Digital Certificada GLI",
			hashCustodia: "SHA256:6b8210cc...9012aa"
		}, {
			rol: "COMPRADOR_TITULAR",
			nombre: "Lucía Paredes V.",
			documento: "CE 00451277",
			fechaFirma: "20-ene-2025 10:12:40",
			modalidad: "Firma Biométrica Notarial",
			hashCustodia: "SHA256:3e7712dd...1904bc"
		}],
		cronograma: [
			{
				numero: 7,
				vencimiento: "2026-09-05",
				monto: "S/ 1,560.00",
				estado: "PAGADA",
				fechaPago: "2026-09-05",
				operacion: "IBK-901241"
			},
			{
				numero: 8,
				vencimiento: "2026-10-05",
				monto: "S/ 1,560.00",
				estado: "PAGADA",
				fechaPago: "2026-10-05",
				operacion: "IBK-948102"
			},
			{
				numero: 9,
				vencimiento: "2026-11-05",
				monto: "S/ 1,560.00",
				estado: "POR_VENCER"
			}
		]
	},
	{
		codigo: "VS-2024-0412",
		tipo: "Contrato de Compraventa de Lote Urbano con Financiamiento",
		estado: "VIGENTE",
		empresa: "Aybar Inmobiliaria S.A.C.",
		rucEmpresa: "20601234561",
		clienteNombre: "María Quispe Huamán",
		clienteDoc: "DNI 45218834",
		clienteKey360: "mq",
		proyecto: "Villa Sol",
		etapa: "Etapa II",
		manzanaLote: "Mz. C · Lote 14",
		areaMetros: "150.00 m² (7.50 m × 20.00 m)",
		zonificacion: "RDM · Residencial de Densidad Media",
		linderos: "Frente: Calle Las Begonias (7.50 m) · Derecha: Lote C-15 · Izquierda: Lote C-13 · Fondo: Lote C-29",
		partidaMatrizSunarp: "P01489213 · Zona Registral N.º IX - Sede Lima",
		notaria: "Notaría Gálvez Succar · Lima",
		kardexNotarial: "K-78102-2024",
		fechaSuscripcion: "28 de marzo de 2024",
		moneda: "PEN",
		precioTotal: "S/ 70,000.00",
		cuotaInicial: "S/ 10,000.00",
		capitalFinanciado: "S/ 60,000.00",
		totalLetras: 48,
		letrasPagadas: 18,
		letrasVencidas: 0,
		saldoPendiente: "S/ 37,500.00",
		moraAcumulada: "S/ 0.00 (Cuota 18 en conciliación con voucher BCP #88231)",
		actaEntregaEstado: "Pre-programada para noviembre 2026",
		clausulas: [{
			numero: "CUARTA",
			titulo: "Recaudación Bancaria y Conciliación de Abonos en Agentes",
			contenido: "Los pagos efectuados en agentes corresponsales BCP se concilian en un plazo máximo de 24 horas hábiles contra la presentación del voucher de operación, liberando automáticamente cualquier bloqueo para suscripción de adendas."
		}],
		adendas: [{
			codigo: "ADE-VS-2024-0412-01",
			fecha: "19-oct-2026",
			titulo: "Adenda de Cambio de Día de Vencimiento Mensual (Día 28 al Día 05)",
			estado: "EN_TRAMITE",
			resumen: "Pendiente de firma digital una vez conciliado el voucher BCP #88231 en el ticket con Rayo AIN-000482.",
			detalleClausula: "Se modifica la fecha de vencimiento de las cuotas 19 a 48 al día 05 de cada mes sin recargo administrativo."
		}],
		firmantes: [{
			rol: "REPRESENTANTE_EMPRESA",
			nombre: "Dr. Ernesto Alarcón Vargas (Apoderado Aybar Inmobiliaria S.A.C.)",
			documento: "DNI 09841203",
			fechaFirma: "28-mar-2024 15:20:00",
			modalidad: "Firma Digital Certificada GLI",
			hashCustodia: "SHA256:5c1902ab...4401cd"
		}, {
			rol: "COMPRADOR_TITULAR",
			nombre: "María Quispe Huamán",
			documento: "DNI 45218834",
			fechaFirma: "28-mar-2024 15:24:18",
			modalidad: "Firma Biométrica RENIEC",
			hashCustodia: "SHA256:8e4410ef...1209fa"
		}],
		cronograma: [
			{
				numero: 16,
				vencimiento: "2026-07-28",
				monto: "S/ 1,250.00",
				estado: "PAGADA",
				fechaPago: "2026-07-28",
				operacion: "BCP-710291"
			},
			{
				numero: 17,
				vencimiento: "2026-08-28",
				monto: "S/ 1,250.00",
				estado: "PAGADA",
				fechaPago: "2026-08-27",
				operacion: "BCP-791044"
			},
			{
				numero: 18,
				vencimiento: "2026-09-28",
				monto: "S/ 1,250.00",
				estado: "PAGADA",
				fechaPago: "2026-09-28",
				operacion: "BCP-88231 (En conciliación)"
			},
			{
				numero: 19,
				vencimiento: "2026-10-28",
				monto: "S/ 1,250.00",
				estado: "POR_VENCER"
			}
		]
	},
	{
		codigo: "RB-2024-0318",
		tipo: "Contrato de Compraventa de Unidad de Vivienda Multifamiliar",
		estado: "ENTREGADO_CON_GARANTIA",
		empresa: "Aybar Postventa S.A.C.",
		rucEmpresa: "20601234616",
		clienteNombre: "Rosa Huamán Paredes",
		clienteDoc: "DNI 42889102",
		clienteKey360: "rh",
		proyecto: "Residencial Brisas",
		etapa: "Torre B",
		manzanaLote: "Torre B · Dpto. 402",
		areaMetros: "84.50 m² techados",
		zonificacion: "RDA · Residencial de Densidad Alta",
		linderos: "Nivel 4 · Frente a área común central · Ascensor par/impar",
		partidaMatrizSunarp: "P01561029 · Zona Registral N.º IX - Sede Lima",
		notaria: "Notaría Tambini Ávila · San Isidro",
		kardexNotarial: "K-61209-2024",
		fechaSuscripcion: "10 de mayo de 2024",
		moneda: "PEN",
		precioTotal: "S/ 268,000.00",
		cuotaInicial: "S/ 40,200.00",
		capitalFinanciado: "S/ 227,800.00 (Desembolso Hipotecario)",
		totalLetras: 1,
		letrasPagadas: 1,
		letrasVencidas: 0,
		saldoPendiente: "S/ 0.00",
		moraAcumulada: "S/ 0.00",
		actaEntregaEstado: "Firmada el 14-nov-2025 · Garantía de impermeabilización vigente (GAR-0091)",
		clausulas: [{
			numero: "SÉPTIMA",
			titulo: "Cobertura de Garantías Postventa por Partida Constructiva",
			contenido: "A partir del Acta de Entrega del 14-nov-2025, la unidad cuenta con 12 meses de garantía en instalaciones sanitarias e impermeabilización y 120 meses en estructura sismorresistente."
		}],
		adendas: [],
		firmantes: [{
			rol: "REPRESENTANTE_EMPRESA",
			nombre: "Ing. Roberto Castañeda (Apoderado Aybar Postventa S.A.C.)",
			documento: "DNI 08219344",
			fechaFirma: "10-may-2024 12:00:00",
			modalidad: "Firma Digital Certificada GLI",
			hashCustodia: "SHA256:2a9012bc...7712de"
		}, {
			rol: "COMPRADOR_TITULAR",
			nombre: "Rosa Huamán Paredes",
			documento: "DNI 42889102",
			fechaFirma: "10-may-2024 12:08:15",
			modalidad: "Firma Biométrica Notarial",
			hashCustodia: "SHA256:9b1140ef...6610ab"
		}],
		cronograma: [{
			numero: 1,
			vencimiento: "2024-05-25",
			monto: "S/ 227,800.00",
			estado: "PAGADA",
			fechaPago: "2024-05-24",
			operacion: "HIP-BCP-110294"
		}]
	},
	{
		codigo: "VS-2024-0891",
		tipo: "Contrato de Compraventa de Lote Urbano con Cláusula Resolutoria",
		estado: "EN_EVALUACION_RESOLUCION",
		empresa: "Aybar Inmobiliaria S.A.C.",
		rucEmpresa: "20601234561",
		clienteNombre: "Hernán Quispe Condori",
		clienteDoc: "DNI 41902311",
		clienteKey360: "hq",
		proyecto: "Villa Sol",
		etapa: "Etapa II",
		manzanaLote: "Mz. E · Lote 19",
		areaMetros: "160.00 m² (8.00 m × 20.00 m)",
		zonificacion: "RDM · Residencial de Densidad Media",
		linderos: "Frente: Av. Colectora Norte (8.00 m) · Derecha: Lote E-20 · Izquierda: Lote E-18 · Fondo: Lote E-04",
		partidaMatrizSunarp: "P01489213 · Zona Registral N.º IX - Sede Lima",
		notaria: "Notaría Gálvez Succar · Lima",
		kardexNotarial: "K-84910-2024",
		fechaSuscripcion: "20 de junio de 2024",
		moneda: "PEN",
		precioTotal: "S/ 82,800.00",
		cuotaInicial: "S/ 12,000.00",
		capitalFinanciado: "S/ 70,800.00",
		totalLetras: 60,
		letrasPagadas: 13,
		letrasVencidas: 3,
		saldoPendiente: "S/ 51,920.00",
		moraAcumulada: "S/ 3,540.00 (Caso MOR-2026-0024 activo)",
		actaEntregaEstado: "Suspendida por morosidad de 3 cuotas",
		clausulas: [{
			numero: "NOVENA",
			titulo: "Activación de Flujo de Morosidad 3 Meses y Alerta Paralela al Proyecto",
			contenido: "Al acumularse tres (03) letras vencidas (cuotas 14, 15 y 16), el sistema genera el expediente MOR-2026-0024 para envío simultáneo de alerta de cancelación de servicios y carta formal a la Arq. Claudia Mendoza (Responsable del Proyecto) con copia a Supervisión ATC.",
			alerta: "PENDIENTE DE DESPACHO EN MESA SGD: 3 cuotas impagas (S/ 3,540.00)."
		}],
		adendas: [],
		firmantes: [{
			rol: "REPRESENTANTE_EMPRESA",
			nombre: "Dr. Ernesto Alarcón Vargas (Apoderado Aybar Inmobiliaria S.A.C.)",
			documento: "DNI 09841203",
			fechaFirma: "20-jun-2024 14:10:00",
			modalidad: "Firma Digital Certificada GLI",
			hashCustodia: "SHA256:3f8812ab...9912cd"
		}, {
			rol: "COMPRADOR_TITULAR",
			nombre: "Hernán Quispe Condori",
			documento: "DNI 41902311",
			fechaFirma: "20-jun-2024 14:15:40",
			modalidad: "Firma Biométrica RENIEC",
			hashCustodia: "SHA256:7d2201ef...4410ab"
		}],
		cronograma: [
			{
				numero: 13,
				vencimiento: "2026-06-20",
				monto: "S/ 1,180.00",
				estado: "PAGADA",
				fechaPago: "2026-06-20",
				operacion: "BCP-551920"
			},
			{
				numero: 14,
				vencimiento: "2026-07-20",
				monto: "S/ 1,180.00",
				estado: "VENCIDA"
			},
			{
				numero: 15,
				vencimiento: "2026-08-20",
				monto: "S/ 1,180.00",
				estado: "VENCIDA"
			},
			{
				numero: 16,
				vencimiento: "2026-09-20",
				monto: "S/ 1,180.00",
				estado: "VENCIDA"
			},
			{
				numero: 17,
				vencimiento: "2026-10-20",
				monto: "S/ 1,180.00",
				estado: "POR_VENCER"
			}
		]
	}
], ie = [
	{
		q: "adenda de cambio de lote",
		nodo: "docs",
		explicacion: "Búsqueda semántica: localiza «Adenda cambio de lote.pdf» en el repositorio documental por significado."
	},
	{
		q: "cuotas vencidas y resolución",
		nodo: "cuotas",
		explicacion: "Búsqueda semántica: cruza cronograma de Cobranza y estado de pagos del lote."
	},
	{
		q: "fecha de entrega y garantía",
		nodo: "acta",
		explicacion: "Búsqueda semántica: ubica el Acta de Entrega y periodo de cobertura postventa."
	}
], y = {
	kyc: {
		etiqueta: "Ver contrato y titulares",
		destino: "contrato",
		moduloNombre: "Visor de Contrato Inmobiliario"
	},
	cont: {
		etiqueta: "Ver tickets del cliente",
		destino: "bandeja",
		moduloNombre: "Bandeja y Avance Diario"
	},
	lote: {
		etiqueta: "Ver ficha técnica y contrato",
		destino: "contrato",
		moduloNombre: "Visor de Contrato Inmobiliario"
	},
	contrato: {
		etiqueta: "Abrir contrato y adendas",
		destino: "contrato",
		moduloNombre: "Visor de Contrato Inmobiliario"
	},
	acta: {
		etiqueta: "Ir a EntregaFest en Vivo",
		destino: "evento",
		moduloNombre: "EntregaFest en Vivo"
	},
	gar: {
		etiqueta: "Ir a Garantías Postventa",
		destino: "garantias",
		moduloNombre: "Garantías Postventa"
	},
	crono: {
		etiqueta: "Ver cronograma en contrato",
		destino: "contrato",
		moduloNombre: "Visor de Contrato Inmobiliario"
	},
	cuotas: {
		etiqueta: "Ir a Comité SGD y Morosidad",
		destino: "sgd",
		moduloNombre: "Comité y Casos SGD"
	},
	saldo: {
		etiqueta: "Ver liquidación en contrato",
		destino: "contrato",
		moduloNombre: "Visor de Contrato Inmobiliario"
	},
	ecta: {
		etiqueta: "Ir a Comité y Casos SGD",
		destino: "sgd",
		moduloNombre: "Comité y Casos SGD"
	},
	docs: {
		etiqueta: "Abrir contrato y custodia GLI",
		destino: "contrato",
		moduloNombre: "Visor de Contrato Inmobiliario"
	},
	correos: {
		etiqueta: "Abrir hilo en detalle de ticket",
		destino: "detalle",
		moduloNombre: "Detalle del Ticket"
	},
	llam: {
		etiqueta: "Abrir ticket y grabación CTI",
		destino: "detalle",
		moduloNombre: "Detalle del Ticket"
	},
	tick: {
		etiqueta: "Filtrar tickets en Bandeja",
		destino: "bandeja",
		moduloNombre: "Bandeja y Avance Diario"
	},
	libro: {
		etiqueta: "Ir a Libro de Reclamaciones",
		destino: "libro",
		moduloNombre: "Libro e INDECOPI"
	},
	expo: {
		etiqueta: "Ir a Comité SGD y Riesgo Legal",
		destino: "sgd",
		moduloNombre: "Comité y Casos SGD"
	}
}, ae = {
	sigda: {
		hu: "Identidad única, KYC y Contratos",
		rfRn: "Maestro único de clientes sin duplicidad local",
		entidadDep: "SIGDA / TAXON · Maestro Corporativo",
		inputReal: "DNI/CE/RUC o teléfono: devuelve identificador del titular, KYC, contratos y contacto maestro."
	},
	contr: {
		hu: "Inventario inmobiliario y postventa",
		rfRn: "Consulta en línea de lotes, contratos, actas y vigencia de garantías",
		entidadDep: "Contratos y Activos Inmobiliarios",
		inputReal: "Código de cliente / lote: devuelve manzana-lote, contrato, acta de entrega firmada y meses de garantía."
	},
	cob: {
		hu: "Financiamiento, letras y cobranza",
		rfRn: "Visibilidad de cronogramas, saldos y alertas de morosidad",
		entidadDep: "Sistema de Cobranza y Cartera",
		inputReal: "Contrato / lote: devuelve cronograma, letras vencidas, mora, saldo y alerta de 3 meses impagos."
	},
	jose: {
		hu: "Motor de Consultas en Línea",
		rfRn: "Respuestas consolidadas en tiempo real sin copia local",
		entidadDep: "API Motor de Consultas",
		inputReal: "Tipo de consulta + lote: responde saldo, próxima cuota, último pago y estado del contrato, según el rol."
	},
	repo: {
		hu: "Expediente digital y búsqueda semántica",
		rfRn: "Indexación inteligente por significado sobre documentos",
		entidadDep: "Repositorio Documental S3 / GLI",
		inputReal: "Consulta en lenguaje natural o cliente: devuelve minutas, adendas, planos y cargos con relevancia %."
	},
	mail: {
		hu: "Comunicaciones oficiales y notificaciones",
		rfRn: "Trazabilidad de correos, cargos y cartas de resolución",
		entidadDep: "Servidor de Correo Corporativo",
		inputReal: "Correo del cliente / ticket: devuelve hilos enviados/recibidos y cartas de resolución de contrato."
	},
	cti: {
		hu: "Telefonía integrada y grabaciones",
		rfRn: "Llamada directa desde ficha y vínculo automático de audio",
		entidadDep: "Central Telefónica CTI",
		inputReal: "Teléfono del titular: inicia llamada saliente y vincula la grabación de audio al ticket."
	},
	atc: {
		hu: "Historial de atención, Libro y Comité SGD",
		rfRn: "Consolidado de tickets, hojas de reclamación y riesgo legal",
		entidadDep: "Motor Central Aybar Atiende",
		inputReal: "Identificador del cliente: devuelve historial de tickets ATC, asientos del Libro y exposición legal SGD."
	}
}, oe = {
	kyc: {
		hu: "Identificación y verificación del titular",
		rfRn: "Validación contra el registro único corporativo",
		entidadDep: "SIGDA · Maestro de Clientes",
		inputReal: "DNI/CE/RUC validado contra el maestro; si no figura, habilita el registro controlado de Interesado."
	},
	cont: {
		hu: "Canales de contacto y telefonía directa",
		rfRn: "Preferencia de canal y enlace telefónico directo",
		entidadDep: "SIGDA · Central Telefónica CTI",
		inputReal: "Teléfono verificado (Click-to-Call), correo titular y canal preferido de notificación."
	},
	lote: {
		hu: "Ubicación y ficha técnica de unidades",
		rfRn: "Trazabilidad por manzana, lote y habilitación urbana",
		entidadDep: "Contratos y Activos · Unidades",
		inputReal: "Proyecto inmobiliario, etapa, manzana-lote, metraje y estado de habilitación urbana."
	},
	contrato: {
		hu: "Estado contractual, minutas y adendas",
		rfRn: "Seguimiento de firmas y causales de resolución",
		entidadDep: "SIGDA · Repositorio Documental S3/GLI",
		inputReal: "Estado de minuta/adenda, modalidad de venta y causal de resolución si supera 3 meses impagos."
	},
	acta: {
		hu: "Hito formal de entrega de unidad",
		rfRn: "Fecha base para el cómputo de garantías de postventa",
		entidadDep: "Contratos y Activos · Actas de Entrega",
		inputReal: "Fecha de firma de acta de entrega (hito que inicia el cómputo de garantías de postventa)."
	},
	gar: {
		hu: "Cobertura de garantías por partida",
		rfRn: "Cálculo automático de vigencia en meses",
		entidadDep: "Contratos y Activos · Matriz de Garantías",
		inputReal: "Cálculo automático en meses desde el acta para infraestructura y acabados (vigente / vencida)."
	},
	crono: {
		hu: "Calendario de pagos y letras",
		rfRn: "Sincronización en línea con cartera y recaudación",
		entidadDep: "Cobranza · Motor de Consultas",
		inputReal: "Total de letras del financiamiento, letras canceladas, fecha de próximo vencimiento y banco."
	},
	cuotas: {
		hu: "Control de morosidad y vencimientos",
		rfRn: "Alerta temprana por acumulación de letras impagas",
		entidadDep: "Sistema de Cobranza",
		inputReal: "Letras vencidas, días de mora y disparo automático de alerta si llega a 3 cuotas impagas."
	},
	saldo: {
		hu: "Posición de deuda y liquidación",
		rfRn: "Cálculo actualizado de capital e intereses",
		entidadDep: "Cobranza · Motor de Consultas",
		inputReal: "Saldo capital financiado, intereses moratorios y monto de liquidación al día."
	},
	ecta: {
		hu: "Detalle reservado de movimientos financieros",
		rfRn: "Control de acceso por perfil del usuario",
		entidadDep: "Cobranza · Motor de Consultas",
		inputReal: "Detalle financiero reservado: total pagado, saldo pendiente y días de mora; se muestra según el permiso del rol."
	},
	docs: {
		hu: "Buscador inteligente de documentos",
		rfRn: "Búsqueda semántica por significado en lenguaje natural",
		entidadDep: "Repositorio Documental S3 / GLI",
		inputReal: "Búsqueda vectorial sobre contratos, adendas, planos y cartas notariales sin recordar el nombre exacto."
	},
	correos: {
		hu: "Bandeja histórica de comunicaciones",
		rfRn: "Evidencia de notificaciones y cargos enviados",
		entidadDep: "Servidor de Correo Corporativo",
		inputReal: "Historial de correos enviados/recibidos con el cliente y notificaciones formales con cargo."
	},
	llam: {
		hu: "Trazabilidad de llamadas y grabaciones",
		rfRn: "Asociación automática de audio a la atención",
		entidadDep: "Central Telefónica CTI",
		inputReal: "Registro de llamadas entrantes/salientes, duración, agente y grabación vinculada al ticket."
	},
	tick: {
		hu: "Expedientes de atención multicanal",
		rfRn: "Un casillero independiente por cada consulta",
		entidadDep: "Motor de Tickets ATC",
		inputReal: "Tickets históricos y activos del cliente (casillero único por consulta, SLA y estado)."
	},
	libro: {
		hu: "Quejas y reclamos de consumo (Ley 29571)",
		rfRn: "Control de plazo legal de 15 días hábiles",
		entidadDep: "Libro de Reclamaciones INDECOPI",
		inputReal: "Hojas de reclamación (Queja / Reclamo), plazo legal INDECOPI, prórroga única y cargo de respuesta."
	},
	expo: {
		hu: "Evaluación de riesgo legal y regulatorio",
		rfRn: "Acceso controlado por perfil y custodia 6/6",
		entidadDep: "Mesa SGD · Handoff Legal",
		inputReal: "Riesgo regulatorio/judicial y paquete documental 6/6 (solo Supervisor, Legal y Mesa SGD)."
	}
}, b = e.Ii(), x = b.createElement;
b.Fragment;
var { useState: S, useEffect: C, useMemo: w, useRef: T, useCallback: se, lazy: ce, Suspense: le } = b, E = {
	Button: e.Ai,
	Badge: e.$r,
	Tag: e.Qr,
	Alert: e.Gr,
	PageHeader: e.Nr,
	CardHeader: r,
	CardPairs: i,
	SegmentedControl: a,
	SearchInput: o,
	Tabs: n,
	Select: s,
	Card: c,
	CardBody: l,
	Breadcrumb: d,
	FormField: ee,
	Dialog: p,
	Table: m,
	EmptyState: u,
	Icono: t
}, D = (...e) => e.filter(Boolean).join(" "), O = ({ gap: e = "4", className: t, children: n, ...r }) => x("div", {
	...r,
	className: D("ay-stack", `ay-stack--${e}`, t)
}, n), k = ({ gap: e = "2", ajuste: t, justificar: n, className: r, children: i, ...a }) => x("div", {
	...a,
	className: D("ay-row", `ay-row--${e}`, t && "ay-row--wrap", n && n !== "start" && `ay-row--${n}`, r)
}, i), ue = ({ columnas: e, gap: t = "md", className: n, children: r, ...i }) => x("div", {
	...i,
	className: D("ay-grid", e && `ay-grid--${e}`, `ay-grid--gap-${t}`, n)
}, r), A = ({ as: e = "span", estilo: t = "body", size: n, className: r, style: i, children: a, ...o }) => x(e, {
	...o,
	className: D("ay-text", `ay-text--${t}`, r),
	style: n ? {
		...i,
		fontSize: `var(--aybar-font-size-${n})`
	} : i
}, a), de = ({ espaciado: e = "md" }) => x("hr", {
	className: D("ay-divider", `ay-divider--${e}`),
	"aria-hidden": "true"
}), fe = ({ nombre: e, size: t = "md" }) => x("span", { className: D("ay-avatar", `ay-avatar--${t}`, "ay-avatar--circle") }, x("span", {
	className: "ay-avatar__initials",
	"aria-hidden": "true"
}, e.split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]).join("").toUpperCase()), x("span", { className: "ay-visually-hidden" }, e)), pe = "Restringido para tu rol", j = (e) => [
	e.proyecto,
	e.etapa,
	e.manzanaLote
].filter(Boolean).join(" · ");
function me(e, t) {
	let n = t ? e.letrasVencidas > 0 ? `${e.letrasPagadas}/${e.totalLetras} pagadas · ${e.letrasVencidas} vencidas (${e.moraAcumulada})` : `${e.letrasPagadas}/${e.totalLetras} pagadas · ${e.actaEntregaEstado}` : `${pe} · ${e.actaEntregaEstado}`;
	return [
		["Empresa Vendedora", `${e.empresa} (RUC ${e.rucEmpresa})`],
		["Titular / Comprador", `${e.clienteNombre} (${e.clienteDoc})`],
		["Proyecto y Unidad", `${j(e)} (${e.areaMetros})`],
		["Registro SUNARP y Notaría", `Partida ${e.partidaMatrizSunarp} · ${e.notaria} (${e.kardexNotarial})`],
		["Posición Financiera", t ? `Total: ${e.precioTotal} · Inicial: ${e.cuotaInicial} · Saldo: ${e.saldoPendiente}` : pe],
		["Letras y Entrega", n]
	];
}
var he = (e) => [
	{
		value: "clausulas",
		label: "Cláusulas y Linderos",
		count: e.clausulas.length
	},
	{
		value: "adendas",
		label: "Adendas GLI",
		count: e.adendas.length
	},
	{
		value: "firmantes",
		label: "Firmas y Custodia",
		count: e.firmantes.length
	},
	{
		value: "cronograma",
		label: "Cronograma de Pagos",
		count: e.cronograma.length
	}
], M = (e) => x(A, {
	estilo: "mono",
	size: "xs"
}, e), ge = [
	{
		key: "rol",
		header: "Rol Contractual",
		render: (e) => x(E.Badge, {
			size: "sm",
			tone: e.rol === "REPRESENTANTE_EMPRESA" ? "info" : "success"
		}, e.rol)
	},
	{
		key: "nombre",
		header: "Nombre y Documento",
		render: (e) => x(O, { gap: "1" }, x("strong", null, e.nombre), M(e.documento))
	},
	{
		key: "fechaFirma",
		header: "Fecha y Hora de Firma",
		render: (e) => M(e.fechaFirma)
	},
	{
		key: "modalidad",
		header: "Modalidad de Certificación"
	},
	{
		key: "hashCustodia",
		header: "Hash SHA-256 Custodia GLI",
		render: (e) => M(e.hashCustodia)
	}
], _e = [
	{
		key: "numero",
		header: "N.º Letra",
		render: (e) => x(A, {
			as: "strong",
			estilo: "mono",
			size: "xs"
		}, `Letra #${e.numero}`)
	},
	{
		key: "vencimiento",
		header: "Vencimiento",
		render: (e) => M(e.vencimiento)
	},
	{
		key: "monto",
		header: "Importe",
		align: "end",
		render: (e) => x("strong", null, e.monto)
	},
	{
		key: "estado",
		header: "Estado",
		render: (e) => x(E.Badge, {
			size: "sm",
			tone: e.estado === "PAGADA" ? "success" : e.estado === "VENCIDA" ? "danger" : "info"
		}, e.estado)
	},
	{
		key: "fechaPago",
		header: "Fecha de Pago",
		render: (e) => M(e.fechaPago ?? "—")
	},
	{
		key: "operacion",
		header: "Operación Conciliada",
		render: (e) => M(e.operacion ?? "Pendiente de abono")
	}
];
function ve(e, t, n) {
	return t === "clausulas" ? x(O, { gap: "3" }, x(E.Alert, {
		tone: "info",
		size: "sm",
		title: `Zonificación y Linderos (${e.zonificacion})`
	}, e.linderos), e.clausulas.map((e) => x(E.Card, { key: e.numero }, x(E.CardHeader, {
		title: `${e.numero} CLÁUSULA — ${e.titulo}`,
		as: "h4",
		divider: !0,
		actions: e.alerta ? x(E.Badge, {
			size: "sm",
			tone: "danger"
		}, e.alerta) : void 0
	}), x(E.CardBody, { padding: "sm" }, x(A, {
		as: "p",
		estilo: "body",
		size: "sm"
	}, e.contenido))))) : t === "adendas" ? x(O, { gap: "3" }, e.adendas.length ? e.adendas.map((e) => x(E.Card, { key: e.codigo }, x(E.CardHeader, {
		title: `${e.codigo} · ${e.titulo}`,
		subtitle: `Fecha de suscripción: ${e.fecha}`,
		as: "h4",
		divider: !0,
		actions: x(E.Badge, {
			size: "sm",
			tone: e.estado === "FIRMADA" ? "success" : "warning"
		}, e.estado)
	}), x(E.CardBody, {
		padding: "sm",
		gap: "sm"
	}, x(A, {
		as: "strong",
		estilo: "label",
		size: "sm"
	}, e.resumen), x(A, {
		as: "p",
		estilo: "body",
		size: "sm"
	}, e.detalleClausula)))) : x(E.EmptyState, {
		size: "compact",
		title: "Sin adendas modificatorias",
		description: `Se rige íntegramente por la minuta matriz firmada el ${e.fechaSuscripcion}.`
	})) : t === "firmantes" ? x(E.Table, {
		caption: "Firmantes y custodia criptográfica del contrato",
		columns: ge,
		striped: !0,
		rows: e.firmantes.map((e, t) => ({
			...e,
			id: `f${t}`
		}))
	}) : n ? x(E.Table, {
		caption: "Cronograma de letras y estado de conciliación",
		columns: _e,
		striped: !0,
		rows: e.cronograma.map((e) => ({
			...e,
			id: `l${e.numero}`
		}))
	}) : x(E.Alert, {
		tone: "warning",
		size: "sm",
		title: x("span", { className: "pt-en-linea" }, x(E.Icono, {
			name: "lock",
			size: 16
		}), " Cronograma restringido")
	}, "Tu rol no ve las cuotas ni el estado de cuenta del cliente.");
}
function ye(e) {
	let t = e.contratos.find((t) => t.codigo === e.codigo) ?? e.contratos[0];
	return !e.abierto || !t ? null : x(E.Dialog, {
		open: !0,
		size: "lg",
		"data-c360-visor": "",
		title: `Expediente Contractual Inmobiliario · ${t.codigo}`,
		onOpenChange: (t) => {
			t || e.alCerrar();
		}
	}, x(O, { gap: "4" }, x(E.Card, null, x(E.CardBody, {
		padding: "sm",
		gap: "sm"
	}, x(k, {
		gap: "3",
		justificar: "between",
		ajuste: !0
	}, x(O, { gap: "1" }, x(A, {
		estilo: "label",
		size: "xs"
	}, "Seleccionar expediente contractual (SIGDA / GLI)"), x(k, {
		gap: "2",
		ajuste: !0
	}, e.contratos.map((n) => x(E.Button, {
		key: n.codigo,
		size: "sm",
		variant: t.codigo === n.codigo ? "primary" : "secondary",
		"aria-pressed": t.codigo === n.codigo,
		onClick: () => e.alElegir(n.codigo)
	}, `${n.codigo} · ${n.manzanaLote}`)))), x(k, {
		gap: "2",
		ajuste: !0
	}, x(E.Badge, { tone: t.estado === "VIGENTE" ? "success" : t.estado === "EN_EVALUACION_RESOLUCION" ? "danger" : "info" }, t.estado), x(E.Badge, { tone: "neutral" }, t.tipo))))), x(E.Card, null, x(E.CardHeader, {
		title: "Ficha Registral y Financiera",
		subtitle: j(t),
		as: "h3",
		divider: !0
	}), x(E.CardBody, { padding: "sm" }, x(E.CardPairs, { pairs: me(t, e.verFinanzas) }))), x(E.Tabs, {
		"aria-label": "Secciones del expediente contractual",
		variant: "underline",
		size: "sm",
		items: he(t),
		value: e.pestana,
		onValueChange: (t) => {
			(t === "clausulas" || t === "adendas" || t === "firmantes" || t === "cronograma") && e.alCambiarPestana(t);
		}
	}, ve(t, e.pestana, e.verFinanzas)), x(de, { espaciado: "none" }), x(k, {
		gap: "2",
		justificar: "between",
		ajuste: !0
	}, x(A, {
		estilo: "body",
		size: "xs"
	}, `Expediente digital sincronizado con Repositorio S3 / GLI (Kardex ${t.kardexNotarial})`), x(k, {
		gap: "2",
		ajuste: !0
	}, e.verBandeja ? x(E.Button, {
		size: "sm",
		variant: "secondary",
		onClick: e.verBandeja
	}, "Ver tickets del titular en Bandeja") : null, e.verFinanzas && t.letrasVencidas >= 3 && e.irMorosidad ? x(E.Button, {
		size: "sm",
		variant: "danger",
		onClick: e.irMorosidad
	}, "Ir a Mesa de Morosidad 3 Meses") : null, x(E.Button, {
		size: "sm",
		variant: "primary",
		onClick: e.alCerrar
	}, "Cerrar visor")))));
}
//#endregion
//#region src/c360/estilos.ts
var be = "\n.pl-c360.pt-pagina--ancha{max-inline-size:none}\n.pl-c360 .pt-escena-wrap{position:relative;inline-size:100%;min-inline-size:0;border-radius:var(--aybar-radius-lg);overflow:hidden}\n.pl-c360 .pt-escena-grafo{position:relative;inline-size:100%;min-inline-size:0;border-radius:var(--aybar-radius-lg);border:var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);background:var(--aybar-color-bg-surface-sunken);overflow:hidden}\n.pl-c360 .pt-escena-grafo[hidden],.pl-c360 .atc-astra-canvas[hidden]{display:none !important}\n.pl-c360 .pt-escena-grafo canvas{display:block;inline-size:100%}\n.pl-c360 .atc-astra-canvas{display:block;inline-size:100%;block-size:calc(var(--aybar-space-4) * 35)}\n.pl-c360 .pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}\n.pl-c360 .ay-segmented:not(.ay-segmented--fill){min-inline-size:0;flex-shrink:0}\n.pl-c360 .ay-row>.ay-search{flex:1 1 calc(var(--aybar-space-16) * 3);max-inline-size:none}\n.pl-c360 .ay-row>.ay-selectwrap{inline-size:auto}\n.pl-c360 .ay-grid>.ay-card{cursor:pointer}\n/* cabecera como ay-page-header de ui-angular en la consola de Daniel: panel de superficie, migas sin sangría y el estado\n   (ayEstado) en su propia línea bajo el título */\n.pl-c360 .ay-pageheader{background:var(--aybar-color-bg-surface)}\n.pl-c360 .ay-pageheader>.ay-pageheader__row{padding-inline:clamp(var(--aybar-space-4),(100vw - var(--aybar-breakpoint-md)) * 10000,var(--aybar-space-6))}\n.pl-c360 .ay-pageheader__title>.ay-row{flex-basis:100%}\n/* visor de contratos: el Dialog del artifact con las medidas de ay-modal size=\"lg\" de ui-angular (va en un portal, fuera de .pl-c360) */\n.ay-dialog[data-c360-visor]{inline-size:min(calc(var(--aybar-space-4) * 48),calc(100vw - var(--aybar-space-8)));max-inline-size:none;max-block-size:calc(100vh - var(--aybar-space-16));background:var(--aybar-color-bg-surface)}\n.ay-dialog[data-c360-visor] .ay-dialog__header{padding:var(--aybar-space-6) var(--aybar-space-6) var(--aybar-space-4);border-block-end:0}\n.ay-dialog[data-c360-visor] .ay-dialog__body{padding:0 var(--aybar-space-6) var(--aybar-space-6);font-size:var(--aybar-font-size-sm);line-height:var(--aybar-font-leading-relaxed)}\n.ay-dialog[data-c360-visor] .ay-card__pairs dd{overflow-wrap:anywhere}\n", xe = !1;
function Se() {
	if (xe || typeof document > "u" || (xe = !0, document.getElementById("c360-daniel-estilos"))) return;
	let e = document.createElement("style");
	e.id = "c360-daniel-estilos", e.textContent = be, document.head.append(e);
}
//#endregion
//#region src/c360/modelo.ts
var N = e.E, Ce = () => ({
	datos: e.k().datos,
	persona: e.A()
}), we = (t, n = "info") => e.Wr({
	message: t,
	tone: n
}), Te = (e, t, n) => h.__vista360(e, t, n), Ee = (t) => e.Kn(t), De = (t) => e.Ut(t), Oe = (t) => e.qn(t), ke = (t) => e.At(t), Ae = (t, n) => !!e.sn[t]?.(n), je = e.yt, Me = (e) => h.__fuentes360.find((t) => t.id === e)?.fuente ?? null, Ne = (t, n) => {
	let r = Me(t);
	r && e.O.fuente(r, n);
};
function Pe(t) {
	let n = e.Q.find((e) => e.id === t.garantias[0]?.entregaId)?.clienteId, r = [
		"cli-001",
		t.casosResolucion[0]?.clienteId,
		n,
		"cli-014",
		"cli-022",
		"cli-012",
		"cli-009"
	];
	return [...new Set(r.filter((e) => !!e))].map(Ee).filter((e) => !!e);
}
var Fe = (e) => Math.max(0, Number.parseInt(e.replace(/\D/g, ""), 10) - 1 || 0), Ie = (e) => e.split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]).join("").toUpperCase(), Le = (e) => e.split(" · ")[0] ?? e, Re = (e) => e.split(" · ").slice(1).join(" · ") || e, ze = (e) => e.estado !== "CLOSED" && e.estado !== "RESOLVED", Be = (e, t, n) => h.__ticketCon360(e, t, n), Ve = (e, t) => h.__sintesis360(e, t), He = (e) => v[Fe(e) % v.length];
function Ue(e, t) {
	let n = He(e.id), r = De(e)[0], i = n.datos[t] ?? [], a = (e) => n.lotes.reduce((e, t) => r ? e.split(t).join(Re(r.descripcion)) : e, e);
	return i.filter(([e]) => !/^Sin /.test(e)).map(([e, t]) => [a(e), a(t)]);
}
var P = (e) => `S/ ${e.toLocaleString("es-PE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
})}`, F = (e) => `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`, We = (e) => e.toLocaleDateString("es-PE", {
	day: "numeric",
	month: "long",
	year: "numeric"
}), I = (e) => e.toLocaleDateString("es-PE", {
	day: "2-digit",
	month: "short",
	year: "numeric"
}), Ge = {
	mora: ["LA-2023-0117", "VS-2024-0891"],
	entregado: ["MS-2025-0210", "RB-2024-0318"],
	alDia: ["VS-2025-0507", "VS-2024-0412"]
};
function Ke(t, n) {
	let r = Fe(n.id), i = `DNI ${Oe(n.dni)}`, a = e.Q.filter((e) => e.clienteId === n.id), o = e.Vt(n).filter((e) => e.tipo === "Adenda"), s = De(n), ee = s.some((e) => a.some((t) => t.unidad.includes(Re(e.descripcion))));
	return s.map((s, c) => {
		let l = e.Ht(n, s, t.ahora, e.Nt(t, s.id)), u = l.cuotas.filter((e) => e.estado === "Vencida"), d = t.casosResolucion.find((e) => e.loteId === s.id), te = u.length >= 3 || !!(d && d.estado !== "REGULARIZADO"), f = a.find((e) => e.unidad.includes(Re(s.descripcion))) ?? (c === 0 && !ee ? a[0] : void 0), ne = te ? Ge.mora : f ? Ge.entregado : Ge.alDia, p = re.find((e) => e.codigo === ne[(r + c) % ne.length]) ?? re[0], m = Le(s.descripcion), h = Re(s.descripcion), g = l.cuotas[0]?.monto ?? 0, _ = s.precio - g * l.cuotas.length, ie = v.find((e) => e.k === p.clienteKey360), y = [
			[p.clienteNombre, n.nombre],
			[p.clienteDoc, i],
			[p.codigo, s.contrato],
			[`${p.proyecto} - ${p.etapa}`, m],
			[p.proyecto, m],
			...ie ? ie.lotes.map((e) => [`Lote ${e}`, `lote ${h}`]) : [],
			...ie?.datos.cont?.filter(([e]) => e.includes("@")).map(([e]) => [e, n.correo]) ?? []
		], ae = new Map(y.filter(([e]) => e)), oe = new RegExp([...ae.keys()].sort((e, t) => t.length - e.length).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g"), b = (e) => e.replace(oe, (e) => ae.get(e) ?? e), x = (() => {
			let e = l.cuotas.findIndex((e) => e.estado !== "Pagada"), t = Math.max(0, (e < 0 ? l.cuotas.length : e) - 3);
			return l.cuotas.slice(t, t + 5);
		})().map((e) => ({
			numero: e.n,
			vencimiento: F(e.vence),
			monto: P(e.monto),
			estado: e.estado === "Pagada" ? "PAGADA" : e.estado === "Vencida" ? "VENCIDA" : "POR_VENCER",
			...e.estado === "Pagada" ? {
				fechaPago: F(e.vence),
				operacion: `BCP-${String(((r + 7) * 7919 + e.n * 104729) % 9e5 + 1e5)}`
			} : {}
		})), S = p.clausulas.map((e) => /Precio/i.test(e.titulo) ? {
			...e,
			contenido: `El precio total pactado de común acuerdo asciende a ${P(s.precio)}, cancelados mediante una cuota inicial de ${P(_)} y el saldo de ${P(s.precio - _)} financiado en ${l.cuotas.length} letras mensuales iguales de ${P(g)} con vencimiento el día ${l.cuotas[0]?.vence.getDate() ?? 5} de cada mes.`
		} : /Objeto|Transferencia/i.test(e.titulo) ? {
			...e,
			contenido: `Por el presente instrumento, LA VENDEDORA transfiere en compraventa con reserva de propiedad a favor de EL COMPRADOR (${n.nombre}, ${i}) el lote ${h} del proyecto ${m}, contrato ${s.contrato}.`
		} : {
			...e,
			contenido: b(e.contenido),
			...e.alerta ? { alerta: b(e.alerta) } : {}
		});
		return {
			...p,
			codigo: s.contrato,
			estado: te ? "EN_EVALUACION_RESOLUCION" : f ? "ENTREGADO_CON_GARANTIA" : "VIGENTE",
			clienteNombre: n.nombre,
			clienteDoc: i,
			clienteKey360: n.id,
			proyecto: m,
			etapa: "",
			manzanaLote: h,
			fechaSuscripcion: We(s.firmado),
			precioTotal: P(s.precio),
			cuotaInicial: P(_),
			capitalFinanciado: P(s.precio - _),
			totalLetras: l.cuotas.length,
			letrasPagadas: l.pagadas,
			letrasVencidas: u.length,
			saldoPendiente: P(l.saldo),
			moraAcumulada: u.length ? `${P(u.length * g)} · ${l.diasMora} días de mora` : P(0),
			actaEntregaEstado: f ? `Acta ${f.id} firmada el ${I(f.entregada)}` : "Sin acta de entrega (lote no entregado)",
			clausulas: S,
			adendas: o.map((e, t) => ({
				codigo: `ADE-${s.contrato}-${String(t + 1).padStart(2, "0")}`,
				fecha: I(e.fecha),
				titulo: e.titulo,
				estado: "FIRMADA",
				resumen: e.texto,
				detalleClausula: `ACUERDO SEGUNDO: Las partes acuerdan sustituir el objeto de la compraventa por el lote ${h}, reconociendo el 100% de las cuotas abonadas a la fecha y manteniendo la cuota mensual en ${P(g)}.`
			})),
			firmantes: p.firmantes.filter((e) => e.rol !== "COPROPIETARIO").map((e) => e.rol === "COMPRADOR_TITULAR" ? {
				...e,
				nombre: n.nombre,
				documento: i,
				fechaFirma: `${F(s.firmado)} ${e.fechaFirma.split(" ")[1] ?? ""}`.trim()
			} : {
				...e,
				fechaFirma: `${F(s.firmado)} ${e.fechaFirma.split(" ")[1] ?? ""}`.trim()
			}),
			cronograma: x
		};
	});
}
function qe() {
	e.y.telefono = "", e.y.cliente = null;
}
function Je(t, n, r) {
	if (!Ae("atender", n.rol) && n.rol !== "COORDINADOR_CX") return 0;
	let i = n.rol === "SUPERVISOR" || n.rol === "COORDINADOR_CX", a = e.__h44.areas(n.id);
	return t.tickets.filter((e) => e.clienteId === r && (i ? a.includes(e.area) : e.area === n.area)).length;
}
function Ye(e) {
	globalThis.__ptBandejaBusca = e;
}
//#endregion
//#region src/c360/pagina.ts
function Xe(e, t) {
	return e === "SUPERVISOR" ? "ecta" : e === "LEGAL_RECLAMOS" || e === "MESA_SGD" ? "expo" : e === "COORDINADOR_CX" ? "tick" : t === "POSTVENTA" ? "gar" : "lote";
}
var Ze = {
	bandeja: () => "bandeja",
	detalle: () => "detalle",
	nuevo: () => "nuevo",
	libro: () => "libro",
	sgd: (e) => e === "expo" ? "mesa" : "morosidad",
	garantias: () => "garantias",
	evento: () => "fest"
}, Qe = [{
	value: "po3d",
	label: "Grafo 3D"
}, {
	value: "2d",
	label: "Grafo 2D"
}], $e = je.map((e) => ({
	value: e.id,
	label: e.nombre
})), et = "__ninguno", tt = (e) => ae[e] ?? {
	hu: "Consulta 360 en línea",
	rfRn: "Integración en tiempo real sin copia local",
	entidadDep: e.toUpperCase(),
	inputReal: "Consulta en línea sin copia local."
}, nt = (e) => oe[e] ?? {
	hu: "Sección de ficha 360",
	rfRn: "Consulta en tiempo real por perfil",
	entidadDep: "Sistema de origen conectado",
	inputReal: "Dato consultado en línea desde la fuente."
}, rt = (e) => y[e] ?? {
	etiqueta: "Ir a Bandeja del Cliente",
	destino: "bandeja",
	moduloNombre: "Bandeja y Avance Diario"
}, it = (e) => g.find((t) => t.id === e)?.nombre ?? e, at = (e) => e.fuentes.map(it).join(" + "), ot = (e) => _.filter((t) => t.fuentes.includes(e)), st = (e) => e.toLocaleTimeString("es-PE", {
	hour: "2-digit",
	minute: "2-digit"
}), ct = (e) => e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
function lt(e) {
	Se();
	let { datos: t, persona: n } = Ce(), r = ke(n), i = Ae("atender", n.rol), [a, o] = S("po3d"), [s, ee] = S("cli-001"), [c, l] = S(() => Xe(e.rol, e.area)), [u, d] = S(null), [p, m] = S(!0), [h, v] = S(!0), [re, y] = S(""), [ae, oe] = S(!1), [b, w] = S(null), [se, ce] = S([]), [le, D] = S([]), [pe, j] = S(null), [me, he] = S(null), [M, ge] = S(null), [_e, ve] = S("respuesta en 0.54 s · 8 fuentes en línea"), [be, xe] = S(_.length), [Fe, He] = S(je[0]?.id ?? "saldo"), [P, F] = S(""), [We, I] = S(null), [Ge, lt] = S(!1), [ut, dt] = S(!1), [ft, pt] = S(0), [mt, ht] = S(""), [gt, _t] = S(!1), [vt, L] = S({
		abierto: !1,
		codigo: "",
		pestana: "clausulas"
	}), R = Te(t, s, n) ?? Te(t, "cli-001", n), z = R.cliente, B = De(z), V = B[0]?.contrato ?? "—", yt = (e) => R.nodos.find((t) => t.id === e), H = R.fuentes.filter((e) => e.caida).map((e) => e.id), U = (e) => {
		let t = yt(e);
		return t ? t.estado === "restringido" ? "restringido" : t.fuentes.some((e) => H.includes(e)) ? "caido" : "ok" : "ok";
	}, bt = {
		...R,
		nodos: R.nodos.map((e) => ({
			...e,
			estado: U(e.id)
		}))
	}, xt = R.nodos.filter((e) => e.estado !== "restringido").length, W = _.find((e) => e.id === c) ?? _[0], St = u ? g.find((e) => e.id === u) ?? null : null, G = t.tickets.filter((e) => e.clienteId === z.id).sort((e, t) => +t.abierto - e.abierto), K = G.filter(ze), q = r.lotes, Ct = r.cuotas, wt = U("cont") === "ok", Tt = U("tick") === "ok", Et = T(null), Dt = T(null), Ot = T(null), kt = T(null), At = T(null), jt = T(c), Mt = T(null), Nt = T(null), Pt = T(/* @__PURE__ */ new Set()), Ft = T([]), It = T(0), Lt = T({}), Rt = T(null), zt = T(null), J = T({
		seleccionarNodo: (e) => {},
		inspeccionarFuente: (e) => {}
	}), Bt = (e) => {
		let t = U(e.id);
		return t === "restringido" ? {
			codigo: "locked",
			tono: "warning",
			etiqueta: "Restringido"
		} : t === "caido" ? {
			codigo: "down",
			tono: "danger",
			etiqueta: "No disponible"
		} : {
			codigo: "ok",
			tono: "success",
			etiqueta: "En línea"
		};
	}, Vt = (e) => {
		let t = yt(e)?.filas ?? [["Sin registros", "—"]];
		if (e !== "llam" && e !== "correos") return t;
		let n = Ue(z, e), r = t.filter(([e]) => !/^Sin /.test(e));
		return r.length || n.length ? [...r, ...n] : t;
	}, Ht = (e) => Vt(e)[0]?.[1] ?? "—", Ut = (e, t) => x(E.Badge, {
		key: t,
		size: "sm",
		tone: "warning"
	}, x(E.Icono, {
		name: "lock",
		size: 16
	}), ` ${e}`);
	jt.current = c, Mt.current = se.length > 0 ? { hits: [...se] } : null, Rt.current = {
		fuentes: g,
		nodos: _.map((e) => ({
			id: e.id,
			nombre: e.nombre,
			fuentes: e.fuentes,
			codigo: Bt(e).codigo
		})),
		sel: c,
		caidas: H,
		cliente: {
			iniciales: Ie(z.nombre),
			lotes: q ? B.map((e) => Re(e.descripcion)) : []
		}
	};
	let Y = (e) => {
		d(null), l(e), jt.current = e, m(!0), v(!0);
	}, Wt = (e) => {
		d(e);
		let t = _.find((t) => t.fuentes.includes(e));
		t && (l(t.id), jt.current = t.id), m(!0), v(!0);
	};
	J.current = {
		seleccionarNodo: Y,
		inspeccionarFuente: Wt
	};
	let X = (e, t = "clausulas") => L((n) => ({
		abierto: !0,
		codigo: e || n.codigo,
		pestana: t
	})), Gt = (r) => {
		let i = rt(r);
		if (U(r) === "restringido") return { motivo: "Dato restringido para tu rol: no lleva a otro módulo." };
		if (i.destino === "contrato") {
			if (!q || !B.length) return null;
			let e = r === "crono" || r === "saldo" ? "cronograma" : r === "docs" ? "adendas" : "clausulas";
			return {
				etiqueta: i.etiqueta,
				ir: () => X(V, e)
			};
		}
		let a = Ze[i.destino]?.(r) ?? "bandeja";
		if (!e.puede(a)) return { motivo: `Tu rol no tiene acceso a ${i.moduloNombre}.` };
		if (a === "detalle") {
			let n = Be(t, z.id, r === "llam" ? "Teléfono" : "Correo");
			return n ? {
				etiqueta: `${n.con ? i.etiqueta : "Abrir el último ticket del cliente"} ${n.t.numero}`,
				ir: () => e.ir("detalle", { numero: n.t.numero })
			} : { motivo: "El cliente no tiene tickets." };
		}
		return a === "bandeja" ? G.length ? Je(t, n, z.id) ? {
			etiqueta: i.etiqueta,
			ir: () => {
				Ye(z.dni), e.ir("bandeja", {});
			}
		} : { motivo: "Tu Bandeja solo muestra tus áreas y los tickets de este cliente son de otra: ábrelos desde «Tickets previos»." } : { motivo: "El cliente no tiene tickets." } : {
			etiqueta: i.etiqueta,
			ir: () => e.ir(a, {})
		};
	}, Kt = (e, t) => {
		let n = Gt(e);
		return n && "ir" in n ? Q({
			variant: t,
			onClick: n.ir
		}, `${n.etiqueta} →`) : null;
	}, qt = (e) => {
		let t = Gt(e);
		return t && "motivo" in t ? x(A, {
			as: "p",
			estilo: "subtitle",
			size: "xs"
		}, t.motivo) : null;
	}, Jt = () => {
		w(null), ce([]), D([]), j(null);
	}, Yt = (e) => {
		if (!e) return;
		he(null), ge(null), j(null), ee(e);
		let t = Ee(e), n = t ? De(t)[0] : void 0;
		F(n?.id ?? ""), I(null), ht(""), ce([]), D([]), L((e) => ({
			...e,
			codigo: ""
		}));
	}, Xt = (e) => {
		let t = e.fuentes.filter((e) => e.caida).map((e) => e.id), n = {
			cliente: { nombre: e.cliente.nombre },
			fuentes: g.map((e) => ({
				id: e.id,
				n: e.nombre,
				d: e.detalle,
				caida: t.includes(e.id)
			})),
			nodos: _.map((t) => ({
				id: t.id,
				n: t.nombre,
				estado: e.nodos.find((e) => e.id === t.id)?.estado ?? "ok",
				sem: t.semantico,
				fuentes: t.fuentes
			}))
		};
		At.current = n, Pt.current = /* @__PURE__ */ new Set();
		let r = (e) => t.includes(e) ? 1200 : g.find((t) => t.id === e)?.ms ?? 220, i = [];
		n.fuentes.forEach((e) => i.push({
			a: "c",
			b: e.id,
			t0: 0,
			dur: r(e.id) * .55,
			src: e.id
		})), n.nodos.forEach((e) => e.fuentes.forEach((t) => {
			let n = r(t);
			i.push({
				a: t,
				b: e.id,
				t0: n * .55,
				dur: n * .45 + 120,
				src: t,
				dst: e.id
			});
		})), Ft.current = i, It.current = performance.now();
		let a = Math.max(...n.nodos.map((e) => Math.min(...e.fuentes.map(r)))) + 120, o = t.length, s = `respuesta en ${(a / 1e3).toFixed(2)} s · ${o > 0 ? `${n.fuentes.length - o} de ${n.fuentes.length} fuentes respondieron` : `${n.fuentes.length} fuentes en línea`}`;
		ve("consultando…"), zt.current !== null && clearTimeout(zt.current), zt.current = setTimeout(() => {
			ve(s), xe(n.nodos.filter((e) => e.estado === "ok").length);
		}, a + 140);
	}, Z = () => Xt(bt), Zt = (e) => Ne(e, !H.includes(e)), Qt = (e) => e.forEach((e) => Ne(e, !1)), $t = (e) => Qt(e.fuentes.filter((e) => H.includes(e))), en = async (e) => {
		Y("docs"), ce([]), D([]);
		let t = performance.now();
		try {
			let n = await N.buscarDocumentos(z.id, e), r = Math.round(performance.now() - t);
			ce(n.resultados.map((e) => ({
				titulo: e.documento.titulo,
				fragmento: e.fragmento,
				relevancia: e.relevancia
			}))), D(n.sugerencias), w(n.resultados.length ? {
				tono: "info",
				titulo: "Búsqueda semántica documental por significado",
				texto: `Repositorio S3 / GLI: ${n.resultados.length} ${n.resultados.length === 1 ? "documento relevante" : "documentos relevantes"} de ${z.nombre} para «${e}» en ${r} ms, con su fragmento.`
			} : {
				tono: "warning",
				titulo: "Sin coincidencias relevantes",
				texto: `Ningún documento de ${z.nombre} coincide por significado con «${e}». Prueba con palabras exactas: ${n.sugerencias.map((e) => `«${e}»`).join(", ") || "el tipo de documento"}.`
			});
		} catch (e) {
			let t = e;
			w({
				tono: t.status === 403 ? "danger" : "warning",
				titulo: t.status === 403 ? "Documentos restringidos para tu rol" : "Búsqueda de documentos no disponible",
				texto: t.message ?? "No se pudo buscar."
			});
		}
		Z();
	}, tn = (e, t, n) => {
		y(e), j(null), t === "docs" ? en(e) : (Y(t), ce([]), D([]), w({
			tono: "info",
			titulo: "Búsqueda semántica documental por significado",
			texto: n
		}), Z());
	}, nn = (e = "") => {
		he({ q: e }), j(null), e && y(`DNI ${e} (No registrado en SIGDA)`);
	}, rn = async (e) => {
		let t = kt.current?.querySelector("input[type=\"search\"], input"), n = (e ?? t?.value ?? re).trim();
		y(n), Jt(), ge(null);
		let r = ct(n);
		if (!r) {
			m(!0), v(!0), N.consultar360(z.id).catch(() => {}), Z();
			return;
		}
		let i = ie.find((e) => ct(e.q) === r);
		if (i) return tn(i.q, i.nodo, i.explicacion);
		let a = _.find((e) => ct(e.nombre) === r || e.id === r);
		if (a) {
			Y(a.id), Z();
			return;
		}
		let o = g.find((e) => ct(e.nombre) === r || e.id === r);
		if (o) {
			Wt(o.id), Z();
			return;
		}
		oe(!0);
		let s = performance.now();
		try {
			let e = await N.buscarClientes360(n), t = Math.round(performance.now() - s);
			if (e.length === 1) {
				let n = e[0];
				Yt(n.cliente.id), y(""), w({
					tono: "success",
					titulo: "Cliente encontrado en SIGDA/TAXON",
					texto: `${n.cliente.nombre} (DNI ${Oe(n.cliente.dni)}) por ${n.criterio.toLowerCase()} en ${t} ms, con sus tickets y lotes.`
				});
				return;
			}
			if (e.length > 1) {
				j({
					q: n,
					lista: e
				});
				return;
			}
			let r = n.replace(/\D/g, "");
			if (/^\d{8}$/.test(r) && /^[\d\s.-]+$/.test(n)) return nn(r);
			if (/^[\d\s+.-]+$/.test(n) || /^[a-z]{2,4}-?\d/i.test(n)) {
				w({
					tono: "warning",
					titulo: "Sin coincidencias en el maestro",
					texto: `Ningún cliente de SIGDA/TAXON coincide con «${n}». Revisa el DNI, el teléfono o el N.º de ticket.`
				});
				return;
			}
		} catch (e) {
			let t = e;
			if (t.status === 503) {
				if (ge({
					q: n,
					texto: t.message ?? "SIGDA/TAXON no responde."
				}), /^[\d\s+.-]+$/.test(n)) return;
			} else {
				w({
					tono: "danger",
					titulo: "Búsqueda de clientes restringida",
					texto: t.message ?? "Tu rol no busca clientes."
				});
				return;
			}
		} finally {
			oe(!1);
		}
		await en(n);
	}, an = async () => {
		let e = P || B[0]?.id || "";
		lt(!0);
		try {
			let t = await N.consultarMotor({ clienteId: z.id }, Fe, e);
			I({
				tono: "success",
				titulo: t.consulta,
				texto: `${t.texto} Respuesta del motor de José vía API · ${st(t.fecha)}.`
			});
		} catch (e) {
			let t = e;
			I(t.status === 503 ? {
				tono: "warning",
				titulo: "Motor de consultas no disponible",
				texto: `${t.message ?? ""} La atención no se bloquea: continúa con el ticket y vuelve a consultar más tarde.`
			} : t.status === 403 ? {
				tono: "danger",
				titulo: "Dato no disponible para tu rol",
				texto: t.message ?? "El motor no devuelve ese dato para tu rol; el intento queda registrado."
			} : {
				tono: "warning",
				titulo: "No se pudo consultar",
				texto: t.message ?? "Revisa la consulta y el lote."
			});
		} finally {
			lt(!1);
		}
	}, on = mt || K[0]?.id || et, sn = async () => {
		_t(!0);
		try {
			let e = on === et ? null : on, n = await N.iniciarLlamada(z.id, e), r = e ? t.tickets.find((t) => t.id === e)?.numero : null;
			we(`Llamada iniciada por el call center. Grabación ${n.grabacion}${r ? ` · queda como interacción del ticket ${r}` : " · queda en la ficha del cliente"}.`, "success"), pt(1), dt(!0);
		} catch (e) {
			we(e.message ?? "No se pudo iniciar la llamada.", "danger");
		} finally {
			_t(!1);
		}
	}, cn = (t) => e.ir("nuevo", {
		nombre: t.nombre,
		dni: t.dni
	}), ln = () => {
		qe(), e.ir("nuevo", {});
	};
	C(() => {
		Y(Xe(e.rol, e.area));
	}, [e.rol, e.area]);
	let un = t.fuentesCaidas.join(",");
	C(() => {
		N.consultar360(z.id).catch(() => {});
	}, [z.id, n.id]), C(() => {
		Z();
	}, [
		z.id,
		un,
		n.id
	]), C(() => {
		let e = Et.current, t = Dt.current;
		if (!e || !t) return;
		let n = /* @__PURE__ */ new Map(), r = (e) => {
			let t = n.get(e);
			if (t) return t;
			let r = te(e);
			return n.set(e, r), r;
		}, i = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1, a = null;
		try {
			a = f({
				canvas: t,
				host: e,
				color: r,
				reducido: i,
				vista: At,
				sel: jt,
				sem: Mt,
				hover: Nt,
				lit: Pt,
				pulsos: Ft,
				t0: It,
				pos: Lt,
				alClickNodo: (e) => J.current.seleccionarNodo(e),
				alClickFuente: (e) => J.current.inspeccionarFuente(e)
			});
		} catch (e) {
			console.error("[grafo 3D]", e);
		}
		return () => a?.();
	}, []), C(() => {
		let e = Ot.current;
		if (e) return ne({
			canvas: e,
			estado: Rt,
			alClickNodo: (e) => J.current.seleccionarNodo(e),
			alClickFuente: (e) => J.current.inspeccionarFuente(e),
			alClickCliente: () => J.current.seleccionarNodo("kyc")
		});
	}, []), C(() => {
		if (!ut) return;
		let e = setInterval(() => pt((e) => e + 1), 1e3);
		return () => clearInterval(e);
	}, [ut]), C(() => () => {
		zt.current !== null && clearTimeout(zt.current);
	}, []);
	let dn = (e) => {
		let t = Dt.current.getBoundingClientRect();
		return [e.clientX - t.left, e.clientY - t.top];
	}, fn = (e) => {
		if (!Dt.current) return;
		let [t, n] = dn(e), r = Lt.current, i = null, a = 26;
		for (let e of _) {
			let o = r[e.id];
			if (!o) continue;
			let s = Math.hypot(o.x - t, o.y - n);
			s < a && (a = s, i = e.id);
		}
		if (i) return Y(i);
		for (let e of g) {
			let i = r[e.id];
			if (i && Math.hypot(i.x - t, i.y - n) < 26) return Wt(e.id);
		}
		let o = r.c;
		o && Math.hypot(o.x - t, o.y - n) < 32 && Y("kyc");
	}, pn = (e) => {
		let t = Dt.current;
		if (!t) return;
		let [n, r] = dn(e), i = Lt.current, a = null, o = 26;
		for (let e of _) {
			let t = i[e.id];
			if (!t) continue;
			let s = Math.hypot(t.x - n, t.y - r);
			s < o && (o = s, a = e.id);
		}
		if (!a) for (let e of g) {
			let t = i[e.id];
			if (t && Math.hypot(t.x - n, t.y - r) < 24) {
				a = e.id;
				break;
			}
		}
		Nt.current = a, t.style.cursor = a ? "pointer" : "default";
	};
	function Q(e, t) {
		return x(E.Button, {
			size: "sm",
			...e
		}, t);
	}
	let $ = Bt(W), mn = rt(W.id), hn = (e) => Vt(e).map(([e, t]) => [e, t]), gn = (e) => {
		let t = nt(e);
		return [
			["Sistema de origen", t.entidadDep],
			["Criterio", t.rfRn],
			["Consulta en línea", t.inputReal]
		];
	}, _n = (e) => {
		let t = tt(e.id);
		return [
			["Plataforma", t.entidadDep],
			["Integración", t.rfRn],
			["Consulta en línea", t.inputReal]
		];
	}, vn = (e) => x(k, {
		gap: "2",
		ajuste: !0
	}, ...e, Q({
		variant: "ghost",
		onClick: () => v(!h)
	}, h ? "Contraer" : "Desplegar"), Q({
		variant: "ghost",
		"aria-label": "Cerrar ficha",
		onClick: () => m(!1)
	}, "Cerrar")), yn = (e, t) => Me(e) ? Q({
		variant: t ? "primary" : "danger",
		onClick: () => Zt(e)
	}, t ? "Restaurar fuente en línea" : "Probar desconexión") : x(A, {
		estilo: "subtitle",
		size: "xs"
	}, "Sistema interno: su caída no se simula."), bn = (e) => {
		let t = H.includes(e.id);
		return x("div", {
			className: "pl-atc-ficha-flotante",
			role: "dialog",
			"aria-modal": "false",
			"aria-label": `Sistema de origen ${e.nombre}`
		}, x(E.Card, null, x(E.CardHeader, {
			title: `Sistema: ${e.nombre}`,
			subtitle: `${e.detalle} · ${tt(e.id).hu}`,
			as: "h3",
			actions: vn([x(E.Badge, {
				key: "e",
				size: "sm",
				tone: t ? "danger" : "success"
			}, t ? "Sin respuesta" : "En línea"), x(E.Badge, {
				key: "l",
				size: "sm",
				tone: "info"
			}, `Latencia ${e.ms} ms`)])
		}), h ? x(E.CardBody, null, x(O, { gap: "3" }, x(E.CardPairs, { pairs: _n(e) }), x(O, { gap: "1" }, x(A, {
			estilo: "label",
			size: "xs"
		}, `Secciones alimentadas por ${e.nombre}`), x(k, {
			gap: "2",
			ajuste: !0
		}, ot(e.id).map((e) => Q({
			key: e.id,
			variant: c === e.id ? "primary" : "secondary",
			onClick: () => Y(e.id)
		}, e.nombre)))), x(de, { espaciado: "sm" }), x(k, {
			gap: "2",
			ajuste: !0
		}, yn(e.id, t), Q({
			variant: "ghost",
			onClick: () => d(null)
		}, "Ver nodo actual")))) : null));
	}, xn = () => se.length > 0 ? x(E.Card, { key: "s" }, x(E.CardHeader, {
		title: "Coincidencias semánticas",
		as: "h4"
	}), x(E.CardBody, null, x(O, { gap: "2" }, se.map((e) => x(k, {
		key: e.titulo,
		gap: "2",
		ajuste: !0
	}, x(E.Badge, {
		size: "sm",
		tone: "info"
	}, `${e.relevancia}%`), x(A, {
		as: "strong",
		estilo: "title",
		size: "xs"
	}, e.titulo), x(A, {
		estilo: "subtitle",
		size: "xs"
	}, `«${e.fragmento}»`)))))) : le.length > 0 ? x(O, {
		key: "s",
		gap: "1"
	}, x(A, {
		estilo: "label",
		size: "xs"
	}, "Sin coincidencias relevantes. Busca por palabras exactas:"), x(k, {
		gap: "2",
		ajuste: !0
	}, le.map((e) => Q({
		key: e,
		variant: "ghost",
		onClick: () => {
			y(e), en(e);
		}
	}, `«${e}»`)))) : null, Sn = () => x("div", {
		className: "pl-atc-ficha-flotante",
		role: "dialog",
		"aria-modal": "false",
		"aria-label": `Nodo 360 ${W.nombre}`
	}, x(E.Card, null, x(E.CardHeader, {
		title: W.nombre,
		subtitle: `${nt(W.id).hu} · ${z.nombre}`,
		as: "h3",
		actions: vn([$.codigo === "locked" ? Ut($.etiqueta, "e") : x(E.Badge, {
			key: "e",
			size: "sm",
			tone: $.tono
		}, $.etiqueta), x(E.Badge, {
			key: "o",
			size: "sm",
			tone: "info"
		}, `Origen: ${at(W)}`)])
	}), h ? x(E.CardBody, null, x(O, { gap: "3" }, $.codigo === "locked" ? x(E.Alert, {
		tone: "warning",
		title: x("span", { className: "pt-en-linea" }, x(E.Icono, {
			name: "lock",
			size: 16
		}), " Acceso restringido por perfil")
	}, `Tu perfil (${e.etiquetaRol}) no tiene acceso a este dato reservado. Cambia de perfil a Supervisor o Legal en Herramientas › Ver como para visualizarlo.`) : $.codigo === "down" ? x(E.Alert, {
		tone: "danger",
		title: "Fuente no disponible temporalmente",
		actions: Q({
			variant: "secondary",
			onClick: () => $t(W)
		}, "Reintentar")
	}, `${W.fuentes.filter((e) => H.includes(e)).map(it).join(", ")} no responde en este instante (intento a las ${st(t.ahora)}). Las demás secciones siguen activas.`) : [
		W.semantico ? xn() : null,
		x(E.CardPairs, {
			key: "p",
			pairs: hn(W.id)
		}),
		x(A, {
			key: "l",
			estilo: "subtitle",
			size: "xs"
		}, `Consulta en línea, sin copiar el dato · ${st(t.ahora)}`),
		W.id === "tick" && G.length ? x(k, {
			key: "t",
			gap: "2",
			ajuste: !0
		}, G.slice(0, 4).map((t) => Q({
			key: t.id,
			variant: "ghost",
			onClick: () => e.ir("detalle", { numero: t.numero })
		}, `Abrir ticket ${t.numero} →`))) : null
	], x(de, { espaciado: "sm" }), x(E.CardPairs, { pairs: gn(W.id) }), x(k, {
		gap: "2",
		ajuste: !0
	}, Kt(W.id, "primary"), mn.destino !== "contrato" && q && B.length ? Q({
		variant: "secondary",
		onClick: () => X(V)
	}, `Contrato ${V}`) : null, e.puede("nuevo") ? Q({
		variant: "secondary",
		onClick: () => cn(z)
	}, "+ Crear ticket") : null), qt(W.id))) : null)), Cn = pe ? x(E.Card, null, x(E.CardHeader, {
		title: `${pe.lista.length} clientes coinciden con «${pe.q}»`,
		subtitle: "Maestro SIGDA/TAXON · elige al cliente correcto por su DNI parcial y su lote",
		as: "h4",
		actions: Q({
			variant: "ghost",
			onClick: () => j(null)
		}, "Cerrar")
	}), x(E.CardBody, null, x(O, {
		gap: "2",
		role: "list",
		"aria-label": "Clientes que coinciden"
	}, pe.lista.map((e) => x(k, {
		key: e.cliente.id,
		gap: "2",
		ajuste: !0,
		justificar: "between",
		role: "listitem"
	}, x(k, {
		gap: "2",
		ajuste: !0
	}, x(A, {
		as: "strong",
		estilo: "title",
		size: "xs"
	}, e.cliente.nombre), x(E.Badge, {
		size: "sm",
		tone: "info"
	}, `DNI ${Oe(e.cliente.dni)}`), x(E.Badge, {
		size: "sm",
		tone: "neutral"
	}, e.cliente.proyectos.join(" / ")), x(A, {
		estilo: "subtitle",
		size: "xs"
	}, `por ${e.criterio.toLowerCase()}`)), Q({
		variant: "secondary",
		onClick: () => {
			Yt(e.cliente.id), y("");
		}
	}, "Elegir")))))) : null, wn = Pe(t), Tn = x(E.Card, null, x(E.CardBody, null, x(O, { gap: "3" }, x("div", {
		className: "ay-row ay-row--2 ay-row--wrap",
		role: "search",
		ref: kt
	}, x(E.SearchInput, {
		label: "Buscar cliente o documento (DNI, nombre, lote, N.º de ticket, sección 360 o consulta en lenguaje natural)",
		size: "sm",
		debounce: 0,
		value: re,
		onValueChange: (e) => {
			y(e), e.trim() || Jt();
		},
		onSearch: (e) => void rn(e),
		placeholder: "Ej. María, 94841786, Villa Sol II, AIN-000486, adenda de cambio de lote, carta notarial…"
	}), Q({
		variant: "primary",
		loading: ae,
		onClick: () => void rn()
	}, "Consultar"), x(E.SegmentedControl, {
		label: "Modo de visualización 360",
		size: "sm",
		options: Qe,
		value: a,
		onValueChange: (e) => {
			(e === "po3d" || e === "2d") && (o(e), requestAnimationFrame(() => window.dispatchEvent(new Event("resize"))));
		}
	})), Cn, x(k, {
		gap: "2",
		ajuste: !0,
		"aria-label": "Clientes frecuentes y búsquedas por significado"
	}, x(A, {
		estilo: "label",
		size: "xs"
	}, "Clientes:"), wn.map((e) => Q({
		key: e.id,
		variant: z.id === e.id ? "primary" : "secondary",
		onClick: () => Yt(e.id)
	}, e.nombre)), x(A, {
		estilo: "label",
		size: "xs"
	}, "Búsqueda semántica:"), ie.map((e) => Q({
		key: e.q,
		variant: "ghost",
		onClick: () => tn(e.q, e.nodo, e.explicacion)
	}, `«${e.q}»`))), x("div", { className: "pt-escena-wrap" }, x("div", {
		ref: Et,
		className: "pt-escena-grafo",
		hidden: a !== "po3d"
	}, x("canvas", {
		ref: Dt,
		role: "img",
		"aria-label": `Red de consulta 360 de ${z.nombre}: ${g.length} sistemas de origen y ${_.length} datos.`,
		onClick: (e) => fn(e.nativeEvent),
		onMouseMove: (e) => pn(e.nativeEvent),
		onMouseLeave: () => {
			Nt.current = null;
		}
	})), x("canvas", {
		ref: Ot,
		className: "atc-astra-canvas",
		hidden: a !== "2d",
		role: "img",
		"aria-label": `Red de consulta 360 de ${z.nombre} en 2D.`
	}), p ? St ? bn(St) : Sn() : null), x(k, {
		gap: "2",
		ajuste: !0,
		justificar: "between"
	}, x(k, {
		gap: "2",
		ajuste: !0
	}, x(E.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-secondary-400)"
	}, "Cliente"), x(E.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-primary-500)"
	}, `Sistema de origen (${g.length - H.length}/${g.length})`), x(E.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-fg-link)"
	}, `Dato del cliente (${be}/${_.length})`), x(E.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-feedback-danger-border)"
	}, "Restringido / sin conexión")), x(k, {
		gap: "2",
		ajuste: !0
	}, x(A, {
		estilo: "label",
		size: "xs",
		role: "status",
		"aria-live": "polite"
	}, _e), x(E.Badge, {
		size: "sm",
		tone: "info"
	}, "Consulta en línea (< 2 s)")))))), En = (e, t) => {
		let n = U(e), r = _.find((t) => t.id === e)?.nombre ?? e;
		return n === "restringido" ? Ut(r) : n === "caido" ? x(E.Badge, {
			size: "sm",
			tone: "danger"
		}, `${r}: no disponible`) : x(E.Badge, {
			size: "sm",
			tone: "neutral"
		}, t);
	}, Dn = x("aside", {
		className: "ay-stack ay-stack--3",
		style: { gridColumn: "span 1" },
		"aria-label": "Cliente, controles y navegación rápida"
	}, x(E.Card, null, x(E.CardHeader, {
		title: z.nombre,
		subtitle: `DNI ${Oe(z.dni)} · ${[...new Set(z.proyectos.map(Le))].join(", ")}${q ? ` · Contrato ${V}` : ""}`,
		as: "h3",
		actions: x(E.Badge, {
			size: "sm",
			tone: U("kyc") === "caido" ? "danger" : "success"
		}, U("kyc") === "caido" ? "SIGDA no disponible" : "Maestro SIGDA")
	}), x(E.CardBody, null, x(O, { gap: "3" }, x(k, {
		gap: "2",
		ajuste: !0
	}, En("lote", `Lotes ${B.length}`), En("cuotas", `Cuotas vencidas: ${R.venc}`), En("tick", `Tickets ${R.nTk}`), En("expo", `Exposición: ${Ht("expo")}`), x(E.Tag, {
		variant: "outline",
		size: "sm"
	}, `Datos visibles ${xt} de ${R.nodos.length}`)), x(k, {
		gap: "2",
		ajuste: !0
	}, q && B.length ? Q({
		variant: "primary",
		onClick: () => X(V)
	}, `Ver contrato ${V}`) : null, (() => {
		let t = Gt("tick"), n = G[0];
		return t && "ir" in t ? Q({
			variant: "secondary",
			onClick: t.ir
		}, "Tickets en Bandeja") : Tt && n ? Q({
			variant: "secondary",
			onClick: () => e.ir("detalle", { numero: n.numero })
		}, `Último ticket ${n.numero} →`) : null;
	})())))), x(E.Card, null, x(E.CardHeader, {
		title: "Estado de sistemas de origen",
		subtitle: "Monitoreo de disponibilidad y continuidad por fuente",
		as: "h3"
	}), x(E.CardBody, null, x(k, {
		gap: "2",
		ajuste: !0
	}, Q({
		variant: H.length === 0 ? "primary" : "secondary",
		onClick: () => Qt(H)
	}, "Todas en línea"), g.map((e) => Q({
		key: e.id,
		variant: H.includes(e.id) ? "primary" : "secondary",
		onClick: () => Zt(e.id),
		disabled: !Me(e.id),
		title: Me(e.id) ? void 0 : "Sistema interno: su caída no se simula"
	}, e.nombre))))), x(E.Card, null, x(E.CardHeader, {
		title: "Nodos del Grafo 360 y Redirección",
		subtitle: "Haz clic en un nodo para inspeccionarlo o redirigir a su módulo operativo",
		as: "h3"
	}), x(E.CardBody, null, x(O, { gap: "3" }, x(k, {
		gap: "2",
		ajuste: !0
	}, _.map((e) => Q({
		key: e.id,
		variant: c === e.id && !u ? "primary" : "secondary",
		onClick: () => Y(e.id),
		leadingIcon: U(e.id) === "restringido" ? x(E.Icono, {
			name: "lock",
			size: 16
		}) : void 0,
		"aria-label": U(e.id) === "restringido" ? `${e.nombre}: restringido` : U(e.id) === "caido" ? `${e.nombre}: no disponible` : void 0
	}, e.nombre))), x(k, {
		gap: "2",
		ajuste: !0
	}, Kt(W.id, "secondary"), Q({
		variant: "ghost",
		onClick: () => {
			m(!p), v(!0);
		}
	}, p ? "Ocultar ficha" : "Mostrar ficha")), qt(W.id))))), On = Ve(bt, t), kn = Tt ? K.length ? `${K.length} ${K.length === 1 ? "ticket abierto" : "tickets abiertos"}: ${K[0].numero} · ${K[0].resumen}.` : G.length ? `Sin tickets abiertos; el último fue ${G[0].numero} · ${G[0].resumen}.` : "Primer contacto: el cliente no tiene tickets." : "Tu rol no ve los tickets del cliente.", An = [...K.map((e) => ({
		value: e.id,
		label: `Ticket ${e.numero}`
	})), {
		value: et,
		label: "Sin ticket (solo en la ficha)"
	}], jn = x(E.Card, null, x(E.CardBody, null, x(O, { gap: "3" }, x(k, {
		gap: "4",
		ajuste: !0,
		justificar: "between"
	}, x(k, {
		gap: "3",
		ajuste: !0
	}, x(fe, {
		nombre: z.nombre,
		size: "lg"
	}), x(O, { gap: "1" }, x(k, {
		gap: "2",
		ajuste: !0
	}, x(A, {
		estilo: "label",
		size: "xs"
	}, `Clientes / ${z.nombre}`), x(E.Badge, {
		size: "sm",
		tone: "success"
	}, "Titular verificado en SIGDA")), x(k, {
		gap: "2",
		ajuste: !0
	}, x(A, {
		estilo: "title",
		size: "lg"
	}, z.nombre), x(E.Badge, {
		size: "sm",
		tone: "info"
	}, `DNI ${Oe(z.dni)}`), wt ? x(E.Badge, {
		size: "sm",
		tone: "neutral"
	}, z.telefono) : null, wt ? x(E.Badge, {
		size: "sm",
		tone: "neutral"
	}, z.correo) : null, q ? x(E.Badge, {
		size: "sm",
		tone: "neutral"
	}, z.proyectos.join(" · ")) : null, q && B.length ? x(E.Badge, {
		size: "sm",
		tone: "info"
	}, `Contrato ${V}`) : null), x(A, {
		as: "p",
		estilo: "body",
		size: "sm"
	}, x("strong", null, "Contexto de atención:"), " ", kn))), x(k, {
		gap: "2",
		ajuste: !0
	}, wt && i ? x(E.Card, null, x(E.CardBody, null, x(k, {
		gap: "3",
		ajuste: !0
	}, x(O, { gap: "1" }, x(A, {
		estilo: "label",
		size: "xs"
	}, "Central Telefónica CTI"), x(A, {
		as: "strong",
		estilo: "mono",
		size: "sm"
	}, z.telefono), ut ? null : x(E.Select, {
		size: "sm",
		"aria-label": "Registrar la llamada en",
		options: An,
		value: on,
		onChange: (e) => ht(e.target.value)
	})), ut ? [x(E.Badge, {
		key: "b",
		size: "sm",
		tone: "success"
	}, `En llamada · ${String(Math.floor(ft / 60)).padStart(2, "0")}:${String(ft % 60).padStart(2, "0")}`), Q({
		key: "c",
		variant: "danger",
		onClick: () => {
			dt(!1), Y("llam");
		}
	}, "Colgar y guardar grabación")] : Q({
		variant: "primary",
		loading: gt,
		onClick: () => void sn()
	}, "Llamar")))) : null, q && B.length ? Q({
		variant: "primary",
		onClick: () => X(V)
	}, `Ver contrato ${V}`) : null, e.puede("nuevo") ? Q({
		variant: "secondary",
		onClick: () => cn(z)
	}, "+ Crear ticket") : null, Q({
		variant: "ghost",
		onClick: () => nn()
	}, "Registrar Interesado no ubicado"))), x(E.Alert, {
		tone: "info",
		title: "Síntesis Copiloto IA en tiempo real"
	}, `${On.texto} — `, x("strong", null, "Acción sugerida:"), ` ${On.accion}`)))), Mn = q ? B : [], Nn = x(E.Card, null, x(E.CardHeader, {
		title: "Consultas rápidas en línea",
		subtitle: "Respuestas instantáneas del motor de consultas por lote y contrato.",
		as: "h3",
		actions: x(k, {
			gap: "2",
			ajuste: !0
		}, Q({
			variant: "primary",
			loading: Ge,
			disabled: !Mn.length,
			onClick: () => void an()
		}, "Consultar ahora"), q && B.length ? Q({
			variant: "secondary",
			onClick: () => X(V)
		}, `Abrir contrato ${V}`) : null)
	}), x(E.CardBody, null, x(O, { gap: "3" }, x(ue, {
		columnas: 2,
		gap: "md"
	}, x(E.FormField, { label: "Tipo de consulta" }, x(E.Select, {
		size: "sm",
		options: $e,
		value: Fe,
		onChange: (e) => {
			He(e.target.value), I(null);
		}
	})), x(E.FormField, { label: "Lote del cliente" }, x(E.Select, {
		size: "sm",
		options: Mn.length ? Mn.map((e) => ({
			value: e.id,
			label: e.descripcion
		})) : [{
			value: "",
			label: "Lotes restringidos para tu rol"
		}],
		value: P || Mn[0]?.id || "",
		onChange: (e) => {
			F(e.target.value), I(null);
		}
	}))), We ? x(E.Alert, {
		tone: We.tono,
		title: We.titulo
	}, We.texto) : null, x(A, {
		estilo: "subtitle",
		size: "xs"
	}, "Consulta ejecutada en tiempo real contra los sistemas financieros e inmobiliarios con registro de auditoría.")))), Pn = x(E.Card, null, x(E.CardHeader, {
		title: `${_.length} secciones de datos en línea de ${z.nombre} (con redirección directa por nodo)`,
		subtitle: "Haz clic en cualquier tarjeta para enfocarla en el Grafo 3D o usa el botón de redirección para ir a su módulo operativo",
		as: "h3"
	}), x(E.CardBody, null, x(ue, {
		columnas: 4,
		gap: "md"
	}, _.map((n) => {
		let r = Bt(n), i = rt(n.id);
		return x(E.Card, {
			key: n.id,
			variant: "selectable",
			selected: c === n.id,
			onClick: () => Y(n.id)
		}, x(E.CardHeader, {
			title: n.nombre,
			subtitle: `Origen: ${at(n)}`,
			as: "h4",
			actions: r.codigo === "locked" ? Ut(r.etiqueta) : x(E.Badge, {
				size: "sm",
				tone: r.tono
			}, r.etiqueta)
		}), x(E.CardBody, null, x(O, { gap: "2" }, r.codigo === "ok" ? x(E.CardPairs, { pairs: hn(n.id) }) : r.codigo === "locked" ? x(A, {
			as: "p",
			estilo: "subtitle",
			size: "xs"
		}, `Tu perfil (${e.etiquetaRol}) no tiene acceso a «${n.nombre.toLowerCase()}». Solicítalo a tu supervisor ATC si lo requieres.`) : x(k, {
			gap: "2",
			ajuste: !0,
			justificar: "between"
		}, x(A, {
			estilo: "subtitle",
			size: "xs"
		}, `No se pudo consultar (intento a las ${st(t.ahora)}). Las demás secciones siguen disponibles.`), Q({
			variant: "secondary",
			onClick: (e) => {
				e.stopPropagation(), $t(n);
			}
		}, "Reintentar")), x(de, { espaciado: "sm" }), x(k, {
			gap: "2",
			ajuste: !0,
			justificar: "between",
			onClick: (e) => e.stopPropagation()
		}, x(A, {
			estilo: "label",
			size: "xs"
		}, i.moduloNombre), Kt(n.id, "ghost")))));
	})))), Fn = g.length - H.length, In = vt.abierto ? Ke(t, z) : [];
	return x("div", { className: "pt-pagina pt-pagina--ancha pl-c360" }, x(E.PageHeader, {
		title: "Consulta 360 del Cliente",
		size: "md",
		breadcrumb: x(E.Breadcrumb, {
			label: "Ruta del módulo",
			items: [
				{ label: "Aybar Atiende" },
				{ label: "Núcleo 360 y Planta" },
				{ label: "Consulta 360 del Cliente" }
			]
		}),
		meta: x(k, {
			gap: "2",
			ajuste: !0
		}, x(E.Badge, {
			tone: Fn === g.length ? "success" : "warning",
			dot: !0
		}, Fn === g.length ? `En línea · ${g.length} sistemas` : `${Fn} de ${g.length} sistemas en línea`), x(E.Badge, { tone: "info" }, `${e.usuario} (${e.etiquetaRol})`)),
		description: "Ficha integral consolidada desde 8 sistemas en línea",
		actions: q && B.length ? Q({
			variant: "secondary",
			onClick: () => X(vt.codigo || V)
		}, `Visor de Contratos (${V})`) : null
	}), x(O, { gap: "4" }, x(ue, {
		columnas: 3,
		gap: "md"
	}, x("div", { style: { gridColumn: "span 2" } }, Tn), Dn), me ? x(E.Alert, {
		tone: "warning",
		title: "Cliente no ubicado en el maestro SIGDA — Registro como Interesado",
		actions: x(k, {
			gap: "2",
			ajuste: !0
		}, e.puede("nuevo") ? Q({
			variant: "primary",
			onClick: ln
		}, "Registrar ticket como Interesado") : null, Q({
			variant: "ghost",
			onClick: () => {
				he(null), y("");
			}
		}, "Volver a ficha 360"))
	}, `${me.q ? `El DNI ${me.q} no está en SIGDA/TAXON y aquí no se crea un registro paralelo del cliente. ` : "No se encontró coincidencia para el documento consultado. "}Para preservar la integridad del maestro único, se registra como `, x("strong", null, "Interesado en cola de conciliación"), e.puede("nuevo") ? " con datos mínimos verificables y el ticket continúa su atención sin bloquear al cliente. Si atiendes un ticket, también puedes derivarlo desde su pestaña Cliente." : ". Tu rol no registra tickets: pide a un gestor que lo registre como interesado.") : null, M ? x(E.Alert, {
		tone: "warning",
		title: "SIGDA/TAXON no responde — continuidad de la atención",
		actions: x(k, {
			gap: "2",
			ajuste: !0
		}, Q({
			variant: "secondary",
			onClick: () => void rn(M.q)
		}, "Reintentar"), e.puede("nuevo") ? Q({
			variant: "primary",
			onClick: ln
		}, "Registrar ticket con datos mínimos") : null)
	}, `${M.texto} Puedes seguir atendiendo: registra el ticket con datos mínimos y, cuando SIGDA/TAXON vuelva, el sistema lo vincula al cliente y lo deja en su bitácora.`) : null, H.length > 0 ? x(E.Alert, {
		tone: "warning",
		title: `Continuidad operativa activa — ${H.length} sistema(s) externo(s) sin respuesta`,
		actions: Q({
			variant: "secondary",
			onClick: () => Qt(H)
		}, "Reintentar todos")
	}, `La vista 360 mantiene operativas las ${g.length - H.length} fuentes restantes (los nodos del sistema sin conexión se marcan como «no disponible» mientras el resto de la ficha responde con normalidad).`) : null, b ? x(E.Alert, {
		tone: b.tono,
		title: b.titulo
	}, b.texto) : null, jn, x(k, {
		gap: "2",
		ajuste: !0,
		justificar: "between"
	}, x(A, {
		estilo: "subtitle",
		size: "xs"
	}, x("strong", null, "Vista estructurada en tarjetas (consulta directa a las fuentes de origen):"), " los datos se consultan en tiempo real sin duplicarse localmente."), x(k, {
		gap: "2",
		ajuste: !0
	}, x(E.Badge, {
		size: "sm",
		tone: "neutral"
	}, _e), x(E.Badge, {
		size: "sm",
		tone: "info"
	}, "Tiempo de respuesta < 2 s"))), Nn, Pn), x(ye, {
		abierto: vt.abierto && In.length > 0,
		contratos: In,
		verFinanzas: Ct,
		codigo: vt.codigo || V,
		pestana: vt.pestana,
		alElegir: (e) => L((t) => ({
			...t,
			codigo: e
		})),
		alCambiarPestana: (e) => L((t) => ({
			...t,
			pestana: e
		})),
		alCerrar: () => L((e) => ({
			...e,
			abierto: !1
		})),
		verBandeja: e.puede("bandeja") && Je(t, n, z.id) ? () => {
			L((e) => ({
				...e,
				abierto: !1
			})), Ye(z.dni), e.ir("bandeja", {});
		} : void 0,
		irMorosidad: e.puede("morosidad") ? () => {
			L((e) => ({
				...e,
				abierto: !1
			})), e.ir("morosidad", {});
		} : void 0
	}));
}
//#endregion
export { lt as Consulta360Daniel };
