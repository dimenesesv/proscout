import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-rut',
  templateUrl: './rut.page.html',
  styleUrls: ['./rut.page.scss'],
  standalone: false,
})
export class RutPage implements OnInit {
  rutForm: FormGroup;
  isRutValid: boolean = true; // Bandera para la validación del RUT

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registroService: RegistroService
  ) {
    this.rutForm = this.fb.group({
      rut: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}-[0-9kK]$/), // Patrón para RUT chileno
        ],
      ],
    });
  }

  ngOnInit() {}

  get rut() {
    return this.rutForm.get('rut');
  }

  // Evento al desenfocar el campo de entrada
  onRutBlur() {
    const rutValue = this.rut?.value;
    if (rutValue) {
      const formattedRut = this.formatRut(rutValue);
      this.rut?.setValue(formattedRut); // Formatea el RUT
      this.isRutValid = this.validateRut(formattedRut); // Valida el RUT
    }
  }

  // Evento al escribir en el campo de entrada
  onRutInput(event: any) {
    let input = event.target.value;
    // Permitir solo números y eliminar caracteres no numéricos
    input = input.replace(/[^0-9]/g, '');
    this.rut?.setValue(input); // Actualiza el valor del formulario
    this.isRutValid = this.validateRut(input); // Valida el RUT en tiempo real
  }
  onSubmit() {
    if (this.rutForm.valid && this.isRutValid) {
      const rut = this.rutForm.value.rut;
      this.registroService.setRut(rut) // Almacena el RUT en el servicio
      console.log('Usuario actualizado:', this.registroService.getUsuario());
      this.router.navigate(['/registro/sexo']); // Navega a la siguiente página
    } else {
      console.log('Form is invalid');
    }
  }

  // Método para formatear el RUT
  formatRut(rut: string): string {
    // Eliminar espacios y guiones
    rut = rut.replace(/\s+/g, '').replace(/-/g, '');
    // Agregar el guion antes del dígito verificador
    const rutSinDV = rut.slice(0, -1);
    const dv = rut.slice(-1);
    return `${rutSinDV}-${dv}`;
  }

  // Método para validar el RUT
// Método para validar el RUT
validateRut(rut: string): boolean {
  // Eliminar espacios y guiones
  rut = rut.replace(/\s+/g, '').replace(/-/g, '');
  
  // Validar el formato del RUT
  const rutPattern = /^\d{7,8}[0-9kK]$/;
  if (!rutPattern.test(rut)) {
    return false;
  }

  // Separar el RUT y el dígito verificador
  const rutSinDV = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();

  // Calcular el dígito verificador
  let suma = 0;
  let multiplicador = 2;
  for (let i = rutSinDV.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinDV[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const dvCalculado = 11 - (suma % 11);
  const dvEsperado =
    dvCalculado === 10 ? 'K' : dvCalculado === 11 ? '0' : dvCalculado.toString();

  // Comparar el dígito verificador ingresado con el esperado
  return dv === dvEsperado;
}
}