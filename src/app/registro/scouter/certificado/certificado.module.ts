import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CertificadoPage } from './certificado.page';
import { CertificadoPageRoutingModule } from './certificado-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CertificadoPageRoutingModule
  ],
  declarations: [CertificadoPage]
})
export class CertificadoPageModule {}
