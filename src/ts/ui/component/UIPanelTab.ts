import { removeAllChildren } from '../UI';
import { UIPanel } from './UIPanel';
import UIPanelSection from './UIPanelSection';
import UITab from './UITab';

/**
 * The <i>UIPanelTab</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelTab {
  readonly element: HTMLDivElement;
  sections: UIPanelSection[] = [];
  panel: UIPanel;
  tab: UITab;
  id: string;

  /**
   * @param {string} id The ID of the panel-tab.
   */
  constructor(id: string) {
    this.id = id;
    this.element = document.createElement('div');
    this.element.classList.add('ui-panel-tab');
  }

  getIndex(): number {
    return this.panel == null ? -1 : this.panel.getIndex(this);
  }

  createSection(id: string, title: string): UIPanelSection {
    const section = new UIPanelSection(id, title);
    this.add(section);
    return section;
  }

  add(section: UIPanelSection): void {
    section.panelTab = this;
    this.sections.push(section);
    this.sort(null);
  }

  sort(comparator: (a: UIPanelSection, b: UIPanelSection) => number): boolean {
    removeAllChildren(this.element);
    if (this.sections.length === 0) {
      return false;
    }
    if (comparator != null) {
      this.sections.sort(comparator);
    }
    for (let index = 0; index < this.sections.length; index++) {
      const next = this.sections[index].element;
      this.element.appendChild(next);
    }
    return false;
  }

  openAllSections(delay: number = 0): void {
    if (this.isEmpty()) {
      return;
    }
    if (delay < 0) {
      throw new Error(`Closing delay values cannot be negative. (${delay} given)`);
    }
    for (let index = 0; index < this.sections.length; index++) {
      if (!this.sections[index].isOpen()) {
        this.sections[index].open(delay);
      }
    }
  }

  closeAllSections(delay: number = 0): void {
    if (this.isEmpty()) {
      return;
    }
    if (delay < 0) {
      throw new Error(`Closing delay values cannot be negative. (${delay} given)`);
    }
    for (let index = 0; index < this.sections.length; index++) {
      if (this.sections[index].isOpen()) {
        this.sections[index].close(delay);
      }
    }
  }

  getSection(id: string): UIPanelSection {
    if (this.isEmpty()) {
      return null;
    }
    for (let index = 0; index < this.sections.length; index++) {
      const next = this.sections[index];
      if (next.id === id) {
        return next;
      }
    }
    return null;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  size(): number {
    return this.sections.length;
  }
}

export default UIPanelTab;
