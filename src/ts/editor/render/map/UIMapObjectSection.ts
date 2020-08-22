import { UIPanelSection } from '../../../ui/UI';
import { LVZPackage } from '../../../io/LVZ';
import UIMapObjectEntry from './UIMapObjectEntry';

/**
 * The <i>UIMapObjectSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class UIMapObjectSection extends UIPanelSection {
  readonly pkgs: LVZPackage[] = [];
  entries: UIMapObjectEntry[] = [];

  /**
   * @param {string} id
   * @param {string} title
   */
  constructor(id: string, title: string) {
    super(id, title);
  }

  update(): void {
    if (!this.isEmpty()) {
      for (let index = 0; index < this.entries.length; index++) {
        const next = this.entries[index];
        this.element.removeChild(next.element);
      }
    }

    this.entries = [];
    if (this.pkgs.length === 0) {
      return;
    }

    for (let pkgIndex = 0; pkgIndex < this.pkgs.length; pkgIndex++) {
      const nextPkg = this.pkgs[pkgIndex];
      const mapObjects = nextPkg.mapObjects;
      for (let index = 0; index < mapObjects.length; index++) {
        const next = mapObjects[index];
        const entry = new UIMapObjectEntry(next);
        this.entries.push(entry);
      }
    }
  }

  isEmpty(): boolean {
    return this.size() !== 0;
  }

  size(): number {
    return this.entries.length;
  }
}
