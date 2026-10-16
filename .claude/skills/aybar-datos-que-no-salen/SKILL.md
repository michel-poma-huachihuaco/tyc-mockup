---
name: aybar-datos-que-no-salen
description: Las cuatro categorías de datos que nunca entran a un prompt de IA (dumps productivos, datos personales, secretos, credenciales) y qué usar en su lugar. Usar SIEMPRE antes de pegar, leer o procesar un dato real, un archivo, un extracto de base de datos, un log o un .env con un agente de IA, y al preparar datos de prueba.
---

# Datos que no salen

Contrato de IA: cuatro categorías nunca van a un modelo, sin excepción y aunque
el pedido venga de alguien con autoridad.

1. **Dumps productivos**: extractos, exportaciones, consultas o copias de una base de datos de Producción.
2. **Datos personales**: nombres reales, documentos de identidad, correos, teléfonos, direcciones o cualquier dato que identifique a una persona (Ley 29733).
3. **Secretos**: API keys, tokens, contraseñas, certificados y claves privadas.
4. **Credenciales**: cualquier cosa que autentique contra un sistema real.

## Qué sí se usa

| Ambiente | Datos |
|---|---|
| Local y Desarrollo | Sintéticos: inventados, con forma de prueba evidente (dominios `example.com`, ids de prueba) |
| QA y Pre-Producción | Anonimizados, nunca el dato real aunque el ambiente no sea Producción |
| Producción | Nunca, en ningún trabajo con IA |

En un paquete Definir, los ejemplos de las HU, del test plan y de las tareas son
sintéticos. Los nombres de las personas que firman van en los documentos, no en
los prompts de generación de código.

## Si te lo piden

Si un pedido implica pegar, leer o procesar algo que puede contener una de las
cuatro categorías (un CSV de clientes, un dump, un log de producción, un `.env`),
**no lo proceses**. Di cuál categoría aplica y pide una versión sintética o
anonimizada del mismo dato antes de seguir.

## Dónde está el detalle técnico

- Secretos por entorno y nunca en Git: skill `aybar-secretos`, y el contrato `docs/skills/aybar-starter-config.md`.
- PII fuera de los eventos de auditoría: skill `aybar-auditoria`. `GuardianPiiTest` (en `aybar-starter-audit`) corta PII en el JSON de auditoría en cada build del SDK, pero no protege prompts: esa capa es esta skill.
- Que un hook de agente corte el dato antes de que llegue al modelo es trabajo en construcción en el servicio generado (skill `aybar-estado-del-sdk`). Mientras tanto, el criterio es tuyo.
