import { CompiledLVZMapObject, LVZPackage } from '../../io/LVZ';
import Edit from './Edit';

/**
 * The <i>EditMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class EditMapObject extends Edit {
  readonly lvzPackage: LVZPackage;
  readonly object: CompiledLVZMapObject;
  private readonly layer: string;

  /**
   * @param {string} layer The layer that the edit is on.
   * @param {LVZPackage} lvzPackage
   * @param {CompiledLVZMapObject} object
   */
  protected constructor(layer: string, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {
    super();
    this.layer = layer;
    this.lvzPackage = lvzPackage;
    this.object = object;
  }
}
