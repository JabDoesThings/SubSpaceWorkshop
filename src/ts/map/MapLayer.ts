import { MapObject } from './MapObject';
import { DataObject } from './DataObject';

/**
 * The <i>MapLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapLayer extends DataObject {

    private objects: MapObject[];

    /**
     * Main constructor.
     *
     * @param name The name of the layer.
     */
    constructor(name: string, id: string = null) {

        super(name, id);

        // Construct the objects array to store the objects on the layer.
        this.objects = [];
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
