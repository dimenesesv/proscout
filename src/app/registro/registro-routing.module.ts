import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroPage } from './registro.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroPage
  },
  {
    path: 'rut',
    loadChildren: () => import('./jugador/rut/rut.module').then( m => m.RutPageModule)
  },
  {
    path: 'nombre',
    loadChildren: () => import('./jugador/nombre/nombre.module').then( m => m.NombrePageModule)
  },
  {
    path: 'sexo',
    loadChildren: () => import('./jugador/sexo/sexo.module').then( m => m.SexoPageModule)
  },
  {
    path: 'nacionalidad',
    loadChildren: () => import('./jugador/nacionalidad/nacionalidad.module').then( m => m.NacionalidadPageModule)
  },
  {
    path: 'correo',
    loadChildren: () => import('./jugador/correo/correo.module').then( m => m.CorreoPageModule)
  },
  {
    path: 'verificacion',
    loadChildren: () => import('./jugador/verificacion/verificacion.module').then( m => m.VerificacionPageModule)
  },
  {
    path: 'contrasena',
    loadChildren: () => import('./jugador/contrasena/contrasena.module').then( m => m.ContrasenaPageModule)
  },
  {
    path: 'bienvenida',
    loadChildren: () => import('./bienvenida/bienvenida.module').then( m => m.BienvenidaPageModule)
  },
  {
    path: 'fecha-nacimiento',
    loadChildren: () => import('./jugador/fecha-nacimiento/fecha-nacimiento.module').then( m => m.FechaNacimientoPageModule)
  },
  {
    path: 'tutor-legal',
    loadChildren: () => import('./jugador/tutor-legal/tutor-legal.module').then( m => m.TutorLegalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroPageRoutingModule {}
