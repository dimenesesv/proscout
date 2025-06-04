import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-nombre',
  templateUrl: './nombre.page.html',
  styleUrls: ['./nombre.page.scss'],
  standalone: false,
})
export class NombrePage implements OnInit {
  nameForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registroService: RegistroService
  ) {
    this.nameForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3), // Minimum 3 characters
          Validators.maxLength(50), // Maximum 50 characters
          Validators.pattern(/^[a-zA-Z\sáéíóú]*$/), // Only letters, spaces, and ´
        ],
      ],
    });
  }

  ngOnInit() {}

  get name() {
    return this.nameForm.get('name');
  }

  onSubmit() {
    if (this.nameForm.valid) {
      const name = this.nameForm.value.name;
      this.registroService.setNombre(name); // Almacena el nombre en el servicio
      console.log('Usuario actualizado:', this.registroService.getUsuario());
      this.router.navigate(['/registro/rut']); // Navega a la siguiente página
    } else {
      console.log('Form is invalid');
    }
  }
}