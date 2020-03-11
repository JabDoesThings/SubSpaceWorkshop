import { Inheritable } from './Inheritable';
import { UpdatedObject } from './UpdatedObject';

/**
 * The <i>InheritedObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class InheritedObject extends UpdatedObject implements Inheritable {

    private children: Inheritable[];

    private parent: Inheritable;

    protected constructor(name: string, id: string = null) {

        super(name, id);

        this.children = [];

    }

    /////////////////
    // PARENT CODE //
    /////////////////

    // @Override
    public hasParent(): boolean {
        return this.parent != null;
    }

    // @Override
    public isParent(object: Inheritable): boolean {
        return this.parent != null && this.parent === object;
    }

    // @Override
    public getParent(): Inheritable {
        return this.parent;
    }

    // @Override
    public setParent(object: Inheritable): void {

        if (this.parent != null) {

            // Make sure the object is not already the parent.
            if (this.parent === object) {
                throw new Error(
                    "The object '"
                    + object
                    + "' is already the parent of the object '"
                    + this
                    + "'."
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

    // @Override
    public hasChildren(): boolean {
        return this.children.length != 0;
    }

    // @Override
    public isChild(object: Inheritable): boolean {

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

                // If the object equals the next child, then we have
                //   a match.
                if (value === object) {
                    return true;
                }
            }
        }

        // If we reached this line, no child matches the one given.
        return false;
    }

    // @Override
    public addChild(object: Inheritable): void {

        // Make sure the object given is not null.
        if (object == null) {
            throw new Error("The object given is null or undefined.");
        }

        // Make sure the object is not already a child.
        if (this.isChild(object)) {
            throw new Error(
                "The object '"
                + object
                + "' is already a child of the object '"
                + this
                + "'."
            );
        }

        // Perform a secondary check to prevent infinite recursion.
        if (!object.isParent(this)) {
            object.setParent(this);
        }

        // Add the child as the next index in the array.
        this.children.push(object);

    }

    // @Override
    public removeChild(object: Inheritable): void {

        // Make sure the object given is not null.
        if (object == null) {
            throw new Error("The object given is null or undefined.");
        }

        // Make sure the object is a child.
        if (!this.isChild(object)) {
            throw new Error(
                "The object '"
                + object
                + "' is not a child of the object '"
                + this
                + "'."
            );
        }

        // Perform a secondary check to prevent infinite recursion.
        if (object.isParent(this)) {
            object.setParent(null);
        }

        // Create the new array to replace the children array.
        let newChildren: Inheritable[] = [];

        // Go through each child and check for a match.
        for (let key in this.children) {

            let value = this.children[key];

            // If the child matches, skip adding it to the new array.
            if (value === object) {
                continue;
            }

            newChildren.push(value);

        }

        // Set the new children array.
        this.children = newChildren;

    }

    // @Override
    public getChildren(): Inheritable[] {
        return this.children;
    }
}
