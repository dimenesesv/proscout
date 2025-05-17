import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  standalone: false,
})
export class BienvenidaPage {

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  irAHOME() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      this.router.navigate(['/tabs/tab1']); // fallback si no hay sesión
      return;
    }

    const userId = user.uid;
    const path = `usuarios/${userId}`;

    this.firebaseService.getDocument(path)
      .then((data) => {
        if (data?.isscouter) {
          this.router.navigate(['/scouter/scouter/tabs/tab1']);
        } else if (data?.isplayer) {
          this.router.navigate(['/player/player/tabs/tab1']);
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