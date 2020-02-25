import { Dirtable } from '../../util/Dirtable';
import * as PIXI from "pixi.js";
import { LVL } from './LVLUtils';
import { ELVLCollection } from '../elvl/ELVL';

export class LVLMap implements Dirtable {

    tileset: LVLTileSet;

    metadata: ELVLCollection;

    readonly tiles: number[][];

    private dirty: boolean;

    public constructor(
        tiles: number[][] = null,
        tileSet: LVLTileSet = LVL.DEFAULT_TILESET,
        metadata: ELVLCollection = new ELVLCollection()
    ) {

        this.tileset = tileSet;
        this.metadata = metadata;

        if (tiles == null) {
            this.tiles = [];
            // Construct each slice.
            for (let x = 0; x < 1024; x++) {
                this.tiles[x] = [];
                for (let y = 0; y < 1024; y++) {
                    this.tiles[x][y] = 0;
                }
            }
        } else {
            this.tiles = tiles;
        }

        this.dirty = true;
    }

    /**
     * Clears all map tiles by filling them as '0'.
     */
    public clear(): void {

        // Go through each slice to clear.
        for (let x = 0; x < 1024; x++) {
            for (let y = 0; y < 1024; y++) {
                this.tiles[x][y] = 0;
            }
        }

    }

    /**
     * Fills a range with the given tile-value.
     *
     * @param startX The starting 'x' coordinate to fill.
     * @param startY The starting 'y' coordinate to fill.
     * @param endX The ending 'x' coordinate to fill.
     * @param endY The ending 'y' coordinate to fill.
     * @param value The tile-value to fill.
     *
     * @return Returns the amount of tiles set.
     *
     * @throws RangeError Thrown if the tile-value given is not an unsigned byte,
     *   or the range given is out of range for the RasterMapObject.
     */
    fill(startX: number, startY: number, endX: number, endY: number, value: number): number {

        // Make sure that the ranges are not inverted.
        LVL.validateRanges(startX, startY, endX, endY);

        // Make sure that the tile-value is a unsigned byte.
        LVL.validateTileId(value);

        // Check to make sure that the value is a whole integer.
        value = Math.floor(value);

        // Make sure that at least a portion of the range will draw at all before proceeding.
        if (LVL.isOutOfRange(startX, startY, endX, endY, 0, 0, 1023, 1023)) {
            return 0;
        }

        // Make sure that we draw only in-bounds.
        if (startX < 0) {
            startX = 0;
        }
        if (startY < 0) {
            startY = 0;
        }
        if (endX > 1023) {
            endX = 1023;
        }
        if (endY > 1023) {
            endY = 1023;
        }

        // This will store how many tiles are set.
        let changed = 0;

        // Loop through the area, setting the value of the tile to the one given.
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {

                // Make sure the tile is different before setting it.
                if (this.tiles[x][y] != value) {
                    this.tiles[x][y] = value;
                    changed++;
                }

            }
        }

        this.setDirty(true);

        // Return the total amount of tiles changed.
        return changed;
    }

    /**
     * @param x The 'x' coordinate for the tile.
     * @param y The 'y' coordinate for the tile.
     *
     * @return Returns the tile at the 'x' and 'y' coordinate.
     */
    public getTile(x: number, y: number): number {

        // Make sure that the coordinates are within bounds.
        LVL.validateCoordinates(x, y, 0, 0, 1023, 1023);

        // Grab the value stored in the tile array at the coordinates.
        return this.tiles[x][y];
    }

    /**
     * Sets the tile at the given coordinates with the given value.
     * @param x The 'x' coordinate of the tile to set.
     * @param y The 'y' coordinate of the tile to set.
     * @param value The tile-value to set.
     *
     * @return Returns 'true' if the 'x' and 'y' coordinates are within range and the tile is set.
     */
    public setTile(x: number, y: number, value: number): boolean {

        // Make sure that the tile ID is proper.
        LVL.validateTileId(value);

        // Make sure that the object contains the point to set.
        if (LVL.contains(x, y, 0, 0, 1023, 1023)) {

            // Make sure the pre-set value isn't the same as the one to set.
            if (this.tiles[x][y] != value) {

                this.tiles[x][y] = value;

                this.setDirty(true);

                // Return true to note the value has been set successfully
                return true;
            }
        }

        // Return false if the value is not set.
        return false;
    }

    public setTiles(tiles: number[][]) {

        if (tiles.length != 1024 || tiles[0].length != 1024) {
            throw new Error("THe tiles array given is not a [1024][1024] array.");
        }

        for (let x = 0; x < 1024; x++) {
            for (let y = 0; y < 1024; y++) {
                this.tiles[x][y] = tiles[x][y];
            }
        }

        this.setDirty(true);
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    getMetadata(): ELVLCollection {
        return this.metadata;
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

    private dirty: boolean;

    public source: HTMLCanvasElement;
    texture: PIXI.Texture;

    bitCount: number;

    constructor(canvas: HTMLCanvasElement) {

        this.source = canvas;

        // TILESET DEBUG CODE
        //
        // let width = 19;
        // let height = 40;
        // canvas.width = 16 * 19;
        // canvas.height = 16 * 5;
        //
        // let ctx = canvas.getContext("2d");
        //
        // let offset = 0;
        // for (let x = 0; x < width; x++) {
        //     for (let y = 0; y < height; y++) {
        //         let c = offset++ / (width * height) * 255.0;
        //         ctx.fillStyle = 'rgb(' + c + "," + c + "," + c + ")";
        //         ctx.fillRect(x * 16, y * 16, 16, 16);
        //     }
        // }

        this.texture = PIXI.Texture.from(canvas.toDataURL());
        this.bitCount = 8;

        this.tileCoordinates = [];
        this.tiles = [];
        this.tiles.push(null);

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 19; x++) {

                let tx = 16 * x;
                let ty = 16 * y;

                this.tileCoordinates.push([tx, ty]);

                // // Grab the section of the tileset for the tile and turn it into its own texture.
                // let rect = new PIXI.Rectangle(tx, ty, 16, 16);
                // let tile = new PIXI.Texture(this.texture.baseTexture, rect);
                //
                // // Push the next ID to the stack.
                // this.tiles.push(tile);
            }
        }

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 19; x++) {
                let tx = 16 * x;
                let ty = 16 * y;
                this.tileCoordinates.push([tx, ty]);
            }
        }
    }

    /**
     *
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

    /**
     * @return Returns the source image of the entire tileset.
     */
    public getTexture(): PIXI.Texture {
        return this.texture;
    }

    public getTileCoordinates(tile: number): number[] {
        return this.tileCoordinates[tile - 1];
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}
