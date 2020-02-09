import { MapObject } from './MapObject';
import { MapUtils } from './MapUtils';

/**
 * The <i>RasterObject</i>. TODO: Document.
 *
 * @author Jab
 */
export class RasterObject extends MapObject {

    private readonly tiles: number[][];

    /**
     * Main constructor.
     *
     * @param width The width of the object.
     * @param height The height of the object.
     * @param name The name of the object.
     * @param id The ID of the object.
     */
    constructor(width: number, height: number, name: string, id: string = null) {

        super(width, height, name, id);

        // Create the raster tile array.
        this.tiles = [];

        // Construct each slice.
        for (let x = 0; x < width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = 0;
            }
        }
    }

    /**
     * Clears all map tiles by filling them as '0'.
     */
    clear(): void {

        // Go through each slice to clear.
        for (let x = 0; x < this.getWidth(); x++) {
            for (let y = 0; y < this.getHeight(); y++) {
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
     *   or the range given is out of range for the RasterObject.
     */
    fill(startX: number, startY: number, endX: number, endY: number, value: number): number {

        // Make sure that the ranges are not inverted.
        MapUtils.validateRanges(startX, startY, endX, endY);

        // Make sure that the tile-value is a unsigned byte.
        MapUtils.validateTileId(value);

        // Check to make sure that the value is a whole integer.
        value = Math.floor(value);

        let width = this.getWidth();
        let height = this.getHeight();

        // Make sure that at least a portion of the range will draw at all before proceeding.
        if (MapUtils.isOutOfRange(startX, startY, endX, endY, 0, 0, width - 1, height - 1)) {
            return 0;
        }

        // Make sure that we draw only in-bounds.
        if (startX < 0) {
            startX = 0;
        }
        if (startY < 0) {
            startY = 0;
        }
        if (endX > width - 1) {
            endX = width - 1;
        }
        if (endY > height - 1) {
            endY = height - 1;
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
        MapUtils.validateCoordinates(x, y, 0, 0, this.getWidth() - 1, this.getHeight() - 1);

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
        MapUtils.validateTileId(value);

        // Make sure that the object contains the point to set.
        if (MapUtils.contains(x, y, 0, 0, this.getWidth() - 1, this.getHeight() - 1)) {

            // Make sure the pre-set value isn't the same as the one to set.
            if (this.tiles[x][y] != value) {

                this.tiles[x][y] = value;

                // Return true to note the value has been set successfully
                return true;
            }

        }

        // Return false if the value is not set.
        return false;
    }

}