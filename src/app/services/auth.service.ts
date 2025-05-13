import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // ---- Inicia sesión de un usuario con correo y contraseña
  async login(email: string, password: string) {
    try {
      return await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // ---- Cierra la sesión del usuario actualmente autenticado
  async logout() {
    try {
      return await this.afAuth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // ---- Registra un nuevo usuario con correo y contraseña, y envía un correo de verificación
  async register(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await this.sendEmailVerification();
      return userCredential;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // ---- Envía un correo de verificación al usuario actualmente autenticado
  async sendEmailVerification() {
    const user = await this.afAuth.currentUser;
    if (user) {
      return user.sendEmailVerification();
    } else {
      throw new Error('No hay un usuario autenticado para enviar el correo de verificación.');
    }
  }

  async getCurrentUser() {
    return await this.afAuth.currentUser;
  }
}