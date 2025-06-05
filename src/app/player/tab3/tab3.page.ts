import { Component } from '@angular/core';
import { NotificacionesService } from '../../services/notificaciones.service';
import { Notificacion } from '../../interfaces/notificacion';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  notifications: Notificacion[] = [];

  constructor(private notificacionesService: NotificacionesService) {}

  async ngOnInit() {
    try {
      console.log('[Tab3Page][ngOnInit] INICIO');
      await this.loadNotifications();
    } catch (error) {
      console.error('[Tab3Page][ngOnInit] Error:', error);
    }
  }

  async loadNotifications() {
    this.notifications = await this.notificacionesService.getNotificacionesUsuario();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'profileView':
        return 'eye-outline';
      case 'eventNearby':
        return 'location-outline';
      case 'metricRated':
        return 'star-outline';
      default:
        return 'notifications-outline';
    }
  }

}

// Cambia notif.mensaje por notif.contenido en el template para mostrar el campo correcto



