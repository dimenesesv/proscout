import { Component, OnInit } from '@angular/core';
import { RegistroService } from 'src/app/services/registro.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-nacionalidad',
  templateUrl: './nacionalidad.page.html',
  styleUrls: ['./nacionalidad.page.scss'],
  standalone: false,
})
export class NacionalidadPage implements OnInit {
  nacionalidades: string[] = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Ecuador',
    'Paraguay',
    'Perú',
    'Uruguay',
    'Venezuela',
    'México',
    'España',
    'Estados Unidos',
    'Canadá',
    'Francia',
    'Italia',
    'Alemania',
    'Reino Unido',
    'Japón',
    'China',
    'India',
    'Australia',
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
      this.router.navigate(['/registro/fecha-nacimiento']); // Navega a la siguiente página
    } else {
      console.log('Por favor selecciona una nacionalidad.');
    }
  }
}