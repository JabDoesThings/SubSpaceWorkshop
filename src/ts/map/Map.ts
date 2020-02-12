import { RasterMapObject } from './objects/RasterMapObject';
import { MapObject } from './objects/MapObject';
import { Tileset } from './Tileset';
import { TileUtils } from './TileUtils';
import { UpdatedObject } from '../util/UpdatedObject';

/**
 * The <i>Map</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Map extends UpdatedObject {

    addLayer(layer: MapObject): any {
        this.layers.push(layer);
        this.setDirty(true);
    }

    private layers: MapObject[];

    private tileset: Tileset;

    /**
     * Main constructor.
     *
     * @param name The name of the map.
     * @param id The ID of the map.
     */
    public constructor(name: string, id: string = null) {

        super(name, id);

        this.tileset = TileUtils.DEFAULT_TILESET;

        this.layers = [];

        this.setDirty(true);
    }

    public onUpdate(delta: number): boolean {

        // Go through each layer and update it.
        for (let key in this.layers) {

            // Grab the next layer in the map and update it.
            let value = this.layers[key];
            value.update(delta);

        }

        return true;
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

    public getTileset(): Tileset {
        return this.tileset;
    }

    /**
     * @return Returns all layers in the map.
     */
    public getLayers(): MapObject[] {
        return this.layers;

    }
}
