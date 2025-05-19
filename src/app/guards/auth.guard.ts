import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const isMobile = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';

      if (isMobile) {
        console.log('[AuthGuard] Plataforma móvil detectada. Intentando obtener usuario con plugin nativo...');
        for (let i = 0; i < 5; i++) {
          const { user } = await FirebaseAuthentication.getCurrentUser();
          console.log(`[AuthGuard] Intento ${i + 1} - Usuario:`, user);
          if (user) {
            return resolve(true);
          }
          await new Promise((res) => setTimeout(res, 200));
        }
        console.warn('[AuthGuard] Usuario no encontrado tras múltiples intentos. Redirigiendo a /login');
        this.router.navigate(['/login']);
        return resolve(false);
      } else {
        console.log('[AuthGuard] Plataforma web detectada. Usando getAuth().onAuthStateChanged...');
        const auth = getAuth();
        const unsub = auth.onAuthStateChanged(user => {
          unsub();
          console.log('[AuthGuard] Usuario detectado en web:', user);
          if (user) {
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