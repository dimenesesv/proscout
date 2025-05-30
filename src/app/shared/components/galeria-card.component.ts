import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-galeria-card',
  templateUrl: './galeria-card.component.html',
  styleUrls: ['./galeria-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class GaleriaCardComponent implements OnInit, OnDestroy {
  @Input() galleryUrls: string[] = [];
  @Input() uploadProgress: number | null = null;
  @Input() selectImage!: () => void;

  loadedImages: { [url: string]: boolean } = {};

  ngOnInit() {
    // Inicialización de recursos si es necesario
  }

  ngOnDestroy() {
    // Limpieza de recursos, listeners, timers, etc. si es necesario
  }

  onImgWillLoad(url: string) {
    this.loadedImages[url] = false;
  }

  onImgDidLoad(url: string) {
    this.loadedImages[url] = true;
  }
}
