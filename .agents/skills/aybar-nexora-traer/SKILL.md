---
name: aybar-nexora-traer
description: Traer el paquete Definir de Nexora a docs/ del servicio y sellarlo (docs/.origen-documental.json) con el MCP de Nexora — de un ID o enlace de Nexora a docs/ escrito, sello, explorador y arranque. Usar cuando el humano pase un enlace o UUID de Nexora, pida "trae la documentación de Nexora", "actualiza docs/ desde Nexora", cuando el arranque avise de un sello antiguo (origen-antiguo) o antes de aybar-nexora-implementar.
---

# Traer el paquete de Nexora

La documentación del paquete Definir **se escribe y se aprueba en Nexora**; `docs/`
del repositorio es una **copia sellada**. Esta skill la trae y escribe el sello que
lee `aybar paquete validar` (ADR-007 del SDK). Solo lee de Nexora: no publica nada.

Requisitos: el servidor MCP `nexora` conectado (lo arranca `aybar mcp nexora`; si
no aparece, `aybar doctor`, sección MCP). Si falta, para y dilo: no inventes el
contenido.

## 1. Resuelve el proyecto

```
nexora_quien_soy()                          # con qué cuenta y cargo operas
nexora_arrancar_desde_enlace(enlace | id)   # proyecto, apartado e índice del paquete
nexora_paquete_indice(...)                  # ruta, versión vigente, estado, sha y quién aprueba
```

Cuéntale al humano qué proyecto es, cuántos documentos hay y cuántos están
`aprobado`, `pendiente` o `rechazado`.

## 2. No pises trabajo sin publicar

Si `docs/.origen-documental.json` ya existe:

```bash
aybar paquete validar docs --json    # bloque "origen": huella_distinta, sin_sellar
```

- `huella_distinta`: documentos editados aquí y no publicados en Nexora.
- `sin_sellar`: documentos nuevos del repo que Nexora no tiene.

Si hay alguno, **para**: enséñale la lista y propón `aybar-nexora-publicar` antes
de traer. Solo los sobrescribes si el humano lo dice explícitamente.

## 3. Exporta a un archivo y sella con la CLI

```
nexora_paquete_exportar(...)   # [{ruta, documentoId, numero, estado, huellaSha256, contenido, firmas?, firmas_pendientes?}]
```

Guarda la salida **tal cual** (el JSON que devuelve la herramienta, sin tocarlo)
en un archivo temporal fuera del repositorio, por ejemplo
`/tmp/nexora-export-<proyecto>.json`, y ejecuta:

```bash
aybar paquete sellar docs --desde /tmp/nexora-export-<proyecto>.json \
  --fuente nexora --url "<url del proyecto>" --proyecto "<código>" \
  --por "<agente> (<cuenta de nexora_quien_soy>)"
```

La CLI hace todo o nada: escribe cada `docs/<ruta>` con su `contenido`, comprueba
cada SHA-256 contra `huellaSha256`, rechaza rutas que salgan de `docs/` u ocultas,
escribe `docs/.origen-documental.json` en orden canónico y regenera el explorador.
**Nunca escribas a mano los documentos ni el sello.**

- Si dice que hay **cambios locales que se perderían**, para: enséñale la lista y
  propón `aybar-nexora-publicar`. Solo con un "sí" explícito del humano repites con
  `--forzar`.
- Si dice que una huella no coincide o una ruta no es válida, para y repórtalo: la
  exportación no es fiable.
- No borra archivos de `docs/` que no vengan en la exportación: los avisa y el
  humano decide.

`estado`, `firmas` y `firmas_pendientes` son los de Nexora, sin tocar: **la IA no
aprueba**. Un documento `pendiente` no cuenta como aprobado aunque su frontmatter
diga `approved`.

## 4. Comprueba

```bash
aybar paquete validar docs           # sin origen-huella-distinta ni origen-archivo-ausente
.agents/scripts/arranque.sh          # "Origen documental: nexora, traído hace 0 h ..." y firmas pendientes
```

Commit con `docs(paquete): traer de Nexora <proyecto>` (rama de `docs/`, no de
código). Informa: documentos escritos, pendientes de aprobación (con el rol que
los aprueba y las `firmas_pendientes` por rol) y lo que quedó `sin_sellar`.

## Lo que no haces

- No aprobar, rechazar ni firmar nada en Nexora.
- No escribir a mano `docs/.origen-documental.json` ni los documentos que trae
  `aybar paquete sellar`.
- No editar a mano un archivo sellado para "arreglarlo": se corrige en Nexora
  (o se publica con `aybar-nexora-publicar`) y se vuelve a traer.
- No poner tokens en el repositorio: viven en `~/.aybar/nexora.env`.
