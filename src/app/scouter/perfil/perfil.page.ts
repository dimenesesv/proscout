import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { getAuth, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

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
    private router: Router
  ) {}

  async ngOnInit() {
    let userId: string | undefined;

    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      const { user } = await FirebaseAuthentication.getCurrentUser();
      userId = user?.uid;
    } else {
      const auth = getAuth();
      const user = auth.currentUser;
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

  async uploadFile(tipo: string) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '*/*'; // permite cualquier tipo de archivo
  input.onchange = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      await this.uploadFileWithPath(file, tipo);
    }
  };
  input.click();
}

async uploadFileWithPath(file: File, tipo: string) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn('No hay usuario autenticado.');
    return;
  }

  const userId = user.uid;
  const filePath = `usuarios/${userId}/${tipo}/${Date.now()}_${file.name}`;

  const loading = await this.loadingController.create({
    message: `Subiendo ${tipo}...`,
    spinner: 'crescent',
  });
  await loading.present();

  try {
    const task = this.storageService.uploadFileWithProgress(filePath, file);

    task.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.uploadProgress = progress / 100;
      loading.message = `Subiendo ${tipo}... ${Math.round(progress)}%`;
    });

    await task;
    const downloadUrl = await this.storageService.getDownloadUrl(filePath);

    // Guardar la URL del documento en el campo correspondiente en Firestore
    const path = `usuarios/${userId}`;
    const field = `${tipo}Url`; // ejemplo: 'clubesUrl'
    await this.firebaseService.updateDocument(path, { [field]: downloadUrl });

    console.log(`Documento de ${tipo} subido:`, downloadUrl);
  } catch (error) {
    console.error(`Error al subir el archivo de ${tipo}:`, error);
  } finally {
    await loading.dismiss();
    this.uploadProgress = null;
  }
}

}
