import { validateDecompressedLVZMapObject } from '../LVZUtils';
import { LVZErrorStatus } from '../LVZProperties';
import LVZPackage from './LVZPackage';

/**
 * The <i>CompiledLVZMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class CompiledLVZMapObject {
  readonly pkg: LVZPackage;
  id: number;
  x: number;
  y: number;
  image: number;
  layer: number;
  time: number;
  mode: number;

  /**
   * @param {LVZPackage} pkg
   * @param {number} id
   * @param {number} x
   * @param {number} y
   * @param {number} image
   * @param {number} layer
   * @param {number} time
   * @param {number} mode
   */
  constructor(pkg: LVZPackage, id: number, x: number, y: number, image: number, layer: number, time: number, mode: number) {
    this.pkg = pkg;
    this.id = id;
    this.x = x;
    this.y = y;
    this.image = image;
    this.layer = layer;
    this.time = time;
    this.mode = mode;
  }

  validate(dpkg: LVZPackage): void {
    const status = validateDecompressedLVZMapObject(dpkg, this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message = `Error Code: ${status}`;
      console.log(message);
      throw new EvalError(message);
    }
  }
}
