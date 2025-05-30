import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-seleccion-jugador-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './seleccion-jugador-modal.component.html',
  styleUrls: ['./seleccion-jugador-modal.component.scss']
})
export class SeleccionJugadorModalComponent implements OnChanges {
  @Input() jugadoresPorPosicion: any;
  @Input() posicionSeleccionada: string = '';
  @Output() jugadorSeleccionado = new EventEmitter<{posicion: string, uid: string}>();
  @Output() cerrar = new EventEmitter<void>();

  cambiarJugadorEnCancha(posicion: string, uid: string) {
    this.jugadorSeleccionado.emit({posicion, uid});
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  // Forzar getter para debug
  ngOnChanges(changes: any) {
    if (changes.jugadoresPorPosicion || changes.posicionSeleccionada) {
      // Forzar acceso al getter para que se ejecuten los logs
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.jugadoresOrdenados;
      console.log('[Modal] ngOnChanges ejecutado');
    }
  }

  get jugadoresOrdenados(): any[] {
    // LOG para depuración
    console.log('[Modal] jugadoresPorPosicion:', this.jugadoresPorPosicion);
    console.log('[Modal] posicionSeleccionada:', this.posicionSeleccionada);
    if (!this.jugadoresPorPosicion || !this.posicionSeleccionada) {
      console.log('[Modal] No hay datos de jugadoresPorPosicion o posicionSeleccionada');
      return [];
    }
    const lista: any[] = this.jugadoresPorPosicion[this.posicionSeleccionada] || [];
    console.log('[Modal] Lista de jugadores para la posición', this.posicionSeleccionada, ':', lista);
    if (!Array.isArray(lista) || lista.length === 0) {
      console.log('[Modal] Lista vacía para la posición', this.posicionSeleccionada);
      return [];
    }
    // Usar los mismos nombres de posición que en editar-perfil.page.html
    const ordenPosiciones = [
      'Portero',
      'Defensa Central',
      'Lateral Derecho',
      'Lateral Izquierdo',
      'Volante Defensivo',
      'Volante Central',
      'Volante Ofensivo',
      'Extremo Derecho',
      'Extremo Izquierdo',
      'Delantero',
      'Delantero Centro' // Añadido para cubrir ambos posibles valores
    ];
    const ordenada = lista.slice().sort((a: any, b: any) => {
      const idxA = ordenPosiciones.indexOf(a.info?.posicion || a.posicion || '');
      const idxB = ordenPosiciones.indexOf(b.info?.posicion || b.posicion || '');
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    console.log('[Modal] Lista ordenada:', ordenada);
    return ordenada;
  }
}