import * as e from "./comun-CVU2GQ4h.js";
import { c as t, h as n, m as r, n as i, v as a, x as o } from "./prototipo-B6qmgYQk.js";
import { t as s } from "./FormField-BR5f57fp.js";
import { n as c, t as l } from "./CardBody-WQ8Pzs3R.js";
import { t as u } from "./EmptyState-DMKP8Bhj.js";
import { t as d } from "./Breadcrumb-BtXUT3bJ.js";
import { leerTokenRgb as ee, montarGrafoDaniel as te, montarRed2D as ne } from "./escenas-three.js";
import { t as f } from "./Dialog-BcfHiG-J.js";
import { t as p } from "./Table-BJWCycht.js";
//#region src/c360/datos.ts
var m = [
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
], h = [
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
], g = [
	{
		k: "eh",
		iniciales: "EH",
		nombre: "Eddie Huamaní",
		doc: "DNI 72282555",
		dni: "72282555",
		telefono: "+51 987 654 321",
		proyecto: "Villa Sol · Etapa II",
		lotes: ["C-07"],
		contratoPrincipal: "VS-2025-0507",
		estadoEmocional: "Tono cordial; consulta por logística de entrega y bus para EntregaFest.",
		sintesisIa: "Cliente al día (13/13 cuotas pagadas). Tiene adenda de cambio al Lote C-07 firmada y entrega programada para EntregaFest del 07-nov-2026. Ticket activo AIN-000486 por cupo en bus.",
		guiaRecomendada: "Confirmación de cupo EntregaFest y envío de pase QR por WhatsApp.",
		datos: {
			kyc: [
				["DNI 72282555", "Verificado en RENIEC / SIGDA"],
				["Estado KYC", "Conforme · 15-ene-2026"],
				["Estado Civil", "Casado · Copropietaria: Elena Mendoza"]
			],
			cont: [
				["eddie.huamani@ejemplo.test", "Correo verificado"],
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
], _ = [
	{
		codigo: "VS-2025-0507",
		tipo: "Contrato de Compraventa de Lote Urbano con Reserva de Dominio",
		estado: "VIGENTE",
		empresa: "Aybar Inmobiliaria S.A.C.",
		rucEmpresa: "20601234561",
		clienteNombre: "Eddie Huamaní",
		clienteDoc: "DNI 72282555",
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
				contenido: "Por el presente instrumento, LA VENDEDORA transfiere en compraventa con reserva de propiedad a favor de EL COMPRADOR (Eddie Huamaní, DNI 72282555) el Lote 07 de la Manzana C, con un área superficial de 160.00 m², según Adenda de Reubicación N.º 01."
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
			nombre: "Eddie Huamaní",
			documento: "DNI 72282555",
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
], re = [
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
], v = {
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
}, y = {
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
		inputReal: "Tipo de consulta + lote: responde saldo, estado de cuenta, independización, boletas y EntregaFest."
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
}, ie = {
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
		inputReal: "Detalle financiero reservado (restringido para perfil Gestor; visible para Supervisor y Legal)."
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
		inputReal: "Riesgo regulatorio/judicial y paquete documental 6/6 (restringido para perfil Gestor)."
	}
}, b = [
	{
		id: "saldo-ecta",
		nombre: "Saldo total y estado de cuenta por lote",
		respuesta: (e, t) => `Lote ${t} (${e.proyecto}): ${e.datos.saldo?.[0]?.[1] ?? "S/ 0"} · Estado de cuenta: ${e.datos.ecta?.map((e) => `${e[0]} ${e[1]}`).join(" · ") ?? "Al día"}.`
	},
	{
		id: "independizacion",
		nombre: "Estado de independización y partida registral",
		respuesta: (e, t) => `Lote ${t} (${e.proyecto}): Independización en trámite registral SUNARP · Acta: ${e.datos.acta?.[0]?.[1] ?? "En proceso"}.`
	},
	{
		id: "boletas-abonos",
		nombre: "Validación de boletas y últimos abonos conciliados",
		respuesta: (e, t) => `Lote ${t}: ${e.datos.crono?.[0]?.[1] ?? "Pagos conciliados"} · Última conciliación bancaria verificada sin observaciones.`
	},
	{
		id: "entregafest",
		nombre: "Elegibilidad y requisitos para EntregaFest",
		respuesta: (e, t) => `Lote ${t} (${e.nombre}): Estado en padrón EntregaFest verificado · Garantía: ${e.datos.gar?.[0]?.[1] ?? "Vigente"}.`
	}
], ae = {
	eh: "AIN-000486",
	jr: "ALT-001204",
	lp: "APV-000412",
	mq: "AIN-000482",
	rh: "APV-000089",
	hq: "AIN-000491"
}, x = e.Ii(), S = x.createElement;
x.Fragment;
var { useState: C, useEffect: w, useMemo: oe, useRef: T, useCallback: E, lazy: D, Suspense: O } = x, k = {
	Button: e.Ai,
	Badge: e.$r,
	Tag: e.Qr,
	Alert: e.Gr,
	PageHeader: e.Nr,
	CardHeader: n,
	CardPairs: r,
	SegmentedControl: i,
	SearchInput: a,
	Tabs: t,
	Select: o,
	Card: c,
	CardBody: l,
	Breadcrumb: d,
	FormField: s,
	Dialog: f,
	Table: p,
	EmptyState: u
}, A = (...e) => e.filter(Boolean).join(" "), j = ({ gap: e = "4", className: t, children: n, ...r }) => S("div", {
	...r,
	className: A("ay-stack", `ay-stack--${e}`, t)
}, n), M = ({ gap: e = "2", ajuste: t, justificar: n, className: r, children: i, ...a }) => S("div", {
	...a,
	className: A("ay-row", `ay-row--${e}`, t && "ay-row--wrap", n && n !== "start" && `ay-row--${n}`, r)
}, i), se = ({ columnas: e, gap: t = "md", className: n, children: r, ...i }) => S("div", {
	...i,
	className: A("ay-grid", e && `ay-grid--${e}`, `ay-grid--gap-${t}`, n)
}, r), N = ({ as: e = "span", estilo: t = "body", size: n, className: r, style: i, children: a, ...o }) => S(e, {
	...o,
	className: A("ay-text", `ay-text--${t}`, r),
	style: n ? {
		...i,
		fontSize: `var(--aybar-font-size-${n})`
	} : i
}, a), P = ({ espaciado: e = "md" }) => S("hr", {
	className: A("ay-divider", `ay-divider--${e}`),
	"aria-hidden": "true"
}), ce = ({ nombre: e, size: t = "md" }) => S("span", { className: A("ay-avatar", `ay-avatar--${t}`, "ay-avatar--circle") }, S("span", {
	className: "ay-avatar__initials",
	"aria-hidden": "true"
}, e.split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]).join("").toUpperCase()), S("span", { className: "ay-visually-hidden" }, e));
//#endregion
//#region src/c360/contrato.ts
function F(e) {
	let t = e.letrasVencidas > 0 ? `${e.letrasPagadas}/${e.totalLetras} pagadas · ${e.letrasVencidas} vencidas (${e.moraAcumulada})` : `${e.letrasPagadas}/${e.totalLetras} pagadas · ${e.actaEntregaEstado}`;
	return [
		["Empresa Vendedora", `${e.empresa} (RUC ${e.rucEmpresa})`],
		["Titular / Comprador", `${e.clienteNombre} (${e.clienteDoc})`],
		["Proyecto y Unidad", `${e.proyecto} · ${e.etapa} · ${e.manzanaLote} (${e.areaMetros})`],
		["Registro SUNARP y Notaría", `Partida ${e.partidaMatrizSunarp} · ${e.notaria} (${e.kardexNotarial})`],
		["Posición Financiera", `Total: ${e.precioTotal} · Inicial: ${e.cuotaInicial} · Saldo: ${e.saldoPendiente}`],
		["Letras y Entrega", t]
	];
}
var le = (e) => [
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
], I = (e) => S(N, {
	estilo: "mono",
	size: "xs"
}, e), ue = [
	{
		key: "rol",
		header: "Rol Contractual",
		render: (e) => S(k.Badge, {
			size: "sm",
			tone: e.rol === "REPRESENTANTE_EMPRESA" ? "info" : "success"
		}, e.rol)
	},
	{
		key: "nombre",
		header: "Nombre y Documento",
		render: (e) => S(j, { gap: "1" }, S("strong", null, e.nombre), I(e.documento))
	},
	{
		key: "fechaFirma",
		header: "Fecha y Hora de Firma",
		render: (e) => I(e.fechaFirma)
	},
	{
		key: "modalidad",
		header: "Modalidad de Certificación"
	},
	{
		key: "hashCustodia",
		header: "Hash SHA-256 Custodia GLI",
		render: (e) => I(e.hashCustodia)
	}
], de = [
	{
		key: "numero",
		header: "N.º Letra",
		render: (e) => S(N, {
			as: "strong",
			estilo: "mono",
			size: "xs"
		}, `Letra #${e.numero}`)
	},
	{
		key: "vencimiento",
		header: "Vencimiento",
		render: (e) => I(e.vencimiento)
	},
	{
		key: "monto",
		header: "Importe",
		align: "end",
		render: (e) => S("strong", null, e.monto)
	},
	{
		key: "estado",
		header: "Estado",
		render: (e) => S(k.Badge, {
			size: "sm",
			tone: e.estado === "PAGADA" ? "success" : e.estado === "VENCIDA" ? "danger" : "info"
		}, e.estado)
	},
	{
		key: "fechaPago",
		header: "Fecha de Pago",
		render: (e) => I(e.fechaPago ?? "—")
	},
	{
		key: "operacion",
		header: "Operación Conciliada",
		render: (e) => I(e.operacion ?? "Pendiente de abono")
	}
];
function L(e, t) {
	return t === "clausulas" ? S(j, { gap: "3" }, S(k.Alert, {
		tone: "info",
		size: "sm",
		title: `Zonificación y Linderos (${e.zonificacion})`
	}, e.linderos), e.clausulas.map((e) => S(k.Card, { key: e.numero }, S(k.CardHeader, {
		title: `${e.numero} CLÁUSULA — ${e.titulo}`,
		as: "h4",
		divider: !0,
		actions: e.alerta ? S(k.Badge, {
			size: "sm",
			tone: "danger"
		}, e.alerta) : void 0
	}), S(k.CardBody, { padding: "sm" }, S(N, {
		as: "p",
		estilo: "body",
		size: "sm"
	}, e.contenido))))) : t === "adendas" ? S(j, { gap: "3" }, e.adendas.length ? e.adendas.map((e) => S(k.Card, { key: e.codigo }, S(k.CardHeader, {
		title: `${e.codigo} · ${e.titulo}`,
		subtitle: `Fecha de suscripción: ${e.fecha}`,
		as: "h4",
		divider: !0,
		actions: S(k.Badge, {
			size: "sm",
			tone: e.estado === "FIRMADA" ? "success" : "warning"
		}, e.estado)
	}), S(k.CardBody, {
		padding: "sm",
		gap: "sm"
	}, S(N, {
		as: "strong",
		estilo: "label",
		size: "sm"
	}, e.resumen), S(N, {
		as: "p",
		estilo: "body",
		size: "sm"
	}, e.detalleClausula)))) : S(k.EmptyState, {
		size: "compact",
		title: "Sin adendas modificatorias",
		description: `Se rige íntegramente por la minuta matriz firmada el ${e.fechaSuscripcion}.`
	})) : t === "firmantes" ? S(k.Table, {
		caption: "Firmantes y custodia criptográfica del contrato",
		columns: ue,
		striped: !0,
		rows: e.firmantes.map((e, t) => ({
			...e,
			id: `f${t}`
		}))
	}) : S(k.Table, {
		caption: "Cronograma de letras y estado de conciliación",
		columns: de,
		striped: !0,
		rows: e.cronograma.map((e) => ({
			...e,
			id: `l${e.numero}`
		}))
	});
}
function fe(e) {
	if (!e.abierto) return null;
	let t = _.find((t) => t.codigo === e.codigo) ?? _[0];
	return S(k.Dialog, {
		open: !0,
		size: "lg",
		"data-c360-visor": "",
		title: `Expediente Contractual Inmobiliario · ${t.codigo}`,
		onOpenChange: (t) => {
			t || e.alCerrar();
		}
	}, S(j, { gap: "4" }, S(k.Card, null, S(k.CardBody, {
		padding: "sm",
		gap: "sm"
	}, S(M, {
		gap: "3",
		justificar: "between",
		ajuste: !0
	}, S(j, { gap: "1" }, S(N, {
		estilo: "label",
		size: "xs"
	}, "Seleccionar expediente contractual (SIGDA / GLI)"), S(M, {
		gap: "2",
		ajuste: !0
	}, _.map((n) => S(k.Button, {
		key: n.codigo,
		size: "sm",
		variant: t.codigo === n.codigo ? "primary" : "secondary",
		"aria-pressed": t.codigo === n.codigo,
		onClick: () => e.alElegir(n.codigo)
	}, `${n.codigo} · ${n.clienteNombre.split(" ")[0]}`)))), S(M, {
		gap: "2",
		ajuste: !0
	}, S(k.Badge, { tone: t.estado === "VIGENTE" ? "success" : t.estado === "EN_EVALUACION_RESOLUCION" ? "danger" : "info" }, t.estado), S(k.Badge, { tone: "neutral" }, t.tipo))))), S(k.Card, null, S(k.CardHeader, {
		title: "Ficha Registral y Financiera",
		subtitle: `${t.proyecto} · ${t.etapa} · ${t.manzanaLote}`,
		as: "h3",
		divider: !0
	}), S(k.CardBody, { padding: "sm" }, S(k.CardPairs, { pairs: F(t) }))), S(k.Tabs, {
		"aria-label": "Secciones del expediente contractual",
		variant: "underline",
		size: "sm",
		items: le(t),
		value: e.pestana,
		onValueChange: (t) => {
			(t === "clausulas" || t === "adendas" || t === "firmantes" || t === "cronograma") && e.alCambiarPestana(t);
		}
	}, L(t, e.pestana)), S(P, { espaciado: "none" }), S(M, {
		gap: "2",
		justificar: "between",
		ajuste: !0
	}, S(N, {
		estilo: "body",
		size: "xs"
	}, `Expediente digital sincronizado con Repositorio S3 / GLI (Kardex ${t.kardexNotarial})`), S(M, {
		gap: "2",
		ajuste: !0
	}, e.verBandeja ? S(k.Button, {
		size: "sm",
		variant: "secondary",
		onClick: e.verBandeja
	}, "Ver tickets del titular en Bandeja") : null, t.letrasVencidas >= 3 && e.irMorosidad ? S(k.Button, {
		size: "sm",
		variant: "danger",
		onClick: e.irMorosidad
	}, "Ir a Mesa de Morosidad 3 Meses") : null, S(k.Button, {
		size: "sm",
		variant: "primary",
		onClick: e.alCerrar
	}, "Cerrar visor")))));
}
//#endregion
//#region src/c360/estilos.ts
var pe = "\n.pl-c360.pt-pagina--ancha{max-inline-size:none}\n.pl-c360 .pt-escena-wrap{position:relative;inline-size:100%;min-inline-size:0;border-radius:var(--aybar-radius-lg);overflow:hidden}\n.pl-c360 .pt-escena-grafo{position:relative;inline-size:100%;min-inline-size:0;border-radius:var(--aybar-radius-lg);border:var(--aybar-border-width-thin) solid var(--aybar-color-border-subtle);background:var(--aybar-color-bg-surface-sunken);overflow:hidden}\n.pl-c360 .pt-escena-grafo[hidden],.pl-c360 .atc-astra-canvas[hidden]{display:none !important}\n.pl-c360 .pt-escena-grafo canvas{display:block;inline-size:100%}\n.pl-c360 .atc-astra-canvas{display:block;inline-size:100%;block-size:calc(var(--aybar-space-4) * 35)}\n.pl-c360 .pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}\n.pl-c360 .ay-segmented:not(.ay-segmented--fill){min-inline-size:0;flex-shrink:0}\n.pl-c360 .ay-row>.ay-search{flex:1 1 calc(var(--aybar-space-16) * 3);max-inline-size:none}\n.pl-c360 .ay-row>.ay-selectwrap{inline-size:auto}\n.pl-c360 .ay-grid>.ay-card{cursor:pointer}\n/* cabecera como ay-page-header de ui-angular en la consola de Daniel: panel de superficie, migas sin sangría y el estado\n   (ayEstado) en su propia línea bajo el título */\n.pl-c360 .ay-pageheader{background:var(--aybar-color-bg-surface)}\n.pl-c360 .ay-pageheader>.ay-pageheader__row{padding-inline:clamp(var(--aybar-space-4),(100vw - var(--aybar-breakpoint-md)) * 10000,var(--aybar-space-6))}\n.pl-c360 .ay-pageheader__title>.ay-row{flex-basis:100%}\n/* visor de contratos: el Dialog del artifact con las medidas de ay-modal size=\"lg\" de ui-angular (va en un portal, fuera de .pl-c360) */\n.ay-dialog[data-c360-visor]{inline-size:min(calc(var(--aybar-space-4) * 48),calc(100vw - var(--aybar-space-8)));max-inline-size:none;max-block-size:calc(100vh - var(--aybar-space-16));background:var(--aybar-color-bg-surface)}\n.ay-dialog[data-c360-visor] .ay-dialog__header{padding:var(--aybar-space-6) var(--aybar-space-6) var(--aybar-space-4);border-block-end:0}\n.ay-dialog[data-c360-visor] .ay-dialog__body{padding:0 var(--aybar-space-6) var(--aybar-space-6);font-size:var(--aybar-font-size-sm);line-height:var(--aybar-font-leading-relaxed)}\n.ay-dialog[data-c360-visor] .ay-card__pairs dd{overflow-wrap:anywhere}\n", R = !1;
function me() {
	if (R || typeof document > "u" || (R = !0, document.getElementById("c360-daniel-estilos"))) return;
	let e = document.createElement("style");
	e.id = "c360-daniel-estilos", e.textContent = pe, document.head.append(e);
}
//#endregion
//#region src/c360/pagina.ts
function he(e, t) {
	return e === "SUPERVISOR" ? {
		rol: "supervisor",
		nodo: "ecta"
	} : e === "LEGAL_RECLAMOS" || e === "MESA_SGD" ? {
		rol: "legal",
		nodo: "expo"
	} : e === "COORDINADOR_CX" ? {
		rol: "cx",
		nodo: "tick"
	} : t === "POSTVENTA" ? {
		rol: "supervisor",
		nodo: "gar"
	} : {
		rol: "gestor",
		nodo: "lote"
	};
}
var ge = {
	bandeja: () => "bandeja",
	detalle: () => "detalle",
	nuevo: () => "nuevo",
	libro: () => "libro",
	sgd: (e) => e === "expo" ? "mesa" : "morosidad",
	garantias: () => "garantias",
	evento: () => "fest"
}, _e = [{
	value: "po3d",
	label: "Grafo 3D"
}, {
	value: "2d",
	label: "Grafo 2D"
}], ve = b.map((e) => ({
	value: e.id,
	label: e.nombre
})), ye = (e) => y[e] ?? {
	hu: "Consulta 360 en línea",
	rfRn: "Integración en tiempo real sin copia local",
	entidadDep: e.toUpperCase(),
	inputReal: "Consulta en línea sin copia local."
}, be = (e) => ie[e] ?? {
	hu: "Sección de ficha 360",
	rfRn: "Consulta en tiempo real por perfil",
	entidadDep: "Sistema de origen conectado",
	inputReal: "Dato consultado en línea desde la fuente."
}, xe = (e) => v[e] ?? {
	etiqueta: "Ir a Bandeja del Cliente",
	destino: "bandeja",
	moduloNombre: "Bandeja y Avance Diario"
}, Se = (e) => m.find((t) => t.id === e)?.nombre ?? e, Ce = (e) => e.fuentes.map(Se).join(" + "), we = (e) => h.filter((t) => t.fuentes.includes(e)), Te = (e) => e.datos.cont?.[1]?.[1] ?? e.datos.cont?.[0]?.[1] ?? `${e.k}@cliente.aybar.pe`, Ee = (e, t) => e.datos[t] ?? [["Sin registros", "—"]];
function De(e) {
	me();
	let t = he(e.rol, e.area), n = t.rol, [r, i] = C("po3d"), [a, o] = C("eh"), [s, c] = C(t.nodo), [l, u] = C(null), [d, f] = C(!0), [p, _] = C(!0), [v, y] = C([]), [ie, x] = C(""), [oe, E] = C(""), [D, O] = C([]), [A, F] = C(!1), [le, I] = C("respuesta en 0.54 s · 8 fuentes en línea"), [ue, de] = C(h.length), [L, pe] = C(b[0].id), [R, De] = C("C-07"), [Oe, ke] = C(""), [Ae, je] = C(!1), [Me, Ne] = C(0), [z, B] = C({
		abierto: !1,
		codigo: "VS-2025-0507",
		pestana: "clausulas"
	}), V = g.find((e) => e.k === a) ?? g[0], H = h.find((e) => e.id === s) ?? h[0], Pe = l ? m.find((e) => e.id === l) ?? null : null, Fe = T(null), U = T(null), Ie = T(null), Le = T(null), Re = T(null), W = T(s), ze = T(null), Be = T(null), Ve = T(/* @__PURE__ */ new Set()), He = T([]), Ue = T(0), We = T({}), Ge = T(null), G = T(null), K = T({
		seleccionarNodo: (e) => {},
		inspeccionarFuente: (e) => {}
	}), Ke = (e) => {
		let t = n === "cx" ? "supervisor" : n;
		return e.restringidoPara?.includes(t) ? {
			codigo: "locked",
			tono: "warning",
			etiqueta: "Restringido"
		} : e.fuentes.some((e) => v.includes(e)) ? {
			codigo: "down",
			tono: "danger",
			etiqueta: "No disponible"
		} : {
			codigo: "ok",
			tono: "success",
			etiqueta: "En línea"
		};
	}, qe = (e) => Ee(V, e), Je = (e) => qe(e)[0]?.[1] ?? "—";
	W.current = s, ze.current = D.length > 0 ? { hits: [...D] } : null, Ge.current = {
		fuentes: m,
		nodos: h.map((e) => ({
			id: e.id,
			nombre: e.nombre,
			fuentes: e.fuentes,
			codigo: Ke(e).codigo
		})),
		sel: s,
		caidas: v,
		cliente: {
			iniciales: V.iniciales,
			lotes: V.lotes
		}
	};
	let q = (e) => {
		u(null), c(e), W.current = e, f(!0), _(!0);
	}, Ye = (e) => {
		u(e);
		let t = h.find((t) => t.fuentes.includes(e));
		t && (c(t.id), W.current = t.id), f(!0), _(!0);
	};
	K.current = {
		seleccionarNodo: q,
		inspeccionarFuente: Ye
	};
	let J = (e, t = "clausulas") => B((n) => ({
		abierto: !0,
		codigo: e || n.codigo,
		pestana: t
	})), Xe = (e) => {
		let t = xe(e).destino;
		return t === "contrato" ? null : ge[t]?.(e) ?? "bandeja";
	}, Y = (t) => {
		let n = Xe(t);
		return n === null || e.puede(n);
	}, X = (t) => {
		let n = Xe(t);
		n === null ? J(V.contratoPrincipal, t === "crono" || t === "saldo" ? "cronograma" : t === "docs" ? "adendas" : "clausulas") : e.ir(n, {
			numero: ae[V.k],
			nombre: V.nombre,
			dni: V.dni
		});
	}, Ze = (e) => {
		if (!e) return;
		F(!1), o(e);
		let t = g.find((t) => t.k === e);
		t?.lotes[0] && De(t.lotes[0]), ke("");
	}, Qe = (e, t, n) => {
		let r = n === "cx" ? "supervisor" : n, i = {
			cliente: { nombre: e.nombre },
			fuentes: m.map((e) => ({
				id: e.id,
				n: e.nombre,
				d: e.detalle,
				caida: t.includes(e.id)
			})),
			nodos: h.map((e) => {
				let n = !!e.restringidoPara?.includes(r), i = e.fuentes.some((e) => t.includes(e));
				return {
					id: e.id,
					n: e.nombre,
					estado: n ? "restringido" : i ? "caido" : "ok",
					sem: e.semantico,
					fuentes: e.fuentes
				};
			})
		};
		Re.current = i, Ve.current = /* @__PURE__ */ new Set();
		let a = (e) => t.includes(e) ? 1200 : m.find((t) => t.id === e)?.ms ?? 220, o = [];
		i.fuentes.forEach((e) => o.push({
			a: "c",
			b: e.id,
			t0: 0,
			dur: a(e.id) * .55,
			src: e.id
		})), i.nodos.forEach((e) => e.fuentes.forEach((t) => {
			let n = a(t);
			o.push({
				a: t,
				b: e.id,
				t0: n * .55,
				dur: n * .45 + 120,
				src: t,
				dst: e.id
			});
		})), He.current = o, Ue.current = performance.now();
		let s = Math.max(...i.nodos.map((e) => Math.min(...e.fuentes.map(a)))) + 120, c = t.length, l = `respuesta en ${(s / 1e3).toFixed(2)} s · ${c > 0 ? `${c} ${c === 1 ? "fuente no disponible" : "fuentes no disponibles"}` : `${i.fuentes.length} fuentes en línea`}`;
		I("consultando…"), G.current !== null && clearTimeout(G.current), G.current = setTimeout(() => {
			I(l), de(i.nodos.filter((e) => e.estado === "ok").length);
		}, s + 140);
	}, Z = (e = V) => Qe(e, v, n), $e = (e) => y((t) => t.includes(e) ? t.filter((t) => t !== e) : [...t, e]), et = (e) => y((t) => t.filter((t) => !e.fuentes.includes(t))), tt = (e) => g.find((t) => t.dni.toLowerCase().includes(e) || t.doc.toLowerCase().includes(e) || t.nombre.toLowerCase().includes(e) || t.telefono.toLowerCase().includes(e) || t.lotes.some((t) => t.toLowerCase().includes(e))), nt = (e) => {
		x(e);
		let t = e.trim().toLowerCase();
		if (!t) {
			E(""), O([]);
			return;
		}
		let n = tt(t);
		n && n.k !== a && (F(!1), Ze(n.k));
	}, rt = (e, t, n, r = V) => {
		x(e), q(t), E(n), O(Ee(r, t).map((e, t) => ({
			titulo: e[0],
			fragmento: e[1],
			relevancia: Math.max(82, 98 - t * 6)
		}))), Z(r);
	}, it = () => {
		F(!0), x("DNI 99999999 (No registrado en SIGDA)");
	}, at = (e) => {
		let t = Le.current?.querySelector("input[type=\"search\"], input"), n = (e ?? t?.value ?? ie).trim();
		x(n);
		let r = n.toLowerCase();
		if (!r) {
			f(!0), _(!0), Z();
			return;
		}
		if (r.includes("99999999") || r.includes("no existe")) {
			it();
			return;
		}
		let i = tt(r), o = V;
		i && i.k !== a && (Ze(i.k), o = i);
		let s = re.find((e) => e.q.toLowerCase().includes(r) || r.includes(e.q.toLowerCase()) || r === e.nodo);
		if (s) {
			rt(s.q, s.nodo, s.explicacion, o);
			return;
		}
		let c = h.find((e) => e.nombre.toLowerCase().includes(r) || e.id.toLowerCase() === r);
		if (c) {
			O([]), E(""), q(c.id), Z(o);
			return;
		}
		let l = m.find((e) => e.nombre.toLowerCase().includes(r) || e.id.toLowerCase() === r);
		l ? (O([]), E(""), Ye(l.id), Z(o)) : i ? (O([]), E(""), q(i.lotes.some((e) => e.toLowerCase().includes(r)) ? "lote" : "kyc"), Z(i)) : (q("docs"), O(Ee(o, "docs").map((e, t) => ({
			titulo: e[0],
			fragmento: `${e[1]} · coincidencia semántica para «${n}»`,
			relevancia: Math.max(74, 96 - t * 8)
		}))), E(`Búsqueda semántica documental: indexación vectorial sobre S3/GLI para «${n}» completada en 310 ms.`), Z(o));
	}, ot = () => {
		let e = R || V.lotes[0] || "M-14";
		if (v.includes("jose")) {
			ke("El motor de consultas en línea no está disponible en este momento. La atención no se bloquea: continúa con el ticket y vuelve a consultar más tarde.");
			return;
		}
		let t = b.find((e) => e.id === L) ?? b[0];
		ke(t.respuesta(V, e));
	}, st = (t) => e.ir("nuevo", {
		nombre: t.nombre,
		dni: t.dni
	}), ct = () => e.ir("nuevo", {});
	w(() => {
		q(t.nodo);
	}, [e.rol, e.area]), w(() => {
		Z();
	}, [
		a,
		v,
		n
	]), w(() => {
		let e = Fe.current, t = U.current;
		if (!e || !t) return;
		let n = /* @__PURE__ */ new Map(), r = (e) => {
			let t = n.get(e);
			if (t) return t;
			let r = ee(e);
			return n.set(e, r), r;
		}, i = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1, a = null;
		try {
			a = te({
				canvas: t,
				host: e,
				color: r,
				reducido: i,
				vista: Re,
				sel: W,
				sem: ze,
				hover: Be,
				lit: Ve,
				pulsos: He,
				t0: Ue,
				pos: We,
				alClickNodo: (e) => K.current.seleccionarNodo(e),
				alClickFuente: (e) => K.current.inspeccionarFuente(e)
			});
		} catch (e) {
			console.error("[grafo 3D]", e);
		}
		return () => a?.();
	}, []), w(() => {
		let e = Ie.current;
		if (e) return ne({
			canvas: e,
			estado: Ge,
			alClickNodo: (e) => K.current.seleccionarNodo(e),
			alClickFuente: (e) => K.current.inspeccionarFuente(e),
			alClickCliente: () => K.current.seleccionarNodo("kyc")
		});
	}, []), w(() => {
		if (!Ae) return;
		let e = setInterval(() => Ne((e) => e + 1), 1e3);
		return () => clearInterval(e);
	}, [Ae]), w(() => () => {
		G.current !== null && clearTimeout(G.current);
	}, []);
	let lt = (e) => {
		let t = U.current.getBoundingClientRect();
		return [e.clientX - t.left, e.clientY - t.top];
	}, ut = (e) => {
		if (!U.current) return;
		let [t, n] = lt(e), r = We.current, i = null, a = 26;
		for (let e of h) {
			let o = r[e.id];
			if (!o) continue;
			let s = Math.hypot(o.x - t, o.y - n);
			s < a && (a = s, i = e.id);
		}
		if (i) return q(i);
		for (let e of m) {
			let i = r[e.id];
			if (i && Math.hypot(i.x - t, i.y - n) < 26) return Ye(e.id);
		}
		let o = r.c;
		o && Math.hypot(o.x - t, o.y - n) < 32 && q("kyc");
	}, dt = (e) => {
		let t = U.current;
		if (!t) return;
		let [n, r] = lt(e), i = We.current, a = null, o = 26;
		for (let e of h) {
			let t = i[e.id];
			if (!t) continue;
			let s = Math.hypot(t.x - n, t.y - r);
			s < o && (o = s, a = e.id);
		}
		if (!a) for (let e of m) {
			let t = i[e.id];
			if (t && Math.hypot(t.x - n, t.y - r) < 24) {
				a = e.id;
				break;
			}
		}
		Be.current = a, t.style.cursor = a ? "pointer" : "default";
	}, Q = (e, t) => S(k.Button, {
		size: "sm",
		...e
	}, t), $ = Ke(H), ft = xe(H.id), pt = (e) => qe(e).map(([e, t]) => [e, t]), mt = (e) => {
		let t = be(e);
		return [
			["Sistema de origen", t.entidadDep],
			["Criterio", t.rfRn],
			["Consulta en línea", t.inputReal]
		];
	}, ht = (e) => {
		let t = ye(e.id);
		return [
			["Plataforma", t.entidadDep],
			["Integración", t.rfRn],
			["Consulta en línea", t.inputReal]
		];
	}, gt = (e) => S(M, {
		gap: "2",
		ajuste: !0
	}, ...e, Q({
		variant: "ghost",
		onClick: () => _(!p)
	}, p ? "Contraer" : "Desplegar"), Q({
		variant: "ghost",
		"aria-label": "Cerrar ficha",
		onClick: () => f(!1)
	}, "Cerrar")), _t = S(k.Card, null, S(k.CardBody, null, S(j, { gap: "3" }, S("div", {
		className: "ay-row ay-row--2 ay-row--wrap",
		role: "search",
		ref: Le
	}, S(k.SearchInput, {
		label: "Buscar cliente o documento (DNI, lote, teléfono, sección 360 o consulta en lenguaje natural)",
		size: "sm",
		debounce: 0,
		value: ie,
		onValueChange: nt,
		onSearch: (e) => at(e),
		placeholder: "Ej. Elena, 45892104, M-14, adenda de cambio de lote, cuotas vencidas…"
	}), Q({
		variant: "primary",
		onClick: () => at()
	}, "Consultar"), S(k.SegmentedControl, {
		label: "Modo de visualización 360",
		size: "sm",
		options: _e,
		value: r,
		onValueChange: (e) => {
			(e === "po3d" || e === "2d") && (i(e), requestAnimationFrame(() => window.dispatchEvent(new Event("resize"))));
		}
	})), S(M, {
		gap: "2",
		ajuste: !0,
		"aria-label": "Clientes frecuentes y búsquedas por significado"
	}, S(N, {
		estilo: "label",
		size: "xs"
	}, "Clientes:"), g.map((e) => Q({
		key: e.k,
		variant: a === e.k ? "primary" : "secondary",
		onClick: () => Ze(e.k)
	}, e.nombre)), S(N, {
		estilo: "label",
		size: "xs"
	}, "Búsqueda semántica:"), re.map((e) => Q({
		key: e.q,
		variant: "ghost",
		onClick: () => rt(e.q, e.nodo, e.explicacion)
	}, `«${e.q}»`))), S("div", { className: "pt-escena-wrap" }, S("div", {
		ref: Fe,
		className: "pt-escena-grafo",
		hidden: r !== "po3d"
	}, S("canvas", {
		ref: U,
		role: "img",
		"aria-label": `Red de consulta 360 de ${V.nombre}: ${m.length} sistemas de origen y ${h.length} datos.`,
		onClick: (e) => ut(e.nativeEvent),
		onMouseMove: (e) => dt(e.nativeEvent),
		onMouseLeave: () => {
			Be.current = null;
		}
	})), S("canvas", {
		ref: Ie,
		className: "atc-astra-canvas",
		hidden: r !== "2d",
		role: "img",
		"aria-label": `Red de consulta 360 de ${V.nombre} en 2D.`
	}), d ? Pe ? ((e) => {
		let t = v.includes(e.id);
		return S("div", {
			className: "pl-atc-ficha-flotante",
			role: "dialog",
			"aria-modal": "false",
			"aria-label": `Sistema de origen ${e.nombre}`
		}, S(k.Card, null, S(k.CardHeader, {
			title: `Sistema: ${e.nombre}`,
			subtitle: `${e.detalle} · ${ye(e.id).hu}`,
			as: "h3",
			actions: gt([S(k.Badge, {
				key: "e",
				size: "sm",
				tone: t ? "danger" : "success"
			}, t ? "Sin respuesta" : "En línea"), S(k.Badge, {
				key: "l",
				size: "sm",
				tone: "info"
			}, `Latencia ${e.ms} ms`)])
		}), p ? S(k.CardBody, null, S(j, { gap: "3" }, S(k.CardPairs, { pairs: ht(e) }), S(j, { gap: "1" }, S(N, {
			estilo: "label",
			size: "xs"
		}, `Secciones alimentadas por ${e.nombre}`), S(M, {
			gap: "2",
			ajuste: !0
		}, we(e.id).map((e) => Q({
			key: e.id,
			variant: s === e.id ? "primary" : "secondary",
			onClick: () => q(e.id)
		}, e.nombre)))), S(P, { espaciado: "sm" }), S(M, {
			gap: "2",
			ajuste: !0
		}, Q({
			variant: t ? "primary" : "danger",
			onClick: () => $e(e.id)
		}, t ? "Restaurar fuente en línea" : "Probar desconexión"), Q({
			variant: "ghost",
			onClick: () => u(null)
		}, "Ver nodo actual")))) : null));
	})(Pe) : S("div", {
		className: "pl-atc-ficha-flotante",
		role: "dialog",
		"aria-modal": "false",
		"aria-label": `Nodo 360 ${H.nombre}`
	}, S(k.Card, null, S(k.CardHeader, {
		title: H.nombre,
		subtitle: `${be(H.id).hu} · ${V.nombre}`,
		as: "h3",
		actions: gt([S(k.Badge, {
			key: "e",
			size: "sm",
			tone: $.tono
		}, $.etiqueta), S(k.Badge, {
			key: "o",
			size: "sm",
			tone: "info"
		}, `Origen: ${Ce(H)}`)])
	}), p ? S(k.CardBody, null, S(j, { gap: "3" }, $.codigo === "locked" ? S(k.Alert, {
		tone: "warning",
		title: "Acceso restringido por perfil"
	}, `Tu perfil (${e.etiquetaRol}) no tiene acceso a este dato reservado. Cambia de perfil a Supervisor o Legal en Herramientas › Ver como para visualizarlo.`) : $.codigo === "down" ? S(k.Alert, {
		tone: "danger",
		title: "Fuente no disponible temporalmente"
	}, `${H.fuentes.filter((e) => v.includes(e)).map(Se).join(", ")} no responde en este instante. Las demás secciones siguen activas.`) : [S(k.CardPairs, {
		key: "p",
		pairs: pt(H.id)
	}), H.semantico && D.length > 0 ? S(k.Card, { key: "s" }, S(k.CardHeader, {
		title: "Coincidencias semánticas",
		as: "h4"
	}), S(k.CardBody, null, S(j, { gap: "2" }, D.map((e) => S(M, {
		key: e.titulo,
		gap: "2",
		ajuste: !0
	}, S(k.Badge, {
		size: "sm",
		tone: "info"
	}, `${e.relevancia}%`), S(N, {
		as: "strong",
		estilo: "title",
		size: "xs"
	}, e.titulo), S(N, {
		estilo: "subtitle",
		size: "xs"
	}, `«${e.fragmento}»`)))))) : null], S(P, { espaciado: "sm" }), S(k.CardPairs, { pairs: mt(H.id) }), S(M, {
		gap: "2",
		ajuste: !0
	}, Y(H.id) ? Q({
		variant: "primary",
		onClick: () => X(H.id)
	}, `${ft.etiqueta} →`) : null, ft.destino === "contrato" ? null : Q({
		variant: "secondary",
		onClick: () => J(V.contratoPrincipal)
	}, `Contrato ${V.contratoPrincipal}`), e.puede("nuevo") ? Q({
		variant: "secondary",
		onClick: () => st(V)
	}, "+ Crear ticket") : null))) : null)) : null), S(M, {
		gap: "2",
		ajuste: !0,
		justificar: "between"
	}, S(M, {
		gap: "2",
		ajuste: !0
	}, S(k.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-secondary-400)"
	}, "Cliente"), S(k.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-primary-500)"
	}, `Sistema de origen (${m.length - v.length}/${m.length})`), S(k.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-fg-link)"
	}, `Dato del cliente (${ue}/${h.length})`), S(k.Tag, {
		variant: "outline",
		dotColor: "var(--aybar-color-feedback-danger-border)"
	}, "Restringido / sin conexión")), S(M, {
		gap: "2",
		ajuste: !0
	}, S(N, {
		estilo: "label",
		size: "xs",
		role: "status",
		"aria-live": "polite"
	}, le), S(k.Badge, {
		size: "sm",
		tone: "info"
	}, "Consulta en línea (< 2 s)")))))), vt = S("aside", {
		className: "ay-stack ay-stack--3",
		style: { gridColumn: "span 1" },
		"aria-label": "Cliente, controles y navegación rápida"
	}, S(k.Card, null, S(k.CardHeader, {
		title: V.nombre,
		subtitle: `${V.doc} · ${V.proyecto} · Contrato ${V.contratoPrincipal}`,
		as: "h3",
		actions: S(k.Badge, {
			size: "sm",
			tone: "success"
		}, "Maestro SIGDA")
	}), S(k.CardBody, null, S(j, { gap: "3" }, S(M, {
		gap: "2",
		ajuste: !0
	}, S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, `Lotes ${V.lotes.length}`), S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, `Cuotas: ${Je("cuotas")}`), S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, `Exposición: ${Je("expo")}`)), S(M, {
		gap: "2",
		ajuste: !0
	}, Q({
		variant: "primary",
		onClick: () => J(V.contratoPrincipal)
	}, `Ver contrato ${V.contratoPrincipal}`), Y("tick") ? Q({
		variant: "secondary",
		onClick: () => X("tick")
	}, "Tickets en Bandeja") : null)))), S(k.Card, null, S(k.CardHeader, {
		title: "Estado de sistemas de origen",
		subtitle: "Monitoreo de disponibilidad y continuidad por fuente",
		as: "h3"
	}), S(k.CardBody, null, S(M, {
		gap: "2",
		ajuste: !0
	}, Q({
		variant: v.length === 0 ? "primary" : "secondary",
		onClick: () => y([])
	}, "Todas en línea"), m.map((e) => Q({
		key: e.id,
		variant: v.includes(e.id) ? "primary" : "secondary",
		onClick: () => $e(e.id)
	}, e.nombre))))), S(k.Card, null, S(k.CardHeader, {
		title: "Nodos del Grafo 360 y Redirección",
		subtitle: "Haz clic en un nodo para inspeccionarlo o redirigir a su módulo operativo",
		as: "h3"
	}), S(k.CardBody, null, S(j, { gap: "3" }, S(M, {
		gap: "2",
		ajuste: !0
	}, h.map((e) => Q({
		key: e.id,
		variant: s === e.id && !l ? "primary" : "secondary",
		onClick: () => q(e.id)
	}, e.nombre))), S(M, {
		gap: "2",
		ajuste: !0
	}, Y(H.id) ? Q({
		variant: "secondary",
		onClick: () => X(H.id)
	}, `${ft.etiqueta} →`) : null, Q({
		variant: "ghost",
		onClick: () => {
			f(!d), _(!0);
		}
	}, d ? "Ocultar ficha" : "Mostrar ficha")))))), yt = S(k.Card, null, S(k.CardBody, null, S(j, { gap: "3" }, S(M, {
		gap: "4",
		ajuste: !0,
		justificar: "between"
	}, S(M, {
		gap: "3",
		ajuste: !0
	}, S(ce, {
		nombre: V.nombre,
		size: "lg"
	}), S(j, { gap: "1" }, S(M, {
		gap: "2",
		ajuste: !0
	}, S(N, {
		estilo: "label",
		size: "xs"
	}, `Clientes / ${V.nombre}`), S(k.Badge, {
		size: "sm",
		tone: "success"
	}, "Titular verificado en SIGDA")), S(M, {
		gap: "2",
		ajuste: !0
	}, S(N, {
		estilo: "title",
		size: "lg"
	}, V.nombre), S(k.Badge, {
		size: "sm",
		tone: "info"
	}, V.doc), S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, V.telefono), S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, Te(V)), S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, `${V.proyecto} · Lote ${V.lotes.join(", ")}`), S(k.Badge, {
		size: "sm",
		tone: "info"
	}, `Contrato ${V.contratoPrincipal}`)), S(N, {
		as: "p",
		estilo: "body",
		size: "sm"
	}, S("strong", null, "Contexto de atención:"), " ", V.estadoEmocional))), S(M, {
		gap: "2",
		ajuste: !0
	}, S(k.Card, null, S(k.CardBody, null, S(M, {
		gap: "3",
		ajuste: !0
	}, S(j, { gap: "1" }, S(N, {
		estilo: "label",
		size: "xs"
	}, "Central Telefónica CTI"), S(N, {
		as: "strong",
		estilo: "mono",
		size: "sm"
	}, V.telefono)), Ae ? [S(k.Badge, {
		key: "b",
		size: "sm",
		tone: "success"
	}, `En llamada · 00:${Me < 10 ? "0" + Me : Me}`), Q({
		key: "c",
		variant: "danger",
		onClick: () => {
			je(!1), q("llam");
		}
	}, "Colgar y guardar grabación")] : Q({
		variant: "primary",
		onClick: () => {
			Ne(1), je(!0);
		}
	}, "Llamar")))), Q({
		variant: "primary",
		onClick: () => J(V.contratoPrincipal)
	}, `Ver contrato ${V.contratoPrincipal}`), e.puede("nuevo") ? Q({
		variant: "secondary",
		onClick: () => st(V)
	}, "+ Crear ticket") : null, Q({
		variant: "ghost",
		onClick: it
	}, "Registrar Interesado no ubicado"))), S(k.Alert, {
		tone: "info",
		title: "Síntesis Copiloto IA en tiempo real"
	}, `${V.sintesisIa} — `, S("strong", null, "Acción sugerida:"), ` ${V.guiaRecomendada}`)))), bt = S(k.Card, null, S(k.CardHeader, {
		title: "Consultas rápidas en línea",
		subtitle: "Respuestas instantáneas del motor de consultas por lote y contrato.",
		as: "h3",
		actions: S(M, {
			gap: "2",
			ajuste: !0
		}, Q({
			variant: "primary",
			onClick: ot
		}, "Consultar ahora"), Q({
			variant: "secondary",
			onClick: () => J(V.contratoPrincipal)
		}, `Abrir contrato ${V.contratoPrincipal}`))
	}), S(k.CardBody, null, S(j, { gap: "3" }, S(se, {
		columnas: 2,
		gap: "md"
	}, S(k.FormField, { label: "Tipo de consulta" }, S(k.Select, {
		size: "sm",
		options: ve,
		value: L,
		onChange: (e) => pe(e.target.value)
	})), S(k.FormField, { label: "Lote del cliente" }, S(k.Select, {
		size: "sm",
		options: V.lotes.map((e) => ({
			value: e,
			label: `${V.proyecto} · Lote ${e}`
		})),
		value: R,
		onChange: (e) => De(e.target.value)
	}))), Oe ? S(k.Alert, {
		tone: v.includes("jose") ? "danger" : "success",
		title: b.find((e) => e.id === L)?.nombre ?? "Consulta al motor"
	}, Oe) : null, S(N, {
		estilo: "subtitle",
		size: "xs"
	}, "Consulta ejecutada en tiempo real contra los sistemas financieros e inmobiliarios con registro de auditoría.")))), xt = S(k.Card, null, S(k.CardHeader, {
		title: `${h.length} secciones de datos en línea de ${V.nombre} (con redirección directa por nodo)`,
		subtitle: "Haz clic en cualquier tarjeta para enfocarla en el Grafo 3D o usa el botón de redirección para ir a su módulo operativo",
		as: "h3"
	}), S(k.CardBody, null, S(se, {
		columnas: 4,
		gap: "md"
	}, h.map((t) => {
		let n = Ke(t), r = xe(t.id);
		return S(k.Card, {
			key: t.id,
			variant: "selectable",
			selected: s === t.id,
			onClick: () => q(t.id)
		}, S(k.CardHeader, {
			title: t.nombre,
			subtitle: `Origen: ${Ce(t)}`,
			as: "h4",
			actions: S(k.Badge, {
				size: "sm",
				tone: n.tono
			}, n.etiqueta)
		}), S(k.CardBody, null, S(j, { gap: "2" }, n.codigo === "ok" ? S(k.CardPairs, { pairs: pt(t.id) }) : n.codigo === "locked" ? S(N, {
			as: "p",
			estilo: "subtitle",
			size: "xs"
		}, `Tu perfil (${e.etiquetaRol}) no tiene acceso a «${t.nombre.toLowerCase()}». Solicítalo a tu supervisor ATC si lo requieres.`) : S(M, {
			gap: "2",
			ajuste: !0,
			justificar: "between"
		}, S(N, {
			estilo: "subtitle",
			size: "xs"
		}, "No se pudo consultar. Las demás secciones siguen disponibles."), Q({
			variant: "secondary",
			onClick: (e) => {
				e.stopPropagation(), et(t);
			}
		}, "Reintentar")), S(P, { espaciado: "sm" }), S(M, {
			gap: "2",
			ajuste: !0,
			justificar: "between",
			onClick: (e) => e.stopPropagation()
		}, S(N, {
			estilo: "label",
			size: "xs"
		}, r.moduloNombre), Y(t.id) ? Q({
			variant: "ghost",
			onClick: () => X(t.id)
		}, `${r.etiqueta} →`) : null))));
	}))));
	return S("div", { className: "pt-pagina pt-pagina--ancha pl-c360" }, S(k.PageHeader, {
		title: "Consulta 360 del Cliente",
		size: "md",
		breadcrumb: S(k.Breadcrumb, {
			label: "Ruta del módulo",
			items: [
				{ label: "Aybar Atiende" },
				{ label: "Núcleo 360 y Planta" },
				{ label: "Consulta 360 del Cliente" }
			]
		}),
		meta: S(M, {
			gap: "2",
			ajuste: !0
		}, S(k.Badge, {
			tone: "success",
			dot: !0
		}, "En línea · 8 sistemas"), S(k.Badge, { tone: "info" }, `${e.usuario} (${e.etiquetaRol})`)),
		description: "Ficha integral consolidada desde 8 sistemas en línea",
		actions: Q({
			variant: "secondary",
			onClick: () => J(z.codigo)
		}, `Visor de Contratos (${z.codigo})`)
	}), S(j, { gap: "4" }, S(se, {
		columnas: 3,
		gap: "md"
	}, S("div", { style: { gridColumn: "span 2" } }, _t), vt), A ? S(k.Alert, {
		tone: "warning",
		title: "Cliente no ubicado en el maestro SIGDA — Registro como Interesado",
		actions: S(M, {
			gap: "2",
			ajuste: !0
		}, e.puede("nuevo") ? Q({
			variant: "primary",
			onClick: ct
		}, "Registrar ticket como Interesado") : null, Q({
			variant: "ghost",
			onClick: () => F(!1)
		}, "Volver a ficha 360"))
	}, "No se encontró coincidencia para el documento consultado. Para preservar la integridad del maestro único, se registra como ", S("strong", null, "Interesado en cola de conciliación"), " con datos mínimos verificables y el ticket continúa su atención sin bloquear al cliente.") : null, v.length > 0 ? S(k.Alert, {
		tone: "warning",
		title: `Continuidad operativa activa — ${v.length} sistema(s) externo(s) sin respuesta`
	}, `La vista 360 mantiene operativas las ${m.length - v.length} fuentes restantes (los nodos del sistema sin conexión se marcan como «no disponible» mientras el resto de la ficha responde con normalidad).`) : null, oe ? S(k.Alert, {
		tone: "info",
		title: "Búsqueda semántica documental por significado"
	}, oe) : null, yt, S(M, {
		gap: "2",
		ajuste: !0,
		justificar: "between"
	}, S(N, {
		estilo: "subtitle",
		size: "xs"
	}, S("strong", null, "Vista estructurada en tarjetas (consulta directa a las fuentes de origen):"), " los datos se consultan en tiempo real sin duplicarse localmente."), S(M, {
		gap: "2",
		ajuste: !0
	}, S(k.Badge, {
		size: "sm",
		tone: "neutral"
	}, le), S(k.Badge, {
		size: "sm",
		tone: "info"
	}, "Tiempo de respuesta < 2 s"))), bt, xt), S(fe, {
		abierto: z.abierto,
		codigo: z.codigo,
		pestana: z.pestana,
		alElegir: (e) => B((t) => ({
			...t,
			codigo: e
		})),
		alCambiarPestana: (e) => B((t) => ({
			...t,
			pestana: e
		})),
		alCerrar: () => B((e) => ({
			...e,
			abierto: !1
		})),
		verBandeja: e.puede("bandeja") ? () => {
			B((e) => ({
				...e,
				abierto: !1
			})), e.ir("bandeja", {});
		} : void 0,
		irMorosidad: e.puede("morosidad") ? () => {
			B((e) => ({
				...e,
				abierto: !1
			})), e.ir("morosidad", {});
		} : void 0
	}));
}
//#endregion
export { De as Consulta360Daniel };
