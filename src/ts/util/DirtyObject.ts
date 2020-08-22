import Dirtable from './Dirtable';

/**
 * The <i>DirtyObject</i> class. TODO: Document.
 *
 * @author Jab
 * @deprecated This class is redundant.
 */
export default abstract class DirtyObject implements Dirtable {
  private dirty: boolean = false;

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}
