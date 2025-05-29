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
