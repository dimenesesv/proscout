import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs-header',
  templateUrl: './tabs-header.component.html',
  styleUrls: ['./tabs-header.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TabsHeaderComponent {
  @Input() activeTab: number = 0;
  @Output() tabChange = new EventEmitter<number>();

  setTab(index: number) {
    this.tabChange.emit(index);
  }
}
