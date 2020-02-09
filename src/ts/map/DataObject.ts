import uuid = require('uuid');

/**
 * The <i>DataObject</i> class. TODO: Document.
 *
 * @author Jab.
 */
export abstract class DataObject {

    private id: string;
    private name: string;

    /**
     * Main constructor.
     *
     * @param name The decorative name of the object.
     * @param id The internal ID of the object. If not provided, a UUID V4 is generated.
     */
    protected constructor(name: string, id: string = null) {
        this.name = name;
        if (id == null) {
            this.id = uuid.v4();
        } else {
            this.id = id;
        }
    }

    /**
     * Simplified method for comparing two DataObjects by their respective ID's.
     *
     * @param other The other DataObject to compare.
     *
     * @return Returns 'true' if the DataObject's ID equals this ID.
     */
    public equals(other: DataObject): boolean {
        return other != null && other.id === this.id;
    }

    /**
     * @return Returns the decorative name of the object.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Sets the decorative name of the object.
     *
     * @param name The name to set.
     */
    public setName(name: string): void {
        this.name = name;
    }

    /**
     * @return Returns the internal ID of the object.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Sets the internal ID of the object.
     *
     * @param id The ID to set.
     */
    public setId(id: string): void {
        this.id = id;
    }
}
