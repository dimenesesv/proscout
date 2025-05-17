import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification, Auth } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private get auth(): Auth {
    return getAuth();
  }

  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async logout() {
    try {
      return await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.sendEmailVerification();
      return userCredential;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  async sendEmailVerification() {
    const user = this.auth.currentUser;
    if (user) {
      return sendEmailVerification(user);
    } else {
      throw new Error('No hay un usuario autenticado para enviar el correo de verificación.');
    }
  }

  async getCurrentUser() {
    return this.auth.currentUser;
  }
}