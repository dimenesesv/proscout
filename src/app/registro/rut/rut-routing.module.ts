import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RutPage } from './rut.page';

const routes: Routes = [
  {
    path: '',
    component: RutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RutPageRoutingModule {}
