import { Component, OnInit } from '@angular/core';
import { NotificationScouterService, ScouterNotification } from '../../services/notification-scouter.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage implements OnInit {
  notifications: ScouterNotification[] = [];

  constructor(private notificationService: NotificationScouterService) {}

  ngOnInit() {
    this.notificationService.getScouterNotifications().subscribe((notis) => {
      this.notifications = notis.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'zonaAlerta':
        return 'location';
      case 'convocatoriaAceptada':
        return 'checkmark-circle';
      case 'perfilVisto':
        return 'eye';
      case 'eventoJugadorFavorito':
        return 'star';
      default:
        return 'notifications';
    }
  }
}
