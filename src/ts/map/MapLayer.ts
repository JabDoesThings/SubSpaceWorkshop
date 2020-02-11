import { MapObject } from './objects/MapObject';
import { DirtyDataObject } from '../util/DirtyDataObject';

/**
 * The <i>MapLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapLayer extends DirtyDataObject {

    private readonly objects: MapObject[];

    /**
     * Main constructor.
     *
     * @param name The name of the layer.
     * @param id The ID of the layer. If one is not defined, a UUID will generate in its place.
     */
    constructor(name: string, id: string = null) {

        super(name, id);

        // Construct the objects array to store the objects on the layer.
        this.objects = [];

    }

    // @Override
    protected onUpdate(): void {

        // Go through all objects to update them.
        for (let key in this.objects) {

            let value = this.objects[key];

            value.update();

        }

    }

    public getObjects(): MapObject[] {
        return this.objects;
    }

    public addObject(object: MapObject) {

        // Make sure the object given isn't null or undefined.
        if (object == null) {
            throw new Error("The object provided is null or undefined.");
        }

        // Make sure that the object is not already assigned to the layer.
        if (this.contains(object)) {
            throw new EvalError(
                "The object '"
                + object.getName()
                + "' (" + object.getId()
                + ") is already in the MapLayer '"
                + this.getName()
                + "' ("
                + this.getId()
                + ")"
            );
        }

        this.objects.push(object);
    }

    /**
     * Checks if the layer contains an object.
     *
     * @param object
     *
     * @return Returns 'true' if the layer contains the object.
     */
    public contains(object: MapObject): boolean {

        for (let key in this.objects) {

            let value = this.objects[key];
            if (value === object) {
                return true;
            }

        }

        return false;
    }

}
