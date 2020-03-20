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

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param lvzPackage
     * @param object
     */
    protected constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {

        super(layer);

        this.lvzPackage = lvzPackage;
        this.object = object;
    }
}
