import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from 'src/app/services/notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})

export class NotificacionesPage implements OnInit {
  notificaciones: any[] = [];

  constructor(private notificacionesService: NotificacionesService) {}

  async ngOnInit() {
    this.notificaciones = await this.notificacionesService.getNotificacionesScouter();
  }
}
