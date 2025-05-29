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
      // this.abrirModalFiltros(); // Quitar apertura automática del modal
    } catch (err) {
      console.error('[ERROR] Exception in BusquedaPage ngOnInit:', err);
    }
    this.setBadgeState();
    this.cargarUsuarios();
    if (window && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.deviceOrientationHandler);
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

  async cargarUsuarios() {
    this.setBadgeState('loading');
    this.cargandoUsuarios = true;
    this.usuarios = await this.firebaseService.getCollection('playground');
    this.cargandoUsuarios = false;
    this.page = 1;
    this.updatePagedResultados();
    this.setBadgeState();
  }

  async buscarPorProximidad(filtros: Partial<Info & Stats>) {
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
    const rango = 20; // Rango de variación aceptado para cada campo numérico
    this.resultados = this.usuarios
      // 1. Filtra solo los usuarios que son jugadores
      .filter(u => u.esJugador)
      // 2. Mapea cada usuario a un objeto con su puntaje de proximidad
      .map(usuario => {
        let puntaje = 0; // Puntaje acumulado según cercanía a los filtros
        let total = 0;   // Total posible de puntaje (para normalización si se desea)
        // --- Comparación de datos físicos (Info) ---
        // Si el filtro de altura está definido y el usuario tiene altura
        if (filtrosLimpios.altura && usuario.info?.altura) {
          // Convertir altura del usuario a centímetros si es menor a 3 (probablemente está en metros)
          let alturaUsuario = usuario.info.altura;
          if (alturaUsuario < 3) {
            alturaUsuario = alturaUsuario * 100;
          }
          const diff = Math.abs(filtrosLimpios.altura - alturaUsuario);
          // Si la diferencia está dentro del rango, suma puntaje proporcional
          if (diff <= rango) puntaje += (rango - diff); // Más cerca, más puntaje
          // Suma al total posible
          total += rango;
        }
        // Repite el proceso para peso
        if (filtrosLimpios.peso && usuario.info?.peso) {
          const diff = Math.abs(filtrosLimpios.peso - usuario.info.peso);
          if (diff <= rango) puntaje += (rango - diff);
          total += rango;
        }
        // Calcular edad a partir de la fecha de nacimiento
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
            if (diff <= rango) puntaje += (rango - diff);
            total += rango;
          }
        }
        // --- Comparación de estadísticas deportivas (Stats) ---
        // Lista de todas las stats numéricas a comparar
        const statKeys: (keyof Stats)[] = [
          'velocidad','resistencia','fuerza','agilidad','equilibrio','coordinacion','salto','controlBalon','regate','pase','tiro','cabeceo'
        ];
        // Itera sobre cada stat
        for (const key of statKeys) {
          // Si el filtro y el usuario tienen el valor definido para esa stat
          if (
            filtrosLimpios[key] !== undefined && filtrosLimpios[key] !== null &&
            usuario.stats && usuario.stats[key] !== undefined && usuario.stats[key] !== null
          ) {
            // Calcula la diferencia absoluta
            const diff = Math.abs((filtrosLimpios[key] as number) - (usuario.stats[key] as number));
            // Si está dentro del rango, suma puntaje proporcional
            if (diff <= rango) puntaje += (rango - diff);
            total += rango;
          }
        }
        // Calcula el porcentaje de coincidencia
        const porcentaje = total > 0 ? Math.round((puntaje / total) * 100) : 0;
        // Devuelve el usuario y su puntaje (solo si hay algún puntaje posible)
        return { usuario, puntaje: total > 0 ? puntaje : 0, porcentaje, edadCalculada };
      })
      // 3. Filtra solo los usuarios que tienen algún puntaje (coinciden en al menos un filtro)
      .filter(r => r.puntaje > 0)
      // 4. Ordena los resultados de mayor a menor puntaje (más cercanos primero)
      .sort((a, b) => b.puntaje - a.puntaje);
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
