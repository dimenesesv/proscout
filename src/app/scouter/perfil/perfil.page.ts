import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit, OnDestroy, AfterViewInit {
  perfilUsuario: any;
  galleryUrls: string[] = [];
  uploadProgress: number | null = null;
  private profileSubscription: Subscription | undefined;
  private paramSub: Subscription | undefined;

  activeTab: number = 0;

  profileModalOpen = false;

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private loadingController: LoadingController,
    private router: Router,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute
  ) {}

  async loadUserData(userId: string) {
    console.log('[PerfilPage] Loading user data for:', userId);
    if (!userId) {
      console.warn('No hay usuario autenticado ni id de perfil.');
      return;
    }
    const path = `usuarios/${userId}`;
    this.firebaseService.getDocument(path)
      .then((data) => {
        // Sanitiza info y stats: convierte "" a null
        if (data?.info) {
          for (const key of Object.keys(data.info)) {
            if (data.info[key] === "") data.info[key] = null;
          }
        }
        if (data?.stats) {
          for (const key of Object.keys(data.stats)) {
            if (data.stats[key] === "") data.stats[key] = null;
          }
        }
        this.perfilUsuario = data;
        this.galleryUrls = data?.gallery || [];
        console.log('[PerfilPage] Perfil cargado:', this.perfilUsuario);
      })
      .catch((error) => {
        console.error('Error al obtener el perfil del usuario:', error);
      });
  }

  async ngOnInit() {
    document.body.classList.remove('dark');
    document.body.classList.add('light');

    console.log('[PerfilPage] ngOnInit called');
    this.paramSub = this.route.paramMap.subscribe(async (params) => {
      let userId: string | undefined = params.get('id') || undefined;
      console.log('[PerfilPage] paramMap changed, id:', userId);
      if (!userId) {
        if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
          const { user } = await FirebaseAuthentication.getCurrentUser();
          userId = user?.uid;
        } else {
          const user = await this.afAuth.currentUser;
          userId = user?.uid;
        }
      }
      await this.loadUserData(userId || '');
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    console.log('[PerfilPage] ngOnDestroy called');
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.paramSub) {
      this.paramSub.unsubscribe();
    }
    // Limpieza explícita de componentes hijos
    setTimeout(() => {
      const swiperEls = document.querySelectorAll('.swiper-container, .swiper-wrapper, .swiper-slide');
      swiperEls.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }, 0);
    // Limpieza de referencias
    this.perfilUsuario = null;
    this.galleryUrls = [];
    this.activeTab = 0;
    this.uploadProgress = null;
  }

  slideTo(index: number) {
    this.activeTab = index;
  }

  logout() {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      FirebaseAuthentication.signOut().then(() => {
        console.log('Sesión cerrada correctamente');
        this.router.navigate(['/login']);
      }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
    } else {
      this.afAuth.signOut().then(() => {
        console.log('Sesión cerrada correctamente');
        this.router.navigate(['/login']);
      }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
    }
  }

  async selectImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        await this.uploadImage(file);
      }
    };
    input.click();
  }

  async uploadImage(file: File) {
    let userId: string | undefined;
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      const { user } = await FirebaseAuthentication.getCurrentUser();
      userId = user?.uid;
      console.log('[uploadImage] Plataforma móvil, userId:', userId);
    } else {
      const user = await this.afAuth.currentUser;
      userId = user?.uid;
      console.log('[uploadImage] Plataforma web, userId:', userId);
    }
    if (!userId) {
      console.warn('[uploadImage] No hay usuario autenticado.');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent',
    });
    await loading.present();
    try {
      console.log('[uploadImage] Llamando a uploadUserGalleryImage con userId:', userId, 'file:', file);
      this.galleryUrls = await this.storageService.uploadUserGalleryImage(
        userId,
        file,
        this.firebaseService,
        (progress) => {
          this.uploadProgress = progress / 100;
          loading.message = `Subiendo imagen... ${Math.round(progress)}%`;
          if (progress % 10 === 0) {
            console.log(`[uploadImage] Progreso: ${progress}%`);
          }
        }
      );
      console.log('[uploadImage] Galería actualizada:', this.galleryUrls);
    } catch (error) {
      console.error('[uploadImage] Error al subir la imagen:', error);
    } finally {
      await loading.dismiss();
      this.uploadProgress = null;
      console.log('[uploadImage] Proceso de subida finalizado');
    }
  }

  async updateGalleryInFirestore(userId: string) {
    const path = `usuarios/${userId}`;
    await this.firebaseService.updateDocument(path, { gallery: this.galleryUrls });
  }

  presentProfileModal() {
    this.profileModalOpen = true;
  }

  animateChips() {}

  ejecutarAnimacionesPerfil() {}

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const partes = fechaNacimiento.split('-');
    let anio = 0, mes = 0, dia = 1;
    if (partes.length === 3) {
      anio = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10) - 1;
      dia = parseInt(partes[2], 10);
    } else if (partes.length === 1) {
      anio = parseInt(partes[0], 10);
    }
    const nacimiento = new Date(anio, mes, dia);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}

// Force light mode globally for all pages
if (typeof document !== 'undefined') {
  document.body.classList.remove('dark');
  document.body.classList.add('light');
}
