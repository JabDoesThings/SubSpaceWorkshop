/**
 * The <i>Updatable</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface Updatable {

  /**
   * Call this to update the object.
   *
   * @param {number} delta
   */
  update(delta: number): void;

  /**
   * Fired when the object updates.
   *
   * @param {number} delta
   *
   * @return {boolean}
   */
  onUpdate(delta: number): boolean;
}
