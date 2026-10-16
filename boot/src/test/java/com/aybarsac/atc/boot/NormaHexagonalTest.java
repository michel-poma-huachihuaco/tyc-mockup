package com.aybarsac.atc.boot;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.core.importer.Location;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * La norma hexagonal del SDK, como test: si alguien se la salta, el build se pone rojo.
 *
 * <p>Las dos reglas son las que sostienen la arquitectura del servicio:</p>
 * <ul>
 *   <li><b>El dominio es Java puro.</b> Si {@code domain} importa Spring, JPA, Jakarta,
 *       Kafka o el SDK, deja de ser negocio y pasa a ser tecnologia: ya no se puede probar
 *       sin levantar nada, ni cambiar de base de datos sin reescribirlo. Se permiten las
 *       dos piezas del SDK que son Java puro y existen hoy: {@code data.cqrs} (los puertos
 *       de lectura y escritura) y {@code common} ({@code Money}, identificadores, fechas).
 *       {@code com.aybarsac.sdk.errores} NO esta en la allowlist a proposito: el paquete
 *       (catalogo {@code CodigoNegocio}) no existe en ningun jar del SDK todavia (skill
 *       {@code aybar-errores}, NO IMPLEMENTADO). Tolerarlo aqui invitaria a importarlo y
 *       descubrir en compilacion, no en este test, que no compila. Cuando el SDK lo
 *       publique, se añade.</li>
 *   <li><b>Los casos de uso no conocen a los adaptadores.</b> {@code application} depende
 *       del puerto, nunca de quien lo implementa. Es lo que permite cambiar Postgres por
 *       Mongo, o REST por Kafka, sin tocar una linea de negocio.</li>
 * </ul>
 *
 * <p>Si una regla te molesta, casi siempre es que la clase esta en la capa equivocada. Mover
 * la clase es la solucion; anadir una excepcion aqui, casi nunca.</p>
 */
@AnalyzeClasses(packages = "com.aybarsac.atc", importOptions = NormaHexagonalTest.SoloClasesDeProduccion.class)
class NormaHexagonalTest {

    /**
     * Mira solo el bytecode de produccion de cualquier modulo: el de este
     * modulo esta en {@code target/classes/}, el de los demas llega como
     * entradas de classpath con el sufijo {@code .jar!/}. Se excluyen
     * explicitamente las clases de test (terminan en *Test.class) para no
     * contaminar la norma con el codigo que la comprueba.
     */
    public static final class SoloClasesDeProduccion implements ImportOption {

        @Override
        public boolean includes(Location location) {
            String ruta = location.toString();
            if (ruta.contains("/target/test-classes/")) {
                return false;
            }
            return ruta.contains("/target/classes/") || ruta.contains(".jar!/");
        }
    }

    @ArchTest
    static final ArchRule el_dominio_no_conoce_la_tecnologia = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..",
                    "org.apache.kafka..",
                    "jakarta..",
                    "javax.persistence..")
            .because("el dominio es Java puro: sin Spring, sin JPA, sin Jakarta y sin Kafka");

    @ArchTest
    static final ArchRule el_dominio_solo_usa_el_sdk_seguro = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat(
                    JavaClass.Predicates.resideInAPackage("com.aybarsac.sdk..")
                            .and(DescribedPredicate.not(JavaClass.Predicates.resideInAnyPackage(
                                    "com.aybarsac.sdk.data.cqrs..",
                                    "com.aybarsac.sdk.common.."))))
            .because("del SDK el dominio solo puede usar data.cqrs y common, que son Java puro y existen hoy "
                    + "(com.aybarsac.sdk.errores no esta implementado: importarlo no compila)");

    @ArchTest
    static final ArchRule los_casos_de_uso_no_conocen_los_adaptadores = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAPackage("..adapters..")
            .because("application depende del puerto del dominio, nunca de quien lo implementa");
}
