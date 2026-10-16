---
name: aybar-nexora-implementar
description: Flujo completo "analiza e implementa la primera funcionalidad del ID X" con Nexora — traer y sellar el paquete, elegir la primera feature con DoR READY y G3/G4 aprobados (o parar y decir qué falta y quién lo aprueba), analizarla, construirla por olas con commits que llevan en el cuerpo [nexora:<8 hex de la actividad>], registrar avances y PR en Nexora y publicar los documentos que cambien. Usar cuando el humano pase un enlace o ID de Nexora y pida implementar, construir o empezar la primera funcionalidad.
---

# Implementar la primera funcionalidad de un ID de Nexora

«Primera funcionalidad del ID X» = la primera feature, en el orden de
`aybar paquete plan`, con **DoR READY** y **G3/G4 aprobados**. Si ninguna lo está,
**no se construye nada**. La IA escribe en Nexora versiones, avances y PR; nunca
aprueba.

## 1. Arranque desde el enlace

```
nexora_quien_soy()
nexora_arrancar_desde_enlace(X)      # proyecto, apartado, requirement/epic y su árbol
```

Después, skill `aybar-nexora-traer` (docs/ + sello) y `.agents/scripts/arranque.sh`.
Si el paquete no está certificado, dilo, pero sigue al paso 2: la decisión es por
feature.

## 2. Elige la feature (o para)

```bash
aybar paquete plan docs --json       # olas y listas_hoy; con sello, la aprobación sale del sello
aybar paquete validar docs --json    # motivos de cada feature que no está lista
```

```
nexora_features_de(X)                # DoR y gates de cada feature según Nexora
```

La elegida es la primera de `listas_hoy` (en orden de ola) que **además** Nexora da
con DoR READY y G3/G4 aprobados. Las dos fuentes tienen que coincidir; si
discrepan, el sello está viejo: vuelve a traer el paquete.

Un DoR sellado y `aprobado` en Nexora es READY aunque su texto solo traiga una
«Propuesta IA»: la aprobación humana allí es el veredicto.

**Si no hay ninguna: PARA.** No crees rama ni código. Informa, por cada feature
del ID X:

- qué falta (`motivos`: «G4 en nexora: pendiente», «DoR en nexora: pendiente (falta
  firma de …)», «sin G3.md»…),
- las firmas pendientes por rol, de `features[].dor.firmas_pendientes` y
  `gates[].firmas_pendientes`: «DoR de FT-X: falta firma de project_manager»,
- y, si el sello no trae firmas, el rol que aprueba según la carpeta (skill
  `aybar-gates`).

Qué firmas exige cada documento lo decide Nexora: no lo supongas ni nombres
personas; informa los roles que el sello da.

## 3. Analiza

Agente `analista-paquete` sobre la feature elegida: sus HU, criterios de
aceptación, tareas por capa, riesgos y contradicciones (con `ruta:línea`). Si hay
una contradicción que **bloquea**, para y repórtala.

Para cada HU y actividad necesitas su UUID en Nexora:

```
nexora_item_arbol(X)                 # requirement → epic → user_story → task → development
nexora_item_por_codigo("HU-…")       # del código humano al UUID
```

Si una HU no tiene código en Nexora, propón `nexora_item_codigo(uuid, "HU-…")` y
hazlo solo con el "sí" del humano.

## 4. Construye

- Rama `feature/<TICKET>-<slug>`, con el ticket de los gates de la feature (lo
  exigen el guardián de nombre de rama y el de G4; skill `aybar-commits-ramas`).
  Commitea antes en esa rama el `docs/` sellado: el guardián de G4 lee el sello
  con la CLI.
- `orquestador-feature` planifica por olas y reparte entre `desarrollador-backend`
  y `desarrollador-frontend` (skill `aybar-construir-feature`).
- **Cada commit** lleva, en el **cuerpo** (no en el asunto: no cabe en 72
  caracteres), la etiqueta de su actividad (`development`) en Nexora: los **8
  primeros caracteres hexadecimales de su UUID, sin guiones**. Nexora la busca con
  `[nexora:<8 a 36 hex, sin guiones>]`: un UUID con guiones **nunca** casa.
  El asunto sigue la convención de siempre (skill `aybar-commits-ramas`):

  ```
  feat(prestamos): add loan return endpoint (AYB-1042)

  [nexora:7ac36c81]
  ```

  (UUID `7ac36c81-…` → `[nexora:7ac36c81]`.)

## 5. Registra en Nexora

- Al terminar cada actividad: `nexora_avance_registrar(<uuid>, sha: <commit>, …)`.
- Al abrir el PR: `nexora_pr_vincular(<uuid>, url: <pr>)`.

Sin `NEXORA_TOKEN_ESCRITURA` no hay herramientas de escritura: dilo y deja la
lista de avances y PR para que la registre una persona.

## 6. Documentos que cambian

Si en el camino cambia un ADR, `decisiones.md` u otro documento del paquete:
skill `aybar-nexora-publicar`. Queda **pendiente** de aprobación humana; hasta
entonces no cuenta como aprobado.

## 7. Informe final

- Qué se construyó (feature, HU, commits, PR).
- Qué quedó registrado en Nexora (avances, PR, versiones publicadas).
- Qué espera aprobación y de quién.

## Lo que no haces

- Construir una feature sin DoR READY y G3/G4 aprobados, ni «adelantar» una para
  no parar.
- Aprobar, rechazar o firmar nada; cerrar gates; mergear el PR.
- Editar a mano un documento sellado para que valide.
