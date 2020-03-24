import uuid = require('uuid');
import { MapArea } from '../../util/map/MapArea';

export abstract class Layer {

    static readonly DEFAULT_NAME: string = 'Untitled Layer';

    private readonly id: string;

    private name: string;

    protected constructor(id: string, name: string) {

        // If the ID given is null or undefined, generate a unique one.
        if(id == null) {
            id = uuid.v4();
        }

        // If a name is not provided, use the default name.
        if(name == null) {
            name = Layer.DEFAULT_NAME;
        }

        this.id = id;
        this.name = name;
    }

    /**
     * @return Returns the displayed name of the layer.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Sets the displayed name of the layer.
     *
     * @param name The name to set.
     */
    setName(name: string): void {
        this.name = name;
    }

    /**
     * @return Returns the unique ID of the layer.
     */
    getId(): string {
        return this.id;
    }

    /**
     * @return Returns the minimum and maximum coordinates populated by the layer.
     */
    abstract getBounds(): MapArea;
}

