import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-scouter-fecha-nacimiento',
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
      // Borra el usuario temporal del registro y redirige a login
      this.registroService.limpiarUsuario();
      alert('Debes ser mayor de 18 años para registrarte como scouter.');
      this.navCtrl.navigateRoot('/login');
      return;
    } else {
      this.navCtrl.navigateForward('/registro/scouter/correo');
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