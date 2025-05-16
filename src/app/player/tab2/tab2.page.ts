import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  perfil = {
    pruebasRealizadas: 5,
    amigosAgregados: 10,
    likesDados: 5,
  };

  objetivos = [
    { texto: 'Realiza 5 pruebas', completado: false },
    { texto: 'Completa tu perfil', completado: false },
    { texto: 'Sube contenido multimedia', completado: false },
  ];

  trofeoObtenido = false;

  ngOnInit() {
    this.verificarObjetivos();
  }

  verificarObjetivos() {
    this.objetivos[0].completado = this.perfil.pruebasRealizadas >= 5;
    this.objetivos[1].completado = this.perfil.amigosAgregados >= 10;
    this.objetivos[2].completado = this.perfil.likesDados >= 5;

    this.trofeoObtenido = this.objetivos.every(obj => obj.completado);
  }

  get progress(): number {
    return this.objetivos.filter(o => o.completado).length / this.objetivos.length;
  }
}