import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then(m => m.RegistroPageModule),
  },
{
  path: 'scouter',
  loadChildren: () => import('./scouter/tabs/tabs.module').then(m => m.TabsPageModule),
  canActivate: [AuthGuard],
},
{
  path: 'player',
  loadChildren: () => import('./player/tabs/tabs.module').then(m => m.TabsPageModule),
  canActivate: [AuthGuard],
},
{
  path: 'editar-perfil',
  loadChildren: () => import('./player/tab4/editar-perfil/editar-perfil.module').then(m => m.EditarPerfilPageModule),
  canActivate: [AuthGuard],
},
{
  path: '',
  redirectTo: 'login',
  pathMatch: 'full',
},
  {
    path: 'error',
    loadChildren: () => import('./error/error.module').then( m => m.ErrorPageModule)
  },
  {
    path: 'vista-perfil/:id',
    loadChildren: () => import('./scouter/vista-perfil/vista-perfil.module').then( m => m.VistaPerfilPageModule)
  },
  {
    path: 'busqueda',
    loadChildren: () => import('./scouter/busqueda/busqueda.module').then( m => m.BusquedaPageModule)
  },
  {
    path: 'example',
    loadChildren: () => import('./example/example.module').then( m => m.ExamplePageModule)
  },
  {
    path: 'evaluaciones',
    loadChildren: () => import('./scouter/evaluaciones/evaluaciones.module').then( m => m.EvaluacionesPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}