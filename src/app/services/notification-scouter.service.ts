import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class NotificationScouterService {
  private db = getFirestore();

  async enviarNotificacion(
    uidScouter: string,
    titulo: string,
    mensaje: string,
    imagen?: string
  ) {
    try {
      const notificacionesRef = collection(this.db, 'notificaciones');
      await addDoc(notificacionesRef, {
        uidScouter,
        titulo,
        mensaje,
        fecha: Timestamp.now(),
        imagen: imagen || null,
        visto: false
      });
    } catch (error) {
      console.error('Error al enviar notificación al scouter:', error);
    }
  }
}
