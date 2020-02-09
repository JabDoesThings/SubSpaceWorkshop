import { DataObject } from '../DataObject';

/**
 * The <i>MapObject</i>. TODO: Document.
 *
 * @author Jab
 */
export class MapObject extends DataObject {

    private parent: MapObject;
    private children: MapObject[];

    private width: number;
    private height: number;

    /**
     * Main constructor.
     *
     * @param width The width of the object.
     * @param height The height of the object.
     * @param name The name of the object.
     * @param id The ID of the object.
     */
    constructor(width: number, height: number, name: string, id: string = null) {
        super(name, id);
        this.width = width;
        this.height = height;
        this.children = [];
    }

    /**
     * @return Returns the width of the object.
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * Sets the width of the object.
     *
     * @param value The value to set.
     */
    public setWidth(value: number): void {
        this.width = value;
    }

    /**
     * @return Returns the height of the object.
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * Sets the height of the object.
     *
     * @param value The value to set.
     */
    public setHeight(value: number): void {
        this.height = value;
    }

    /////////////////
    // PARENT CODE //
    /////////////////

    /**
     * @return Returns 'true' if the object has a parent.
     */
    public hasParent(): boolean {
        return this.parent != null;
    }

    /**
     * Checks if the object given is the parent.
     *
     * @param object The object to test.
     *
     * @return Returns 'true' if the object given is the parent.
     */
    public isParent(object: MapObject): boolean {
        return this.parent != null && this.parent.equals(object);
    }

    /**
     * @return Returns the parent of the object.
     */
    public getParent(): MapObject {
        return this.parent;
    }

    /**
     * Sets the parent of the object.
     *
     * @param object The object to set.
     *
     * @throws Error Thrown if the object is already the parent.
     */
    public setParent(object: MapObject): void {

        if (this.parent != null) {

            // Make sure the object is not already the parent.
            if (this.parent.equals(object)) {
                throw new Error(
                    "The object '"
                    + object.getName()
                    + "' ("
                    + object.getId()
                    + ") is already the parent of the object '"
                    + this.getName()
                    + "' ("
                    + this.getId()
                    + ")"
                );
            }

            // Perform a secondary check to prevent infinite recursion.
            if (this.parent.isChild(this)) {
                this.parent.removeChild(this);
            }
        }

        this.parent = object;
    }

    ///////////////////
    // CHILDREN CODE //
    ///////////////////

    /**
     * @return Returns 'true' if the object has children.
     */
    public hasChildren(): boolean {
        return this.children.length != 0;
    }

    /**
     * Tests if the object given is a child.
     *
     * @param object The object to test.
     *
     * @return Returns 'true' if the object is a child.
     *
     * @throws Error Thrown if the object given is null or undefined.
     */
    public isChild(object: MapObject): boolean {

        // Make sure the object given is not null.
        if (object == null) {
            throw new Error("The object given is null or undefined.");
        }

        // Make sure that the object has children before iterating.
        if (this.hasChildren()) {

            // Go through each child to see if one matches the object given.
            for (let key in this.children) {

                // Grab the next child in the array.
                let value = this.children[key];

                // If the object's ID equals the next child, then we have
                //   a match.
                if (value.equals(object)) {
                    return true;
                }
            }
        }

        // If we reached this line, no child matches the one given.
        return false;
    }

    /**
     * Adds the object as a child.
     *
     * @param object The object to add.
     *
     * @throws Error Thrown if the object given is null, undefined, or is already a child.
     */
    public addChild(object: MapObject): void {

        // Make sure the object given is not null.
        if (object == null) {
            throw new Error("The object given is null or undefined.");
        }

        // Make sure the object is not already a child.
        if (this.isChild(object)) {
            throw new Error(
                "The object '"
                + object.getName()
                + "' ("
                + object.getId()
                + ") is already a child of the object '"
                + this.getName()
                + " ("
                + this.getId()
                + ")"
            );
        }

        // Perform a secondary check to prevent infinite recursion.
        if (!object.isParent(this)) {
            object.setParent(this);
        }

        // Add the child as the next index in the array.
        this.children.push(object);

    }

    /**
     * Removes the object as a child.
     *
     * @param object The object to remove.
     *
     * @throws Error Thrown if the object given is null, undefined, or is not a child.
     */
    public removeChild(object: MapObject): void {

        // Make sure the object given is not null.
        if (object == null) {
            throw new Error("The object given is null or undefined.");
        }

        // Make sure the object is a child.
        if (!this.isChild(object)) {
            throw new Error(
                "The object '"
                + object.getName()
                + "' ("
                + object.getId()
                + ") is not a child of the object '"
                + this.getName()
                + " ("
                + this.getId()
                + ")"
            );
        }

        // Perform a secondary check to prevent infinite recursion.
        if (object.isParent(this)) {
            object.setParent(null);
        }

        // Create the new array to replace the children array.
        let newChildren: MapObject[] = [];

        // Go through each child and check for a match.
        for (let key in this.children) {

            let value = this.children[key];

            // If the child matches, skip adding it to the new array.
            if (value.equals(object)) {
                continue;
            }

            newChildren.push(value);

        }

        // Set the new children array.
        this.children = newChildren;

    }

    /**
     * @return Returns the children of the object.
     */
    public getChildren(): MapObject[] {
        return this.children;
    }

}
