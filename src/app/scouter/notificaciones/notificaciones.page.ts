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
    let notificacionesRaw = await this.notificacionesService.getNotificacionesScouter();
    // Normaliza y mapea a la interfaz Notificacion
    this.notificaciones = notificacionesRaw.map((n: any) => {
      let fecha: Date = n.fecha;
      if (fecha && typeof fecha === 'object' && (fecha as any).seconds !== undefined) {
        // Firestore Timestamp seguro
        fecha = new Date((fecha as any).seconds * 1000);
      }
      return {
        id: n.id || '',
        tipo: n.tipo || 'actividad',
        contenido: n.contenido || n.mensaje || '',
        fecha,
        leida: n.leida ?? false,
        remitenteId: n.remitenteId || n.uidScouter,
        destinatarioId: n.destinatarioId || n.uidJugador,
        prioridad: n.prioridad || 'media',
      } as Notificacion;
    });
    console.log('[NotificacionesPage] notificaciones normalizadas:', this.notificaciones);
  }
}
