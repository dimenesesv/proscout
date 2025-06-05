import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private afAuth: AngularFireAuth) {}

  canActivate(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const isMobile = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';

      if (isMobile) {
        console.log('[AuthGuard] Plataforma móvil detectada. Intentando obtener usuario con plugin nativo...');
        for (let i = 0; i < 5; i++) {
          const { user } = await FirebaseAuthentication.getCurrentUser();
          console.log(`[AuthGuard] Intento ${i + 1} - Usuario:`, user);
          if (user) {
            // Verificar si el usuario está activo
            const { FirebaseService } = await import('src/app/services/firebase.service');
            const firebaseService = new FirebaseService(undefined as any); // DI si es posible
            const userData = await firebaseService.getDocument(`usuarios/${user.uid}`);
            if (userData && userData.activo === false) {
              console.warn('[AuthGuard] Usuario no activo (móvil). Redirigiendo a /registro/bienvenida');
              this.router.navigate(['/registro/bienvenida']);
              return resolve(false);
            }
            return resolve(true);
          }
          await new Promise((res) => setTimeout(res, 200));
        }
        console.warn('[AuthGuard] Usuario no encontrado tras múltiples intentos. Redirigiendo a /login');
        this.router.navigate(['/login']);
        return resolve(false);
      } else {
        console.log('[AuthGuard] Plataforma web detectada. Usando AngularFireAuth.authState...');
        const sub = this.afAuth.authState.subscribe(async user => {
          sub.unsubscribe();
          console.log('[AuthGuard] Usuario detectado en web:', user);
          if (user) {
            // Verificar si el usuario está activo
            const { FirebaseService } = await import('src/app/services/firebase.service');
            const firebaseService = new FirebaseService(undefined as any); // DI si es posible
            const userData = await firebaseService.getDocument(`usuarios/${user.uid}`);
            if (userData && userData.activo === false) {
              console.warn('[AuthGuard] Usuario no activo. Redirigiendo a /registro/bienvenida');
              this.router.navigate(['/registro/bienvenida']);
              resolve(false);
              return;
            }
            resolve(true);
          } else {
            console.warn('[AuthGuard] Usuario no autenticado. Redirigiendo a /login');
            this.router.navigate(['/login']);
            resolve(false);
          }
        });
      }
    });
  }
}