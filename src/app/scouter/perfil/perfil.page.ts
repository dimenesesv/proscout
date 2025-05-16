import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { getAuth, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import Swiper from 'swiper';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit, OnDestroy, AfterViewInit {
  userProfile: any;
  galleryUrls: string[] = [];
  uploadProgress: number | null = null;
  private profileSubscription: Subscription | undefined;

  activeTab: number = 0;
  swiper: Swiper | undefined;

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private loadingController: LoadingController,
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
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn('No hay usuario autenticado.');
      return;
    }

    const userId = user.uid;
    const filePath = `usuarios/${userId}/gallery/${Date.now()}_${file.name}`;

    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const task = this.storageService.uploadFileWithProgress(filePath, file);

      task.percentageChanges().subscribe((progress) => {
        this.uploadProgress = progress ? progress / 100 : null;
        loading.message = `Subiendo imagen... ${Math.round(progress || 0)}%`;
      });

      const downloadUrl = await task.snapshotChanges().toPromise().then(() => {
        return this.storageService.getDownloadUrl(filePath);
      });

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
