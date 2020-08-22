import Edit from './Edit';
import EditManager from '../EditManager';
import MapSection from '../../util/map/MapSection';

/**
 * The <i>EditSelectionClear</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class EditSelectionClear extends Edit {
  private selections: MapSection[] = null;
  private done: boolean = false;

  /** @override */
  do(history: EditManager): void {
    if (this.done) {
      throw new Error('The selection is already removed.');
    }
    this.selections = history.project.selections.clear();
    this.done = true;
  }

  /** @override */
  undo(history: EditManager): void {
    if (!this.done) {
      throw new Error('The selection is not removed.');
    }
    history.project.selections.addAll(this.selections);
    this.selections = null;
    this.done = false;
  }
}
