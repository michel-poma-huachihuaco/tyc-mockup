# Estándar de filtros de tabla

Aplica a toda tabla de `frontend/` que se pueda buscar o filtrar. Está implementado en tres piezas de
`src/app/pantallas/atc/`:

| Pieza | Para qué |
|---|---|
| `filtros-tabla.ts` | `crearFiltrosTabla()`: declara los filtros y devuelve las filas filtradas, las opciones con recuento facetado, «hay filtros» y `limpiar()`. Guarda el estado por tabla durante la sesión. |
| `barra-filtros.ts` | `<app-barra-filtros>`: la barra (buscador, filtros, «Más filtros», chip global, «Limpiar filtros», recuento). |
| `vacio-filtros.ts` | `<app-vacio-filtros ayVacio>`: estado vacío con «Limpiar filtros». |

## Reglas

1. **Anatomía única:** `[buscador] [filtros] [acciones] … [recuento]` dentro de `ay-table-toolbar`, todo en tamaño `sm` (32 px). La barra es una caja cerrada (`.ay-toolbar`, en `styles.css`).
2. **Widget según el dato**
   - Texto → buscador (`textoDe`, debounce 250 ms).
   - Vista rápida excluyente de 2 a 5 opciones → `tipo: 'segmento'`.
   - Atributo categórico → `tipo: 'multi'` (por defecto) o `'single'` si de verdad es excluyente.
   - Sí/no → `tipo: 'boolean'` («Solo …»).
   - `ay-tabs` y `ay-select` nunca filtran: las tabs separan secciones con datos distintos.
3. **Semántica:** AND entre filtros distintos y con la búsqueda; OR dentro de un filtro `multi`; cada `boolean` es una sola condición.
4. **Límite en línea:** hasta 6 controles; con más, los 4 primeros y «Más filtros» (se abre solo si un filtro oculto tiene valor, y cuenta los activos).
5. **Feedback:** el valor aplicado se ve en el disparador (`Estado: 2`); «Limpiar filtros» está siempre y se deshabilita sin filtros (el layout no salta); el recuento es «N tickets» sin filtrar y «N de M tickets» filtrado.
6. **Filtro global:** la razón social (panel de Simulación) se ve como chip en cada tabla alimentada por `ticketsVisibles` (`[conFiltroEmpresa]="true"`).
7. **Estado vacío obligatorio:** `app-vacio-filtros`; con filtros dice «Sin resultados» y ofrece limpiarlos.
8. **Conteos facetados:** cada opción cuenta las filas que quedarían dadas las demás condiciones. Se pueden cruzar con 0.
9. **Paginación:** si la tabla tiene más de 10 filas se pagina (10/20/50) y cualquier cambio de búsqueda o filtro vuelve a la página 1 (`filtros.huella()`).
10. **Estado:** se conserva por tabla (`clave`) al cambiar de vista; se pierde al recargar la página.
11. **Movimiento:** sin animar filas; el recuento lo anuncia la live region de `ay-table-toolbar`; sin filtros asíncronos hoy (si los hay, usar `cargando`).

## Cómo usarlo

```ts
readonly filtros = crearFiltrosTabla(
  this.filas, // Signal<readonly T[]>
  {
    clave: 'mi-tabla',
    etiquetaElemento: 'tickets',
    textoDe: (t) => `${t.num} ${t.cli}`,        // sin textoDe no hay buscador
    filtros: [
      { id: 'estado', etiqueta: 'Estado', tipo: 'multi', valorDe: (t) => t.state },
      { id: 'rayo', etiqueta: 'Solo prioridad Rayo', tipo: 'boolean', valorDe: (t) => t.rayo },
    ],
  },
  inject(EstadoFiltrosTablas),
);
```

```html
<app-barra-filtros [filtros]="filtros" />
<ay-table [filas]="filtros.filtradas()" …>
  <app-vacio-filtros ayVacio [filtros]="filtros" elemento="ticket" />
</ay-table>
```

## Umbral para tablas nuevas

Una tabla con más de 10 filas posibles o con atributos categóricos lleva barra de filtros. Las pequeñas
(menos de 10 filas) no la necesitan.

## Tablas que ya lo cumplen

Bandeja de tickets, Tu día (acciones de hoy), Cierre end-to-end y Catálogo de HUs.
