import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RadarChartComponent } from 'src/app/radar-chart/radar-chart.component';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-estadisticas-card',
  templateUrl: './estadisticas-card.component.html',
  styleUrls: ['./estadisticas-card.component.scss'],
  standalone: true,
  imports: [IonicModule, RadarChartComponent, CommonModule, FormsModule],
})
export class EstadisticasCardComponent implements OnInit, OnDestroy {
  @Input() perfilUsuario: any;
  perfilScouter: any;

  nuevoEquipo: string = '';
  nuevoLogro: string = '';

  get biografia(): string {
    return this.perfilScouter?.biografia || '';
  }
  set biografia(val: string) {
    if (this.perfilScouter) {
      this.perfilScouter.biografia = val;
    }
  }

  agregarEquipo() {
    if (!this.perfilScouter) return;
    if (!this.perfilScouter.equiposHistorial) {
      this.perfilScouter.equiposHistorial = [];
    }
    if (this.nuevoEquipo.trim()) {
      this.perfilScouter.equiposHistorial.push(this.nuevoEquipo.trim());
      this.nuevoEquipo = '';
    }
  }

  agregarLogro() {
    if (!this.perfilScouter) return;
    if (!this.perfilScouter.logros) {
      this.perfilScouter.logros = [];
    }
    if (this.nuevoLogro.trim()) {
      this.perfilScouter.logros.push(this.nuevoLogro.trim());
      this.nuevoLogro = '';
    }
  }

  async subirArchivoCertificacion(event: any) {
    if (!this.perfilScouter) return;
    const archivo = event.target.files[0];
    if (!archivo) return;

    const storage = getStorage();
    const ruta = `certificaciones/${Date.now()}_${archivo.name}`;
    const archivoRef = ref(storage, ruta);

    try {
      await uploadBytes(archivoRef, archivo);
      const url = await getDownloadURL(archivoRef);
      this.perfilScouter.tituloUrl = url;
      alert('Certificación subida exitosamente');
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Hubo un problema al subir el archivo');
    }
  }
  ngOnInit() {
    // Solo inicializa perfilScouter si esScouter, pero nunca lo dejes undefined
    if (this.perfilUsuario?.esScouter) {
      this.perfilScouter = this.perfilUsuario;
    } else {
      this.perfilScouter = null;
    }
    // Aquí puedes agregar lógica de inicialización si es necesario
  }

  ngOnDestroy() {
    // Limpieza de recursos, listeners, timers, etc. si es necesario
  }
}
