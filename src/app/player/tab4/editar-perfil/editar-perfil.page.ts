import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from 'src/app/interfaces/usuario';
import { FirebaseService } from 'src/app/services/firebase.service';
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { validarRut } from 'src/app/utils/rut';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false,
})
export class EditarPerfilPage implements OnInit {
  perfilUsuario: Usuario | null = null;
  formularioPerfil: FormGroup;
  cargandoPerfil = false;
  errorPerfil: string | null = null;
  statsKeys = [
    { key: 'velocidad', label: 'Velocidad' },
    { key: 'resistencia', label: 'Resistencia' },
    { key: 'fuerza', label: 'Fuerza' },
    { key: 'agilidad', label: 'Agilidad' },
    { key: 'equilibrio', label: 'Equilibrio' },
    { key: 'coordinacion', label: 'Coordinación' },
    { key: 'salto', label: 'Salto' },
    { key: 'controlBalon', label: 'Control del balón' },
    { key: 'regate', label: 'Regate' },
    { key: 'pase', label: 'Pase' },
    { key: 'tiro', label: 'Tiro' },
    { key: 'cabeceo', label: 'Cabeceo' },
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.formularioPerfil = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', [Validators.required, validarRut]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
      ciudad: [''],
      region: [''],
      pais: ['Chile'],
      fechaNacimiento: [''],
      sexo: [''],
      nacionalidad: [''],
      contactoEmergencia: [''],
      tutorNombre: [''],
      tutorRut: [''],
      tutorCorreo: [''],
      tutorTelefono: [''],
      tutorDireccion: [''],
      tutorComuna: [''],
      tutorCiudad: [''],
      tutorRegion: [''],
      tutorPais: ['Chile'],
      tutorParentesco: [''],
      equipo: [''],
      posicion: [''],
      segundaPosicion: [''],
      pie: [''],
      edad: [''],
      altura: [''],
      peso: [''],
      velocidad: [''],
      resistencia: [''],
      fuerza: [''],
      agilidad: [''],
      equilibrio: [''],
      coordinacion: [''],
      salto: [''],
      controlBalon: [''],
      regate: [''],
      pase: [''],
      tiro: [''],
      cabeceo: [''],
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    this.cargandoPerfil = true;
    this.errorPerfil = null;
    const auth = getAuth();
    const usuario = auth.currentUser;
    if (!usuario) {
      this.errorPerfil = 'No hay usuario autenticado.';
      this.cargandoPerfil = false;
      return;
    }
    try {
      const datos = await this.firebaseService.getDocument(`usuarios/${usuario.uid}`);
      this.perfilUsuario = datos;
      this.formularioPerfil.patchValue({
        ...datos,
        tutorNombre: datos?.tutor?.nombre || '',
        tutorRut: datos?.tutor?.rut || '',
        tutorCorreo: datos?.tutor?.correo || '',
        tutorTelefono: datos?.tutor?.telefono || '',
        tutorDireccion: datos?.tutor?.direccion || '',
        tutorComuna: datos?.tutor?.comuna || '',
        tutorCiudad: datos?.tutor?.ciudad || '',
        tutorRegion: datos?.tutor?.region || '',
        tutorPais: datos?.tutor?.pais || 'Chile',
        tutorParentesco: datos?.tutor?.parentesco || '',
        equipo: datos?.info?.equipo || '',
        posicion: datos?.info?.posicion || '',
        segundaPosicion: datos?.info?.segundaPosicion || '',
        pie: datos?.info?.pie || '',
        edad: datos?.info?.edad || '',
        altura: datos?.info?.altura || '',
        peso: datos?.info?.peso || '',
        velocidad: datos?.stats?.velocidad || '',
        resistencia: datos?.stats?.resistencia || '',
        fuerza: datos?.stats?.fuerza || '',
        agilidad: datos?.stats?.agilidad || '',
        equilibrio: datos?.stats?.equilibrio || '',
        coordinacion: datos?.stats?.coordinacion || '',
        salto: datos?.stats?.salto || '',
        controlBalon: datos?.stats?.controlBalon || '',
        regate: datos?.stats?.regate || '',
        pase: datos?.stats?.pase || '',
        tiro: datos?.stats?.tiro || '',
        cabeceo: datos?.stats?.cabeceo || '',
      });
    } catch (error) {
      this.errorPerfil = 'Error al cargar el perfil.';
    } finally {
      this.cargandoPerfil = false;
    }
  }

  async guardarCambios() {
    if (this.formularioPerfil.invalid) return;
    this.cargandoPerfil = true;
    this.errorPerfil = null;
    const auth = getAuth();
    const usuario = auth.currentUser;
    if (!usuario) {
      this.errorPerfil = 'No hay usuario autenticado.';
      this.cargandoPerfil = false;
      return;
    }
    const valores = this.formularioPerfil.value;
    const datosActualizados: Usuario = {
      ...this.perfilUsuario,
      nombre: valores.nombre,
      rut: valores.rut,
      correo: valores.correo,
      telefono: valores.telefono,
      direccion: valores.direccion,
      ciudad: valores.ciudad,
      region: valores.region,
      pais: valores.pais,
      fechaNacimiento: valores.fechaNacimiento,
      sexo: valores.sexo,
      nacionalidad: valores.nacionalidad,
      contactoEmergencia: valores.contactoEmergencia,
      tutor: {
        nombre: valores.tutorNombre,
        rut: valores.tutorRut,
        correo: valores.tutorCorreo,
        telefono: valores.tutorTelefono,
        direccion: valores.tutorDireccion,
        comuna: valores.tutorComuna,
        ciudad: valores.tutorCiudad,
        region: valores.tutorRegion,
        pais: valores.tutorPais,
        parentesco: valores.tutorParentesco,
      },
      info: {
        equipo: valores.equipo,
        posicion: valores.posicion,
        segundaPosicion: valores.segundaPosicion,
        pie: valores.pie,
        edad: valores.edad,
        altura: valores.altura,
        peso: valores.peso,
      },
      stats: {
        velocidad: valores.velocidad,
        resistencia: valores.resistencia,
        fuerza: valores.fuerza,
        agilidad: valores.agilidad,
        equilibrio: valores.equilibrio,
        coordinacion: valores.coordinacion,
        salto: valores.salto,
        controlBalon: valores.controlBalon,
        regate: valores.regate,
        pase: valores.pase,
        tiro: valores.tiro,
        cabeceo: valores.cabeceo,
      },
    };
    try {
      await this.firebaseService.updateDocument(`usuarios/${usuario.uid}`, datosActualizados);
      // Navegación a tab4 forzando recarga de datos sin recargar toda la app ni cerrar sesión
      this.router.navigate(['/player/player/tab4'], { replaceUrl: true });
    } catch (error) {
      this.errorPerfil = 'Error al guardar los cambios.';
    } finally {
      this.cargandoPerfil = false;
    }
  }

  async seleccionarFotoPerfil() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (evento: any) => {
      const archivo = evento.target.files[0];
      if (archivo) {
        await this.subirFotoPerfil(archivo);
      }
    };
    input.click();
  }

  async subirFotoPerfil(archivo: File) {
    this.cargandoPerfil = true;
    this.errorPerfil = null;
    const auth = getAuth();
    const usuario = auth.currentUser;
    if (!usuario) {
      this.errorPerfil = 'No hay usuario autenticado.';
      this.cargandoPerfil = false;
      return;
    }
    const idUsuario = usuario.uid;
    const rutaArchivo = `usuarios/${idUsuario}/perfil/${Date.now()}_${archivo.name}`;
    try {
      const tarea = this.storageService.uploadFileWithProgress(rutaArchivo, archivo);
      await tarea;
      const urlDescarga = await this.storageService.getDownloadUrl(rutaArchivo);
      await this.firebaseService.updateDocument(`usuarios/${idUsuario}`, { fotoPerfil: urlDescarga });
      this.perfilUsuario = { ...this.perfilUsuario, fotoPerfil: urlDescarga };
    } catch (error) {
      this.errorPerfil = 'Error al subir la foto de perfil.';
    } finally {
      this.cargandoPerfil = false;
    }
  }
}
