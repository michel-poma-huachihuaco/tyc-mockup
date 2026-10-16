<!-- Renderizado desde datos/marco.json del repositorio aybar-estrategia-tecnica.
     Ese JSON es la fuente; si el marco cambia, esto se regenera, no se edita a mano. -->

# Politica de IA: limites duros

Estos limites no son estilo: son las condiciones bajo las que un agente puede trabajar en este repositorio. Un agente que los cruza invalida el gate que toque.

- Trazabilidad: el artefacto registra qué generó la IA y quién lo revisó
- Sin datos de clientes ni credenciales en prompts a herramientas externas
- Lo generado por IA pasa exactamente los mismos gates
- La IA no cierra gates ni aprueba pull requests

## Principios del marco que obligan a los agentes

- Todo pedido se formaliza. El acto formal es el correo. WhatsApp y pasillo no entran.
- Nadie hace merge directo a una rama protegida. Todo pasa por PR, review y CI.
- Nadie despliega producción a mano. Deploy es pipeline más Release Gate aprobado.
- Toda migración crítica tiene rollback escrito y probado antes de ejecutarse.
- Rollback de aplicación no es rollback de base de datos. Se diseñan por separado.
- La IA propone; el humano aprueba. Ningún artefacto pasa un gate solo con firma de IA.
- Evidencia o no pasó. Cada gate exige un artefacto enlazable en el repositorio.
- Proceso proporcional al riesgo. Un cambio de copy no paga el mismo peaje que una migración.

## En la practica

- La IA redacta borradores de artefactos (ficha, BRD, ADR, test plan, release plan) y prepara paquetes de evidencia; la firma es siempre de una persona con nombre y fecha.
- Todo artefacto tocado por IA registra que genero la herramienta y quien lo reviso.
- Ningun prompt lleva datos de clientes ni credenciales. Los datos de prueba son sinteticos.
- Lo generado por IA pasa exactamente los mismos gates que lo escrito a mano.
