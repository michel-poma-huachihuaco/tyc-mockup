import { proveerAutenticacionAybar } from './aybar/autenticacion';
import { proveerApiAybar } from './aybar/api';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Proveedores de la aplicación. `aybar-front init` agrega aquí los del framework: la
// autenticación, el cliente HTTP y, en un shell, proveerShell() (src/app/aybar/).
export const appConfig: ApplicationConfig = {
  providers: [
    proveerAutenticacionAybar(),
    proveerApiAybar(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
};
