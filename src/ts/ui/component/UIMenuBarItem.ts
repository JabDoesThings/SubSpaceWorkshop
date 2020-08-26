import CustomEventListener from '../CustomEventListener';
import { UIMenuBarItemEvent } from '../UIEvents';
import UIMenuBarItemAction from './UIMenuBarItemAction';

export default class UIMenuBarItem extends CustomEventListener<UIMenuBarItemEvent> {
  readonly element: HTMLElement;
  readonly icon: HTMLElement;
  readonly id: string;
  enabled: boolean = true;
  private clickEventHandler: JQuery;

  /**
   * @param {HTMLElement | string} element
   * @param {string[] | null} classes
   */
  constructor(element: HTMLElement | string | null, classes: string[] | null = null) {
    super();
    if (!element || typeof element === 'string') {
      const id = element;
      element = document.createElement('div');
      if (id && typeof id === 'string') {
        element.id = id;
      }
      element.classList.add('icon-menu');
      this.icon = document.createElement('i');
      this.setIcon(classes);
      element.appendChild(this.icon);
      this.element = element;
    } else {
      if (!element) {
        throw new Error('The element given is null or undefined');
      }
      this.icon = <HTMLElement> element.getElementsByClassName('i').item(0);
      this.element = element;
      this.id = this.element.id;
    }

    this.clickEventHandler = $(element).on('click', () => {
      if (!this.enabled) {
        return;
      }
      this.dispatch(<UIMenuBarItemEvent> {
        eventType: 'UIMenuBarItemEvent',
        forced: false,
        item: this,
        action: UIMenuBarItemAction.CLICK,
        data: null
      });
    });
  }

  enable() {
    if (this.enabled) {
      throw new Error(`The MenuBarItem '${this.id}' is already enabled.`);
    }
    if (this.dispatch(<UIMenuBarItemEvent> {
      eventType: 'UIMenuBarItemEvent',
      forced: false,
      item: this,
      action: UIMenuBarItemAction.ENABLE,
      data: null
    })) {
      return;
    }
    this.element.classList.remove('disabled');
    this.enabled = true;
  }

  disable() {
    if (!this.enabled) {
      throw new Error(`The MenuBarItem '${this.id}' is not enabled.`);
    }
    if (this.dispatch(<UIMenuBarItemEvent> {
      eventType: 'UIMenuBarItemEvent',
      forced: false,
      item: this,
      action: UIMenuBarItemAction.DISABLE,
      data: null
    })) {
      return;
    }
    this.element.classList.add('disabled');
    this.enabled = false;
  }

  /**
   * @param {string[] | null} classes
   */
  setIcon(classes: string[] | null = null) {
    const event = <UIMenuBarItemEvent> {
      eventType: 'UIMenuBarItemEvent',
      forced: false,
      item: this,
      action: UIMenuBarItemAction.SET_ICON,
      data: {
        icon_classes: classes
      }
    };
    if (this.dispatch(event)) {
      return;
    }

    if (!classes && event.data.icon_classes) {
      classes = event.data.icon_classes;
    } else if (!classes) {
      classes = ['fas', 'fa-wrench'];
    }

    if (classes && classes.length !== 0) {
      classes.forEach(clazz => {
        this.icon.classList.add(clazz);
      });
    } else {
      // Clear class list if no icons are to be set.
      if (this.icon.classList.length !== 0) {
        for (let index = this.icon.classList.length - 1; index >= 0; index--) {
          this.icon.classList.remove(this.icon.classList.item(index));
        }
      }
    }
  }

  click() {
    if (!this.enabled) {
      return;
    }
    this.element.click();
    this.element.classList.add('active');
    setTimeout(() => {
      this.element.classList.remove('active');
    }, 50);
  }
}
