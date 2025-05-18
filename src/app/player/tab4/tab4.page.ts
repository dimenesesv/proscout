import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { getAuth, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Usuario } from 'src/app/interfaces/usuario';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit, OnDestroy, AfterViewInit {
  perfilUsuario: Usuario | null = null;
  urlsGaleria: string[] = [];
  progresoSubida: number | null = null;
  cargandoPerfil: boolean = false;
  private suscripcionPerfil: Subscription | undefined;

  pestanaActiva: number = 0;
  swiper: Swiper | undefined;

  constructor(
    private servicioFirebase: FirebaseService,
    private servicioStorage: StorageService,
    private controladorCarga: LoadingController,
    private enrutador: Router
  ) {}

  ngOnInit() {
    this.cargandoPerfil = true;
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!usuario) {
      console.warn('No hay usuario autenticado.');
      this.cargandoPerfil = false;
      return;
    }

    const idUsuario = usuario.uid;
    const ruta = `usuarios/${idUsuario}`;

    this.servicioFirebase.getDocument(ruta)
      .then((datos) => {
        this.perfilUsuario = datos;
        this.urlsGaleria = datos?.galeria || [];
      })
      .catch((error) => {
        console.error('Error al obtener el perfil del usuario:', error);
      })
      .finally(() => {
        this.cargandoPerfil = false;
      });
  }

  ngAfterViewInit() {
    // Espera a que el perfil esté cargado antes de inicializar Swiper
    const checkAndInitSwiper = () => {
      if (!this.cargandoPerfil && this.perfilUsuario) {
        this.swiper = new Swiper('.swiper-container', {
          slidesPerView: 1,
          spaceBetween: 10,
        });
        this.swiper.on('slideChange', () => {
          this.pestanaActiva = this.swiper?.activeIndex || 0;
        });
      } else {
        setTimeout(checkAndInitSwiper, 100);
      }
    };
    checkAndInitSwiper();
  }

  ngOnDestroy() {
    if (this.suscripcionPerfil) {
      this.suscripcionPerfil.unsubscribe();
    }
  }

  irASlide(indice: number) {
    this.pestanaActiva = indice;
    this.swiper?.slideTo(indice);
  }

  cerrarSesion() {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('Sesion cerrada correctamente');
      this.enrutador.navigate(['/login']);
    }).catch((error) => {
      console.error('Error al cerrar sesion:', error);
    });
  }

  irAEditarPerfil() {
    this.enrutador.navigate(['/editar-perfil']);
  }

  async seleccionarImagen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (evento: any) => {
      const archivo = evento.target.files[0];
      if (archivo) {
        await this.subirImagen(archivo);
      }
    };
    input.click();
  }

  async subirImagen(archivo: File) {
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!usuario) {
      console.warn('No hay usuario autenticado.');
      return;
    }

    const idUsuario = usuario.uid;
    const rutaArchivo = `usuarios/${idUsuario}/galeria/${Date.now()}_${archivo.name}`;

    const carga = await this.controladorCarga.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent',
    });
    await carga.present();

    try {
      const tarea = this.servicioStorage.uploadFileWithProgress(rutaArchivo, archivo);

      tarea.on('state_changed', (snapshot) => {
        const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.progresoSubida = progreso / 100;
        carga.message = `Subiendo imagen... ${Math.round(progreso)}%`;
      });

      await tarea;
      const urlDescarga = await this.servicioStorage.getDownloadUrl(rutaArchivo);

      this.urlsGaleria.push(urlDescarga);
      this.actualizarGaleriaEnFirestore(idUsuario);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      await carga.dismiss();
      this.progresoSubida = null;
    }
  }

  async actualizarGaleriaEnFirestore(idUsuario: string) {
    const ruta = `usuarios/${idUsuario}`;
    await this.servicioFirebase.updateDocument(ruta, { galeria: this.urlsGaleria });
  }
}
