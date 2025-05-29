import { Component, OnInit, OnDestroy, Input, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import Swiper from 'swiper';
import { Notificacion } from 'src/app/interfaces/notificacion';

@Component({
  selector: 'app-vista-perfil',
  templateUrl: './vista-perfil.page.html',
  styleUrls: ['./vista-perfil.page.scss'],
  standalone: false,
})
export class VistaPerfilPage implements OnInit, OnDestroy {
  @Input() userId: string | null = null;
  userData: any = null;
  activeTab: number = 0;
  swiper: Swiper | undefined;
  isModal = false;
  errorMsg: string | null = null;
  isLoading: boolean = true;
  // Manejo de errores para los componentes hijos
  perfilCardError = false;
  estadisticasCardError = false;
  galeriaCardError = false;
  private paramSub: any;

  perfilScouter: any = null;
  biografia: string = '';
  nuevoEquipo: string = '';
  nuevoLogro: string = '';
  uploadProgress: number | null = null;
  loadedImages: { [url: string]: boolean } = {};
  esFavorito: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private location: Location,
    private router: Router,
    private modalCtrl: ModalController,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    // Suscribirse a cambios de parámetro para recargar el perfil si cambia el id
    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      this.userId = id;
      this.userData = null;
      this.errorMsg = null;
      this.perfilCardError = false;
      this.estadisticasCardError = false;
      this.galeriaCardError = false;

      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = undefined;
      }

      this.loadUserData();
    });
    // Si es modal, usar el @Input userId
    if (this.userId && !this.paramSub) {
      this.isModal = true;
      this.loadUserData();
    }
  }

  private async loadUserData() {
    this.isLoading = true;
    this.userData = null;
    this.errorMsg = null;
    this.perfilCardError = false;
    this.estadisticasCardError = false;
    this.galeriaCardError = false;
    let timeoutId: any;
    try {
      console.log('[VistaPerfilPage] Iniciando carga de perfil para', this.userId);
      // Timeout de 8 segundos
      timeoutId = setTimeout(() => {
        this.errorMsg = 'La carga del perfil está tardando demasiado. Intenta más tarde.';
        console.error('[VistaPerfilPage] Timeout al cargar perfil');
        if (this.isModal) this.closeModal();
        this.isLoading = false;
      }, 8000);
      const data = await this.firebaseService.getDocument(`playground/${this.userId}`);
      clearTimeout(timeoutId);
      if (!data) {
        this.errorMsg = 'No se encontró el perfil.';
        if (this.isModal) this.closeModal();
        this.isLoading = false;
        return;
      }
      // Inicializa campos opcionales para evitar errores en el template
      if (!data.galeria) data.galeria = [];
      if (!data.stats) data.stats = {};
      if (!data.info) data.info = {};
      this.ngZone.run(() => {
        this.userData = data;
        setTimeout(() => this.initSwiper(), 0);
        this.isLoading = false;
      });
      console.log('[VistaPerfilPage] Perfil cargado correctamente', data);

      // --- Lógica para saber si el jugador está en favoritos ---
      const scouterUid = this.firebaseService.getCurrentUserUid && this.firebaseService.getCurrentUserUid();
      if (scouterUid && this.userId) {
        const scouterDoc = await this.firebaseService.getDocument(`usuarios/${scouterUid}`);
        const favoritos: string[] = scouterDoc?.scouter?.favoritos || [];
        this.esFavorito = favoritos.includes(this.userId);
        console.log('[VistaPerfilPage] ¿Es favorito?', this.esFavorito, 'Favoritos:', favoritos);
      } else {
        this.esFavorito = false;
      }

      if (this.userData && this.userData.esScouter) {
        this.perfilScouter = {
          equiposHistorial: this.userData.equiposHistorial || [],
          tituloUrl: this.userData.tituloUrl || '',
          logros: this.userData.logros || []
        };
        this.biografia = this.userData.biografia || '';
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[VistaPerfilPage] Error al cargar datos:', err);
      this.errorMsg = 'Error al cargar el perfil. Intenta más tarde.';
      if (this.isModal) this.closeModal();
      this.isLoading = false;
    }
  }

  initSwiper() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }
    this.swiper = new Swiper('.swiper-container', {
      initialSlide: this.activeTab,
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      on: {
        slideChange: () => {
          this.activeTab = this.swiper?.activeIndex || 0;
        }
      }
    });
  }

  slideTo(index: number) {
    this.activeTab = index;
    if (this.swiper) {
      this.swiper.slideTo(index);
    }
  }

  goBack() {
    if (this.isModal) {
      this.closeModal();
    } else {
      this.location.back(); // Volver a la página anterior sin recargar el mapa
    }
  }

  async closeModal() {
    await this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.paramSub) this.paramSub.unsubscribe();
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }
  }

  agregarEquipo() {
    if (this.nuevoEquipo && this.perfilScouter) {
      this.perfilScouter.equiposHistorial.push(this.nuevoEquipo);
      this.nuevoEquipo = '';
    }
  }

  agregarLogro() {
    if (this.nuevoLogro && this.perfilScouter) {
      this.perfilScouter.logros.push(this.nuevoLogro);
      this.nuevoLogro = '';
    }
  }

  subirArchivoCertificacion(event: any) {
    // Solo placeholder, aquí iría la lógica real de subida
    alert('Subida de archivo no implementada en este mockup.');
  }

  async selectImage() {
    if (!this.userId) {
      alert('No se ha encontrado el usuario.');
      return;
    }
    // Crear input file dinámicamente
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file: File = event.target.files[0];
      if (!file) return;
      this.uploadProgress = 0;
      try {
        // Usar storageService.uploadUserGalleryImage con progreso
        const updatedGallery = await (this as any).storageService.uploadUserGalleryImage(
          this.userId,
          file,
          this.firebaseService,
          (progress: number) => {
            this.ngZone.run(() => {
              this.uploadProgress = progress / 100;
            });
          }
        );
        // Actualizar galería en el objeto userData
        this.ngZone.run(() => {
          this.userData.galeria = updatedGallery;
          this.uploadProgress = null;
        });
      } catch (err) {
        this.uploadProgress = null;
        alert('Error al subir la imagen. Intenta nuevamente.');
        console.error('[VistaPerfilPage] Error al subir imagen:', err);
      }
    };
    input.click();
  }
  onImgWillLoad(url: string) {
    this.loadedImages[url] = false;
  }
  onImgDidLoad(url: string) {
    this.loadedImages[url] = true;
  }

  async agregarAFavoritos(scouterUid: string, jugadorUid: string) {
    // Actualiza favoritos del scouter (dentro del objeto scouter del usuario)
    const db = (await import('firebase/firestore')).getFirestore();
    const scouterRef = (await import('firebase/firestore')).doc(db, 'usuarios', scouterUid);
    const scouterSnap = await (await import('firebase/firestore')).getDoc(scouterRef);
    let scouterData = scouterSnap.exists() ? scouterSnap.data() : {};
    let scouterInfo = scouterData['scouter'] || {};
    let favoritos: string[] = Array.isArray(scouterInfo.favoritos) ? scouterInfo.favoritos : [];
    if (!favoritos.includes(jugadorUid)) {
      favoritos.push(jugadorUid);
      await (await import('firebase/firestore')).updateDoc(scouterRef, { 'scouter.favoritos': favoritos });
      // Crear notificación usando la interfaz Notificacion
      const notificacion: Notificacion = {
        id: '', // Firestore lo asigna
        tipo: 'actividad',
        contenido: `¡Un scouter te ha añadido a favoritos!`,
        fecha: new Date(),
        leida: false,
        remitenteId: scouterUid,
        destinatarioId: jugadorUid,
        prioridad: 'media',
      };
      console.log('[DEBUG][VistaPerfilPage] Notificación a guardar:', notificacion);
      // Guardar notificación en Firestore
      const notificacionesRef = (await import('firebase/firestore')).collection(db, 'notificaciones');
      const docRef = await (await import('firebase/firestore')).addDoc(notificacionesRef, notificacion);
      console.log('[DEBUG][VistaPerfilPage] Notificación guardada con ID:', docRef.id);
    }
    alert('¡Jugador agregado a favoritos!');
    this.router.navigate(['/scouter/scouter/favoritos']);
  }

  async eliminarDeFavoritos() {
    const scouterUid = this.firebaseService.getCurrentUserUid && this.firebaseService.getCurrentUserUid();
    const jugadorUid = this.userId;
    if (!scouterUid || !jugadorUid) {
      alert('No se pudo obtener el usuario actual o el perfil.');
      return;
    }
    const db = (await import('firebase/firestore')).getFirestore();
    const scouterRef = (await import('firebase/firestore')).doc(db, 'usuarios', scouterUid);
    const scouterSnap = await (await import('firebase/firestore')).getDoc(scouterRef);
    let scouterData = scouterSnap.exists() ? scouterSnap.data() : {};
    let scouterInfo = scouterData['scouter'] || {};
    let favoritos: string[] = Array.isArray(scouterInfo.favoritos) ? scouterInfo.favoritos : [];
    if (favoritos.includes(jugadorUid)) {
      favoritos = favoritos.filter(id => id !== jugadorUid);
      await (await import('firebase/firestore')).updateDoc(scouterRef, { 'scouter.favoritos': favoritos });
      this.esFavorito = false;
      alert('Jugador eliminado de favoritos.');
    } else {
      alert('El jugador no estaba en favoritos.');
    }
  }

  onSeguirClick() {
    const scouterUid = this.firebaseService.getCurrentUserUid && this.firebaseService.getCurrentUserUid();
    const jugadorUid = this.userId;
    if (scouterUid && jugadorUid) {
      this.agregarAFavoritos(scouterUid, jugadorUid).then(() => {
        this.esFavorito = true;
      });
    } else {
      alert('No se pudo obtener el usuario actual o el perfil.');
    }
  }
}
