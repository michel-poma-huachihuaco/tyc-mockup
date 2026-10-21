# Imagen de runtime. El jar se compila fuera de Docker; antes de construir la imagen:
#   aybar build          (o ./mvnw -B package -DskipTests)
# Lo produce el modulo boot, con nombre fijo (<finalName> en boot/pom.xml).
FROM eclipse-temurin:21-jre

# curl no viene en eclipse-temurin:21-jre y el HEALTHCHECK de abajo (y el de
# docker-compose, si lo hay) lo ejecutan DENTRO del contenedor. Una sola capa:
# instalar y borrar las listas de apt en el mismo RUN para no dejarlas en la imagen.
#
# El servicio NO corre como root: usuario y grupo de sistema con uid/gid 10001,
# sin shell ni home. Numerico a proposito: Kubernetes (runAsNonRoot) y ECS solo
# pueden comprobar que no es root si el USER es un numero. Va en el mismo RUN
# que apt-get porque los dos necesitan root y asi es una sola capa.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 aybar \
    && useradd --system --uid 10001 --gid 10001 --no-create-home \
        --home-dir /nonexistent --shell /usr/sbin/nologin aybar \
    && install -d -o 10001 -g 10001 /app

# /app es del usuario del servicio: lo que escriba con rutas relativas (p. ej. la
# auditoria NDJSON de AYBAR_AUDIT_NDJSON_DIR=./target/auditoria) cae aqui. El jar
# queda de root y el proceso no puede modificarlo; para blindar el resto, monta
# el sistema de ficheros de solo lectura en el orquestador y un volumen donde escriba.
WORKDIR /app
COPY boot/target/aybar-atc.jar app.jar

EXPOSE 8081

# /actuator/health lo expone el bloque management del application.yml, que solo
# funciona porque el pom declara spring-boot-starter-actuator.
HEALTHCHECK --interval=10s --timeout=5s --retries=12 --start-period=30s \
    CMD curl -fsS http://localhost:8081/actuator/health || exit 1

USER 10001:10001

ENTRYPOINT ["java", "-jar", "app.jar"]
