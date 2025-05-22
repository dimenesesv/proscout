import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})

export class NotificacionesPage implements OnInit {
  notificaciones: any[] = [];

  constructor() {}

  async ngOnInit() {
    await this.cargarNotificaciones();
  }

  async cargarNotificaciones() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const notificacionesRef = collection(db, 'notificaciones');
    const q = query(notificacionesRef, where('uidScouter', '==', user.uid));

    const snapshot = await getDocs(q);
    this.notificaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}
