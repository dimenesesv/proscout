import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Info } from 'src/app/interfaces/info';
import { Stats } from 'src/app/interfaces/stats';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FiltrosModalComponent } from './filtros-modal.component';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
  standalone: false, 
})
export class BusquedaPage implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  resultados: { usuario: Usuario; puntaje: number; porcentaje: number; edadCalculada?: number }[] = [];
  filtrosActivos: { key: string, label: string, value: any }[] = [];
  filtrosActuales: any = {};
  cargandoUsuarios = false;
  badgeState: 'none' | 'active' | 'loading' = 'none';

  showWelcomeScreen = false;

  // Infinite scroll support
  page = 1;
  pageSize = 10;
  pagedResultados: { usuario: Usuario; puntaje: number; porcentaje: number; edadCalculada?: number }[] = [];

  // Diccionario para mostrar nombres bonitos en los chips
  filtroLabels: { [key: string]: string } = {
    altura: 'Altura', peso: 'Peso', edad: 'Edad',
    velocidad: 'Velocidad', resistencia: 'Resistencia', fuerza: 'Fuerza', agilidad: 'Agilidad',
    equilibrio: 'Equilibrio', coordinacion: 'Coordinación', salto: 'Salto', controlBalon: 'Control Balón',
    regate: 'Regate', pase: 'Pase', tiro: 'Tiro', cabeceo: 'Cabeceo'
  };

  testValue = 42;

  constructor(private firebaseService: FirebaseService, private router: Router, private modalCtrl: ModalController) {
    try {
      console.log('[DEBUG] BusquedaPage constructor called');
    } catch (err) {
      console.error('[ERROR] Exception in BusquedaPage constructor:', err);
    }
  }

  private deviceOrientationHandler = (event: DeviceOrientationEvent) => {
    this.onWelcomeDeviceParallax(event);
  };

  ngOnInit() {
    try {
      console.log('[DEBUG] BusquedaPage ngOnInit called');
      // Si hay filtro automático, abrir modal de filtros y aplicar
      const filtroAuto = localStorage.getItem('filtroBusquedaAuto');
      if (filtroAuto) {
        const filtro = JSON.parse(filtroAuto);
        localStorage.removeItem('filtroBusquedaAuto');
        setTimeout(() => this.abrirModalFiltrosConPosicion(filtro.posicion), 300);
      }
    } catch (err) {
      console.error('[ERROR] Exception in BusquedaPage ngOnInit:', err);
    }
    this.setBadgeState();
    this.cargarUsuarios();
    // --- GIROSCOPIO: Solicitar permiso en iOS ---
    if (window && 'DeviceOrientationEvent' in window) {
      // iOS 13+ requiere permiso explícito
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission().then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this.deviceOrientationHandler);
          }
        }).catch((e: any) => {
          console.warn('Permiso de giroscopio denegado o no soportado:', e);
        });
      } else {
        window.addEventListener('deviceorientation', this.deviceOrientationHandler);
      }
    }
  }

  ionViewWillEnter() {
    this.showWelcomeScreen = true;
  }

  ionViewDidEnter() {
    console.log('[DEBUG] BusquedaPage ionViewDidEnter called (animation removed)');
  }

  ionViewWillLeave() {
    this.showWelcomeScreen = false;
    const welcome = document.getElementById('welcomeScreen');
    if (welcome) {
      welcome.style.display = 'none';
    }
  }

  ngOnDestroy() {
    if (window && 'DeviceOrientationEvent' in window) {
      window.removeEventListener('deviceorientation', this.deviceOrientationHandler);
    }
  }

  async cargarUsuarios(filtros?: Partial<Info & Stats>) {
    this.setBadgeState('loading');
    this.cargandoUsuarios = true;
    let usuarios: Usuario[] = [];
    if (filtros && (filtros.altura || filtros.peso || filtros.edad)) {
      const alturaRango = 10;
      const pesoRango = 10;
      const edadRango = 2;
      const filtersArr: Array<{ field: string, op: any, value: any }> = [
        { field: 'esJugador', op: '==', value: true }
      ];
      if (filtros.altura) {
        filtersArr.push({ field: 'info.altura', op: '>=', value: filtros.altura - alturaRango });
        filtersArr.push({ field: 'info.altura', op: '<=', value: filtros.altura + alturaRango });
      }
      if (filtros.peso) {
        filtersArr.push({ field: 'info.peso', op: '>=', value: filtros.peso - pesoRango });
        filtersArr.push({ field: 'info.peso', op: '<=', value: filtros.peso + pesoRango });
      }
      if (filtros.edad) {
        const hoy = new Date();
        const minYear = hoy.getFullYear() - (filtros.edad + edadRango);
        const maxYear = hoy.getFullYear() - (filtros.edad - edadRango);
        filtersArr.push({ field: 'fechaNacimiento', op: '>=', value: `${minYear}-01-01` });
        filtersArr.push({ field: 'fechaNacimiento', op: '<=', value: `${maxYear}-12-31` });
      }
      const q = await this.firebaseService.collectionQuery('usuarios', filtersArr);
      usuarios = await this.firebaseService.getDocsFromQuery(q);
    } else {
      usuarios = await this.firebaseService.getCollection('usuarios');
    }
    this.usuarios = usuarios;
    this.cargandoUsuarios = false;
    this.page = 1;
    this.updatePagedResultados();
    this.setBadgeState();
  }

  async buscarPorProximidad(filtros: Partial<Info & Stats>) {
    // Usa la consulta optimizada para cargar usuarios filtrados
    await this.cargarUsuarios(filtros);
    // Espera a que los usuarios estén cargados antes de buscar
    if (this.cargandoUsuarios) {
      await new Promise(resolve => {
        const check = () => {
          if (!this.cargandoUsuarios) resolve(true);
          else setTimeout(check, 50);
        };
        check();
      });
    }
    // Elimina campos vacíos o nulos de los filtros y convierte a number si es string
    const filtrosLimpios: Partial<Info & Stats> = {};
    Object.keys(filtros).forEach(key => {
      let valor = filtros[key as keyof (Info & Stats)];
      if (valor !== null && valor !== undefined && valor !== '') {
        if (typeof valor === 'string' && !isNaN(Number(valor))) {
          valor = Number(valor);
        }
        filtrosLimpios[key as keyof (Info & Stats)] = valor as any;
      }
    });
    this.resultados = this.usuarios
      .filter(u => u.esJugador)
      .map(usuario => {
        let puntaje = 0;
        let total = 0;
        // --- Comparación de datos físicos (Info) ---
        if (filtrosLimpios.altura && usuario.info?.altura) {
          let alturaUsuario = usuario.info.altura;
          if (alturaUsuario < 3) {
            alturaUsuario = alturaUsuario * 100;
          }
          const diff = Math.abs(filtrosLimpios.altura - alturaUsuario);
          puntaje -= diff; // Penaliza por diferencia absoluta
          total++;
        }
        if (filtrosLimpios.peso && usuario.info?.peso) {
          const diff = Math.abs(filtrosLimpios.peso - usuario.info.peso);
          puntaje -= diff;
          total++;
        }
        let edadCalculada: number | undefined = undefined;
        if (usuario.fechaNacimiento) {
          const hoy = new Date();
          const nacimiento = new Date(usuario.fechaNacimiento);
          let edad = hoy.getFullYear() - nacimiento.getFullYear();
          const m = hoy.getMonth() - nacimiento.getMonth();
          if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
          }
          edadCalculada = edad;
          if (filtrosLimpios.edad) {
            const diff = Math.abs(filtrosLimpios.edad - edad);
            puntaje -= diff;
            total++;
          }
        }
        const statKeys: (keyof Stats)[] = [
          'velocidad','resistencia','fuerza','agilidad','equilibrio','coordinacion','salto','controlBalon','regate','pase','tiro','cabeceo'
        ];
        for (const key of statKeys) {
          if (
            filtrosLimpios[key] !== undefined && filtrosLimpios[key] !== null &&
            usuario.stats && usuario.stats[key] !== undefined && usuario.stats[key] !== null
          ) {
            const diff = Math.abs((filtrosLimpios[key] as number) - (usuario.stats[key] as number));
            puntaje -= diff;
            total++;
          }
        }
        // El puntaje será menos negativo cuanto más parecido sea el usuario
        // Para mostrar un porcentaje de coincidencia, puedes normalizar si lo deseas
        return { usuario, puntaje, porcentaje: 0, edadCalculada };
      })
      .filter(r => r.puntaje < 0)
      .sort((a, b) => b.puntaje - a.puntaje); // Menor diferencia (menos negativo) es mejor
    this.page = 1;
    this.updatePagedResultados();
  }

  updatePagedResultados() {
    this.pagedResultados = this.resultados.slice(0, this.page * this.pageSize);
  }

  loadMore(event: any) {
    this.page++;
    this.updatePagedResultados();
    event.target.complete();
    // Si ya no hay más resultados para cargar, deshabilita el infinite scroll
    if (this.pagedResultados.length >= this.resultados.length) {
      event.target.disabled = true;
    }
  }

  async abrirModalFiltros() {
    console.log('[DEBUG] abrirModalFiltros called');
    const modal = await this.modalCtrl.create({
      component: FiltrosModalComponent
    });
    modal.onDidDismiss().then(result => {
      console.log('[DEBUG] modal onDidDismiss', result);
      if (result.data) {
        this.aplicarFiltros(result.data, modal);
      }
    });
    await modal.present();
    console.log('[DEBUG] modal.present() called');
  }

  async abrirModalFiltrosConPosicion(posicion: string) {
    const modal = await this.modalCtrl.create({
      component: FiltrosModalComponent
    });
    modal.onDidDismiss().then(result => {
      if (result.data) {
        this.aplicarFiltros(result.data, modal);
      }
    });
    await modal.present();
    // Espera a que el modal esté listo y setea el filtro de posición
    setTimeout(() => {
      const instance = (modal as any).componentProps?.instance || (modal as any)._component;
      if (instance) {
        instance.filtros = { ...instance.filtros, posicion };
      }
      // Si el modal tiene un input para posición, intenta setearlo visualmente (opcional)
      const input = document.querySelector('ion-input[name=posicion], ion-select[name=posicion]') as HTMLInputElement;
      if (input) input.value = posicion;
    }, 300);
  }

  aplicarFiltros(valores: any, modal: any) {
    this.filtrosActuales = { ...valores };
    this.actualizarFiltrosActivos();
    this.setBadgeState('active');
    this.buscarPorProximidad(this.filtrosActuales);
    modal.dismiss();
  }

  actualizarFiltrosActivos() {
    this.filtrosActivos = [];
    Object.keys(this.filtrosActuales).forEach(key => {
      const value = this.filtrosActuales[key];
      if (value !== null && value !== undefined && value !== '') {
        this.filtrosActivos.push({ key, label: this.filtroLabels[key] || key, value });
      }
    });
  }

  borrarFiltro(key: string) {
    this.filtrosActuales[key] = undefined;
    this.actualizarFiltrosActivos();
    this.buscarPorProximidad(this.filtrosActuales);
    this.setBadgeState(this.filtrosActivos.length > 0 ? 'active' : 'none');
  }

  setBadgeState(state?: 'none' | 'active' | 'loading') {
    if (state) {
      this.badgeState = state;
      return;
    }
    if (this.cargandoUsuarios) {
      this.badgeState = 'loading';
    } else if (this.filtrosActivos && this.filtrosActivos.length > 0) {
      this.badgeState = 'active';
    } else {
      this.badgeState = 'none';
    }
  }

  verPerfil(usuario: any) {
    if (!usuario || !usuario.id) return;
    this.router.navigate(['/scouter/vista-perfil', usuario.id]);
  }

  onWelcomeParallax(event: MouseEvent) {
    const welcome = event.currentTarget as HTMLElement;
    const rect = welcome.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    welcome.style.setProperty('--gradient-x', `${x}%`);
    welcome.style.setProperty('--gradient-y', `${y}%`);
    // Efecto 3D: tilt máximo de 14 grados
    const tiltX = ((x - 50) / 50) * 14; // -14deg a +14deg
    const tiltY = -((y - 50) / 50) * 14; // -14deg a +14deg (invertido para UX)
    welcome.style.setProperty('--tilt-x', `${tiltX}deg`);
    welcome.style.setProperty('--tilt-y', `${tiltY}deg`);
    // welcome.style.transition = 'transform 0.2s ease-in'; // Eliminado según instrucciones
  }

  onWelcomeParallaxReset(event: MouseEvent) {
    const welcome = event.currentTarget as HTMLElement;
    welcome.style.setProperty('--gradient-x', '50%');
    welcome.style.setProperty('--gradient-y', '50%');
    welcome.style.setProperty('--tilt-x', '0deg');
    welcome.style.setProperty('--tilt-y', '0deg');
    // welcome.style.transition = 'transform 0.5s ease-out'; // Eliminado según instrucciones
  }

  onWelcomeDeviceParallax(event: DeviceOrientationEvent) {
    // gamma: left-right [-90,90], beta: front-back [-180,180]
    const welcome = document.querySelector('.welcome-screen') as HTMLElement;
    if (!welcome) return;
    // Normalize gamma and beta to [0,100]
    const gamma = event.gamma || 0;
    const beta = event.beta || 0;
    const x = ((gamma + 90) / 180) * 100;
    const y = ((beta + 180) / 360) * 100;
    welcome.style.setProperty('--gradient-x', `${x}%`);
    welcome.style.setProperty('--gradient-y', `${y}%`);
  }
}
