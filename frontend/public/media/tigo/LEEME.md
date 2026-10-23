# Tigo en Blender: paquete para el equipo de desarrollo

Probado con Blender 5.2 LTS.

## modelo/: Tigo, el personaje
- `tigo.blend` / `tigo.glb`: el **Tigo aprobado**, el que usa la web. Lleva la malla, la textura (pelaje, cara y polo con la marca), el esqueleto `DEF-*` y 4 animaciones: Idle_Loop, Walk_Loop, Idle_Talking_Loop y Jog_Fwd_Loop.
- `tigo-propuesta.blend` / `.glb`: el mismo Tigo con boca (hueso `DEF-jaw`) y parpadeo (morph `parpadeo`). Está **pendiente de aprobación**.
- `tigo-baile.blend` / `.glb`: la variante con baile.
- Los `.blend` salen de importar los `.glb` oficiales del repo (`public/media/tigo/modelos/`). La fuente de verdad es el `.glb` del repo y sus generadores.

**Ojo con el giro:** el armature del glb usa rotación en **cuaterniones**. Si giras a Tigo con `rotation_euler`, no hace nada; usa `rotation_quaternion` o cambia `rotation_mode`.

## generadores/
Son los scripts del repo (`scripts/tigo/modelo-tigo*.py|mjs|sh`) que construyen el modelo: el físico «fortachón», los rasgos de tigre y la boca.

## oficina-cobranzas/: la Oficina de Cobranzas en 3D
- `oficina.blend`: la escena con los 12 Tigo en sus puestos y las texturas empacadas.
- `oficina.py`: el generador de la escena. Se corre así:

  ```
  blender -b --factory-startup --python oficina.py -- final|retratos|movil|sprites|prueba
  ```

  `final` hace el render de 2400×1400, `retratos` los 12 Tigo, `movil` la vista vertical y `sprites` las tiras de Tigo caminando y hablando.
- `texturas.py` y `tex/`: pizarra, rótulos y pantallas.
- `hotspots.json` (zonas clicables y pasillos en %) y `sprites.json`: los datos que usa la web.
- **Ruta interna:** el script lee `tigo.glb` desde el repo `aybar-front-web`. Ajusta esa ruta al principio de `oficina.py` si lo mueves.

## Licencia
**La malla, los pesos y la textura de Tigo son propiedad de Aybar, con todos los derechos reservados.** El esqueleto y los 4 clips vienen del Universal Animation Library de Quaternius, bajo CC0. El detalle está en `public/media/tigo/LICENCIAS.md` del repo.
