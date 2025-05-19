import { Component } from '@angular/core';
import { GeoPoint } from 'firebase/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.guardarUbicacionSiEsPosible();
  }

  async guardarUbicacionSiEsPosible() {
    const auth = await import('firebase/auth');
    const user = auth.getAuth().currentUser;
    if (!user) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const ubicacion = new GeoPoint(position.coords.latitude, position.coords.longitude);
      try {
        await this.firebaseService.updateDocument(`usuarios/${user.uid}`, { ubicacion });
      } catch (e) {
        // Silenciar error, no es crítico
      }
    });
  }
}
