import { MapLayer } from './MapLayer';
import { UniqueObject } from '../util/UniqueObject';
import { RasterMapObject } from './objects/RasterMapObject';
import { MapObject } from './objects/MapObject';

/**
 * The <i>Map</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Map extends UniqueObject {

    private layers: MapObject[];

    /**
     * Main constructor.
     *
     * @param name The name of the map.
     * @param id The ID of the map.
     */
    public constructor(name: string, id: string = null) {
        super(name, id);

        this.layers = [];
        this.layers.push(new RasterMapObject(1024, 1024, "basic"));
    }

    /**
     * Clears all layers from the map.
     *
     * @return Returns 'true' if the map has one or more layers to clear.
     */
    public clear(): boolean {

        // Check if the Map has nothing to clear.
        if (this.isEmpty()) {
            return false;
        }

        // Clear the map by creating a new array for layers.
        this.layers = [];

        return true;

    }

    public getLayer(index: number): MapObject {
        return this.layers[index];
    }

    public isEmpty(): boolean {
        return this.layers.length == 0;
    }
}
