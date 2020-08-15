import * as fs from "fs";
import { LVLMap, LVLTileSet } from './LVL';
import { BufferUtils } from '../util/BufferUtils';
import { Bitmap } from './Bitmap';
import * as PIXI from "pixi.js";
import { ELVLCollection } from './ELVL';
import { ELVL } from './ELVLUtils';
import SCALE_MODES = PIXI.SCALE_MODES;
import { TileData } from '../util/map/TileData';

/**
 * The <i>LVL</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVL {

  /** The default tileset for SubSpace maps. */
  static DEFAULT_TILESET = LVL.readTilesetImage("assets/media/tiles.png", true);
  static TILE_DIMENSIONS: number[][] = [];
  /** 16x16 pixel tiles in a 19x10 grid. */
  static readonly TILESET_DIMENSIONS: number[] = [304, 160];
  /** The width and height of a map in tiles. */
  static readonly MAP_LENGTH = 1024;

  /**
   * Reads a ".LVL" SubSpace Map file.
   *
   * @param path {string} The path to the map file.
   *
   * @return {LVLMap} Returns the parsed map file.
   */
  static read(path: string): LVLMap {
    if (path == null) {
      throw new Error("The path given is null or undefined.");
    }

    let tileSet: LVLTileSet;
    let elvlData: ELVLCollection;
    let buffer = fs.readFileSync(path);
    let length = buffer.length;

    // Create blank map tile array.
    let tiles: number[][] = [];
    for (let x = 0; x < 1024; x++) {
      tiles[x] = [];
      for (let y = 0; y < 1024; y++) {
        tiles[x][y] = 0;
      }
    }

    let offset = 0;
    let bm = BufferUtils.readFixedString(buffer, 0, 2);
    if (bm === 'BM') {

      tileSet = this.readTileset(buffer);
      elvlData = ELVL.read(buffer);

      // Skip tileSet bitmap image.
      offset = buffer.readInt32LE(2);
    } else {
      tileSet = LVL.DEFAULT_TILESET;
      elvlData = new ELVLCollection();
    }

    let tileCount = 0;

    while (offset <= length - 4) {
      let i = buffer.readInt32LE(offset);
      offset += 4;
      let tile = (i >> 24 & 0x00ff);
      let y = (i >> 12) & 0x03FF;
      let x = i & 0x03FF;
      tiles[x][y] = tile;
      tileCount++;
    }

    let name: string;

    if (path.indexOf('/') !== -1) {
      let split = path.split("/");
      name = split[split.length - 1].split('.')[0];
    } else if (path.indexOf('\\') !== -1) {
      let split = path.split("\\");
      name = split[split.length - 1].split('.')[0];
    } else {
      name = 'untitled';
    }

    return new LVLMap(name, new TileData(tiles), tileSet, elvlData);
  }

  /**
   * Writes a map to a file.
   *
   * @param map {LVLMap} the map to write to bytes.
   * @param path {string} The path to a file to store the result bytes.
   */
  static write(map: LVLMap, path: string) {
    let tileSetBuffer: Buffer = null;
    let tileBuffer = LVL.toTileBuffer(map);
    let buffer: Buffer;
    if (map.tileset != null && map.tileset !== LVL.DEFAULT_TILESET) {
      // @ts-ignore
      let source = global.editor.renderer.toCanvas(map.tileset.texture);
      tileSetBuffer = Bitmap.toBuffer(source, map.tileset.bitCount, false);
      buffer = Buffer.concat([tileSetBuffer, tileBuffer]);
    } else {
      buffer = tileBuffer;
    }

    fs.writeFileSync(path, buffer);
  }

  static readTilesetImage(path: string, canDestroyBaseTexture: boolean = false): LVLTileSet {

    let split = path.toLowerCase().split('.');
    let extension = split[split.length - 1];

    if (extension.endsWith('bmp') || extension.endsWith('bm2')) {
      let buffer = fs.readFileSync(path);
      const tileset = LVL.readTileset(buffer);
      tileset.canDestroyBaseTexture = canDestroyBaseTexture;
      return tileset;
    }

    let texture = PIXI.Texture.from(path, {scaleMode: SCALE_MODES.NEAREST});
    const tileset = new LVLTileSet(texture);
    tileset.canDestroyBaseTexture = canDestroyBaseTexture;
    return tileset;
  }

  static readTileset(bitmapBuffer: Buffer): LVLTileSet {
    let bitmap = new Bitmap(bitmapBuffer);
    let imageData = bitmap.convertToImageData();

    let canvas = document.createElement('canvas');
    canvas.width = 304;
    canvas.height = 160;

    let context = canvas.getContext('2d');
    context.putImageData(imageData, 0, 0);

    let tileSet = new LVLTileSet(canvas);
    tileSet.bitCount = bitmap.header.bitCount;
    return tileSet;
  }

  /**
   * Tests 'x' and 'y' coordinates to be between the given start and end coordinate ranges.
   *
   * @param x The 'x' coordinate to test.
   * @param y The 'y' coordinate to test.
   * @param startX The minimum 'x' coordinate to pass the test.
   * @param startY The minimum 'y' coordinate to pass the test.
   * @param endX The maximum 'x' coordinate to pass the test.
   * @param endY The maximum 'y' coordinate to pass the test.
   *
   * @throws EvalError Thrown if the 'x' or 'y' coordinate ranges are inverted.
   * @throws RangeError Thrown if the 'x' or 'y' coordinate given falls outside the ranges given.
   */
  static validateCoordinates(x: number, y: number, startX: number, startY: number, endX: number, endY: number): void {

    // Make sure that the ranges are not inverted.
    LVL.validateRanges(startX, startY, endX, endY);

    // First, check the x value.
    if (x < startX || x > endX) {
      throw new RangeError(
        "'x' is out of range. (x can only be between "
        + startX
        + " and "
        + endX + ". "
        + x
        + " given)"
      );
    }

    // Next, check the y value.
    if (y < startY || y > endY) {
      throw new RangeError(
        "'y' is out of range. (y can only be between "
        + startY
        + " and "
        + endY
        + ". "
        + y
        + " given)"
      );
    }
  }

  /**
   * Tests whether or not the starting coordinate is greater than the ending coordinate.
   *
   * @param startX The minimum 'x' coordinate to test.
   * @param startY The minimum 'y' coordinate to test.
   * @param endX The maximum 'x' coordinate to test.
   * @param endY The maximum 'y' coordinate to test.
   *
   * @throws EvalError Thrown if the 'x' or 'y' coordinate ranges are inverted.
   */
  static validateRanges(startX: number, startY: number, endX: number, endY: number): void {

    if (startX > endX) {
      throw new EvalError("'startX' is greater than 'endX'.");
    } else if (startY > endY) {
      throw new EvalError("'startY' is greater than 'endY'.");
    }
  }

  /**
   * Tests whether the 'src' range is completely outside of the 'dst' range.
   *
   * @param srcStartX The minimum 'x' coordinate of the 'src' range.
   * @param srcStartY The minimum 'y' coordinate of the 'src' range.
   * @param srcEndX The maximum 'x' coordinate of the 'src' range.
   * @param srcEndY The maximum 'y' coordinate of the 'src' range.
   * @param dstStartX The minimum 'x' coordinate of the 'dst' range.
   * @param dstStartY The minimum 'y' coordinate of the 'dst' range.
   * @param dstEndX The maximum 'x' coordinate of the 'dst' range.
   * @param dstEndY The maximum 'y' coordinate of the 'dst' range.
   *
   * @return Returns 'true' if the 'src' is completely outside of the 'dst' range.
   */
  static isOutOfRange(
    srcStartX: number, srcStartY: number, srcEndX: number, srcEndY: number,
    dstStartX: number, dstStartY: number, dstEndX: number, dstEndY: number): boolean {
    return srcEndX < dstStartX
      || srcStartX > dstEndX
      || srcEndY < dstStartY
      || srcStartY > dstEndY;
  }

  /**
   * Tests whether the 'x' and 'y' coordinates are contained within the coordinate range.
   *
   * @param x The 'x' coordinate to test.
   * @param y The 'y' coordinate to test.
   * @param startX The minimum 'x' coordinate of the range.
   * @param startY The minimum 'y' coordinate of the range.
   * @param endX The maximum 'x' coordinate of the range.
   * @param endY The maximum 'y' coordinate of the range.
   *
   * @return Returns 'true' if the 'x' and 'y' coordinate are within the range given.
   */
  static contains(x: number, y: number, startX: number, startY: number, endX: number, endY: number) {
    return x >= startX && x <= endX && y >= startY && y <= endY;
  }

  /**
   * Tests whether the image given is null or the dimensions given are invalid.
   *
   * @param image The image to test.
   *
   * @throws Error Thrown if the image is null, undefined, or does not fit the dimensions given.
   */
  static validateTilesetImage(image: HTMLImageElement) {

    // First, make sure the image is not null or undefined.
    if (image == null) {
      throw new Error("The image given is null or undefined.");
    }

    // Grab the dimensions to check against.
    let dims = LVL.TILESET_DIMENSIONS;

    // Check if either width or height dimensions do not match.
    if (image.width != dims[0] || image.height != dims[1]) {
      throw new Error(
        "Invalid dimensions for the tileset image. Images must be "
        + dims[0]
        + "x"
        + dims[1]
        + ". ("
        + image.width
        + "x"
        + image.height
        + " given)"
      );
    }
  }

  /**
   *
   * Tests if the image is 16x16 pixels. (The dimensions of a tile)
   *
   * @param image The image to test.
   *
   * @throws Error Thrown if the image is null, or the width or height of the image is
   *   not 16 pixels.
   */
  static validateTileImage(image: PIXI.Texture) {

    // First, make sure the image is not null or undefined.
    if (image == null) {
      throw new Error("The image given is null or undefined.");
    }

    let width = image.width;
    let height = image.height;

    if (width != 16 || height != 16) {
      throw new Error(
        "Invalid dimensions for the tile image. Images must be 16x16. ("
        + width
        + "x"
        + height
        + " given)"
      );
    }

  }

  /**
   * Tests if a image's dimensions are divisible by 16.
   *
   * @param image The image to test.
   *
   * @return Returns 'true' if the image's dimensions are divisible by 16.
   */
  static canImageFitTiles(image: HTMLImageElement): boolean {

    // First, make sure the image is not null or undefined.
    if (image == null) {
      throw new Error("The image given is null or undefined.");
    }

    return LVL.canFitTiles(image.width, image.height);

  }

  /**
   * Tests if both a 'width' and 'height' value are divisible by 16.
   *
   * @param width The 'width' value to test.
   * @param height The 'height' value to test.
   *
   * @return Returns 'true' if the width and height are both divisible by 16.
   */
  static canFitTiles(width: number, height: number): boolean {
    return width % 16 == 0 && height % 16 == 0;
  }

  /**
   * Tests whether or not a tile is a unsigned byte value between 0 and 255.
   * @param value The value to test.
   *
   * @throws RangeError Thrown if the value is less than 0 or greater than 255.
   */
  static validateTileId(value: number): void {
    if (value < 0 || value > 255) {
      throw new RangeError("The tile-value given is out of range. " +
        "Tile values can only be between 0 and 255. (" + value + " given)");
    }
  }

  static validateArea(x1: number, y1: number, x2: number, y2: number) {

    let messages: string[] = [];

    if (x1 > x2 || y1 > y2) {
      messages.push(
        "The coordinates given are inverted. x1 should be less than x2 and y1 should be less than y2. ("
        + "{"
        + "x1:" + x1 + ","
        + "y1:" + y1 + ","
        + "x2:" + x2 + ","
        + "y2:" + y2
        + "} given)"
      );
    }

    if (x1 < 0) {
      messages.push("The 'x1' coordinate given is negative. (" + x1 + " given)");
    } else if (x1 > 1023) {
      messages.push("The 'x1' coordinate given is greater than 1023. (" + x1 + " given)");
    }

    if (y1 < 0) {
      messages.push("The 'y1' coordinate given is negative. (" + y1 + " given)");
    } else if (y1 > 1023) {
      messages.push("The 'y1' coordinate given is greater than 1023. (" + y1 + " given)");
    }

    if (x2 < 0) {
      messages.push("The 'x2' coordinate given is negative. (" + x2 + " given)");
    } else if (x2 > 1023) {
      messages.push("The 'x2' coordinate given is greater than 1023. (" + x2 + " given)");
    }

    if (y2 < 0) {
      messages.push("The 'y2' coordinate given is negative. (" + y2 + " given)");
    } else if (y2 > 1023) {
      messages.push("The 'y2' coordinate given is greater than 1023. (" + y2 + " given)");
    }

    if (messages.length != 0) {
      throw new Error(messages.join("\n"));
    }
  }

  /**
   * Tests whether or not the ID given is within the standard tileset range of 1 and 190.
   * @param tile The ID to test.
   *
   * @return Returns 'true' if the ID is within 1 and 190.
   */
  static inTilesetRange(tile: number): boolean {
    return tile >= 1 && tile <= 190;
  }

  private static toTileBuffer(map: LVLMap): Buffer {
    let tiles = map.tiles.getTiles(false);
    let tilesToWrite: { id: number, x: number, y: number }[] = [];
    for (let x = 0; x < 1024; x++) {
      for (let y = 0; y < 1024; y++) {
        let nextTile = tiles[x][y];
        if (nextTile !== 0) {
          tilesToWrite.push({id: nextTile, x: x, y: y});
        }
      }
    }

    let mapBufferLength = 4 * tilesToWrite.length;
    let buffer: Buffer = Buffer.alloc(mapBufferLength);

    let offset = 0;
    for (let index = 0; index < tilesToWrite.length; index++) {
      let tile = tilesToWrite[index];
      let int = ((tile.id & 0x00ff) << 24) | ((tile.y & 0x03FF) << 12) | (tile.x & 0x03FF);
      buffer.writeInt32LE(int, offset);
      offset += 4;
    }

    return buffer;
  }
}

export const toTilesetCoords = (mx: number, my: number): { x: number, y: number } => {
  if (mx < 0) {
    mx = 0;
  } else if (mx > 303) {
    mx = 303;
  }
  if (my < 0) {
    my = 0;
  } else if (my > 159) {
    my = 159;
  }
  return {x: mx >> 4, y: my >> 4};
};

// Create dimension array to reference for tools.
for (let index = 0; index < 256; index++) {
  LVL.TILE_DIMENSIONS[index] = new Array(2);

  if (index == 217) {
    // Large Asteroid
    LVL.TILE_DIMENSIONS[index][0] = 2;
    LVL.TILE_DIMENSIONS[index][1] = 2;
  } else if (index == 219) {
    // Station Tile
    LVL.TILE_DIMENSIONS[index][0] = 6;
    LVL.TILE_DIMENSIONS[index][1] = 6;
  } else if (index == 220) {
    // Wormhole Tile
    LVL.TILE_DIMENSIONS[index][0] = 5;
    LVL.TILE_DIMENSIONS[index][1] = 5;
  } else {
    // Other Tiles
    LVL.TILE_DIMENSIONS[index][0] = 1;
    LVL.TILE_DIMENSIONS[index][1] = 1;
  }
}
