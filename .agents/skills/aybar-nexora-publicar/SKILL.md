---
name: aybar-nexora-publicar
description: Publicar en Nexora, como versiones pendientes de aprobación, los documentos de docs/ que cambiaron respecto del sello (docs/.origen-documental.json), con el MCP de Nexora — diff contra el sello, plan en dry_run, confirmación del humano, publicación y aviso de quién aprueba cada uno. Usar cuando validar marque origen-huella-distinta u origen-sin-sellar, cuando el humano pida "sube los cambios de docs a Nexora", o cuando durante la construcción cambie un ADR, decisiones.md u otro documento del paquete.
---

# Publicar cambios de docs/ en Nexora

Nexora manda: un cambio en `docs/` solo cuenta cuando está en Nexora **y** lo aprueba
una persona con el rol de su carpeta. Esta skill sube versiones; **nunca aprueba**.

Requisitos: MCP `nexora` conectado con `NEXORA_TOKEN_ESCRITURA` (sin él, las
herramientas de escritura no existen: dilo y para). El dueño del token tiene que
ser miembro del equipo del apartado; si no, Nexora responde 403.

## 1. Qué cambió

```bash
aybar paquete validar docs --json
```

Del bloque `origen`:

- `huella_distinta`: sellados y editados aquí → nueva versión.
- `sin_sellar`: nuevos en el repo → documento nuevo.

Si las dos listas están vacías, no hay nada que publicar: dilo y termina.

## 2. Plan en seco

```
nexora_paquete_publicar(archivos: [...], dry_run: true)   # dry_run es true por defecto
```

Enséñale al humano el plan tal cual: por archivo, si crea documento o versión,
la versión vigente y su estado. Si la vigente está **aprobada**, Nexora exige un
**control de cambio** (lo firman el tech lead y el Data Chief): dilo; no lo abras ni
lo firmes tú.

## 3. Publica, con confirmación

Solo con un "sí" explícito del humano a ese plan:

```
nexora_paquete_publicar(archivos: [...], dry_run: false)
```

Para un único documento puedes usar `nexora_documento_publicar`. Todo queda en
estado **pendiente**.

## 4. Quién aprueba

Por cada documento publicado, di qué rol lo aprueba **según Nexora**: el
`aprobado_por_rol` y las firmas pendientes que devuelven
`nexora_paquete_publicar` o `nexora_paquete_indice`. Esa regla vive en Nexora,
no en el SDK: no la supongas ni nombres personas. Nadie aprueba lo que publicó
él mismo, y la IA nunca aprueba.

## 5. Vuelve a sellar

Cuando el humano confirme que se aprobó (o para dejar constancia de que está
pendiente), trae otra vez el paquete con `aybar-nexora-traer`: el sello pasa a
reflejar la versión nueva y su estado. Hasta entonces, `validar` seguirá marcando
`origen-huella-distinta` y esos documentos **no cuentan como aprobados**.

## Lo que no haces

- Aprobar, rechazar, firmar, borrar o cambiar el equipo en Nexora.
- Publicar sin enseñar antes el `dry_run`.
- Publicar un archivo de más de 100 000 caracteres (Nexora no lo admite) ni
  `docs/explorador.html` (se genera, no se publica).
