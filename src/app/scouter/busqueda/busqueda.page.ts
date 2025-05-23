import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Info } from 'src/app/interfaces/info';
import { Stats } from 'src/app/interfaces/stats';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
})
export class BusquedaPage implements OnInit {
  usuarios: Usuario[] = [];
  resultados: { usuario: Usuario; puntaje: number }[] = [];

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.usuarios = await this.firebaseService.getCollection('usuarios');
  }

  // Busca usuarios por proximidad a los filtros dados (altura, peso, edad, stats)
  // (NO considera ubicación geográfica)
  buscarPorProximidad(filtros: Partial<Info & Stats>) {
    const rango = 20; // Rango de variación aceptado para cada campo numérico
    // Inicializa el array de resultados
    this.resultados = this.usuarios
      // 1. Filtra solo los usuarios que son jugadores
      .filter(u => u.esJugador)
      // 2. Mapea cada usuario a un objeto con su puntaje de proximidad
      .map(usuario => {
        let puntaje = 0; // Puntaje acumulado según cercanía a los filtros
        let total = 0;   // Total posible de puntaje (para normalización si se desea)
        // --- Comparación de datos físicos (Info) ---
        // Si el filtro de altura está definido y el usuario tiene altura
        if (filtros.altura && usuario.info?.altura) {
          // Calcula la diferencia absoluta entre el filtro y el valor del usuario
          const diff = Math.abs(filtros.altura - usuario.info.altura);
          // Si la diferencia está dentro del rango, suma puntaje proporcional
          if (diff <= rango) puntaje += (rango - diff); // Más cerca, más puntaje
          // Suma al total posible
          total += rango;
        }
        // Repite el proceso para peso
        if (filtros.peso && usuario.info?.peso) {
          const diff = Math.abs(filtros.peso - usuario.info.peso);
          if (diff <= rango) puntaje += (rango - diff);
          total += rango;
        }
        // Y para edad
        if (filtros.edad && usuario.info?.edad) {
          const diff = Math.abs(filtros.edad - usuario.info.edad);
          if (diff <= rango) puntaje += (rango - diff);
          total += rango;
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
            filtros[key] !== undefined && filtros[key] !== null &&
            usuario.stats && usuario.stats[key] !== undefined && usuario.stats[key] !== null
          ) {
            // Calcula la diferencia absoluta
            const diff = Math.abs((filtros[key] as number) - (usuario.stats[key] as number));
            // Si está dentro del rango, suma puntaje proporcional
            if (diff <= rango) puntaje += (rango - diff);
            total += rango;
          }
        }
        // Devuelve el usuario y su puntaje (solo si hay algún puntaje posible)
        return { usuario, puntaje: total > 0 ? puntaje : 0 };
      })
      // 3. Filtra solo los usuarios que tienen algún puntaje (coinciden en al menos un filtro)
      .filter(r => r.puntaje > 0)
      // 4. Ordena los resultados de mayor a menor puntaje (más cercanos primero)
      .sort((a, b) => b.puntaje - a.puntaje);
  }
}
