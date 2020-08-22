import UniqueObject from './UniqueObject';
import Dirtable from './Dirtable';
import Updatable from './Updatable';

/**
 * The <i>DirtyDataObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class DirtyDataObject extends UniqueObject implements Dirtable, Updatable {
  private dirty: boolean = false;

  /**
   * @param {string} name The name of the object.
   * @param {string} id The ID of the object.
   */
  protected constructor(name: string, id: string = null) {
    super(name, id);
  }

  /** @override */
  public update(delta: number): void {
    // Update the object only if it is dirty.
    if (this.isDirty()) {
      let result = this.onUpdate(delta);
      if (result) {
        this.setDirty(false);
      }
    }
  }

  /** @override */
  public isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  public setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /** @override */
  abstract onUpdate(delta: number): boolean;
}
