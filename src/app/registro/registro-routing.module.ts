import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroPage } from './registro.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroPage
  },
  {
    path: 'jugador/rut',
    loadChildren: () => import('./jugador/rut/rut.module').then( m => m.RutPageModule)
  },
  {
    path: 'jugador/nombre',
    loadChildren: () => import('./jugador/nombre/nombre.module').then( m => m.NombrePageModule)
  },
  {
    path: 'jugador/sexo',
    loadChildren: () => import('./jugador/sexo/sexo.module').then( m => m.SexoPageModule)
  },
  {
    path: 'jugador/nacionalidad',
    loadChildren: () => import('./jugador/nacionalidad/nacionalidad.module').then( m => m.NacionalidadPageModule)
  },
  {
    path: 'jugador/correo',
    loadChildren: () => import('./jugador/correo/correo.module').then( m => m.CorreoPageModule)
  },
  {
    path: 'jugador/verificacion',
    loadChildren: () => import('./jugador/verificacion/verificacion.module').then( m => m.VerificacionPageModule)
  },
  {
    path: 'jugador/contrasena',
    loadChildren: () => import('./jugador/contrasena/contrasena.module').then( m => m.ContrasenaPageModule)
  },
  {
    path: 'bienvenida',
    loadChildren: () => import('./bienvenida/bienvenida.module').then( m => m.BienvenidaPageModule)
  },
  {
    path: 'jugador/fecha-nacimiento',
    loadChildren: () => import('./jugador/fecha-nacimiento/fecha-nacimiento.module').then( m => m.FechaNacimientoPageModule)
  },
  {
    path: 'jugador/tutor-legal',
    loadChildren: () => import('./jugador/tutor-legal/tutor-legal.module').then( m => m.TutorLegalPageModule)
  },
  // Rutas para registro de SCOUTER
  {
    path: 'scouter/rut',
    loadChildren: () => import('./scouter/rut/rut.module').then(m => m.RutPageModule)
  },
  {
    path: 'scouter/nombre',
    loadChildren: () => import('./scouter/nombre/nombre.module').then(m => m.NombrePageModule)
  },
  {
    path: 'scouter/sexo',
    loadChildren: () => import('./scouter/sexo/sexo.module').then(m => m.SexoPageModule)
  },
  {
    path: 'scouter/nacionalidad',
    loadChildren: () => import('./scouter/nacionalidad/nacionalidad.module').then(m => m.NacionalidadPageModule)
  },
  {
    path: 'scouter/correo',
    loadChildren: () => import('./scouter/correo/correo.module').then(m => m.CorreoPageModule)
  },
  {
    path: 'scouter/contrasena',
    loadChildren: () => import('./scouter/contrasena/contrasena.module').then(m => m.ContrasenaPageModule)
  },
  {
    path: 'scouter/fecha-nacimiento',
    loadChildren: () => import('./scouter/fecha-nacimiento/fecha-nacimiento.module').then(m => m.FechaNacimientoPageModule)
  },
  {
    path: 'scouter/certificado',
    loadChildren: () => import('./scouter/certificado/certificado.module').then(m => m.CertificadoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroPageRoutingModule {}
