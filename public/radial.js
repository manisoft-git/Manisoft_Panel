// Mobile-First Radial Gesture Dial (Floating Single-Hand Controller)
import { sound } from './sound.js';

export function initRadialDial(onAction) {
  const dial = document.getElementById('radial-dial');
  const trigger = document.getElementById('radial-trigger');
  if (!dial || !trigger) return;

  let isOpen = false;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.tap();
    isOpen = !isOpen;
    dial.classList.toggle('open', isOpen);
  });

  document.addEventListener('click', () => {
    if (isOpen) {
      isOpen = false;
      dial.classList.remove('open');
    }
  });

  const buttons = dial.querySelectorAll('.radial-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      sound.tap();
      isOpen = false;
      dial.classList.remove('open');
      if (onAction) onAction(action);
    });
  });
}
