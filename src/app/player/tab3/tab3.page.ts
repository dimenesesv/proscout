import { Component } from '@angular/core';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  notifications: any[] = [];

  constructor(private notificacionesService: NotificacionesService) {}

  async ngOnInit() {
    await this.loadNotifications();
  }

  async loadNotifications() {
    this.notifications = await this.notificacionesService.getNotificacionesJugador();
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



