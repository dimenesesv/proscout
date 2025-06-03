import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { RegistroService } from 'src/app/services/registro.service';
import { Tutor } from 'src/app/interfaces/tutor';
import { Router } from '@angular/router';
import { validarRut } from '../../../utils/rut';
import { autocompletarDireccion, obtenerDetallesDireccion, AutocompleteResult } from 'src/app/utils/autocompletar';

// Validador de RUT basado en la lógica de rut.page.ts


@Component({
  selector: 'app-tutor-legal',
  templateUrl: './tutor-legal.page.html',
  styleUrls: ['./tutor-legal.page.scss'],
  standalone: false,
})
export class TutorLegalPage implements OnInit {
  formulario!: FormGroup;

  nombreArchivo: string = '';
  archivoSeleccionado: File | null = null;

  // Google Maps Autocomplete
  autocompleteService: any;
  placeService: any;
  suggestions: AutocompleteResult[] = [];
  showSuggestions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router : Router,
    private registroService: RegistroService
  ) {
    // Inicialización de Google Autocomplete
    if ((window as any).google && (window as any).google.maps) {
      this.autocompleteService = new (window as any).google.maps.places.AutocompleteService();
    }
  }

  ngOnInit() {
    this.formulario = this.fb.group({
      name: ['', Validators.required],
      rut: ['', [Validators.required, validarRut]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      address: ['', Validators.required],
      comuna: ['', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required],
      parentesco: ['', Validators.required],
    });
  }

  guardar() {
    const datosTutor: Tutor = this.formulario.value;

    // Guardar tutor en RegistroService
    this.registroService.setTutor(datosTutor);

    console.log('Tutor registrado:', datosTutor);
    this.router.navigate(['/registro/correo']); // Ajusta esta ruta según tu flujo
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
    }
  }

  onAddressInput(event: any) {
    const value = event.target.value;
    autocompletarDireccion(value, (results) => {
      this.suggestions = results;
      this.showSuggestions = results.length > 0;
    });
  }

  selectSuggestion(suggestion: AutocompleteResult) {
    this.formulario.patchValue({ address: suggestion.description });
    this.showSuggestions = false;
    obtenerDetallesDireccion(suggestion.place_id, ({ comuna, city, region }) => {
      this.formulario.patchValue({ comuna, city, region });
    });
  }
}