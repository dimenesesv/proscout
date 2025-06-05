import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-jugador-fecha-nacimiento',
  templateUrl: './fecha-nacimiento.page.html',
  styleUrls: ['./fecha-nacimiento.page.scss'],
  standalone: false,
})
export class FechaNacimientoPage implements OnInit {
  formulario!: FormGroup;
  hoy: string = new Date().toISOString();

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private registroService: RegistroService
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      birthDate: ['', Validators.required],
    });
  }

  continuar() {
    const birthDate = new Date(this.formulario.value.birthDate);
    const edad = this.calcularEdad(birthDate);

    // Guardar fecha en el RegistroService
    this.registroService.setFechaNacimiento(birthDate.toISOString());

    if (edad < 18) {
      this.navCtrl.navigateForward('/registro/jugador/tutor-legal');
    } else {
      this.navCtrl.navigateForward('/registro/jugador/correo'); // Ajusta esta ruta
    }
  }

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}