import { animate, stagger } from '@motionone/dom';

export function animateTabTransition() {
  const outlet = document.querySelector('ion-router-outlet');
  if (outlet) {
    // Find the ion-content inside the current tab view
    const ionContent = outlet.querySelector('ion-content');
    if (ionContent) {
      // Get only element children (skip ng-container, comments, etc)
      const children = Array.from(ionContent.children).filter(
        el => el.nodeType === 1 && (el as HTMLElement).offsetParent !== null
      );
      // If only one child (like a wrapper div), animate its children instead
      let targets = children;
      if (children.length === 1 && children[0].children.length > 0) {
        targets = Array.from(children[0].children).filter(
          el => el.nodeType === 1 && (el as HTMLElement).offsetParent !== null
        );
      }
      // Si no hay targets válidos, no animar
      if (!targets || targets.length === 0) return;
      animate(targets, {
        opacity: [0, 1],
        transform: ['translateY(40px)', 'translateY(0)']
      }, {
        duration: 0.45,
        delay: stagger(0.08),
        easing: 'ease'
      });
    }
  }
}

export function animateWelcomeScreen() {
  const el = document.getElementById('welcomeScreen');
  if (el) {
    animate(el, 
      { 
        opacity: [0, 0.3, 1],
        transform: ['scale(0.95) translateY(-20px)', 'scale(1.02) translateY(10px)', 'scale(1) translateY(0)']
      },
      { 
        duration: 0.9,
        easing: [0.22, 1, 0.36, 1]
      }
    );
  }
}
