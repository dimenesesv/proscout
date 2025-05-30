import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VistaPerfilPage } from './vista-perfil.page';

const routes: Routes = [
  {
    path: '',
    component: VistaPerfilPage
  },
  {
    path: ':id',
    component: VistaPerfilPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VistaPerfilPageRoutingModule {}
