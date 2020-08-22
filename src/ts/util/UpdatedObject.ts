import Dirtable from './Dirtable';
import UniqueObject from './UniqueObject';

/**
 * The <i>UpdatedObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class UpdatedObject extends UniqueObject implements Dirtable {
  private dirty: boolean = false;
  private dirtyUpdate: boolean = true;

  /**
   * @param {string} name
   * @param {string} id
   */
  protected constructor(name: string = null, id: string = null) {
    super(name, id);
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /**
   * Call this to update the object.
   *
   * <p><b>NOTE:</b> The object will only update when it is dirty.
   *
   * @param {number} delta
   */
  public update(delta: number): void {
    // Update the object only if it is dirty.
    if (!this.requireDirtyToUpdate() || this.isDirty()) {
      const result: boolean = this.onUpdate(delta);
      if (this.requireDirtyToUpdate()) {
        // Reset the dirty state of the object after updating successfully.
        this.setDirty(!result);
      }
    }
  }

  public requireDirtyToUpdate(): boolean {
    return this.dirtyUpdate;
  }

  public setRequireDirtyToUpdate(flag: boolean): void {
    this.dirtyUpdate = flag;
  }

  /**
   * Fired when the object updates from being dirty.
   *
   * @return {boolean} Return 'true' if the update is successful.
   */
  protected abstract onUpdate(delta: number): boolean;
}
