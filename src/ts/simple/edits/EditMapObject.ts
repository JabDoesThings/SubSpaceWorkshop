import { Edit } from './Edit';
import { CompiledLVZMapObject, LVZPackage } from '../../io/LVZ';

/**
 * The <i>EditMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class EditMapObject extends Edit {

    readonly lvzPackage: LVZPackage;
    readonly object: CompiledLVZMapObject;
    private readonly layer: string;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param lvzPackage
     * @param object
     */
    protected constructor(layer: string, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {

        super();

        this.layer = layer;
        this.lvzPackage = lvzPackage;
        this.object = object;
    }
}
