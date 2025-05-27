import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import Swiper from 'swiper';
import { Usuario } from 'src/app/interfaces/usuario';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit, OnDestroy, AfterViewInit {
  perfilUsuario: any; 
  galleryUrls: string[] = [];
  uploadProgress: number | null = null;
  private profileSubscription: Subscription | undefined;

  activeTab: number = 0;
  swiper: Swiper | undefined;
  cargando: boolean = true;

  autoOpenGaleria: boolean = false;
  autoOpenVideo: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private loadingController: LoadingController,
    private router: Router,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Leer el parámetro de la pestaña activa (galería) y autoOpen
    this.route.queryParams.subscribe(params => {
      const tab = Number(params['tab']);
      if (!isNaN(tab)) {
        this.activeTab = tab;
      }
      this.autoOpenGaleria = params['autoOpen'] === 'true' || params['autoOpen'] === true;
      this.autoOpenVideo = params['video'] === 'true' || params['video'] === true;
    });

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
    let cargando = true;

    this.firebaseService.getDocument(path)
      .then((data) => {
        this.perfilUsuario = data;
        this.galleryUrls = data?.gallery || [];
        this.cargando = false;
      })
      .catch((error) => {
        console.error('Error al obtener el perfil del usuario:', error);
        this.cargando = false;
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

    // Si hay que abrir la galería automáticamente
    setTimeout(() => {
      // Forzar el slide a galería si autoOpenGaleria está activo
      if (this.autoOpenGaleria) {
        this.slideTo(2);
        setTimeout(() => {
          const galeriaCard: any = document.querySelector('app-galeria-card ion-button');
          if (galeriaCard) {
            galeriaCard.click();
          }
        }, 300);
      }
    }, 300);
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
    } else {
      const user = await this.afAuth.currentUser;
      userId = user?.uid;
    }
    if (!userId) {
      console.warn('No hay usuario autenticado.');
      return;
    }
    const filePath = `usuarios/${userId}/gallery/${Date.now()}_${file.name}`;
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent',
    });
    await loading.present();
    try {
      const task = this.storageService.uploadFileWithProgress(filePath, file);
      // Escuchar el progreso de la subida usando el evento 'state_changed'
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadProgress = progress / 100;
        loading.message = `Subiendo imagen... ${Math.round(progress)}%`;
      });
      // Esperar a que la subida termine y obtener la URL
      await task;
      const downloadUrl = await this.storageService.getDownloadUrl(filePath);
      this.galleryUrls.push(downloadUrl);
      this.updateGalleryInFirestore(userId);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      await loading.dismiss();
      this.uploadProgress = null;
    }
  }

  async updateGalleryInFirestore(userId: string) {
    const path = `usuarios/${userId}`;
    await this.firebaseService.updateDocument(path, { gallery: this.galleryUrls });
  }
}
