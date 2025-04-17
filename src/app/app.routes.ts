import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },  {
    path: 'perfil-jugador',
    loadComponent: () => import('./perfil-jugador/perfil-jugador.page').then( m => m.PerfilJugadorPage)
  },
  {
    path: 'registro-jugador',
    loadComponent: () => import('./registro/registro-jugador/registro-jugador.page').then( m => m.RegistroJugadorPage)
  },
  {
    path: 'registro-scouter',
    loadComponent: () => import('./registro/registro-scouter/registro-scouter.page').then( m => m.RegistroScouterPage)
  },

];
