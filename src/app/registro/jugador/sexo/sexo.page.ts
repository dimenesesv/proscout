import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-jugador-sexo',
  templateUrl: './sexo.page.html',
  styleUrls: ['./sexo.page.scss'],
  standalone: false,
})
export class SexoPage implements OnInit {
  constructor(private registroService: RegistroService, private router: Router) {}

  ngOnInit() {}

  setSexo(sexo: string) {
    this.registroService.setSexo(sexo); // Guarda el sexo en el servicio
    console.log('Usuario actualizado', this.registroService.getUsuario());
    this.router.navigate(['/registro/jugador/nacionalidad']); // Navega a la siguiente página
  }
}