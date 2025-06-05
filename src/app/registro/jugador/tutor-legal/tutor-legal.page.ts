import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { RegistroService } from 'src/app/services/registro.service';
import { Tutor } from 'src/app/interfaces/tutor';
import { Router } from '@angular/router';
import { validarRut } from '../../../utils/rut';
import { autocompletarDireccion, obtenerDetallesDireccion, AutocompleteResult } from 'src/app/utils/autocompletar';
import { StorageService } from 'src/app/services/storage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { getAuth } from 'firebase/auth';

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

  // Progreso de subida
  uploadProgress: number | null = null;
  documentoUrl: string | null = null;
  isUploading = false;
  errorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router : Router,
    private registroService: RegistroService,
    private storageService: StorageService,
    private firebaseService: FirebaseService
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

  async guardar() {
    const datosTutor: Tutor = this.formulario.value;
    // Guardar tutor en RegistroService
    this.registroService.setTutor(datosTutor);
    // Guardar archivo seleccionado en RegistroService para subirlo después
    if (this.archivoSeleccionado) {
      this.registroService.archivoTutorLegal = this.archivoSeleccionado;
      this.registroService.nombreArchivoTutorLegal = this.nombreArchivo;
    }
    // No subir archivo aquí, solo navegar
    console.log('Tutor registrado:', datosTutor);
    this.router.navigate(['/registro/jugador/correo']);
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