import { Component, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.scss'],
  standalone: true
})
export class RadarChartComponent implements AfterViewInit {
  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() data: number[] = [];

  radarChart!: Chart;

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
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