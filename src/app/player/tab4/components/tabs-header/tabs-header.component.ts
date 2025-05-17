import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'player-app-tabs-header',
  templateUrl: './tabs-header.component.html',
  styleUrls: ['./tabs-header.component.scss'],
  standalone: false
})
export class PlayerTabsHeaderComponent {
  @Input() activeTab: number = 0;
  @Output() tabChange = new EventEmitter<number>();

  onTabChange(index: number) {
    this.tabChange.emit(index);
  }
}