import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TutorLegalPageRoutingModule } from './tutor-legal-routing.module';

import { TutorLegalPage } from './tutor-legal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TutorLegalPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [TutorLegalPage]
})
export class TutorLegalPageModule {}
