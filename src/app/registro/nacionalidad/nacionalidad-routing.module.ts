import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NacionalidadPage } from './nacionalidad.page';

const routes: Routes = [
  {
    path: '',
    component: NacionalidadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NacionalidadPageRoutingModule {}
