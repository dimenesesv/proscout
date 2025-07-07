import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
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
    private firebaseService: FirebaseService,
    private alertController: AlertController
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
      aceptaTerminos: [false, Validators.requiredTrue],
      aceptaPrivacidad: [false, Validators.requiredTrue]
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

  async mostrarTerminos() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h3>TÉRMINOS Y CONDICIONES – PROSCOUT</h3>
          
          <h4>1. ACEPTACIÓN DE LOS TÉRMINOS</h4>
          <p>Al utilizar ProScout, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses la aplicación.</p>
          
          <h4>2. DESCRIPCIÓN DEL SERVICIO</h4>
          <p>ProScout es una aplicación que conecta jugadores de fútbol con scouters, facilitando la evaluación de talentos deportivos mediante:<br>
          - Creación de perfiles deportivos<br>
          - Evaluaciones y puntuaciones por parte de scouters<br>
          - Sistema de recomendaciones y consejos</p>
          
          <h4>3. REGISTRO Y CUENTA DE USUARIO</h4>
          <p>Para usar ProScout debes:<br>
          - Proporcionar información veraz y actualizada<br>
          - Los menores de edad requieren autorización del tutor legal<br>
          - Mantener la confidencialidad de tu cuenta</p>
          
          <h4>4. USO ACEPTABLE</h4>
          <p>Te comprometes a:<br>
          - Usar la app con fines deportivos legítimos<br>
          - No subir contenido ofensivo, falso o inapropiado<br>
          - Respetar a otros usuarios<br>
          - No intentar hackear o dañar el sistema</p>
          
          <h4>5. CONTENIDO DEL USUARIO</h4>
          <p>Al subir fotos, videos o información:<br>
          - Confirmas que tienes derecho a hacerlo<br>
          - Otorgas a ProScout licencia para usar este contenido dentro de la app<br>
          - Eres responsable de tu contenido</p>
          
          <h4>6. EVALUACIONES Y PUNTUACIONES</h4>
          <p>Las evaluaciones de scouters son opiniones subjetivas.<br>
          ProScout no garantiza que estas evaluaciones sean precisas o justas.</p>
          
          <h4>7. LIMITACIÓN DE RESPONSABILIDAD</h4>
          <p>ProScout no se hace responsable por:<br>
          - Decisiones tomadas basándose en evaluaciones de la app<br>
          - Pérdida de oportunidades deportivas<br>
          - Conflictos entre usuarios</p>
          
          <h4>8. SUSPENSIÓN Y TERMINACIÓN</h4>
          <p>Podemos suspender o eliminar cuentas que violen estos términos.</p>
          
          <h4>9. MODIFICACIONES</h4>
          <p>Estos términos pueden ser modificados en cualquier momento.<br>
          Los cambios importantes serán notificados a los usuarios.</p>
          
          <h4>10. CONTACTO</h4>
          <p>Para consultas sobre estos términos, escríbenos a:<br>
          📧 contacto@proscout.cl</p>
          
          <p><strong>Última actualización: Julio 2025</strong></p>
        </div>
      `,
      buttons: ['Cerrar'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  async mostrarPoliticaPrivacidad() {
    const alert = await this.alertController.create({
      header: 'Política de Privacidad',
      message: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h3>POLÍTICA DE PRIVACIDAD – PROSCOUT</h3>
          
          <h4>1. INTRODUCCIÓN</h4>
          <p>Esta Política de Privacidad explica cómo ProScout recopila, utiliza, almacena y protege los datos personales de sus usuarios, incluyendo menores de edad con autorización de su tutor legal.</p>
          
          <h4>2. RECOLECCIÓN DE DATOS</h4>
          <p>Recopilamos datos que los usuarios proporcionan al registrarse o al utilizar la app, como:<br>
          - Nombre, RUT, fecha de nacimiento, sexo, nacionalidad<br>
          - Datos físicos y deportivos<br>
          - Información de contacto del tutor legal (si el usuario es menor)<br>
          - Ubicación geográfica (previa autorización)<br>
          - Fotografías, videos y estadísticas deportivas</p>
          
          <h4>3. FINALIDAD DEL USO DE DATOS</h4>
          <p>Usamos los datos personales para:<br>
          - Crear y mostrar perfiles deportivos dentro de la app<br>
          - Mejorar la experiencia del usuario<br>
          - Permitir la interacción entre jugadores y scouters<br>
          - Generar estadísticas internas y reportes de uso</p>
          
          <h4>4. COMPARTICIÓN DE DATOS</h4>
          <p>No compartimos información personal con terceros sin consentimiento previo.<br>
          En casos legales, podríamos estar obligados a entregar información a autoridades competentes.</p>
          
          <h4>5. ALMACENAMIENTO Y SEGURIDAD</h4>
          <p>- Los datos se almacenan en servidores seguros.<br>
          - Aplicamos medidas técnicas y organizativas para evitar accesos no autorizados, pérdidas o manipulaciones.</p>
          
          <h4>6. ACCESO Y ELIMINACIÓN DE DATOS</h4>
          <p>Los usuarios (o sus tutores legales) pueden solicitar:<br>
          - Acceso a sus datos personales<br>
          - Modificación o corrección de datos<br>
          - Eliminación total de su perfil</p>
          
          <h4>7. MENORES DE EDAD</h4>
          <p>Los menores solo pueden usar la app bajo autorización y supervisión de un tutor legal.<br>
          Toda la actividad del menor será visible para el tutor.</p>
          
          <h4>8. ACTUALIZACIONES A ESTA POLÍTICA</h4>
          <p>Esta política puede ser modificada en cualquier momento.<br>
          Cualquier cambio relevante será informado a los usuarios.</p>
          
          <h4>9. CONTACTO</h4>
          <p>Si tienes preguntas o solicitudes sobre privacidad y protección de datos, escríbenos a:<br>
          📧 contacto@proscout.cl</p>
          
          <p><strong>Última actualización: Julio 2025</strong></p>
        </div>
      `,
      buttons: ['Cerrar'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }
}