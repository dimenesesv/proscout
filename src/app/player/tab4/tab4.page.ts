import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { StorageService } from '../../services/storage.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Usuario } from 'src/app/interfaces/usuario';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Cropper from 'cropperjs';
import imageCompression from 'browser-image-compression';

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

  // Variables para el ajuste de foto
  showAjusteFoto = false;
  ajusteFotoUrl: string | null = null;
  ajusteFotoFile: File | null = null;
  cropper: Cropper | null = null;
  cropperReady = false;

  // --- PROPIEDADES Y MÉTODOS PARA LA UI DEL PERFIL (GALERÍA Y ESTADÍSTICAS) ---
  get userData() {
    return this.perfilUsuario;
  }
  loadedImages: { [url: string]: boolean } = {};
  showAllStats = false;
  allStatsKeys = [
    { key: 'velocidad', label: 'Velocidad', color: '#39ff14' },
    { key: 'resistencia', label: 'Resistencia', color: '#00bcd4' },
    { key: 'fuerza', label: 'Fuerza', color: '#ff9800' },
    { key: 'agilidad', label: 'Agilidad', color: '#e91e63' },
    { key: 'equilibrio', label: 'Equilibrio', color: '#9c27b0' },
    { key: 'coordinacion', label: 'Coordinación', color: '#3f51b5' },
    { key: 'salto', label: 'Salto', color: '#8bc34a' },
    { key: 'controlBalon', label: 'Control Balón', color: '#ffc107' },
    { key: 'regate', label: 'Regate', color: '#f44336' },
    { key: 'pase', label: 'Pase', color: '#00bcd4' },
    { key: 'tiro', label: 'Tiro', color: '#ff9800' },
    { key: 'cabeceo', label: 'Cabeceo', color: '#9c27b0' },
  ];
  statsCardInView = true;

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
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }
  }

  slideTo(index: number) {
    this.activeTab = index;
    this.swiper?.slideTo(index);
  }

  async logout() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Cambia selectImage para abrir el flujo de crop directamente
  async selectImage() {
    this.abrirAjusteFoto();
  }

  abrirAjusteFoto() {
    this.showAjusteFoto = true;
    this.ajusteFotoUrl = null;
    this.ajusteFotoFile = null;
    this.cropperReady = false;
    setTimeout(() => {
      // Dispara el input file automáticamente
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = '';
      if (input) input.click();
    }, 100);
  }

  cancelarAjusteFoto() {
    this.showAjusteFoto = false;
    this.ajusteFotoUrl = null;
    this.ajusteFotoFile = null;
    this.cropperReady = false;
    if (this.cropper) {
      // Cropper v2.x: no destroy(), simplemente elimina la referencia
      this.cropper = null;
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.ajusteFotoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ajusteFotoUrl = e.target.result;
      setTimeout(() => this.initCropper(), 100); // Espera a que la imagen esté en el DOM
    };
    reader.readAsDataURL(file);
  }

  initCropper() {
    if (this.cropper) {
      this.cropper = null;
    }
    const image = document.querySelector<HTMLImageElement>('img[alt="Ajuste previo"]');
    if (image) {
      // Forzar uso de opciones avanzadas aunque TypeScript no las tipa
      this.cropper = new (Cropper as any)(image, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        dragMode: 'move',
        zoomable: true,
        scalable: false,
        cropBoxResizable: false,
        minCropBoxWidth: 200,
        minCropBoxHeight: 200
      });
      this.cropperReady = true;
    }
  }

  async comprimirYSubirFoto() {
    if (!this.cropper || !this.ajusteFotoFile) return;
    const cropperCanvas = this.cropper.getCropperCanvas();
    if (!cropperCanvas) return;
    const canvas = await cropperCanvas.$toCanvas({ width: 800, height: 800 });
    canvas.toBlob(async (croppedBlob: Blob | null) => {
      if (!croppedBlob) return;
      // Convertir Blob a File para browser-image-compression
      const fileName = this.ajusteFotoFile ? this.ajusteFotoFile.name : 'cropped.jpg';
      const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
      const compressedFile = await imageCompression(croppedFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      });
      // Llama a la función de subida real
      await this.subirImagenGaleria(compressedFile as File);
      this.cancelarAjusteFoto();
    }, 'image/jpeg', 0.9);
  }

  // Nueva función para subir la imagen comprimida a la galería
  async subirImagenGaleria(file: File) {
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
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadProgress = progress / 100;
        loading.message = `Subiendo imagen... ${Math.round(progress)}%`;
      });
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

  updateGalleryInFirestore(userId: string) {
    const path = `usuarios/${userId}`;
    this.firebaseService.updateDocument(path, { gallery: this.galleryUrls })
      .then(() => {
        console.log('Galería actualizada en Firestore');
      })
      .catch((error) => {
        console.error('Error al actualizar la galería en Firestore:', error);
      });
  }

  goToConfiguracion() {
    this.router.navigate(['../scouter/configuracion']);
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  onImgWillLoad(url: string) {
    this.loadedImages[url] = false;
  }
  onImgDidLoad(url: string) {
    this.loadedImages[url] = true;
  }
  toggleStats() {
    this.showAllStats = !this.showAllStats;
  }
  enviarMensaje() {
    // Implementa lógica de mensajería aquí
    alert('Funcionalidad de mensajería próximamente');
  }
  onSeguirClick() {
    // Implementa lógica de favoritos aquí
    alert('Funcionalidad de favoritos próximamente');
  }
}
