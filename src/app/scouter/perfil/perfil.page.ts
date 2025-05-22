import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swiper from 'swiper';
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

  activeTab: number = 0;
  swiper: Swiper | undefined;

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private loadingController: LoadingController,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  async ngOnInit() {
    let userId: string | undefined;

    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      const { user } = await FirebaseAuthentication.getCurrentUser();
      userId = user?.uid;
    } else {
      const user = await this.afAuth.currentUser;
      userId = user?.uid;
    }

    if (!userId) {
      console.warn('No hay usuario autenticado.');
      return;
    }

    const path = `usuarios/${userId}`;

    this.firebaseService.getDocument(path)
      .then((data) => {
        this.perfilUsuario = data;
        this.galleryUrls = data?.gallery || [];
      })
      .catch((error) => {
        console.error('Error al obtener el perfil del usuario:', error);
      });
  }

  ngAfterViewInit() {
    this.swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 10,
    });

    this.swiper.on('slideChange', () => {
      this.activeTab = this.swiper?.activeIndex || 0;
    });
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  slideTo(index: number) {
    this.activeTab = index;
    this.swiper?.slideTo(index);
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
}
