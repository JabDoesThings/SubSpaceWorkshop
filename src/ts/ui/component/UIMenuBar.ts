import UIMenuBarItem from './UIMenuBarItem';

export default class UIMenuBar {
  readonly items: { [id: string]: UIMenuBarItem } = {};
  readonly element: HTMLElement;

  constructor(element: HTMLElement | null = null) {
    if (!element) {
      element = document.createElement('div');
      element.classList.add('menu-bar');
    }
    this.element = element;

    if (this.element.children.length !== 0) {
      for (let index = 0; index < this.element.children.length; index++) {
        const child = <HTMLElement> this.element.children.item(index);
        const item = new UIMenuBarItem(child);
        this.items[item.id] = item;
      }
    }
  }

  addItem(item: UIMenuBarItem): void {
    this.items[item.id] = item;
    this.element.appendChild(item.element);
  }
}
