import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private afAuth: AngularFireAuth, private firestore: Firestore) {
    // Force light mode globally for all pages
    if (typeof document !== 'undefined') {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
    this.afAuth.authState.subscribe(user => {
      if (user) {
        console.log('Usuario sigue logueado:', user.email);
        this.initializePush();
      } else {
        console.log('No hay usuario logueado');
      }
    });
  }

  initializePush() {
    // Solicita permisos y registra el dispositivo para notificaciones push
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    // Escucha el evento de registro y guarda el token FCM en Firestore
    PushNotifications.addListener('registration', async (token: Token) => {
      const user = await this.afAuth.currentUser;
      if (user) {
        const userRef = doc(this.firestore, `usuarios/${user.uid}`);
        await updateDoc(userRef, { fcmToken: token.value });
        console.log('Token FCM guardado en Firestore:', token.value);
      }
    });

    // Maneja errores de registro
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error al registrar notificaciones push:', error);
    });
  }
}
