import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonButton, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent } from '@ionic/angular/standalone';

declare var google: any;

@Component({
  selector: 'app-mapa-ubicacion-modal',
  templateUrl: './mapa-ubicacion-modal.component.html',
  styleUrls: ['./mapa-ubicacion-modal.component.scss'],
  standalone: true,
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent],
})
export class MapaUbicacionModalComponent {
  @Input() lat: number = 0;
  @Input() lng: number = 0;
  map: any;
  marker: any;
  selectedLat: number = 0;
  selectedLng: number = 0;

  constructor(private modalCtrl: ModalController) {}

  ionViewDidEnter() {
    this.loadMap();
  }

  loadMap() {
    const mapEl = document.getElementById('google-map');
    if (!mapEl) return;
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
    });
  }

  confirmLocation() {
    this.modalCtrl.dismiss({ lat: this.selectedLat, lng: this.selectedLng });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
