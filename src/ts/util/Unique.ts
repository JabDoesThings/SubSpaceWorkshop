/**
 * The <i>Unique</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface Unique {

  /**
   * Simplified method for comparing two DataObjects by their respective ID's.
   *
   * @param {Unique} other The other DataObject to compare.
   *
   * @return {boolean} Returns 'true' if the DataObject's ID equals this ID.
   */
  equals(other: Unique): boolean;

  /** @return {string} Returns the decorative name of the object. */
  getName(): string;

  /**
   * Sets the decorative name of the object.
   *
   * @param {string} name The name to set.
   */
  setName(name: string): void;

  /**
   * @return {string} Returns the internal ID of the object.
   */
  getId(): string;

  /**
   * Sets the internal ID of the object.
   *
   * @param {string} id The ID to set.
   */
  setId(id: string): void;
}
