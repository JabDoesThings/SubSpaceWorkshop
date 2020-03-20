import { CompiledLVZMapObject, LVZPackage } from '../../io/LVZ';
import { EditManager} from '../EditManager';
import { EditMapObject } from './EditMapObject';

/**
 * The <i>EditMapObjectAdd</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditMapObjectAdd extends EditMapObject {

    /**
     * Main constructor.
     *
     * @param layer
     * @param lvzPackage
     * @param object
     */
    constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {
        super(layer, lvzPackage, object);
    }

    // @Override
    do(history: EditManager): void {
        this.lvzPackage.addMapObject(this.object);
    }

    // @Override
    undo(history: EditManager): void {
        this.lvzPackage.removeMapObject(this.object);
    }
}
