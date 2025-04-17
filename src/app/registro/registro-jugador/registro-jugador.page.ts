import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registro-jugador',
  templateUrl: './registro-jugador.page.html',
  styleUrls: ['./registro-jugador.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RegistroJugadorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
