import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { StorageService } from '../services/storage.service';
import { LoadingController } from '@ionic/angular'; // Importar LoadingController
import { Subscription } from 'rxjs';
import { getAuth, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import Swiper from 'swiper';


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  
  standalone: false,
})
export class Tab4Page implements OnInit, OnDestroy, AfterViewInit {
  userProfile: any;
  galleryUrls: string[] = [];
  uploadProgress: number | null = null; // Progreso de la subida
  private profileSubscription: Subscription | undefined;

  activeTab: number = 0;
  swiper: Swiper | undefined;

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private loadingController: LoadingController, // Inyectar LoadingController
    private router: Router
  ) {}

  ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn('No hay usuario autenticado.');
      return;
    }

    const userId = user.uid;
    const path = `usuarios/${userId}`;

    // Obtener el perfil del usuario
    this.firebaseService.getDocument(path)
      .then((data) => {
        this.userProfile = data;
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
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('Sesión cerrada correctamente');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  // Método para seleccionar una imagen
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

  // Método para subir la imagen usando StorageService
  async uploadImage(file: File) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn('No hay usuario autenticado.');
      return;
    }

    const userId = user.uid;
    const filePath = `usuarios/${userId}/gallery/${Date.now()}_${file.name}`;

    // Mostrar el overlay de carga
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent', // Spinner de tipo "crescent"
    });
    await loading.present();

    try {
      // Subir la imagen y obtener el progreso
      const task = this.storageService.uploadFileWithProgress(filePath, file);

      // Escuchar el progreso de la subida
      task.percentageChanges().subscribe((progress) => {
        this.uploadProgress = progress ? progress / 100 : null;
        loading.message = `Subiendo imagen... ${Math.round(progress || 0)}%`; // Actualizar el mensaje
      });

      // Esperar a que la subida termine y obtener la URL
      const downloadUrl = await task.snapshotChanges().toPromise().then(() => {
        return this.storageService.getDownloadUrl(filePath);
      });

      this.galleryUrls.push(downloadUrl); // Agregar la URL al array local
      this.updateGalleryInFirestore(userId); // Actualizar Firestore
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      // Cerrar el overlay de carga
      await loading.dismiss();
      this.uploadProgress = null; // Reiniciar el progreso
    }
  }

  // Método para actualizar la galería en Firestore
  async updateGalleryInFirestore(userId: string) {
    const path = `usuarios/${userId}`;
    await this.firebaseService.updateDocument(path, { gallery: this.galleryUrls });
  }
}