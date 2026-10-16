---
name: aybar-microservicio
description: Consume el SDK Aybar en un microservicio hexagonal (BOM, starters, issuer OIDC, generacion con la CLI aybar, nuevo-servicio.sh o el archetype). Usar al crear un servicio, anadir un starter, un endpoint, o configurar application.yml.
---

# Microservicio Aybar

## Instalar SDK

```bash
./mvnw -B install -DskipTests   # deja los jars 0.1.0 en ~/.m2
```

## Generar un servicio

El camino oficial es la CLI del SDK (`aybar` / alias `ayb`, la instala
`./install.sh`; decidido en ADR-003):

```bash
aybar new project <nombre> --backend   # interactivo; --yes toma todos los starters
aybar doctor                           # diagnostico de la instalacion
```

La CLI ademas copia al servicio las skills (`.claude/skills/` y
`.cursor/skills/`), los roles (`.claude/agents/`), el marco (`.agents/`), los
guardianes de git activados y el Maven Wrapper.

Sin la CLI instalada hay un camino alternativo que genera el mismo arbol
hexagonal (plantilla `aybar-service-template`) pero SIN ese equipamiento (se
versiona a mano):

```bash
./nuevo-servicio.sh              # plantillas embebidas; sin Maven. PowerShell: .\nuevo-servicio.ps1
```

El servicio generado trae `NormaHexagonalTest` (ArchUnit): si el dominio importa Spring, JPA, Jakarta o Kafka, el build se pone rojo.

## Starters

- `infrastructure`: security, logging, config.
- `adapters`: web, client, audit, messaging, data.
- `domain` / `application`: ninguno.

Issuer: `AYBAR_ISSUER_URI`, obligatoria y sin valor por defecto fuera del perfil `local`. En `local` el servicio arranca sin emisor (`${AYBAR_ISSUER_URI:http://emisor-no-configurado.invalid}`, dominio reservado que nunca resuelve): lo público responde y lo protegido da 401; un token también se rechaza (401, con un ERROR en el log por no poder resolver el emisor) hasta que exportes `AYBAR_ISSUER_URI`. El emisor de tokens lo decide el ADR del proyecto (el de la plataforma será `access-control-service`, que todavía no existe); el SDK no trae emisor local. El emisor es plataforma: no se clona en el servicio.

Endpoint nuevo: REST en `adapters.inbound.rest` → usecase → puertos. No poner JDBC en el controller.

OpenAPI: lo aporta `aybar-starter-web` (springdoc). UI en `/swagger-ui.html`, spec en `/v3/api-docs`. Detrás de JWT; no añadir springdoc al pom del servicio. Título: `aybar.web.openapi.titulo`. Bean extra solo en `adapters.inbound.rest.openapi`.
