import InheritedObject from '../../util/InheritedObject';
import Inheritable from '../../util/Inheritable';
import Dirtable from '../../util/Dirtable';
import LayersPanel from '../../editor/ui/LayersPanel';

class UILayer extends InheritedObject<UILayer> implements Inheritable, Dirtable {
  element: HTMLDivElement;
  titleLabel: HTMLLabelElement;
  visibilityElement: HTMLDivElement;
  panel: LayersPanel;
  private readonly visibilityIcon: HTMLElement;
  private readonly invisibilityIcon: HTMLElement;
  private readonly gripElement: HTMLDivElement;
  private readonly gripIcon: HTMLElement;
  private readonly selected: boolean;
  private visible: boolean;
  private dirty: boolean;
  private locked: boolean;

  /**
   * @param {string} name
   */
  constructor(name: string) {
    super();
    this.visibilityIcon = document.createElement('i');
    this.visibilityIcon.classList.add('fas', 'fa-eye');
    this.visibilityIcon.style.opacity = '1';
    this.visibilityIcon.style.zIndex = '0';
    this.invisibilityIcon = document.createElement('i');
    this.invisibilityIcon.classList.add('fas', 'fa-eye-slash');
    this.invisibilityIcon.style.opacity = '0';
    this.invisibilityIcon.style.zIndex = '1';
    this.visibilityElement = document.createElement('div');
    this.visibilityElement.classList.add('visibility-icon');
    this.visibilityElement.appendChild(this.visibilityIcon);
    this.visibilityElement.appendChild(this.invisibilityIcon);
    this.visibilityElement.addEventListener('click', () => {
      this.setVisible(!this.visible);
    });

    this.gripIcon = document.createElement('i');
    this.gripIcon.classList.add('fas', 'fa-ellipsis-h');
    this.gripElement = document.createElement('div');
    this.gripElement.classList.add('grip-icon');
    this.gripElement.appendChild(this.gripIcon);
    this.titleLabel = document.createElement('label');
    this.titleLabel.classList.add('title');
    this.titleLabel.innerText = name;
    this.element = document.createElement('div');
    this.element.classList.add('ui-layer');
    this.element.appendChild(this.visibilityElement);
    this.element.appendChild(this.titleLabel);
    this.element.appendChild(this.gripElement);
    this.locked = false;
    this.selected = false;
    this.setVisible(true);
  }

  /** @override */
  addChild(object: UILayer): void {
    super.addChild(object);
    if (this.panel != null) {
      this.panel.updateElements();
    }
  }

  /** @override */
  removeChild(object: UILayer): number {
    const index = super.removeChild(object);
    if (this.panel != null) {
      this.panel.updateElements();
    }
    return index;
  }

  /** @override */
  setParent(object: UILayer): void {
    super.setParent(object);
    if (this.panel != null) {
      this.panel.updateElements();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(flag: boolean): void {
    if (this.visible === flag) {
      return;
    }
    this.visible = flag;
    this.dirty = true;
    if (flag) {
      this.invisibilityIcon.style.opacity = '0';
      this.visibilityIcon.style.opacity = '1';
    } else {
      this.visibilityIcon.style.opacity = '0';
      this.invisibilityIcon.style.opacity = '1';
    }
  }

  isLocked(): boolean {
    return this.locked;
  }

  setLocked(flag: boolean): void {
    if (this.locked === flag) {
      return;
    }
    this.locked = flag;
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  isSelected(): boolean {
    return this.selected;
  }

  setSelected(flag: boolean): void {
    if (flag) {
      if (!this.element.classList.contains('selected')) {
        this.element.classList.add('selected');
      }
    } else {
      if (this.element.classList.contains('selected')) {
        this.element.classList.remove('selected');
      }
    }
  }
}

export default UILayer;
