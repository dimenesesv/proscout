import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NombrePage } from './nombre/nombre.page';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {

  constructor(private router: Router, private registroService: RegistroService) { }

  ngOnInit() {
  }

isPlayer() {
    this.registroService.setIsPlayer(true);
    this.registroService.setIsScouter(false);
    this.router.navigate(['registro/nombre']);
  }
isScouter() {
    this.registroService.setIsScouter(true);
    this.registroService.setIsPlayer(false);
    this.router.navigate(['registro/nombre']);
  }

}
