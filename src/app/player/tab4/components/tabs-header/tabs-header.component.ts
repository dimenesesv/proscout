import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tabs-header',
  templateUrl: './tabs-header.component.html',
  styleUrls: ['./tabs-header.component.scss'],
  standalone: true
})
export class TabsHeaderComponent {
  @Input() activeTab: number = 0;
  @Output() tabChange = new EventEmitter<number>();

  onTabChange(index: number) {
    this.tabChange.emit(index);
  }
}