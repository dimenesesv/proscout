import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-galeria-card',
  templateUrl: './galeria-card.component.html',
  styleUrls: ['./galeria-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class GaleriaCardComponent {
  @Input() galleryUrls: string[] = [];
  @Input() uploadProgress: number | null = null;
  @Input() selectImage!: () => void;

  loadedImages: { [url: string]: boolean } = {};

  onImgWillLoad(url: string) {
    this.loadedImages[url] = false;
  }

  onImgDidLoad(url: string) {
    this.loadedImages[url] = true;
  }
}
