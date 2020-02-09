import { MapLayer } from './MapLayer';
import { DataObject } from './DataObject';

/**
 * The <i>Map</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Map extends DataObject {

    private layers: MapLayer[];

    /**
     * Main constructor.
     *
     * @param name The name of the map.
     * @param id The ID of the map.
     */
    constructor(name: string, id: string = null) {
        super(name, id);
        this.clear();
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

    public isEmpty(): boolean {
        return this.layers.length == 0;
    }
}
