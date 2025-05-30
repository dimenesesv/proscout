import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: 'player',
    component: TabsPage,
    canActivate: [AuthGuard], // Aplicar el guard a las tabs
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule),
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule),
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule),
      },
      {
        path: 'tab4',
        loadChildren: () => import('../tab4/tab4.module').then(m => m.Tab4PageModule),
      },
      {
        path: '',
        redirectTo: 'tab1', // Redirigir a la primera tab por defecto
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1', // Redirigir a las tabs si no hay una ruta específica
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}