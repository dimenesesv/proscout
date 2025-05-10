import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Notification {
  type: 'profileView' | 'eventNearby' | 'metricRated';
  title: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    // Simulación de notificaciones (puedes cambiar esto por una llamada HTTP o Firebase)
    const mockNotifications: Notification[] = [
      {
        type: 'profileView',
        title: 'Un scout ha visto tu perfil',
        message: 'Hace 5 minutos',
        timestamp: new Date()
      },
      {
        type: 'eventNearby',
        title: '¡Nuevo torneo cerca de ti!',
        message: 'Cancha Municipal a 1.5 km',
        timestamp: new Date()
      },
      {
        type: 'metricRated',
        title: 'Has sido evaluado',
        message: 'Velocidad: 7 / Visión: 8',
        timestamp: new Date()
      }
    ];

    return of(mockNotifications);
  }
}
