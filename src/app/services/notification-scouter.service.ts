import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';

export interface ScouterNotification {
  type: 'zonaAlerta' | 'convocatoriaAceptada' | 'perfilVisto' | 'eventoJugadorFavorito';
  title: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationScouterService {

  constructor(private firestore: Firestore) {}

  getScouterNotifications(): Observable<ScouterNotification[]> {
    return new Observable(observer => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        observer.next([]);
        observer.complete();
        return;
      }

      const notiRef = query(
        collection(this.firestore, 'notificaciones'),
        where('scouterId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(notiRef, (snapshot) => {
        const notificaciones: ScouterNotification[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            type: data['type'],
            title: data['title'],
            message: data['message'],
            timestamp: data['timestamp'].toDate()
          };
        });
        observer.next(notificaciones);
      });

      return { unsubscribe };
    });
  }
}
