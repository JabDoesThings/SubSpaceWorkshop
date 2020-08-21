import LVZPackage from './LVZPackage';
import LVZImage from '../object/LVZImage';
import { validateLVZCompiledImage } from '../LVZUtils';
import { LVZErrorStatus } from '../LVZProperties';

/**
 * The <i>CompiledLVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZImage {

  readonly pkg: LVZPackage;

  fileName: string;
  animationTime: number;
  xFrames: number;
  yFrames: number;

  /**
   * @constructor
   *
   * @param {LVZPackage} pkg
   * @param {string} fileName
   * @param {number} xFrames
   * @param {number} yFrames
   * @param {number} animationTime
   */
  constructor(pkg: LVZPackage, fileName: string, xFrames: number = 1, yFrames: number = 1, animationTime: number = 0) {
    this.pkg = pkg;
    this.fileName = fileName;
    this.animationTime = animationTime;
    this.xFrames = xFrames;
    this.yFrames = yFrames;
  }

  public validate(): void {
    let status = validateLVZCompiledImage(this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message = `Error Code: ${status}`;
      console.log(message);
      throw new EvalError(message);
    }
  }

  equals(other: any) {
    if (other instanceof LVZImage) {
      return other.getResource().getName() == this.fileName
        && other.getXFrames() == this.xFrames
        && other.getYFrames() == this.yFrames
        && other.getAnimationTime() == this.animationTime;
    } else if (other instanceof CompiledLVZImage) {
      return other.fileName == this.fileName
        && other.xFrames == this.xFrames
        && other.yFrames == this.yFrames
        && other.animationTime == this.animationTime;
    }
    return false;
  }

  unpack(): LVZImage {
    let resource = this.pkg.getResource(this.fileName);
    return new LVZImage(resource, this.xFrames, this.yFrames, this.animationTime);
  }
}

export default CompiledLVZImage;
