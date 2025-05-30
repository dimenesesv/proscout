import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.page.html',
  styleUrls: ['./example.page.scss'],
  standalone: false, // Si estás usando Angular 14+ y quieres usar este componente en otros módulos
})
export class ExamplePage implements OnInit {

  constructor() { }

  ngOnInit() {}

  async animarElemento() {
    const { animate, stagger } = await import('@motionone/dom');
    animate(
      '.animado',
      {
        x: [0, 100, 0],
        rotate: [0, 360, 0],
        scale: [1, 1.5, 1],
        backgroundColor: ['#3880ff', '#ffdd57', '#3880ff'],
        borderRadius: ['10px', '50%', '10px']
      },
      {
        easing: 'ease-in-out',
        duration: 1,
        direction: 'normal',
        repeat: 0,
        delay: stagger(0.15)
      }
    );
  }

  async wipePage() {
    const { animate } = await import('@motionone/dom');
    const overlay = document.getElementById('wipe-overlay');
    if (!overlay) return;
    // Reset overlay
    overlay.style.transform = 'scaleX(0)';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    // Wipe in
    overlay.style.transformOrigin = 'left';
    await animate(overlay, { scaleX: [0, 1] }, {
      duration: 0.5,
      easing: 'ease-in',
    }).finished;
    // (Optional) Do something while covered, e.g., load new content
    // Wipe out
    overlay.style.transformOrigin = 'right';
    await animate(overlay, { scaleX: [1, 0] }, {
      duration: 0.5,
      easing: 'ease-out',
    }).finished;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }
}
