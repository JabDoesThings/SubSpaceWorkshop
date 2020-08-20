import { CompiledLVZMapObject, LVZPackage } from '../../io/LVZ';
import { EditManager } from '../EditManager';
import { EditMapObject } from './EditMapObject';

/**
 * The <i>EditMapObjectAdd</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditMapObjectAdd extends EditMapObject {

  /**
   * @constructor
   *
   * @param {string} layer
   * @param {LVZPackage} lvzPackage
   * @param {CompiledLVZMapObject} object
   */
  constructor(layer: string, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {
    super(layer, lvzPackage, object);
  }

  /** @override */
  do(history: EditManager): void {
    this.lvzPackage.addMapObject(this.object);
  }

  /** @override */
  undo(history: EditManager): void {
    this.lvzPackage.removeMapObject(this.object);
  }
}
