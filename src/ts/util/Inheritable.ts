/**
 * The <i>Inheritable</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface Inheritable {

    /////////////////
    // PARENT CODE //
    /////////////////

    /**
     * @return Returns 'true' if the object has a parent.
     */
    hasParent(): boolean;

    /**
     * Checks if the object given is the parent.
     *
     * @param object The object to test.
     *
     * @return Returns 'true' if the object given is the parent.
     */
    isParent(object: Inheritable): boolean;

    /**
     * @return Returns the parent of the object.
     */
    getParent(): Inheritable;

    /**
     * Sets the parent of the object.
     *
     * @param object The object to set.
     *
     * @throws Error Thrown if the object is already the parent.
     */
    setParent(object: Inheritable): void;

    ///////////////////
    // CHILDREN CODE //
    ///////////////////

    /**
     * @return Returns 'true' if the object has children.
     */
    hasChildren(): boolean;

    /**
     * Tests if the object given is a child.
     *
     * @param object The object to test.
     *
     * @return Returns 'true' if the object is a child.
     *
     * @throws Error Thrown if the object given is null or undefined.
     */
    isChild(object: Inheritable): boolean;

    /**
     * Adds the object as a child.
     *
     * @param object The object to add.
     *
     * @throws Error Thrown if the object given is null, undefined, or is already a child.
     */
    addChild(object: Inheritable): void;

    /**
     * Removes the object as a child.
     *
     * @param object The object to remove.
     *
     * @throws Error Thrown if the object given is null, undefined, or is not a child.
     */
    removeChild(object: Inheritable): void;

    /**
     * @return Returns the children of the object.
     */
    getChildren(): Inheritable[];
}
