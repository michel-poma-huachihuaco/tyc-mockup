import * as e from "./comun-CVU2GQ4h.js";
import { h as t, m as n, n as r, u as i, x as a } from "./prototipo-B6qmgYQk.js";
import { t as o } from "./FormField-BR5f57fp.js";
import { t as s } from "./Input-BYH1MAKY.js";
import { n as c, t as l } from "./CardBody-WQ8Pzs3R.js";
import { t as u } from "./DataGrid-DgP6eHZJ.js";
import { t as d } from "./Breadcrumb-BtXUT3bJ.js";
import { leerTokenRgb as f, montarVivoDaniel as ee } from "./escenas-three.js";
import { t as p } from "./ProgressBar-CxT9FNs6.js";
//#region src/vivo/datos.ts
var m = [
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
], h = [
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
], g = {
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
}, _ = {
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
		lider: g.eje1,
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
		lider: g.cob,
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
		lider: g.libro,
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
		lider: g.legal,
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
		lider: g.post,
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
		lider: g.proy,
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
}, v = "\n.atc-vivo-stage-area{position:relative;overflow:hidden;min-block-size:calc(var(--aybar-space-4) * 38)}\n.pl-atc-ficha-flotante{position:absolute;inset-block-end:var(--aybar-space-4);inset-inline-end:var(--aybar-space-4);z-index:6;\n  inline-size:min(calc(var(--aybar-space-4) * 24),calc(100% - var(--aybar-space-8)));max-block-size:calc(100% - var(--aybar-space-8));overflow-y:auto}\n.pl-atc-ficha-flotante--izq{inset-inline-start:var(--aybar-space-4);inset-inline-end:auto;inline-size:auto;max-inline-size:calc(100% - var(--aybar-space-8))}\n.ay-grid.vv-grid{grid-template-columns:repeat(var(--vv-cols),minmax(0,1fr))}\n@media (max-width:1000px){.ay-grid.vv-grid{grid-template-columns:repeat(auto-fill,minmax(calc(var(--aybar-space-4) * 11),1fr))}}\n.vv-pagina .ay-pageheader__title .ay-row{display:inline-flex;vertical-align:middle;margin-inline-start:var(--aybar-space-3)}\n.vv-pagina .ay-text--sm{font-size:var(--aybar-font-size-xs)}\n.vv-planta{display:grid;grid-template-columns:minmax(0,1fr) calc(var(--aybar-space-4) * 16);gap:var(--aybar-space-3);align-items:start}\n.vv-planta--sola{grid-template-columns:minmax(0,1fr)}\n.vv-planta .atc-vivo-stage-area{min-block-size:calc(var(--aybar-space-4) * 30)}\n.vv-registro{max-block-size:calc(var(--aybar-space-4) * 34);overflow-y:auto}\n@media (max-width:1000px){.vv-planta{grid-template-columns:minmax(0,1fr)}.vv-registro{max-block-size:calc(var(--aybar-space-4) * 24)}}\n.vv-ficha{margin-block-end:var(--aybar-space-3)}\n.vv-areas{display:grid;grid-template-columns:repeat(auto-fill,minmax(calc(var(--aybar-space-4) * 17),1fr));gap:var(--aybar-space-3)}\n.vv-lista-tk{list-style:none;margin:0;padding:0;display:grid;gap:var(--aybar-space-2)}\n.vv-fila{display:flex;flex-wrap:wrap;align-items:center;gap:var(--aybar-space-2)}\n.vv-nota{margin:0}\n", y = !1;
function re() {
	if (y || typeof document > "u") return;
	y = !0;
	let e = document.createElement("style");
	e.id = "vv-estilos", e.textContent = v, document.head.append(e);
}
//#endregion
//#region src/vivo/kit.ts
var b = e.Ii(), x = b.createElement, { useState: ie, useEffect: ae, useRef: oe } = b, se = e.k, ce = e.A, le = e.Jn, ue = {
	Button: e.Ai,
	Badge: e.$r,
	PageHeader: e.Nr,
	Card: c,
	CardBody: l,
	CardHeader: t,
	CardPairs: n,
	Select: a,
	Drawer: i,
	SegmentedControl: r,
	Breadcrumb: d,
	ProgressBar: p,
	DataGrid: u,
	FormField: o,
	Input: s,
	ErrorAccion: e.t
}, S = (...e) => e.filter(Boolean).join(" "), C = "es-PE";
function w(e) {
	let t = typeof e.value == "number" ? new Intl.NumberFormat(C).format(e.value) : e.value;
	return x("dl", { className: S("ay-stat", `ay-stat--${e.size ?? "md"}`) }, x("dt", { className: "ay-stat__label" }, e.label), x("dd", { className: "ay-stat__value" }, t, e.unit ? x("span", { className: "ay-stat__unit" }, ` ${e.unit}`) : null));
}
function de(e) {
	let t = Math.max(0, Math.min(100, Math.round(e.value))), n = e.size ?? "md";
	return x("div", {
		className: S("ay-circ", `ay-circ--${n}`, `ay-circ--${e.tone ?? "brand"}`),
		role: "progressbar",
		"aria-label": e.label,
		"aria-valuenow": t,
		"aria-valuemin": 0,
		"aria-valuemax": 100
	}, x("svg", {
		viewBox: "0 0 36 36",
		"aria-hidden": "true"
	}, x("circle", {
		className: "ay-circ__track",
		cx: 18,
		cy: 18,
		r: 15.5
	}), t === 0 ? null : x("circle", {
		className: "ay-circ__fill",
		cx: 18,
		cy: 18,
		r: 15.5,
		style: { "--ay-dash": t }
	})), n === "sm" ? null : x("span", { className: "ay-circ__value" }, `${t}%`));
}
var T = "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z";
function fe(e) {
	let t = e.value, n = e.allowHalf ? Math.round(t * 2) / 2 : Math.round(t), r = t > 0 ? `${new Intl.NumberFormat(C, { maximumFractionDigits: 2 }).format(t)} de 5` : "Sin valoraciones", i = e.count == null ? null : `${new Intl.NumberFormat(C).format(e.count)} ${e.count === 1 ? "valoración" : "valoraciones"}`;
	return x("p", {
		className: S("ay-rating", `ay-rating--${e.size ?? "md"}`),
		"aria-label": `${e.label}: ${i ? `${r}, ${i}` : r}`
	}, x("span", {
		className: "ay-rating__icons",
		"aria-hidden": "true"
	}, ...Array.from({ length: 5 }, (e, t) => x("svg", {
		key: t,
		viewBox: "0 0 24 24",
		width: 18,
		height: 18,
		"aria-hidden": "true",
		focusable: "false",
		className: `ay-rating__glyph ay-rating__glyph--${n >= t + 1 ? "full" : n >= t + .5 ? "half" : "empty"}`
	}, x("path", {
		className: "ay-rating__glyph-empty",
		d: T
	}), x("path", {
		className: "ay-rating__glyph-full",
		d: T
	})))), x("span", { className: "ay-rating__value" }, r), i ? x("span", { className: "ay-rating__count" }, i) : null);
}
var E = (e, t) => {
	let n = (e.getTime() - (t ?? /* @__PURE__ */ new Date()).getTime()) / 6e4, r = new Intl.RelativeTimeFormat(C, { numeric: "auto" });
	return Math.abs(n) < 1 ? r.format(0, "second") : Math.abs(n) < 60 ? r.format(Math.round(n), "minute") : r.format(Math.round(n / 60), "hour");
}, D = (e) => e.toLocaleTimeString(C, {
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23"
});
function pe(e) {
	let t = e.hitos.map((t) => E(t.fecha, e.ahora));
	return x("ol", {
		className: "ay-timeline ay-timeline--vertical",
		"aria-label": e.label
	}, ...e.hitos.map((n, r) => {
		let i = e.conHora || t[r] === t[r - 1] || t[r] === t[r + 1];
		return x("li", {
			key: n.id,
			className: "ay-timeline__event"
		}, x("span", {
			className: S("ay-timeline__dot", `ay-timeline__dot--${n.tono ?? "default"}`),
			"aria-hidden": "true"
		}), x("div", { className: "ay-timeline__body" }, x("p", { className: "ay-timeline__title" }, x("strong", null, n.autor || "Sistema"), " ", n.titulo), x("time", {
			className: "ay-timeline__time",
			dateTime: n.fecha.toISOString()
		}, i ? `${t[r]} · ${D(n.fecha)}` : t[r])));
	}));
}
var O = (e) => x("span", { className: S("ay-tag", `ay-tag--${e.variant ?? "neutral"}`, "ay-tag--md") }, e.dotColor ? x("span", {
	className: "ay-tag__dot",
	"aria-hidden": "true",
	style: { background: e.dotColor }
}) : null, e.children), k = (e) => Array.isArray(e) ? e : [e], A = (e) => x("div", { className: S("ay-row", `ay-row--${e.gap ?? "2"}`, e.wrap && "ay-row--wrap", e.justify && `ay-row--${e.justify}`, e.className) }, ...k(e.children)), j = (e) => x("div", {
	className: S("ay-stack", `ay-stack--${e.gap ?? "4"}`, e.align && `ay-stack--align-${e.align}`, e.className),
	"aria-label": e["aria-label"]
}, ...k(e.children)), me = (e) => x("div", {
	className: "ay-grid ay-grid--gap-sm vv-grid",
	style: { "--vv-cols": e.columnas }
}, ...k(e.children)), he = () => x("hr", { className: "ay-divider ay-divider--horizontal ay-divider--sm" }), M = e, N = M.E, P = M.O, F = M.__vivo, I = M.nn, L = M.wn, ge = M.Gt, _e = M.or, ve = M.hr, ye = M.Ar, R = M.Or, be = M.br, xe = M.Un, Se = M.Kn, Ce = M.mn, we = M.yn, Te = M.dn, Ee = M.pn, De = M.nr, Oe = M.fn, ke = M.m, Ae = M.Sn, je = M.sn, Me = (e) => !!e && je.atender(e.rol), Ne = (e) => !!e && (e.rol === "SUPERVISOR" || e.rol === "COORDINADOR_CX"), Pe = (e) => be.filter(e).map((e) => e.id), z = [
	{
		k: "eje1",
		gente: Pe((e) => e.area === "ATC" && e.rol !== "COORDINADOR_CX")
	},
	{
		k: "cob",
		gente: Pe((e) => e.area === "COBRANZA")
	},
	{
		k: "libro",
		gente: ["p-pvilchez"]
	},
	{
		k: "legal",
		gente: ["p-vortiz", "p-rcastillo"]
	},
	{
		k: "post",
		gente: Pe((e) => e.area === "POSTVENTA")
	},
	{
		k: "proy",
		gente: ["p-nquispe", "p-jmarin"]
	}
];
function B(e, t) {
	return t.eje === 3 || t.area === "LEGAL" ? "legal" : t.tipo === "GAR" || t.area === "POSTVENTA" ? "post" : t.tipo === "ING" || t.tipo === "RSV" || t.area === "ADMINISTRACION" ? "proy" : (t.tipo === "QUE" || t.tipo === "REC") && ge(e, t.id) ? "libro" : t.area === "COBRANZA" ? "cob" : "eje1";
}
function V(e) {
	return e.estado === "RESOLVED" || e.estado === "CLOSED" ? "salida" : !e.responsable && e.estado === "OPEN" ? "bandeja" : e.estado === "IN_PROGRESS" || e.estado === "ESCALATED" ? "atencion" : "cola";
}
var Fe = {
	bandeja: "Bandeja Orquestadora",
	cola: "En cola de sala",
	atencion: "En atención",
	salida: "Cierre Mi Portal"
};
function Ie(e) {
	return e.tipo === "ING" ? "form" : e.tipo === "RSV" || e.canal === "Mi Portal" ? "portal" : e.canal === "Teléfono" ? "tel" : e.canal === "WhatsApp" ? "wa" : "mail";
}
var Le = {
	PED: "primary-300",
	CTA: "primary-500",
	VIS: "primary-800",
	QUE: "secondary-300",
	REC: "secondary-700",
	GAR: "info-400",
	RES: "info-700",
	ING: "neutral-450",
	RSV: "neutral-700"
}, H = (e) => _e.includes(e.estado), Re = (e) => e.nivel === "vencido" || e.nivel === "fuera-de-plazo", ze = {
	URGENT: 4,
	HIGH: 3,
	MEDIUM: 2,
	LOW: 1
}, Be = {
	URGENT: "Urgente",
	HIGH: "Alta",
	MEDIUM: "Media",
	LOW: "Baja"
};
function Ve(e) {
	return (t, n) => Number(L(e, n.id)) - Number(L(e, t.id)) || I(t, e.ahora).vence.getTime() - I(n, e.ahora).vence.getTime() || (ze[n.prioridad] ?? 0) - (ze[t.prioridad] ?? 0);
}
function He(e, t) {
	let n = I(e, t), r = n.hito === "respuesta" ? e.abierto : e.inicioCiclo, i = n.vence.getTime() - r.getTime(), a = V(e) === "salida" ? e.ultimaResolucion ?? e.cierre ?? t : t;
	return i > 0 ? Math.max(0, Math.min(100, Math.round((a.getTime() - r.getTime()) / i * 100))) : 100;
}
function Ue(e) {
	return !e || e.rol === "SUPERVISOR" || e.rol === "COORDINADOR_CX" ? null : new Set(z.filter((t) => t.gente.some((t) => be.find((e) => e.id === t)?.area === e.area)).map((e) => e.k));
}
function U(e, t, n) {
	let r = Ue(t);
	if (!r && !n) return e;
	let i = new Set(e.tickets.filter((t) => (!n || t.empresaId === n) && (!r || r.has(B(e, t)))).map((e) => e.id)), a = (e) => i.has(e.ticketId);
	return {
		...e,
		tickets: e.tickets.filter((e) => i.has(e.id)),
		filasEstado: e.filasEstado.filter(a),
		filasAsignacion: e.filasAsignacion.filter(a),
		alertas: e.alertas.filter(a),
		encuestas: e.encuestas.filter(a),
		rayos: e.rayos.filter(a)
	};
}
var We = /* @__PURE__ */ new Map();
function Ge(e) {
	return e ? (We.has(e) || We.set(e, be.find((t) => Ce(t.id).some((t) => t.id === e))?.id ?? null), We.get(e) ?? null) : null;
}
function Ke(e) {
	let t = z.find((t) => t.k === e), n = [...new Set((t?.gente ?? []).map(Ge).filter((e) => !!e))];
	return n.length ? n.map(R).join(", ") : null;
}
var qe = () => we(null);
function W(e) {
	let t = (t) => Math.max(0, ...e.alertas.filter((e) => e.ticketId === t.id && e.ciclo === t.reaperturas).map((e) => e.fecha.getTime()));
	return e.tickets.filter((n) => H(n) && I(n, e.ahora).nivel === "vencido" && t(n) > 0).sort((e, n) => t(n) - t(e));
}
function Je(e, t) {
	let n = e.tickets.find((e) => e.id === t.ticketId)?.responsable ?? null;
	if (!n) return `correo a ${R(t.destinatario)}`;
	let r = Ge(n);
	return r ? `correo a ${R(n)} con copia a su líder, ${R(r)}` : `correo a ${R(n)} · ${qe()}`;
}
function Ye(e, t = 12) {
	let n = (t) => e.tickets.find((e) => e.id === t)?.numero ?? "";
	return [
		...e.filasEstado.map((e) => ({
			id: e.id,
			fecha: e.fecha,
			texto: e.de ? `${n(e.ticketId)} · ${ve[e.a] ?? e.a}` : `${n(e.ticketId)} · Registrado`,
			tono: e.a === "RESOLVED" || e.a === "CLOSED" ? "success" : "default"
		})),
		...e.alertas.map((t) => ({
			id: t.id,
			fecha: t.fecha,
			texto: `${n(t.ticketId)} · SLA vencido: ${Je(e, t)}; pasa a la Sala de Comité`,
			tono: "danger"
		})),
		...e.rayos.map((e) => ({
			id: e.id,
			fecha: e.fecha,
			tono: "accent",
			texto: e.accion === "MARCADO" ? `${n(e.ticketId)} · Prioridad Rayo (${e.motivo})` : `${n(e.ticketId)} · Rayo retirado`
		}))
	].sort((e, t) => t.fecha.getTime() - e.fecha.getTime()).slice(0, t);
}
function Xe(e, t) {
	let n = e.filasEstado.find((e) => e.ticketId === t.id && !e.de);
	return [
		...e.filasEstado.filter((e) => e.ticketId === t.id).map((e) => ({
			id: e.id,
			fecha: e.fecha,
			o: e.de ? 3 : 0,
			texto: e.de ? ve[e.a] ?? e.a : "Registrado",
			tono: e.a === "RESOLVED" || e.a === "CLOSED" ? "success" : e.a === "ESCALATED" ? "danger" : "default"
		})),
		{
			id: `${t.id}-bandeja`,
			fecha: n ? n.fecha : t.abierto,
			o: 1,
			texto: "En la Bandeja Orquestadora",
			tono: "accent"
		},
		...e.filasAsignacion.filter((e) => e.ticketId === t.id && e.aResponsable).map((e) => ({
			id: e.id,
			fecha: e.fecha,
			o: 2,
			tono: "default",
			texto: `Asignado a ${R(e.aResponsable)}${e.motivo === "REASSIGNMENT_CARGA" ? " (reasignación por carga)" : ""}`
		})),
		...e.alertas.filter((e) => e.ticketId === t.id).map((t) => ({
			id: t.id,
			fecha: t.fecha,
			o: 4,
			texto: `SLA vencido: ${Je(e, t)}`,
			tono: "danger"
		}))
	].sort((e, t) => t.fecha.getTime() - e.fecha.getTime() || t.o - e.o);
}
function Ze(e, t) {
	if (t.estado !== "CLOSED") return null;
	let n = e.encuestas.filter((e) => e.ticketId === t.id && e.respuesta).at(-1);
	return n ? `${n.respuesta.csat}/5${n.respuesta.ces === void 0 ? "" : ` · CES ${n.respuesta.ces}`}` : "Encuesta sin respuesta";
}
function Qe(e, t) {
	let n = z.find((e) => e.k === t) ?? {
		k: t,
		gente: []
	}, r = e.tickets.filter((n) => H(n) && B(e, n) === t), i = e.tickets.filter((n) => B(e, n) === t && n.primeraResolucion), a = i.filter((e) => e.primeraResolucion <= e.venceResolucion).length;
	return {
		k: t,
		ts: r,
		cola: r.filter((e) => V(e) === "cola").length,
		aten: r.filter((e) => V(e) === "atencion").length,
		ocup: n.gente.filter((e) => r.some((t) => V(t) === "atencion" && t.responsable === e)).length,
		tot: n.gente.length,
		riesgo: r.filter((t) => {
			let n = I(t, e.ahora).nivel;
			return n === "vencido" || n === "en-riesgo";
		}).length,
		res: i.length,
		sla: i.length ? Math.round(a / i.length * 100) : null
	};
}
function $e(e, t) {
	let n = new Set(e.tickets.filter((n) => B(e, n) === t).map((e) => e.id));
	return e.filasAsignacion.filter((e) => e.motivo === "REASSIGNMENT_CARGA" && n.has(e.ticketId)).sort((e, t) => t.fecha.getTime() - e.fecha.getTime()).slice(0, 5);
}
function et(e) {
	let t = e.tickets.filter((e) => e.primeraResolucion).sort((e, t) => e.primeraResolucion.getTime() - t.primeraResolucion.getTime()), n = 0, r = 1, i = 0;
	for (let a of t) for (a.primeraResolucion <= a.venceResolucion ? (i++, n += 10 + (e.rayos.some((e) => e.ticketId === a.id && e.accion === "MARCADO") ? 5 : 0)) : (i = 0, n += 3); n >= r * 100;) n -= r * 100, r++;
	let a = t.filter((e) => e.primeraResolucion <= e.venceResolucion).length;
	return {
		xp: n,
		nivel: r,
		racha: i,
		meta: r * 100,
		enSla: a,
		resueltos: t.length
	};
}
function tt(e) {
	let t = e.encuestas.filter((e) => e.respuesta), n = t.filter((t) => new Date(t.respuesta.fecha).toDateString() === e.ahora.toDateString()), r = (e) => e.length ? e.reduce((e, t) => e + t.respuesta.csat, 0) / e.length : null;
	return {
		hoy: r(n),
		nHoy: n.length,
		acumulado: r(t),
		n: t.length
	};
}
function nt(e) {
	let t = e.encuestas.filter((e) => e.respuesta).length;
	if (!t) return {
		valor: null,
		n: t
	};
	let n = Math.round(t * .72), r = Math.round(t * .18), i = Math.max(0, t - n - r);
	return {
		valor: Math.round((n - i) / t * 100),
		n: t
	};
}
var rt = {
	tel: [
		"CTA",
		"Teléfono",
		"Solicita su estado de cuenta y el cronograma de cuotas actualizado"
	],
	wa: [
		"GAR",
		"WhatsApp",
		"Envía fotos de una fisura en el muro del lote para revisar la garantía"
	],
	mail: [
		"QUE",
		"Correo",
		"Queja por la demora en la entrega de la minuta"
	],
	portal: [
		"RSV",
		"Mi Portal",
		"Consulta de cupo en el bus del Entrega Fest y su pase QR"
	],
	form: [
		"ING",
		"Formulario simple",
		"Visita del propietario a obra registrada en el pórtico"
	]
}, G = [
	"tel",
	"wa",
	"mail",
	"portal",
	"form"
], it = {
	eje1: [
		"PED",
		"Correo",
		"Pedido de copia simple del contrato"
	],
	cob: [
		"CTA",
		"WhatsApp",
		"Validación de un voucher de cuota pagada en agente bancario"
	],
	post: [
		"GAR",
		"WhatsApp",
		"Inspección de una fisura en el muro perimétrico (garantía)"
	],
	proy: [
		"RSV",
		"Mi Portal",
		"Confirmación de asistencia familiar al Entrega Fest"
	]
}, K = [
	[
		"CTA",
		"Teléfono",
		"Solicita su estado de cuenta y el cronograma de cuotas actualizado"
	],
	[
		"CTA",
		"WhatsApp",
		"Envía el voucher de una cuota pagada en agente bancario para validarla"
	],
	[
		"QUE",
		"Correo",
		"Queja por la demora en la entrega de la minuta"
	],
	[
		"GAR",
		"WhatsApp",
		"Envía fotos de una fisura en el muro del lote para revisar la garantía"
	],
	[
		"CTA",
		"Correo",
		"Pide la constancia de no adeudo de su lote"
	],
	[
		"QUE",
		"Teléfono",
		"Queja por la atención recibida en la caseta del proyecto"
	]
], at = (e) => xe[e * 7 % Math.min(30, xe.length)].id;
async function ot(e, t, n) {
	try {
		if (t % 4 == 0) {
			let [e, n, r] = K[t / 4 % K.length];
			F.entrante(e, n, at(t), r);
		} else if (t % 4 == 1) {
			let t = e.tickets.find((e) => e.estado === "OPEN" && e.responsable);
			t && await N.cambiarEstado(t.id, "IN_PROGRESS", null);
		} else if (t % 4 == 2) {
			let t = e.tickets.find((e) => e.estado === "IN_PROGRESS" && (n.get(e.id) ?? 0) >= 2);
			t && await N.cambiarEstado(t.id, "RESOLVED", "Resuelto desde la operación en vivo");
		} else t % 8 == 3 && P.avanzar(1);
		for (let t of e.tickets) t.estado === "IN_PROGRESS" && n.set(t.id, (n.get(t.id) ?? 0) + 1);
	} catch {}
}
//#endregion
//#region src/vivo/planta.ts
var st = {
	ahora: /* @__PURE__ */ new Date(),
	tickets: [],
	filasEstado: [],
	filasAsignacion: [],
	alertas: [],
	encuestas: [],
	rayos: [],
	escalamientos: []
}, ct = {
	"canal:tel": ["eje1", "Líder ATC"],
	"canal:wa": ["eje1", "Líder ATC"],
	"canal:mail": ["eje1", "Líder ATC"],
	"etapa:bandeja": ["eje1", "Supervisión Orquestación"],
	"canal:form": ["proy", "Responsable Proyecto"]
}, lt = class {
	puertas = m;
	enEjecucion = !0;
	velocidad = 1;
	cajonLateralAbierto = !1;
	vistaCajon = "todo";
	areaFiltro = "";
	estacionSeleccionadaKey = "etapa:bandeja";
	ticketSeleccionadoId = null;
	empresa = "";
	modo = "3d";
	sinWebgl = !1;
	mensaje = "";
	error = null;
	motivoAbierto = !1;
	motivo = "";
	registroVisible = !0;
	hits = { current: [] };
	todo = st;
	o = st;
	persona = null;
	clave = "";
	paso = 0;
	ocupado = !1;
	enAtencion = /* @__PURE__ */ new Map();
	snapCache = null;
	actualizar(e, t) {
		let n = `${t?.id ?? ""}|${this.empresa}`;
		(e !== this.todo || n !== this.clave) && (this.todo = e, this.persona = t, this.clave = n, this.o = U(e, t, this.empresa));
	}
	cambiarEmpresa(e) {
		this.empresa = e, this.clave = "", this.actualizar(this.todo, this.persona);
	}
	salas() {
		let e = Ue(this.persona);
		return h.filter((t) => !e || e.has(t.k));
	}
	clavesSalas() {
		return this.salas().map((e) => e.k).join(",");
	}
	activos() {
		return this.o.tickets.filter(H);
	}
	conRayoCount() {
		return this.activos().filter((e) => L(this.o, e.id)).length;
	}
	activosEnCursoCount() {
		return this.activos().length;
	}
	enRiesgoCount() {
		return this.activos().filter((e) => this.nivelSlaTicket(e) !== "ok").length;
	}
	resueltosHoy() {
		return this.o.tickets.filter((e) => e.ultimaResolucion && e.ultimaResolucion.toDateString() === this.o.ahora.toDateString()).length;
	}
	comiteCount() {
		return W(this.o).length;
	}
	ticketSeleccionado() {
		let e = this.ticketSeleccionadoId;
		return e ? this.o.tickets.find((t) => t.id === e) ?? null : null;
	}
	estacionActual() {
		return _[this.estacionSeleccionadaKey] ?? _["etapa:bandeja"] ?? null;
	}
	ticketsBandeja() {
		let e = this.areaFiltro;
		return this.activos().filter((t) => !e || B(this.o, t) === e).sort(Ve(this.o));
	}
	estadosResumen() {
		let e = this.o.tickets, t = this.o.ahora.toDateString(), n = (t) => e.filter((e) => e.estado === t).length, r = [
			{
				id: "OPEN",
				n: ve.OPEN ?? "Abierto",
				v: n("OPEN"),
				tono: "info",
				tonoBarra: "brand"
			},
			{
				id: "IN_PROGRESS",
				n: "En curso",
				v: n("IN_PROGRESS"),
				tono: "info",
				tonoBarra: "brand"
			},
			{
				id: "PENDING_CUSTOMER",
				n: "Espera cliente",
				v: n("PENDING_CUSTOMER"),
				tono: "warning",
				tonoBarra: "brand"
			},
			{
				id: "ESCALATED",
				n: "Escalado",
				v: n("ESCALATED"),
				tono: "danger",
				tonoBarra: "danger"
			},
			{
				id: "REOPENED",
				n: "Reabierto",
				v: n("REOPENED"),
				tono: "warning",
				tonoBarra: "danger"
			},
			{
				id: "RESOLVED",
				n: "Resuelto",
				v: n("RESOLVED"),
				tono: "success",
				tonoBarra: "success"
			},
			{
				id: "CLOSED",
				n: "Cerrado hoy",
				v: e.filter((e) => e.estado === "CLOSED" && e.cierre && e.cierre.toDateString() === t).length,
				tono: "success",
				tonoBarra: "success"
			}
		], i = Math.max(1, ...r.map((e) => e.v));
		return r.map((e) => ({
			...e,
			pct: Math.round(e.v / i * 100)
		}));
	}
	totalEstadosCount() {
		return this.estadosResumen().reduce((e, t) => e + t.v, 0);
	}
	equipo() {
		return et(this.o);
	}
	snapshot() {
		let e = this.o, t = this.ticketSeleccionadoId;
		if (this.snapCache && this.snapCache.o === e && this.snapCache.sel === t) return this.snapCache.s;
		let n = new Set(e.tickets.filter((e) => V(e) === "salida").sort((e, t) => (t.ultimaResolucion?.getTime() ?? 0) - (e.ultimaResolucion?.getTime() ?? 0)).slice(0, 8).map((e) => e.id)), r = e.tickets.filter((e) => H(e) || n.has(e.id)).map((t) => ({
			t,
			zona: B(e, t),
			etapa: V(t)
		})), i = new Set(this.salas().map((e) => e.k)), a = {
			bandeja: r.filter((e) => e.etapa === "bandeja").length,
			escalados: e.escalamientos.length,
			comite: W(e).map((e) => ({
				id: e.id,
				numero: e.numero
			})),
			zonas: z.filter((e) => i.has(e.k)).map((t) => {
				let n = (e) => r.some((n) => n.zona === t.k && n.etapa === "atencion" && n.t.responsable === e);
				return {
					k: t.k,
					cola: r.filter((e) => e.zona === t.k && e.etapa === "cola").length,
					atencion: r.filter((e) => e.zona === t.k && e.etapa === "atencion").length,
					riesgo: r.some((n) => n.zona === t.k && n.etapa !== "salida" && Re(I(n.t, e.ahora))),
					gente: t.gente.slice(0, 3).map((e) => ({
						id: e,
						nombre: R(e),
						ocupado: n(e)
					})),
					ocupados: t.gente.filter(n).length,
					total: t.gente.length
				};
			}),
			tickets: r.map((n) => ({
				id: n.t.id,
				numero: n.t.numero,
				tipo: n.t.tipo,
				gate: Ie(n.t),
				zona: n.zona,
				etapa: n.etapa,
				sla: n.etapa === "salida" ? "ok" : this.nivelSlaTicket(n.t),
				rayo: L(e, n.t.id),
				sel: n.t.id === t,
				resp: n.t.responsable ?? void 0
			}))
		};
		return this.snapCache = {
			o: e,
			sel: t,
			s: a
		}, a;
	}
	inspeccionarCanal3D(e, t) {
		this.estacionSeleccionadaKey = `canal:${e}`, this.vistaCajon = "estacion", this.cajonLateralAbierto = !0, t && this.entrante({ gate: e });
	}
	inspeccionarSala3D(e) {
		this.estacionSeleccionadaKey = `sala:${e}`, this.vistaCajon = "estacion", this.cajonLateralAbierto = !0, this.areaFiltro = e;
		let t = this.activos().filter((t) => B(this.o, t) === e).sort(Ve(this.o))[0];
		t && (this.ticketSeleccionadoId = t.id);
	}
	inspeccionarEtapa3D(e) {
		this.estacionSeleccionadaKey = `etapa:${e}`, this.vistaCajon = "estacion", this.cajonLateralAbierto = !0, e === "bandeja" && (this.areaFiltro = "");
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
	async tick() {
		if (!this.ocupado) {
			this.ocupado = !0;
			try {
				await ot(this.o, this.paso++, this.enAtencion);
			} finally {
				this.ocupado = !1;
			}
		}
	}
	nivelSlaTicket(e) {
		let t = I(e, this.o.ahora).nivel;
		return t === "vencido" || t === "fuera-de-plazo" ? "vencido" : t === "en-riesgo" ? "riesgo" : "ok";
	}
	tonoSlaBadge(e) {
		let t = this.nivelSlaTicket(e);
		return t === "vencido" ? "danger" : t === "riesgo" ? "warning" : "success";
	}
	tonoSlaBarra(e) {
		let t = this.nivelSlaTicket(e);
		return t === "vencido" ? "danger" : t === "riesgo" ? "brand" : "success";
	}
	pctSlaRestante(e) {
		return 100 - He(e, this.o.ahora);
	}
	etiquetaSlaTicket(e) {
		let t = I(e, this.o.ahora);
		return t.nivel === "cumplido" ? "SLA cumplido" : t.nivel === "fuera-de-plazo" ? "Resuelto fuera de plazo" : t.nivel === "vencido" ? "SLA vencido" : t.nivel === "en-riesgo" ? `En riesgo (${this.pctSlaRestante(e)}%)` : `En plazo (${this.pctSlaRestante(e)}%)`;
	}
	nombreSala(e) {
		return e === "bandeja" ? "Bandeja Orquestadora" : e === "comite" ? "Comité (Mesa SGD)" : h.find((t) => t.k === e)?.nombre ?? e;
	}
	nombreCanal(e) {
		return this.puertas.find((t) => t.k === e)?.nombre ?? e;
	}
	nombreTipo(e) {
		return ye(e);
	}
	liderEstacion(e) {
		if (e.areaKey) return Ke(e.areaKey) ?? g[e.areaKey] ?? e.lider;
		let t = ct[e.clave], n = t ? Ke(t[0]) : null;
		return n && t ? `${n} (${t[1]})` : e.lider;
	}
	async hacer(e) {
		this.error = null, this.mensaje = "";
		try {
			let t = await e();
			t && (this.mensaje = t);
		} catch (e) {
			this.error = e;
		}
	}
	num(e) {
		return this.todo.tickets.find((t) => t.id === e)?.numero ?? "";
	}
	marcarRayo(e, t) {
		return this.hacer(async () => (await N.marcarRayo(e, t, !1), this.motivoAbierto = !1, this.motivo = "", `Prioridad Rayo en ${this.num(e)}: sube al tope de la cola de su área.`));
	}
	quitarRayo(e) {
		return this.hacer(async () => (await N.retirarRayo(e), `Rayo retirado de ${this.num(e)}.`));
	}
	resolver(e) {
		return this.hacer(async () => (await N.cambiarEstado(e, "RESOLVED", "Resuelto desde la operación en vivo"), `${this.num(e)} resuelto: pasa a Cierre en Mi Portal, donde el cliente confirma y responde la encuesta.`));
	}
	reasignar(e) {
		return this.hacer(async () => {
			let t = await F.reasignar(e);
			return `${this.num(e)} reasignado a ${R(t)}, el gestor disponible con menos carga del área; le llega el correo con copia a su líder.`;
		});
	}
	async nuevo(e, t) {
		let [n, r, i] = e, a = F.entrante(n, r, at(this.paso++), i, this.empresa || void 0), o = this.nombreCanal(Ie({
			tipo: n,
			canal: r
		})), s = `Entró ${a.numero} por ${o}: ${a.resultado === "asignado" ? "la bandeja lo asignó por carga" : "quedó en la cola de su área"}.`;
		if (t && this.persona && Ae(this.persona)) try {
			await N.marcarRayo(a.id, "Ingreso con Prioridad Rayo (simulación)", !1), s = `Entró ${a.numero} por ${o} con Prioridad Rayo: sube al tope de la cola.`;
		} catch (e) {
			this.error = e;
		}
		return this.ticketSeleccionadoId = a.id, s;
	}
	entrante(e = {}) {
		let t = e.gate ?? G[this.paso % G.length];
		return this.hacer(() => this.nuevo(rt[t] ?? rt.tel, !!e.rayo));
	}
	haciaSala(e, t) {
		let n = it[e];
		return n ? this.hacer(() => this.nuevo(n, t)) : Promise.resolve();
	}
	simularPicoMasivo() {
		return this.hacer(async () => {
			for (let e = 0; e < G.length; e++) await this.nuevo(rt[G[e]], e === 0);
			return "Pico multicanal: entraron 5 tickets, uno por canal; la bandeja los ordena por rayo, SLA y prioridad.";
		});
	}
	forzarVencimientoSla() {
		return this.hacer(() => {
			let e = this.o, t = this.activos().filter((t) => I(t, e.ahora).nivel !== "vencido").sort((t, n) => I(t, e.ahora).vence.getTime() - I(n, e.ahora).vence.getTime())[0];
			if (!t) return "No hay tickets activos por vencer en la vista.";
			let n = F.horas(this.todo, t.id);
			return n == null ? `El SLA de ${t.numero} no vence en los próximos 60 días hábiles.` : (n > 0 && P.avanzar(n), this.ticketSeleccionadoId = t.id, `El reloj avanzó ${n} h hábil${n === 1 ? "" : "es"}: venció el SLA de ${t.numero}, se avisó por correo a su responsable con copia a su líder y el caso pasó a la Sala de Comité.`);
		});
	}
}, ut = {
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
}, dt = [
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
], ft = [
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
], { Button: q, Badge: J, PageHeader: pt, Card: Y, CardBody: X, CardHeader: Z, CardPairs: mt, Select: ht, Drawer: gt, SegmentedControl: _t, Breadcrumb: vt, ProgressBar: yt, DataGrid: bt, FormField: xt, Input: St, ErrorAccion: Ct } = ue, wt = (e, t, n = {}) => x(Y, n, e ? x(Z, e) : null, x(X, null, t)), Q = (...e) => x(Y, { variant: "default" }, x(X, { padding: "sm" }, ...e)), Tt = (e) => x("span", { className: "ay-text--label" }, e), $ = (e) => x("p", { className: "ay-text--subtitle ay-text--sm vv-nota" }, e), Et = (e) => e.map((e) => ({
	id: e.id,
	titulo: e.texto,
	fecha: e.fecha,
	autor: ke(e.fecha),
	tono: e.tono
})), Dt = (e, t, n) => `${e} ${e === 1 ? t : n}`;
function Ot() {
	re();
	let [e] = ie(() => new lt()), [, t] = ie(0), n = () => t((e) => e + 1), r = (e) => () => {
		e(), n();
	}, i = (e) => () => {
		n(), e().finally(n);
	}, a = oe(null), o = oe(null), { datos: s, sim: c } = se(), l = ce();
	e.actualizar(s, l);
	let u = e.o, d = c?.vivoSimulacion !== !1, p = Me(l), m = oe({
		sim: d,
		Q: p
	});
	m.current = {
		sim: d,
		Q: p
	};
	let h = !!l && Ae(l);
	ae(() => {
		if (!d || !e.enEjecucion || !p) return;
		let t = setInterval(() => {
			e.tick();
		}, 1500 / e.velocidad);
		return () => clearInterval(t);
	}, [
		d,
		e.enEjecucion,
		e.velocidad,
		p
	]);
	let g = e.clavesSalas();
	ae(() => {
		let t = o.current, r = a.current;
		if (e.modo !== "3d" || !t || !r) return;
		let i = {
			teal: f("primary-500", [
				43,
				138,
				156
			]),
			teal2: f("primary-400", [
				56,
				189,
				248
			]),
			orange: f("secondary-400", [
				246,
				164,
				44
			]),
			ok: f("success-500", [
				46,
				139,
				87
			]),
			warn: f("warning-500", [
				227,
				155,
				28
			]),
			bad: f("danger-500", [
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
			zonas: e.salas().map((e) => ({
				k: e.k,
				n: e.nombre,
				color: te[e.k] ?? i.teal2
			})),
			compuertas: e.puertas.map((e) => ({
				k: e.k,
				n: e.nombre,
				sigla: e.ic,
				color: ne[e.k] ?? i.teal2
			})),
			tipos: Object.entries(Le).map(([e, t]) => ({
				k: e,
				color: f(t, i.teal2)
			}))
		}, c = typeof matchMedia < "u" && matchMedia("(prefers-reduced-motion: reduce)").matches;
		try {
			return ee({
				canvas: t,
				host: r,
				cols: i,
				reducido: c,
				est: s,
				hits: e.hits,
				obtener: () => e.snapshot(),
				alClickTicket: (t) => {
					e.ticketSeleccionadoId = t, e.motivoAbierto = !1, n();
				},
				alClickCanal: (t) => {
					e.inspeccionarCanal3D(t, e.enEjecucion && m.current.sim && m.current.Q), n();
				},
				alClickSala: (t) => {
					e.inspeccionarSala3D(t), n();
				},
				alClickEtapa: (t) => {
					e.inspeccionarEtapa3D(t), n();
				}
			});
		} catch (t) {
			console.warn("Operación en Vivo: sin WebGL, se muestra la vista por área", t), e.sinWebgl = !0, e.modo = "lista", n();
			return;
		}
	}, [e.modo, g]);
	let _ = (e) => {
		location.hash = le(e);
	}, v = (t) => {
		e.ticketSeleccionadoId = t, e.motivoAbierto = !1, e.motivo = "", n();
	}, y = e.salas();
	e.areaFiltro && !y.some((t) => t.k === e.areaFiltro) && (e.areaFiltro = "");
	let b = e.ticketsBandeja(), ue = b.slice(0, 10), S = e.ticketSeleccionado(), C = e.estacionActual(), T = e.vistaCajon, E = e.equipo(), D = E.resueltos ? Math.round(E.enSla / E.resueltos * 100) : null, k = tt(u), M = nt(u), N = e.estadosResumen(), P = new Set(W(u).map((e) => e.id)), F = u.tickets.filter((e) => V(e) === "salida").sort((e, t) => (t.ultimaResolucion?.getTime() ?? 0) - (e.ultimaResolucion?.getTime() ?? 0)).slice(0, 8), ge = Dt(y.length, "Sala", "Salas"), _e = [{
		value: "",
		label: `Todas las salas (${Dt(y.length, "área", "áreas")})`
	}, ...y.map((e) => ({
		value: e.k,
		label: e.nombre
	}))], ye = [{
		value: "",
		label: "Todas las razones sociales"
	}, ...De.map((e) => ({
		value: e.id,
		label: e.nombre
	}))], be = x(pt, {
		title: "Operación en Vivo",
		description: "Planta de atención en tiempo real, colas y niveles de servicio",
		size: "md",
		breadcrumb: x(vt, {
			label: "Ruta del módulo",
			items: [
				{ label: "Aybar Atiende" },
				{ label: "Núcleo 360 y Planta" },
				{ label: "Operación en Vivo" }
			]
		}),
		meta: x("span", { className: "ay-row ay-row--2 ay-row--wrap" }, x(J, {
			tone: "success",
			dot: !0
		}, "En línea · 8 sistemas"), d ? x(J, { tone: "warning" }, "Modo simulación") : x(J, { tone: "neutral" }, "Tiempo real"), l ? x(J, { tone: "info" }, `${l.nombre} (${ut[l.rol] ?? l.rol})`) : null)
	}), xe = d ? A({
		gap: "2",
		wrap: !0,
		children: [
			x(q, {
				key: "p",
				size: "sm",
				variant: "primary",
				disabled: !p,
				onClick: r(() => e.alternarPausa())
			}, e.enEjecucion ? "Pausar planta" : "Reanudar planta"),
			x(_t, {
				key: "v",
				label: "Velocidad de planta",
				size: "sm",
				options: dt,
				value: String(e.velocidad),
				onValueChange: (t) => {
					e.cambiarVelocidad(t), n();
				}
			}),
			x(q, {
				key: "t",
				size: "sm",
				variant: "secondary",
				disabled: !p,
				onClick: i(() => e.entrante())
			}, "+ Ticket entrante"),
			h ? x(q, {
				key: "r",
				size: "sm",
				variant: "secondary",
				disabled: !p,
				onClick: i(() => e.entrante({ rayo: !0 }))
			}, "Ticket con Prioridad Rayo") : null,
			x(q, {
				key: "e",
				size: "sm",
				variant: "danger",
				disabled: !p,
				onClick: i(() => e.forzarVencimientoSla())
			}, "Escalar a Comité SGD"),
			x(q, {
				key: "m",
				size: "sm",
				variant: "ghost",
				disabled: !p,
				onClick: i(() => e.simularPicoMasivo())
			}, "Pico +5 multicanal")
		]
	}) : $("Tiempo real: el visor refleja al instante lo que pasa en la Bandeja. La pausa, la velocidad y los tickets de ejemplo solo existen en el modo simulación (Herramientas › Simulación)."), Ce = j({
		gap: "2",
		children: [x("p", {
			key: "m",
			className: "ay-text--sm vv-nota vv-mensaje",
			role: "status",
			"aria-live": "polite"
		}, e.mensaje), e.error ? x("div", { key: "e" }, x(Ct, {
			error: e.error,
			titulo: "No se completó la acción"
		})) : null]
	}), we = e.enRiesgoCount(), je = me({
		columnas: 5,
		children: [
			x("div", { key: "a" }, Q(j({
				gap: "2",
				align: "start",
				children: [x(w, {
					key: "s",
					label: "Tickets activos",
					value: e.activosEnCursoCount(),
					size: "sm"
				}), x(J, {
					key: "b",
					size: "sm",
					tone: we > 0 ? "warning" : "success"
				}, we > 0 ? `${we} en riesgo` : "Sin riesgos")]
			}))),
			x("div", { key: "b" }, Q(A({
				gap: "3",
				children: [x(de, {
					key: "c",
					label: "Resueltos en SLA",
					value: D ?? 0,
					size: "md",
					tone: (D ?? 0) >= 90 ? "success" : "warning"
				}), j({
					gap: "1",
					children: [x(w, {
						key: "s",
						label: "Resueltos en SLA",
						value: D ?? "—",
						unit: D == null ? void 0 : "%",
						size: "sm"
					}), x("span", {
						key: "t",
						className: "ay-text--subtitle ay-text--sm"
					}, `${E.enSla} de ${E.resueltos} (Meta 90%)`)]
				})]
			}))),
			x("div", { key: "c" }, Q(j({
				gap: "2",
				children: [x(w, {
					key: "s",
					label: "CSAT del día",
					value: k.hoy == null ? "—" : k.hoy.toFixed(1),
					unit: k.hoy == null ? void 0 : "/ 5",
					size: "sm"
				}), k.hoy == null ? x("span", {
					key: "r",
					className: "ay-text--subtitle ay-text--sm"
				}, k.acumulado == null ? "Sin encuestas respondidas" : `Sin encuestas hoy · acumulado ${k.acumulado.toFixed(1)} / 5 (n=${k.n})`) : x(fe, {
					key: "r",
					label: "Satisfacción CSAT",
					value: k.hoy,
					allowHalf: !0,
					count: k.nHoy,
					size: "sm"
				})]
			}))),
			x("div", { key: "d" }, Q(j({
				gap: "2",
				children: [A({
					gap: "2",
					justify: "between",
					children: [x(w, {
						key: "s",
						label: `Nivel ${E.nivel} del equipo`,
						value: E.xp,
						unit: `/ ${E.meta} XP`,
						size: "sm"
					}), x(J, {
						key: "b",
						size: "sm",
						tone: "info"
					}, `Racha ${E.racha}`)]
				}), x(yt, {
					key: "p",
					label: "Experiencia del equipo",
					hideLabel: !0,
					value: Math.round(E.xp / E.meta * 100),
					detail: `Faltan ${E.meta - E.xp} XP`,
					size: "sm",
					tone: "brand"
				})]
			}))),
			x("div", { key: "e" }, Q(j({
				gap: "2",
				align: "start",
				children: [x(w, {
					key: "s",
					label: "NPS del turno",
					value: M.valor == null ? "—" : `${M.valor > 0 ? "+" : ""}${M.valor}`,
					size: "sm"
				}), x(J, {
					key: "b",
					size: "sm",
					tone: (M.valor ?? 0) >= 30 ? "success" : "warning"
				}, `Encuestas n=${M.n}`)]
			})))
		]
	}), Pe = x(Y, { variant: "default" }, x(Z, {
		title: "Tickets por estado",
		as: "h4",
		subtitle: "Distribución en tiempo real: Abierto, En curso, Espera cliente, Escalado, Reabierto, Resuelto y Cerrado",
		actions: x(J, {
			size: "sm",
			tone: "neutral"
		}, `${e.totalEstadosCount()} en total`)
	}), x(X, { padding: "sm" }, me({
		columnas: 7,
		children: N.map((e) => x("div", { key: e.id }, Q(j({
			gap: "1",
			children: [A({
				gap: "2",
				justify: "between",
				children: [x("span", {
					key: "n",
					className: "ay-text--label"
				}, e.n), x(J, {
					key: "v",
					size: "sm",
					tone: e.tono
				}, String(e.v))]
			}), x(yt, {
				key: "p",
				label: e.n,
				hideLabel: !0,
				value: e.pct,
				tone: e.tonoBarra,
				size: "sm"
			})]
		}))))
	}))), H = wt({
		title: `Operación en Vivo 3D · Robot Orquestador · 5 Canales de Entrada · ${ge} de Atención`,
		subtitle: "Monitoreo en tiempo real del flujo de tickets, despacho automático por menor carga y SLA",
		as: "h3",
		actions: A({
			gap: "2",
			wrap: !0,
			children: [
				x(ht, {
					key: "rs",
					size: "sm",
					"aria-label": "Razón social",
					value: e.empresa,
					options: ye,
					onChange: (t) => {
						e.cambiarEmpresa(t.target.value), n();
					}
				}),
				x(ht, {
					key: "s",
					size: "sm",
					"aria-label": "Sala",
					value: e.areaFiltro,
					options: _e,
					onChange: (t) => {
						e.areaFiltro = t.target.value, n();
					}
				}),
				x(q, {
					key: "b",
					size: "sm",
					variant: e.cajonLateralAbierto ? "primary" : "secondary",
					"aria-expanded": e.cajonLateralAbierto,
					onClick: r(() => {
						e.cajonLateralAbierto = !e.cajonLateralAbierto;
					})
				}, e.cajonLateralAbierto ? "Cerrar cajón de bandejas" : `Bandejas operativas (${b.length})`)
			]
		})
	}, j({
		gap: "3",
		children: [
			x("div", { key: "c" }, xe),
			x("div", { key: "a" }, Ce),
			x("div", { key: "k" }, je),
			x("div", { key: "e" }, Pe)
		]
	})), Re = (t, a) => {
		let o = I(t, u.ahora), s = V(t) === "salida", c = L(u, t.id), d = t.clienteId ? Se(t.clienteId) : null, f = He(t, u.ahora), ee = Ze(u, t), m = [
			["Cliente / Lote", d ? [d.nombre, d.proyectos?.[0]].filter(Boolean).join(" · ") : "—"],
			["Canal de entrada", e.nombreCanal(Ie(t))],
			["Tipo", e.nombreTipo(t.tipo)],
			["Sala / Área", e.nombreSala(B(u, t))],
			["Estado", [.../* @__PURE__ */ new Set([ve[t.estado] ?? t.estado, Fe[V(t)]])].join(" · ")],
			["Responsable", t.responsable ? R(t.responsable) : "Bandeja Orquestadora"],
			...ee ? [["CSAT", ee]] : []
		], g = e.motivoAbierto ? j({
			gap: "2",
			children: [x(xt, {
				key: "f",
				label: "Motivo del rayo",
				required: !0,
				helper: "Solo el supervisor; tope del 10 % de los tickets activos del área."
			}, x(St, {
				value: e.motivo,
				maxLength: 140,
				onChange: (t) => {
					e.motivo = t.target.value, n();
				}
			})), A({
				gap: "2",
				children: [x(q, {
					key: "ok",
					size: "sm",
					variant: "primary",
					disabled: !e.motivo.trim(),
					onClick: i(() => e.marcarRayo(t.id, e.motivo))
				}, "Marcar Prioridad Rayo"), x(q, {
					key: "no",
					size: "sm",
					variant: "ghost",
					onClick: r(() => {
						e.motivoAbierto = !1;
					})
				}, "Cancelar")]
			})]
		}) : null;
		return x("div", {
			key: t.id,
			className: a ? "pl-atc-ficha-flotante pl-atc-ficha-flotante--izq" : "vv-ficha",
			role: "dialog",
			"aria-modal": "false",
			"aria-label": `Ficha del ticket ${t.numero}`
		}, x(Y, null, x(Z, {
			title: t.numero,
			subtitle: t.resumen,
			as: "h3",
			actions: A({
				gap: "2",
				wrap: !0,
				children: [
					x(J, {
						key: "p",
						size: "sm",
						tone: c ? "warning" : "info"
					}, c ? "Prioridad Rayo" : Be[t.prioridad] ?? t.prioridad),
					x(J, {
						key: "s",
						size: "sm",
						tone: e.tonoSlaBadge(t)
					}, e.etiquetaSlaTicket(t)),
					P.has(t.id) ? x(J, {
						key: "c",
						size: "sm",
						tone: "danger"
					}, "Sala de Comité") : null,
					x(q, {
						key: "x",
						size: "sm",
						variant: "ghost",
						"aria-label": "Cerrar ficha",
						onClick: () => v(null)
					}, "Cerrar")
				]
			})
		}), x(X, null, j({
			gap: "3",
			children: [
				x(yt, {
					key: "b",
					label: "SLA consumido",
					value: f,
					tone: e.tonoSlaBarra(t),
					size: "sm",
					detail: `${f}% consumido · ${o.hito === "respuesta" ? "primera respuesta" : "resolución"} ${s ? "vencía" : "vence"} ${ke(o.vence)}`
				}),
				x(mt, {
					key: "p",
					pairs: m
				}),
				j({
					gap: "1",
					children: [x("span", {
						key: "t",
						className: "ay-text--label"
					}, "Recorrido en tiempo real"), x(pe, {
						key: "l",
						label: "Recorrido del ticket en planta",
						hitos: Et(Xe(u, t)),
						ahora: u.ahora,
						conHora: !0
					})]
				}),
				x(he, { key: "d" }),
				g,
				A({
					gap: "2",
					wrap: !0,
					children: [
						h && !s ? x(q, {
							key: "r",
							size: "sm",
							variant: "secondary",
							onClick: c ? i(() => e.quitarRayo(t.id)) : r(() => {
								e.motivoAbierto = !0;
							})
						}, c ? "Quitar Rayo" : "Prioridad Rayo") : null,
						p && !s ? x(q, {
							key: "v",
							size: "sm",
							variant: "primary",
							onClick: i(() => e.resolver(t.id))
						}, "Resolver a Mi Portal") : null,
						Ne(l) && !s ? x(q, {
							key: "g",
							size: "sm",
							variant: "ghost",
							onClick: i(() => e.reasignar(t.id))
						}, "Reasignar gestor") : null,
						x(q, {
							key: "e",
							size: "sm",
							variant: "ghost",
							onClick: () => _(`ticket/${t.id}`)
						}, "Ver expediente")
					]
				})
			]
		}))));
	}, ze = [
		{
			key: "n",
			header: "Área",
			renderCell: (t) => x("button", {
				type: "button",
				className: "pt-enlace-celda",
				onClick: r(() => e.inspeccionarSala3D(t.k))
			}, t.n)
		},
		{
			key: "cola",
			header: "En cola",
			align: "end"
		},
		{
			key: "aten",
			header: "En atención",
			align: "end"
		},
		{
			key: "ocup",
			header: "Gestores ocupados",
			align: "end",
			renderCell: (e) => `${e.ocup} de ${e.tot}`
		},
		{
			key: "riesgo",
			header: "En riesgo o vencidos",
			align: "end"
		},
		{
			key: "res",
			header: "Resueltos",
			align: "end"
		},
		{
			key: "sla",
			header: "% en SLA",
			align: "end",
			renderCell: (e) => e.sla == null ? "—" : `${e.sla} %`
		}
	], Ue = y.map((e) => ({
		...Qe(u, e.k),
		n: e.nombre
	})), U = (t) => x("li", {
		key: t.id,
		className: "vv-fila"
	}, x("button", {
		type: "button",
		className: "pt-enlace-celda",
		onClick: () => v(t.id)
	}, t.numero), L(u, t.id) ? x(J, {
		size: "sm",
		tone: "warning"
	}, "RAYO") : null, x("span", { className: "ay-text--subtitle ay-text--sm" }, `${e.nombreTipo(t.tipo)} · ${Fe[V(t)]}`), P.has(t.id) ? x(J, {
		size: "sm",
		tone: "danger"
	}, "Comité SGD") : x(J, {
		size: "sm",
		tone: e.tonoSlaBadge(t)
	}, e.etiquetaSlaTicket(t))), We = x("section", {
		className: "vv-lista",
		"aria-label": "Vista por área en lista"
	}, j({
		gap: "3",
		children: [
			e.sinWebgl ? x("div", { key: "w" }, $("Este equipo no puede dibujar la escena 3D (sin aceleración gráfica): se muestra la misma información por área.")) : null,
			y.length ? x("div", { key: "g" }, x(bt, {
				caption: "Tickets por área",
				columns: ze,
				rows: Ue,
				getRowId: (e) => e.k
			})) : x("div", { key: "g" }, $("Tu rol no tiene áreas en la Operación en Vivo.")),
			x("div", { key: "b" }, A({
				gap: "2",
				wrap: !0,
				children: [x(J, {
					key: "b",
					size: "sm",
					tone: "info"
				}, `Bandeja Orquestadora: ${u.tickets.filter((e) => V(e) === "bandeja").length} en espera`), x(J, {
					key: "c",
					size: "sm",
					tone: P.size ? "danger" : "neutral"
				}, `Sala de Comité: ${P.size} con SLA vencido`)]
			})),
			x("div", {
				key: "l",
				className: "vv-areas"
			}, ...Ue.map((e) => x(Y, {
				key: e.k,
				variant: "default"
			}, x(Z, {
				title: e.n,
				as: "h4",
				subtitle: `${e.cola} en cola · ${e.ocup}/${e.tot} ocupados · ${e.sla == null ? "sin resueltos" : `${e.sla} % en SLA`}`
			}), x(X, { padding: "sm" }, e.ts.length ? x("ul", { className: "vv-lista-tk" }, ...[...e.ts].sort(Ve(u)).map(U)) : $("Sin tickets activos.")))), x(Y, {
				key: "comite",
				variant: "default"
			}, x(Z, {
				title: "Comité (Mesa SGD)",
				as: "h4",
				subtitle: `${P.size} con SLA vencido · ${u.escalamientos.length} escalados en cadena`
			}), x(X, { padding: "sm" }, P.size ? x("ul", { className: "vv-lista-tk" }, ...W(u).map(U)) : $("Ningún caso con el SLA vencido."))), x(Y, {
				key: "cierre",
				variant: "default"
			}, x(Z, {
				title: "Cierre en Mi Portal",
				as: "h4",
				subtitle: `${F.length} resueltos recientes`
			}), x(X, { padding: "sm" }, F.length ? x("ul", { className: "vv-lista-tk" }, ...F.map(U)) : $("Sin resueltos recientes."))))
		]
	})), Ge = j({
		gap: "2",
		children: [A({
			gap: "2",
			wrap: !0,
			children: [
				x(O, {
					key: 1,
					variant: "outline",
					dotColor: "var(--aybar-color-feedback-success-border)"
				}, "LED verde: En plazo SLA"),
				x(O, {
					key: 2,
					variant: "outline",
					dotColor: "var(--aybar-color-feedback-warning-border)"
				}, "LED ámbar pulsante: SLA en riesgo (<25%)"),
				x(O, {
					key: 3,
					variant: "outline",
					dotColor: "var(--aybar-color-feedback-danger-border)"
				}, "LED rojo / Comité SGD: SLA vencido"),
				x(O, {
					key: 4,
					variant: "outline",
					dotColor: "var(--aybar-color-secondary-400)"
				}, "Relámpago 3D giratorio: Prioridad Rayo"),
				x(O, {
					key: 5,
					variant: "outline",
					dotColor: "var(--aybar-color-primary-500)"
				}, "Robot Orquestador: Despacho automático por carga")
			]
		}), A({
			gap: "2",
			wrap: !0,
			children: [x("span", {
				key: "t",
				className: "ay-text--label"
			}, "Color de la caja: tipo de ticket"), ...Object.entries(Le).map(([t, n]) => x(O, {
				key: t,
				variant: "outline",
				dotColor: `var(--aybar-color-${n})`
			}, e.nombreTipo(t)))]
		})]
	}), Ke = e.registroVisible ? x("aside", {
		className: "vv-registro",
		"aria-label": "Registro de actividad"
	}, x(Y, { variant: "default" }, x(Z, {
		title: "Registro de actividad",
		as: "h4",
		subtitle: "Estados, rayo y avisos de SLA vencido, con la hora de cada evento",
		actions: x(q, {
			size: "sm",
			variant: "ghost",
			"aria-label": "Ocultar el registro de actividad",
			onClick: r(() => {
				e.registroVisible = !1;
			})
		}, "Ocultar")
	}), x(X, { padding: "sm" }, x(pe, {
		label: "Actividad reciente",
		hitos: Et(Ye(u)),
		ahora: u.ahora,
		conHora: !0
	})))) : null, Je = wt({
		title: `Planta de Atención en Vivo · Robot Orquestador · ${ge} · Comité SGD · Cierre en Mi Portal`,
		subtitle: "Haz clic en cualquier tarjeta 3D, canal o sala para inspeccionar su detalle en tiempo real o abre el cajón de bandejas.",
		as: "h3",
		actions: A({
			gap: "2",
			wrap: !0,
			children: [
				x(J, {
					key: "r",
					size: "sm",
					tone: "success"
				}, `${e.resueltosHoy()} resueltos hoy`),
				x(J, {
					key: "y",
					size: "sm",
					tone: "warning"
				}, `${e.conRayoCount()} con Rayo`),
				x(J, {
					key: "c",
					size: "sm",
					tone: P.size > 0 ? "danger" : "neutral"
				}, `${P.size} en Comité SGD`),
				e.registroVisible ? null : x(q, {
					key: "g",
					size: "sm",
					variant: "secondary",
					onClick: r(() => {
						e.registroVisible = !0;
					})
				}, "Registro de actividad"),
				e.sinWebgl ? x(J, {
					key: "m",
					size: "sm",
					tone: "info"
				}, "Lista por área (sin 3D)") : x(_t, {
					key: "m",
					label: "Vista de la planta",
					size: "sm",
					value: e.modo,
					options: [{
						value: "3d",
						label: "Escena 3D"
					}, {
						value: "lista",
						label: "Lista por área"
					}],
					onValueChange: (t) => {
						e.modo = t === "lista" ? "lista" : "3d", n();
					}
				})
			]
		})
	}, j({
		gap: "3",
		children: [x("div", {
			key: "e",
			className: e.registroVisible ? "vv-planta" : "vv-planta vv-planta--sola"
		}, e.modo === "3d" ? x("div", {
			ref: a,
			className: "atc-vivo-stage-area"
		}, x("canvas", {
			ref: o,
			style: {
				display: "block",
				width: "100%",
				cursor: "pointer"
			},
			"aria-label": "Escena 3D de la planta de atención"
		}), S ? Re(S, !0) : null) : x("div", null, S ? Re(S, !1) : null, We), Ke), x("div", { key: "l" }, Ge)]
	})), et = T === "todo" || T === "bandeja" ? wt({
		title: `Bandeja Orquestadora y Salas (${b.length})`,
		subtitle: "Orden: Rayo · SLA · Prioridad (clic para abrir ficha en escena)",
		as: "h3",
		actions: A({
			gap: "2",
			wrap: !0,
			children: [x(J, {
				key: "f",
				size: "sm",
				tone: "info"
			}, e.areaFiltro ? e.nombreSala(e.areaFiltro) : "Todas las salas"), x(q, {
				key: "i",
				size: "sm",
				variant: "ghost",
				onClick: () => _("bandeja")
			}, "Ir a Bandeja")]
		})
	}, j({
		gap: "2",
		children: [
			...ue.map((t) => {
				let r = t.clienteId ? Se(t.clienteId) : null, a = L(u, t.id);
				return x(Y, {
					key: t.id,
					variant: "selectable",
					selected: e.ticketSeleccionadoId === t.id,
					onClick: () => v(t.id)
				}, x(X, { padding: "sm" }, j({
					gap: "1",
					children: [A({
						gap: "2",
						wrap: !0,
						justify: "between",
						children: [A({
							gap: "2",
							wrap: !0,
							children: [
								x("strong", {
									key: "n",
									className: "ay-text--mono ay-text--sm"
								}, t.numero),
								a ? x(J, {
									key: "r",
									size: "sm",
									tone: "warning"
								}, "RAYO") : null,
								r ? x("span", {
									key: "c",
									className: "ay-text--subtitle ay-text--sm"
								}, r.nombre) : null
							]
						}), P.has(t.id) ? x(J, {
							key: "s",
							size: "sm",
							tone: "danger"
						}, "Comité SGD") : x(J, {
							key: "s",
							size: "sm",
							tone: e.tonoSlaBadge(t)
						}, `${e.pctSlaRestante(t)}% SLA`)]
					}), A({
						gap: "2",
						wrap: !0,
						justify: "between",
						children: [x("span", {
							key: "d",
							className: "ay-text--subtitle ay-text--sm"
						}, `${e.nombreTipo(t.tipo)} · ${Be[t.prioridad] ?? t.prioridad} · ${e.nombreSala(B(u, t))} (${Fe[V(t)]})`), h ? x(q, {
							key: "r",
							size: "sm",
							variant: "ghost",
							"aria-label": `${a ? "Quitar Rayo" : "Prioridad Rayo"} a ${t.numero}`,
							onClick: (r) => {
								r.stopPropagation(), a ? i(() => e.quitarRayo(t.id))() : (v(t.id), e.motivoAbierto = !0, n());
							}
						}, a ? "Quitar Rayo" : "Rayo") : null]
					})]
				})));
			}),
			b.length > ue.length ? $(`Y ${b.length - ue.length} más en la Bandeja.`) : null,
			b.length ? null : $("Sin tickets activos en la vista.")
		]
	})) : null, rt = (t) => {
		let n = Qe(u, t), r = z.find((e) => e.k === t), i = $e(u, t), a = (e) => u.tickets.find((t) => t.id === e)?.numero ?? "";
		return j({
			gap: "2",
			children: [
				x(mt, {
					key: "r",
					pairs: [
						["En cola", String(n.cola)],
						["Gestores ocupados", `${n.ocup} de ${n.tot}`],
						["Resueltos", String(n.res)],
						["% en SLA", n.sla == null ? "—" : `${n.sla} %`]
					]
				}),
				Tt(`Tickets del área (${n.ts.length})`),
				n.ts.length ? x("ul", {
					key: "t",
					className: "vv-lista-tk"
				}, ...[...n.ts].sort(Ve(u)).map(U)) : $("Sin tickets activos."),
				Tt("Carga de cada gestor"),
				x("ul", {
					key: "g",
					className: "vv-lista-tk"
				}, ...(r?.gente ?? []).map((t) => {
					let n = Te(e.todo, t).carga;
					return x("li", {
						key: t,
						className: "vv-fila"
					}, x("span", null, R(t)), x("span", { className: "ay-text--subtitle ay-text--sm" }, `Carga ${n} (límite 12)`), n > 12 ? x(J, {
						size: "sm",
						tone: "warning"
					}, "Sobre el límite") : null, Ee(e.todo, t) ? null : x(J, {
						size: "sm",
						tone: "neutral"
					}, "No disponible"));
				})),
				Tt("Reasignaciones por carga"),
				i.length ? x("ul", {
					key: "a",
					className: "vv-lista-tk"
				}, ...i.map((e) => x("li", {
					key: e.id,
					className: "vv-fila"
				}, `${ke(e.fecha)} · ${a(e.ticketId)}: ${R(e.deResponsable)} → ${e.aResponsable ? R(e.aResponsable) : "cola del área"}`))) : $("Sin reasignaciones por carga."),
				$("La reasignación por carga la hace el balanceo (límite de 12 puntos por gestor); desde este panel no se reasigna a mano.")
			]
		});
	}, G = (t) => t.gateKey ? ["Activos que entraron por aquí", String(e.activos().filter((e) => Ie(e) === t.gateKey).length)] : t.clave === "etapa:bandeja" ? ["En espera ahora", String(u.tickets.filter((e) => V(e) === "bandeja").length)] : t.clave === "etapa:comite" ? ["En la sala ahora", `${P.size} con SLA vencido · ${u.escalamientos.length} escalados en cadena`] : t.clave === "etapa:salida" ? ["Resueltos hoy", String(e.resueltosHoy())] : null, K = d && p, at = (T === "todo" || T === "estacion") && C ? wt({
		title: C.nombre,
		subtitle: `${C.categoria} · ${C.hu}`,
		as: "h3",
		actions: x(J, {
			size: "sm",
			tone: "info"
		}, C.entidad)
	}, j({
		gap: "3",
		children: [
			x(mt, {
				key: "p",
				pairs: [
					["Política operativa", C.rfRn],
					["Líder / Custodio", e.liderEstacion(C)],
					["Acuerdo de servicio (SLA)", C.slaRegla],
					["Información gestionada", C.inputsReales],
					...G(C) ? [G(C)] : []
				]
			}),
			A({
				gap: "2",
				wrap: !0,
				children: [
					C.gateKey && K ? x(q, {
						key: "g1",
						size: "sm",
						variant: "primary",
						onClick: i(() => e.entrante({ gate: C.gateKey }))
					}, `+ Ingresar por ${e.nombreCanal(C.gateKey)}`) : null,
					C.gateKey && K && h ? x(q, {
						key: "g2",
						size: "sm",
						variant: "secondary",
						onClick: i(() => e.entrante({
							gate: C.gateKey,
							rayo: !0
						}))
					}, "Ingresar con Rayo") : null,
					C.areaKey && K && it[C.areaKey] ? x(q, {
						key: "a1",
						size: "sm",
						variant: "primary",
						onClick: i(() => e.haciaSala(C.areaKey, !1))
					}, `+ Ticket hacia ${e.nombreSala(C.areaKey)}`) : null,
					C.areaKey && K && h && it[C.areaKey] ? x(q, {
						key: "a2",
						size: "sm",
						variant: "secondary",
						onClick: i(() => e.haciaSala(C.areaKey, !0))
					}, "Con Rayo a esta sala") : null,
					C.areaKey === "libro" ? x(q, {
						key: "lb",
						size: "sm",
						variant: "secondary",
						onClick: () => _("libro")
					}, "Ir al Libro de Reclamaciones") : null,
					C.areaKey && e.areaFiltro === C.areaKey ? x(q, {
						key: "a3",
						size: "sm",
						variant: "ghost",
						onClick: r(() => {
							e.areaFiltro = "";
						})
					}, "Ver todas las salas") : null,
					C.clave === "etapa:comite" && K ? x(q, {
						key: "c",
						size: "sm",
						variant: "danger",
						onClick: i(() => e.forzarVencimientoSla())
					}, "Escalar caso a Comité SGD") : null
				]
			}),
			C.clave === "etapa:comite" ? P.size ? x("ul", {
				key: "cm",
				className: "vv-lista-tk",
				"aria-label": "Casos en la Sala de Comité"
			}, ...W(u).map(U)) : $("Ningún caso con el SLA vencido.") : null,
			C.clave === "etapa:salida" ? F.length ? x("ul", {
				key: "sa",
				className: "vv-lista-tk",
				"aria-label": "Resueltos recientes"
			}, ...F.map(U)) : $("Sin resueltos recientes.") : null,
			C.areaKey && y.some((e) => e.k === C.areaKey) ? x("div", { key: "pa" }, rt(C.areaKey)) : null
		]
	})) : null, ot = Oe(u).slice(0, 8), st = (t) => {
		let n = u.tickets.find((e) => e.numero === t);
		return n ? e.nombreSala(B(u, n)) : null;
	}, ct = T === "todo" || T === "correos" ? wt({
		title: "Correos de asignación (CC Líder de Área)",
		subtitle: "Notificación automática en cada despacho",
		as: "h3",
		actions: x(J, {
			size: "sm",
			tone: "info"
		}, `${ot.length} recientes`)
	}, ot.length ? x(pe, {
		label: "Correos de asignación enviados",
		ahora: u.ahora,
		conHora: !0,
		hitos: ot.map((e) => ({
			id: e.id,
			fecha: e.fecha,
			autor: ke(e.fecha),
			tono: "accent",
			titulo: `${e.masivo && e.tickets.length > 1 ? `${e.tickets.length} tickets reasignados a ${R(e.para)}` : `Ticket ${e.tickets[0]} asignado a ${R(e.para)}${st(e.tickets[0]) ? ` en ${st(e.tickets[0])}` : ""}`} (CC: ${e.cc ? R(e.cc) : qe()})`
		}))
	}) : $("Aún no hay correos de asignación.")) : null, Ot = x(gt, {
		open: e.cajonLateralAbierto,
		onOpenChange: (t) => {
			e.cajonLateralAbierto = t, n();
		},
		modal: !1,
		side: "end",
		size: "lg",
		title: "Bandejas, Estación 3D y Correos CC"
	}, j({
		gap: "3",
		children: [
			x(_t, {
				key: "s",
				label: "Vista del cajón",
				size: "sm",
				options: ft,
				value: T,
				onValueChange: (t) => {
					e.cambiarVistaCajon(t), n();
				}
			}),
			et ? x("div", { key: "b" }, et) : null,
			at ? x("div", { key: "e" }, at) : null,
			ct ? x("div", { key: "c" }, ct) : null
		]
	}));
	return x("div", { className: "pt-pagina pt-pagina--ancha vv-pagina" }, be, j({
		gap: "4",
		"aria-label": "Panel unificado de Operación en Vivo",
		children: [
			x("div", { key: "1" }, H),
			x("div", { key: "2" }, Je),
			x("div", { key: "3" }, Ot)
		]
	}));
}
//#endregion
export { Ot as VivoDaniel };
