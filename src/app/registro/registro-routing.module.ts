import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroPage } from './registro.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroPage
  },
  {
    path: 'seleccion-rol',
    loadChildren: () => import('./seleccion-rol/seleccion-rol.module').then( m => m.SeleccionRolPageModule)
  },
  {
    path: 'rut',
    loadChildren: () => import('./rut/rut.module').then( m => m.RutPageModule)
  },
  {
    path: 'nombre',
    loadChildren: () => import('./nombre/nombre.module').then( m => m.NombrePageModule)
  },
  {
    path: 'sexo',
    loadChildren: () => import('./sexo/sexo.module').then( m => m.SexoPageModule)
  },
  {
    path: 'nacionalidad',
    loadChildren: () => import('./nacionalidad/nacionalidad.module').then( m => m.NacionalidadPageModule)
  },
  {
    path: 'correo',
    loadChildren: () => import('./correo/correo.module').then( m => m.CorreoPageModule)
  },
  {
    path: 'verificacion',
    loadChildren: () => import('./verificacion/verificacion.module').then( m => m.VerificacionPageModule)
  },
  {
    path: 'contrasena',
    loadChildren: () => import('./contrasena/contrasena.module').then( m => m.ContrasenaPageModule)
  },
  {
    path: 'bienvenida',
    loadChildren: () => import('./bienvenida/bienvenida.module').then( m => m.BienvenidaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroPageRoutingModule {}
