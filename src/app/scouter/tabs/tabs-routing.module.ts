import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';
import { AuthGuard } from 'src/app/guards/auth.guard'; // Importa el guard

const routes: Routes = [
  {
    path: 'scouter',
    component: TabsPage,
    canActivate: [AuthGuard], // Aplica el guard aquí
    children: [
      {
        path: 'mapa',
        loadChildren: () => import('../mapa/mapa.module').then( m => m.MapaPageModule)
      },
      {
        path: 'favoritos',
        loadChildren: () => import('../favoritos/favoritos.module').then( m => m.FavoritosPageModule)
      },
      {
        path: 'notificaciones',
        loadChildren: () => import('../notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'busqueda',
        loadChildren: () => import('../busqueda/busqueda.module').then(m => m.BusquedaPageModule)
      },
      {
        path: 'vista-perfil/:id',
        loadChildren: () => import('../vista-perfil/vista-perfil.module').then(m => m.VistaPerfilPageModule),
        // Importante: forzar recarga del componente al navegar a otro id
        data: { shouldDetach: false }
      },
      {
        path: '',
        redirectTo: 'mapa',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}