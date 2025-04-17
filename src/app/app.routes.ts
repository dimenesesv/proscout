import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },  {
    path: 'perfil-jugador',
    loadComponent: () => import('./perfil-jugador/perfil-jugador.page').then( m => m.PerfilJugadorPage)
  },

];
