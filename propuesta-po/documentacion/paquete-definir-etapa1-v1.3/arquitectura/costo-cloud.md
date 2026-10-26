---
id: "SPEC-ARQ-COSTO"
tipo: "spec"
titulo: "Impacto en costo cloud por ambiente (Azure, DT-07)"
estado: "draft"
producto: "Aybar Atiende - Plataforma ATC"
version: "0.6"
owner: "Jesús Chávez Elías"
aprobadores: [tech_lead]
fecha: "2026-10-26"
relacionados: [ADR-014, ADR-012, ADR-006, ADR-013, ADR-005]
tags: [arquitectura, costo, g3]
---

# Impacto en costo cloud

El criterio de G3 pide el «impacto en costo cloud estimado», con número y fuente, y la revisión del Líder Técnico (22-oct, §4) pide llenarlo **por ambiente**, con la calculadora de Azure y los volúmenes esperados. Este documento da el **costo mensual de cada ambiente** para cada servicio de DT-07, con la fuente de cada precio y los supuestos que fija el equipo (ED-12 de `analisis/decisiones.md` v0.7, propuesta al Líder Técnico en este envío).

**Fuente de los precios:** API pública de precios de Azure, `https://prices.azure.com/api/retail/prices`, consultada el **26-oct-2026** (y otra vez ese día para la v0.4, con los mismos precios), en **USD**, precio de lista (`priceType = Consumption`, sin reservas ni descuentos de contrato). Es la misma lista que usa la calculadora de precios de Azure. Cada precio se identifica abajo por su `serviceName`, `productName`, `skuName` y `meterName`, para que cualquiera lo vuelva a consultar.

**Región:** ningún documento de PJ-05 ni de ATC fijaba la región. El equipo la fija en **Brazil South** (`brazilsouth`, la región de Azure más cercana a Lima); **East US 2** (`eastus2`) queda solo como comparación (ED-12).

**Es una cota superior:** no se restan las capas gratuitas (Container Apps, Log Analytics, API Management) ni el nivel gratuito de Azure Cosmos DB for MongoDB (vCore), y todo corre las 730 horas del mes.

## 1 Costo mensual por ambiente (USD)

Los ambientes son los cuatro del PLT-05 v1.3 §4.2: DEV (pruebas del equipo), QA (E2E desde el día 3), **PRE (UAT del 03-nov)** y producción (ADR-014, punto 8). PRE entra en la Etapa 1 y en el costo base. Tiene el tamaño de QA.

### 1.1 Brazil South (base)

| Servicio (DT-07) | DEV | QA | PRE (UAT) | PROD |
|---|---:|---:|---:|---:|
| Azure Database for PostgreSQL | 32,54 | 109,19 | 109,19 | 378,37 |
| Azure Cosmos DB for MongoDB (vCore) | 34,97 | 118,84 | 118,84 | 844,44 |
| Azure Event Hubs (protocolo Kafka) | 87,60 | 87,60 | 87,60 | 87,60 |
| Azure Blob Storage con inmutabilidad | 0,04 | 0,08 | 0,08 | 2,07 |
| Azure Key Vault | 0,15 | 0,15 | 0,15 | 0,15 |
| Azure Container Apps | 59,21 | 59,25 | 59,25 | 197,70 |
| Azure Monitor (Log Analytics) | 13,80 | 13,80 | 13,80 | 46,00 |
| Azure API Management (parte de ATC) | 0,85 | 1,28 | 1,28 | 6,38 |
| Cloudflare (parte de ATC) | 0,00 | 0,00 | 0,00 | 0,00 |
| **Total por ambiente** | **229,16** | **390,19** | **390,19** | **1.562,71** |

Común a los cuatro ambientes: **Azure Container Registry** Standard, un registro para todas las imágenes, **20,28** al mes.

**Total mensual de ATC en Brazil South: USD 2.592,53** (DEV + QA + PRE + PROD + registro). Es la cifra que citan ADR-001 y ADR-014. Sin PRE serían 2.202,34, pero esa no es una opción del plan: el PLT-05 hace la UAT en PRE.

### 1.2 East US 2 (comparación)

| Servicio (DT-07) | DEV | QA | PRE (UAT) | PROD |
|---|---:|---:|---:|---:|
| Azure Database for PostgreSQL | 16,09 | 53,32 | 53,32 | 274,60 |
| Azure Cosmos DB for MongoDB (vCore) | 18,36 | 60,19 | 60,19 | 426,03 |
| Azure Event Hubs (protocolo Kafka) | 87,60 | 87,60 | 87,60 | 87,60 |
| Azure Blob Storage con inmutabilidad | 0,02 | 0,05 | 0,05 | 1,19 |
| Azure Key Vault | 0,15 | 0,15 | 0,15 | 0,15 |
| Azure Container Apps | 59,21 | 59,25 | 59,25 | 197,70 |
| Azure Monitor (Log Analytics) | 8,28 | 8,28 | 8,28 | 27,60 |
| Azure API Management (parte de ATC) | 0,70 | 1,05 | 1,05 | 5,25 |
| Cloudflare (parte de ATC) | 0,00 | 0,00 | 0,00 | 0,00 |
| **Total por ambiente** | **190,41** | **269,89** | **269,89** | **1.020,12** |

Común: Azure Container Registry Standard, **20,28**. **Total mensual en East US 2: USD 1.770,59.**

### 1.3 Sensibilidad al volumen

Con **diez veces** el volumen de PROD (5.000 tickets al mes, 480 GB de evidencia, 15 millones de llamadas y 40 GB de logs), PROD pasa de 1.562,71 a **1.783,47** en Brazil South (+14 %) y de 1.020,12 a **1.167,59** en East US 2. El costo lo fijan los tamaños de las bases y del bus, no el volumen.

### 1.4 Fuera de DT-07

| Componente | Costo | Nota |
|---|---|---|
| Envío de correos (HU-055, HU-057, HU-019) | USD 0,63 al mes en PROD (2.500 correos × USD 0,00025, medidor `Email` · `Basic Sent Email`, global) | DT-07 no nombra el servicio de correo. El equipo toma Azure Communication Services, el que usa Control de acceso (ED-12). No suma a los totales de la sección 1 |
| Proveedor de IA (ADR-007, HU-048, HU-053) | **USD 0 en la Etapa 1**: HU-048 y HU-053 salen de la Etapa 1 (P-025, decidida por el equipo el 26-oct-2026). Cuando entren, **USD 0,45 al mes en PROD**: HU-048, 1.000 sugerencias al mes × 1.500 tokens de entrada y 300 de salida = 1,5 millones de entrada a USD 0,00015 y 0,3 millones de salida a USD 0,0006 por 1.000 tokens, **0,41**; HU-053, 2,1 millones de tokens de embeddings a USD 0,00002 por 1.000, **0,04** | Azure OpenAI Service en la suscripción de ATC (ED-17): `gpt-4o-mini` (despliegue estándar global) y `text-embedding-3-small`; decidido y **sin consumo en la Etapa 1**: se usa cuando entren HU-048 y HU-053. Entonces DEV, QA y PRE usan el simulador o un volumen despreciable. No suma a los totales de la sección 1. En la Etapa 1, fuera de los totales solo queda el correo: **USD 0,63 al mes en PROD** (correo e IA, USD 1,08, cuando entren HU-048 y HU-053) |
| Emisor de tokens, login de internos y de clientes, verificación de identidad | **0 para ATC** | Son de Control de acceso (DT-03, DT-04, DT-05). ATC no envía códigos de Mi Portal |
| ShedLock (DT-08) | **0** | Usa una tabla de la base de PostgreSQL; no agrega servicio |
| Job de migraciones Flyway (ADR-001, punto 5) | **0** en la práctica | Azure Container Apps Job con la misma imagen; corre segundos antes de cada despliegue, en el plan de consumo y dentro de su capa gratuita |
| WebSocket del visor (ADR-010) | **0** | Entra por el ingreso de Container Apps del backend, sin pasar por API Management (el nivel de consumo no admite WebSocket, §2.2), y corre en el mismo contenedor |

## 2 Supuestos por ambiente (fijados por el equipo, ED-12)

### 2.1 Volúmenes

Ningún documento del PO los da: el PLT-02 dice «Volumen y tiempos actuales: por medir en Iteración 0». El equipo fija estos (ED-12) y los revisa con la primera factura de DEV. PRE (UAT) usa los mismos de QA:

| Supuesto | DEV | QA y PRE | PROD | De dónde sale |
|---|---|---|---|---|
| Tickets al mes | sintéticos | sintéticos | **500** | 200 tickets activos (RNF del visor, FT-25: «200 tickets activos») ÷ 9 días hábiles de ciclo (72 horas hábiles de cierre, RNF-REN-005) × 22 días hábiles ≈ 490 |
| Adjuntos por ticket | — | — | 4 MB (2 archivos de 2 MB; tope de 10 MB por archivo, HU-064 CA-05) | Supuesto |
| Evidencia guardada | 1 GB | 2 GB | **48 GB** al llegar a los 24 meses (500 × 4 MB × 24) | Retención de 2 años desde el registro: el mínimo del art. 12 del Reglamento del Libro de Reclamaciones (D.S. 011-2011-PCM, modificado por el D.S. 006-2014-PCM; ED-13; ADR-006) |
| Escrituras y lecturas en Blob Storage | 1.000 y 3.000 | 2.000 y 6.000 | 11.000 y 33.000 al mes | 2 adjuntos y 20 diffs de auditoría (`LastChangeLogFile`) por ticket |
| Eventos al bus | 2.000 | 5.000 | 10.000 al mes | 20 eventos por ticket (`datos/linaje.md`) |
| Llamadas a la API | 0,2 millones | 0,3 millones | **1,5 millones** al mes | 50 gestores × 22 días × 8 h × 120 llamadas por hora, más Mi Portal |
| Logs ingeridos | 3 GB | 3 GB | 10 GB al mes | Supuesto; retención de 31 días incluida |
| Operaciones de Key Vault | 50.000 | 50.000 | 50.000 al mes | Lectura de secretos y de la llave HMAC con caché |

### 2.2 Tamaños (SKU)

PRE (UAT) tiene el mismo tamaño que QA.

| Servicio | DEV | QA y PRE | PROD | Fórmula |
|---|---|---|---|---|
| Azure Database for PostgreSQL (Flexible Server) | Burstable B1ms, 32 GB | Burstable B2s, 32 GB | General Purpose D2ds_v5 (2 vCore), 64 GB, **alta disponibilidad con redundancia de zona** (RNF-DIS-003): cómputo y almacenamiento × 2 | precio por hora × 730 + GB × precio por GB |
| Azure Cosmos DB for MongoDB (vCore), hoy «Azure DocumentDB» | M10 (Burstable, 1 vCore, 2 GiB), 32 GB | M20 (Burstable, 2 vCore, 4 GiB), 32 GB | M30 (2 vCore, 8 GiB) con alta disponibilidad (× 2), 32 GB | precio por hora × 730 + GB × precio por GB. Un clúster exclusivo de ATC por ambiente (ADR-012) |
| Azure Event Hubs | Standard, 1 unidad de rendimiento | Standard, 1 unidad | Standard, 1 unidad | (unidad + endpoint Kafka) × 730 + eventos. Un espacio de nombres exclusivo de ATC por ambiente, con 10 event hubs, el límite de Standard (ADR-013) |
| Azure Blob Storage | Hot LRS | Hot LRS | **Hot ZRS** (zonas), con política de inmutabilidad (sin costo propio) | GB × precio + operaciones |
| Azure Key Vault | Standard | Standard | Standard | operaciones ÷ 10.000 × precio |
| Azure Container Apps (plan de consumo) | backend 1 réplica de 0,5 vCPU y 1 GiB; frontend 1 de 0,25 vCPU y 0,5 GiB | igual que DEV | backend **2 réplicas** de 1 vCPU y 2 GiB; frontend 2 de 0,25 vCPU y 0,5 GiB | vCPU × 2.628.000 s × precio + GiB × 2.628.000 s × precio + llamadas |
| Azure Container Registry | Standard, uno para los tres ambientes | | | precio por día × 365 ÷ 12 |
| Azure Monitor | Log Analytics, Analytics Logs | igual | igual | GB × precio |
| Azure API Management | Llamadas REST de ATC a precio del nivel de consumo. El WebSocket del visor no pasa por API Management: «WebSocket APIs aren't supported yet in the Consumption tier» (`https://learn.microsoft.com/en-us/azure/api-management/websocket-api`); entra por Cloudflare al ingreso de Container Apps (ADR-010) | igual | igual | llamadas ÷ 10.000 × precio |
| Cloudflare | Zona corporativa | igual | igual | 0 |

**Lo compartido con Control de acceso** (ED-12: se imputa entero a ATC, sin reparto):

- **La base única** (DT-06) nace con Control de acceso. La fila de PostgreSQL es la capacidad que ATC necesita **como si fuera un servidor propio**: es la cota superior que fija el equipo, sin reparto.
- **Azure API Management y Cloudflare** son el borde corporativo (DT-07; R21 de PJ-05). A ATC se le imputan sus llamadas al precio del nivel de consumo. Si la instancia corporativa es de precio fijo, la parte de ATC es 0 y el costo es del área que la opera. Como referencia, en Brazil South: Developer USD 48,03, Basic v2 USD 150,00 y Standard v2 USD 700,00 al mes por unidad (730 h × 0,0658, 0,20548 y 0,9589). Cloudflare, si ATC necesitara zona propia: Pro USD 20 al mes con pago anual (USD 25 mensual) o Business USD 200 al mes con pago anual (USD 250 mensual), según `cloudflare.com/plans`, consultado el 26-oct-2026.

## 3 Precios unitarios usados (API de precios de Azure, 26-oct-2026, USD)

| Medidor (`serviceName` · `productName` · `skuName` · `meterName`) | Unidad | Brazil South | East US 2 |
|---|---|---:|---:|
| Azure Database for PostgreSQL · Flexible Server Burstable BS Series Compute · B1MS · B1MS | hora | 0,035 | 0,017 |
| Azure Database for PostgreSQL · Flexible Server Burstable BS Series Compute · B2S · B2S | hora | 0,14 | 0,068 |
| Azure Database for PostgreSQL · Flexible Server General Purpose Ddsv5 Series Compute · 2 vCore · vCore | hora | 0,24 | 0,178 |
| Azure Database for PostgreSQL · Flex Server Storage · Storage · Storage Data Stored | GB al mes | 0,2185 | 0,115 |
| Azure Cosmos DB · Azure DocumentDB · Burstable 1 vCore · vCore (M10) | hora | 0,0383 | 0,0191 |
| Azure Cosmos DB · Azure DocumentDB · Burstable 2 vCore · vCore (M20) | hora | 0,1532 | 0,0764 |
| Azure Cosmos DB · Azure DocumentDB · Worker Node 2 vCore · vCore (M30) | hora | 0,568782 | 0,28575 |
| Azure Cosmos DB · Azure DocumentDB · General Purpose Storage · Data Stored | GB al mes | 0,219 | 0,138 |
| Event Hubs · Standard · Standard Throughput Unit | hora | 0,03 | 0,03 |
| Event Hubs · Standard · Standard Kafka Endpoint | hora | 0,09 | 0,09 |
| Event Hubs · Standard · Standard Ingress Events | millón | 0,028 | 0,028 |
| Storage · General Block Blob v2 · Hot LRS · Hot LRS Data Stored | GB al mes | 0,0326 | 0,0184 |
| Storage · General Block Blob v2 · Hot ZRS · Hot ZRS Data Stored | GB al mes | 0,04075 | 0,023 |
| Storage · General Block Blob v2 · Hot LRS / Hot ZRS · Write Operations | 10.000 | 0,07 / 0,0875 | 0,05 / 0,0625 |
| Storage · General Block Blob v2 · Hot LRS / Hot ZRS · Read Operations | 10.000 | 0,0056 | 0,004 |
| Key Vault · Standard · Operations | 10.000 | 0,03 | 0,03 |
| Azure Container Apps · Standard · Standard vCPU Active Usage | segundo | 0,000024 | 0,000024 |
| Azure Container Apps · Standard · Standard Memory Active Usage | GiB por segundo | 0,000003 | 0,000003 |
| Azure Container Apps · Standard · Standard Requests | millón | 0,40 | 0,40 |
| Container Registry · Standard · Standard Registry Unit | día | 0,6666 | 0,6666 |
| Log Analytics · Analytics Logs · Data Ingestion (sobre 5 GB) | GB | 4,60 | 2,76 |
| API Management · Consumption · Consumption Calls (sobre 1 millón) | 10.000 | 0,0425 | 0,035 |
| Foundry Models · Azure OpenAI · gpt-4o-mini-0718-Inp-glbl · gpt-4o-mini-0718-Inp-glbl Tokens | 1.000 tokens | 0,00015 | 0,00015 |
| Foundry Models · Azure OpenAI · gpt-4o-mini-0718-Outp-glbl · gpt-4o-mini-0718-Outp-glbl Tokens | 1.000 tokens | 0,0006 | 0,0006 |
| Foundry Models · Azure OpenAI · text-embedding-3-small-glbl · text-embedding-3-small-glbl Tokens | 1.000 tokens | — (sin medidor en `brazilsouth`) | 0,00002 |

Notas sobre los medidores:

- **Azure Cosmos DB for MongoDB (vCore)** se llama hoy **«Azure DocumentDB»** en la documentación de Microsoft y en la lista de precios. Los niveles salen de Microsoft Learn (`https://learn.microsoft.com/en-us/azure/documentdb/compute-storage`): M10 = 1 vCore *burstable* y 2 GiB; M20 = 2 vCore *burstable* y 4 GiB; M30 = 2 vCore y 8 GiB, sin *burstable*. Se cobran con estos medidores: M10, «Burstable 1 vCore»; M20, «Burstable 2 vCore», que tiene el mismo precio que el medidor B2S; M30, «Worker Node 2 vCore». La lista tiene también «Coordinator Node 2 vCore», más barato (0,297254 por hora en Brazil South). Se toma el de nodo de trabajo, el de mayor precio, para que la cifra no quede corta. La alta disponibilidad duplica el cómputo: la página de precios dice que quitarla en dev/test «reduce the cost by 50%». **Cifra única:** 844,44 en PROD.
- **Event Hubs:** el protocolo Kafka está disponible en Standard (`https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview`). La lista de precios minorista (la que usa la calculadora) trae el medidor «Standard Kafka Endpoint» (0,09 por hora, USD 65,70 al mes por espacio de nombres), y la página de precios marca Kafka «Available» en Standard sin precio aparte. **Cifra única: USD 87,60 al mes por ambiente**, con el medidor incluido. Si la primera factura de DEV no lo cobra, se corrige aquí y en ADR-013 a la baja (21,90 más los eventos): se corrige con la primera factura de DEV.
- **Azure OpenAI** (para cuando entren HU-048 y HU-053; sin consumo en la Etapa 1, P-025): los medidores de `gpt-4o-mini` del despliegue estándar global tienen el mismo precio en `brazilsouth` y en `eastus2`; el de `text-embedding-3-small` solo aparece en `eastus2` en la lista, así que el despliegue de embeddings es global y se cobra a ese precio (ED-17).
- Las capas gratuitas no restadas: Container Apps (180.000 vCPU-segundo, 360.000 GiB-segundo y 2 millones de llamadas al mes por suscripción), Log Analytics (5 GB al mes por cuenta de facturación) y API Management de consumo (1 millón de llamadas). Con ellas, DEV, QA y PRE bajan.

## 4 Horas de desarrollo

El costo de construir lo que el SDK no trae no es costo cloud. Lo nuevo que exige DT-02 y no está en el plan del PO son **28 h** (outbox 6, publicador 6, proyector 10 y bus 6; ADR-012 v0.5). Las demás piezas (bitácoras HMAC, calendario, caché, reintentos, ShedLock, ArchUnit y WebSocket) ya están dentro de las horas que el PO estimó para sus historias (HU-003, 004, 006, 012, 050 y 067; ADR-02 y ADR-05 del PO) o vienen en la plantilla del SDK (ArchUnit). Con 9 h de holgura (243 h de 252 h), la brecha es 28 h − 9 h = **19 h**. **P-025, decidida por el equipo (Brayan Hurtado, 26-oct-2026; `analisis/decisiones.md` v0.8):** las 28 h van como tareas técnicas de la fundación (`backlog/tareas/EP-ATC-01.json`, DT02-T01 a DT02-T06, con su responsable) y salen de la Etapa 1 las 5 HU de alcance flexible del PO (HU-ATC-037, 038, 039, 048 y 053; 16 h; R-01); el equipo absorbe las 3 h restantes (riesgo aceptado). La Etapa 1 queda en 227 h de historias más 28 h técnicas: 255 h. Ninguna cifra de costo cloud cambia: la IA no sumaba a los totales y en la Etapa 1 es USD 0 (§1.4).

## Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 2026-10-19 | Jesús Chávez Elías, con IA | Estructura con servicios «por decidir» |
| 0.2 | 2026-10-22 | Jesús Chávez Elías, con IA | Servicios de Azure (DT-07), sin cifras; volúmenes que faltan; qué ya no cuesta a ATC |
| 0.3 | 2026-10-26 | Brayan Hurtado, con IA | Costo mensual por ambiente (DEV, QA/UAT y PROD, y PRE si se levanta) para cada servicio de DT-07, con precios de la API pública de Azure del 26-oct-2026 en USD, en Brazil South y East US 2; supuestos de volumen y tamaño por confirmar (P-044); sensibilidad al volumen; lo compartido con Control de acceso; precios unitarios con su medidor |
| 0.4 | 2026-10-26 | Brayan Hurtado, con IA | Segunda revisión del Líder Técnico: PRE (UAT del 03-nov) entra en el costo base como dice el PLT-05 §4.2: USD 2.592,53 en Brazil South y 1.770,59 en East US 2 (precios consultados de nuevo en la API el 26-oct, sin cambios); el WebSocket no pasa por API Management de consumo (verificado en Microsoft Learn); Event Hubs con espacio de nombres exclusivo y su límite de 10 event hubs; niveles M10, M20 y M30 de Azure DocumentDB verificados en Microsoft Learn y una sola cifra para Cosmos DB y Event Hubs; job de migraciones y WebSocket sin costo propio |
| 0.5 | 2026-10-26 | Brayan Hurtado, con IA | Decisiones del equipo de `analisis/decisiones.md` v0.7: región Brazil South, SKU, volúmenes, correo y reparto fijados por el equipo (ED-12); retención de 2 años por la norma (ED-13); proveedor de IA con cifra (ED-17: USD 0,45 al mes en PROD, medidores de Azure OpenAI en §3); §4 con la corrección de horas: 28 h nuevas y brecha de 19 h, que cierra el coordinador (P-025) |
| 0.6 | 2026-10-26 | Brayan Hurtado, con IA | P-025 decidida por el equipo (`analisis/decisiones.md` v0.8): §4 sin brecha abierta (28 h técnicas en la fundación; 5 HU de alcance flexible fuera de la Etapa 1; 3 h que absorbe el equipo). §1.4: el proveedor de IA queda sin consumo en la Etapa 1 (USD 0; USD 0,45 al mes en PROD cuando entren HU-048 y HU-053) y fuera de los totales solo queda el correo (USD 0,63). Los totales no cambian (USD 2.592,53 en Brazil South) |

Generado por IA: borrador completo (Claude, 2026-10-19); actualizado con IA (Claude, 2026-10-22) a partir de la revisión del Líder Técnico del 22-oct. — Revisado por: (pendiente) · Aprueba: TL

Actualizado el 26-oct-2026 por Brayan Hurtado con IA (Claude) a partir de la revisión del Líder Técnico del 22-oct (§4, «Costo cloud»), con la API pública de precios de Azure. — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.5) por Brayan Hurtado con IA (Claude): supuestos fijados por el equipo (ED-12), retención (ED-13), proveedor de IA (ED-17) y horas corregidas (28 h nuevas, brecha de 19 h; P-025). — Revisado por: (pendiente)

Actualizado el 26-oct-2026 (v0.6) por Brayan Hurtado con IA (Claude): P-025 decidida por el equipo; IA sin consumo en la Etapa 1 (USD 0) y §4 sin brecha abierta. — Revisado por: (pendiente)
