import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-cancha-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './cancha-modal.component.html',
  styleUrls: ['./cancha-modal.component.scss']
})
export class CanchaModalComponent implements OnInit, OnChanges {
  @Input() jugadoresActivosEnCancha: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() jugadorSeleccionado = new EventEmitter<string>();
  @Output() agregarJugadorBusqueda = new EventEmitter<string>();

  private canchaElement: HTMLElement | null = null;
  private animationFrameId: number | null = null;

  popoverAbierto = false;
  eventoPopover: any = null;
  formacionActual: string = '4-3-3';

  formaciones: Record<string, { posicion: string; x: number; y: number }[]> = {
    '4-4-2': [
      { posicion: 'Portero', x: 0.5, y: 0.12 },
      { posicion: 'Defensa Central 1', x: 0.43, y: 0.30 },
      { posicion: 'Defensa Central 2', x: 0.57, y: 0.30 },
      { posicion: 'Lateral Derecho', x: 0.70, y: 0.34 },
      { posicion: 'Lateral Izquierdo', x: 0.30, y: 0.34 },
      { posicion: 'Mediocampista Derecho', x: 0.72, y: 0.58 },
      { posicion: 'Mediocampista Izquierdo', x: 0.28, y: 0.58 },
      { posicion: 'Mediocentro 1', x: 0.41, y: 0.52 },
      { posicion: 'Mediocentro 2', x: 0.59, y: 0.52 },
      { posicion: 'Delantero 1', x: 0.60, y: 0.72 },
      { posicion: 'Delantero 2', x: 0.40, y: 0.72 }
    ],
    '4-3-3': [
      { posicion: 'Portero', x: 0.5, y: 0.12 },
      { posicion: 'Defensa Central 1', x: 0.43, y: 0.30 },
      { posicion: 'Defensa Central 2', x: 0.57, y: 0.30 },
      { posicion: 'Lateral Derecho', x: 0.70, y: 0.34 },
      { posicion: 'Lateral Izquierdo', x: 0.30, y: 0.34 },
      { posicion: 'Mediocentro 1', x: 0.35, y: 0.52 },
      { posicion: 'Mediocentro 2', x: 0.50, y: 0.52 },
      { posicion: 'Mediocentro 3', x: 0.65, y: 0.52 },
      { posicion: 'Extremo Derecho', x: 0.75, y: 0.72 },
      { posicion: 'Extremo Izquierdo', x: 0.25, y: 0.72 },
      { posicion: 'Delantero Centro', x: 0.50, y: 0.75 }
    ]
  };

  jugadoresEnCancha: any[] = [];

  ngOnInit() {
    this.mapearJugadoresAPosiciones();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['jugadoresActivosEnCancha']) {
      this.mapearJugadoresAPosiciones();
    }
  }

  seleccionarJugador(posicion: string) {
    this.jugadorSeleccionado.emit(posicion);
  }

  abrirSelectorFormacion(event: any) {
    this.eventoPopover = event;
    this.popoverAbierto = true;
  }

  cambiarFormacion(formacion: string) {
    this.formacionActual = formacion;
    this.popoverAbierto = false;
    this.mapearJugadoresAPosiciones();
  }

  agregarJugador(posicion: string) {
    this.agregarJugadorBusqueda.emit(posicion);
  }

  mapearJugadoresAPosiciones() {
    const posiciones = this.formaciones[this.formacionActual];
    if (!posiciones) return;
    const equivalencias: Record<string, string[]> = {
      'Portero': ['Portero'],
      'Defensa Central 1': ['Defensa Central', 'Defensa', 'Central'],
      'Defensa Central 2': ['Defensa Central', 'Defensa', 'Central'],
      'Lateral Derecho': ['Lateral Derecho', 'Lateral', 'Defensa'],
      'Lateral Izquierdo': ['Lateral Izquierdo', 'Lateral', 'Defensa'],
      'Mediocampista Derecho': ['Mediocampista Derecho', 'Mediocampista', 'Volante', 'Medio'],
      'Mediocampista Izquierdo': ['Mediocampista Izquierdo', 'Mediocampista', 'Volante', 'Medio'],
      'Mediocentro 1': ['Mediocentro', 'Mediocampista', 'Volante', 'Medio'],
      'Mediocentro 2': ['Mediocentro', 'Mediocampista', 'Volante', 'Medio'],
      'Mediocentro 3': ['Mediocentro', 'Mediocampista', 'Volante', 'Medio'],
      'Extremo Derecho': ['Extremo Derecho', 'Extremo', 'Delantero'],
      'Extremo Izquierdo': ['Extremo Izquierdo', 'Extremo', 'Delantero'],
      'Delantero 1': ['Delantero', 'Atacante', 'Punta'],
      'Delantero 2': ['Delantero', 'Atacante', 'Punta'],
      'Delantero Centro': ['Delantero', 'Atacante', 'Punta'],
    };
    const usados = new Set<string>();
    this.jugadoresEnCancha = posiciones.map((pos) => {
      let candidatos: any[] = [];
      if (this.jugadoresActivosEnCancha) {
        candidatos = this.jugadoresActivosEnCancha[pos.posicion] || [];
        if ((!candidatos || candidatos.length === 0) && equivalencias[pos.posicion]) {
          for (const key of Object.keys(this.jugadoresActivosEnCancha)) {
            const normalizado = key.toLowerCase();
            if (equivalencias[pos.posicion].some(eq => normalizado.includes(eq.toLowerCase()))) {
              candidatos = this.jugadoresActivosEnCancha[key];
              break;
            }
          }
        }
      }
      // Evitar duplicados: solo asignar jugadores no usados
      let jugadorAsignado = null;
      if (candidatos && candidatos.length > 0) {
        jugadorAsignado = candidatos.find(j => !usados.has(j.uid));
        if (jugadorAsignado) {
          usados.add(jugadorAsignado.uid);
        }
      }
      const estilo = {
        top: `${pos.y * 100}%`,
        left: `${pos.x * 100}%`,
        transform: 'translate(-50%, -50%)'
      };
      if (jugadorAsignado) {
        return {
          ...jugadorAsignado,
          posicion: pos.posicion,
          estilo
        };
      } else {
        return {
          nombre: '',
          posicion: pos.posicion,
          estilo,
          vacio: true
        };
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.canchaElement) {
      this.canchaElement = document.querySelector('.cancha-3d-inner') as HTMLElement;
    }
    const cancha = this.canchaElement;
    if (!cancha) return;

    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    const rotateX = 25 - y * 10;
    const rotateY = x * 10;

    // Corregir sintaxis de if para cancelar animationFrameId
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => {
      cancha.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
    });
  }

  @HostListener('window:deviceorientation', ['$event'])
  onDeviceOrientation(event: DeviceOrientationEvent) {
    if (!this.canchaElement) {
      this.canchaElement = document.querySelector('.cancha-3d-inner') as HTMLElement;
    }
    const cancha = this.canchaElement;
    if (!cancha || event.beta === null || event.gamma === null) return;

    const beta = event.beta;
    const gamma = event.gamma;

    const rotateX = 25 - (beta - 45) * 0.3;
    const rotateY = gamma * 0.5;

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => {
      cancha.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
    });
  }
}