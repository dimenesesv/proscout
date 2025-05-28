import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-perfil-card',
  templateUrl: './perfil-card.component.html',
  styleUrls: ['./perfil-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PerfilCardComponent implements OnInit, OnDestroy {
  @Input() fotoPerfil: string = '';
  @Input() esNuevo: boolean = false;
  @Input() ciudad: string = '';
  @Input() nombre: string = '';
  @Input() edad: string | number = '';
  @Input() descripcion: string = '';
  @Input() online: boolean = false;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
