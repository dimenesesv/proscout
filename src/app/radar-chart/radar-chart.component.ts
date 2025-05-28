import { Component, AfterViewInit, ViewChild, ElementRef, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.scss'],
  standalone: true
})
export class RadarChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() data: number[] = [];

  radarChart: Chart | null = null;

  ngAfterViewInit() {
    setTimeout(() => this.createChart(), 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.radarChart) {
      this.radarChart.destroy();
      this.radarChart = null;
    }
    setTimeout(() => this.createChart(), 0);
  }

  ngOnDestroy() {
    if (this.radarChart) {
      this.radarChart.destroy();
      this.radarChart = null;
    }
  }

  createChart() {
    if (!this.radarCanvas || !this.radarCanvas.nativeElement) return;
    this.radarChart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: this.labels.length ? this.labels : ['A', 'B', 'C'],
        datasets: [{
          label: 'Estadísticas',
          data: this.data.length ? this.data : [0, 0, 0],
          backgroundColor: 'rgba(0, 255, 128, 0.4)',
          borderColor: '#00FF80',
          borderWidth: 2,
          pointBackgroundColor: '#000',
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 25
            }
          }
        }
      }
    });
  }
}