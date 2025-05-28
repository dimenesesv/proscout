import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Info } from 'src/app/interfaces/info';
import { Stats } from 'src/app/interfaces/stats';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
  standalone: false, 
})
export class BusquedaPage implements OnInit {
  usuarios: Usuario[] = [];
  resultados: { usuario: Usuario; puntaje: number; porcentaje: number; edadCalculada?: number }[] = [];
  filtrosActivos: { key: string, label: string, value: any }[] = [];
  filtrosActuales: any = {};
  @ViewChild('modalFiltros') modalFiltros!: IonModal;
  cargandoUsuarios = false;

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

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargandoUsuarios = true;
    this.usuarios = await this.firebaseService.getCollection('playground');
    this.cargandoUsuarios = false;
    this.page = 1;
    this.updatePagedResultados();
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

  abrirModalFiltros() {
    this.modalFiltros.present();
  }

  aplicarFiltros(valores: any, modal: any) {
    // Guarda los valores originales del formulario para los chips
    this.filtrosActuales = { ...valores };
    this.actualizarFiltrosActivos();
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
  }
}
