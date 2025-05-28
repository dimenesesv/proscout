import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
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
    private route: ActivatedRoute,
    private ngZone: NgZone
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

  ngAfterViewInit() {
    setTimeout(() => this.ejecutarAnimacionesPerfil(), 100);
  }

  async ejecutarAnimacionesPerfil() {
    const { animate, stagger } = await import('@motionone/dom');
    // Animate main card (fade in + slide up)
    const card = document.querySelector('.profile-info-card-modern');
    if (card) {
      animate(card, { opacity: [0, 1], y: [40, 0] }, { duration: 0.7, easing: 'ease-out' });
    }
    // Animate profile image (pop in)
    const img = document.querySelector('.profile-img, .perfil-img');
    if (img) {
      animate(img, { scale: [0.7, 1.1, 1], opacity: [0, 1] }, { duration: 0.6, easing: 'ease-in-out' });
    }
    // Animate chips (staggered fade/slide)
    const chips = document.querySelectorAll('.profile-chips ion-chip');
    if (chips.length) {
      animate(chips, { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.08), duration: 0.4, easing: 'ease-out' });
    }
    // Animate detail rows (staggered fade/slide)
    const rows = document.querySelectorAll('.profile-detail-row');
    if (rows.length) {
      animate(rows, { opacity: [0, 1], x: [-30, 0] }, { delay: stagger(0.06), duration: 0.35, easing: 'ease-out' });
    }
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
        await this.uploadImage(file, true); // true = update profile pic
      }
    };
    input.click();
  }

  async uploadImage(file: File, isProfilePic: boolean = false) {
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
      message: isProfilePic ? 'Actualizando foto de perfil...' : 'Subiendo imagen...',
      spinner: 'crescent',
    });
    await loading.present();
    try {
      if (isProfilePic) {
        // Upload profile picture to a fixed path and update Firestore
        const filePath = `profile-pics/${userId}`;
        const url = await this.storageService.uploadImageAndGetUrl(filePath, file);
        this.perfilUsuario.fotoPerfil = url;
        await this.firebaseService.updateDocument(`usuarios/${userId}`, { fotoPerfil: url });
      } else {
        // ...existing gallery upload logic...
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
        setTimeout(() => this.ejecutarAnimacionesPerfil(), 200); // Animate again after upload
      }
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

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
    this.profileSubscription?.unsubscribe();
  }
}

// Force light mode globally for all pages
if (typeof document !== 'undefined') {
  document.body.classList.remove('dark');
  document.body.classList.add('light');
}
