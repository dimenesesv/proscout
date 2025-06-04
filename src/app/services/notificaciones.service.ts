import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { Notificacion } from '../interfaces/notificacion';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private afAuth = inject(AngularFireAuth);
  private firestore = inject(Firestore);

  // Envía una notificación a un jugador cuando un scouter lo añade a favoritos
  async notificarFavorito(destinatarioId: string, remitenteId: string) {
    console.log('[NotificacionesService] notificarFavorito INICIO', { destinatarioId, remitenteId });
    const notificacionesRef = collection(this.firestore, 'notificaciones');
    const data = {
      destinatarioId,
      remitenteId,
      tipo: 'actividad',
      contenido: '¡Un scouter te ha añadido a favoritos!',
      prioridad: 'media',
      fecha: new Date(),
      leida: false
    };
    console.log('[NotificacionesService][notificarFavorito] data:', data);
    try {
      // Agrega la notificación a Firestore
      const docRef = await addDoc(notificacionesRef, data);
      console.log('[NotificacionesService] Notificación creada en Firestore', { docId: docRef.id, data });
    } catch (error) {
      console.error('[NotificacionesService] Error al crear notificación en Firestore', error, data);
      throw error;
    }
  }

  // Envía una notificación personalizada de contacto
  async notificarContacto(destinatarioId: string, remitenteId: string) {
    console.log('[NotificacionesService] notificarContacto INICIO', { destinatarioId, remitenteId });
    const notificacionesRef = collection(this.firestore, 'notificaciones');
    const data = {
      destinatarioId,
      remitenteId,
      tipo: 'actividad',
      contenido: '¡Un scouter quiere contactarse contigo!',
      prioridad: 'media',
      fecha: new Date(),
      leida: false
    };
    try {
      const docRef = await addDoc(notificacionesRef, data);
      console.log('[NotificacionesService] Notificación de contacto creada en Firestore', { docId: docRef.id, data });
    } catch (error) {
      console.error('[NotificacionesService] Error al crear notificación de contacto en Firestore', error, data);
      throw error;
    }
  }

  // Obtiene las notificaciones para el usuario autenticado (jugador o scouter)
  async getNotificacionesUsuario(): Promise<Notificacion[]> {
    const user = await this.afAuth.currentUser;
    console.log('[NotificacionesService][getNotificacionesUsuario] user:', user);
    if (user) {
      console.log('[NotificacionesService][getNotificacionesUsuario] user.uid:', user.uid);
    }
    if (!user) return [];
    const notificacionesRef = collection(this.firestore, 'notificaciones');
    const q = query(notificacionesRef, where('destinatarioId', '==', user.uid));
    console.log('[NotificacionesService][getNotificacionesUsuario] query:', q);
    const snapshot = await getDocs(q);
    console.log('[NotificacionesService][getNotificacionesUsuario] snapshot.size:', snapshot.size);
    return snapshot.docs.map(doc => {
      const n = doc.data();
      let fecha: Date = n['fecha'];
      if (fecha && typeof fecha === 'object' && (fecha as any).seconds !== undefined) {
        fecha = new Date((fecha as any).seconds * 1000);
      }
      return {
        id: doc.id || n['id'] || '',
        tipo: n['tipo'] || 'actividad',
        contenido: n['contenido'] || n['mensaje'] || '',
        fecha,
        leida: n['leida'] ?? false,
        remitenteId: n['remitenteId'] || n['uidScouter'],
        destinatarioId: n['destinatarioId'] || n['uidJugador'],
        prioridad: n['prioridad'] || 'media',
      } as Notificacion;
    });
  }

  // (Opcional) Método para guardar el token FCM en el usuario
  // async guardarTokenFCM(token: string) { ... }

  // (Opcional) Método para enviar notificaciones push desde backend
  // async enviarNotificacionPush(data: any) { ... }
}