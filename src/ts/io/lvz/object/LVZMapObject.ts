import { Validatable } from '../../../util/Validatable';
import { Dirtable } from '../../../util/Dirtable';
import LVZImage from './LVZImage';
import { LVZDisplayMode, LVZErrorStatus, LVZRenderLayer } from '../LVZProperties';
import { validateLVZMapObject } from '../LVZUtils';
import {
  DISPLAY_MODE_MAX, DISPLAY_MODE_MIN, DISPLAY_TIME_MAX, DISPLAY_TIME_MIN,
  MAP_OBJECT_COORDINATE_MAX,
  MAP_OBJECT_COORDINATE_MIN,
  OBJECT_ID_MAX,
  OBJECT_ID_MIN, RENDER_LAYER_MAX, RENDER_LAYER_MIN
} from '../../LVZ';

/**
 * The <i>LVZMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZMapObject implements Validatable, Dirtable {

  public image: LVZImage;
  public x: number;
  public y: number;
  public id: number;
  public layer: LVZRenderLayer;
  public mode: LVZDisplayMode;
  public time: number;
  public dirty: boolean;

  /**
   * @constructor
   *
   * @param {LVZImage} image The LVZ image object to display.
   * @param {number} x The X coordinate of the object. (In pixels)
   * @param {number} y The Y coordinate of the object. (In pixels)
   * @param {number} id The display ID of the object.
   * @param {LVZRenderLayer} layer The layer to render the object. (DEFAULT: AfterTiles)
   * @param {LVZDisplayMode} mode The display mode for the object. (DEFAULT: ShowAlways)
   * @param {number} time The time to display the object. (DEFAULT: 0. 0 disabled timed display)
   */
  public constructor(
    image: LVZImage,
    x: number,
    y: number,
    id: number = 0,
    layer: LVZRenderLayer = LVZRenderLayer.AfterTiles,
    mode: LVZDisplayMode = LVZDisplayMode.ShowAlways,
    time: number = 0) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.id = id;
    this.layer = layer;
    this.mode = mode;
    this.time = time;
    this.dirty = true;
  }

  /** @override */
  public validate(): void {
    const state = validateLVZMapObject(this);
    if (state !== LVZErrorStatus.SUCCESS) {
      let message = null;
      if (state == LVZErrorStatus.IMAGE_NOT_DEFINED) {
        message = 'The LVZMapObject does not have a image.';
      } else if (state == LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE) {
        message = `The LVZMapObject's Object ID is out of range. Object IDs can be between ${OBJECT_ID_MIN} and ${OBJECT_ID_MAX}. (${this.id} given)`;
      } else if (state == LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE) {
        message = `The LVZMapObject X coordinate is out of range. Coordinates can be between ${MAP_OBJECT_COORDINATE_MIN} and ${MAP_OBJECT_COORDINATE_MAX}. (${this.x} given)`;
      } else if (state == LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE) {
        message = `The LVZMapObject Y coordinate is out of range. Coordinates can be between ${MAP_OBJECT_COORDINATE_MIN} and ${MAP_OBJECT_COORDINATE_MAX}. (${this.y} given)`;
      } else if (state == LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE) {
        message = `The LVZMapObject's 'display mode' is out of range. Display modes can be between ${DISPLAY_MODE_MIN} and ${DISPLAY_MODE_MAX}. (${this.mode} given)`;
      } else if (state == LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE) {
        message = `The LVZMapObject's 'render mode' is out of range. Render layers can be between ${RENDER_LAYER_MIN} and ${RENDER_LAYER_MAX}. (${this.layer} given)`;
      } else if (state == LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE) {
        message = `The LVZMapObject's 'display time' is out of range. Display times can be between ${DISPLAY_TIME_MIN} and ${DISPLAY_TIME_MAX}. (${this.time} given)`;
      }
      console.warn(message);
      throw new Error(message);
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /** @return {LVZImage} Returns the image displayed for the object. */
  public getImage(): LVZImage {
    return this.image;
  }

  /**
   * Sets the image displayed for the object.
   *
   * @param {LVZImage} image The image to set.
   */
  public setImage(image: LVZImage): void {
    if (this.image !== image) {
      this.image = image;
      this.setDirty(true);
    }
  }

  /** @return {number} Returns the X coordinate of the object. (In pixels) */
  public getX(): number {
    return this.x;
  }

  /**
   * Sets the X coordinate of the object. (In pixels)
   *
   * @param {number} value The value to set.
   */
  public setX(value: number): void {
    if (this.x !== value) {
      this.x = value;
      this.setDirty(true);
    }
  }

  /** @return Returns the Y coordinate of the object. (In pixels) */
  public getY(): number {
    return this.y;
  }

  /**
   * Sets the Y coordinate of the object. (In pixels)
   *
   * @param {number} value The value to set.
   */
  public setY(value: number): void {
    if (this.y !== value) {
      this.y = value;
      this.setDirty(true);
    }
  }

  /** @return Returns the assigned ID of the object to use for toggling the 'ServerControlled' {@link LVZDisplayMode}. */
  public getId(): number {
    return this.id;
  }

  /**
   * Sets the ID of the object to use for toggling the 'ServerControlled' {@link LVZDisplayMode}.
   *
   * @param {number} id The ID to set.
   */
  public setId(id: number): void {
    // TODO: Possible check for ID being negative. -Jab
    if (this.id !== id) {
      this.id = id;
      this.setDirty(true);
    }
  }

  /** @return Returns the assigned layer to render the object. */
  public getLayer(): LVZRenderLayer {
    return this.layer;
  }

  /**
   * Sets the layer to render the object.
   *
   * @param {LVZRenderLayer} layer The layer to set.
   */
  public setLayer(layer: LVZRenderLayer): void {
    if (this.layer !== layer) {
      this.layer = layer;
      this.setDirty(true);
    }

  }

  /** @return {LVZDisplayMode} Returns the display mode for how the object should display. */
  public getMode(): LVZDisplayMode {
    return this.mode;
  }

  /**
   * Sets the display mode for how the object should display.
   *
   * @param {LVZDisplayMode} mode The display mode to set.
   */
  public setMode(mode: LVZDisplayMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      this.setDirty(true);
    }
  }

  /**
   * @return {number} Returns the time that the object will show when toggled on. <p>
   *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
   */
  public getDisplayTime(): number {
    return this.time;
  }

  /**
   * Sets the time that the object will display when toggled on.
   * @param {number} time The display-time to set. <p>
   *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
   */
  public setDisplayTime(time: number): void {
    if (this.time !== time) {
      this.time = time;
      this.setDirty(true);
    }
  }
}

export default LVZMapObject;
