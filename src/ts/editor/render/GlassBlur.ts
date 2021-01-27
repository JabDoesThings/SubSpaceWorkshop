export default class GlassBlur {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.getElementById('viewport-glass-overlay');
    this.overlay.style.display = 'none';
  }

  enable(ticks: number = 500, onComplete: (() => void) | null = null): void {
    this.overlay.style.display = 'inline-block';
    this.overlay.style.opacity = '0';
    this.overlay.style.transition = `opacity ${ticks}ms ease-out !important`;
    this.overlay.style.pointerEvents = null;
    setTimeout(() => {
      this.overlay.style.opacity = '1';
    }, 1);
    setTimeout(() => {
      if (onComplete != null) {
        onComplete();
      }
    }, ticks);
  }

  disable(ticks: number = 500, onComplete: (() => void) | null = null): void {
    this.overlay.style.transition = `opacity ${ticks}ms ease-out !important`;
    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      this.overlay.style.display = 'none';
      if (onComplete != null) {
        onComplete();
      }
    }, ticks);
  }
}
