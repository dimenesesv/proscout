import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-modal',
  templateUrl: './filtros-modal.component.html',
  styleUrls: ['./filtros-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ]
})
export class FiltrosModalComponent implements OnInit {
  filtros: any = {};
  @Output() aplicar = new EventEmitter<any>();

  constructor(private modalCtrl: ModalController) {
    console.log('[DEBUG] FiltrosModalComponent constructor');
  }

  ngOnInit() {
    console.log('[DEBUG] FiltrosModalComponent ngOnInit');
  }

  aplicarFiltros(form: any) {
    console.log('[DEBUG] FiltrosModalComponent aplicarFiltros', form.value);
    this.aplicar.emit(form.value);
    this.modalCtrl.dismiss(form.value);
  }

  cancelar() {
    console.log('[DEBUG] FiltrosModalComponent cancelar');
    this.modalCtrl.dismiss();
  }
}
