import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonButton, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent, IonNote } from '@ionic/angular/standalone';

declare var google: any;

@Component({
  selector: 'app-mapa-ubicacion-modal',
  templateUrl: './mapa-ubicacion-modal.component.html',
  styleUrls: ['./mapa-ubicacion-modal.component.scss'],
  standalone: true,
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent, IonNote],
  host: {
    'class': 'mapa-ubicacion-modal-fullscreen'
  }
})
export class MapaUbicacionModalComponent {
  @Input() lat: number = 0;
  @Input() lng: number = 0;
  map: any;
  marker: any;
  selectedLat: number = 0;
  selectedLng: number = 0;

  constructor(private modalCtrl: ModalController) {
    console.log('[MapaUbicacionModal] Constructor ejecutado');
  }

  ionViewDidEnter() {
    console.log('[MapaUbicacionModal] ionViewDidEnter');
    setTimeout(() => {
      const mapEl = document.getElementById('google-map');
      if (mapEl) {
        console.log('[MapaUbicacionModal] #google-map existe, tamaño:', mapEl.offsetWidth, mapEl.offsetHeight);
      } else {
        console.error('[MapaUbicacionModal] #google-map NO existe');
      }
      this.loadMap();
    }, 300); // Espera 300ms para asegurar render
  }

  loadMap() {
    console.log('[MapaUbicacionModal] Intentando cargar Google Maps API...');
    const mapEl = document.getElementById('google-map');
    if (!mapEl) {
      console.error('[MapaUbicacionModal] No se encontró el elemento google-map');
      return;
    }
    if (typeof google === 'undefined' || !google.maps) {
      console.error('[MapaUbicacionModal] Google Maps API no está disponible');
      return;
    }
    console.log('[MapaUbicacionModal] Google Maps API detectada, creando mapa...');
    this.map = new google.maps.Map(mapEl, {
      center: { lat: this.lat, lng: this.lng },
      zoom: 14,
      disableDefaultUI: true,
    });
    this.selectedLat = this.lat;
    this.selectedLng = this.lng;
    this.map.addListener('center_changed', () => {
      const center = this.map.getCenter();
      this.selectedLat = center.lat();
      this.selectedLng = center.lng();
      console.log('[MapaUbicacionModal] Centro del mapa cambiado:', this.selectedLat, this.selectedLng);
    });
    console.log('[MapaUbicacionModal] Mapa creado correctamente');
  }

  confirmLocation() {
    console.log('[MapaUbicacionModal] confirmLocation:', this.selectedLat, this.selectedLng);
    this.modalCtrl.dismiss({ lat: this.selectedLat, lng: this.selectedLng });
  }

  logAndConfirmLocation() {
    console.log('[LOG] Botón Usar esta ubicación presionado');
    this.confirmLocation();
  }

  dismiss() {
    console.log('[MapaUbicacionModal] dismiss() llamado');
    this.modalCtrl.dismiss();
  }
}
