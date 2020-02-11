import { InheritedObject } from '../../util/InheritedObject';

/**
 * The <i>MapObject</i>. TODO: Document.
 *
 * @author Jab
 */
export abstract class MapObject extends InheritedObject {

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
    protected constructor(width: number, height: number, name: string, id: string = null) {

        super(name, id);

        this.width = width;
        this.height = height;
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

}
