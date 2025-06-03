import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FechaNacimientoPage } from './fecha-nacimiento.page';

const routes: Routes = [
  {
    path: '',
    component: FechaNacimientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FechaNacimientoPageRoutingModule {}
