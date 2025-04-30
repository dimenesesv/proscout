import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-sexo',
  templateUrl: './sexo.page.html',
  styleUrls: ['./sexo.page.scss'],
  standalone: false,
})
export class SexoPage implements OnInit {
  constructor(private registroService: RegistroService, private router: Router) {}

  ngOnInit() {}

  setSexo(sexo: string) {
    this.registroService.setSex(sexo); // Guarda el sexo en el servicio
    console.log('Sexo seleccionado:', sexo);
    this.router.navigate(['/registro/nacionalidad']); // Navega a la siguiente página
  }
}