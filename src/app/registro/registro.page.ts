import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NombrePage } from './nombre/nombre.page';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateTo(path: string): void {
    this.router.navigate(['registro/nombre']);
  }

}
