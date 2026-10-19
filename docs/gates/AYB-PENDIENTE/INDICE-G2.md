---
id: "GATE-AYB-PENDIENTE-INDICE-G2"
tipo: gate
titulo: "Indice del envio de G2 Design Gate - Aybar Atiende, prototipo completo (olas 1 a 8)"
estado: draft
producto: "Aybar Atiende (tyc)"
version: "0.1"
owner: "[UX que envia]"
aprobadores: []
fecha: "2026-10-15"
tags: [gate, g2, indice, prototipo]
---

# Indice del envio de G2 · prototipo completo

Borrador preparado con IA. **Ningun gate esta aprobado**: aprueban PO + UX por PR. Este
indice solo ordena los ocho envios por ola; la matriz HU → CA → pantalla → verificacion de
cada HU esta en el envio de su ola.

Prototipo: https://claude.ai/artifact/JT6hHSrYE15EMuKgPa2fMD (version 8, privado) · repo:
`frontend/prototipo.html` (solo en desarrollo) · build aparte: `npm run prototipo:build`.
Figma queda **sustituido por el prototipo funcional** (decision del equipo).

## Cobertura: las 60 HU del paquete

| Ola | Epicas | HU | Envio |
|---|---|---|---|
| 1 | EP-ATC-01 y 02 | 001 a 011, 029 | `G2.md` (en esta carpeta) |
| 2 | EP-ATC-03 Libro de Reclamaciones | 012 a 016 | `../AYB-PENDIENTE-EP03/G2.md` |
| 3 | EP-ATC-04 Eje 3 y Mesa SGD | 020 a 028 | `../AYB-PENDIENTE-EP04/G2.md` |
| 4 | EP-ATC-05 Garantias | 033 a 036 | `../AYB-PENDIENTE-EP05/G2.md` |
| 5 | EP-ATC-06, 07 y 08 | 017, 018, 019, 030, 031, 032, 037, 038, 039 | `../AYB-PENDIENTE-EP06-08/G2.md` |
| 6 | EP-ATC-09 Asistencia al gestor | 043 a 048, 054, 055 | `../AYB-PENDIENTE-EP09/G2.md` |
| 7 | EP-ATC-10 Consulta 360 e integraciones | 040 a 042, 049 a 053 | `../AYB-PENDIENTE-EP10/G2.md` |
| 8 | EP-ATC-11 Morosidad y formularios | 056 a 060 | `../AYB-PENDIENTE-EP11/G2.md` |

## Verificacion acumulada

- Pruebas unitarias (`npm test`): 198 en verde.
- Recorridos automatizados en Chrome sin cabeza, por ola: 44, 29, 34, 19, 30, 28, 39 y 32
  comprobaciones, sin errores de consola. Los guiones no estan en el repositorio.
- axe-core: sin violaciones en las pantallas; queda un aviso menor conocido del `Drawer` del
  framework (`aria-allowed-role`) en los cajones de las olas 2 a 4.
- Build de produccion (`npm run build`) y `npm run lint` en verde; el build de produccion no
  contiene nada del prototipo.

## Preguntas abiertas al PO

116 preguntas, con el supuesto que uso el prototipo y su ola, en `preguntas-po.md` (una
tabla por ola). Cada supuesto se ve en pantalla con la marca «Supuesto».

## Hallazgos transversales

Para el framework `@aybarcorp/*`: `Error403` con texto fijo («mis promociones»); `Timeline`
sin un «ahora» de referencia; `Combobox` sin resultados deja un `listbox` vacio (critico en
axe); `Drawer` con un rol no permitido; `NumberInput` no acepta un valor por script; el set de
iconos no trae uno de telefono.

Para el paquete Definir: no existe el contrato OpenAPI de ninguna de las epicas (G3) y ninguna
HU tiene `ui: true`, asi que `aybar paquete validar` no exige G2 todavia; Nexora no recibio nada
(la documentacion se publica por el MCP `nexora`, no a mano).

Dependencias externas que el prototipo solo simula: SIGDA/TAXON, Cobranza, call center, Legal,
motor de consultas, indexado semantico, WhatsApp, correo, UrbeMind, KPI Engine y el modelo de IA.

## IA y firmas

Preparado por IA (Claude Code). Revisado por: [nombre, fecha]. La IA no firma.

| Rol | Nombre | Fecha | Decision |
|---|---|---|---|
| Product Owner | | | Aprueba / Rechaza |
| UX | | | Aprueba / Rechaza |
