import * as e from "./comun-CVU2GQ4h.js";
import { h as t, x as n } from "./prototipo-B6qmgYQk.js";
import { t as r } from "./FormField-BR5f57fp.js";
import { t as i } from "./Textarea-DtfHJHzV.js";
import { t as a } from "./Input-BYH1MAKY.js";
import { n as o, t as s } from "./CardBody-WQ8Pzs3R.js";
import { t as c } from "./EmptyState-DMKP8Bhj.js";
import { t as l } from "./DataGrid-DgP6eHZJ.js";
import { t as u } from "./Breadcrumb-BtXUT3bJ.js";
import { t as d } from "./FileItem-nWzF1I4B.js";
import { n as f, t as p } from "./Radio-CgEEMRd2.js";
//#region src/portal/kit.ts
var m = e.Ii(), h = m.createElement, g = m.Fragment, { useState: _, useEffect: v, useMemo: y, useRef: b, useId: x, useCallback: S } = m, C = e.__ptNucleo, w = e.k, T = e.A, E = e.x, D = e.p, O = e.Wr, ee = e.Kn, te = e.Un, ne = e.Ut, k = e.Ar, A = e.mr, j = e.m, re = e.h, ie = e.C, ae = e.u, M = e.Jn, N = {
	Button: e.Ai,
	Badge: e.$r,
	Tag: e.Qr,
	Alert: e.Gr,
	PageHeader: e.Nr,
	ErrorState: e.Mr,
	FileUpload: e.ii,
	ErrorAccion: e.t,
	CardHeader: t,
	Select: n,
	FormField: r,
	Textarea: i,
	Input: a,
	Card: o,
	CardBody: s,
	EmptyState: c,
	DataGrid: l,
	Breadcrumb: u,
	FileItem: d,
	RadioGroup: f,
	Radio: p
};
function P({ children: e }) {
	return globalThis.__ptNota?.(e), null;
}
//#endregion
//#region src/portal/modelo.ts
var F = "Mi Portal", I = "p-cliente", L = "p-portal", R = {
	accept: "image/jpeg,image/png,application/pdf",
	maxBytes: 10485760,
	maxArchivos: 3,
	texto: "JPG, PNG o PDF de hasta 10 MB; máximo 3 archivos."
}, oe = (e, t = e.datos()) => e.diasConfirmacion(t), z = {
	minutos: 5,
	intentos: 3
}, B = [
	{
		id: "CTA",
		nombre: "Consulta de cuenta",
		ayuda: "Cuotas, pagos, estado de cuenta o constancias.",
		subtipos: [
			"Estado de cuenta del lote",
			"Pago no reflejado",
			"Constancia de pagos",
			"Cronograma de pagos"
		]
	},
	{
		id: "PED",
		nombre: "Pedido simple",
		ayuda: "Copias de documentos o cambios de datos de contacto.",
		subtipos: [
			"Copia legalizada de contrato",
			"Actualización de datos",
			"Información de cambio de titular",
			"Otra solicitud"
		]
	},
	{
		id: "VIS",
		nombre: "Visita técnica",
		ayuda: "Coordinar una visita a tu lote o vivienda.",
		subtipos: [
			"Visita al lote",
			"Revisión de linderos",
			"Coordinación de la entrega"
		]
	},
	{
		id: "GAR",
		nombre: "Garantía postventa",
		ayuda: "Algo de tu vivienda entregada necesita reparación.",
		subtipos: [
			"Estructural",
			"Impermeabilización",
			"Acabados",
			"Instalaciones eléctricas o sanitarias"
		]
	},
	{
		id: "REC",
		nombre: "Reclamo",
		ayuda: "Disconformidad con un producto o servicio.",
		subtipos: [],
		libro: !0
	},
	{
		id: "QUE",
		nombre: "Queja",
		ayuda: "Malestar por la atención recibida.",
		subtipos: [],
		libro: !0
	}
], V = {
	OPEN: {
		texto: "Registrado",
		tono: "info"
	},
	IN_PROGRESS: {
		texto: "En atención",
		tono: "info"
	},
	PENDING_CUSTOMER: {
		texto: "Pendiente de tu respuesta",
		tono: "warning"
	},
	ESCALATED: {
		texto: "En revisión especializada",
		tono: "info"
	},
	RESOLVED: {
		texto: "Resuelto · por confirmar",
		tono: "success"
	},
	CLOSED: {
		texto: "Cerrado",
		tono: "neutral"
	},
	REOPENED: {
		texto: "Reabierto",
		tono: "warning"
	}
};
function H(e, t) {
	return e === "ATC" ? "Atención al cliente" : t[e] ?? e;
}
function U(e) {
	let t = e.descripcion;
	return t.startsWith("Residencial Brisas") ? {
		empresaId: "AIN",
		linea: "Vivienda"
	} : t.startsWith("Ciudad Aybar Norte") ? {
		empresaId: "ADN",
		linea: "Lotes urbanos"
	} : {
		empresaId: "ALT",
		linea: "Lotes urbanos"
	};
}
var W = (e) => e.replace(/^(.{2})[^@]*(@.*)$/, (e, t, n) => `${t}•••${n}`), G = (e) => {
	let t = e.match(/^(\+\d{1,3})?(.*?)(\d{3})$/);
	return t ? `${t[1] ? `${t[1]} ` : ""}${t[2].replace(/^\s+/, "").replace(/\d/g, "•")}${t[3]}` : e;
};
function se(e, t) {
	let n = t.replace(/\D/g, "");
	return e.find((e) => e.dni === n) ?? null;
}
function ce(e) {
	return /^\d{8}$/.test(e.trim()) ? null : "Escribe tu DNI: 8 dígitos, sin puntos ni espacios.";
}
function le(e = Math.random) {
	return String(Math.floor(e() * 9e5) + 1e5);
}
function ue(e, t) {
	return e.tickets.filter((e) => e.clienteId === t).sort((e, t) => t.abierto.getTime() - e.abierto.getTime());
}
function de(e, t, n) {
	let r = e.tickets.find((e) => e.id === n);
	return r && r.clienteId === t ? r : null;
}
function fe(e, t, n) {
	e.aplicar((r) => e.auditar(r, I, "ver ticket en Mi Portal", `Mi Portal: el cliente ${n} intentó abrir el ticket ${t}, que no es suyo. Denegado; no se mostró nada.`));
}
var pe = (e, t, n) => {
	let r = n;
	for (let n of e) n.fecha.getTime() <= t.getTime() && (r = n.aArea);
	return r;
};
function me(e, t, n) {
	let r = e.filasEstado.filter((e) => e.ticketId === t.id), i = e.filasAsignacion.filter((e) => e.ticketId === t.id).sort((e, t) => e.fecha.getTime() - t.fecha.getTime()), a = i[0]?.aArea ?? t.area, o = [];
	r.forEach((e, r) => {
		let s = H(e.de === null ? a : pe(i, e.fecha, a), n);
		o.push({
			id: e.id,
			orden: r * 2,
			fecha: e.fecha,
			area: s,
			...he(e, t)
		});
	});
	let s = null, c = !1;
	return i.forEach((e, t) => {
		if (t === 0 && !e.aResponsable && i.length > 1) {
			s = e.aArea;
			return;
		}
		let a = !c, l = e.aArea !== s;
		if (c = !0, s = e.aArea, !a && !l) return;
		let u = r.filter((t) => t.fecha.getTime() <= e.fecha.getTime()).length, d = H(e.aArea, n);
		o.push({
			id: e.id,
			orden: u * 2 - 1 + t / 1e3,
			fecha: e.fecha,
			area: d,
			tono: "default",
			titulo: a ? e.aResponsable ? "Asignado" : "En la bandeja de atención" : "Derivado a otra área",
			detalle: a ? e.aResponsable ? `Lo atiende ${d}.` : "Espera a que un gestor lo tome." : `Ahora lo atiende ${d}.`
		});
	}), o.sort((e, t) => e.fecha.getTime() - t.fecha.getTime() || e.orden - t.orden).map(({ orden: e, ...t }) => t);
}
var K = (e) => e.a === "CLOSED" && e.nota?.match(/^Cierre automático: .* en (\d+) días hábiles/)?.[1] || null;
function he(e, t) {
	let n = e.autor === I;
	switch (e.a) {
		case "OPEN": return {
			titulo: "Registrado",
			detalle: t.canal === "Mi Portal" ? "Lo registraste en Mi Portal." : `Se registró por ${t.canal}.`,
			tono: "accent"
		};
		case "IN_PROGRESS": return {
			titulo: "En atención",
			detalle: n ? "Respondiste lo que te pedimos; tu caso volvió a atención y el plazo se reanudó." : e.de === "PENDING_CUSTOMER" ? "Retomamos la atención y el plazo se reanudó." : null,
			tono: "default"
		};
		case "PENDING_CUSTOMER": return {
			titulo: "Pendiente de tu respuesta",
			detalle: "Necesitamos un dato o un documento tuyo para seguir. Mientras tanto, el plazo queda en pausa.",
			tono: "accent"
		};
		case "ESCALATED": return {
			titulo: "En revisión especializada",
			detalle: null,
			tono: "default"
		};
		case "RESOLVED": return {
			titulo: "Resuelto · por confirmar",
			detalle: "Revisa la solución y confírmala o recházala.",
			tono: "success"
		};
		case "CLOSED": return {
			titulo: "Cerrado",
			detalle: n ? "Confirmaste la solución (cierre formal en Mi Portal)." : K(e) ? `Se cerró solo: no hubo respuesta en ${K(e)} días hábiles.` : null,
			tono: "success"
		};
		case "REOPENED": return {
			titulo: "Reabierto",
			detalle: n && e.nota ? `Rechazaste la solución: «${e.nota}»` : null,
			tono: "danger"
		};
	}
}
function ge(e, t) {
	return e.interacciones.filter((e) => e.ticketId === t.id && e.visible).sort((e, t) => e.fecha.getTime() - t.fecha.getTime()).map((e) => ({
		...e,
		quien: e.tipo === "cliente" ? "Tú" : "Aybar"
	}));
}
function _e(e, t, n, r) {
	return e.filasEstado.filter((e) => e.ticketId === t.id && e.de !== null).map((e) => ({
		id: `av-${e.id}`,
		fecha: e.fecha,
		estado: V[e.a].texto,
		canales: ["Correo", "WhatsApp"],
		destino: `${W(n.correo)} · ${G(n.telefono)}`,
		texto: `Tu ticket ${t.numero} ahora está «${V[e.a].texto}».${K(e) ? " Se cerró automáticamente." : ""}`,
		enlace: r
	})).reverse();
}
function ve(e, t) {
	let n = [], r = B.find((t) => t.id === e.tipo);
	t.some((t) => t.id === e.loteId) || n.push({
		campo: "lote",
		mensaje: "Elige el lote o contrato sobre el que consultas."
	}), r ? r.libro ? n.push({
		campo: "tipo",
		mensaje: "Los reclamos y las quejas se registran en el Libro de Reclamaciones, no como ticket."
	}) : r.subtipos.includes(e.subtipo) || n.push({
		campo: "subtipo",
		mensaje: "Elige el detalle de tu solicitud."
	}) : n.push({
		campo: "tipo",
		mensaje: "Elige el tipo de solicitud."
	}), e.descripcion.trim().length < 15 && n.push({
		campo: "descripcion",
		mensaje: "Cuéntanos tu caso en al menos 15 caracteres."
	}), e.adjuntos.length > R.maxArchivos && n.push({
		campo: "adjuntos",
		mensaje: `Máximo ${R.maxArchivos} archivos.`
	});
	for (let t of e.adjuntos) (t.tamano > R.maxBytes || !R.accept.split(",").includes(t.tipo)) && n.push({
		campo: "adjuntos",
		mensaje: `«${t.nombre}» no se admite: ${R.texto}`
	});
	return n;
}
var ye = (e, t) => {
	let n = `${e}: ${t.trim().replace(/\s+/g, " ")}`;
	return n.length > 90 ? `${n.slice(0, 89).trimEnd()}…` : n;
};
function be(e, t, n, r, i) {
	let a = ve(i, [r]);
	if (a.length) throw e.validacion(a);
	let { empresaId: o, linea: s } = U(r);
	if (!e.empresa(o)) throw e.validacion([{
		campo: "lote",
		mensaje: "No encontramos la razón social de ese contrato."
	}]);
	let c = t.ahora, l = "MEDIUM", u = e.sla(t, i.tipo, l, c), d = (t.secuencias[o] ?? 0) + 1, [f, p] = e.id(t, "tk"), m = {
		id: f,
		numero: `${o}-${String(d).padStart(6, "0")}`,
		empresaId: o,
		linea: s,
		canal: F,
		establecimiento: null,
		clienteId: n.id,
		tipo: i.tipo,
		subtipo: i.subtipo,
		prioridad: l,
		resumen: ye(i.subtipo, i.descripcion),
		descripcion: i.descripcion.trim(),
		estado: "OPEN",
		area: "ATC",
		responsable: null,
		eje: 1,
		abierto: c,
		registradoPor: L,
		politica: {
			id: u.politica.id,
			version: u.politica.version,
			origen: u.origen,
			respuestaH: u.politica.respuestaH,
			resolucionH: u.politica.resolucionH
		},
		venceRespuesta: u.venceRespuesta,
		venceResolucion: u.venceResolucion,
		primeraRespuesta: null,
		primeraResolucion: null,
		ultimaResolucion: null,
		cierre: null,
		reaperturas: 0,
		venceReapertura: null,
		inicioCiclo: c
	};
	p = {
		...p,
		secuencias: {
			...p.secuencias,
			[o]: d
		},
		tickets: [...p.tickets, m]
	}, p = e.registrarFlujo(p, f);
	let h;
	[h, p] = e.id(p, "fe"), p = {
		...p,
		filasEstado: [...p.filasEstado, {
			id: h,
			ticketId: f,
			fecha: c,
			de: null,
			a: "OPEN",
			autor: I,
			nota: null
		}]
	}, [h, p] = e.id(p, "fa"), p = {
		...p,
		filasAsignacion: [...p.filasAsignacion, {
			id: h,
			ticketId: f,
			fecha: c,
			deArea: null,
			deResponsable: null,
			aArea: "ATC",
			aResponsable: null,
			motivo: "ALTA",
			nota: "Registrado por el cliente en Mi Portal",
			autor: L
		}]
	};
	let g;
	[p, g] = e.asignarPorFlujo(p, f);
	let _ = e.ticket(p, f);
	if (p = e.reemplazar(p, {
		..._,
		eje: _.area === "ATC" ? 1 : 2
	}), i.adjuntos.length) {
		let t;
		[t, p] = e.id(p, "in"), p = {
			...p,
			interacciones: [...p.interacciones, {
				id: t,
				ticketId: f,
				fecha: c,
				tipo: "cliente",
				visible: !0,
				canal: F,
				autor: I,
				texto: "Adjunto de la solicitud",
				adjuntos: i.adjuntos
			}]
		};
	}
	return p = e.evento(p, "ticket_creado", {
		canal: "mi_portal",
		tipo: i.tipo,
		subtipo: i.subtipo,
		prioridad: l,
		empresa: o
	}), p = e.evento(p, "sla_congelado", {
		politica: `${u.politica.id} v${u.politica.version}`,
		fr_due: u.venceRespuesta.toISOString(),
		res_due: u.venceResolucion.toISOString()
	}), [p, {
		ticket: e.ticket(p, f),
		resultado: g
	}];
}
var q = (e, t, n) => {
	let r = e.filasEstado;
	for (let i = r.length - 1; i >= 0; i--) if (r[i].ticketId === t) return {
		...e,
		filasEstado: r.map((e, t) => t === i ? {
			...e,
			autor: n
		} : e)
	};
	return e;
}, J = (e, t, n, r, i) => {
	if (!t || t.clienteId !== n) throw e.error(404, "no-encontrado", "No encontramos ese ticket entre los tuyos.");
	if (t.estado !== r) throw e.error(409, "estado-cambiado", `El ticket ya no está «${V[r].texto}»: no se puede ${i}. Recarga para ver su estado actual.`);
	return t;
};
function xe(e, t, n, r, i, a) {
	let o = J(e, t.tickets.find((e) => e.id === n) ?? null, r, "PENDING_CUSTOMER", "responder"), s = [];
	i.trim().length < 3 && s.push({
		campo: "respuesta",
		mensaje: "Escribe tu respuesta."
	});
	for (let e of a) (e.tamano > R.maxBytes || !R.accept.split(",").includes(e.tipo)) && s.push({
		campo: "adjuntos",
		mensaje: `«${e.nombre}» no se admite: ${R.texto}`
	});
	if (s.length) throw e.validacion(s);
	let [c, l] = e.id(t, "in");
	return l = {
		...l,
		interacciones: [...l.interacciones, {
			id: c,
			ticketId: o.id,
			fecha: l.ahora,
			tipo: "cliente",
			visible: !0,
			canal: F,
			autor: I,
			texto: i.trim(),
			adjuntos: a
		}]
	}, l = e.evento(l, "interacción_registrada", {
		tipo: "cliente",
		visible: !0,
		adjuntos: a.length
	}), l = e.cambiarEstado(l, o.id, "IN_PROGRESS", null, "Respuesta del cliente en Mi Portal"), l = q(l, o.id, I), [l, void 0];
}
function Se(e, t, n, r) {
	let i = J(e, t.tickets.find((e) => e.id === n) ?? null, r, "RESOLVED", "confirmar la solución"), a = e.cambiarEstado(t, i.id, "CLOSED", null, "Cierre formal confirmado por el cliente en Mi Portal");
	return a = q(a, i.id, I), a = e.evento(a, "portal_cierre", { resultado: "confirmado" }), [a, void 0];
}
function Ce(e, t, n, r, i) {
	let a = J(e, t.tickets.find((e) => e.id === n) ?? null, r, "RESOLVED", "rechazar la solución"), o = i.trim().replace(/\s+/g, " ");
	if (o.length < 10) throw e.validacion([{
		campo: "motivo",
		mensaje: "Cuéntanos en al menos 10 caracteres por qué no estás conforme."
	}]);
	if (e.pii(o)) throw e.validacion([{
		campo: "motivo",
		mensaje: "No escribas tu DNI ni números de tarjeta: el motivo queda en la bitácora del ticket."
	}]);
	let s = e.cambiarEstado(t, a.id, "REOPENED", null, o);
	return s = q(s, a.id, I), s = e.evento(s, "portal_cierre", { resultado: "rechazado" }), [s, void 0];
}
function we(e, t, n = e.datos()) {
	return e.limiteConfirmacion(n, t);
}
//#endregion
//#region src/portal/estilos.ts
var Te = "\n/* .pt-pagina va en la hoja del artifact, que carga después: hace falta más especificidad para el aire de arriba */\n.pt-pagina.pp{display:grid;gap:var(--aybar-space-5);padding-block-start:var(--aybar-space-5)}\n.pp-cab{display:flex;flex-wrap:wrap;align-items:center;gap:var(--aybar-space-3) var(--aybar-space-5);padding:var(--aybar-space-3) var(--aybar-space-4);\n  background:var(--aybar-color-bg-surface);border:1px solid var(--aybar-color-border-subtle);border-radius:var(--aybar-radius-lg)}\n.pp-cab__quien{display:flex;align-items:center;gap:var(--aybar-space-3);min-inline-size:0;flex:1 1 14rem}\n.pp-cab__av{display:grid;place-items:center;inline-size:2.25rem;block-size:2.25rem;border-radius:var(--aybar-radius-full);flex:none;\n  background:var(--aybar-color-bg-brand-subtle);color:var(--aybar-color-fg-default);font-weight:var(--aybar-font-weight-bold);font-size:var(--aybar-font-size-sm)}\n.pp-cab__quien b{display:block;color:var(--aybar-color-fg-default)}\n.pp-cab__quien small{display:block;color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs)}\n.pp-subnav{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2)}\n.pp-subnav a{display:inline-flex;align-items:center;min-block-size:2.25rem;padding:0 var(--aybar-space-3);border-radius:var(--aybar-radius-full);\n  color:var(--aybar-color-fg-default);text-decoration:none;font-size:var(--aybar-font-size-sm);font-weight:var(--aybar-font-weight-medium);border:1px solid var(--aybar-color-border-subtle)}\n.pp-subnav a:hover{background:var(--aybar-color-bg-surface-sunken)}\n.pp-subnav a[aria-current=page]{background:var(--aybar-color-bg-brand-subtle);border-color:var(--aybar-color-border-accent)}\n.pp a:focus-visible,.pp button:focus-visible{outline:var(--aybar-focus-ring-width) solid var(--aybar-color-border-focus);outline-offset:var(--aybar-focus-ring-offset)}\n.pp-acceso{inline-size:min(100%,30rem);justify-self:center}\n.pp-sim{display:grid;gap:var(--aybar-space-2);padding:var(--aybar-space-3) var(--aybar-space-4);border:1px dashed var(--aybar-color-border-default);\n  border-radius:var(--aybar-radius-md);background:var(--aybar-color-bg-surface-sunken);color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-sm)}\n.pp-sim > b{color:var(--aybar-color-fg-default);font-size:var(--aybar-font-size-xs);text-transform:uppercase;letter-spacing:.04em}\n.pp-sim ul{margin:0;padding:0;list-style:none;display:grid;gap:var(--aybar-space-2)}\n.pp-sim li{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:var(--aybar-space-3)}\n.pp-codigo{font-family:var(--aybar-family-mono);font-size:var(--aybar-font-size-lg);font-weight:var(--aybar-font-weight-bold);letter-spacing:.2em;color:var(--aybar-color-fg-default)}\n.pp-etapa{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs);margin:0}\n.pp-rejilla{display:grid;gap:var(--aybar-space-5);grid-template-columns:minmax(0,1fr)}\n@media (min-width:64rem){.pp-rejilla{grid-template-columns:minmax(0,2fr) minmax(16rem,1fr);align-items:start}}\n.pp-datos{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--aybar-space-2) var(--aybar-space-4);margin:0;font-size:var(--aybar-font-size-sm)}\n.pp-datos dt{color:var(--aybar-color-fg-muted)}\n.pp-datos dd{margin:0;color:var(--aybar-color-fg-default);overflow-wrap:anywhere}\n.pp-resumen{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2) var(--aybar-space-5);margin:0;font-size:var(--aybar-font-size-sm)}\n.pp-resumen div{display:grid;gap:2px}\n.pp-resumen dt{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs)}\n.pp-resumen dd{margin:0;color:var(--aybar-color-fg-default);font-weight:var(--aybar-font-weight-semibold)}\n.pp-paso__area{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs);margin:0}\n.pp-paso__det{color:var(--aybar-color-fg-default);font-size:var(--aybar-font-size-sm);margin:0}\n.pp-msgs{display:grid;gap:var(--aybar-space-3);margin:0;padding:0;list-style:none}\n.pp-msg{display:grid;gap:var(--aybar-space-1);margin:0;padding:var(--aybar-space-3);border-radius:var(--aybar-radius-md);max-inline-size:44rem;\n  background:var(--aybar-color-bg-surface-sunken);border:1px solid var(--aybar-color-border-subtle)}\n.pp-msg[data-quien=cliente]{justify-self:end;background:var(--aybar-color-bg-brand-subtle);border-color:var(--aybar-color-border-accent)}\n.pp-msg__cab{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--aybar-space-2);font-size:var(--aybar-font-size-xs);color:var(--aybar-color-fg-muted)}\n.pp-msg__cab b{color:var(--aybar-color-fg-default)}\n.pp-msg p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--aybar-color-fg-default);font-size:var(--aybar-font-size-sm)}\n.pp-avisos{display:grid;gap:var(--aybar-space-2);margin:0;padding:0;list-style:none;font-size:var(--aybar-font-size-sm)}\n.pp-avisos li{display:grid;gap:2px;padding-block-end:var(--aybar-space-2);border-block-end:1px solid var(--aybar-color-border-subtle)}\n.pp-avisos li:last-child{border:0;padding:0}\n.pp-avisos small{color:var(--aybar-color-fg-muted);font-size:var(--aybar-font-size-xs)}\n.pp-adjuntos{display:grid;gap:var(--aybar-space-2);margin:0;padding:0;list-style:none}\n.pp-acciones{display:flex;flex-wrap:wrap;gap:var(--aybar-space-2);align-items:center}\n.pp-legal{display:grid;gap:var(--aybar-space-2);font-size:var(--aybar-font-size-sm)}\n.pp-legal p{margin:0}\n";
function Ee() {
	if (document.getElementById("pp-estilos")) return;
	let e = document.createElement("style");
	e.id = "pp-estilos", e.textContent = Te, document.head.append(e);
}
//#endregion
//#region src/portal/vistas.ts
var Y = "v3:portal", X = {
	leer() {
		try {
			return JSON.parse(sessionStorage.getItem(Y) ?? "null")?.clienteId ?? null;
		} catch {
			return null;
		}
	},
	guardar(e) {
		try {
			sessionStorage.setItem(Y, JSON.stringify({ clienteId: e }));
		} catch {}
	},
	borrar() {
		try {
			sessionStorage.removeItem(Y);
		} catch {}
	}
}, Z = (e) => {
	location.hash = M(e);
}, Q = (e) => h("span", { className: "pt-alerta__texto" }, e), De = (e) => e.filter((e) => e.status === "done").map((e) => ({
	nombre: e.name,
	tamano: e.size,
	tipo: e.tipo
})), Oe = (e) => (t) => e((e) => [...e, ...t.map((e, t) => ({
	id: `${Date.now()}-${t}-${e.name}`,
	name: e.name,
	size: e.size,
	status: "done",
	tipo: e.type
}))]), ke = (e) => h("div", {
	className: "pp-sim",
	role: "note"
}, h("b", null, e.titulo ?? "Simulación"), e.children);
function Ae({ ruta: e }) {
	Ee();
	let { datos: t } = w(), n = T(), [r, i] = _(() => X.leer()), a = r ? ee(r) : null, o = e.vista ?? "mis-tickets", s = () => {
		X.borrar(), i(null), O({
			message: "Cerraste tu sesión de Mi Portal.",
			tone: "success"
		}), Z("portal");
	}, c;
	return c = a ? o === "mis-tickets" ? h(Ne, {
		datos: t,
		cliente: a
	}) : o === "nuevo" ? h(Pe, {
		datos: t,
		cliente: a
	}) : o === "ticket" && e.ticketId ? h(Fe, {
		datos: t,
		cliente: a,
		ticketId: e.ticketId,
		key: e.ticketId
	}) : h(N.ErrorState, {
		status: 404,
		scope: "page",
		title: "Esta página de Mi Portal no existe",
		description: "Vuelve a tus tickets para seguir.",
		actions: h(N.Button, {
			variant: "primary",
			onClick: () => Z("portal")
		}, "Ir a Mis tickets")
	}) : h(Me, {
		datos: t,
		onEntrar: (e) => {
			X.guardar(e.id), i(e.id);
		}
	}), h("div", { className: "pt-pagina pp" }, n.rol === "CLIENTE" ? null : h(N.Alert, {
		tone: "info",
		size: "sm",
		title: "Vista del cliente"
	}, Q("Así ve Mi Portal un cliente de Aybar. Para recorrerlo como cliente, usa Herramientas › Ver como › Cliente.")), a ? h(je, {
		cliente: a,
		vista: o,
		onSalir: s
	}) : null, c, h(P, null, "Mi Portal (EP-ATC-06, FT-ATC-24) es nuevo en la v1.3 del PLT-04. Las pantallas son una propuesta: el PLT-04 dice «por diseñar en la etapa de diseño»."));
}
function je({ cliente: e, vista: t, onSalir: n }) {
	let r = e.nombre.split(" ").slice(0, 2).map((e) => e[0]).join(""), i = (e, t, n) => h("a", {
		href: M(e),
		"aria-current": n ? "page" : void 0
	}, t);
	return h("div", { className: "pp-cab" }, h("div", { className: "pp-cab__quien" }, h("span", {
		className: "pp-cab__av",
		"aria-hidden": "true"
	}, r), h("div", null, h("b", null, `Hola, ${e.nombre.split(" ")[0]}`), h("small", null, `DNI ••••${e.dni.slice(-4)} · tus datos vienen de SIGDA/TAXON`))), h("nav", {
		className: "pp-subnav",
		"aria-label": "Secciones de Mi Portal"
	}, i("portal", "Mis tickets", t === "mis-tickets" || t === "ticket"), i("portal/nuevo", "Nuevo ticket", t === "nuevo")), h(N.Button, {
		variant: "ghost",
		size: "sm",
		onClick: n
	}, "Salir"));
}
function Me({ datos: e, onEntrar: t }) {
	let [n, r] = _("dni"), [i, a] = _(""), [o, s] = _(""), [c, l] = _(null), [u, d] = _(null), [f, p] = _(null), m = C.sim().sigdaCaido || e.fuentesCaidas.includes("SIGDA"), g = y(() => {
		let t = (t) => {
			let n = e.tickets.filter((e) => e.estado === t && e.clienteId.startsWith("cli-0"));
			return (n.find((e) => e.tipo !== "REC" && e.tipo !== "QUE") ?? n[0])?.clienteId;
		};
		return [
			[t("PENDING_CUSTOMER"), "tiene un ticket esperando su respuesta"],
			[t("RESOLVED"), "tiene una solución por confirmar"],
			["cli-001", "cliente del 360 del inicio"]
		].filter(([e]) => e).map(([e, t]) => ({
			c: ee(e),
			por: t
		})).filter((e) => e.c);
	}, [e.tickets]);
	v(() => {
		n === "codigo" && document.querySelector("#pp-codigo")?.focus();
	}, [n]);
	let b = (e) => {
		e?.preventDefault();
		let t = ce(i);
		if (t) return l(t);
		if (m) return l("No podemos validar tu identidad ahora: SIGDA/TAXON no responde. Inténtalo en unos minutos.");
		let n = se(te, i);
		if (!n) return l("No encontramos ese DNI entre los clientes de Aybar. Revisa el número.");
		d(n), p({
			valor: le(),
			en: Date.now(),
			intentos: 0
		}), s(""), l(null), r("codigo");
	}, x = n === "dni" ? h("form", {
		className: "pt-pila",
		onSubmit: b,
		noValidate: !0
	}, h(N.FormField, {
		label: "DNI",
		required: !0,
		error: c ?? void 0,
		helper: "El que registraste en tu contrato con Aybar."
	}, h(N.Input, {
		value: i,
		inputMode: "numeric",
		autoComplete: "off",
		maxLength: 8,
		onChange: (e) => a(e.target.value.replace(/\D/g, "").slice(0, 8))
	})), m ? h(N.Alert, {
		tone: "warning",
		size: "sm",
		title: "SIGDA/TAXON no responde"
	}, Q("Mientras tanto no se puede validar tu identidad. Lo simula «Herramientas › Simulación › fuentes caídas».")) : null, h("div", { className: "pp-acciones" }, h(N.Button, {
		type: "submit",
		variant: "primary"
	}, "Enviarme el código")), h(ke, { titulo: "Clientes de prueba" }, h("ul", null, g.map(({ c: e, por: t }) => h("li", { key: e.id }, h(N.Button, {
		size: "sm",
		variant: "secondary",
		onClick: () => {
			a(e.dni), l(null);
		}
	}, `Usar ${e.dni}`), h("span", null, `${e.nombre}: ${t}.`)))))) : h("form", {
		className: "pt-pila",
		onSubmit: (e) => {
			if (e.preventDefault(), u && f) {
				if (Date.now() - f.en > z.minutos * 6e4) return l("El código venció. Pide uno nuevo.");
				if (f.intentos >= z.intentos) return l("Agotaste los intentos. Pide un código nuevo.");
				if (o.trim() !== f.valor) {
					let e = z.intentos - f.intentos - 1;
					return p({
						...f,
						intentos: f.intentos + 1
					}), l(e > 0 ? `El código no coincide. Te ${e === 1 ? "queda 1 intento" : `quedan ${e} intentos`}.` : "El código no coincide y agotaste los intentos. Pide un código nuevo.");
				}
				t(u);
			}
		},
		noValidate: !0
	}, h("p", { className: "pt-texto" }, "Te enviamos un código de 6 dígitos a ", h("b", null, W(u.correo)), " y por SMS a ", h("b", null, G(u.telefono)), `. Vence en ${z.minutos} minutos.`), h(N.FormField, {
		label: "Código de un solo uso",
		required: !0,
		error: c ?? void 0,
		id: "pp-codigo"
	}, h(N.Input, {
		value: o,
		inputMode: "numeric",
		autoComplete: "one-time-code",
		maxLength: 6,
		onChange: (e) => s(e.target.value.replace(/\D/g, "").slice(0, 6))
	})), h("div", { className: "pp-acciones" }, h(N.Button, {
		type: "submit",
		variant: "primary"
	}, "Entrar"), h(N.Button, {
		variant: "secondary",
		onClick: () => b()
	}, "Enviarme otro código"), h(N.Button, {
		variant: "ghost",
		onClick: () => {
			r("dni"), l(null);
		}
	}, "Cambiar de DNI")), h(ke, null, h("span", null, "En el prototipo no sale ningún correo ni SMS. El código es "), h("span", { className: "pp-codigo" }, f.valor)));
	return h("div", { className: "pp-acceso" }, h(N.Card, null, h(N.CardHeader, {
		as: "h1",
		title: "Entra a Mi Portal",
		subtitle: "Registra tus solicitudes y sigue tus tickets sin llamar."
	}), h(N.CardBody, null, x, h("p", { className: "pp-etapa" }, "Entras con tu DNI y un código de un solo uso; no necesitas contraseña."))), h(P, null, `Supuesto: el código va al correo y al celular a la vez, vence a los ${z.minutos} minutos y admite ${z.intentos} intentos. Pregunta abierta del PLT-04: ¿al correo, al celular o a ambos?`));
}
var $ = (e) => `${j(C.compromiso(e))}${e.estado === "PENDING_CUSTOMER" ? " · en pausa" : ""}`;
function Ne({ datos: e, cliente: t }) {
	let n = ue(e, t.id), r = [
		{
			key: "numero",
			header: "N.º de ticket",
			width: "9rem",
			renderCell: (e) => h("button", {
				type: "button",
				tabIndex: -1,
				className: "pt-enlace-celda",
				onClick: () => Z(`portal/ticket/${e.id}`)
			}, e.numero)
		},
		{
			key: "tipo",
			header: "Tipo",
			width: "14rem",
			renderCell: (e) => h("span", { className: "pt-celda-doble" }, h("span", { className: "pt-celda-doble__principal" }, k(e.tipo)), e.subtipo ? h("span", { className: "pt-celda-doble__secundaria" }, e.subtipo) : null)
		},
		{
			key: "estado",
			header: "Estado",
			width: "13rem",
			renderCell: (e) => h(N.Badge, {
				tone: V[e.estado].tono,
				size: "sm"
			}, V[e.estado].texto)
		},
		{
			key: "area",
			header: "Área",
			renderCell: (e) => H(e.area, A)
		},
		{
			key: "compromiso",
			header: "Fecha de compromiso",
			width: "10rem",
			renderCell: (e) => $(e)
		},
		{
			key: "registrado",
			header: "Registrado",
			width: "9rem",
			renderCell: (e) => j(e.abierto)
		}
	], i = n.filter((e) => e.estado === "PENDING_CUSTOMER" || e.estado === "RESOLVED"), a = ie(ae), o = h(N.EmptyState, {
		size: "compact",
		title: "Aún no tienes tickets",
		description: "Cuando registres una solicitud, la verás aquí con su estado.",
		action: h(N.Button, {
			variant: "primary",
			onClick: () => Z("portal/nuevo")
		}, "Registrar una solicitud")
	});
	return h(g, null, h(N.PageHeader, {
		title: "Mis tickets",
		description: "Tus solicitudes a Aybar, de la más reciente a la más antigua. Toca el número para ver cómo va.",
		actions: h(N.Button, {
			variant: "primary",
			onClick: () => Z("portal/nuevo")
		}, "Nuevo ticket")
	}), i.length ? h(N.Alert, {
		tone: "warning",
		size: "sm",
		title: i.length === 1 ? "Un ticket te necesita" : `${i.length} tickets te necesitan`
	}, Q(i.map((e) => `${e.numero}: ${V[e.estado].texto.toLowerCase()}`).join(" · "))) : null, a || !n.length ? h(N.Card, null, h(N.CardBody, null, h(N.DataGrid, {
		caption: `Tickets de ${t.nombre}`,
		columns: r,
		rows: n,
		getRowId: (e) => e.id,
		emptyState: o
	}))) : h("ul", {
		className: "pt-tarjetas",
		"aria-label": `Tickets de ${t.nombre}`
	}, n.map((e) => h("li", { key: e.id }, h(N.Card, null, h(N.CardBody, { padding: "sm" }, h("div", { className: "pt-tarjeta" }, h("div", { className: "pt-tarjeta__cabeza" }, h("a", {
		className: "pt-tarjeta__numero",
		href: M(`portal/ticket/${e.id}`)
	}, e.numero), h(N.Badge, {
		tone: V[e.estado].tono,
		size: "sm"
	}, V[e.estado].texto)), h("p", { className: "pt-tarjeta__resumen" }, `${k(e.tipo)}${e.subtipo ? ` · ${e.subtipo}` : ""}`), h("p", { className: "pt-texto-chico" }, `${H(e.area, A)} · compromiso ${$(e)} · registrado ${j(e.abierto)}`))))))), h(P, null, "Se listan todos los tickets del cliente, entren por el canal que entren (teléfono, WhatsApp, correo o Mi Portal). Pregunta abierta: ¿se muestra el nombre del área o uno genérico? Aquí, el del área («Atención al cliente» para ATC)."));
}
function Pe({ datos: e, cliente: t }) {
	let n = ne(t), [r, i] = _(n.length === 1 ? n[0].id : ""), [a, o] = _(""), [s, c] = _(""), [l, u] = _(""), [d, f] = _([]), [p, m] = _(null), v = E(), y = D(v.error), b = B.find((e) => e.id === a), x = n.find((e) => e.id === r), S = x ? U(x) : null, w = () => {
		o(""), c(""), u(""), f([]), m(null), v.limpiar();
	}, T = async (e) => {
		e.preventDefault();
		let n = {
			loteId: r,
			tipo: a,
			subtipo: s,
			descripcion: l,
			adjuntos: De(d)
		}, i = await v.ejecutar(() => C.tx("registrar ticket desde Mi Portal", (e) => {
			if (!x) throw C.validacion([{
				campo: "lote",
				mensaje: "Elige el lote o contrato sobre el que consultas."
			}]);
			return be(C, e, t, x, n);
		}));
		i && (m(i), O({
			message: `Registramos tu solicitud: ${i.ticket.numero}.`,
			tone: "success"
		}));
	};
	if (p) {
		let t = e.tickets.find((e) => e.id === p.ticket.id) ?? p.ticket;
		return h(g, null, h(N.PageHeader, {
			title: "Solicitud registrada",
			breadcrumb: h(N.Breadcrumb, { items: [{
				label: "Mi Portal",
				href: M("portal")
			}, { label: "Nuevo ticket" }] })
		}), h(N.Card, null, h(N.CardBody, null, h("div", { className: "pt-registrado" }, h("p", { className: "pt-texto-chico" }, "Tu número de ticket"), h("p", {
			className: "pt-registrado__numero",
			"aria-live": "polite"
		}, t.numero), h("dl", { className: "pp-resumen" }, h("div", null, h("dt", null, "Fecha de compromiso"), h("dd", null, j(C.compromiso(t)))), h("div", null, h("dt", null, "Área"), h("dd", null, H(t.area, A))), h("div", null, h("dt", null, "Canal"), h("dd", null, t.canal))), h("p", { className: "pt-texto-chico" }, p.resultado === "asignado" ? "El flujo de tu tipo de solicitud ya lo asignó a un gestor. Te avisaremos por correo y WhatsApp en cada cambio." : "Quedó en la bandeja de atención hasta que un gestor lo tome. Te avisaremos por correo y WhatsApp en cada cambio."), h("div", { className: "pp-acciones" }, h(N.Button, {
			variant: "primary",
			onClick: () => Z(`portal/ticket/${t.id}`)
		}, "Ver mi ticket"), h(N.Button, {
			variant: "secondary",
			onClick: w
		}, "Registrar otra solicitud"))))), h(P, null, "La fecha de compromiso es el vencimiento de resolución que se congela al registrar (política SLA vigente del tipo). El flujo del tipo (HU-043) decide el área y el gestor; sin flujo, el ticket queda en la bandeja."));
	}
	return h(g, null, h(N.PageHeader, {
		title: "Nuevo ticket",
		description: "Cuéntanos qué necesitas. Te daremos un número de ticket y una fecha de compromiso.",
		breadcrumb: h(N.Breadcrumb, { items: [{
			label: "Mi Portal",
			href: M("portal")
		}, { label: "Nuevo ticket" }] })
	}), h("div", { className: "pp-rejilla" }, h(N.Card, null, h(N.CardBody, null, h("form", {
		className: "pt-pila",
		onSubmit: T,
		noValidate: !0,
		"aria-label": "Registrar una solicitud"
	}, h(N.FormField, {
		label: "¿Sobre qué lote o contrato?",
		required: !0,
		error: y.lote
	}, h(N.Select, {
		value: r,
		placeholder: "Elige uno",
		onChange: (e) => i(e.target.value),
		options: n.map((e) => ({
			value: e.id,
			label: `${e.descripcion} · contrato ${e.contrato}`
		}))
	})), h(N.RadioGroup, {
		legend: "Tipo de solicitud",
		variant: "card",
		error: y.tipo
	}, B.map((e) => h(N.Radio, {
		key: e.id,
		name: "pp-tipo",
		value: e.id,
		checked: a === e.id,
		label: e.nombre,
		helper: e.ayuda,
		onChange: () => {
			o(e.id), c("");
		}
	}))), b?.libro ? h(N.Alert, {
		tone: "warning",
		title: `${b.nombre}: se registra en el Libro de Reclamaciones`,
		live: "polite"
	}, h("div", { className: "pp-legal" }, h("p", null, "Conforme al Código de Protección y Defensa del Consumidor, Aybar cuenta con un Libro de Reclamaciones a tu disposición. Un reclamo o una queja tiene plazo legal de respuesta y se registra allí, no como ticket común."), h("p", null, "Por eso aquí no se crea un ticket. Continúa en el Libro de Reclamaciones virtual; la respuesta te llegará por el medio que indiques."), h("div", { className: "pp-acciones" }, h(N.Button, {
		variant: "secondary",
		onClick: () => O({
			message: "El Libro de Reclamaciones virtual se abre aparte, fuera de Mi Portal.",
			tone: "warning"
		})
	}, "Ir al Libro de Reclamaciones virtual")))) : null, b && !b.libro ? h(N.FormField, {
		label: "Detalle",
		required: !0,
		error: y.subtipo
	}, h(N.Select, {
		value: s,
		placeholder: "Elige el detalle",
		onChange: (e) => c(e.target.value),
		options: b.subtipos.map((e) => ({
			value: e,
			label: e
		}))
	})) : null, b && !b.libro ? h(N.FormField, {
		label: "Cuéntanos tu caso",
		required: !0,
		error: y.descripcion,
		helper: "Qué pasó, desde cuándo y qué esperas de nosotros. No escribas contraseñas ni números de tarjeta."
	}, h(N.Textarea, {
		value: l,
		onChange: (e) => u(e.target.value),
		rows: 4,
		autoResize: !0,
		maxRows: 10,
		maxLength: 2e3,
		showCounter: !0
	})) : null, b && !b.libro ? h(N.FileUpload, {
		label: "Adjunta un archivo (opcional)",
		accept: R.accept,
		multiple: !0,
		maxFiles: R.maxArchivos,
		maxSize: R.maxBytes,
		requirements: R.texto,
		files: d,
		error: y.adjuntos,
		onFilesAdd: Oe(f),
		onFileRemove: (e) => f((t) => t.filter((t) => t.id !== e))
	}) : null, v.error && !Object.keys(y).length ? h(N.ErrorAccion, {
		error: v.error,
		titulo: "No pudimos registrar tu solicitud"
	}) : null, b && !b.libro ? h("div", { className: "pp-acciones" }, h(N.Button, {
		type: "submit",
		variant: "primary",
		loading: v.enCurso
	}, "Registrar mi solicitud")) : null))), h("aside", {
		className: "pt-pila",
		"aria-label": "Tus datos"
	}, h(N.Card, null, h(N.CardHeader, {
		as: "h2",
		title: "Tus datos",
		subtitle: "Vienen de SIGDA/TAXON; no se copian a otro registro."
	}), h(N.CardBody, null, h("dl", { className: "pp-datos" }, h("dt", null, "Nombre"), h("dd", null, t.nombre), h("dt", null, "DNI"), h("dd", null, `••••${t.dni.slice(-4)}`), h("dt", null, "Correo"), h("dd", null, W(t.correo)), h("dt", null, "Celular"), h("dd", null, G(t.telefono)), h("dt", null, "Razón social"), h("dd", null, S ? C.empresa(S.empresaId)?.nombre ?? "—" : "Según el lote que elijas"), h("dt", null, "Línea"), h("dd", null, S?.linea ?? "—")), h("p", { className: "pt-texto-chico" }, "¿Algo no está bien? Dínoslo en la descripción: lo corrige Atención al cliente en el maestro."))))), h(P, null, "Supuesto: tipos y subtipos habilitados para el cliente (pregunta abierta del PLT-04)."), h(P, null, `Supuesto: adjuntos ${R.texto} En el prototipo el archivo no se sube: se guarda su nombre, tamaño y tipo.`), b?.libro ? h(P, null, "Texto del aviso legal provisional: lo valida Legal. El Libro de Reclamaciones desde Mi Portal está fuera del alcance de la HU-064.") : null, h(P, null, "La razón social y la línea de negocio salen del contrato del lote (regla fija del prototipo por proyecto); el cliente no las elige. La prioridad la pone ATC (aquí, Media)."));
}
function Fe({ datos: e, cliente: t, ticketId: n }) {
	let r = de(e, t.id, n), i = b(!1);
	if (v(() => {
		i.current || (i.current = !0, r ? C.aplicar((e) => C.evento(e, "portal_seguimiento", {
			ticket: r.numero,
			estado: r.estado
		})) : fe(C, n, t.id));
	}, [
		r,
		n,
		t.id
	]), !r) return h(g, null, h(N.ErrorState, {
		status: 404,
		scope: "page",
		title: "No encontramos ese ticket entre los tuyos",
		description: "Revisa el enlace o entra a Mis tickets. Si el enlace es de otra persona, no podemos mostrarlo.",
		actions: h(N.Button, {
			variant: "primary",
			onClick: () => Z("portal")
		}, "Ir a Mis tickets")
	}), h(P, null, "HU-065 CA-04: el intento de abrir un ticket ajeno no muestra nada (ni si existe) y queda en la bitácora de auditoría del prototipo."));
	let a = V[r.estado], o = me(e, r, A), s = ge(e, r), c = _e(e, r, t, `${location.origin}${location.pathname}${M(`portal/ticket/${r.id}`)}`), l = C.compromiso(r), u = [...s].reverse().find((e) => e.quien === "Aybar");
	return h(g, null, h(N.PageHeader, {
		title: `Ticket ${r.numero}`,
		breadcrumb: h(N.Breadcrumb, { items: [
			{
				label: "Mi Portal",
				href: M("portal")
			},
			{
				label: "Mis tickets",
				href: M("portal")
			},
			{ label: r.numero }
		] }),
		meta: h(N.Badge, { tone: a.tono }, a.texto),
		description: r.resumen
	}), h("dl", { className: "pp-resumen" }, h("div", null, h("dt", null, "Tipo"), h("dd", null, `${k(r.tipo)}${r.subtipo ? ` · ${r.subtipo}` : ""}`)), h("div", null, h("dt", null, "Área responsable"), h("dd", null, H(r.area, A))), h("div", null, h("dt", null, r.estado === "CLOSED" ? "Compromiso que tenía" : "Fecha de compromiso"), h("dd", null, r.estado === "PENDING_CUSTOMER" ? `${j(l)} · en pausa hasta tu respuesta` : j(l))), h("div", null, h("dt", null, "Registrado"), h("dd", null, j(r.abierto))), h("div", null, h("dt", null, "Empresa"), h("dd", null, C.empresa(r.empresaId)?.nombre ?? "—"))), r.estado === "PENDING_CUSTOMER" ? h(Ie, {
		ticket: r,
		cliente: t,
		pedido: u?.texto ?? null
	}) : null, r.estado === "RESOLVED" ? h(Le, {
		ticket: r,
		cliente: t,
		datos: e
	}) : null, r.estado === "CLOSED" && e.encuestas.some((e) => e.ticketId === r.id && e.ciclo === r.reaperturas) ? h(N.Alert, {
		tone: "success",
		size: "sm",
		title: "Caso cerrado"
	}, Q("Te enviamos una encuesta corta sobre la atención. Tu opinión nos ayuda a mejorar.")) : null, h("div", { className: "pp-rejilla" }, h("div", { className: "pt-pila" }, h(N.Card, null, h(N.CardHeader, {
		as: "h2",
		title: "Seguimiento",
		subtitle: "Cada paso de tu ticket, en el orden en que ocurrió."
	}), h(N.CardBody, null, h("ol", {
		className: "ay-timeline ay-timeline--vertical",
		"aria-label": "Línea de tiempo del ticket"
	}, o.map((e, t) => h("li", {
		key: e.id,
		className: "ay-timeline__event",
		"aria-current": t === o.length - 1 ? "step" : void 0
	}, h("span", {
		className: `ay-timeline__dot ay-timeline__dot--${e.tono}`,
		"aria-hidden": "true"
	}), h("div", { className: "ay-timeline__body" }, h("p", { className: "ay-timeline__title" }, h("strong", null, e.titulo)), h("time", {
		className: "ay-timeline__time",
		dateTime: e.fecha.toISOString()
	}, j(e.fecha)), h("p", { className: "pp-paso__area" }, `Área responsable: ${e.area}${t === o.length - 1 && r.estado !== "CLOSED" ? ` · compromiso: ${$(r)}` : ""}`), e.detalle ? h("p", { className: "pp-paso__det" }, e.detalle) : null)))))), h(N.Card, null, h(N.CardHeader, {
		as: "h2",
		title: "Mensajes",
		subtitle: "Lo que nos escribimos sobre este ticket."
	}), h(N.CardBody, null, s.length ? h("ol", {
		className: "pp-msgs",
		"aria-label": "Mensajes del ticket"
	}, s.map((e) => h("li", {
		key: e.id,
		className: "pp-msg",
		"data-quien": e.quien === "Tú" ? "cliente" : "aybar"
	}, h("div", { className: "pp-msg__cab" }, h("b", null, e.quien === "Tú" ? "Tú escribiste" : "Aybar respondió"), h("time", { dateTime: e.fecha.toISOString() }, j(e.fecha))), h("p", null, e.texto), e.adjuntos.length ? h("ul", {
		className: "pp-adjuntos",
		"aria-label": "Archivos adjuntos"
	}, e.adjuntos.map((e) => h(N.FileItem, {
		key: e.nombre,
		name: e.nombre,
		size: e.tamano,
		type: e.tipo,
		status: "ready"
	}))) : null))) : h(N.EmptyState, {
		size: "compact",
		title: "Aún sin mensajes",
		description: "Te avisaremos cuando te escribamos."
	})))), h("aside", {
		className: "pt-pila",
		"aria-label": "Avisos del ticket"
	}, h(N.Card, null, h(N.CardHeader, {
		as: "h2",
		title: "Avisos que te enviamos",
		subtitle: "Por correo y WhatsApp, en cada cambio de estado."
	}), h(N.CardBody, null, c.length ? h("ul", { className: "pp-avisos" }, c.map((e) => h("li", { key: e.id }, h("b", null, e.estado), h("span", null, e.texto), h("small", null, `${j(e.fecha)} · ${e.canales.join(" y ")} · ${e.destino} · con enlace al ticket`)))) : h("p", { className: "pt-texto-chico" }, "Todavía no cambió de estado."))))), h(P, null, "HU-065 CA-03: no se muestran las notas internas, las notas de la bitácora escritas por ATC ni el nombre del gestor; del lado de Aybar se firma «Aybar»."), h(P, null, "HU-065 CA-02 (simulado): los avisos por correo y WhatsApp se derivan de la bitácora de estados; el envío real lo hace el servicio de notificaciones."), h(P, null, "HU-066 CA-01: mientras el ticket espera tu respuesta, el plazo (SLA) queda en pausa; al responder, el ticket vuelve a atención, el plazo se reanuda y la fecha de compromiso se corre las horas hábiles que duró la espera."));
}
function Ie({ ticket: e, cliente: t, pedido: n }) {
	let [r, i] = _(""), [a, o] = _([]), s = E(), c = D(s.error);
	return h(N.Card, null, h(N.CardHeader, {
		as: "h2",
		title: "Te necesitamos",
		subtitle: "Responde lo que te pedimos para seguir con tu caso."
	}), h(N.CardBody, null, h("form", {
		className: "pt-pila",
		onSubmit: async (n) => {
			n.preventDefault(), await s.ejecutar(async () => (await C.tx("responder desde Mi Portal", (n) => xe(C, n, e.id, t.id, r, De(a))), !0)) && (i(""), o([]), O({
				message: "Enviamos tu respuesta. Tu ticket volvió a atención y el plazo se reanudó.",
				tone: "success"
			}));
		},
		noValidate: !0,
		"aria-label": "Responder al gestor"
	}, n ? h("blockquote", { className: "pp-msg" }, h("div", { className: "pp-msg__cab" }, h("b", null, "Lo que te pedimos")), h("p", null, n)) : null, h(N.FormField, {
		label: "Tu respuesta",
		required: !0,
		error: c.respuesta
	}, h(N.Textarea, {
		value: r,
		onChange: (e) => i(e.target.value),
		rows: 3,
		autoResize: !0,
		maxRows: 8,
		maxLength: 2e3,
		showCounter: !0
	})), h(N.FileUpload, {
		label: "Adjunta el documento pedido (opcional)",
		accept: R.accept,
		multiple: !0,
		maxFiles: R.maxArchivos,
		maxSize: R.maxBytes,
		requirements: R.texto,
		files: a,
		error: c.adjuntos,
		onFilesAdd: Oe(o),
		onFileRemove: (e) => o((t) => t.filter((t) => t.id !== e))
	}), s.error && !Object.keys(c).length ? h(N.ErrorAccion, {
		error: s.error,
		titulo: "No pudimos enviar tu respuesta"
	}) : null, h("div", { className: "pp-acciones" }, h(N.Button, {
		type: "submit",
		variant: "primary",
		loading: s.enCurso
	}, "Enviar mi respuesta")))));
}
function Le({ ticket: e, cliente: t, datos: n }) {
	let [r, i] = _(!1), [a, o] = _(""), s = E(), c = D(s.error), l = we(C, e, n), u = oe(C, n), d = async (e, t, n) => {
		await s.ejecutar(async () => (await C.tx(e, t), !0)) && O({
			message: n,
			tone: "success"
		});
	};
	return h(N.Card, null, h(N.CardHeader, {
		as: "h2",
		title: "¿Se solucionó tu caso?",
		subtitle: "Confírmalo para cerrar el ticket, o recházalo si no estás conforme."
	}), h(N.CardBody, null, h("div", { className: "pt-pila" }, r ? h("form", {
		className: "pt-pila",
		noValidate: !0,
		"aria-label": "Rechazar la solución",
		onSubmit: (n) => {
			n.preventDefault(), d("rechazar la solución en Mi Portal", (n) => Ce(C, n, e.id, t.id, a), "Reabrimos tu ticket con tu motivo. Lo revisa el área que lo atendió.");
		}
	}, h(N.FormField, {
		label: "¿Por qué no estás conforme?",
		required: !0,
		error: c.motivo,
		helper: "Queda en la bitácora del ticket y lo lee el área que lo atendió."
	}, h(N.Textarea, {
		value: a,
		onChange: (e) => o(e.target.value),
		rows: 3,
		autoResize: !0,
		maxLength: 500,
		showCounter: !0
	})), s.error && !Object.keys(c).length ? h(N.ErrorAccion, {
		error: s.error,
		titulo: "No pudimos reabrir tu ticket"
	}) : null, h("div", { className: "pp-acciones" }, h(N.Button, {
		type: "submit",
		variant: "danger",
		loading: s.enCurso
	}, "Rechazar la solución"), h(N.Button, {
		variant: "ghost",
		onClick: () => {
			i(!1), s.limpiar();
		}
	}, "Volver"))) : h(g, null, s.error ? h(N.ErrorAccion, {
		error: s.error,
		titulo: "No pudimos cerrar tu ticket"
	}) : null, h("div", { className: "pp-acciones" }, h(N.Button, {
		variant: "primary",
		loading: s.enCurso,
		onClick: () => void d("confirmar la solución en Mi Portal", (n) => Se(C, n, e.id, t.id), "Gracias: cerramos tu ticket. Te enviamos una encuesta corta.")
	}, "Sí, confirmar y cerrar"), h(N.Button, {
		variant: "secondary",
		onClick: () => {
			i(!0), s.limpiar();
		}
	}, "No, rechazar la solución"))), l ? h("p", { className: "pt-texto-chico" }, `Si no respondes, el ticket se cierra solo al terminar el ${re(l)} (${u} días hábiles después de resuelto) y te avisamos.`) : null)), h(P, null, `HU-066 CA-04: el cierre automático lo hace el job del sistema al terminar el plazo; para verlo, Herramientas › Simulación › avanza el reloj o «Ejecutar el job ahora». Los días hábiles (hoy ${u}) los configura el administrador funcional en Configuración › Cierre automático; el valor inicial, 5, es un supuesto del equipo (pregunta abierta del PLT-04).`));
}
//#endregion
export { Ae as MiPortal };
