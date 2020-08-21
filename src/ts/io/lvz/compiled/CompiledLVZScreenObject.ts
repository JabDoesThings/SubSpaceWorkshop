import LVZPackage from './LVZPackage';
import { LVZErrorStatus } from '../LVZProperties';
import { validateDecompressedLVZScreenObject } from '../LVZUtils';

/**
 * The <i>CompiledLVZScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZScreenObject {

  pkg: LVZPackage;
  id: number;
  xType: number;
  x: number;
  yType: number;
  y: number;
  image: number;
  layer: number;
  time: number;
  mode: number;

  /**
   * @constructor
   *
   * @param {LVZPackage} pkg
   * @param {number} id
   * @param {number} xType
   * @param {number} x
   * @param {number} yType
   * @param {number} y
   * @param {number} image
   * @param {number} layer
   * @param {number} time
   * @param {number} mode
   */
  constructor(
    pkg: LVZPackage,
    id: number,
    xType: number,
    x: number,
    yType: number,
    y: number,
    image: number,
    layer: number,
    time: number,
    mode: number) {
    this.pkg = pkg;
    this.id = id;
    this.xType = xType;
    this.x = x;
    this.yType = yType;
    this.y = y;
    this.image = image;
    this.layer = layer;
    this.time = time;
    this.mode = mode;
  }

  public validate(dpkg: LVZPackage): void {
    const status = validateDecompressedLVZScreenObject(dpkg, this);
    if (status !== LVZErrorStatus.SUCCESS) {
      const message = `Error Code: ${status}`;
      console.log(message);
      throw new EvalError(message);
    }
  }
}

export default CompiledLVZScreenObject;
