/**
 * The <i>Dirtable</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface Dirtable {

  /** @return {boolean} Returns 'true' if the object is dirty. */
  isDirty(): boolean;

  /**
   * Sets the object's dirty state.
   *
   * @param {boolean} flag The flag to set.
   */
  setDirty(flag: boolean): void;
}
