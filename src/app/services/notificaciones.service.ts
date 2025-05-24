import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private afAuth = inject(AngularFireAuth);
  private firestore = inject(Firestore);

  // Obtiene las notificaciones para el scouter autenticado
  async getNotificacionesScouter(): Promise<any[]> {
    const user = await this.afAuth.currentUser;
    if (!user) return [];
    const notificacionesRef = collection(this.firestore, 'notificaciones');
    const q = query(notificacionesRef, where('uidScouter', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Envía una notificación a un jugador cuando un scouter lo añade a favoritos
  async notificarFavorito(uidJugador: string, uidScouter: string) {
    console.log('[NotificacionesService] notificarFavorito INICIO', { uidJugador, uidScouter });
    const notificacionesRef = collection(this.firestore, 'notificaciones');
    const data = {
      uidJugador,
      uidScouter,
      tipo: 'favorito',
      mensaje: '¡Un scouter te ha añadido a favoritos!',
      fecha: new Date(),
      leida: false
    };
    try {
      // Agrega la notificación a Firestore
      // @ts-ignore
      const docRef = await addDoc(notificacionesRef, data);
      console.log('[NotificacionesService] Notificación creada en Firestore', { docId: docRef.id, data });
    } catch (error) {
      console.error('[NotificacionesService] Error al crear notificación en Firestore', error, data);
      throw error;
    }
  }

  // Obtiene las notificaciones para el jugador autenticado
  async getNotificacionesJugador(): Promise<any[]> {
    const user = await this.afAuth.currentUser;
    if (!user) return [];
    const notificacionesRef = collection(this.firestore, 'notificaciones');
    const q = query(notificacionesRef, where('uidJugador', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // (Opcional) Método para guardar el token FCM en el usuario
  // async guardarTokenFCM(token: string) { ... }

  // (Opcional) Método para enviar notificaciones push desde backend
  // async enviarNotificacionPush(data: any) { ... }
}
