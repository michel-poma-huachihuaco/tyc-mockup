/**
 * Entorno de desarrollo: `ng serve` (y `ng build --configuration development`) usan este
 * archivo en lugar de environment.ts, por el `fileReplacements` de angular.json. Repite la
 * sección `aybar` entera; el build de producción no lo lee.
 *
 * Modo demo: con `demo` definido, el inicio de sesión es simulado —el Login Form de la
 * aplicación compara usuario y contraseña en el navegador, sin emisor OIDC y sin token— y
 * solo se abre en localhost. `demo` admite un usuario o una lista; nombre y roles son
 * opcionales (sin roles, USER). Las claves son de demo a propósito: viajan al navegador, así
 * que no son seguridad, solo valen en localhost y nunca entran al bundle de producción
 * (environment.ts trae `demo: null`). No pongas una real.
 *
 * Para pasar al emisor real: `demo: null` y el emisor, el cliente y la audiencia del ADR
 * del proyecto en `autenticacion` (README.md, «Pasar al emisor real»).
 */
export const environment = {
  aybar: {
    autenticacion: {
      emisor: 'https://emisor.aybar.local',
      clienteId: 'aybar-web',
      audiencia: 'aybar-api',
      alcance: 'openid profile',
    },
    api: {
      // El backend de este repositorio en local (aybar run).
      baseUrl: 'http://localhost:8081',
    },
    demo: [
      {
        usuario: 'gestor',
        clave: 'demo-gestor',
        nombre: 'Ana Torres · Gestor de tickets',
        roles: ['GESTOR_ATC', 'USER'],
      },
      {
        usuario: 'supervisor',
        clave: 'demo-supervisor',
        nombre: 'Carlos Mendoza · Supervisor ATC',
        roles: ['SUPERVISOR_ATC', 'ADMIN', 'USER'],
      },
      {
        usuario: 'legal',
        clave: 'demo-legal',
        nombre: 'Dr. Ernesto Alarcón · Responsable legal de reclamos',
        roles: ['LEGAL_RECLAMOS', 'USER'],
      },
      {
        usuario: 'sgd',
        clave: 'demo-sgd',
        nombre: 'Dra. Lucía Paredes · Gestor de la Mesa de Casos (SGD)',
        roles: ['MESA_SGD', 'USER'],
      },
      {
        usuario: 'cx',
        clave: 'demo-cx',
        nombre: 'Rodrigo Vargas · Coordinador CX',
        roles: ['COORDINADOR_CX', 'USER'],
      },
      {
        usuario: 'postventa',
        clave: 'demo-postventa',
        nombre: 'Ing. Martín Salazar · Gestor de Postventa',
        roles: ['POSTVENTA_ATC', 'USER'],
      },
      {
        usuario: 'cliente',
        clave: 'demo-cliente',
        nombre: 'María Elena Quispe · Cliente de Aybar',
        roles: ['CLIENTE_PORTAL', 'USER'],
      },
      {
        usuario: 'lider',
        clave: 'demo-lider',
        nombre: 'Sup. Mirtha Delgado · Supervisor o líder de equipo',
        roles: ['LIDER_EQUIPO', 'USER'],
      },
      {
        usuario: 'colaborador',
        clave: 'demo-colaborador',
        nombre: 'Jorge Huamán · Colaborador de área',
        roles: ['COLABORADOR_AREA', 'USER'],
      },
      {
        usuario: 'moderador',
        clave: 'demo-moderador',
        nombre: 'Valeria Soto · Moderador de evento',
        roles: ['MODERADOR_EVENTO', 'USER'],
      },
      {
        usuario: 'cobranza',
        clave: 'demo-cobranza',
        nombre: 'Diego Cárdenas · Analista de Cobranza',
        roles: ['ANALISTA_COBRANZA', 'USER'],
      },
      {
        usuario: 'cdo',
        clave: 'demo-cdo',
        nombre: 'Ing. Fernando Ríos · CDO',
        roles: ['CDO_ATC', 'ADMIN', 'USER'],
      },
      {
        usuario: 'apoyocx',
        clave: 'demo-apoyocx',
        nombre: 'Camila Rojas · Personal de apoyo (CX)',
        roles: ['APOYO_CX', 'USER'],
      },
      {
        usuario: 'proyecto',
        clave: 'demo-proyecto',
        nombre: 'Arq. Gonzalo Vega · Responsable de proyecto',
        roles: ['RESPONSABLE_PROYECTO', 'USER'],
      },
      {
        usuario: 'referente',
        clave: 'demo-referente',
        nombre: 'Patricia Luna · Referente de atención',
        roles: ['REFERENTE_ATENCION', 'USER'],
      },
      {
        usuario: 'acceso',
        clave: 'demo-acceso',
        nombre: 'Héctor Ramos · Personal de control de acceso',
        roles: ['CONTROL_ACCESO', 'USER'],
      },
      {
        usuario: 'admin',
        clave: 'demo-admin',
        nombre: 'Claudia Herrera · Administrador funcional',
        roles: ['ADMIN_FUNCIONAL', 'ADMIN', 'USER'],
      },
    ],
  },
};
