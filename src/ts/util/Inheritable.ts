/**
 * The <i>Inheritable</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface Inheritable {

  /////////////////
  // PARENT CODE //
  /////////////////

  /**
   * @return {boolean} Returns 'true' if the object has a parent.
   */
  hasParent(): boolean;

  /**
   * Checks if the object given is the parent.
   *
   * @param {Inheritable} object The object to test.
   *
   * @return {boolean} Returns 'true' if the object given is the parent.
   */
  isParent(object: Inheritable): boolean;

  /**
   * @return {Inheritable} Returns the parent of the object.
   */
  getParent(): Inheritable;

  /**
   * Sets the parent of the object.
   *
   * @param {Inheritable} object The object to set.
   *
   * @throws {Error} Thrown if the object is already the parent.
   */
  setParent(object: Inheritable): void;

  ///////////////////
  // CHILDREN CODE //
  ///////////////////

  /** @return {boolean} Returns 'true' if the object has children. */
  hasChildren(): boolean;

  /**
   * Tests if the object given is a child.
   *
   * @param {Inheritable} object The object to test.
   *
   * @return {boolean} Returns 'true' if the object is a child.
   *
   * @throws {Error} Thrown if the object given is null or undefined.
   */
  isChild(object: Inheritable): boolean;

  /**
   * Adds the object as a child.
   *
   * @param {Inheritable} object The object to add.
   *
   * @throws {Error} Thrown if the object given is null, undefined, or is already a child.
   */
  addChild(object: Inheritable): void;

  /**
   * Removes the object as a child.
   *
   * @param {Inheritable} object The object to remove.
   *
   * @throws {Error} Thrown if the object given is null, undefined, or is not a child.
   */
  removeChild(object: Inheritable): void;

  /** @return {Inheritable[]} Returns the children of the object. */
  getChildren(): Inheritable[];
}
