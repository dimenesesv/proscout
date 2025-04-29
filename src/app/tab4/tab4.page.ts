import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Subscription } from 'rxjs';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit, OnDestroy {

  userProfile: any;
  private profileSubscription: Subscription | undefined;

  constructor(private firebaseService: FirebaseService) {}

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
}
