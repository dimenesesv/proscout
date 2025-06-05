import { Component, OnInit } from '@angular/core';
import { RegistroService } from 'src/app/services/registro.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-jugador-nacionalidad',
  templateUrl: './nacionalidad.page.html',
  styleUrls: ['./nacionalidad.page.scss'],
  standalone: false,
})
export class NacionalidadPage implements OnInit {
  nacionalidades: string[] = [
    'Argentino/a',
    'Boliviano/a',
    'Brasileño/a',
    'Chileno/a',
    'Colombiano/a',
    'Ecuatoriano/a',
    'Paraguayo/a',
    'Peruano/a',
    'Uruguayo/a',
    'Venezolano/a',
    'Mexicano/a',
    'Español/a',
    'Estadounidense',
    'Canadiense',
    'Francés/Francesa',
    'Italiano/a',
    'Alemán/Alemana',
    'Británico/a',
    'Japonés/Japonesa',
    'Chino/a',
    'Indio/a',
    'Australiano/a',
  ];
  nacionalidad: string = '';

  constructor(private registroService: RegistroService,
              private router: Router
  ) {}

  ngOnInit() {}

  guardarNacionalidad() {
    if (this.nacionalidad) {
      this.registroService.setNacionalidad(this.nacionalidad); // Guarda la nacionalidad en el servicio
      console.log('Nacionalidad guardada:', this.nacionalidad);
      this.router.navigate(['/registro/jugador/fecha-nacimiento']); // Navega a la siguiente página
    } else {
      console.log('Por favor selecciona una nacionalidad.');
    }
  }
}