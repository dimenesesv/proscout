import { Component, OnInit, OnDestroy, Input, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import Swiper from 'swiper';

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
}
