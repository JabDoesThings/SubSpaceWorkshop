import Validatable from '../../../util/Validatable';
import Dirtable from '../../../util/Dirtable';
import LVZImage from './LVZImage';
import { LVZDisplayMode, LVZRenderLayer, LVZXType, LVZYType } from '../LVZProperties';

/**
 * The <i>LVZScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LVZScreenObject implements Validatable, Dirtable {
  private image: LVZImage;
  private x: number;
  private y: number;
  private id: number;
  private time: number;
  private layer: LVZRenderLayer;
  private xType: LVZXType;
  private yType: LVZYType;
  private mode: LVZDisplayMode;
  private dirty: boolean;

  /**
   * @param {LVZImage} image The LVZ image object to display.
   * @param x {number} The X coordinate of the object. (In pixels)
   * @param y {number} The Y coordinate of the object. (In pixels)
   * @param id {number} The display ID of the object.
   * @param time {number} The time to display the object. (DEFAULT: 0. 0 disabled timed display)
   * @param layer {LVZRenderLayer} The layer to render the object. (DEFAULT: AfterTiles)
   * @param xType {LVZXType} The x coordinate's origin position on the screen. (DEFAULT: SCREEN_LEFT)
   * @param yType {LVZYType} The y coordinate's origin position on the screen. (DEFAULT: SCREEN_TOP)
   * @param mode {LVZDisplayMode} The display mode for the object. (DEFAULT: ShowAlways)
   */
  public constructor(
    image: LVZImage,
    x: number,
    y: number,
    id: number = 0,
    time: number = 0,
    layer: LVZRenderLayer = LVZRenderLayer.TopMost,
    xType: LVZXType = LVZXType.SCREEN_LEFT,
    yType: LVZYType = LVZYType.SCREEN_TOP,
    mode: LVZDisplayMode = LVZDisplayMode.ShowAlways) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.id = id;
    this.time = time;
    this.layer = layer;
    this.xType = xType;
    this.yType = yType;
    this.mode = mode;
    this.dirty = true;
  }

  /** @override */
  public validate(): void {
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

  /**
   * @return {number} Returns the X coordinate of the object. (In pixels)
   */
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

  /**
   * @return {number} Returns the Y coordinate of the object. (In pixels)
   */
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

  /**
   * @return {number} Returns the assigned ID of the object to use for toggling the 'ServerControlled'
   *   {@link LVZDisplayMode}.
   */
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

  /**
   * @return {LVZRenderLayer} Returns the assigned layer to render the object.
   */
  public getLayer(): LVZRenderLayer {
    return this.layer;
  }

  /**
   * Sets the layer to render the object.
   *
   * @param layer {LVZRenderLayer} The layer to set.
   */
  public setLayer(layer: LVZRenderLayer): void {
    if (this.layer !== layer) {
      this.layer = layer;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZDisplayMode} Returns the display mode for how the object should display.
   */
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
   *     <b>NOTE:</b> A display-time of <b>0</b> will show indefinitely until otherwise toggled off.
   */
  public getDisplayTime(): number {
    return this.time;
  }

  /**
   * Sets the time that the object will display when toggled on.
   *
   * @param {number} time The display-time to set. <p>
   *     <b>NOTE:</b> A display-time of <b>0</b> will show indefinitely until otherwise toggled off.
   */
  public setDisplayTime(time: number): void {
    if (this.time !== time) {
      this.time = time;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZXType} Returns the X-coordinate-origin on the screen the object's X coordinate will offset.
   */
  public getXType(): LVZXType {
    return this.xType;
  }

  /**
   * Sets the X-coordinate-origin on the screen that the object's X coordinate will offset.
   *
   * @param {LVZXType} type The type to set.
   */
  public setXType(type: LVZXType): void {
    if (this.xType !== type) {
      this.xType = type;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZYType} Returns the Y-coordinate-origin on the screen the object's Y coordinate will offset.
   */
  public getYType(): LVZYType {
    return this.yType;
  }

  /**
   * Sets the Y-coordinate-origin on the screen that the object's Y coordinate will offset.
   *
   * @param type {LVZYType} The type to set.
   */
  public setYType(type: LVZYType): void {
    if (this.yType !== type) {
      this.yType = type;
      this.setDirty(true);
    }
  }
}
