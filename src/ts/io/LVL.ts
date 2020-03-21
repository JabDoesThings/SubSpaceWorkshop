import { Dirtable } from '../util/Dirtable';
import * as PIXI from "pixi.js";
import { LVL } from './LVLUtils';
import { ELVLCollection } from './ELVL';
import { Path } from '../util/Path';
import { EditTiles } from '../simple/edits/EditTiles';

/**
 * The <i>LVLMap</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVLMap implements Dirtable {

    tileset: LVLTileSet;

    metadata: ELVLCollection;

    readonly tiles: number[][];
    dirtyAreas: LVLArea[];
    name: string;

    private dirty: boolean;

    public constructor(name: string,
                       tiles: number[][] = null,
                       tileSet: LVLTileSet = LVL.DEFAULT_TILESET,
                       metadata: ELVLCollection = new ELVLCollection()
    ) {

        this.name = name;
        this.tileset = tileSet;
        this.metadata = metadata;
        this.dirtyAreas = [];

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

        this.setAreaDirty(0, 0, 1023, 1023);
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
     * @param applyDimensions
     *
     * @return Returns 'true' if the 'x' and 'y' coordinates are within range and the tile is set.
     */
    public setTile(x: number, y: number, value: number, applyDimensions: boolean = true): {x: number, y: number, from: number, to: number}[] {

        // Make sure that the tile ID is proper.
        LVL.validateTileId(value);

        LVL.validateCoordinates(x, y, 0, 0, 1023, 1023);

        let changed: {x: number, y: number, from: number, to: number}[] = [];

        if (applyDimensions) {

            let minX = x;
            let maxX = x;
            let minY = y;
            let maxY = y;

            let processMinMax = (x: number, y: number): void => {
                if (minX > x) {
                    minX = x;
                }
                if (maxX < x) {
                    maxX = x;
                }
                if (minY > y) {
                    minY = y;
                }
                if (maxY < y) {
                    maxY = y;
                }
            };

            let contains = (tx: number, ty: number, x1: number, y1: number, x2: number, y2: number): boolean => {
                return tx >= x1 && tx <= x2 && ty >= y1 && ty <= y2;
            };

            let getSourceTiles = (cx: number, cy: number, to: number): { x: number, y: number, from: number, to: number }[] => {

                let sources: { x: number, y: number, from: number, to: number}[] = [];

                // If the tile to check is already assigned, return this tile as the source.
                if (this.tiles[cx][cy] !== 0) {
                    sources.push({x: cx, y: cy, from: this.tiles[cx][cy], to: to});
                }

                // Go through all dimensions.
                for (let y = cy - 5; y <= cy; y++) {
                    for (let x = cx - 5; x <= cx; x++) {

                        // Make sure the tile coordinates are valid.
                        if(x < 0 || x > 1023 || y < 0 || y > 1023) {
                            continue;
                        }

                        let id = this.tiles[x][y];
                        if (id != 0) {
                            let dimensions = LVL.TILE_DIMENSIONS[id];
                            let x2 = x + dimensions[0] - 1;
                            let y2 = y + dimensions[1] - 1;
                            if (contains(cx, cy, x, y, x2, y2)) {
                                sources.push({x: x, y: y, from: id, to: to});
                            }
                        }
                    }
                }

                return sources;
            };

            let remove = (x1: number, y1: number, x2: number, y2: number) => {
                for (let y = y1; y <= y2; y++) {
                    for (let x = x1; x <= x2; x++) {

                        // Make sure the tile coordinates are valid.
                        if(x < 0 || x > 1023 || y < 0 || y > 1023) {
                            continue;
                        }

                        let sources = getSourceTiles(x, y, 0);
                        if (sources.length !== 0) {
                            for (let index = 0; index < sources.length; index++) {
                                let next = sources[index];
                                this.tiles[next.x][next.y] = 0;
                                processMinMax(next.x, next.y);
                                changed.push(next);
                            }
                        }
                    }
                }
            };

            let dimensions = LVL.TILE_DIMENSIONS[value];
            let x2 = x + dimensions[0] - 1;
            let y2 = y + dimensions[1] - 1;
            remove(x, y, x2, y2);

            this.setAreaDirty(minX, minY, maxX, maxY);
        }

        // Make sure the pre-set value isn't the same as the one to set.
        if (this.tiles[x][y] != value) {

            changed.push({x: x, y: y, from: this.tiles[x][y], to: value});

            this.tiles[x][y] = value;

            this.setAreaDirty(x, y, x, y);
        }

        return changed;
    }

    /**
     * Fills a range with the given tile-value.
     *
     * @param tileId The tile-value to fill.
     * @param x1 The starting 'x' coordinate to fill.
     * @param y1 The starting 'y' coordinate to fill.
     * @param x2 The ending 'x' coordinate to fill.
     * @param y2 The ending 'y' coordinate to fill.
     *
     * @return Returns the amount of tiles set.
     *
     * @throws RangeError Thrown if the tile-value given is not an unsigned byte,
     *   or the range given is out of range for the RasterMapObject.
     */
    public fill(tileId: number, x1: number, y1: number, x2: number, y2: number): void {

        if (tileId < 0 || tileId > 255) {
            throw new Error(
                "The tile ID given is out of range. Tile ID's can only be between 0 and 255. ("
                + tileId
                + ' given)'
            );
        }

        LVL.validateArea(x1, y1, x2, y2);

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                this.tiles[x][y] = tileId;
            }
        }

        this.setAreaDirty(x1, y1, x2, y2);
    }

    /**
     *
     * @param tiles The 1024x1024 tile array to set.
     */
    public setTiles(tiles: number[][]) {

        if (tiles.length != 1024 || tiles[0].length != 1024) {
            throw new Error("THe tiles array given is not a [1024][1024] array.");
        }

        for (let x = 0; x < 1024; x++) {
            for (let y = 0; y < 1024; y++) {
                this.tiles[x][y] = tiles[x][y];
            }
        }

        this.setAreaDirty(0, 0, 1023, 1023);
    }

    // @Override
    public isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    public setDirty(flag: boolean, area: LVLArea = null): void {

        if (flag != this.dirty) {

            this.dirty = flag;

            if (flag) {
                if (area != null) {
                    this.dirtyAreas.push(area);
                }
            } else {
                this.dirtyAreas = [];
            }
        }

    }

    private setAreaDirty(x1: number, y1: number, x2: number, y2: number) {

        LVL.validateArea(x1, y1, x2, y2);

        this.dirtyAreas.push(new LVLArea(x1, y1, x2, y2));

        this.setDirty(true);
    }

    containsDirtyArea(x1: number, y1: number, x2: number, y2: number): boolean {

        if (this.dirtyAreas.length != 0) {

            for (let index = 0; index < this.dirtyAreas.length; index++) {

                let next = this.dirtyAreas[index];

                if (x2 < next.x1 || x1 > next.x2 || y2 < next.y1 || y1 > next.y2) {
                    continue;
                }

                return true;
            }
        }

        return false;
    }

    getMetadata(): ELVLCollection {
        return this.metadata;
    }

    static traceTiles(x1: number, y1: number, x2: number, y2: number): { x: number, y: number }[] {

        if (x1 < -1024 || x1 > 2048
            || y1 < -1024 || y1 > 2048
            || x2 < -1024 || x2 > 2048
            || y2 < -1024 || y2 > 2048) {
            return [];
        }

        if (x1 == x2 && y1 == y2) {

            if ((x1 < 0 || x1 > 1023 || y1 < 0 || y1 > 1023)) {
                return [];
            }

            return [{x: x1, y: y1}];
        }

        return this.tracePixels(x1 * 16, y1 * 16, x2 * 16, y2 * 16, true);
    }

    static tracePixels(x1: number, y1: number, x2: number, y2: number, limit: boolean = false): { x: number, y: number }[] {

        let getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
            let a = x1 - x2;
            let b = y1 - y2;
            return Math.sqrt(a * a + b * b);
        };

        let distance = getDistance(x1, y1, x2, y2);
        if (distance === 0) {
            return [];
        }

        let lerpLength = distance * 2;

        if (lerpLength === 0 || isNaN(lerpLength) || !isFinite(lerpLength)) {
            return [];
        }

        let tiles: { x: number, y: number }[] = [];

        for (let index = 0; index <= lerpLength; index++) {

            let lerp = index / lerpLength;

            if (isNaN(lerpLength) || !isFinite(lerpLength)) {
                break;
            }

            let tile = {
                x: Math.floor(Path.lerp(x1, x2, lerp) / 16),
                y: Math.floor(Path.lerp(y1, y2, lerp) / 16)
            };

            if (limit && (tile.x < 0 || tile.x > 1023 || tile.y < 0 || tile.y > 1023)) {
                continue;
            }

            let found = false;
            for (let tIndex = 0; tIndex < tiles.length; tIndex++) {
                let next = tiles[tIndex];
                if (next.x === tile.x && next.y === tile.y) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                tiles.push(tile);
            }
        }

        return tiles;
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
    readonly tileColor: string[];

    texture: PIXI.Texture;
    borderTile: PIXI.Texture;
    bitCount: number;

    private dirty: boolean;

    constructor(canvasOrTexture: HTMLCanvasElement | PIXI.Texture) {

        if (canvasOrTexture instanceof HTMLCanvasElement) {
            this.texture = PIXI.Texture.from(canvasOrTexture.toDataURL());
        } else {
            this.texture = canvasOrTexture;
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

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 19; x++) {
                this.tileCoordinates.push([16 * x, 16 * y]);
            }
        }

        // let ctx = this.source.getContext('2d');

        this.tileColor = [];
        this.tileColor.push('black');
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 19; x++) {

                // let imgData = ctx.getImageData(x * 16, y * 16, 16, 16).data;
                //
                // let pixelCount = 0;
                // let ar = 0;
                // let ag = 0;
                // let ab = 0;
                //
                // let offset = 0;
                // for (let py = 0; py < 16; py++) {
                //     for (let px = 0; px < 16; px++) {
                //         let r = imgData[offset];
                //         let g = imgData[offset + 1];
                //         let b = imgData[offset + 2];
                //
                //         if (r !== 0 && g !== 0 && b !== 0) {
                //             pixelCount++;
                //             ar += r;
                //             ag += g;
                //             ab += b;
                //         }
                //
                //         offset += 4;
                //     }
                // }

                let color = '#aaaaaa';

                // if (pixelCount != 0) {
                //     ar /= pixelCount;
                //     ag /= pixelCount;
                //     ab /= pixelCount;
                //     color = 'rgb(' + ar + ',' + ag + ',' + ab + ')';
                // }

                this.tileColor.push(color);
            }
        }

        this.borderTile = new PIXI.Texture(this.texture.baseTexture, new PIXI.Rectangle(0, 16, 16, 16));
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

/**
 * The <i>LVLArea</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVLArea {

    /** The left 'x' coordinate of the area. */
    x1: number;

    /** The top 'y' coordinate of the area. */
    y1: number;

    /** The right 'x' coordinate of the area. */
    x2: number;

    /** The bottom 'y' coordinate of the area. */
    y2: number;

    /**
     * Main constructor.
     *
     * @param x1 The left 'x' coordinate of the area.
     * @param y1 The top 'y' coordinate of the area.
     * @param x2 The right 'x' coordinate of the area.
     * @param y2 The bottom 'y' coordinate of the area.
     */
    constructor(x1: number = 0,
                y1: number = 0,
                x2: number = 1023,
                y2: number = 1023) {

        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    // @Override
    toString(): string {
        return "LVLArea={"
            + "x1: " + this.x1 + ", "
            + "y1: " + this.y1 + ", "
            + "x2: " + this.x2 + ", "
            + "y2: " + this.y2 + "}";
    }

    /**
     * Sets the boundaries of the area.
     *
     * @param x1 The left 'x' coordinate of the area.
     * @param y1 The top 'y' coordinate of the area.
     * @param x2 The right 'x' coordinate of the area.
     * @param y2 The bottom 'y' coordinate of the area.
     */
    set(x1: number,
        y1: number,
        x2: number,
        y2: number): void {

        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * @return Returns the width of the area. (In tiles)
     */
    getWidth(): number {
        return this.x2 - this.x1;
    }

    /**
     * @return Returns the height of the area. (In tiles)
     */
    getHeight(): number {
        return this.y2 - this.y1;
    }
}
