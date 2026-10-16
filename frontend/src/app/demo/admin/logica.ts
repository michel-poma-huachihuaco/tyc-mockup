/**
 * La administración de la galería sin Angular: filtrar personas, las acciones en lote, el
 * alta y los resúmenes que pintan Resumen, Usuarios y Auditoría. Trabaja sobre copias: los
 * datos compartidos (datos/) están congelados. Lo prueba `npm test`.
 */
import type { EventoAuditoria, Gravedad } from '../datos/auditoria';
import type { Area, EstadoPersona, Persona } from '../datos/personas';
import { HOY, sinTildes } from '../datos/semilla';

export interface FiltrosPersonas {
  readonly consulta: string;
  readonly areas: readonly string[];
  readonly roles: readonly string[];
  readonly estados: readonly string[];
}

export const SIN_FILTROS: FiltrosPersonas = { consulta: '', areas: [], roles: [], estados: [] };

const normalizar = (texto: string) => sinTildes(texto).replace(/\s+/g, '');

/** Por nombre, correo o teléfono, sin tildes; y por área, rol y estado (vacío: todos). */
export function filtrarPersonas(personas: readonly Persona[], filtros: FiltrosPersonas): Persona[] {
  const q = normalizar(filtros.consulta);
  return personas.filter(
    (p) =>
      (!q || normalizar(`${p.nombre}${p.correo}${p.telefono}`).includes(q)) &&
      (filtros.areas.length === 0 || filtros.areas.includes(p.area)) &&
      (filtros.roles.length === 0 || p.roles.some((r) => filtros.roles.includes(r))) &&
      (filtros.estados.length === 0 || filtros.estados.includes(p.estado)),
  );
}

/** Cuántos filtros hay puestos (la consulta cuenta como uno). */
export function filtrosAplicados(filtros: FiltrosPersonas): number {
  return (filtros.consulta.trim() ? 1 : 0) + filtros.areas.length + filtros.roles.length + filtros.estados.length;
}

/** Suspende a las personas elegidas; las invitadas no tienen cuenta que suspender. */
export function suspender(personas: readonly Persona[], ids: ReadonlySet<string>): Persona[] {
  return personas.map((p) => (ids.has(p.id) && p.estado === 'activo' ? { ...p, estado: 'suspendido' as EstadoPersona } : p));
}

export function reactivar(personas: readonly Persona[], ids: ReadonlySet<string>): Persona[] {
  return personas.map((p) => (ids.has(p.id) && p.estado === 'suspendido' ? { ...p, estado: 'activo' as EstadoPersona } : p));
}

/** Suma un rol a las elegidas (sin repetirlo). */
export function asignarRol(personas: readonly Persona[], ids: ReadonlySet<string>, rol: string): Persona[] {
  return personas.map((p) => (ids.has(p.id) && !p.roles.includes(rol) ? { ...p, roles: [...p.roles, rol] } : p));
}

export interface AltaPersona {
  readonly nombre: string;
  readonly correo: string;
  readonly area: string;
  readonly roles: readonly string[];
}

export type ErroresAlta = Partial<Record<keyof AltaPersona, string>>;

/** Lo que falta o no vale en el alta; el correo no puede repetirse. */
export function validarAlta(datos: AltaPersona, existentes: readonly Persona[]): ErroresAlta {
  const errores: ErroresAlta = {};
  if (datos.nombre.trim().length < 2) errores.nombre = 'Escribe el nombre y el apellido.';
  const correo = datos.correo.trim().toLowerCase();
  if (!correo) errores.correo = 'Escribe el correo.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = 'Escribe un correo completo, por ejemplo nombre@ejemplo.test.';
  else if (existentes.some((p) => p.correo === correo)) errores.correo = 'Ya hay una persona con ese correo.';
  if (!datos.area) errores.area = 'Elige un área.';
  return errores;
}

/** La persona nueva: invitada, con USER y los roles elegidos, con el siguiente id libre. */
export function crearPersona(datos: AltaPersona, existentes: readonly Persona[], ahora: Date = HOY): Persona {
  const mayor = existentes.reduce((m, p) => Math.max(m, Number(p.id.slice(2)) || 0), 0);
  return {
    id: `u-${String(mayor + 1).padStart(3, '0')}`,
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim().toLowerCase(),
    telefono: '',
    area: datos.area as Area,
    roles: ['USER', ...datos.roles.filter((r) => r !== 'USER')],
    estado: 'invitado',
    ultimoAcceso: null,
    creada: ahora.toISOString(),
    dobleFactor: false,
  };
}

/** Cuántas hay por cada valor de una clave, en el orden de `valores`. */
export function recuentoPor<T extends string>(personas: readonly Persona[], clave: 'area' | 'estado', valores: readonly T[]): Record<T, number> {
  const recuento = Object.fromEntries(valores.map((v) => [v, 0])) as Record<T, number>;
  for (const p of personas) {
    const valor = p[clave] as T;
    if (valor in recuento) recuento[valor]++;
  }
  return recuento;
}

export interface FiltrosAuditoria {
  readonly desde: Date | null;
  readonly hasta: Date | null;
  readonly gravedades: readonly Gravedad[];
  readonly actor: string | null;
}

/** Eventos dentro del intervalo (días completos), de las gravedades elegidas y del actor. */
export function filtrarAuditoria(eventos: readonly EventoAuditoria[], filtros: FiltrosAuditoria): EventoAuditoria[] {
  const desde = filtros.desde ? inicioDelDia(filtros.desde).getTime() : -Infinity;
  const hasta = filtros.hasta ? finDelDia(filtros.hasta).getTime() : Infinity;
  return eventos.filter((e) => {
    const t = new Date(e.fecha).getTime();
    return (
      t >= desde &&
      t <= hasta &&
      (filtros.gravedades.length === 0 || filtros.gravedades.includes(e.gravedad)) &&
      (!filtros.actor || e.actor === filtros.actor)
    );
  });
}

function inicioDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function finDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
