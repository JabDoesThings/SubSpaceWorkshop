import { MapArea } from './MapArea';
import { LVL } from '../../io/LVLUtils';
import { CoordinateType } from './CoordinateType';
import { TileEdit } from '../../simple/edits/EditTiles';
import { Path } from '../Path';
import { MapSections } from './MapSection';

/**
 * The <i>TileData</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileData {

    readonly width: number;
    readonly height: number;
    readonly tiles: number[][];
    readonly dirtyAreas: MapArea[];

    private dirty: boolean;

    /**
     * Main constructor.
     */
    constructor(tiles: number[][] = null) {

        if (tiles != null) {

            let getMaxHeight = (tiles: number[][]): number => {

                let max = 0;

                for (let index = 0; index < tiles.length; index++) {
                    let next = tiles[index];
                    if (next != null && next.length > max) {
                        max = next.length;
                    }
                }

                return max;
            };

            this.width = tiles.length;
            this.height = getMaxHeight(tiles);

            let fill = (tiles: number[][], width: number, height: number, value: number = 0): void => {
                for (let x = 0; x < width; x++) {

                    let xArray = tiles[x];
                    if (xArray == null) {
                        tiles[x] = xArray = [];
                    }

                    for (let y = 0; y < height; y++) {
                        if (xArray[y] == null) {
                            xArray[y] = value;
                        }
                    }
                }
            };

            // Make sure the array is fully defined for the maximum dimensions provided.
            fill(tiles, this.width, this.height);
        }

        // If the tile data is not provided, create it.
        else {
            tiles = [];
            // Construct each slice.
            for (let x = 0; x < 1024; x++) {
                tiles[x] = [];
                for (let y = 0; y < 1024; y++) {
                    tiles[x][y] = 0;
                }
            }
        }

        this.tiles = tiles;
        this.dirtyAreas = [];
        this.setAreaDirty(0, 0, 1023, 1023);
    }

    /**
     * Clears all tile data.
     *
     * @return Returns the previous tile data that is cleared.
     */
    clear(): number[][] {
        return this.fill(0);
    }

    /**
     * Fills all tiles with a value.
     *
     * @param tileId The tile ID to fill.
     *
     * @return Returns the previous tile data that is filled.
     */

    fill(tileId: number): number[][] {

        let copy = this.copy();

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.tiles[x][y] = tileId;
            }
        }

        return copy;
    }

    /**
     * Copies all tile data to a separate array.
     *
     * @return Returns a copied array of the tile data.
     */
    copy(): number[][] {

        let toCopy: number[][] = [];

        for (let x = 0; x < this.width; x++) {

            let xArray: number[] = [];
            toCopy.push(xArray);

            for (let y = 0; y < this.height; y++) {
                xArray[y] = this.tiles[x][y];
            }
        }

        return toCopy;
    }

    /**
     * @param x The 'X' coordinate for the tile.
     * @param y The 'Y' coordinate for the tile.
     *
     * @return Returns the tile at the 'X' and 'Y' coordinate.
     */
    public get(x: number, y: number): number {

        // Make sure that the coordinates are within bounds.
        LVL.validateCoordinates(x, y, 0, 0, this.width - 1, this.height - 1);

        // Grab the value stored in the tile array at the coordinates.
        return this.tiles[x][y];
    }

    /**
     * Sets the tile at the given coordinates with the given value.
     *
     * @param x The 'X' coordinate of the tile to set.
     * @param y The 'Y' coordinate of the tile to set.
     * @param value The tile-value to set.
     * @param mask
     * @param applyDimensions
     *
     * @return Returns 'true' if the 'X' and 'Y' coordinates are within range and the tile is set.
     */
    public set(x: number, y: number, value: number, mask: MapSections = null, applyDimensions: boolean = true): TileEdit[] {

        // Make sure that the tile ID is proper.
        LVL.validateTileId(value);

        LVL.validateCoordinates(x, y, 0, 0, this.width - 1, this.height - 1);

        if(mask != null && !mask.test(x, y)) {
            return [];
        }

        let changed: { x: number, y: number, from: number, to: number }[] = [];

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

            let getSourceTiles = (cx: number, cy: number, to: number): TileEdit[] => {

                let sources: TileEdit[] = [];

                // If the tile to check is already assigned, return this tile as the source.
                if (this.tiles[cx][cy] !== 0) {
                    sources.push(new TileEdit(cx, cy, this.tiles[cx][cy], to));
                }

                // Go through all dimensions.
                for (let y = cy - 5; y <= cy; y++) {
                    for (let x = cx - 5; x <= cx; x++) {

                        // Make sure the tile coordinates are valid.
                        if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
                            continue;
                        }

                        let id = this.tiles[x][y];
                        if (id != 0) {
                            let dimensions = LVL.TILE_DIMENSIONS[id];
                            let x2 = x + dimensions[0] - 1;
                            let y2 = y + dimensions[1] - 1;
                            if (contains(cx, cy, x, y, x2, y2)) {
                                sources.push(new TileEdit(x, y, id, to));
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
                        if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
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

            changed.push(new TileEdit(x, y, this.tiles[x][y], value));

            this.tiles[x][y] = value;

            this.setAreaDirty(x, y, x, y);
        }

        return changed;
    }

    // @Override
    public isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    public setDirty(flag: boolean, area: MapArea = null): void {

        if (flag != this.dirty) {

            this.dirty = flag;

            if (flag) {
                if (area != null) {
                    this.dirtyAreas.push(area);
                }
            } else {
                this.dirtyAreas.length = 0;
            }
        }

    }

    private setAreaDirty(x1: number, y1: number, x2: number, y2: number) {

        if (x1 > this.width - 1 || y1 > this.height - 1 || x2 < 0 || y2 < 0) {
            return;
        }

        if (x1 < 0) {
            x1 = 0;
        }
        if (y1 < 0) {
            y1 = 0;
        }
        if (x2 > this.width - 1) {
            x2 = this.width - 1;
        }
        if (y2 > this.height - 1) {
            y2 = this.height - 1;
        }

        this.dirtyAreas.push(new MapArea(CoordinateType.TILE, x1, y1, x2, y2));

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

    getTiles(copy: boolean = true): number[][] {
        return copy ? this.copy() : this.tiles;
    }
}
