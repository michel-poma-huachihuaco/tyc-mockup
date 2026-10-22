# Matriz de implementación: cambios de la reunión (prototipo)

Rama `prototipo-polar`, 22-10-2026. Fuente: `cambios_reunion_plan_implementacion_ia.md`.
Todo es **prototipo con datos simulados**: no hay integración real con backend en ningún requisito.
Ejecución: 7 agentes (Sonnet 5.5) con ficheros disjuntos; orquestación, integración y verificación: Opus 5.5.

## Verificación global

| Comprobación | Resultado |
| --- | --- |
| `npx ng build` | OK (bundle generado) |
| `npx ngc --noEmit -p tsconfig.app.json` | OK, sin errores de plantilla |
| `npm run lint` | 11 avisos, los mismos 11 que en `HEAD` (ninguno nuevo) |
| `npm test` | 74/74 |
| Pruebas nuevas (`pruebas/{busqueda-fonetica,contexto-morosidad,favoritos-atc,indicadores-monitor,movimientos-relaciones}.test.ts`) | 15/15 |
| Humo en navegador (`ng serve`, perfil gestor) | Vista 360: «Kispe» lista los 2 Quispe sin autoseleccionar; panel de movimientos «4 de 5». Monitor abre y se actualiza solo. Consola del navegador sin errores ni avisos |

## Por requisito

| ID | Estado final | Cambio y evidencia | Verificación | Dependencia o decisión pendiente |
| --- | --- | --- | --- | --- |
| V360-01 | Implementado (simulado) | Panel «Últimos movimientos» junto al grafo (`vista-c360.ts`), máx. 5, más reciente primero, tipo + estado con texto, vacío y «solo hay N». Datos en `datos-movimientos.ts` (tickets del demo + pagos/cuotas/contactos simulados) | `movimientos-relaciones.test.ts`; humo | Contrato de datos real. Ningún cliente demo tiene 0 movimientos (el vacío existe pero no se ve) |
| GRA-01 | Implementado | Posiciones ya estables (índice en `NODOS_360`). Nuevo estado «Disponible, sin registros» distinto de «No disponible» (`grafo360.ts`, `vista-c360.ts`, leyenda y modo 2D). Nodos restringidos con acciones deshabilitadas | ngc; humo (leyenda) | Ninguna |
| GRA-02 | Implementado (simulado) | Ficha de nodo con lote/cliente; saldo e interés moratorio solo si el nodo `saldo` lo trae («No informado por la fuente» si no). «Nueva gestión» precarga cliente, DNI enmascarado y proyecto·lote en Nuevo ticket (`consola-atc.ts` `contextoNuevoTicket`, `vista-operacion.ts` input `contexto`). Accesos muertos corregidos (contrato vacío) | ngc, build | El interés de algunos clientes solo está en `ecta` (restringido) |
| GRA-03 | Implementado | `relaciones-360.ts`: nodos y relaciones con id, tipo y origen explícito; resaltado en 3D y 2D al seleccionar, se limpia al cerrar. Áreas solo desde tickets reales del cliente y dentro del catálogo | `movimientos-relaciones.test.ts` | Sin mapeo explícito de áreas para nodos que no son tickets/libro. Las áreas salen de los tickets del demo, no de los creados en sesión |
| GRA-04 | Bloqueado (parte independiente hecha) | `config-grafo-360.ts` (`CATALOGO_GRAFO_360`, `validado: false`) separa el catálogo del renderizado | Prueba de áreas fuera de catálogo | **Catálogo de 2 empresas y 12 áreas + menús.** Hoy: código 11 empresas / 6 áreas; HU-ATC-067 8 áreas «por ejemplo». Ninguna fuente coincide |
| BUS-01 | Implementado (simulado) | `busqueda-fonetica.ts`: clave fonética del español; exactas primero, fonéticas después; con dígitos solo exactas. Cableado en `vista-c360.ts`: solo entra solo con un candidato inequívoco (antes autoseleccionaba el primero) | `busqueda-fonetica.test.ts` (Alvan→Alban/Halban, 15 pares negativos); 10.000 registros: 6,8 ms con índice, 32,9 ms sin índice (máquina dev, sin SLA) | En producción la fonética iría en servidor con clave indexada. Las filas fonéticas aún no llevan etiqueta «similar» en la tabla |
| UI-01 | Bloqueado | Sin cambios | — | **Recursos oficiales de Tigo Aybar** (no hay ninguno en el repo). Además, el bot actual se anuncia como «Asistente de IA» pero responde con reglas locales (`three/bot.ts`); hay que matizar ese texto |
| OPE-01 | Parcial (simulado) | Botón «Monitor» en Operación en Vivo → `monitor-vivo.ts`: pantalla completa, refresco automático, ingresados/resueltos del día, abiertos por área, promedios, atendidos por persona vs promedio (flecha neutra), «actualizado hace X» y aviso de datos desactualizados. Alimentado por los tickets vivos de la consola | `indicadores-monitor.test.ts`; humo | **Decisiones:** intervalo (provisional 5 s), definición de promedios (provisional: horas corridas), zona horaria del corte (provisional: hora local), periodo de comparación, umbrales de color (no hay) |
| TIC-01 | Ya existente + brecha cerrada | Bandeja con fuente única y filtros por área/estado/tipo; Libro (QUE/REC) y garantías (GAR) ya estaban. Aviso de datos simulados y reglas de distribución pendientes | ngc | Reglas de distribución por área |
| TIC-02 | Implementado (simulado) | Detalle con N.º, canal, área/sala, responsable, SLA (1.ª respuesta y resolución) y «Recorrido del workflow» con responsable por actividad. Rayo confirmado como marca visual sin escalado automático. Nuevo estado `IN_COMMITTEE` «Elevado a comité» (`datos-atc.ts`): botón «Elevar a comité» solo desde `ESCALATED` (cadena sin saltos de `docs/datos/estados.md`), con hito y nota de sistema; ticket demo ALT-001188 ya en comité | ngc, build; humo (ALT-001204 Escalado → Elevado a comité) | El modelo no registra la actividad en curso del flujo. No existe orquestador de asignación por capacidad (solo botón simulado). `vista-vivo.ts` tiene su propio modelo de estados simulado y no muestra el comité |
| MOR-01 | Implementado como consulta (simulado) | `contexto-morosidad.ts` (`cuotas > 3` literal) + tarjeta en el expediente de morosidad (`vista-especializada.ts`) con aviso de regla pendiente; sin disolución ni acción contractual | `contexto-morosidad.test.ts` (3 no cumple, 4 cumple) | **Validación Legal (P-01 de FT-ATC-22).** Tres versiones en conflicto: «3 meses» (HU-056), «3 cuotas» (diccionario), «más de tres cuotas» (reunión). Etapa de negociación con Iver sin datos. Textos «3 cuotas / 3 meses» siguen en `datos-atc.ts` y `consola-atc.ts` |
| FAV-01 | Implementado (opción reversible) | `favoritos-atc.ts` + botón «Añadir/Quitar de favoritos» (corazón, `aria-pressed`) sobre el contenido; grupo «Favoritos» arriba del sidebar en cuanto la persona marca uno, con sus iconos, el más reciente primero, sin límite. Por `personaId`, localStorage con try/catch | `favoritos-atc.test.ts`; humo (Bandeja marcada aparece en el sidebar) | Límite, orden y persistencia sin cerrar. Solo marca la opción abierta: corazón por ítem requiere ampliar `AySidebar` del design system |
| EVA-01 | Evaluado | Three.js en grafo 360, Vivo y bot; 2D solo en Vista 360; sin fallback visible sin WebGL. `escena-astra-3d.ts` y `escena-oficina-3d.ts` parecen huérfanos | — | Recomendación: mantener Three.js; medir tamaño del chunk y FPS; confirmar y borrar los huérfanos |
| EVA-02 | Evaluado | Radios fijos por tipo de nodo (`grafo360.ts`) | — | Segunda fase: definir métrica (qué eventos, ventana, escala log/raíz) |
| EVA-03 | Resuelto con BUS-01 | Clave fonética, sin embeddings | Ver BUS-01 | — |
| EVA-04 | Sin requisito | No se deriva nada de «convolución de una red neuronal» | — | — |
| EVA-05 | Evaluado | No hay manifest, service worker ni `@angular/service-worker` | — | No hacer nada hasta concretar alcance |
