import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Subscription } from 'rxjs';
import { getAuth, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import SwiperOptions from 'swiper';
import { Chart } from 'chart.js/auto';


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit, OnDestroy, AfterViewInit {

  userProfile: any;
  private profileSubscription: Subscription | undefined;

  activeTab: number = 0;
  swiper: Swiper | undefined;

  constructor(
    private firebaseService: FirebaseService,
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
      })
      .catch((error) => {
        console.error('Error al obtener el perfil del usuario:', error);
      });
  }

  ngAfterViewInit() {
    // Configuración básica de Swiper
    this.swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 10,
    });
  
    // Evento básico para actualizar el índice activo
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
}