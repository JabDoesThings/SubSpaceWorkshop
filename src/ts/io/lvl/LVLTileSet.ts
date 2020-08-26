import Dirtable from '../../util/Dirtable';
import { asRGB255, asRGBFloat, HSL2RGB, RGB2HSL } from '../../util/ColorUtils';
import { inTilesetRange, validateTileImage } from './LVLUtils';

/**
 * Prettifies tile colors by softening their luminosity.
 *
 * @param {r: color, g: color, b: color} color The RGB values as [0, 255]
 *
 * @return {r: color, g: color, b: color} Returns the processed RGB values as [0, 255]
 */
export const processTileColor = (color: { r: number, g: number, b: number }): { r: number, g: number, b: number } => {
  const hsl = RGB2HSL(asRGBFloat(color));
  return asRGB255(HSL2RGB({h: hsl.h, s: hsl.s, l: (hsl.l < 0.5 ? 0.5 : hsl.l)}));
};

/**
 * The <i>Tileset</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LVLTileSet implements Dirtable {
  private readonly tiles: PIXI.Texture[] = [];
  private readonly tileCoordinates: number[][] = [];
  readonly tileColor: number[][] = [];
  readonly defaultTileColor: number[] = [170, 170, 170];
  texture: PIXI.Texture;
  canvas: HTMLCanvasElement;
  borderTile: PIXI.Texture;
  bitCount: number;
  canDestroyBaseTexture: boolean = false;
  private dirty: boolean;

  /**
   * @param {HTMLCanvasElement | PIXI.Texture} canvasOrTexture The image source to import.
   */
  constructor(canvasOrTexture: HTMLCanvasElement | PIXI.Texture) {
    if (canvasOrTexture instanceof HTMLCanvasElement) {
      this.set(canvasOrTexture);
    } else {
      this.texture = canvasOrTexture;
      this.canvas = document.createElement('canvas');
      this.canvas.width = 304;
      this.canvas.height = 160;
      const ctx = this.canvas.getContext('2d');
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // @ts-ignore
      ctx.drawImage(canvasOrTexture.baseTexture.resource.source, 0, 0);
    }

    this.bitCount = 24;

    this.tiles.push(null);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {
        this.tileCoordinates.push([16 * x, 16 * y]);
      }
    }

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {
        this.tileCoordinates.push([16 * x, 16 * y]);
      }
    }

    this.tileColor = [];
    this.tileColor.push([0, 0, 0]);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {

        const ctx = this.canvas.getContext('2d');
        let imgData = ctx.getImageData(x * 16, y * 16, 16, 16).data;

        let pixelCount = 0;
        let ar = 0;
        let ag = 0;
        let ab = 0;

        let offset = 0;
        for (let py = 0; py < 16; py++) {
          for (let px = 0; px < 16; px++) {
            let r = imgData[offset];
            let g = imgData[offset + 1];
            let b = imgData[offset + 2];
            if (r !== 0 && g !== 0 && b !== 0) {
              pixelCount++;
              ar += r;
              ag += g;
              ab += b;
            }
            offset += 4;
          }
        }
        const color = [0, 0, 0];
        if (pixelCount != 0) {
          color[0] = ar / pixelCount;
          color[1] = ag / pixelCount;
          color[2] = ab / pixelCount;
        }
        let finalColor;
        if (pixelCount !== 0) {
          finalColor = processTileColor({r: color[0], g: color[1], b: color[2]});
        } else {
          finalColor = {r: 0, g: 0, b: 0};
        }
        this.tileColor.push([finalColor.r, finalColor.g, finalColor.b]);
      }
    }
    this.borderTile = new PIXI.Texture(this.texture.baseTexture, new PIXI.Rectangle(0, 16, 16, 16));
  }

  /**
   * @param tile The ID of the tile to grab.
   *
   * @return Returns the image element of the tile in the tileset.
   *
   * @throws RangeError Thrown if the ID given is below 0 or above 190.
   */
  public getTile(tile: number): PIXI.Texture {
    // Check to make sure that the tile is within range.
    if (!inTilesetRange(tile)) {
      throw new RangeError(
        "The id given is out of range. Id's can only be between 1 and 190. ("
        + tile
        + " given)"
      );
    }
    return this.tiles[tile];
  }

  /**
   * Sets a tile-image for a tile-id in a tileset.
   *
   * @param tile The tile ID to set.
   * @param image The image to set for the tile.
   *
   * @throws RangeError Thrown if the tile ID given is out of the tileset's range of 1 to 190.
   * @throws Error Thrown if the image given is null or is not 16x16 in size.
   */
  public setTile(tile: number, image: PIXI.Texture) {
    // Check to make sure that the tile is within range.
    if (!inTilesetRange(tile)) {
      throw new RangeError(
        "The id given is out of range. Id's can only be between 1 and 190. ("
        + tile
        + " given)"
      );
    }

    // Make sure that the tile image is properly sized before application.
    validateTileImage(image);
    // Set the tile in the tiles array.
    this.tiles[tile] = image;
    // Sets the tileset as 'dirty' to be updated.
    this.setDirty(true);
  }

  /** @return {PIXI.Texture} Returns the source image of the entire tileset. */
  public getTexture(): PIXI.Texture {
    return this.texture;
  }

  /** @return {number[]} Returns the UV pixel coordinates for the tile. */
  public getTileCoordinates(tile: number): number[] {
    return this.tileCoordinates[tile - 1];
  }

  /** @override */
  public isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  public setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /** @return {LVLTileSet} Returns a cloned copy of the tileset. */
  clone(): LVLTileSet {
    return new LVLTileSet(this.texture.clone());
  }

  set(canvas: HTMLCanvasElement) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 304;
      this.canvas.height = 160;
    }

    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(canvas, 0, 0);

    if (this.texture) {
      this.texture.destroy(!this.canDestroyBaseTexture);
    }

    this.texture = PIXI.Texture.from(canvas);
    this.bitCount = 24;
    this.tileCoordinates.length = 0;
    this.tiles.length = 0;
    this.tiles.push(null);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {
        this.tileCoordinates.push([16 * x, 16 * y]);
      }
    }

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {
        this.tileCoordinates.push([16 * x, 16 * y]);
      }
    }

    this.tileColor.length = 0;
    this.tileColor.push([0, 0, 0]);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {

        const ctx = this.canvas.getContext('2d');
        let imgData = ctx.getImageData(x * 16, y * 16, 16, 16).data;

        let pixelCount = 0;
        let ar = 0;
        let ag = 0;
        let ab = 0;

        let offset = 0;
        for (let py = 0; py < 16; py++) {
          for (let px = 0; px < 16; px++) {
            let r = imgData[offset];
            let g = imgData[offset + 1];
            let b = imgData[offset + 2];
            if (r !== 0 && g !== 0 && b !== 0) {
              pixelCount++;
              ar += r;
              ag += g;
              ab += b;
            }
            offset += 4;
          }
        }
        const color = [0, 0, 0];
        if (pixelCount != 0) {
          color[0] = ar / pixelCount;
          color[1] = ag / pixelCount;
          color[2] = ab / pixelCount;
        }
        let finalColor;
        if (pixelCount !== 0) {
          finalColor = processTileColor({r: color[0], g: color[1], b: color[2]});
        } else {
          finalColor = {r: 0, g: 0, b: 0};
        }
        this.tileColor.push([finalColor.r, finalColor.g, finalColor.b]);
      }
    }
    this.borderTile = new PIXI.Texture(this.texture.baseTexture, new PIXI.Rectangle(0, 16, 16, 16));
    this.setDirty(true);
  }
}
