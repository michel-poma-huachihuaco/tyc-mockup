# propuesta-po · what-if de la propuesta del PO

Réplica local, en código, de las dos escenas del artifact del PO (*Aybar Atiende v1*), dibujadas con
**three.js**. Proyecto aparte: no toca `frontend/`, no usa `@aybarcorp/*` y no es el producto.

| Escena | Funcionalidad | Qué es |
|---|---|---|
| Consulta 360 | FT-ATC-20 | Red 3D (perspectiva, arrastrable): cliente al centro, 8 sistemas de origen, 16 datos. Roles (RN-SVC-036) y caída de fuente (RF-SVC-051) |
| Tickets en vivo | FT-ATC-18 · 21 · 04 | Ciudad isométrica 3D (cámara ortográfica): 5 canales → bandeja orquestadora → 6 áreas → Comité / cierre, con HUD, seguimiento y rayo |

## Modo what-if

El interruptor de la cabecera reinicia el escenario (misma semilla) para poder comparar:

- **Como lo propone el PO**: réplica fiel, incluidos los choques con las HU.
- **Con las reglas de las HU**: aplica donde la propuesta contradice el paquete SCRUM
  (`src/ciudad/sim.ts`, `CONFLICTOS`): escalamiento solo de casos sensibles y en cadena (HU-ATC-023,
  RN-SVC-017), alerta única (HU-ATC-010), rayo solo supervisor/líder con motivo y tope del 10 %
  (HU-ATC-045, RN-SVC-031), carga ponderada con límite (HU-ATC-046, RN-SVC-033). Oculta la
  gamificación (XP/racha/nivel), que no tiene HU.

`?modo=hu&rol=supervisor` abre la página ya en ese modo y rol.

## Cómo correrlo

```
cd propuesta-po
npm install
npm run dev        # http://localhost:5180
npm test           # reglas de la simulación (node --test)
npm run build
```

## Qué es de ejemplo / límites conocidos

- Clientes, SLA en minutos simulados y CSAT son ficticios (los SLA reales salen de la política, RN-SVC-001).
- «Edificio» sigue sin definición en el paquete: aquí es solo el volumen de cada área.
- La carga ponderada se aplica al asignar; no hay reasignación posterior por saturación (HU-ATC-046 CA-01 completo).
- Accesibilidad: el canvas es `role="img"`; la misma información está en el panel lateral (botones por
  área y por ticket, operables con teclado). `prefers-reduced-motion` arranca la ciudad en pausa y
  sin pulsos ni giro automático.
- Sin tokens `--aybar-*`: usa la paleta del artifact del PO. Integrarlo al prototipo (`frontend/`)
  sería otro trabajo (ver el brief de integración).
