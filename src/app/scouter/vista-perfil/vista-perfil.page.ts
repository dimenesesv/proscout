import { Component, OnInit, OnDestroy, Input, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import Swiper from 'swiper';
import { Notificacion } from 'src/app/interfaces/notificacion';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { CorreoService } from 'src/app/services/correo.service';

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
  showAllStats: boolean = false;
  statsFocused: boolean = false;
  allStatsKeys = [
    { key: 'velocidad', label: 'Velocidad', color: '#00ffae' },
    { key: 'resistencia', label: 'Resistencia', color: '#fdb71a' },
    { key: 'fuerza', label: 'Fuerza', color: '#f44292' },
    { key: 'agilidad', label: 'Agilidad', color: '#39a0ff' },
    { key: 'equilibrio', label: 'Equilibrio', color: '#ff7f50' },
    { key: 'coordinacion', label: 'Coordinación', color: '#b388ff' },
    { key: 'salto', label: 'Salto', color: '#ffb300' },
    { key: 'controlBalon', label: 'Control de balón', color: '#00e676' },
    { key: 'regate', label: 'Regate', color: '#ff4081' },
    { key: 'pase', label: 'Pase', color: '#2979ff' },
    { key: 'tiro', label: 'Tiro', color: '#ff1744' },
    { key: 'cabeceo', label: 'Cabeceo', color: '#ffd600' }
  ];
  statsCardInView: boolean = false;
  private statsCardObserver: IntersectionObserver | null = null;

  mostrarEstrellas: boolean = false;
  evaluacion: number = 0;
  estrellas: number[] = [1, 2, 3, 4, 5, 6, 7];

  promedioCalificacion: number = 0;
  totalCalificaciones: number = 0;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private location: Location,
    private router: Router,
    private modalCtrl: ModalController,
    private ngZone: NgZone,
    private notificacionesService: NotificacionesService,
    private correoService: CorreoService
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
      const data = await this.firebaseService.getDocument(`usuarios/${this.userId}`);
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
      const scouterUid = await this.firebaseService.getCurrentUserUid();
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

      // Cargar promedio de calificaciones
      await this.cargarPromedioCalificacion();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[VistaPerfilPage] Error al cargar datos:', err);
      this.errorMsg = 'Error al cargar el perfil. Intenta más tarde.';
      if (this.isModal) this.closeModal();
      this.isLoading = false;
    }
  }

  async cargarPromedioCalificacion() {
    try {
      const db = (await import('firebase/firestore')).getFirestore();
      const q = (await import('firebase/firestore')).query(
        (await import('firebase/firestore')).collection(db, 'evaluacion'),
        (await import('firebase/firestore')).where('jugadorId', '==', this.userId)
      );
      const snapshot = await (await import('firebase/firestore')).getDocs(q);
      let suma = 0;
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data['calificacion'] === 'number') {
          suma += data['calificacion'];
          total++;
        }
      });
      this.promedioCalificacion = total > 0 ? (suma / total) : 0;
      this.totalCalificaciones = total;
    } catch (e) {
      this.promedioCalificacion = 0;
      this.totalCalificaciones = 0;
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
    if (this.statsCardObserver) {
      this.statsCardObserver.disconnect();
      this.statsCardObserver = null;
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
      // Usar NotificacionesService para notificar
      await this.notificacionesService.notificarFavorito(jugadorUid, scouterUid);
    }
    alert('¡Jugador agregado a favoritos!');
    this.router.navigate(['/scouter/scouter/favoritos']);
  }

  async eliminarDeFavoritos() {
    const scouterUid = await this.firebaseService.getCurrentUserUid();
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

  async enviarMensaje() {
    // Lógica para enviar mensaje (puedes mostrar un toast, modal, o navegar a chat)
    console.log('Enviar mensaje al usuario');
    const scouterUid = await this.firebaseService.getCurrentUserUid();
    const jugadorUid = this.userId;
    if (scouterUid && jugadorUid) {
      await this.notificacionesService.notificarContacto(jugadorUid, scouterUid);
      // Enviar correo si el jugador tiene email
      const jugadorDoc = await this.firebaseService.getDocument(`usuarios/${jugadorUid}`);
      const scouterDoc = await this.firebaseService.getDocument(`usuarios/${scouterUid}`);
      const destinatario = jugadorDoc?.correo;
      // Obtiene el nombre del scouter desde la raíz o desde el objeto scouter
      const nombreScouter = scouterDoc?.nombre || scouterDoc?.scouter?.nombre || 'Un scouter';
      if (destinatario) {
        const asunto = 'Un scouter quiere contactarte en ProScout';
        const mensaje = `${nombreScouter} está interesado en contactarte. ¡Revisa la app para más detalles!`;
        console.log('[VistaPerfilPage] Enviando correo a:', { destinatario, asunto, mensaje });
        try {
          await this.correoService.enviarCorreoContacto(destinatario, asunto, mensaje);
        } catch (e) {
          console.error('Error enviando correo de contacto:', e);
        }
      } else {
        console.warn('[VistaPerfilPage] El jugador no tiene correo, no se enviará correo. UID:', jugadorUid, jugadorDoc);
      }
      alert('Se ha notificado al jugador que quieres contactarlo.');
    } else {
      alert('No se pudo obtener el usuario actual o el perfil.');
    }
  }

  async onSeguirClick() {
    const scouterUid = await this.firebaseService.getCurrentUserUid();
    const jugadorUid = this.userId;
    if (scouterUid && jugadorUid) {
      await this.agregarAFavoritos(scouterUid, jugadorUid);
      this.esFavorito = true;
    } else {
      alert('No se pudo obtener el usuario current or el perfil.');
    }
  }

  toggleStats() {
    this.showAllStats = !this.showAllStats;
  }

  calcularEdad(fechaNacimiento?: string): string {
    if (!fechaNacimiento) return '-';
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return '-';
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad.toString();
  }

  ngAfterViewInit() {
    const statsCard = document.querySelector('.perfil-stats-card');
    if (statsCard) {
      this.statsCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.ngZone.run(() => {
            this.statsCardInView = entry.isIntersecting;
          });
        });
      }, { threshold: 0.25 });
      this.statsCardObserver.observe(statsCard);
    }
  }

  abrirModalEvaluarPerfil() {
    this.mostrarEstrellas = true;
  }

  setEvaluacion(valor: number) {
    this.evaluacion = valor;
  }

  async guardarEvaluacion() {
    if (!this.userId || this.evaluacion < 1) {
      alert('Selecciona una evaluación válida.');
      return;
    }
    // Aquí puedes guardar la evaluación en Firestore o donde corresponda
    try {
      await this.firebaseService.updateDocument(`usuarios/${this.userId}`, { evaluacion: this.evaluacion });
      alert('¡Evaluación guardada!');
      this.mostrarEstrellas = false;
    } catch (e) {
      alert('Error al guardar la evaluación.');
    }
  }

  async enviarCalificacion() {
    if (!this.userId || this.evaluacion < 1) {
      alert('Selecciona una calificación válida.');
      return;
    }
    try {
      const scouterUid = await this.firebaseService.getCurrentUserUid();
      if (!scouterUid) {
        alert('No se pudo identificar al scouter.');
        return;
      }
      // Guardar la calificación en la colección 'evaluacion' en Firestore
      const db = (await import('firebase/firestore')).getFirestore();
      const docRef = (await import('firebase/firestore')).doc(db, 'evaluacion', `${this.userId}_${scouterUid}`);
      const fecha = new Date();
      await (await import('firebase/firestore')).setDoc(docRef, {
        jugadorId: this.userId,
        scouterId: scouterUid,
        calificacion: this.evaluacion,
        fecha: fecha
      });
      // Obtener nombre del scouter
      const scouterDoc = await this.firebaseService.getDocument(`usuarios/${scouterUid}`);
      const nombreScouter = scouterDoc?.nombre || scouterDoc?.scouter?.nombre || 'Un scouter';
      // Notificar al jugador
      await this.notificacionesService.notificarCalificacion(
        this.userId,
        scouterUid,
        nombreScouter,
        this.evaluacion,
        fecha
      );
      alert('¡Calificación enviada!');
      this.mostrarEstrellas = false;
    } catch (e) {
      alert('Error al enviar la calificación.');
    }
  }

  cancelarEvaluacion() {
    this.mostrarEstrellas = false;
    this.evaluacion = 0;
  }
}
