import CustomEventListener from '../../CustomEventListener';
import UIPopupEvent from './UIPopupEvent';

export default class UIPopup extends CustomEventListener<UIPopupEvent> {
  readonly id: string;
  readonly element: HTMLElement;
  readonly $element: JQuery;
  readonly content: HTMLElement;
  side: 'top' | 'bottom' | 'left' | 'right' | 'none' = 'none';
  theme: 'dark' | 'medium' | 'light';
  private isOpen: boolean = false;

  closeOnClickOutside: boolean = true;

  constructor(id: string, theme: 'dark' | 'medium' | 'light' = 'medium', element?: HTMLElement | null) {
    super();
    this.id = id;
    this.theme = theme;

    if (!element) {
      this.element = document.createElement('div');
      this.element.classList.add('ui-popup', this.side, this.theme);
      this.content = document.createElement('div');
      this.content.classList.add('ui-popup-content');
      this.element.appendChild(this.content);
    } else {
      this.element = element;
    }
    this.$element = $(this.element);
    document.body.appendChild(this.element);

    this.$element.on('click', (event) => {
      event.stopPropagation();
    });

    this.$element.on('pointerdown', (event) => {
      event.stopPropagation();
    });

    const $wildcard = $('*');

    const ctx = this;
    $wildcard.on('click', function() {
      if(ctx.closeOnClickOutside && !ctx.element.contains(this)) {
        ctx.close(200);
      }
    });

    $wildcard.on('pointerdown', function() {
      if(ctx.closeOnClickOutside && !ctx.element.contains(this)) {
        ctx.close(200);
      }
    });
  }

  private position(
    position: { top: number, left: number }, preferredSide: 'top' | 'bottom' | 'left' | 'right' | 'none' | null): void {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    if (preferredSide) {
      const opposite = (side: 'top' | 'bottom' | 'left' | 'right' | 'none'): 'top' | 'bottom' | 'left' | 'right' | 'none' => {
        switch (side) {
          case 'top':
            return 'bottom';
          case 'bottom':
            return 'top';
          case 'left':
            return 'right';
          case 'right':
            return 'left';
        }
        return 'none';
      };

      const canFit = (side: 'top' | 'bottom' | 'left' | 'right' | 'none'): boolean => {
        switch (side) {
          case 'top':
            return position.top - height >= 0;
          case 'bottom':
            return position.top + height < window.outerHeight;
          case 'left':
            return position.left - width >= 0;
          case 'right':
            return position.left + width >= window.outerWidth;
        }
        return true;
      };

      if (!canFit(preferredSide)) {
        preferredSide = opposite(preferredSide);
      }
      if (!canFit(preferredSide)) {
        preferredSide = opposite(preferredSide);
      }

      this.element.classList.remove('top', 'bottom', 'left', 'right');
      this.element.classList.add(preferredSide);
      this.side = preferredSide;
    }
    this.element.style.top = `${position.top}px`;
    this.element.style.left = `${position.left}px`;
  }

  open(
    position: { top: number, left: number } | HTMLElement | null = null,
    preferredSide: 'top' | 'bottom' | 'left' | 'right' | 'none' | null = null,
    fadeTimeMs: number = 0
  ) {

    if (this.isOpen) {
      throw new Error(`The popup '${this.id}' is already open.`);
    }
    if (fadeTimeMs < 0) {
      throw new Error(`fadeTimeMs can only be 0 or positive integer values. (${fadeTimeMs} given)`);
    }

    if (position) {
      if (position instanceof HTMLElement) {
        const elm = position;
        const $elm = $(elm);
        const rect = position.getBoundingClientRect();
        const width = $elm.width();
        const height = $elm.height();
        position = {
          top: rect.top + (height / 2),
          left: rect.left + (width / 2)
        };
      }
      this.position(position, preferredSide);
    }

    if (fadeTimeMs !== 0) {
      this.$element.fadeIn(fadeTimeMs);
    } else {
      this.$element.show();
    }

    this.isOpen = true;
  }

  close(fadeTimeMs: number = 0) {
    if (!this.isOpen) {
      throw new Error(`The popup '${this.id}' is not open.`);
    }
    if (fadeTimeMs < 0) {
      throw new Error(`fadeTimeMs can only be 0 or positive integer values. (${fadeTimeMs} given)`);
    }

    if (fadeTimeMs !== 0) {
      this.$element.fadeOut(fadeTimeMs);
    } else {
      this.$element.hide();
    }

    this.isOpen = false;
  }

}
