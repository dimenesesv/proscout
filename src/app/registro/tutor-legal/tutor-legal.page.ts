import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { RegistroService } from 'src/app/services/registro.service';
import { Tutor } from 'src/app/interfaces/tutor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutor-legal',
  templateUrl: './tutor-legal.page.html',
  styleUrls: ['./tutor-legal.page.scss'],
  standalone: false,
})
export class TutorLegalPage implements OnInit {
  formulario!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router : Router,
    private registroService: RegistroService
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      name: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  guardar() {
    const datosTutor: Tutor = this.formulario.value;

    // Guardar tutor en RegistroService
    this.registroService.setTutor(datosTutor);

    console.log('Tutor registrado:', datosTutor);
    this.router.navigate(['/registro/correo']); // Ajusta esta ruta según tu flujo
  }
}