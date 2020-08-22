import { validateLVZImage } from '../LVZUtils';
import Validatable from '../../../util/Validatable';
import Dirtable from '../../../util/Dirtable';
import MapSprite from '../../../editor/render/MapSprite';
import LVZResource from '../LVZResource';
import CompiledLVZImage from '../compiled/CompiledLVZImage';
import LVZPackage from '../compiled/LVZPackage';
import { LVZErrorStatus } from '../LVZProperties';
import {
  IMAGE_ANIMATION_TIME_MAX,
  IMAGE_ANIMATION_TIME_MIN,
  IMAGE_FRAME_COUNT_MAX,
  IMAGE_FRAME_COUNT_MIN
} from '../../LVZ';

/**
 * The <i>LVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LVZImage implements Validatable, Dirtable {
  private resource: LVZResource;
  private animationTime: number;
  private xFrames: number;
  private yFrames: number;
  private dirty: boolean;
  private sprite: MapSprite;

  /**
   * @param {LVZResource} file
   * @param {number} xFrames
   * @param {number} yFrames
   * @param {number} animationTime
   */
  constructor(file: LVZResource, xFrames: number = 1, yFrames: number = 1, animationTime: number = 0) {
    this.resource = file;
    this.animationTime = animationTime;
    this.xFrames = xFrames;
    this.yFrames = yFrames;
    this.dirty = true;
  }

  /** @override */
  public toString(): string {
    return `LVZImage={${this.resource.toString()}, xFrames=${this.xFrames}, yFrames=${this.yFrames}, animationTime=${this.animationTime}}`;
  }

  /** @override */
  public validate(): void {
    const status = validateLVZImage(this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message;
      if (status === LVZErrorStatus.IMAGE_RESOURCE_NULL) {
        message = 'The LVZImage resource is null.';
      } else if (status === LVZErrorStatus.ANIMATION_TIME_OUT_OF_RANGE) {
        message = `The LVZImage animationTime is out of range. The range is between ${IMAGE_ANIMATION_TIME_MIN} and ${IMAGE_ANIMATION_TIME_MAX}.`;
      } else if (status === LVZErrorStatus.X_FRAME_COUNT_OUT_OF_RANGE) {
        message = `The LVZImage xFrames is out of range. The range is between ${IMAGE_FRAME_COUNT_MIN} and ${IMAGE_FRAME_COUNT_MAX}. (Value is ${this.xFrames})`;
      } else if (status === LVZErrorStatus.Y_FRAME_COUNT_OUT_OF_RANGE) {
        message = `The LVZImage yFrames is out of range. The range is between ${IMAGE_FRAME_COUNT_MIN} and ${IMAGE_FRAME_COUNT_MAX}. (Value is ${this.yFrames})`;
      }
      console.log(message);
      throw new EvalError(message);
    }
  }

  compile(pkg: LVZPackage): CompiledLVZImage {
    return new CompiledLVZImage(pkg,
      this.getResource().getName(),
      this.getXFrames(),
      this.getYFrames(),
      this.getAnimationTime()
    );
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  getResource(): LVZResource {
    return this.resource;
  }

  setResource(resource: LVZResource): void {
    if (this.resource !== resource) {
      this.resource = resource;
      // The resource changed. The texture is now invalid and needs to be destroyed.
      this.sprite.texture.destroy(true);
      this.sprite = null;
      this.setDirty(true);
    }
  }

  getAnimationTime(): number {
    return this.animationTime;
  }

  setAnimationTime(time: number): void {
    if (this.animationTime !== time) {
      this.animationTime = time;
      // TODO: Apply to sprite if exists.
      this.setDirty(true);
    }
  }

  getXFrames(): number {
    return this.xFrames;
  }

  setXFrames(frames: number): void {
    if (this.xFrames !== frames) {
      this.xFrames = frames;
      // TODO: Apply to sprite if exists.
      this.setDirty(true);
    }
  }

  getYFrames(): number {
    return this.yFrames;
  }

  setYFrames(frames: number): void {
    if (this.yFrames !== frames) {
      this.yFrames = frames;
      // TODO: Apply to sprite if exists.
      this.setDirty(true);
    }
  }

  isAnimated(): boolean {
    return this.xFrames > 1 || this.yFrames > 1;
  }
}
