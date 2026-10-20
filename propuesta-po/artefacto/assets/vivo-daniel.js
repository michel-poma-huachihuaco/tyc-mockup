import * as e from "./comun-CVU2GQ4h.js";
import { h as t, m as n, n as r, u as i, x as a } from "./prototipo-B6qmgYQk.js";
import { n as o, t as s } from "./CardBody-WQ8Pzs3R.js";
import { t as c } from "./Breadcrumb-BtXUT3bJ.js";
import { leerTokenRgb as l, montarVivoDaniel as ee } from "./escenas-three.js";
import { t as u } from "./ProgressBar-CxT9FNs6.js";
//#region src/vivo/datos.ts
var d = [
	{
		k: "tel",
		nombre: "Call center",
		y: 1,
		ic: "TEL"
	},
	{
		k: "wa",
		nombre: "WhatsApp",
		y: 2.9,
		ic: "WA"
	},
	{
		k: "mail",
		nombre: "Correo",
		y: 4.8,
		ic: "@"
	},
	{
		k: "portal",
		nombre: "Mi Portal",
		y: 6.7,
		ic: "WEB"
	},
	{
		k: "form",
		nombre: "Formulario QR",
		y: 8.6,
		ic: "QR"
	}
], f = [
	{
		k: "eje1",
		nombre: "Atención Eje 1",
		x: 12.2,
		y: .3,
		w: 3.5,
		d: 2.8,
		gestores: [
			"Ana P.",
			"Luis M.",
			"Rosa T."
		]
	},
	{
		k: "cob",
		nombre: "Cobranza",
		x: 12.2,
		y: 3.5,
		w: 3.5,
		d: 2.8,
		gestores: ["Carla V.", "Iván Q."]
	},
	{
		k: "libro",
		nombre: "Libro de Reclamaciones",
		x: 12.2,
		y: 6.7,
		w: 3.5,
		d: 2.8,
		gestores: ["Sofía R.", "Diego A."]
	},
	{
		k: "legal",
		nombre: "Legal · Eje 3",
		x: 12.2,
		y: 12.4,
		w: 3.5,
		d: 3.2,
		gestores: ["Rosario V."]
	},
	{
		k: "post",
		nombre: "Postventa",
		x: 7.6,
		y: 12.4,
		w: 3.3,
		d: 3.2,
		gestores: ["Pedro L.", "Mónica S."]
	},
	{
		k: "proy",
		nombre: "Proyecto · Entrega Fest",
		x: 3.4,
		y: 12.4,
		w: 3.4,
		d: 3.2,
		gestores: ["Elena C."]
	}
], p = {
	cons: {
		nombre: "Consulta general",
		area: "eje1",
		pt: [20, 40],
		sla: 150
	},
	cuota: {
		nombre: "Cuotas y pagos",
		area: "cob",
		pt: [25, 50],
		sla: 200
	},
	moro: {
		nombre: "Resolución morosidad (3m)",
		area: "cob",
		pt: [40, 70],
		sla: 240
	},
	recl: {
		nombre: "Reclamo (Libro)",
		area: "libro",
		pt: [60, 110],
		sla: 260
	},
	legal: {
		nombre: "Conflicto legal Eje 3",
		area: "legal",
		pt: [90, 150],
		sla: 300
	},
	gar: {
		nombre: "Garantía postventa",
		area: "post",
		pt: [60, 100],
		sla: 280
	},
	ingr: {
		nombre: "Ingreso al proyecto",
		area: "proy",
		pt: [8, 16],
		sla: 50
	},
	bus: {
		nombre: "Cupo bus EntregaFest",
		area: "proy",
		pt: [8, 15],
		sla: 60
	}
}, m = [
	[
		"Eddie Huamaní",
		"Villa Sol II · Lote C-07",
		"Consulta de cupo en bus EntregaFest y pase QR"
	],
	[
		"Lucía Paredes",
		"Mirador del Sur · Lote C-21",
		"Inspección de fisura en muro perimétrico (Garantía)"
	],
	[
		"Jorge Ramos",
		"Los Álamos I · Lote A-03",
		"Reclamo por demora de minuta y suspensión de resolución"
	],
	[
		"María Quispe",
		"Villa Sol II · Lote B-14",
		"Validación de voucher de cuota pagada en agente BCP"
	],
	[
		"Carlos Mendoza",
		"Praderas de Lurín · Lote D-09",
		"Solicitud de estado de cuenta y cronograma actualizado"
	],
	[
		"Rosa Chávez",
		"Oasis de Ancón · Lote E-02",
		"Confirmación de asistencia familiar a EntregaFest"
	],
	[
		"Pedro Soto",
		"Valle Verde · Lote A-18",
		"Consulta sobre independización registral y firma"
	],
	[
		"Ana Flores",
		"Bosques del Norte · Lote F-11",
		"Reporte de alumbrado en vía principal del proyecto"
	]
], h = {
	eje1: "Sup. Mirtha Delgado (Líder ATC)",
	cob: "Jefe Raúl Cárdenas (Líder Cobranza)",
	libro: "Dra. Patricia Vílchez (Oficial Cumplimiento)",
	legal: "Dr. Ernesto Alarcón (Gerencia Legal Eje 3)",
	post: "Ing. Roberto Castañeda (Jefe Postventa)",
	proy: "Arq. Claudia Mendoza (Responsable Proyecto)"
}, te = {
	eje1: [
		43,
		138,
		156
	],
	cob: [
		245,
		158,
		11
	],
	libro: [
		236,
		72,
		153
	],
	legal: [
		139,
		92,
		246
	],
	post: [
		16,
		185,
		129
	],
	proy: [
		6,
		182,
		212
	]
}, ne = {
	tel: [
		56,
		189,
		248
	],
	wa: [
		34,
		197,
		94
	],
	mail: [
		129,
		140,
		248
	],
	portal: [
		245,
		158,
		11
	],
	form: [
		236,
		72,
		212
	]
}, g = {
	"canal:tel": {
		clave: "canal:tel",
		categoria: "Canal de entrada",
		nombre: "Call Center / Teléfono (CTI)",
		hu: "Identificación automática y grabación",
		rfRn: "Enlace telefónico CTI con apertura de ticket por consulta",
		entidad: "Central Telefónica CTI",
		lider: "Sup. Mirtha Delgado (Líder ATC)",
		slaRegla: "Identificación automática por número o DNI y grabación vinculada al ticket.",
		inputsReales: "Teléfono entrante (ANI), DNI/CE, motivo tipificado, grabación de llamada y casillero único por consulta.",
		gateKey: "tel"
	},
	"canal:wa": {
		clave: "canal:wa",
		categoria: "Canal de entrada",
		nombre: "WhatsApp Corporativo",
		hu: "Mensajería verificada multicanal",
		rfRn: "Apertura de casillero independiente por consulta",
		entidad: "Canal WhatsApp Oficial",
		lider: "Sup. Mirtha Delgado (Líder ATC)",
		slaRegla: "1 casillero (ticket) por cada consulta distinta del cliente.",
		inputsReales: "Número WhatsApp verificado, texto/audios/fotos de sustento, lote asociado y consentimiento.",
		gateKey: "wa"
	},
	"canal:mail": {
		clave: "canal:mail",
		categoria: "Canal de entrada",
		nombre: "Correo Electrónico ATC",
		hu: "Buzón corporativo con acuse",
		rfRn: "Notificación automática al cliente y al líder de área",
		entidad: "Buzón Digital ATC",
		lider: "Sup. Mirtha Delgado (Líder ATC)",
		slaRegla: "Acuse automático con código de seguimiento y alerta por correo en cada asignación.",
		inputsReales: "Remitente, asunto, cuerpo del mensaje, adjuntos PDF/imagen y vínculo con contrato/lote.",
		gateKey: "mail"
	},
	"canal:portal": {
		clave: "canal:portal",
		categoria: "Canal de entrada",
		nombre: "Mi Portal (Autogestión Cliente)",
		hu: "Seguimiento en vivo y conformidad",
		rfRn: "Confirmación del titular para cierre definitivo",
		entidad: "Portal del Propietario",
		lider: "Coordinación CX / Mi Portal",
		slaRegla: "El cliente ve el estado en vivo y confirma la solución para cerrar el ticket.",
		inputsReales: "Sesión autenticada del titular en Mi Portal, lote seleccionado, tipo de solicitud y adjuntos.",
		gateKey: "portal"
	},
	"canal:form": {
		clave: "canal:form",
		categoria: "Canal de entrada",
		nombre: "Formulario QR / Pórtico de Obra",
		hu: "Control de visitas y pre-tickets en campo",
		rfRn: "Registro rápido en pórtico y captura de evidencias",
		entidad: "Control de Accesos Obra",
		lider: "Arq. Claudia Mendoza (Responsable Proyecto)",
		slaRegla: "Registro rápido de ingreso a proyecto en pórtico y derivación directa a obra.",
		inputsReales: "DNI visitante/propietario, manzana-lote, placa de vehículo, motivo de visita a obra y pase QR.",
		gateKey: "form"
	},
	"etapa:bandeja": {
		clave: "etapa:bandeja",
		categoria: "Orquestación",
		nombre: "Bandeja Orquestadora Central (Robot Despachador)",
		hu: "Despacho inteligente por prioridad y carga",
		rfRn: "Tope máximo de 10% de cola con prioridad Rayo",
		entidad: "Motor de Despacho ATC",
		lider: "Sup. Mirtha Delgado (Supervisión Orquestación)",
		slaRegla: "Orden estricto: 1.º Rayo (máx. 10% de cola) · 2.º SLA más próximo a vencer · 3.º Prioridad · Menor carga.",
		inputsReales: "Tipificación en 5 familias, prioridad, marca Rayo con motivo obligatorio, carga por gestor y correo CC al líder."
	},
	"sala:eje1": {
		clave: "sala:eje1",
		categoria: "Área operativa",
		nombre: "Atención Eje 1 (ATC General)",
		hu: "Consultas generales, pedidos y primera línea",
		rfRn: "Base de conocimiento y casillero único por consulta",
		entidad: "Área Atención Eje 1",
		lider: h.eje1,
		slaRegla: "1.ª respuesta ≤ 2 h hábiles · Resolución consultas/pedidos simples ≤ 24 h hábiles.",
		inputsReales: "Consultas generales, pedidos simples, guía de solución recomendada y casillero independiente por consulta.",
		areaKey: "eje1"
	},
	"sala:cob": {
		clave: "sala:cob",
		categoria: "Área operativa",
		nombre: "Cobranza (Eje 2 · Financiamiento y Letras)",
		hu: "Validación de abonos, letras y prevención de mora",
		rfRn: "Sincronización con Motor de Cobranza y control de resolución",
		entidad: "Área de Cobranza y Cartera",
		lider: h.cob,
		slaRegla: "Validación de abonos ≤ 24 h · Alerta automática al cumplir 3 meses de letras impagas.",
		inputsReales: "Vouchers de pago, cronograma de letras, estado de cartera en línea, carta de resolución y alerta paralela de cancelación.",
		areaKey: "cob"
	},
	"sala:libro": {
		clave: "sala:libro",
		categoria: "Área operativa",
		nombre: "Libro de Reclamaciones (INDECOPI)",
		hu: "Gestión legal de quejas y reclamos de consumo",
		rfRn: "Plazo legal Ley 29571 con control de prórroga y cargo",
		entidad: "Oficialía de Cumplimiento",
		lider: h.libro,
		slaRegla: "Plazo legal improrrogable de 15 días hábiles (Ley 29571) con 1 sola prórroga motivada.",
		inputsReales: "Asiento correlativo (Queja / Reclamo), pedido concreto del consumidor, cargo de notificación al cliente, control de huérfanos y expediente INDECOPI.",
		areaKey: "libro"
	},
	"sala:legal": {
		clave: "sala:legal",
		categoria: "Área operativa",
		nombre: "Legal · Eje 3 (Handoff y Custodia)",
		hu: "Dictamen jurídico y custodia probatoria",
		rfRn: "Validación obligatoria de checklist documental 6/6",
		entidad: "Gerencia Legal Eje 3",
		lider: h.legal,
		slaRegla: "No acepta derivación sin paquete documental completo 6/6 validado.",
		inputsReales: "Checklist 6/6 (contrato, estado de cuenta, cartas previas, evidencias, hoja de ruta y dictamen), resolución legal y custodia probatoria inmutable.",
		areaKey: "legal"
	},
	"sala:post": {
		clave: "sala:post",
		categoria: "Área operativa",
		nombre: "Postventa (Eje 4 · Garantías e Inspección)",
		hu: "Cobertura de garantías, visitas técnicas y cuadrillas",
		rfRn: "Matriz de vigencia en meses desde el Acta de Entrega",
		entidad: "Ingeniería de Postventa",
		lider: h.post,
		slaRegla: "Vigencia calculada en meses desde el Acta de Entrega · Inspección de campo y control de reincidencia.",
		inputsReales: "Fecha de acta de entrega, partida observada (infraestructura/acabados), vigencia en meses, informe de visita técnica, presupuesto y acta de conformidad.",
		areaKey: "post"
	},
	"sala:proy": {
		clave: "sala:proy",
		categoria: "Área operativa",
		nombre: "Proyecto · Entrega Fest (Administración / Obra)",
		hu: "Visitas a proyecto y logística de eventos de entrega",
		rfRn: "Control de cupos por bus, asistencia QR y encuestas",
		entidad: "Administración de Proyectos",
		lider: h.proy,
		slaRegla: "Control de aforo por bus y bloqueo automático de sobrecupo en EntregaFest.",
		inputsReales: "Formulario de ingreso a proyecto (DNI, lote, motivo, fecha/hora) y padrón de buses, asientos y pases QR de EntregaFest.",
		areaKey: "proy"
	},
	"etapa:comite": {
		clave: "etapa:comite",
		categoria: "Escalamiento",
		nombre: "Comité (Mesa SGD · Casos Complejos y Vencidos)",
		hu: "Escalamiento automático y acuerdos multidisciplinarios",
		rfRn: "Matriz objetiva de riesgo y trazabilidad de acuerdos",
		entidad: "Mesa de Comité SGD",
		lider: "Comité Multidisciplinario SGD (ATC + Legal + Cobranza + Proyectos)",
		slaRegla: "Todo ticket cuyo SLA vence escala automáticamente en cadena (Gestor · Supervisor · Jefe · Comité SGD).",
		inputsReales: "Registro multilínea por lote/contrato, matriz objetiva de riesgo, acuerdos de comité con responsables y casos cruzados."
	},
	"etapa:salida": {
		clave: "etapa:salida",
		categoria: "Cierre y CX",
		nombre: "Cierre en Mi Portal + Encuesta CSAT / CES / NPS",
		hu: "Conformidad del propietario y medición de satisfacción",
		rfRn: "Doble paso Resuelto a Cerrado y alerta de detractores",
		entidad: "Experiencia del Cliente (CX)",
		lider: "Coordinación CX / Calidad de Atención",
		slaRegla: "Un ticket resuelto solo pasa a cerrado cuando el cliente confirma en Mi Portal o vence la ventana de conformidad; dispara encuesta CSAT/CES/NPS.",
		inputsReales: "Evidencia de solución cargada por el gestor, confirmación del cliente en Mi Portal, calificación CSAT (1-5), CES y NPS (-100 a +100) y alerta de detractor."
	}
}, _ = "\n.atc-vivo-stage-area{position:relative;overflow:hidden;min-block-size:calc(var(--aybar-space-4) * 38)}\n.pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;\n  inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}\n.pl-atc-ficha-flotante--izq{inset-inline-start:var(--aybar-space-4);inset-inline-end:auto;inline-size:auto;max-inline-size:calc(100% - var(--aybar-space-8))}\n.ay-grid.vv-grid{grid-template-columns:repeat(var(--vv-cols),minmax(0,1fr))}\n@media (max-width:1000px){.ay-grid.vv-grid{grid-template-columns:repeat(auto-fill,minmax(calc(var(--aybar-space-4) * 11),1fr))}}\n.vv-pagina .ay-pageheader__title .ay-row{display:inline-flex;vertical-align:middle;margin-inline-start:var(--aybar-space-3)}\n.vv-pagina .ay-text--sm{font-size:var(--aybar-font-size-xs)}\n", v = !1;
function re() {
	if (v || typeof document > "u") return;
	v = !0;
	let e = document.createElement("style");
	e.id = "vv-estilos", e.textContent = _, document.head.append(e);
}
//#endregion
//#region src/vivo/kit.ts
var y = e.Ii(), b = y.createElement, { useState: x, useEffect: S, useRef: C } = y, ie = e.k, w = e.A, T = e.Jn, E = {
	Button: e.Ai,
	Badge: e.$r,
	PageHeader: e.Nr,
	Card: o,
	CardBody: s,
	CardHeader: t,
	CardPairs: n,
	Select: a,
	Drawer: i,
	SegmentedControl: r,
	Breadcrumb: c,
	ProgressBar: u
}, D = (...e) => e.filter(Boolean).join(" "), O = "es-PE";
function k(e) {
	let t = typeof e.value == "number" ? new Intl.NumberFormat(O).format(e.value) : e.value;
	return b("dl", { className: D("ay-stat", `ay-stat--${e.size ?? "md"}`) }, b("dt", { className: "ay-stat__label" }, e.label), b("dd", { className: "ay-stat__value" }, t, e.unit ? b("span", { className: "ay-stat__unit" }, ` ${e.unit}`) : null));
}
function ae(e) {
	let t = Math.max(0, Math.min(100, Math.round(e.value))), n = e.size ?? "md";
	return b("div", {
		className: D("ay-circ", `ay-circ--${n}`, `ay-circ--${e.tone ?? "brand"}`),
		role: "progressbar",
		"aria-label": e.label,
		"aria-valuenow": t,
		"aria-valuemin": 0,
		"aria-valuemax": 100
	}, b("svg", {
		viewBox: "0 0 36 36",
		"aria-hidden": "true"
	}, b("circle", {
		className: "ay-circ__track",
		cx: 18,
		cy: 18,
		r: 15.5
	}), t === 0 ? null : b("circle", {
		className: "ay-circ__fill",
		cx: 18,
		cy: 18,
		r: 15.5,
		style: { "--ay-dash": t }
	})), n === "sm" ? null : b("span", { className: "ay-circ__value" }, `${t}%`));
}
var A = "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z";
function oe(e) {
	let t = e.value, n = e.allowHalf ? Math.round(t * 2) / 2 : Math.round(t), r = t > 0 ? `${new Intl.NumberFormat(O, { maximumFractionDigits: 2 }).format(t)} de 5` : "Sin valoraciones", i = e.count == null ? null : `${new Intl.NumberFormat(O).format(e.count)} ${e.count === 1 ? "valoración" : "valoraciones"}`;
	return b("p", {
		className: D("ay-rating", `ay-rating--${e.size ?? "md"}`),
		"aria-label": `${e.label}: ${i ? `${r}, ${i}` : r}`
	}, b("span", {
		className: "ay-rating__icons",
		"aria-hidden": "true"
	}, ...Array.from({ length: 5 }, (e, t) => b("svg", {
		key: t,
		viewBox: "0 0 24 24",
		width: 18,
		height: 18,
		"aria-hidden": "true",
		focusable: "false",
		className: `ay-rating__glyph ay-rating__glyph--${n >= t + 1 ? "full" : n >= t + .5 ? "half" : "empty"}`
	}, b("path", {
		className: "ay-rating__glyph-empty",
		d: A
	}), b("path", {
		className: "ay-rating__glyph-full",
		d: A
	})))), b("span", { className: "ay-rating__value" }, r), i ? b("span", { className: "ay-rating__count" }, i) : null);
}
var j = (e) => {
	let t = (e.getTime() - (/* @__PURE__ */ new Date()).getTime()) / 6e4, n = new Intl.RelativeTimeFormat(O, { numeric: "auto" });
	return Math.abs(t) < 1 ? n.format(0, "second") : Math.abs(t) < 60 ? n.format(Math.round(t), "minute") : n.format(Math.round(t / 60), "hour");
}, M = (e) => e.toLocaleTimeString(O, {
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23"
});
function N(e) {
	let t = e.hitos.map((e) => j(e.fecha));
	return b("ol", {
		className: "ay-timeline ay-timeline--vertical",
		"aria-label": e.label
	}, ...e.hitos.map((e, n) => {
		let r = t[n] === t[n - 1] || t[n] === t[n + 1];
		return b("li", {
			key: e.id,
			className: "ay-timeline__event"
		}, b("span", {
			className: D("ay-timeline__dot", `ay-timeline__dot--${e.tono ?? "default"}`),
			"aria-hidden": "true"
		}), b("div", { className: "ay-timeline__body" }, b("p", { className: "ay-timeline__title" }, b("strong", null, e.autor || "Sistema"), " ", e.titulo), b("time", {
			className: "ay-timeline__time",
			dateTime: e.fecha.toISOString()
		}, r ? `${t[n]} · ${M(e.fecha)}` : t[n])));
	}));
}
var P = (e) => b("span", { className: D("ay-tag", `ay-tag--${e.variant ?? "neutral"}`, "ay-tag--md") }, e.dotColor ? b("span", {
	className: "ay-tag__dot",
	"aria-hidden": "true",
	style: { background: e.dotColor }
}) : null, e.children), F = (e) => Array.isArray(e) ? e : [e], I = (e) => b("div", { className: D("ay-row", `ay-row--${e.gap ?? "2"}`, e.wrap && "ay-row--wrap", e.justify && `ay-row--${e.justify}`, e.className) }, ...F(e.children)), L = (e) => b("div", {
	className: D("ay-stack", `ay-stack--${e.gap ?? "4"}`, e.align && `ay-stack--align-${e.align}`, e.className),
	"aria-label": e["aria-label"]
}, ...F(e.children)), R = (e) => b("div", {
	className: "ay-grid ay-grid--gap-sm vv-grid",
	style: { "--vv-cols": e.columnas }
}, ...F(e.children)), se = () => b("hr", { className: "ay-divider ay-divider--horizontal ay-divider--sm" }), z = () => (/* @__PURE__ */ new Date()).toTimeString().slice(0, 8), ce = class {
	puertas = d;
	salas = f;
	metaXpNivel = 150;
	enEjecucion = !0;
	velocidad = 1;
	cajonLateralAbierto = !1;
	vistaCajon = "todo";
	areaFiltro = "";
	estacionSeleccionadaKey = "etapa:bandeja";
	ticketSeleccionadoId = null;
	cerradosHoy = 38;
	cerradosEnSlaHoy = 35;
	escaladosCount = 2;
	reabiertosHoy = 1;
	xpEquipo = 115;
	nivelEquipo = 4;
	rachaSla = 11;
	csatPromedio = 4.8;
	csatRespuestas = 29;
	ticketsActivos = [];
	correosEnviados = [{
		id: "MAIL-01",
		hora: "10:28:14",
		ticketId: "AIN-000201",
		gestor: "Ana P. (Atención Eje 1)",
		liderCopia: h.eje1,
		sala: "Atención Eje 1",
		slaTexto: "SLA 1.ª resp: 2 h hábiles"
	}, {
		id: "MAIL-02",
		hora: "10:29:02",
		ticketId: "AIN-000202",
		gestor: "Carla V. (Cobranza)",
		liderCopia: h.cob,
		sala: "Cobranza",
		slaTexto: "Prioridad Rayo · SLA resolución: 24 h"
	}];
	hits = { current: [] };
	seqId = 200;
	spawnTimer = 0;
	ocupacionEscritorios = {};
	constructor() {
		this.salas.forEach((e) => {
			this.ocupacionEscritorios[e.k] = e.gestores.map((t, n) => ({
				id: `${e.k}:g${n}`,
				nombre: t,
				ticketId: null,
				atendidos: 3 + n % 2
			}));
		});
		for (let e = 0; e < 10; e++) this.inyectarTicket({
			rayo: e === 1 || e === 5,
			silencioso: !0
		});
		for (let e = 0; e < 14; e++) this.ejecutarPasoSimulacion();
	}
	tick() {
		if (this.enEjecucion) for (let e = 0; e < this.velocidad; e++) this.ejecutarPasoSimulacion();
	}
	conRayoCount() {
		return this.ticketsActivos.filter((e) => e.rayo).length;
	}
	activosEnCursoCount() {
		return this.ticketsActivos.filter((e) => e.etapa !== "salida").length;
	}
	enRiesgoCount() {
		return this.ticketsActivos.filter((e) => e.etapa !== "salida" && (e.esc || (e.slaMax - e.age) / e.slaMax < .25)).length;
	}
	pctCumplimientoSla() {
		let e = this.cerradosHoy, t = Math.min(e, this.cerradosEnSlaHoy);
		return e > 0 ? Math.round(t / e * 100) : 92;
	}
	npsPreliminarValor() {
		let e = this.csatRespuestas;
		if (e <= 0) return 46;
		let t = Math.round(e * .72), n = Math.round(e * .18), r = Math.max(0, e - t - n);
		return Math.round((t - r) / e * 100);
	}
	ticketSeleccionado() {
		let e = this.ticketSeleccionadoId;
		return e ? this.ticketsActivos.find((t) => t.id === e) ?? null : null;
	}
	estacionActual() {
		return g[this.estacionSeleccionadaKey] ?? g["etapa:bandeja"] ?? null;
	}
	ticketsFiltradosBandeja() {
		let e = this.areaFiltro, t = this.ticketsActivos.filter((t) => !e || t.area === e);
		return t.sort((e, t) => e.rayo === t.rayo ? e.slaMax - e.age - (t.slaMax - t.age) : e.rayo ? -1 : 1), t.slice(0, 10);
	}
	pctXpEquipo() {
		return Math.min(100, Math.round(this.xpEquipo / this.metaXpNivel * 100));
	}
	estadosResumen() {
		let e = this.ticketsActivos, t = e.filter((e) => e.etapa !== "salida"), n = [
			{
				id: "OPEN",
				n: "Abierto",
				v: t.filter((e) => e.stateRf004 === "OPEN").length,
				tono: "info",
				tonoBarra: "brand"
			},
			{
				id: "IN_PROGRESS",
				n: "En curso",
				v: t.filter((e) => e.stateRf004 === "IN_PROGRESS").length,
				tono: "info",
				tonoBarra: "brand"
			},
			{
				id: "PENDING_CUSTOMER",
				n: "Espera cliente",
				v: t.filter((e) => e.stateRf004 === "PENDING_CUSTOMER").length,
				tono: "warning",
				tonoBarra: "brand"
			},
			{
				id: "ESCALATED",
				n: "Escalado",
				v: this.escaladosCount,
				tono: "danger",
				tonoBarra: "danger"
			},
			{
				id: "REOPENED",
				n: "Reabierto",
				v: this.reabiertosHoy,
				tono: "warning",
				tonoBarra: "danger"
			},
			{
				id: "RESOLVED",
				n: "Resuelto",
				v: e.filter((e) => e.etapa === "salida").length,
				tono: "success",
				tonoBarra: "success"
			},
			{
				id: "CLOSED",
				n: "Cerrado hoy",
				v: this.cerradosHoy,
				tono: "success",
				tonoBarra: "success"
			}
		], r = Math.max(1, ...n.map((e) => e.v));
		return n.map((e) => ({
			...e,
			pct: Math.round(e.v / r * 100)
		}));
	}
	totalEstadosCount() {
		return this.estadosResumen().reduce((e, t) => e + t.v, 0);
	}
	snapshot() {
		let e = this.ticketsActivos, t = this.ticketSeleccionadoId;
		return {
			zonas: this.salas.map((t) => {
				let n = this.ocupacionEscritorios[t.k] ?? [], r = e.filter((e) => e.area === t.k && e.etapa !== "salida");
				return {
					k: t.k,
					cola: r.filter((e) => e.etapa === "cola" || e.etapa === "bandeja").length,
					atencion: r.filter((e) => e.etapa === "atencion").length,
					riesgo: r.some((e) => this.nivelSlaTicket(e) !== "ok"),
					gente: n.map((e) => ({
						id: e.id,
						nombre: e.nombre,
						ocupado: e.ticketId !== null
					}))
				};
			}),
			bandeja: e.filter((e) => e.etapa === "bandeja").length,
			escalados: this.escaladosCount,
			tickets: e.map((e) => ({
				id: e.id,
				numero: e.numero,
				gate: e.gate,
				zona: e.area,
				etapa: e.etapa,
				sla: this.nivelSlaTicket(e),
				rayo: e.rayo,
				sel: e.id === t,
				resp: e.resp
			}))
		};
	}
	inspeccionarCanal3D(e) {
		this.estacionSeleccionadaKey = `canal:${e}`, this.vistaCajon = "estacion", this.cajonLateralAbierto = !0, this.inyectarTicket({ gate: e });
	}
	inspeccionarSala3D(e) {
		this.estacionSeleccionadaKey = `sala:${e}`, this.vistaCajon = "estacion", this.cajonLateralAbierto = !0, this.areaFiltro = e;
		let t = this.ticketsActivos.find((t) => t.area === e && t.etapa !== "salida");
		t && (this.ticketSeleccionadoId = t.id);
	}
	inspeccionarEtapa3D(e) {
		this.estacionSeleccionadaKey = `etapa:${e}`, this.vistaCajon = "estacion", this.cajonLateralAbierto = !0, e === "bandeja" && (this.areaFiltro = "");
	}
	inyectarTicketEnSala(e, t) {
		let n = Object.entries(p).find(([, t]) => t.area === e);
		this.inyectarTicket({
			type: n?.[0] ?? "cons",
			rayo: t
		});
	}
	alternarPausa() {
		this.enEjecucion = !this.enEjecucion;
	}
	cambiarVelocidad(e) {
		let t = Number(e);
		(t === 1 || t === 2 || t === 4) && (this.velocidad = t);
	}
	cambiarVistaCajon(e) {
		(e === "todo" || e === "bandeja" || e === "estacion" || e === "correos") && (this.vistaCajon = e, this.cajonLateralAbierto = !0);
	}
	tonoSlaBadge(e) {
		let t = this.nivelSlaTicket(e);
		return t === "vencido" ? "danger" : t === "riesgo" ? "warning" : "success";
	}
	tonoSlaBarra(e) {
		let t = this.nivelSlaTicket(e);
		return t === "vencido" ? "danger" : t === "riesgo" ? "brand" : "success";
	}
	paresTicketVivo(e) {
		return [
			["Cliente / Lote", `${e.cli} · ${e.lote}`],
			["Canal de entrada", this.nombreCanal(e.gate)],
			["Sala / Área", this.nombreSala(e.area)],
			["Responsable", e.respNombre ?? "Bandeja Orquestadora"]
		];
	}
	hitosTicketVivo(e) {
		return e.hitos.map((t, n) => ({
			id: `${e.id}-h-${n}`,
			titulo: t,
			fecha: /* @__PURE__ */ new Date(),
			autor: e.respNombre ?? "Robot Orquestador",
			tono: n === 0 ? e.esc ? "danger" : e.rayo ? "accent" : "success" : "default"
		}));
	}
	paresEstacionVivo(e) {
		return [
			["Política operativa", e.rfRn],
			["Líder / Custodio", e.lider],
			["Acuerdo de servicio (SLA)", e.slaRegla],
			["Información gestionada", e.inputsReales]
		];
	}
	hitosCorreosEnviados() {
		return this.correosEnviados.map((e) => ({
			id: e.id,
			titulo: `Ticket ${e.ticketId} asignado a ${e.gestor} en ${e.sala} · ${e.slaTexto} (CC: ${e.liderCopia})`,
			fecha: /* @__PURE__ */ new Date(),
			autor: e.hora,
			tono: "accent"
		}));
	}
	inyectarTicket(e) {
		let t = e?.gate ? this.puertas.find((t) => t.k === e.gate) ?? this.puertas[0] : this.puertas[Math.floor(Math.random() * this.puertas.length)], n = Object.keys(p), r = e?.type ?? n[Math.floor(Math.random() * n.length)], i = p[r] ?? p.cons, a = m[Math.floor(Math.random() * m.length)], o = e?.rayo ?? Math.random() < .18, s = ++this.seqId, c = z();
		this.ticketsActivos = [...this.ticketsActivos, {
			id: `T-0${s}`,
			numero: `AIN-000${s}`,
			gate: t.k,
			type: r,
			area: i.area,
			cli: a[0],
			lote: a[1],
			prio: o ? "Urgente" : Math.random() < .35 ? "Alta" : "Normal",
			rayo: o,
			etapa: "bandeja",
			stateRf004: "OPEN",
			workNeed: Math.round(i.pt[0] + Math.random() * (i.pt[1] - i.pt[0])),
			workDone: 0,
			age: 0,
			slaMax: i.sla,
			esc: !1,
			resumen: a[2],
			hitos: [`${c} · Ingresó por ${t.nombre} y aterrizó en Bandeja Orquestadora`, ...o ? [`${c} · Marcado con Prioridad Rayo`] : []]
		}];
	}
	simularPicoMasivo() {
		for (let e = 0; e < 5; e++) this.inyectarTicket({
			rayo: e === 0,
			silencioso: e < 4
		});
	}
	forzarVencimientoSla() {
		let e = this.ticketsActivos.find((e) => !e.esc && e.etapa !== "salida");
		e ? (e.age = e.slaMax + 5, e.esc = !0, e.stateRf004 = "ESCALATED", e.hitos = [`${z()} · SLA vencido: Escalado en cadena a Comité (Mesa SGD)`, ...e.hitos].slice(0, 5), this.escaladosCount = Math.min(6, this.escaladosCount + 1), this.rachaSla = 0, this.ticketSeleccionadoId = e.id, this.ticketsActivos = [...this.ticketsActivos]) : this.inyectarTicket({ type: "recl" });
	}
	alternarRayoTicket(e) {
		let t = z();
		this.ticketsActivos = this.ticketsActivos.map((n) => {
			if (n.id !== e) return n;
			let r = !n.rayo;
			return {
				...n,
				rayo: r,
				prio: r ? "Urgente" : n.prio,
				hitos: [`${t} · ${r ? "Prioridad Rayo activada: sube al tope de cola" : "Prioridad Rayo retirada"}`, ...n.hitos].slice(0, 5)
			};
		});
	}
	resolverTicketInmediato(e) {
		let t = this.ticketsActivos.find((t) => t.id === e);
		t && (this.liberarEscritorioDeTicket(t), t.etapa = "salida", t.stateRf004 = "RESOLVED", t.hitos = [`${z()} · Resuelto y enviado a Cierre en Mi Portal (encuesta CSAT/NPS)`, ...t.hitos].slice(0, 5), this.registrarCierreConXp(t), this.ticketsActivos = [...this.ticketsActivos]);
	}
	reasignarMenorCarga(e) {
		let t = this.ticketsActivos.find((t) => t.id === e);
		if (!t) return;
		this.liberarEscritorioDeTicket(t);
		let n = this.salas.find((e) => e.k === t.area), r = this.ocupacionEscritorios[t.area];
		if (!n || !r) return;
		let i = r.findIndex((e) => e.ticketId === null);
		i < 0 && (i = 0);
		let a = r[i];
		a.ticketId = t.id, t.resp = a.id, t.respNombre = a.nombre, t.etapa = "atencion", t.stateRf004 = "IN_PROGRESS", t.hitos = [`${z()} · Reasignado por menor carga a ${a.nombre} (${n.nombre})`, ...t.hitos].slice(0, 5), this.registrarCorreoAsignacion(t, n, a.nombre), this.ticketsActivos = [...this.ticketsActivos];
	}
	liberarEscritorioDeTicket(e) {
		for (let t of this.ocupacionEscritorios[e.area] ?? []) t.ticketId === e.id && (t.ticketId = null);
	}
	registrarCierreConXp(e) {
		let t = !e.esc && e.age <= e.slaMax;
		this.cerradosHoy++, t ? (this.cerradosEnSlaHoy++, this.rachaSla++) : this.rachaSla = 0, this.csatRespuestas++;
		let n = this.xpEquipo + (t ? 10 : 3) + (e.rayo ? 5 : 0);
		n >= this.metaXpNivel && (n -= this.metaXpNivel, this.nivelEquipo++), this.xpEquipo = n;
	}
	registrarCorreoAsignacion(e, t, n) {
		let r = {
			id: `MAIL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
			hora: z(),
			ticketId: e.numero,
			gestor: `${n} (${t.nombre})`,
			liderCopia: h[t.k] ?? "Supervisor ATC",
			sala: t.nombre,
			slaTexto: e.rayo ? "Prioridad Rayo · Atención inmediata" : "SLA dentro de plazo"
		};
		this.correosEnviados = [r, ...this.correosEnviados].slice(0, 6);
	}
	ejecutarPasoSimulacion() {
		this.spawnTimer++, this.spawnTimer >= 12 && this.ticketsActivos.length < 26 && (this.spawnTimer = 0, this.inyectarTicket({ silencioso: !0 }));
		let e = z(), t = [];
		for (let n of this.ticketsActivos) if (n.age++, n.etapa === "salida") {
			if (n.workDone += 2, n.workDone >= n.workNeed + 18) {
				this.ticketSeleccionadoId === n.id && (this.ticketSeleccionadoId = null);
				continue;
			}
			t.push(n);
		} else {
			if (!n.esc && n.age >= n.slaMax && (n.esc = !0, n.stateRf004 = "ESCALATED", this.escaladosCount = Math.min(6, this.escaladosCount + 1), this.rachaSla = 0, n.hitos = [`${e} · SLA vencido: Escalado automático a Comité (Mesa SGD)`, ...n.hitos].slice(0, 5)), n.etapa === "bandeja" && n.age >= 5) n.etapa = "cola", n.hitos = [`${e} · Robot Orquestador despachó el ticket hacia la cola de ${this.nombreSala(n.area)}`, ...n.hitos].slice(0, 5);
			else if (n.etapa === "atencion" && (n.workDone += n.rayo ? 1.5 : 1.05, n.workDone >= n.workNeed)) {
				let t = (this.ocupacionEscritorios[n.area] ?? []).find((e) => e.ticketId === n.id);
				t && (t.ticketId = null, t.atendidos++), n.etapa = "salida", n.stateRf004 = "RESOLVED", n.hitos = [`${e} · Resuelto por ${n.respNombre ?? "Gestor"} · pasa a Cierre en Mi Portal`, ...n.hitos].slice(0, 5), this.registrarCierreConXp(n);
			}
			t.push(n);
		}
		let n = t.filter((e) => e.etapa === "cola" || e.etapa === "bandeja" && e.age >= 3);
		n.sort((e, t) => e.rayo === t.rayo ? e.slaMax - e.age - (t.slaMax - t.age) : e.rayo ? -1 : 1);
		for (let t of n) {
			let n = this.salas.find((e) => e.k === t.area), r = this.ocupacionEscritorios[t.area];
			if (!n || !r) continue;
			let i = -1, a = Infinity;
			if (r.forEach((e, t) => {
				e.ticketId === null && e.atendidos < a && (a = e.atendidos, i = t);
			}), i >= 0) {
				let a = r[i];
				a.ticketId = t.id, t.resp = a.id, t.respNombre = a.nombre, t.etapa = "atencion", t.stateRf004 = Math.random() < .18 ? "PENDING_CUSTOMER" : "IN_PROGRESS", t.hitos = [`${e} · Ingresó a puesto de ${a.nombre} (${n.nombre})`, ...t.hitos].slice(0, 5), this.registrarCorreoAsignacion(t, n, a.nombre);
			}
		}
		this.ticketsActivos = t;
	}
	pctSlaRestante(e) {
		return Math.max(0, Math.round((e.slaMax - e.age) / e.slaMax * 100));
	}
	nivelSlaTicket(e) {
		return e.esc || e.age >= e.slaMax ? "vencido" : this.pctSlaRestante(e) < 25 ? "riesgo" : "ok";
	}
	etiquetaSlaTicket(e) {
		let t = this.nivelSlaTicket(e);
		return t === "vencido" ? "SLA vencido" : t === "riesgo" ? `En riesgo (${this.pctSlaRestante(e)}%)` : `En plazo (${this.pctSlaRestante(e)}%)`;
	}
	etiquetaEtapa(e) {
		switch (e) {
			case "bandeja": return "Bandeja Orquestadora";
			case "cola": return "En cola de sala";
			case "atencion": return "En escritorio";
			case "salida": return "Cierre Mi Portal";
		}
	}
	nombreSala(e) {
		return e === "bandeja" ? "Bandeja Orquestadora" : e === "comite" ? "Comité (Mesa SGD)" : this.salas.find((t) => t.k === e)?.nombre ?? e;
	}
	nombreCanal(e) {
		return this.puertas.find((t) => t.k === e)?.nombre ?? e;
	}
	nombreTipoSim(e) {
		return p[e]?.nombre ?? e;
	}
}, le = {
	GESTOR: "Gestor de tickets",
	COLABORADOR: "Colaborador de área",
	SUPERVISOR: "Supervisor ATC",
	COORDINADOR_CX: "Coordinador CX",
	LEGAL_RECLAMOS: "Responsable legal de reclamos",
	MESA_SGD: "Gestora de la Mesa SGD",
	MODERADOR_EVENTO: "Moderador de evento",
	ADMIN_FUNCIONAL: "Administrador funcional",
	CONTROL_ACCESO: "Control de acceso (garita)",
	CLIENTE: "Cliente convocado (Mi Portal)",
	SIN_ATENCION: "Rol sin atención"
}, ue = [
	{
		value: "1",
		label: "1× Normal"
	},
	{
		value: "2",
		label: "2× Rápido"
	},
	{
		value: "4",
		label: "4× Turbo"
	}
], de = [
	{
		value: "todo",
		label: "Todas"
	},
	{
		value: "bandeja",
		label: "Bandeja"
	},
	{
		value: "estacion",
		label: "Estación"
	},
	{
		value: "correos",
		label: "Correos CC"
	}
], { Button: B, Badge: V, PageHeader: fe, Card: H, CardBody: U, CardHeader: W, CardPairs: G, Select: pe, Drawer: me, SegmentedControl: K, Breadcrumb: he, ProgressBar: q } = E, J = (e, t, n = {}) => b(H, n, e ? b(W, e) : null, b(U, null, t)), Y = (...e) => b(H, { variant: "default" }, b(U, { padding: "sm" }, ...e));
function X() {
	re();
	let [e] = x(() => new ce()), [, t] = x(0), n = () => t((e) => e + 1), r = (e) => () => {
		e(), n();
	}, i = C(null), a = C(null), { datos: o, sim: s } = ie(), c = w(), u = s?.vivoSimulacion !== !1;
	S(() => {
		e.enEjecucion = u, n();
	}, [u]), S(() => {
		let t = setInterval(() => {
			e.enEjecucion && (e.tick(), n());
		}, 220);
		return () => clearInterval(t);
	}, []), S(() => {
		let t = a.current, r = i.current;
		if (!t || !r) return;
		let o = {
			teal: l("primary-500", [
				43,
				138,
				156
			]),
			teal2: l("primary-400", [
				56,
				189,
				248
			]),
			orange: l("secondary-400", [
				246,
				164,
				44
			]),
			ok: l("success-500", [
				46,
				139,
				87
			]),
			warn: l("warning-500", [
				227,
				155,
				28
			]),
			bad: l("danger-500", [
				192,
				69,
				58
			]),
			line: [
				45,
				64,
				72
			],
			muted: [
				157,
				180,
				186
			],
			texto: [
				232,
				240,
				242
			],
			superficie: [
				27,
				42,
				49
			],
			suelo: [
				20,
				32,
				38
			],
			lienzo: [
				15,
				26,
				31
			]
		}, s = {
			zonas: e.salas.map((e) => ({
				k: e.k,
				n: e.nombre,
				color: te[e.k] ?? o.teal2
			})),
			compuertas: e.puertas.map((e) => ({
				k: e.k,
				n: e.nombre,
				sigla: e.ic,
				color: ne[e.k] ?? o.teal2
			}))
		}, c = typeof matchMedia < "u" && matchMedia("(prefers-reduced-motion: reduce)").matches;
		return ee({
			canvas: t,
			host: r,
			cols: o,
			reducido: c,
			est: s,
			hits: e.hits,
			obtener: () => e.snapshot(),
			alClickTicket: (t) => {
				e.ticketSeleccionadoId = t, n();
			},
			alClickCanal: (t) => {
				e.inspeccionarCanal3D(t), n();
			},
			alClickSala: (t) => {
				e.inspeccionarSala3D(t), n();
			},
			alClickEtapa: (t) => {
				e.inspeccionarEtapa3D(t), n();
			}
		});
	}, []);
	let d = (e) => {
		location.hash = T(e);
	}, f = (e) => {
		let t = o?.tickets?.find((t) => t.numero === e.numero);
		d(t ? `ticket/${t.id}` : "bandeja");
	}, p = e.ticketsFiltradosBandeja(), m = e.ticketSeleccionado(), h = e.estacionActual(), g = e.vistaCajon, _ = e.pctCumplimientoSla(), v = e.npsPreliminarValor(), y = e.estadosResumen(), E = [{
		value: "",
		label: "Todas las salas (6 áreas)"
	}, ...e.salas.map((e) => ({
		value: e.k,
		label: e.nombre
	}))], D = b(fe, {
		title: "Operación en Vivo",
		description: "Planta de atención en tiempo real, colas y niveles de servicio",
		size: "md",
		breadcrumb: b(he, {
			label: "Ruta del módulo",
			items: [
				{ label: "Aybar Atiende" },
				{ label: "Núcleo 360 y Planta" },
				{ label: "Operación en Vivo" }
			]
		}),
		meta: b("span", { className: "ay-row ay-row--2 ay-row--wrap" }, b(V, {
			tone: "success",
			dot: !0
		}, "En línea · 8 sistemas"), c ? b(V, { tone: "info" }, `${c.nombre} (${le[c.rol] ?? c.rol})`) : null)
	}), O = I({
		gap: "2",
		wrap: !0,
		children: [
			b(B, {
				key: "p",
				size: "sm",
				variant: "primary",
				onClick: r(() => e.alternarPausa())
			}, e.enEjecucion ? "Pausar planta" : "Reanudar planta"),
			b(K, {
				key: "v",
				label: "Velocidad de planta",
				size: "sm",
				options: ue,
				value: String(e.velocidad),
				onValueChange: (t) => {
					e.cambiarVelocidad(t), n();
				}
			}),
			b(B, {
				key: "t",
				size: "sm",
				variant: "secondary",
				onClick: r(() => e.inyectarTicket({ rayo: !1 }))
			}, "+ Ticket entrante"),
			b(B, {
				key: "r",
				size: "sm",
				variant: "secondary",
				onClick: r(() => e.inyectarTicket({ rayo: !0 }))
			}, "Ticket con Prioridad Rayo"),
			b(B, {
				key: "e",
				size: "sm",
				variant: "danger",
				onClick: r(() => e.forzarVencimientoSla())
			}, "Escalar a Comité SGD"),
			b(B, {
				key: "m",
				size: "sm",
				variant: "ghost",
				onClick: r(() => e.simularPicoMasivo())
			}, "Pico +5 multicanal")
		]
	}), A = e.enRiesgoCount(), j = R({
		columnas: 5,
		children: [
			b("div", { key: "a" }, Y(L({
				gap: "2",
				align: "start",
				children: [b(k, {
					key: "s",
					label: "Tickets activos",
					value: e.activosEnCursoCount(),
					size: "sm"
				}), b(V, {
					key: "b",
					size: "sm",
					tone: A > 0 ? "warning" : "success"
				}, A > 0 ? `${A} en riesgo` : "Sin riesgos")]
			}))),
			b("div", { key: "b" }, Y(I({
				gap: "3",
				children: [b(ae, {
					key: "c",
					label: "Resueltos en SLA",
					value: _,
					size: "md",
					tone: _ >= 90 ? "success" : "warning"
				}), L({
					gap: "1",
					children: [b(k, {
						key: "s",
						label: "Resueltos en SLA",
						value: _,
						unit: "%",
						size: "sm"
					}), b("span", {
						key: "t",
						className: "ay-text--subtitle ay-text--sm"
					}, `${e.cerradosEnSlaHoy} de ${e.cerradosHoy} (Meta 90%)`)]
				})]
			}))),
			b("div", { key: "c" }, Y(L({
				gap: "2",
				children: [b(k, {
					key: "s",
					label: "CSAT del día",
					value: e.csatPromedio.toFixed(1),
					unit: "/ 5",
					size: "sm"
				}), b(oe, {
					key: "r",
					label: "Satisfacción CSAT",
					value: e.csatPromedio,
					allowHalf: !0,
					count: e.csatRespuestas,
					size: "sm"
				})]
			}))),
			b("div", { key: "d" }, Y(L({
				gap: "2",
				children: [I({
					gap: "2",
					justify: "between",
					children: [b(k, {
						key: "s",
						label: `Nivel ${e.nivelEquipo} del equipo`,
						value: e.xpEquipo,
						unit: `/ ${e.metaXpNivel} XP`,
						size: "sm"
					}), b(V, {
						key: "b",
						size: "sm",
						tone: "info"
					}, `Racha ${e.rachaSla}`)]
				}), b(q, {
					key: "p",
					label: "Experiencia del equipo",
					hideLabel: !0,
					value: e.pctXpEquipo(),
					detail: `Faltan ${e.metaXpNivel - e.xpEquipo} XP`,
					size: "sm",
					tone: "brand"
				})]
			}))),
			b("div", { key: "e" }, Y(L({
				gap: "2",
				align: "start",
				children: [b(k, {
					key: "s",
					label: "NPS del turno",
					value: `${v > 0 ? "+" : ""}${v}`,
					size: "sm"
				}), b(V, {
					key: "b",
					size: "sm",
					tone: v >= 30 ? "success" : "warning"
				}, `Encuestas n=${e.csatRespuestas}`)]
			})))
		]
	}), M = b(H, { variant: "default" }, b(W, {
		title: "Tickets por estado",
		as: "h4",
		subtitle: "Distribución en tiempo real: Abierto, En curso, Espera cliente, Escalado, Reabierto, Resuelto y Cerrado",
		actions: b(V, {
			size: "sm",
			tone: "neutral"
		}, `${e.totalEstadosCount()} en total`)
	}), b(U, { padding: "sm" }, R({
		columnas: 7,
		children: y.map((e) => b("div", { key: e.id }, Y(L({
			gap: "1",
			children: [I({
				gap: "2",
				justify: "between",
				children: [b("span", {
					key: "n",
					className: "ay-text--label"
				}, e.n), b(V, {
					key: "v",
					size: "sm",
					tone: e.tono
				}, String(e.v))]
			}), b(q, {
				key: "p",
				label: e.n,
				hideLabel: !0,
				value: e.pct,
				tone: e.tonoBarra,
				size: "sm"
			})]
		}))))
	}))), F = J({
		title: "Operación en Vivo 3D · Robot Orquestador · 5 Canales de Entrada · 6 Salas de Atención",
		subtitle: "Monitoreo en tiempo real del flujo de tickets, despacho automático por menor carga y SLA",
		as: "h3",
		actions: I({
			gap: "2",
			wrap: !0,
			children: [b(pe, {
				key: "s",
				size: "sm",
				"aria-label": "Sala",
				value: e.areaFiltro,
				options: E,
				onChange: (t) => {
					e.areaFiltro = t.target.value, n();
				}
			}), b(B, {
				key: "b",
				size: "sm",
				variant: e.cajonLateralAbierto ? "primary" : "secondary",
				"aria-expanded": e.cajonLateralAbierto,
				onClick: r(() => {
					e.cajonLateralAbierto = !e.cajonLateralAbierto;
				})
			}, e.cajonLateralAbierto ? "Cerrar cajón de bandejas" : `Bandejas operativas (${p.length})`)]
		})
	}, L({
		gap: "3",
		children: [
			b("div", { key: "c" }, O),
			b("div", { key: "k" }, j),
			b("div", { key: "e" }, M)
		]
	})), z = m ? b("div", {
		className: "pl-atc-ficha-flotante pl-atc-ficha-flotante--izq",
		role: "dialog",
		"aria-modal": "false",
		"aria-label": "Ficha del ticket en escena 3D"
	}, b(H, null, b(W, {
		title: m.numero,
		subtitle: m.resumen,
		as: "h3",
		actions: I({
			gap: "2",
			wrap: !0,
			children: [
				b(V, {
					key: "p",
					size: "sm",
					tone: m.rayo ? "warning" : "info"
				}, m.rayo ? "Prioridad Rayo" : m.prio),
				b(V, {
					key: "s",
					size: "sm",
					tone: e.tonoSlaBadge(m)
				}, e.etiquetaSlaTicket(m)),
				b(B, {
					key: "x",
					size: "sm",
					variant: "ghost",
					"aria-label": "Cerrar ficha",
					onClick: r(() => {
						e.ticketSeleccionadoId = null;
					})
				}, "Cerrar")
			]
		})
	}), b(U, null, L({
		gap: "3",
		children: [
			b(q, {
				key: "b",
				label: "SLA restante en turno",
				value: e.pctSlaRestante(m),
				detail: `${e.pctSlaRestante(m)}% restante`,
				tone: e.tonoSlaBarra(m),
				size: "sm"
			}),
			b(G, {
				key: "p",
				pairs: e.paresTicketVivo(m)
			}),
			L({
				gap: "1",
				children: [b("span", {
					key: "t",
					className: "ay-text--label"
				}, "Recorrido en tiempo real"), b(N, {
					key: "l",
					label: "Recorrido del ticket en planta",
					hitos: e.hitosTicketVivo(m)
				})]
			}),
			b(se, { key: "d" }),
			I({
				gap: "2",
				wrap: !0,
				children: [
					b(B, {
						key: "r",
						size: "sm",
						variant: "secondary",
						onClick: r(() => e.alternarRayoTicket(m.id))
					}, m.rayo ? "Quitar Rayo" : "Prioridad Rayo"),
					b(B, {
						key: "v",
						size: "sm",
						variant: "primary",
						onClick: r(() => e.resolverTicketInmediato(m.id))
					}, "Resolver a Mi Portal"),
					b(B, {
						key: "g",
						size: "sm",
						variant: "ghost",
						onClick: r(() => e.reasignarMenorCarga(m.id))
					}, "Reasignar gestor"),
					b(B, {
						key: "e",
						size: "sm",
						variant: "ghost",
						onClick: () => f(m)
					}, "Ver expediente")
				]
			})
		]
	})))) : null, X = I({
		gap: "2",
		wrap: !0,
		children: [
			b(P, {
				key: 1,
				variant: "outline",
				dotColor: "var(--aybar-color-feedback-success-border)"
			}, "LED verde: En plazo SLA"),
			b(P, {
				key: 2,
				variant: "outline",
				dotColor: "var(--aybar-color-feedback-warning-border)"
			}, "LED ámbar pulsante: SLA en riesgo (<25%)"),
			b(P, {
				key: 3,
				variant: "outline",
				dotColor: "var(--aybar-color-feedback-danger-border)"
			}, "LED rojo / Comité SGD: SLA vencido"),
			b(P, {
				key: 4,
				variant: "outline",
				dotColor: "var(--aybar-color-secondary-400)"
			}, "Relámpago 3D giratorio: Prioridad Rayo"),
			b(P, {
				key: 5,
				variant: "outline",
				dotColor: "var(--aybar-color-primary-500)"
			}, "Robot Orquestador: Despacho automático por carga")
		]
	}), ge = J({
		title: "Planta de Atención en Vivo · Robot Orquestador · 6 Salas · Comité SGD · Cierre en Mi Portal",
		subtitle: "Haz clic en cualquier tarjeta 3D, canal o sala para inspeccionar su detalle en tiempo real o abre el cajón de bandejas.",
		as: "h3",
		actions: I({
			gap: "2",
			wrap: !0,
			children: [
				b(V, {
					key: "r",
					size: "sm",
					tone: "success"
				}, `${e.cerradosHoy} resueltos hoy`),
				b(V, {
					key: "y",
					size: "sm",
					tone: "warning"
				}, `${e.conRayoCount()} con Rayo`),
				b(V, {
					key: "c",
					size: "sm",
					tone: e.escaladosCount > 0 ? "danger" : "neutral"
				}, `${e.escaladosCount} en Comité SGD`)
			]
		})
	}, L({
		gap: "3",
		children: [b("div", {
			key: "e",
			ref: i,
			className: "atc-vivo-stage-area"
		}, b("canvas", {
			ref: a,
			style: {
				display: "block",
				width: "100%",
				cursor: "pointer"
			}
		}), z), b("div", { key: "l" }, X)]
	})), Z = g === "todo" || g === "bandeja" ? J({
		title: `Bandeja Orquestadora y Salas (${p.length})`,
		subtitle: "Orden: Rayo · SLA · Menor carga (clic para abrir ficha en escena)",
		as: "h3",
		actions: I({
			gap: "2",
			wrap: !0,
			children: [b(V, {
				key: "f",
				size: "sm",
				tone: "info"
			}, e.areaFiltro ? e.nombreSala(e.areaFiltro) : "Todas las salas"), b(B, {
				key: "i",
				size: "sm",
				variant: "ghost",
				onClick: () => d("bandeja")
			}, "Ir a Bandeja")]
		})
	}, L({
		gap: "2",
		children: p.map((t) => b(H, {
			key: t.id,
			variant: "selectable",
			selected: e.ticketSeleccionadoId === t.id,
			onClick: r(() => {
				e.ticketSeleccionadoId = t.id;
			})
		}, b(U, { padding: "sm" }, L({
			gap: "1",
			children: [I({
				gap: "2",
				wrap: !0,
				justify: "between",
				children: [I({
					gap: "2",
					wrap: !0,
					children: [
						b("strong", {
							key: "n",
							className: "ay-text--mono ay-text--sm"
						}, t.numero),
						t.rayo ? b(V, {
							key: "r",
							size: "sm",
							tone: "warning"
						}, "RAYO") : null,
						b("span", {
							key: "c",
							className: "ay-text--subtitle ay-text--sm"
						}, t.cli)
					]
				}), b(V, {
					key: "s",
					size: "sm",
					tone: t.esc ? "danger" : e.pctSlaRestante(t) < 25 ? "warning" : "success"
				}, t.esc ? "Comité SGD" : `${e.pctSlaRestante(t)}% SLA`)]
			}), I({
				gap: "2",
				wrap: !0,
				justify: "between",
				children: [b("span", {
					key: "d",
					className: "ay-text--subtitle ay-text--sm"
				}, `${e.nombreTipoSim(t.type)} · ${e.nombreSala(t.area)} (${e.etiquetaEtapa(t.etapa)})`), b(B, {
					key: "r",
					size: "sm",
					variant: "ghost",
					onClick: (r) => {
						r.stopPropagation(), e.alternarRayoTicket(t.id), n();
					}
				}, t.rayo ? "Quitar Rayo" : "Rayo")]
			})]
		}))))
	})) : null, Q = (g === "todo" || g === "estacion") && h ? J({
		title: h.nombre,
		subtitle: `${h.categoria} · ${h.hu}`,
		as: "h3",
		actions: b(V, {
			size: "sm",
			tone: "info"
		}, h.entidad)
	}, L({
		gap: "3",
		children: [b(G, {
			key: "p",
			pairs: e.paresEstacionVivo(h)
		}), I({
			gap: "2",
			wrap: !0,
			children: [
				h.gateKey ? b(B, {
					key: "g1",
					size: "sm",
					variant: "primary",
					onClick: r(() => e.inyectarTicket({
						gate: h.gateKey,
						rayo: !1
					}))
				}, `+ Ingresar por ${e.nombreCanal(h.gateKey)}`) : null,
				h.gateKey ? b(B, {
					key: "g2",
					size: "sm",
					variant: "secondary",
					onClick: r(() => e.inyectarTicket({
						gate: h.gateKey,
						rayo: !0
					}))
				}, "Ingresar con Rayo") : null,
				h.areaKey ? b(B, {
					key: "a1",
					size: "sm",
					variant: "primary",
					onClick: r(() => e.inyectarTicketEnSala(h.areaKey, !1))
				}, `+ Ticket hacia ${e.nombreSala(h.areaKey)}`) : null,
				h.areaKey ? b(B, {
					key: "a2",
					size: "sm",
					variant: "secondary",
					onClick: r(() => e.inyectarTicketEnSala(h.areaKey, !0))
				}, "Con Rayo a esta sala") : null,
				h.areaKey && e.areaFiltro === h.areaKey ? b(B, {
					key: "a3",
					size: "sm",
					variant: "ghost",
					onClick: r(() => {
						e.areaFiltro = "";
					})
				}, "Ver todas las salas") : null,
				h.clave === "etapa:comite" ? b(B, {
					key: "c",
					size: "sm",
					variant: "danger",
					onClick: r(() => e.forzarVencimientoSla())
				}, "Escalar caso a Comité SGD") : null
			]
		})]
	})) : null, $ = g === "todo" || g === "correos" ? J({
		title: "Correos de asignación (CC Líder de Área)",
		subtitle: "Notificación automática en cada despacho",
		as: "h3",
		actions: b(V, {
			size: "sm",
			tone: "info"
		}, `${e.correosEnviados.length} recientes`)
	}, b(N, {
		label: "Correos de asignación enviados",
		hitos: e.hitosCorreosEnviados()
	})) : null, _e = b(me, {
		open: e.cajonLateralAbierto,
		onOpenChange: (t) => {
			e.cajonLateralAbierto = t, n();
		},
		modal: !1,
		side: "end",
		size: "lg",
		title: "Bandejas, Estación 3D y Correos CC"
	}, L({
		gap: "3",
		children: [
			b(K, {
				key: "s",
				label: "Vista del cajón",
				size: "sm",
				options: de,
				value: g,
				onValueChange: (t) => {
					e.cambiarVistaCajon(t), n();
				}
			}),
			Z ? b("div", { key: "b" }, Z) : null,
			Q ? b("div", { key: "e" }, Q) : null,
			$ ? b("div", { key: "c" }, $) : null
		]
	}));
	return b("div", { className: "pt-pagina pt-pagina--ancha vv-pagina" }, D, L({
		gap: "4",
		"aria-label": "Panel unificado de Operación en Vivo",
		children: [
			b("div", { key: "1" }, F),
			b("div", { key: "2" }, ge),
			b("div", { key: "3" }, _e)
		]
	}));
}
//#endregion
export { X as VivoDaniel };
