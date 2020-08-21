import UITabMenu from './UITabMenu';
import { CustomEventListener } from '../CustomEventListener';
import { UITabEvent } from '../UIEvents';
import { TabAction } from '../UIProperties';

/**
 * The <i>UITab</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UITab extends CustomEventListener<UITabEvent> {
  element: HTMLDivElement;
  label: HTMLLabelElement;
  menu: UITabMenu;

  /**
   * @param {string} id
   * @param {string} title
   */
  constructor(id: string = null, title: string) {
    super();
    this.menu = null;

    // Create the label element for the title.
    this.label = <HTMLLabelElement> document.createElement('label');
    this.setTitle(title);

    // Create the main element for the tab.
    this.element = document.createElement('div');
    if (id != null) {
      this.element.id = id;
    }
    this.element.classList.add('ui-tab');
    this.element.appendChild(this.label);
    this.element.addEventListener('click', () => {
      if (this.isSelected()) {
        if (!this.menu.deselect()) {
          this.dispatch({
            eventType: 'UITabEvent',
            tab: this,
            action: TabAction.DESELECT,
            forced: false
          });
        }
      } else if (!this.menu.select(this)) {
        this.dispatch({
          eventType: 'UITabEvent',
          tab: this,
          action: TabAction.SELECT,
          forced: false
        });
      }
    });
  }

  getTitle(): string {
    return this.label.innerHTML;
  }

  setTitle(title: string): void {
    if (title == null) {
      this.label.innerHTML = '';
    } else {
      this.label.innerHTML = title;
    }
  }

  getId(): string {
    return this.element.id;
  }

  isSelected(): boolean {
    return this.menu != null && this.menu.selectedTab == this.getIndex();
  }

  getIndex(): number {
    return this.menu != null && !this.menu.isEmpty() ? this.menu.getIndex(this) : -1;
  }

  select(): void {
    if (this.menu != null) {
      this.menu.select(this);
    }
  }
}

export default UITab;
