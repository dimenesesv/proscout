import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { animateTabTransition } from './motion';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  constructor(private router: Router) { }

  ngOnInit() {}

  isVistaPerfil(): boolean {
    return this.router.url.includes('vista-perfil');
  }

  onTabWillChange() {
    animateTabTransition();
  }
}
