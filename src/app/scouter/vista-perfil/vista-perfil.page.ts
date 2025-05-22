import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Location } from '@angular/common';
import Swiper from 'swiper';

@Component({
  selector: 'app-vista-perfil',
  templateUrl: './vista-perfil.page.html',
  styleUrls: ['./vista-perfil.page.scss'],
  standalone: false,
})
export class VistaPerfilPage implements OnInit {
  userId: string | null = null;
  userData: any = null;
  activeTab: number = 0;
  swiper: Swiper | undefined;

  constructor(private route: ActivatedRoute, private firebaseService: FirebaseService, private location: Location, private router: Router) { }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.firebaseService.getDocument(`usuarios/${this.userId}`).then(data => {
        this.userData = data;
        setTimeout(() => this.initSwiper(), 0);
      });
    }
  }

  initSwiper() {
    if (this.swiper) return;
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
  console.log('Intentando navegar a /scouter/scouter/mapa');
  this.router.navigate(['/scouter/scouter/mapa']).then(ok => {
    console.log('Navegación completada:', ok);
  });
}

}
