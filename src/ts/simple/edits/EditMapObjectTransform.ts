import { CompiledLVZMapObject, LVZPackage } from '../../io/LVZ';
import { EditManager, LVZMapObjectProperties } from '../EditManager';
import { EditMapObject } from './EditMapObject';

/**
 * The <i>EditMapObjectTransform</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditMapObjectTransform extends EditMapObject {

    readonly object: CompiledLVZMapObject;
    readonly transform: LVZMapObjectProperties;

    originalTransform: LVZMapObjectProperties;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param lvzPackage
     * @param object
     * @param transform
     */
    constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject, transform: LVZMapObjectProperties) {

        super(layer, lvzPackage, object);

        this.transform = transform;
    }

    // @Override
    do(history: EditManager): void {
        if (this.originalTransform == null) {
            this.originalTransform = {
                x: this.object.x,
                y: this.object.y,
                id: this.object.id,
                layer: this.object.layer,
                mode: this.object.mode,
                time: this.object.time
            };
        }

        this.object.x = this.transform.x;
        this.object.y = this.transform.y;
        this.object.id = this.transform.id;
        this.object.layer = this.transform.layer;
        this.object.mode = this.transform.mode;
        this.object.time = this.transform.time;
    }

    // @Override
    undo(history: EditManager): void {

        if (this.originalTransform == null) {
            throw new Error("The original transform is not defined and cannot be redone.");
        }

        this.object.x = this.originalTransform.x;
        this.object.y = this.originalTransform.y;
        this.object.id = this.originalTransform.id;
        this.object.layer = this.originalTransform.layer;
        this.object.mode = this.originalTransform.mode;
        this.object.time = this.originalTransform.time;
    }
}
