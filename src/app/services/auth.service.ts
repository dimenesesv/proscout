import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private ngZone: NgZone, private router: Router) {}

  // --- Utilidades ---
  private isMobile(): boolean {
    const platform = Capacitor.getPlatform();
    return platform === 'ios' || platform === 'android';
  }

  private redirect(route: string[]) {
    this.ngZone.run(() => {
      setTimeout(() => {
        this.router.navigate(route);
      }, 300);
    });
  }

  private redirectWithError() {
    this.redirect(['/error']);
  }

  // --- Métodos de Autenticación ---
  async login(email: string, password: string) {
    if (this.isMobile()) {
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
      return { user: { uid: result.user?.uid } };
    } else {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return { user: userCredential.user };
    }
  }

  async logout() {
    if (this.isMobile()) {
      await FirebaseAuthentication.signOut();
    } else {
      await this.afAuth.signOut();
    }
  }

  async register(email: string, password: string) {
    if (this.isMobile()) {
      const result = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
      return { user: { uid: result.user?.uid } };
    } else {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await this.sendEmailVerification();
      return { user: userCredential.user };
    }
  }

  async sendEmailVerification() {
    if (this.isMobile()) return Promise.resolve();
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('No hay un usuario autenticado para enviar el correo de verificación.');
    return user.sendEmailVerification();
  }

  async getCurrentUser() {
    if (this.isMobile()) {
      try {
        const result = await FirebaseAuthentication.getCurrentUser();
        return result.user ?? null;
      } catch {
        return null;
      }
    } else {
      return this.afAuth.currentUser;
    }
  }

  // --- Iniciar sesión y redirigir por rol ---
  async loginAndRedirect(email: string, password: string, firebaseService: any): Promise<boolean> {
    const result = await this.login(email, password);
    const uid = result.user?.uid;
    if (!uid) throw new Error('No se pudo obtener el UID del usuario.');
    const path = `usuarios/${uid}`;
    const userData = await firebaseService.getDocument(path);

    if (!userData) {
      this.redirectWithError();
      throw new Error('No se encontraron datos de usuario en Firestore.');
    }

    if (userData.esJugador) {
      this.redirect(['/player/player/tab1']);
      return true;
    }
    if (userData.esScouter) {
      this.redirect(['/scouter/scouter/mapa']);
      return true;
    }

    this.redirectWithError();
    throw new Error('Rol de usuario no reconocido.');
  }
}