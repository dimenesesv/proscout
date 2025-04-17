import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registro-scouter',
  templateUrl: './registro-scouter.page.html',
  styleUrls: ['./registro-scouter.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RegistroScouterPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
