/**
 * Los datos sintéticos de la galería son deterministas y no son de nadie; y la lógica que
 * los usa —formatos, validación de las maquetas de ingreso, administración y «Copiar
 * configuración»— hace lo que dice.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './demo-soporte.ts';

const datos = await import('../src/app/demo/datos/index.ts');
const formato = await import('../src/app/demo/formato.ts');
const validacion = await import('../src/app/demo/ingreso/validacion.ts');
const logica = await import('../src/app/demo/admin/logica.ts');
const configuracion = await import('../src/app/demo/configuracion.ts');

test('datos · las mismas personas, lotes y eventos en cada carga', async () => {
  // Otra instancia del módulo (la consulta la hace distinta): se generan de nuevo.
  const personas = await import('../src/app/demo/datos/personas.ts?otra-carga');
  const lotes = await import('../src/app/demo/datos/lotes.ts?otra-carga');
  const auditoria = await import('../src/app/demo/datos/auditoria.ts?otra-carga');
  assert.notEqual(personas.PERSONAS, datos.PERSONAS, 'es otra instancia');
  assert.deepEqual(personas.PERSONAS, datos.PERSONAS);
  assert.deepEqual(lotes.LOTES, datos.LOTES);
  assert.deepEqual(auditoria.AUDITORIA, datos.AUDITORIA);
  assert.deepEqual(datos.copiaDePersonas(), datos.copiaDePersonas());
  const a = datos.crearAzar(7);
  const b = datos.crearAzar(7);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});

test('datos · sintéticos: correos .test, IP de documentación, códigos DEMO', () => {
  assert.equal(datos.PERSONAS.length, datos.TOTAL_PERSONAS);
  assert.equal(new Set(datos.PERSONAS.map((p) => p.id)).size, datos.PERSONAS.length);
  assert.ok(datos.PERSONAS.every((p) => p.correo.endsWith('@ejemplo.test')));
  assert.ok(datos.PERSONAS.every((p) => p.telefono.startsWith('+51 900 000 ')));
  assert.ok(datos.AUDITORIA.every((e) => e.ip.startsWith('192.0.2.')));
  assert.ok(datos.SESIONES.every((s) => s.ip.startsWith('198.51.100.')));
  assert.ok(datos.CODIGOS_RECUPERACION.every((c) => /^DEMO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)));
  assert.equal(datos.LOTES.length, datos.MANZANAS.length * datos.LOTES_POR_MANZANA);
  const resumen = datos.resumenLotes();
  assert.equal(Object.values(resumen).reduce((s, n) => s + n, 0), datos.LOTES.length);
  assert.ok(Object.isFrozen(datos.PERSONAS) && Object.isFrozen(datos.PERSONAS[0]));
});

test('formato · relativo al «hoy» fijo de los datos', () => {
  const hoy = datos.HOY;
  assert.equal(formato.haceTiempo(hoy.toISOString(), hoy), 'ahora mismo');
  assert.equal(formato.haceTiempo(datos.haceMinutos(5), hoy), 'hace 5 minutos');
  assert.equal(formato.haceTiempo(datos.haceMinutos(60 * 24), hoy), 'ayer');
  assert.equal(formato.haceTiempo(datos.haceMinutos(60 * 24 * 21), hoy), 'hace 3 semanas');
  assert.equal(formato.contar(1, 'persona', 'personas'), '1 persona');
  assert.equal(formato.contar(12000, 'lote', 'lotes'), '12,000 lotes');
  assert.equal(formato.porcentaje(1, 3), 33);
  assert.equal(formato.porcentaje(1, 0), 0);
  assert.equal(datos.formatoSoles(127300), 'S/ 127,300');
});

test('ingreso · validación por campo, como en las maquetas', () => {
  assert.equal(validacion.errorDeCorreo(''), 'Escribe tu correo.');
  assert.match(validacion.errorDeCorreo('ana@') ?? '', /correo completo/);
  assert.equal(validacion.errorDeCorreo(' ana.rojas@ejemplo.test '), undefined);
  assert.equal(validacion.errorDeCelular('987 654 321'), undefined);
  assert.match(validacion.errorDeCelular('87654321') ?? '', /nueve cifras/);
  assert.equal(validacion.errorDeCodigo('123'), 'El código tiene 6 cifras.');
  assert.equal(validacion.errorDeCodigoRecuperacion('demo-4kq7-m2xa'), undefined, 'sin distinguir mayúsculas');
  assert.match(validacion.errorDeCodigoRecuperacion('1234') ?? '', /DEMO-XXXX-XXXX/);
  assert.ok(validacion.requisitosDeClave('').every((r) => !r.cumplido));
  assert.ok(validacion.requisitosDeClave('Lotes#2026-Aybar').every((r) => r.cumplido));
  assert.deepEqual(validacion.fortalezaDeClave('Lotes#2026-Aybar'), { puntos: 4, etiqueta: 'fuerte' });
  assert.equal(validacion.fortalezaDeClave('Lotes#2026').puntos, 3, 'sin 12 caracteres no llega a fuerte');
  assert.equal(validacion.errorDeConfirmacion('a', 'b'), 'Las dos contraseñas no coinciden.');
  assert.equal(validacion.minutosYSegundos(905), '15:05');
});

test('administración · filtros, lote, alta y auditoría sobre copias', () => {
  const personas = datos.copiaDePersonas();
  const ventas = logica.filtrarPersonas(personas, { ...logica.SIN_FILTROS, areas: ['Ventas'] });
  assert.ok(ventas.length > 0 && ventas.every((p) => p.area === 'Ventas'));
  const primera = personas[0]!;
  const buscada = logica.filtrarPersonas(personas, { ...logica.SIN_FILTROS, consulta: primera.nombre.toUpperCase() });
  assert.ok(buscada.some((p) => p.id === primera.id), 'sin mayúsculas ni espacios');
  assert.equal(logica.filtrosAplicados({ consulta: 'x', areas: ['A'], roles: [], estados: ['activo', 'invitado'] }), 4);

  const activa = personas.find((p) => p.estado === 'activo')!;
  const invitada = personas.find((p) => p.estado === 'invitado')!;
  const suspendidas = logica.suspender(personas, new Set([activa.id, invitada.id]));
  assert.equal(suspendidas.find((p) => p.id === activa.id)?.estado, 'suspendido');
  assert.equal(suspendidas.find((p) => p.id === invitada.id)?.estado, 'invitado', 'una invitada no se suspende');
  assert.equal(logica.reactivar(suspendidas, new Set([activa.id])).find((p) => p.id === activa.id)?.estado, 'activo');
  const conRol = logica.asignarRol(personas, new Set([activa.id]), 'LEGAL');
  assert.equal(conRol.find((p) => p.id === activa.id)?.roles.filter((r) => r === 'LEGAL').length, 1);
  assert.equal(logica.asignarRol(conRol, new Set([activa.id]), 'LEGAL').find((p) => p.id === activa.id)?.roles.filter((r) => r === 'LEGAL').length, 1, 'sin repetir');
  assert.equal(datos.PERSONAS.find((p) => p.id === activa.id)?.estado, 'activo', 'los datos compartidos no cambian');

  const alta = { nombre: 'Nadia Pérez', correo: 'nadia.perez@ejemplo.test', area: 'Legal', roles: ['LEGAL'] };
  assert.deepEqual(logica.validarAlta(alta, personas), {});
  assert.ok(logica.validarAlta({ ...alta, correo: primera.correo }, personas).correo);
  assert.ok(logica.validarAlta({ nombre: '', correo: '', area: '', roles: [] }, personas).area);
  const nueva = logica.crearPersona(alta, personas);
  assert.equal(nueva.id, 'u-065');
  assert.deepEqual(nueva.roles, ['USER', 'LEGAL']);
  assert.equal(nueva.estado, 'invitado');

  const criticos = logica.filtrarAuditoria(datos.AUDITORIA, { desde: null, hasta: null, gravedades: ['critico'], actor: null });
  assert.ok(criticos.length > 0 && criticos.every((e) => e.gravedad === 'critico'));
  const dia = new Date(datos.AUDITORIA[0]!.fecha);
  const delDia = logica.filtrarAuditoria(datos.AUDITORIA, { desde: dia, hasta: dia, gravedades: [], actor: null });
  assert.ok(delDia.length >= 1 && delDia.every((e) => new Date(e.fecha).toDateString() === dia.toDateString()));
});

test('personalización · «Copiar configuración» como HTML y como JSON', () => {
  const atributos = [
    { atributo: 'data-theme', eje: 'theme', valor: 'dark' },
    { atributo: 'data-palette', eje: 'palette', valor: 'oceano' },
  ];
  assert.equal(configuracion.fragmentoHtml(atributos), '<html lang="es" data-theme="dark" data-palette="oceano">');
  assert.deepEqual(JSON.parse(configuracion.comoJson(atributos)), { theme: 'dark', palette: 'oceano' });
  assert.equal(configuracion.fragmentoHtml([{ atributo: 'data-x', eje: 'x', valor: '"><b>' }]), '<html lang="es" data-x="&quot;&gt;&lt;b&gt;">');
  assert.match(configuracion.textoParaCopiar([]), /Apariencia por defecto/);
  assert.match(configuracion.textoParaCopiar(atributos), /setPreference/);
});
