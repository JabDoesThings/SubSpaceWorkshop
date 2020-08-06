import { Dirtable } from '../util/Dirtable';
import * as PIXI from "pixi.js";
import { LVL } from './LVLUtils';
import { ELVLCollection } from './ELVL';
import { TileData } from '../util/map/TileData';
import { MapArea } from '../util/map/MapArea';
import { HSVtoRGB, RGBtoHSV } from '../util/ColorUtils';

/**
 * The <i>LVLMap</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVLMap implements Dirtable {

  readonly tiles: TileData;
  tileset: LVLTileSet;
  metadata: ELVLCollection;
  name: string;

  private dirty: boolean;

  /**
   * @constructor
   *
   * @param name {string} The name of the map.
   * @param tiles {TileData} The tiles placed in the map.
   * @param tileSet {LVLTileSet} The tileset used by the map.
   * @param metadata {ELVLCollection} The ELVL metadata stored with the map file.
   */
  public constructor(
    name: string,
    tiles: TileData = null,
    tileSet: LVLTileSet = LVL.DEFAULT_TILESET,
    metadata: ELVLCollection = new ELVLCollection()
  ) {

    this.name = name;
    this.tileset = tileSet;
    this.metadata = metadata;

    if (tiles == null) {
      tiles = new TileData();
    }
    this.tiles = tiles;
  }

  getMetadata(): ELVLCollection {
    return this.metadata;
  }

  /** @override */
  public isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  public setDirty(flag: boolean, area: MapArea = null): void {
    if (flag != this.dirty) {
      this.dirty = flag;
      this.tiles.setDirty(flag, area);
    }
  }
}

/**
 * The <i>Tileset</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVLTileSet implements Dirtable {

  private readonly tiles: PIXI.Texture[];
  private readonly tileCoordinates: number[][];
  readonly tileColor: number[][];
  readonly defaultTileColor: number[] = [170, 170, 170];

  texture: PIXI.Texture;
  canvas: HTMLCanvasElement;
  borderTile: PIXI.Texture;
  bitCount: number;

  private dirty: boolean;

  /**
   * @constructor
   *
   * @param {HTMLCanvasElement | PIXI.Texture} canvasOrTexture The image source to import.
   */
  constructor(canvasOrTexture: HTMLCanvasElement | PIXI.Texture) {
    if (canvasOrTexture instanceof HTMLCanvasElement) {
      this.canvas = canvasOrTexture;
      this.texture = PIXI.Texture.from(canvasOrTexture.toDataURL());
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
    this.tileCoordinates = [];
    this.tiles = [];
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
        if(pixelCount !== 0) {
          const hsv = RGBtoHSV(color[0], color[1], color[2]);
          if (hsv.v < 0.5) {
            hsv.v = 0.5;
          }
          finalColor = HSVtoRGB(hsv.h, hsv.s, hsv.v);
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
    if (!LVL.inTilesetRange(tile)) {
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
    if (!LVL.inTilesetRange(tile)) {
      throw new RangeError(
        "The id given is out of range. Id's can only be between 1 and 190. ("
        + tile
        + " given)"
      );
    }

    // Make sure that the tile image is properly sized before application.
    LVL.validateTileImage(image);
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
}
