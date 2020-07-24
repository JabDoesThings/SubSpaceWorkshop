import { Dirtable } from './Dirtable';

/**
 * The <i>DirtyObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class DirtyObject implements Dirtable {

  private dirty: boolean;

  /** @constructor */
  protected constructor() {
    this.dirty = false;
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
