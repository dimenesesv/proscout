import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Notificacion } from 'src/app/interfaces/notificacion';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})

export class NotificacionesPage implements OnInit {
  notificaciones: Notificacion[] = [];

  constructor(private notificacionesService: NotificacionesService) {}

  async ngOnInit() {
    try {
      console.log('[NotificacionesPage][ngOnInit] INICIO');
      const notificaciones = await this.notificacionesService.getNotificacionesUsuario();
      console.log('[NotificacionesPage][ngOnInit] notificaciones recibidas:', notificaciones);
      this.notificaciones = notificaciones;
    } catch (error) {
      console.error('[NotificacionesPage][ngOnInit] Error al obtener notificaciones:', error);
    }
  }
}
