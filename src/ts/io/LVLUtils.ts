import * as fs from "fs";
import { LVLMap, LVLTileSet } from './LVL';
import { BufferUtils } from '../util/BufferUtils';
import { Bitmap } from './Bitmap';
import * as PIXI from "pixi.js";
import { ELVLCollection } from './ELVL';
import { ELVL } from './ELVLUtils';

export class LVL {

    static readonly TILESET_DIMENSIONS: number[] = [304, 160];
    static readonly MAP_LENGTH = 1024;

    static DEFAULT_TILESET = LVL.readTilesetImage("assets/media/tiles.bmp");
    static FLAG_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/flag.png");
    static GOAL_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/goal.png");
    static PRIZES_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/prizes.png");
    static OVER1_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over1.png");
    static OVER2_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over2.png");
    static OVER3_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over3.png");
    static OVER4_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over4.png");
    static OVER5_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over5.png");
    static EXTRAS_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/extras.bmp");

    static read(path: string): LVLMap {

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

        let split = path.split("/");
        let name = split[split.length - 1].split('.')[0];

        return new LVLMap(name, tiles, tileSet, elvlData);
    }

    static write(map: LVLMap, path: string) {

        let tileSetBuffer: Buffer = null;
        let tileBuffer = LVL.toTileBuffer(map);
        let buffer: Buffer;
        if (map.tileset != null && map.tileset !== LVL.DEFAULT_TILESET) {
            tileSetBuffer = Bitmap.toBuffer(map.tileset.source, map.tileset.bitCount, true);
            buffer = Buffer.concat([tileSetBuffer, tileBuffer]);
        } else {
            buffer = tileBuffer;
        }

        fs.writeFileSync(path, buffer);
    }

    static readTilesetImage(path: string): LVLTileSet {
        let buffer = fs.readFileSync(path);
        return LVL.readTileset(buffer);
    }

    static readTileset(buffer: Buffer): LVLTileSet {

        let bitmap = new Bitmap(buffer);
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

    // static validatePosition(x: number, y: number): void {
    //
    //     let messages: string[] = [];
    //
    //     if (x < 0) {
    //         messages.push("The 'x' coordinate given is negative. (" + x + " given)");
    //     } else if (x > 1023) {
    //         messages.push("The 'x' coordinate given is greater than 1023. (" + x + " given)");
    //     }
    //
    //     if (y < 0) {
    //         messages.push("The 'y' coordinate given is negative. (" + y + " given)");
    //     } else if (y > 1023) {
    //         messages.push("The 'y' coordinate given is greater than 1023. (" + y + " given)");
    //     }
    //
    //     if (messages.length != 0) {
    //         throw new Error(messages.join("\n"));
    //     }
    // }

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

        let tiles = map.tiles;
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
