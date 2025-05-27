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

  async agregarAFavoritos(scouterUid: string, jugadorUid: string) {
    // Actualiza favoritos del scouter (asumiendo que ya tienes esta lógica)
    const db = (await import('firebase/firestore')).getFirestore();
    const scouterRef = (await import('firebase/firestore')).doc(db, 'scouters', scouterUid);
    const scouterSnap = await (await import('firebase/firestore')).getDoc(scouterRef);
    let favoritos: string[] = [];
    if (scouterSnap.exists()) {
      const data = scouterSnap.data() as any;
      favoritos = Array.isArray(data.favoritos) ? data.favoritos : [];
    }
    if (!favoritos.includes(jugadorUid)) {
      favoritos.push(jugadorUid);
      await (await import('firebase/firestore')).updateDoc(scouterRef, { favoritos });
    }
    // --- NUEVO: Actualiza favoritos del jugador ---
    const jugadorRef = (await import('firebase/firestore')).doc(db, 'usuarios', jugadorUid);
    const jugadorSnap = await (await import('firebase/firestore')).getDoc(jugadorRef);
    let favoritosJugador: string[] = [];
    if (jugadorSnap.exists()) {
      const data = jugadorSnap.data() as any;
      favoritosJugador = Array.isArray(data.favoritos) ? data.favoritos : [];
    }
    if (!favoritosJugador.includes(scouterUid)) {
      favoritosJugador.push(scouterUid);
      await (await import('firebase/firestore')).updateDoc(jugadorRef, { favoritos: favoritosJugador });
    }
  }

}
