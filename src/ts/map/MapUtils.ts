import { Map } from './Map';
import * as fs from 'fs';
import { RasterMapObject } from './objects/RasterMapObject';
import { TileSet } from './TileSet';

/**
 * The <i>MapUtils</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapUtils {

    public static readonly MAP_LENGTH: number = 1024;

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
    public static validateCoordinates(x: number, y: number, startX: number, startY: number, endX: number, endY: number): void {

        // Make sure that the ranges are not inverted.
        MapUtils.validateRanges(startX, startY, endX, endY);

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
    public static validateRanges(startX: number, startY: number, endX: number, endY: number): void {

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
    public static isOutOfRange(
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
    public static contains(x: number, y: number, startX: number, startY: number, endX: number, endY: number) {
        return x >= startX && x <= endX && y >= startY && y <= endY;
    }

    public static read(map: Map, path: string): void {

        let tileset: TileSet = new TileSet(path, path);
        map.setTileset(tileset);

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

        // Skip tileset bitmap image.
        let offset = 2;
        let readInSize = buffer.readInt32LE(offset);
        offset += readInSize - 2;

        console.log("offset: " + offset + " length: " + length);

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

        let raster = new RasterMapObject(map, 1024, 1024, path, path);
        raster.setTiles(tiles);

        map.addLayer(raster);

    }
}
