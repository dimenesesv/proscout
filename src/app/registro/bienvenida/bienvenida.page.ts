import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  standalone: false,
})
export class BienvenidaPage {

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  async irAHOME() {
    const user = await this.afAuth.currentUser;
    if (!user) {
      this.router.navigate(['/login']); // fallback si no hay sesión
      return;
    }

    const userId = user.uid;
    const path = `usuarios/${userId}`;

    this.firebaseService.getDocument(path)
      .then((data) => {
        if (data?.esScouter) {
          this.router.navigate(['/scouter/scouter/mapa']);
        } else if (data?.esJugador) {
          this.router.navigate(['/player/player/tab1']);
        } else {
          this.router.navigate(['/tabs/tab1']);
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos del usuario:', error);
        this.router.navigate(['/tabs/tab1']);
      });
  }
}