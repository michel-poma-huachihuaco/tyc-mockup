---
name: aybar-marco-entrega
description: Marco de entrega Aybar — fases F0-F10, gates G0-G9, roles y limites de la IA. Usar al planear trabajo, decidir que fase o gate toca, preparar evidencias, o cuando aparezcan F0..F10, G0..G9, DoR, intake, refinement o release.
---

# Marco de entrega

Once fases (F0 Intake ... F10 Operacion), diez gates (G0..G9). Un gate es
criterio objetivo + evidencia enlazable por commit + firma humana con nombre
y fecha. El acto formal es el correo; WhatsApp y pasillo no entran.

Limites de la IA, sin excepcion: propone y prepara, no cierra gates ni
aprueba PRs; todo artefacto registra que genero y quien reviso; sin datos de
clientes ni credenciales en prompts; lo generado pasa los mismos gates.

Reglas de cierre: todo cambio se tipifica antes de estimarse; sin DoR no hay
sprint; gate sin evidencia enlazable no esta aprobado; sin rollback no hay
despliegue; la documentacion vive en el repositorio o no existe.

En un servicio generado: mapa completo en `.agents/orquestacion.md`, criterios
en `.agents/references/fases-y-gates.md`, roles de agente en `.agents/agents/`.
Skills hermanas: aybar-tipificacion, aybar-gates, aybar-commits-ramas,
aybar-pruebas-qa, aybar-gobierno-datos, aybar-release. Para construir desde
un paquete Definir (`docs/` del servicio, G0-G4): aybar-paquete-definir y
aybar-construir-feature; agentes analista-paquete y orquestador-feature.
