import uuid = require('uuid');

/**
 * The <i>MapObject</i>. TODO: Document.
 *
 * @author Jab
 */
export class MapObject {

    private name: string;
    private width: number;
    private height: number;
    private id: string;

    /**
     * Main constructor.
     *
     * @param name The name of the MapObject.
     * @param width The width of the MapObject.
     * @param height The height of the MapObject.
     */
    constructor(name: string, width: number, height: number) {

        // Generate a new ID.
        this.id = uuid.v4();

        // Set the fields.
        this.name = name;
        this.width = width;
        this.height = height;

    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(value: number): void {
        this.width = value;
    }

    public getHeight(): number {
        return this.height;
    }

    public setHeight(value: number): void {
        this.height = value;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getId(): string {
        return this.id;
    }

    protected setId(id: string): void {
        this.id = id;
    }

}
