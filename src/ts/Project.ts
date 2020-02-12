import { DirtyDataObject } from './util/DirtyDataObject';
import { TileSet } from './map/TileSet';
import { MapLayer } from './map/MapLayer';

/**
 * The <i>Project</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Project extends DirtyDataObject {

    private layers: MapLayer[];

    private tileset: TileSet;

    /**
     * Main constructor.
     *
     * @param name The name of the project.
     * @param id The ID of the project. If an ID is not provided, a UUID will be generated in its place.
     */
    constructor(name: string, id: string) {

        super(name, id);

        // Create the layers with a default layer for new projects.
        this.layers = [];
        this.layers.push(new MapLayer("background"));
    }

    // @Override
    protected onUpdate(): void {

        for (let key in this.layers) {

            let value = this.layers[key];
            value.update();

        }

    }

}
