import { MapLayer } from '../MapLayer';
import { DataObject } from '../DataObject';

/**
 * The <i>MapObject</i>. TODO: Document.
 *
 * @author Jab
 */
export class MapObject extends DataObject {

    private layer: MapLayer;
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
    }

    public getLayer(): MapLayer {
        return this.layer;
    }

    public setLayer(layer: MapLayer): void {
        this.layer = layer;
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

}
