import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Subscription } from 'rxjs';
import { getAuth, signOut } from 'firebase/auth';
import { Router } from '@angular/router'; // Asegúrate de importar Router
@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit, OnDestroy {

  userProfile: any;
  private profileSubscription: Subscription | undefined;

  constructor(private firebaseService: FirebaseService,
              private router: Router, // Asegúrate de importar Router
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
      .then(data => {
        this.userProfile = data;
      })
      .catch(error => {
        console.error('Error al obtener el perfil del usuario:', error);
      });
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  // Método para cerrar sesión
  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('Sesión cerrada correctamente');
      // Aquí podrías redirigir a otra página o realizar cualquier otra acción.
      this.router.navigate(['/login']); // Asegúrate de importar Router y agregarlo en el constructor
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}