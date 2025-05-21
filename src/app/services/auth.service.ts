import { Injectable, NgZone } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification, Auth, UserCredential, setPersistence, browserLocalPersistence, signInWithCustomToken } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(getApps().length ? getApp() : initializeApp(environment.firebaseConfig));

  constructor(private ngZone: NgZone, private router: Router) {}

  async login(email: string, password: string) {
    try {
      if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
        console.log('[AuthService] Usando plugin nativo de Firebase');
        // La persistencia en móviles ya es gestionada automáticamente por el SDK nativo
        const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
        console.log('Login nativo exitoso:', result);
        return { user: { uid: result.user?.uid }
}
      } else {
        console.log('[AuthService] Usando Firebase Web SDK');
        await setPersistence(this.auth, browserLocalPersistence);
        const result = await signInWithEmailAndPassword(this.auth, email, password);
        console.log('Login web exitoso:', result);
        return result;
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async logout() {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      try {
        await FirebaseAuthentication.signOut();
        console.log('[AuthService] Logout nativo exitoso');
      } catch (error) {
        console.error('[AuthService] Error en logout nativo:', error);
        throw error;
      }
    } else {
      return signOut(this.auth);
    }
  }

  async register(email: string, password: string) {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      try {
        const result = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
        console.log('[AuthService] Registro nativo exitoso:', result);
        return { user: { uid: result.user?.uid } };
      } catch (error) {
        console.error('[AuthService] Error en registro nativo:', error);
        throw error;
      }
    } else {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.sendEmailVerification();
      return userCredential;
    }
  }

  async sendEmailVerification() {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      // No soportado por el plugin nativo actualmente
      console.warn('[AuthService] sendEmailVerification no soportado en móvil nativo');
      return;
    } else {
      const user = this.auth.currentUser;
      if (user) {
        return sendEmailVerification(user);
      } else {
        throw new Error('No hay un usuario autenticado para enviar el correo de verificación.');
      }
    }
  }

  async getCurrentUser() {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      try {
        const result = await FirebaseAuthentication.getCurrentUser();
        return result.user;
      } catch (error) {
        console.error('[AuthService] Error en getCurrentUser nativo:', error);
        return null;
      }
    } else {
      return this.auth.currentUser;
    }
  }

  /**
   * Realiza login, obtiene datos de usuario en Firestore y redirige según rol.
   * Devuelve true si redirige correctamente, lanza error si falla.
   * Usa el SDK web puro para login.
   */
  async loginAndRedirect(email: string, password: string, firebaseService: any): Promise<boolean> {
    console.log('[AuthService] loginAndRedirect() llamado con:', email);
    try {
      const result = await this.login(email, password);
      console.log('[AuthService] Resultado de login:', result);
      let uid: string | undefined;
      if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
        uid = result.user?.uid || result.user?.uid;
      } else {
        uid = result.user?.uid;
      }
      console.log('[AuthService] UID obtenido:', uid);
      if (!uid) throw new Error('No se pudo obtener el UID del usuario.');
      const path = `usuarios/${uid}`;
      const userData = await firebaseService.getDocument(path);
      console.log('[AuthService] Resultado de getDocument:', userData);
      if (userData) {
        console.log('[AuthService] userData.esJugador:', userData.esJugador, 'userData.esScouter:', userData.esScouter);
        if (userData.esJugador) {
          this.ngZone.run(() => {
            console.log('[AuthService] Redirigiendo a /player/player/tab1');
            setTimeout(() => {
              this.router.navigate(['/player/player/tab1']).catch((err: any) => {
                console.error('[AuthService] Error en router.navigate:', err);
              });
            }, 300);
          });
          return true;
        } else if (userData.esScouter) {
          this.ngZone.run(() => {
            console.log('[AuthService] Redirigiendo a /scouter/scouter/mapa');
            setTimeout(() => {
              this.router.navigate(['/scouter/scouter/mapa']).catch((err: any) => {
                console.error('[AuthService] Error en router.navigate:', err);
              });
            }, 300);
          });
          return true;
        } else {
          this.ngZone.run(() => {
            console.warn('[AuthService] Rol de usuario no reconocido, redirigiendo a /error');
            setTimeout(() => {
              this.router.navigate(['/error']);
            }, 300);
          });
          throw new Error('Rol de usuario no reconocido.');
        }
      } else {
        this.ngZone.run(() => {
          console.warn('[AuthService] userData null, redirigiendo a /error');
          setTimeout(() => {
            this.router.navigate(['/error']);
          }, 300);
        });
        throw new Error('No se encontraron datos de usuario en Firestore.');
      }
    } catch (error) {
      console.error('[AuthService] Error en loginAndRedirect:', error);
      throw error;
    }
  }
}