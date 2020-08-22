import Selection from './Selection';
import Dirtable from '../../util/Dirtable';

/**
 * The <i>SelectionGroup</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class SelectionGroup implements Dirtable {
  selections: { [slot: number]: Selection } = {};
  private dirty: boolean = true;

  setSelection(slot: number, selection: Selection): void {
    this.selections[slot] = selection;
    this.setDirty(true);
  }

  getSelection(slot: number): Selection {
    return this.selections[slot];
  }

  getSelectionId(slot: number) {
    const selection = this.selections[slot];
    if (selection != null) {
      return selection.id;
    }
    return null;
  }

  clear(): void {
    for (let key in this.selections) {
      this.selections[key] = undefined;
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}
