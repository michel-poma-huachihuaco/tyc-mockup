package com.aybarsac.atc.adapters.inbound.rest;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Página de bienvenida del servicio generado. En perfil {@code local} es pública
 * (ver {@code application-local.yml}); en prod queda detrás de JWT si hay security.
 */
@RestController
public class BienvenidaController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>aybar-atc — Aybar</title>
                  <style>
                    :root { color-scheme: light dark; }
                    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; line-height: 1.5;
                           background: #0f1419; color: #e7ecf3; }
                    main { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
                    h1 { font-size: 1.75rem; margin: 0 0 .25rem; }
                    .muted { color: #9aa8b8; }
                    a { color: #7dd3fc; }
                    code, pre { font-family: ui-monospace, monospace; }
                    code { background: #1b2430; padding: .1rem .35rem; border-radius: 4px; }
                    section { margin-top: 1.75rem; padding: 1rem 1.1rem; background: #151c25;
                              border: 1px solid #243040; border-radius: 10px; }
                    ul { padding-left: 1.2rem; }
                    .btn { display: inline-block; margin-top: .75rem; padding: .55rem 1rem;
                           background: #0369a1; color: #fff; text-decoration: none; border-radius: 8px; }
                    .btn:hover { background: #0284c7; }
                  </style>
                </head>
                <body>
                <main>
                  <p class="muted">SDK Aybar · microservicio hexagonal</p>
                  <h1>aybar-atc</h1>
                  <p>Este repo se generó con <code>aybar new project aybar-atc --backend</code>.</p>
                  <p class="muted">Ruta en disco: <code>/home/lazaro/Workspace/Aybar/aybar-atc</code></p>

                  <section>
                    <h2>Qué tiene este servicio</h2>
                    <p>La página de bienvenida (este HTML) siempre se genera. Starters elegidos:</p>
                    <ul>
                      <li><code>aybar-starter-data</code> (adapters)</li>
        <li><code>aybar-starter-messaging</code> (adapters)</li>
        <li><code>aybar-starter-client</code> (adapters)</li>
        <li><code>aybar-starter-security</code> (infrastructure)</li>
        <li><code>aybar-starter-audit</code> (adapters)</li>
        <li><code>aybar-starter-web</code> (adapters)</li>
                    </ul>
                    <p class="muted">Módulos Maven: <code>domain</code>, <code>application</code>,
                    <code>adapters</code>, <code>infrastructure</code>, <code>boot</code>.</p>
                  </section>

                  <section>
                    <h2>Cómo usarlo</h2>
                    <pre>cd /home/lazaro/Workspace/Aybar/aybar-atc
                ./mvnw install
                ./mvnw -pl boot spring-boot:run</pre>
                    <p>En desarrollo arranca con el perfil <code>local</code>; un despliegue fija <code>SPRING_PROFILES_ACTIVE</code> (sin ella no hay perfil, nunca <code>local</code>).</p>
                
                    <p>OpenAPI: la autoconfiguración la aporta <code>aybar-starter-web</code>; springdoc es <em>optional</em> en el starter y este proyecto ya lo declara en <code>adapters/pom.xml</code>. No lo dupliques ni lo borres.</p>
                    <a class="btn" href="/swagger-ui.html">Abrir Swagger UI</a>
                    <p class="muted">Spec: <a href="/v3/api-docs">/v3/api-docs</a>.
                    En <code>local</code> está público; en prod exige JWT (Authorize).</p>
                
                
                
                    <p>Lo protegido exige un JWT del emisor OIDC que fije el ADR
                    (<code>AYBAR_ISSUER_URI</code>). En <code>local</code> el servicio arranca sin
                    emisor: esta página, health y OpenAPI responden, y lo protegido devuelve 401
                    sin token, que es lo que espera el login demo del frontend.</p>
                    <p class="muted">Para validar tokens reales, exporta <code>AYBAR_ISSUER_URI</code>
                    con el emisor antes de arrancar. En este repositorio no vive ninguna
                    credencial, ni de ejemplo.</p>
                
                  </section>

                  <section>
                    <h2>Variables de entorno</h2>
                    <ul>
                      <li><code>AYBAR_ISSUER_URI</code> — issuer OIDC del servicio (lo fija su ADR; en local es opcional: sin ella lo protegido responde 401)</li><li><code>AYBAR_DATASOURCE_URI</code> — PostgreSQL (secreto)</li><li><code>AYBAR_MONGO_URI</code> — MongoDB (secreto)</li><li><code>AYBAR_KAFKA_BOOTSTRAP</code> — broker Kafka</li><li><code>AYBAR_AUDIT_NDJSON_DIR</code> — destino NDJSON (opcional)</li><li><code>SPRING_PROFILES_ACTIVE</code> — local / dev / prod</li><li><code>SERVER_PORT</code> — puerto HTTP (default 8081)</li>
                    </ul>
                    <p>Cero <code>password:</code> en YAML de Git. Ver <code>application-local.yml.example</code>.</p>
                  </section>
                </main>
                </body>
                </html>
                """;
    }
}
